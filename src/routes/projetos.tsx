import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
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
      {
        property: "og:description",
        content: "Automações reais em operação, por categoria e resultado.",
      },
    ],
    links: [{ rel: "canonical", href: "/projetos" }],
  }),
  component: Projetos,
});

function ProjectCard({ project }: { project: ProjectRow }) {
  const { t, tm } = useI18n();
  const cover = useMediaUrl(PROJECT_BUCKET, project.image_url);
  const title = tm(project.title);
  const label = tm(project.interaction_label);

  const action = (() => {
    if (project.interaction_type === "external_demo" && project.interaction_url) {
      return (
        <Button asChild variant="outline" size="sm" className="mt-5 w-full">
          <a href={project.interaction_url} target="_blank" rel="noreferrer noopener">
            {label || t("projects.openDemo")}
            <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </Button>
      );
    }
    if (project.interaction_type === "whatsapp") {
      return (
        <Button asChild variant="outline" size="sm" className="mt-5 w-full">
          <a
            href={whatsappUrl(t("wa.project", { name: title }))}
            target="_blank"
            rel="noreferrer"
          >
            {label || t("projects.talk")}
          </a>
        </Button>
      );
    }
    return (
      <Button asChild variant="outline" size="sm" className="mt-5 w-full">
        <Link to="/projetos/$slug" params={{ slug: project.slug }}>
          {label || t("projects.view")}
        </Link>
      </Button>
    );
  })();

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="aspect-[16/9] w-full bg-placeholder-gradient">
        {cover ? (
          <img src={cover} alt={title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/70">
            <ImageIcon className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="inline-flex w-fit rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
          {tm(project.category)}
        </span>
        <h2 className="mt-3 text-base font-semibold leading-snug">{title}</h2>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {tm(project.summary)}
        </p>
        {action}
      </div>
    </article>
  );
}

function Projetos() {
  const { t } = useI18n();
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">{t("projects.title")}</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">{t("projects.subtitle")}</p>
      </header>

      {projectsQuery.isLoading && (
        <p className="mt-14 text-muted-foreground">{t("projects.loading")}</p>
      )}
      {projectsQuery.isError && (
        <p className="mt-14 text-destructive">{t("common.error")}</p>
      )}
      {projectsQuery.data?.length === 0 && (
        <p className="mt-14 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          {t("projects.empty")}
        </p>
      )}

      {projectsQuery.data && projectsQuery.data.length > 0 && (
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projectsQuery.data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <div className="mt-14 text-center">
        <Button asChild size="lg">
          <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">
            {t("common.talkToYesod")}
          </a>
        </Button>
      </div>
    </div>
  );
}
