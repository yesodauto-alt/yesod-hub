import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/yesod";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Feed da Comunidade YESOD — novidades e dicas de pré-impressão" },
      {
        name: "description",
        content:
          "Publicações da equipe YESOD: novidades, dicas de pré-impressão, projetos e ofertas. Curta e comente com sua conta de membro.",
      },
      { property: "og:title", content: "Feed da Comunidade YESOD" },
      {
        property: "og:description",
        content: "Novidades, dicas de pré-impressão, projetos e ofertas da YESOD Automation.",
      },
    ],
  }),
  component: FeedPage,
});

type Post = {
  id: string;
  title: string;
  author_name: string;
  category: string;
  content: string;
  image_url: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function FeedPage() {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin(user);
  const [category, setCategory] = useState<string>("Todas");

  const postsQuery = useQuery({
    queryKey: ["posts", category],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("id, title, author_name, category, content, image_url, created_at")
        .order("created_at", { ascending: false });
      if (category !== "Todas") query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Post[];
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">Feed da comunidade</h1>
        <p className="mt-2 text-muted-foreground">
          Novidades, dicas de pré-impressão, projetos e ofertas publicadas pela equipe YESOD.
        </p>
      </header>

      {isAdmin && <AdminComposer />}

      <div className="mt-8 flex flex-wrap gap-2">
        {["Todas", ...CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {!user && !loading && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm">
          <span className="text-muted-foreground">
            Entre na sua conta para curtir e comentar as publicações.{" "}
          </span>
          <Link to="/auth" className="font-semibold text-primary hover:underline">
            Entrar ou criar conta
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {postsQuery.isLoading && <p className="text-muted-foreground">Carregando publicações…</p>}
        {postsQuery.isError && (
          <p className="text-destructive">Não foi possível carregar as publicações.</p>
        )}
        {postsQuery.data?.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Ainda não há publicações nesta categoria.
          </p>
        )}
        {postsQuery.data?.map((post) => (
          <PostCard key={post.id} post={post} userId={user?.id ?? null} />
        ))}
      </div>
    </div>
  );
}

function AdminComposer() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada.");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", auth.user.id)
        .maybeSingle();
      const { error } = await supabase.from("posts").insert({
        author_id: auth.user.id,
        author_name: profile?.full_name || "Equipe YESOD",
        title,
        content,
        category,
        image_url: imageUrl.trim() ? imageUrl.trim() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Publicação criada!");
      setTitle("");
      setContent("");
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card className="mt-8 border-primary/30">
      <CardHeader>
        <h2 className="font-display text-lg font-semibold">Publicar (administrador)</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="post-title">Título</Label>
          <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-content">Conteúdo</Label>
          <Textarea
            id="post-content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-image">URL da imagem (opcional)</Label>
          <Input
            id="post-image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !title.trim() || !content.trim()}
        >
          {mutation.isPending ? "Publicando…" : "Publicar"}
        </Button>
      </CardContent>
    </Card>
  );
}

function PostCard({ post, userId }: { post: Post; userId: string | null }) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");

  const likesQuery = useQuery({
    queryKey: ["likes", post.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("post_likes").select("user_id").eq("post_id", post.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const commentsQuery = useQuery({
    queryKey: ["comments", post.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_comments")
        .select("id, author_name, content, created_at")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const liked = Boolean(userId && likesQuery.data?.some((l) => l.user_id === userId));

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Entre na sua conta para curtir.");
      if (liked) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: post.id, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["likes", post.id] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Entre na sua conta para comentar.");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();
      const { error } = await supabase.from("post_comments").insert({
        post_id: post.id,
        user_id: userId,
        author_name: profile?.full_name || "Membro",
        content: comment,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {post.image_url && (
        <img src={post.image_url} alt={post.title} className="h-56 w-full object-cover" />
      )}
      <div className="p-5 sm:p-6">
        <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          {post.category}
        </span>
        <h2 className="mt-3 text-xl font-semibold">{post.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {post.author_name} · {formatDate(post.created_at)}
        </p>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
          {post.content}
        </p>

        <div className="mt-5 flex items-center gap-4 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => toggleLike.mutate()}
            disabled={!userId || toggleLike.isPending}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              liked ? "text-primary" : "text-muted-foreground hover:text-foreground"
            } disabled:opacity-60`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {likesQuery.data?.length ?? 0}
          </button>
          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            {commentsQuery.data?.length ?? 0}
          </button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-4">
            {commentsQuery.data?.map((c) => (
              <div key={c.id} className="rounded-lg bg-surface p-3">
                <p className="text-xs font-semibold">{c.author_name}</p>
                <p className="mt-1 text-sm text-foreground/90">{c.content}</p>
              </div>
            ))}
            {commentsQuery.data?.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
            )}
            {userId ? (
              <div className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escreva um comentário…"
                />
                <Button
                  size="icon"
                  onClick={() => addComment.mutate()}
                  disabled={!comment.trim() || addComment.isPending}
                  aria-label="Enviar comentário"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                <Link to="/auth" className="font-semibold text-primary hover:underline">
                  Entre
                </Link>{" "}
                para comentar.
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
