import { useEffect } from 'react'
import { useI18n } from '../i18n'
import { LanguageSwitcher } from './LanguageSwitcher'

type LegalKind = 'privacy' | 'cookies'

export function LegalPage({ kind }: { kind: LegalKind }) {
  const { t } = useI18n()
  const privacy = kind === 'privacy'
  const document = privacy ? t.legal.privacy : t.legal.cookiePolicy

  useEffect(() => {
    window.document.title = `${document.title} — IMERULI`
  }, [document.title])

  return (
    <>
      <header className="legal-header">
        <a className="brand" href="/" aria-label={t.legal.backAria}><span className="brand-mark">ი</span><span>IMERULI</span></a>
        <div className="legal-header-actions">
          <LanguageSwitcher />
          <a className="legal-back" href="/">{t.legal.back}</a>
        </div>
      </header>
      <main className="legal-page">
        <article>
          <p className="eyebrow">{t.legal.eyebrow}</p>
          <h1>{document.title}</h1>
          <aside className="legal-draft-note" role="note"><strong>{t.legal.draftTitle}</strong> {t.legal.draftText}</aside>
          <p className="legal-lead">{t.legal.lead}</p>
          <div className="legal-sections">
            {document.sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.content}</p></section>)}
          </div>
          <nav className="legal-related" aria-label={t.legal.related}>
            <a href={privacy ? '/cookies.html' : '/privacy.html'}>{privacy ? t.legal.readCookies : t.legal.readPrivacy}</a>
            <a href="/">{t.legal.backToImeruli}</a>
          </nav>
        </article>
      </main>
    </>
  )
}
