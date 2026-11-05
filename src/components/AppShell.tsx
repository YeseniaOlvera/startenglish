import { Link } from "@tanstack/react-router";
import { Home, Map, User } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/world", label: "Mundo", icon: Map },
  { to: "/profile", label: "Perfil", icon: User },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-lg font-extrabold">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">E</span>
      English Start
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-sky pb-24 md:pb-0 md:pl-60">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-8 border-r bg-card p-6 md:flex">
        <Logo />
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-muted-foreground hover:bg-accent"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              <Icon className="h-5 w-5" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t bg-card py-2 md:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs font-semibold text-muted-foreground"
            activeProps={{ className: "text-primary-strong" }}
          >
            <Icon className="h-5 w-5" /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed bg-card/60 p-4 text-sm">
      <span className="font-semibold text-muted-foreground">{label}</span>
      <span className="rounded-full bg-audio px-2.5 py-0.5 text-xs font-bold">Próximamente</span>
    </div>
  );
}
