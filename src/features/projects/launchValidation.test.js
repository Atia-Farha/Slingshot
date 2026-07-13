import { describe, expect, it } from "vitest";
import { normalizeLaunchUrl, validateLaunchUrl } from "./launchValidation";

describe("launch URL validation", () => {
    it("normalizes and accepts HTTP(S) URLs", () => {
        const url = normalizeLaunchUrl("  https://example.com/app  ");

        expect(url).toBe("https://example.com/app");
        expect(validateLaunchUrl(url)).toBe("");
        expect(validateLaunchUrl("http://localhost:5173")).toBe("");
    });

    it("allows an empty URL so an action can be removed", () => {
        expect(validateLaunchUrl("")).toBe("");
    });

    it("rejects unsupported and incomplete URLs", () => {
        expect(validateLaunchUrl("file:///tmp/project")).toContain(
            "Only http:// and https://",
        );
        expect(validateLaunchUrl("example.com")).toContain("complete URL");
    });

    it("rejects credentials embedded in a URL", () => {
        expect(validateLaunchUrl("https://user:secret@example.com")).toContain(
            "credentials",
        );
    });
});
