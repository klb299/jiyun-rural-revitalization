/**
 * 一厘米，四十公里 — 浅色艺术馆 3D 材质与几何基础库
 *
 * 全部纹理均由 Canvas 程序化生成，无外部图片依赖，保证构建体积与离线可用性。
 * 纹理带全局缓存并标记 userData.shared，跨展厅复用、由页面统一释放。
 */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { texCache, sharedTextureStats, disposeSharedTextures } from '../lib/textureCache.js'

// 保持对外 API 不变：缓存实现已迁到无 Three.js 依赖的轻量模块
export { sharedTextureStats, disposeSharedTextures }

/* ------------------------------------------------------------------ *
 * 严格锁定的浅色艺术馆色板（禁止回退暗黑荧光）
 * ------------------------------------------------------------------ */
export const PALETTE = {
  canvas: 0xF7F4EE,      // 宣纸暖白
  linen: 0xEFECE6,       // 亚麻燕麦
  ink: 0x1C1B18,         // 深松烟墨
  inkSoft: 0x5A564E,     // 暖岩灰
  inkMute: 0x8C867B,     // 浅砂灰
  gold: 0xC88A32,        // 秋收琥珀金
  moss: 0x2E5A44,        // 长白山苔藓青
  red: 0xB83828,         // 长春工匠赤红
  terracotta: 0x8C583A,  // 黑土陶釉棕
  porcelain: 0xFFFAF2,   // 素烧白瓷
  water: 0x8EBACB,       // 松花江微蓝
  soilTop: 0x221E19,
  soilMid: 0x483B30,
  soilDeep: 0x826E56
}

export const CSS = {
  canvas: '#F7F4EE',
  linen: '#EFECE6',
  ink: '#1C1B18',
  gold: '#C88A32',
  moss: '#2E5A44',
  red: '#B83828'
}

/* ------------------------------------------------------------------ *
 * 确定性随机与无缝值噪声
 * ------------------------------------------------------------------ */
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash2(x, y, seed) {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041)
  n = (n ^ (n >>> 13)) >>> 0
  n = Math.imul(n, 1274126177) >>> 0
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296
}

function wrap(n, p) {
  return ((n % p) + p) % p
}

/** 周期化值噪声，输入 u/v ∈ [0,1)，period 为整数，保证纹理 repeat 无缝 */
function vnoise(u, v, period, seed) {
  const x = u * period
  const y = v * period
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const sx = xf * xf * (3 - 2 * xf)
  const sy = yf * yf * (3 - 2 * yf)
  const x0 = wrap(xi, period)
  const y0 = wrap(yi, period)
  const x1 = wrap(xi + 1, period)
  const y1 = wrap(yi + 1, period)
  const a = hash2(x0, y0, seed)
  const b = hash2(x1, y0, seed)
  const c = hash2(x0, y1, seed)
  const d = hash2(x1, y1, seed)
  return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy
}

/** 分形布朗噪声，结果 0..1 */
export function fbm(u, v, seed = 1, octaves = 4, basePeriod = 4) {
  let amp = 0.5
  let sum = 0
  let norm = 0
  let p = basePeriod
  for (let i = 0; i < octaves; i++) {
    sum += amp * vnoise(u, v, p, seed + i * 101)
    norm += amp
    amp *= 0.5
    p *= 2
  }
  return sum / norm
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const byte = (v) => Math.round(clamp(v) * 255)
const rgb = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]

/* ------------------------------------------------------------------ *
 * Canvas 纹理基础设施
 * ------------------------------------------------------------------ */
function makeCanvas(size) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return canvas
}

function markShared(texture) {
  texture.userData.shared = true
  return texture
}

export function canvasTexture(canvas, { srgb = false, repeat = [1, 1], anisotropy = 8 } = {}) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat[0], repeat[1])
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.anisotropy = anisotropy
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  return markShared(tex)
}

/**
 * 一次遍历生成 color / bump / roughness 三张贴图。
 * sampler(u, v) => { r, g, b, h, rough }  (各分量 0..1)
 */
function makeMapSet(key, size, sampler, options = {}) {
  if (texCache.has(key)) return texCache.get(key)
  const repeat = options.repeat || [1, 1]
  const cColor = makeCanvas(size)
  const cBump = makeCanvas(size)
  const cRough = makeCanvas(size)
  const ctxC = cColor.getContext('2d')
  const ctxB = cBump.getContext('2d')
  const ctxR = cRough.getContext('2d')
  const imgC = ctxC.createImageData(size, size)
  const imgB = ctxB.createImageData(size, size)
  const imgR = ctxR.createImageData(size, size)
  const dc = imgC.data
  const db = imgB.data
  const dr = imgR.data

  for (let y = 0; y < size; y++) {
    const v = y / size
    for (let x = 0; x < size; x++) {
      const u = x / size
      const s = sampler(u, v)
      const i = (y * size + x) * 4
      dc[i] = byte(s.r)
      dc[i + 1] = byte(s.g)
      dc[i + 2] = byte(s.b)
      dc[i + 3] = 255
      const h = byte(s.h)
      db[i] = h; db[i + 1] = h; db[i + 2] = h; db[i + 3] = 255
      const ro = byte(s.rough)
      dr[i] = ro; dr[i + 1] = ro; dr[i + 2] = ro; dr[i + 3] = 255
    }
  }
  ctxC.putImageData(imgC, 0, 0)
  ctxB.putImageData(imgB, 0, 0)
  ctxR.putImageData(imgR, 0, 0)

  const result = {
    map: canvasTexture(cColor, { srgb: true, repeat }),
    bumpMap: canvasTexture(cBump, { repeat }),
    roughnessMap: canvasTexture(cRough, { repeat })
  }
  texCache.set(key, result)
  return result
}

/* ------------------------------------------------------------------ *
 * 具体材质纹理
 * ------------------------------------------------------------------ */

