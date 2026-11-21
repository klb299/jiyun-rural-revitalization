<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import gsap from 'gsap'
import { useAppStore } from '../stores/appStore'
import { createStage, highlight, clearHighlight } from '../three/stage.js'
import {
  PALETTE, fbm, mulberry32, roundedBox, bevelCylinder, lathe, displace, edgeLines,
  ridgeMaterial, porcelainMaterial, paperMaterial, fabricMaterial, rubberMaterial,
  woodMaterial, metalMaterial, lacquerMaterial, sheerGlassMaterial,
  chernozemMaterial, furrowMaterial, stubbleMaterial, gravelMaterial,
  grassMaterial, bankMaterial, meadowMaps, meadowMaterial,
  waterNormalMap, labelTexture,
  applyWind, applyWave,
  airfoilBladeGeometry, makeDetailedCornStalkGeometry, makeDetailedRiceStalkGeometry
} from '../three/textures.js'

const props = defineProps({
  compact: { type: Boolean, default: false },
  mobile: { type: Boolean, default: false }
})

const appStore = useAppStore()
const containerRef = ref(null)
const isReady = ref(false)
const isTouring = ref(false)
const lightMood = ref('gallery') // 'gallery' | 'harvest'
const qualityLabel = ref('展览级 · IBL + GTAO')
const tooltip = ref({ visible: false, x: 0, y: 0, title: '', sub: '' })

let stage, scene
let windmills = []
let turbineYaw = []
let weatherCups = null
let drone = null
let droneRotors = []
let scanRing = null
let scanInner = null
let rtkRings = []
let droneTime = 0
let cropBlades = []
let windGold = null
let windAmber = null
let windMoss = null
let windTree = null
let waveUpdate = null
const labelTextures = []
const pickTargets = []

const cameraViews = {
  overview: { position: [27.5, 22.5, 27.5], target: [0, 0.4, 0] },
  blacksoil: { position: [12.2, 7.2, 13.2], target: [4.0, 0.5, 5.0] },
  silo: { position: [-4.2, 8.8, 14.2], target: [-11.2, 2.8, 2.0] },
  windpower: { position: [-23.5, 14.5, 0.8], target: [-13.2, 7.2, -12.5] },
  greenhouse: { position: [18.2, 7.8, 2.2], target: [10.2, 1.2, -6.2] },
  smartdrone: { position: [8.5, 10.2, 8.5], target: [0, 4.5, 0] }
}

const spotInfo = {
  silo: { title: '现代恒温数字粮仓群', sub: '素烧白瓷立筒群仓 · 工作塔与散粮装卸港' },
  greenhouse: { title: '连栋光伏智慧农业温室', sub: '板上绿电 · 板下立体果蔬与水肥智控中枢' },
  windpower: { title: '白城清洁能源风电微网', sub: '三台流线风电机组 · 储能集装箱与升压站' },
  field: { title: '黄金黑土免耕与稻浪示范区', sub: '梨树模式秸秆覆盖 · 无人收割与精量播种' },
  river: { title: '松花江青玉水系与汉白玉拱桥', sub: '阶梯生态驳岸 · 水文栈桥与双曲拱廊桥' },
  drone: { title: '多光谱植保巡检无人机', sub: '八字立体航线 · 北斗 RTK 厘米级农情扫描' }
}

const moveCameraTo = (viewKey) => {
  const v = cameraViews[viewKey] || cameraViews.overview
  stage?.flyTo({ ...v, duration: 1.55 })
}

watch(() => appStore.activeFocusPoint, (newVal) => moveCameraTo(newVal))

/* ------------------------------------------------------------------ *
 * 松辽平原微缩沙盘美学色板（严格遵循馆藏级暖白/墨黑/琥珀金/苔藓青/赤红/陶釉棕体系）
 * ------------------------------------------------------------------ */
const SANDBOX_COLORS = {
  plinthDark: 0x231F1B,      // 底层内收墨胡桃木底座
  plinthWood: 0xE5DDD0,      // 主层温润白橡/胡桃展台
  linenMat: 0xEFECE6,        // 亚麻衬垫层
  strataTop: 0x241F1A,       // 沙盘侧缘黑土腐殖层切面
  strataMid: 0x4A3C2E,       // 沙盘侧缘淀积层切面
  strataBase: 0x7C674E,      // 沙盘侧缘黄土母质切面
  alluvialPlain: 0xE2DAC8,   // 松辽冲积平原暖亚麻底色
  loamEdge: 0xC6B89E,        // 田块外缘湿润壤土过渡
  chernozemDeep: 0x332920,   // 核心黑土耕作层
  riparianSand: 0xD2C9B6,    // 河漫滩浅暖砂砾
  meadowTurf: 0x6E8464,      // 生态草甸与护坡草带
  celadonWater: 0x68969A,    // 松花江青玉釉水色
  celadonDeep: 0x3D686C,     // 江心深水墨玉带
  riceGold: 0xCFA042,        // 成熟金秋粳稻
  riceAmber: 0xB87E2E,       // 饱满晚熟琥珀稻穗
  cornJade: 0x466E49,        // 玉米青纱帐叶片
  soyMoss: 0x567B4C,         // 大豆轮作田陇
  poplarGreen: 0x4D704E,     // 防护林钻天杨
  pineDeep: 0x2E5A44,        // 樟子松常青深绿
  autumnGold: 0xC88A32,      // 金秋落叶松/白桦点缀
  autumnRusset: 0xA85834     // 枫红/赤褐林带点缀
}

/* ------------------------------------------------------------------ *
 * 松辽平原地貌参数
 * 河道用解析曲线描述，地形下凹、河床、水面、驳岸、拱桥、栈桥、芦苇全部共用。
 * ------------------------------------------------------------------ */
const RIVER_Z = (x) => -5.5 + x * 0.26 + Math.sin(x * 0.17) * 1.5
const RIVER_DZ = (x) => 0.26 + Math.cos(x * 0.17) * 0.255
const RIVER_HALF = 1.76

const FIELD_BLOCKS = [
  { id: 'A-01', x: -13.6, z: 13.7, w: 8.2, d: 6.6, kind: 'stubble', label: '梨树模式 · 免耕秸秆覆盖区' },
  { id: 'A-02', x: -4.5, z: 13.7, w: 8.2, d: 6.6, kind: 'furrow', label: '黄金玉米带 · 精量起垄区' },
  { id: 'A-03', x: 4.6, z: 13.7, w: 8.2, d: 6.6, kind: 'soy', label: '根瘤固氮 · 大豆轮作保育田' },
  { id: 'A-04', x: 13.7, z: 13.7, w: 8.2, d: 6.6, kind: 'fallow', label: '黑土深松 · 蓄墒休耕监测田' },
  { id: 'B-01', x: -1.5, z: -14.8, w: 11.5, d: 5.6, kind: 'grass', label: '三北生态 · 农田防护林草带' }
]

const inRect = (x, z, r, pad = 0) =>
  Math.abs(x - r.x) <= r.w / 2 + pad && Math.abs(z - r.z) <= r.d / 2 + pad

const mergeParts = (parts) => {
  const normalized = parts.map((g) => (g.index ? g.toNonIndexed() : g))
  const merged = mergeGeometries(normalized, false) || normalized[0].clone()
  normalized.forEach((g, i) => { if (g !== parts[i]) g.dispose() })
  parts.forEach((g) => g.dispose())
  return merged
}

