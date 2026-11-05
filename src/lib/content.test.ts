import { describe, expect, it } from "vitest";
import { getMission, isSentenceAccepted, MISSIONS } from "./content";
import { computeStreak, findCompletedMission } from "./progress";

describe("learning rules", () => {
  it("every lesson introduces at most 8 new words", () => {
    for (const m of MISSIONS) expect(m.words.length).toBeLessThanOrEqual(8);
  });
  it("sentence check ignores case and punctuation, not exact copy", () => {
    const s = getMission("coffee-order")!.sentence;
    expect(isSentenceAccepted(s, "I would like a coffee, please.")).toBe(true);
    expect(isSentenceAccepted(s, "i'd like a coffee please")).toBe(true);
    expect(isSentenceAccepted(s, "coffee I like")).toBe(false);
  });
  it("streak counts consecutive days ending today or yesterday", () => {
    const today = new Date("2026-11-05T12:00:00Z");
    expect(computeStreak(["2026-11-05", "2026-11-04", "2026-11-02"], today)).toBe(2);
    expect(computeStreak(["2026-11-04", "2026-11-03"], today)).toBe(2);
    expect(computeStreak(["2026-11-01"], today)).toBe(0);
  });
  it("a completed mission cannot be started again", () => {
    const rows = [
      { mission_id: "coffee-order", status: "completed", score: 4 },
      { mission_id: "home-living-room", status: "started", score: 1 },
    ];
    expect(findCompletedMission(rows, "coffee-order")?.score).toBe(4);
    expect(findCompletedMission(rows, "home-living-room")).toBeUndefined();
    expect(findCompletedMission(rows, "coffee-seat")).toBeUndefined();
    expect(findCompletedMission([], "coffee-order")).toBeUndefined();
  });
});