/** 黑土团粒：腐殖斑、矿物点、孔隙与微起伏 */
export function soilMaps(hex, seed = 7, repeat = [2, 2]) {
  const [br, bg, bb] = rgb(hex)
  const key = `soil-${hex}-${seed}-${repeat.join('x')}`
  return makeMapSet(key, 384, (u, v) => {
    const n = fbm(u, v, seed, 5, 5)
    const grain = fbm(u, v, seed + 311, 3, 34)
    const pores = vnoise(u, v, 96, seed + 57)
    const minerals = vnoise(u, v, 48, seed + 823)
    let tone = 0.68 + n * 0.78 + (grain - 0.5) * 0.26
    if (pores > 0.83) tone *= 0.58            // 团粒间孔隙
    if (minerals > 0.94) tone += 0.42         // 石英 / 钙质亮点
    const warm = (minerals > 0.9 ? 1.06 : 1)
    return {
      r: (br * tone * warm) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone * 0.96) / 255,
      h: clamp(0.25 + n * 0.55 + grain * 0.2 - (pores > 0.83 ? 0.22 : 0)),
      rough: clamp(0.78 + (1 - n) * 0.2 + grain * 0.06)
    }
  }, { repeat })
}

/** 亚麻织物：经纬交织 + 纤维毛羽 */
export function linenMaps(repeat = [3, 3]) {
  const [br, bg, bb] = rgb(PALETTE.linen)
  const key = `linen-${repeat.join('x')}`
  return makeMapSet(key, 256, (u, v) => {
    const warp = Math.sin(u * Math.PI * 2 * 72)
    const weft = Math.sin(v * Math.PI * 2 * 72)
    const weave = warp * weft
    const fiber = fbm(u, v, 23, 3, 26)
    const tone = 0.93 + weave * 0.035 + (fiber - 0.5) * 0.09
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone) / 255,
      h: clamp(0.46 + weave * 0.16 + (fiber - 0.5) * 0.18),
      rough: clamp(0.78 + weave * 0.07 + fiber * 0.1)
    }
  }, { repeat })
}

/** 金属拉丝：细密方向性纹理 + 各向异性粗糙度变化 */
export function brushedMaps(hex = PALETTE.gold, repeat = [2, 2]) {
  const [br, bg, bb] = rgb(hex)
  const key = `brushed-${hex}-${repeat.join('x')}`
  return makeMapSet(key, 256, (u, v) => {
    const drift = fbm(u, v, 91, 2, 8) - 0.5
    const line = Math.sin((v + drift * 0.02) * Math.PI * 2 * 220)
    const fine = vnoise(u, v, 256, 417)
    const tone = 0.86 + line * 0.055 + (fine - 0.5) * 0.12
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone) / 255,
      h: clamp(0.5 + line * 0.14 + (fine - 0.5) * 0.12),
      rough: clamp(0.26 + line * 0.09 + fine * 0.16)
    }
  }, { repeat })
}

/** 素烧白瓷：极细釉面斑与温润微起伏 */
export function porcelainMaps(repeat = [2, 2]) {
  const [br, bg, bb] = rgb(PALETTE.porcelain)
  const key = `porcelain-${repeat.join('x')}`
  return makeMapSet(key, 256, (u, v) => {
    const glaze = fbm(u, v, 137, 4, 7)
    const speck = vnoise(u, v, 128, 271)
    const tone = 0.965 + (glaze - 0.5) * 0.07 - (speck > 0.965 ? 0.06 : 0)
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone) / 255,
      h: clamp(0.5 + (glaze - 0.5) * 0.22),
      rough: clamp(0.19 + glaze * 0.14)
    }
  }, { repeat })
}

/** 宣纸 / 磨砂展台：细颗粒与稀疏纤维 */
export function paperMaps(repeat = [4, 4]) {
  const [br, bg, bb] = rgb(PALETTE.canvas)
  const key = `paper-${repeat.join('x')}`
  return makeMapSet(key, 256, (u, v) => {
    const grain = fbm(u, v, 53, 4, 18)
    const fiber = vnoise(u, v, 160, 733)
    const tone = 0.965 + (grain - 0.5) * 0.08 + (fiber > 0.975 ? 0.035 : 0)
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone) / 255,
      h: clamp(0.5 + (grain - 0.5) * 0.3),
      rough: clamp(0.7 + grain * 0.22)
    }
  }, { repeat })
}

/** 展托砂岩 / 亚麻：极细纤维，去掉会被误读成沙丘波纹的年轮条纹 */
export function woodMaps(repeat = [2, 2]) {
  const [br, bg, bb] = rgb(0xDCD3C2)
  const key = `wood-${repeat.join('x')}`
  return makeMapSet(key, 256, (u, v) => {
    const fiber = fbm(u, v, 181, 3, 30)
    const speck = vnoise(u, v, 160, 611)
    const tone = 0.94 + (fiber - 0.5) * 0.055 + (speck > 0.97 ? -0.045 : 0)
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone) / 255,
      h: clamp(0.48 + (fiber - 0.5) * 0.24),
      rough: clamp(0.68 + fiber * 0.14)
    }
  }, { repeat })
}

/** 轮胎橡胶：细密颗粒 */
export function rubberMaps(repeat = [3, 2]) {
  const [br, bg, bb] = rgb(0x24221F)
  const key = `rubber-${repeat.join('x')}`
  return makeMapSet(key, 256, (u, v) => {
    const grain = fbm(u, v, 313, 4, 24)
    const tone = 0.82 + grain * 0.42
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone) / 255,
      h: clamp(0.25 + grain * 0.6),
      rough: clamp(0.78 + grain * 0.2)
    }
  }, { repeat })
}

/** 金色稻垄：条带 + 穗粒噪点 */
export function ridgeMaps(hex = PALETTE.gold, repeat = [4, 1]) {
  const [br, bg, bb] = rgb(hex)
  const key = `ridge-${hex}-${repeat.join('x')}`
  return makeMapSet(key, 256, (u, v) => {
    const rows = Math.sin(v * Math.PI * 2 * 26)
    const grain = fbm(u, v, 97, 4, 22)
    const tone = 0.8 + rows * 0.13 + grain * 0.3
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone) / 255,
      h: clamp(0.35 + rows * 0.2 + grain * 0.35),
      rough: clamp(0.66 + grain * 0.26)
    }
  }, { repeat })
}

