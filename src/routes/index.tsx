import { createFileRoute, Link } from "@tanstack/react-router";
import { Ear, Image, MessageCircle, Map } from "lucide-react";
import world from "@/assets/world-map.jpg";
import { COMPANIONS } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "English Start — Tu mundo. Tu ritmo. Tu inglés." },
      { name: "description", content: "Aprende inglés desde cero explorando un mundo virtual con personajes y misiones de la vida diaria." },
      { property: "og:title", content: "English Start — Aprende inglés viviéndolo" },
      { property: "og:description", content: "Explora tu casa, la cafetería y más. Misiones cortas, sin teoría pesada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { icon: Ear, title: "Escucha", text: "Oye cada palabra antes de memorizarla.", tone: "bg-audio" },
  { icon: Image, title: "Relaciona", text: "Toca objetos reales del mundo y aprende su nombre.", tone: "bg-vocab" },
  { icon: MessageCircle, title: "Construye", text: "Arma frases útiles para tu día a día.", tone: "bg-phrase" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-sky">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <Button asChild variant="soft"><Link to="/auth">Entrar</Link></Button>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="mb-4 inline-block rounded-full bg-phrase px-3 py-1 text-sm font-bold">Tu mundo. Tu ritmo. Tu inglés.</p>
          <h1 className="text-5xl leading-[1.05] md:text-6xl">Aprende inglés viviéndolo, no memorizándolo.</h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Entra a un mundo ilustrado, explora lugares cotidianos y completa misiones de 5 a 10 minutos. Desde cero.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg"><Link to="/auth">Comenzar gratis</Link></Button>
          </div>
        </div>
        <div className="relative">
          <img src={world} alt="Mundo virtual de English Start" width={1600} height={1008} className="rounded-[2rem] shadow-lift" />
          <div className="absolute -bottom-6 left-6 flex items-center gap-2 rounded-2xl bg-card px-4 py-2 shadow-soft">
            <Map className="h-5 w-5 text-primary-strong" />
            <span className="text-sm font-bold">8 lugares para explorar</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text, tone }) => (
            <div key={title} className="rounded-3xl bg-card p-6 shadow-soft">
              <div className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></div>
              <h3 className="text-xl">{title}</h3>
              <p className="mt-1 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 text-center">
        <h2 className="text-3xl">Elige a tu compañero de viaje</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Object.values(COMPANIONS).map((c) => (
            <div key={c.id} className="flex flex-col items-center rounded-3xl bg-character/50 p-5">
              <img src={c.image} alt={c.name} loading="lazy" className="h-40 w-auto animate-float" />
              <p className="mt-3 text-lg font-extrabold">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.trait}</p>
            </div>
          ))}
        </div>
        <Button asChild variant="hero" size="lg" className="mt-10"><Link to="/auth">Entrar al mundo</Link></Button>
      </section>
      <footer className="py-8 text-center text-sm text-muted-foreground">© English Start</footer>
    </div>
  );
}
