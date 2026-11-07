async page => {
  // 低对比元素定位探针：输出颜色、类名与文本，便于精确定位而不是靠截图猜。
  // 与 audit-contrast.js 共用同一套亮度/背景判定规则。
  const base = 'http://127.0.0.1:4173'
  const paths = ['/', '/last-mile', '/aid-projects', '/adopt-a-field', '/exhibit-map', '/about', '/products',
    '/strata-3d', '/machinery-3d', '/sandbox-3d', '/science', '/journey', '/chagan-lake',
    '/solar-terms', '/dashboard', '/farm-income', '/admin']
  const out = []
  for (const p of paths) {
    await page.goto(base + p)
    await page.waitForTimeout(1400)
    const r = await page.evaluate(() => {
      const lum = (c) => {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
        return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
      }
      const parse = (s) => {
        // 与 audit-contrast.js 一致：支持 Tailwind v4 生成的 oklab(L a b / alpha)。
        const ok = s.match(/oklab\(\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)(?:\s*\/\s*([-\d.]+))?\s*\)/)
        if (ok) {
          const L = +ok[1], a = +ok[2], b = +ok[3]
          const l_ = L + 0.3963377774 * a + 0.2158037573 * b
          const m_ = L - 0.1055613458 * a - 0.0638541728 * b
          const s_ = L - 0.0894841775 * a - 1.2914855480 * b
          const l = l_ ** 3, m = m_ ** 3, ss = s_ ** 3
          const enc = (v) => {
            v = Math.max(0, Math.min(1, v))
            return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)
          }
          return {
            r: enc(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * ss),
            g: enc(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * ss),
            b: enc(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * ss),
            a: ok[4] !== undefined ? +ok[4] : 1
          }
        }
        const m = s.match(/rgba?\(([^)]+)\)/)
        if (!m) return null
        const a = m[1].split(',').map(Number)
        return { r: a[0], g: a[1], b: a[2], a: a.length > 3 ? a[3] : 1 }
      }
      const bgOf = (el) => {
        let n = el, hops = 0, acc = { r: 247, g: 244, b: 238 }
        while (n && hops < 10) {
          const cs = getComputedStyle(n)
          const bi = cs.backgroundImage
          if (bi && bi !== 'none') return { kind: bi.indexOf('url(') === 0 ? 'image' : 'gradient' }
          const c = parse(cs.backgroundColor)
          if (c && c.a > 0) {
            acc = {
              r: c.r * c.a + acc.r * (1 - c.a),
              g: c.g * c.a + acc.g * (1 - c.a),
              b: c.b * c.a + acc.b * (1 - c.a)
            }
            if (c.a >= 0.5) return { kind: 'color', c: acc }
          }
          n = n.parentElement
          hops++
        }
        return { kind: 'fallback', c: acc }
      }
      const els = [...document.querySelectorAll('body *')].filter((el) => {
        if (!el.textContent || !el.textContent.trim()) return false
        // 与 audit-contrast.js 同一口径：跳过纯装饰元素
        if (el.closest('[aria-hidden="true"]')) return false
        if (el.children.length === 0) return true
        return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
      })
      const bad = []
      for (const el of els) {
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.15) continue
        const fg = parse(cs.color)
        // 半透明文字按旧口径跳过，避免误报
        if (!fg || fg.a < 1) continue
        const bg = bgOf(el)
        if (bg.kind !== 'color' && bg.kind !== 'fallback') continue
        const l1 = lum([fg.r, fg.g, fg.b]), l2 = lum([bg.c.r, bg.c.g, bg.c.b])
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
        const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight) || 400
        const need = fs >= 24 || (fs >= 18.66 && fw >= 700) ? 3 : 4.5
        if (ratio < need) {
          bad.push({
            t: el.textContent.trim().slice(0, 18),
            r: Math.round(ratio * 100) / 100,
            color: cs.color,
            bg: `rgb(${bg.c.r}, ${bg.c.g}, ${bg.c.b})`,
            cls: (typeof el.className === 'string' ? el.className : '').slice(0, 110)
          })
        }
      }
      // 同类元素只留一条，避免逐字标题刷屏
      const seen = new Set()
      return bad.filter((b) => {
        const k = b.color + '|' + b.bg + '|' + b.cls
        if (seen.has(k)) return false
        seen.add(k)
        return true
      }).slice(0, 30)
    })
    if (r.length) out.push({ p, items: r })
  }
  return out
}
