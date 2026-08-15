import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from 'react'
import { formatPrice } from '../data/menu'
import type { MenuCategory } from '../types'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { interpolate, useI18n } from '../i18n'
import { ArrowIcon, ChevronIcon, CloseIcon } from './Icons'
import { PageFlip } from 'page-flip/dist/js/page-flip.module.js'

type BookState = 'offscreen' | 'entering-up' | 'opening' | 'ready' | 'turning-forward' | 'turning-backward' | 'jumping'
type TurnDirection = 'forward' | 'backward'
type MenuPage = { type: 'category'; category: MenuCategory } | { type: 'info' }

function pageIndexFromHash(hash: string, menuCategories: MenuCategory[], pageCount: number) {
  if (!hash.startsWith('#menu')) return null
  const requestedSlug = hash.split('/')[1]
  if (!requestedSlug) return 0
  if (requestedSlug === 'info') return pageCount - 1
  const requestedIndex = menuCategories.findIndex((category) => category.slug === requestedSlug)
  return requestedIndex >= 0 ? requestedIndex : 0
}

function hashForPage(index: number, bookPages: MenuPage[]) {
  const page = bookPages[index]
  return page?.type === 'category' ? `#menu/${page.category.slug}` : '#menu/info'
}

function usePageStep() {
  const [step, setStep] = useState(() => window.matchMedia('(min-width: 1024px)').matches ? 2 : 1)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const update = () => setStep(media.matches ? 2 : 1)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return step
}

function DishItem({ dish }: { dish: MenuCategory['dishes'][number] }) {
  const { language, t } = useI18n()
  const unavailable = dish.availability === 'sold-out'

  return (
    <article className={`dish-item ${dish.featured ? 'is-featured' : ''} ${unavailable ? 'is-unavailable' : ''}`}>
      <div className="dish-image-wrap">
        <img src={dish.image.src} alt={dish.image.alt} loading="lazy" />
        {dish.featured && <span className="dish-featured">{t.menu.featured}</span>}
      </div>
      <div className="dish-copy">
        <div className="dish-title-line">
          <h4>{dish.name}</h4>
          <span className="dish-dots" aria-hidden="true" />
          <strong>{formatPrice(dish.priceMinor, language)}</strong>
        </div>
        <p>{dish.description}</p>
        <div className="dish-meta">
          <span>{dish.serving}</span>
          {dish.dietaryTags?.map((tag) => <span key={tag}>{tag}</span>)}
          {!!dish.allergens.length && <span>{t.menu.allergens}: {dish.allergens.join(', ')}</span>}
          {dish.spiceLevel ? <span aria-label={interpolate(t.menu.spiceLevel, { level: dish.spiceLevel })}>{'●'.repeat(dish.spiceLevel)} {t.menu.spicy}</span> : null}
          {dish.availability === 'seasonal' && <span>{t.menu.seasonal}</span>}
        </div>
        {unavailable && <span className="availability">{t.menu.unavailable}</span>}
      </div>
    </article>
  )
}

