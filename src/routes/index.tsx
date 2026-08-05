import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Layers, Lock, Newspaper, Sparkles, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import logo from "@/assets/yesod-logo.png.asset.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, useLocalizedMeta, type TranslationKey } from "@/lib/i18n";
import type { FounderSettings } from "@/lib/projects";
import { SITE_BUCKET, useMediaUrl } from "@/lib/storage";
import { PRODUCTS, whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yesod HUB — automação e escala com inteligência artificial" },
      {
        name: "description",
        content:
          "Yesod HUB: novidades, projetos de automação, conteúdo exclusivo e área de membros para quem quer escalar processos com inteligência artificial.",
      },
      { property: "og:title", content: "Yesod HUB" },
      {
        property: "og:description",
        content: "Automação inteligente em escala: conteúdo, projetos e área exclusiva para membros.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const pillars = [
  { icon: Newspaper, titleKey: "home.pillar.news" as TranslationKey, textKey: "home.pillar.newsText" as TranslationKey, to: "/hub" as const },
  { icon: Layers, titleKey: "home.pillar.projects" as TranslationKey, textKey: "home.pillar.projectsText" as TranslationKey, to: "/projetos" as const },
  { icon: Lock, titleKey: "home.pillar.exclusive" as TranslationKey, textKey: "home.pillar.exclusiveText" as TranslationKey, to: "/meu-espaco" as const },
  { icon: UserRound, titleKey: "home.pillar.members" as TranslationKey, textKey: "home.pillar.membersText" as TranslationKey, to: "/meu-espaco" as const },
];

const faqKeys: { q: TranslationKey; a: TranslationKey }[] = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
];

function SectionHeading({ title, text }: { title: string; text?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl leading-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-7 text-muted-foreground">{text}</p>}
    </div>
  );
}

function FounderSection() {
  const { t, tm } = useI18n();
  const founderQuery = useQuery({
    queryKey: ["site-settings", "founder"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "founder").maybeSingle();
      if (error) throw error;
      return (data?.value ?? null) as FounderSettings | null;
    },
  });

  const founder = founderQuery.data;
  const photo = useMediaUrl(SITE_BUCKET, founder?.image_url ?? null);
  const name = tm(founder?.name);
  const role = tm(founder?.role);
  const bio = tm(founder?.bio);

  return (
    <section className="border-y border-border bg-card py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-center">
        <div className="overflow-hidden rounded-2xl border border-border bg-placeholder-gradient">
          <div className="aspect-[4/5] w-full">
            {photo ? (
              <img src={photo} alt={name || "YESOD"} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/80">
                <UserRound className="h-10 w-10" strokeWidth={1.5} aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">YESOD</p>
          <h2 className="mt-4 text-3xl sm:text-4xl">{t("home.founderTitle")}</h2>
          {name && <p className="mt-7 font-display text-xl font-semibold">{name}</p>}
          {role && <p className="mt-1 text-sm font-medium text-primary">{role}</p>}
          {bio && <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">{bio}</p>}
        </div>
      </div>
    </section>
  );
}

function Home() {
  const { t } = useI18n();
  useLocalizedMeta("meta.home.title", "meta.home.desc");

  return (
    <div>
      <section className="bg-hero-gradient">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <img src={logo.url} alt="YESOD" className="h-7 w-auto" />
            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {t("brand.tagline")}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl leading-[1.08] text-foreground sm:text-5xl lg:text-[3.6rem]">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{t("home.heroText")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ modo: "cadastro" }}>{t("home.ctaJoin")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-card/70">
                <Link to="/hub">{t("home.ctaSee")}</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-brand-gradient p-5 text-white shadow-lift sm:p-7">
            <div className="grid gap-3">
              {pillars.map((pillar, index) => (
                <Link
                  key={pillar.titleKey}
                  to={pillar.to}
                  className="group flex items-start gap-4 rounded-xl border border-transparent p-4 transition-colors hover:border-white/15 hover:bg-white/[0.06]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                    <pillar.icon className="h-4.5 w-4.5" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{t(pillar.titleKey)}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/65">{t(pillar.textKey)}</span>
                  </span>
                  <span className="mt-1 text-xs text-white/45">0{index + 1}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SectionHeading title={t("home.pillarsTitle")} text={t("home.pillarsText")} />
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <Link key={pillar.titleKey} to={pillar.to} className="group bg-card p-6 hover:bg-background">
              <pillar.icon className="h-5 w-5 text-primary" strokeWidth={1.7} aria-hidden="true" />
              <h3 className="mt-8 text-base group-hover:text-primary">{t(pillar.titleKey)}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(pillar.textKey)}</p>
            </Link>
          ))}
        </div>
      </section>

      <FounderSection />

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading title={t("home.productsTitle")} text={t("home.productsText")} />
          <Button asChild variant="outline">
            <Link to="/produtos">{t("home.seeProducts")}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PRODUCTS.map((product) => (
            <article key={product.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg">{t(product.nameKey)}</h3>
                {product.featured && (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                    <Sparkles className="h-3 w-3" aria-hidden="true" /> {t("products.featured")}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(product.descriptionKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeading title={t("home.faqTitle")} />
          <Accordion type="single" collapsible className="mt-8">
            {faqKeys.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left text-sm font-medium">{t(item.q)}</AccordionTrigger>
                <AccordionContent className="leading-7 text-muted-foreground">{t(item.a)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="rounded-2xl bg-navy px-7 py-12 text-white sm:px-12 sm:py-14">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl">{t("home.finalTitle")}</h2>
            <p className="mt-4 leading-7 text-white/70">{t("home.finalText")}</p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">{t("common.talkToYesod")}</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
