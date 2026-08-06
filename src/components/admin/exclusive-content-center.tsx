import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, ExternalLink, ImagePlus, Plus, Save, Trash2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor, sanitizeRichText } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type Multilingual } from "@/lib/i18n";
import { translateContent } from "@/lib/translate-content";
import {
  EXCLUSIVE_MEDIA_BUCKET,
  safeFileName,
  useMediaUrl,
  validateEditorialMedia,
  validateImage,
} from "@/lib/storage";

type ExclusiveContent = {
  id: string;
  title: string;
  excerpt: string;
  content_html: string;
  category: string;
  title_i18n: Multilingual;
  excerpt_i18n: Multilingual;
  content_i18n: Multilingual;
  category_i18n: Multilingual;
  cover_image_url: string | null;
  media_url: string | null;
  media_type: string | null;
  external_video_url: string | null;
  published: boolean;
  sort_order: number;
  author_id: string;
  created_at: string;
};

type FormState = Omit<ExclusiveContent, "author_id" | "created_at">;

const blankForm = (): FormState => ({
  id: "",
  title: "",
  excerpt: "",
  content_html: "",
  category: "Material",
  title_i18n: {},
  excerpt_i18n: {},
  content_i18n: {},
  category_i18n: {},
  cover_image_url: null,
  media_url: null,
  media_type: null,
  external_video_url: null,
  published: false,
  sort_order: 0,
});

function embedVideoUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${url.pathname.split("/").filter(Boolean).pop()}`;
  } catch {
    return null;
  }
  return null;
}

function ContentMedia({ item }: { item: ExclusiveContent }) {
  const coverUrl = useMediaUrl(EXCLUSIVE_MEDIA_BUCKET, item.cover_image_url);
  const mediaUrl = useMediaUrl(EXCLUSIVE_MEDIA_BUCKET, item.media_url);
  const embedUrl = embedVideoUrl(item.external_video_url);

  return (
    <>
      {coverUrl && <img src={coverUrl} alt={item.title} className="max-h-[28rem] w-full object-cover" />}
      {mediaUrl && item.media_type === "video" && (
        <video controls preload="metadata" className="mt-5 aspect-video w-full bg-black" src={mediaUrl} />
      )}
      {mediaUrl && item.media_type === "image" && (
        <img src={mediaUrl} alt="" className="mt-5 max-h-[34rem] w-full object-contain bg-slate-50" />
      )}
      {embedUrl && (
        <iframe
          src={embedUrl}
          title={`Vídeo: ${item.title}`}
          className="mt-5 aspect-video w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      {item.external_video_url && !embedUrl && (
        <a href={item.external_video_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 font-semibold text-[#d75a12] hover:underline">
          <ExternalLink className="h-4 w-4" /> Abrir vídeo
        </a>
      )}
    </>
  );
}

export function ExclusiveContentCenter({ isAdmin }: { isAdmin: boolean }) {
  const { tm } = useI18n();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(blankForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const contentsQuery = useQuery({
    queryKey: ["exclusive-contents", isAdmin ? "admin" : "member"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exclusive_contents")
        .select("id,title,excerpt,content_html,category,title_i18n,excerpt_i18n,content_i18n,category_i18n,cover_image_url,media_url,media_type,external_video_url,published,sort_order,author_id,created_at")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ExclusiveContent[];
    },
  });

  async function upload(file: File, cover = false) {
    const validation = cover ? validateImage(file) : validateEditorialMedia(file);
    if (!validation.ok) {
      toast.error(validation.reason === "size" ? "O arquivo ultrapassa o limite permitido." : "Formato de arquivo não permitido.");
      return;
    }
    setUploading(true);
    try {
      const folder = form.id || "drafts";
      const path = `${folder}/${safeFileName(file.name)}`;
      const { error } = await supabase.storage.from(EXCLUSIVE_MEDIA_BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      setForm((current) => cover
        ? { ...current, cover_image_url: path }
        : { ...current, media_url: path, media_type: validation.ok && "mediaType" in validation ? validation.mediaType : "image" });
      toast.success("Arquivo enviado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar arquivo.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.title.trim() || !form.content_html.trim()) {
      toast.error("Preencha o título e o conteúdo.");
      return;
    }
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada.");
      const title = form.title.trim();
      const excerpt = form.excerpt.trim();
      const contentHtml = sanitizeRichText(form.content_html);
      const category = form.category.trim() || "Material";
      const translations = await translateContent({ title, excerpt, content_html: contentHtml, category });
      const payload = {
        title,
        excerpt,
        content_html: contentHtml,
        category,
        title_i18n: { pt: title, en: String(translations.en?.title ?? ""), es: String(translations.es?.title ?? "") },
        excerpt_i18n: { pt: excerpt, en: String(translations.en?.excerpt ?? ""), es: String(translations.es?.excerpt ?? "") },
        content_i18n: { pt: contentHtml, en: String(translations.en?.content_html ?? ""), es: String(translations.es?.content_html ?? "") },
        category_i18n: { pt: category, en: String(translations.en?.category ?? ""), es: String(translations.es?.category ?? "") },
        cover_image_url: form.cover_image_url,
        media_url: form.media_url,
        media_type: form.media_type,
        external_video_url: form.external_video_url?.trim() || null,
        published: form.published,
        sort_order: form.sort_order,
        author_id: auth.user.id,
        updated_at: new Date().toISOString(),
      };
      const result = form.id
        ? await supabase.from("exclusive_contents").update(payload).eq("id", form.id)
        : await supabase.from("exclusive_contents").insert(payload);
      if (result.error) throw result.error;
      await queryClient.invalidateQueries({ queryKey: ["exclusive-contents"] });
      setForm(blankForm());
      toast.success(form.published ? "Conteúdo publicado e traduzido." : "Rascunho salvo e traduzido.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: ExclusiveContent) {
    if (!window.confirm(`Excluir “${item.title}”?`)) return;
    const { error } = await supabase.from("exclusive_contents").delete().eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    const paths = [item.cover_image_url, item.media_url].filter((value): value is string => Boolean(value));
    if (paths.length) await supabase.storage.from(EXCLUSIVE_MEDIA_BUCKET).remove(paths);
    await queryClient.invalidateQueries({ queryKey: ["exclusive-contents"] });
    if (form.id === item.id) setForm(blankForm());
    toast.success("Conteúdo excluído.");
  }

  const items = contentsQuery.data ?? [];

  return (
    <section className={isAdmin ? "mt-12" : "member-reading-surface mt-12 rounded-[1.5rem] p-5 sm:p-8"}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Conteúdo exclusivo</h2>
          <p className="mt-2 text-muted-foreground">Materiais disponíveis apenas para membros do Yesod HUB.</p>
        </div>
        {isAdmin && form.id && (
          <Button variant="outline" onClick={() => setForm(blankForm())}><Plus className="mr-2 h-4 w-4" />Novo conteúdo</Button>
        )}
      </div>

      {isAdmin && (
        <Card className="mt-7 border-t-4 border-t-[#e86f22]">
          <CardHeader>
            <h3 className="text-xl font-bold">{form.id ? "Editar conteúdo" : "Adicionar conteúdo exclusivo"}</h3>
            <p className="text-sm text-muted-foreground">Crie em português; ao salvar, o texto e a formatação são traduzidos automaticamente para inglês e espanhol. Adicione imagens, vídeos enviados ou links do YouTube e Vimeo.</p>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Categoria</Label><Input value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Ordem de exibição</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm((c) => ({ ...c, sort_order: Number(e.target.value) }))} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Resumo</Label><Textarea rows={3} value={form.excerpt} onChange={(e) => setForm((c) => ({ ...c, excerpt: e.target.value }))} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Texto completo e formatação</Label><RichTextEditor id="exclusive-content-editor" value={form.content_html} onChange={(value) => setForm((c) => ({ ...c, content_html: value }))} /></div>
            <div className="space-y-3">
              <Label>Imagem de capa</Label>
              <Button asChild variant="outline" disabled={uploading}><label className="cursor-pointer"><ImagePlus className="mr-2 h-4 w-4" />Enviar capa<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file, true); e.currentTarget.value = ""; }} /></label></Button>
              {form.cover_image_url && <p className="text-xs text-muted-foreground">Capa adicionada.</p>}
            </div>
            <div className="space-y-3">
              <Label>Foto ou vídeo do conteúdo</Label>
              <Button asChild variant="outline" disabled={uploading}><label className="cursor-pointer"><Upload className="mr-2 h-4 w-4" />Enviar mídia<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); e.currentTarget.value = ""; }} /></label></Button>
              {form.media_url && <p className="text-xs text-muted-foreground">{form.media_type === "video" ? "Vídeo" : "Imagem"} adicionado.</p>}
            </div>
            <div className="space-y-2 sm:col-span-2"><Label>Link de vídeo (YouTube, Vimeo ou outro)</Label><Input type="url" placeholder="https://..." value={form.external_video_url ?? ""} onChange={(e) => setForm((c) => ({ ...c, external_video_url: e.target.value }))} /></div>
            <label className="flex items-center gap-3 text-sm font-semibold sm:col-span-2"><Checkbox checked={form.published} onCheckedChange={(checked) => setForm((c) => ({ ...c, published: checked === true }))} />Publicado</label>
            <div className="flex flex-wrap gap-3 sm:col-span-2"><Button onClick={save} disabled={saving || uploading} className="bg-[#e86f22] text-white hover:bg-[#cf5c16]"><Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : form.published ? "Salvar e publicar" : "Salvar rascunho"}</Button></div>
          </CardContent>
        </Card>
      )}

      {contentsQuery.isLoading && <p className="mt-7 text-sm text-muted-foreground">Carregando conteúdos...</p>}
      {contentsQuery.isError && <p className="mt-7 text-sm text-destructive">Não foi possível carregar os conteúdos.</p>}
      {!contentsQuery.isLoading && items.length === 0 && <p className="mt-7 border border-dashed border-border bg-white p-8 text-center text-muted-foreground">Nenhum conteúdo publicado ainda.</p>}
      <div className="mt-7 space-y-6">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden border border-border bg-white shadow-soft">
            <ContentMedia item={item} />
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#d75a12]">{tm(item.category_i18n) || item.category}</span>
                {isAdmin && <span className={`text-xs font-semibold ${item.published ? "text-emerald-700" : "text-amber-700"}`}>{item.published ? "Publicado" : "Rascunho"}</span>}
              </div>
              <h3 className="mt-3 text-2xl font-bold">{tm(item.title_i18n) || item.title}</h3>
              {(tm(item.excerpt_i18n) || item.excerpt) && <p className="mt-3 text-muted-foreground">{tm(item.excerpt_i18n) || item.excerpt}</p>}
              <div className="rich-text mt-6 text-base leading-8 text-slate-700" dangerouslySetInnerHTML={{ __html: sanitizeRichText(tm(item.content_i18n) || item.content_html) }} />
              {isAdmin && (
                <div className="mt-7 flex gap-3 border-t border-border pt-5">
                  <Button variant="outline" onClick={() => { setForm({ ...item, external_video_url: item.external_video_url ?? null }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Edit3 className="mr-2 h-4 w-4" />Editar</Button>
                  <Button variant="outline" className="text-destructive" onClick={() => void remove(item)}><Trash2 className="mr-2 h-4 w-4" />Excluir</Button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
