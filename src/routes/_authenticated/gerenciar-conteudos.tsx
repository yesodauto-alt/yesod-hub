import { createFileRoute, redirect } from "@tanstack/react-router";

import { ExclusiveContentCenter } from "@/components/admin/exclusive-content-center";
import { useAuth, useCanManageExclusiveContent } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/gerenciar-conteudos")({
  beforeLoad: async () => {
    const { data: auth, error } = await supabase.auth.getUser();
    if (error || !auth.user) throw redirect({ to: "/auth" });
    const [{ data: admin }, { data: editor }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", auth.user.id).eq("role", "admin").maybeSingle(),
      supabase.from("content_editors").select("user_id").eq("user_id", auth.user.id).maybeSingle(),
    ]);
    if (!admin && !editor) throw redirect({ to: "/meu-espaco" });
  },
  head: () => ({ meta: [{ title: "Gerenciar conteúdos — Yesod HUB" }] }),
  component: ManageExclusiveContentPage,
});

function ManageExclusiveContentPage() {
  const { user } = useAuth();
  const canManageContent = useCanManageExclusiveContent(user);
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {lang === "en" ? "Administration" : lang === "es" ? "Administración" : "Administração"}
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          {lang === "en" ? "Manage members content" : lang === "es" ? "Gestionar contenido para miembros" : "Gerenciar conteúdo para membros"}
        </h1>
      </header>
      <ExclusiveContentCenter canManageContent={canManageContent} managementMode />
    </div>
  );
}
