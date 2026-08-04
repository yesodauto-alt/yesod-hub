import { LANG_LABELS, LANG_NAMES, LANGUAGES, useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div className={compact ? "flex items-center" : "space-y-2"}>
      {!compact && (
        <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("nav.language")}
        </p>
      )}
      <div
        role="group"
        aria-label={t("nav.language")}
        className="inline-grid grid-cols-3 rounded-lg border border-border bg-background p-0.5"
      >
        {LANGUAGES.map((code) => (
          <button
            key={code}
            type="button"
            title={LANG_NAMES[code]}
            aria-pressed={lang === code}
            onClick={() => setLang(code)}
            className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              lang === code
                ? "bg-navy text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {LANG_LABELS[code]}
          </button>
        ))}
      </div>
    </div>
  );
}