/* ------------------------------------------------------------------ *
 * 东北黑土农田专用材质
 * 关键：只使用高频团粒 / 细粒与线性垄沟，绝不出现低频大斑块与波浪年轮，
 * 避免俯视时被误读成沙丘或沙漠地表。
 * ------------------------------------------------------------------ */

/** 黑土团粒结构：腐殖质暗斑、团粒、细龟裂与零星石英亮点 */
export function chernozemMaps(repeat = [10, 10]) {
  const [br, bg, bb] = rgb(0x4C3D2D)
  const key = `chernozem-${repeat.join('x')}`
  return makeMapSet(key, 384, (u, v) => {
    const crumb = fbm(u, v, 211, 3, 26)
    const grain = fbm(u, v, 223, 3, 78)
    const humus = fbm(u, v, 241, 2, 6)
    const crack = vnoise(u, v, 72, 307)
    const quartz = vnoise(u, v, 120, 353)
    let tone = 0.58 + crumb * 0.46 + grain * 0.34 + (humus - 0.5) * 0.12
    if (crack > 0.87) tone *= 0.7
    if (quartz > 0.955) tone += 0.34
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone * 0.97) / 255,
      h: clamp(0.2 + crumb * 0.48 + grain * 0.3 - (crack > 0.87 ? 0.22 : 0)),
      rough: clamp(0.84 + grain * 0.16)
    }
  }, { repeat })
}

/** 垄作耕地：笔直平行的垄脊与暗沟，东北大田典型起垄形态 */
export function furrowMaps(repeat = [5, 2]) {
  const [br, bg, bb] = rgb(0x3E3125)
  const key = `furrow-${repeat.join('x')}`
  return makeMapSet(key, 384, (u, v) => {
    const ridge = Math.sin(v * Math.PI * 2 * 22)
    const grain = fbm(u, v, 331, 3, 44)
    const soil = fbm(u, v, 347, 2, 12)
    const tone = 0.6 + ridge * 0.15 + grain * 0.4 + (soil - 0.5) * 0.16
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone) / 255,
      h: clamp(0.3 + ridge * 0.3 + grain * 0.28),
      rough: clamp(0.86 + grain * 0.14)
    }
  }, { repeat })
}

/** 免耕秸秆覆盖：暗金褐碎纤维点，不是连续条纹 */
export function stubbleMaps(repeat = [7, 7]) {
  const [br, bg, bb] = rgb(0x8C7342)
  const key = `stubble-${repeat.join('x')}`
  return makeMapSet(key, 384, (u, v) => {
    const soil = fbm(u, v, 401, 3, 30)
    const fiber = vnoise(u, v, 140, 419)
    const fleck = vnoise(u, v, 200, 431)
    const straw = fiber > 0.935 || fleck > 0.975 ? 1 : 0
    const tone = 0.55 + soil * 0.46 + straw * 0.48
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone * 0.9) / 255,
      h: clamp(0.26 + soil * 0.4 + straw * 0.32),
      rough: clamp(0.86 + soil * 0.14)
    }
  }, { repeat })
}

/** 砂石机耕路：细碎石与两道平行车辙 */
export function gravelMaps(repeat = [8, 1]) {
  const [br, bg, bb] = rgb(0xD2C9B5)
  const key = `gravel-${repeat.join('x')}`
  return makeMapSet(key, 256, (u, v) => {
    const stone = vnoise(u, v, 110, 503)
    const fine = fbm(u, v, 509, 3, 40)
    const rutA = Math.exp(-Math.pow((v - 0.33) / 0.055, 2))
    const rutB = Math.exp(-Math.pow((v - 0.67) / 0.055, 2))
    const tone = 0.9 + (stone - 0.5) * 0.18 + (fine - 0.5) * 0.1 - (rutA + rutB) * 0.2
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone) / 255,
      h: clamp(0.35 + stone * 0.42 + fine * 0.16 - (rutA + rutB) * 0.12),
      rough: clamp(0.8 + stone * 0.18)
    }
  }, { repeat })
}

/** 草甸 / 防护林下植被：细密草点，无大块色斑 */
export function grassMaps(repeat = [8, 8]) {
  const [br, bg, bb] = rgb(0x708061)
  const key = `grass-${repeat.join('x')}`
  return makeMapSet(key, 256, (u, v) => {
    const turf = fbm(u, v, 607, 3, 34)
    const blade = vnoise(u, v, 128, 613)
    const tone = 0.66 + turf * 0.4 + (blade > 0.9 ? 0.2 : 0)
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone) / 255,
      h: clamp(0.26 + turf * 0.42 + blade * 0.24),
      rough: clamp(0.88 + turf * 0.12)
    }
  }, { repeat })
}

/** 田边草甸 / 休耕裸地：浅暖褐干土 + 细密草点，填补非耕地空白但不产生沙丘波纹 */
export function meadowMaps(repeat = [14, 14]) {
  const [br, bg, bb] = rgb(0xD6CCB4)
  const key = `meadow-${repeat.join('x')}`
  return makeMapSet(key, 384, (u, v) => {
    const soil = fbm(u, v, 811, 3, 38)
    const turf = vnoise(u, v, 132, 821)
    const dry = vnoise(u, v, 58, 827)
    const stalk = vnoise(u, v, 190, 839)
    const grass = turf > 0.83 || stalk > 0.965 ? 1 : 0
    const tone = 0.84 + (soil - 0.5) * 0.18 + (dry - 0.5) * 0.055
    return {
      r: (br * tone * (grass ? 0.78 : 1)) / 255,
      g: (bg * tone * (grass ? 0.96 : 1)) / 255,
      b: (bb * tone * (grass ? 0.7 : 1)) / 255,
      h: clamp(0.28 + soil * 0.42 + (grass ? 0.2 : 0)),
      rough: clamp(0.88 + soil * 0.12)
    }
  }, { repeat })
}

