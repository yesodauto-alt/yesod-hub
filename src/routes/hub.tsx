import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Edit3, ExternalLink, Heart, ImagePlus, MessageSquare, Plus, Save, Send, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor, sanitizeRichText } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LOCALES, useI18n, useLocalizedMeta, type Multilingual, type TranslationKey } from "@/lib/i18n";
import { translateContent } from "@/lib/translate-content";
import { HUB_MEDIA_BUCKET, safeFileName, useMediaUrl, validateEditorialMedia, validateImage } from "@/lib/storage";
import { CATEGORIES } from "@/lib/yesod";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Yesod HUB - feed de automação e IA" },
      { name: "description", content: "Publicações da equipe YESOD: notícias, análises e aplicações de inteligência artificial." },
    ],
    links: [{ rel: "canonical", href: "/hub" }],
  }),
  component: FeedPage,
});

type Post = {
  id: string;
  title: string;
  title_i18n: Multilingual;
  author_name: string;
  category: string;
  content: string;
  content_i18n: Multilingual;
  image_url: string | null;
  media_url: string | null;
  media_type: string | null;
  external_video_url: string | null;
  source_url?: string;
  source_label?: string;
  published: boolean;
  created_at: string;
};

const PREVIEW_EDITORIAL_POSTS: Post[] = [
  {
    id: "preview-editorial-china-602m",
    title: "602 milhões de pessoas: a escala da IA generativa na China",
    title_i18n: { pt: "602 milhões de pessoas: a escala da IA generativa na China" },
    author_name: "Curadoria YESOD",
    category: "Novidades",
    content: `<p>A inteligência artificial generativa deixou de ser um experimento de nicho na China. Dados do CNNIC indicam que o país chegou a <strong>602 milhões de usuários</strong> em dezembro de 2025 — crescimento de 141,7% em um ano.</p><p>O dado ajuda a entender a velocidade com que assistentes, tradução, criação de conteúdo e serviços inteligentes estão entrando na rotina das pessoas e das empresas.</p><p><small>Foto: Edward He / Unsplash.</small></p>`,
    content_i18n: {},
    image_url: "https://unsplash.com/photos/uKyzXEc2k_s/download?force=true&w=1600",
    media_url: null,
    media_type: null,
    external_video_url: null,
    source_url: "https://english.www.gov.cn/archive/statistics/202602/05/content_WS698442cac6d00ca5f9a08edc.html",
    source_label: "Governo da China / Xinhua",
    published: true,
    created_at: "2026-08-10T12:00:00.000Z",
  },
  {
    id: "preview-editorial-china-daily-life",
    title: "Quando a IA deixa de ser novidade e passa a fazer parte da rotina",
    title_i18n: { pt: "Quando a IA deixa de ser novidade e passa a fazer parte da rotina" },
    author_name: "Curadoria YESOD",
    category: "Automação",
    content: `<p>Na China, a adoção acelerada mostra uma IA cada vez menos percebida como ferramenta isolada. Ela aparece em compras, pagamentos, mobilidade, atendimento, tradução, criação de conteúdo e recomendações que acompanham o dia a dia.</p><p>O ponto mais interessante não é apenas a tecnologia disponível, mas a <strong>integração entre plataformas, dados e serviços</strong>. É essa continuidade que transforma conveniência em hábito.</p><p><small>Foto: Freeman Zhou / Unsplash.</small></p>`,
    content_i18n: {},
    image_url: "https://unsplash.com/photos/oV9hp8wXkPE/download?force=true&w=1600",
    media_url: null,
    media_type: null,
    external_video_url: null,
    source_url: "https://apnews.com/article/0126a120113a92fa450ecb2e464b35bc",
    source_label: "Associated Press",
    published: true,
    created_at: "2026-08-09T12:00:00.000Z",
  },
  {
    id: "preview-editorial-embodied-ai",
    title: "Robôs saem das demonstrações e entram no trabalho real",
    title_i18n: { pt: "Robôs saem das demonstrações e entram no trabalho real" },
    author_name: "Curadoria YESOD",
    category: "Automação",
    content: `<p>Limpar ambientes, orientar o trânsito e atuar em áreas industriais de risco: a chamada <strong>IA incorporada</strong> começa a ocupar funções concretas na China.</p><p>Um exemplo combina um profissional de limpeza, um robô móvel e suporte técnico. A máquina assume tarefas repetitivas, enquanto a pessoa se concentra no que exige percepção fina e decisão. É uma imagem prática do futuro do trabalho: automação como divisão inteligente de esforço.</p><p><small>Foto: Gabriele Malaspina / Unsplash.</small></p>`,
    content_i18n: {},
    image_url: "https://unsplash.com/photos/CjWsslYVnPI/download?force=true&w=1600",
    media_url: null,
    media_type: null,
    external_video_url: null,
    source_url: "https://www.scmp.com/tech/tech-trends/article/3352368/chinas-robots-step-real-world-roles-cleaning-directing-traffic",
    source_label: "South China Morning Post",
    published: true,
    created_at: "2026-08-08T12:00:00.000Z",
  },
  {
    id: "preview-editorial-smart-mobility",
    title: "Mobilidade inteligente: a IA já influencia como as cidades se movem",
    title_i18n: { pt: "Mobilidade inteligente: a IA já influencia como as cidades se movem" },
    author_name: "Curadoria YESOD",
    category: "Novidades",
    content: `<p>Desde o início de 2026, 70% dos carros novos de passeio vendidos na China já incorporavam recursos combinados de assistência ao motorista; mais de 30% ofereciam navegação assistida.</p><p>A escala torna segurança, transparência e responsabilidade tão importantes quanto inovação. Uma nova norma nacional, prevista para vigorar em 2027, estabelece requisitos para sistemas, registros de dados e interação entre pessoas e veículos.</p><p><small>Foto: Erik Mclean / Unsplash.</small></p>`,
    content_i18n: {},
    image_url: "https://unsplash.com/photos/ZWW2SDPaC54/download?force=true&w=1600",
    media_url: null,
    media_type: null,
    external_video_url: null,
    source_url: "https://english.www.gov.cn/news/202607/02/content_WS6a466379c6d00ca5f9a0bfd4.html",
    source_label: "Governo da China / Xinhua",
    published: true,
    created_at: "2026-08-07T12:00:00.000Z",
  },
  {
    id: "preview-editorial-ai-agents",
    title: "Agentes de IA: quando o assistente começa a agir",
    title_i18n: { pt: "Agentes de IA: quando o assistente começa a agir" },
    author_name: "Curadoria YESOD",
    category: "Projetos",
    content: `<p>A próxima transformação não está apenas em IAs que respondem perguntas, mas em sistemas capazes de <strong>planejar etapas, usar ferramentas e concluir tarefas</strong> com supervisão humana.</p><p>Esse movimento aproxima a IA da operação real das empresas. Também aumenta a importância de limites claros, registro das ações, proteção de dados e aprovação humana nos momentos críticos.</p><p><small>Foto: Andy Kelly / Unsplash.</small></p>`,
    content_i18n: {},
    image_url: "https://unsplash.com/photos/0E_vhMVqL9g/download?force=true&w=1600",
    media_url: null,
    media_type: null,
    external_video_url: null,
    source_url: "https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-collection/",
    source_label: "Google",
    published: true,
    created_at: "2026-08-06T12:00:00.000Z",
  },
];

