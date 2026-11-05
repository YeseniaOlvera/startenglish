import { createFileRoute } from "@tanstack/react-router";
import img from "@/assets/scene-coffee.jpg";
import { AppShell } from "@/components/AppShell";
import { Scene } from "@/components/Scene";
import { profileQuery, progressQuery } from "@/lib/progress";

export const Route = createFileRoute("/_authenticated/world/coffee-shop")({
  head: () => ({ meta: [{"title": "The Coffee Shop — English Start"}, {"name": "description", "content": "Practica inglés y español en la cafetería con palabras, frases y misiones de English Start."}, {"property": "og:title", "content": "The Coffee Shop — English Start"}, {"property": "og:description", "content": "Practica inglés y español en la cafetería con palabras, frases y misiones de English Start."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(profileQuery), context.queryClient.ensureQueryData(progressQuery)]),
  component: () => (
    <AppShell>
      <Scene location="coffee-shop" title="The Coffee Shop" image={img} intro="Mmm, coffee! Tap the dots to learn café words." introEs="¡Mmm, café! Toca los puntos para aprender palabras de la cafetería." />
    </AppShell>
  ),
});
