import { nextTick } from 'vue'

/**
 * 原生 View Transitions 的最小渐进增强。
 * 只在首页「从一米黑土开始 / 俯瞰松辽平原」两个 CTA 上启用；
 * 不支持的浏览器与「减少动态效果」偏好直接回退到普通 router.push。
 * 想还原这次改动：删掉本文件、style.css 里的 View Transitions 段、两个视图里的 hero-seed class 与 click 包装。
 */
export function navigateWithViewTransition(router, to) {
  const reduce = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (typeof document === 'undefined' || !document.startViewTransition || reduce) {
    return router.push(to)
  }
  const html = document.documentElement
  // 注意：vt-active 必须在旧快照截完之后（即 updateCallback 内）才加，
  // 否则旧页面里尚未入场的 Reveal 会突然全部显形，造成跳变
  const transition = document.startViewTransition(async () => {
    html.classList.add('vt-active')
    await router.push(to)
    // 等 Vue 把新视图 patch 完再让浏览器截新快照。
    // 注意：这里不能用 requestAnimationFrame —— VT 的 updateCallback 期间浏览器暂停产帧，
    // 等 rAF 会与 callback 互相等待，Chrome 会以「DOM update timed out」直接放弃过渡。
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  // 多留一拍再恢复 Reveal 的常规入场，避免伪元素动画跑完前新页元素又闪回半透明
  transition.finished.finally(() => {
    window.setTimeout(() => html.classList.remove('vt-active'), 650)
  })
  return transition
}
