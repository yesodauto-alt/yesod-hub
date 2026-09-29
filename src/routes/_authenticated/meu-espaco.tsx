import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Camera,
  FolderKanban,
  ImagePlus,
  LogOut,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, useLocalizedMeta, type Lang } from "@/lib/i18n";
import {
  PROJECT_COLUMNS,
  SLUG_PATTERN,
  emptyMultilingual,
  slugify,
  toMultilingualForm,
  type InteractionType,
  type ProjectRow,
} from "@/lib/projects";
import {
  AVATAR_BUCKET,
  PROJECT_BUCKET,
  safeFileName,
  useMediaUrl,
  validateImage,
} from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/meu-espaco")({
  head: () => ({ meta: [{ title: "Meu espaço — Yesod HUB" }] }),
  component: MeuEspaco,
});

type ProfileData = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  community_goal: string | null;
  account_type: string | null;
  employee_count: number | null;
  newsletter_opt_in: boolean;
  avatar_url: string | null;
  membership_status: "pending" | "active" | "suspended";
};

type MultiForm = Record<Lang, string>;
type ProjectForm = {
  id: string | null;
  slug: string;
  title: MultiForm;
  category: MultiForm;
  summary: MultiForm;
  context: MultiForm;
  automation: MultiForm;
  solution: MultiForm;
  result: MultiForm;
  content: MultiForm;
  interactionLabel: MultiForm;
  imageUrl: string | null;
  galleryUrls: string[];
  interactionType: InteractionType;
  interactionUrl: string;
  published: boolean;
  sortOrder: number;
};

const blankProject = (): ProjectForm => ({
  id: null,
  slug: "",
  title: emptyMultilingual(),
  category: emptyMultilingual(),
  summary: emptyMultilingual(),
  context: emptyMultilingual(),
  automation: emptyMultilingual(),
  solution: emptyMultilingual(),
  result: emptyMultilingual(),
  content: emptyMultilingual(),
  interactionLabel: emptyMultilingual(),
  imageUrl: null,
  galleryUrls: [],
  interactionType: "details",
  interactionUrl: "",
  published: false,
  sortOrder: 0,
});

function projectToForm(project: ProjectRow): ProjectForm {
  return {
    id: project.id,
    slug: project.slug,
    title: toMultilingualForm(project.title),
    category: toMultilingualForm(project.category),
    summary: toMultilingualForm(project.summary),
    context: toMultilingualForm(project.context),
    automation: toMultilingualForm(project.automation),
    solution: toMultilingualForm(project.solution),
    result: toMultilingualForm(project.result),
    content: toMultilingualForm(project.content),
    interactionLabel: toMultilingualForm(project.interaction_label),
    imageUrl: project.image_url,
    galleryUrls: project.gallery_urls ?? [],
    interactionType: project.interaction_type,
    interactionUrl: project.interaction_url ?? "",
    published: project.published,
    sortOrder: project.sort_order,
  };
}

const galleryAdminCopy = {
  pt: {
    remove: "Excluir foto",
    confirm: "Excluir esta foto da galeria? A imagem será removida permanentemente.",
    removed: "Foto excluída da galeria.",
    storageWarning: "A foto foi removida do projeto, mas não foi possível apagar o arquivo do armazenamento.",
  },
  en: {
    remove: "Delete photo",
    confirm: "Delete this photo from the gallery? The image will be permanently removed.",
    removed: "Photo deleted from the gallery.",
    storageWarning: "The photo was removed from the project, but the storage file could not be deleted.",
  },
  es: {
    remove: "Eliminar foto",
    confirm: "¿Eliminar esta foto de la galería? La imagen se borrará permanentemente.",
    removed: "Foto eliminada de la galería.",
    storageWarning: "La foto se eliminó del proyecto, pero no fue posible borrar el archivo del almacenamiento.",
  },
} as const;

