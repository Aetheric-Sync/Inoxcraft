import { describe, it, expect } from "vitest";

import { koboToNaira, nairaToKobo, formatNaira, formatNairaCompact } from "@/lib/utils/money";

describe("money utilities", () => {
  describe("koboToNaira", () => {
    it("converts 100 kobo to 1 naira", () => {
      expect(koboToNaira(100)).toBe(1);
    });
    it("converts 1_000_000 kobo to 10_000 naira", () => {
      expect(koboToNaira(1_000_000)).toBe(10_000);
    });
  });

  describe("nairaToKobo", () => {
    it("converts 1 naira to 100 kobo", () => {
      expect(nairaToKobo(1)).toBe(100);
    });
    it("rounds floating point correctly", () => {
      expect(nairaToKobo(0.1 + 0.2)).toBe(30);
    });
  });

  describe("formatNairaCompact", () => {
    it("formats millions with M suffix", () => {
      expect(formatNairaCompact(5_000_000_00)).toContain("M");
    });
    it("formats thousands with K suffix", () => {
      expect(formatNairaCompact(50_000_00)).toContain("K");
    });
  });

  describe("formatNaira", () => {
    it("formats kobo to currency string", () => {
      expect(formatNaira(10000)).toBe("₦100.00");
    });
  });
});
