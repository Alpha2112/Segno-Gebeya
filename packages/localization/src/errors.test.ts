import { describe, expect, it } from "vitest";
import { localizeError } from "./errors";

describe("draft error localization", () => {
  it("preserves English detail and actionable Amharic password limits", () => {
    const message = "The password field must be at least 12 characters.";
    expect(localizeError("en", message)).toBe(message);
    expect(localizeError("am", message)).toContain("12");
    expect(localizeError("am", message)).toMatch(/[\u1200-\u137f]/);
  });
  it("handles validation summaries, conflicts and unknown errors without untranslated fallback", () => {
    for (const message of [
      "The identifier field is required. (and 1 more error)",
      "This application changed. Refresh before saving.",
      "An unfamiliar service error.",
    ]) {
      expect(localizeError("am", message)).toMatch(/[\u1200-\u137f]/);
      expect(localizeError("am", message)).not.toContain(message);
    }
  });
});
