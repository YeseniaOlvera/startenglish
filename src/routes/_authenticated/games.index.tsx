import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GAMES } from "@/lib/games";

export const Route = createFileRoute("/_authenticated/games/")({
  head: () => ({ meta: [{ title: "Juegos — English Start" }, { name: "description", content: "Practica tus palabras en inglés con juegos: busca la sombra, memorama y deletrea." }, { property: "og:title", content: "Juegos — English Start" }, { property: "og:description", content: "Practica tus palabras en inglés con juegos divertidos." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Games,
});

function Games() {
  return (
    <AppShell>
      <h1 className="text-3xl md:text-4xl">Games · Juegos</h1>
      <p className="mb-6 text-muted-foreground">Repasa las palabras que aprendiste. Puedes jugar las veces que quieras.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {GAMES.map((g) => (
          <Link key={g.id} to={g.to} className="rounded-3xl bg-card p-6 shadow-soft transition-transform hover:-translate-y-1">
            <p className="text-5xl">{g.emoji}</p>
            <p className="mt-3 text-xl font-extrabold">{g.title}</p>
            <p className="text-sm font-semibold">{g.titleEs}</p>
            <p className="mt-2 text-sm text-muted-foreground">{g.desc}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
