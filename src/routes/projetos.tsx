import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, useLocalizedMeta, type Lang } from "@/lib/i18n";
import { PROJECT_COLUMNS, type ProjectRow } from "@/lib/projects";
import { PROJECT_BUCKET, useMediaUrl } from "@/lib/storage";
import { whatsappUrl } from "@/lib/yesod";

const PROJECTS_PER_PAGE = 4;

const paginationCopy: Record<Lang, { page: string; of: string; previous: string; next: string }> = {
  pt: { page: "Página", of: "de", previous: "Página anterior", next: "Próxima página" },
  en: { page: "Page", of: "of", previous: "Previous page", next: "Next page" },
  es: { page: "Página", of: "de", previous: "Página anterior", next: "Página siguiente" },
};

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
    <Button asChild size="sm" className="mt-6 w-full sm:w-fit">
      <a href={project.interaction_url} target="_blank" rel="noreferrer noopener">
        {buttonLabel}<ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </Button>
  ) : project.interaction_type === "whatsapp" ? (
    <Button asChild size="sm" className="mt-6 w-full sm:w-fit">
      <a href={whatsappUrl(t("wa.project", { name: title }))} target="_blank" rel="noreferrer">
        {buttonLabel}
      </a>
    </Button>
  ) : (
    <Button asChild size="sm" className="mt-6 w-full sm:w-fit">
      <Link to="/projetos/$slug" params={{ slug: project.slug }}>{buttonLabel}</Link>
    </Button>
  );

  return (
    <article className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[minmax(240px,0.92fr)_1.08fr]">
      <div className="flex min-h-48 items-center justify-center bg-card p-4 sm:p-5 md:min-h-[260px]">
        {cover ? (
          <figure className="w-full bg-gradient-to-br from-[#ff8a3d] via-[#e86f22] to-[#b9470d] p-[2px] shadow-[0_14px_34px_rgba(232,111,34,0.12)]">
            <div className="flex w-full items-center justify-center bg-[#101114] p-2">
              <img
                src={cover}
                alt={title}
                className="max-h-[250px] w-full object-contain"
                loading="lazy"
              />
            </div>
          </figure>
        ) : (
          <div className="flex h-full min-h-56 w-full items-center justify-center border border-[#e86f22]/45 bg-[#101114] text-[#e86f22]">
            <ImageIcon className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {tm(project.category)}
          </span>
          <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h2 className="mt-5 text-xl leading-snug sm:text-[1.35rem]">{title}</h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{tm(project.summary)}</p>
        {action}
      </div>
    </article>
  );
}

function Projetos() {
  const { t, lang } = useI18n();
  const [page, setPage] = useState(1);
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

  const projects = projectsQuery.data ?? [];
  const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const firstProjectIndex = (safePage - 1) * PROJECTS_PER_PAGE;
  const visibleProjects = projects.slice(firstProjectIndex, firstProjectIndex + PROJECTS_PER_PAGE);
  const pagination = paginationCopy[lang];

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function changePage(nextPage: number) {
    const normalizedPage = Math.max(1, Math.min(totalPages, nextPage));
    setPage(normalizedPage);
    window.requestAnimationFrame(() => {
      document.getElementById("projects-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

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

      {projects.length > 0 && (
        <>
          <div id="projects-list" className="mx-auto mt-12 max-w-5xl scroll-mt-8 space-y-4">
            {visibleProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={firstProjectIndex + index} />
            ))}
          </div>

          <nav className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-between gap-4 border-t border-[#e86f22]/30 pt-5" aria-label={pagination.page}>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span className="text-[#e86f22]">{pagination.page} {safePage}</span> {pagination.of} {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => changePage(safePage - 1)}
                disabled={safePage === 1}
                className="flex h-8 w-8 items-center justify-center border border-[#e86f22]/35 text-[#e86f22] transition-colors hover:bg-[#e86f22] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={pagination.previous}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => changePage(pageNumber)}
                  aria-current={pageNumber === safePage ? "page" : undefined}
                  className={`flex h-8 min-w-8 items-center justify-center border px-2 text-sm font-semibold transition-colors ${pageNumber === safePage ? "border-[#e86f22] bg-[#e86f22] text-white" : "border-[#e86f22]/35 text-[#e86f22] hover:bg-[#e86f22]/10"}`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => changePage(safePage + 1)}
                disabled={safePage === totalPages}
                className="flex h-8 w-8 items-center justify-center border border-[#e86f22]/35 text-[#e86f22] transition-colors hover:bg-[#e86f22] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={pagination.next}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </>
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
