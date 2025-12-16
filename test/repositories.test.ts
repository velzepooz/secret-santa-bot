import { describe, it, expect } from "vitest";
import { drizzle } from "drizzle-orm/d1";
import { GroupRepository, ParticipantRepository, WishlistRepository } from "../src/db/repositories/index.ts";

// Mock D1Database for testing
function createMockD1(): D1Database {
  return {
    prepare: () => ({
      bind: () => ({
        all: async () => ({ results: [], success: true }),
        first: async () => null,
        run: async () => ({ success: true, meta: {} }),
      }),
      all: async () => ({ results: [], success: true }),
      first: async () => null,
      run: async () => ({ success: true, meta: {} }),
    }),
    batch: async () => [],
    exec: async () => ({ count: 0, duration: 0 }),
    dump: async () => new ArrayBuffer(0),
  } as unknown as D1Database;
}

describe("GroupRepository", () => {
  it("should be instantiable", () => {
    const mockD1 = createMockD1();
    const db = drizzle(mockD1);
    const repo = new GroupRepository(db);
    expect(repo).toBeDefined();
  });
});

describe("ParticipantRepository", () => {
  it("should be instantiable", () => {
    const mockD1 = createMockD1();
    const db = drizzle(mockD1);
    const repo = new ParticipantRepository(db);
    expect(repo).toBeDefined();
  });
});

describe("WishlistRepository", () => {
  it("should be instantiable", () => {
    const mockD1 = createMockD1();
    const db = drizzle(mockD1);
    const repo = new WishlistRepository(db);
    expect(repo).toBeDefined();
  });
});
