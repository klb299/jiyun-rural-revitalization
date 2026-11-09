async page => {
  const shot = 'D:/项目/wangyedazuoye/.workbuddy/shots/'
  const out = { errors: [], stages: [], structures: [] }
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') out.errors.push(m.type() + ': ' + m.text())
  })
  page.on('pageerror', e => out.errors.push('pageerror: ' + e.message))

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://127.0.0.1:4173/science')
  await page.waitForTimeout(1400)
  await page.getByRole('button', { name: /稻作生长五阶段/ }).first().click()
  await page.waitForTimeout(2400)

  out.canvas = await page.evaluate(() => {
    const c = document.querySelector('canvas')
    return c ? { w: c.width, h: c.height } : null
  })
  out.fallbackVisible = await page.evaluate(() => document.body.textContent.includes('STATIC PLATE'))

  // 五阶段时间轴
  for (const name of ['育秧', '分蘖', '抽穗扬花', '灌浆', '成熟收割']) {
    const b = page.getByRole('button', { name: new RegExp('^' + name + '$') }).first()
    const found = await b.count()
    if (found) { await b.click(); await page.waitForTimeout(700) }
    out.stages.push({ name, found })
  }

  // 四类结构聚焦
  for (const name of ['稻株', '水层', '田埂', '灌渠与水位标尺']) {
    const b = page.getByRole('button', { name: new RegExp(name) }).first()
    const found = await b.count()
    if (found) { await b.click(); await page.waitForTimeout(600) }
    out.structures.push({ name, found })
  }
  // 点回稻株再看说明（结构循环最后停在灌渠，不能直接查稻株文案）
  await page.getByRole('button', { name: /稻株/ }).first().click()
  await page.waitForTimeout(600)
  out.riceDesc = await page.evaluate(() => document.body.textContent.includes('分节茎、弧面剑叶'))

  // 回到育秧，截两张
  await page.getByRole('button', { name: /^育秧$/ }).first().click()
  await page.waitForTimeout(1200)
  await page.evaluate(() => {
    const c = document.querySelector('canvas')
    const box = c?.closest('.bezel-core') || c
    if (box) box.scrollIntoView({ block: 'center', behavior: 'instant' })
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: shot + 'rice-seedling.png' })

  await page.getByRole('button', { name: /成熟收割/ }).first().click()
  await page.waitForTimeout(1300)
  await page.screenshot({ path: shot + 'rice-harvest.png' })

  return out
}
