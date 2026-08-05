import type { TranslationKey } from "@/lib/i18n";

export const WHATSAPP_NUMBER = "551153063212";
export const WHATSAPP_DISPLAY = "+55 11 5306-3212";
export const CONTACT_EMAIL = "contato@yesodautomation.com.br";

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const ADMIN_EMAIL = "yesod.auto@gmail.com";

export const CATEGORIES = ["Novidades", "Automação", "Projetos", "Ofertas"] as const;

export type Category = (typeof CATEGORIES)[number];

export function categoryKey(category: string): TranslationKey {
  const known = (CATEGORIES as readonly string[]).includes(category);
  return (known ? `hub.cat.${category}` : "hub.cat.Novidades") as TranslationKey;
}

/**
 * Soluções configuráveis da YESOD.
 * Edite livremente: os textos vêm dos dicionários em src/lib/i18n.tsx.
 * Nenhuma informação de preço ou disponibilidade é exibida publicamente.
 */
export type Product = {
  id: string;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  featureKeys: TranslationKey[];
  featured?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "diagnostic",
    nameKey: "product.diagnostic.name",
    descriptionKey: "product.diagnostic.desc",
    featureKeys: [
      "product.diagnostic.f1",
      "product.diagnostic.f2",
      "product.diagnostic.f3",
      "product.diagnostic.f4",
    ],
  },
  {
    id: "custom",
    nameKey: "product.custom.name",
    descriptionKey: "product.custom.desc",
    featureKeys: [
      "product.custom.f1",
      "product.custom.f2",
      "product.custom.f3",
      "product.custom.f4",
    ],
    featured: true,
  },
  {
    id: "integrations",
    nameKey: "product.integrations.name",
    descriptionKey: "product.integrations.desc",
    featureKeys: [
      "product.integrations.f1",
      "product.integrations.f2",
      "product.integrations.f3",
      "product.integrations.f4",
    ],
  },
  {
    id: "scale",
    nameKey: "product.scale.name",
    descriptionKey: "product.scale.desc",
    featureKeys: [
      "product.scale.f1",
      "product.scale.f2",
      "product.scale.f3",
      "product.scale.f4",
    ],
  },
];
