import { describe, expect, it } from "vitest";
import { isNearTarget, shadowRounds, uniqueWords } from "./games";

describe("games", () => {
  it("accepts a tap on the object and rejects a far tap", () => {
    expect(isNearTarget({ x: 50, y: 50 }, 53, 52)).toBe(true);
    expect(isNearTarget({ x: 50, y: 50 }, 80, 20)).toBe(false);
  });
  it("shadow game has 5 rounds", () => {
    expect(shadowRounds()).toHaveLength(5);
  });
  it("memory words have no repeated English word", () => {
    const en = uniqueWords().map((w) => w.en);
    expect(new Set(en).size).toBe(en.length);
  });
});
