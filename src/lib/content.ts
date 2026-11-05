// Learning content for Stage 1. Kept in typed code; structured to move into the database later.
import fox from "@/assets/companion-fox.png";
import pip from "@/assets/companion-pip.png";
import mia from "@/assets/companion-mia.png";
import leo from "@/assets/companion-leo.png";

export type CompanionId = "fox" | "pip" | "mia" | "leo";

export type CompanionVoice = {
  /** speech synthesis pitch (0.1–2); higher = more aguda */
  pitch: number;
  /** speech synthesis rate (0.5–2) */
  rate: number;
  /** preferred voice gender when the device offers several en-US voices */
  prefer: "female" | "male";
};

export const COMPANIONS: Record<
  CompanionId,
  { id: CompanionId; name: string; trait: string; image: string; greeting: string; voice: CompanionVoice }
> = {
  fox: { id: "fox", name: "Fox", trait: "Curioso y explorador", image: fox, greeting: "Hi! Let's explore together.", voice: { pitch: 1.3, rate: 0.95, prefer: "male" } },
  pip: { id: "pip", name: "Pip", trait: "Divertido y amigable", image: pip, greeting: "Hello, friend! This is fun!", voice: { pitch: 1.6, rate: 1.05, prefer: "female" } },
  mia: { id: "mia", name: "Mia", trait: "Sociable y cercana", image: mia, greeting: "Hi there! Nice to meet you.", voice: { pitch: 1.15, rate: 0.9, prefer: "female" } },
  leo: { id: "leo", name: "Leo", trait: "Aventurero y motivador", image: leo, greeting: "Hey! You can do it. Let's go!", voice: { pitch: 0.65, rate: 0.85, prefer: "male" } },
};

export type Word = {
  id: string;
  en: string;
  es: string;
  emoji: string;
  example: string;
  /** hotspot position on the scene image, in percent */
  x: number;
  y: number;
};

export type LocationId =
  | "home" | "neighborhood" | "coffee-shop" | "supermarket" | "park" | "school" | "airport" | "workplace";

export type Location = {
  id: LocationId;
  name: string;
  es: string;
  open: boolean;
  /** pin position on the world map image, in percent */
  x: number;
  y: number;
};

export const LOCATIONS: Location[] = [
  { id: "home", name: "My Home", es: "Mi casa", open: true, x: 17, y: 50 },
  { id: "coffee-shop", name: "The Coffee Shop", es: "La cafetería", open: true, x: 44, y: 36 },
  { id: "neighborhood", name: "My Neighborhood", es: "Mi barrio", open: false, x: 30, y: 62 },
  { id: "supermarket", name: "The Supermarket", es: "El supermercado", open: false, x: 75, y: 40 },
  { id: "park", name: "The Park", es: "El parque", open: false, x: 54, y: 70 },
  { id: "school", name: "The School", es: "La escuela", open: false, x: 81, y: 15 },
  { id: "airport", name: "The Airport", es: "El aeropuerto", open: false, x: 22, y: 16 },
  { id: "workplace", name: "The Workplace", es: "La oficina", open: false, x: 54, y: 12 },
];

