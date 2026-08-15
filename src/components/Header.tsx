import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { CloseIcon, MenuIcon } from './Icons'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Header() {
  const { t } = useI18n()
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const mobileNavRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const menu = document.querySelector('#menu')
      setSolid(Boolean(menu && menu.getBoundingClientRect().top <= 82))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    document.documentElement.classList.add('modal-open')
    const focusTimer = window.setTimeout(() => mobileNavRef.current?.querySelector<HTMLAnchorElement>('a')?.focus(), 240)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = Array.from(mobileNavRef.current?.querySelectorAll<HTMLElement>('a, select, button:not([disabled])') ?? [])
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
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.clearTimeout(focusTimer)
      document.documentElement.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  const links = [
    [t.header.menu, '#menu'],
    [t.header.about, '#story'],
    [t.header.reviews, '#reviews'],
    [t.header.contact, '#contact'],
  ]

  return (
    <header className={`site-header ${solid || open ? 'is-solid' : ''}`}>
      <a className="brand" href="#top" aria-label={t.header.brandAria}>
        <span className="brand-mark">ი</span>
        <span>IMERULI</span>
      </a>
      <nav className="desktop-nav" aria-label={t.header.mainNavigation}>
        {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
      </nav>
      <div className="header-actions">
        <LanguageSwitcher className="header-language" />
        <a className="header-menu-cta" href="#menu">{t.header.seeMenu} <span aria-hidden="true">↘</span></a>
      </div>
      <button ref={toggleRef} className="mobile-nav-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? t.header.closeMenu : t.header.openMenu}>
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      <nav ref={mobileNavRef} id="mobile-nav" className={`mobile-nav ${open ? 'is-open' : ''}`} aria-label={t.header.mobileNavigation} aria-hidden={!open}>
        {links.map(([label, href], index) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            <span>0{index + 1}</span>{label}
          </a>
        ))}
        <LanguageSwitcher className="mobile-language" />
      </nav>
    </header>
  )
}
