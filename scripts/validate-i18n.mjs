import pl from '../src/i18n/pl.json' with { type: 'json' }
import en from '../src/i18n/en.json' with { type: 'json' }
import ru from '../src/i18n/ru.json' with { type: 'json' }
import uk from '../src/i18n/uk.json' with { type: 'json' }

const dictionaries = { en, ru, uk }
const errors = []

function placeholders(value) {
  return typeof value === 'string' ? [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort() : []
}

function compare(base, candidate, path, language) {
  if (Array.isArray(base)) {
    if (!Array.isArray(candidate)) {
      errors.push(`${language}: ${path} must be an array`)
      return
    }
    if (base.length !== candidate.length) errors.push(`${language}: ${path} has ${candidate.length} entries; expected ${base.length}`)
    base.forEach((item, index) => compare(item, candidate[index], `${path}[${index}]`, language))
    return
  }

  if (base && typeof base === 'object') {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      errors.push(`${language}: ${path} must be an object`)
      return
    }
    const baseKeys = Object.keys(base).sort()
    const candidateKeys = Object.keys(candidate).sort()
    if (baseKeys.join('|') !== candidateKeys.join('|')) {
      errors.push(`${language}: ${path} keys differ from the Polish source`)
    }
    baseKeys.forEach((key) => compare(base[key], candidate[key], path ? `${path}.${key}` : key, language))
    return
  }

  if (typeof base !== typeof candidate) {
    errors.push(`${language}: ${path} has type ${typeof candidate}; expected ${typeof base}`)
    return
  }

  if (typeof base === 'string') {
    const expected = placeholders(base).join('|')
    const actual = placeholders(candidate).join('|')
    if (expected !== actual) errors.push(`${language}: ${path} placeholders differ (${actual || 'none'} vs ${expected || 'none'})`)
  }
}

for (const [language, dictionary] of Object.entries(dictionaries)) compare(pl, dictionary, '', language)

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('i18n dictionaries: OK (pl, en, ru, uk)')
}
