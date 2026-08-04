import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, FileCheck2, LayoutDashboard, Plug, ScanSearch, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços YESOD — análise, correção e preflight automatizados" },
      {
        name: "description",
        content:
          "Análise inteligente, correção automática, relatório de preflight, painel interativo, integrações com RIPs e IA explicativa para gráficas.",
      },
      { property: "og:title", content: "Serviços YESOD Automation" },
      {
        property: "og:description",
        content: "Seis frentes de automação de pré-impressão para o setor gráfico.",
      },
    ],
  }),
  component: Servicos,
});

const services = [
  {
    icon: ScanSearch,
    title: "Análise Inteligente",
    text: "Leitura automática do arquivo: sangria, margens, resolução, fontes, cores especiais e sobreimpressão verificadas em segundos.",
  },
  {
    icon: Wand2,
    title: "Correção Automática",
    text: "Ajustes aplicados conforme o padrão da sua gráfica — conversões de cor, criação de sangria e normalização de transparências.",
  },
  {
    icon: FileCheck2,
    title: "Relatório de Preflight",
    text: "Documento claro com tudo que foi verificado, corrigido e o que ainda depende de decisão humana.",
  },
  {
    icon: LayoutDashboard,
    title: "Painel Interativo",
    text: "Acompanhe arquivos, status e histórico de análises em um painel pensado para a rotina da produção.",
  },
  {
    icon: Plug,
    title: "Integrações com RIPs",
    text: "Conexão com os fluxos e RIPs que você já usa, sem trocar o parque instalado.",
  },
  {
    icon: BrainCircuit,
    title: "IA Explicativa",
    text: "Cada apontamento vem explicado em linguagem simples, para qualquer pessoa da equipe entender e agir.",
  },
];

function Servicos() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Serviços</h1>
        <p className="mt-3 text-muted-foreground">
          A automação YESOD cobre o caminho completo do arquivo: da entrada até o aprovado para
          produção.
        </p>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <article
            key={s.title}
            className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <s.icon className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-lg font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-border bg-surface p-8 text-center">
        <h2 className="text-2xl font-bold">Quer ver isso rodando nos seus arquivos?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Fale com a equipe e combine uma demonstração com um arquivo real da sua produção.
        </p>
        <Button asChild size="lg" className="mt-6">
          <a
            href={whatsappUrl("Olá! Quero uma demonstração dos serviços da YESOD.")}
            target="_blank"
            rel="noreferrer"
          >
            Falar no WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
