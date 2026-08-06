import { Download, RefreshCw, Share, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type InstallChoice = { outcome: "accepted" | "dismissed"; platform: string };
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

type Lang = "pt" | "en" | "es";

const copy: Record<Lang, Record<string, string>> = {
  pt: {
    title: "Instale o YESOD HUB",
    text: "Tenha o HUB como aplicativo na tela do seu celular.",
    install: "Instalar aplicativo",
    ios: "No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.",
    updateTitle: "Nova versão disponível",
    updateText: "Atualize para acessar as melhorias mais recentes.",
    update: "Atualizar agora",
    close: "Fechar",
  },
  en: {
    title: "Install YESOD HUB",
    text: "Keep the HUB as an app on your phone's home screen.",
    install: "Install app",
    ios: "In Safari, tap Share and then Add to Home Screen.",
    updateTitle: "A new version is available",
    updateText: "Update to access the latest improvements.",
    update: "Update now",
    close: "Close",
  },
  es: {
    title: "Instala YESOD HUB",
    text: "Ten el HUB como aplicación en la pantalla de tu celular.",
    install: "Instalar aplicación",
    ios: "En Safari, toca Compartir y luego Agregar a pantalla de inicio.",
    updateTitle: "Hay una nueva versión disponible",
    updateText: "Actualiza para acceder a las mejoras más recientes.",
    update: "Actualizar ahora",
    close: "Cerrar",
  },
};

function currentLang(): Lang {
  if (typeof window === "undefined") return "pt";
  const value = window.localStorage.getItem("yesod-lang");
  return value === "en" || value === "es" ? value : "pt";
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const refreshing = useRef(false);
  const text = copy[currentLang()];

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const dismissedAt = Number(window.localStorage.getItem("yesod-pwa-dismissed-at") || 0);
    const canOfferInstall = Date.now() - dismissedAt > 14 * 24 * 60 * 60 * 1000;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (canOfferInstall && !isStandalone()) setInstallPrompt(event as InstallPromptEvent);
    };

    const onControllerChange = () => {
      if (refreshing.current) window.location.reload();
    };

    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((reg) => {
      registration.current = reg;
      if (reg.waiting) setUpdateAvailable(true);
      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateAvailable(true);
        });
      });
      reg.update().catch(() => undefined);
    }).catch(() => undefined);

    if (ios && canOfferInstall && !isStandalone()) {
      const timer = window.setTimeout(() => setShowIosHelp(true), 1800);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", onInstallPrompt);
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem("yesod-pwa-dismissed-at", String(Date.now()));
    setInstallPrompt(null);
    setShowIosHelp(false);
  }

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function update() {
    const worker = registration.current?.waiting;
    if (!worker) return window.location.reload();
    refreshing.current = true;
    worker.postMessage({ type: "SKIP_WAITING" });
  }

  if (!installPrompt && !showIosHelp && !updateAvailable) return null;

  const updating = updateAvailable;
  return (
    <aside className="fixed inset-x-4 bottom-4 z-[80] ml-auto max-w-sm rounded-2xl border border-white/15 bg-[#111214]/95 p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.72),0_0_30px_rgba(232,111,34,0.18)] backdrop-blur-xl lg:right-6 lg:left-auto">
      <button onClick={dismiss} className="absolute top-3 right-3 rounded-md p-1.5 text-white/55 hover:bg-white/10 hover:text-white" aria-label={text.close}>
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="flex gap-3 pr-7">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e86f22] text-white">
          {updating ? <RefreshCw className="h-5 w-5" aria-hidden="true" /> : showIosHelp ? <Share className="h-5 w-5" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
        </span>
        <div>
          <h2 className="text-base font-semibold">{updating ? text.updateTitle : text.title}</h2>
          <p className="mt-1 text-sm leading-5 text-white/65">{updating ? text.updateText : showIosHelp ? text.ios : text.text}</p>
        </div>
      </div>
      {!showIosHelp && (
        <button onClick={updating ? update : install} className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#e86f22] px-4 py-3 text-sm font-semibold text-white hover:bg-[#cf5c16]">
          {updating ? text.update : text.install}
        </button>
      )}
    </aside>
  );
}
