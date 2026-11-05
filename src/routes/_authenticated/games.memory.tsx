import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { GameDone, GameShell } from "@/components/GameShell";
import { type CompanionId } from "@/lib/content";
import { shuffle, uniqueWords } from "@/lib/games";
import { profileQuery } from "@/lib/progress";
import { celebrate, speak } from "@/lib/speech";

export const Route = createFileRoute("/_authenticated/games/memory")({
  head: () => ({ meta: [{ title: "Memorama — English Start" }, { name: "description", content: "Une palabras en inglés con su dibujo y significado en este memorama." }, { property: "og:title", content: "Memorama — English Start" }, { property: "og:description", content: "Memorama de vocabulario en inglés." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: Memory,
});

const PAIRS = 5;

function Memory() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const voice = (profile?.companion as CompanionId) ?? "fox";
  const [seed, setSeed] = useState(0);
  const cards = useMemo(() => {
    const words = shuffle(uniqueWords()).slice(0, PAIRS);
    return shuffle(words.flatMap((w) => [
      { key: `${w.id}-en`, pair: w.id, kind: "en" as const, w },
      { key: `${w.id}-pic`, pair: w.id, kind: "pic" as const, w },
    ]));
  }, [seed]);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [tries, setTries] = useState(0);

  const restart = () => { setSeed((s) => s + 1); setOpen([]); setMatched(new Set()); setTries(0); };

  const flip = (key: string) => {
    if (open.length === 2 || open.includes(key)) return;
    const card = cards.find((c) => c.key === key)!;
    if (matched.has(card.pair)) return;
    if (card.kind === "en") speak(card.w.en, voice);
    const nowOpen = [...open, key];
    setOpen(nowOpen);
    if (nowOpen.length === 2) {
      setTries((t) => t + 1);
      const [a, b] = nowOpen.map((k) => cards.find((c) => c.key === k)!);
      if (a!.pair === b!.pair) {
        setTimeout(() => { setMatched((m) => new Set(m).add(a!.pair)); setOpen([]); celebrate(); speak(a!.w.en, voice); }, 400);
      } else {
        setTimeout(() => setOpen([]), 1100);
      }
    }
  };

  const done = matched.size === PAIRS;

  return (
    <AppShell>
      <GameShell title="Memory match" titleEs="Memorama" step={matched.size} total={PAIRS}>
        {done ? (
          <GameDone score={Math.max(0, PAIRS * 2 - tries)} total={PAIRS} onAgain={restart} />
        ) : (
          <>
            <p className="text-center text-sm font-semibold">👆 Voltea dos tarjetas: une la palabra en inglés con su dibujo.</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {cards.map((c) => {
                const shown = open.includes(c.key) || matched.has(c.pair);
                return (
                  <button
                    key={c.key}
                    onClick={() => flip(c.key)}
                    className={`grid aspect-square place-items-center rounded-2xl p-2 text-center shadow-soft transition-all ${shown ? (matched.has(c.pair) ? "bg-vocab" : c.kind === "en" ? "bg-phrase" : "bg-character") : "bg-primary hover:-translate-y-0.5"}`}
                  >
                    {shown ? (
                      c.kind === "en" ? <span className="text-lg font-extrabold" lang="en">{c.w.en}</span>
                        : <span><span className="block text-4xl">{c.w.emoji}</span><span className="text-xs font-semibold" lang="es">{c.w.es}</span></span>
                    ) : <span className="text-3xl font-extrabold text-primary-foreground">?</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </GameShell>
    </AppShell>
  );
}
