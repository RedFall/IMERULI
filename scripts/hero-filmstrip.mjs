import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const outputDirectory = 'tmp/screens/hero-filmstrip'
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

const progressFrames = [0, .06, .12, .18, .24, .3, .36, .42, .48, .54, .6, .66, .72, .78, .84, .9, .93, .95, .97, 1]

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, reducedMotion: 'no-preference', deviceScaleFactor: 1 })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.addInitScript(() => localStorage.setItem('imeruli-cookie-consent', 'necessary'))
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  await page.locator('#top').waitFor()
  const travel = await page.locator('#top').evaluate((node) => node.getBoundingClientRect().height - window.innerHeight)
  const diagnostics = []

  for (const [index, progress] of progressFrames.entries()) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'auto' }), travel * progress)
    await page.waitForTimeout(180)
    await page.screenshot({ path: `${outputDirectory}/${viewport.name}-${String(index).padStart(2, '0')}.png`, fullPage: false })
    diagnostics.push(await page.evaluate((progress) => ({
      progress,
      scenes: Array.from(document.querySelectorAll('.narrative-scene')).map((scene) => {
        const rect = scene.getBoundingClientRect()
        return {
          className: scene.className,
          opacity: Number(getComputedStyle(scene).opacity),
          rect: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.right), Math.round(rect.bottom)],
        }
      }).filter((scene) => scene.opacity > .03),
    }), progress))
  }

  console.log(JSON.stringify({ viewport, pageErrors, diagnostics }))
  await context.close()
}

await browser.close()
