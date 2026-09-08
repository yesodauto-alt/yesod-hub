import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, LockKeyhole } from "lucide-react";

import { ExclusiveContentCenter } from "@/components/admin/exclusive-content-center";
import { OrganizationAccessCenter } from "@/components/admin/organization-access-center";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

type Organization = {
  id: string;
  name: string;
  active: boolean;
};

export const Route = createFileRoute("/_authenticated/conteudo-exclusivo")({
  head: () => ({ meta: [{ title: "Conteúdo exclusivo — Yesod HUB" }] }),
  component: ConteudoExclusivo,
});

function ConteudoExclusivo() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user);

  const organizationsQuery = useQuery({
    queryKey: ["my-organizations", user?.id, isAdmin],
    enabled: Boolean(user) && !isAdmin,
    queryFn: async () => {
      const { data, error } = await db
        .from("organizations")
        .select("id,name,active")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return (data ?? []) as Organization[];
    },
  });

  const organizations = organizationsQuery.data ?? [];

  return (
    <div className="yesod-page-icons mx-auto max-w-6xl px-4 py-10">
      <header className="rounded-2xl border border-border bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d75a12]">
              <LockKeyhole className="h-4 w-4" />
              Área privada
            </div>
            <h1 className="mt-3 text-3xl font-bold">Conteúdo exclusivo</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {isAdmin
                ? "Gerencie organizações, acessos e materiais privados a partir de um único lugar."
                : "Acesse treinamentos, vídeos e materiais liberados especificamente para a sua organização."}
            </p>
          </div>

          {!isAdmin && organizations.length > 0 && (
            <div className="min-w-[15rem] rounded-xl border border-[#e86f22]/25 bg-orange-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#b94b0f]">
                <Building2 className="h-4 w-4" />
                Sua organização
              </div>
              <p className="mt-2 font-semibold text-foreground">
                {organizations.map((organization) => organization.name).join(" · ")}
              </p>
            </div>
          )}
        </div>
      </header>

      {!isAdmin && !organizationsQuery.isLoading && organizations.length === 0 && (
        <div className="mt-7 rounded-xl border border-dashed border-border bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">Acesso ainda não liberado</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu login está ativo, mas este e-mail ainda não está vinculado a uma organização com acesso autorizado.
          </p>
        </div>
      )}

      {isAdmin && <OrganizationAccessCenter />}
      {(isAdmin || organizations.length > 0) && <ExclusiveContentCenter isAdmin={isAdmin} standalone />}
    </div>
  );
}
