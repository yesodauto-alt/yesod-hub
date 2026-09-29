import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, Layers, Lock, Newspaper, Sparkles, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MarleyChatDialog } from "@/components/MarleyChatDialog";
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
  primary: string;
  projects: string;
  hubDescriptor: string;
}> = {
  pt: {
    welcome: "Bem-vindo ao",
    titleOne: "Seu time perde horas em tarefas que uma máquina faz em segundos.",
    titleTwo: "IA não é custo. É tempo devolvido.",
    text:
      "Enquanto o trabalho repetitivo consome sua operação, sua equipe deixa de usar tempo onde realmente gera valor. A YESOD transforma processos manuais em fluxos automatizados para devolver capacidade, velocidade e foco ao time.",
    primary: "Quero descobrir o que posso automatizar",
    projects: "Ver projetos demonstrativos",
    hubDescriptor: "Seu espaço de informação, conteúdo e direção com IA.",
  },
  en: {
    welcome: "Welcome to",
    titleOne: "Your team loses hours on tasks a machine completes in seconds.",
    titleTwo: "AI is not a cost. It is time returned.",
    text:
      "While repetitive work consumes your operation, your team loses time that should create value. YESOD turns manual processes into automated flows to return capacity, speed and focus to people.",
    primary: "Discover what I can automate",
    projects: "See demonstration projects",
    hubDescriptor: "Your space for information, content and AI-powered direction.",
  },
  es: {
    welcome: "Bienvenido al",
    titleOne: "Tu equipo pierde horas en tareas que una máquina hace en segundos.",
    titleTwo: "La IA no es un costo. Es tiempo recuperado.",
    text:
      "Mientras el trabajo repetitivo consume tu operación, el equipo pierde tiempo que debería generar valor. YESOD transforma procesos manuales en flujos automatizados para devolver capacidad, velocidad y foco.",
    primary: "Quiero descubrir qué puedo automatizar",
    projects: "Ver proyectos demostrativos",
    hubDescriptor: "Tu espacio de información, contenido y orientación con IA.",
  },
};

