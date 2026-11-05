import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { COMPANIONS, type CompanionId } from "@/lib/content";
import { profileQuery } from "@/lib/progress";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{"title": "Perfil — English Start"}, {"name": "description", "content": "Consulta tu perfil de aprendizaje y tu compañero en English Start."}, {"property": "og:title", "content": "Perfil — English Start"}, {"property": "og:description", "content": "Consulta tu perfil de aprendizaje y tu compañero en English Start."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: Profile,
});

function Profile() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const c = COMPANIONS[(profile?.companion as CompanionId) ?? "fox"];

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <AppShell>
      <h1 className="text-3xl">Perfil</h1>
      <div className="mt-6 flex items-center gap-5 rounded-3xl bg-card p-6 shadow-soft">
        <img src={c.image} alt={c.name} className="h-24 w-auto" />
        <div className="flex-1">
          <p className="text-xl font-extrabold">{profile?.display_name}</p>
          <p className="text-muted-foreground">Compañero: {c.name} · Nivel: principiante</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="soft" size="lg"><Link to="/companion">Cambiar compañero</Link></Button>
        <Button variant="outline" size="lg" className="rounded-full" onClick={signOut}>Cerrar sesión</Button>
      </div>
    </AppShell>
  );
}
