import { Link, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  Home,
  Layers,
  Mail,
  Menu,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import logo from "@/assets/yesod-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/comunidade", label: "Comunidade", icon: Users },
  { to: "/projetos", label: "Projetos", icon: Layers },
  { to: "/servicos", label: "Serviços", icon: Sparkles },
  { to: "/produtos", label: "Produtos", icon: Boxes },
  { to: "/meu-espaco", label: "Área de membros", icon: UserRound },
  { to: "/contato", label: "Contato", icon: Mail },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        onClick={onNavigate}
        className="mx-4 mt-6 flex items-center justify-center rounded-2xl bg-white px-4 py-3 shadow-soft transition-transform hover:scale-[1.02]"
      >
        <img src={logo.url} alt="YESOD — automação e escala com IA" className="h-7 w-auto" />
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: item.to === "/" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition-all duration-200 hover:bg-white/10 hover:text-white"
            activeProps={{ className: "bg-white/12 text-white" }}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4">
        {user ? (
          <Button asChild variant="secondary" className="w-full">
            <Link to="/meu-espaco" onClick={onNavigate}>
              Meu espaço
            </Link>
          </Button>
        ) : (
          <div className="space-y-2">
            <Button asChild variant="secondary" className="w-full">
              <Link to="/auth" search={{ modo: "cadastro" }} onClick={onNavigate}>
                Criar conta
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/auth" onClick={onNavigate}>
                Entrar
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-brand-gradient lg:flex">
        <NavList />
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between bg-brand-gradient px-4 py-3 lg:hidden">
        <Link to="/" className="flex items-center rounded-xl bg-white px-3 py-2">
          <img src={logo.url} alt="YESOD" className="h-5 w-auto" />
        </Link>
        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="rounded-xl border border-white/20 p-2 text-white transition-colors hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy-deep/70 backdrop-blur-sm"
          />
          <div className="animate-in slide-in-from-left absolute inset-y-0 left-0 flex w-72 flex-col bg-brand-gradient duration-200">
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
