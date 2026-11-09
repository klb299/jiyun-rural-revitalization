async page => {
  const shot = 'D:/项目/wangyedazuoye/.workbuddy/shots/'
  const out = { errors: [] }
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') out.errors.push(m.type() + ': ' + m.text())
  })
  page.on('pageerror', e => out.errors.push('pageerror: ' + e.message))

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://127.0.0.1:4173/science')
  await page.waitForTimeout(1400)

  // 切到第 4 个实验
  const tab = page.getByRole('button', { name: /秸秆覆盖免耕/ }).first()
  out.tabFound = await tab.count()
  await tab.click()
  await page.waitForTimeout(2600)

  out.default = await page.evaluate(() => ({
    heading: document.body.textContent.includes('秸秆覆盖免耕'),
    panel: document.body.textContent.includes('RESIDUE COVER'),
    fallbackVisible: document.body.textContent.includes('STATIC PLATE'),
    canvas: (() => {
      const c = document.querySelector('canvas')
      return c ? { w: c.width, h: c.height } : null
    })(),
    readout: (document.body.textContent.match(/下渗\s*\d+%/) || [])[0] || null
  }))
  await page.screenshot({ path: shot + 'notill-60.png' })

  // 覆盖率拉到 0，检查读数与场景响应
  await page.evaluate(() => {
    const el = document.querySelector('input[aria-label="秸秆覆盖率"]')
    if (!el) return
    el.value = '0'
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await page.waitForTimeout(1200)
  out.cover0 = await page.evaluate(() => ({
    infil: (document.body.textContent.match(/下渗\s*\d+%/) || [])[0] || null,
    runoff: (document.body.textContent.match(/径流\s*\d+%/) || [])[0] || null,
    label: (document.body.textContent.match(/0%/) || [])[0] || null
  }))
  await page.screenshot({ path: shot + 'notill-0.png' })

  // 拉到 90
  await page.evaluate(() => {
    const el = document.querySelector('input[aria-label="秸秆覆盖率"]')
    if (!el) return
    el.value = '90'
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await page.waitForTimeout(1200)
  out.cover90 = await page.evaluate(() => ({
    infil: (document.body.textContent.match(/下渗\s*\d+%/) || [])[0] || null,
    runoff: (document.body.textContent.match(/径流\s*\d+%/) || [])[0] || null
  }))
  await page.screenshot({ path: shot + 'notill-90.png' })

  // 切回第一个实验，确认场景切换无残留错误
  await page.getByRole('button', { name: /黑土团粒与孔隙/ }).first().click()
  await page.waitForTimeout(1400)
  out.backToSoil = await page.evaluate(() => document.body.textContent.includes('SELECT A STRUCTURE'))

  return out
}
