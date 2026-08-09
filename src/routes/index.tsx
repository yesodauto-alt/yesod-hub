import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, Layers, Lock, Newspaper, Sparkles, UserRound } from "lucide-react";
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
  hubDescriptor: string;
}> = {
  pt: {
    welcome: "Bem-vindo ao",
    titleOne: "Recupere o tempo que seu time perde em tarefas repetitivas — e transforme isso em resultado.",
    titleTwo: "IA não é custo. É tempo devolvido.",
    text:
      "Seu time passa horas em trabalho braçal que uma máquina faz em segundos. A YESOD usa IA para devolver essas horas — e o que era custo vira investimento que gera eficiência, tempo e crescimento.",
    projects: "Conhecer projetos",
    solutions: "Ver soluções",
    news: "Explorar a Central de Conteúdo",
    hubDescriptor: "Seu espaço de informação, conteúdo e direção com IA.",
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
    hubDescriptor: "Your space for information, content and AI-powered direction.",
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
    hubDescriptor: "Tu espacio de información, contenido y orientación con IA.",
  },
};

const homeNarrative = {
  pt: {
    simpleTitle: "O que é automação com IA, afinal?",
    simpleLead: "Em linguagem simples: é tirar o trabalho braçal do time e deixar a máquina cuidar do repetitivo.",
    simpleItems: [
      "Tarefas que hoje seu time digita, copia, cola e confere manualmente — horas perdidas todos os dias.",
      "A YESOD cria fluxos onde a IA lê, organiza e responde por você — sem erro, sem cansaço, sem hora extra.",
      "O resultado: seu time para de ser máquina e volta a pensar. E pensar é o que gera dinheiro.",
    ],
    investTitle: "IA é investimento, não custo",
    investRows: [
      ["Tarefas repetitivas feitas à mão, com erro e lentidão", "Tarefas feitas pela IA em segundos"],
      ["Tempo preso em planilha e copiar/colar", "Tempo livre para decisão e criação"],
      ["IA como promessa complicada", "IA como ferramenta que já funciona"],
      ["Hora extra e retrabalho", "Investimento que devolve tempo"],
    ],
    investMessage: "Não é sobre ter IA. É sobre usar a IA certa, do jeito certo, para o seu problema. Quem paga por IA sem saber usar, paga caro. Quem usa a YESOD, transforma custo em retorno.",
    bridgeTitle: "IA não resolve tudo sozinha. E é exatamente por isso que a YESOD existe.",
    bridgeItems: [
      "A IA precisa de alguém que entenda o seu negócio para saber o que automatizar primeiro — senão você automatiza o que não importa.",
      "A IA precisa de configuração, integração e acompanhamento para funcionar de verdade — senão é só uma promessa cara.",
      "A YESOD é esse meio-termo: a expertise de quem já construiu automações reais, aplicada ao seu caso. Resultado, não hype.",
    ],
    proofTitle: "Resultados reais, não promessas.",
    proofItems: ["Reduzimos em 70% o tempo de emissão de relatórios. — [Nome, cargo]", "Liberamos o time comercial de horas de digitação manual por semana. — [Nome, cargo]", "Automação que antes parecia impossível, funcionando em dias. — [Nome, cargo]"],
    qualifyTitle: "A YESOD não é para você se:",
    qualifyItems: ["Você quer IA só por hype, sem pensar em resultado.","Você espera que a IA resolva tudo sozinha, sem estratégia.","Você prefere continuar perdendo horas em tarefas manuais.","Você está satisfeito com o tempo que seu time desperdiça.","Você não quer investir para recuperar tempo e eficiência."],
    qualifyCta: "Se você quer resultado de verdade, vamos conversar.",
    guaranteeTitle: "Comece com um diagnóstico. Sem compromisso.",
    guaranteeText: "A YESOD começa mapeando a sua operação para mostrar, na prática, o que pode ser automatizado primeiro. Você entende o valor antes de investir.",
    faqTitle: "Perguntas que todo cliente faz",
    faq: [
      ["Isso vai substituir meu time?", "Não. Libera seu time para decisão, criação e atendimento."],
      ["Quanto custa?", "Menos do que a hora extra e o retrabalho que você já paga hoje."],
      ["Preciso entender de tecnologia?", "Não. A YESOD cuida da estratégia, configuração e integração."],
      ["Isso funciona para a minha empresa?", "Sim. Começamos com um diagnóstico para mapear prioridades."],
      ["O que é automação com IA?", "É tirar o trabalho repetitivo do time e deixar a máquina fazer."],
    ],
  },
  en: {
    simpleTitle: "What is AI automation, really?",
    simpleLead: "In simple terms: remove repetitive manual work and give your team time to think.",
    simpleItems: ["Tasks your team types, copies, pastes and checks manually.", "Flows where AI reads, organizes and replies for you — without fatigue or overtime.", "The result: your team stops acting like a machine and starts thinking again."],
    investTitle: "AI is an investment, not a cost",
    investRows: [["Manual tasks with errors and delays", "Tasks completed by AI in seconds"], ["Time trapped in spreadsheets", "Time for decisions and creativity"], ["AI as a complicated promise", "AI as a tool that works"], ["Overtime and rework", "An investment that gives time back"]],
    investMessage: "It is not about having AI. It is about using the right AI for your problem. YESOD delivers automation that works.",
    bridgeTitle: "AI does not solve everything alone. That is why YESOD exists.",
    bridgeItems: ["AI needs business understanding to know what to automate first.", "AI needs configuration, integration and follow-up to work in real life.", "YESOD brings that expertise to your case."],
    proofTitle: "Results that give time back",
    proofItems: ["70% less time spent issuing reports.", "Commercial teams freed from weekly manual typing.", "Automation that seemed impossible, working in days."],
    qualifyTitle: "YESOD is not for you if:", qualifyItems: ["You want AI only for hype.","You expect AI to solve everything alone.","You prefer losing hours on manual tasks.","You are satisfied with wasted team time.","You do not want to invest in efficiency."], qualifyCta: "If you want real results, let us talk.", guaranteeTitle: "Start with a diagnosis. No commitment.", guaranteeText: "YESOD maps your operation and shows what can be automated first.",
    faqTitle: "Questions every client asks",
    faq: [["Will this replace my team?", "No. It frees your team for decisions, creativity and service."], ["How much does it cost?", "Less than the overtime and rework you already pay for."], ["Do I need to understand technology?", "No. YESOD handles the strategy and integration."], ["Will it work for my company?", "Yes. We start with a diagnosis to map priorities."], ["What is AI automation?", "Removing repetitive work so the machine can handle it."]],
  },
  es: {
    simpleTitle: "¿Qué es la automatización con IA?",
    simpleLead: "En pocas palabras: quitar el trabajo repetitivo y devolver tiempo a tu equipo.",
    simpleItems: ["Tareas que hoy el equipo escribe, copia, pega y revisa manualmente.", "Flujos donde la IA lee, organiza y responde por ti — sin cansancio ni horas extra.", "El resultado: tu equipo deja de ser una máquina y vuelve a pensar."],
    investTitle: "La IA es una inversión, no un costo",
    investRows: [["Tareas manuales con errores y lentitud", "Tareas hechas por la IA en segundos"], ["Tiempo atrapado en hojas de cálculo", "Tiempo para decidir y crear"], ["IA como promesa complicada", "IA como herramienta que funciona"], ["Horas extra y retrabajo", "Inversión que devuelve tiempo"]],
    investMessage: "No se trata de tener IA. Se trata de usar la IA correcta para tu problema. YESOD entrega automatización funcionando.",
    bridgeTitle: "La IA no lo resuelve todo sola. Por eso existe YESOD.",
    bridgeItems: ["La IA necesita entender el negocio para saber qué automatizar primero.", "Necesita configuración, integración y seguimiento para funcionar de verdad.", "YESOD lleva esa experiencia a tu caso."],
    proofTitle: "Resultados que devuelven tiempo",
    proofItems: ["70% menos tiempo para emitir informes.", "El equipo comercial libre de horas de digitación manual.", "Automatización que parecía imposible, funcionando en días."],
    qualifyTitle: "YESOD no es para ti si:", qualifyItems: ["Quieres IA solo por hype.","Esperas que la IA resuelva todo sola.","Prefieres seguir perdiendo horas en tareas manuales.","Estás satisfecho con el tiempo desperdiciado.","No quieres invertir para recuperar eficiencia."], qualifyCta: "Si quieres resultados reales, hablemos.", guaranteeTitle: "Empieza con un diagnóstico. Sin compromiso.", guaranteeText: "YESOD mapea tu operación y muestra qué automatizar primero.",
    faqTitle: "Preguntas de cada cliente",
    faq: [["¿Esto sustituirá a mi equipo?", "No. Libera tiempo para decidir, crear y atender."], ["¿Cuánto cuesta?", "Menos que las horas extra y el retrabajo actuales."], ["¿Necesito saber de tecnología?", "No. YESOD se ocupa de la estrategia e integración."], ["¿Funciona para mi empresa?", "Sí. Empezamos con un diagnóstico."], ["¿Qué es la automatización con IA?", "Quitar el trabajo repetitivo y dejar que la máquina lo haga."]],
  },
} as const;

