async page => {
  // 可访问性与中等宽度自查：补现有探针（320/390/430、对比度、死链）的盲区
  const base = 'http://127.0.0.1:4173'
  const out = {}
  const paths = ['/', '/exhibit-map', '/about', '/admin', '/sandbox-3d', '/last-mile']

  // 1. 平板 / 桌面宽度横向溢出
  out.overflow = []
  for (const w of [768, 1024, 1280, 1920]) {
    await page.setViewportSize({ width: w, height: 900 })
    for (const p of paths) {
      await page.goto(base + p)
      await page.waitForTimeout(450)
      const r = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth
      }))
      if (r.sw > r.cw + 1) out.overflow.push({ w, p, ...r })
    }
  }

  // 2. 可访问名称 / skip-link / alt
  await page.setViewportSize({ width: 1440, height: 900 })
  out.a11y = []
  for (const p of ['/', '/about', '/admin', '/adopt-a-field', '/science', '/exhibit-map']) {
    await page.goto(base + p)
    await page.waitForTimeout(650)
    out.a11y.push({ p, ...await page.evaluate(() => {
      const visible = (e) => {
        const cs = getComputedStyle(e)
        const r = e.getBoundingClientRect()
        return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0
      }
      const unnamedButtons = [...document.querySelectorAll('button')].filter(visible)
        .filter(b => !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length
      const unlabeledInputs = [...document.querySelectorAll('input:not([type=hidden]),textarea,select')]
        .filter(visible)
        .filter(i => !i.getAttribute('aria-label') && !(i.labels && i.labels.length) && !i.getAttribute('placeholder')).length
      const imgsNoAlt = [...document.querySelectorAll('img')].filter(i => !i.getAttribute('alt')).length
      const skip = document.querySelector('.skip-link')
      const ranges = [...document.querySelectorAll('input[type=range]')].filter(visible)
        .filter(i => !i.getAttribute('aria-label') && !(i.labels && i.labels.length)).length
      return { unnamedButtons, unlabeledInputs, imgsNoAlt, unnamedRanges: ranges, skipLink: !!skip }
    }) })
  }

  // 3. reduced-motion：入场元素不能停留在隐藏态
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(base + '/')
  await page.waitForTimeout(500)
  out.reducedMotion = await page.evaluate(() => {
    const els = [...document.querySelectorAll('.reveal,.kin-char')]
    const hidden = els.filter(e => {
      const cs = getComputedStyle(e)
      return parseFloat(cs.opacity) < 0.99 || (cs.filter && cs.filter !== 'none')
    })
    return { total: els.length, hidden: hidden.length }
  })
  await page.emulateMedia({ reducedMotion: 'no-preference' })

  // 4. 路由 meta 是否随页面更新（SPA 常见漏洞）
  out.meta = []
  for (const p of ['/', '/exhibit-map', '/about', '/admin', '/no-such-page']) {
    await page.goto(base + p)
    await page.waitForTimeout(500)
    out.meta.push(await page.evaluate(() => ({
      url: location.pathname,
      title: document.title,
      desc: (document.querySelector('meta[name="description"]') || {}).content || ''
    })))
  }

  // 5. 首屏资源与实际加载
  await page.goto(base + '/')
  await page.waitForTimeout(1000)
  out.perf = await page.evaluate(() => {
    const r = performance.getEntriesByType('resource')
    return {
      resources: r.length,
      scripts: r.filter(x => x.initiatorType === 'script').length,
      transferKB: Math.round(r.reduce((a, b) => a + (b.transferSize || 0), 0) / 1024),
      largest: r.map(x => ({ n: x.name.split('/').pop(), kb: Math.round((x.transferSize || 0) / 1024) }))
        .sort((a, b) => b.kb - a.kb).slice(0, 5)
    }
  })

  return out
}
