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
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useAuth, useCanManageExclusiveContent, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/yesod";

type NavLabel = TranslationKey | "nav.exclusive" | "nav.siteSettings" | "nav.contentCenter" | "nav.solutions" | "nav.adminContent" | "nav.adminMembers" | "nav.adminProjects";

const customLabels = {
  "nav.contentCenter": { pt: "Central de Conteúdo", en: "Content Center", es: "Central de Contenido" },
  "nav.solutions": { pt: "Soluções", en: "Solutions", es: "Soluciones" },
  "nav.exclusive": {
    pt: "Biblioteca de membros",
    en: "Members library",
    es: "Biblioteca de miembros",
  },
  "nav.siteSettings": {
    pt: "Editar página inicial",
    en: "Edit home page",
    es: "Editar página inicial",
  },
  "nav.adminContent": { pt: "Gerenciar conteúdos", en: "Manage content", es: "Gestionar contenido" },
  "nav.adminMembers": { pt: "Gerenciar membros", en: "Manage members", es: "Gestionar miembros" },
  "nav.adminProjects": { pt: "Gerenciar projetos", en: "Manage projects", es: "Gestionar proyectos" },
} as const;

const signOutLabels = {
  pt: "Sair",
  en: "Sign out",
  es: "Salir",
} as const;

const publicItems: Array<{
  to: "/" | "/hub" | "/projetos" | "/servicos" | "/produtos" | "/contato";
  label: NavLabel;
  icon: typeof Home;
  active?: boolean;
}> = [
  { to: "/", label: "nav.home", icon: Home },
  { to: "/hub", label: "nav.contentCenter", icon: Users },
  { to: "/projetos", label: "nav.projects", icon: Layers },
  { to: "/produtos", label: "nav.solutions", icon: Boxes },
  { to: "/contato", label: "nav.contact", icon: Mail },
];

const memberItems = [
  { to: "/conteudos-exclusivos", label: "nav.exclusive", icon: Lock },
  { to: "/meu-espaco", label: "nav.mySpace", icon: UserRound },
] as const;

const editorialAdminItems = [
  { to: "/gerenciar-conteudos", label: "nav.adminContent", icon: Lock },
] as const;

const adminItems = [
  { to: "/gerenciar-projetos", label: "nav.adminProjects", icon: Layers },
  { to: "/admin-membros", label: "nav.adminMembers", icon: Users },
  { to: "/configuracoes-site", label: "nav.siteSettings", icon: Settings2 },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user);
  const canManageContent = useCanManageExclusiveContent(user);
  const { t, lang } = useI18n();
  const [signingOut, setSigningOut] = useState(false);
  const navSections = [
    ...publicItems.map((item) => ({ ...item, section: "" })),
    ...(user
      ? memberItems.map((item, index) => ({ ...item, section: index === 0 ? "members" : "" }))
      : [{ to: "/auth" as const, label: "nav.members" as const, icon: UserRound, section: "" }]),
    ...(user && canManageContent ? editorialAdminItems.map((item, index) => ({ ...item, section: index === 0 ? "admin" : "" })) : []),
    ...(user && isAdmin ? adminItems.map((item, index) => ({ ...item, section: index === 0 && !canManageContent ? "admin" : "" })) : []),
  ];

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
        className="brand-logo-shell sidebar-brain-brand mx-5 mt-7 flex items-center justify-center rounded-2xl px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="YESOD"
      >
        <img src="/yesod-brain-mark.svg" alt="" className="h-12 w-12 object-contain" />
      </Link>

      <nav className="mt-10 flex flex-1 flex-col gap-1 px-4" aria-label={t("nav.navigation")}>
        {navSections.map((item, index) => (
          <div key={`${item.to}-${index}`}>
            {item.section && (
              <p className="mb-1 mt-3 border-t border-white/10 px-3 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                {item.section === "admin" ? (lang === "en" ? "Administration" : lang === "es" ? "Administración" : "Administração") : (lang === "en" ? "Members" : lang === "es" ? "Miembros" : "Membros")}
              </p>
            )}
            <Link
              to={item.to}
              onClick={onNavigate}
              activeOptions={{ exact: item.to === "/" }}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              activeProps={{ className: "bg-white/15 text-white" }}
            >
              <span className="yesod-nav-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-md"><item.icon className="h-[17px] w-[17px]" strokeWidth={1.8} aria-hidden="true" /></span>
              {labelFor(item.label)}
            </Link>
          </div>
        ))}
      </nav>

      <div className="space-y-4 border-t border-white/10 p-4">
        <Button asChild className="w-full bg-[#e86f22] text-white hover:bg-[#cf5c16]">
          <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">{lang === "pt" ? "Falar com a YESOD" : lang === "en" ? "Talk to YESOD" : "Hablar con YESOD"}</a>
        </Button>
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
      <aside className="sidebar-float fixed inset-y-4 left-4 z-40 hidden w-60 overflow-hidden rounded-2xl border border-white/10 shadow-lift lg:block">
        <NavList />
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-3 pl-[max(1rem,env(safe-area-inset-left))] backdrop-blur lg:hidden">
        <Link to="/" className="mobile-brain-mark flex h-11 w-11 items-center justify-center rounded-xl" aria-label="YESOD">
          <img src="/yesod-brain-mark.svg" alt="" className="h-9 w-9 object-contain" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <button
            type="button"
            aria-label={t("nav.openMenu")}
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
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
          <div className="animate-in slide-in-from-left absolute inset-y-0 left-0 flex w-[min(19rem,calc(100vw-env(safe-area-inset-right)))] border-r border-border bg-card pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-lift duration-200">
            <button
              type="button"
              aria-label={t("nav.closeMenu")}
              onClick={() => setOpen(false)}
              className="absolute top-[calc(env(safe-area-inset-top)+0.75rem)] right-[max(0.75rem,env(safe-area-inset-right))] z-10 flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-h-0 flex-1"><NavList onNavigate={() => setOpen(false)} /></div>
          </div>
        </div>
      )}
    </>
  );
}
