import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import logo from "@/assets/yesod-logo.png.asset.json";
import { whatsappUrl } from "@/lib/yesod";

export function Footer() {
  return (
    <footer className="mt-20 bg-graphite text-graphite-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 shadow-soft">
            <img src={logo.url} alt="YESOD Automation" className="h-7 w-auto" />
          </span>
          <p className="mt-4 max-w-sm text-sm text-graphite-foreground/70">
            Comunidade YESOD: automação inteligente de pré-impressão para o setor gráfico.
            Conteúdo, projetos e suporte para gráficas que querem produzir com mais
            previsibilidade.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Navegação</h4>
          <ul className="mt-4 space-y-2 text-sm text-graphite-foreground/70">
            <li>
              <Link to="/feed" className="hover:text-graphite-foreground">
                Feed
              </Link>
            </li>
            <li>
              <Link to="/servicos" className="hover:text-graphite-foreground">
                Serviços
              </Link>
            </li>
            <li>
              <Link to="/projetos" className="hover:text-graphite-foreground">
                Projetos
              </Link>
            </li>
            <li>
              <Link to="/planos" className="hover:text-graphite-foreground">
                Planos
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-graphite-foreground">
                Contato
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">Contato</h4>
          <ul className="mt-4 space-y-3 text-sm text-graphite-foreground/70">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <a
                href={whatsappUrl("Olá! Vim pela Comunidade YESOD.")}
                target="_blank"
                rel="noreferrer"
                className="hover:text-graphite-foreground"
              >
                WhatsApp da YESOD
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <span>contato@yesod.com.br</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Atendimento 100% remoto — Brasil</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6">
        <p className="mx-auto max-w-6xl text-xs text-graphite-foreground/60">
          © {new Date().getFullYear()} YESOD Automation. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
