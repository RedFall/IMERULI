import { useI18n } from '../i18n'
import { ArrowIcon } from './Icons'

export function Story() {
  const { t } = useI18n()
  return (
    <section id="story" className="story-section section-anchor" aria-labelledby="story-title">
      <div className="section-kicker"><span>02</span><span>{t.story.sectionName}</span><span>{t.story.sectionPath}</span></div>
      <div className="story-grid">
        <div className="story-copy">
          <p className="eyebrow">{t.story.eyebrow}</p>
          <h2 id="story-title">{t.story.title}</h2>
          <p className="story-lead">{t.story.lead}</p>
          <div className="story-columns">
            <p>{t.story.columnOne}</p>
            <p>{t.story.columnTwo}</p>
          </div>
          <blockquote><span>„</span>{t.story.quote}</blockquote>
        </div>
        <figure className="story-image">
		<img src={`${import.meta.env.BASE_URL}images/story/interior-table.webp`} alt={t.story.imageAlt} loading="lazy"/>
          <figcaption><span>Piotrkowska 22</span><span>{t.story.city}</span></figcaption>
        </figure>
      </div>

      <div className="location-grid">
        <div className="location-copy">
          <p className="eyebrow">{t.story.findUs}</p>
          <h3>{t.story.locationTitle}</h3>
          <address>ul. Piotrkowska 22<br />90-001 {t.story.city}</address>
          <dl>
            <div><dt>{t.story.mondayThursday}</dt><dd>12:00—22:00</dd></div>
            <div><dt>{t.story.fridaySaturday}</dt><dd>12:00—23:00</dd></div>
            <div><dt>{t.story.sunday}</dt><dd>12:00—21:00</dd></div>
          </dl>
          <a className="button button-outline" href="https://www.google.com/maps/search/?api=1&query=Piotrkowska+22+Lodz" target="_blank" rel="noreferrer">{t.story.route} <ArrowIcon /></a>
        </div>
        <a className="map-preview" href="https://www.google.com/maps/search/?api=1&query=Piotrkowska+22+Lodz" target="_blank" rel="noreferrer" aria-label={t.story.mapAria}>
          <div className="map-grid" aria-hidden="true">
            <i className="street street-one" /><i className="street street-two" /><i className="street street-three" /><i className="street street-four" />
            <span className="map-water" /><span className="map-park map-park-one" /><span className="map-park map-park-two" />
          </div>
          <div className="map-pin"><span>ი</span><strong>IMERULI</strong><small>Piotrkowska 22</small></div>
          <span className="map-caption">{t.story.openMaps} <ArrowIcon /></span>
        </a>
      </div>
    </section>
  )
}
