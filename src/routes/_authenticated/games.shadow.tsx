import { useMemo, useState, type MouseEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Volume2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GameDone, GameShell } from "@/components/GameShell";
import { Button } from "@/components/ui/button";
import { type CompanionId } from "@/lib/content";
import { SCENE_IMAGES, isNearTarget, shadowRounds } from "@/lib/games";
import { profileQuery } from "@/lib/progress";
import { celebrate, speak } from "@/lib/speech";

export const Route = createFileRoute("/_authenticated/games/shadow")({
  head: () => ({ meta: [{ title: "Busca la sombra — English Start" }, { name: "description", content: "Escucha una palabra en inglés, mira su sombra y encuéntrala en la imagen." }, { property: "og:title", content: "Busca la sombra — English Start" }, { property: "og:description", content: "Juego para encontrar objetos por su nombre en inglés." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: Shadow,
});

function Shadow() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const voice = (profile?.companion as CompanionId) ?? "fox";
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => shadowRounds(), [seed]);
  const [i, setI] = useState(0);
  const [misses, setMisses] = useState(0);
  const [found, setFound] = useState(false);
  const [score, setScore] = useState(0);
  const [tap, setTap] = useState<{ x: number; y: number } | null>(null);

  const restart = () => { setSeed((s) => s + 1); setI(0); setMisses(0); setFound(false); setScore(0); setTap(null); };

  if (i >= rounds.length) {
    return <AppShell><GameShell title="Find the shadow" titleEs="Busca la sombra" step={rounds.length} total={rounds.length}><GameDone score={score} total={rounds.length} onAgain={restart} /></GameShell></AppShell>;
  }
  const { scene, word } = rounds[i]!;

  const onTap = (e: MouseEvent<HTMLDivElement>) => {
    if (found) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setTap({ x, y });
    if (isNearTarget(word, x, y)) {
      setFound(true);
      if (misses === 0) setScore((s) => s + 1);
      celebrate();
      speak(`${word.en}. ${word.example}`, voice);
    } else {
      setMisses((m) => m + 1);
    }
  };
  const next = () => { setI((n) => n + 1); setMisses(0); setFound(false); setTap(null); };
  const showHint = misses >= 2 && !found;

  return (
    <AppShell>
      <GameShell title="Find the shadow" titleEs="Busca la sombra" step={i} total={rounds.length}>
        <div className="flex items-center gap-4 rounded-3xl bg-audio/60 p-4 shadow-soft">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-card text-5xl" aria-label="Sombra del objeto">
            <span style={{ filter: found ? "none" : "brightness(0)", opacity: found ? 1 : 0.55 }}>{word.emoji}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-muted-foreground">Find the · Encuentra:</p>
            <p className="text-3xl font-extrabold">{word.en}</p>
            {found && <p className="font-semibold" lang="es">{word.es}</p>}
          </div>
          <Button variant="audio" size="icon" onClick={() => speak(word.en, voice)} aria-label="Escuchar"><Volume2 /></Button>
        </div>

        <p className="text-center text-sm font-semibold">
          {found ? "¡Lo encontraste! 🎉" : showHint ? "💡 Pista: busca donde brilla el círculo." : misses > 0 ? "Casi. Intenta en otro lugar 👀" : "👆 Toca el objeto en la imagen."}
        </p>

        <div className="relative cursor-crosshair overflow-hidden rounded-3xl bg-card shadow-lift" onClick={onTap}>
          <img src={SCENE_IMAGES[scene]} alt="Escena" width={1600} height={1008} className="pointer-events-none w-full select-none" />
          {tap && !found && <span className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-character-strong" style={{ left: `${tap.x}%`, top: `${tap.y}%` }} />}
          {(found || showHint) && (
            <span className={`absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-card ${found ? "bg-vocab-strong/60" : "bg-phrase-strong/50 animate-hotspot"}`} style={{ left: `${word.x}%`, top: `${word.y}%` }} />
          )}
        </div>

        {found && <Button variant="hero" size="lg" className="w-full" onClick={next}>Continuar →</Button>}
      </GameShell>
    </AppShell>
  );
}