/* ---------------- 1. 馆藏级多层展台、地质切面与高细分黑土地貌 ---------------- */
const buildLandscape = () => {
  const gold = metalMaterial(PALETTE.gold, { roughness: 0.28, metalness: 0.84, repeat: [6, 1] })
  const brassDark = metalMaterial(0x9A7234, { roughness: 0.36, metalness: 0.78 })
  const darkPlinthMat = lacquerMaterial(SANDBOX_COLORS.plinthDark, { roughness: 0.48, metalness: 0.18, clearcoat: 0.3 })

  // 1) 底层内收墨黑悬浮底座，营造美术馆展台体积感
  const underPlinth = new THREE.Mesh(roundedBox(39.4, 0.5, 39.4, 0.18, 6), darkPlinthMat)
  underPlinth.position.y = -1.42
  underPlinth.receiveShadow = true
  underPlinth.castShadow = true
  scene.add(underPlinth)

  // 2) 主层温润木质展台
  const base = new THREE.Mesh(
    roundedBox(41.0, 1.05, 41.0, 0.32, 8),
    woodMaterial({ repeat: [4, 4], color: SANDBOX_COLORS.plinthWood, roughness: 0.68 })
  )
  base.position.y = -0.82
  base.receiveShadow = true
  base.castShadow = true
  scene.add(base)

  // 3) 亚麻织物承托层
  const linenTray = new THREE.Mesh(
    roundedBox(39.6, 0.16, 39.6, 0.12, 5),
    fabricMaterial(SANDBOX_COLORS.linenMat, { repeat: [6, 6], roughness: 0.9 })
  )
  linenTray.position.y = -0.24
  linenTray.receiveShadow = true
  scene.add(linenTray)

  // 4) 沙盘四周微缩「黑土三层地质切面」镶边（呼应黑土地质标本馆）
  const strataLayers = [
    { y: -0.05, h: 0.08, color: SANDBOX_COLORS.strataTop },
    { y: -0.12, h: 0.07, color: SANDBOX_COLORS.strataMid },
    { y: -0.18, h: 0.06, color: SANDBOX_COLORS.strataBase }
  ]
  strataLayers.forEach((st) => {
    const mat = new THREE.MeshStandardMaterial({ color: st.color, roughness: 0.92 })
    const rimMesh = new THREE.Mesh(roundedBox(38.56, st.h, 38.56, 0.04, 3), mat)
    rimMesh.position.y = st.y
    scene.add(rimMesh)
  })

  // 5) 琥珀金双道精密包边、四角包铜护件与正面展览铭牌
  for (const s of [-1, 1]) {
    const bx = new THREE.Mesh(roundedBox(41.16, 0.05, 0.05, 0.015, 2), gold)
    bx.position.set(0, -0.31, s * 20.52)
    scene.add(bx)
    const bz = new THREE.Mesh(roundedBox(0.05, 0.05, 41.16, 0.015, 2), gold)
    bz.position.set(s * 20.52, -0.31, 0)
    scene.add(bz)

    const innerX = new THREE.Mesh(roundedBox(38.7, 0.03, 0.035, 0.01, 2), brassDark)
    innerX.position.set(0, 0.01, s * 19.32)
    scene.add(innerX)
    const innerZ = new THREE.Mesh(roundedBox(0.035, 0.03, 38.7, 0.01, 2), brassDark)
    innerZ.position.set(s * 19.32, 0.01, 0)
    scene.add(innerZ)
  }

  const cornerGeo = roundedBox(0.42, 0.22, 0.42, 0.06, 4)
  const rivetGeo = new THREE.SphereGeometry(0.065, 16, 12)
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const bracket = new THREE.Mesh(cornerGeo, gold)
      bracket.position.set(sx * 20.36, -0.32, sz * 20.36)
      scene.add(bracket)
      const c = new THREE.Mesh(rivetGeo, gold)
      c.position.set(sx * 20.36, -0.18, sz * 20.36)
      scene.add(c)
    }
  }

  // 展台正面黄铜铭牌（南侧正中）
  const frontPlaqueFrame = new THREE.Mesh(roundedBox(8.6, 0.46, 0.12, 0.04, 4), gold)
  frontPlaqueFrame.position.set(0, -0.76, 20.52)
  scene.add(frontPlaqueFrame)
  const frontPlaqueInner = new THREE.Mesh(roundedBox(8.36, 0.36, 0.14, 0.03, 3), darkPlinthMat)
  frontPlaqueInner.position.set(0, -0.76, 20.53)
  scene.add(frontPlaqueInner)
  const mainTitleTex = labelTexture('SONGLIAO PLAIN  ·  GOLDEN BLACK SOIL DIORAMA  ·  SCALE 1:500', {
    width: 1536, height: 96, font: '600 38px Georgia, "Songti SC", serif', color: '#E8C686'
  })
  labelTextures.push(mainTitleTex)
  const frontPlaqueLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(8.0, 0.32),
    new THREE.MeshBasicMaterial({ map: mainTitleTex, transparent: true, depthWrite: false, toneMapped: false })
  )
  frontPlaqueLabel.position.set(0, -0.76, 20.61)
  frontPlaqueLabel.userData.excludeFromAO = true
  scene.add(frontPlaqueLabel)

  // 展台东南角精密黄铜罗盘（Compass Rose）
  const compassGroup = new THREE.Group()
  compassGroup.position.set(17.4, 0.08, -17.4)
  const compassRing = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.84, 48), gold)
  compassRing.rotation.x = -Math.PI / 2
  compassGroup.add(compassRing)
  const compassInner = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.33, 36), gold)
  compassInner.rotation.x = -Math.PI / 2
  compassGroup.add(compassInner)
  const needleN = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.72, 4), lacquerMaterial(PALETTE.red, { roughness: 0.3 }))
  needleN.rotation.x = -Math.PI / 2
  needleN.position.set(0, 0.02, -0.34)
  compassGroup.add(needleN)
  const needleS = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.62, 4), gold)
  needleS.rotation.x = Math.PI / 2
  needleS.position.set(0, 0.02, 0.3)
  compassGroup.add(needleS)
  const centerPin = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), gold)
  centerPin.position.y = 0.04
  compassGroup.add(centerPin)
  scene.add(compassGroup)

  // 6) 160×160 细分微地形：温润谐和的松辽平原色彩过渡
  const geo = new THREE.PlaneGeometry(38.4, 38.4, 160, 160)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  const colors = []
  const ground = new THREE.Color(SANDBOX_COLORS.alluvialPlain)
  const edgeColor = new THREE.Color(SANDBOX_COLORS.loamEdge)
  const blackSoil = new THREE.Color(SANDBOX_COLORS.chernozemDeep)
  const bankColor = new THREE.Color(SANDBOX_COLORS.riparianSand)
  const turfColor = new THREE.Color(SANDBOX_COLORS.meadowTurf)
  const demoRect = { x: 4, z: 5, w: 12.2, d: 9.4 }
  const c = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const u = x / 38.4 + 0.5
    const v = z / 38.4 + 0.5
    let h = (fbm(u, v, 17, 2, 3) - 0.5) * 0.09 + (fbm(u, v, 61, 2, 13) - 0.5) * 0.018
    const riverDist = Math.abs(z - RIVER_Z(x))
    if (riverDist < 3.1) h -= (3.1 - riverDist) * 0.058
    const onField = FIELD_BLOCKS.some((r) => inRect(x, z, r, 0.7)) || inRect(x, z, demoRect, 0.7)
    const nearField = FIELD_BLOCKS.some((r) => inRect(x, z, r, 2.2)) || inRect(x, z, demoRect, 2.2)
    if (onField) h *= 0.14
    pos.setY(i, h)

    c.copy(ground)
    c.offsetHSL(0, 0, (fbm(u, v, 103, 2, 48) - 0.5) * 0.036)
    if (nearField && !onField) c.lerp(edgeColor, 0.38)
    if (onField) c.lerp(blackSoil, 0.92)
    if (riverDist < 2.8) c.lerp(bankColor, 0.58 * (1 - riverDist / 2.8))
    if (inRect(x, z, FIELD_BLOCKS[4], 1.4)) c.lerp(turfColor, 0.55)
    colors.push(c.r, c.g, c.b)
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  const maps = meadowMaps([14, 14])
  const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    vertexColors: true,
    map: maps.map,
    bumpMap: maps.bumpMap,
    bumpScale: 0.008,
    roughnessMap: maps.roughnessMap,
    roughness: 0.96,
    metalness: 0
  }))
  terrain.position.y = 0
  terrain.receiveShadow = true
  scene.add(terrain)

  // 7) 三大功能园区建筑基座：双层阶梯暖灰石材地坪 + 琥珀金嵌线
  const pads = [
    { x: -11.2, z: 2.0, w: 9.2, d: 8.2 },   // 数字粮仓群地坪
    { x: 10.2, z: -6.2, w: 9.0, d: 8.2 },   // 光伏智慧温室群地坪
    { x: -13.8, z: -13.2, w: 9.6, d: 8.8 }  // 清洁能源风电微网地坪
  ]
  const stepMat = paperMaterial({ repeat: [3, 3], color: 0xE6DFD1, roughness: 0.82 })
  const topSlabMat = gravelMaterial({ repeat: [2, 2], bumpScale: 0.008, roughness: 0.88 })
  const trimMat = metalMaterial(PALETTE.gold, { roughness: 0.34, metalness: 0.76, repeat: [6, 1] })

  pads.forEach((p) => {
    const lowerStep = new THREE.Mesh(roundedBox(p.w + 0.42, 0.1, p.d + 0.42, 0.16, 6), stepMat)
    lowerStep.position.set(p.x, 0.06, p.z)
    lowerStep.receiveShadow = true
    scene.add(lowerStep)

    const slab = new THREE.Mesh(roundedBox(p.w, 0.15, p.d, 0.14, 6), topSlabMat)
    slab.position.set(p.x, 0.13, p.z)
    slab.receiveShadow = true
    slab.castShadow = true
    scene.add(slab)

    const trimH = roundedBox(p.w + 0.12, 0.024, 0.05, 0.01, 2)
    const trimV = roundedBox(0.05, 0.024, p.d + 0.12, 0.01, 2)
    for (const s of [-1, 1]) {
      const th = new THREE.Mesh(trimH, trimMat)
      th.position.set(p.x, 0.21, p.z + s * (p.d / 2 + 0.04))
      scene.add(th)
      const tv = new THREE.Mesh(trimV, trimMat)
      tv.position.set(p.x + s * (p.w / 2 + 0.04), 0.21, p.z)
      scene.add(tv)
    }
  })

  // 8) 黄金稻浪示范田底板：深邃黑土团粒基床
  const demoBed = new THREE.Mesh(
    roundedBox(12.4, 0.16, 9.6, 0.12, 6),
    chernozemMaterial({ repeat: [7, 5], bumpScale: 0.026 })
  )
  demoBed.position.set(4, 0.12, 5)
  demoBed.receiveShadow = true
  demoBed.castShadow = true
  scene.add(demoBed)

  buildFieldBlocks()
  buildRoadNetwork()
  buildRiverBanks()
  buildFarmFacilities()

  // 9) 场地雕刻地面铭牌
  const tags = [
    { text: '01 · GOLDEN PADDY & CHERNOZEM CORE', x: 4, z: 10.35 },
    { text: '02 · PORCELAIN DIGITAL SILO MATRIX', x: -11.2, z: 6.65 },
    { text: '03 · BAICHENG WIND & STORAGE GRID', x: -13.8, z: -8.3 },
    { text: '04 · SOLAR SMART GLASSHOUSE PARK', x: 10.2, z: -1.65 }
  ]
  tags.forEach((t) => {
    const tex = labelTexture(t.text, {
      width: 896, height: 96, font: '600 40px Georgia, serif', color: '#6E5836'
    })
    labelTextures.push(tex)
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.0, 0.42),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false })
    )
    plane.rotation.x = -Math.PI / 2
    plane.position.set(t.x, 0.215, t.z)
    plane.userData.excludeFromAO = true
    scene.add(plane)
  })

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(72, 72),
    new THREE.ShadowMaterial({ opacity: 0.09 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.68
  floor.receiveShadow = true
  scene.add(floor)
}

/* ---------------- 1a. 沿河道曲线的条带几何 ---------------- */
const makeRibbonGeometry = (x0, x1, steps, halfWidth, y, uvScale = 4) => {
  const positions = []
  const uvs = []
  const indices = []
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps
    const zc = RIVER_Z(x)
    const dz = RIVER_DZ(x)
    const inv = 1 / Math.hypot(1, dz)
    const nx = -dz * inv
    const nz = inv
    for (const s of [-1, 1]) {
      positions.push(x + nx * halfWidth * s, y, zc + nz * halfWidth * s)
      uvs.push((x - x0) / uvScale, (s + 1) / 2)
    }
  }
  for (let i = 0; i < steps; i++) {
    const a = i * 2
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  g.setIndex(indices)
  g.computeVertexNormals()
  return g
}

/* ---------------- 1b. 规整高标准黑土田块格网（免耕/玉米/大豆/深松/草甸） ---------------- */
const buildFieldBlocks = () => {
  const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x33281E, roughness: 0.96, metalness: 0 })
  const mulchRidgeMat = new THREE.MeshStandardMaterial({ color: 0xAE843A, roughness: 0.9, metalness: 0 })
  const bankMat = new THREE.MeshStandardMaterial({ color: 0x6E5D46, roughness: 0.92, metalness: 0 })
  const soyMat = new THREE.MeshStandardMaterial({ color: SANDBOX_COLORS.soyMoss, roughness: 0.88, metalness: 0 })
  // 弧面叶为单层曲面，必须双面渲染，否则背面叶片会消失
  const cornMat = new THREE.MeshStandardMaterial({ color: SANDBOX_COLORS.cornJade, roughness: 0.84, metalness: 0, side: THREE.DoubleSide })
  const cobMat = new THREE.MeshStandardMaterial({ color: SANDBOX_COLORS.riceGold, roughness: 0.76, metalness: 0.05 })
  const goldMat = metalMaterial(PALETTE.gold, { roughness: 0.3, metalness: 0.84 })
  const whiteMat = porcelainMaterial({ repeat: [1, 1], roughness: 0.3 })
  const dummy = new THREE.Object3D()
  const rnd = mulberry32(7311)

  // 玉米植株：竹节茎 + 四片宽大弧面叶 + 顶部雄穗（程序化高精模型）
  const cornGeo = makeDetailedCornStalkGeometry({ height: 0.46 })
  const cobGeo = new THREE.ConeGeometry(0.022, 0.11, 7)
  cobGeo.translate(0, 0.36, 0)

  FIELD_BLOCKS.forEach((b) => {
    const group = new THREE.Group()
    group.position.set(b.x, 0, b.z)
    group.userData.pickKey = 'field'

    const mat = b.kind === 'stubble' ? stubbleMaterial({ repeat: [4, 3], bumpScale: 0.022 })
      : b.kind === 'furrow' ? furrowMaterial({ repeat: [3, 2], bumpScale: 0.04 })
        : b.kind === 'fallow' ? chernozemMaterial({ repeat: [5, 4], bumpScale: 0.032 })
          : grassMaterial({ repeat: [6, 3], bumpScale: 0.016 })

    const bed = new THREE.Mesh(roundedBox(b.w, 0.16, b.d, 0.09, 6), mat)
    bed.position.y = 0.13
    bed.receiveShadow = true
    bed.castShadow = true
    group.add(bed)

    // 四面规整田埂 + 倒角护边
    const hGeo = roundedBox(b.w + 0.24, 0.11, 0.22, 0.035, 3)
    const vGeo = roundedBox(0.22, 0.11, b.d + 0.24, 0.035, 3)
    for (const s of [-1, 1]) {
      const bh = new THREE.Mesh(hGeo, bankMat)
      bh.position.set(0, 0.22, s * (b.d / 2 + 0.02))
      bh.castShadow = true
      group.add(bh)
      const bv = new THREE.Mesh(vGeo, bankMat)
      bv.position.set(s * (b.w / 2 + 0.02), 0.22, 0)
      bv.castShadow = true
      group.add(bv)
    }

    // 立体垄脊：免耕田采用「黑土宽垄 + 金色秸秆覆盖窄带」交替，真实还原梨树模式
    if (b.kind === 'furrow' || b.kind === 'stubble' || b.kind === 'fallow') {
      const rows = Math.floor((b.d - 0.7) / 0.58)
      const ridgeGeo = roundedBox(b.w - 0.72, 0.06, 0.22, 0.04, 3)
      const ridges = new THREE.InstancedMesh(ridgeGeo, ridgeMat, rows)
      for (let i = 0; i < rows; i++) {
        dummy.position.set(0, 0.225, -b.d / 2 + 0.45 + i * 0.58)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        ridges.setMatrixAt(i, dummy.matrix)
      }
      ridges.instanceMatrix.needsUpdate = true
      ridges.castShadow = true
      group.add(ridges)

      if (b.kind === 'stubble') {
        const mulchGeo = roundedBox(b.w - 0.82, 0.035, 0.16, 0.02, 2)
        const mulches = new THREE.InstancedMesh(mulchGeo, mulchRidgeMat, rows - 1)
        for (let i = 0; i < rows - 1; i++) {
          dummy.position.set(0, 0.215, -b.d / 2 + 0.74 + i * 0.58)
          dummy.updateMatrix()
          mulches.setMatrixAt(i, dummy.matrix)
        }
        mulches.instanceMatrix.needsUpdate = true
        group.add(mulches)
      }
    }

    // A-02 玉米示范田：整齐列阵的青纱帐与黄金玉米穗
    if (b.kind === 'furrow') {
      const rows = 9
      const cols = props.compact ? 14 : 24
      const total = rows * cols
      const cornMesh = new THREE.InstancedMesh(cornGeo, cornMat, total)
      const cobMesh = new THREE.InstancedMesh(cobGeo, cobMat, total)
      let idx = 0
      for (let r = 0; r < rows; r++) {
        const rz = -b.d / 2 + 0.62 + r * 0.66
        for (let c = 0; c < cols; c++) {
          const cx = -b.w / 2 + 0.6 + (c / (cols - 1)) * (b.w - 1.2) + (rnd() - 0.5) * 0.08
          dummy.position.set(cx, 0.23, rz)
          dummy.rotation.set(0, rnd() * Math.PI * 2, 0)
          const s = 0.82 + rnd() * 0.35
          dummy.scale.set(s, s, s)
          dummy.updateMatrix()
          cornMesh.setMatrixAt(idx, dummy.matrix)
          cobMesh.setMatrixAt(idx, dummy.matrix)
          idx++
        }
      }
      cornMesh.instanceMatrix.needsUpdate = true
      cobMesh.instanceMatrix.needsUpdate = true
      cornMesh.castShadow = true
      group.add(cornMesh, cobMesh)
    }

    // A-03 大豆轮作与 B-01 草甸：成行饱满冠层
    if (b.kind === 'soy' || b.kind === 'grass') {
      const count = b.kind === 'soy' ? (props.compact ? 180 : 340) : (props.compact ? 120 : 200)
      const bushGeo = new THREE.SphereGeometry(0.125, 10, 8)
      const bushes = new THREE.InstancedMesh(bushGeo, soyMat, count)
      for (let i = 0; i < count; i++) {
        const row = i % 9
        const rz = b.kind === 'soy'
          ? -b.d / 2 + 0.58 + row * 0.68 + (rnd() - 0.5) * 0.1
          : (rnd() - 0.5) * (b.d - 0.8)
        dummy.position.set(
          (rnd() - 0.5) * (b.w - 0.85),
          0.235 + rnd() * 0.04,
          rz
        )
        const s = 0.62 + rnd() * 0.72
        dummy.scale.set(s, s * 0.74, s)
        dummy.rotation.set(0, rnd() * Math.PI * 2, 0)
        dummy.updateMatrix()
        bushes.setMatrixAt(i, dummy.matrix)
      }
      bushes.instanceMatrix.needsUpdate = true
      bushes.castShadow = true
      group.add(bushes)
    }

    // A-04 深松休耕地：土壤墒情无线探针阵列
    if (b.kind === 'fallow') {
      for (let i = 0; i < 3; i++) {
        const probe = new THREE.Group()
        probe.position.set(-2.2 + i * 2.2, 0.22, (i - 1) * 1.2)
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.48, 10), goldMat)
        pole.position.y = 0.24
        probe.add(pole)
        const head = new THREE.Mesh(roundedBox(0.16, 0.1, 0.12, 0.02, 3), whiteMat)
        head.position.y = 0.5
        probe.add(head)
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), goldMat)
        dome.position.y = 0.57
        probe.add(dome)
        group.add(probe)
      }
    }

    // 地块黄铜底座立牌与地面编号
    const tex = labelTexture(`${b.id}   ${b.label}`, {
      width: 1024, height: 96, font: '600 42px Georgia, "Songti SC", serif',
      color: b.kind === 'grass' ? '#F2EAD8' : '#ECD9B4'
    })
    labelTextures.push(tex)
    const tag = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 0.32),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false })
    )
    tag.rotation.x = -Math.PI / 2
    tag.position.set(-b.w / 2 + 1.85, 0.24, -b.d / 2 + 0.48)
    tag.userData.excludeFromAO = true
    group.add(tag)

    scene.add(group)
    pickTargets.push(group)
  })
}

