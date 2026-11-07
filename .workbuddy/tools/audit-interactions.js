async page => {
  const base = 'http://127.0.0.1:4173'
  const shot = 'D:/项目/wangyedazuoye/.workbuddy/shots/'
  const out = { motions: {}, about: null, stage: null, errors: [] }

  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') out.errors.push(m.type() + ': ' + m.text())
  })
  page.on('pageerror', e => out.errors.push('pageerror: ' + e.message))

  const cases = [
    ['/', 'default'], ['/strata-3d', 'fast'], ['/machinery-3d', 'fast'],
    ['/sandbox-3d', 'fast'], ['/aid-projects', 'reverse'], ['/adopt-a-field', 'reverse'],
    ['/farm-income', 'reverse'], ['/last-mile', 'quiet'], ['/about', 'calm'],
    ['/exhibit-map', 'default']
  ]
  for (const [p, expect] of cases) {
    await page.goto(base + p)
    await page.waitForTimeout(450)
    const got = await page.evaluate(() => document.querySelector('main[data-motion]')?.dataset.motion)
    out.motions[p] = got === expect ? 'OK' : `MISMATCH expect=${expect} got=${got}`
  }

  // 白皮书附录 A 折叠交互
  await page.goto(base + '/about')
  await page.waitForTimeout(900)
  const before = await page.evaluate(() =>
    [...document.querySelectorAll('button')].find(b => /展开全部|收起，只看/.test(b.textContent))?.textContent.trim() || null)
  if (before) {
    await page.getByRole('button', { name: /展开全部|收起，只看/ }).click()
    await page.waitForTimeout(400)
    const after = await page.evaluate(() =>
      [...document.querySelectorAll('button')].find(b => /展开全部|收起，只看/.test(b.textContent))?.textContent.trim() || null)
    out.about = { before, after, toggled: before !== after }
  }

  // 3D 舞台装裱
  await page.goto(base + '/strata-3d')
  await page.waitForTimeout(2600)
  out.stage = await page.evaluate(() => ({
    frames: document.querySelectorAll('.stage-frame').length,
    corners: document.querySelectorAll('.stage-corner').length
  }))

  // 截图：展览地图桌面 / 移动、首页按钮修复
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(base + '/exhibit-map')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: shot + 'exhibit-map-desktop.png' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: shot + 'exhibit-map-mobile.png' })
  await page.goto(base + '/')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.63))
  await page.waitForTimeout(900)
  await page.screenshot({ path: shot + 'home-buttons.png' })

  return out
}
