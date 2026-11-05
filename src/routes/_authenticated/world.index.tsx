import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import world from "@/assets/world-map.jpg";
import { AppShell } from "@/components/AppShell";
import { LOCATIONS } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/world/")({
  head: () => ({ meta: [{ title: "Mapa del mundo — English Start" }] }),
  component: WorldMap,
});

function WorldMap() {
  return (
    <AppShell>
      <h1 className="text-3xl md:text-4xl">Real Life World</h1>
      <p className="mt-1 text-muted-foreground">Toca un lugar para entrar.</p>
      <div className="relative mt-6 overflow-hidden rounded-3xl shadow-lift">
        <img src={world} alt="Mapa del mundo" width={1600} height={1008} className="w-full" />
        {LOCATIONS.map((l) => {
          const pin = (
            <span className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-extrabold shadow-soft md:text-sm ${l.open ? "bg-card hover:bg-phrase" : "bg-card/75 text-muted-foreground"}`}>
              {!l.open && <Lock className="h-3.5 w-3.5" />} {l.name}
            </span>
          );
          const style = { left: `${l.x}%`, top: `${l.y}%` };
          const cls = "absolute -translate-x-1/2 -translate-y-1/2";
          if (l.id === "home") return <Link key={l.id} to="/world/home" style={style} className={cls}>{pin}</Link>;
          if (l.id === "coffee-shop") return <Link key={l.id} to="/world/coffee-shop" style={style} className={cls}>{pin}</Link>;
          return <span key={l.id} style={style} className={cls} title="Próximamente">{pin}</span>;
        })}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">🔒 Los lugares con candado se abrirán en próximas etapas.</p>
    </AppShell>
  );
}