/* ---------------- 1c. 砂石机耕路网、林荫道肩与生态灌溉渠系 ---------------- */
const buildRoadNetwork = () => {
  const roadMat = gravelMaterial({ repeat: [8, 1], bumpScale: 0.012, roughness: 0.9 })
  const curbMat = paperMaterial({ repeat: [4, 1], color: 0xD8CFC0, roughness: 0.86 })
  const goldMat = metalMaterial(PALETTE.gold, { roughness: 0.32, metalness: 0.82 })
  const lampGlowMat = new THREE.MeshStandardMaterial({
    color: 0xFFF4DC, emissive: 0xFFE2A8, emissiveIntensity: 0.65, roughness: 0.25
  })

  const roads = [
    { x: 0, z: 9.85, w: 37.2, d: 1.05, main: true },
    { x: 0, z: 17.65, w: 37.2, d: 0.92, main: false },
    { x: -9.05, z: 13.7, w: 0.92, d: 6.6, main: false },
    { x: 0.05, z: 13.7, w: 0.92, d: 6.6, main: false },
    { x: 9.15, z: 13.7, w: 0.92, d: 6.6, main: false },
    { x: -18.2, z: 12.0, w: 0.88, d: 12.2, main: false },
    { x: 18.2, z: 12.0, w: 0.88, d: 12.2, main: false },
    { x: 0, z: -1.65, w: 1.15, d: 4.6, main: true } // 连接拱桥与主干道的南北向引道
  ]
  roads.forEach((r) => {
    const curb = new THREE.Mesh(roundedBox(r.w + 0.16, 0.045, r.d + 0.16, 0.02, 2), curbMat)
    curb.position.set(r.x, 0.07, r.z)
    curb.receiveShadow = true
    scene.add(curb)

    const road = new THREE.Mesh(roundedBox(r.w, 0.065, r.d, 0.025, 3), roadMat)
    road.position.set(r.x, 0.095, r.z)
    road.receiveShadow = true
    scene.add(road)
  })

  // 太阳能智慧路灯列阵（沿东西主干道 z = 9.2）
  const poleGeo = new THREE.CylinderGeometry(0.018, 0.026, 0.82, 10)
  const armGeo = roundedBox(0.2, 0.02, 0.06, 0.008, 2)
  const solarGeo = roundedBox(0.22, 0.018, 0.16, 0.006, 2)
  const solarMat = lacquerMaterial(0x283842, { roughness: 0.25, metalness: 0.45 })
  for (let i = -4; i <= 4; i++) {
    if (i === 0) continue
    const lx = i * 4.1
    const lamp = new THREE.Group()
    lamp.position.set(lx, 0.1, 9.18)
    const pole = new THREE.Mesh(poleGeo, goldMat)
    pole.position.y = 0.41
    pole.castShadow = true
    lamp.add(pole)
    const arm = new THREE.Mesh(armGeo, goldMat)
    arm.position.set(0, 0.8, 0.08)
    lamp.add(arm)
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), lampGlowMat)
    bulb.position.set(0, 0.78, 0.14)
    lamp.add(bulb)
    const panel = new THREE.Mesh(solarGeo, solarMat)
    panel.position.set(0, 0.85, -0.02)
    panel.rotation.x = 0.35
    lamp.add(panel)
    scene.add(lamp)
  }

  // 生态衬砌灌溉总渠：浅灰石岸 + 青玉水脉
  const canalWallMat = paperMaterial({ repeat: [12, 1], color: 0xD2C8B6, roughness: 0.88 })
  const ditchMat = new THREE.MeshStandardMaterial({ color: 0x42382C, roughness: 0.95 })
  const ditch = new THREE.Mesh(roundedBox(35.4, 0.055, 0.54, 0.02, 2), ditchMat)
  ditch.position.set(0, 0.075, 18.42)
  scene.add(ditch)
  for (const s of [-1, 1]) {
    const bank = new THREE.Mesh(roundedBox(35.5, 0.085, 0.12, 0.02, 2), canalWallMat)
    bank.position.set(0, 0.11, 18.42 + s * 0.28)
    scene.add(bank)
  }
  const waterline = new THREE.Mesh(
    roundedBox(35.2, 0.025, 0.36, 0.008, 2),
    sheerGlassMaterial({ tint: SANDBOX_COLORS.celadonWater, opacity: 0.68, roughness: 0.1 })
  )
  waterline.position.set(0, 0.11, 18.42)
  waterline.userData.excludeFromAO = true
  scene.add(waterline)

  // 渠水方向线：两道极淡的浅色细条，让静态水面有流向，不增加场景密度
  const flowMat = new THREE.MeshBasicMaterial({
    color: 0xF2FAF6, transparent: true, opacity: 0.46, depthWrite: false
  })
  for (let i = 0; i < 2; i++) {
    const flow = new THREE.Mesh(roundedBox(34.4, 0.006, 0.012, 0.003, 2), flowMat)
    flow.position.set(0, 0.128, 18.42 + (i ? 0.09 : -0.09))
    flow.userData.excludeFromAO = true
    scene.add(flow)
  }
}

/* ---------------- 1d. 蜿蜒河床、生态阶梯驳岸、亲水栈桥与金秋芦苇荡 ---------------- */
const buildRiverBanks = () => {
  // 宽幅卵石浅滩与阶梯生态石岸
  const outerBank = new THREE.Mesh(
    makeRibbonGeometry(-19.2, 19.2, 144, RIVER_HALF + 0.92, 0.038),
    paperMaterial({ repeat: [16, 1], color: 0xD6CBB8, roughness: 0.9 })
  )
  outerBank.receiveShadow = true
  scene.add(outerBank)

  const bed = new THREE.Mesh(
    makeRibbonGeometry(-19.2, 19.2, 144, RIVER_HALF + 0.56, 0.052),
    bankMaterial({ repeat: [12, 1], bumpScale: 0.026 })
  )
  bed.receiveShadow = true
  scene.add(bed)

  // 水文监测亲水木栈桥与浮标（位于河湾 x = -6.8）
  const pierX = -6.8
  const pierZ = RIVER_Z(pierX) + RIVER_HALF + 0.35
  const pierGroup = new THREE.Group()
  pierGroup.position.set(pierX, 0.08, pierZ)
  pierGroup.rotation.y = -Math.atan(RIVER_DZ(pierX))
  const woodMat = woodMaterial({ repeat: [2, 2], color: 0xC8B08E, roughness: 0.66 })
  const goldMat = metalMaterial(PALETTE.gold, { roughness: 0.3, metalness: 0.85 })
  const redMat = lacquerMaterial(PALETTE.red, { roughness: 0.32, metalness: 0.15 })

  const deck = new THREE.Mesh(roundedBox(1.1, 0.06, 1.65, 0.025, 3), woodMat)
  deck.position.set(0, 0.14, -0.55)
  deck.castShadow = true
  pierGroup.add(deck)
  for (const sx of [-0.46, 0.46]) {
    for (const sz of [0.1, -0.55, -1.2]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.38, 10), goldMat)
      post.position.set(sx, 0.18, sz)
      pierGroup.add(post)
    }
    const rail = new THREE.Mesh(roundedBox(0.025, 0.025, 1.4, 0.008, 2), goldMat)
    rail.position.set(sx, 0.34, -0.55)
    pierGroup.add(rail)
  }
  // 江心水质监测浮标
  const buoy = new THREE.Group()
  buoy.position.set(0.4, 0.04, -1.85)
  const floatRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.055, 12, 28), redMat)
  floatRing.rotation.x = Math.PI / 2
  buoy.add(floatRing)
  const buoyCone = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 16), goldMat)
  buoyCone.position.y = 0.16
  buoy.add(buoyCone)
  pierGroup.add(buoy)
  scene.add(pierGroup)

  // 金秋芦苇与香蒲棒（复合几何，随风摇曳）
  const rnd = mulberry32(9151)
  const stalk = new THREE.CylinderGeometry(0.008, 0.014, 0.44, 6)
  stalk.translate(0, 0.22, 0)
  const cattail = new THREE.CylinderGeometry(0.022, 0.022, 0.12, 8)
  cattail.translate(0, 0.36, 0)
  const plume = new THREE.ConeGeometry(0.042, 0.18, 7)
  plume.rotateZ(0.18)
  plume.translate(0.015, 0.48, 0)
  const reedGeo = mergeParts([stalk, cattail, plume])

  const reedMat = new THREE.MeshStandardMaterial({
    color: 0xBC9850, roughness: 0.86, metalness: 0.02, side: THREE.DoubleSide
  })
  const reedWind = applyWind(reedMat, { amount: 0.042, speed: 1.15, phaseScale: 1.4 })
  const reeds = []
  const count = props.compact ? 110 : 260
  const reedMesh = new THREE.InstancedMesh(reedGeo, reedMat, count)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < count; i++) {
    let x = -18.6 + rnd() * 37.2
    if (Math.abs(x) < 2.2) x += 3.0 // 避开拱桥桥头
    const side = rnd() < 0.5 ? -1 : 1
    const z = RIVER_Z(x) + side * (RIVER_HALF + 0.32 + rnd() * 0.68)
    dummy.position.set(x, 0.05, z)
    dummy.rotation.set((rnd() - 0.5) * 0.18, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.16)
    const s = 0.65 + rnd() * 0.85
    dummy.scale.set(s, s, s)
    dummy.updateMatrix()
    reedMesh.setMatrixAt(i, dummy.matrix)
  }
  reedMesh.instanceMatrix.needsUpdate = true
  reedMesh.castShadow = true
  scene.add(reedMesh)
  reeds.push(reedWind)
  stage.onCleanup(() => { reeds.length = 0 })

  const prevWindTree = windTree
  windTree = (t) => {
    prevWindTree?.(t)
    reeds.forEach((fn) => fn(t))
  }
}

