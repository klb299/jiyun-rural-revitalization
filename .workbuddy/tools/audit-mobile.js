async page => {
  const base = 'http://127.0.0.1:4173'
  const paths = ['/', '/last-mile', '/aid-projects', '/adopt-a-field', '/exhibit-map', '/about', '/products', '/strata-3d', '/admin']
  const sizes = [[320, 720], [390, 844], [430, 932]]
  const out = []
  for (const [w, h] of sizes) {
    await page.setViewportSize({ width: w, height: h })
    for (const p of paths) {
      await page.goto(base + p)
      await page.waitForTimeout(1000)
      const r = await page.evaluate(() => {
        const de = document.documentElement
        const overflow = de.scrollWidth > de.clientWidth + 1
        const smallTargets = [...document.querySelectorAll('a, button, [role=button], select')]
          .filter((el) => {
            const cs = getComputedStyle(el)
            if (cs.display === 'none' || cs.visibility === 'hidden') return false
            const r = el.getBoundingClientRect()
            if (!(r.width > 0 && r.height > 0 && r.height < 36)) return false
            // 段落 / 列表里的行内文字链接属于 WCAG 2.5.8 的行内豁免，
            // 不按独立控件计算，否则 15px 的行高会把真实控件问题淹没。
            if (el.tagName === 'A' && r.height < 24) return false
            return true
          })
          .map((el) => ({ t: (el.textContent || '').trim().slice(0, 12), h: Math.round(el.getBoundingClientRect().height) }))
        const smallInputs = [...document.querySelectorAll('input:not([type=range]):not([type=checkbox]), textarea, select')]
          .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
          .map((el) => ({ tag: el.tagName, fs: parseFloat(getComputedStyle(el).fontSize) }))
        return {
          overflow,
          targetCount: smallTargets.length,
          targets: smallTargets.slice(0, 5),
          inputCount: smallInputs.length,
          inputs: smallInputs.slice(0, 3)
        }
      })
      if (r.overflow || r.targetCount || r.inputCount) out.push({ size: w + 'x' + h, p, ...r })
    }
  }
  return out
}
