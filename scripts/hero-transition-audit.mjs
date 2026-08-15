import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const outputDirectory = 'tmp/screens/hero-transition-audit'
await mkdir(outputDirectory, { recursive: true })

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'tablet-portrait', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'phone-landscape', width: 844, height: 390 },
]
const frames = [['pre-portal', .855], ['portal-seed', .87], ['portal-open', .885], ['portal-flight', .91], ['interior-fill', .94]]

const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, reducedMotion: 'no-preference', deviceScaleFactor: 1 })
  const page = await context.newPage()
  await page.addInitScript(() => localStorage.setItem('imeruli-cookie-consent', 'necessary'))
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  const travel = await page.locator('#top').evaluate((node) => node.getBoundingClientRect().height - innerHeight)
  for (const [name, progress] of frames) {
    await page.evaluate((y) => scrollTo(0, y), travel * progress)
    await page.waitForTimeout(220)
    await page.screenshot({ path: `${outputDirectory}/${viewport.name}-${name}.png` })
  }
  await context.close()
}
await browser.close()