/* ---------------- 1e. 田间设施、微缩农机、北斗基准站与晒场细节 ---------------- */
const buildFarmFacilities = () => {
  const white = porcelainMaterial({ repeat: [2, 2], roughness: 0.28 })
  const red = lacquerMaterial(PALETTE.red, { roughness: 0.28, metalness: 0.16, clearcoat: 0.85 })
  const gold = metalMaterial(PALETTE.gold, { roughness: 0.3, metalness: 0.84 })
  const dark = lacquerMaterial(0x2D2A26, { roughness: 0.52, metalness: 0.36 })
  const rubber = rubberMaterial({ repeat: [2, 1], roughness: 0.92 })
  const meadow = meadowMaterial({ repeat: [3, 3], bumpScale: 0.012 })
  const turf = grassMaterial({ repeat: [4, 1], bumpScale: 0.014 })
  const dummy = new THREE.Object3D()

  // 1) 田块外围生态草带，柔化黑土田块与平原基底的接缝
  FIELD_BLOCKS.forEach((b) => {
    const hGeo = roundedBox(b.w + 0.92, 0.035, 0.42, 0.015, 2)
    const vGeo = roundedBox(0.42, 0.035, b.d + 0.92, 0.015, 2)
    for (const s of [-1, 1]) {
      const gh = new THREE.Mesh(hGeo, turf)
      gh.position.set(b.x, 0.075, b.z + s * (b.d / 2 + 0.3))
      gh.receiveShadow = true
      scene.add(gh)
      const gv = new THREE.Mesh(vGeo, turf)
      gv.position.set(b.x + s * (b.w / 2 + 0.3), 0.075, b.z)
      gv.receiveShadow = true
      scene.add(gv)
    }
  })

  // 2) 白瓷金顶高标准农田界桩
  const postGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.34, 12)
  const capGeo = new THREE.SphereGeometry(0.052, 12, 10)
  const posts = []
  FIELD_BLOCKS.forEach((b) => {
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        posts.push([b.x + sx * (b.w / 2 + 0.44), b.z + sz * (b.d / 2 + 0.44)])
      }
    }
  })
  for (let i = 0; i < 16; i++) posts.push([-18 + i * 2.4, 9.85 + 0.82])
  const postMesh = new THREE.InstancedMesh(postGeo, white, posts.length)
  const capMesh = new THREE.InstancedMesh(capGeo, gold, posts.length)
  posts.forEach(([x, z], i) => {
    dummy.position.set(x, 0.27, z)
    dummy.rotation.set(0, 0, 0)
    dummy.scale.set(1, 1, 1)
    dummy.updateMatrix()
    postMesh.setMatrixAt(i, dummy.matrix)
    dummy.position.y = 0.46
    dummy.updateMatrix()
    capMesh.setMatrixAt(i, dummy.matrix)
  })
  postMesh.instanceMatrix.needsUpdate = true
  capMesh.instanceMatrix.needsUpdate = true
  postMesh.castShadow = true
  scene.add(postMesh, capMesh)

  // 3) 两座现代智慧排灌泵房（白瓷立面 + 传统赤红折坡顶 + 输水金管）
  const pumpSites = [[-17.1, 6.4], [16.5, 5.2]]
  pumpSites.forEach(([x, z]) => {
    const g = new THREE.Group()
    g.position.set(x, 0.1, z)
    const plinth = new THREE.Mesh(roundedBox(1.42, 0.12, 1.22, 0.05, 4), dark)
    plinth.position.y = 0.06
    g.add(plinth)
    const body = new THREE.Mesh(roundedBox(1.22, 0.86, 1.02, 0.08, 5), white)
    body.position.y = 0.52
    body.castShadow = true
    body.receiveShadow = true
    g.add(body)
    const roof = new THREE.Mesh(roundedBox(1.44, 0.14, 1.24, 0.05, 4), red)
    roof.position.y = 1.0
    roof.castShadow = true
    g.add(roof)
    const ridgeCap = new THREE.Mesh(roundedBox(1.48, 0.04, 0.14, 0.015, 2), gold)
    ridgeCap.position.y = 1.09
    g.add(ridgeCap)
    const door = new THREE.Mesh(roundedBox(0.32, 0.54, 0.025, 0.01, 2), dark)
    door.position.set(-0.18, 0.36, 0.515)
    g.add(door)
    const win = new THREE.Mesh(
      roundedBox(0.32, 0.24, 0.025, 0.01, 2),
      sheerGlassMaterial({ tint: 0xBFD9DE, opacity: 0.55 })
    )
    win.position.set(0.28, 0.6, 0.515)
    win.userData.excludeFromAO = true
    g.add(win)
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 1.25, 18), gold)
    pipe.rotation.z = Math.PI / 2
    pipe.position.set(0.95, 0.26, 0)
    g.add(pipe)
    scene.add(g)
  })

  // 4) 北斗三号 RTK 地面差分增强基准站（位于中心路网交汇处 x = -2.2, z = 8.4）
  const rtkStation = new THREE.Group()
  rtkStation.position.set(-2.2, 0.1, 8.4)
  rtkStation.userData.pickKey = 'drone'
  const rtkPad = new THREE.Mesh(bevelCylinder(0.75, 0.12, { bevel: 0.04, segments: 36 }), white)
  rtkPad.position.y = 0.06
  rtkStation.add(rtkPad)
  const rtkTrim = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.022, 10, 48), gold)
  rtkTrim.rotation.x = Math.PI / 2
  rtkTrim.position.y = 0.12
  rtkStation.add(rtkTrim)
  const rtkMast = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.068, 2.35, 18), white)
  rtkMast.position.y = 1.28
  rtkMast.castShadow = true
  rtkStation.add(rtkMast)
  const rtkCollar = new THREE.Mesh(bevelCylinder(0.14, 0.12, { bevel: 0.03, segments: 24 }), gold)
  rtkCollar.position.y = 2.42
  rtkStation.add(rtkCollar)
  const rtkDome = new THREE.Mesh(
    lathe([[0, 0], [0.22, 0], [0.28, 0.06], [0.24, 0.16], [0.1, 0.22], [0, 0.23]], 40),
    white
  )
  rtkDome.position.y = 2.48
  rtkDome.castShadow = true
  rtkStation.add(rtkDome)
  for (let i = 0; i < 2; i++) {
    const sigRing = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.36, 48),
      new THREE.MeshBasicMaterial({
        color: PALETTE.gold, transparent: true, opacity: 0.45,
        side: THREE.DoubleSide, depthWrite: false
      })
    )
    sigRing.rotation.x = -Math.PI / 2
    sigRing.position.y = 2.74
    sigRing.userData.phase = i * 0.5
    sigRing.userData.excludeFromAO = true
    rtkStation.add(sigRing)
    rtkRings.push(sigRing)
  }
  scene.add(rtkStation)
  pickTargets.push(rtkStation)

  // 5) 微缩北斗无人拖拉机 + 免耕播种机（在 A-01 免耕示范田作业）
  const tractor = new THREE.Group()
  tractor.position.set(-12.8, 0.24, 13.4)
  tractor.rotation.y = Math.PI / 2
  tractor.userData.pickKey = 'field'
  const tChassis = new THREE.Mesh(roundedBox(0.42, 0.14, 0.78, 0.04, 4), dark)
  tChassis.position.y = 0.16
  tractor.add(tChassis)
  const tHood = new THREE.Mesh(roundedBox(0.34, 0.22, 0.42, 0.05, 5), red)
  tHood.position.set(0, 0.28, 0.18)
  tHood.castShadow = true
  tractor.add(tHood)
  const tCabin = new THREE.Mesh(roundedBox(0.38, 0.3, 0.36, 0.04, 4), dark)
  tCabin.position.set(0, 0.36, -0.14)
  tractor.add(tCabin)
  const tRoof = new THREE.Mesh(roundedBox(0.42, 0.05, 0.4, 0.02, 3), white)
  tRoof.position.set(0, 0.52, -0.14)
  tractor.add(tRoof)
  const tRtk = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), gold)
  tRtk.scale.y = 0.55
  tRtk.position.set(0, 0.57, -0.14)
  tractor.add(tRtk)
  for (const sx of [-0.24, 0.24]) {
    const rw = new THREE.Mesh(bevelCylinder(0.18, 0.12, { bevel: 0.03, segments: 24 }), rubber)
    rw.rotation.z = Math.PI / 2
    rw.position.set(sx, 0.18, -0.18)
    tractor.add(rw)
    const fw = new THREE.Mesh(bevelCylinder(0.12, 0.09, { bevel: 0.02, segments: 20 }), rubber)
    fw.rotation.z = Math.PI / 2
    fw.position.set(sx * 0.9, 0.12, 0.22)
    tractor.add(fw)
  }
  // 尾部牵引免耕精量播种机
  const planterBar = new THREE.Mesh(roundedBox(0.96, 0.06, 0.18, 0.02, 3), red)
  planterBar.position.set(0, 0.15, -0.58)
  tractor.add(planterBar)
  for (let k = -2; k <= 2; k++) {
    const hopper = new THREE.Mesh(roundedBox(0.12, 0.16, 0.16, 0.02, 3), white)
    hopper.position.set(k * 0.2, 0.24, -0.62)
    tractor.add(hopper)
  }
  scene.add(tractor)
  pickTargets.push(tractor)

  // 6) 金秋晒场、丰收粮囤与打捆秸秆垛（东南暖阳区 x = 9.6, z = -15.1）
  const yard = new THREE.Mesh(roundedBox(6.6, 0.11, 4.6, 0.14, 5), meadow)
  yard.position.set(9.6, 0.09, -15.1)
  yard.receiveShadow = true
  yard.castShadow = true
  scene.add(yard)
  const yardBorder = new THREE.Mesh(roundedBox(6.74, 0.04, 4.74, 0.15, 4), gold)
  yardBorder.position.set(9.6, 0.06, -15.1)
  scene.add(yardBorder)

  const grainMat = stubbleMaterial({ repeat: [2, 2], bumpScale: 0.028 })
  const matWall = fabricMaterial(0xDFCFAF, { repeat: [3, 1], roughness: 0.88 })
  for (let i = 0; i < 3; i++) {
    const gx = 7.9 + i * 1.65
    const gz = -15.1 + (i % 2) * 0.45
    // 传统与现代结合的「丰收圆囤」：苇席围身 + 金谷尖顶
    const granaryBase = new THREE.Mesh(bevelCylinder(0.56, 0.42, { bevel: 0.04, segments: 32 }), matWall)
    granaryBase.position.set(gx, 0.35, gz)
    granaryBase.castShadow = true
    scene.add(granaryBase)
    const pile = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.58, 32, 3), grainMat)
    pile.position.set(gx, 0.82, gz)
    pile.castShadow = true
    scene.add(pile)
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), gold)
    tip.position.set(gx, 1.12, gz)
    scene.add(tip)
  }

  // 圆捆秸秆垛（免耕还田与饲料化利用标志）
  for (let i = 0; i < 4; i++) {
    const bale = new THREE.Mesh(
      bevelCylinder(0.42, 0.68, { bevel: 0.05, segments: 28 }),
      stubbleMaterial({ repeat: [2, 1], bumpScale: 0.024 })
    )
    bale.rotation.z = Math.PI / 2
    bale.position.set(-5.4 + (i % 3) * 1.25, i === 3 ? 1.12 : 0.48, -10.4 - (i % 2) * 0.65)
    if (i === 3) bale.position.set(-4.8, 1.12, -10.65)
    bale.castShadow = true
    scene.add(bale)
  }

  // 7) 农业物联网气象站（风杯可随帧旋转）
  const wx = new THREE.Group()
  wx.position.set(-15.6, 0.1, -6.2)
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 2.15, 14), gold)
  mast.position.y = 1.08
  mast.castShadow = true
  wx.add(mast)
  weatherCups = new THREE.Group()
  weatherCups.position.y = 2.15
  const cupHub = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 10), dark)
  weatherCups.add(cupHub)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 8), dark)
    arm.rotation.z = Math.PI / 2
    arm.rotation.y = a
    arm.position.set(Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17)
    weatherCups.add(arm)
    const cup = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 8), white)
    cup.scale.set(1, 0.6, 0.5)
    cup.position.set(Math.cos(a) * 0.34, 0, Math.sin(a) * 0.34)
    weatherCups.add(cup)
  }
  wx.add(weatherCups)
  const solarPanel = new THREE.Mesh(roundedBox(0.58, 0.04, 0.44, 0.01, 2), dark)
  solarPanel.position.set(0.34, 1.55, 0)
  solarPanel.rotation.z = -0.35
  wx.add(solarPanel)
  const box = new THREE.Mesh(roundedBox(0.44, 0.38, 0.36, 0.05, 4), white)
  box.position.set(-0.42, 0.22, 0)
  box.castShadow = true
  wx.add(box)
  scene.add(wx)

  // 8) 生态总渠智慧节制闸
  const gate = new THREE.Group()
  gate.position.set(6.5, 0.1, 18.42)
  for (const sx of [-0.38, 0.38]) {
    const pier = new THREE.Mesh(roundedBox(0.16, 0.68, 0.62, 0.03, 3), white)
    pier.position.set(sx, 0.34, 0)
    pier.castShadow = true
    gate.add(pier)
  }
  const topBeam = new THREE.Mesh(roundedBox(0.98, 0.14, 0.46, 0.03, 3), white)
  topBeam.position.y = 0.72
  gate.add(topBeam)
  const sluicePlate = new THREE.Mesh(roundedBox(0.6, 0.48, 0.05, 0.01, 2), dark)
  sluicePlate.position.y = 0.28
  gate.add(sluicePlate)
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.024, 10, 28), gold)
  wheel.position.set(0, 0.88, 0)
  gate.add(wheel)
  scene.add(gate)
}

/* ---------------- 2. 素烧白瓷数字粮仓群、工作塔与运粮重卡港 ---------------- */
const buildSiloComplex = () => {
  const group = new THREE.Group()
  group.position.set(-11.2, 0.2, 2.0)
  group.userData.pickKey = 'silo'

  const white = porcelainMaterial({ repeat: [3, 3], roughness: 0.25 })
  const warmStone = paperMaterial({ repeat: [2, 2], color: 0xE6DFD2, roughness: 0.78 })
  const gold = metalMaterial(PALETTE.gold, { roughness: 0.26, metalness: 0.86, repeat: [3, 1] })
  const steel = lacquerMaterial(0x524E46, { roughness: 0.42, metalness: 0.62 })
  const red = lacquerMaterial(PALETTE.red, { roughness: 0.28, metalness: 0.18, clearcoat: 0.85 })
  const rubber = rubberMaterial({ repeat: [2, 1], roughness: 0.9 })

  const bodyGeo = bevelCylinder(1.48, 4.2, { bevel: 0.12, segments: 96, arcSegments: 8 })
  const capGeo = lathe([
    [0, -0.06], [1.5, -0.06], [1.56, -0.02], [1.5, 0.04],
    [1.18, 0.34], [0.66, 0.66], [0.22, 0.88], [0, 0.92]
  ], 96)
  const baseGeo = bevelCylinder(1.72, 0.28, { bevel: 0.06, segments: 64 })
  const ribGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.92, 8)
  const bandGeo = new THREE.TorusGeometry(1.495, 0.018, 8, 72)

  // 1) 三座主立筒大仓（前排 z = -0.55）
  for (let i = 0; i < 3; i++) {
    const single = new THREE.Group()
    single.position.set(i * 3.2 - 2.3, 2.1, -0.55)

    const body = new THREE.Mesh(bodyGeo, white)
    body.castShadow = true
    body.receiveShadow = true
    single.add(body)

    const cap = new THREE.Mesh(capGeo, gold)
    cap.position.y = 2.1
    cap.castShadow = true
    single.add(cap)

    const foot = new THREE.Mesh(baseGeo, warmStone)
    foot.position.y = -2.1
    foot.receiveShadow = true
    single.add(foot)

    // 竖向精密加强筋 + 三道水平箍带
    const ribs = new THREE.InstancedMesh(ribGeo, gold, 18)
    const d = new THREE.Object3D()
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2
      d.position.set(Math.cos(a) * 1.485, 0, Math.sin(a) * 1.485)
      d.rotation.set(0, 0, 0)
      d.updateMatrix()
      ribs.setMatrixAt(k, d.matrix)
    }
    ribs.instanceMatrix.needsUpdate = true
    single.add(ribs)

    for (const by of [-1.1, 0.1, 1.3]) {
      const band = new THREE.Mesh(bandGeo, gold)
      band.rotation.x = Math.PI / 2
      band.position.y = by
      single.add(band)
    }

    // 顶部呼吸阀与充氮气调环管
    const vent = new THREE.Mesh(bevelCylinder(0.16, 0.24, { bevel: 0.05, segments: 32 }), gold)
    vent.position.y = 3.04
    single.add(vent)

    // 仓壁编码铭牌
    const codeTex = labelTexture(`GRAIN  0${i + 1}`, {
      width: 384, height: 96, font: '600 48px Georgia, serif', color: '#8C6226'
    })
    labelTextures.push(codeTex)
    const codePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95, 0.24),
      new THREE.MeshBasicMaterial({ map: codeTex, transparent: true, depthWrite: false, toneMapped: false })
    )
    codePlane.position.set(0, 0.68, 1.505)
    codePlane.userData.excludeFromAO = true
    single.add(codePlane)

    group.add(single)
  }

  // 2) 后排两座副调质立筒仓（形成错落有致的建筑群天际线）
  const subBodyGeo = bevelCylinder(1.08, 3.5, { bevel: 0.1, segments: 64 })
  const subCapGeo = lathe([
    [0, -0.04], [1.1, -0.04], [1.14, 0.02], [0.82, 0.3], [0.24, 0.62], [0, 0.68]
  ], 64)
  for (let i = 0; i < 2; i++) {
    const sub = new THREE.Group()
    sub.position.set(i * 3.2 - 0.7, 1.75, -2.85)
    const b = new THREE.Mesh(subBodyGeo, white)
    b.castShadow = true
    b.receiveShadow = true
    sub.add(b)
    const c = new THREE.Mesh(subCapGeo, gold)
    c.position.y = 1.75
    c.castShadow = true
    sub.add(c)
    const f = new THREE.Mesh(bevelCylinder(1.24, 0.22, { bevel: 0.05, segments: 48 }), warmStone)
    f.position.y = -1.75
    sub.add(f)
    group.add(sub)
  }

  // 3) 西侧高耸提升机工作塔（Headhouse Elevator Tower）
  const tower = new THREE.Group()
  tower.position.set(-4.35, 0, -1.2)
  const towerBody = new THREE.Mesh(roundedBox(1.55, 5.4, 2.2, 0.12, 6), white)
  towerBody.position.y = 2.7
  towerBody.castShadow = true
  towerBody.receiveShadow = true
  tower.add(towerBody)
  const towerCrown = new THREE.Mesh(roundedBox(1.68, 0.22, 2.34, 0.06, 4), gold)
  towerCrown.position.y = 5.45
  tower.add(towerCrown)
  // 工作塔百叶窗与赤红「吉粮」印章徽标
  for (let k = 0; k < 4; k++) {
    const win = new THREE.Mesh(roundedBox(0.82, 0.32, 0.04, 0.01, 2), steel)
    win.position.set(0, 1.4 + k * 0.92, 1.1)
    tower.add(win)
  }
  const seal = new THREE.Mesh(roundedBox(0.52, 0.52, 0.05, 0.04, 3), red)
  seal.position.set(0, 4.65, 1.1)
  tower.add(seal)
  group.add(tower)

  // 4) 顶部封闭式输粮栈桥（连接工作塔与全部主仓顶）
  const conveyor = new THREE.Mesh(roundedBox(9.2, 0.32, 0.42, 0.1, 5), steel)
  conveyor.position.set(-0.2, 4.25, -0.55)
  conveyor.castShadow = true
  group.add(conveyor)
  const convGold = new THREE.Mesh(roundedBox(9.26, 0.05, 0.46, 0.015, 2), gold)
  convGold.position.set(-0.2, 4.44, -0.55)
  group.add(convGold)
  for (const x of [-2.3, 0.9, 4.1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.8, 16), steel)
    pillar.position.set(x, 3.25, -0.55)
    group.add(pillar)
  }

  // 5) 前场散粮装卸雨棚、地磅与微缩运粮重卡
  const canopy = new THREE.Mesh(roundedBox(3.4, 0.1, 1.25, 0.04, 3), white)
  canopy.position.set(-0.7, 1.15, 1.95)
  canopy.castShadow = true
  group.add(canopy)
  const canopyTrim = new THREE.Mesh(roundedBox(3.46, 0.035, 1.3, 0.015, 2), gold)
  canopyTrim.position.set(-0.7, 1.21, 1.95)
  group.add(canopyTrim)
  for (const sx of [-1.4, 0, 1.4]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 1.1, 12), gold)
    post.position.set(-0.7 + sx, 0.56, 1.95)
    group.add(post)
  }

  // 两辆微缩红白运粮重卡
  const truckPositions = [
    { x: -1.35, z: 2.85, rot: 0 },
    { x: 1.85, z: 2.85, rot: 0.12 }
  ]
  truckPositions.forEach((tp) => {
    const truck = new THREE.Group()
    truck.position.set(tp.x, 0.02, tp.z)
    truck.rotation.y = tp.rot
    const cab = new THREE.Mesh(roundedBox(0.46, 0.38, 0.42, 0.05, 4), red)
    cab.position.set(-0.56, 0.25, 0)
    cab.castShadow = true
    truck.add(cab)
    const cargo = new THREE.Mesh(roundedBox(1.12, 0.44, 0.48, 0.05, 4), white)
    cargo.position.set(0.26, 0.29, 0)
    cargo.castShadow = true
    truck.add(cargo)
    const cargoStripe = new THREE.Mesh(roundedBox(1.14, 0.04, 0.5, 0.01, 2), gold)
    cargoStripe.position.set(0.26, 0.28, 0)
    truck.add(cargoStripe)
    for (const wx of [-0.56, 0.0, 0.58]) {
      for (const wz of [-0.24, 0.24]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16), rubber)
        w.rotation.x = Math.PI / 2
        w.position.set(wx, 0.09, wz)
        truck.add(w)
      }
    }
    group.add(truck)
  })

  scene.add(group)
  pickTargets.push(group)
}

