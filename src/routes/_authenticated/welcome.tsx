import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import world from "@/assets/world-map.jpg";
import { COMPANIONS } from "@/lib/content";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/welcome")({
  head: () => ({ meta: [{ title: "Bienvenida — English Start" }] }),
  component: Welcome,
});

const SLIDES = [
  { title: "Welcome! Bienvenido", text: "Aquí no estudias inglés: lo vives. Explora lugares de la vida diaria." },
  { title: "Listen first", text: "Primero escuchas, luego relacionas con imágenes y al final construyes frases." },
  { title: "No pressure", text: "Los errores son parte del camino. Puedes intentar de nuevo cuantas veces quieras." },
];

function Welcome() {
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-sky px-6 py-10 text-center">
      {i === 0 ? (
        <img src={world} alt="" width={1600} height={1008} className="w-full max-w-xl rounded-3xl shadow-lift" />
      ) : (
        <img src={i === 1 ? COMPANIONS.pip.image : COMPANIONS.leo.image} alt="" className="h-56 w-auto animate-float" />
      )}
      <div className="max-w-md">
        <h1 className="text-4xl">{s.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{s.text}</p>
      </div>
      <div className="flex gap-2">
        {SLIDES.map((_, k) => (
          <span key={k} className={`h-2 rounded-full transition-all ${k === i ? "w-8 bg-primary-strong" : "w-2 bg-border"}`} />
        ))}
      </div>
      {i < SLIDES.length - 1 ? (
        <Button variant="hero" size="lg" onClick={() => setI(i + 1)}>Continuar</Button>
      ) : (
        <Button asChild variant="hero" size="lg"><Link to="/companion">Elegir compañero</Link></Button>
      )}
    </div>
  );
}
