async page => {
  const out = { errors: [], structures: [] }
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') out.errors.push(m.type() + ': ' + m.text())
  })
  page.on('pageerror', e => out.errors.push('pageerror: ' + e.message))

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://127.0.0.1:4173/science')
  await page.waitForTimeout(1400)
  await page.getByRole('button', { name: /北斗 RTK 定位原理/ }).first().click()
  await page.waitForTimeout(2400)

  out.canvas = await page.evaluate(() => {
    const c = document.querySelector('canvas')
    return c ? { w: c.width, h: c.height } : null
  })
  out.fallbackVisible = await page.evaluate(() => document.body.textContent.includes('STATIC PLATE'))

  // 四类结构卡存在且说明联动
  const checks = [
    ['北斗卫星', '六颗卫星按可见数量增减'],
    ['地面基准站', '位置早就测准的三脚架机箱'],
    ['农机移动站', '红色机罩'],
    ['作业轨迹', '金色计划线笔直']
  ]
  for (const [name, keyword] of checks) {
    const b = page.getByRole('button', { name: new RegExp(name) }).first()
    const found = await b.count()
    let desc = false
    if (found) {
      await b.click()
      await page.waitForTimeout(500)
      desc = await page.evaluate(k => document.body.textContent.includes(k), keyword)
    }
    out.structures.push({ name, found, desc })
  }

  // 卫星数量与遮挡参数仍可用
  const ranges = await page.locator('input[type=range]').count()
  out.ranges = ranges
  const blockBtn = page.getByRole('button', { name: /让林带挡住改正信号/ })
  if (await blockBtn.count()) {
    await blockBtn.first().click()
    await page.waitForTimeout(800)
    out.blocked = await page.evaluate(() => document.body.textContent.includes('± 1.2 m'))
    await page.getByRole('button', { name: /移开林带，恢复改正信号/ }).first().click()
    await page.waitForTimeout(700)
  }
  out.restored = await page.evaluate(() => document.body.textContent.includes('± 2.5 cm'))

  // 切回实验一，确认场景没有残留
  await page.getByRole('button', { name: /黑土团粒与孔隙/ }).first().click()
  await page.waitForTimeout(1600)
  out.backToSoil = await page.evaluate(() => document.body.textContent.includes('团粒结构'))

  return out
}
