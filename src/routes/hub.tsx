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
import { LOCALES, useI18n, useLocalizedMeta, type TranslationKey } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/yesod";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "Yesod HUB — feed de automação e IA" },
      {
        name: "description",
        content:
          "Publicações da equipe YESOD: novidades, automação, projetos e ofertas. Curta e comente com sua conta de membro.",
      },
      { property: "og:title", content: "Yesod HUB" },
      { property: "og:description", content: "Novidades, automação, projetos e ofertas da YESOD." },
    ],
    links: [{ rel: "canonical", href: "/hub" }],
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

function categoryKey(category: string): TranslationKey {
  return `hub.cat.${category}` as TranslationKey;
}

function FeedPage() {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin(user);
  const { t, lang } = useI18n();
  const [category, setCategory] = useState<string>("Todas");
  useLocalizedMeta("meta.hub.title", "meta.hub.desc");

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
    <div className="mx-auto max-w-4xl px-5 py-14 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">YESOD</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">{t("hub.title")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("hub.subtitle")}</p>
      </header>

      {isAdmin && <AdminComposer />}

      <div className="mt-9 flex flex-wrap gap-2 border-b border-border pb-5">
        {["Todas", ...CATEGORIES].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              category === item
                ? "bg-navy text-white"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item === "Todas" ? t("hub.all") : t(categoryKey(item))}
          </button>
        ))}
      </div>

      {!user && !loading && (
        <div className="mt-6 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <span className="text-muted-foreground">{t("hub.signInBanner")} </span>
          <Link to="/auth" className="font-semibold text-primary hover:underline">
            {t("hub.signInLink")}
          </Link>
        </div>
      )}

      <div className="mt-7 space-y-5">
        {postsQuery.isLoading && <p className="text-sm text-muted-foreground">{t("hub.loadingPosts")}</p>}
        {postsQuery.isError && <p className="text-sm text-destructive">{t("hub.loadError")}</p>}
        {postsQuery.data?.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            {t("hub.empty")}
          </p>
        )}
        {postsQuery.data?.map((post) => (
          <PostCard key={post.id} post={post} userId={user?.id ?? null} locale={LOCALES[lang]} />
        ))}
      </div>
    </div>
  );
}

function AdminComposer() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error(t("auth.failed"));
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", auth.user.id)
        .maybeSingle();
      const { error } = await supabase.from("posts").insert({
        author_id: auth.user.id,
        author_name: profile?.full_name || "YESOD",
        title,
        content,
        category,
        image_url: imageUrl.trim() ? imageUrl.trim() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("hub.published"));
      setTitle("");
      setContent("");
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card className="mt-9 border-border shadow-none">
      <CardHeader className="border-b border-border">
        <h2 className="font-display text-base font-semibold">{t("hub.composerTitle")}</h2>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="post-title">{t("hub.postTitle")}</Label>
          <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{t("hub.postCategory")}</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>{t(categoryKey(item))}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-image">{t("hub.postImage")}</Label>
          <Input id="post-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="post-content">{t("hub.postContent")}</Label>
          <Textarea id="post-content" rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !title.trim() || !content.trim()}>
            {mutation.isPending ? t("hub.publishing") : t("hub.publish")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PostCard({ post, userId, locale }: { post: Post; userId: string | null; locale: string }) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
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

  const liked = Boolean(userId && likesQuery.data?.some((item) => item.user_id === userId));

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error(t("hub.needAuthLike"));
      if (liked) {
        const { error } = await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("post_likes").insert({ post_id: post.id, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["likes", post.id] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error(t("hub.needAuthComment"));
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle();
      const { error } = await supabase.from("post_comments").insert({
        post_id: post.id,
        user_id: userId,
        author_name: profile?.full_name || "YESOD",
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

  const date = new Date(post.created_at).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      {post.image_url && <img src={post.image_url} alt={post.title} className="max-h-[28rem] w-full object-cover" />}
      <div className="p-5 sm:p-7">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {t(categoryKey(post.category))}
        </span>
        <h2 className="mt-3 text-xl leading-snug">{post.title}</h2>
        <p className="mt-2 text-xs text-muted-foreground">{post.author_name} · {date}</p>
        <p className="mt-5 whitespace-pre-line text-sm leading-7 text-foreground/85">{post.content}</p>

        <div className="mt-6 flex items-center gap-5 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => toggleLike.mutate()}
            disabled={!userId || toggleLike.isPending}
            className={`flex items-center gap-2 text-sm font-medium ${liked ? "text-primary" : "text-muted-foreground hover:text-foreground"} disabled:opacity-50`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} aria-hidden="true" />
            {likesQuery.data?.length ?? 0}
          </button>
          <button
            type="button"
            onClick={() => setShowComments((value) => !value)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            {commentsQuery.data?.length ?? 0}
          </button>
        </div>

        {showComments && (
          <div className="mt-5 space-y-3 border-t border-border pt-5">
            {commentsQuery.data?.map((item) => (
              <div key={item.id} className="rounded-lg bg-muted/70 p-3.5">
                <p className="text-xs font-semibold">{item.author_name}</p>
                <p className="mt-1 text-sm leading-6 text-foreground/85">{item.content}</p>
              </div>
            ))}
            {commentsQuery.data?.length === 0 && <p className="text-sm text-muted-foreground">{t("hub.noComments")}</p>}
            {userId ? (
              <div className="flex gap-2 pt-1">
                <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("hub.commentPlaceholder")} />
                <Button
                  size="icon"
                  onClick={() => addComment.mutate()}
                  disabled={!comment.trim() || addComment.isPending}
                  aria-label={t("hub.sendComment")}
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                <Link to="/auth" className="font-semibold text-primary hover:underline">{t("hub.signIn")}</Link>{" "}
                {t("hub.signInToComment")}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
