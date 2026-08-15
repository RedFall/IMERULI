import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { menuCatalog } from '../data/menu'
import type { MenuCategory } from '../types'
import pl from './pl.json'
import en from './en.json'
import ru from './ru.json'
import uk from './uk.json'

export type Language = 'pl' | 'en' | 'ru' | 'uk'
export type Translations = typeof pl

const STORAGE_KEY = 'imeruli-language'

const dictionaries: Record<Language, Translations> = {
  pl,
  en: en as Translations,
  ru: ru as Translations,
  uk: uk as Translations,
}

export const languageOptions = [
  { code: 'pl', short: 'PL', labelKey: 'polish' },
  { code: 'en', short: 'EN', labelKey: 'english' },
  { code: 'ru', short: 'RU', labelKey: 'russian' },
  { code: 'uk', short: 'UA', labelKey: 'ukrainian' },
] as const satisfies ReadonlyArray<{
  code: Language
  short: string
  labelKey: keyof Translations['language']
}>

type CategoryText = { name: string; description: string }
type DishText = {
  name: string
  description: string
  serving: string
  imageAlt: string
  allergens: string[]
  dietaryTags: string[]
}

function buildMenu(dictionary: Translations): MenuCategory[] {
  const categoryTexts = dictionary.menuData.categories as Record<string, CategoryText>
  const dishTexts = dictionary.menuData.dishes as Record<string, DishText>

  return menuCatalog.map((category) => {
    const categoryText = categoryTexts[category.id]
    if (!categoryText) throw new Error(`Missing category translation: ${category.id}`)

    return {
      id: category.id,
      slug: category.slug,
      georgianName: category.georgianName,
      name: categoryText.name,
      description: categoryText.description,
      dishes: category.dishes.map((dish) => {
        const dishText = dishTexts[dish.id]
        if (!dishText) throw new Error(`Missing dish translation: ${dish.id}`)

        return {
          id: dish.id,
          slug: dish.slug,
          categoryId: category.id,
          name: dishText.name,
          description: dishText.description,
          serving: dishText.serving,
          priceMinor: dish.priceMinor,
          image: {
            src: dish.imageSrc,
            alt: dishText.imageAlt,
            focalPoint: dish.imageFocalPoint,
          },
          allergens: dishText.allergens,
          dietaryTags: dishText.dietaryTags,
          spiceLevel: dish.spiceLevel,
          availability: dish.availability,
          featured: dish.featured,
        }
      }),
    }
  })
}

function isLanguage(value: string | null | undefined): value is Language {
  return value === 'pl' || value === 'en' || value === 'ru' || value === 'uk'
}

function getInitialLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isLanguage(stored)) return stored
  } catch {
    // Storage may be disabled; the language switch still works for this visit.
  }

  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const browserLanguage of browserLanguages) {
    const language = browserLanguage.toLowerCase().split('-')[0]
    if (isLanguage(language)) return language
  }
  return 'pl'
}

export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match))
}

interface I18nValue {
  language: Language
  setLanguage: (language: Language) => void
  t: Translations
  menuCategories: MenuCategory[]
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage)
  const t = dictionaries[language]
  const menuCategories = useMemo(() => buildMenu(t), [t])

  useEffect(() => {
    document.documentElement.lang = language
    const pathname = window.location.pathname.toLowerCase()
    if (!pathname.endsWith('/privacy.html') && !pathname.endsWith('/cookies.html')) {
      document.title = t.meta.title
    }
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', t.meta.description)
    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // A blocked storage API must not prevent language switching.
    }
  }, [language, t.meta.description, t.meta.title])

  const value = useMemo(() => ({ language, setLanguage, t, menuCategories }), [language, t, menuCategories])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}
