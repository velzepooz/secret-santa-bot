import { describe, it, expect } from "vitest";
import { createAssignments, validateAssignments } from "../src/services/draw.service.ts";

describe("createAssignments", () => {
  it("should create valid assignments for 3 participants", () => {
    const participants = ["alice", "bob", "charlie"];
    const assignments = createAssignments(participants);

    expect(assignments.size).toBe(3);
    expect(validateAssignments(assignments)).toBe(true);
  });

  it("should create valid assignments for 10 participants", () => {
    const participants = Array.from({ length: 10 }, (_, i) => `person-${i}`);
    const assignments = createAssignments(participants);

    expect(assignments.size).toBe(10);
    expect(validateAssignments(assignments)).toBe(true);
  });

  it("should never assign anyone to themselves", () => {
    const participants = ["a", "b", "c", "d", "e"];

    // Run multiple times to catch random edge cases
    for (let i = 0; i < 100; i++) {
      const assignments = createAssignments(participants);
      for (const [giver, receiver] of assignments) {
        expect(giver).not.toBe(receiver);
      }
    }
  });

  it("should ensure everyone gives and receives exactly once", () => {
    const participants = ["a", "b", "c", "d", "e", "f"];

    for (let i = 0; i < 50; i++) {
      const assignments = createAssignments(participants);

      // Everyone gives
      const givers = new Set(assignments.keys());
      expect(givers.size).toBe(participants.length);
      for (const p of participants) {
        expect(givers.has(p)).toBe(true);
      }

      // Everyone receives
      const receivers = Array.from(assignments.values());
      const receiverSet = new Set(receivers);
      expect(receiverSet.size).toBe(participants.length);
      for (const p of participants) {
        expect(receiverSet.has(p)).toBe(true);
      }
    }
  });

  it("should throw error for less than 2 participants", () => {
    expect(() => createAssignments(["alone"])).toThrow("Need at least 2 participants");
    expect(() => createAssignments([])).toThrow("Need at least 2 participants");
  });

  it("should work with exactly 2 participants", () => {
    const participants = ["alice", "bob"];
    const assignments = createAssignments(participants);

    expect(assignments.size).toBe(2);
    expect(assignments.get("alice")).toBe("bob");
    expect(assignments.get("bob")).toBe("alice");
  });
});

describe("validateAssignments", () => {
  it("should return true for valid assignments", () => {
    const valid = new Map([
      ["a", "b"],
      ["b", "c"],
      ["c", "a"],
    ]);
    expect(validateAssignments(valid)).toBe(true);
  });

  it("should return false if someone is assigned to themselves", () => {
    const invalid = new Map([
      ["a", "a"],
      ["b", "c"],
      ["c", "b"],
    ]);
    expect(validateAssignments(invalid)).toBe(false);
  });

  it("should return false if someone receives multiple gifts", () => {
    const invalid = new Map([
      ["a", "b"],
      ["b", "b"],
      ["c", "a"],
    ]);
    expect(validateAssignments(invalid)).toBe(false);
  });
});
