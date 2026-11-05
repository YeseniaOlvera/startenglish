import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getMission, isSentenceAccepted, WORDS, type CompanionId, type Mission } from "@/lib/content";
import { completeMission, findCompletedMission, profileQuery, progressQuery } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/mission/$id")({
  head: () => ({ meta: [{"title": "Misión — English Start"}, {"name": "description", "content": "Aprende palabras y construye frases en inglés con apoyo en español en las misiones de English Start."}, {"property": "og:title", "content": "Misión — English Start"}, {"property": "og:description", "content": "Aprende palabras y construye frases en inglés con apoyo en español en las misiones de English Start."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  loader: async ({ params, context }) => {
    const m = getMission(params.id);
    if (!m) throw notFound();
    const progress = await context.queryClient.ensureQueryData(progressQuery);
    await context.queryClient.ensureQueryData(profileQuery);
    return { mission: m, completed: findCompletedMission(progress.missions, m.id) };
  },
  component: MissionPage,
});

type Step = { kind: "learn"; word: string } | { kind: "choose"; word: string } | { kind: "build" } | { kind: "done" };

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function MissionPage() {
  const { mission, completed } = Route.useLoaderData();
  const { data: profile } = useSuspenseQuery(profileQuery);
  const companion = (profile?.companion as CompanionId) ?? "fox";
  const steps = useMemo<Step[]>(
    () => [
      ...mission.words.map((w) => ({ kind: "learn" as const, word: w })),
      ...shuffle(mission.words).map((w) => ({ kind: "choose" as const, word: w })),
      { kind: "build" as const },
      { kind: "done" as const },
    ],
    [mission],
  );
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const step = steps[i] ?? { kind: "done" as const };
  const next = (firstTry?: boolean) => {
    if (firstTry) setScore((s) => s + 1);
    setI((x) => x + 1);
  };
  const total = mission.words.length + 1;

  if (completed)
    return (
      <div className="min-h-screen bg-sky px-5 py-6">
        <div className="mx-auto max-w-xl">
          <AlreadyDone mission={mission} score={completed.score} />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-sky px-5 py-6">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center gap-4">
          <Link to={mission.location === "home" ? "/world/home" : "/world/coffee-shop"} className="text-2xl font-bold text-muted-foreground" aria-label="Salir">×</Link>
          <Progress value={(i / (steps.length - 1)) * 100} className="h-3 bg-card" />
        </div>
        <p className="mt-6 text-sm font-bold text-muted-foreground">{mission.title} · {mission.titleEs}</p>
        <div className="mt-4">
          {step.kind === "learn" && <Learn key={i} wordId={step.word} companion={companion} onNext={() => next()} />}
          {step.kind === "choose" && <Choose key={i} wordId={step.word} pool={mission.words} companion={companion} onNext={next} />}
          {step.kind === "build" && <Build mission={mission} companion={companion} onNext={next} />}
          {step.kind === "done" && <Done mission={mission} score={score} total={total} />}
        </div>
      </div>
    </div>
  );
}

function Learn({ wordId, companion, onNext }: { wordId: string; companion: CompanionId; onNext: () => void }) {
  const w = WORDS[wordId]!;
  return (
    <div className="rounded-3xl bg-card p-8 text-center shadow-lift">
      <span className="rounded-full bg-vocab px-3 py-1 text-xs font-bold">New word · Escucha</span>
      <div className="mx-auto mt-6 grid h-32 w-32 place-items-center rounded-3xl bg-vocab text-7xl">{w.emoji}</div>
      <p className="mt-6 text-5xl font-black">{w.en}</p>
      <p className="mt-2 text-xl text-muted-foreground" lang="es">{w.es}</p>
      <p className="mt-4 text-lg" lang="en">“{w.example}”</p>
      <p className="mt-1 text-sm text-muted-foreground" lang="es">{w.exampleEs}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button variant="audio" size="lg" onClick={() => speak(`${w.en}. ${w.example}`, companion)}><Volume2 /> Escuchar</Button>
        <Button variant="hero" size="lg" onClick={onNext}>Siguiente</Button>
      </div>
    </div>
  );
}

function Choose({ wordId, pool, companion, onNext }: { wordId: string; pool: string[]; companion: CompanionId; onNext: (firstTry: boolean) => void }) {
  const w = WORDS[wordId]!;
  const options = useMemo(() => shuffle([wordId, ...shuffle(pool.filter((p) => p !== wordId)).slice(0, 2)]), [wordId, pool]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [right, setRight] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const pick = (id: string) => {
    if (right || revealed) return;
    if (id === wordId) {
      setRight(true);
      speak(w.en, companion);
    } else {
      setWrong((x) => [...x, id]);
      setRevealed(true);
      speak(w.en, companion);
    }
  };

  return (
    <div className="rounded-3xl bg-card p-8 text-center shadow-lift">
      <span className="rounded-full bg-audio px-3 py-1 text-xs font-bold">Escucha y elige</span>
      <Button variant="audio" size="lg" className="mx-auto mt-6 h-20 w-20 rounded-full" onClick={() => speak(w.en, companion)} aria-label="Reproducir">
        <Volume2 className="!size-8" />
      </Button>
      <div className="mt-8 grid grid-cols-3 gap-3">
        {options.map((id) => {
          const o = WORDS[id]!;
          const isWrong = wrong.includes(id);
          const isRight = (right || revealed) && id === wordId;
          return (
            <Button
              variant="outline"
              key={id}
              onClick={() => pick(id)}
              disabled={isWrong}
              className={`h-auto min-w-0 flex-col whitespace-normal rounded-2xl border-2 px-2 py-4 transition-all ${isRight ? "border-vocab-strong bg-vocab" : isWrong ? "border-transparent bg-muted opacity-50" : "border-border bg-card hover:bg-accent"}`}
            >
              <div className="text-5xl">{o.emoji}</div>
              <div className="mt-2 break-words font-bold" lang="en">{o.en}</div>
              <div className="text-sm font-normal text-muted-foreground" lang="es">{o.es}</div>
            </Button>
          );
        })}
      </div>
      <p className="mt-6 min-h-6 font-semibold">
        {right ? "Great job! 🎉" : revealed ? <>La respuesta correcta es <span className="text-vocab-strong">“{w.en}” ({w.es})</span>. ¡A la próxima la tienes!</> : ""}
      </p>
      {(right || revealed) && <Button variant="hero" size="lg" className="mt-2" onClick={() => onNext(right && wrong.length === 0)}>Continuar</Button>}
    </div>
  );
}

function Build({ mission, companion, onNext }: { mission: Mission; companion: CompanionId; onNext: (firstTry: boolean) => void }) {
  const s = mission.sentence;
  const bank = useMemo(() => shuffle(s.tokens.map((t, k) => ({ t, k }))), [s]);
  const [picked, setPicked] = useState<number[]>([]);
  const [state, setState] = useState<"idle" | "ok" | "wrong">("idle");
  const [tries, setTries] = useState(0);
  const answer = picked.map((k) => s.tokens[k]).join(" ");

  const check = () => {
    setTries((t) => t + 1);
    if (isSentenceAccepted(s, answer)) {
      setState("ok");
      speak(answer, companion);
    } else {
      setState("wrong");
      speak(s.tokens.join(" "), companion);
    }
  };

  return (
    <div className="rounded-3xl bg-card p-8 shadow-lift">
      <span className="rounded-full bg-phrase px-3 py-1 text-xs font-bold">Construye la frase</span>
      <p className="mt-4 text-lg font-semibold" lang="en">{s.tokens.join(" ")}</p>
      <p className="mt-1 text-muted-foreground" lang="es">{s.meaning}</p>
      <div className="mt-6 flex min-h-16 flex-wrap gap-2 rounded-2xl border-2 border-dashed p-3">
        {picked.map((k) => (
          <button key={k} onClick={() => { setPicked(picked.filter((x) => x !== k)); setState("idle"); }} className="rounded-xl bg-phrase px-3 py-2 font-bold">
            {s.tokens[k]}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {bank.filter(({ k }) => !picked.includes(k)).map(({ t, k }) => (
          <button key={k} onClick={() => { setPicked([...picked, k]); setState("idle"); }} className="rounded-xl border bg-card px-3 py-2 font-bold shadow-soft hover:bg-accent">
            {t}
          </button>
        ))}
      </div>
      <p className="mt-5 min-h-6 font-semibold">
        {state === "ok" && "Perfect! 🎉 Así se dice."}
        {state === "wrong" && <>La frase correcta es: <span className="text-vocab-strong">“{s.tokens.join(" ")}”</span></>}
      </p>
      <div className="mt-3 flex gap-3">
        {state === "ok" ? (
          <Button variant="hero" size="lg" onClick={() => onNext(tries === 1)}>Terminar misión</Button>
        ) : state === "wrong" ? (
          <Button variant="hero" size="lg" onClick={() => onNext(false)}>Continuar</Button>
        ) : (
          <>
            <Button variant="hero" size="lg" onClick={check} disabled={picked.length === 0}><Check /> Revisar</Button>
            <Button variant="soft" size="lg" onClick={() => { setPicked([]); setState("idle"); }}><RotateCcw /> Borrar</Button>
            <Button variant="audio" size="lg" onClick={() => speak(s.tokens.join(" "), companion)} aria-label="Escuchar frase"><Volume2 /></Button>
          </>
        )}
      </div>
    </div>
  );
}

function AlreadyDone({ mission, score }: { mission: Mission; score: number }) {
  return (
    <div className="rounded-3xl bg-card p-8 text-center shadow-lift">
      <span className="rounded-full bg-vocab px-3 py-1 text-xs font-bold">Completada · Completed</span>
      <p className="mt-6 text-6xl">🔒</p>
      <h1 className="mt-4 text-3xl">Mission complete!</h1>
      <p className="mt-1 text-lg text-muted-foreground" lang="es">Ya hiciste esta misión, así que quedó cerrada.</p>
      <p className="mt-2 text-muted-foreground">Aciertos al primer intento: {score} de {totalOf(mission)}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {mission.words.map((w) => (
          <span key={w} className="rounded-full bg-vocab px-3 py-1 font-bold">{WORDS[w]?.emoji} {WORDS[w]?.en} · {WORDS[w]?.es}</span>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground" lang="es">Busca la siguiente misión en el mapa.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild variant="soft" size="lg"><Link to={mission.location === "home" ? "/world/home" : "/world/coffee-shop"}>Volver al lugar</Link></Button>
        <Button asChild variant="hero" size="lg"><Link to="/dashboard">Ir al panel</Link></Button>
      </div>
    </div>
  );
}

function Done({ mission, score, total }: { mission: Mission; score: number; total: number }) {
  const qc = useQueryClient();
  const [saved, setSaved] = useState<"saving" | "saved" | "error">("saving");
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    completeMission(mission.id, score, mission.words)
      .then(() => {
        setSaved("saved");
        qc.invalidateQueries({ queryKey: ["progress"] });
      })
      .catch(() => {
        setSaved("error");
        toast.error("No se pudo guardar tu progreso.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="rounded-3xl bg-card p-8 text-center shadow-lift">
      <p className="text-6xl">🎉</p>
      <h1 className="mt-4 text-3xl">Mission complete!</h1>
      <p className="mt-1 text-lg text-muted-foreground">¡Misión completada!</p>
      <p className="mt-2 text-muted-foreground">Aciertos al primer intento: {score} de {total}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {mission.words.map((w) => (
          <span key={w} className="rounded-full bg-vocab px-3 py-1 font-bold">{WORDS[w]?.emoji} {WORDS[w]?.en} · {WORDS[w]?.es}</span>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{saved === "saving" ? "Guardando…" : saved === "saved" ? "Progreso guardado ✓" : "Sin guardar"}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild variant="soft" size="lg"><Link to={mission.location === "home" ? "/world/home" : "/world/coffee-shop"}>Volver al lugar</Link></Button>
        <Button asChild variant="hero" size="lg"><Link to="/dashboard">Ir al panel</Link></Button>
      </div>
    </div>
  );
}