/* ---------------- 3. 连栋光伏智慧农业温室群与水肥一体化智控中枢 ---------------- */
const buildGreenhouse = () => {
  const group = new THREE.Group()
  group.position.set(10.2, 0.2, -6.2)
  group.userData.pickKey = 'greenhouse'

  const glass = sheerGlassMaterial({ tint: 0xCEE5E7, opacity: 0.34, roughness: 0.09 })
  const ribMat = metalMaterial(0xE8E2D6, { roughness: 0.3, metalness: 0.66 })
  const frameMat = metalMaterial(PALETTE.gold, { roughness: 0.28, metalness: 0.84 })
  const solarMat = lacquerMaterial(0x23343E, { roughness: 0.2, metalness: 0.48, clearcoat: 0.92 })
  const white = porcelainMaterial({ repeat: [2, 2], roughness: 0.28 })
  const red = lacquerMaterial(PALETTE.red, { roughness: 0.3, metalness: 0.16 })
  const kneewallMat = paperMaterial({ repeat: [3, 1], color: 0xDFD7C8, roughness: 0.8 })

  // 三跨连栋拱形光伏温室（更丰富的体量与内部作物色彩对比）
  const spanOffsets = [-2.4, 0, 2.4]
  spanOffsets.forEach((zOff, idx) => {
    const shed = new THREE.Group()
    shed.position.set(-0.5, 0.72, zOff)

    // 底部保温矮墙
    for (const sz of [-1.06, 1.06]) {
      const wall = new THREE.Mesh(roundedBox(6.2, 0.26, 0.08, 0.02, 2), kneewallMat)
      wall.position.set(0, -0.58, sz)
      wall.castShadow = true
      shed.add(wall)
    }

    const shell = new THREE.Mesh(
      new THREE.CylinderGeometry(1.12, 1.12, 6.2, 48, 4, false, 0, Math.PI),
      glass
    )
    shell.rotation.z = Math.PI / 2
    shell.position.y = -0.45
    shell.castShadow = true
    shell.userData.excludeFromAO = true
    shed.add(shell)

    // 8 道精密金属拱肋
    for (let k = 0; k < 8; k++) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(1.13, 0.024, 8, 36, Math.PI), k % 2 === 0 ? frameMat : ribMat)
      rib.rotation.y = Math.PI / 2
      rib.position.set(-2.8 + k * 0.8, -0.45, 0)
      shed.add(rib)
    }

    // 端墙半圆玻璃 + 环流风机百叶窗
    const shape = new THREE.Shape()
    shape.absarc(0, 0, 1.1, 0, Math.PI, false)
    shape.lineTo(-1.1, 0)
    const endGeo = new THREE.ShapeGeometry(shape, 36)
    for (const sx of [-1, 1]) {
      const end = new THREE.Mesh(endGeo, glass)
      end.rotation.y = Math.PI / 2
      end.position.set(sx * 3.1, -0.45, 0)
      end.userData.excludeFromAO = true
      shed.add(end)

      const fanRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 10, 24), frameMat)
      fanRing.rotation.y = Math.PI / 2
      fanRing.position.set(sx * 3.12, -0.05, 0)
      shed.add(fanRing)
    }

    // 棚内高架立体栽培槽（苔绿叶菜、翠绿秧苗与赤红浆果交替）
    const cropColors = [0x3D6E4A, 0x628E52, 0x4E7A55]
    const bedMat = ridgeMaterial(cropColors[idx % 3], { repeat: [3, 1], roughness: 0.84 })
    for (let k = -1; k <= 1; k++) {
      const bed = new THREE.Mesh(roundedBox(5.6, 0.16, 0.44, 0.05, 4), bedMat)
      bed.position.set(0, -0.58, k * 0.56)
      bed.receiveShadow = true
      shed.add(bed)
    }
    if (idx === 1) {
      // 中跨棚点缀有机草莓/番茄红果，呼应色板赤红
      for (let f = 0; f < 10; f++) {
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), red)
        berry.position.set(-2.2 + f * 0.48, -0.46, (f % 2 === 0 ? -0.56 : 0.56))
        shed.add(berry)
      }
    }

    // 棚顶南向单晶硅光伏板列阵
    for (let k = 0; k < 5; k++) {
      const panel = new THREE.Mesh(roundedBox(0.96, 0.038, 0.64, 0.012, 2), solarMat)
      panel.position.set(-2.2 + k * 1.1, 0.5, 0.56)
      panel.rotation.x = 0.44
      panel.castShadow = true
      shed.add(panel)
      const border = new THREE.Mesh(roundedBox(0.98, 0.015, 0.66, 0.01, 2), frameMat)
      border.position.set(-2.2 + k * 1.1, 0.49, 0.56)
      border.rotation.x = 0.44
      shed.add(border)
    }

    group.add(shed)
  })

  // 东侧连廊与水肥一体化智控中心（白瓷控制房 + 双座营养液储罐）
  const ctrlRoom = new THREE.Mesh(roundedBox(1.35, 1.05, 2.6, 0.09, 5), white)
  ctrlRoom.position.set(3.45, 0.52, -0.8)
  ctrlRoom.castShadow = true
  ctrlRoom.receiveShadow = true
  group.add(ctrlRoom)
  const ctrlRoof = new THREE.Mesh(roundedBox(1.48, 0.09, 2.74, 0.04, 3), frameMat)
  ctrlRoof.position.set(3.45, 1.08, -0.8)
  group.add(ctrlRoof)

  for (let i = 0; i < 2; i++) {
    const tank = new THREE.Mesh(bevelCylinder(0.42, 1.15, { bevel: 0.08, segments: 36 }), white)
    tank.position.set(3.45, 0.58, 1.25 + i * 1.05)
    tank.castShadow = true
    group.add(tank)
    const tankBand = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.02, 8, 36), frameMat)
    tankBand.rotation.x = Math.PI / 2
    tankBand.position.set(3.45, 0.72, 1.25 + i * 1.05)
    group.add(tankBand)
  }

  scene.add(group)
  pickTargets.push(group)
}

/* ---------------- 4. 白城清洁能源风电机组与储能升压微网 ---------------- */
// NACA 弯度翼型截面 + 根部圆柱过渡 + 扭转弦长收束，取代原先的扭曲板状体
const makeBladeGeometry = (length = 4.25) => airfoilBladeGeometry(length, 0.66, 28, 44)

const buildWindTurbines = () => {
  const positions = [{ x: -14.2, z: -14.2 }, { x: -9.8, z: -15.8 }, { x: -15.8, z: -9.2 }]
  const white = porcelainMaterial({ repeat: [2, 4], roughness: 0.25 })
  const bladeMat = lacquerMaterial(0xEFE8DA, { roughness: 0.34, metalness: 0.08, clearcoat: 0.65 })
  const gold = metalMaterial(PALETTE.gold, { roughness: 0.28, metalness: 0.86 })
  const red = lacquerMaterial(PALETTE.red, { roughness: 0.28, metalness: 0.16, clearcoat: 0.8 })
  const dark = lacquerMaterial(0x2F2D29, { roughness: 0.48, metalness: 0.42 })

  const towerGeo = lathe([
    [0, 0], [0.27, 0], [0.25, 0.7], [0.21, 3.0], [0.165, 6.0], [0.13, 9.0], [0.125, 9.45], [0, 9.45]
  ], 80)
  const bladeGeo = makeBladeGeometry()

  positions.forEach((p) => {
    const group = new THREE.Group()
    group.position.set(p.x, 0.2, p.z)
    group.userData.pickKey = 'windpower'

    const tower = new THREE.Mesh(towerGeo, white)
    tower.castShadow = true
    tower.receiveShadow = true
    group.add(tower)

    // 塔筒底部赤红与琥珀金色环，强化工业设计感
    const baseRing = new THREE.Mesh(bevelCylinder(0.48, 0.26, { bevel: 0.07, segments: 48 }), gold)
    baseRing.position.y = 0.12
    group.add(baseRing)
    const redStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.242, 0.252, 0.28, 48), red)
    redStripe.position.y = 0.68
    group.add(redStripe)
    const neckStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.136, 0.142, 0.18, 40), gold)
    neckStripe.position.y = 8.75
    group.add(neckStripe)

    const nacelle = new THREE.Mesh(roundedBox(0.7, 0.56, 1.24, 0.2, 7), white)
    nacelle.position.set(0, 9.45, -0.1)
    nacelle.castShadow = true
    group.add(nacelle)
    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 10, 40), gold)
    tail.rotation.y = Math.PI / 2
    tail.position.set(0, 9.45, -0.74)
    group.add(tail)
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), red)
    beacon.position.set(0, 9.78, -0.35)
    group.add(beacon)

    const rotor = new THREE.Group()
    rotor.position.set(0, 9.45, 0.64)
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 18), white)
    hub.scale.z = 1.32
    rotor.add(hub)
    const hubRing = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.026, 10, 36), gold)
    hubRing.position.z = 0.14
    rotor.add(hubRing)
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 24), gold)
    nose.rotation.x = Math.PI / 2
    nose.position.z = 0.42
    rotor.add(nose)

    const tipGeo = new THREE.SphereGeometry(0.082, 14, 10)
    const leadingEdge = new THREE.CylinderGeometry(0.014, 0.014, 4.0, 10)
    leadingEdge.translate(0, 2.0, 0)
    for (let b = 0; b < 3; b++) {
      const angle = (b * Math.PI * 2) / 3
      const blade = new THREE.Mesh(bladeGeo, bladeMat)
      blade.rotation.z = angle
      blade.castShadow = true
      rotor.add(blade)
      const edge = new THREE.Mesh(leadingEdge, gold)
      edge.position.x = 0.2
      blade.add(edge)
      // 叶尖赤红航标球，在米白背景中清晰勾勒旋转轨迹
      const tip = new THREE.Mesh(tipGeo, red)
      tip.position.set(-Math.sin(angle) * 4.12, Math.cos(angle) * 4.12, 0.04)
      rotor.add(tip)
    }
    group.add(rotor)
    windmills.push(rotor)

    const yawBase = new THREE.Group()
    yawBase.add(group)
    scene.add(yawBase)
    turbineYaw.push(yawBase)
    pickTargets.push(group)
  })

  // 风场配套：升压变电站与两座磷酸铁锂储能集装箱（位于风电地坪东侧）
  const storageGroup = new THREE.Group()
  storageGroup.position.set(-11.4, 0.2, -11.8)
  storageGroup.userData.pickKey = 'windpower'
  for (let i = 0; i < 2; i++) {
    const box = new THREE.Mesh(roundedBox(2.2, 0.72, 0.88, 0.06, 4), white)
    box.position.set(0, 0.36, i * 1.25)
    box.castShadow = true
    box.receiveShadow = true
    storageGroup.add(box)
    const stripe = new THREE.Mesh(roundedBox(2.24, 0.08, 0.9, 0.02, 2), gold)
    stripe.position.set(0, 0.58, i * 1.25)
    storageGroup.add(stripe)
    const door = new THREE.Mesh(roundedBox(0.45, 0.48, 0.9, 0.01, 2), dark)
    door.position.set(0.65, 0.32, i * 1.25)
    storageGroup.add(door)
  }
  scene.add(storageGroup)
  pickTargets.push(storageGroup)
}

/* ---------------- 5. 黄金稻浪核心示范田、无人收割机与田间观景台 ---------------- */
const makeStalkGeometry = (height = 0.42) => {
  const parts = []
  const stem = new THREE.CylinderGeometry(0.007, 0.013, height, 8, 5)
  stem.translate(0, height / 2, 0)
  parts.push(stem)

  const rachis = new THREE.CylinderGeometry(0.004, 0.007, 0.19, 6, 2)
  rachis.rotateZ(0.18)
  rachis.translate(0.016, height + 0.09, 0)
  parts.push(rachis)
  for (let k = 0; k < 8; k++) {
    const t = k / 7
    const grain = new THREE.SphereGeometry(0.016, 7, 5)
    grain.scale(0.85, 1.65, 0.85)
    grain.translate(
      0.016 + t * 0.046 + Math.sin(k * 2.3) * 0.013,
      height + 0.02 + t * 0.17,
      Math.cos(k * 2.3) * 0.013
    )
    parts.push(grain)
  }
  const awn = new THREE.ConeGeometry(0.008, 0.075, 6, 1)
  awn.translate(0.066, height + 0.215, 0)
  parts.push(awn)

  const leafA = new THREE.SphereGeometry(0.05, 8, 6)
  leafA.scale(0.28, 1.9, 0.13)
  leafA.rotateZ(-0.62)
  leafA.translate(-0.042, height * 0.62, 0)
  parts.push(leafA)
  const leafB = new THREE.SphereGeometry(0.045, 8, 6)
  leafB.scale(0.26, 1.7, 0.13)
  leafB.rotateZ(0.66)
  leafB.translate(0.04, height * 0.46, 0.012)
  parts.push(leafB)

  return mergeParts(parts)
}