const homeNarrative = {
  pt: {
    shiftEyebrow: "A mudança que importa",
    shiftTitle: "A máquina executa. O humano volta a pensar.",
    shiftLead: "Automação não é colocar IA em tudo. É retirar da operação aquilo que não precisa mais consumir atenção humana.",
    shiftColumns: [
      ["HOJE", "Copiar, colar, conferir, responder, atualizar planilhas e repetir tarefas que drenam tempo todos os dias."],
      ["COM AUTOMAÇÃO", "A IA lê, organiza, integra sistemas, executa rotinas e mantém o fluxo funcionando com consistência."],
      ["COM O HUMANO", "Seu time usa o tempo recuperado para decidir, criar, vender, atender melhor e conduzir o que exige julgamento."],
    ],
    dataEyebrow: "O que os dados já mostram",
    dataTitle: "A IA já está transformando produtividade em operações reais.",
    dataLead: "Estudos independentes mostram ganhos concretos quando a IA é aplicada aos processos certos. Os resultados apresentados são referências de mercado e podem variar conforme cada operação.",
    evidence: [
      ["+14%", "mais produtividade", "em atendimento ao cliente, em estudo com 5.179 agentes", "NBER", "https://www.nber.org/papers/w31161"],
      ["−40%", "menos tempo", "em tarefas profissionais de escrita; a qualidade também aumentou", "Science / Stanford", "https://scale.stanford.edu/publications/experimental-evidence-productivity-effects-generative-artificial-intelligence"],
      ["+25%", "mais velocidade", "em tarefas de conhecimento dentro da fronteira de capacidade da IA", "Harvard / BCG", "https://aiinstitute.hbs.edu/navigating-the-jagged-technological-frontier/"],
      ["60–70%", "do tempo de trabalho", "está em atividades com potencial técnico de automação com tecnologias atuais", "McKinsey Global Institute", "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier"],
    ],
    dataBridge: "A tecnologia já provou que consegue devolver tempo. A diferença está em saber onde aplicá-la.",
    demoEyebrow: "Capacidade aplicada",
    demoTitle: "Projetos demonstrativos YESOD",
    demoLead: "Soluções construídas para mostrar, na prática, como processos de atendimento, operação, integração e gestão podem ser transformados com automação e inteligência artificial.",
    demoPoints: [
      "Problema operacional apresentado com clareza, sem jargão técnico.",
      "Automação demonstrada funcionando como solução aplicada.",
      "Potencial de ganho explicado sem inventar métricas ou resultados de clientes.",
    ],
    bridgeEyebrow: "Tecnologia + operação",
    bridgeTitle: "IA não resolve tudo sozinha. E é exatamente por isso que a YESOD existe.",
    bridgeItems: [
      "Primeiro entendemos o processo: onde há repetição, gargalo, retrabalho ou informação espalhada.",
      "Depois desenhamos o fluxo: IA, automações, integrações e regras entram apenas onde realmente fazem sentido.",
      "Por fim, evoluímos a operação: acompanhamos o uso e ajustamos a solução para continuar útil no dia a dia.",
    ],
    journey: [
      ["01", "ENXERGAMOS", "Mapeamos o que consome tempo, gera erro ou depende de trabalho manual."],
      ["02", "CONSTRUÍMOS", "Transformamos o processo em uma automação desenhada para a sua realidade."],
      ["03", "INTEGRAMOS", "Conectamos dados, sistemas, canais e IA em um fluxo único."],
      ["04", "EVOLUÍMOS", "A solução acompanha a operação em vez de virar mais uma ferramenta abandonada."],
    ],
    founderEyebrow: "Founder • visão por trás da YESOD",
    founderSupport: "Tecnologia só cria valor quando é aplicada a um problema real. A YESOD nasce dessa visão: usar automação e IA para reduzir o que é mecânico e abrir espaço para o que exige decisão, criatividade e relação humana.",
    ecosystemEyebrow: "Mais que uma vitrine",
    ecosystemTitle: "O YESOD HUB é onde tecnologia, projetos e conteúdo se encontram.",
    ecosystemLead: "Depois de entender o que a YESOD faz, você pode explorar projetos, acompanhar o que estamos construindo e acessar conteúdos e áreas exclusivas.",
    qualifyTitle: "A YESOD não é para você se:",
    qualifyItems: ["Você quer IA só por hype, sem pensar em resultado.", "Você espera que a IA resolva tudo sozinha, sem estratégia.", "Você prefere continuar perdendo horas em tarefas manuais.", "Você não quer rever processos antes de automatizá-los."],
    qualifyCta: "Se você quer identificar onde a IA pode realmente gerar valor, vamos conversar.",
    guaranteeTitle: "Comece com um diagnóstico. Sem compromisso.",
    guaranteeText: "A YESOD começa mapeando a sua operação para mostrar o que pode ser automatizado primeiro. Você entende o caminho antes de decidir o investimento.",
    faqTitle: "Perguntas que todo cliente faz",
    faq: [
      ["Isso vai substituir meu time?", "O objetivo é retirar tarefas repetitivas do caminho para que as pessoas usem tempo em decisão, criação, relacionamento e atividades que exigem julgamento humano."],
      ["Quanto custa?", "Depende do processo, integrações e complexidade. O diagnóstico existe justamente para entender o problema antes de definir uma solução e um investimento."],
      ["Preciso entender de tecnologia?", "Não. A YESOD traduz o problema operacional em arquitetura, automação e integração."],
      ["Isso funciona para a minha empresa?", "A resposta depende do processo. Por isso começamos identificando onde existe repetição, volume, gargalo ou trabalho manual que pode ser estruturado."],
      ["O que é automação com IA?", "É combinar regras, integrações e inteligência artificial para executar ou apoiar tarefas que hoje dependem de trabalho manual recorrente."],
    ],
  },
  en: {
    shiftEyebrow: "The change that matters",
    shiftTitle: "The machine executes. People think again.",
    shiftLead: "Automation is not putting AI everywhere. It is removing from operations what no longer needs human attention.",
    shiftColumns: [
      ["TODAY", "Copying, pasting, checking, replying and repeating work that drains time every day."],
      ["WITH AUTOMATION", "AI reads, organizes, connects systems and executes routines consistently."],
      ["WITH PEOPLE", "The team uses recovered time to decide, create, sell, serve and handle judgment-intensive work."],
    ],
    dataEyebrow: "What the evidence shows",
    dataTitle: "AI is already changing productivity in real operations.",
    dataLead: "Independent studies show meaningful gains when AI is applied to the right task. These are not YESOD client results or performance guarantees.",
    evidence: [
      ["+14%", "more productivity", "in customer support, in a study with 5,179 agents", "NBER", "https://www.nber.org/papers/w31161"],
      ["−40%", "less time", "on professional writing tasks, with improved quality", "Science / Stanford", "https://scale.stanford.edu/publications/experimental-evidence-productivity-effects-generative-artificial-intelligence"],
      ["+25%", "more speed", "on knowledge tasks within AI's capability frontier", "Harvard / BCG", "https://aiinstitute.hbs.edu/navigating-the-jagged-technological-frontier/"],
      ["60–70%", "of work time", "is spent on activities with technical automation potential using current technologies", "McKinsey Global Institute", "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier"],
    ],
    dataBridge: "Technology has already shown it can return time. The difference is knowing where to apply it.",
    demoEyebrow: "Applied capability",
    demoTitle: "YESOD demonstration projects",
    demoLead: "Solutions built to show how service, operations, integrations and management processes can be transformed with automation and AI.",
    demoPoints: ["A clear operational problem, without unnecessary jargon.", "The automation demonstrated as an applied solution.", "Potential impact explained without invented client metrics."],
    bridgeEyebrow: "Technology + operations",
    bridgeTitle: "AI does not solve everything alone. That is exactly why YESOD exists.",
    bridgeItems: ["We understand the process first.", "We design the right mix of AI, automation and integrations.", "We evolve the solution with the operation."],
    journey: [["01", "SEE", "Map what consumes time, creates errors or depends on manual work."], ["02", "BUILD", "Turn the process into automation designed for your reality."], ["03", "INTEGRATE", "Connect data, systems, channels and AI."], ["04", "EVOLVE", "Keep the solution useful as operations change."]],
    founderEyebrow: "Founder • the vision behind YESOD",
    founderSupport: "Technology only creates value when it is applied to a real problem. YESOD exists to reduce mechanical work and create more room for decisions, creativity and human relationships.",
    ecosystemEyebrow: "More than a showcase",
    ecosystemTitle: "YESOD HUB brings technology, projects and content together.",
    ecosystemLead: "Explore projects, follow what we are building and access exclusive content and member areas.",
    qualifyTitle: "YESOD is not for you if:",
    qualifyItems: ["You want AI only for hype.", "You expect AI to solve everything without strategy.", "You prefer keeping repetitive manual work.", "You do not want to rethink processes before automating them."],
    qualifyCta: "If you want to identify where AI can create real value, let us talk.",
    guaranteeTitle: "Start with a diagnosis. No commitment.",
    guaranteeText: "YESOD maps your operation and shows what can be automated first, so you understand the path before deciding on the investment.",
    faqTitle: "Questions every client asks",
    faq: [["Will this replace my team?", "The goal is to remove repetitive work so people can focus on decisions, creativity and relationships."], ["How much does it cost?", "It depends on process complexity and integrations. Diagnosis comes first."], ["Do I need to understand technology?", "No. YESOD translates the operational problem into architecture and automation."], ["Will this work for my company?", "It depends on the process. We first identify repetition, volume and bottlenecks."], ["What is AI automation?", "Combining rules, integrations and AI to execute or support recurring manual tasks."]],
  },
  es: {
    shiftEyebrow: "El cambio que importa",
    shiftTitle: "La máquina ejecuta. El humano vuelve a pensar.",
    shiftLead: "Automatizar no es poner IA en todo. Es retirar de la operación lo que ya no necesita atención humana.",
    shiftColumns: [["HOY", "Copiar, pegar, revisar, responder y repetir tareas que consumen tiempo."], ["CON AUTOMATIZACIÓN", "La IA lee, organiza, integra sistemas y ejecuta rutinas."], ["CON EL HUMANO", "El equipo usa el tiempo recuperado para decidir, crear, vender y atender mejor."]],
    dataEyebrow: "Lo que los datos ya muestran",
    dataTitle: "La IA ya está transformando la productividad en operaciones reales.",
    dataLead: "Estudios independientes muestran ganancias relevantes cuando la IA se aplica a la tarea correcta. Estos datos no son resultados de clientes de YESOD ni garantías de rendimiento.",
    evidence: [["+14%", "más productividad", "en atención al cliente, en un estudio con 5.179 agentes", "NBER", "https://www.nber.org/papers/w31161"], ["−40%", "menos tiempo", "en tareas profesionales de escritura, con mejora de calidad", "Science / Stanford", "https://scale.stanford.edu/publications/experimental-evidence-productivity-effects-generative-artificial-intelligence"], ["+25%", "más velocidad", "en tareas de conocimiento dentro de la capacidad de la IA", "Harvard / BCG", "https://aiinstitute.hbs.edu/navigating-the-jagged-technological-frontier/"], ["60–70%", "del tiempo de trabajo", "se dedica a actividades con potencial técnico de automatización", "McKinsey Global Institute", "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier"]],
    dataBridge: "La tecnología ya demostró que puede devolver tiempo. La diferencia está en saber dónde aplicarla.",
    demoEyebrow: "Capacidad aplicada",
    demoTitle: "Proyectos demostrativos YESOD",
    demoLead: "Soluciones construidas para mostrar cómo procesos de atención, operación, integración y gestión pueden transformarse con automatización e IA.",
    demoPoints: ["Problema operativo explicado con claridad.", "Automatización demostrada como solución aplicada.", "Potencial explicado sin inventar métricas de clientes."],
    bridgeEyebrow: "Tecnología + operación",
    bridgeTitle: "La IA no lo resuelve todo sola. Por eso existe YESOD.",
    bridgeItems: ["Primero entendemos el proceso.", "Después diseñamos la combinación correcta de IA, automatización e integraciones.", "Por último evolucionamos la solución junto con la operación."],
    journey: [["01", "VEMOS", "Mapeamos lo que consume tiempo, genera errores o depende de trabajo manual."], ["02", "CONSTRUIMOS", "Transformamos el proceso en una automatización diseñada para tu realidad."], ["03", "INTEGRAMOS", "Conectamos datos, sistemas, canales e IA."], ["04", "EVOLUCIONAMOS", "La solución acompaña los cambios de la operación."]],
    founderEyebrow: "Founder • la visión detrás de YESOD",
    founderSupport: "La tecnología solo crea valor cuando se aplica a un problema real. YESOD existe para reducir el trabajo mecánico y abrir espacio para decisión, creatividad y relación humana.",
    ecosystemEyebrow: "Más que una vitrina",
    ecosystemTitle: "YESOD HUB reúne tecnología, proyectos y contenido.",
    ecosystemLead: "Explora proyectos, acompaña lo que construimos y accede a contenidos y áreas exclusivas.",
    qualifyTitle: "YESOD no es para ti si:",
    qualifyItems: ["Quieres IA solo por hype.", "Esperas que la IA resuelva todo sin estrategia.", "Prefieres mantener tareas manuales repetitivas.", "No quieres revisar procesos antes de automatizarlos."],
    qualifyCta: "Si quieres identificar dónde la IA puede generar valor real, hablemos.",
    guaranteeTitle: "Empieza con un diagnóstico. Sin compromiso.",
    guaranteeText: "YESOD mapea tu operación y muestra qué automatizar primero para que entiendas el camino antes de decidir la inversión.",
    faqTitle: "Preguntas de cada cliente",
    faq: [["¿Esto sustituirá a mi equipo?", "El objetivo es retirar tareas repetitivas para que las personas se enfoquen en decisiones, creatividad y relaciones."], ["¿Cuánto cuesta?", "Depende del proceso y las integraciones. Primero hacemos el diagnóstico."], ["¿Necesito saber de tecnología?", "No. YESOD traduce el problema operativo en arquitectura y automatización."], ["¿Funciona para mi empresa?", "Depende del proceso. Primero identificamos repetición, volumen y cuellos de botella."], ["¿Qué es automatización con IA?", "Combinar reglas, integraciones e IA para ejecutar o apoyar tareas manuales recurrentes."]],
  },
} as const;

