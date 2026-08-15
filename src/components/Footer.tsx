import { useState, type FormEvent } from 'react'
import { interpolate, useI18n } from '../i18n'
import { ArrowIcon } from './Icons'

export function Footer() {
  const { t } = useI18n()
  const [status, setStatus] = useState<'idle' | 'handoff' | 'error'>('idle')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) {
      setStatus('error')
      form.reportValidity()
      return
    }
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    const subject = encodeURIComponent(t.footer.mailSubject)
    const body = encodeURIComponent(interpolate(t.footer.mailBody, { email }))
    const mailLink = document.createElement('a')
    mailLink.href = `mailto:kontakt@imeruli.pl?subject=${subject}&body=${body}`
    mailLink.click()
    setStatus('handoff')
  }

  return (
    <footer id="contact" className="site-footer section-anchor">
      <div className="footer-top">
        <div className="footer-title">
          <span className="georgian-label">გელოდებით</span>
          <h2>{t.footer.titleFirst}<br />{t.footer.titleSecond}</h2>
        </div>
        <div className="footer-details">
          <div><span>{t.footer.address}</span><address>Piotrkowska 22<br />90-001 Łódź</address></div>
          <div><span>{t.footer.contact}</span><a href="tel:+48000000000">+48 000 000 000</a><a href="mailto:kontakt@imeruli.pl">kontakt@imeruli.pl</a></div>
          <div><span>{t.footer.hours}</span><p>{t.footer.hoursText.split('\n').map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</p></div>
        </div>
      </div>
      <div className="contact-panel">
        <div><p className="eyebrow">{t.footer.talk}</p><h3>{t.footer.formTitleFirst}<br />{t.footer.formTitleSecond}</h3></div>
        {status === 'handoff' ? (
          <div className="form-success" role="status"><span>✓</span><strong>{t.footer.successTitle}</strong><p>{t.footer.successText}</p><button onClick={() => setStatus('idle')}>{t.footer.backToForm}</button></div>
        ) : (
          <form className="contact-form" onSubmit={submit} noValidate={false}>
            <label htmlFor="contact-email">{t.footer.emailLabel}</label>
            <div className="email-row"><input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required aria-describedby="email-note" /><button type="submit" aria-label={t.footer.emailAction}><ArrowIcon /></button></div>
            <label className="consent"><input type="checkbox" required /><span>{t.footer.consentBefore} <a href="/privacy.html">{t.footer.privacyPolicy}</a> {t.footer.consentAfter}</span></label>
            <p id="email-note" className={status === 'error' ? 'is-error' : ''}>{status === 'error' ? t.footer.formError : t.footer.noNewsletter}</p>
          </form>
        )}
      </div>
      <div className="footer-bottom">
        <a className="footer-brand" href="#top"><span>ი</span>IMERULI</a>
        <nav aria-label={t.footer.legalLinks}><a href="/privacy.html">{t.footer.privacy}</a><a href="/cookies.html">{t.footer.cookies}</a><button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}>{t.footer.cookieStatus}</button></nav>
        <span>© {new Date().getFullYear()} IMERULI</span>
      </div>
    </footer>
  )
}