const buildCropsField = () => {
  const group = new THREE.Group()
  group.position.set(4, 0.2, 5)
  group.userData.pickKey = 'field'

  const ridgeMat = stubbleMaterial({ repeat: [6, 1], bumpScale: 0.03 })
  const furrowMat = chernozemMaterial({ repeat: [6, 1], bumpScale: 0.018 })
  const paddyWaterMat = sheerGlassMaterial({ tint: SANDBOX_COLORS.celadonWater, opacity: 0.36, roughness: 0.12 })
  const bankMat = new THREE.MeshStandardMaterial({ color: 0x6E5D46, roughness: 0.92 })
  const white = porcelainMaterial({ repeat: [2, 2], roughness: 0.28 })
  const red = lacquerMaterial(PALETTE.red, { roughness: 0.28, metalness: 0.18, clearcoat: 0.85 })
  const gold = metalMaterial(PALETTE.gold, { roughness: 0.28, metalness: 0.84 })
  const dark = lacquerMaterial(0x2D2A26, { roughness: 0.5, metalness: 0.36 })
  const wood = woodMaterial({ repeat: [2, 2], color: 0xCEB898, roughness: 0.64 })

  for (let r = 0; r < 8; r++) {
    const ridge = new THREE.Mesh(roundedBox(10.6, 0.18, 0.74, 0.045, 5), ridgeMat)
    ridge.position.set(0, 0.1, r * 1.05 - 3.7)
    ridge.castShadow = true
    ridge.receiveShadow = true
    ridge.userData = { phase: r * 0.42 }
    group.add(ridge)
    cropBlades.push(ridge)

    const furrow = new THREE.Mesh(roundedBox(10.6, 0.045, 0.24, 0.015, 2), furrowMat)
    furrow.position.set(0, 0.03, r * 1.05 - 3.2)
    furrow.receiveShadow = true
    group.add(furrow)

    // 稻田垄间微水镜面反光，还原东北优质水田质感
    if (r < 7) {
      const sheen = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 0.22), paddyWaterMat)
      sheen.rotation.x = -Math.PI / 2
      sheen.position.set(0, 0.056, r * 1.05 - 3.18)
      sheen.userData.excludeFromAO = true
      group.add(sheen)
    }
  }

  // 示范田四周围埂与四角包金护桩
  const hBank = roundedBox(12.4, 0.12, 0.22, 0.035, 3)
  const vBank = roundedBox(0.22, 0.12, 9.6, 0.035, 3)
  for (const s of [-1, 1]) {
    const bh = new THREE.Mesh(hBank, bankMat)
    bh.position.set(0, 0.13, s * 4.72)
    bh.castShadow = true
    group.add(bh)
    const bv = new THREE.Mesh(vBank, bankMat)
    bv.position.set(s * 6.12, 0.13, 0)
    bv.castShadow = true
    group.add(bv)
  }

  // 双色调金秋稻穗（亮金 + 深琥珀金交织）+ 青绿晚熟对照带
  const stalkGeo = makeStalkGeometry()
  const rnd = mulberry32(686)
  const dummy = new THREE.Object3D()
  const goldCount = props.compact ? 320 : 1150
  const amberCount = props.compact ? 180 : 620
  const greenCount = props.compact ? 160 : 560

  const goldMat = new THREE.MeshStandardMaterial({
    color: SANDBOX_COLORS.riceGold, roughness: 0.74, metalness: 0.04, side: THREE.DoubleSide
  })
  const amberMat = new THREE.MeshStandardMaterial({
    color: SANDBOX_COLORS.riceAmber, roughness: 0.78, metalness: 0.03, side: THREE.DoubleSide
  })
  const greenMat = new THREE.MeshStandardMaterial({
    color: 0x4C7A52, roughness: 0.8, metalness: 0.02, side: THREE.DoubleSide
  })
  windGold = applyWind(goldMat, { amount: 0.16, speed: 1.25, phaseScale: 0.9 })
  windAmber = applyWind(amberMat, { amount: 0.15, speed: 1.2, phaseScale: 1.05 })
  windMoss = applyWind(greenMat, { amount: 0.14, speed: 1.15, phaseScale: 1.1 })

  const placeRows = (mesh, count, { rows, zStart, zStep, x0, x1, baseY, jitter }) => {
    const per = Math.ceil(count / rows)
    let idx = 0
    for (let r = 0; r < rows && idx < count; r++) {
      const zc = zStart + r * zStep
      for (let k = 0; k < per && idx < count; k++) {
        dummy.position.set(x0 + rnd() * (x1 - x0), baseY, zc + (rnd() - 0.5) * jitter)
        dummy.rotation.set((rnd() - 0.5) * 0.15, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.18)
        const s = 0.74 + rnd() * 0.6
        dummy.scale.set(s, s, s)
        dummy.updateMatrix()
        mesh.setMatrixAt(idx++, dummy.matrix)
      }
    }
    mesh.count = idx
    mesh.instanceMatrix.needsUpdate = true
    mesh.castShadow = true
    group.add(mesh)
  }
  placeRows(new THREE.InstancedMesh(stalkGeo, goldMat, goldCount), goldCount, {
    rows: 8, zStart: -3.7, zStep: 1.05, x0: -5.1, x1: 5.1, baseY: 0.19, jitter: 0.5
  })
  placeRows(new THREE.InstancedMesh(stalkGeo, amberMat, amberCount), amberCount, {
    rows: 8, zStart: -3.7, zStep: 1.05, x0: -5.0, x1: 5.0, baseY: 0.19, jitter: 0.48
  })
  placeRows(new THREE.InstancedMesh(stalkGeo, greenMat, greenCount), greenCount, {
    rows: 6, zStart: -2.6, zStep: 1.05, x0: 7.9, x1: 12.1, baseY: 0.17, jitter: 0.46
  })

  // 绿色生态对照实验田：独立黑土底板 + 垄块
  const greenBed = new THREE.Mesh(
    roundedBox(5.6, 0.14, 6.5, 0.08, 5),
    chernozemMaterial({ repeat: [3, 3], bumpScale: 0.024 })
  )
  greenBed.position.set(10, 0.05, 0)
  greenBed.receiveShadow = true
  greenBed.castShadow = true
  group.add(greenBed)
  const greenRidge = ridgeMaterial(0x5C7F55, { repeat: [4, 1], roughness: 0.86 })
  for (let r = 0; r < 6; r++) {
    const ridge = new THREE.Mesh(roundedBox(4.8, 0.14, 0.68, 0.04, 4), greenRidge)
    ridge.position.set(10, 0.09, r * 1.05 - 2.6)
    ridge.castShadow = true
    group.add(ridge)
  }

  // 微缩红白无人联合收割机（在示范田北侧垄道收割作业）
  const harvester = new THREE.Group()
  harvester.position.set(-3.2, 0.22, -3.7)
  harvester.rotation.y = Math.PI / 2
  const hBody = new THREE.Mesh(roundedBox(0.56, 0.42, 0.96, 0.06, 5), red)
  hBody.position.y = 0.28
  hBody.castShadow = true
  harvester.add(hBody)
  const hTank = new THREE.Mesh(roundedBox(0.52, 0.24, 0.56, 0.04, 4), white)
  hTank.position.set(0, 0.54, -0.08)
  harvester.add(hTank)
  const hCab = new THREE.Mesh(roundedBox(0.46, 0.34, 0.36, 0.04, 4), dark)
  hCab.position.set(0, 0.52, 0.32)
  harvester.add(hCab)
  // 前置拨禾轮与割台
  const header = new THREE.Mesh(roundedBox(0.92, 0.12, 0.26, 0.02, 3), gold)
  header.position.set(0, 0.12, 0.62)
  harvester.add(header)
  const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.88, 14), gold)
  reel.rotation.z = Math.PI / 2
  reel.position.set(0, 0.22, 0.68)
  harvester.add(reel)
  // 卸粮筒
  const auger = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.78, 12), gold)
  auger.rotation.z = 0.95
  auger.position.set(0.42, 0.62, -0.1)
  harvester.add(auger)
  group.add(harvester)

  // 田间生态农情观景亭（示范田西南角 x = -5.6, z = 4.2）
  const pavilion = new THREE.Group()
  pavilion.position.set(-5.6, 0.14, 4.2)
  const pDeck = new THREE.Mesh(roundedBox(1.45, 0.1, 1.45, 0.04, 4), wood)
  pDeck.position.y = 0.55
  pDeck.castShadow = true
  pavilion.add(pDeck)
  const pRoof = new THREE.Mesh(roundedBox(1.62, 0.08, 1.62, 0.04, 4), white)
  pRoof.position.y = 1.32
  pRoof.castShadow = true
  pavilion.add(pRoof)
  const pCap = new THREE.Mesh(roundedBox(0.65, 0.05, 0.65, 0.02, 3), gold)
  pCap.position.y = 1.38
  pavilion.add(pCap)
  for (const sx of [-0.6, 0.6]) {
    for (const sz of [-0.6, 0.6]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 1.28, 12), gold)
      col.position.set(sx, 0.66, sz)
      pavilion.add(col)
    }
  }
  group.add(pavilion)

  // 免耕秸秆覆盖细金线
  const strawGeo = roundedBox(0.22, 0.012, 0.012, 0.005, 1)
  const straw = new THREE.InstancedMesh(strawGeo, goldMat, props.compact ? 180 : 620)
  for (let i = 0; i < straw.count; i++) {
    dummy.position.set((rnd() - 0.5) * 10.2, 0.04, (rnd() - 0.5) * 8.2)
    dummy.rotation.set(0, rnd() * Math.PI, 0)
    dummy.scale.set(0.7 + rnd(), 1, 1)
    dummy.updateMatrix()
    straw.setMatrixAt(i, dummy.matrix)
  }
  straw.instanceMatrix.needsUpdate = true
  group.add(straw)

  scene.add(group)
  pickTargets.push(group)
}

/* ---------------- 6. 多光谱巡检无人机与双环扫描视场 ---------------- */
const buildInspectionDrone = () => {
  const pts = []
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2
    pts.push(new THREE.Vector3(11 * Math.sin(a), 5.4 + 0.65 * Math.cos(2 * a), 4.5 * Math.sin(2 * a)))
  }
  const route = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineDashedMaterial({
      color: PALETTE.gold, dashSize: 0.42, gapSize: 0.32,
      transparent: true, opacity: 0.36, depthWrite: false
    })
  )
  route.computeLineDistances()
  route.userData.excludeFromAO = true
  scene.add(route)

  drone = new THREE.Group()
  drone.userData.pickKey = 'drone'
  drone.position.copy(pts[0])

  const white = porcelainMaterial({ repeat: [1, 1], roughness: 0.24 })
  const dark = lacquerMaterial(0x262422, { roughness: 0.38, metalness: 0.55 })
  const gold = metalMaterial(PALETTE.gold, { roughness: 0.26, metalness: 0.88 })
  const red = lacquerMaterial(PALETTE.red, { roughness: 0.28, metalness: 0.2 })

  const body = new THREE.Mesh(roundedBox(0.82, 0.2, 0.82, 0.09, 6), white)
  body.castShadow = true
  drone.add(body)
  const canopy = new THREE.Mesh(roundedBox(0.54, 0.11, 0.54, 0.05, 5), dark)
  canopy.position.y = 0.13
  drone.add(canopy)
  const rtkHat = new THREE.Mesh(bevelCylinder(0.08, 0.06, { bevel: 0.02, segments: 20 }), gold)
  rtkHat.position.set(0, 0.21, -0.1)
  drone.add(rtkHat)
  const strip = new THREE.Mesh(roundedBox(0.84, 0.024, 0.09, 0.008, 2), red)
  strip.position.y = 0.11
  drone.add(strip)

  // 起落架滑橇
  for (const sx of [-0.28, 0.28]) {
    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.66, 10), gold)
    skid.rotation.x = Math.PI / 2
    skid.position.set(sx, -0.24, 0)
    drone.add(skid)
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), dark)
    strut.position.set(sx, -0.12, 0)
    drone.add(strut)
  }

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const ax = Math.cos(a) * 0.56
    const az = Math.sin(a) * 0.56
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.66, 14), dark)
    arm.rotation.z = Math.PI / 2
    arm.rotation.y = -a
    arm.position.set(ax * 0.55, 0.02, az * 0.55)
    drone.add(arm)

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.022, 10, 36), gold)
    ring.rotation.x = Math.PI / 2
    ring.position.set(ax, 0.08, az)
    drone.add(ring)

    const rotor = new THREE.Group()
    rotor.position.set(ax, 0.1, az)
    const propMat = lacquerMaterial(0x46433E, { roughness: 0.45, metalness: 0.35 })
    for (let k = 0; k < 2; k++) {
      const prop = new THREE.Mesh(roundedBox(0.46, 0.012, 0.055, 0.01, 2), propMat)
      prop.rotation.y = k * Math.PI / 2
      rotor.add(prop)
    }
    const spinner = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 12), gold)
    rotor.add(spinner)
    drone.add(rotor)
    droneRotors.push(rotor)
  }

  const gimbal = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 14), dark)
  gimbal.position.y = -0.16
  drone.add(gimbal)
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.068, 0.09, 24), gold)
  lens.position.y = -0.25
  drone.add(lens)

  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(1.55, 3.6, 40, 3, true),
    new THREE.MeshBasicMaterial({
      color: 0xC88A32, transparent: true, opacity: 0.11,
      side: THREE.DoubleSide, depthWrite: false
    })
  )
  beam.position.y = -1.9
  beam.rotation.x = Math.PI
  beam.userData.excludeFromAO = true
  drone.add(beam)

  scanRing = new THREE.Mesh(
    new THREE.RingGeometry(1.22, 1.52, 56),
    new THREE.MeshBasicMaterial({
      color: PALETTE.gold, transparent: true, opacity: 0.36,
      side: THREE.DoubleSide, depthWrite: false
    })
  )
  scanRing.rotation.x = -Math.PI / 2
  scanRing.position.y = 0.21
  scanRing.userData.excludeFromAO = true
  scene.add(scanRing)

  scanInner = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.48, 40),
    new THREE.MeshBasicMaterial({
      color: PALETTE.moss, transparent: true, opacity: 0.42,
      side: THREE.DoubleSide, depthWrite: false
    })
  )
  scanInner.rotation.x = -Math.PI / 2
  scanInner.position.y = 0.215
  scanInner.userData.excludeFromAO = true
  scene.add(scanInner)

  scene.add(drone)
  pickTargets.push(drone)
}

