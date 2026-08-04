import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import logo from "@/assets/yesod-logo.png.asset.json";
import { whatsappUrl } from "@/lib/yesod";

const nav = [
  { to: "/comunidade", label: "Comunidade" },
  { to: "/projetos", label: "Projetos" },
  { to: "/servicos", label: "Serviços" },
  { to: "/produtos", label: "Produtos" },
  { to: "/meu-espaco", label: "Área de membros" },
  { to: "/contato", label: "Contato" },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 bg-graphite text-graphite-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 shadow-soft">
            <img src={logo.url} alt="YESOD" className="h-7 w-auto" />
          </span>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-graphite-foreground/70">
            A YESOD transforma processos manuais e repetitivos em operações automatizadas,
            escaláveis e precisas com inteligência artificial. A comunidade é o espaço onde isso
            é compartilhado na prática.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Navegação</h4>
          <ul className="mt-5 space-y-2.5 text-sm text-graphite-foreground/70">
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-graphite-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Contato</h4>
          <ul className="mt-5 space-y-3 text-sm text-graphite-foreground/70">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <a
                href={whatsappUrl("Olá! Vim pela Comunidade YESOD.")}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-graphite-foreground"
              >
                +55 11 93413-6614
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <span>yesod.auto@gmail.com</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Atendimento 100% remoto — Brasil</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6">
        <p className="mx-auto max-w-6xl text-xs text-graphite-foreground/60">
          © {new Date().getFullYear()} YESOD. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
