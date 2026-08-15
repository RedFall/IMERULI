import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { ArrowIcon, StarIcon } from './Icons'

function RatingStars({ label }: { label: string }) {
  return <span className="stars" aria-label={label}>{Array.from({ length: 5 }, (_, index) => <StarIcon key={index} />)}</span>
}

export function Reviews() {
  const { t } = useI18n()
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollBack, setCanScrollBack] = useState(false)
  const [canScrollForward, setCanScrollForward] = useState(false)
  const scroll = (direction: number) => trackRef.current?.scrollBy({ left: direction * (trackRef.current.clientWidth * .78), behavior: 'smooth' })

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const updateControls = () => {
      const maximum = track.scrollWidth - track.clientWidth
      setCanScrollBack(track.scrollLeft > 2)
      setCanScrollForward(maximum > 2 && track.scrollLeft < maximum - 2)
    }
    updateControls()
    track.addEventListener('scroll', updateControls, { passive: true })
    const observer = new ResizeObserver(updateControls)
    observer.observe(track)
    return () => {
      track.removeEventListener('scroll', updateControls)
      observer.disconnect()
    }
  }, [])

  return (
    <section id="reviews" className="reviews-section section-anchor" aria-labelledby="reviews-title">
      <div className="section-kicker"><span>03</span><span>{t.reviews.sectionName}</span><span>Google</span></div>
      <div className="reviews-heading">
        <div><p className="eyebrow">{t.reviews.eyebrow}</p><h2 id="reviews-title">{t.reviews.title}</h2></div>
        <div className="rating-summary">
          <strong>4.8</strong>
          <div><RatingStars label={t.reviews.ratingAria} /><span>{t.reviews.ratingDemo}</span></div>
        </div>
      </div>
      <div className="reviews-track" ref={trackRef}>
        {t.reviews.items.map((review, index) => (
          <article className="review-card" key={index}>
            <header><RatingStars label={t.reviews.ratingAria} /><span>0{index + 1}</span></header>
            <blockquote>“{review.text}”</blockquote>
            <footer><strong>{review.author}</strong><span>{review.date}</span></footer>
          </article>
        ))}
      </div>
      <div className="review-controls">
        <button onClick={() => scroll(-1)} disabled={!canScrollBack} aria-label={t.reviews.previous}><ArrowIcon direction="left" /></button>
        <button onClick={() => scroll(1)} disabled={!canScrollForward} aria-label={t.reviews.next}><ArrowIcon /></button>
        <a href="https://www.google.com/maps/search/?api=1&query=Restauracja+Gruzinska+IMERULI+Lodz" target="_blank" rel="noreferrer">{t.reviews.all} <ArrowIcon /></a>
      </div>
    </section>
  )
}