/** 河岸卵石与湿滩：青灰细砾 */
export function bankMaps(repeat = [8, 1]) {
  const [br, bg, bb] = rgb(0xB9B8A6)
  const key = `bank-${repeat.join('x')}`
  return makeMapSet(key, 256, (u, v) => {
    const pebble = vnoise(u, v, 92, 701)
    const silt = fbm(u, v, 709, 3, 28)
    const tone = 0.82 + (pebble - 0.5) * 0.22 + (silt - 0.5) * 0.14
    return {
      r: (br * tone) / 255,
      g: (bg * tone) / 255,
      b: (bb * tone) / 255,
      h: clamp(0.3 + pebble * 0.45 + silt * 0.2),
      rough: clamp(0.82 + pebble * 0.16)
    }
  }, { repeat })
}

/** 水面多频波纹法线贴图 */
export function waterNormalMap(repeat = [6, 2]) {
  const key = `water-normal-${repeat.join('x')}`
  if (texCache.has(key)) return texCache.get(key)
  const size = 256
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(size, size)
  const d = img.data
  const height = (u, v) => {
    const t = (a, b, k) => Math.sin((u * a + v * b) * Math.PI * 2 * k)
    return t(1, 0.32, 7) * 0.5 + t(-0.7, 1, 13) * 0.26 + t(1.6, 1.1, 23) * 0.12 + (fbm(u, v, 707, 3, 9) - 0.5) * 0.3
  }
  const eps = 1 / size
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const dx = height(u + eps, v) - height(u - eps, v)
      const dy = height(u, v + eps) - height(u, v - eps)
      const nx = -dx * 5.2
      const ny = -dy * 5.2
      const nz = 1
      const len = Math.hypot(nx, ny, nz)
      const i = (y * size + x) * 4
      d[i] = byte((nx / len) * 0.5 + 0.5)
      d[i + 1] = byte((ny / len) * 0.5 + 0.5)
      d[i + 2] = byte((nz / len) * 0.5 + 0.5)
      d[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = canvasTexture(canvas, { repeat })
  texCache.set(key, tex)
  return tex
}

/** 柔光圆点 Sprite（粒子 / 光斑） */
export function glowSprite(color = '#C88A32') {
  const key = `glow-${color}`
  if (texCache.has(key)) return texCache.get(key)
  const size = 128
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, '#FFFFFF')
  g.addColorStop(0.18, color)
  g.addColorStop(0.55, color + '55')
  g.addColorStop(1, color + '00')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  markShared(tex)
  texCache.set(key, tex)
  return tex
}

/** 柔和接触阴影贴片（黑→透明，中心浓边缘散） */
export function contactShadowTexture() {
  const key = 'contact-shadow'
  if (texCache.has(key)) return texCache.get(key)
  const size = 256
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.04, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(38,32,24,0.52)')
  g.addColorStop(0.32, 'rgba(38,32,24,0.30)')
  g.addColorStop(0.65, 'rgba(38,32,24,0.09)')
  g.addColorStop(1, 'rgba(38,32,24,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  markShared(tex)
  texCache.set(key, tex)
  return tex
}

/** 3D 铭牌 / 刻度文字贴图 */
export function labelTexture(text, {
  width = 512,
  height = 128,
  color = '#1C1B18',
  bg = 'rgba(247,244,238,0)',
  font = '600 54px Georgia, "Songti SC", serif',
  align = 'center'
} = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = color
  ctx.font = font
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(text, align === 'center' ? width / 2 : 12, height / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  markShared(tex)
  return tex
}

/* ------------------------------------------------------------------ *
 * 几何工具：高细分、圆角倒角、平滑法线与有机曲面建模
 * ------------------------------------------------------------------ */

/** 圆角倒角盒（默认 8 段高细分，倒角丝滑饱满） */
export function roundedBox(w, h, d, radius = 0.06, segments = 8) {
  const r = Math.min(radius, w / 2 - 0.0001, h / 2 - 0.0001, d / 2 - 0.0001)
  return new RoundedBoxGeometry(w, h, d, Math.max(4, segments), r)
}

/** 由二维轮廓生成带倒角的回转体，默认 96 段高细分，法线自动平滑 */
export function lathe(points, segments = 96) {
  const geo = new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), Math.max(32, segments))
  geo.computeVertexNormals()
  return geo
}

/** 边缘倒角圆柱：上下缘各一圈高细分圆弧过渡 */
export function bevelCylinder(radius, height, {
  bevel = 0.06,
  segments = 96,
  arcSegments = 8,
  topScale = 1,
  bottomScale = 1
} = {}) {
  const pts = []
  const rTop = radius * topScale
  const rBot = radius * bottomScale
  const b = Math.min(bevel, height * 0.45, Math.min(rTop, rBot) * 0.85)
  // 底面封盖 → 底部倒角
  pts.push([0, -height / 2])
  for (let i = 0; i <= arcSegments; i++) {
    const a = (i / arcSegments) * (Math.PI / 2)
    pts.push([rBot - b + b * Math.sin(a), -height / 2 + b - b * Math.cos(a)])
  }
  // 顶部倒角 → 顶面封盖
  for (let i = 0; i <= arcSegments; i++) {
    const a = (i / arcSegments) * (Math.PI / 2)
    pts.push([rTop - b + b * Math.cos(a), height / 2 - b + b * Math.sin(a)])
  }
  pts.push([0, height / 2])
  const geo = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), Math.max(32, segments))
  geo.computeVertexNormals()
  return geo
}

/**
 * 真实有机弧面叶片几何（带中央叶脉隆起、叶尖收束、自然抛物线下垂与扭转）
 * 根部位于原点 (0,0,0)，沿 +Y 生长并向 +X 舒展下垂。
 */
