import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import logo from "@/assets/yesod-logo.png.asset.json";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/yesod";

const nav: Array<{ to: "/hub" | "/projetos" | "/servicos" | "/produtos" | "/meu-espaco" | "/contato"; label: TranslationKey }> = [
  { to: "/hub", label: "nav.hub" },
  { to: "/projetos", label: "nav.projects" },
  { to: "/servicos", label: "nav.services" },
  { to: "/produtos", label: "nav.products" },
  { to: "/meu-espaco", label: "nav.members" },
  { to: "/contato", label: "nav.contact" },
];

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-24 bg-graphite text-graphite-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 shadow-soft">
            <img src={logo.url} alt="YESOD" className="h-7 w-auto" />
          </span>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-graphite-foreground/70">
            {t("footer.about")}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">{t("nav.navigation")}</h4>
          <ul className="mt-5 space-y-2.5 text-sm text-graphite-foreground/70">
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-graphite-foreground">
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">{t("footer.contact")}</h4>
          <ul className="mt-5 space-y-3 text-sm text-graphite-foreground/70">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <a
                href={whatsappUrl(t("wa.generic"))}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-graphite-foreground"
              >
                {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{CONTACT_EMAIL}</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t("contact.remote")}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6">
        <p className="mx-auto max-w-6xl text-xs text-graphite-foreground/60">
          © {new Date().getFullYear()} YESOD. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
