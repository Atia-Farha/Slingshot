import { describe, expect, it } from "vitest";
import {
    normalizeTerminalCommand,
    validateTerminalCommand,
} from "./terminalCommandValidation";

describe("terminal command validation", () => {
    it("normalizes a single command", () => {
        expect(normalizeTerminalCommand("  pnpm dev  ")).toBe("pnpm dev");
        expect(validateTerminalCommand("pnpm dev")).toBe("");
    });

    it("allows an empty command so the action can be removed", () => {
        expect(validateTerminalCommand("")).toBe("");
    });

    it("rejects command sequences split across lines", () => {
        expect(validateTerminalCommand("pnpm install\npnpm dev")).toContain(
            "single line",
        );
    });

    it("enforces the storage limit", () => {
        expect(validateTerminalCommand("x".repeat(4097))).toContain("4096");
    });
});