export function curvedLeafGeometry({
  length = 0.36,
  width = 0.048,
  arch = 0.14,
  droop = 0.08,
  twist = 0.16,
  midrib = 0.008,
  segU = 6,
  segV = 18
} = {}) {
  const geo = new THREE.BufferGeometry()
  const positions = []
  const uvs = []
  const indices = []

  for (let iv = 0; iv <= segV; iv++) {
    const v = iv / segV
    // 叶片宽度轮廓：基部窄、中段饱满、叶尖渐尖
    const profile = Math.sin(Math.pow(v, 0.68) * Math.PI) * (1 - 0.15 * v)
    const halfW = (width * 0.5) * Math.max(0.02, profile)
    // 沿生长方向的空间曲线：向上生长并向外弯曲下垂
    const cx = arch * Math.pow(v, 1.35)
    const cy = length * v - droop * Math.pow(v, 2.4)
    const cz = 0
    const rot = twist * v

    for (let iu = 0; iu <= segU; iu++) {
      const u = (iu / segU) * 2 - 1 // -1 .. 1
      const localZ = u * halfW
      // 中脉隆起 + 叶片横向微V字折角
      const camber = (1 - Math.abs(u)) * midrib * (1 - v * 0.6)
      const lx = cx + camber * Math.cos(rot) - localZ * Math.sin(rot)
      const ly = cy + camber * 0.25
      const lz = cz + localZ * Math.cos(rot) + camber * Math.sin(rot)
      positions.push(lx, ly, lz)
      uvs.push(iu / segU, v)
    }
  }

  const stride = segU + 1
  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * stride + iu
      const b = a + 1
      const c = a + stride
      const d = c + 1
      indices.push(a, b, c, b, d, c)
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/**
 * 螺旋弹簧几何（用于农机减震悬挂、精密螺旋钻杆等）
 */
export function coilSpringGeometry({
  radius = 0.065,
  tubeRadius = 0.012,
  height = 0.36,
  turns = 6.5,
  tubularSegments = 96,
  radialSegments = 12
} = {}) {
  const pts = []
  const steps = Math.max(48, Math.round(turns * 16))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * turns * Math.PI * 2
    pts.push(new THREE.Vector3(
      Math.cos(a) * radius,
      (t - 0.5) * height,
      Math.sin(a) * radius
    ))
  }
  const curve = new THREE.CatmullRomCurve3(pts)
  return new THREE.TubeGeometry(curve, tubularSegments, tubeRadius, radialSegments, false)
}

/**
 * 机翼型流线风电叶片几何（真实 NACA 弯度翼型截面 + 根部圆柱过渡 + 扭转弦长收束）
 */
export function airfoilBladeGeometry(length = 4.25, maxChord = 0.52, segU = 28, segV = 44) {
  const geo = new THREE.BufferGeometry()
  const positions = []
  const uvs = []
  const indices = []

  for (let iv = 0; iv <= segV; iv++) {
    const v = iv / segV
    const y = v * length
    // 根部圆过渡权值 (v: 0..0.14 为圆形叶根，之后展开为气动翼型)
    const rootBlend = clamp(1 - v / 0.16, 0, 1)
    const chord = maxChord * (0.38 * rootBlend + (1 - rootBlend) * (1.05 - Math.pow(v, 0.85) * 0.78))
    const thickness = maxChord * (0.36 * rootBlend + (1 - rootBlend) * (0.22 * (1 - v * 0.72)))
    const twist = (1 - v) * 0.48 * (1 - rootBlend * 0.5)
    const sweep = Math.pow(v, 2.2) * 0.14

    for (let iu = 0; iu <= segU; iu++) {
      const a = (iu / segU) * Math.PI * 2
      // 翼型参数化：前缘圆润、后缘收尖、上表面微拱弯度
      const s = 0.5 * (1 - Math.cos(a)) // 0(前缘) -> 1(后缘)
      const sign = Math.sin(a) >= 0 ? 1 : -1
      // NACA 4位厚度分布近似
      const yt = 5 * (0.2969 * Math.sqrt(s) - 0.1260 * s - 0.3516 * s * s + 0.2843 * s * s * s - 0.1015 * s * s * s * s)
      const camber = 0.065 * (1 - rootBlend) * 4 * s * (1 - s)

      const circleX = Math.cos(a) * chord * 0.5
      const circleZ = Math.sin(a) * thickness * 0.5
      const foilX = (0.32 - s) * chord + sweep
      const foilZ = sign * yt * thickness * 0.5 + camber * chord

      const lx = circleX * rootBlend + foilX * (1 - rootBlend)
      const lz = circleZ * rootBlend + foilZ * (1 - rootBlend)

      const rx = lx * Math.cos(twist) - lz * Math.sin(twist)
      const rz = lx * Math.sin(twist) + lz * Math.cos(twist)
      positions.push(rx, y, rz)
      uvs.push(iu / segU, v)
    }
  }

  const stride = segU + 1
  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * stride + iu
      const b = a + 1
      const c = a + stride
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/**
 * 顶点位移，用于不规则断面 / 微地形 / 水面。
 * recomputeNormals=false 时保留原始平滑法线（圆角盒体专用，避免接缝）。
 */
export function displace(geometry, fn, recomputeNormals = true) {
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const out = fn(x, y, z, i)
    if (out) pos.setXYZ(i, out[0], out[1], out[2])
  }
  pos.needsUpdate = true
  if (recomputeNormals) geometry.computeVertexNormals()
  return geometry
}

/** 细金色描边（自发光轮廓感，配合 hover 提亮） */
export function edgeLines(geometry, {
  color = PALETTE.gold,
  opacity = 0.28,
  threshold = 24
} = {}) {
  const edges = new THREE.EdgesGeometry(geometry, threshold)
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false
  })
  mat.toneMapped = false
  return new THREE.LineSegments(edges, mat)
}

/** 内部工具：合并多个子几何并统一清理临时几何 */
function mergePartsInternal(parts) {
  const normalized = parts.map((g) => {
    const nonIdx = g.index ? g.toNonIndexed() : g
    // 移除 uv 以防某些几何缺省 uv 导致合并失败，或补齐 uv
    if (!nonIdx.attributes.uv) {
      const count = nonIdx.attributes.position.count
      nonIdx.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2))
    }
    return nonIdx
  })
  const merged = mergeGeometries(normalized, false) || normalized[0].clone()
  normalized.forEach((g, i) => { if (g !== parts[i]) g.dispose() })
  parts.forEach((g) => g.dispose())
  merged.computeVertexNormals()
  return merged
}

