import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const outputDirectory = 'tmp/screens/hero-breakpoint-audit'
await mkdir(outputDirectory, { recursive: true })

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})

const viewports = [
  { name: 'desktop-wide', width: 1920, height: 1080 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'tablet-portrait', width: 820, height: 1180 },
  { name: 'tablet-small', width: 768, height: 1024 },
  { name: 'mobile-small', width: 360, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-large', width: 430, height: 932 },
  { name: 'phone-landscape', width: 844, height: 390 },
]

const frames = [
  ['intro', .015],
  ['intro-depth', .18],
  ['transition-start', .34],
  ['transition', .5],
  ['finale-reveal', .65],
  ['finale', .82],
  ['finale-depth', .94],
  ['end', .99],
]

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, reducedMotion: 'no-preference', deviceScaleFactor: 1 })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.addInitScript(() => localStorage.setItem('imeruli-cookie-consent', 'necessary'))
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  await page.locator('#top').waitFor()
  const travel = await page.locator('#top').evaluate((node) => node.getBoundingClientRect().height - window.innerHeight)

  for (const [name, progress] of frames) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'auto' }), travel * progress)
    await page.waitForTimeout(220)
    await page.screenshot({ path: `${outputDirectory}/${viewport.name}-${name}.png`, fullPage: false })
  }

  const diagnostics = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    heroHeight: Math.round(document.querySelector('#top')?.getBoundingClientRect().height ?? 0),
    headerHeight: Math.round(document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0),
  }))
  console.log(viewport.name, { ...diagnostics, pageErrors })
  await context.close()
}

await browser.close()
