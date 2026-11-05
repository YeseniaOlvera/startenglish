import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/AppShell";
import { COMPANIONS } from "@/lib/content";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — English Start" },
      { name: "description", content: "Crea tu cuenta o inicia sesión en English Start." },
      { property: "og:title", content: "Entrar — English Start" },
      { property: "og:description", content: "Crea tu cuenta y entra al mundo de English Start." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { display_name: name } },
        });
        if (error) throw error;
        if (!data.session) setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("No se pudo iniciar con Google");
  };

  return (
    <div className="grid min-h-screen bg-sky md:grid-cols-2">
      <div className="hidden flex-col items-center justify-center gap-6 bg-character/40 p-10 md:flex">
        <img src={COMPANIONS.mia.image} alt="Mia" className="h-80 w-auto animate-float" />
        <p className="max-w-xs text-center text-xl font-bold">“Hi! Nice to meet you. Ready to start?”</p>
      </div>
      <div className="flex flex-col justify-center px-6 py-10">
        <div className="mx-auto w-full max-w-sm">
          <Logo />
          {sent ? (
            <div className="mt-10 rounded-3xl bg-card p-6 shadow-soft">
              <h1 className="text-2xl">Revisa tu correo</h1>
              <p className="mt-2 text-muted-foreground">Te enviamos un enlace a <b>{email}</b> para confirmar tu cuenta.</p>
            </div>
          ) : (
            <>
              <h1 className="mt-10 text-3xl">{mode === "signup" ? "Crea tu cuenta" : "Bienvenido de nuevo"}</h1>
              <form onSubmit={submit} className="mt-6 space-y-3">
                {mode === "signup" && (
                  <Input placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 rounded-xl bg-card" />
                )}
                <Input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl bg-card" />
                <Input type="password" placeholder="Contraseña (mín. 6)" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl bg-card" />
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
                  {mode === "signup" ? "Crear cuenta" : "Entrar"}
                </Button>
              </form>
              <Button variant="soft" size="lg" className="mt-3 w-full" onClick={google}>Continuar con Google</Button>
              <button
                className="mt-6 w-full text-sm font-semibold text-primary-strong"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              >
                {mode === "signup" ? "¿Ya tienes cuenta? Inicia sesión" : "¿Nuevo aquí? Crea una cuenta"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
