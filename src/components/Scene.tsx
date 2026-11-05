import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Volume2, X, Clock, CheckCircle2 } from "lucide-react";
import { COMPANIONS, LOCATIONS, MISSIONS, SCENE_WORDS, WORDS, type CompanionId } from "@/lib/content";
import { markWordsSeen, profileQuery, progressQuery, findCompletedMission } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { Button } from "@/components/ui/button";

export function Scene({
  location,
  title,
  image,
  intro,
  introEs,
}: {
  location: "home" | "coffee-shop";
  title: string;
  image: string;
  intro: string;
  introEs: string;
}) {
  const qc = useQueryClient();
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: progress } = useSuspenseQuery(progressQuery);
  const [active, setActive] = useState<string | null>(null);
  const companion = COMPANIONS[(profile?.companion as CompanionId) ?? "fox"];
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
          <p className="text-muted-foreground">{LOCATIONS.find((item) => item.id === location)?.es}</p>
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
              <p className="text-sm text-muted-foreground" lang="es">{word.es}</p>
              <p className="mt-1 text-sm" lang="en">“{word.example}”</p>
              <p className="text-sm text-muted-foreground" lang="es">{word.exampleEs}</p>
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
        <div className="min-w-0 flex-1 pt-1">
          <p className="font-semibold" lang="en"><span className="font-extrabold">{companion.name}:</span> {intro}</p>
          <p className="mt-1 text-sm text-muted-foreground" lang="es">{introEs}</p>
        </div>
        <Button variant="audio" size="icon" onClick={() => speak(intro, companion.id)} aria-label={`Escuchar a ${companion.name}`}>
          <Volume2 />
        </Button>
      </div>

      <section>
        <h2 className="mb-3 text-xl">Missions · Misiones</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {MISSIONS.filter((m) => m.location === location).map((m) => {
            const finished = Boolean(findCompletedMission(progress.missions, m.id));
            if (finished) {
              return (
                <div key={m.id} className="flex items-center justify-between gap-4 rounded-2xl bg-vocab/45 p-5 shadow-soft">
                  <div>
                    <p className="text-lg font-extrabold">{m.title}</p>
                    <p className="text-sm font-semibold">{m.titleEs}</p>
                    <p className="text-sm text-muted-foreground">{m.goal}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> Completada · ya no se puede repetir</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-extrabold text-vocab-strong shadow-soft">✓ Hecha</span>
                </div>
              );
            }
            return (
              <Link
                key={m.id}
                to="/mission/$id"
                params={{ id: m.id }}
                className="group flex items-center justify-between gap-4 rounded-2xl bg-phrase/70 p-5 shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <div>
                  <p className="text-lg font-extrabold">{m.title}</p>
                  <p className="text-sm font-semibold">{m.titleEs}</p>
                  <p className="text-sm text-muted-foreground">{m.goal}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs font-semibold"><Clock className="h-3.5 w-3.5" /> {m.minutes} min · {m.words.length} palabras</p>
                </div>
                <span className="font-bold text-primary-strong">Empezar →</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
