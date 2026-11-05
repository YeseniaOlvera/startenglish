import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Flame, BookOpen, Trophy } from "lucide-react";
import { AppShell, ComingSoon } from "@/components/AppShell";
import { COMPANIONS, MISSIONS, WORDS, type CompanionId } from "@/lib/content";
import { profileQuery, progressQuery } from "@/lib/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{"title": "Mi panel — English Start"}, {"name": "description", "content": "Consulta tu progreso y continúa tus misiones de inglés en English Start."}, {"property": "og:title", "content": "Mi panel — English Start"}, {"property": "og:description", "content": "Consulta tu progreso y continúa tus misiones de inglés en English Start."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  loader: async ({ context }) => {
    const profile = await context.queryClient.ensureQueryData(profileQuery);
    if (!profile?.onboarded) throw redirect({ to: "/welcome" });
    await context.queryClient.ensureQueryData(progressQuery);
  },
  component: Dashboard,
});

function Dashboard() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: progress } = useSuspenseQuery(progressQuery);
  const companion = COMPANIONS[(profile?.companion as CompanionId) ?? "fox"];
  const done = new Set(progress.missions.map((m) => m.mission_id));
  const next = MISSIONS.find((m) => !done.has(m.id));
  const wordCount = new Set(progress.words.map((w) => WORDS[w.word_id]?.en ?? w.word_id)).size;

  const stats = [
    { icon: Flame, label: "Días seguidos", value: progress.streak, tone: "bg-character" },
    { icon: BookOpen, label: "Palabras vistas", value: wordCount, tone: "bg-vocab" },
    { icon: Trophy, label: "Misiones", value: `${done.size}/${MISSIONS.length}`, tone: "bg-phrase" },
  ];

  return (
    <AppShell>
      <div className="flex items-center gap-5 rounded-3xl bg-card p-6 shadow-soft">
        <img src={companion.image} alt={companion.name} className="h-28 w-auto animate-float" />
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{companion.name} dice:</p>
          <h1 className="text-2xl md:text-3xl">Hi, {profile?.display_name ?? "friend"}! Ready?</h1>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className="rounded-2xl bg-card p-4 shadow-soft">
            <div className={`mb-2 grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-xl">Siguiente misión</h2>
        {next ? (
          <div className="flex flex-col gap-4 rounded-3xl bg-phrase/70 p-6 shadow-soft md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{next.location === "home" ? "My Home" : "The Coffee Shop"} · {next.minutes} min</p>
              <p className="text-2xl font-extrabold">{next.title}</p>
              <p className="text-muted-foreground">{next.goal}</p>
            </div>
            <Button asChild variant="hero" size="lg"><Link to="/mission/$id" params={{ id: next.id }}>Comenzar</Link></Button>
          </div>
        ) : (
          <div className="rounded-3xl bg-vocab/70 p-6 font-semibold">¡Completaste todas las misiones disponibles! Pronto se abrirán nuevos lugares.</div>
        )}
      </section>

      <section className="mt-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Explora</h2>
          <Link to="/world" className="font-bold text-primary-strong">Ver mapa →</Link>
        </div>
        <ComingSoon label="Conversar con tu compañero (IA)" />
        <ComingSoon label="Practicar pronunciación con micrófono" />
      </section>
    </AppShell>
  );
}
