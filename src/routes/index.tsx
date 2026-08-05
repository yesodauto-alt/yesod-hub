import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Layers, Lock, Newspaper, Sparkles, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, useLocalizedMeta, type Lang, type TranslationKey } from "@/lib/i18n";
import type { FounderSettings } from "@/lib/projects";
import { SITE_BUCKET, useMediaUrl } from "@/lib/storage";
import {
  DEFAULT_AI_EXPERIENCE,
  defaultConfigurableProducts,
  type AiExperienceSettings,
  type ConfigurableProduct,
  whatsappUrl,
} from "@/lib/yesod";

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

function useHeroParallax() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallScreen = window.matchMedia("(max-width: 1023px)");
    if (reducedMotion.matches || smallScreen.matches) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = Math.max(-28, Math.min(28, (window.scrollY - 140) * 0.04));
        setOffset(next);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return offset;
}

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
    <section className="home-reveal border-y border-primary/15 bg-card py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-center">
        <div className="overflow-hidden rounded-md border border-primary/15 bg-placeholder-gradient shadow-soft">
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
          {bio && (
            <div
              className="rich-text mt-5 max-w-3xl whitespace-pre-line break-words text-base leading-8 text-slate-700"
              dangerouslySetInnerHTML={{ __html: bio }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Home() {
  const { t, tm, lang } = useI18n();
  const hero = heroCopy[lang];
  const parallaxOffset = useHeroParallax();
  const productsQuery = useQuery({
    queryKey: ["site-settings", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "products").maybeSingle();
      if (error) throw error;
      return Array.isArray(data?.value) ? (data.value as unknown as ConfigurableProduct[]) : null;
    },
  });
  const aiQuery = useQuery({
    queryKey: ["site-settings", "ai-experience"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "ai_experience").maybeSingle();
      if (error) throw error;
      return data?.value ? (data.value as unknown as AiExperienceSettings) : null;
    },
  });
  const products = (productsQuery.data ?? defaultConfigurableProducts()).filter((product) => product.published);
  const aiExperience = { ...DEFAULT_AI_EXPERIENCE, ...aiQuery.data };
  useLocalizedMeta("meta.home.title", "meta.home.desc");

  return (
    <div className="home-fade-in">
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-deep">
              {t("brand.tagline")}
            </p>
            <div className="mt-4 h-0.5 w-14 bg-[#e86f22]" aria-hidden="true" />
            <p className="mt-7 text-base font-medium text-slate-600">{hero.welcome}</p>
            <h1 className="mt-1 font-display text-5xl font-bold leading-[0.95] tracking-[-0.045em] text-primary-deep sm:text-6xl lg:text-7xl">
              YESOD <span className="text-brand-gradient">HUB</span>
            </h1>
            <p className="mt-7 max-w-2xl font-display text-xl leading-snug font-semibold text-foreground sm:text-2xl">
              <span className="hero-zoom-copy text-[#d75a12]">{hero.titleOne}</span>{" "}
              <span className="text-primary">{hero.titleTwo}</span>
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">{hero.text}</p>

            <div className="mt-16 flex flex-wrap gap-3 sm:mt-20">
              <Button asChild size="lg" className="bg-[#e86f22] text-white hover:bg-[#cf5c16]">
                <Link to="/projetos">{hero.projects}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border bg-white">
                <Link to="/produtos">{hero.solutions}</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-primary-deep hover:bg-muted">
                <Link to="/hub">{hero.news}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </div>
          </div>

          <div className="hero-panel-float relative">
            <div
              aria-hidden="true"
              className="hero-orange-rail absolute -right-5 top-8 h-[78%] w-12 bg-[#e86f22] will-change-transform"
              style={{ transform: `translate3d(0, ${parallaxOffset}px, 0)` }}
            />
            <div className="relative border border-border bg-white p-5 shadow-soft sm:p-7">
              <div className="grid">
              {pillars.map((pillar, index) => (
                <Link
                  key={pillar.titleKey}
                  to={pillar.to}
                  className="group flex items-start gap-4 border-b border-border p-4 transition-colors last:border-b-0 hover:bg-muted/60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#fff1e7] text-[#d75a12]">
                    <pillar.icon className="h-4.5 w-4.5" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-primary-deep">{t(pillar.titleKey)}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{t(pillar.textKey)}</span>
                  </span>
                  <span className="mt-1 text-xs font-semibold text-[#d75a12]">0{index + 1}</span>
                </Link>
              ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-reveal bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <SectionHeading title={t("home.pillarsTitle")} text={t("home.pillarsText")} />
          <div className="mt-10 grid gap-px border-y border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <Link key={pillar.titleKey} to={pillar.to} className="interactive-card group bg-white p-6 transition-colors hover:bg-[#fff8f3]">
                <pillar.icon className="h-5 w-5 text-[#d75a12]" strokeWidth={1.7} aria-hidden="true" />
                <h3 className="mt-8 text-base group-hover:text-primary">{t(pillar.titleKey)}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(pillar.textKey)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FounderSection />

      {aiExperience.enabled && aiExperience.url && (
        <section className="home-reveal border-y border-purple-200 bg-purple-50">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-14">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-700">Experiência interativa</p>
              <h2 className="mt-3 text-2xl text-purple-950 sm:text-3xl">{aiExperience.headline}</h2>
              <p className="mt-3 leading-7 text-purple-950/70">{aiExperience.description}</p>
            </div>
            <Button asChild size="lg" className="shrink-0 bg-purple-700 text-white hover:bg-purple-800">
              <a href={aiExperience.url} target="_blank" rel="noreferrer noopener">{aiExperience.buttonLabel}</a>
            </Button>
          </div>
        </section>
      )}

      <section className="home-reveal bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading title={t("home.productsTitle")} text={t("home.productsText")} />
            <Button asChild variant="outline" className="bg-white/80">
              <Link to="/produtos">{t("home.seeProducts")}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <article key={product.id} className="interactive-card border border-border border-t-2 border-t-[#e86f22] bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg">{tm(product.name)}</h3>
                  {product.featured && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#fff1e7] px-2.5 py-1 text-[11px] font-semibold text-[#d75a12]">
                      <Sparkles className="h-3 w-3" aria-hidden="true" /> {t("products.featured")}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{tm(product.description)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-reveal border-y border-primary/15 bg-card py-20 sm:py-24">
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

      <section className="home-reveal bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="relative overflow-hidden bg-navy px-7 py-12 text-white shadow-lift sm:px-12 sm:py-14">
            <div className="absolute inset-y-0 left-0 w-1 bg-[#e86f22]" />
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl">{t("home.finalTitle")}</h2>
              <p className="mt-4 leading-7 text-white/75">{t("home.finalText")}</p>
              <Button asChild size="lg" className="mt-8 bg-[#e86f22] text-white hover:bg-[#cf5c16]">
                <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">{t("common.talkToYesod")}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
