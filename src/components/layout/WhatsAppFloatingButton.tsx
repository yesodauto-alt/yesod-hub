import { MessageCircle } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/yesod";

export function WhatsAppFloatingButton() {
  const { t } = useI18n();

  return (
    <a
      href={whatsappUrl(t("wa.floatMsg"))}
      target="_blank"
      rel="noreferrer"
      aria-label={t("wa.float")}
      className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-whatsapp text-white shadow-soft hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
    </a>
  );
}