/* ---------------- 7. 松花江青玉水系与汉白玉双曲拱桥 ---------------- */
const buildRiver = () => {
  const group = new THREE.Group()
  group.userData.pickKey = 'river'

  // 青玉釉水面：与暖白展台、苔藓青植被及深棕黑土形成东方山水画卷色调
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: SANDBOX_COLORS.celadonWater,
    roughness: 0.06,
    metalness: 0.04,
    transmission: 0.36,
    thickness: 0.35,
    ior: 1.33,
    normalMap: waterNormalMap([14, 2]),
    normalScale: new THREE.Vector2(0.28, 0.28),
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false,
    envMapIntensity: 1.32
  })
  waterMat.userData.excludeFromAO = true
  waveUpdate = applyWave(waterMat, {
    amplitude: 0.042, speed: 1.1, frequency: 3.5,
    verticalAxis: 'y', phaseFromZ: true
  })
  const water = new THREE.Mesh(
    makeRibbonGeometry(-19.2, 19.2, 160, RIVER_HALF, 0.095, 3.2),
    waterMat
  )
  water.receiveShadow = true
  water.userData.excludeFromAO = true
  group.add(water)

  // 江心墨玉深水带与两道暖金波光
  const deep = new THREE.Mesh(
    makeRibbonGeometry(-19.2, 19.2, 144, RIVER_HALF * 0.56, 0.062, 3.2),
    new THREE.MeshBasicMaterial({
      color: SANDBOX_COLORS.celadonDeep, transparent: true, opacity: 0.54,
      side: THREE.DoubleSide, depthWrite: false
    })
  )
  deep.userData.excludeFromAO = true
  group.add(deep)
  for (const s of [-1, 1]) {
    const glare = new THREE.Mesh(
      makeRibbonGeometry(-19.2, 19.2, 144, 0.065, 0.118, 2.4),
      new THREE.MeshBasicMaterial({
        color: 0xF7F4EE, transparent: true, opacity: 0.24,
        side: THREE.DoubleSide, depthWrite: false
      })
    )
    glare.position.z = s * RIVER_HALF * 0.5
    glare.userData.excludeFromAO = true
    group.add(glare)
  }

  // 汉白玉拱桥（带桥头望柱、雕花栏板与鎏金扶手）
  const marble = porcelainMaterial({ repeat: [3, 1], roughness: 0.26 })
  const gold = metalMaterial(PALETTE.gold, { roughness: 0.28, metalness: 0.85 })
  const red = lacquerMaterial(PALETTE.red, { roughness: 0.3, metalness: 0.16 })
  const bridge = new THREE.Group()
  bridge.position.set(0, 0.06, RIVER_Z(0))
  bridge.rotation.y = -Math.atan(RIVER_DZ(0))

  for (const sx of [-1, 1]) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.04, 0.14, 16, 72, Math.PI), marble)
    arch.rotation.y = Math.PI / 2
    arch.position.x = sx * 0.66
    arch.castShadow = true
    bridge.add(arch)
    const archLine = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.02, 8, 72, Math.PI), gold)
    archLine.rotation.y = Math.PI / 2
    archLine.position.x = sx * 0.66
    bridge.add(archLine)
  }

  const deckSeg = roundedBox(1.44, 0.14, 0.32, 0.045, 3)
  const railGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.28, 10)
  const panelGeo = roundedBox(0.025, 0.18, 0.22, 0.008, 2)
  const railCap = new THREE.SphereGeometry(0.036, 12, 10)
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI
    const y = Math.sin(a) * 2.04 + 0.16
    const z = Math.cos(a) * 2.04
    const seg = new THREE.Mesh(deckSeg, marble)
    seg.position.set(0, y, z)
    seg.rotation.x = -(Math.PI / 2 - a) * 0.42
    seg.castShadow = true
    bridge.add(seg)
    for (const sx of [-1, 1]) {
      const rail = new THREE.Mesh(railGeo, marble)
      rail.position.set(sx * 0.66, y + 0.19, z)
      bridge.add(rail)
      const cap = new THREE.Mesh(railCap, gold)
      cap.position.set(sx * 0.66, y + 0.34, z)
      bridge.add(cap)
      if (i < 16) {
        const panel = new THREE.Mesh(panelGeo, marble)
        panel.position.set(sx * 0.66, y + 0.15, z - Math.sin(a) * 0.12)
        bridge.add(panel)
      }
    }
  }
  for (const sx of [-1, 1]) {
    const handrail = new THREE.Mesh(new THREE.TorusGeometry(2.22, 0.028, 10, 72, Math.PI), gold)
    handrail.rotation.y = Math.PI / 2
    handrail.position.set(sx * 0.66, 0.35, 0)
    bridge.add(handrail)
  }

  // 四座桥头汉白玉望柱与引桥石阶
  for (const sz of [-1, 1]) {
    const pier = new THREE.Mesh(bevelCylinder(0.32, 0.76, { bevel: 0.07, segments: 36 }), marble)
    pier.position.set(0, -0.04, sz * 2.22)
    pier.castShadow = true
    bridge.add(pier)
    const step = new THREE.Mesh(roundedBox(1.58, 0.12, 0.48, 0.04, 3), marble)
    step.position.set(0, 0.06, sz * 2.6)
    bridge.add(step)
    for (const sx of [-0.72, 0.72]) {
      const pillar = new THREE.Mesh(bevelCylinder(0.075, 0.62, { bevel: 0.02, segments: 20 }), marble)
      pillar.position.set(sx, 0.38, sz * 2.42)
      pillar.castShadow = true
      bridge.add(pillar)
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.065, 14, 10), sz > 0 ? gold : red)
      finial.position.set(sx, 0.72, sz * 2.42)
      bridge.add(finial)
    }
  }

  group.add(bridge)
  scene.add(group)
  pickTargets.push(group)
}

/* ---------------- 8. 三北防护林网（常青樟子松 + 钻天杨 + 金秋白桦/落叶松）与光伏矩阵 ---------------- */
const buildVegetation = () => {
  // 1) 钻天杨：挺拔柱状冠层
  const poplarTrunk = new THREE.CylinderGeometry(0.042, 0.072, 1.15, 10)
  poplarTrunk.translate(0, 0.575, 0)
  const poplarC1 = new THREE.SphereGeometry(0.3, 14, 10)
  poplarC1.scale(1, 1.75, 1)
  poplarC1.translate(0, 1.4, 0)
  const poplarC2 = new THREE.SphereGeometry(0.23, 14, 10)
  poplarC2.scale(1, 1.55, 1)
  poplarC2.translate(0, 1.92, 0)
  const poplarGeo = mergeParts([poplarTrunk, poplarC1, poplarC2])

  // 2) 樟子松：三层宝塔圆锥冠层
  const pineTrunk = new THREE.CylinderGeometry(0.05, 0.082, 0.85, 10)
  pineTrunk.translate(0, 0.425, 0)
  const pineC1 = new THREE.ConeGeometry(0.45, 0.95, 14, 2)
  pineC1.translate(0, 1.1, 0)
  const pineC2 = new THREE.ConeGeometry(0.35, 0.85, 14, 2)
  pineC2.translate(0, 1.55, 0)
  const pineC3 = new THREE.ConeGeometry(0.24, 0.65, 14, 2)
  pineC3.translate(0, 1.95, 0)
  const pineGeo = mergeParts([pineTrunk, pineC1, pineC2, pineC3])

  // 3) 金秋白桦 / 落叶松：温润饱满冠层，赋予沙盘秋日丰收画卷层次
  const birchTrunk = new THREE.CylinderGeometry(0.038, 0.062, 1.05, 10)
  birchTrunk.translate(0, 0.525, 0)
  const birchC1 = new THREE.SphereGeometry(0.34, 14, 10)
  birchC1.scale(1.05, 1.35, 1.05)
  birchC1.translate(0, 1.32, 0)
  const birchC2 = new THREE.SphereGeometry(0.24, 12, 9)
  birchC2.scale(0.95, 1.25, 0.95)
  birchC2.translate(0.08, 1.75, 0.04)
  const birchGeo = mergeParts([birchTrunk, birchC1, birchC2])

  const poplarMat = new THREE.MeshStandardMaterial({ color: SANDBOX_COLORS.poplarGreen, roughness: 0.91, metalness: 0 })
  const pineMat = new THREE.MeshStandardMaterial({ color: SANDBOX_COLORS.pineDeep, roughness: 0.93, metalness: 0 })
  const autumnGoldMat = new THREE.MeshStandardMaterial({ color: SANDBOX_COLORS.autumnGold, roughness: 0.86, metalness: 0.02 })
  const autumnRussetMat = new THREE.MeshStandardMaterial({ color: SANDBOX_COLORS.autumnRusset, roughness: 0.88, metalness: 0.02 })

  const swayA = applyWind(poplarMat, { amount: 0.012, speed: 0.75, phaseScale: 0.55 })
  const swayB = applyWind(pineMat, { amount: 0.01, speed: 0.7, phaseScale: 0.55 })
  const swayC = applyWind(autumnGoldMat, { amount: 0.014, speed: 0.8, phaseScale: 0.6 })
  const swayD = applyWind(autumnRussetMat, { amount: 0.013, speed: 0.78, phaseScale: 0.6 })
  const prevWind = windTree
  windTree = (t) => { prevWind?.(t); swayA(t); swayB(t); swayC(t); swayD(t) }

  const rnd = mulberry32(3030)
  const turbines = [[-14.2, -14.2], [-9.8, -15.8], [-15.8, -9.2]]
  const noTreeZones = [
    ...FIELD_BLOCKS,
    { x: 4, z: 5, w: 12.4, d: 9.6 },
    { x: -11.2, z: 2.0, w: 9.2, d: 8.2 },
    { x: 10.2, z: -6.2, w: 9.0, d: 8.2 },
    { x: -13.8, z: -13.2, w: 9.6, d: 8.8 },
    { x: 9.6, z: -15.1, w: 6.8, d: 4.8 }
  ]
  const blocked = (x, z) =>
    noTreeZones.some((r) => inRect(x, z, r, 0.42)) ||
    Math.abs(z - RIVER_Z(x)) < 2.95 ||
    turbines.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 2.9)

  const spots = []
  const line = (from, to, fixed, axis, jitter = 0.12) => {
    for (let p = from; p <= to; p += 1.52) {
      const t = p + (rnd() - 0.5) * jitter * 2
      const x = axis === 'x' ? t : fixed
      const z = axis === 'x' ? fixed : t
      if (!blocked(x, z)) spots.push([x, z])
    }
  }
  line(-18.2, 18.2, -18.4, 'x')
  line(-18.2, 18.2, -17.25, 'x')
  line(-18.2, 18.2, 18.95, 'x')
  line(-16.5, 16.5, -18.65, 'z')
  line(-16.5, 16.5, 18.65, 'z')
  for (const lx of [-9.05, 0.05, 9.15]) line(10.6, 16.8, lx, 'z', 0.08)
  for (let r = 0; r < 2; r++) line(-6.6, 3.4, -16.4 + r * 1.5, 'x', 0.18)
  // 沿江生态护岸风景林点缀
  for (let x = -16.5; x <= 16.5; x += 3.2) {
    const zNorth = RIVER_Z(x) - RIVER_HALF - 1.35
    const zSouth = RIVER_Z(x) + RIVER_HALF + 1.35
    if (!blocked(x, zNorth)) spots.push([x, zNorth])
    if (!blocked(x, zSouth)) spots.push([x, zSouth])
  }

  const compact = props.compact
  const useSpots = compact ? spots.filter((_, i) => i % 2 === 0) : spots
  const poplarSpots = []
  const pineSpots = []
  const goldSpots = []
  const russetSpots = []

  useSpots.forEach((pt, i) => {
    const m = i % 9
    if (m === 0 || m === 4) pineSpots.push(pt)
    else if (m === 2 || m === 7) goldSpots.push(pt)
    else if (m === 5) russetSpots.push(pt)
    else poplarSpots.push(pt)
  })

  const dummy = new THREE.Object3D()
  const build = (geo, mat, list) => {
    if (!list.length) return
    const mesh = new THREE.InstancedMesh(geo, mat, list.length)
    list.forEach(([x, z], i) => {
      dummy.position.set(x, 0.08, z)
      dummy.rotation.set(0, rnd() * Math.PI * 2, 0)
      const s = 0.78 + rnd() * 0.46
      dummy.scale.set(s, s * (0.9 + rnd() * 0.24), s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
  }
  build(poplarGeo, poplarMat, poplarSpots)
  build(pineGeo, pineMat, pineSpots)
  build(birchGeo, autumnGoldMat, goldSpots)
  build(birchGeo, autumnRussetMat, russetSpots)

  // 田边与路旁规整绿篱灌木球（替代原先杂乱散落的碎石，保持展品级洁净度）
  const shrubGeo = new THREE.SphereGeometry(0.16, 10, 8)
  const shrubMat = new THREE.MeshStandardMaterial({ color: 0x5C7E54, roughness: 0.9 })
  const shrubPositions = []
  for (let i = -16; i <= 16; i += 2.2) {
    if (Math.abs(i) > 1.2) shrubPositions.push([i, 9.15])
  }
  const shrubs = new THREE.InstancedMesh(shrubGeo, shrubMat, shrubPositions.length)
  shrubPositions.forEach(([x, z], i) => {
    dummy.position.set(x, 0.16, z)
    dummy.scale.set(1.1, 0.75, 0.9)
    dummy.rotation.set(0, i * 0.7, 0)
    dummy.updateMatrix()
    shrubs.setMatrixAt(i, dummy.matrix)
  })
  shrubs.instanceMatrix.needsUpdate = true
  shrubs.castShadow = true
  scene.add(shrubs)

  // 农光互补地面光伏矩阵（温室群东侧）
  const solar = lacquerMaterial(0x253640, { roughness: 0.2, metalness: 0.48, clearcoat: 0.92 })
  const frame = metalMaterial(PALETTE.gold, { roughness: 0.3, metalness: 0.82 })
  const gridMat = new THREE.MeshBasicMaterial({ color: 0x9CB4BC, transparent: true, opacity: 0.42 })
  for (let r = 0; r < 2; r++) {
    for (let i = 0; i < 4; i++) {
      const px = 14.8 + i * 1.22
      const pz = -9.8 + r * 1.18
      const panel = new THREE.Mesh(roundedBox(1.1, 0.045, 0.76, 0.015, 2), solar)
      panel.position.set(px, 0.62, pz)
      panel.rotation.x = -0.42
      panel.castShadow = true
      scene.add(panel)
      for (let k = 0; k < 3; k++) {
        const grid = new THREE.Mesh(new THREE.PlaneGeometry(1.02, 0.012), gridMat)
        grid.rotation.x = -Math.PI / 2 - 0.42
        grid.position.set(px, 0.65, pz - 0.22 + k * 0.22)
        grid.userData.excludeFromAO = true
        scene.add(grid)
      }
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.028, 0.6, 10), frame)
      leg.position.set(px, 0.34, pz)
      scene.add(leg)
    }
  }
}

/* ---------------- 交互与天光氛围切换 ---------------- */
const toggleTour = () => {
  isTouring.value = !isTouring.value
  if (stage) {
    stage.controls.autoRotate = isTouring.value
    stage.controls.autoRotateSpeed = 0.35
  }
}

