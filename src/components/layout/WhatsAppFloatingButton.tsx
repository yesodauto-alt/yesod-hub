import { MessageCircle } from "lucide-react";

import { whatsappUrl } from "@/lib/yesod";

export function WhatsAppFloatingButton() {
  return (
    <a
      href={whatsappUrl("Olá! Quero saber mais sobre a Comunidade YESOD.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lift transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
