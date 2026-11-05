import homeImg from "@/assets/scene-home.jpg";
import coffeeImg from "@/assets/scene-coffee.jpg";
import { SCENE_WORDS, WORDS, type Word } from "@/lib/content";

export const GAMES = [
  { id: "shadow", to: "/games/shadow", emoji: "🔦", title: "Find the shadow", titleEs: "Busca la sombra", desc: "Escucha la palabra, mira la sombra y encuentra el objeto en la imagen." },
  { id: "memory", to: "/games/memory", emoji: "🃏", title: "Memory match", titleEs: "Memorama", desc: "Une cada palabra en inglés con su dibujo y su significado." },
  { id: "letters", to: "/games/letters", emoji: "🔤", title: "Spell it", titleEs: "Deletrea", desc: "Ordena las letras para formar la palabra en inglés." },
] as const;

export const SCENE_IMAGES = { home: homeImg, "coffee-shop": coffeeImg } as const;

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Image is 1600x1008; compare taps in a space where both axes have the same scale. */
export function isNearTarget(word: Pick<Word, "x" | "y">, x: number, y: number, radius = 8) {
  const dx = x - word.x;
  const dy = (y - word.y) * (1008 / 1600);
  return Math.hypot(dx, dy) <= radius;
}

/** Unique English words (no duplicates like table/cafe-table). */
export function uniqueWords(): Word[] {
  const seen = new Set<string>();
  return Object.values(WORDS).filter((w) => (seen.has(w.en) ? false : (seen.add(w.en), true)));
}

export function shadowRounds(count = 5) {
  const scenes = shuffle(["home", "coffee-shop"] as const);
  return shuffle(scenes.flatMap((s) => SCENE_WORDS[s]!.map((id) => ({ scene: s, word: WORDS[id]! })))).slice(0, count);
}