export const WORDS: Record<string, Word> = {
  sofa: { id: "sofa", en: "sofa", es: "sofá", emoji: "🛋️", example: "I sit on the sofa.", x: 33, y: 40 },
  lamp: { id: "lamp", en: "lamp", es: "lámpara", emoji: "💡", example: "Turn on the lamp, please.", x: 29, y: 24 },
  door: { id: "door", en: "door", es: "puerta", emoji: "🚪", example: "Close the door.", x: 48, y: 17 },
  window: { id: "window", en: "window", es: "ventana", emoji: "🪟", example: "Open the window.", x: 16, y: 30 },
  table: { id: "table", en: "table", es: "mesa", emoji: "🍽️", example: "The keys are on the table.", x: 63, y: 46 },
  chair: { id: "chair", en: "chair", es: "silla", emoji: "🪑", example: "Take a chair.", x: 57, y: 58 },
  fridge: { id: "fridge", en: "fridge", es: "refrigerador", emoji: "🧊", example: "The milk is in the fridge.", x: 66, y: 22 },
  bed: { id: "bed", en: "bed", es: "cama", emoji: "🛏️", example: "I go to bed at ten.", x: 52, y: 85 },
  coffee: { id: "coffee", en: "coffee", es: "café", emoji: "☕", example: "A coffee, please.", x: 41, y: 28 },
  cup: { id: "cup", en: "cup", es: "taza", emoji: "🍵", example: "A big cup, please.", x: 47, y: 13 },
  croissant: { id: "croissant", en: "croissant", es: "cuernito", emoji: "🥐", example: "Can I have a croissant?", x: 63, y: 36 },
  menu: { id: "menu", en: "menu", es: "menú", emoji: "📋", example: "Can I see the menu?", x: 66, y: 17 },
  counter: { id: "counter", en: "counter", es: "mostrador", emoji: "🧾", example: "Pay at the counter.", x: 57, y: 50 },
  "cafe-table": { id: "cafe-table", en: "table", es: "mesa", emoji: "🍽️", example: "Is this table free?", x: 48, y: 67 },
  "cafe-chair": { id: "cafe-chair", en: "chair", es: "silla", emoji: "🪑", example: "Is this chair free?", x: 36, y: 52 },
  "cafe-door": { id: "cafe-door", en: "door", es: "puerta", emoji: "🚪", example: "The door is open.", x: 12, y: 63 },
};

export const SCENE_WORDS: Record<"home" | "coffee-shop", string[]> = {
  home: ["sofa", "lamp", "door", "window", "table", "chair", "fridge", "bed"],
  "coffee-shop": ["coffee", "cup", "croissant", "menu", "counter", "cafe-table", "cafe-chair", "cafe-door"],
};

export type Sentence = {
  /** Spanish meaning shown as context, not as the only teaching method */
  meaning: string;
  tokens: string[];
  /** acceptable answers; checked ignoring case and punctuation */
  accepted: string[];
};

export type Mission = {
  id: string;
  location: "home" | "coffee-shop";
  title: string;
  goal: string;
  minutes: number;
  words: string[];
  sentence: Sentence;
};

export const MISSIONS: Mission[] = [
  {
    id: "home-living-room",
    location: "home",
    title: "My living room",
    goal: "Nombra las cosas de tu sala.",
    minutes: 6,
    words: ["sofa", "lamp", "window", "door", "table"],
    sentence: {
      meaning: "Abre la ventana, por favor.",
      tokens: ["Open", "the", "window", "please"],
      accepted: ["open the window please", "please open the window"],
    },
  },
  {
    id: "home-kitchen",
    location: "home",
    title: "Kitchen and bedroom",
    goal: "Encuentra objetos de la cocina y la recámara.",
    minutes: 5,
    words: ["fridge", "chair", "bed", "table"],
    sentence: {
      meaning: "La leche está en el refrigerador.",
      tokens: ["The", "milk", "is", "in", "the", "fridge"],
      accepted: ["the milk is in the fridge"],
    },
  },
  {
    id: "coffee-order",
    location: "coffee-shop",
    title: "Order a coffee",
    goal: "Pide un café y algo de comer.",
    minutes: 7,
    words: ["coffee", "cup", "croissant", "menu"],
    sentence: {
      meaning: "Quisiera un café, por favor.",
      tokens: ["I", "would", "like", "a", "coffee", "please"],
      accepted: ["i would like a coffee please", "i'd like a coffee please", "a coffee please i would like"],
    },
  },
  {
    id: "coffee-seat",
    location: "coffee-shop",
    title: "Find a seat",
    goal: "Encuentra dónde sentarte y pagar.",
    minutes: 5,
    words: ["cafe-table", "cafe-chair", "counter", "cafe-door"],
    sentence: {
      meaning: "¿Está libre esta mesa?",
      tokens: ["Is", "this", "table", "free"],
      accepted: ["is this table free"],
    },
  },
];

export const getMission = (id: string) => MISSIONS.find((m) => m.id === id);

export function normalizeAnswer(s: string) {
  return s.toLowerCase().replace(/[.,!?¿¡]/g, "").replace(/\s+/g, " ").trim();
}

export function isSentenceAccepted(sentence: Sentence, answer: string) {
  const a = normalizeAnswer(answer);
  return sentence.accepted.some((x) => normalizeAnswer(x) === a);
}
