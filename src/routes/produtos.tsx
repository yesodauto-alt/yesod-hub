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
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">YESOD</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">{t("products.title")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("products.subtitle")}</p>
      </header>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {PRODUCTS.map((product, index) => {
          const name = t(product.nameKey);
          return (
            <article
              key={product.id}
              className={`flex flex-col rounded-2xl border bg-card p-6 sm:p-7 ${
                product.featured ? "border-primary/35" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
                  0{index + 1}
                </span>
                {product.featured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {t("products.featured")}
                  </span>
                )}
              </div>

              <h2 className="mt-8 text-xl">{name}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(product.descriptionKey)}</p>

              <ul className="mt-7 flex-1 space-y-3 border-t border-border pt-6 text-sm">
                {product.featureKeys.map((key) => (
                  <li key={key} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.9} aria-hidden="true" />
                    <span className="leading-6 text-foreground/80">{t(key)}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className="mt-8 w-full sm:w-fit" variant={product.featured ? "default" : "outline"}>
                <a href={whatsappUrl(t("wa.product", { name }))} target="_blank" rel="noreferrer">
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
