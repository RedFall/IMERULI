import { mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const sourceDirectory = 'tmp/screens/hero-breakpoint-audit'
const outputDirectory = 'tmp/screens/hero-breakpoint-sheets'
await mkdir(outputDirectory, { recursive: true })

const viewports = ['desktop-wide', 'desktop', 'tablet-landscape', 'tablet-portrait', 'tablet-small', 'mobile-small', 'mobile', 'mobile-large', 'phone-landscape']
const frames = ['intro', 'intro-depth', 'transition-start', 'transition', 'finale-reveal', 'finale', 'finale-depth', 'end']

const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
try {
  for (const viewport of viewports) {
    const items = []
    for (const frame of frames) {
      const buffer = await readFile(join(sourceDirectory, `${viewport}-${frame}.png`))
      items.push({ frame, src: `data:image/png;base64,${buffer.toString('base64')}` })
    }
    const page = await browser.newPage({ viewport: { width: 1680, height: 1000 }, deviceScaleFactor: 1 })
    await page.setContent(`<!doctype html><style>
      *{box-sizing:border-box}body{margin:0;padding:16px;background:#171411;color:#f3ebdd;font:12px Arial,sans-serif}
      h1{margin:0 0 12px;font-size:18px}main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
      figure{margin:0;padding:5px;background:#29241f;border:1px solid #51483f}img{display:block;width:100%;height:330px;object-fit:contain;background:#0e0d0c}
      figcaption{padding:7px 2px 1px;text-transform:uppercase;letter-spacing:.07em}
    </style><h1>${viewport}</h1><main>${items.map(({ frame, src }) => `<figure><img src="${src}"><figcaption>${frame}</figcaption></figure>`).join('')}</main>`)
    await page.screenshot({ path: join(outputDirectory, `${viewport}.png`), fullPage: true })
    await page.close()
  }
}
finally { await browser.close() }
