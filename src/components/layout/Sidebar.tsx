import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  Home,
  Layers,
  Lock,
  LogOut,
  Mail,
  Menu,
  Settings2,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import logo from "@/assets/yesod-logo.png.asset.json";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type TranslationKey } from "@/lib/i18n";

type NavLabel = TranslationKey | "nav.exclusive" | "nav.siteSettings";

const customLabels = {
  "nav.exclusive": {
    pt: "Conteúdos exclusivos",
    en: "Exclusive content",
    es: "Contenidos exclusivos",
  },
  "nav.siteSettings": {
    pt: "Editar página inicial",
    en: "Edit home page",
    es: "Editar página inicial",
  },
} as const;

const signOutLabels = {
  pt: "Sair",
  en: "Sign out",
  es: "Salir",
} as const;

const items: Array<{
  to:
    | "/"
    | "/hub"
    | "/projetos"
    | "/servicos"
    | "/produtos"
    | "/meu-espaco"
    | "/configuracoes-site"
    | "/contato";
  label: NavLabel;
  icon: typeof Home;
  active?: boolean;
  adminOnly?: boolean;
}> = [
  { to: "/", label: "nav.home", icon: Home },
  { to: "/hub", label: "nav.hub", icon: Users },
  { to: "/projetos", label: "nav.projects", icon: Layers },
  { to: "/servicos", label: "nav.services", icon: Sparkles },
  { to: "/produtos", label: "nav.products", icon: Boxes },
  { to: "/meu-espaco", label: "nav.exclusive", icon: Lock, active: false },
  { to: "/meu-espaco", label: "nav.members", icon: UserRound },
  { to: "/configuracoes-site", label: "nav.siteSettings", icon: Settings2, adminOnly: true },
  { to: "/contato", label: "nav.contact", icon: Mail },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user);
  const { t, lang } = useI18n();
  const [signingOut, setSigningOut] = useState(false);
  const visibleItems = items.filter((item) => !item.adminOnly || isAdmin);

  function labelFor(label: NavLabel) {
    if (label in customLabels) return customLabels[label as keyof typeof customLabels][lang];
    return t(label as TranslationKey);
  }

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setSigningOut(false);
    if (error) return;
    onNavigate?.();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex h-full flex-col bg-navy text-white">
      <Link
        to="/"
        onClick={onNavigate}
        className="mx-5 mt-7 flex items-center rounded-xl bg-white px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img src={logo.url} alt="YESOD Automation" className="h-7 w-auto" />
      </Link>

      <nav className="mt-10 flex flex-1 flex-col gap-1 px-4" aria-label={t("nav.navigation")}>
        {visibleItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: item.to === "/" }}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            activeProps={{ className: item.active === false ? "" : "bg-white/15 text-white" }}
          >
            <item.icon className="h-[17px] w-[17px]" strokeWidth={1.8} aria-hidden="true" />
            {labelFor(item.label)}
          </Link>
        ))}
      </nav>

      <div className="space-y-4 border-t border-white/10 p-4">
        <LanguageSwitcher />
        {user ? (
          <div className="grid gap-2">
            <Button asChild className="w-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white" variant="outline">
              <Link to="/meu-espaco" onClick={onNavigate}>
                {t("nav.mySpace")}
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-white/70 hover:bg-white/10 hover:text-white"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              {signOutLabels[lang]}
            </Button>
          </div>
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
      <aside className="fixed inset-y-4 left-4 z-40 hidden w-60 overflow-hidden rounded-2xl border border-white/10 shadow-lift lg:block">
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
