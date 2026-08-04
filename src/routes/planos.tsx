import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos da Comunidade YESOD — estrutura e recursos" },
      {
        name: "description",
        content:
          "Quatro planos da Comunidade YESOD: Iniciante, Mais popular, Avançado e Sob consulta. Valores definidos junto com a equipe.",
      },
      { property: "og:title", content: "Planos da Comunidade YESOD" },
      {
        property: "og:description",
        content: "Estrutura de planos com recursos de automação de pré-impressão.",
      },
    ],
  }),
  component: Planos,
});

const plans = [
  {
    name: "Iniciante",
    note: "Para quem está dando os primeiros passos na automação.",
    features: [
      "Acesso ao feed da comunidade",
      "Análise inteligente de arquivos",
      "Relatório de preflight simplificado",
      "Suporte por WhatsApp em horário comercial",
    ],
  },
  {
    name: "Mais popular",
    note: "O equilíbrio entre volume, recursos e suporte.",
    featured: true,
    features: [
      "Tudo do plano Iniciante",
      "Correção automática conforme seu padrão",
      "Relatório de preflight completo",
      "Painel interativo de acompanhamento",
      "Conteúdo exclusivo da área de membros",
    ],
  },
  {
    name: "Avançado",
    note: "Para operações com alto volume e prazos curtos.",
    features: [
      "Tudo do plano Mais popular",
      "Integrações com RIPs e fluxos existentes",
      "IA explicativa nos apontamentos",
      "Prioridade na fila de processamento",
      "Onboarding guiado da equipe",
    ],
  },
  {
    name: "Sob consulta",
    note: "Fluxos personalizados e necessidades específicas.",
    features: [
      "Escopo desenhado junto com a YESOD",
      "Regras de verificação sob medida",
      "Automações e integrações dedicadas",
      "Acompanhamento próximo do time técnico",
    ],
  },
];

function Planos() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Planos</h1>
        <p className="mt-3 text-muted-foreground">
          Escolha o formato que combina com a sua operação. Os valores são definidos em conversa
          com a equipe, de acordo com o volume e as integrações necessárias.
        </p>
      </header>

      <div className="mt-12 grid gap-6 lg:grid-cols-4">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`flex flex-col rounded-2xl border bg-card p-6 shadow-soft ${
              plan.featured ? "border-primary ring-2 ring-primary/20 lg:-mt-4 lg:pb-10" : "border-border"
            }`}
          >
            {plan.featured && (
              <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                <Sparkles className="h-3 w-3" /> Mais popular
              </span>
            )}
            <h2 className="font-display text-xl font-semibold">{plan.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{plan.note}</p>
            <p className="mt-5 font-display text-2xl font-bold text-primary">Preço a definir</p>

            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>

            <Button asChild className="mt-8 w-full" variant={plan.featured ? "default" : "outline"}>
              <a
                href={whatsappUrl(
                  `Olá! Quero começar agora no plano ${plan.name} da Comunidade YESOD.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                Começar agora
              </a>
            </Button>
          </article>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Planos sem fidelidade: você pode trocar ou cancelar falando com a equipe.
      </p>
    </div>
  );
}
