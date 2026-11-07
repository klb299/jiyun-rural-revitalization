async page => {
  const base = 'http://127.0.0.1:4173'
  const shot = 'D:/项目/wangyedazuoye/.workbuddy/shots/'
  const out = { shots: [], errors: [] }
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') out.errors.push(m.type() + ': ' + m.text())
  })
  page.on('pageerror', e => out.errors.push('pageerror: ' + e.message))
  await page.setViewportSize({ width: 1440, height: 900 })

  const scrollTo = (key) => page.evaluate((k) => {
    const el = [...document.querySelectorAll('body *')].find(
      e => e.children.length === 0 && e.textContent.trim().includes(k))
    if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' })
  }, key)

  // 滚到后只等 600ms 就截图：模拟用户「滚到就看」，验证文字不再糊
  const snap = async (path, key, file, wait = 600) => {
    await page.goto(base + path)
    await page.waitForTimeout(500)
    if (key) await scrollTo(key)
    else await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(wait)
    await page.screenshot({ path: shot + file })
    out.shots.push(file)
    return page.evaluate(() => {
      const hidden = [...document.querySelectorAll('.reveal')].filter(r => {
        const cs = getComputedStyle(r)
        const rect = r.getBoundingClientRect()
        return rect.top < innerHeight && rect.bottom > 0 && (parseFloat(cs.opacity) < 0.99 || cs.filter !== 'none')
      })
      return { visibleRevealsNotReady: hidden.length }
    })
  }

  out.home = await snap('/', '看得见', 'fix1-home.png')
  out.strata = await snap('/strata-3d', null, 'fix2-strata.png')
  out.sandboxHero = await snap('/sandbox-3d', null, 'fix3-sandbox-hero.png')
  out.sandboxPlate = await snap('/sandbox-3d', '这里不是', 'fix4-plate.png')
  out.nextChapter = await snap('/sandbox-3d', 'NEXT CHAPTER', 'fix5-next.png')
  out.adopt = await snap('/adopt-a-field', '不写比例', 'fix6-demo.png')

  // 认养页切换交互
  const btn = page.getByRole('button', { name: '模拟真实数据' })
  await btn.click()
  await page.waitForTimeout(500)
  out.mock = await page.evaluate(() => ({
    hasRecord: document.body.textContent.includes('ADOPTION RECORD'),
    hasHolder: document.body.textContent.includes('李慕农'),
    hasDisclaimer: document.body.textContent.includes('均为虚构'),
    pressed: [...document.querySelectorAll('button')].find(b => b.textContent.includes('模拟真实数据'))?.getAttribute('aria-pressed')
  }))
  await page.screenshot({ path: shot + 'fix6-mock.png' })
  out.shots.push('fix6-mock.png')

  out.lastMile = await snap('/last-mile', '解开这三道关卡的', 'fix7-lastmile.png')
  out.exhibitMap = await snap('/exhibit-map', '宏观 · 平原', 'fix8-map.png')

  // admin 导航可见性
  await page.goto(base + '/admin')
  await page.waitForTimeout(800)
  out.admin = await page.evaluate(() => {
    const nav = document.querySelector('.pill-nav')
    const top = document.elementFromPoint(innerWidth / 2, 40)
    return {
      navVisible: !!nav && nav.getBoundingClientRect().top >= 0,
      navTop: nav ? Math.round(nav.getBoundingClientRect().top) : null,
      topElementIsNav: !!(top && top.closest('.pill-nav')),
      topElement: top ? (top.className || '').toString().slice(0, 70) : null
    }
  })
  await page.screenshot({ path: shot + 'fix9-admin.png' })
  out.shots.push('fix9-admin.png')

  // 新图版单独渲染
  await page.goto(base + '/art/diorama.svg')
  await page.waitForTimeout(500)
  await page.screenshot({ path: shot + 'fix10-diorama.png' })
  out.shots.push('fix10-diorama.png')

  return out
}
