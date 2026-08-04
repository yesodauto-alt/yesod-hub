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
        content:
          "Automação inteligente em escala: conteúdo, projetos e área exclusiva para membros.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const pillars = [
  {
    icon: Newspaper,
    titleKey: "home.pillar.news" as TranslationKey,
    textKey: "home.pillar.newsText" as TranslationKey,
    to: "/hub" as const,
  },
  {
    icon: Layers,
    titleKey: "home.pillar.projects" as TranslationKey,
    textKey: "home.pillar.projectsText" as TranslationKey,
    to: "/projetos" as const,
  },
  {
    icon: Lock,
    titleKey: "home.pillar.exclusive" as TranslationKey,
    textKey: "home.pillar.exclusiveText" as TranslationKey,
    to: "/meu-espaco" as const,
  },
  {
    icon: UserRound,
    titleKey: "home.pillar.members" as TranslationKey,
    textKey: "home.pillar.membersText" as TranslationKey,
    to: "/meu-espaco" as const,
  },
];

const faqKeys: { q: TranslationKey; a: TranslationKey }[] = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
];

function FounderSection() {
  const { t, tm } = useI18n();

  const founderQuery = useQuery({
    queryKey: ["site-settings", "founder"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "founder")
        .maybeSingle();
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
    <section className="bg-surface py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[minmax(0,320px)_1fr] md:items-center">
        <div className="overflow-hidden rounded-3xl bg-placeholder-gradient shadow-lift">
          <div className="aspect-[4/5] w-full">
            {photo ? (
              <img
                src={photo}
                alt={name || "YESOD"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-white">
                  <UserRound className="h-9 w-9" aria-hidden="true" />
                </span>
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl">{t("home.founderTitle")}</h2>
          {name && <p className="mt-6 font-display text-xl font-semibold">{name}</p>}
          {role && <p className="mt-1 text-sm font-medium text-primary">{role}</p>}
          {bio && (
            <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">{bio}</p>
          )}
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
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <span className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 shadow-soft">
            <img src={logo.url} alt="YESOD" className="h-8 w-auto" />
          </span>
          <h1 className="mt-10 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
            {t("home.heroText")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth" search={{ modo: "cadastro" }}>
                {t("home.ctaJoin")}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/hub">{t("home.ctaSee")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl">{t("home.pillarsTitle")}</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t("home.pillarsText")}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <Link
              key={p.titleKey}
              to={p.to}
              className="group rounded-2xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <p.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg group-hover:text-primary">{t(p.titleKey)}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {t(p.textKey)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <FounderSection />

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl">{t("home.productsTitle")}</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">{t("home.productsText")}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={`rounded-2xl border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
                product.featured ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
              }`}
            >
              {product.featured && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  <Sparkles className="h-3 w-3" aria-hidden="true" /> {t("products.featured")}
                </span>
              )}
              <h3 className="mt-3 text-lg">{t(product.nameKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(product.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link to="/produtos">
              {t("home.seeProducts")} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-surface py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl sm:text-4xl">{t("home.faqTitle")}</h2>
          <Accordion type="single" collapsible className="mt-10">
            {faqKeys.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left font-medium">{t(f.q)}</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  {t(f.a)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-3xl bg-brand-gradient px-8 py-16 text-center text-white shadow-lift sm:px-14">
          <h2 className="text-3xl sm:text-4xl">{t("home.finalTitle")}</h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/75">
            {t("home.finalText")}
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-10">
            <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">
              {t("common.talkToYesod")}
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
