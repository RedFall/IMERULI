import { languageOptions, useI18n, type Language } from '../i18n'

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage, t } = useI18n()

  return (
    <label className={`language-switcher ${className}`.trim()}>
      <span className="sr-only">{t.language.selectorLabel}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        aria-label={t.language.selectorLabel}
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.short} — {t.language[option.labelKey]}
          </option>
        ))}
      </select>
    </label>
  )
}