/**
 * 高细分有机团粒 / 钙质结核几何（3~4 阶二十面体 + 多频噪声凹凸雕塑）
 */
export function sculptedAggregateGeometry(radius = 0.14, detail = 3, seed = 101, amp = 0.25) {
  const geo = new THREE.IcosahedronGeometry(radius, detail)
  displace(geo, (x, y, z) => {
    const len = Math.hypot(x, y, z) || 1
    const nx = x / len
    const ny = y / len
    const nz = z / len
    const u = (Math.atan2(nz, nx) / (Math.PI * 2)) + 0.5
    const v = ny * 0.5 + 0.5
    const n1 = fbm(u, v, seed, 3, 4) - 0.5
    const n2 = fbm(v, u, seed + 59, 3, 10) - 0.5
    const s = 1 + n1 * amp + n2 * (amp * 0.45)
    return [x * s, y * s * 0.88, z * s]
  }, true)
  return geo
}

/**
 * 高精度水稻植株复合几何：分节圆茎 + 茎节环 + 舒展弧面剑叶 + 弯曲下垂稻穗轴 + 饱满谷粒与稻芒
 */
export function makeDetailedRiceStalkGeometry({
  height = 0.44,
  grainCount = 14,
  leafCount = 4,
  widthScale = 1
} = {}) {
  const parts = []
  // 株高放大时，横向尺寸（茎粗/叶宽/谷粒）需要同步放大，否则远处看会像一丛干草
  const ws = widthScale

  // 1) 微弧分节稻茎
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.004 * ws, height * 0.36, 0),
    new THREE.Vector3(0.014 * ws, height * 0.72, 0.003),
    new THREE.Vector3(0.032 * ws, height, 0.005)
  ])
  parts.push(new THREE.TubeGeometry(stemCurve, 16, 0.011 * ws, 10, false))

  // 两个竹节状茎节环
  for (const t of [0.34, 0.66]) {
    const pt = stemCurve.getPoint(t)
    const node = new THREE.TorusGeometry(0.0135 * ws, 0.0035 * ws, 8, 14)
    node.rotateX(Math.PI / 2)
    node.translate(pt.x, pt.y, pt.z)
    parts.push(node)
  }

  // 2) 多片真实弧面稻叶（带中脉隆起与自然抛物线弯曲）
  const leafConfigs = [
    { y: height * 0.28, rotY: 0.2, len: height * 0.62, w: 0.036, arch: 0.12, droop: 0.06 },
    { y: height * 0.46, rotY: Math.PI + 0.35, len: height * 0.72, w: 0.042, arch: 0.16, droop: 0.09 },
    { y: height * 0.64, rotY: 1.45, len: height * 0.68, w: 0.04, arch: 0.15, droop: 0.08 },
    { y: height * 0.82, rotY: -1.35, len: height * 0.56, w: 0.035, arch: 0.11, droop: 0.05 }
  ]
  for (let i = 0; i < Math.min(leafCount, leafConfigs.length); i++) {
    const lc = leafConfigs[i]
    const leaf = curvedLeafGeometry({
      length: lc.len,
      width: lc.w * ws,
      arch: lc.arch * ws,
      droop: lc.droop,
      twist: (i % 2 === 0 ? 1 : -1) * 0.18,
      segU: 6,
      segV: 16
    })
    leaf.rotateY(lc.rotY)
    leaf.translate(0.01 * i, lc.y, 0)
    parts.push(leaf)
  }

  // 3) 弯曲下垂的主穗轴（Panicle Rachis），横向伸展随株高同步放大
  const panicleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.032 * ws, height, 0.005),
    new THREE.Vector3(0.068 * ws, height + 0.11 * ws, 0.012),
    new THREE.Vector3(0.125 * ws, height + 0.17 * ws, 0.018),
    new THREE.Vector3(0.185 * ws, height + 0.14 * ws, 0.01),
    new THREE.Vector3(0.225 * ws, height + 0.08 * ws, 0)
  ])
  parts.push(new THREE.TubeGeometry(panicleCurve, 18, 0.0055 * ws, 8, false))

  // 4) 沿穗轴分布的饱满稻谷粒与细长颖芒
  for (let k = 0; k < grainCount; k++) {
    const t = 0.08 + (k / Math.max(1, grainCount - 1)) * 0.88
    const p = panicleCurve.getPoint(t)
    const sideAngle = k * 2.39996 // 黄金角螺旋排布
    const offsetR = (0.014 + (1 - Math.abs(t - 0.5) * 1.2) * 0.01) * ws
    const gx = p.x + Math.cos(sideAngle) * offsetR * 0.65
    const gy = p.y - 0.008 * ws + Math.sin(sideAngle) * 0.008
    const gz = p.z + Math.sin(sideAngle) * offsetR

    const grain = new THREE.SphereGeometry(0.017 * ws, 10, 8)
    grain.scale(0.78, 1.72, 0.68)
    grain.rotateZ(-0.55 - t * 0.5)
    grain.rotateY(sideAngle * 0.25)
    grain.translate(gx, gy, gz)
    parts.push(grain)

    // 穗尖部分谷粒带颖芒
    if (k % 3 === 0) {
      const awn = new THREE.ConeGeometry(0.0035 * ws, 0.042 * ws, 5)
      awn.rotateZ(-0.85 - t * 0.4)
      awn.translate(gx + 0.018 * ws, gy - 0.006, gz)
      parts.push(awn)
    }
  }

  return mergePartsInternal(parts)
}

/**
 * 高精度玉米植株复合几何：挺拔竹节茎秆 + 4 片宽大披拂弧面叶 + 顶部雄穗分枝
 */