function MeuEspaco() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user);
  const { t } = useI18n();
  useLocalizedMeta("meta.space.title", "meta.space.desc");

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState("");
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [employeeCount, setEmployeeCount] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarUrl = useMediaUrl(AVATAR_BUCKET, avatarPath);

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sessão expirada.");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, company, phone, community_goal, account_type, employee_count, newsletter_opt_in, avatar_url, membership_status")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      return { email: auth.user.email ?? "", id: auth.user.id, ...(data ?? {}) } as ProfileData;
    },
  });

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setFullName(p.full_name ?? "");
    setCompany(p.company ?? "");
    setPhone(p.phone ?? "");
    setGoal(p.community_goal ?? "");
    setAccountType(p.account_type === "company" ? "company" : "individual");
    setEmployeeCount(p.employee_count ? String(p.employee_count) : "");
    setNewsletter(Boolean(p.newsletter_opt_in));
    setAvatarPath(p.avatar_url ?? null);
  }, [profileQuery.data]);

  async function uploadAvatar(file: File) {
    if (!profileQuery.data) return;
    const valid = validateImage(file);
    if (!valid.ok) {
      toast.error(valid.reason === "size" ? t("space.photoTooLarge") : t("space.photoInvalidType"));
      return;
    }
    setUploadingAvatar(true);
    try {
      const path = `${profileQuery.data.id}/${safeFileName(file.name)}`;
      const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      if (avatarPath) await supabase.storage.from(AVATAR_BUCKET).remove([avatarPath]);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("id", profileQuery.data.id);
      if (updateError) throw updateError;
      setAvatarPath(path);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(t("space.saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function removeAvatar() {
    if (!profileQuery.data || !avatarPath) return;
    setUploadingAvatar(true);
    try {
      await supabase.storage.from(AVATAR_BUCKET).remove([avatarPath]);
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", profileQuery.data.id);
      if (error) throw error;
      setAvatarPath(null);
      toast.success(t("space.saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function saveProfile() {
    if (!profileQuery.data) return;
    const digits = phone.replace(/\D/g, "");
    if (phone && digits.length < 10) { toast.error(t("space.phoneInvalid")); return; }
    if (accountType === "company" && (!company.trim() || Number(employeeCount) < 1)) {
      { toast.error(t("space.employeesInvalid")); return; }
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: profileQuery.data.id,
      full_name: fullName.trim(),
      company: accountType === "company" ? company.trim() : null,
      phone: phone.trim() || null,
      community_goal: goal.trim() || null,
      account_type: accountType,
      employee_count: accountType === "company" ? Number(employeeCount) : null,
      newsletter_opt_in: newsletter,
      avatar_url: avatarPath,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("space.saved"));
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="yesod-page-icons mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">{t("space.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profileQuery.data?.email ?? t("common.loading")}
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="shrink-0">
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("space.signOut")}
        </Button>
      </header>

      {!isAdmin && profileQuery.data?.membership_status !== "active" && (
        <Card className="mt-6 border-primary/30">
          <CardContent className="p-5">
            <h2 className="font-semibold">
              {profileQuery.data?.membership_status === "suspended" ? "Acesso temporariamente suspenso" : "Aguardando aprovação"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {profileQuery.data?.membership_status === "suspended"
                ? "Seu perfil continua disponível, mas o acesso à biblioteca de membros está suspenso. Fale com a equipe YESOD se precisar de ajuda."
                : "Seu cadastro foi recebido. Você poderá acessar a biblioteca de membros assim que a equipe YESOD aprovar seu acesso."}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">{t("space.profileTitle")}</h2>
        </CardHeader>
        <CardContent className="space-y-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="yesod-tech-icon yesod-tech-icon-avatar flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName || t("space.photo")} className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-medium">{t("space.photo")}</p>
                <p className="text-sm text-muted-foreground">{t("space.photoHint")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" disabled={uploadingAvatar}>
                  <label className="cursor-pointer">
                    <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" />
                    {avatarPath ? t("space.changePhoto") : t("space.uploadPhoto")}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadAvatar(file);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </Button>
                {avatarPath && (
                  <Button variant="ghost" onClick={removeAvatar} disabled={uploadingAvatar}>
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                    {t("space.removePhoto")}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("space.name")} id="full-name">
              <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </Field>
            <Field label={t("space.phone")} id="phone">
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("space.phonePlaceholder")} />
            </Field>
            <Field label={t("space.accountType")} id="account-type">
              <Select value={accountType} onValueChange={(value) => setAccountType(value as "individual" | "company")}>
                <SelectTrigger id="account-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">{t("space.individual")}</SelectItem>
                  <SelectItem value="company">{t("space.companyType")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {accountType === "company" && (
              <>
                <Field label={t("space.companyName")} id="company-name">
                  <Input id="company-name" value={company} onChange={(e) => setCompany(e.target.value)} required />
                </Field>
                <Field label={t("space.employees")} id="employee-count">
                  <Input id="employee-count" type="number" min={1} value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} required />
                </Field>
              </>
            )}
          </div>

          <Field label={t("space.goal")} id="community-goal">
            <Textarea id="community-goal" rows={4} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder={t("space.goalPlaceholder")} />
          </Field>

          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={newsletter} onCheckedChange={(checked) => setNewsletter(checked === true)} />
            <span>{t("space.newsletter")}</span>
          </label>

          <Button onClick={saveProfile} disabled={saving || uploadingAvatar}>
            <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function ProjectAdmin() {
  const queryClient = useQueryClient();
  const { t, lang } = useI18n();
  const galleryLabels = galleryAdminCopy[lang];
  const [form, setForm] = useState<ProjectForm>(blankProject);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingGalleryPath, setDeletingGalleryPath] = useState<string | null>(null);
  const coverUrl = useMediaUrl(PROJECT_BUCKET, form.imageUrl);

  const projectsQuery = useQuery({
    queryKey: ["projects", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select(PROJECT_COLUMNS).order("sort_order");
      if (error) throw error;
      return (data ?? []) as unknown as ProjectRow[];
    },
  });

  const projects = projectsQuery.data ?? [];
  const updateMulti = (field: keyof Pick<ProjectForm, "title" | "category" | "summary" | "context" | "automation" | "solution" | "result" | "content" | "interactionLabel">, lang: Lang, value: string) => {
    setForm((current) => ({ ...current, [field]: { ...current[field], [lang]: value } }));
  };

  async function uploadProjectImage(file: File, gallery = false) {
    const valid = validateImage(file);
    if (!valid.ok) { toast.error(valid.reason === "size" ? t("space.photoTooLarge") : t("space.photoInvalidType")); return; }
    setUploading(true);
    try {
      const folder = form.id ?? "drafts";
      const path = `${folder}/${safeFileName(file.name)}`;
      const { error } = await supabase.storage.from(PROJECT_BUCKET).upload(path, file);
      if (error) throw error;
      setForm((current) => gallery
        ? { ...current, galleryUrls: [...current.galleryUrls, path] }
        : { ...current, imageUrl: path });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setUploading(false);
    }
  }

  async function removeGalleryImage(path: string) {
    if (!window.confirm(galleryLabels.confirm)) return;

    const nextGalleryUrls = form.galleryUrls.filter((item) => item !== path);
    setDeletingGalleryPath(path);
    try {
      if (form.id) {
        const { error: updateError } = await supabase
          .from("projects")
          .update({ gallery_urls: nextGalleryUrls })
          .eq("id", form.id);
        if (updateError) throw updateError;
      }

      setForm((current) => ({
        ...current,
        galleryUrls: current.galleryUrls.filter((item) => item !== path),
      }));

      const { error: storageError } = await supabase.storage.from(PROJECT_BUCKET).remove([path]);
      if (storageError) {
        toast.error(galleryLabels.storageWarning);
      } else {
        toast.success(galleryLabels.removed);
      }

      if (form.id) {
        await queryClient.invalidateQueries({ queryKey: ["projects"] });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setDeletingGalleryPath(null);
    }
  }

  async function saveProject() {
    const nextSlug = form.slug || slugify(form.title.pt);
    if (!SLUG_PATTERN.test(nextSlug)) { toast.error(t("admin.projects.slugRequired")); return; }
    if (!form.title.pt.trim()) { toast.error(t("common.required")); return; }
    setSaving(true);
    const payload = {
      slug: nextSlug,
      title: form.title,
      category: form.category,
      summary: form.summary,
      context: form.context,
      automation: form.automation,
      solution: form.solution,
      result: form.result,
      content: form.content,
      image_url: form.imageUrl,
      gallery_urls: form.galleryUrls,
      interaction_type: form.interactionType,
      interaction_label: form.interactionLabel,
      interaction_url: form.interactionUrl.trim() || null,
      published: form.published,
      sort_order: form.sortOrder,
    };
    const response = form.id
      ? await supabase.from("projects").update(payload).eq("id", form.id)
      : await supabase.from("projects").insert(payload);
    setSaving(false);
    if (response.error) { toast.error(response.error.message); return; }
    toast.success(t("admin.projects.saved"));
    setForm(blankProject());
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  async function deleteProject(project: ProjectRow) {
    if (!window.confirm(t("admin.projects.confirmDelete"))) return;
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    if (error) { toast.error(error.message); return; }
    const paths = [project.image_url, ...(project.gallery_urls ?? [])].filter((p): p is string => Boolean(p));
    if (paths.length) await supabase.storage.from(PROJECT_BUCKET).remove(paths);
    if (form.id === project.id) setForm(blankProject());
    toast.success(t("admin.projects.deleted"));
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  async function move(project: ProjectRow, direction: -1 | 1) {
    const index = projects.findIndex((p) => p.id === project.id);
    const target = projects[index + direction];
    if (!target) return;
    await Promise.all([
      supabase.from("projects").update({ sort_order: target.sort_order }).eq("id", project.id),
      supabase.from("projects").update({ sort_order: project.sort_order }).eq("id", target.id),
    ]);
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  return (
    <section className="mt-12 rounded-3xl border border-primary/20 bg-card p-5 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">{t("space.adminTitle")}</p>
          <h2 className="mt-1 text-2xl font-bold">{t("admin.projects.title")}</h2>
        </div>
        <Button onClick={() => setForm(blankProject())}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("admin.projects.new")}
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-3">
          {projectsQuery.isLoading && <p className="text-sm text-muted-foreground">{t("common.loading")}</p>}
          {projects.map((project, index) => (
            <div key={project.id} className={`rounded-xl border p-3 ${form.id === project.id ? "border-primary bg-accent/50" : "border-border"}`}>
              <button type="button" onClick={() => setForm(projectToForm(project))} className="w-full text-left">
                <p className="font-medium">{project.title.pt || project.slug}</p>
                <p className="mt-1 text-xs text-muted-foreground">{project.published ? t("common.published") : t("common.draft")}</p>
              </button>
              <div className="mt-3 flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(project, -1)} disabled={index === 0} aria-label={t("admin.projects.moveUp")}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => move(project, 1)} disabled={index === projects.length - 1} aria-label={t("admin.projects.moveDown")}><ArrowDown className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => deleteProject(project)} aria-label={t("common.delete")}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {!projectsQuery.isLoading && projects.length === 0 && <p className="text-sm text-muted-foreground">{t("admin.projects.empty")}</p>}
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("admin.projects.slug")} id="project-slug">
              <Input id="project-slug" value={form.slug} onChange={(e) => setForm((c) => ({ ...c, slug: slugify(e.target.value) }))} placeholder="meu-projeto" />
            </Field>
            <Field label={t("admin.projects.sortOrder")} id="project-order">
              <Input id="project-order" type="number" value={form.sortOrder} onChange={(e) => setForm((c) => ({ ...c, sortOrder: Number(e.target.value) }))} />
            </Field>
          </div>

          <Tabs defaultValue="pt">
            <TabsList><TabsTrigger value="pt">PT</TabsTrigger><TabsTrigger value="en">EN</TabsTrigger><TabsTrigger value="es">ES</TabsTrigger></TabsList>
            {(["pt", "en", "es"] as Lang[]).map((lang) => (
              <TabsContent key={lang} value={lang} className="mt-5 space-y-4">
                <MultiField label={t("admin.projects.projectTitle")} value={form.title[lang]} onChange={(v) => updateMulti("title", lang, v)} />
                <MultiField label={t("admin.projects.category")} value={form.category[lang]} onChange={(v) => updateMulti("category", lang, v)} />
                <MultiField label={t("admin.projects.summary")} value={form.summary[lang]} onChange={(v) => updateMulti("summary", lang, v)} area />
                <MultiField label={t("admin.projects.context")} value={form.context[lang]} onChange={(v) => updateMulti("context", lang, v)} area />
                <MultiField label={t("admin.projects.automation")} value={form.automation[lang]} onChange={(v) => updateMulti("automation", lang, v)} area />
                <MultiField label={t("admin.projects.solution")} value={form.solution[lang]} onChange={(v) => updateMulti("solution", lang, v)} area />
                <MultiField label={t("admin.projects.result")} value={form.result[lang]} onChange={(v) => updateMulti("result", lang, v)} area />
                <MultiField label={t("admin.projects.content")} value={form.content[lang]} onChange={(v) => updateMulti("content", lang, v)} area />
                <MultiField label={t("admin.projects.interactionLabel")} value={form.interactionLabel[lang]} onChange={(v) => updateMulti("interactionLabel", lang, v)} />
              </TabsContent>
            ))}
          </Tabs>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("admin.projects.interaction")} id="interaction-type">
              <Select value={form.interactionType} onValueChange={(v) => setForm((c) => ({ ...c, interactionType: v as InteractionType }))}>
                <SelectTrigger id="interaction-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="details">{t("admin.projects.interactionDetails")}</SelectItem>
                  <SelectItem value="external_demo">{t("admin.projects.interactionDemo")}</SelectItem>
                  <SelectItem value="whatsapp">{t("admin.projects.interactionWhatsapp")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {form.interactionType === "external_demo" && (
              <Field label={t("admin.projects.interactionUrl")} id="interaction-url">
                <Input id="interaction-url" type="url" value={form.interactionUrl} onChange={(e) => setForm((c) => ({ ...c, interactionUrl: e.target.value }))} />
              </Field>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3">
              <Label>{t("admin.projects.cover")}</Label>
              {coverUrl && <img src={coverUrl} alt="" className="aspect-video w-full rounded-xl object-cover" />}
              <Button asChild variant="outline" disabled={uploading}>
                <label className="cursor-pointer"><ImagePlus className="mr-2 h-4 w-4" />{t("admin.projects.cover")}<input className="sr-only" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadProjectImage(f); e.currentTarget.value = ""; }} /></label>
              </Button>
            </div>
            <div className="space-y-3">
              <Label>{t("admin.projects.galleryUpload")}</Label>
              <p className="text-sm text-muted-foreground">{form.galleryUrls.length} arquivo(s)</p>
              {form.galleryUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {form.galleryUrls.map((path, index) => (
                    <GalleryAdminImage
                      key={path}
                      path={path}
                      index={index}
                      removeLabel={galleryLabels.remove}
                      deleting={deletingGalleryPath === path}
                      onRemove={() => void removeGalleryImage(path)}
                    />
                  ))}
                </div>
              )}
              <Button asChild variant="outline" disabled={uploading || Boolean(deletingGalleryPath)}>
                <label className="cursor-pointer"><FolderKanban className="mr-2 h-4 w-4" />{t("admin.projects.galleryUpload")}<input className="sr-only" type="file" accept="image/*" multiple onChange={(e) => { Array.from(e.target.files ?? []).forEach((f) => void uploadProjectImage(f, true)); e.currentTarget.value = ""; }} /></label>
              </Button>
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium">
            <Checkbox checked={form.published} onCheckedChange={(checked) => setForm((c) => ({ ...c, published: checked === true }))} />
            {t("admin.projects.publishedField")}
          </label>

          <div className="flex flex-wrap gap-3">
            <Button onClick={saveProject} disabled={saving || uploading || Boolean(deletingGalleryPath)}><Save className="mr-2 h-4 w-4" />{saving ? t("common.saving") : t("common.save")}</Button>
            {form.id && <Button variant="outline" onClick={() => window.open(`/projetos/${form.slug}`, "_blank")}>{t("common.preview")}</Button>}
          </div>
        </div>
      </div>
    </section>
  );
}

function GalleryAdminImage({
  path,
  index,
  removeLabel,
  deleting,
  onRemove,
}: {
  path: string;
  index: number;
  removeLabel: string;
  deleting: boolean;
  onRemove: () => void;
}) {
  const url = useMediaUrl(PROJECT_BUCKET, path);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-muted">
      {url ? (
        <img src={url} alt={`Galeria ${index + 1}`} className="aspect-video h-full w-full object-cover" />
      ) : (
        <div className="flex aspect-video items-center justify-center text-muted-foreground">
          <FolderKanban className="h-6 w-6" aria-hidden="true" />
        </div>
      )}
      <Button
        type="button"
        size="icon"
        variant="destructive"
        className="absolute right-2 top-2 h-8 w-8 shadow-md"
        onClick={onRemove}
        disabled={deleting}
        aria-label={`${removeLabel} ${index + 1}`}
        title={removeLabel}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

function MultiField({ label, value, onChange, area = false }: { label: string; value: string; onChange: (value: string) => void; area?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {area ? <Textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} /> : <Input value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}
