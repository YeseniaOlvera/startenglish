// Pronunciation via the browser's built-in speech synthesis (American English).
// This is NOT speech recognition; that integration is pending.
import { COMPANIONS, type CompanionId } from "@/lib/content";

const FEMALE_HINTS = ["female", "samantha", "victoria", "karen", "moira", "tessa", "zira", "susan", "allison", "ava"];
const MALE_HINTS = ["male", "alex", "daniel", "fred", "david", "mark", "aaron", "arthur", "gordon"];

function pickVoice(prefer: "female" | "male" | null): SpeechSynthesisVoice | undefined {
  const all = window.speechSynthesis.getVoices();
  const enUS = all.filter((v) => v.lang.replace("_", "-").startsWith("en-US"));
  const en = all.filter((v) => v.lang.replace("_", "-").startsWith("en"));
  if (en.length === 0) return undefined;
  if (!prefer) return enUS[0] ?? en[0];
  const hints = prefer === "female" ? FEMALE_HINTS : MALE_HINTS;
  // Try en-US first, then any English voice whose name matches the gender.
  const match =
    enUS.find((v) => hints.some((h) => v.name.toLowerCase().includes(h))) ??
    en.find((v) => hints.some((h) => v.name.toLowerCase().includes(h)));
  return match ?? enUS[0] ?? en[0];
}

/**
 * Speak text aloud. Without a companion it uses a clear, slow "teacher" voice
 * for learning content; with a companion id it uses that character's voice.
 */
export function phraseDelivery(text: string) {
  const phrase = text.trim();
  const question = /\?$/.test(phrase) || /^(?:can|could|would|will|is|are|do|does|did|have|has)\b.+\s.+/i.test(phrase) || /^(?:what|where|when|why|who|how)\b.+/i.test(phrase);
  const polite = /\bplease\b|^I (?:would like|'d like)\b/i.test(phrase);
  const lively = /!$/.test(phrase) || /^(?:hi|hello|hey|welcome)\b/i.test(phrase);
  const punctuation = /[.!?]$/.test(phrase) ? "" : question ? "?" : ".";
  return {
    text: phrase + punctuation,
    pitchFactor: question ? 1.06 : polite ? 0.98 : lively ? 1.04 : 1,
    rateFactor: question ? 0.94 : polite ? 0.92 : lively ? 1.03 : 1,
  };
}

export function speak(text: string, companion?: CompanionId) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const phrases = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((part) => part.trim()).filter(Boolean);
  if (!phrases?.length) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const character = companion ? COMPANIONS[companion].voice : undefined;
  const voice = pickVoice(character?.prefer ?? null);
  for (const phrase of phrases) {
    const delivery = phraseDelivery(phrase);
    const u = new SpeechSynthesisUtterance(delivery.text);
    u.lang = "en-US";
    u.pitch = Math.min(2, Math.max(0.1, (character?.pitch ?? 1) * delivery.pitchFactor));
    u.rate = Math.min(2, Math.max(0.5, (character?.rate ?? 0.85) * delivery.rateFactor));
    if (voice) u.voice = voice;
    synth.speak(u);
  }
  return true;
}
