import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileCheck2,
  Images,
  Lock,
  Newspaper,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import logo from "@/assets/yesod-logo.png.asset.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Comunidade YESOD — automação de pré-impressão para gráficas" },
      {
        name: "description",
        content:
          "Hub da Comunidade YESOD: novidades, vitrine de projetos, serviços de automação de pré-impressão e área exclusiva para membros.",
      },
      { property: "og:title", content: "Comunidade YESOD" },
      {
        property: "og:description",
        content:
          "Novidades, projetos, serviços e área exclusiva para profissionais do setor gráfico.",
      },
    ],
  }),
  component: Home,
});

const pillars = [
  {
    icon: Newspaper,
    title: "Novidades",
    text: "Atualizações da YESOD e do mercado gráfico direto no feed da comunidade.",
    to: "/feed" as const,
  },
  {
    icon: Images,
    title: "Vitrine de projetos",
    text: "Cases reais de arquivos tratados e produzidos com automação.",
    to: "/projetos" as const,
  },
  {
    icon: Wrench,
    title: "Serviços",
    text: "Análise, correção e relatórios de preflight aplicados à sua rotina.",
    to: "/servicos" as const,
  },
  {
    icon: Lock,
    title: "Área exclusiva",
    text: "Guias, presets e trilhas de estudo liberados apenas para membros.",
    to: "/meu-espaco" as const,
  },
];

const testimonials = [
  {
    name: "Depoimento placeholder",
    role: "Pré-impressão · Gráfica offset",
    text: "Espaço reservado para o depoimento de um membro da comunidade.",
  },
  {
    name: "Depoimento placeholder",
    role: "Produção · Gráfica digital",
    text: "Espaço reservado para o depoimento de um membro da comunidade.",
  },
  {
    name: "Depoimento placeholder",
    role: "Diretor · Editora",
    text: "Espaço reservado para o depoimento de um membro da comunidade.",
  },
];

const plans = [
  { name: "Iniciante", note: "Para quem está começando a automatizar" },
  { name: "Mais popular", note: "O equilíbrio entre volume e recursos", featured: true },
  { name: "Avançado", note: "Para operações com alto volume" },
  { name: "Sob consulta", note: "Fluxos e integrações personalizadas" },
];

const faqs = [
  {
    q: "O que é pré-impressão?",
    a: "É a etapa entre o arquivo enviado pelo cliente e a impressão: conferência de sangria, cores, fontes, resolução, faca e imposição. É onde a maior parte dos retrabalhos nasce — e onde a automação da YESOD atua.",
  },
  {
    q: "Como envio meu arquivo?",
    a: "Você envia pelo canal combinado no seu plano (WhatsApp ou painel). A partir daí a análise é automática e você recebe o retorno com os pontos encontrados.",
  },
  {
    q: "Quais formatos são aceitos?",
    a: "Trabalhamos com os formatos usuais do setor gráfico, como PDF, PDF/X, TIFF, JPG, AI, INDD e EPS. Para produção, o PDF/X segue sendo o mais recomendado.",
  },
  {
    q: "Como funciona o relatório de preflight?",
    a: "O relatório lista cada verificação feita no arquivo, o que passou, o que foi corrigido automaticamente e o que precisa da sua decisão — com explicação em linguagem simples.",
  },
  {
    q: "Posso cancelar o plano?",
    a: "Sim. Os planos são sem fidelidade: você pode cancelar ou trocar de plano falando com a nossa equipe pelo WhatsApp.",
  },
];

function Home() {
  return (
    <div>
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <span className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 shadow-soft">
            <img src={logo.url} alt="YESOD Automation" className="h-8 w-auto" />
          </span>
          <h1 className="mt-8 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Bem-vindo à Comunidade YESOD
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            O ponto de encontro de quem trabalha com pré-impressão: conteúdo prático, projetos
            reais e automação inteligente para o setor gráfico.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth" search={{ modo: "cadastro" }}>
                Entrar na comunidade
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/feed">Ver o feed</Link>
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-3 text-sm text-white/70">
            <Users className="h-5 w-5" />
            <span>
              <strong className="text-white">+X membros</strong> já acompanham a comunidade
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold sm:text-4xl">O que você encontra aqui</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Quatro frentes pensadas para o dia a dia de gráficas, bureaus e editoras.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <Link
              key={p.title}
              to={p.to}
              className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold group-hover:text-primary">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold sm:text-4xl">Visão geral dos planos</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Estrutura de planos da comunidade. Valores definidos junto com você, conforme o volume.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border bg-card p-6 shadow-soft ${
                  plan.featured ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
              >
                {plan.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    <Sparkles className="h-3 w-3" /> Mais popular
                  </span>
                )}
                <h3 className="mt-3 font-display text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>
                <p className="mt-4 font-display text-xl font-semibold text-primary">
                  Preço a definir
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to="/planos">Ver planos completos</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold sm:text-4xl">O que dizem os membros</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure key={i} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <blockquote className="text-sm leading-relaxed text-foreground/90">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-placeholder-gradient text-sm font-semibold text-white">
                  YS
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{t.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold sm:text-4xl">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-3xl bg-brand-gradient px-6 py-14 text-center text-white sm:px-12">
          <FileCheck2 className="mx-auto h-10 w-10" />
          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
            Pronto para automatizar sua pré-impressão?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Fale com a equipe YESOD pelo WhatsApp e descubra qual plano faz sentido para a sua
            operação.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <a
                href={whatsappUrl("Olá! Quero conhecer a Comunidade YESOD.")}
                target="_blank"
                rel="noreferrer"
              >
                Falar no WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/servicos">Ver serviços</Link>
            </Button>
          </div>
          <ul className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/80">
            {["Sem fidelidade", "Suporte humano", "Relatórios claros"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
