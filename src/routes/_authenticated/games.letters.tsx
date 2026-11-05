import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Volume2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GameDone, GameShell } from "@/components/GameShell";
import { Button } from "@/components/ui/button";
import { type CompanionId } from "@/lib/content";
import { shuffle, uniqueWords } from "@/lib/games";
import { profileQuery } from "@/lib/progress";
import { celebrate, speak } from "@/lib/speech";

export const Route = createFileRoute("/_authenticated/games/letters")({
  head: () => ({ meta: [{ title: "Deletrea — English Start" }, { name: "description", content: "Ordena las letras para formar palabras en inglés." }, { property: "og:title", content: "Deletrea — English Start" }, { property: "og:description", content: "Juego de deletreo en inglés para principiantes." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: Letters,
});

const ROUNDS = 5;

function Letters() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const voice = (profile?.companion as CompanionId) ?? "fox";
  const [seed, setSeed] = useState(0);
  const words = useMemo(() => shuffle(uniqueWords().filter((w) => w.en.length <= 7)).slice(0, ROUNDS), [seed]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<"ok" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const word = words[i];
  const letters = useMemo(() => (word ? shuffle(word.en.split("")) : []), [word]);

  const restart = () => { setSeed((s) => s + 1); setI(0); setPicked([]); setResult(null); setScore(0); };
  if (!word) return <AppShell><GameShell title="Spell it" titleEs="Deletrea" step={ROUNDS} total={ROUNDS}><GameDone score={score} total={ROUNDS} onAgain={restart} /></GameShell></AppShell>;

  const answer = picked.map((p) => letters[p]).join("");
  const pick = (idx: number) => {
    if (result || picked.includes(idx)) return;
    const next = [...picked, idx];
    setPicked(next);
    if (next.length === letters.length) {
      const typed = next.map((p) => letters[p]).join("");
      if (typed === word.en) { setResult("ok"); setScore((s) => s + 1); celebrate(); }
      else setResult("wrong");
      speak(word.en, voice);
    }
  };
  const next = () => { setI((n) => n + 1); setPicked([]); setResult(null); };

  return (
    <AppShell>
      <GameShell title="Spell it" titleEs="Deletrea" step={i} total={ROUNDS}>
        <div className="flex items-center gap-4 rounded-3xl bg-vocab/60 p-5 shadow-soft">
          <span className="text-6xl">{word.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-muted-foreground">¿Cómo se escribe en inglés?</p>
            <p className="text-2xl font-extrabold" lang="es">{word.es}</p>
            <p className="text-sm text-muted-foreground">Pista: empieza con “{word.en[0]}” · {word.en.length} letras</p>
          </div>
          <Button variant="audio" size="icon" onClick={() => speak(word.en, voice)} aria-label="Escuchar"><Volume2 /></Button>
        </div>

        <div className="flex min-h-16 flex-wrap justify-center gap-2 rounded-2xl border-2 border-dashed bg-card p-3">
          {letters.map((_, k) => (
            <span key={k} className="grid h-12 w-10 place-items-center rounded-xl bg-phrase text-2xl font-extrabold">{answer[k] ?? ""}</span>
          ))}
        </div>

        {!result && (
          <>
            <div className="flex flex-wrap justify-center gap-2">
              {letters.map((l, k) => (
                <button key={k} onClick={() => pick(k)} disabled={picked.includes(k)} className="h-14 w-12 rounded-xl bg-card text-2xl font-extrabold shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-30">{l}</button>
              ))}
            </div>
            {picked.length > 0 && <Button variant="outline" className="mx-auto block" onClick={() => setPicked([])}>Borrar</Button>}
          </>
        )}

        {result && (
          <div className={`space-y-3 rounded-2xl p-4 text-center ${result === "ok" ? "bg-vocab" : "bg-character/70"}`}>
            <p className="font-extrabold">{result === "ok" ? "¡Correcto! 🎉" : "Se escribe así:"}</p>
            <p className="text-3xl font-extrabold" lang="en">{word.en}</p>
            <p className="text-sm" lang="en">“{word.example}”</p>
            <Button variant="hero" onClick={next}>Continuar →</Button>
          </div>
        )}
      </GameShell>
    </AppShell>
  );
}
