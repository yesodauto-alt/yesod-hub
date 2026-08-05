import { supabase } from "@/integrations/supabase/client";
import type { Lang, Multilingual } from "@/lib/i18n";

type TranslationValue = string | string[];
type Translations = Partial<Record<Lang, Record<string, TranslationValue>>>;

export async function translateContent(
  fields: Record<string, TranslationValue>,
  sourceLanguage: Lang = "pt",
  targetLanguages: Lang[] = ["en", "es"],
): Promise<Translations> {
  const { data, error } = await supabase.functions.invoke("translate-content", {
    body: { fields, sourceLanguage, targetLanguages },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return (data?.translations ?? {}) as Translations;
}

export function multilingualFrom(
  source: string,
  translations: Translations,
  field: string,
): Multilingual {
  return {
    pt: source,
    en: String(translations.en?.[field] ?? ""),
    es: String(translations.es?.[field] ?? ""),
  };
}
