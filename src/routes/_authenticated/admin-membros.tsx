import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Check, Shield, UserRoundX, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin-membros")({
  beforeLoad: async () => {
    const { data: auth, error } = await supabase.auth.getUser();
    if (error || !auth.user) throw redirect({ to: "/auth" });
    const { data: admin } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", auth.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!admin) throw redirect({ to: "/meu-espaco" });
  },
  head: () => ({ meta: [{ title: "Gerenciar membros — Yesod HUB" }] }),
  component: AdminMembersPage,
});

type Member = {
  id: string;
  email: string | null;
  full_name: string | null;
  company: string | null;
  membership_status: "pending" | "active" | "suspended";
  created_at: string;
};

function AdminMembersPage() {
  const { user } = useAuth();
  const { lang } = useI18n();
  const queryClient = useQueryClient();
  const copy = {
    pt: { section: "Administração", title: "Gerenciar membros", intro: "Aprove ou suspenda o acesso à biblioteca e conceda permissão editorial separadamente.", pending: "Aguardando aprovação", active: "Acesso liberado", suspended: "Acesso suspenso", approve: "Aprovar acesso", suspend: "Suspender acesso", reactivate: "Reativar acesso", editor: "Editora de conteúdo", grant: "Permitir edição", revoke: "Remover edição", loading: "Carregando membros…", failed: "Não foi possível carregar os membros.", empty: "Ainda não há contas cadastradas." },
    en: { section: "Administration", title: "Manage members", intro: "Approve or suspend library access and grant editorial permission separately.", pending: "Pending approval", active: "Access active", suspended: "Access suspended", approve: "Approve access", suspend: "Suspend access", reactivate: "Reactivate access", editor: "Content editor", grant: "Grant editing", revoke: "Remove editing", loading: "Loading members…", failed: "Could not load members.", empty: "There are no accounts yet." },
    es: { section: "Administración", title: "Gestionar miembros", intro: "Aprueba o suspende el acceso a la biblioteca y concede el permiso editorial por separado.", pending: "Pendiente de aprobación", active: "Acceso activo", suspended: "Acceso suspendido", approve: "Aprobar acceso", suspend: "Suspender acceso", reactivate: "Reactivar acceso", editor: "Editora de contenido", grant: "Permitir edición", revoke: "Quitar edición", loading: "Cargando miembros…", failed: "No se pudieron cargar los miembros.", empty: "Todavía no hay cuentas registradas." },
  } as const;
  const text = copy[lang];

  const membersQuery = useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,full_name,company,membership_status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Member[];
    },
  });
  const editorsQuery = useQuery({
    queryKey: ["admin-content-editors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("content_editors").select("user_id");
      if (error) throw error;
      return new Set((data ?? []).map((row) => row.user_id));
    },
  });

  async function setMembershipStatus(member: Member, membership_status: Member["membership_status"]) {
    const { error } = await supabase.from("profiles").update({ membership_status }).eq("id", member.id);
    if (error) { toast.error(error.message); return; }
    toast.success(membership_status === "active" ? text.active : text.suspended);
    await queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    await queryClient.invalidateQueries({ queryKey: ["membership-access", member.id] });
    await queryClient.invalidateQueries({ queryKey: ["exclusive-contents"] });
  }

  async function setContentEditor(member: Member, enabled: boolean) {
    const result = enabled
      ? await supabase.from("content_editors").insert({ user_id: member.id, assigned_by: user?.id ?? null })
      : await supabase.from("content_editors").delete().eq("user_id", member.id);
    if (result.error) { toast.error(result.error.message); return; }
    toast.success(enabled ? text.grant : text.revoke);
    await queryClient.invalidateQueries({ queryKey: ["admin-content-editors"] });
  }

  const members = membersQuery.data ?? [];
  const pendingCount = members.filter((member) => member.membership_status === "pending").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">{text.section}</p>
        <h1 className="mt-2 text-3xl font-bold">{text.title}</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">{text.intro}</p>
      </header>
      <Card className="mb-6 border-primary/25">
        <CardContent className="flex flex-wrap items-center gap-3 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Check className="h-5 w-5" /></span>
          <p className="font-medium">{pendingCount} {text.pending}</p>
        </CardContent>
      </Card>
      {membersQuery.isLoading || editorsQuery.isLoading ? <p className="text-muted-foreground">{text.loading}</p> : null}
      {(membersQuery.isError || editorsQuery.isError) && <p role="alert" className="text-destructive">{text.failed}</p>}
      {!membersQuery.isLoading && members.length === 0 && <Card><CardContent className="p-8 text-center text-muted-foreground">{text.empty}</CardContent></Card>}
      <div className="space-y-4">
        {members.map((member) => {
          const isEditor = editorsQuery.data?.has(member.id) ?? false;
          const statusText = member.membership_status === "active" ? text.active : member.membership_status === "suspended" ? text.suspended : text.pending;
          return (
            <Card key={member.id}>
              <CardContent className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{member.full_name || member.email || member.id}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${member.membership_status === "active" ? "bg-emerald-100 text-emerald-800" : member.membership_status === "suspended" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}>{statusText}</span>
                    {isEditor && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{text.editor}</span>}
                  </div>
                  <p className="mt-1 break-all text-sm text-muted-foreground">{member.email || "—"}{member.company ? ` · ${member.company}` : ""}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {member.membership_status !== "active" && <Button size="sm" onClick={() => void setMembershipStatus(member, "active")}><UserRoundCheck className="mr-2 h-4 w-4" />{member.membership_status === "suspended" ? text.reactivate : text.approve}</Button>}
                  {member.membership_status === "active" && <Button size="sm" variant="outline" onClick={() => void setMembershipStatus(member, "suspended")}><UserRoundX className="mr-2 h-4 w-4" />{text.suspend}</Button>}
                  <Button size="sm" variant="outline" onClick={() => void setContentEditor(member, !isEditor)}><Shield className="mr-2 h-4 w-4" />{isEditor ? text.revoke : text.grant}</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
