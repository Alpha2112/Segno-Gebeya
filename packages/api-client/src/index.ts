import type { ApiErrorBody } from "@segno/contracts";
export class ApiError extends Error {
  constructor(
    public status: number,
    public fields: Record<string, string[]>,
    message: string,
    public requestId: string | null = null,
  ) {
    super(message);
  }
}
export interface ClientOptions {
  baseUrl?: string;
  token?: () => Promise<string | null>;
  web?: boolean;
  onUnauthorized?: () => void;
  onTransportError?: (stage: string, errorType: string) => void;
}
export function createClient(options: ClientOptions = {}) {
  let generation = 0;
  const controllers = new Set<AbortController>();
  async function fetchTimed(url: string, init: RequestInit) {
    const controller = new AbortController();
    controllers.add(controller);
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      controllers.delete(controller);
      clearTimeout(timer);
    }
  }
  const base = (options.baseUrl ?? "").replace(/\/$/, "");
  let csrfPromise: Promise<void> | null = null;
  async function readJson(response: Response) {
    const value = await response.text();
    try {
      return JSON.parse(value);
    } catch (error) {
      options.onTransportError?.(
        "json-response",
        error instanceof Error ? error.name : typeof error,
      );
      throw new ApiError(
        502,
        {},
        "The service response could not be read. Please try again.",
        response.headers.get("X-Request-ID"),
      );
    }
  }

  async function csrf() {
    csrfPromise ??= fetchTimed(base + "/sanctum/csrf-cookie", {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((r) => {
        if (!r.ok)
          throw new ApiError(r.status, {}, "Could not start a secure session.");
      })
      .catch((e) => {
        csrfPromise = null;
        throw e;
      });
    await csrfPromise;
  }
  async function request<T>(
    path: string,
    method = "GET",
    body?: unknown,
  ): Promise<T> {
    const requestGeneration = generation;
    let stage = "credentials";
    try {
      if (options.web && method !== "GET") await csrf();
      const headers: Record<string, string> = { Accept: "application/json" };
      const token = await options.token?.();
      if (requestGeneration !== generation)
        throw new ApiError(0, {}, "The session changed. Please try again.");
      if (token) headers.Authorization = "Bearer " + token;
      if (options.web) {
        const cookie =
          typeof document === "undefined"
            ? ""
            : document.cookie
                .split("; ")
                .find((v) => v.startsWith("XSRF-TOKEN="));
        if (cookie)
          headers["X-XSRF-TOKEN"] = decodeURIComponent(cookie.slice(11));
      }
      const form = typeof FormData !== "undefined" && body instanceof FormData;
      if (body !== undefined && !form)
        headers["Content-Type"] = "application/json";
      stage = "request";
      const response = await fetchTimed(base + "/api/v1" + path, {
        method,
        headers,
        credentials: options.web ? "include" : "omit",
        body:
          body === undefined
            ? undefined
            : form
              ? (body as FormData)
              : JSON.stringify(body),
      });
      if (!response.ok) {
        stage = "error-response";
        const data: ApiErrorBody = await readJson(response).catch(() => ({}));
        if (response.status === 401) {
          csrfPromise = null;
          options.onUnauthorized?.();
        }
        if (response.status === 419) csrfPromise = null;
        throw new ApiError(
          response.status,
          data.errors ?? {},
          data.message ?? "The request could not be completed.",
          response.headers.get("X-Request-ID"),
        );
      }
      stage = "response";
      const data = (await readJson(response)) as T;
      if (requestGeneration !== generation)
        throw new ApiError(0, {}, "The session changed. Please try again.");
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      options.onTransportError?.(
        stage,
        error instanceof Error ? error.name : typeof error,
      );
      throw new ApiError(
        0,
        {},
        "Connection unavailable. Check your network and try again.",
      );
    }
  }
  return {
    request,
    invalidate() {
      generation++;
      csrfPromise = null;
      for (const controller of controllers) controller.abort();
    },
  };
}
