import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
const fixture = () =>
  JSON.parse(
    execFileSync(
      "docker",
      [
        "compose",
        "exec",
        "-T",
        "api",
        "php",
        "artisan",
        "segno:test-reviewer",
        "--customer",
      ],
      { encoding: "utf8" },
    ),
  );
test("profile photo, Ethiopian address, locale persistence and password change", async ({
  page,
}) => {
  const user = fixture(),
    nextPassword = randomBytes(18).toString("hex");
  await page.goto("http://localhost:15173");
  await page.getByLabel("Email or phone").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page
    .locator("nav")
    .getByRole("button", { name: "Your profile" })
    .click();
  await page
    .getByLabel("Choose profile photo", { exact: true })
    .setInputFiles("tests/fixtures/avatar.png");
  await expect(
    page.getByRole("img", { name: "Profile photo", exact: true }),
  ).toHaveJSProperty("naturalWidth", 64);
  await page.getByRole("combobox", { name: "Language" }).selectOption("am");
  await expect(page.locator(".progress")).not.toBeVisible();
  await page.reload();
  await expect(page.locator("nav")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "am");
  await page.getByRole("combobox").first().selectOption("en");
  await expect(page.locator(".progress")).not.toBeVisible();
  await page
    .locator("nav")
    .getByRole("button", { name: "Account settings", exact: true })
    .click();
  await page.getByLabel("Address label", { exact: true }).fill("Home");
  await page.getByLabel("Recipient", { exact: true }).fill("Test recipient");
  await page.getByLabel("Phone number", { exact: true }).fill("0912345678");
  await page.getByLabel("City", { exact: true }).fill("Addis Ababa");
  await page.getByLabel("Sub-city", { exact: true }).fill("Bole");
  await page.getByLabel("Woreda", { exact: true }).fill("03");
  await page.getByLabel("House or building", { exact: true }).fill("12");
  await page
    .getByLabel("Landmark or directions", { exact: true })
    .fill("Near the community centre");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Home · Default address" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("City", { exact: true }).fill("Adama");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText("Test recipient · Adama")).toBeVisible();
  const password = page
    .locator("section")
    .filter({
      has: page.getByRole("heading", { name: "Change password", exact: true }),
    });
  await password
    .getByLabel("Current password", { exact: true })
    .fill(user.password);
  await password.getByLabel("Password", { exact: true }).fill(nextPassword);
  await password
    .getByLabel("Confirm password", { exact: true })
    .fill(nextPassword);
  await password
    .getByRole("button", { name: "Change password", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Email or phone").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(nextPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Customer account" }),
  ).toBeVisible();
});
test("recovery verifies a purpose-bound code before resetting the password", async ({
  page,
}) => {
  const user = fixture(),
    nextPassword = randomBytes(18).toString("hex");
  await page.goto("http://localhost:15173");
  await page
    .getByRole("button", { name: "Recover account", exact: true })
    .click();
  await page.getByLabel("Email or phone").fill(user.email);
  await page
    .getByRole("button", { name: "Recover account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Verify code" }),
  ).toBeVisible();
  const code = JSON.parse(
    execFileSync(
      "docker",
      [
        "compose",
        "exec",
        "-T",
        "api",
        "php",
        "artisan",
        "segno:otp",
        user.email,
      ],
      { encoding: "utf8" },
    ),
  ).code;
  await page.getByLabel("Verification code", { exact: true }).fill(code);
  await page.getByRole("button", { name: "Verify code", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Set new password" }),
  ).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill(nextPassword);
  await page.getByLabel("Confirm password", { exact: true }).fill(nextPassword);
  await page
    .getByRole("button", { name: "Set new password", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Email or phone").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(nextPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Customer account" }),
  ).toBeVisible();
});
