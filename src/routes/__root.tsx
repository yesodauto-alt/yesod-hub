import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { GlobalVisualEditor } from "@/components/admin/global-visual-editor";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";
import { PwaInstallPrompt } from "@/components/layout/PwaInstallPrompt";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { I18nProvider } from "@/lib/i18n";

type RootLang = "pt" | "en" | "es";

const rootCopy: Record<RootLang, Record<string, string>> = {
  pt: {
    notFound: "Página não encontrada",
    notFoundText: "A página que você procura não existe ou foi movida.",
    backHome: "Voltar para o início",
    errorTitle: "Esta página não carregou",
    errorText: "Algo deu errado. Tente novamente ou volte para o início.",
    retry: "Tentar novamente",
  },
  en: {
    notFound: "Page not found",
    notFoundText: "The page you are looking for does not exist or has been moved.",
    backHome: "Back to home",
    errorTitle: "This page could not load",
    errorText: "Something went wrong. Please try again or return home.",
    retry: "Try again",
  },
  es: {
    notFound: "Página no encontrada",
    notFoundText: "La página que buscas no existe o fue movida.",
    backHome: "Volver al inicio",
    errorTitle: "Esta página no pudo cargar",
    errorText: "Algo salió mal. Inténtalo de nuevo o vuelve al inicio.",
    retry: "Intentar de nuevo",
  },
};

function useRootCopy() {
  const [lang, setLang] = useState<RootLang>("pt");
  useEffect(() => {
    const stored = window.localStorage.getItem("yesod-lang");
    if (stored === "en" || stored === "es") setLang(stored);
  }, []);
  return rootCopy[lang];
}

function NotFoundComponent() {
  const copy = useRootCopy();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">404</p>
        <h1 className="mt-4 text-3xl text-foreground">{copy["notFound"]}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy["notFoundText"]}</p>
        <Link
          to="/"
          className="mt-7 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-deep"
        >
          {copy["backHome"]}
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const copy = useRootCopy();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-md rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
        <h1 className="text-2xl text-foreground">{copy["errorTitle"]}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy["errorText"]}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-deep"
          >
            {copy["retry"]}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            {copy["backHome"]}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#070708" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "YESOD HUB" },
      { title: "Yesod HUB — automação e escala com inteligência artificial" },
      {
        name: "description",
        content:
          "Yesod HUB: conteúdo, projetos e área de membros para transformar processos manuais em operações automatizadas com inteligência artificial.",
      },
      { name: "author", content: "YESOD" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Yesod HUB" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: `${appCss}?v=20260809-icons-v2` },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <Sidebar />
        <div data-editable-site className="flex min-h-screen flex-col lg:pl-[17rem]">
          <main className="flex-1"><Outlet /></main>
          <Footer />
        </div>
        <WhatsAppFloatingButton />
        <PwaInstallPrompt />
        <GlobalVisualEditor />
        <Toaster />
      </I18nProvider>
    </QueryClientProvider>
  );
}
