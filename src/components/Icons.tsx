import type { SVGProps } from 'react'

export function ArrowIcon({ direction = 'right', ...props }: SVGProps<SVGSVGElement> & { direction?: 'left' | 'right' | 'down' }) {
  const rotation = direction === 'left' ? 180 : direction === 'down' ? 90 : 0
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${rotation}deg)` }} {...props}>
      <path d="M4 12h15M14 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function ChevronIcon({ direction = 'right', ...props }: SVGProps<SVGSVGElement> & { direction?: 'left' | 'right' }) {
  const rotation = direction === 'left' ? 180 : 0
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${rotation}deg)` }} {...props}>
      <path d="m8.5 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path d="M3 7h18M3 12h18M3 17h18" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path d="m5 5 14 14M19 5 5 19" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 20 20" aria-hidden="true" {...props}><path d="m10 1.5 2.55 5.16 5.7.83-4.13 4.02.98 5.68L10 14.51l-5.1 2.68.98-5.68L1.75 7.5l5.7-.83L10 1.5Z" fill="currentColor" /></svg>
}
