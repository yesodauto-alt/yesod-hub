import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import yesodLogo from "@/assets/yesod-logo";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/yesod";

const nav: Array<{
  to: "/hub" | "/projetos" | "/servicos" | "/produtos" | "/meu-espaco" | "/contato";
  label: TranslationKey;
}> = [
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
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <span className="brand-logo-shell inline-flex items-center rounded-xl bg-white px-3 py-2.5">
            <img src={yesodLogo} alt="YESOD" className="h-6 w-auto" />
          </span>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">{t("footer.about")}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("nav.navigation")}
          </h4>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} className="text-muted-foreground hover:text-foreground">
                {t(item.label)}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("footer.contact")}
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              <a href={whatsappUrl(t("wa.generic"))} target="_blank" rel="noreferrer" className="hover:text-foreground">
                {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              <span>{CONTACT_EMAIL}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              <span>{t("contact.remote")}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-6 py-5">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} YESOD. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
