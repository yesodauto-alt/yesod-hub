import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Share2, ZoomIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      // Compartilhamento cancelado pelo usuário.
    }
  }

  if (projectQuery.isLoading) {
    return <p className="mx-auto max-w-4xl px-6 py-20 text-sm text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-2xl border border-border bg-card p-8">
          <p className="text-muted-foreground">{t("projects.notFound")}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/projetos">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("projects.backToList")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const title = tm(project.title);
  const sections = [
    { label: t("projects.context"), text: tm(project.context) },
    { label: t("projects.automation"), text: tm(project.automation) },
    { label: t("projects.solution"), text: tm(project.solution) },
    { label: t("projects.result"), text: tm(project.result) },
  ].filter((section) => section.text);
  const content = tm(project.content);

  return (
    <article className="mx-auto max-w-5xl px-6 py-14 sm:py-18">
      <Link
        to="/projetos"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("projects.backToList")}
      </Link>

      <header className="mt-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {tm(project.category)}
        </p>
        <h1 className="mt-5 text-3xl leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">{tm(project.summary)}</p>
      </header>

      {cover && (
        <button
          type="button"
          onClick={() => setSelectedImage(cover)}
          className="group relative mt-10 flex min-h-64 w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-border bg-[#f6f8fb] p-4 sm:min-h-80 sm:p-6"
          aria-label={`Ampliar imagem de ${title}`}
        >
          <img
            src={cover}
            alt={title}
            className="max-h-[620px] w-full object-contain"
          />
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-md bg-navy/90 px-3 py-2 text-xs font-medium text-white opacity-90 shadow-lg transition group-hover:bg-[#e86f22] group-hover:opacity-100">
            <ZoomIn className="h-4 w-4" aria-hidden="true" />
            Ampliar
          </span>
        </button>
      )}

      {gallery.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl">{t("projects.gallery")}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {gallery.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelectedImage(url)}
                className="group relative flex aspect-[16/10] cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-border bg-[#f6f8fb] p-3"
                aria-label={`Ampliar imagem ${index + 1} de ${title}`}
              >
                <img
                  src={url}
                  alt={`${title} — ${index + 1}`}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-md bg-navy/90 text-white shadow-lg transition group-hover:bg-[#e86f22]">
                  <ZoomIn className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="w-[95vw] max-w-7xl border-white/15 bg-black/95 p-3 text-white sm:p-5">
          <DialogTitle className="sr-only">{`Imagem ampliada de ${title}`}</DialogTitle>
          {selectedImage && (
            <div className="flex max-h-[88vh] min-h-[50vh] items-center justify-center">
              <img
                src={selectedImage}
                alt={title}
                className="max-h-[85vh] max-w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
        {sections.map((section) => (
          <section key={section.label} className="bg-card p-6 sm:p-8">
            <h2 className="text-base">{section.label}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{section.text}</p>
          </section>
        ))}
      </div>

      {content && (
        <section className="mx-auto mt-12 max-w-3xl border-l-2 border-primary/40 pl-6">
          <p className="whitespace-pre-line leading-8 text-foreground/85">{content}</p>
        </section>
      )}

      <div className="mt-14 flex flex-wrap gap-3 border-t border-border pt-8">
        <Button asChild>
          <a href={whatsappUrl(t("wa.project", { name: title }))} target="_blank" rel="noreferrer">
            {t("common.talkToYesod")}
          </a>
        </Button>
        {project.interaction_type === "external_demo" && project.interaction_url && (
          <Button asChild variant="outline">
            <a href={project.interaction_url} target="_blank" rel="noreferrer noopener">
              {tm(project.interaction_label) || t("projects.openDemo")}
            </a>
          </Button>
        )}
        <Button variant="ghost" onClick={share}>
          <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("common.share")}
        </Button>
      </div>
    </article>
  );
}
