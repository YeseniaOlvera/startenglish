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

let activeChime: AudioContext | undefined;

/** Stop any playing speech and chime (e.g. when the tab is hidden). */
export function stopAllAudio() {
  if (typeof window === "undefined") return;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (activeChime) {
    void activeChime.close();
    activeChime = undefined;
  }
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAllAudio();
  });
}

/**
 * Cheerful celebration chime for correct answers, synthesized with Web Audio
 * (no audio files). Rising major arpeggio: C5 → E5 → G5 → C6.
 */
export function celebrate() {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  activeChime = ctx;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const start = ctx.currentTime + 0.02;
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t = start + i * 0.12;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
  // Close the context once the chime finishes so we don't leak audio resources.
  window.setTimeout(() => {
    void ctx.close();
    if (activeChime === ctx) activeChime = undefined;
  }, (notes.length * 0.12 + 0.5) * 1000);
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
