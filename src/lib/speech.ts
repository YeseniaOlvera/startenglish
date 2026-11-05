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
export function speak(text: string, companion?: CompanionId) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  if (companion) {
    const v = COMPANIONS[companion].voice;
    u.pitch = v.pitch;
    u.rate = v.rate;
    const voice = pickVoice(v.prefer);
    if (voice) u.voice = voice;
  } else {
    u.rate = 0.85;
    const voice = pickVoice(null);
    if (voice) u.voice = voice;
  }
  synth.speak(u);
  return true;
}