function categoryKey(category: string): TranslationKey {
  return `hub.cat.${category}` as TranslationKey;
}

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
  } catch { return null; }
  return null;
}

function HubMedia({ post }: { post: Post }) {
  const storedCoverUrl = useMediaUrl(HUB_MEDIA_BUCKET, post.image_url);
  const coverUrl = post.image_url?.startsWith("http") ? post.image_url : storedCoverUrl;
  const mediaUrl = useMediaUrl(HUB_MEDIA_BUCKET, post.media_url);
  const embedUrl = embedVideoUrl(post.external_video_url);
  return (
    <>
      {coverUrl && <div className="px-5 pt-5 sm:px-7 sm:pt-7"><img src={coverUrl} alt={post.title} className="aspect-video max-h-[22rem] w-full rounded-2xl object-cover" /></div>}
      {mediaUrl && post.media_type === "video" && <video controls preload="metadata" className="aspect-video w-full bg-black" src={mediaUrl} />}
      {mediaUrl && post.media_type === "image" && <img src={mediaUrl} alt="" className="max-h-[34rem] w-full object-contain bg-slate-50" />}
      {embedUrl && <iframe src={embedUrl} title={`Vídeo: ${post.title}`} className="aspect-video w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
      {post.external_video_url && !embedUrl && (
        <a href={post.external_video_url} target="_blank" rel="noreferrer" className="m-5 inline-flex items-center gap-2 font-semibold text-[#d75a12] hover:underline"><ExternalLink className="h-4 w-4" />Abrir vídeo</a>
      )}
    </>
  );
}

function FeedPage() {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin(user);
  const { t, lang } = useI18n();
  const [category, setCategory] = useState("Todas");
  useLocalizedMeta("meta.hub.title", "meta.hub.desc");

  const postsQuery = useQuery({
    queryKey: ["posts", category, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("id,title,title_i18n,author_name,category,content,content_i18n,image_url,media_url,media_type,external_video_url,published,created_at")
        .order("created_at", { ascending: false })
        .neq("category", "Ofertas");
      if (category !== "Todas") query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Post[];
    },
  });

  const editorialPosts = category === "Todas" ? PREVIEW_EDITORIAL_POSTS : PREVIEW_EDITORIAL_POSTS.filter((post) => post.category === category);
  const visiblePosts = [...editorialPosts, ...(postsQuery.data ?? [])].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

  return (
    <div className="yesod-page-icons mx-auto max-w-4xl px-5 py-14 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">YESOD</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">{t("hub.title")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("hub.subtitle")}</p>
      </header>

      {isAdmin && <AdminComposer posts={postsQuery.data ?? []} />}

      <div className="mt-9 flex flex-wrap gap-2 border-b border-border pb-5">
        {["Todas", ...CATEGORIES].map((item) => (
          <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${category === item ? "bg-[#e86f22] text-white shadow-sm" : "border border-[#e86f22]/45 bg-card text-[#c65313] hover:bg-[#fff1e7]"}`}>
            {item === "Todas" ? t("hub.all") : t(categoryKey(item))}
          </button>
        ))}
      </div>

      {!user && !loading && (
        <div className="mt-6 border border-border bg-card px-4 py-3 text-sm">
          <span className="text-muted-foreground">{t("hub.signInBanner")} </span>
          <Link to="/auth" className="font-semibold text-[#d75a12] hover:underline">{t("hub.signInLink")}</Link>
        </div>
      )}

      <div className="mt-7 space-y-5">
        {postsQuery.isLoading && <p className="text-sm text-muted-foreground">{t("hub.loadingPosts")}</p>}
        {postsQuery.isError && <p className="text-sm text-destructive">{t("hub.loadError")}</p>}
        {visiblePosts.length === 0 && <p className="border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">{t("hub.empty")}</p>}
        {visiblePosts.map((post) => <PostCard key={post.id} post={post} userId={post.id.startsWith("preview-editorial-") ? null : user?.id ?? null} locale={LOCALES[lang]} isAdmin={isAdmin} />)}
      </div>
    </div>
  );
}

function AdminComposer({ posts }: { posts: Post[] }) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const [externalVideoUrl, setExternalVideoUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [uploading, setUploading] = useState(false);

  function reset() {
    setEditId(null); setTitle(""); setContent(""); setCategory(CATEGORIES[0]); setImageUrl(null); setMediaUrl(null); setMediaType(null); setExternalVideoUrl(""); setPublished(false);
  }

  function edit(post: Post) {
    setEditId(post.id); setTitle(post.title); setContent(post.content); setCategory(post.category); setImageUrl(post.image_url); setMediaUrl(post.media_url); setMediaType(post.media_type); setExternalVideoUrl(post.external_video_url ?? ""); setPublished(post.published);
    document.getElementById("hub-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function upload(file: File, cover = false) {
    const validation = cover ? validateImage(file) : validateEditorialMedia(file);
    if (!validation.ok) { toast.error(validation.reason === "size" ? "O arquivo ultrapassa o limite permitido." : "Formato não permitido."); return; }
    setUploading(true);
    try {
      const path = `${editId ?? "drafts"}/${safeFileName(file.name)}`;
      const { error } = await supabase.storage.from(HUB_MEDIA_BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      if (cover) setImageUrl(path);
      else { setMediaUrl(path); setMediaType(validation.ok && "mediaType" in validation ? validation.mediaType : "image"); }
      toast.success("Arquivo enviado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Falha no upload."); }
    finally { setUploading(false); }
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error(t("auth.failed"));
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", auth.user.id).maybeSingle();
      const cleanTitle = title.trim();
      const cleanContent = sanitizeRichText(content);
      const translations = await translateContent({ title: cleanTitle, content: cleanContent });
      const payload = {
        author_id: auth.user.id,
        author_name: profile?.full_name || "YESOD",
        title: cleanTitle,
        title_i18n: { pt: cleanTitle, en: String(translations.en?.title ?? ""), es: String(translations.es?.title ?? "") },
        content: cleanContent,
        content_i18n: { pt: cleanContent, en: String(translations.en?.content ?? ""), es: String(translations.es?.content ?? "") },
        category,
        image_url: imageUrl,
        media_url: mediaUrl,
        media_type: mediaType,
        external_video_url: externalVideoUrl.trim() || null,
        published,
        updated_at: new Date().toISOString(),
      };
      const result = editId ? await supabase.from("posts").update(payload).eq("id", editId) : await supabase.from("posts").insert(payload);
      if (result.error) throw result.error;
    },
    onSuccess: () => { toast.success(published ? "Publicação atualizada e traduzida." : "Rascunho salvo e traduzido."); reset(); queryClient.invalidateQueries({ queryKey: ["posts"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  async function remove(post: Post) {
    if (!window.confirm(`Excluir “${post.title}”?`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) { toast.error(error.message); return; }
    const paths = [post.image_url, post.media_url].filter((value): value is string => Boolean(value));
    if (paths.length) await supabase.storage.from(HUB_MEDIA_BUCKET).remove(paths);
    if (editId === post.id) reset();
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Publicação excluída.");
  }

  return (
    <Card id="hub-editor" className="mt-9 border-t-4 border-t-[#e86f22] shadow-none">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between gap-4"><div><h2 className="font-display text-lg font-semibold">{editId ? "Editar publicação" : "Nova publicação"}</h2><p className="mt-1 text-sm text-muted-foreground">Escreva em português; títulos e textos são traduzidos automaticamente para inglês e espanhol, preservando a formatação.</p></div>{editId && <Button variant="outline" onClick={reset}><Plus className="mr-2 h-4 w-4" />Nova</Button>}</div>
      </CardHeader>
      <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2"><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="space-y-2"><Label>Categoria</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((item) => <SelectItem key={item} value={item}>{t(categoryKey(item))}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Link de vídeo</Label><Input type="url" placeholder="YouTube, Vimeo ou outro" value={externalVideoUrl} onChange={(e) => setExternalVideoUrl(e.target.value)} /></div>
        <div className="space-y-2 sm:col-span-2"><Label>Texto e formatação</Label><RichTextEditor id="hub-rich-editor" value={content} onChange={setContent} /></div>
        <div className="space-y-3"><Label>Imagem de capa</Label><Button asChild variant="outline" disabled={uploading}><label className="cursor-pointer"><ImagePlus className="mr-2 h-4 w-4" />Enviar capa<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => { const file=e.target.files?.[0]; if(file) void upload(file,true); e.currentTarget.value=""; }} /></label></Button>{imageUrl && <p className="text-xs text-muted-foreground">Capa adicionada.</p>}</div>
        <div className="space-y-3"><Label>Foto ou vídeo</Label><Button asChild variant="outline" disabled={uploading}><label className="cursor-pointer"><Upload className="mr-2 h-4 w-4" />Enviar mídia<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" onChange={(e) => { const file=e.target.files?.[0]; if(file) void upload(file); e.currentTarget.value=""; }} /></label></Button>{mediaUrl && <p className="text-xs text-muted-foreground">{mediaType === "video" ? "Vídeo" : "Imagem"} adicionado.</p>}</div>
        <label className="flex items-center gap-3 text-sm font-semibold sm:col-span-2"><Checkbox checked={published} onCheckedChange={(checked) => setPublished(checked === true)} />Publicado</label>
        <div className="sm:col-span-2"><Button onClick={() => mutation.mutate()} disabled={mutation.isPending || uploading || !title.trim() || !content.trim()} className="bg-[#e86f22] text-white hover:bg-[#cf5c16]"><Save className="mr-2 h-4 w-4" />{mutation.isPending ? "Salvando..." : published ? "Salvar e publicar" : "Salvar rascunho"}</Button></div>
        {posts.length > 0 && <div className="space-y-2 border-t border-border pt-5 sm:col-span-2"><h3 className="font-semibold">Gerenciar publicações</h3>{posts.map((post) => <div key={post.id} className="flex items-center justify-between gap-3 border border-border bg-slate-50 p-3"><div className="min-w-0"><p className="truncate font-medium">{post.title}</p><p className="text-xs text-muted-foreground">{post.published ? "Publicado" : "Rascunho"}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => edit(post)}><Edit3 className="mr-1 h-3.5 w-3.5" />Editar</Button><Button size="sm" variant="outline" className="text-destructive" onClick={() => void remove(post)}><Trash2 className="h-3.5 w-3.5" /></Button></div></div>)}</div>}
      </CardContent>
    </Card>
  );
}

function PostCard({ post, userId, locale, isAdmin }: { post: Post; userId: string | null; locale: string; isAdmin: boolean }) {
  const queryClient = useQueryClient();
  const { t, tm } = useI18n();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const likesQuery = useQuery({ queryKey: ["likes", post.id], queryFn: async () => { const { data, error } = await supabase.from("post_likes").select("user_id").eq("post_id", post.id); if (error) throw error; return data ?? []; } });
  const commentsQuery = useQuery({ queryKey: ["comments", post.id], queryFn: async () => { const { data, error } = await supabase.from("post_comments").select("id,author_name,content,created_at").eq("post_id", post.id).order("created_at"); if (error) throw error; return data ?? []; } });
  const liked = Boolean(userId && likesQuery.data?.some((item) => item.user_id === userId));
  const toggleLike = useMutation({ mutationFn: async () => { if (!userId) throw new Error(t("hub.needAuthLike")); const result = liked ? await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", userId) : await supabase.from("post_likes").insert({ post_id: post.id, user_id: userId }); if (result.error) throw result.error; }, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["likes", post.id] }), onError: (error: Error) => toast.error(error.message) });
  const addComment = useMutation({ mutationFn: async () => { if (!userId) throw new Error(t("hub.needAuthComment")); const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(); const { error } = await supabase.from("post_comments").insert({ post_id: post.id, user_id: userId, author_name: profile?.full_name || "YESOD", content: comment }); if (error) throw error; }, onSuccess: () => { setComment(""); queryClient.invalidateQueries({ queryKey: ["comments", post.id] }); }, onError: (error: Error) => toast.error(error.message) });
  const date = new Date(post.created_at).toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" });
  return (
    <article className="overflow-hidden border border-border bg-card">
      <HubMedia post={post} />
      <div className="p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d75a12]">{t(categoryKey(post.category))}</span>{isAdmin && !post.published && <span className="text-xs font-semibold text-amber-700">Rascunho</span>}</div>
        <h2 className="mt-3 text-xl leading-snug">{tm(post.title_i18n) || post.title}</h2><p className="mt-2 text-xs text-muted-foreground">{post.author_name} · {date}</p>
        <div className="rich-text mt-5 text-sm leading-7 text-foreground/85" dangerouslySetInnerHTML={{ __html: sanitizeRichText(tm(post.content_i18n) || post.content) }} />
        {post.source_url && <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#e86f22]/45 px-4 py-2 text-sm font-semibold text-[#d75a12] transition-colors hover:bg-[#fff1e7]">Ler a referência completa — {post.source_label}<ExternalLink className="h-4 w-4" /></a>}
        <div className="mt-6 flex items-center gap-5 border-t border-border pt-4"><button type="button" onClick={() => toggleLike.mutate()} disabled={!userId || toggleLike.isPending} className={`flex items-center gap-2 text-sm font-medium ${liked ? "text-[#d75a12]" : "text-muted-foreground hover:text-foreground"} disabled:opacity-50`}><Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />{likesQuery.data?.length ?? 0}</button><button type="button" onClick={() => setShowComments((value) => !value)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><MessageSquare className="h-4 w-4" />{commentsQuery.data?.length ?? 0}</button></div>
        {showComments && <div className="mt-5 space-y-3 border-t border-border pt-5">{commentsQuery.data?.map((item) => <div key={item.id} className="bg-muted/70 p-3.5"><p className="text-xs font-semibold">{item.author_name}</p><p className="mt-1 text-sm leading-6">{item.content}</p></div>)}{commentsQuery.data?.length === 0 && <p className="text-sm text-muted-foreground">{t("hub.noComments")}</p>}{userId ? <div className="flex gap-2"><Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("hub.commentPlaceholder")} /><Button size="icon" onClick={() => addComment.mutate()} disabled={!comment.trim() || addComment.isPending} aria-label={t("hub.sendComment")}><Send className="h-4 w-4" /></Button></div> : <p className="text-sm text-muted-foreground"><Link to="/auth" className="font-semibold text-[#d75a12] hover:underline">{t("hub.signIn")}</Link> {t("hub.signInToComment")}</p>}</div>}
      </div>
    </article>
  );
}
