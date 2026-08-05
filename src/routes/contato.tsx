import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n, useLocalizedMeta } from "@/lib/i18n";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/yesod";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato YESOD — fale com a equipe pelo WhatsApp" },
      {
        name: "description",
        content:
          "Fale com a YESOD pelo WhatsApp (+55 11 5306-3212) e conte qual processo você quer automatizar. Atendimento remoto em todo o Brasil.",
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
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [process, setProcess] = useState("");
  const [message, setMessage] = useState("");
  useLocalizedMeta("meta.contact.title", "meta.contact.desc");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fallback = t("wa.notInformed");
    const text = [
      t("wa.contactIntro"),
      `${t("wa.contactName")}: ${name || fallback}`,
      `${t("wa.contactCompany")}: ${company || fallback}`,
      `${t("wa.contactProcess")}: ${process || fallback}`,
      `${t("wa.contactMessage")}: ${message || fallback}`,
    ].join("\n");
    window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">YESOD</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">{t("contact.title")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("contact.subtitle")}</p>
      </header>

      <div className="mt-12 grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="bg-navy p-7 text-white sm:p-9">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
            <MessageCircle className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h2 className="mt-7 text-2xl">{t("contact.whatsappTitle")}</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">{t("contact.whatsappText")}</p>
          <p className="mt-7 font-display text-xl font-semibold">{WHATSAPP_DISPLAY}</p>
          <Button asChild size="lg" className="mt-7 w-full bg-[#e86f22] text-white hover:bg-[#cf5c16]">
            <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer">
              {t("contact.openWhatsapp")}
            </a>
          </Button>

          <ul className="mt-9 space-y-3 border-t border-white/10 pt-6 text-sm text-white/65">
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              {t("contact.hours")}
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              {CONTACT_EMAIL}
            </li>
          </ul>
        </aside>

        <form onSubmit={handleSubmit} className="p-7 sm:p-9">
          <h2 className="text-xl">{t("contact.formTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("contact.formText")}</p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("contact.name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("contact.namePlaceholder")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">{t("contact.company")}</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t("contact.companyPlaceholder")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="process">{t("contact.process")}</Label>
              <Input id="process" value={process} onChange={(e) => setProcess(e.target.value)} placeholder={t("contact.processPlaceholder")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="message">{t("contact.message")}</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("contact.messagePlaceholder")} rows={5} />
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-7 w-full sm:w-auto">
            {t("contact.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
