import { chromium } from 'playwright-core'

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})

for (const viewport of [{ name: 'desktop', width: 1440, height: 1100 }, { name: 'mobile', width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.addInitScript(() => localStorage.setItem('imeruli-cookie-consent', 'necessary'))
  await page.goto('http://127.0.0.1:4173/#menu', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  const diagnostics = await page.evaluate(() => {
    const menu = document.querySelector('#menu')
    const book = document.querySelector('.menu-book')
    return {
      scrollY: window.scrollY,
      menuTop: menu?.getBoundingClientRect().top,
      bookTop: book?.getBoundingClientRect().top,
      bookHeight: book?.getBoundingClientRect().height,
      state: book?.className,
      bodyHeight: document.body.scrollHeight,
    }
  })
  console.log(viewport.name, { ...diagnostics, pageErrors })
  await page.screenshot({ path: `tmp/screens/${viewport.name}-playwright.png`, fullPage: false })

  for (const section of ['story', 'reviews', 'contact']) {
    await page.locator(`#${section}`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `tmp/screens/${viewport.name}-${section}.png`, fullPage: false })
  }

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  const heroHeight = await page.locator('#top').evaluate((node) => node.getBoundingClientRect().height - window.innerHeight)
  for (const [name, progress] of [['mountains', .16], ['objects', .48], ['fog', .76], ['video', .96]]) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'auto' }), heroHeight * progress)
    await page.waitForTimeout(160)
    await page.screenshot({ path: `tmp/screens/${viewport.name}-hero-${name}.png`, fullPage: false })
  }
  await context.close()
}

await browser.close()
