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
};

type VisualOverrides = Record<string, Record<string, VisualStyle>>;

const EDITABLE_TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "SPAN", "A", "BUTTON", "LI", "LABEL"]);

function selectorFor(element: HTMLElement, root: HTMLElement) {
  const parts: string[] = [];
  let current: HTMLElement | null = element;
  while (current && current !== root) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) break;
    const siblings = Array.from(parent.children).filter((child) => child.tagName === current!.tagName);
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${current.tagName.toLowerCase()}:nth-of-type(${index})`);
    current = parent;
  }
  return parts.join(" > ");
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

function applyPageOverrides(root: HTMLElement, overrides: Record<string, VisualStyle> | undefined) {
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
      frame = requestAnimationFrame(() => applyPageOverrides(root, overrides[pageKey]));
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true });
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
      const selector = selectorFor(element, root);
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
  }, [draft, selected]);

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      const next: VisualOverrides = {
        ...overrides,
        [pageKey]: {
          ...(overrides[pageKey] ?? {}),
          [selected.selector]: draft,
        },
      };
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "visual_editor", value: next as unknown as Json }, { onConflict: "key" });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["site-settings", "visual-editor"] });
      toast.success("Alteração visual salva.");
      setSelected(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!selected) return;
    const page = { ...(overrides[pageKey] ?? {}) };
    delete page[selected.selector];
    const next = { ...overrides, [pageKey]: page };
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
