import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Layers, Lock, Newspaper, Sparkles, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HeroBackdrop } from "@/components/home/HeroBackdrop";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, useLocalizedMeta, type Lang, type TranslationKey } from "@/lib/i18n";
import type { FounderSettings } from "@/lib/projects";
import { SITE_BUCKET, useMediaUrl } from "@/lib/storage";
import { PRODUCTS, whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yesod HUB — inteligência artificial aplicada ao dia a dia" },
      {
        name: "description",
        content:
          "Conheça projetos, soluções e conteúdos da YESOD sobre inteligência artificial aplicada para reduzir tarefas repetitivas, erros e tempo operacional.",
      },
      { property: "og:title", content: "Yesod HUB" },
      {
        property: "og:description",
        content: "Inteligência artificial aplicada para simplificar tarefas, apoiar decisões e transformar operações.",
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

const heroCopy: Record<Lang, {
  welcome: string;
  titleOne: string;
  titleTwo: string;
  text: string;
  projects: string;
  solutions: string;
  news: string;
}> = {
  pt: {
    welcome: "Bem-vindo ao",
    titleOne: "Automatize o que consome seu time. Potencialize o que só o humano faz.",
    titleTwo: "É assim que a IA vira lucro e não custo.",
    text:
      "Ela organiza informações, acelera tarefas e reduz erros no dia a dia. Conheça os projetos e soluções da YESOD e acompanhe as novidades que já estão transformando empresas.",
    projects: "Conhecer projetos",
    solutions: "Ver soluções",
    news: "Acompanhar novidades",
  },
  en: {
    welcome: "Welcome to",
    titleOne: "Automate what drains your team. Amplify what only humans can do.",
    titleTwo: "That is how AI becomes profit, not cost.",
    text:
      "It organizes information, speeds up tasks and reduces everyday errors. Explore YESOD projects and solutions and follow the updates already transforming businesses.",
    projects: "Explore projects",
    solutions: "See solutions",
    news: "Follow AI updates",
  },
  es: {
    welcome: "Bienvenido al",
    titleOne: "Automatiza lo que consume a tu equipo. Potencia lo que solo el humano hace.",
    titleTwo: "Así la IA se convierte en ganancia y no en costo.",
    text:
      "Organiza información, acelera tareas y reduce errores del día a día. Conoce los proyectos y soluciones de YESOD y sigue las novedades que ya están transformando empresas.",
    projects: "Conocer proyectos",
    solutions: "Ver soluciones",
    news: "Seguir novedades",
  },
};

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
    <section className="border-y border-primary/15 bg-card py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-center">
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-placeholder-gradient shadow-soft">
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
  const { t, lang } = useI18n();
  const hero = heroCopy[lang];
  useLocalizedMeta("meta.home.title", "meta.home.desc");

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-hero-gradient">
        <HeroBackdrop />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-deep">
              {t("brand.tagline")}
            </p>
            <p className="mt-7 text-base font-medium text-slate-600">{hero.welcome}</p>
            <h1 className="mt-1 font-display text-5xl font-bold leading-[0.95] tracking-[-0.045em] text-primary-deep sm:text-6xl lg:text-7xl">
              YESOD <span className="text-brand-gradient">HUB</span>
            </h1>
            <p className="mt-7 max-w-2xl font-display text-xl leading-snug font-semibold text-foreground sm:text-2xl">
              {hero.titleOne}{" "}
              <span className="text-primary">{hero.titleTwo}</span>
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">{hero.text}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/projetos">{hero.projects}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/25 bg-white/75">
                <Link to="/produtos">{hero.solutions}</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-primary-deep hover:bg-white/45">
                <Link to="/hub">{hero.news}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </div>
          </div>

          <div className="hero-feature-panel rounded-2xl border border-white/15 bg-brand-gradient p-5 text-white sm:p-7">
            <div className="grid gap-3">
              {pillars.map((pillar, index) => (
                <Link
                  key={pillar.titleKey}
                  to={pillar.to}
                  className="group flex items-start gap-4 rounded-xl border border-transparent p-4 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/12 text-white">
                    <pillar.icon className="h-4.5 w-4.5" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{t(pillar.titleKey)}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/72">{t(pillar.textKey)}</span>
                  </span>
                  <span className="mt-1 text-xs text-white/50">0{index + 1}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-section-gradient">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <SectionHeading title={t("home.pillarsTitle")} text={t("home.pillarsText")} />
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-primary/15 bg-primary/15 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <Link key={pillar.titleKey} to={pillar.to} className="group bg-white/92 p-6 hover:bg-white">
                <pillar.icon className="h-5 w-5 text-primary" strokeWidth={1.7} aria-hidden="true" />
                <h3 className="mt-8 text-base group-hover:text-primary">{t(pillar.titleKey)}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(pillar.textKey)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FounderSection />

      <section className="bg-section-gradient">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading title={t("home.productsTitle")} text={t("home.productsText")} />
            <Button asChild variant="outline" className="bg-white/80">
              <Link to="/produtos">{t("home.seeProducts")}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {PRODUCTS.map((product) => (
              <article key={product.id} className="rounded-xl border border-primary/15 bg-white/92 p-6 shadow-soft">
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
        </div>
      </section>

      <section className="border-y border-primary/15 bg-card py-20 sm:py-24">
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

      <section className="bg-section-gradient">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="home-orange-panel rounded-2xl px-7 py-12 text-white shadow-lift sm:px-12 sm:py-14">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl">{t("home.finalTitle")}</h2>
              <p className="mt-4 leading-7 text-white/75">{t("home.finalText")}</p>
              <Button asChild size="lg" variant="secondary" className="mt-8">
                <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">{t("common.talkToYesod")}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
