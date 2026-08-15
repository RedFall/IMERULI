import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useI18n } from '../i18n'
import { CloseIcon } from './Icons'

export function CookieBanner() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const openSettings = () => setOpen(true)
    window.addEventListener('open-cookie-settings', openSettings)
    return () => window.removeEventListener('open-cookie-settings', openSettings)
  }, [])

  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    document.documentElement.classList.add('modal-open')
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0)
    return () => {
      window.clearTimeout(focusTimer)
      document.documentElement.classList.remove('modal-open')
      returnFocusRef.current?.focus({ preventScroll: true })
    }
  }, [open])

  const onDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (event.key !== 'Tab') return
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (!open) return null

  return (
    <div className="cookie-preferences-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <section ref={dialogRef} className="cookie-banner" role="dialog" aria-modal="true" aria-labelledby="cookie-title" onKeyDown={onDialogKeyDown}>
        <button ref={closeRef} className="cookie-close" onClick={() => setOpen(false)} aria-label={t.cookies.close}><CloseIcon /></button>
        <span className="eyebrow">{t.cookies.eyebrow}</span>
        <h2 id="cookie-title">{t.cookies.title}</h2>
        <p>{t.cookies.description}</p>
        <dl className="cookie-status-list">
          <div><dt>{t.cookies.necessary}</dt><dd>{t.cookies.necessaryStatus}</dd></div>
          <div><dt>{t.cookies.analytics}</dt><dd>{t.cookies.disabled}</dd></div>
          <div><dt>{t.cookies.marketing}</dt><dd>{t.cookies.disabled}</dd></div>
          <div><dt>{t.cookies.googleContent}</dt><dd>{t.cookies.notEmbedded}</dd></div>
        </dl>
        <div className="cookie-actions">
          <a className="button button-outline" href="/cookies.html">{t.cookies.policy}</a>
          <button className="button button-primary" onClick={() => setOpen(false)}>{t.cookies.understand}</button>
        </div>
      </section>
    </div>
  )
}
