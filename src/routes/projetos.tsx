import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, useLocalizedMeta } from "@/lib/i18n";
import { PROJECT_COLUMNS, type ProjectRow } from "@/lib/projects";
import { PROJECT_BUCKET, useMediaUrl } from "@/lib/storage";
import { whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos YESOD — automações em operação" },
      {
        name: "description",
        content:
          "Vitrine de projetos da YESOD: automação gráfica, comercial, de dados e IA aplicada, com o que cada projeto automatiza e o resultado alcançado.",
      },
      { property: "og:title", content: "Projetos da YESOD" },
      { property: "og:description", content: "Automações reais em operação, por categoria e resultado." },
    ],
    links: [{ rel: "canonical", href: "/projetos" }],
  }),
  component: Projetos,
});

function ProjectCard({ project, index }: { project: ProjectRow; index: number }) {
  const { t, tm } = useI18n();
  const cover = useMediaUrl(PROJECT_BUCKET, project.image_url);
  const title = tm(project.title);
  const label = tm(project.interaction_label);
  const buttonLabel = label || (
    project.interaction_type === "external_demo"
      ? t("projects.openDemo")
      : project.interaction_type === "whatsapp"
        ? t("projects.talk")
        : t("projects.view")
  );

  const action = project.interaction_type === "external_demo" && project.interaction_url ? (
    <Button asChild variant="outline" size="sm" className="mt-6 w-full sm:w-fit">
      <a href={project.interaction_url} target="_blank" rel="noreferrer noopener">
        {buttonLabel}<ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </Button>
  ) : project.interaction_type === "whatsapp" ? (
    <Button asChild variant="outline" size="sm" className="mt-6 w-full sm:w-fit">
      <a href={whatsappUrl(t("wa.project", { name: title }))} target="_blank" rel="noreferrer">
        {buttonLabel}
      </a>
    </Button>
  ) : (
    <Button asChild variant="outline" size="sm" className="mt-6 w-full sm:w-fit">
      <Link to="/projetos/$slug" params={{ slug: project.slug }}>{buttonLabel}</Link>
    </Button>
  );

  return (
    <article className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[minmax(220px,0.8fr)_1.2fr]">
      <div className="flex min-h-56 items-center justify-center bg-[#f6f8fb] p-4 sm:p-6 md:min-h-[320px]">
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="max-h-[320px] w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full min-h-56 w-full items-center justify-center bg-placeholder-gradient text-white/70">
            <ImageIcon className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {tm(project.category)}
          </span>
          <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h2 className="mt-7 text-xl leading-snug sm:text-2xl">{title}</h2>
        <p className="mt-4 flex-1 text-sm leading-7 text-muted-foreground">{tm(project.summary)}</p>
        {action}
      </div>
    </article>
  );
}

function Projetos() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useLocalizedMeta("meta.projects.title", "meta.projects.desc");

  const projectsQuery = useQuery({
    queryKey: ["projects", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(PROJECT_COLUMNS)
        .eq("published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as ProjectRow[];
    },
  });

  if (pathname.startsWith("/projetos/")) {
    return <Outlet />;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">YESOD</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">{t("projects.title")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("projects.subtitle")}</p>
      </header>

      {projectsQuery.isLoading && <p className="mt-12 text-sm text-muted-foreground">{t("projects.loading")}</p>}
      {projectsQuery.isError && <p className="mt-12 text-sm text-destructive">{t("common.error")}</p>}
      {projectsQuery.data?.length === 0 && (
        <p className="mt-12 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {t("projects.empty")}
        </p>
      )}

      {projectsQuery.data && projectsQuery.data.length > 0 && (
        <div className="mt-12 space-y-5">
          {projectsQuery.data.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-8">
        <Button asChild>
          <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">
            {t("common.talkToYesod")}
          </a>
        </Button>
      </div>
    </div>
  );
}
