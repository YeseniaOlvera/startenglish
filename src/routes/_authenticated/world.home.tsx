import { createFileRoute } from "@tanstack/react-router";
import img from "@/assets/scene-home.jpg";
import { AppShell } from "@/components/AppShell";
import { Scene } from "@/components/Scene";
import { profileQuery, progressQuery } from "@/lib/progress";

export const Route = createFileRoute("/_authenticated/world/home")({
  head: () => ({ meta: [{"title": "My Home — English Start"}, {"name": "description", "content": "Aprende palabras y frases en inglés con traducciones al español explorando tu casa en English Start."}, {"property": "og:title", "content": "My Home — English Start"}, {"property": "og:description", "content": "Aprende palabras y frases en inglés con traducciones al español explorando tu casa en English Start."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(profileQuery), context.queryClient.ensureQueryData(progressQuery)]),
  component: () => (
    <AppShell>
      <Scene location="home" title="My Home" image={img} intro="Welcome home! Tap the dots to hear the name of each thing." introEs="¡Bienvenido a casa! Toca los puntos para escuchar el nombre de cada cosa." />
    </AppShell>
  ),
});
