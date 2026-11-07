/**
 * 共享 Canvas 纹理缓存
 *
 * 独立成无 Three.js 依赖的模块，让后台管理页可以查询与释放缓存，
 * 而不必为了一个按钮把整个 Three.js chunk 拉进后台首屏。
 * 纹理用 duck typing 识别（isTexture / dispose），不 import three。
 */

export const texCache = new Map()

/** 缓存统计，用于后台的显存维护面板 */
export function sharedTextureStats() {
  let textures = 0
  let bytes = 0
  texCache.forEach((entry) => {
    if (!entry) return
    const list = entry.isTexture ? [entry] : Object.values(entry)
    list.forEach((t) => {
      if (!t || !t.isTexture) return
      textures += 1
      const w = t.image?.width || 0
      const h = t.image?.height || 0
      // RGBA 四通道，mipmap 额外约占三分之一
      bytes += w * h * 4 * (t.generateMipmaps ? 1.33 : 1)
    })
  })
  return {
    groups: texCache.size,
    textures,
    mb: Number((bytes / 1048576).toFixed(2))
  }
}

/**
 * 释放全部共享纹理。
 * 只应在没有任何 3D 场景正在渲染时调用，释放后下次进入展厅会自动重建。
 */
export function disposeSharedTextures() {
  let released = 0
  texCache.forEach((entry) => {
    if (!entry) return
    if (entry.isTexture) {
      entry.dispose?.()
      released += 1
    } else {
      Object.values(entry).forEach((t) => {
        if (t && t.dispose) {
          t.dispose()
          released += 1
        }
      })
    }
  })
  texCache.clear()
  return released
}
