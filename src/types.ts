export type Availability = 'available' | 'sold-out' | 'seasonal' | 'hidden'

export interface MenuImage {
  src: string
  alt: string
  focalPoint?: string
}

export interface Dish {
  id: string
  slug: string
  categoryId: string
  name: string
  description: string
  serving: string
  priceMinor: number
  image: MenuImage
  allergens: string[]
  dietaryTags?: string[]
  spiceLevel?: number
  availability: Availability
  featured?: boolean
}

export interface MenuCategory {
  id: string
  slug: string
  name: string
  georgianName: string
  description: string
  dishes: Dish[]
}
