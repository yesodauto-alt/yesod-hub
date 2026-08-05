import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const palette = [
  { color: "#111827", label: "Preto" },
  { color: "#0b0b0d", label: "Preto profundo" },
  { color: "#3a3a3f", label: "Grafite brilhante" },
  { color: "#d75a12", label: "Laranja YESOD" },
  { color: "#626268", label: "Cinza" },
];

const allowedTags = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "UL", "OL", "LI", "H2", "H3", "SPAN", "FONT"]);
const allowedColors = new Set(palette.map((item) => item.color.toLowerCase()));

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function sanitizeRichText(html: string) {
  if (typeof DOMParser === "undefined") return html;
  const document = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = document.body.firstElementChild;
  if (!root) return "";

  Array.from(root.querySelectorAll("*")).forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      if (attribute.name === "color") {
        const color = attribute.value.toLowerCase();
        if (!allowedColors.has(color)) element.removeAttribute(attribute.name);
        return;
      }

      if (attribute.name === "style") {
        const color = (element as HTMLElement).style.color.toLowerCase();
        element.removeAttribute("style");
        if (allowedColors.has(color)) (element as HTMLElement).style.color = color;
        return;
      }

      element.removeAttribute(attribute.name);
    });
  });

  return root.innerHTML;
}

function editorHtml(value: string) {
  if (!value) return "";
  if (/<\/?(?:p|br|strong|b|em|i|u|ul|ol|li|h2|h3|span|font)\b/i.test(value)) {
    return sanitizeRichText(value);
  }

  return value
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

type RichTextEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function RichTextEditor({ id, value, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    const next = editorHtml(value);
    if (editor.innerHTML !== next) editor.innerHTML = next;
  }, [value]);

  function updateValue() {
    const editor = editorRef.current;
    if (editor) onChange(sanitizeRichText(editor.innerHTML));
  }

  function command(name: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, commandValue);
    updateValue();
  }

  const toolClass =
    "flex h-9 min-w-9 items-center justify-center rounded-md border border-transparent px-2 text-sm text-slate-600 hover:border-border hover:bg-white hover:text-foreground";

  return (
    <div className={cn("overflow-hidden rounded-lg border border-input bg-white shadow-sm focus-within:ring-1 focus-within:ring-ring", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-slate-50 px-2 py-2">
        <button type="button" className={toolClass} onClick={() => command("bold")} title="Negrito" aria-label="Negrito">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={toolClass} onClick={() => command("italic")} title="Itálico" aria-label="Itálico">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={toolClass} onClick={() => command("underline")} title="Sublinhado" aria-label="Sublinhado">
          <Underline className="h-4 w-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
        <select
          className="h-9 rounded-md border border-border bg-white px-2 text-sm text-slate-700"
          defaultValue="p"
          aria-label="Estilo do texto"
          onChange={(event) => command("formatBlock", event.target.value)}
        >
          <option value="p">Parágrafo</option>
          <option value="h2">Título</option>
          <option value="h3">Subtítulo</option>
        </select>
        <button type="button" className={toolClass} onClick={() => command("insertUnorderedList")} title="Lista" aria-label="Lista">
          <List className="h-4 w-4" />
        </button>
        <button type="button" className={toolClass} onClick={() => command("insertOrderedList")} title="Lista numerada" aria-label="Lista numerada">
          <ListOrdered className="h-4 w-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
        <span className="px-1 text-xs font-medium text-slate-500">Cor</span>
        {palette.map((item) => (
          <button
            key={item.color}
            type="button"
            className="h-7 w-7 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.18)] transition-transform hover:scale-110"
            style={{ backgroundColor: item.color }}
            onClick={() => command("foreColor", item.color)}
            title={item.label}
            aria-label={`Cor ${item.label}`}
          />
        ))}
        <button type="button" className={toolClass} onClick={() => command("removeFormat")} title="Limpar formatação">
          Limpar
        </button>
      </div>
      <div
        ref={editorRef}
        id={id}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        className="rich-text min-h-52 px-4 py-3 text-base leading-7 text-foreground outline-none"
        onInput={updateValue}
        onBlur={updateValue}
      />
    </div>
  );
}
