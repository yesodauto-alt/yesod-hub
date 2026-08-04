import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, Gauge, LifeBuoy, Plug, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n, useLocalizedMeta, type TranslationKey } from "@/lib/i18n";
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
      { property: "og:description", content: "Automação, IA, integrações e operação em escala." },
    ],
    links: [{ rel: "canonical", href: "/servicos" }],
  }),
  component: Servicos,
});

const services: Array<{ icon: typeof Workflow; title: TranslationKey; text: TranslationKey }> = [
  { icon: Workflow, title: "services.s1", text: "services.s1Text" },
  { icon: BrainCircuit, title: "services.s2", text: "services.s2Text" },
  { icon: Plug, title: "services.s3", text: "services.s3Text" },
  { icon: Gauge, title: "services.s4", text: "services.s4Text" },
  { icon: LifeBuoy, title: "services.s5", text: "services.s5Text" },
];

function Servicos() {
  const { t } = useI18n();
  useLocalizedMeta("meta.services.title", "meta.services.desc");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">YESOD</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">{t("services.title")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("services.subtitle")}</p>
      </header>

      <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card">
        {services.map((service, index) => (
          <article
            key={service.title}
            className="grid gap-5 border-b border-border p-6 last:border-b-0 sm:grid-cols-[56px_1fr_auto] sm:items-start sm:p-7"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
              <service.icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg">{t(service.title)}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t(service.text)}</p>
            </div>
            <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">0{index + 1}</span>
          </article>
        ))}
      </div>

      <section className="mt-14 rounded-2xl bg-navy px-7 py-10 text-white sm:px-10 sm:py-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl">{t("services.ctaTitle")}</h2>
          <p className="mt-4 leading-7 text-white/70">{t("services.ctaText")}</p>
          <Button asChild size="lg" variant="secondary" className="mt-7">
            <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">
              {t("common.talkToYesod")}
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
