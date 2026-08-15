import type { Availability } from '../types'

export interface MenuCatalogDish {
  id: string
  slug: string
  servingKey: string
  priceMinor: number
  imageSrc: string
  imageFocalPoint?: string
  spiceLevel?: number
  availability: Availability
  featured?: boolean
}

export interface MenuCatalogCategory {
  id: string
  slug: string
  georgianName: string
  dishes: MenuCatalogDish[]
}

/**
 * Business data that does not change between languages. All customer-facing
 * copy lives in src/i18n/*.json and is merged with this catalog by i18n/index.
 */
export const menuCatalog: MenuCatalogCategory[] = [
  {
    id: 'przystawki',
    slug: 'przystawki',
    georgianName: 'საუზმე',
    dishes: [
      {
        id: 'pchali', slug: 'pchali', servingKey: 'pchali', priceMinor: 3200,
        imageSrc: '{`${import.meta.env.BASE_URL}images/menu/pchali.webp', availability: 'available', featured: true,
      },
      {
        id: 'badrijani', slug: 'badrijani', servingKey: 'badrijani', priceMinor: 3400,
        imageSrc: '{`${import.meta.env.BASE_URL}images/menu/badrijani.webp', availability: 'available',
      },
    ],
  },
  {
    id: 'chinkali',
    slug: 'chinkali',
    georgianName: 'ხინკალი',
    dishes: [
      {
        id: 'chinkali-classic', slug: 'chinkali-tradycyjne', servingKey: 'chinkali-classic', priceMinor: 3800,
        imageSrc: '{`${import.meta.env.BASE_URL}images/menu/chinkali.webp', availability: 'available', featured: true,
      },
      {
        id: 'chinkali-mushroom', slug: 'chinkali-z-grzybami', servingKey: 'chinkali-mushroom', priceMinor: 3600,
        imageSrc: '{`${import.meta.env.BASE_URL}images/menu/chinkali.webp', availability: 'available',
      },
    ],
  },
  {
    id: 'chaczapuri',
    slug: 'chaczapuri',
    georgianName: 'ხაჭაპური',
    dishes: [
      {
        id: 'imeruli', slug: 'chaczapuri-imeruli', servingKey: 'imeruli', priceMinor: 4200,
        imageSrc: '{`${import.meta.env.BASE_URL}images/menu/chaczapuri.webp', availability: 'available', featured: true,
      },
      {
        id: 'adjaruli', slug: 'chaczapuri-adzaruli', servingKey: 'adjaruli', priceMinor: 4600,
        imageSrc: '{`${import.meta.env.BASE_URL}images/menu/chaczapuri.webp', availability: 'available',
      },
    ],
  },
  {
    id: 'dania-glowne',
    slug: 'dania-glowne',
    georgianName: 'მთავარი კერძები',
    dishes: [
      {
        id: 'czaszuszuli', slug: 'czaszuszuli', servingKey: 'czaszuszuli', priceMinor: 5200,
        imageSrc: '{`${import.meta.env.BASE_URL}images/menu/chashushuli.webp', spiceLevel: 1, availability: 'available', featured: true,
      },
      {
        id: 'odżachuri', slug: 'odzachuri', servingKey: 'odżachuri', priceMinor: 4900,
        imageSrc: '{`${import.meta.env.BASE_URL}images/menu/chashushuli.webp', availability: 'seasonal',
      },
    ],
  },
  {
    id: 'desery',
    slug: 'desery',
    georgianName: 'დესერტი',
    dishes: [
      {
        id: 'pelamushi', slug: 'pelamushi', servingKey: 'pelamushi', priceMinor: 2400,
        imageSrc: '{`${import.meta.env.BASE_URL}images/menu/pelamushi.webp', availability: 'available',
      },
      {
        id: 'matsoni', slug: 'matsoni-z-miodem', servingKey: 'matsoni', priceMinor: 2600,
        imageSrc: '{`${import.meta.env.BASE_URL}images/menu/pelamushi.webp', availability: 'sold-out',
      },
    ],
  },
]

const priceLocales = {
  pl: 'pl-PL',
  en: 'en-GB',
  ru: 'ru-RU',
  uk: 'uk-UA',
} as const

export const formatPrice = (amountMinor: number, language: keyof typeof priceLocales) =>
  new Intl.NumberFormat(priceLocales[language], { style: 'currency', currency: 'PLN' }).format(amountMinor / 100)
