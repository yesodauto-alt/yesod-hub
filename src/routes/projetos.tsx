import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { PROJECTS, whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos YESOD — automações em operação" },
      {
        name: "description",
        content:
          "Vitrine de projetos da YESOD: automação gráfica, comercial, de dados e IA aplicada, com o que cada projeto automatiza e o resultado alcançado.",
      },
      { property: "og:title", content: "Projetos da YESOD" },
      {
        property: "og:description",
        content: "Automações reais em operação, por categoria e resultado.",
      },
    ],
    links: [{ rel: "canonical", href: "/projetos" }],
  }),
  component: Projetos,
});

function Projetos() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Projetos</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Uma vitrine das automações que a YESOD constrói e mantém em operação, em áreas diferentes
          do negócio.
        </p>
      </header>

      <div className="mt-14 grid gap-7 sm:grid-cols-2">
        {PROJECTS.map((project) => (
          <article
            key={project.name}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="flex h-52 items-center justify-center bg-placeholder-gradient px-6">
              <span className="text-center font-display text-lg font-semibold tracking-tight text-white/90">
                {project.name}
              </span>
            </div>
            <div className="p-7">
              <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                {project.category}
              </span>
              <h2 className="mt-4 text-lg">{project.name}</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed">
                <p>
                  <span className="font-semibold text-foreground">O que automatiza: </span>
                  <span className="text-muted-foreground">{project.automates}</span>
                </p>
                <p>
                  <span className="font-semibold text-foreground">Resultado: </span>
                  <span className="text-muted-foreground">{project.result}</span>
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        As imagens dos cards são placeholders e podem ser substituídas por fotos ou telas reais dos
        projetos.
      </p>

      <div className="mt-14 text-center">
        <Button asChild size="lg">
          <a
            href={whatsappUrl("Olá! Quero conversar sobre um projeto de automação com a YESOD.")}
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
