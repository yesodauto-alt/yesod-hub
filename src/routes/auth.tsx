import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/yesod-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, useLocalizedMeta } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { modo?: "cadastro" | "login" } =>
    search.modo === "cadastro" ? { modo: "cadastro" } : {},
  head: () => ({
    meta: [
      { title: "Entrar no Yesod HUB — área de membros" },
      {
        name: "description",
        content: "Acesse sua conta ou cadastre-se para participar do Yesod HUB e ver o conteúdo exclusivo.",
      },
      { property: "og:title", content: "Área de membros do Yesod HUB" },
      {
        property: "og:description",
        content: "Entre ou crie sua conta para acessar o conteúdo exclusivo da YESOD.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "cadastro">(modo ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  useLocalizedMeta("meta.auth.title", "meta.auth.desc");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "cadastro") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, company },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success(t("auth.created"));
          navigate({ to: "/meu-espaco" });
        } else {
          toast.success(t("auth.confirmEmail"));
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.welcomeBack"));
        navigate({ to: "/meu-espaco" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("auth.failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
      <section className="hidden lg:block">
        <img src={logo.url} alt="YESOD Automation" className="h-8 w-auto" />
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {t("brand.tagline")}
        </p>
        <h1 className="mt-5 max-w-md text-4xl leading-tight">{t("brand.hub")}</h1>
        <p className="mt-5 max-w-md leading-7 text-muted-foreground">{t("auth.subtitle")}</p>
      </section>

      <section className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="text-center lg:text-left">
          <img src={logo.url} alt="YESOD Automation" className="mx-auto h-7 w-auto lg:hidden" />
          <h1 className="mt-6 text-2xl lg:mt-0">
            {mode === "cadastro" ? t("auth.signupTitle") : t("auth.loginTitle")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("auth.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {mode === "cadastro" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{t("auth.fullName")}</Label>
                <Input id="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">{t("auth.company")}</Label>
                <Input id="company" value={company} onChange={(event) => setCompany(event.target.value)} />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "cadastro" ? "new-password" : "current-password"}
              minLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? t("auth.wait") : mode === "cadastro" ? t("auth.createAccount") : t("auth.signin")}
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "cadastro" ? "login" : "cadastro")}
            className="w-full rounded-lg px-3 py-2 text-center text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {mode === "cadastro" ? t("auth.haveAccount") : t("auth.noAccount")}
          </button>
        </form>
      </section>
    </div>
  );
}
