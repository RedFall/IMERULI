import { readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const [, , inputPath, outputPath, qualityArgument = '.86'] = process.argv
if (!inputPath || !outputPath) {
  throw new Error('Usage: node scripts/convert-image-webp.mjs <input.png> <output.webp> [quality]')
}

const quality = Number(qualityArgument)
if (!Number.isFinite(quality) || quality <= 0 || quality > 1) {
  throw new Error('Quality must be a number greater than 0 and at most 1')
}

const input = await readFile(inputPath)
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})

try {
  const page = await browser.newPage()
  const encoded = await page.evaluate(async ({ dataUrl, quality }) => {
    const image = new Image()
    image.src = dataUrl
    await image.decode()

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Canvas 2D context is unavailable')
    context.drawImage(image, 0, 0)

    const sourcePixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    let sourceTransparentPixels = 0
    for (let index = 3; index < sourcePixels.length; index += 4) {
      if (sourcePixels[index] === 0) sourceTransparentPixels++
    }

    const webpUrl = canvas.toDataURL('image/webp', quality)
    const verificationImage = new Image()
    verificationImage.src = webpUrl
    await verificationImage.decode()
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(verificationImage, 0, 0)
    const outputPixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    let outputTransparentPixels = 0
    for (let index = 3; index < outputPixels.length; index += 4) {
      if (outputPixels[index] === 0) outputTransparentPixels++
    }

    return {
      base64: webpUrl.slice(webpUrl.indexOf(',') + 1),
      width: canvas.width,
      height: canvas.height,
      sourceTransparentPixels,
      outputTransparentPixels,
    }
  }, { dataUrl: `data:image/png;base64,${input.toString('base64')}`, quality })

  const output = Buffer.from(encoded.base64, 'base64')
  await writeFile(outputPath, output)
  console.log({
    inputPath,
    outputPath,
    width: encoded.width,
    height: encoded.height,
    sourceTransparentPixels: encoded.sourceTransparentPixels,
    outputTransparentPixels: encoded.outputTransparentPixels,
    inputBytes: input.length,
    outputBytes: output.length,
  })
}
finally {
  await browser.close()
}
