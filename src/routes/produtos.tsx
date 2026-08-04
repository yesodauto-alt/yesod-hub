import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n, useLocalizedMeta } from "@/lib/i18n";
import { PRODUCTS, whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Soluções YESOD — formatos de automação configuráveis" },
      {
        name: "description",
        content:
          "Soluções configuráveis da YESOD: diagnóstico de automação, automação sob medida, integrações e APIs e operação em escala.",
      },
      { property: "og:title", content: "Soluções da YESOD" },
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
  const { t } = useI18n();
  useLocalizedMeta("meta.products.title", "meta.products.desc");

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">{t("products.title")}</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">{t("products.subtitle")}</p>
      </header>

      <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((product) => {
          const name = t(product.nameKey);
          return (
            <article
              key={product.id}
              className={`flex flex-col rounded-2xl border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
                product.featured ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
              }`}
            >
              {product.featured && (
                <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  <Sparkles className="h-3 w-3" aria-hidden="true" /> {t("products.featured")}
                </span>
              )}
              <h2 className="text-lg">{name}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {t(product.descriptionKey)}
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {product.featureKeys.map((key) => (
                  <li key={key} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-foreground/85">{t(key)}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="mt-8 w-full"
                variant={product.featured ? "default" : "outline"}
              >
                <a
                  href={whatsappUrl(t("wa.product", { name }))}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("products.cta")}
                </a>
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
