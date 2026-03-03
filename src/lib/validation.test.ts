import { describe, it, expect } from "vitest";
import { sanitizeEmail, calculatePasswordStrength } from "./validation";

describe("Validation Utils", () => {
  describe("sanitizeEmail", () => {
    it("should convert email to lowercase", () => {
      expect(sanitizeEmail("TEST@Example.com")).toBe("test@example.com");
    });

    it("should trim whitespace", () => {
      expect(sanitizeEmail("  test@example.com  ")).toBe("test@example.com");
    });

    it("should handle empty string", () => {
      expect(sanitizeEmail("")).toBe("");
    });
  });

  describe("calculatePasswordStrength", () => {
    it("should return score 0 for empty password", () => {
      expect(calculatePasswordStrength("").score).toBe(0);
    });

    it("should calculate score correctly for weak password", () => {
      // Just length < 12 but has mixed case -> score 1 (mixed case) + number (1) = 2
      const result = calculatePasswordStrength("Short1");
      expect(result.score).toBe(2);
      expect(result.label).toBe("Fair");
    });

    it("should return max score (4) for very strong password", () => {
      // > 16 chars, upper, lower, number, special
      const strongPass = "VeryStrongPass123!@#WithMoreLength";
      const result = calculatePasswordStrength(strongPass);
      expect(result.score).toBe(4);
      expect(result.label).toBe("Very Strong");
    });
  });
});
