import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, GraduationCap, LogOut, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/meu-espaco")({
  head: () => ({
    meta: [
      { title: "Meu espaço — Comunidade YESOD" },
      {
        name: "description",
        content:
          "Área exclusiva de membros da Comunidade YESOD: seu perfil e conteúdos reservados.",
      },
      { property: "og:title", content: "Meu espaço — Comunidade YESOD" },
      {
        property: "og:description",
        content: "Área exclusiva de membros da Comunidade YESOD.",
      },
    ],
  }),
  component: MeuEspaco,
});

const exclusives = [
  {
    icon: BookOpen,
    title: "Guia de preflight YESOD",
    description: "Checklist completo de verificação de arquivos antes da produção.",
  },
  {
    icon: Wrench,
    title: "Presets de correção",
    description: "Configurações recomendadas por tipo de material e acabamento.",
  },
  {
    icon: GraduationCap,
    title: "Trilha de pré-impressão",
    description: "Materiais de estudo para padronizar a rotina do seu setor.",
  },
];

function MeuEspaco() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada.");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, company")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return { email: auth.user.email ?? "", id: auth.user.id, ...(data ?? {}) };
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      setFullName(profileQuery.data.full_name ?? "");
      setCompany(profileQuery.data.company ?? "");
    }
  }, [profileQuery.data]);

  async function saveProfile() {
    if (!profileQuery.data) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: profileQuery.data.id, full_name: fullName, company });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Perfil atualizado!");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold">Meu espaço</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profileQuery.data?.email ?? "Carregando…"}
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="shrink-0">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </header>

      <Card className="mt-8">
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">Meu perfil</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Nome</Label>
            <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-name">Empresa</Label>
            <Input id="company-name" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? "Salvando…" : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Conteúdo exclusivo</h2>
        <p className="mt-2 text-muted-foreground">
          Materiais disponíveis apenas para membros da Comunidade YESOD.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exclusives.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
