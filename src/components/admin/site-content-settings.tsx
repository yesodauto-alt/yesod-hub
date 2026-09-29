import { Bot, Languages, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { Lang, Multilingual } from "@/lib/i18n";
import { translateContent } from "@/lib/translate-content";
import {
  DEFAULT_AI_EXPERIENCE,
  defaultConfigurableProducts,
  type AiExperienceSettings,
  type ConfigurableProduct,
} from "@/lib/yesod";

const languages: Lang[] = ["pt", "en", "es"];

function newProduct(): ConfigurableProduct {
  return {
    id: `product-${Date.now()}`,
    name: { pt: "Novo produto", en: "", es: "" },
    description: { pt: "", en: "", es: "" },
    features: { pt: [], en: [], es: [] },
    featured: false,
    published: false,
  };
}

export function ProductSettingsEditor() {
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<ConfigurableProduct[]>([]);
  const [saving, setSaving] = useState(false);
  const query = useQuery({
    queryKey: ["site-settings", "products", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "products").maybeSingle();
      if (error) throw error;
      return Array.isArray(data?.value) ? (data.value as unknown as ConfigurableProduct[]) : null;
    },
  });

  useEffect(() => {
    if (query.isLoading) return;
    setProducts(query.data?.length ? query.data : defaultConfigurableProducts());
  }, [query.data, query.isLoading]);

  function update(index: number, change: Partial<ConfigurableProduct>) {
    setProducts((current) => current.map((product, itemIndex) => itemIndex === index ? { ...product, ...change } : product));
  }

  function updateLanguage(index: number, field: "name" | "description", language: Lang, value: string) {
    setProducts((current) => current.map((product, itemIndex) => itemIndex === index
      ? { ...product, [field]: { ...product[field], [language]: value } }
      : product));
  }

  function updateFeatures(index: number, language: Lang, value: string) {
    const features = value.split("\n").map((item) => item.trim()).filter(Boolean);
    setProducts((current) => current.map((product, itemIndex) => itemIndex === index
      ? { ...product, features: { ...product.features, [language]: features } }
      : product));
  }

  async function save() {
    setSaving(true);
    try {
      const fields: Record<string, string | string[]> = {};
      products.forEach((product, index) => {
        fields[`product_${index}_name`] = product.name.pt ?? "";
        fields[`product_${index}_description`] = product.description.pt ?? "";
        fields[`product_${index}_features`] = product.features.pt ?? [];
      });
      const translated = await translateContent(fields);
      const localizedProducts = products.map((product, index) => ({
        ...product,
        name: {
          pt: product.name.pt ?? "",
          en: String(translated.en?.[`product_${index}_name`] ?? product.name.en ?? ""),
          es: String(translated.es?.[`product_${index}_name`] ?? product.name.es ?? ""),
        },
        description: {
          pt: product.description.pt ?? "",
          en: String(translated.en?.[`product_${index}_description`] ?? product.description.en ?? ""),
          es: String(translated.es?.[`product_${index}_description`] ?? product.description.es ?? ""),
        },
        features: {
          pt: product.features.pt ?? [],
          en: (translated.en?.[`product_${index}_features`] as string[] | undefined) ?? product.features.en ?? [],
          es: (translated.es?.[`product_${index}_features`] as string[] | undefined) ?? product.features.es ?? [],
        },
      }));
      setProducts(localizedProducts);
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "products", value: localizedProducts as unknown as Json }, { onConflict: "key" });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["site-settings", "products"] });
      toast.success("Produtos atualizados e traduzidos para inglês e espanhol.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border">
        <div>
          <h2 className="text-xl">Produtos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Crie, edite, publique e reorganize o catálogo exibido no site.</p>
        </div>
        <Button type="button" size="sm" onClick={() => setProducts((current) => [...current, newProduct()])}>
          <Plus className="mr-2 h-4 w-4" /> Novo produto
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-6 sm:p-8">
        {products.map((product, index) => (
          <div key={product.id} className="border border-border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d75a12]">Produto {index + 1}</span>
                <h3 className="mt-1 text-lg">{product.name.pt || "Sem nome"}</h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setProducts((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox checked={product.published} onCheckedChange={(checked) => update(index, { published: checked === true })} />
                Publicado
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox checked={product.featured} onCheckedChange={(checked) => update(index, { featured: checked === true })} />
                Destacado
              </label>
            </div>

            <Tabs defaultValue="pt" className="mt-5">
              <TabsList>
                <TabsTrigger value="pt">PT</TabsTrigger>
                <TabsTrigger value="en">EN</TabsTrigger>
                <TabsTrigger value="es">ES</TabsTrigger>
              </TabsList>
              {languages.map((language) => (
                <TabsContent key={language} value={language} className="mt-5 grid gap-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={product.name[language] ?? ""} onChange={(event) => updateLanguage(index, "name", language, event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea rows={3} value={product.description[language] ?? ""} onChange={(event) => updateLanguage(index, "description", language, event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Benefícios — um por linha</Label>
                    <Textarea rows={5} value={(product.features[language] ?? []).join("\n")} onChange={(event) => updateFeatures(index, language, event.target.value)} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ))}

        <Button type="button" onClick={save} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando…" : "Salvar produtos"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AiExperienceSettingsEditor() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AiExperienceSettings>(DEFAULT_AI_EXPERIENCE);
  const [saving, setSaving] = useState(false);
  const query = useQuery({
    queryKey: ["site-settings", "ai-experience", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "ai_experience").maybeSingle();
      if (error) throw error;
      return data?.value ? (data.value as unknown as AiExperienceSettings) : null;
    },
  });

  useEffect(() => {
    if (!query.data) return;
    const value = query.data as AiExperienceSettings & Record<string, unknown>;
    const localized = (candidate: unknown, fallback: Multilingual): Multilingual =>
      typeof candidate === "string" ? { ...fallback, pt: candidate } : { ...fallback, ...(candidate as Multilingual) };
    setSettings({
      ...DEFAULT_AI_EXPERIENCE,
      ...value,
      eyebrow: localized(value.eyebrow, DEFAULT_AI_EXPERIENCE.eyebrow),
      headline: localized(value.headline, DEFAULT_AI_EXPERIENCE.headline),
      description: localized(value.description, DEFAULT_AI_EXPERIENCE.description),
      buttonLabel: localized(value.buttonLabel, DEFAULT_AI_EXPERIENCE.buttonLabel),
    });
  }, [query.data]);

  async function save() {
    setSaving(true);
    try {
      const translations = await translateContent({
        eyebrow: settings.eyebrow.pt ?? "",
        headline: settings.headline.pt ?? "",
        description: settings.description.pt ?? "",
        buttonLabel: settings.buttonLabel.pt ?? "",
      });
      const localizedSettings: AiExperienceSettings = {
        ...settings,
        eyebrow: { pt: settings.eyebrow.pt ?? "", en: String(translations.en?.eyebrow ?? settings.eyebrow.en ?? ""), es: String(translations.es?.eyebrow ?? settings.eyebrow.es ?? "") },
        headline: { pt: settings.headline.pt ?? "", en: String(translations.en?.headline ?? settings.headline.en ?? ""), es: String(translations.es?.headline ?? settings.headline.es ?? "") },
        description: { pt: settings.description.pt ?? "", en: String(translations.en?.description ?? settings.description.en ?? ""), es: String(translations.es?.description ?? settings.description.es ?? "") },
        buttonLabel: { pt: settings.buttonLabel.pt ?? "", en: String(translations.en?.buttonLabel ?? settings.buttonLabel.en ?? ""), es: String(translations.es?.buttonLabel ?? settings.buttonLabel.es ?? "") },
      };
      setSettings(localizedSettings);
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "ai_experience", value: localizedSettings as unknown as Json }, { onConflict: "key" });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["site-settings", "ai-experience"] });
      toast.success("Experiência de IA atualizada e traduzida para inglês e espanhol.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl">Experiência de IA</h2>
            <p className="mt-1 text-sm text-muted-foreground">Conecte a experiência que o visitante poderá testar pela página inicial.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 p-6 sm:p-8">
        <label className="flex items-center gap-3 text-sm font-medium">
          <Checkbox checked={settings.enabled} onCheckedChange={(checked) => setSettings((current) => ({ ...current, enabled: checked === true }))} />
          Exibir a experiência de IA na página inicial
        </label>
        <div className="flex items-start gap-3 border border-[#e86f22]/35 bg-[#fff8f3] p-4 text-sm text-foreground">
          <Languages className="mt-0.5 h-5 w-5 shrink-0 text-[#d75a12]" />
          <p>Escreva em português. Ao salvar, o sistema gera automaticamente as versões em inglês e espanhol. As abas EN e ES permanecem disponíveis para sua revisão e ajuste.</p>
        </div>
        <Tabs defaultValue="pt">
          <TabsList>
            <TabsTrigger value="pt">PT</TabsTrigger>
            <TabsTrigger value="en">EN</TabsTrigger>
            <TabsTrigger value="es">ES</TabsTrigger>
          </TabsList>
          {languages.map((language) => (
            <TabsContent key={language} value={language} className="mt-5 grid gap-4">
              <div className="space-y-2">
                <Label>Chamada superior</Label>
                <Input value={settings.eyebrow[language] ?? ""} onChange={(event) => setSettings((current) => ({ ...current, eyebrow: { ...current.eyebrow, [language]: event.target.value } }))} />
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={settings.headline[language] ?? ""} onChange={(event) => setSettings((current) => ({ ...current, headline: { ...current.headline, [language]: event.target.value } }))} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea rows={3} value={settings.description[language] ?? ""} onChange={(event) => setSettings((current) => ({ ...current, description: { ...current.description, [language]: event.target.value } }))} />
              </div>
              <div className="space-y-2">
                <Label>Texto do botão</Label>
                <Input value={settings.buttonLabel[language] ?? ""} onChange={(event) => setSettings((current) => ({ ...current, buttonLabel: { ...current.buttonLabel, [language]: event.target.value } }))} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <p className="text-sm text-muted-foreground">O botão abre o chat do Marley dentro do Yesod HUB. A conexão do modelo é gerenciada no servidor.</p>
        <Button type="button" onClick={save} disabled={saving} className="w-fit bg-purple-700 hover:bg-purple-800">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Salvando…" : "Salvar configuração da IA"}
        </Button>
      </CardContent>
    </Card>
  );
}
