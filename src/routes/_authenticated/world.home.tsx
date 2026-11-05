import { createFileRoute } from "@tanstack/react-router";
import img from "@/assets/scene-home.jpg";
import { AppShell } from "@/components/AppShell";
import { Scene } from "@/components/Scene";
import { profileQuery, progressQuery } from "@/lib/progress";

export const Route = createFileRoute("/_authenticated/world/home")({
  head: () => ({ meta: [{ title: "My Home — English Start" }] }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(profileQuery), context.queryClient.ensureQueryData(progressQuery)]),
  component: () => (
    <AppShell>
      <Scene location="home" title="My Home" image={img} intro="Welcome home! Tap the dots to hear the name of each thing." introEs="¡Bienvenido a casa! Toca los puntos para escuchar el nombre de cada cosa." />
    </AppShell>
  ),
});
