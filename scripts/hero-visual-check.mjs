import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const outputDirectory = 'tmp/screens/hero-remediation'
await mkdir(outputDirectory, { recursive: true })

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
]

const frames = [
  ['intro', .015],
  ['table', .25],
  ['table-exit', .36],
  ['table-oven-handoff', .39],
  ['oven-reveal', .405],
  ['oven-entry', .42],
  ['oven', .49],
  ['oven-exit', .6],
  ['cellar-entry', .63],
  ['cellar-settle', .66],
  ['cellar', .72],
  ['portal', .91],
  ['crossfade-a', .93],
  ['crossfade-b', .95],
  ['crossfade-c', .97],
  ['interior', .985],
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
    await page.waitForTimeout(260)
    await page.screenshot({ path: `${outputDirectory}/${viewport.name}-${name}.png`, fullPage: false })
  }

  const diagnostics = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    heroHeight: document.querySelector('#top')?.getBoundingClientRect().height,
    viewport: [window.innerWidth, window.innerHeight],
  }))
  console.log(viewport.name, { ...diagnostics, pageErrors })
  await context.close()
}

await browser.close()