const toggleLightMood = () => {
  lightMood.value = lightMood.value === 'gallery' ? 'harvest' : 'gallery'
  if (!stage?.renderer) return
  const isHarvest = lightMood.value === 'harvest'
  gsap.to(stage.renderer, {
    toneMappingExposure: isHarvest ? 1.14 : 1.06,
    duration: 0.9,
    ease: 'power2.out'
  })
  scene.traverse((obj) => {
    if (obj.isDirectionalLight) {
      gsap.to(obj.color, {
        r: isHarvest ? 1.0 : 1.0,
        g: isHarvest ? 0.91 : 0.97,
        b: isHarvest ? 0.76 : 0.91,
        duration: 0.9
      })
      gsap.to(obj, { intensity: isHarvest ? 2.35 : 2.0, duration: 0.9 })
    }
  })
}

const showTooltip = (key, event) => {
  const info = spotInfo[key]
  if (!info || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    title: info.title,
    sub: info.sub
  }
}

const initThree = () => {
  if (!containerRef.value) return
  qualityLabel.value = (props.compact || props.mobile) ? '流畅模式 · 沙盘预览' : '展览级 · IBL + GTAO'
  stage = createStage(containerRef.value, {
    background: PALETTE.canvas,
    fov: props.mobile ? 46 : 38,
    camera: props.mobile ? [38, 30, 38] : (props.compact ? [29.5, 25, 29.5] : [27.5, 22.5, 27.5]),
    target: [0, 0.4, 0],
    minDistance: 6,
    maxDistance: 72,
    maxPolarAngle: Math.PI / 2 - 0.045,
    minPolarAngle: 0.16,
    exposure: 1.06,
    environmentIntensity: 0.72,
    keyIntensity: 2.0,
    shadowSize: props.mobile ? 1024 : 2048,
    shadowFrustum: 27,
    shadowRadius: 5,
    ao: !(props.compact || props.mobile),
    showExtras: !props.mobile,
    aoScale: 0.55,
    aoRadius: 1.05,
    aoIntensity: 0.35,
    aoSamples: 10,
    maxPixelRatio: (props.compact || props.mobile) ? 1.4 : 1.7,
    onQualityChange: (q) => { qualityLabel.value = q === 'high' ? '展览级 · IBL + GTAO' : '流畅模式 · 自适应' },
    onFrame: (dt, t) => {
      windmills.forEach((r, i) => { r.rotation.z += dt * (0.62 + i * 0.07) })
      turbineYaw.forEach((g, i) => { g.rotation.y = Math.sin(t * 0.13 + i) * 0.05 })
      if (weatherCups) weatherCups.rotation.y += dt * 3.2
      cropBlades.forEach((b) => { b.rotation.z = Math.sin(t * 1.1 + b.userData.phase) * 0.012 })
      windGold?.(t)
      windAmber?.(t)
      windMoss?.(t)
      windTree?.(t)
      waveUpdate?.(t)
      rtkRings.forEach((ring) => {
        const p = (t * 0.48 + ring.userData.phase) % 1
        const s = 0.75 + p * 2.1
        ring.scale.set(s, s, 1)
        ring.material.opacity = (1 - p) * 0.42
      })
      if (drone) {
        droneTime = (droneTime + dt * 0.042) % 1
        const a = droneTime * Math.PI * 2
        const px = 11 * Math.sin(a)
        const py = 5.4 + 0.65 * Math.cos(2 * a)
        const pz = 4.5 * Math.sin(2 * a)
        const dx = 11 * Math.cos(a)
        const dz = 9 * Math.cos(2 * a)
        drone.position.set(px, py, pz)
        drone.rotation.y = Math.atan2(dx, dz)
        drone.rotation.z = -dx * 0.006
        droneRotors.forEach((r, i) => { r.rotation.y += dt * (24 + i) })
        if (scanRing) {
          scanRing.position.x = px
          scanRing.position.z = pz
          scanRing.rotation.z = t * 0.6
          scanRing.material.opacity = 0.24 + Math.sin(t * 2.4) * 0.1
        }
        if (scanInner) {
          scanInner.position.x = px
          scanInner.position.z = pz
          const s = 0.85 + Math.sin(t * 3.2) * 0.2
          scanInner.scale.set(s, s, 1)
        }
      }
    }
  })
  if (!stage) return
  scene = stage.scene

  buildLandscape()
  buildSiloComplex()
  buildGreenhouse()
  buildWindTurbines()
  buildCropsField()
  buildInspectionDrone()
  buildRiver()
  buildVegetation()

  if (!props.compact) {
    stage.enablePicking(() => pickTargets, {
      onHover: (obj, hit, event) => {
        highlight(obj, { intensity: 0.14 })
        showTooltip(obj.userData.pickKey, event)
      },
      onMove: (payload) => showTooltip(payload.object.userData.pickKey, payload.event),
      onLeave: (obj) => {
        clearHighlight(obj)
        tooltip.value.visible = false
      },
      onClick: (obj) => {
        const key = obj.userData.pickKey
        const viewMap = {
          field: 'blacksoil', silo: 'silo', windpower: 'windpower',
          greenhouse: 'greenhouse', drone: 'smartdrone', river: 'overview'
        }
        appStore.setFocusPoint(viewMap[key] || 'overview')
      }
    })
  }

  stage.onCleanup(() => labelTextures.forEach((t) => t.dispose()))
  stage.start()
  requestAnimationFrame(() => { isReady.value = true })
}

onMounted(() => initThree())

onUnmounted(() => {
  gsap.killTweensOf(stage?.camera?.position || {})
  stage?.dispose()
  stage = null
  pickTargets.length = 0
  windmills.length = 0
  turbineYaw.length = 0
  cropBlades.length = 0
  rtkRings.length = 0
})
</script>

<template>
  <div
    class="relative w-full h-full bg-[#F7F4EE] select-none overflow-hidden"
    :class="props.mobile ? '' : 'min-h-[36.25rem] rounded-3xl'"
  >
    <div ref="containerRef" class="w-full h-full cursor-grab active:cursor-grabbing"></div>

    <div
      v-if="!isReady"
      class="absolute inset-0 bg-[#F7F4EE] flex items-center justify-center transition-opacity duration-700 z-30"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-[#2E5A44]/25 border-t-[#2E5A44] animate-spin"></div>
        <span class="text-[0.6875rem] font-mono text-[#6E6960] tracking-widest">BUILDING DIORAMA</span>
      </div>
    </div>

    <!-- ==================== 移动端 App 专属紧凑 HUD ==================== -->
    <template v-if="props.mobile">
      <div class="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <button
          type="button"
          @click="toggleLightMood"
          class="px-2.5 py-1.5 rounded-full bg-white/88 backdrop-blur-md border text-[11px] font-semibold shadow-xs cursor-pointer"
          :class="lightMood === 'harvest' ? 'border-[#C88A32] text-[#C88A32]' : 'border-[#1C1B18]/12 text-[#1C1B18]'"
        >
          {{ lightMood === 'harvest' ? '🌇 金秋暖阳' : '☀️ 天光' }}
        </button>
        <button
          type="button"
          @click="toggleTour"
          class="px-2.5 py-1.5 rounded-full bg-white/88 backdrop-blur-md border text-[11px] font-semibold shadow-xs cursor-pointer"
          :class="isTouring ? 'border-[#2E5A44] text-[#2E5A44]' : 'border-[#1C1B18]/12 text-[#1C1B18]'"
        >
          {{ isTouring ? '⏸ 环视中' : '🎥 环视' }}
        </button>
      </div>

      <div class="absolute bottom-3 left-3 right-3 z-10 space-y-2 pointer-events-auto">
        <div class="bg-white/92 backdrop-blur-md rounded-2xl p-3 border border-[#1C1B18]/10 shadow-md">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[12px] font-bold text-[#1C1B18]">松辽平原 · 1:500 生态沙盘</span>
            <span class="font-mono text-[9.5px] text-[#2E5A44] font-bold">双指缩放 · 单指旋转</span>
          </div>
          <p class="text-[10.5px] text-[#5A564E] mt-1 leading-relaxed">
            点击下方视点一键飞越黑土稻浪、白瓷粮仓、光伏温室与风电微网。
          </p>
        </div>
        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            v-for="v in [
              { key: 'overview', label: '🌐 全景' },
              { key: 'blacksoil', label: '🌾 稻浪田' },
              { key: 'silo', label: '🏛️ 粮仓' },
              { key: 'windpower', label: '💨 风电' },
              { key: 'greenhouse', label: '🌿 温室' },
              { key: 'smartdrone', label: '🛸 无人机' }
            ]"
            :key="v.key"
            type="button"
            @click="appStore.setFocusPoint(v.key)"
            class="shrink-0 px-3 py-1.5 rounded-xl border text-[10.5px] font-bold cursor-pointer transition-all"
            :class="appStore.activeFocusPoint === v.key
              ? 'bg-[#16261F] text-[#F0C275] border-[#16261F] shadow-sm'
              : 'bg-white/88 backdrop-blur-md text-[#1C1B18] border-[#1C1B18]/10'"
          >
            {{ v.label }}
          </button>
        </div>
      </div>
    </template>

    <!-- ==================== 桌面端展览馆完整 HUD ==================== -->
    <template v-else>
    <!-- 顶部画廊微缩沙盘铭牌 -->
    <div class="absolute top-5 left-6 museum-panel px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm border border-[#1C1B18]/10 pointer-events-auto">
      <div class="w-2.5 h-2.5 rounded-full bg-[#2E5A44] animate-pulse"></div>
      <div>
        <div class="text-xs font-bold text-[#1C1B18] tracking-wider uppercase font-editorial">
          松辽平原 · 现代生态农业微缩沙盘
        </div>
        <div class="text-[0.625rem] text-[#5A564E] font-mono">
          GOLDEN BELT // ARCHITECTURAL DIORAMA 1:500
        </div>
      </div>
    </div>

    <template v-if="!compact">
      <!-- 视角快速漫游浮动栏 -->
      <div class="absolute right-6 top-5 flex flex-wrap justify-end items-center gap-2 max-w-[58%]">
        <button
          v-for="v in [
            { key: 'overview', label: '🌐 全景概览' },
            { key: 'blacksoil', label: '🌾 稻浪与免耕田' },
            { key: 'silo', label: '🏛️ 白瓷立筒群仓' },
            { key: 'windpower', label: '💨 风电储能微网' },
            { key: 'greenhouse', label: '🌿 连栋光伏温室' },
            { key: 'smartdrone', label: '🛸 北斗巡检机' }
          ]"
          :key="v.key"
          @click="appStore.setFocusPoint(v.key)"
          class="museum-panel px-3 py-2.5 min-h-[2.5rem] rounded-xl text-xs font-semibold text-[#1C1B18] hover:border-[#C88A32] transition-all duration-200 cursor-pointer shadow-sm"
          :class="[appStore.activeFocusPoint === v.key ? 'border-[#C88A32] bg-[#FFFFFF] text-[#C88A32]' : '']"
        >
          <span>{{ v.label }}</span>
        </button>
        <button
          @click="toggleLightMood"
          class="museum-panel px-3 py-2.5 min-h-[2.5rem] rounded-xl text-xs font-semibold text-[#1C1B18] hover:border-[#C88A32] transition-all duration-200 cursor-pointer shadow-sm"
          :class="[lightMood === 'harvest' ? 'border-[#C88A32] bg-[#EFECE6] text-[#C88A32]' : '']"
        >
          <span>{{ lightMood === 'harvest' ? '🌇 金秋暖阳' : '☀️ 展馆天光' }}</span>
        </button>
        <button
          @click="toggleTour"
          class="museum-panel px-3 py-2.5 min-h-[2.5rem] rounded-xl text-xs font-semibold text-[#1C1B18] hover:border-[#C88A32] transition-all duration-200 cursor-pointer shadow-sm"
          :class="[isTouring ? 'border-[#2E5A44] bg-[#EFECE6] text-[#2E5A44]' : '']"
        >
          <span>{{ isTouring ? '⏸ 停止环视' : '🎥 自动环视' }}</span>
        </button>
      </div>

      <!-- 悬停浮动标签 -->
      <div
        v-show="tooltip.visible"
        class="absolute z-20 pointer-events-none museum-card px-3.5 py-2.5 rounded-xl border border-[#C88A32]/45 shadow-lg"
        :style="{ left: `${tooltip.x + 16}px`, top: `${tooltip.y + 16}px`, maxWidth: '268px' }"
      >
        <div class="text-[0.6875rem] font-bold text-[#1C1B18]">{{ tooltip.title }}</div>
        <div class="text-[0.625rem] text-[#2E5A44] font-mono mt-0.5">{{ tooltip.sub }}</div>
      </div>

      <!-- 左下角参数与美学图例展板 -->
      <div class="absolute left-6 bottom-6 hidden md:block w-76 museum-card p-4 rounded-2xl border border-[#1C1B18]/10 shadow-lg pointer-events-auto">
        <div class="flex items-center justify-between border-b border-[#1C1B18]/10 pb-2 mb-2">
          <span class="text-[0.625rem] font-mono uppercase tracking-widest text-[#2E5A44] font-bold">
            3D 孪生沙盘态势 // LIVE ECO-MAP
          </span>
          <span class="text-[0.625rem] text-[#6E6960] font-mono">{{ qualityLabel }}</span>
        </div>
        <p class="text-xs text-[#5A564E] leading-relaxed mb-3">
          融合松辽平原高标准黑土农田、素烧白瓷立筒群仓、连栋光伏温室与清洁风电微网，呈现吉林「绿色粮仓」数字孪生图景。
        </p>
        <!-- 馆藏级色彩图例 -->
        <div class="grid grid-cols-2 gap-1.5 mb-2.5 text-[0.625rem] font-mono text-[#5A564E]">
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EFECE6]/80">
            <span class="w-2.5 h-2.5 rounded-full bg-[#332920] border border-black/15"></span>
            <span>万年腐殖黑土层</span>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EFECE6]/80">
            <span class="w-2.5 h-2.5 rounded-full bg-[#C88A32] border border-black/15"></span>
            <span>金秋粳稻与玉米带</span>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EFECE6]/80">
            <span class="w-2.5 h-2.5 rounded-full bg-[#68969A] border border-black/15"></span>
            <span>松花江青玉水系</span>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EFECE6]/80">
            <span class="w-2.5 h-2.5 rounded-full bg-[#2E5A44] border border-black/15"></span>
            <span>三北防护林与大豆</span>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t border-[#1C1B18]/8 flex items-center justify-between text-[0.625rem] text-[#6E6960] font-mono">
          <span>悬停设施查看档案 · 点击对焦</span>
          <span class="text-[#C88A32] font-semibold">SCALE 1:500</span>
        </div>
      </div>
    </template>
    </template>
  </div>
</template>