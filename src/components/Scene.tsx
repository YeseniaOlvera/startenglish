import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Volume2, X, Clock, CheckCircle2 } from "lucide-react";
import { COMPANIONS, MISSIONS, SCENE_WORDS, WORDS, type CompanionId } from "@/lib/content";
import { markWordsSeen, profileQuery, progressQuery } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { Button } from "@/components/ui/button";

export function Scene({
  location,
  title,
  image,
  intro,
}: {
  location: "home" | "coffee-shop";
  title: string;
  image: string;
  intro: string;
}) {
  const qc = useQueryClient();
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: progress } = useSuspenseQuery(progressQuery);
  const [active, setActive] = useState<string | null>(null);
  const companion = COMPANIONS[(profile?.companion as CompanionId) ?? "fox"];
  const done = new Set(progress.missions.map((m) => m.mission_id));
  const word = active ? WORDS[active]! : null;

  const tap = (id: string) => {
    setActive(id);
    speak(WORDS[id]!.en, companion.id);
    markWordsSeen([id]).then(() => qc.invalidateQueries({ queryKey: ["progress"] })).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Link to="/world" className="text-sm font-semibold text-primary-strong">← World map</Link>
          <h1 className="text-3xl md:text-4xl">{title}</h1>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-card shadow-lift">
        <img src={image} alt={title} width={1600} height={1008} className="w-full" />
        {SCENE_WORDS[location]!.map((id) => {
          const w = WORDS[id]!;
          return (
            <button
              key={id}
              onClick={() => tap(id)}
              aria-label={`Tap: ${w.en}`}
              style={{ left: `${w.x}%`, top: `${w.y}%` }}
              className={`absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-card bg-vocab-strong animate-hotspot transition-transform hover:scale-125 ${active === id ? "scale-125 bg-primary-strong" : ""}`}
            />
          );
        })}
        {word && (
          <div className="absolute bottom-3 left-3 right-3 mx-auto flex max-w-md items-center gap-4 rounded-2xl bg-card p-4 shadow-lift md:left-auto md:right-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-vocab text-3xl">{word.emoji}</div>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-extrabold">{word.en}</p>
              <p className="truncate text-sm text-muted-foreground">“{word.example}” · {word.es}</p>
            </div>
            <Button variant="audio" size="icon" onClick={() => speak(`${word.en}. ${word.example}`, companion.id)} aria-label="Escuchar">
              <Volume2 />
            </Button>
            <button onClick={() => setActive(null)} aria-label="Cerrar" className="text-muted-foreground"><X className="h-5 w-5" /></button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-4 rounded-2xl bg-character/60 p-4">
        <img src={companion.image} alt={companion.name} className="h-16 w-auto" />
        <p className="flex-1 pt-1 font-semibold"><span className="font-extrabold">{companion.name}:</span> {intro}</p>
        <Button variant="audio" size="icon" onClick={() => speak(intro, companion.id)} aria-label={`Escuchar a ${companion.name}`}>
          <Volume2 />
        </Button>
      </div>

      <section>
        <h2 className="mb-3 text-xl">Missions</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {MISSIONS.filter((m) => m.location === location).map((m) => (
            <Link
              key={m.id}
              to="/mission/$id"
              params={{ id: m.id }}
              className="group flex items-center justify-between gap-4 rounded-2xl bg-phrase/70 p-5 shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <div>
                <p className="text-lg font-extrabold">{m.title}</p>
                <p className="text-sm text-muted-foreground">{m.goal}</p>
                <p className="mt-2 flex items-center gap-1 text-xs font-semibold"><Clock className="h-3.5 w-3.5" /> {m.minutes} min · {m.words.length} words</p>
              </div>
              {done.has(m.id) ? <CheckCircle2 className="h-7 w-7 text-vocab-strong" /> : <span className="font-bold text-primary-strong">Start →</span>}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