function narrativeFor(lang: Lang) {
  return homeNarrative[lang];
}

const faqKeys: { q: TranslationKey; a: TranslationKey }[] = [];

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
  const visualQuery = useQuery({
    queryKey: ["site-settings", "visual-editor"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "visual_editor")
        .maybeSingle();
      if (error) throw error;
      return (data?.value ?? {}) as Record<string, Record<string, { text?: string }>>;
    },
  });
  const heroPageOverrides = visualQuery.data?.[`/::${lang}`] ?? {};
  const editedHeroText = (editId: string, fallback: string) =>
    heroPageOverrides[`[data-edit-id="${editId}"]`]?.text ?? fallback;
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
  const legacyAiExperience = { ...DEFAULT_AI_EXPERIENCE, ...aiQuery.data };
  const localizeAiField = (
    value: unknown,
    fallback: typeof DEFAULT_AI_EXPERIENCE.headline,
  ) => typeof value === "string"
    ? { ...fallback, pt: value }
    : { ...fallback, ...(value && typeof value === "object" ? value : {}) };
  const aiExperience: AiExperienceSettings = {
    ...legacyAiExperience,
    eyebrow: localizeAiField(legacyAiExperience.eyebrow, DEFAULT_AI_EXPERIENCE.eyebrow),
    headline: localizeAiField(legacyAiExperience.headline, DEFAULT_AI_EXPERIENCE.headline),
    description: localizeAiField(legacyAiExperience.description, DEFAULT_AI_EXPERIENCE.description),
    buttonLabel: localizeAiField(legacyAiExperience.buttonLabel, DEFAULT_AI_EXPERIENCE.buttonLabel),
  };
  useLocalizedMeta("meta.home.title", "meta.home.desc");

  return (
    <div className="home-fade-in">
      <section
        className="yesod-neural-hero relative isolate overflow-hidden border-b border-border"
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
          event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
        }}
      >
        <div className="yesod-neural-ambient" aria-hidden="true" />


        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-12 sm:pb-28 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="yesod-hero-copy">
            <p data-edit-id="home.hero.eyebrow" className="text-xs font-semibold uppercase tracking-[0.24em] text-white/78">
              {editedHeroText("home.hero.eyebrow", t("brand.tagline"))}
            </p>
            <div className="mt-4 flex items-center gap-2" aria-hidden="true">
              <span className="h-px w-14 bg-[#e86f22]" />
              <span className="yesod-signal-dot h-1.5 w-1.5 rounded-full bg-[#ff8a3d]" />
            </div>
            <p data-edit-id="home.hero.welcome" className="mt-7 text-base font-medium text-white/70">{editedHeroText("home.hero.welcome", hero.welcome)}</p>
            <div className="mt-1 flex flex-wrap items-end gap-x-4 gap-y-2">
              <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                <span data-edit-id="home.hero.brand">{editedHeroText("home.hero.brand", "YESOD")}</span>
              </h1>
              <span data-edit-id="home.hero.hub-label" className="mb-1.5 inline-flex items-center gap-2 border-l border-[#e86f22]/65 pl-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#ff8a3d] sm:mb-2 sm:text-[0.82rem]">
                {editedHeroText("home.hero.hub-label", "HUB")}
              </span>
            </div>
            <p data-edit-id="home.hero.descriptor" className="mt-3 w-fit max-w-[31rem] font-sans text-[0.62rem] font-light uppercase leading-tight tracking-[0.15em] text-white/62 sm:whitespace-nowrap sm:text-[0.68rem] sm:tracking-[0.19em]">
              {editedHeroText("home.hero.descriptor", hero.hubDescriptor)}
            </p>
            <p className="mt-12 max-w-2xl font-display text-xl leading-snug font-semibold text-foreground sm:mt-16 sm:text-2xl">
              <span data-edit-id="home.hero.title-one-v2" className="hero-zoom-copy text-[1.65rem] font-black leading-[1.12] tracking-[-0.025em] uppercase text-[#d75a12] sm:text-[2rem] lg:text-[2.15rem]">{editedHeroText("home.hero.title-one-v2", hero.titleOne)}</span>{" "}
              <span data-edit-id="home.hero.title-two-v2" className="hero-shimmer-copy text-primary">{editedHeroText("home.hero.title-two-v2", hero.titleTwo)}</span>
            </p>
            <p data-edit-id="home.hero.body-v2" className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{editedHeroText("home.hero.body-v2", hero.text)}</p>
            <div className="mt-5 inline-flex items-center gap-2 border border-[#e86f22]/40 bg-[#e86f22]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#ff9a5e]"><span className="h-1.5 w-1.5 rounded-full bg-[#ff8a3d] shadow-[0_0_12px_#ff8a3d]" />Automações reais em operação — IA que já funciona, não promessa.</div>

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

          <div className="hero-panel-float yesod-intelligence-panel relative">
            <div
              aria-hidden="true"
              className="hero-orange-rail absolute -right-5 top-8 h-[78%] w-12 bg-brand-gradient will-change-transform"
              style={{ transform: `translate3d(0, ${parallaxOffset}px, 0)` }}
            />
            <div className="yesod-brain-orbit" aria-hidden="true">
              <span className="yesod-brain-ring yesod-brain-ring-one" />
              <img src="/yesod-brain-mark.svg" alt="" className="yesod-brain-mark" />
            </div>
            <div className="yesod-panel-scan relative overflow-hidden border border-white/12 bg-[#0d0e10]/92 p-5 shadow-2xl shadow-black/45 backdrop-blur-xl sm:p-7">
              <div className="grid pt-14 sm:pt-16">
              {pillars.map((pillar, index) => (
                <Link
                  key={pillar.titleKey}
                  to={pillar.to}
                  className="group flex items-start gap-4 border-b border-white/10 p-4 transition-colors last:border-b-0 hover:bg-white/[0.045]"
                >
                  <span className="yesod-tech-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[#e86f22]/25 bg-[#e86f22]/10 text-[#ff8a3d]">
                    <pillar.icon className="relative z-10 h-4.5 w-4.5" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{t(pillar.titleKey)}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/58">{t(pillar.textKey)}</span>
                  </span>
                  <span className="mt-1 text-xs font-semibold text-[#ff8a3d]">0{index + 1}</span>
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
                <span className="yesod-tech-icon flex h-10 w-10 items-center justify-center rounded-sm border border-[#e86f22]/25 bg-[#e86f22]/10 text-[#ff8a3d]">
                  <pillar.icon className="relative z-10 h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <h3 className="mt-8 text-base group-hover:text-primary">{t(pillar.titleKey)}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(pillar.textKey)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-reveal bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <SectionHeading title={narrativeFor(lang).simpleTitle} text={narrativeFor(lang).simpleLead} />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {narrativeFor(lang).simpleItems.map((item) => (
              <article key={item} className="interactive-card border-t-2 border-[#e86f22] bg-white p-6 shadow-soft">
                <p className="text-base leading-7 text-foreground/85">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-reveal border-y border-primary/15 bg-card py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading title={narrativeFor(lang).investTitle} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {narrativeFor(lang).investRows.map(([without, withYesod]) => (
              <article key={without} className="border border-border border-l-2 border-l-[#e86f22] bg-card p-5 shadow-soft">
                <p className="text-sm leading-6 text-muted-foreground"><span className="font-semibold text-[#d75a12]">Hoje:</span> {without}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-foreground"><span className="text-[#d75a12]">Com a YESOD:</span> {withYesod}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-base font-medium leading-7 text-[#c65313]">{narrativeFor(lang).investMessage}</p>
        </div>
      </section>

      <section className="home-reveal bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <SectionHeading title={narrativeFor(lang).bridgeTitle} />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {narrativeFor(lang).bridgeItems.map((item) => (
              <article key={item} className="border border-border bg-card p-6 shadow-soft">
                <p className="text-base leading-7 text-muted-foreground">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FounderSection />

      {aiExperience.enabled && aiExperience.url && (
        <section className="home-reveal border-y border-[#e86f22]/35 bg-[#111214]">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center sm:py-14">
            <span className="yesod-tech-icon yesod-tech-icon-feature flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff9a5e]/45 bg-[#e86f22] text-white shadow-lg shadow-[#e86f22]/25">
              <Bot className="relative z-10 h-8 w-8" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <div className="max-w-2xl sm:pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e86f22]">{tm(aiExperience.eyebrow)}</p>
              <h2 className="mt-3 text-2xl text-white sm:text-3xl">{tm(aiExperience.headline)}</h2>
              <p className="mt-3 leading-7 text-white/75">{tm(aiExperience.description)}</p>
            </div>
            <Button asChild size="lg" className="shrink-0 bg-[#e86f22] text-white hover:bg-[#cf5c16]">
              <a href={aiExperience.url} target="_blank" rel="noreferrer noopener">{tm(aiExperience.buttonLabel)}</a>
            </Button>
          </div>
        </section>
      )}

      <section className="home-reveal bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading title={t("home.productsTitle")} text={t("home.productsText")} />
            <Button asChild variant="outline" className="border-[#e86f22] bg-[#e86f22] text-white hover:border-[#cf5c16] hover:bg-[#cf5c16] hover:text-white">
              <Link to="/produtos">{t("home.seeProducts")}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <article key={product.id} className="solution-preview-card interactive-card border border-border border-t-2 border-t-[#e86f22] bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg">{tm(product.name)}</h3>
                  {product.featured && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#fff1e7] px-2.5 py-1 text-[11px] font-semibold text-[#d75a12]">
                      <Sparkles className="yesod-featured-spark h-3 w-3" aria-hidden="true" /> {t("products.featured")}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{tm(product.description)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-reveal bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <SectionHeading title={narrativeFor(lang).qualifyTitle} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {narrativeFor(lang).qualifyItems.map((item) => <div key={item} className="border border-[#e86f22]/30 bg-card p-4 text-sm leading-6 text-muted-foreground">✕ {item}</div>)}
          </div>
          <p className="mt-8 text-lg font-semibold text-foreground">{narrativeFor(lang).qualifyCta}</p>
          <Button asChild className="mt-4 bg-[#e86f22] text-white hover:bg-[#cf5c16]"><a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">Falar com a YESOD</a></Button>
        </div>
      </section>

      <section className="home-reveal border-y border-primary/15 bg-card py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeading title={narrativeFor(lang).guaranteeTitle} text={narrativeFor(lang).guaranteeText} />
        </div>
      </section>

      <section className="home-reveal border-y border-primary/15 bg-card py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeading title={narrativeFor(lang).faqTitle} />
          <Accordion type="single" collapsible className="mt-8">
            {narrativeFor(lang).faq.map(([question, answer], index) => (
              <AccordionItem key={question} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{question}</AccordionTrigger>
                <AccordionContent className="leading-7 text-muted-foreground">{answer}</AccordionContent>
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
              <h2 className="text-3xl sm:text-4xl">Pronto para parar de perder tempo e começar a ganhar eficiência?</h2>
              <p className="mt-4 leading-7 text-white/75">Conte qual rotina consome mais tempo do seu time e a gente mostra por onde começar.</p>
              <Button asChild size="lg" className="mt-8 bg-[#e86f22] text-white hover:bg-[#cf5c16]">
                <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">{t("common.talkToYesod")}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}      <section className="home-reveal border-y border-primary/15 bg-card py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeading title={narrativeFor(lang).guaranteeTitle} text={narrativeFor(lang).guaranteeText} />
        </div>
      </section>


