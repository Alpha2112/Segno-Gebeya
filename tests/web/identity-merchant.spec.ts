import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import fs from "node:fs";
function artisan(...args: string[]) {
  return execFileSync(
    "docker",
    ["compose", "exec", "-T", "api", "php", "artisan", ...args],
    { encoding: "utf8", timeout: 60000 },
  ).trim();
}
function otp(identifier: string) {
  return JSON.parse(artisan("segno:otp", identifier)).code as string;
}
function totp(secret: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of secret)
    bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac("sha1", key).update(counter).digest();
  const offset = digest[19] & 15;
  return ((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000)
    .toString()
    .padStart(6, "0");
}
test("real account, private evidence, MFA review, resubmission, grants and revocation", async ({
  page,
  browser,
  request,
}) => {
  const suffix = randomBytes(6).toString("hex"),
    email = "applicant-" + suffix + "@example.test",
    password = randomBytes(18).toString("hex"),
    store = "Addis studio " + suffix;
  const reviewer = JSON.parse(artisan("segno:test-reviewer"));
  await page.goto("http://localhost:15173");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page.getByLabel("Email or phone", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Verify code" }),
  ).toBeVisible();
  await expect
    .poll(async () => {
      const m = await (
        await request.get("http://localhost:18025/api/v1/messages")
      ).json();
      return m.messages.some((message: { To: { Address: string }[] }) =>
        message.To.some((to) => to.Address === email),
      );
    })
    .toBe(true);
  await page.getByLabel("Verification code", { exact: true }).fill(otp(email));
  await page.getByRole("button", { name: "Verify code", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Customer account" }),
  ).toBeVisible();
  await page
    .locator("nav")
    .getByRole("button", { name: "Your profile" })
    .click();
  await page.getByLabel("Full name").fill("Local applicant");
  await page.getByLabel("Username").fill("applicant_" + suffix);
  await page.getByLabel("About you").fill("Made in Addis Ababa.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("Saved successfully");
  await page
    .locator("nav")
    .getByRole("button", { name: "Become a merchant" })
    .click();
  await page.getByLabel("Store name").fill(store);
  await page
    .getByLabel("Representative", { exact: true })
    .fill("Local applicant");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByRole("heading", { name: store })).toBeVisible();
  await page
    .getByLabel("Choose document", { exact: true })
    .setInputFiles({
      name: "sample-evidence.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+c2ioAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await expect(
    page.getByText("sample-evidence.png", { exact: true }),
  ).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(
    page.getByText("Your application is with the review team."),
  ).toBeVisible();
  // Missing CSRF is rejected by the real HTTP stack, rather than the testing bypass.
  const csrf = await request.post("http://localhost:18000/api/v1/auth/login", {
    headers: { Origin: "http://localhost:15173" },
    data: { identifier: email, password, client: "web" },
  });
  expect(csrf.status()).toBe(419);
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await admin.goto("http://localhost:15174");
  await admin.getByLabel("Email or phone").fill(reviewer.email);
  await admin.getByLabel("Password", { exact: true }).fill(reviewer.password);
  await admin.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    admin.getByRole("heading", { name: "Two-step verification" }),
  ).toBeVisible();
  await admin.getByRole("button", { name: "Set up authenticator" }).click();
  await expect(admin.locator(".secret")).toBeVisible();
  const secret = (await admin.locator(".secret").innerText()).trim();
  await admin
    .getByLabel("Verification code", { exact: true })
    .fill(totp(secret));
  await admin.getByRole("button", { name: "Verify code", exact: true }).click();
  await expect(
    admin.getByText(
      "Save these one-time recovery codes securely. They appear only once.",
    ),
  ).toBeVisible();
  await admin.getByRole("button", { name: "Done", exact: true }).click();
  const review = async (action: string, reason: string) => {
    await admin
      .locator("nav")
      .getByRole("button", { name: "Merchant review" })
      .click();
    await admin.getByLabel("Search stores").fill(store);
    await admin.getByRole("button", { name: "Continue", exact: true }).click();
    await admin
      .getByRole("row")
      .filter({ hasText: store })
      .getByRole("button", { name: "Review application" })
      .click();
    await expect(
      admin.getByText("sample-evidence.png", { exact: false }),
    ).toBeVisible();
    await admin
      .getByLabel("Review application", { exact: true })
      .selectOption(action);
    await admin.getByLabel("Review reason", { exact: true }).fill(reason);
    await admin.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(admin.getByRole("dialog")).toContainText(store);
    await admin
      .getByRole("dialog")
      .getByRole("button", { name: "Confirm", exact: true })
      .click();
    await expect(admin.getByRole("dialog")).not.toBeVisible();
  };
  await review(
    "request_information",
    "Please clarify your representative name.",
  );
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(
    page.getByText("Please clarify your representative name."),
  ).toBeVisible();
  await page
    .getByLabel("Representative", { exact: true })
    .fill("Updated representative");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByRole("status")).toContainText("Saved successfully");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(
    page.getByText("Your application is with the review team."),
  ).toBeVisible();
  await review(
    "approve",
    "Development evidence reviewed; grant test store access.",
  );
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(
    page
      .getByRole("paragraph")
      .filter({ hasText: "Your merchant access is ready." }),
  ).toBeVisible();
  await page
    .locator("nav")
    .getByRole("button", { name: "Switch mode" })
    .click();
  await page.getByRole("button", { name: "Merchant", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Merchant workspace" }),
  ).toBeVisible();
  const login = await request.post("http://localhost:18000/api/v1/auth/login", {
    data: {
      identifier: email,
      password,
      client: "mobile",
      device_name: "Browser test device",
    },
  });
  expect(login.ok()).toBeTruthy();
  const device = (await login.json()).token;
  const me = await request.get("http://localhost:18000/api/v1/me", {
    headers: { Authorization: "Bearer " + device },
  });
  expect(me.ok()).toBeTruthy();
  const deny = await request.get(
    "http://localhost:18000/api/v1/admin/applications",
    { headers: { Authorization: "Bearer " + device } },
  );
  expect(deny.status()).toBe(403);
  await page
    .locator("nav")
    .getByRole("button", { name: "Signed-in devices" })
    .click();
  await page
    .locator(".document")
    .filter({ hasText: "Browser test device" })
    .getByRole("button", { name: "Revoke access" })
    .click();
  expect(
    (
      await request.get("http://localhost:18000/api/v1/me", {
        headers: { Authorization: "Bearer " + device },
      })
    ).status(),
  ).toBe(401);
  await page
    .locator("nav")
    .getByRole("button", { name: "Your profile" })
    .click();
  await page.getByRole("combobox", { name: "Language" }).selectOption("am");
  await page.getByRole("button", { name: "ገጽታ" }).click();
  await expect(page.locator(".progress")).not.toBeVisible();
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "docs/planning/evidence/m1-profile-am-dark.png",
    fullPage: true,
  });
  await page.getByRole("combobox").first().selectOption("en");
  await admin
    .locator("nav")
    .getByRole("button", { name: "Merchant review" })
    .click();
  await expect(admin.locator(".progress")).not.toBeVisible();
  await admin.setViewportSize({ width: 1440, height: 1000 });
  await admin.screenshot({
    path: "docs/planning/evidence/m1-admin-queue.png",
    fullPage: true,
  });
  // Protected document URLs remain inaccessible without an authorized reviewer.
  expect(
    (
      await request.get(
        "http://localhost:18000/api/v1/admin/applications/guessed/documents/guessed",
      )
    ).status(),
  ).toBe(401);
  fs.mkdirSync("docs/planning/evidence", { recursive: true });
  fs.writeFileSync(
    "docs/planning/evidence/M1_WEB_RESULT.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        runtime: "Chrome / Playwright",
        flows: [
          "email registration and actual captured OTP",
          "profile edit",
          "private PNG upload",
          "submit",
          "CSRF denial",
          "admin password + TOTP enrollment",
          "one-time recovery presentation",
          "request information and confirmed resubmission",
          "confirmed approval",
          "server-granted merchant switch",
          "non-admin review denial",
          "device revocation",
          "Amharic/dark/narrow render",
        ],
        secrets: "excluded",
      },
      null,
      2,
    ),
  );
  await adminContext.close();
});