function CategoryPage({ category, pageNumber, total, decorative = false, instance = 'base' }: {
  category: MenuCategory
  pageNumber: number
  total: number
  decorative?: boolean
  instance?: string
}) {
  const { t } = useI18n()
  const headingId = `category-${category.slug}-${instance}`

  return (
    <section className="book-page category-page" aria-labelledby={decorative ? undefined : headingId}>
      <header className="page-header">
        <span className="georgian-label">{category.georgianName}</span>
        <span>{String(pageNumber).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      </header>
      <h3 id={headingId} tabIndex={decorative ? undefined : -1}>{category.name}</h3>
      <p className="category-intro">{category.description}</p>
      <div className="dish-list">
        {category.dishes.filter((dish) => dish.availability !== 'hidden').map((dish) => <DishItem key={dish.id} dish={dish} />)}
      </div>
      <footer className="page-footer"><span>IMERULI</span><span>{t.menu.locationFooter}</span></footer>
    </section>
  )
}

function InfoPage({ pageNumber, total, decorative = false, instance = 'base', onStory }: {
  pageNumber: number
  total: number
  decorative?: boolean
  instance?: string
  onStory?: (event: ReactMouseEvent<HTMLAnchorElement>) => void
}) {
  const { t } = useI18n()
  const headingId = `menu-info-title-${instance}`

  return (
    <section className="book-page info-page" aria-labelledby={decorative ? undefined : headingId}>
      <header className="page-header"><span className="georgian-label">კეთილი იყოს თქვენი მობრძანება</span><span>{String(pageNumber).padStart(2, '0')} / {String(total).padStart(2, '0')}</span></header>
      <p className="eyebrow">{t.menu.infoEyebrow}</p>
      <h3 id={headingId} tabIndex={decorative ? undefined : -1}>{t.menu.infoTitle}</h3>
      <p className="info-lead">{t.menu.infoLead}</p>
      <dl className="menu-legend">
        <div><dt>{t.menu.portion}</dt><dd>{t.menu.portionInfo}</dd></div>
        <div><dt>{t.menu.allergensTitle}</dt><dd>{t.menu.allergensInfo}</dd></div>
        <div><dt>{t.menu.availability}</dt><dd>{t.menu.availabilityInfo}</dd></div>
      </dl>
      <a className="button button-primary" href="#story" onClick={onStory} tabIndex={decorative ? -1 : undefined}>{t.menu.meetOurStory} <ArrowIcon /></a>
      <footer className="page-footer"><span>IMERULI</span><span>{t.menu.seeYouAtTable}</span></footer>
    </section>
  )
}

function Page({ page, index, decorative = false, instance = 'base', onStory, total }: {
  page: MenuPage | undefined
  index: number
  decorative?: boolean
  instance?: string
  onStory?: (event: ReactMouseEvent<HTMLAnchorElement>) => void
  total: number
}) {
  if (!page) return <div className="book-page blank-page" aria-hidden="true" />
  return page.type === 'category'
    ? <CategoryPage category={page.category} pageNumber={index + 1} total={total} decorative={decorative} instance={instance} />
    : <InfoPage pageNumber={index + 1} total={total} decorative={decorative} instance={instance} onStory={onStory} />
}

export function MenuBook() {
  const { language, menuCategories, t } = useI18n()
  const bookPages = useMemo<MenuPage[]>(() => [
    ...menuCategories.map((category) => ({ type: 'category' as const, category })),
    { type: 'info' as const },
  ], [menuCategories])
  const sectionRef = useRef<HTMLElement>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const pageFlipHostRef = useRef<HTMLDivElement>(null)
  const pageFlipRef = useRef<PageFlip | null>(null)
  const pageIndexRef = useRef(0)
  const syncHashOnNextFlip = useRef(false)
  const turnDirectionRef = useRef<TurnDirection>('forward')
  const hasEntered = useRef(false)
  const pointerStart = useRef({ x: 0, y: 0, valid: false })
  const wheelIntent = useRef({ amount: 0, direction: 0, timer: 0 })
  const tocTriggerRef = useRef<HTMLButtonElement>(null)
  const tocCloseRef = useRef<HTMLButtonElement>(null)
  const tocDialogRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const step = usePageStep()
  const [state, setState] = useState<BookState>('offscreen')
  const [pageIndex, setPageIndex] = useState(() => {
    const initialIndex = pageIndexFromHash(window.location.hash, menuCategories, bookPages.length) ?? 0
    pageIndexRef.current = initialIndex
    return initialIndex
  })
  const [tocOpen, setTocOpen] = useState(false)
  const maxIndex = step === 2 ? Math.max(0, bookPages.length - 2) : bookPages.length - 1
  const canPrevious = pageIndex > 0
  const canNext = pageIndex < maxIndex

  useEffect(() => () => {
    window.clearTimeout(wheelIntent.current.timer)
  }, [])

  useEffect(() => {
    setState((current) => current === 'offscreen' ? current : 'ready')
    setPageIndex((current) => {
      const normalized = Math.min(maxIndex, current - (current % step))
      pageIndexRef.current = normalized
      return normalized
    })
  }, [step, maxIndex])

  useEffect(() => {
    let instance: PageFlip | null = null
    const frame = window.requestAnimationFrame(() => {
      const host = pageFlipHostRef.current
      if (!host) return
      const pages = Array.from(host.children).filter((child): child is HTMLElement => child instanceof HTMLElement && child.classList.contains('book-page'))
      if (!pages.length) return

      instance = new PageFlip(host, step === 2 ? {
        width: 720,
        height: 760,
        size: 'stretch',
        minWidth: 360,
        maxWidth: 720,
        minHeight: 560,
        maxHeight: 820,
        startPage: pageIndexRef.current,
        flippingTime: 720,
        usePortrait: false,
        autoSize: true,
        drawShadow: true,
        maxShadowOpacity: .26,
        showCover: false,
        mobileScrollSupport: true,
        useMouseEvents: false,
        showPageCorners: false,
        disableFlipByClick: true,
      } : {
        width: 390,
        height: 690,
        size: 'stretch',
        minWidth: 280,
        maxWidth: 760,
        minHeight: 560,
        maxHeight: 760,
        startPage: pageIndexRef.current,
        flippingTime: 720,
        usePortrait: true,
        autoSize: true,
        drawShadow: true,
        maxShadowOpacity: .24,
        showCover: false,
        mobileScrollSupport: true,
        useMouseEvents: false,
        showPageCorners: false,
        disableFlipByClick: false,
      })

      instance.on('flip', (event) => {
        const index = Number(event.data)
        pageIndexRef.current = index
        setPageIndex(index)
        if (syncHashOnNextFlip.current || window.location.hash.startsWith('#menu')) {
          window.history.replaceState(null, '', hashForPage(index, bookPages))
        }
        syncHashOnNextFlip.current = false
      })
      instance.on('changeState', (event) => {
        if (event.data === 'flipping') {
          setState(turnDirectionRef.current === 'forward' ? 'turning-forward' : 'turning-backward')
        } else if (event.data === 'read') {
          setState('ready')
        }
      })
      instance.loadFromHTML(pages)
      const renderBlock = host.querySelector('.stf__block')
      if (renderBlock) {
        const spine = document.createElement('span')
        spine.className = 'book-spine'
        spine.setAttribute('aria-hidden', 'true')
        renderBlock.appendChild(spine)
      }
      pageFlipRef.current = instance
    })

    return () => {
      window.cancelAnimationFrame(frame)
      if (instance) {
        instance.clear()
        instance.getUI().destroy()
      }
      const host = pageFlipHostRef.current
      host?.classList.remove('stf__parent')
      host?.removeAttribute('style')
      pageFlipRef.current = null
    }
  }, [language, step])

  useEffect(() => {
    const syncPageFromLocation = () => {
      const requestedIndex = pageIndexFromHash(window.location.hash, menuCategories, bookPages.length)
      if (requestedIndex === null) return
      const normalized = Math.max(0, Math.min(maxIndex, requestedIndex - (requestedIndex % step)))
      pageIndexRef.current = normalized
      setPageIndex(normalized)
      pageFlipRef.current?.turnToPage(normalized)
      sectionRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }

    window.addEventListener('hashchange', syncPageFromLocation)
    window.addEventListener('popstate', syncPageFromLocation)
    return () => {
      window.removeEventListener('hashchange', syncPageFromLocation)
      window.removeEventListener('popstate', syncPageFromLocation)
    }
  }, [bookPages.length, maxIndex, menuCategories, reduced, step])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const directOpen = window.location.hash.startsWith('#menu')

    if (directOpen) {
      const requestedIndex = pageIndexFromHash(window.location.hash, menuCategories, bookPages.length) ?? 0
      const normalized = Math.max(0, Math.min(maxIndex, requestedIndex - (requestedIndex % step)))
      pageIndexRef.current = normalized
      setPageIndex(normalized)
      document.documentElement.style.scrollBehavior = 'auto'
      requestAnimationFrame(() => {
        node.scrollIntoView({ block: 'start', behavior: 'auto' })
        requestAnimationFrame(() => document.documentElement.style.removeProperty('scroll-behavior'))
      })
    }

    const openBook = () => {
      if (hasEntered.current) return
      hasEntered.current = true
      setState('entering-up')
      window.setTimeout(() => setState(reduced ? 'ready' : 'opening'), reduced ? 0 : 340)
      window.setTimeout(() => setState('ready'), reduced ? 30 : 1060)
    }

    if (directOpen) openBook()
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) openBook()
    }, { threshold: .18 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [bookPages.length, maxIndex, menuCategories, reduced, step])

  useEffect(() => {
    if (state !== 'ready') return
    const frame = window.requestAnimationFrame(() => pageFlipRef.current?.update())
    const settledLayoutTimer = window.setTimeout(() => pageFlipRef.current?.update(), 120)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(settledLayoutTimer)
    }
  }, [state, step])

  useEffect(() => {
    if (!tocOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    document.documentElement.classList.add('modal-open')
    const focusTimer = window.setTimeout(() => tocCloseRef.current?.focus(), 0)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTocOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      document.documentElement.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
      previousFocus?.focus({ preventScroll: true })
    }
  }, [tocOpen])

  const onTocKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    const focusable = Array.from(tocDialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]') ?? [])
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

  const activeCategory = useMemo(() => {
    const page = bookPages[pageIndex]
    return page?.type === 'category' ? page.category.name : t.menu.information
  }, [bookPages, pageIndex, t.menu.information])

  const announceAndFocusPage = (direction: TurnDirection | 'jump') => {
    if (direction !== 'jump') return
    requestAnimationFrame(() => sectionRef.current?.querySelector<HTMLElement>('.page-flip-host .book-page.--simple h3')?.focus({ preventScroll: true }))
  }

  const turnTo = (target: number, direction: TurnDirection | 'jump' = 'jump') => {
    if (state !== 'ready') return
    const normalized = Math.max(0, Math.min(maxIndex, target - (target % step)))
    if (normalized === pageIndex) return
    const pageFlip = pageFlipRef.current
    if (!pageFlip) return
    syncHashOnNextFlip.current = true
    if (direction === 'jump' || reduced) {
      pageFlip.turnToPage(normalized)
      announceAndFocusPage(direction)
    } else {
      turnDirectionRef.current = direction
      direction === 'forward' ? pageFlip.flipNext('top') : pageFlip.flipPrev('top')
    }
  }

  const next = () => canNext && turnTo(pageIndex + step, 'forward')
  const previous = () => canPrevious && turnTo(pageIndex - step, 'backward')

  const goToStory = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const story = document.querySelector('#story')
    if (!story) return
    syncHashOnNextFlip.current = false
    window.history.pushState(null, '', '#story')
    story.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  const resetSwipeCue = (node: HTMLDivElement) => {
    pointerStart.current.valid = false
    node.removeAttribute('data-swipe')
    node.style.removeProperty('--swipe-progress')
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as Element
    const startsOnControl = Boolean(target.closest('a, button:not(.book-edge), input, textarea, select'))
    pointerStart.current = { x: event.clientX, y: event.clientY, valid: !startsOnControl && state === 'ready' }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current.valid || event.pointerType === 'mouse') return
    const dx = event.clientX - pointerStart.current.x
    const dy = event.clientY - pointerStart.current.y
    if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy) * 1.25) return
    const direction = dx < 0 ? 'forward' : 'backward'
    if ((direction === 'forward' && !canNext) || (direction === 'backward' && !canPrevious)) return
    event.preventDefault()
    event.currentTarget.dataset.swipe = direction
    event.currentTarget.style.setProperty('--swipe-progress', String(Math.min(1, Math.abs(dx) / Math.max(180, event.currentTarget.clientWidth * .55))))
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dx = event.clientX - pointerStart.current.x
    const dy = event.clientY - pointerStart.current.y
    const valid = pointerStart.current.valid
    resetSwipeCue(event.currentTarget)
    if (!valid) return
    if (Math.abs(dx) < 56 || Math.abs(dx) <= Math.abs(dy) * 1.35) return
    dx < 0 ? next() : previous()
  }

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => resetSwipeCue(event.currentTarget)

  const moveAcrossBoundary = (direction: number) => {
    if (direction > 0) {
      document.querySelector('#story')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      return
    }

    const hero = document.querySelector<HTMLElement>('#top')
    if (!hero) return
    const scrollableHeroDistance = Math.max(0, hero.offsetHeight - window.innerHeight)
    const interiorPosition = hero.offsetTop + scrollableHeroDistance * .985
    window.scrollTo({ top: interiorPosition, behavior: reduced ? 'auto' : 'smooth' })
  }

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 22) {
      event.preventDefault()
      event.deltaX > 0 ? next() : previous()
      return
    }

    const page = (event.target as Element).closest<HTMLElement>('.book-page')
    if (!page || Math.abs(event.deltaY) < 4) return
    const direction = Math.sign(event.deltaY)
    const atTop = page.scrollTop <= 1
    const atBottom = page.scrollTop + page.clientHeight >= page.scrollHeight - 1
    const atBookBoundary = direction < 0 ? atTop && !canPrevious : atBottom && !canNext

    if (!atBookBoundary) {
      wheelIntent.current.amount = 0
      return
    }

    event.preventDefault()
    if (wheelIntent.current.direction !== direction) wheelIntent.current.amount = 0
    wheelIntent.current.direction = direction
    wheelIntent.current.amount += Math.abs(event.deltaY)
    window.clearTimeout(wheelIntent.current.timer)
    wheelIntent.current.timer = window.setTimeout(() => { wheelIntent.current.amount = 0 }, 280)

    if (wheelIntent.current.amount > 240) {
      wheelIntent.current.amount = 0
      moveAcrossBoundary(direction)
    }
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!sectionRef.current || !sectionRef.current.matches(':hover, :focus-within') || state !== 'ready') return
      if (event.key === 'ArrowRight' && canNext) {
        event.preventDefault()
        next()
      }
      if (event.key === 'ArrowLeft' && canPrevious) {
        event.preventDefault()
        previous()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <section id="menu" className="menu-section section-anchor" ref={sectionRef} aria-labelledby="menu-title">
      <div className="section-kicker"><span>01</span><span>{t.menu.sectionName}</span><span>{t.menu.sectionHint}</span></div>
      <div className="menu-heading-row">
        <div><p className="eyebrow">{t.menu.eyebrow}</p><h2 id="menu-title">{t.menu.title}</h2></div>
        <p>{t.menu.description}</p>
      </div>

      <div className="book-toolbar">
        <button ref={tocTriggerRef} className="toc-button" onClick={() => setTocOpen(true)} aria-haspopup="dialog"><span>{t.menu.tableOfContents}</span><strong>{activeCategory}</strong></button>
        <span className="book-gesture-hint" aria-hidden="true">{t.menu.gestureHint}</span>
        <span className="book-progress">{String(pageIndex + 1).padStart(2, '0')}—{String(Math.min(bookPages.length, pageIndex + step)).padStart(2, '0')} / {String(bookPages.length).padStart(2, '0')}</span>
      </div>

      <div
        ref={bookRef}
        className={`menu-book state-${state} ${reduced ? 'is-reduced' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onWheel={onWheel}
        tabIndex={0}
        aria-label={`${t.menu.electronicMenu}. ${activeCategory}`}
      >
        <div className="book-shell">
          <div key={language} ref={pageFlipHostRef} className="page-flip-host">
            {bookPages.map((page, index) => <Page key={`${page.type}-${index}`} page={page} index={index} total={bookPages.length} instance={`page-${index}`} onStory={goToStory} />)}
          </div>
          {state === 'ready' && canNext && <span className="page-curl" aria-hidden="true" />}

          <div className="book-cover" aria-hidden={state === 'ready'}>
            <span className="cover-georgian">იმერული</span>
            <div className="cover-mark">ი</div>
            <strong>IMERULI</strong>
            <span className="cover-subtitle">{t.menu.coverSubtitle}</span>
          </div>

          <button
            type="button"
            className="book-edge book-edge-previous"
            onClick={previous}
            disabled={!canPrevious || state !== 'ready'}
            aria-label={t.menu.previousEdge}
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            className="book-edge book-edge-next"
            onClick={next}
            disabled={!canNext || state !== 'ready'}
            aria-label={t.menu.nextEdge}
          >
            <ChevronIcon />
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{interpolate(t.menu.pageAnnouncement, { category: activeCategory, from: pageIndex + 1, to: Math.min(bookPages.length, pageIndex + step), total: bookPages.length })}</p>

      <div className="page-controls">
        <button onClick={previous} disabled={!canPrevious || state !== 'ready'} aria-label={t.menu.previousPage}><ArrowIcon direction="left" /><span>{t.menu.previous}</span></button>
        <span aria-hidden="true">{activeCategory}</span>
        <button onClick={next} disabled={!canNext || state !== 'ready'} aria-label={t.menu.nextPage}><span>{t.menu.next}</span><ArrowIcon /></button>
      </div>

      {tocOpen && (
        <div className="toc-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setTocOpen(false)}>
          <div ref={tocDialogRef} className="toc-dialog" role="dialog" aria-modal="true" aria-labelledby="toc-title" onKeyDown={onTocKeyDown}>
            <header><div><p className="eyebrow">{t.menu.quickChoice}</p><h3 id="toc-title">{t.menu.tableOfContents}</h3></div><button ref={tocCloseRef} onClick={() => setTocOpen(false)} aria-label={t.menu.closeToc}><CloseIcon /></button></header>
            <ol>
              {menuCategories.map((category, index) => (
                <li key={category.id}><button onClick={() => { turnTo(index, 'jump'); setTocOpen(false) }}><span>{String(index + 1).padStart(2, '0')}</span><strong>{category.name}</strong><em>{category.georgianName}</em><ArrowIcon /></button></li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  )
}
