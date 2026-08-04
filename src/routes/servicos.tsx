import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, Gauge, LifeBuoy, Plug, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços YESOD — automação de processos com IA" },
      {
        name: "description",
        content:
          "Consultoria em automação de processos, desenvolvimento de soluções com IA, integração de sistemas e APIs, operação em escala e suporte contínuo.",
      },
      { property: "og:title", content: "Serviços da YESOD" },
      {
        property: "og:description",
        content: "O que a YESOD entrega: automação, IA, integrações e operação em escala.",
      },
    ],
    links: [{ rel: "canonical", href: "/servicos" }],
  }),
  component: Servicos,
});

const services = [
  {
    icon: Workflow,
    title: "Consultoria em automação de processos",
    text: "Mapeamos como sua operação funciona hoje, identificamos o que é repetitivo e desenhamos o caminho para automatizar com prioridade por impacto.",
  },
  {
    icon: BrainCircuit,
    title: "Desenvolvimento de soluções com IA",
    text: "Construímos soluções que aplicam inteligência artificial onde ela realmente resolve: leitura de documentos, classificação, geração de conteúdo e apoio à decisão.",
  },
  {
    icon: Plug,
    title: "Integração de sistemas e APIs",
    text: "Conectamos as ferramentas que você já usa para que os dados circulem entre elas sem digitação manual e sem planilhas intermediárias.",
  },
  {
    icon: Gauge,
    title: "Operação em escala",
    text: "Automações preparadas para volume: menos tempo por tarefa, menos custo por operação e resultado previsível mesmo em picos de demanda.",
  },
  {
    icon: LifeBuoy,
    title: "Suporte e evolução contínua",
    text: "Acompanhamento após a entrega, com monitoramento, ajustes e novas melhorias conforme o negócio muda.",
  },
];

function Servicos() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Serviços</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          O que a YESOD entrega como empresa de automação e escala com inteligência artificial.
        </p>
      </header>

      <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <article
            key={s.title}
            className="rounded-2xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <s.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-lg">{s.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-brand-gradient px-8 py-14 text-center text-white shadow-lift sm:px-14">
        <h2 className="text-2xl sm:text-3xl">Vamos olhar o seu processo juntos?</h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/75">
          Conte qual rotina consome mais tempo do seu time e a gente mostra por onde começar.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-9">
          <a
            href={whatsappUrl("Olá! Quero falar com a YESOD sobre automação de processos.")}
            target="_blank"
            rel="noreferrer"
          >
            Falar com a YESOD
          </a>
        </Button>
      </div>
    </div>
  );
}
