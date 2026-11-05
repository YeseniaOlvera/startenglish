import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function GameShell({ title, titleEs, step, total, children }: { title: string; titleEs: string; step: number; total: number; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/games" className="rounded-full bg-card px-3 py-1.5 text-sm font-bold shadow-soft">✕ Salir</Link>
        <div className="h-3 flex-1 overflow-hidden rounded-full border bg-card">
          <div className="h-full bg-primary-strong transition-all" style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <span className="text-sm font-bold">{step}/{total}</span>
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl">{title}</h1>
        <p className="text-muted-foreground">{titleEs}</p>
      </div>
      {children}
    </div>
  );
}

export function GameDone({ score, total, onAgain }: { score: number; total: number; onAgain: () => void }) {
  return (
    <div className="space-y-4 rounded-3xl bg-vocab/60 p-8 text-center shadow-soft">
      <p className="text-6xl">🎉</p>
      <p className="text-2xl font-extrabold">Great job!</p>
      <p className="font-semibold">¡Muy bien! Acertaste {score} de {total} al primer intento.</p>
      <div className="flex justify-center gap-3">
        <Button variant="hero" onClick={onAgain}>Jugar otra vez</Button>
        <Button asChild variant="outline"><Link to="/games">Otros juegos</Link></Button>
      </div>
    </div>
  );
}
