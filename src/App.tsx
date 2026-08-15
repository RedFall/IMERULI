import { CookieBanner } from './components/CookieBanner'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { LegalPage } from './components/LegalPage'
import { MenuBook } from './components/MenuBook'
import { Reviews } from './components/Reviews'
import { Story } from './components/Story'
import { useI18n } from './i18n'

export default function App() {
  const { t } = useI18n()
  const pathname = window.location.pathname.toLowerCase()
  if (pathname.endsWith('/privacy.html')) return <><LegalPage kind="privacy" /><CookieBanner /></>
  if (pathname.endsWith('/cookies.html')) return <><LegalPage kind="cookies" /><CookieBanner /></>

  return (
    <>
      <a className="skip-link" href="#menu">{t.app.skipToMenu}</a>
      <Header />
      <main>
        <Hero />
        <MenuBook />
        <Story />
        <Reviews />
      </main>
      <Footer />
      <CookieBanner />
    </>
  )
}
