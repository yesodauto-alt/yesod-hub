import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Layers, Lock, Newspaper, Sparkles, UserRound } from "lucide-react";

import logo from "@/assets/yesod-logo.png.asset.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PRODUCTS, whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Comunidade YESOD — automação e escala com IA" },
      {
        name: "description",
        content:
          "Hub da Comunidade YESOD: novidades, projetos de automação, conteúdo exclusivo e área de membros para quem quer escalar processos com inteligência artificial.",
      },
      { property: "og:title", content: "Comunidade YESOD" },
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
    title: "Novidades",
    text: "O que está sendo construído na YESOD e no universo da automação com IA, direto no feed.",
    to: "/comunidade" as const,
  },
  {
    icon: Layers,
    title: "Projetos",
    text: "Automações reais em operação, com o que cada uma automatiza e o resultado alcançado.",
    to: "/projetos" as const,
  },
  {
    icon: Lock,
    title: "Conteúdo exclusivo",
    text: "Materiais, dicas e novidades em primeira mão liberados apenas para membros.",
    to: "/meu-espaco" as const,
  },
  {
    icon: UserRound,
    title: "Área de membros",
    text: "Seu espaço com perfil, acompanhamento e acesso ao que é exclusivo da comunidade.",
    to: "/meu-espaco" as const,
  },
];

const testimonials = [
  { name: "Nome do membro", role: "Cargo · Empresa" },
  { name: "Nome do membro", role: "Cargo · Empresa" },
  { name: "Nome do membro", role: "Cargo · Empresa" },
];

const faqs = [
  {
    q: "O que a YESOD faz?",
    a: "A YESOD transforma processos manuais e repetitivos em operações automatizadas, escaláveis e precisas. Unimos automação de fluxos, integração de sistemas e inteligência artificial para que o time cuide de decisão, não de tarefa repetida.",
  },
  {
    q: "Como funciona a automação com IA?",
    a: "Começamos entendendo o processo como ele é hoje. Depois desenhamos o fluxo automatizado e aplicamos IA nos pontos em que ela realmente ajuda: leitura de documentos, classificação, geração de conteúdo e apoio à decisão. Tudo com validação humana onde é necessário.",
  },
  {
    q: "Quais projetos existem?",
    a: "Há automações em áreas diferentes: gráfica (incluindo pré-impressão), comercial, dados e IA aplicada a documentos. A página Projetos mostra o que cada uma automatiza e o resultado alcançado.",
  },
  {
    q: "Como acesso a área de membros?",
    a: "Crie sua conta com e-mail e senha e entre em Área de membros. Lá ficam seu perfil, o conteúdo exclusivo e as novidades em primeira mão.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Não há fidelidade: você pode sair ou ajustar o que contratou falando com a equipe pelo WhatsApp.",
  },
];

function Home() {
  return (
    <div>
      <section className="bg-hero-gradient text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <span className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 shadow-soft">
            <img src={logo.url} alt="YESOD" className="h-8 w-auto" />
          </span>
          <h1 className="mt-10 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
            Bem-vindo à Comunidade YESOD
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
            A YESOD transforma processos manuais e repetitivos em operações automatizadas,
            escaláveis e precisas com inteligência artificial. Aqui você acompanha esse trabalho de
            perto: conteúdo, projetos reais e um espaço exclusivo para membros.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth" search={{ modo: "cadastro" }}>
                Entrar na comunidade
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/comunidade">Ver a comunidade</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl">O que você encontra aqui</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Quatro frentes para acompanhar a automação inteligente na prática.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <Link
              key={p.title}
              to={p.to}
              className="group rounded-2xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg group-hover:text-primary">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl sm:text-4xl">Nossos produtos</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Formatos de trabalho configuráveis, do diagnóstico inicial à operação em escala.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((product) => (
              <div
                key={product.name}
                className={`rounded-2xl border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
                  product.featured ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
                }`}
              >
                {product.featured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    <Sparkles className="h-3 w-3" /> Mais procurado
                  </span>
                )}
                <h3 className="mt-3 text-lg">{product.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <p className="mt-5 font-display text-lg font-semibold text-primary">
                  {product.price}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link to="/produtos">
                Ver produtos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl sm:text-4xl">O que dizem os membros</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Espaços reservados para depoimentos reais da comunidade.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="rounded-2xl border border-border bg-card p-7 shadow-soft transition-shadow duration-300 hover:shadow-lift"
            >
              <blockquote className="text-sm leading-relaxed text-foreground/85">
                “Espaço reservado para o depoimento de um membro da Comunidade YESOD.”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-placeholder-gradient text-sm font-semibold text-white">
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

      <section className="bg-surface py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl sm:text-4xl">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-3xl bg-brand-gradient px-8 py-16 text-center text-white shadow-lift sm:px-14">
          <h2 className="text-3xl sm:text-4xl">Pronto para automatizar em escala?</h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/75">
            Conte para a equipe YESOD qual processo consome o tempo do seu time. A gente mostra o
            caminho para automatizar.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <a
                href={whatsappUrl("Olá! Quero conhecer a Comunidade YESOD.")}
                target="_blank"
                rel="noreferrer"
              >
                Falar com a YESOD
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/servicos">Ver serviços</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