function narrativeFor(lang: Lang) {
  return homeNarrative[lang];
}

const hasSupabaseConfig = Boolean(
  import.meta.env["VITE_SUPABASE_URL"] && import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
);

function SectionHeading({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="max-w-3xl">
      {eyebrow && (
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-10 bg-[#e86f22]" aria-hidden="true" />
          <span className="yesod-signal-dot h-1.5 w-1.5 rounded-full bg-[#ff8a3d]" aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">{eyebrow}</p>
        </div>
      )}
      <h2 className="text-3xl font-semibold leading-[1.08] text-white sm:text-4xl lg:text-5xl">{title}</h2>
      {text && <p className="mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">{text}</p>}
    </div>
  );
}

function FounderSection({ lang }: { lang: Lang }) {
  const { t, tm } = useI18n();
  const copy = narrativeFor(lang);
  const founderQuery = useQuery({
    queryKey: ["site-settings", "founder"],
    enabled: hasSupabaseConfig,
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
    <section className="home-reveal relative overflow-hidden border-y border-white/10 bg-[#0a0b0d] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_38%,rgba(232,111,34,0.14),transparent_26rem),radial-gradient(circle_at_82%_18%,rgba(70,127,251,0.10),transparent_28rem)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] md:items-center">
        <div className="relative mx-auto w-full max-w-[390px]">
          <div className="absolute -inset-4 border border-[#e86f22]/20 bg-[#e86f22]/5 blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden border border-white/12 bg-[#111214] shadow-[0_28px_80px_-34px_rgba(232,111,34,0.42)]">
            <div className="aspect-[4/5] w-full">
              {photo ? (
                <img src={photo} alt={name || "YESOD"} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/80">
                  <UserRound className="h-12 w-12" strokeWidth={1.4} aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-5 left-5 right-5">
              {name && <p className="font-display text-xl font-semibold text-white">{name}</p>}
              {role && <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff8a3d]">{role}</p>}
            </div>
          </div>
        </div>

        <div>
          <SectionHeading eyebrow={copy.founderEyebrow} title={t("home.founderTitle")} />
          <p className="mt-7 max-w-3xl border-l border-[#467ffb]/45 pl-5 text-lg leading-8 text-white/75">{copy.founderSupport}</p>
          {bio && (
            <div
              className="rich-text mt-6 max-w-3xl whitespace-pre-line break-words text-base leading-8 text-white/62"
              dangerouslySetInnerHTML={{ __html: bio }}
            />
          )}
          <div className="mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
            <span className="h-px w-12 bg-[#467ffb]/60" />
            <span>YESOD AUTOMATION</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const { t, tm, lang } = useI18n();
  const hero = heroCopy[lang];
  const copy = narrativeFor(lang);

  const visualQuery = useQuery({
    queryKey: ["site-settings", "visual-editor"],
    enabled: hasSupabaseConfig,
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
    enabled: hasSupabaseConfig,
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "products").maybeSingle();
      if (error) throw error;
      return Array.isArray(data?.value) ? (data.value as unknown as ConfigurableProduct[]) : null;
    },
  });
  const aiQuery = useQuery({
    queryKey: ["site-settings", "ai-experience"],
    enabled: hasSupabaseConfig,
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
  const heroVideoUrl = "/yesod-hub-final.mp4";

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;

    const startVideo = () => {
      if (document.visibilityState === "hidden") return;
      video.defaultMuted = true;
      video.muted = true;
      void video.play().catch(() => {
        // A first interaction provides a second chance on restrictive mobile browsers.
      });
    };

    startVideo();
    video.addEventListener("loadedmetadata", startVideo);
    video.addEventListener("loadeddata", startVideo);
    video.addEventListener("canplay", startVideo);
    video.addEventListener("canplaythrough", startVideo);
    document.addEventListener("visibilitychange", startVideo);
    window.addEventListener("pageshow", startVideo);
    document.addEventListener("pointerdown", startVideo, { once: true });
    document.addEventListener("touchstart", startVideo, { once: true, passive: true });

    return () => {
      video.removeEventListener("loadedmetadata", startVideo);
      video.removeEventListener("loadeddata", startVideo);
      video.removeEventListener("canplay", startVideo);
      video.removeEventListener("canplaythrough", startVideo);
      document.removeEventListener("visibilitychange", startVideo);
      window.removeEventListener("pageshow", startVideo);
      document.removeEventListener("pointerdown", startVideo);
      document.removeEventListener("touchstart", startVideo);
    };
  }, []);
  useLocalizedMeta("meta.home.title", "meta.home.desc");

  return (
    <div className="home-fade-in">
      <section
        className="yesod-neural-hero relative isolate overflow-hidden border-b border-border"
      >
        <div className="yesod-neural-ambient" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-12 sm:pb-28 sm:pt-16">
          <div className="yesod-video-placeholder overflow-hidden" aria-label={lang === "pt" ? "Vídeo de apresentação da YESOD" : lang === "en" ? "YESOD presentation video" : "Video de presentación de YESOD"}>
            {heroVideoUrl ? (
              <video
                ref={heroVideoRef}
                className="h-full w-full object-cover"
                src={heroVideoUrl}
                autoPlay
                muted
                defaultMuted
                loop
                playsInline
                controls
                preload="auto"
                aria-label={lang === "pt" ? "Apresentação visual da YESOD" : lang === "en" ? "YESOD visual presentation" : "Presentación visual de YESOD"}
              />
            ) : (
              <span>{lang === "pt" ? "CARREGANDO VÍDEO" : lang === "en" ? "LOADING VIDEO" : "CARGANDO VIDEO"}</span>
            )}
          </div>

          <div className="yesod-hero-copy max-w-4xl">
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

            <div className="mt-14 max-w-3xl border-l border-white/10 pl-5 sm:mt-16 sm:pl-7">
              <p className="font-display text-xl leading-snug font-semibold sm:text-2xl">
                <span data-edit-id="home.hero.title-one-v2" className="hero-zoom-copy text-[1.72rem] font-black leading-[1.08] tracking-[-0.03em] uppercase text-[#d75a12] sm:text-[2.15rem] lg:text-[2.55rem]">{editedHeroText("home.hero.title-one-v2", hero.titleOne)}</span>{" "}
                <span data-edit-id="home.hero.title-two-v2" className="hero-shimmer-copy mt-3 inline-block text-primary">{editedHeroText("home.hero.title-two-v2", hero.titleTwo)}</span>
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-3 sm:mt-14">
              <Button asChild size="lg" className="bg-[#e86f22] px-7 text-white shadow-[0_0_28px_-10px_rgba(232,111,34,0.75)] hover:bg-[#cf5c16]">
                <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">{hero.primary}</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white">
                <Link to="/projetos">{hero.projects}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="home-reveal relative overflow-hidden border-b border-white/10 bg-[#09090b] py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(70,127,251,0.09),transparent_26rem)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow={copy.shiftEyebrow} title={copy.shiftTitle} text={copy.shiftLead} />
          <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
            {copy.shiftColumns.map(([label, text], index) => (
              <article key={label} className="relative bg-[#0d0e10] p-7 sm:p-8">
                <span className={`text-[11px] font-bold uppercase tracking-[0.22em] ${index === 1 ? "text-[#ff8a3d]" : index === 2 ? "text-[#73a1ff]" : "text-white/42"}`}>{label}</span>
                <p className="mt-6 text-lg font-medium leading-8 text-white/78">{text}</p>
                <span className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#e86f22]/35 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-reveal relative overflow-hidden border-b border-white/10 bg-[#070708] py-20 sm:py-28">
        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-[#467ffb]/8 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow={copy.dataEyebrow} title={copy.dataTitle} text={copy.dataLead} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.evidence.map(([number, label, context, source, url]) => (
              <article key={number} className="group relative overflow-hidden border border-white/10 bg-[#0e0f12] p-6 shadow-[0_20px_60px_-34px_rgba(0,0,0,0.9)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#e86f22] via-[#ff9a5e] to-[#467ffb] opacity-75" aria-hidden="true" />
                <p className="hero-shimmer-copy text-4xl font-black tracking-[-0.06em] sm:text-5xl">{number}</p>
                <p className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-[#ff8a3d]">{label}</p>
                <p className="mt-4 min-h-20 text-sm leading-6 text-white/58">{context}</p>
                <a href={url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-white/45 hover:text-[#73a1ff]">
                  {source}<ArrowRight className="h-3 w-3" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
          <div className="mt-10 max-w-4xl border-l-2 border-[#467ffb]/55 bg-[#467ffb]/5 px-6 py-5">
            <p className="text-xl font-semibold leading-8 text-white sm:text-2xl">{copy.dataBridge}</p>
            <p className="mt-3 text-xs leading-5 text-white/42">{lang === "pt" ? "Resultados variam conforme tarefa, contexto, adoção e qualidade da implementação. As fontes completas estão vinculadas em cada dado." : lang === "en" ? "Results vary by task, context, adoption and implementation quality. Full sources are linked in each metric." : "Los resultados varían según tarea, contexto, adopción y calidad de implementación. Las fuentes están enlazadas en cada dato."}</p>
          </div>
        </div>
      </section>

      <section className="home-reveal relative overflow-hidden border-b border-white/10 bg-[#0b0b0d] py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SectionHeading eyebrow={copy.demoEyebrow} title={copy.demoTitle} text={copy.demoLead} />
            <div className="mt-8 space-y-3">
              {copy.demoPoints.map((item, index) => (
                <div key={item} className="flex gap-4 border-b border-white/8 py-4">
                  <span className="font-display text-sm font-bold text-[#e86f22]">0{index + 1}</span>
                  <p className="text-sm leading-6 text-white/62">{item}</p>
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="mt-9 bg-[#e86f22] text-white hover:bg-[#cf5c16]">
              <Link to="/projetos">{hero.projects}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
            </Button>
          </div>
          <div className="relative min-h-[390px] overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_72%_28%,rgba(232,111,34,0.22),transparent_13rem),radial-gradient(circle_at_28%_72%,rgba(70,127,251,0.15),transparent_15rem),linear-gradient(145deg,#111214,#080809)] p-8">
            <div className="absolute right-7 top-7 h-24 w-24 rounded-full border border-[#e86f22]/30 p-4 shadow-[0_0_44px_rgba(232,111,34,0.15)]" aria-hidden="true">
              <img src="/yesod-brain-mark.svg" alt="" className="h-full w-full object-contain drop-shadow-[0_0_14px_rgba(255,138,61,0.45)]" />
            </div>
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">YESOD / BUILD IN PUBLIC</p>
              <p className="mt-4 max-w-md font-display text-3xl font-semibold leading-tight text-white">{lang === "pt" ? "Veja a automação funcionando antes de imaginar o resultado." : lang === "en" ? "See automation working before imagining the result." : "Mira la automatización funcionando antes de imaginar el resultado."}</p>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-[#e86f22] via-[#ff9a5e]/60 to-[#467ffb]/40" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section className="home-reveal border-b border-white/10 bg-[#070708] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow={copy.bridgeEyebrow} title={copy.bridgeTitle} />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {copy.bridgeItems.map((item, index) => (
              <article key={item} className="border border-white/10 bg-[#101114] p-6">
                <p className="text-xs font-bold tracking-[0.18em] text-[#e86f22]">0{index + 1}</p>
                <p className="mt-6 text-base leading-7 text-white/68">{item}</p>
              </article>
            ))}
          </div>

          <div className="mt-16 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {copy.journey.map(([number, title, text]) => (
              <article key={number} className="bg-[#0a0b0d] p-6">
                <p className="hero-shimmer-copy text-2xl font-black">{number}</p>
                <h3 className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-white">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/52">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FounderSection lang={lang} />

      {aiExperience.enabled && (
        <section className="home-reveal border-b border-[#e86f22]/30 bg-[#111214]">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center sm:py-14">
            <span className="yesod-tech-icon yesod-tech-icon-feature flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff9a5e]/45 bg-[#e86f22] text-white shadow-lg shadow-[#e86f22]/25">
              <Bot className="relative z-10 h-8 w-8" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <div className="max-w-2xl sm:pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e86f22]">{tm(aiExperience.eyebrow)}</p>
              <h2 className="mt-3 text-2xl text-white sm:text-3xl">{tm(aiExperience.headline)}</h2>
              <p className="mt-3 leading-7 text-white/65">{tm(aiExperience.description)}</p>
            </div>
            <MarleyChatDialog buttonLabel={tm(aiExperience.buttonLabel)} />
          </div>
        </section>
      )}

      <section className="home-reveal border-b border-white/10 bg-[#09090b] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow={lang === "pt" ? "Da análise à escala" : lang === "en" ? "From analysis to scale" : "Del análisis a la escala"} title={t("home.productsTitle")} text={t("home.productsText")} />
            <Button asChild variant="outline" className="border-[#e86f22] bg-[#e86f22] text-white hover:border-[#cf5c16] hover:bg-[#cf5c16] hover:text-white">
              <Link to="/produtos">{t("home.seeProducts")}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <article key={product.id} className="solution-preview-card interactive-card border border-white/10 border-t-2 border-t-[#e86f22] bg-[#111214] p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg text-white">{tm(product.name)}</h3>
                  {product.featured && (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#e86f22]/10 px-2.5 py-1 text-[11px] font-semibold text-[#ff8a3d]">
                      <Sparkles className="yesod-featured-spark h-3 w-3" aria-hidden="true" /> {t("products.featured")}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/55">{tm(product.description)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-reveal border-b border-white/10 bg-[#070708] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading eyebrow={copy.ecosystemEyebrow} title={copy.ecosystemTitle} text={copy.ecosystemLead} />
          <div className="mt-10 grid gap-px border-y border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <Link key={pillar.titleKey} to={pillar.to} className="interactive-card group bg-[#0d0e10] p-6 transition-colors hover:bg-[#121318]">
                <span className="yesod-tech-icon flex h-10 w-10 items-center justify-center rounded-sm border border-[#e86f22]/25 bg-[#e86f22]/10 text-[#ff8a3d]">
                  <pillar.icon className="relative z-10 h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <h3 className="mt-8 text-base text-white group-hover:text-[#ff8a3d]">{pillar.titleKey === "home.pillar.news" ? (lang === "pt" ? "Central de Conteúdo" : lang === "en" ? "Content Center" : "Central de Contenido") : t(pillar.titleKey)}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{t(pillar.textKey)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-reveal border-b border-white/10 bg-[#0a0b0d] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading title={copy.qualifyTitle} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {copy.qualifyItems.map((item) => (
              <div key={item} className="border border-[#e86f22]/20 bg-[#111214] p-4 text-sm leading-6 text-white/58"><span className="mr-2 font-bold text-[#e86f22]">×</span>{item}</div>
            ))}
          </div>
          <p className="mt-8 text-lg font-semibold text-white">{copy.qualifyCta}</p>
          <Button asChild className="mt-4 bg-[#e86f22] text-white hover:bg-[#cf5c16]"><a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">{lang === "pt" ? "Falar com a YESOD" : lang === "en" ? "Talk to YESOD" : "Hablar con YESOD"}</a></Button>
        </div>
      </section>

      <section className="home-reveal border-b border-white/10 bg-[#070708] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeading title={copy.faqTitle} />
          <Accordion type="single" collapsible className="mt-8">
            {copy.faq.map(([question, answer], index) => (
              <AccordionItem key={question} value={`faq-${index}`} className="border-white/10">
                <AccordionTrigger className="text-left text-sm font-medium text-white hover:text-[#ff8a3d]">{question}</AccordionTrigger>
                <AccordionContent className="leading-7 text-white/55">{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="home-reveal border-b border-white/10 bg-[#0a0b0d] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeading title={copy.guaranteeTitle} text={copy.guaranteeText} />
        </div>
      </section>

      <section className="home-reveal bg-[#070708]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="relative overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_82%_18%,rgba(70,127,251,0.14),transparent_22rem),linear-gradient(135deg,#111214,#070708)] px-7 py-12 text-white shadow-lift sm:px-12 sm:py-14">
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#e86f22] via-[#ff8a3d] to-[#467ffb]" />
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">YESOD AUTOMATION</p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl">{lang === "pt" ? "Pronto para parar de gastar tempo onde uma automação pode trabalhar por você?" : lang === "en" ? "Ready to stop spending time where automation can work for you?" : "¿Listo para dejar de gastar tiempo donde una automatización puede trabajar por ti?"}</h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/65">{lang === "pt" ? "Conte qual rotina consome mais tempo do seu time. A primeira conversa serve para entender o processo e identificar onde existe potencial real de automação." : lang === "en" ? "Tell us which routine consumes the most team time. The first conversation is about understanding the process and identifying real automation potential." : "Cuéntanos qué rutina consume más tiempo. La primera conversación sirve para entender el proceso e identificar potencial real de automatización."}</p>
              <Button asChild size="lg" className="mt-8 bg-[#e86f22] text-white shadow-[0_0_28px_-10px_rgba(232,111,34,0.75)] hover:bg-[#cf5c16]">
                <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">{hero.primary}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
