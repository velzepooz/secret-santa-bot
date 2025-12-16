import { describe, it, expect } from "vitest";
import { generateId, generateInviteCode } from "../src/utils/crypto.ts";

describe("generateId", () => {
  it("should generate a 32-character hex string", () => {
    const id = generateId();
    expect(id).toHaveLength(32);
    expect(/^[0-9a-f]+$/.test(id)).toBe(true);
  });

  it("should generate unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(1000);
  });
});

describe("generateInviteCode", () => {
  it("should generate a code in SANTA-XXXXXX format", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^SANTA-[A-Z2-9]{6}$/);
  });

  it("should not contain confusing characters (I, O, 0, 1)", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateInviteCode();
      expect(code).not.toMatch(/[IO01]/);
    }
  });

  it("should generate unique codes", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      codes.add(generateInviteCode());
    }
    // Allow some collisions due to randomness, but should have mostly unique
    expect(codes.size).toBeGreaterThan(990);
  });
});
