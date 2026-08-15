import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { useI18n } from '../i18n'
import { ArrowIcon } from './Icons'

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const localProgress = (progress: number, start: number, end: number) => clamp((progress - start) / (end - start))
const smoothstep = (value: number) => value * value * (3 - 2 * value)

export function Hero() {
  const { t } = useI18n()
  const [sectionRef, progress] = useScrollProgress<HTMLElement>()
  const reduced = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const directMenuEntry = useRef(window.location.hash.startsWith('#menu'))
  const [videoFailed, setVideoFailed] = useState(false)
  const [visualsEnabled, setVisualsEnabled] = useState(() => !directMenuEntry.current)

  const travel = reduced ? 0 : smoothstep(localProgress(progress, 0, .92))
  const introOpacity = reduced ? 1 : 1 - smoothstep(localProgress(progress, .28, .64))
  const finaleOpacity = reduced ? 0 : smoothstep(localProgress(progress, .48, .82))
  const mediaStyle = {
    '--interior-scale': 1.025 + travel * .055,
    '--interior-y': `${travel * -1.8}%`,
  } as CSSProperties

  useEffect(() => {
    if (!directMenuEntry.current || visualsEnabled) return
    let lastScrollY = window.scrollY
    let removeScrollListener: (() => void) | undefined
    const timer = window.setTimeout(() => {
      const hero = sectionRef.current
      if (!hero) return
      const onScroll = () => {
        const currentScrollY = window.scrollY
        const approachesHero = currentScrollY < lastScrollY - 8
          && currentScrollY <= hero.offsetTop + hero.offsetHeight + window.innerHeight * .5
        lastScrollY = currentScrollY
        if (!approachesHero) return
        setVisualsEnabled(true)
        window.removeEventListener('scroll', onScroll)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      removeScrollListener = () => window.removeEventListener('scroll', onScroll)
    }, 320)
    return () => {
      window.clearTimeout(timer)
      removeScrollListener?.()
    }
  }, [sectionRef, visualsEnabled])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (progress < .98) video.play().catch(() => undefined)
    else video.pause()
  }, [progress, visualsEnabled])

  return (
    <section id="top" className={`interior-hero section-anchor ${reduced ? 'is-reduced' : ''}`} ref={sectionRef} aria-label={t.hero.sectionLabel}>
      <div className="interior-hero-stage">
        {visualsEnabled && (
          <div className="interior-hero-media" style={mediaStyle} aria-hidden="true">
            <img src={`${import.meta.env.BASE_URL}images/hero/interior-poster.webp`} alt="" fetchPriority="high" decoding="async"/>
			{!videoFailed && (
			  <video ref={videoRef} muted loop playsInline preload="none" poster={`${import.meta.env.BASE_URL}images/hero/interior-poster.webp`} onError={() => setVideoFailed(true)}>
				<source src={`${import.meta.env.BASE_URL}video/imeruli-interior.webm`} type="video/webm"/>
				<source src={`${import.meta.env.BASE_URL}video/imeruli-interior.mp4`} type="video/mp4"/>
			  </video>
			)}
            )}
            <div className="interior-hero-shade" />
          </div>
        )}

        <div className="interior-hero-grain" aria-hidden="true" />

        <div className="interior-hero-copy interior-hero-intro" style={{ opacity: introOpacity }} aria-hidden={introOpacity < .08}>
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1><span>{t.hero.titleFirst}</span><strong>{t.hero.titleSecond}</strong></h1>
        </div>

        <div className="interior-hero-copy interior-hero-finale" style={{ opacity: finaleOpacity }} aria-hidden={finaleOpacity < .08}>
          <p className="eyebrow">{t.hero.finalEyebrow}</p>
          <h2>{t.hero.finalTitleFirst}<br />{t.hero.finalTitleSecond}</h2>
        </div>

        <div className="interior-hero-action">
          <a className="button button-primary" href="#menu">{t.hero.cta} <ArrowIcon /></a>
          <p>{t.hero.actionFirst}<br />{t.hero.actionSecond}</p>
        </div>

        {!reduced && (
          <div className="interior-scroll-cue" style={{ opacity: introOpacity }} aria-hidden="true">
            <span>{t.hero.scroll}</span><i />
          </div>
        )}
      </div>
    </section>
  )
}
