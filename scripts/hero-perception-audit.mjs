import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const outputDirectory = 'tmp/screens/hero-perception-audit'
await mkdir(outputDirectory, { recursive: true })

const stages = [['intro', .015], ['table', .25], ['oven', .49], ['cellar', .72], ['finale', .985]]
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'tablet-portrait', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
]
const modes = [
  ['grayscale', '.hero-stage{filter:grayscale(1)!important}'],
  ['silhouette', '.hero-stage{filter:grayscale(1) blur(5px) contrast(1.08)!important;transform:scale(1.012)}'],
]

const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  await page.addInitScript(() => localStorage.setItem('imeruli-cookie-consent', 'necessary'))
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  const travel = await page.locator('#top').evaluate((node) => node.getBoundingClientRect().height - innerHeight)
  for (const [stage, progress] of stages) {
    await page.evaluate((y) => scrollTo(0, y), travel * progress)
    await page.waitForTimeout(180)
    for (const [mode, css] of modes) {
      const style = await page.addStyleTag({ content: css })
      await page.screenshot({ path: `${outputDirectory}/${viewport.name}-${stage}-${mode}.png` })
      await style.evaluate((node) => node.remove())
    }
  }
  await context.close()
}
await browser.close()
