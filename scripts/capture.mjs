// Local capture for the README still and GIF. Not part of CI.
// Needs Playwright's Chromium: `npx playwright install chromium`
// Run against `npm run dev`: `node scripts/capture.mjs`

import { execFileSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const out = new URL('../docs/', import.meta.url)
const videoDir = process.env.VIDEO_DIR ?? '/tmp/keyword-tracker-video'

await mkdir(out, { recursive: true })
await mkdir(videoDir, { recursive: true })

const browser = await chromium.launch()

const still = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
})
const stillPage = await still.newPage()
await stillPage.goto(base, { waitUntil: 'networkidle' })
await stillPage.getByRole('table', { name: /Keyword ranks and events/ }).waitFor()
await stillPage.waitForTimeout(300)
await stillPage.screenshot({ path: new URL('hero.png', out).pathname })
await still.close()

const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
  recordVideo: { dir: videoDir, size: { width: 1280, height: 800 } },
})
await context.addInitScript(() => {
  const boot = () => {
    if (!document.documentElement || document.getElementById('pw-cursor')) return
    const style = document.createElement('style')
    style.textContent =
      '#pw-cursor{position:fixed;z-index:2147483647;left:0;top:0;width:24px;height:24px;pointer-events:none;margin-left:-2px;margin-top:-1px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}'
    document.documentElement.appendChild(style)
    const cursor = document.createElement('div')
    cursor.id = 'pw-cursor'
    cursor.innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 3L5.2 19.2L9.6 14.8L13.6 21.4L16.1 20.1L12 13.4L18.2 13L5 3Z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    document.documentElement.appendChild(cursor)
    document.addEventListener(
      'mousemove',
      (event) => {
        cursor.style.left = `${event.clientX}px`
        cursor.style.top = `${event.clientY}px`
      },
      true,
    )
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})

const page = await context.newPage()
const pause = (ms) => page.waitForTimeout(ms)

async function point(locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('missing target')
  const x = box.x + Math.min(28, box.width / 2)
  const y = box.y + box.height / 2
  await page.mouse.move(x, y, { steps: 16 })
  return { x, y }
}

await page.goto(base, { waitUntil: 'networkidle' })
await page.getByRole('table', { name: /Keyword ranks and events/ }).waitFor()
await page.mouse.move(520, 460)
await pause(900)

const period = page.getByRole('button', { name: /Time period/ })
let spot = await point(period)
await pause(250)
await page.mouse.click(spot.x, spot.y)
await page.getByRole('listbox', { name: 'Time period' }).waitFor()
await pause(520)

const week = page.getByRole('option', { name: /Last 7d/ })
spot = await point(week)
await pause(180)
await page.mouse.click(spot.x, spot.y)
await page.getByRole('button', { name: /Last 7d/ }).waitFor()
await pause(1400)

spot = await point(period)
await pause(160)
await page.mouse.click(spot.x, spot.y)
await page.getByRole('listbox', { name: 'Time period' }).waitFor()
await pause(400)

const twoWeeks = page.getByRole('option', { name: /Last 2w/ })
spot = await point(twoWeeks)
await pause(160)
await page.mouse.click(spot.x, spot.y)
await page.getByRole('button', { name: /Last 2w/ }).waitFor()
await pause(1300)

spot = await point(period)
await pause(160)
await page.mouse.click(spot.x, spot.y)
await page.getByRole('listbox', { name: 'Time period' }).waitFor()
await pause(360)

const threeWeeks = page.getByRole('option', { name: /Last 3w/ })
spot = await point(threeWeeks)
await pause(140)
await page.mouse.click(spot.x, spot.y)
await page.getByRole('button', { name: /Last 3w/ }).waitFor()
await pause(900)

const video = page.video()
await context.close()
await browser.close()
if (!video) throw new Error('no video')
const saved = await video.path()
const gif = new URL('period.gif', out).pathname
execFileSync(
  'ffmpeg',
  [
    '-y',
    '-i',
    saved,
    '-filter_complex',
    'fps=10,scale=1040:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96:stats_mode=diff[p];[s1][p]paletteuse=dither=none:diff_mode=rectangle',
    '-loop',
    '0',
    gif,
  ],
  { stdio: 'inherit' },
)
console.log(new URL('hero.png', out).pathname)
console.log(gif)
