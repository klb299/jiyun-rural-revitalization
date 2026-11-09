async page => {
  const shot = 'D:/项目/wangyedazuoye/.workbuddy/shots/'
  const out = { errors: [], focuses: [] }
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') out.errors.push(m.type() + ': ' + m.text())
  })
  page.on('pageerror', e => out.errors.push('pageerror: ' + e.message))

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://127.0.0.1:4173/science')
  await page.waitForTimeout(1500)

  for (const name of ['团粒结构', '孔隙与蚯蚓通道', '菌丝与微生物', '钙质结核']) {
    const btn = page.getByRole('button', { name: new RegExp(name) }).first()
    const found = await btn.count()
    if (found) { await btn.click(); await page.waitForTimeout(650) }
    out.focuses.push({ name, found })
  }

  // 回到团粒结构再截图
  await page.getByRole('button', { name: /团粒结构/ }).first().click()
  await page.waitForTimeout(800)
  await page.evaluate(() => {
    const c = document.querySelector('canvas')
    const box = c?.closest('.bezel-core') || c
    if (box) box.scrollIntoView({ block: 'center', behavior: 'instant' })
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: shot + 'soil-fine.png' })

  out.canvas = await page.evaluate(() => {
    const c = document.querySelector('canvas')
    return c ? { w: c.width, h: c.height } : null
  })
  out.fallbackVisible = await page.evaluate(() => document.body.textContent.includes('STATIC PLATE'))
  return out
}
