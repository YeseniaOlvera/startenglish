import { afterEach, describe, expect, it, vi } from "vitest";
import { phraseDelivery, speak } from "./speech";

afterEach(() => vi.unstubAllGlobals());

describe("phrase intonation", () => {
  it("gives a question different delivery from a statement", () => {
    const question = phraseDelivery("Is this table free");
    const statement = phraseDelivery("The door is open.");
    expect(question.text).toBe("Is this table free?");
    expect(question.pitchFactor).toBeGreaterThan(statement.pitchFactor);
    expect(question.rateFactor).toBeLessThan(statement.rateFactor);
  });
  it("slows polite requests compared with ordinary statements", () => {
    expect(phraseDelivery("A coffee, please.").rateFactor).toBeLessThan(phraseDelivery("The door is open.").rateFactor);
  });
  it("gives enthusiastic phrases a livelier delivery", () => {
    expect(phraseDelivery("You can do it!").pitchFactor).toBeGreaterThan(phraseDelivery("The door is open.").pitchFactor);
  });
  it("keeps Leo's selected voice across differently delivered sentences", () => {
    const voice = { name: "David", lang: "en-US" };
    const utterances: { text: string; voice?: unknown; pitch?: number; rate?: number }[] = [];
    vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });
    vi.stubGlobal("window", { speechSynthesis: {
      getVoices: () => [voice], cancel: vi.fn(), speak: (u: typeof utterances[number]) => utterances.push(u),
    } });
    expect(speak("The door is open. Is this table free?", "leo")).toBe(true);
    expect(utterances).toHaveLength(2);
    expect(utterances.every((u) => u.voice === voice)).toBe(true);
    expect(utterances[0]?.pitch).toBe(0.65);
    expect(utterances[1]?.pitch).toBeCloseTo(0.689);
    expect(utterances[1]?.rate).toBeCloseTo(0.799);
  });
});