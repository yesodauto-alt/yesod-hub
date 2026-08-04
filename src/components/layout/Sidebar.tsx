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
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const items: Array<{
  to: "/" | "/hub" | "/projetos" | "/servicos" | "/produtos" | "/meu-espaco" | "/contato";
  label: TranslationKey;
  icon: typeof Home;
}> = [
  { to: "/", label: "nav.home", icon: Home },
  { to: "/hub", label: "nav.hub", icon: Users },
  { to: "/projetos", label: "nav.projects", icon: Layers },
  { to: "/servicos", label: "nav.services", icon: Sparkles },
  { to: "/produtos", label: "nav.products", icon: Boxes },
  { to: "/meu-espaco", label: "nav.members", icon: UserRound },
  { to: "/contato", label: "nav.contact", icon: Mail },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <div className="flex h-full flex-col bg-card">
      <Link
        to="/"
        onClick={onNavigate}
        className="mx-5 mt-7 flex items-center rounded-lg px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img src={logo.url} alt="YESOD Automation" className="h-7 w-auto" />
      </Link>

      <nav className="mt-10 flex flex-1 flex-col gap-1 px-4" aria-label={t("nav.navigation")}>
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: item.to === "/" }}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            activeProps={{ className: "bg-accent text-primary" }}
          >
            <item.icon className="h-[17px] w-[17px]" strokeWidth={1.8} aria-hidden="true" />
            {t(item.label)}
          </Link>
        ))}
      </nav>

      <div className="space-y-4 border-t border-border p-4">
        <LanguageSwitcher />
        {user ? (
          <Button asChild className="w-full" variant="outline">
            <Link to="/meu-espaco" onClick={onNavigate}>
              {t("nav.mySpace")}
            </Link>
          </Button>
        ) : (
          <div className="grid gap-2">
            <Button asChild className="w-full">
              <Link to="/auth" search={{ modo: "cadastro" }} onClick={onNavigate}>
                {t("nav.signup")}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full text-muted-foreground">
              <Link to="/auth" onClick={onNavigate}>
                {t("nav.signin")}
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
  const { t } = useI18n();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-card lg:block">
        <NavList />
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/" className="flex items-center rounded-md px-1 py-1">
          <img src={logo.url} alt="YESOD" className="h-5 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <button
            type="button"
            aria-label={t("nav.openMenu")}
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="rounded-lg border border-border p-2 text-foreground hover:bg-muted"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t("nav.closeMenu")}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy-deep/35 backdrop-blur-sm"
          />
          <div className="animate-in slide-in-from-left absolute inset-y-0 left-0 w-[19rem] border-r border-border bg-card shadow-lift duration-200">
            <button
              type="button"
              aria-label={t("nav.closeMenu")}
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
