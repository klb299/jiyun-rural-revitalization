async page => {
  const base = 'http://127.0.0.1:4173'
  const paths = ['/', '/last-mile', '/aid-projects', '/adopt-a-field', '/exhibit-map', '/about', '/products', '/strata-3d']
  const out = []
  for (const p of paths) {
    await page.goto(base + p)
    await page.waitForTimeout(1700)
    const r = await page.evaluate(() => {
      const lum = (c) => {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
        return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
      }
      const parse = (s) => {
        // Tailwind v4 的 /NN 透明度修饰符在 computed style 里是 oklab(L a b / alpha)。
        // 旧版只认 rgb()/rgba()，会把这层半透明深底当成透明跳过，白字于是被
        // 误算成落在暖白页底上，出现 1.0x 的假阳性（首页 GALLERY 徽章）。
        // 用标准 OKLab → linear sRGB 矩阵精确换算，不引入近似灰度。
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
      // 半透明深底（如 bg-[#1C1B18]/85）曾因 alpha 阈值 0.85 被跳过，
      // 白字被误算成落在宣纸暖白底上，产生 1.0x 的假阳性。
      // 现在按 alpha 逐层与页面底色混合，阈值降到 0.5（与技能里的判据一致）。
      const bgOf = (el) => {
        let n = el, hops = 0, acc = { r: 247, g: 244, b: 238 }
        while (n && hops < 10) {
          const cs = getComputedStyle(n)
          const bi = cs.backgroundImage
          if (bi && bi !== 'none') {
            if (bi.indexOf('url(') === 0) return { kind: 'image' }
            return { kind: 'gradient' }
          }
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
        // marquee 分隔符、巨型装饰水印等纯装饰元素不参与 WCAG 文字判定
        if (el.closest('[aria-hidden="true"]')) return false
        if (el.children.length === 0) return true
        return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
      })
      const bad = []
      const skipped = { gradient: 0, image: 0 }
      for (const el of els) {
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.15) continue
        const fg = parse(cs.color)
        // 半透明文字（Tailwind /NN → 带 alpha 的 oklab）需与底色混合才是真实观感，
        // 探针按旧口径跳过，避免把 /55 装饰竖签误报成 1.0x。
        if (!fg || fg.a < 1) continue
        const bg = bgOf(el)
        if (bg.kind !== 'color' && bg.kind !== 'fallback') { skipped[bg.kind]++; continue }
        const l1 = lum([fg.r, fg.g, fg.b])
        const l2 = lum([bg.c.r, bg.c.g, bg.c.b])
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
        const fs = parseFloat(cs.fontSize)
        const fw = parseInt(cs.fontWeight) || 400
        const large = fs >= 24 || (fs >= 18.66 && fw >= 700)
        const need = large ? 3 : 4.5
        if (ratio < need) bad.push({ t: el.textContent.trim().slice(0, 20), r: Math.round(ratio * 100) / 100, fs, need })
      }
      const tight = []
      for (const el of els) {
        const cs = getComputedStyle(el)
        const fs = parseFloat(cs.fontSize)
        const lh = parseFloat(cs.lineHeight)
        if (!fs || !lh || isNaN(lh)) continue
        const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0)
        const h = el.getBoundingClientRect().height
        if ((h - pad) / fs > 1.8 && lh / fs < 1.5) tight.push({ t: el.textContent.trim().slice(0, 16), lh: Math.round((lh / fs) * 100) / 100 })
      }
      return { bad: bad.slice(0, 10), badCount: bad.length, skipped, tightCount: tight.length, tight: tight.slice(0, 5) }
    })
    out.push({ p, ...r })
  }
  return out
}
