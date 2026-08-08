import { Bold, CaseUpper, Edit3, Eye, Italic, RotateCcw, Save, Underline, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useI18n } from "@/lib/i18n";

type VisualStyle = {
  text?: string;
  color?: string;
  fontWeight?: "400" | "500" | "600" | "700";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  textTransform?: "none" | "uppercase";
  fontSize?: string;
  letterSpacing?: string;
  lineHeight?: string;
  marginTop?: string;
};

type VisualOverrides = Record<string, Record<string, VisualStyle>>;

const EDITABLE_TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN", "A", "BUTTON", "LI", "LABEL"]);

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function stableSelectorFor(element: HTMLElement, pageKey: string) {
  const explicitId = element.dataset.editId;
  if (explicitId) return `[data-edit-id="${CSS.escape(explicitId)}"]`;

  const existingKey = element.dataset.visualKey;
  if (existingKey) return `[data-visual-key="${CSS.escape(existingKey)}"]`;

  const text = element.textContent?.replace(/\s+/g, " ").trim() ?? "";
  const section = element.closest<HTMLElement>("[data-edit-section], section[id], [id]");
  const sectionKey = section?.dataset.editSection ?? section?.id ?? "page";
  const stableClasses = Array.from(element.classList)
    .filter((name) => !name.startsWith("hover:") && !name.startsWith("group-"))
    .sort()
    .join(".");
  const key = hashText(`${pageKey}|${sectionKey}|${element.tagName}|${stableClasses}|${text}`);
  element.dataset.visualKey = key;
  return `[data-visual-key="${key}"]`;
}

function prepareStableSelectors(root: HTMLElement, pageKey: string) {
  root.querySelectorAll<HTMLElement>(Array.from(EDITABLE_TAGS).map((tag) => tag.toLowerCase()).join(","))
    .forEach((element) => {
      if (
        element.closest("[data-visual-editor-ui]") ||
        element.closest(".rich-text") ||
        !element.textContent?.trim()
      ) return;
      stableSelectorFor(element, pageKey);
    });
}

