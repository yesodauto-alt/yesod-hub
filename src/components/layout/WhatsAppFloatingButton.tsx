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
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lift transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}
