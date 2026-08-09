import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, useLocalizedMeta } from "@/lib/i18n";
import {
  defaultConfigurableProducts,
  type ConfigurableProduct,
  whatsappUrl,
} from "@/lib/yesod";

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
  const { t, tm, lang } = useI18n();
  useLocalizedMeta("meta.products.title", "meta.products.desc");

  const productsQuery = useQuery({
    queryKey: ["site-settings", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "products").maybeSingle();
      if (error) throw error;
      return Array.isArray(data?.value) ? (data.value as unknown as ConfigurableProduct[]) : null;
    },
  });

  const products = (productsQuery.data ?? defaultConfigurableProducts()).filter((product) => product.published);

  return (
    <div className="yesod-page-icons mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">YESOD</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">{t("products.title")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("products.subtitle")}</p>
      </header>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {products.map((product, index) => {
          const name = tm(product.name);
          const features = product.features[lang]?.length
            ? product.features[lang]
            : product.features.pt ?? [];
          return (
            <article
              key={product.id}
              className={`flex flex-col border bg-card p-5 ${product.featured ? "border-[#e86f22]/45" : "border-border"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-bold tracking-[0.16em] text-[#d75a12]">
                  0{index + 1}
                </span>
                {product.featured && (
                  <span className="yesod-tech-icon yesod-tech-icon-chip inline-flex items-center gap-1.5 rounded-full border border-[#e86f22]/25 bg-[#fff1e7] px-2.5 py-1 text-[11px] font-semibold text-[#d75a12]">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {t("products.featured")}
                  </span>
                )}
              </div>

              <h2 className="mt-5 text-lg">{name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{tm(product.description)}</p>

              <ul className="mt-5 flex-1 space-y-2 border-t border-border pt-4 text-sm">
                {features.map((feature, featureIndex) => (
                  <li key={`${feature}-${featureIndex}`} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#e86f22]" strokeWidth={2} aria-hidden="true" />
                    <span className="leading-6 text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button asChild size="sm" className="mt-5 w-full sm:w-fit">
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
