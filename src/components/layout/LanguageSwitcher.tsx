import { LANG_LABELS, LANG_NAMES, LANGUAGES, useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div className={compact ? "flex items-center gap-1" : "space-y-2"}>
      {!compact && (
        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          {t("nav.language")}
        </p>
      )}
      <div
        role="group"
        aria-label={t("nav.language")}
        className="grid grid-cols-3 rounded-xl border border-white/15 bg-white/5 p-1"
      >
        {LANGUAGES.map((code) => (
          <button
            key={code}
            type="button"
            title={LANG_NAMES[code]}
            aria-pressed={lang === code}
            onClick={() => setLang(code)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
              lang === code
                ? "bg-white text-navy-deep shadow-sm"
                : "text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            {LANG_LABELS[code]}
          </button>
        ))}
      </div>
    </div>
  );
}
