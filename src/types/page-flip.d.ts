declare module 'page-flip/dist/js/page-flip.module.js' {
  type FlipCorner = 'top' | 'bottom'
  type PageFlipEvent = { data: unknown; object: PageFlip }
  type PageFlipSettings = Record<string, number | string | boolean>

  type PageFlipUI = {
    destroy(): void
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: PageFlipSettings)
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void
    update(): void
    on(eventName: string, callback: (event: PageFlipEvent) => void): PageFlip
    clear(): void
    getUI(): PageFlipUI
    getCurrentPageIndex(): number
    turnToPage(page: number): void
    flip(page: number, corner?: FlipCorner): void
    flipNext(corner?: FlipCorner): void
    flipPrev(corner?: FlipCorner): void
  }
}
