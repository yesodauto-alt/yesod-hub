import { createFileRoute, redirect } from "@tanstack/react-router";

import { ProjectAdmin } from "@/routes/_authenticated/meu-espaco";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/gerenciar-projetos")({
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
  head: () => ({ meta: [{ title: "Gerenciar projetos — Yesod HUB" }] }),
  component: ManageProjectsPage,
});

function ManageProjectsPage() {
  const { lang } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">{lang === "en" ? "Administration" : lang === "es" ? "Administración" : "Administração"}</p>
        <h1 className="mt-2 text-3xl font-bold">{lang === "en" ? "Manage projects" : lang === "es" ? "Gestionar proyectos" : "Gerenciar projetos"}</h1>
      </header>
      <ProjectAdmin />
    </div>
  );
}
