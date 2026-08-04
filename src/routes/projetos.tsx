import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos YESOD — cases de pré-impressão automatizada" },
      {
        name: "description",
        content:
          "Vitrine de cases da YESOD: cartão de visita, folder, revista/catálogo e embalagem com faca especial.",
      },
      { property: "og:title", content: "Projetos da Comunidade YESOD" },
      {
        property: "og:description",
        content: "Cases reais de arquivos tratados com automação de pré-impressão.",
      },
    ],
  }),
  component: Projetos,
});

const projects = [
  {
    title: "Cartão de visita",
    tag: "Offset · 4/4 cores",
    text: "Padronização de sangria e marcas de corte em um lote com dezenas de variações de nome.",
  },
  {
    title: "Folder institucional",
    tag: "Dobra em 3 partes",
    text: "Ajuste de dobras, margens de segurança e imposição validada antes da produção.",
  },
  {
    title: "Revista / catálogo",
    tag: "64 páginas",
    text: "Verificação página a página de fontes, imagens em baixa e perfis de cor divergentes.",
  },
  {
    title: "Embalagem com faca",
    tag: "Papel cartão",
    text: "Conferência de faca, vinco e áreas de colagem com relatório visual para o cliente final.",
  },
];

function Projetos() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Projetos</h1>
        <p className="mt-3 text-muted-foreground">
          Uma amostra dos tipos de trabalho que passam pela automação YESOD todos os dias.
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {projects.map((p) => (
          <article
            key={p.title}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift"
          >
            <div className="flex h-52 items-center justify-center bg-placeholder-gradient">
              <span className="font-display text-lg font-semibold tracking-wide text-white/90">
                {p.title}
              </span>
            </div>
            <div className="p-6">
              <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                {p.tag}
              </span>
              <h2 className="mt-3 text-lg font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        As imagens acima são placeholders e podem ser substituídas por fotos reais dos projetos.
      </p>

      <div className="mt-12 text-center">
        <Button asChild size="lg">
          <a
            href={whatsappUrl("Olá! Quero mostrar um projeto para a equipe YESOD analisar.")}
            target="_blank"
            rel="noreferrer"
          >
            Enviar meu projeto pelo WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
