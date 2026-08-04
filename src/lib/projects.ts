import type { Lang, Multilingual } from "@/lib/i18n";

export const INTERACTION_TYPES = ["details", "external_demo", "whatsapp"] as const;
export type InteractionType = (typeof INTERACTION_TYPES)[number];

export type ProjectRow = {
  id: string;
  slug: string;
  title: Multilingual;
  category: Multilingual;
  summary: Multilingual;
  context: Multilingual;
  automation: Multilingual;
  solution: Multilingual;
  result: Multilingual;
  content: Multilingual;
  image_url: string | null;
  gallery_urls: string[];
  interaction_type: InteractionType;
  interaction_label: Multilingual;
  interaction_url: string | null;
  published: boolean;
  sort_order: number;
};

export const PROJECT_COLUMNS =
  "id, slug, title, category, summary, context, automation, solution, result, content, image_url, gallery_urls, interaction_type, interaction_label, interaction_url, published, sort_order";

export function emptyMultilingual(): Record<Lang, string> {
  return { pt: "", en: "", es: "" };
}

export function toMultilingualForm(value: Multilingual | null | undefined): Record<Lang, string> {
  return {
    pt: value?.pt ?? "",
    en: value?.en ?? "",
    es: value?.es ?? "",
  };
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type FounderSettings = {
  name: Multilingual;
  role: Multilingual;
  bio: Multilingual;
  image_url: string | null;
};
