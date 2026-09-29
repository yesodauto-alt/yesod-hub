import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ExclusiveContentCenter } from "@/components/admin/exclusive-content-center";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/conteudos-exclusivos")({
  head: () => ({ meta: [{ title: "Biblioteca de membros — Yesod HUB" }] }),
  component: MemberLibraryPage,
});

function MemberLibraryPage() {
  const { user } = useAuth();
  const { lang } = useI18n();
  const accessQuery = useQuery({
    queryKey: ["membership-access", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [profileResult, adminResult, editorResult] = await Promise.all([
        supabase.from("profiles").select("membership_status").eq("id", user!.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", user!.id).eq("role", "admin").maybeSingle(),
        supabase.from("content_editors").select("user_id").eq("user_id", user!.id).maybeSingle(),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (adminResult.error) throw adminResult.error;
      if (editorResult.error) throw editorResult.error;
      return {
        membershipStatus: profileResult.data.membership_status,
        canManageContent: Boolean(adminResult.data || editorResult.data),
      };
    },
  });

  if (accessQuery.isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-muted-foreground">{lang === "en" ? "Loading…" : lang === "es" ? "Cargando…" : "Carregando…"}</div>;
  }

  if (accessQuery.isError) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-destructive">{lang === "en" ? "We could not verify your access. Please reload the page." : lang === "es" ? "No pudimos verificar tu acceso. Recarga la página." : "Não foi possível verificar seu acesso. Recarregue a página."}</div>;
  }

  if (!accessQuery.data?.canManageContent && accessQuery.data?.membershipStatus !== "active") {
    const suspended = accessQuery.data?.membershipStatus === "suspended";
    const copy = {
      pt: suspended
        ? ["Acesso suspenso", "Seu perfil continua disponível, mas o acesso à biblioteca está suspenso. Fale com a equipe YESOD se precisar de ajuda."]
        : ["Aguardando aprovação", "Seu cadastro foi recebido. A equipe YESOD aprovará seu acesso à biblioteca de membros."] ,
      en: suspended
        ? ["Access suspended", "Your profile is still available, but library access is suspended. Contact the YESOD team if you need help."]
        : ["Pending approval", "Your registration was received. The YESOD team will approve your access to the members library."],
      es: suspended
        ? ["Acceso suspendido", "Tu perfil sigue disponible, pero el acceso a la biblioteca está suspendido. Contacta al equipo YESOD si necesitas ayuda."]
        : ["Pendiente de aprobación", "Recibimos tu registro. El equipo YESOD aprobará tu acceso a la biblioteca de miembros."],
    } as const;
    const [title, message] = copy[lang];
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Card className="max-w-2xl border-primary/30">
          <CardContent className="p-7">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-3 text-muted-foreground">{message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const title = lang === "en" ? "Members library" : lang === "es" ? "Biblioteca de miembros" : "Biblioteca de membros";
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">
          {lang === "en" ? "Videos and materials available to approved members." : lang === "es" ? "Vídeos y materiales disponibles para miembros aprobados." : "Vídeos e materiais disponíveis para membros aprovados."}
        </p>
      </header>
      <ExclusiveContentCenter />
    </div>
  );
}
