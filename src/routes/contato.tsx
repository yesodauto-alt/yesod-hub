import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
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
          "Fale com a equipe da YESOD Automation pelo WhatsApp. Preencha o formulário e a mensagem abre pronta para envio.",
      },
      { property: "og:title", content: "Contato — YESOD Automation" },
      {
        property: "og:description",
        content: "WhatsApp é o nosso canal principal de atendimento.",
      },
    ],
  }),
  component: Contato,
});

function Contato() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = `Olá! Meu nome é ${name}${company ? ` (${company})` : ""}.\n\n${message}`;
    window.open(whatsappUrl(text), "_blank", "noreferrer");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Contato</h1>
        <p className="mt-3 text-muted-foreground">
          O WhatsApp é o nosso canal principal. Preencha os campos e a conversa abre com a mensagem
          já preenchida.
        </p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <div className="space-y-2">
            <Label htmlFor="contact-name">Seu nome</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-company">Empresa</Label>
            <Input
              id="contact-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Mensagem</Label>
            <Textarea
              id="contact-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Conte um pouco sobre a sua operação e o que você precisa."
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            <MessageCircle className="mr-2 h-4 w-4" />
            Abrir conversa no WhatsApp
          </Button>
        </form>

        <aside className="space-y-5">
          <div className="rounded-2xl bg-brand-gradient p-6 text-white shadow-lift">
            <MessageCircle className="h-8 w-8" />
            <h2 className="mt-4 text-xl font-semibold">Atendimento direto</h2>
            <p className="mt-2 text-sm text-white/80">
              Prefere falar sem preencher nada? Chame a gente agora mesmo.
            </p>
            <Button asChild variant="secondary" className="mt-5">
              <a
                href={whatsappUrl("Olá! Vim pelo site da Comunidade YESOD.")}
                target="_blank"
                rel="noreferrer"
              >
                Falar no WhatsApp
              </a>
            </Button>
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">YESOD Automation</h2>
            <p className="flex items-start gap-3 text-sm text-muted-foreground">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" /> contato@yesod.com.br
            </p>
            <p className="flex items-start gap-3 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Atendimento 100% remoto — Brasil
            </p>
            <p className="flex items-start gap-3 text-sm text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" /> Segunda a sexta, 9h às 18h
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
