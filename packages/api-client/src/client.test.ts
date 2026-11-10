import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, createClient } from "./index";
afterEach(() => vi.unstubAllGlobals());
describe("API boundary", () => {
  it("reports unreadable successful responses safely without exposing their body", async () => {
    const diagnostic = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("private malformed data", {
          headers: { "X-Request-ID": "parse-123" },
        }),
      ),
    );
    await expect(
      createClient({ onTransportError: diagnostic }).request("/me"),
    ).rejects.toMatchObject({
      status: 502,
      requestId: "parse-123",
      message: "The service response could not be read. Please try again.",
    });
    expect(diagnostic).toHaveBeenCalledWith("json-response", "SyntaxError");
  });
  it("discards a private response from an invalidated session", async () => {
    let finish!: (r: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          }),
      ),
    );
    const api = createClient();
    const pending = api.request("/me");
    await Promise.resolve();
    api.invalidate();
    finish(new Response('{"private":"previous identity"}'));
    await expect(pending).rejects.toMatchObject({ status: 0 });
  });
  it("uses a per-device bearer token and omits browser cookies", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetcher);
    const api = createClient({
      baseUrl: "http://localhost:18000/",
      token: async () => "device-token",
    });
    await expect(api.request("/me")).resolves.toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith(
      "http://localhost:18000/api/v1/me",
      expect.objectContaining({
        credentials: "omit",
        headers: expect.objectContaining({
          Authorization: "Bearer device-token",
        }),
      }),
    );
  });
  it("preserves field errors and correlation ID and clears unauthorized identity", async () => {
    const clear = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Session ended",
            errors: { identifier: ["Try again"] },
          }),
          { status: 401, headers: { "X-Request-ID": "request-123" } },
        ),
      ),
    );
    try {
      await createClient({ onUnauthorized: clear }).request("/me");
      throw new Error("Expected rejection");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e).toMatchObject({
        status: 401,
        fields: { identifier: ["Try again"] },
        requestId: "request-123",
      });
    }
    expect(clear).toHaveBeenCalledOnce();
  });
  it("never reports network failure as success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(
      createClient().request("/profile", "PATCH", { name: "A" }),
    ).rejects.toMatchObject({ status: 0 });
  });
  it("initializes CSRF before cookie writes and never sends a bearer token", async () => {
    vi.stubGlobal("document", { cookie: "XSRF-TOKEN=encoded%3Dvalue" });
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response("{}"));
    vi.stubGlobal("fetch", fetcher);
    await createClient({ web: true }).request("/profile", "PATCH", {});
    expect(fetcher.mock.calls[0][0]).toBe("/sanctum/csrf-cookie");
    expect(fetcher.mock.calls[1][1]).toMatchObject({
      credentials: "include",
      headers: { "X-XSRF-TOKEN": "encoded=value" },
    });
    expect(fetcher.mock.calls[1][1].headers.Authorization).toBeUndefined();
  });
});
