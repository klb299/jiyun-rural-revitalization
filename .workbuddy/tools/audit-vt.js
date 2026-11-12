async page => {
  const shot = 'D:/项目/wangyedazuoye/.workbuddy/shots/'
  const out = { errors: [] }
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') out.errors.push(m.type() + ': ' + m.text())
  })
  page.on('pageerror', e => out.errors.push('pageerror: ' + e.message))

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://127.0.0.1:4173/')
  await page.waitForTimeout(1500)
  out.supported = await page.evaluate(() => typeof document.startViewTransition === 'function')
  await page.evaluate(() => {
    window.__vtCount = 0
    window.__vtPreludeAtStart = null
    const orig = document.startViewTransition.bind(document)
    document.startViewTransition = (cb) => {
      window.__vtCount++
      // 定稿回归：VT 截旧快照时入场遮罩必须已经从 DOM 移除
      window.__vtPreludeAtStart = !!document.querySelector('.hero-prelude')
      return orig(cb)
    }
  })

  await page.getByRole('link', { name: /从一米黑土开始/ }).first().click()
  await page.waitForTimeout(160)
  out.vtActiveMid = await page.evaluate(() => document.documentElement.classList.contains('vt-active'))
  out.preludeAtVT = await page.evaluate(() => window.__vtPreludeAtStart)
  await page.screenshot({ path: shot + 'vt-mid.png' })
  await page.waitForTimeout(1400)
  out.url = new URL(page.url()).pathname
  out.vtCount = await page.evaluate(() => window.__vtCount)
  out.vtActiveAfter = await page.evaluate(() => document.documentElement.classList.contains('vt-active'))
  out.heroSeedCount = await page.evaluate(() => document.querySelectorAll('.hero-seed').length)
  await page.screenshot({ path: shot + 'vt-after.png' })

  // 回到首页，验证「减少动态效果」回退
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('http://127.0.0.1:4173/')
  await page.waitForTimeout(1200)
  await page.evaluate(() => {
    window.__vtCount2 = 0
    const orig = document.startViewTransition.bind(document)
    document.startViewTransition = (cb) => { window.__vtCount2++; return orig(cb) }
  })
  await page.getByRole('link', { name: /从一米黑土开始/ }).first().click()
  await page.waitForTimeout(1200)
  out.reducedVtCount = await page.evaluate(() => window.__vtCount2)
  out.reducedUrl = new URL(page.url()).pathname
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  return out
}
