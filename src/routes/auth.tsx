import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/yesod-logo.png.asset.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { modo?: "cadastro" | "login" } =>
    search['modo'] === "cadastro" ? { modo: "cadastro" } : {},
  head: () => ({
    meta: [
      { title: "Entrar na Comunidade YESOD — área de membros" },
      {
        name: "description",
        content:
          "Acesse sua conta ou cadastre-se para participar da Comunidade YESOD e ver o conteúdo exclusivo.",
      },
      { property: "og:title", content: "Área de membros da Comunidade YESOD" },
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
  const [mode, setMode] = useState<"login" | "cadastro">(modo ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          toast.success("Conta criada! Bem-vindo à comunidade.");
          navigate({ to: "/meu-espaco" });
        } else {
          toast.success("Conta criada! Confirme seu e-mail para acessar.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate({ to: "/meu-espaco" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 shadow-soft">
          <img src={logo.url} alt="YESOD Automation" className="h-7 w-auto" />
        </span>
        <h1 className="mt-6 text-2xl font-bold">
          {mode === "cadastro" ? "Criar sua conta" : "Entrar na comunidade"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesso ao feed, conteúdo exclusivo e suporte da YESOD.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
        {mode === "cadastro" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Aguarde…" : mode === "cadastro" ? "Criar conta" : "Entrar"}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "cadastro" ? "login" : "cadastro")}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "cadastro"
            ? "Já tenho conta — quero entrar"
            : "Ainda não tenho conta — quero me cadastrar"}
        </button>
      </form>
    </div>
  );
}
