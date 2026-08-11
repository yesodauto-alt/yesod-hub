import { translateKey, type Lang, type Multilingual, type TranslationKey } from "@/lib/i18n";

export const WHATSAPP_NUMBER = "551153063212";
export const WHATSAPP_DISPLAY = "+55 11 5306-3212";
export const CONTACT_EMAIL = "contato@yesodautomation.com.br";

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const ADMIN_EMAIL = "yesod.auto@gmail.com";

export const CATEGORIES = ["Novidades", "Automação", "Projetos"] as const;

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


export type ConfigurableProduct = {
  id: string;
  name: Multilingual;
  description: Multilingual;
  features: Record<Lang, string[]>;
  featured: boolean;
  published: boolean;
};

export function defaultConfigurableProducts(): ConfigurableProduct[] {
  return PRODUCTS.map((product) => ({
    id: product.id,
    name: {
      pt: translateKey(product.nameKey, "pt"),
      en: translateKey(product.nameKey, "en"),
      es: translateKey(product.nameKey, "es"),
    },
    description: {
      pt: translateKey(product.descriptionKey, "pt"),
      en: translateKey(product.descriptionKey, "en"),
      es: translateKey(product.descriptionKey, "es"),
    },
    features: {
      pt: product.featureKeys.map((key) => translateKey(key, "pt")),
      en: product.featureKeys.map((key) => translateKey(key, "en")),
      es: product.featureKeys.map((key) => translateKey(key, "es")),
    },
    featured: product.featured === true,
    published: true,
  }));
}

export type AiExperienceSettings = {
  enabled: boolean;
  headline: Multilingual;
  description: Multilingual;
  buttonLabel: Multilingual;
  eyebrow: Multilingual;
  url: string;
};

export const DEFAULT_AI_EXPERIENCE: AiExperienceSettings = {
  enabled: false,
  eyebrow: {
    pt: "Experiência interativa",
    en: "Interactive experience",
    es: "Experiencia interactiva",
  },
  headline: {
    pt: "Experimente a inteligência artificial da YESOD",
    en: "Experience YESOD artificial intelligence",
    es: "Experimenta la inteligencia artificial de YESOD",
  },
  description: {
    pt: "Converse com nossa IA e veja como uma experiência automatizada pode transformar o atendimento.",
    en: "Talk to our AI and see how an automated experience can transform customer service.",
    es: "Habla con nuestra IA y descubre cómo una experiencia automatizada puede transformar la atención al cliente.",
  },
  buttonLabel: {
    pt: "FALE COM O MARLEY",
    en: "TALK TO MARLEY",
    es: "HABLA CON MARLEY",
  },
  url: "",
};
