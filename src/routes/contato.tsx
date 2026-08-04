import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato YESOD — fale com a equipe pelo WhatsApp" },
      {
        name: "description",
        content:
          "Fale com a YESOD pelo WhatsApp (+55 11 93413-6614) e conte qual processo você quer automatizar. Atendimento remoto em todo o Brasil.",
      },
      { property: "og:title", content: "Contato — YESOD" },
      {
        property: "og:description",
        content: "Fale com a equipe YESOD sobre automação e escala com inteligência artificial.",
      },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: Contato,
});

function Contato() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [process, setProcess] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = [
      "Olá, YESOD! Vim pelo site.",
      `Nome: ${name || "não informado"}`,
      `Empresa: ${company || "não informada"}`,
      `Processo que quero automatizar: ${process || "não informado"}`,
      `Mensagem: ${message || "não informada"}`,
    ].join("\n");
    window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Contato</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          O WhatsApp é o canal principal da YESOD. Fale direto com a equipe ou preencha o formulário
          — ele monta a mensagem e abre a conversa para você.
        </p>
      </header>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-3xl bg-brand-gradient p-8 text-white shadow-lift">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <MessageCircle className="h-6 w-6" />
          </span>
          <h2 className="mt-6 text-2xl">Fale no WhatsApp</h2>
          <p className="mt-3 leading-relaxed text-white/75">
            Resposta rápida em horário comercial. Conte qual rotina consome o tempo do seu time.
          </p>
          <p className="mt-6 font-display text-2xl font-semibold">+55 11 93413-6614</p>
          <Button asChild size="lg" variant="secondary" className="mt-8 w-full">
            <a
              href={whatsappUrl("Olá! Quero falar com a YESOD sobre automação com IA.")}
              target="_blank"
              rel="noreferrer"
            >
              Abrir conversa no WhatsApp
            </a>
          </Button>

          <ul className="mt-10 space-y-3 text-sm text-white/75">
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0" />
              Seg a sex, 9h às 18h (horário de Brasília)
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0" />
              yesod.auto@gmail.com
            </li>
          </ul>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-border bg-card p-8 shadow-soft"
        >
          <h2 className="text-xl">Prefere escrever antes?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ao enviar, o WhatsApp abre com a mensagem já preenchida.
          </p>

          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Seu nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como podemos te chamar?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nome da sua empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="process">Processo que quer automatizar</Label>
              <Input
                id="process"
                value={process}
                onChange={(e) => setProcess(e.target.value)}
                placeholder="Ex.: orçamentos, conferência de arquivos, relatórios"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Conte um pouco sobre o seu cenário atual."
                rows={5}
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-8 w-full">
            Enviar pelo WhatsApp
          </Button>
        </form>
      </div>
    </div>
  );
}
