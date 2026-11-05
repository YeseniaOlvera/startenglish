// Pronunciation via the browser's built-in speech synthesis (American English).
// This is NOT speech recognition; that integration is pending.
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.85;
  const voice = synth.getVoices().find((v) => v.lang === "en-US");
  if (voice) u.voice = voice;
  synth.speak(u);
  return true;
}
