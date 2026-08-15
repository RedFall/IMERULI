import { mkdir, readdir, readFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { chromium } from 'playwright-core'

const sourceDirectory = 'tmp/screens/hero-remediation'
const outputDirectory = 'tmp/screens/hero-contact-sheets'
await mkdir(outputDirectory, { recursive: true })

const order = [
  'intro', 'table', 'table-exit', 'table-oven-handoff',
  'oven-reveal', 'oven-entry', 'oven', 'oven-exit',
  'cellar-entry', 'cellar-settle', 'cellar', 'portal',
  'crossfade-a', 'crossfade-b', 'crossfade-c', 'interior',
]

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})

try {
  const files = await readdir(sourceDirectory)
  for (const viewport of ['desktop', 'tablet', 'mobile']) {
    const images = []
    for (const frame of order) {
      const filename = files.find((file) => file === `${viewport}-${frame}.png`)
      if (!filename) continue
      const buffer = await readFile(join(sourceDirectory, filename))
      const mime = extname(filename) === '.png' ? 'image/png' : 'image/jpeg'
      images.push({ label: basename(filename, extname(filename)), src: `data:${mime};base64,${buffer.toString('base64')}` })
    }

    const page = await browser.newPage({ viewport: { width: 1800, height: 1000 }, deviceScaleFactor: 1 })
    await page.setContent(`<!doctype html><style>
      *{box-sizing:border-box}body{margin:0;padding:18px;background:#181512;color:#f3ebdd;font:12px Arial,sans-serif}
      main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
      figure{margin:0;background:#28231f;border:1px solid #4b433c;padding:6px;overflow:hidden}
      img{display:block;width:100%;height:auto;background:#647d8e}
      figcaption{padding:7px 2px 1px;letter-spacing:.05em}
    </style><main>${images.map(({ label, src }) => `<figure><img src="${src}"><figcaption>${label}</figcaption></figure>`).join('')}</main>`)
    await page.screenshot({ path: join(outputDirectory, `${viewport}.png`), fullPage: true })
    await page.close()
  }
}
finally {
  await browser.close()
}