export function makeDetailedCornStalkGeometry({ height = 0.46 } = {}) {
  const parts = []

  const stem = new THREE.CylinderGeometry(0.015, 0.026, height, 12, 4)
  stem.translate(0, height * 0.5, 0)
  parts.push(stem)

  // 茎节
  for (const r of [0.25, 0.5, 0.75]) {
    const ring = new THREE.TorusGeometry(0.021, 0.004, 8, 14)
    ring.rotateX(Math.PI / 2)
    ring.translate(0, height * r, 0)
    parts.push(ring)
  }

  // 4 片宽大弧面玉米叶
  const angles = [0, Math.PI, Math.PI * 0.52, -Math.PI * 0.48]
  angles.forEach((ang, i) => {
    const leaf = curvedLeafGeometry({
      length: height * (0.66 - i * 0.05),
      width: 0.068,
      arch: 0.17,
      droop: 0.11,
      twist: (i % 2 === 0 ? 1 : -1) * 0.14,
      midrib: 0.011,
      segU: 6,
      segV: 14
    })
    leaf.rotateY(ang)
    leaf.translate(0, height * (0.24 + i * 0.16), 0)
    parts.push(leaf)
  })

  // 顶部雄穗（Tassel）三分叉
  for (let b = 0; b < 3; b++) {
    const a = (b / 3) * Math.PI * 2
    const tassel = new THREE.ConeGeometry(0.009, 0.095, 7)
    tassel.rotateZ(0.28)
    tassel.rotateY(a)
    tassel.translate(Math.cos(a) * 0.012, height + 0.04, Math.sin(a) * 0.012)
    parts.push(tassel)
  }

  return mergePartsInternal(parts)
}

/* ------------------------------------------------------------------ *
 * 材质工厂
 * ------------------------------------------------------------------ */

/** 物理折射亚克力 / 玻璃 */
export function glassMaterial({
  transmission = 0.94,
  roughness = 0.05,
  ior = 1.49,
  thickness = 0.45,
  tint = 0xFFFFFF,
  clearcoat = 1,
  envIntensity = 1.1
} = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness,
    transmission,
    thickness,
    ior,
    clearcoat,
    clearcoatRoughness: 0.06,
    envMapIntensity: envIntensity,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  mat.userData.excludeFromAO = true
  return mat
}

/** 轻量透明玻璃（无 transmission，用于大面积温室 / 水面，省一次背面渲染） */
export function sheerGlassMaterial({ tint = 0xBBD9E4, opacity = 0.34, roughness = 0.12 } = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness,
    transparent: true,
    opacity,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.2,
    side: THREE.DoubleSide,
    depthWrite: false
  })
  mat.userData.excludeFromAO = true
  return mat
}

/** 高光烤漆（clearcoat 双层反射） */
export function lacquerMaterial(color, { roughness = 0.26, metalness = 0.16, clearcoat = 0.9 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    clearcoat,
    clearcoatRoughness: 0.09,
    envMapIntensity: 1.05
  })
}

/** 拉丝金属 */
export function metalMaterial(color = PALETTE.gold, { roughness = 0.3, metalness = 0.86, repeat = [2, 2] } = {}) {
  const maps = brushedMaps(color, repeat)
  return new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    map: maps.map,
    bumpMap: maps.bumpMap,
    bumpScale: 0.008,
    roughnessMap: maps.roughnessMap,
    roughness,
    metalness,
    envMapIntensity: 1.2
  })
}

/** 亚麻织物 */
export function fabricMaterial(color = PALETTE.linen, { repeat = [3, 3], roughness = 0.9 } = {}) {
  const maps = linenMaps(repeat)
  return new THREE.MeshStandardMaterial({
    color,
    map: maps.map,
    bumpMap: maps.bumpMap,
    bumpScale: 0.012,
    roughnessMap: maps.roughnessMap,
    roughness,
    metalness: 0
  })
}

/** 黑土层 */
export function soilMaterial(color, seed = 7, { repeat = [2, 2], bumpScale = 0.045 } = {}) {
  const maps = soilMaps(color, seed, repeat)
  return new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    map: maps.map,
    bumpMap: maps.bumpMap,
    bumpScale,
    roughnessMap: maps.roughnessMap,
    roughness: 0.96,
    metalness: 0.02
  })
}

/** 白瓷 */
export function porcelainMaterial({ repeat = [2, 2], roughness = 0.28 } = {}) {
  const maps = porcelainMaps(repeat)
  return new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    map: maps.map,
    bumpMap: maps.bumpMap,
    bumpScale: 0.006,
    roughnessMap: maps.roughnessMap,
    roughness,
    metalness: 0.02,
    clearcoat: 0.42,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.0
  })
}

/** 宣纸 / 磨砂展台 */
export function paperMaterial({ repeat = [4, 4], color = PALETTE.canvas, roughness = 0.86 } = {}) {
  const maps = paperMaps(repeat)
  return new THREE.MeshStandardMaterial({
    color,
    map: maps.map,
    bumpMap: maps.bumpMap,
    bumpScale: 0.008,
    roughnessMap: maps.roughnessMap,
    roughness,
    metalness: 0
  })
}

/** 原木展托 */
export function woodMaterial({ repeat = [2, 2], color = 0xD8C9B0, roughness = 0.62 } = {}) {
  const maps = woodMaps(repeat)
  return new THREE.MeshStandardMaterial({
    color,
    map: maps.map,
    bumpMap: maps.bumpMap,
    bumpScale: 0.01,
    roughnessMap: maps.roughnessMap,
    roughness,
    metalness: 0.02
  })
}

/** 稻垄 / 麦浪 */
export function ridgeMaterial(color = PALETTE.gold, { repeat = [4, 1], roughness = 0.78 } = {}) {
  const maps = ridgeMaps(color, repeat)
  return new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    map: maps.map,
    bumpMap: maps.bumpMap,
    bumpScale: 0.018,
    roughnessMap: maps.roughnessMap,
    roughness,
    metalness: 0.02
  })
}