function findEditable(target: EventTarget | null, root: HTMLElement) {
  let element = target instanceof HTMLElement ? target : null;
  while (element && element !== root) {
    if (
      EDITABLE_TAGS.has(element.tagName) &&
      !element.closest("[data-visual-editor-ui]") &&
      !element.closest(".rich-text") &&
      element.textContent?.trim() &&
      Array.from(element.children).every((child) => child.tagName === "BR")
    ) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

function applyPageOverrides(root: HTMLElement, pageKey: string, overrides: Record<string, VisualStyle> | undefined) {
  prepareStableSelectors(root, pageKey);
  if (!overrides) return;
  Object.entries(overrides).forEach(([selector, value]) => {
    const element = root.querySelector<HTMLElement>(selector);
    if (!element) return;
    if (value.text !== undefined && element.textContent !== value.text) element.textContent = value.text;
    if (value.color && element.style.color !== value.color) element.style.color = value.color;
    if (value.fontWeight && element.style.fontWeight !== value.fontWeight) element.style.fontWeight = value.fontWeight;
    if (value.fontStyle && element.style.fontStyle !== value.fontStyle) element.style.fontStyle = value.fontStyle;
    if (value.textDecoration && element.style.textDecoration !== value.textDecoration) element.style.textDecoration = value.textDecoration;
    if (value.textTransform && element.style.textTransform !== value.textTransform) element.style.textTransform = value.textTransform;
    if (value.fontSize && element.style.fontSize !== value.fontSize) element.style.fontSize = value.fontSize;
    if (value.letterSpacing && element.style.letterSpacing !== value.letterSpacing) element.style.letterSpacing = value.letterSpacing;
    if (value.lineHeight && element.style.lineHeight !== value.lineHeight) element.style.lineHeight = value.lineHeight;
    if (value.marginTop && element.style.marginTop !== value.marginTop) element.style.marginTop = value.marginTop;
  });
}

export function GlobalVisualEditor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user);
  const { lang } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const pageKey = `${pathname}::${lang}`;
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<{ element: HTMLElement; selector: string } | null>(null);
  const [draft, setDraft] = useState<VisualStyle>({});
  const [saving, setSaving] = useState(false);

  const query = useQuery({
    queryKey: ["site-settings", "visual-editor"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "visual_editor").maybeSingle();
      if (error) throw error;
      return data?.value ? (data.value as unknown as VisualOverrides) : {};
    },
  });

  const overrides = useMemo(() => query.data ?? {}, [query.data]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-editable-site]");
    if (!root) return;
    let frame = 0;
    const apply = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => applyPageOverrides(root, pageKey, overrides[pageKey]));
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, characterData: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [overrides, pageKey]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-editable-site]");
    if (!root || !editing) return;
    root.classList.add("visual-edit-mode");

    const handleClick = (event: MouseEvent) => {
      const element = findEditable(event.target, root);
      if (!element) return;
      event.preventDefault();
      event.stopPropagation();
      const selector = stableSelectorFor(element, pageKey);
      const current = overrides[pageKey]?.[selector];
      const computed = window.getComputedStyle(element);
      setSelected({ element, selector });
      setDraft({
        text: current?.text ?? element.textContent?.trim() ?? "",
        color: current?.color ?? computed.color,
        fontWeight: current?.fontWeight ?? (Number(computed.fontWeight) >= 700 ? "700" : Number(computed.fontWeight) >= 600 ? "600" : Number(computed.fontWeight) >= 500 ? "500" : "400"),
        fontStyle: current?.fontStyle ?? (computed.fontStyle === "italic" ? "italic" : "normal"),
        textDecoration: current?.textDecoration ?? (computed.textDecorationLine.includes("underline") ? "underline" : "none"),
        textTransform: current?.textTransform ?? (computed.textTransform === "uppercase" ? "uppercase" : "none"),
        fontSize: current?.fontSize ?? computed.fontSize,
        letterSpacing: current?.letterSpacing ?? computed.letterSpacing,
        lineHeight: current?.lineHeight ?? computed.lineHeight,
        marginTop: current?.marginTop ?? computed.marginTop,
      });
    };

    root.addEventListener("click", handleClick, true);
    return () => {
      root.classList.remove("visual-edit-mode");
      root.removeEventListener("click", handleClick, true);
    };
  }, [editing, overrides, pageKey]);

  useEffect(() => {
    if (!selected) return;
    const value = draft;
    if (value.text !== undefined) selected.element.textContent = value.text;
    if (value.color) selected.element.style.color = value.color;
    if (value.fontWeight) selected.element.style.fontWeight = value.fontWeight;
    if (value.fontStyle) selected.element.style.fontStyle = value.fontStyle;
    if (value.textDecoration) selected.element.style.textDecoration = value.textDecoration;
    if (value.textTransform) selected.element.style.textTransform = value.textTransform;
    if (value.fontSize) selected.element.style.fontSize = value.fontSize;
    if (value.letterSpacing) selected.element.style.letterSpacing = value.letterSpacing;
    if (value.lineHeight) selected.element.style.lineHeight = value.lineHeight;
    if (value.marginTop) selected.element.style.marginTop = value.marginTop;
  }, [draft, selected]);

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      const { data: latestRow, error: latestError } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "visual_editor")
        .maybeSingle();
      if (latestError) throw latestError;
      const latest = (latestRow?.value ?? {}) as unknown as VisualOverrides;
      const next: VisualOverrides = {
        ...latest,
        [pageKey]: {
          ...(latest[pageKey] ?? {}),
          [selected.selector]: draft,
        },
      };
      const { data: savedRow, error } = await supabase
        .from("site_settings")
        .upsert({ key: "visual_editor", value: next as unknown as Json }, { onConflict: "key" })
        .select("value, updated_at")
        .single();
      if (error) throw error;
      if (!savedRow?.value) throw new Error("O Supabase não confirmou a gravação.");
      queryClient.setQueryData(["site-settings", "visual-editor"], savedRow.value as unknown as VisualOverrides);
      const verification = await queryClient.fetchQuery({
        queryKey: ["site-settings", "visual-editor", "verify", Date.now()],
        queryFn: async () => {
          const { data, error: verifyError } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "visual_editor")
            .single();
          if (verifyError) throw verifyError;
          return data.value as unknown as VisualOverrides;
        },
        staleTime: 0,
      });
      const persisted = verification[pageKey]?.[selected.selector];
      if (!persisted || JSON.stringify(persisted) !== JSON.stringify(draft)) {
        throw new Error("A alteração não permaneceu no banco. Verifique as permissões de administrador.");
      }
      await queryClient.invalidateQueries({ queryKey: ["site-settings", "visual-editor"] });
      toast.success("Alteração salva e confirmada no Supabase.");
      setSelected(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!selected) return;
    const { data: latestRow, error: latestError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "visual_editor")
      .maybeSingle();
    if (latestError) {
      toast.error(latestError.message);
      return;
    }
    const latest = (latestRow?.value ?? {}) as unknown as VisualOverrides;
    const page = { ...(latest[pageKey] ?? {}) };
    delete page[selected.selector];
    const next = { ...latest, [pageKey]: page };
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "visual_editor", value: next as unknown as Json }, { onConflict: "key" });
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["site-settings", "visual-editor"] });
    toast.success("Formatação personalizada removida.");
    setSelected(null);
    window.location.reload();
  }

  if (!isAdmin || pathname === "/configuracoes-site") return null;

  return (
    <div data-visual-editor-ui className="fixed bottom-24 right-5 z-[90] flex flex-col items-end gap-3">
      {selected && (
        <div className="w-[min(92vw,390px)] rounded-xl border border-border bg-white p-5 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d75a12]">Editor visual</p>
              <p className="mt-1 text-xs text-muted-foreground">{pathname} · {lang.toUpperCase()}</p>
            </div>
            <button type="button" className="rounded-md p-2 hover:bg-muted" onClick={() => setSelected(null)} aria-label="Fechar editor">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <Label>Texto</Label>
            <Textarea rows={4} value={draft.text ?? ""} onChange={(event) => setDraft((current) => ({ ...current, text: event.target.value }))} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" className={`visual-tool ${draft.fontWeight === "700" ? "is-active" : ""}`} onClick={() => setDraft((current) => ({ ...current, fontWeight: current.fontWeight === "700" ? "400" : "700" }))} title="Negrito">
              <Bold className="h-4 w-4" />
            </button>
            <button type="button" className={`visual-tool ${draft.fontStyle === "italic" ? "is-active" : ""}`} onClick={() => setDraft((current) => ({ ...current, fontStyle: current.fontStyle === "italic" ? "normal" : "italic" }))} title="Itálico">
              <Italic className="h-4 w-4" />
            </button>
            <button type="button" className={`visual-tool ${draft.textDecoration === "underline" ? "is-active" : ""}`} onClick={() => setDraft((current) => ({ ...current, textDecoration: current.textDecoration === "underline" ? "none" : "underline" }))} title="Sublinhado">
              <Underline className="h-4 w-4" />
            </button>
            <button type="button" className={`visual-tool ${draft.textTransform === "uppercase" ? "is-active" : ""}`} onClick={() => setDraft((current) => ({ ...current, textTransform: current.textTransform === "uppercase" ? "none" : "uppercase" }))} title="Caixa alta">
              <CaseUpper className="h-4 w-4" />
            </button>
            <div className="ml-auto flex items-center gap-2">
              <Label htmlFor="visual-color" className="text-xs">Cor</Label>
              <Input id="visual-color" type="color" value={draft.color?.startsWith("#") ? draft.color : "#111827"} onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))} className="h-9 w-12 cursor-pointer p-1" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="visual-font-size" className="text-xs">Tamanho (px)</Label>
              <Input
                id="visual-font-size"
                type="number"
                min="8"
                max="160"
                step="1"
                value={Number.parseFloat(draft.fontSize ?? "16")}
                onChange={(event) => setDraft((current) => ({ ...current, fontSize: `${event.target.value}px` }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visual-line-height" className="text-xs">Entrelinhas</Label>
              <Input
                id="visual-line-height"
                type="number"
                min="0.7"
                max="3"
                step="0.05"
                value={Number.parseFloat(draft.lineHeight ?? "1.5")}
                onChange={(event) => setDraft((current) => ({ ...current, lineHeight: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visual-letter-spacing" className="text-xs">Espaço entre letras (px)</Label>
              <Input
                id="visual-letter-spacing"
                type="number"
                min="-5"
                max="30"
                step="0.25"
                value={Number.parseFloat(draft.letterSpacing ?? "0")}
                onChange={(event) => setDraft((current) => ({ ...current, letterSpacing: `${event.target.value}px` }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visual-margin-top" className="text-xs">Espaço acima (px)</Label>
              <Input
                id="visual-margin-top"
                type="number"
                min="-80"
                max="240"
                step="1"
                value={Number.parseFloat(draft.marginTop ?? "0")}
                onChange={(event) => setDraft((current) => ({ ...current, marginTop: `${event.target.value}px` }))}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={save} disabled={saving}>
              <Save className="mr-2 h-4 w-4" /> {saving ? "Salvando…" : "Salvar"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" /> Restaurar
            </Button>
          </div>
        </div>
      )}

      <Button
        type="button"
        size="lg"
        onClick={() => {
          setEditing((current) => !current);
          setSelected(null);
        }}
        className={editing ? "bg-slate-800 text-white hover:bg-slate-900" : "bg-[#e86f22] text-white hover:bg-[#cf5c16]"}
      >
        {editing ? <Eye className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
        {editing ? "Encerrar edição" : "Editar esta página"}
      </Button>
    </div>
  );
}
