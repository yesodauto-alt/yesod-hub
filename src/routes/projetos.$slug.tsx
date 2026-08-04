import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { PROJECT_COLUMNS, type ProjectRow } from "@/lib/projects";
import { PROJECT_BUCKET, useMediaUrl, useMediaUrls } from "@/lib/storage";
import { whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/projetos/$slug")({
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { t, tm } = useI18n();

  const projectQuery = useQuery({
    queryKey: ["project", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(PROJECT_COLUMNS)
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as ProjectRow | null;
    },
  });

  const project = projectQuery.data ?? null;
  const cover = useMediaUrl(PROJECT_BUCKET, project?.image_url ?? null);
  const gallery = useMediaUrls(PROJECT_BUCKET, project?.gallery_urls ?? []);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: tm(project?.title), url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t("common.linkCopied"));
      }
    } catch {
      /* dismissed by the user */
    }
  }

  if (projectQuery.isLoading) {
    return <p className="mx-auto max-w-3xl px-6 py-20 text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-muted-foreground">{t("projects.notFound")}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/projetos">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("projects.backToList")}
          </Link>
        </Button>
      </div>
    );
  }

  const title = tm(project.title);
  const sections = [
    { label: t("projects.context"), text: tm(project.context) },
    { label: t("projects.automation"), text: tm(project.automation) },
    { label: t("projects.solution"), text: tm(project.solution) },
    { label: t("projects.result"), text: tm(project.result) },
  ].filter((s) => s.text);
  const content = tm(project.content);

  return (
    <article className="mx-auto max-w-4xl px-6 py-14">
      <Link
        to="/projetos"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("projects.backToList")}
      </Link>

      {cover && (
        <img
          src={cover}
          alt={title}
          className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover shadow-soft"
        />
      )}

      <header className="mt-10">
        <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          {tm(project.category)}
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">{tm(project.summary)}</p>
      </header>

      <div className="mt-12 space-y-8">
        {sections.map((section) => (
          <section key={section.label}>
            <h2 className="text-lg">{section.label}</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">
              {section.text}
            </p>
          </section>
        ))}
        {content && (
          <p className="whitespace-pre-line leading-relaxed text-foreground/90">{content}</p>
        )}
      </div>

      {gallery.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg">{t("projects.gallery")}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((url) => (
              <img
                key={url}
                src={url}
                alt={title}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-xl object-cover shadow-soft"
              />
            ))}
          </div>
        </section>
      )}

      <div className="mt-14 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <a href={whatsappUrl(t("wa.project", { name: title }))} target="_blank" rel="noreferrer">
            {t("common.talkToYesod")}
          </a>
        </Button>
        {project.interaction_type === "external_demo" && project.interaction_url && (
          <Button asChild size="lg" variant="outline">
            <a href={project.interaction_url} target="_blank" rel="noreferrer noopener">
              {tm(project.interaction_label) || t("projects.openDemo")}
            </a>
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={share}>
          <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("common.share")}
        </Button>
      </div>
    </article>
  );
}
