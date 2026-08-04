export const WHATSAPP_NUMBER = "5511999999999";

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const CATEGORIES = [
  "Novidades",
  "Dicas de pré-impressão",
  "Projetos",
  "Ofertas",
] as const;

export type Category = (typeof CATEGORIES)[number];
