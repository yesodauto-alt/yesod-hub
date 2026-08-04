import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PRODUCTS, whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos YESOD — formatos de automação configuráveis" },
      {
        name: "description",
        content:
          "Produtos configuráveis da YESOD: diagnóstico de automação, automação sob medida, integrações e APIs e operação em escala. Preços definidos junto com você.",
      },
      { property: "og:title", content: "Produtos da YESOD" },
      {
        property: "og:description",
        content: "Formatos de trabalho configuráveis para automatizar e escalar sua operação.",
      },
    ],
    links: [{ rel: "canonical", href: "/produtos" }],
  }),
  component: Produtos,
});

function Produtos() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Produtos</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Cada produto é um formato de trabalho configurável: nome, descrição, recursos, preço e
          disponibilidade são ajustados conforme a sua operação. Os valores são definidos em
          conversa com a equipe.
        </p>
      </header>

      <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((product) => (
          <article
            key={product.name}
            className={`flex flex-col rounded-2xl border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
              product.featured ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
            }`}
          >
            {product.featured && (
              <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                <Sparkles className="h-3 w-3" /> Mais procurado
              </span>
            )}
            <h2 className="text-lg">{product.name}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <p className="mt-6 font-display text-2xl font-semibold text-primary">
              {product.price}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {product.availability}
            </p>

            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {product.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-foreground/85">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="mt-8 w-full"
              variant={product.featured ? "default" : "outline"}
            >
              <a
                href={whatsappUrl(
                  `Olá! Quero saber mais sobre o produto ${product.name} da YESOD.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                Quero este produto
              </a>
            </Button>
          </article>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Sem fidelidade: você pode ajustar ou encerrar o que contratou falando com a equipe.
      </p>
    </div>
  );
}
