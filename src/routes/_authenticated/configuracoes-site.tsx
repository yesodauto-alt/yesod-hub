import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Save, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useI18n, type Lang } from "@/lib/i18n";
import { toMultilingualForm, type FounderSettings } from "@/lib/projects";
import { SITE_BUCKET, safeFileName, useMediaUrl, validateImage } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/configuracoes-site")({
  head: () => ({ meta: [{ title: "Configurações do site — Yesod HUB" }] }),
  component: SiteSettings,
});

type FounderForm = {
  name: Record<Lang, string>;
  role: Record<Lang, string>;
  bio: Record<Lang, string>;
  image_url: string | null;
};

const emptyFounder = (): FounderForm => ({
  name: { pt: "", en: "", es: "" },
  role: { pt: "", en: "", es: "" },
  bio: { pt: "", en: "", es: "" },
  image_url: null,
});

const copy = {
  pt: {
    eyebrow: "Administração",
    title: "Editar página inicial",
    description: "Altere a foto e os textos da seção “Quem está por trás da YESOD”.",
    denied: "Esta área está disponível somente para a administradora.",
    photo: "Foto da fundadora",
    photoHint: "JPG, PNG, WebP ou AVIF, com até 5 MB.",
    upload: "Enviar foto",
    change: "Trocar foto",
    remove: "Remover foto",
    name: "Nome",
    role: "Cargo ou função",
    bio: "Texto de apresentação",
    save: "Salvar alterações",
    saving: "Salvando…",
    saved: "Seção atualizada com sucesso.",
    invalidType: "Use uma imagem JPG, PNG, WebP ou AVIF.",
    tooLarge: "A imagem deve ter no máximo 5 MB.",
    loading: "Carregando…",
  },
  en: {
    eyebrow: "Administration",
    title: "Edit home page",
    description: "Update the photo and copy in the “Who is behind YESOD” section.",
    denied: "This area is available only to the administrator.",
    photo: "Founder photo",
    photoHint: "JPG, PNG, WebP or AVIF, up to 5 MB.",
    upload: "Upload photo",
    change: "Change photo",
    remove: "Remove photo",
    name: "Name",
    role: "Role or title",
    bio: "Introduction text",
    save: "Save changes",
    saving: "Saving…",
    saved: "Section updated successfully.",
    invalidType: "Use a JPG, PNG, WebP or AVIF image.",
    tooLarge: "The image must be no larger than 5 MB.",
    loading: "Loading…",
  },
  es: {
    eyebrow: "Administración",
    title: "Editar página inicial",
    description: "Actualiza la foto y los textos de la sección “Quién está detrás de YESOD”.",
    denied: "Esta área está disponible únicamente para la administradora.",
    photo: "Foto de la fundadora",
    photoHint: "JPG, PNG, WebP o AVIF, de hasta 5 MB.",
    upload: "Subir foto",
    change: "Cambiar foto",
    remove: "Eliminar foto",
    name: "Nombre",
    role: "Cargo o función",
    bio: "Texto de presentación",
    save: "Guardar cambios",
    saving: "Guardando…",
    saved: "Sección actualizada correctamente.",
    invalidType: "Usa una imagen JPG, PNG, WebP o AVIF.",
    tooLarge: "La imagen debe tener un máximo de 5 MB.",
    loading: "Cargando…",
  },
} as const;

function SiteSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { lang } = useI18n();
  const labels = copy[lang];
  const [form, setForm] = useState<FounderForm>(emptyFounder);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const previewUrl = useMediaUrl(SITE_BUCKET, form.image_url);

  const adminQuery = useQuery({
    queryKey: ["admin-role", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  });

  const founderQuery = useQuery({
    queryKey: ["site-settings", "founder", "admin"],
    enabled: adminQuery.data === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "founder")
        .maybeSingle();
      if (error) throw error;
      return (data?.value ?? null) as FounderSettings | null;
    },
  });

  useEffect(() => {
    const founder = founderQuery.data;
    if (!founder) return;
    setForm({
      name: toMultilingualForm(founder.name),
      role: toMultilingualForm(founder.role),
      bio: toMultilingualForm(founder.bio),
      image_url: founder.image_url ?? null,
    });
  }, [founderQuery.data]);

  function updateMulti(field: "name" | "role" | "bio", language: Lang, value: string) {
    setForm((current) => ({
      ...current,
      [field]: { ...current[field], [language]: value },
    }));
  }

  async function uploadPhoto(file: File) {
    const valid = validateImage(file);
    if (!valid.ok) {
      toast.error(valid.reason === "size" ? labels.tooLarge : labels.invalidType);
      return;
    }

    setUploading(true);
    try {
      const path = `founder/${safeFileName(file.name)}`;
      const { error } = await supabase.storage.from(SITE_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      setForm((current) => ({ ...current, image_url: path }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const value: FounderSettings = {
        name: form.name,
        role: form.role,
        bio: form.bio,
        image_url: form.image_url,
      };
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "founder", value: value as unknown as Json }, { onConflict: "key" });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["site-settings", "founder"] });
      toast.success(labels.saved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  if (adminQuery.isLoading || founderQuery.isLoading) {
    return <p className="mx-auto max-w-5xl px-6 py-16 text-sm text-muted-foreground">{labels.loading}</p>;
  }

  if (!adminQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Card>
          <CardContent className="p-8 text-muted-foreground">{labels.denied}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{labels.eyebrow}</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">{labels.title}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{labels.description}</p>
      </header>

      <Card className="mt-10 overflow-hidden">
        <CardHeader className="border-b border-border">
          <h2 className="text-lg">{labels.photo}</h2>
          <p className="text-sm text-muted-foreground">{labels.photoHint}</p>
        </CardHeader>
        <CardContent className="grid gap-8 p-6 sm:grid-cols-[220px_1fr] sm:p-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-brand-gradient">
            <div className="flex aspect-[4/5] items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-10 w-10 text-white/75" strokeWidth={1.5} aria-hidden="true" />
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <Button asChild variant="outline" disabled={uploading} className="w-fit">
              <label className="cursor-pointer">
                <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" />
                {form.image_url ? labels.change : labels.upload}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadPhoto(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </Button>
            {form.image_url && (
              <Button
                type="button"
                variant="ghost"
                className="w-fit text-muted-foreground"
                onClick={() => setForm((current) => ({ ...current, image_url: null }))}
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                {labels.remove}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6 sm:p-8">
          <Tabs defaultValue="pt">
            <TabsList>
              <TabsTrigger value="pt">PT</TabsTrigger>
              <TabsTrigger value="en">EN</TabsTrigger>
              <TabsTrigger value="es">ES</TabsTrigger>
            </TabsList>
            {(["pt", "en", "es"] as Lang[]).map((language) => (
              <TabsContent key={language} value={language} className="mt-7 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor={`founder-name-${language}`}>{labels.name}</Label>
                  <Input
                    id={`founder-name-${language}`}
                    value={form.name[language]}
                    onChange={(event) => updateMulti("name", language, event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`founder-role-${language}`}>{labels.role}</Label>
                  <Input
                    id={`founder-role-${language}`}
                    value={form.role[language]}
                    onChange={(event) => updateMulti("role", language, event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`founder-bio-${language}`}>{labels.bio}</Label>
                  <Textarea
                    id={`founder-bio-${language}`}
                    rows={7}
                    value={form.bio[language]}
                    onChange={(event) => updateMulti("bio", language, event.target.value)}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Button type="button" onClick={save} disabled={saving || uploading} className="mt-8">
            <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            {saving ? labels.saving : labels.save}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