/** 东北黑土（团粒结构） */
export function chernozemMaterial({ repeat = [10, 10], color = 0xFFFFFF, bumpScale = 0.028, roughness = 0.96 } = {}) {
  const maps = chernozemMaps(repeat)
  return new THREE.MeshStandardMaterial({
    color, map: maps.map, bumpMap: maps.bumpMap, bumpScale,
    roughnessMap: maps.roughnessMap, roughness, metalness: 0
  })
}

/** 起垄耕地 */
export function furrowMaterial({ repeat = [5, 2], bumpScale = 0.05, roughness = 0.94 } = {}) {
  const maps = furrowMaps(repeat)
  return new THREE.MeshStandardMaterial({
    color: 0xFFFFFF, map: maps.map, bumpMap: maps.bumpMap, bumpScale,
    roughnessMap: maps.roughnessMap, roughness, metalness: 0
  })
}

/** 免耕秸秆覆盖 */
export function stubbleMaterial({ repeat = [7, 7], bumpScale = 0.022, roughness = 0.94 } = {}) {
  const maps = stubbleMaps(repeat)
  return new THREE.MeshStandardMaterial({
    color: 0xFFFFFF, map: maps.map, bumpMap: maps.bumpMap, bumpScale,
    roughnessMap: maps.roughnessMap, roughness, metalness: 0
  })
}

/** 砂石机耕路 */
export function gravelMaterial({ repeat = [8, 1], bumpScale = 0.018, roughness = 0.92 } = {}) {
  const maps = gravelMaps(repeat)
  return new THREE.MeshStandardMaterial({
    color: 0xFFFFFF, map: maps.map, bumpMap: maps.bumpMap, bumpScale,
    roughnessMap: maps.roughnessMap, roughness, metalness: 0
  })
}

/** 草甸 / 林下植被 */
export function grassMaterial({ repeat = [8, 8], bumpScale = 0.018, roughness = 0.94 } = {}) {
  const maps = grassMaps(repeat)
  return new THREE.MeshStandardMaterial({
    color: 0xFFFFFF, map: maps.map, bumpMap: maps.bumpMap, bumpScale,
    roughnessMap: maps.roughnessMap, roughness, metalness: 0
  })
}

/** 田边草甸 / 休耕裸地 */
export function meadowMaterial({ repeat = [14, 14], bumpScale = 0.016, roughness = 0.95 } = {}) {
  const maps = meadowMaps(repeat)
  return new THREE.MeshStandardMaterial({
    color: 0xFFFFFF, map: maps.map, bumpMap: maps.bumpMap, bumpScale,
    roughnessMap: maps.roughnessMap, roughness, metalness: 0
  })
}

/** 河岸卵石湿滩 */
export function bankMaterial({ repeat = [8, 1], bumpScale = 0.024, roughness = 0.9 } = {}) {
  const maps = bankMaps(repeat)
  return new THREE.MeshStandardMaterial({
    color: 0xFFFFFF, map: maps.map, bumpMap: maps.bumpMap, bumpScale,
    roughnessMap: maps.roughnessMap, roughness, metalness: 0
  })
}

/** 轮胎橡胶 */
export function rubberMaterial({ repeat = [3, 2], roughness = 0.9 } = {}) {
  const maps = rubberMaps(repeat)
  return new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    map: maps.map,
    bumpMap: maps.bumpMap,
    bumpScale: 0.02,
    roughnessMap: maps.roughnessMap,
    roughness,
    metalness: 0.04
  })
}

/* ------------------------------------------------------------------ *
 * GPU 顶点风摆：用于实例化麦浪 / 禾苗 / 植被，CPU 零开销
 * ------------------------------------------------------------------ */
export function applyWind(material, { amount = 0.06, speed = 1.5, phaseScale = 0.8 } = {}) {
  const state = { shader: null }
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = { value: 0 }
    shader.uniforms.uWindAmount = { value: amount }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uWindTime;\nuniform float uWindAmount;'
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float wPhase = instanceMatrix[3][0] * ${phaseScale.toFixed(3)} + instanceMatrix[3][2] * ${(phaseScale * 1.3).toFixed(3)};
        #else
          float wPhase = 0.0;
        #endif
        float wSway = sin(uWindTime * ${speed.toFixed(3)} + wPhase) * uWindAmount;
        transformed.x += wSway * max(position.y, 0.0);
        transformed.z += wSway * 0.55 * max(position.y, 0.0);`
      )
    state.shader = shader
  }
  material.customProgramCacheKey = () => `museum-wind-${amount}-${speed}-${phaseScale}`
  return (t) => {
    if (state.shader) state.shader.uniforms.uWindTime.value = t
  }
}

/**
 * GPU 顶点水波：让水面产生连续细微起伏，CPU 零开销。
 * verticalAxis='z' 用于旋转后的 PlaneGeometry，'y' 用于已处于 XZ 平面的条带几何。
 */
export function applyWave(material, {
  amplitude = 0.05, speed = 1.1, frequency = 5,
  verticalAxis = 'z', phaseFromZ = false
} = {}) {
  const state = { shader: null }
  const phaseY = phaseFromZ ? 'position.z' : 'position.y'
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWaveTime = { value: 0 }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uWaveTime;'
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float wv = sin(position.x * ${frequency.toFixed(3)} + uWaveTime * ${speed.toFixed(3)}) * 0.6
                 + sin(${phaseY} * ${(frequency * 1.7).toFixed(3)} - uWaveTime * ${(speed * 0.8).toFixed(3)}) * 0.4;
        transformed.${verticalAxis} += wv * ${amplitude.toFixed(5)};`
      )
    state.shader = shader
  }
  material.customProgramCacheKey = () => `museum-wave-${amplitude}-${speed}-${frequency}-${verticalAxis}-${phaseFromZ}`
  return (t) => {
    if (state.shader) state.shader.uniforms.uWaveTime.value = t
  }
}

/* 共享纹理的查询与释放由 src/lib/textureCache.js 提供，并在文件头重新导出。
 * 3D 组件卸载时只释放自身几何与非共享材质，共享纹理保留供其它展厅复用。 */
