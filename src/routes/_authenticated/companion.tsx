import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { COMPANIONS, type CompanionId } from "@/lib/content";
import { profileQuery, updateProfile } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/companion")({
  head: () => ({ meta: [{ title: "Elige tu compañero — English Start" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: CompanionPage,
});

function CompanionPage() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [sel, setSel] = useState<CompanionId>((profile?.companion as CompanionId) ?? "fox");
  const [busy, setBusy] = useState(false);

  const pick = (id: CompanionId) => {
    setSel(id);
    speak(COMPANIONS[id].greeting);
  };

  const save = async () => {
    setBusy(true);
    try {
      await updateProfile({ companion: sel, onboarded: true });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("No se pudo guardar. Intenta de nuevo.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky px-5 py-10">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl">¿Quién te acompaña?</h1>
        <p className="mt-2 text-muted-foreground">Puedes cambiarlo cuando quieras desde tu perfil.</p>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Object.values(COMPANIONS).map((c) => (
            <button
              key={c.id}
              onClick={() => pick(c.id)}
              aria-pressed={sel === c.id}
              className={`flex flex-col items-center rounded-3xl p-5 transition-all ${sel === c.id ? "bg-character shadow-lift ring-4 ring-character-strong/40" : "bg-card shadow-soft hover:-translate-y-1"}`}
            >
              <img src={c.image} alt={c.name} className="h-40 w-auto" />
              <p className="mt-3 text-xl font-extrabold">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.trait}</p>
            </button>
          ))}
        </div>
        <p className="mt-8 text-lg font-semibold">“{COMPANIONS[sel].greeting}”</p>
        <Button variant="hero" size="lg" className="mt-6" onClick={save} disabled={busy}>
          Ir con {COMPANIONS[sel].name}
        </Button>
      </div>
    </div>
  );
}
