async page => {
  const base = 'http://127.0.0.1:4173'
  const paths = ['/', '/strata-3d', '/machinery-3d', '/sandbox-3d', '/dashboard', '/journey', '/chagan-lake', '/solar-terms', '/products', '/aid-projects', '/adopt-a-field', '/farm-income', '/last-mile', '/exhibit-map', '/about', '/science', '/admin']
  const known = new Set(paths)
  const links = new Set()
  const missingAlt = []
  const emptySections = []
  for (const p of paths) {
    await page.goto(base + p)
    await page.waitForTimeout(900)
    const r = await page.evaluate(() => {
      const hrefs = [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href'))
      const imgs = [...document.querySelectorAll('img')].filter((i) => !i.getAttribute('alt')).map((i) => i.getAttribute('src'))
      const secs = [...document.querySelectorAll('main section')].filter((s) => !s.textContent.trim()).length
      return { hrefs, imgs, secs }
    })
    r.hrefs.forEach((h) => links.add(h.split('#')[0]))
    if (r.imgs.length) missingAlt.push({ p, imgs: r.imgs })
    if (r.secs) emptySections.push({ p, n: r.secs })
  }
  const broken = [...links].filter((h) => h && !known.has(h) && h !== '/no-such-page')
  return { totalLinks: links.size, broken, missingAlt, emptySections }
}
