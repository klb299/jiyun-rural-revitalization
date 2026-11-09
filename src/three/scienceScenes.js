/**
 * 科普实验室的三套可交互 Three.js 场景
 * 每个 build 函数返回统一接口：{ root, pickTargets, update(dt,t), setParam(p), disposeExtra() }
 * 由 ScienceStage.vue 负责创建舞台、切换场景与拾取。
 */
import * as THREE from 'three'
import gsap from 'gsap'
import { highlight, clearHighlight } from './stage.js'
import {
  PALETTE, mulberry32, roundedBox, bevelCylinder,
  chernozemMaterial, grassMaterial, gravelMaterial,
  porcelainMaterial, metalMaterial, lacquerMaterial,
  glowSprite, applyWind,
  sculptedAggregateGeometry, makeDetailedRiceStalkGeometry
} from './textures.js'

function disposeRoot(root) {
  if (!root) return
  const geos = new Set()
  const mats = new Set()
  const texs = new Set()
  root.traverse((o) => {
    if (o.geometry) geos.add(o.geometry)
    const m = o.material
    if (m) (Array.isArray(m) ? m : [m]).forEach((mm) => mats.add(mm))
  })
  mats.forEach((m) => {
    Object.keys(m).forEach((k) => {
      const v = m[k]
      if (v && v.isTexture && !v.userData?.shared) texs.add(v)
    })
    m.dispose()
  })
  texs.forEach((t) => t.dispose())
  geos.forEach((g) => g.dispose())
}

function pedestal(root, radius = 3.1, y = -1.55) {
  const group = new THREE.Group()
  const base = new THREE.Mesh(
    bevelCylinder(radius, 0.28, { bevel: 0.08, segments: 96, arcSegments: 7, bottomScale: 1.05 }),
    gravelMaterial({ repeat: [4, 4], bumpScale: 0.012 })
  )
  base.position.y = y
  base.receiveShadow = true
  group.add(base)
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.82, radius * 0.84, 96),
    new THREE.MeshBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = y + 0.15
  ring.userData.excludeFromAO = true
  group.add(ring)
  root.add(group)
  return group
}

/* ================================================================== *
 * 实验一：黑土团粒结构与孔隙
 * ================================================================== */
export function buildSoilScene(scene, stage) {
  const root = new THREE.Group()
  scene.add(root)
  pedestal(root, 3.0, -1.58)

  const soil = new THREE.Mesh(
    roundedBox(3.4, 2.5, 2.1, 0.14, 9),
    chernozemMaterial({ repeat: [4, 3], bumpScale: 0.035 })
  )
  soil.castShadow = true
  soil.receiveShadow = true
  root.add(soil)

  // 剖面前缘的层理线
  for (let i = 0; i < 5; i++) {
    const seam = new THREE.Mesh(
      roundedBox(3.36, 0.025, 0.02, 0.008, 2),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0x6B5942 : 0x3A2E22, roughness: 0.96 })
    )
    seam.position.set(0, 0.9 - i * 0.42, 1.055)
    root.add(seam)
  }

  const rnd = mulberry32(7031)
  const dummy = new THREE.Object3D()

  // 四类结构各自成组，便于拾取与高亮
  const groups = {}
  const keys = ['crumb', 'pore', 'hypha', 'nodule']

  // 团粒改用多频噪声雕塑的不规则有机体，替代规则二十面体
  const crumbGeo = sculptedAggregateGeometry(0.16, 2, 7031, 0.3)
  const crumbMat = new THREE.MeshStandardMaterial({ color: 0x4A3B2C, roughness: 0.96 })
  const crumbGroup = new THREE.Group()
  crumbGroup.userData.key = 'crumb'
  const crumbCount = 58
  const crumbs = new THREE.InstancedMesh(crumbGeo, crumbMat, crumbCount)
  for (let i = 0; i < crumbCount; i++) {
    dummy.position.set((rnd() - 0.5) * 3.15, (rnd() - 0.5) * 2.25, 1.06 + rnd() * 0.05)
    const s = 0.55 + rnd() * 1.1
    dummy.scale.set(s, s * (0.7 + rnd() * 0.5), s * 0.55)
    dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3)
    dummy.updateMatrix()
    crumbs.setMatrixAt(i, dummy.matrix)
  }
  crumbs.instanceMatrix.needsUpdate = true
  crumbs.castShadow = true
  crumbGroup.add(crumbs)
  groups.crumb = crumbGroup

  const poreGeo = new THREE.SphereGeometry(0.11, 14, 10)
  const poreMat = new THREE.MeshStandardMaterial({ color: 0x120E0B, roughness: 1 })
  const poreGroup = new THREE.Group()
  poreGroup.userData.key = 'pore'
  const poreCount = 30
  const pores = new THREE.InstancedMesh(poreGeo, poreMat, poreCount)
  for (let i = 0; i < poreCount; i++) {
    dummy.position.set((rnd() - 0.5) * 3.05, (rnd() - 0.5) * 2.15, 1.07)
    const s = 0.5 + rnd() * 1.2
    dummy.scale.set(s, s * 0.8, s * 0.35)
    dummy.rotation.set(0, 0, rnd() * 3)
    dummy.updateMatrix()
    pores.setMatrixAt(i, dummy.matrix)
  }
  pores.instanceMatrix.needsUpdate = true
  poreGroup.add(pores)
  groups.pore = poreGroup

  const hyphaMat = new THREE.MeshStandardMaterial({
    color: 0xC88A32, roughness: 0.8, metalness: 0.12, transparent: true, opacity: 0.86
  })
  const hyphaGroup = new THREE.Group()
  hyphaGroup.userData.key = 'hypha'
  for (let r = 0; r < 9; r++) {
    const x0 = (rnd() - 0.5) * 2.7
    const pts = []
    for (let k = 0; k < 6; k++) {
      pts.push(new THREE.Vector3(
        x0 + Math.sin(k * 1.4 + r) * 0.24,
        1.1 - k * 0.38,
        1.09 + rnd() * 0.02
      ))
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 36, 0.016 + rnd() * 0.012, 8, false), hyphaMat
    )
    hyphaGroup.add(tube)
  }
  groups.hypha = hyphaGroup

  const noduleGeo = sculptedAggregateGeometry(0.13, 2, 9131, 0.34)
  const noduleMat = new THREE.MeshStandardMaterial({ color: 0xD9CBA9, roughness: 0.92 })
  const noduleGroup = new THREE.Group()
  noduleGroup.userData.key = 'nodule'
  const noduleCount = 16
  const nodules = new THREE.InstancedMesh(noduleGeo, noduleMat, noduleCount)
  for (let i = 0; i < noduleCount; i++) {
    dummy.position.set((rnd() - 0.5) * 3.0, (rnd() - 0.5) * 2.1, 1.075)
    const s = 0.5 + rnd() * 1.15
    dummy.scale.set(s, s * 0.8, s * 0.45)
    dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3)
    dummy.updateMatrix()
    nodules.setMatrixAt(i, dummy.matrix)
  }
  nodules.instanceMatrix.needsUpdate = true
  nodules.castShadow = true
  noduleGroup.add(nodules)
  groups.nodule = noduleGroup

  keys.forEach((k) => root.add(groups[k]))

  // 悬浮微粒，增加生命感
  const moteCount = 90
  const motePos = new Float32Array(moteCount * 3)
  const moteBase = []
  for (let i = 0; i < moteCount; i++) {
    const x = (rnd() - 0.5) * 4.2
    const y = (rnd() - 0.5) * 3.0
    const z = 1.2 + rnd() * 1.4
    motePos.set([x, y, z], i * 3)
    moteBase.push({ x, y, z, s: 0.1 + rnd() * 0.22 })
  }
  const moteGeo = new THREE.BufferGeometry()
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3))
  const moteMat = new THREE.PointsMaterial({
    map: glowSprite('#C88A32'), size: 0.08, transparent: true,
    opacity: 0.6, depthWrite: false, sizeAttenuation: true
  })
  const motes = new THREE.Points(moteGeo, moteMat)
  motes.userData.excludeFromAO = true
  root.add(motes)

  stage.addContactShadow({ size: 6.6, opacity: 0.45, position: [0, -1.4, 0], parent: root })

  let focus = 'crumb'
  function applyFocus(next) {
    if (!next || !groups[next]) return
    if (groups[focus]) clearHighlight(groups[focus])
    focus = next
    highlight(groups[focus], { intensity: 0.1 })
    keys.forEach((k) => {
      const target = k === focus ? 1 : 0.42
      groups[k].traverse((o) => {
        if (o.isMesh && o.material?.transparent !== undefined) {
          gsap.to(o.material, { opacity: k === 'hypha' ? (target === 1 ? 0.95 : 0.3) : 1, duration: 0.5 })
        }
      })
    })
  }
  applyFocus('crumb')

  return {
    root,
    pickTargets: keys.map((k) => groups[k]),
    setParam(p) { if (p?.focus) applyFocus(p.focus) },
    update(dt, t) {
      root.rotation.y = Math.sin(t * 0.16) * 0.16
      const arr = moteGeo.attributes.position.array
      for (let i = 0; i < moteCount; i++) {
        const b = moteBase[i]
        arr[i * 3 + 1] = b.y + Math.sin(t * 0.5 + i) * 0.14
      }
      moteGeo.attributes.position.needsUpdate = true
    },
    disposeExtra() { disposeRoot(root) }
  }
}

/* ================================================================== *
 * 实验二：稻作五个生长阶段
 * ================================================================== */
export function buildRiceScene(scene, stage) {
  const root = new THREE.Group()
  scene.add(root)
  pedestal(root, 3.2, -1.6)

  const bed = new THREE.Mesh(
    roundedBox(4.6, 0.32, 2.9, 0.1, 6),
    chernozemMaterial({ repeat: [5, 3], bumpScale: 0.03 })
  )
  bed.position.y = -0.9
  bed.receiveShadow = true
  bed.castShadow = true
  root.add(bed)

  // 水面：早期阶段可见
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(4.5, 2.8, 40, 20),
    new THREE.MeshPhysicalMaterial({
      color: 0x9FC4CC, roughness: 0.12, metalness: 0.05,
      transparent: true, opacity: 0.55, depthWrite: false,
      clearcoat: 1, side: THREE.DoubleSide
    })
  )
  water.rotation.x = -Math.PI / 2
  water.position.y = -0.71
  water.userData.excludeFromAO = true
  root.add(water)

  // 单株稻：分节稻茎 + 茎节环 + 弧面剑叶 + 弯曲下垂穗轴 + 饱满谷粒与颖芒。
  // 株高基准 1.26，与五阶段生长补间的缩放完全对齐；非索引几何兼容 applyWind。
  const stalkGeo = makeDetailedRiceStalkGeometry({
    height: 0.95, grainCount: 12, leafCount: 4, widthScale: 1.6
  })

  const plantMat = new THREE.MeshStandardMaterial({
    color: 0x4E7A52, roughness: 0.84, metalness: 0.02, side: THREE.DoubleSide
  })
  const wind = applyWind(plantMat, { amount: 0.09, speed: 1.35, phaseScale: 1.2 })

  const rows = 6
  const cols = 14
  const count = rows * cols
  const rice = new THREE.InstancedMesh(stalkGeo, plantMat, count)
  rice.castShadow = true
  const rnd = mulberry32(9182)
  const spots = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 固定每株的随机因子，阶段切换补间时不会逐帧抖动
      spots.push({
        x: (c / (cols - 1) - 0.5) * 4.1 + (rnd() - 0.5) * 0.1,
        z: (r / (rows - 1) - 0.5) * 2.4 + (rnd() - 0.5) * 0.1,
        rx: (rnd() - 0.5) * 0.1,
        ry: rnd() * Math.PI * 2,
        tilt: rnd() - 0.5,
        hf: 0.82 + rnd() * 0.32,
        sx: 0.85 + rnd() * 0.3,
        sz: 0.85 + rnd() * 0.3
      })
    }
  }
  root.add(rice)

  // 阶段表：高度、颜色、倾斜、水位
  const phases = [
    { h: 0.22, color: 0x6E9B5E, lean: 0.02, water: 0.55 },
    { h: 0.52, color: 0x4E7A52, lean: 0.05, water: 0.42 },
    { h: 0.78, color: 0x57864C, lean: 0.08, water: 0.26 },
    { h: 0.95, color: 0x98955A, lean: 0.16, water: 0.08 },
    { h: 1.05, color: 0xA98843, lean: 0.26, water: 0 }
  ]
  const dummy = new THREE.Object3D()
  let current = 0
  const proxy = { v: 0 }

  function apply(p) {
    const a = phases[Math.round(p)]
    plantMat.color.setHex(a.color)
    water.visible = a.water > 0.01
    gsap.to(water.material, { opacity: a.water, duration: 0.6 })
    for (let i = 0; i < count; i++) {
      const spt = spots[i]
      dummy.position.set(spt.x, -0.72, spt.z)
      dummy.rotation.set(spt.rx, spt.ry, spt.tilt * a.lean)
      const s = a.h * spt.hf
      dummy.scale.set(spt.sx, s, spt.sz)
      dummy.updateMatrix()
      rice.setMatrixAt(i, dummy.matrix)
    }
    rice.instanceMatrix.needsUpdate = true
  }
  apply(0)

  stage.addContactShadow({ size: 7, opacity: 0.4, position: [0, -1.42, 0], parent: root })

  return {
    root,
    pickTargets: [],
    setParam(p) {
      if (p?.stage === undefined) return
      const next = Math.max(0, Math.min(4, Number(p.stage)))
      if (next === current) return
      current = next
      gsap.to(proxy, {
        v: next, duration: 0.9, ease: 'power2.inOut',
        onUpdate: () => apply(Math.round(proxy.v))
      })
    },
    update(dt, t) {
      wind(t)
      root.rotation.y = Math.sin(t * 0.12) * 0.1
    },
    disposeExtra() { disposeRoot(root) }
  }
}

/* ================================================================== *
 * 实验三：北斗 RTK 定位原理
 * ================================================================== */
export function buildBeidouScene(scene, stage) {
  const root = new THREE.Group()
  scene.add(root)
  pedestal(root, 3.4, -1.7)

  const rnd = mulberry32(7721)
  const soilMat = chernozemMaterial({ repeat: [7, 5], bumpScale: 0.02 })
  const furrowMat = new THREE.MeshStandardMaterial({ color: 0x2B2119, roughness: 0.98 })
  const darkMetal = metalMaterial(0x3A3833, { roughness: 0.46, metalness: 0.62 })
  const goldMetal = metalMaterial(PALETTE.gold, { roughness: 0.26, metalness: 0.9 })
  const redPaint = lacquerMaterial(PALETTE.red, { roughness: 0.3, metalness: 0.16, clearcoat: 0.9 })

  // ---------- 黑土田块与垄沟 ----------
  const ground = new THREE.Mesh(roundedBox(6.4, 0.24, 4.6, 0.12, 6), soilMat)
  ground.position.y = -1.28
  ground.receiveShadow = true
  root.add(ground)
  for (let i = 0; i < 9; i++) {
    const furrow = new THREE.Mesh(roundedBox(0.055, 0.018, 4.3, 0.006, 2), furrowMat)
    furrow.position.set((i - 4) * 0.66, -1.152, 0)
    root.add(furrow)
  }
  for (const sx of [-1, 1]) {
    const edge = new THREE.Mesh(roundedBox(0.1, 0.07, 4.7, 0.02, 2), furrowMat)
    edge.position.set(sx * 3.18, -1.14, 0)
    root.add(edge)
  }

  // ---------- 计划路线与实际路线：一眼看懂厘米级意味着什么 ----------
  const planLine = new THREE.Mesh(
    roundedBox(0.055, 0.014, 4.15, 0.007, 2),
    new THREE.MeshBasicMaterial({ color: PALETTE.gold })
  )
  planLine.position.set(0, -1.138, 0)
  planLine.userData.excludeFromAO = true
  root.add(planLine)

  const actualSegs = []
  const actualMat = new THREE.MeshStandardMaterial({
    color: 0x2E5A44, roughness: 0.55, metalness: 0.15,
    emissive: 0x2E5A44, emissiveIntensity: 0.28
  })
  const segGeo = roundedBox(0.052, 0.018, 0.18, 0.006, 2)
  for (let i = 0; i < 24; i++) {
    const seg = new THREE.Mesh(segGeo, actualMat)
    seg.position.set(0.012, -1.116, -1.98 + i * 0.172)
    root.add(seg)
    actualSegs.push(seg)
  }

  // ---------- 农机（移动站） ----------
  const tractor = new THREE.Group()
  tractor.position.set(0, -1.0, 0)
  const chassis = new THREE.Mesh(roundedBox(0.92, 0.16, 1.52, 0.05, 5), darkMetal)
  chassis.position.y = 0.19
  chassis.castShadow = true
  tractor.add(chassis)
  const hood = new THREE.Mesh(roundedBox(0.8, 0.42, 0.72, 0.12, 6), redPaint)
  hood.position.set(0, 0.44, 0.38)
  hood.castShadow = true
  tractor.add(hood)
  const grille = new THREE.Mesh(roundedBox(0.6, 0.24, 0.045, 0.015, 3), darkMetal)
  grille.position.set(0, 0.4, 0.755)
  tractor.add(grille)
  const cabinGlass = new THREE.Mesh(
    roundedBox(0.82, 0.52, 0.68, 0.09, 5),
    new THREE.MeshPhysicalMaterial({
      color: 0xAFC6CD, roughness: 0.1, metalness: 0.12,
      transparent: true, opacity: 0.48, transmission: 0.3, thickness: 0.1
    })
  )
  cabinGlass.position.set(0, 0.76, -0.3)
  cabinGlass.userData.excludeFromAO = true
  tractor.add(cabinGlass)
  const roof = new THREE.Mesh(roundedBox(0.88, 0.07, 0.74, 0.03, 4), redPaint)
  roof.position.set(0, 1.04, -0.3)
  roof.castShadow = true
  tractor.add(roof)
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x241F1B, roughness: 0.94 })
  const hubMat = metalMaterial(PALETTE.gold, { roughness: 0.32, metalness: 0.86 })
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.17, 32), tireMat)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(sx * 0.53, 0.22, sz * 0.48)
      wheel.castShadow = true
      tractor.add(wheel)
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 24), hubMat)
      hub.rotation.z = Math.PI / 2
      hub.position.set(sx * 0.625, 0.22, sz * 0.48)
      tractor.add(hub)
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2
        const lug = new THREE.Mesh(roundedBox(0.19, 0.035, 0.055, 0.01, 2), tireMat)
        lug.position.set(sx * 0.53, 0.22 + Math.cos(a) * 0.225, sz * 0.48 + Math.sin(a) * 0.225)
        lug.rotation.x = a
        tractor.add(lug)
      }
    }
  }
  // 播种机具：说明这条轨迹对应的是真实农活
  const seeder = new THREE.Mesh(roundedBox(1.12, 0.1, 0.3, 0.03, 3), darkMetal)
  seeder.position.set(0, 0.16, -0.98)
  tractor.add(seeder)
  for (let i = 0; i < 4; i++) {
    const opener = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.15, 12), hubMat)
    opener.rotation.x = Math.PI
    opener.position.set((i - 1.5) * 0.28, 0.06, -0.98)
    tractor.add(opener)
  }
  // RTK 蘑菇头天线与立杆
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.24, 16), darkMetal)
  mast.position.set(0, 1.17, -0.3)
  tractor.add(mast)
  const antenna = new THREE.Mesh(bevelCylinder(0.14, 0.075, { bevel: 0.025, segments: 32 }), goldMetal)
  antenna.position.set(0, 1.31, -0.3)
  antenna.castShadow = true
  tractor.add(antenna)
  const antennaRing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 8, 32), goldMetal)
  antennaRing.rotation.x = Math.PI / 2
  antennaRing.position.set(0, 1.27, -0.3)
  tractor.add(antennaRing)
  root.add(tractor)

  // ---------- 田边基准站：RTK 的关键第三方 ----------
  const station = new THREE.Group()
  station.position.set(-2.42, -1.16, 1.3)
  const plinth = new THREE.Mesh(
    bevelCylinder(0.34, 0.09, { bevel: 0.02, segments: 40 }),
    gravelMaterial({ repeat: [2, 2], bumpScale: 0.01 })
  )
  station.add(plinth)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.66, 12), darkMetal)
    leg.position.set(Math.cos(a) * 0.16, 0.36, Math.sin(a) * 0.16)
    leg.rotation.z = Math.cos(a) * 0.24
    leg.rotation.x = -Math.sin(a) * 0.24
    station.add(leg)
  }
  const box = new THREE.Mesh(
    roundedBox(0.3, 0.26, 0.24, 0.04, 4),
    porcelainMaterial({ repeat: [1, 1], roughness: 0.34 })
  )
  box.position.y = 0.72
  box.castShadow = true
  station.add(box)
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 14), goldMetal)
  beacon.position.y = 0.95
  station.add(beacon)
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 12),
    new THREE.MeshBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.18, depthWrite: false })
  )
  halo.position.y = 0.95
  halo.userData.excludeFromAO = true
  station.add(halo)
  root.add(station)

  // ---------- 林带遮挡物：让「被挡住」看得见 ----------
  const blocker = new THREE.Group()
  blocker.position.set(-1.25, -1.14, 0.72)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x584A3A, roughness: 0.95 })
  const crownMat = new THREE.MeshStandardMaterial({ color: 0x2E5A44, roughness: 0.92 })
  for (let i = 0; i < 3; i++) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.6 + i * 0.1, 10), trunkMat)
    t.position.set((i - 1) * 0.28, 0.3 + i * 0.05, 0)
    blocker.add(t)
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24 + i * 0.03, 1), crownMat)
    c.position.set((i - 1) * 0.28, 0.72 + i * 0.07, 0)
    blocker.add(c)
  }
  blocker.visible = false
  root.add(blocker)

  // ---------- 误差靶心与落点云 ----------
  const errorRing = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.56, 64),
    new THREE.MeshBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })
  )
  errorRing.rotation.x = -Math.PI / 2
  errorRing.position.set(0, -1.105, 0)
  errorRing.userData.excludeFromAO = true
  root.add(errorRing)
  const crossMat = new THREE.MeshBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.7, depthWrite: false })
  for (const sz of [0, 1]) {
    const bar = new THREE.Mesh(roundedBox(sz ? 0.016 : 0.34, 0.008, sz ? 0.34 : 0.016, 0.003, 2), crossMat)
    bar.position.set(0, -1.098, 0)
    bar.userData.excludeFromAO = true
    root.add(bar)
  }
  const dots = []
  const dotGeo = new THREE.SphereGeometry(0.035, 10, 8)
  const dotMat = new THREE.MeshBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.9, depthWrite: false })
  const dotSeeds = []
  for (let i = 0; i < 14; i++) {
    const d = new THREE.Mesh(dotGeo, dotMat)
    d.userData.excludeFromAO = true
    root.add(d)
    dots.push(d)
    dotSeeds.push({ a: rnd() * Math.PI * 2, r: 0.15 + rnd() * 0.85 })
  }

  // ---------- 卫星 ----------
  const sats = []
  const satLines = []
  const stationLines = []
  const satPulses = []
  const satRoot = new THREE.Group()
  root.add(satRoot)
  const maxSats = 6
  const panelMat = lacquerMaterial(0x2C3C46, { roughness: 0.24, metalness: 0.5, clearcoat: 0.9 })
  const shellMat = porcelainMaterial({ repeat: [1, 1], roughness: 0.32 })
  for (let i = 0; i < maxSats; i++) {
    const g = new THREE.Group()
    const shell = new THREE.Mesh(roundedBox(0.3, 0.24, 0.3, 0.06, 5), shellMat)
    g.add(shell)
    const goldEdge = new THREE.Mesh(roundedBox(0.32, 0.05, 0.32, 0.02, 3), goldMetal)
    goldEdge.position.y = 0.11
    g.add(goldEdge)
    for (const s of [-1, 1]) {
      const panel = new THREE.Mesh(roundedBox(0.46, 0.025, 0.24, 0.01, 3), panelMat)
      panel.position.x = s * 0.41
      panel.rotation.z = s * 0.12
      g.add(panel)
      for (let k = -1; k <= 1; k++) {
        const grid = new THREE.Mesh(roundedBox(0.012, 0.006, 0.22, 0.003, 2), goldMetal)
        grid.position.set(s * 0.41 + k * 0.11, 0.017, 0)
        grid.rotation.z = s * 0.12
        g.add(grid)
      }
    }
    const dish = new THREE.Mesh(bevelCylinder(0.085, 0.025, { bevel: 0.008, segments: 24 }), goldMetal)
    dish.position.y = 0.17
    g.add(dish)
    g.rotation.set(0.1 * (i % 2 ? 1 : -1), i * 0.4, 0.06)
    satRoot.add(g)

    const mkLine = (opacity) => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
      const mat = new THREE.LineBasicMaterial({ color: PALETTE.gold, transparent: true, opacity, depthWrite: false })
      const line = new THREE.Line(geo, mat)
      line.userData.excludeFromAO = true
      satRoot.add(line)
      return line
    }
    satLines.push(mkLine(0.46))
    stationLines.push(mkLine(0.22))

    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xE8BC6E, transparent: true, opacity: 0.95, depthWrite: false })
    )
    pulse.userData.excludeFromAO = true
    satRoot.add(pulse)
    satPulses.push(pulse)
    sats.push(g)
  }

  // ---------- 基准站到农机的「改正数」链路 ----------
  const stationTop = new THREE.Vector3(-2.42, -0.2, 1.3)
  const tractorTop = new THREE.Vector3(0, 0.31, -0.3)
  const correctionCurve = new THREE.CatmullRomCurve3([
    stationTop,
    new THREE.Vector3(-1.35, 0.38, 0.82),
    new THREE.Vector3(-0.55, 0.5, 0.1),
    tractorTop
  ])
  const correctionMat = new THREE.MeshBasicMaterial({
    color: PALETTE.moss || 0x2E5A44, transparent: true, opacity: 0.85, depthWrite: false
  })
  const correctionTube = new THREE.Mesh(
    new THREE.TubeGeometry(correctionCurve, 48, 0.016, 8, false), correctionMat
  )
  correctionTube.userData.excludeFromAO = true
  root.add(correctionTube)
  const correctionPulses = []
  for (let i = 0; i < 3; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.062, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0xBBD9A6, transparent: true, opacity: 0.95, depthWrite: false })
    )
    p.userData.excludeFromAO = true
    root.add(p)
    correctionPulses.push(p)
  }

  // ---------- 会说话的展签：白底 + 金色边条 + 中英双行，替代廉价灰贴纸 ----------
  const makeLabel = (text, sub = '') => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 128
    const ctx = c.getContext('2d')
    ctx.fillStyle = 'rgba(255,253,249,0.95)'
    ctx.beginPath(); ctx.roundRect(4, 6, 504, 116, 18); ctx.fill()
    ctx.strokeStyle = 'rgba(28,27,24,0.14)'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.roundRect(4, 6, 504, 116, 18); ctx.stroke()
    ctx.fillStyle = '#C88A32'
    ctx.beginPath(); ctx.roundRect(16, 20, 7, 88, 4); ctx.fill()
    ctx.fillStyle = '#1C1B18'
    ctx.font = '600 44px "Songti SC","Microsoft YaHei",serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 40, sub ? 50 : 64)
    if (sub) {
      ctx.fillStyle = '#8C867B'
      ctx.font = '400 21px ui-monospace,monospace'
      ctx.fillText(sub, 40, 96)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, toneMapped: false
    }))
    sp.scale.set(1.28, 0.32, 1)
    sp.userData.excludeFromAO = true
    root.add(sp)
    return sp
  }
  const labelStation = makeLabel('基准站 · 位置已知', 'KNOWN POSITION')
  labelStation.position.set(-2.42, 0.12, 1.3)
  const labelTractor = makeLabel('农机 · 移动站', 'ROVER')
  labelTractor.position.set(0.12, 0.92, -0.3)
  const labelFix = makeLabel('改正数', 'CORRECTION')
  labelFix.position.set(-1.18, 0.84, 0.72)
  labelFix.scale.set(0.92, 0.23, 1)
  const labelSats = makeLabel('北斗卫星', 'BEIDOU')
  labelSats.position.set(1.7, 2.5, -1.1)

  let satCount = 4
  let blocked = false
  const target = new THREE.Vector3(0, 0.31, -0.3)

  function layout() {
    for (let i = 0; i < maxSats; i++) {
      const visible = i < satCount
      sats[i].visible = visible
      satLines[i].visible = visible
      stationLines[i].visible = visible
      satPulses[i].visible = visible
      if (!visible) continue
      const a = (i / satCount) * Math.PI * 1.5 - Math.PI * 0.75
      const radius = 2.9 + (i % 2) * 0.35
      const x = Math.sin(a) * radius
      const z = Math.cos(a) * radius * 0.6 - 0.4
      const y = 1.75 + (i % 3) * 0.38
      sats[i].position.set(x, y, z)
      sats[i].userData.baseY = y
      const arr = satLines[i].geometry.attributes.position.array
      arr[0] = x; arr[1] = y; arr[2] = z
      arr[3] = target.x; arr[4] = target.y; arr[5] = target.z
      satLines[i].geometry.attributes.position.needsUpdate = true
      const brr = stationLines[i].geometry.attributes.position.array
      brr[0] = x; brr[1] = y; brr[2] = z
      brr[3] = stationTop.x; brr[4] = stationTop.y; brr[5] = stationTop.z
      stationLines[i].geometry.attributes.position.needsUpdate = true
    }

    const scale = blocked ? 3.4 : Math.max(0.7, 1.5 - (satCount - 3) * 0.18)
    gsap.to(errorRing.scale, { x: scale, y: scale, duration: 0.7, ease: 'power2.out', overwrite: true })

    const errColor = blocked ? 0xB83828 : PALETTE.gold
    errorRing.material.color.setHex(errColor)
    crossMat.color.setHex(errColor)
    dotMat.color.setHex(blocked ? 0xB83828 : PALETTE.gold)
    actualMat.color.setHex(blocked ? 0xB83828 : 0x2E5A44)
    actualMat.emissive.setHex(blocked ? 0xB83828 : 0x2E5A44)
    correctionMat.color.setHex(blocked ? 0xB83828 : 0x2E5A44)
    correctionMat.opacity = blocked ? 0.28 : 0.85
    blocker.visible = blocked

    // 正常时实际轨迹贴着计划线，遮挡后明显跑偏并抖动
    actualSegs.forEach((seg, i) => {
      const offset = blocked ? 0.72 + Math.sin(i * 0.85) * 0.26 : 0.012
      gsap.to(seg.position, { x: offset, duration: 0.65, ease: 'power2.out', overwrite: true })
    })
    const spread = blocked ? 1.05 : 0.16
    dots.forEach((d, i) => {
      const s = dotSeeds[i]
      gsap.to(d.position, {
        x: Math.cos(s.a) * s.r * spread,
        z: Math.sin(s.a) * s.r * spread,
        y: -1.085,
        duration: 0.7, ease: 'power2.out', overwrite: true
      })
    })
    correctionPulses.forEach((p, i) => { p.visible = !blocked })
  }
  layout()

  stage.addContactShadow({ size: 8, opacity: 0.38, position: [0, -1.5, 0], parent: root })

  return {
    root,
    pickTargets: [],
    setParam(p) {
      if (!p) return
      if (p.sats !== undefined) satCount = Math.max(3, Math.min(6, Number(p.sats)))
      if (p.blocked !== undefined) blocked = !!p.blocked
      layout()
    },
    update(dt, t) {
      for (let i = 0; i < satCount; i++) {
        const g = sats[i]
        const y = (g.userData.baseY || 2) + Math.sin(t * 0.8 + i * 1.3) * 0.09
        g.position.y = y
        const arr = satLines[i].geometry.attributes.position.array
        arr[1] = y
        satLines[i].geometry.attributes.position.needsUpdate = true
        const brr = stationLines[i].geometry.attributes.position.array
        brr[1] = y
        stationLines[i].geometry.attributes.position.needsUpdate = true
        satLines[i].material.opacity = (blocked ? 0.18 : 0.42) + Math.sin(t * 2.2 + i) * 0.1
        stationLines[i].material.opacity = blocked ? 0.1 : 0.22
        const tt = (t * (blocked ? 0.12 : 0.42) + i * 0.17) % 1
        satPulses[i].position.lerpVectors(g.position, target, tt)
        satPulses[i].visible = !blocked
      }
      for (let i = satCount; i < maxSats; i++) satPulses[i].visible = false
      correctionPulses.forEach((p, i) => {
        const tt = (t * 0.32 + i / 3) % 1
        p.position.copy(correctionCurve.getPoint(tt))
        p.scale.setScalar(0.8 + Math.sin(t * 4 + i) * 0.2)
      })
      errorRing.material.opacity = 0.42 + Math.sin(t * 1.8) * 0.14
      halo.material.opacity = 0.14 + Math.sin(t * 2.4) * 0.08
      tractor.rotation.y = Math.sin(t * 0.25) * (blocked ? 0.14 : 0.05)
      labelFix.material.opacity = blocked ? 0.35 : 1
    },
    disposeExtra() { disposeRoot(root) }
  }
}

/* ================================================================== *
 * 实验四：秸秆覆盖免耕 / 保护性耕作
 * 覆盖率决定秸秆密度，也决定雨滴是向下渗入还是沿地表流走。
 * ================================================================== */
export function buildNoTillScene(scene, stage) {
  const root = new THREE.Group()
  scene.add(root)
  pedestal(root, 3.05, -1.55)

  const rnd = mulberry32(1109)
  const dummy = new THREE.Object3D()

  // 土体：顶面 y = 0，向下 1.5
  const soil = new THREE.Mesh(
    roundedBox(3.6, 1.5, 2.2, 0.12, 9),
    chernozemMaterial({ repeat: [5, 3], bumpScale: 0.03, color: 0x6E655C })
  )
  soil.position.y = -0.75
  soil.castShadow = true
  soil.receiveShadow = true
  root.add(soil)

  // 剖面前缘的层理线
  for (let i = 0; i < 4; i++) {
    const seam = new THREE.Mesh(
      roundedBox(3.56, 0.018, 0.02, 0.006, 2),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0x6B5942 : 0x35291E, roughness: 0.96 })
    )
    seam.position.set(0, -0.12 - i * 0.36, 1.105)
    root.add(seam)
  }

  // 地表薄层：覆盖率越高越深越疏松
  const surfaceMat = new THREE.MeshStandardMaterial({ color: 0x241E18, roughness: 0.98 })
  const surface = new THREE.Mesh(roundedBox(3.56, 0.06, 2.16, 0.03, 4), surfaceMat)
  surface.position.y = 0.03
  surface.receiveShadow = true
  root.add(surface)

  const groups = {}
  const keys = ['straw', 'crumb', 'pore', 'opener']

  // 1) 秸秆覆盖：横卧细秆，数量随覆盖率变化
  const strawGeo = new THREE.CylinderGeometry(0.014, 0.018, 0.52, 6, 1)
  strawGeo.rotateZ(Math.PI / 2)
  const strawMat = new THREE.MeshStandardMaterial({ color: 0xC9A45B, roughness: 0.92 })
  const strawAltMat = new THREE.MeshStandardMaterial({ color: 0x8C583A, roughness: 0.95 })
  const strawGroup = new THREE.Group()
  strawGroup.userData.key = 'straw'
  const maxStraw = 64
  const strawA = new THREE.InstancedMesh(strawGeo, strawMat, Math.ceil(maxStraw / 2))
  const strawB = new THREE.InstancedMesh(strawGeo, strawAltMat, Math.floor(maxStraw / 2))
  for (let i = 0; i < maxStraw; i++) {
    dummy.position.set((rnd() - 0.5) * 3.2, 0.09 + rnd() * 0.035, (rnd() - 0.5) * 1.9)
    dummy.rotation.set(0, rnd() * Math.PI, (rnd() - 0.5) * 0.25)
    dummy.scale.set(0.65 + rnd() * 0.8, 1, 1)
    dummy.updateMatrix()
    if (i % 2 === 0) strawA.setMatrixAt(Math.floor(i / 2), dummy.matrix)
    else strawB.setMatrixAt(Math.floor(i / 2), dummy.matrix)
  }
  strawA.instanceMatrix.needsUpdate = true
  strawB.instanceMatrix.needsUpdate = true
  strawA.castShadow = true
  strawB.castShadow = true
  strawGroup.add(strawA, strawB)
  groups.straw = strawGroup

  // 2) 地表团粒
  const crumbMat = new THREE.MeshStandardMaterial({ color: 0x4A3B2C, roughness: 0.96 })
  const crumbGroup = new THREE.Group()
  crumbGroup.userData.key = 'crumb'
  const crumbCount = 26
  const crumbs = new THREE.InstancedMesh(sculptedAggregateGeometry(0.11, 2, 4409, 0.3), crumbMat, crumbCount)
  for (let i = 0; i < crumbCount; i++) {
    dummy.position.set((rnd() - 0.5) * 3.1, 0.11, (rnd() - 0.5) * 1.8)
    const s = 0.55 + rnd() * 0.9
    dummy.scale.set(s, s * 0.7, s)
    dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3)
    dummy.updateMatrix()
    crumbs.setMatrixAt(i, dummy.matrix)
  }
  crumbs.instanceMatrix.needsUpdate = true
  crumbs.castShadow = true
  crumbGroup.add(crumbs)
  groups.crumb = crumbGroup

  // 3) 蚯蚓通道：剖面前缘的弯曲管道，逐条克隆材质避免高亮串色
  const poreGroup = new THREE.Group()
  poreGroup.userData.key = 'pore'
  for (let r = 0; r < 5; r++) {
    const x0 = (rnd() - 0.5) * 2.9
    const pts = []
    for (let k = 0; k < 6; k++) {
      pts.push(new THREE.Vector3(x0 + Math.sin(k * 1.2 + r) * 0.18, -0.03 - k * 0.23, 1.12))
    }
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.014 + rnd() * 0.007, 7, false),
      new THREE.MeshStandardMaterial({ color: 0x7A5D3A, roughness: 0.92 })
    )
    poreGroup.add(tube)
  }
  groups.pore = poreGroup

  // 4) 免耕播种开沟器：只切窄缝、不翻转土层
  const openerGroup = new THREE.Group()
  openerGroup.userData.key = 'opener'
  const discMat = metalMaterial(PALETTE.gold, { roughness: 0.34, metalness: 0.8 }).clone()
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.035, 48), discMat)
  disc.rotation.set(0, 0.2, Math.PI / 2)
  disc.position.set(1.05, 0.22, 0.65)
  openerGroup.add(disc)
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), lacquerMaterial(0x1C1B18).clone())
  hub.position.copy(disc.position)
  openerGroup.add(hub)
  const arm = new THREE.Mesh(roundedBox(0.9, 0.09, 0.1, 0.03, 4), metalMaterial(0x6E6960, { roughness: 0.4 }).clone())
  arm.position.set(1.35, 0.55, 0.65)
  arm.rotation.z = -0.3
  openerGroup.add(arm)
  const gauge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.06, 32),
    new THREE.MeshStandardMaterial({ color: 0x2E5A44, roughness: 0.86 })
  )
  gauge.rotation.set(0, 0, Math.PI / 2)
  gauge.position.set(1.72, 0.14, 0.65)
  openerGroup.add(gauge)
  groups.opener = openerGroup

  keys.forEach((k) => root.add(groups[k]))

  // 直立残茬与垄线：免耕田的固定特征，不随覆盖率变化
  const stubbleMat = new THREE.MeshStandardMaterial({ color: 0xA98246, roughness: 0.94 })
  for (let i = 0; i < 9; i++) {
    const h = 0.16 + rnd() * 0.12
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, h, 7), stubbleMat)
    st.position.set((rnd() - 0.5) * 2.9, 0.06 + h / 2, (rnd() - 0.5) * 1.7)
    st.rotation.z = (rnd() - 0.5) * 0.25
    st.castShadow = true
    root.add(st)
  }
  const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x241E18, roughness: 1 })
  for (let i = 0; i < 4; i++) {
    const ridge = new THREE.Mesh(roundedBox(3.3, 0.012, 0.035, 0.005, 2), ridgeMat)
    ridge.position.set(0, 0.065, -0.72 + i * 0.48)
    root.add(ridge)
  }

  // 雨滴：高覆盖向下渗，低覆盖沿地表流走
  const dropCount = 42
  const dropGeo = new THREE.SphereGeometry(0.025, 8, 6)
  const infilMat = new THREE.MeshStandardMaterial({ color: 0x8EBACB, roughness: 0.35, transparent: true, opacity: 0.85 })
  const runoffMat = new THREE.MeshStandardMaterial({ color: 0x8C583A, roughness: 0.9, transparent: true, opacity: 0.9 })
  const infil = new THREE.InstancedMesh(dropGeo, infilMat, dropCount)
  const runoff = new THREE.InstancedMesh(dropGeo, runoffMat, dropCount)
  infil.userData.excludeFromAO = true
  runoff.userData.excludeFromAO = true
  infil.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  runoff.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  root.add(infil, runoff)
  const dropSeeds = Array.from({ length: dropCount }, () => ({
    x: (rnd() - 0.5) * 3.0, z: (rnd() - 0.5) * 1.7,
    off: rnd(), speed: 0.7 + rnd() * 0.5
  }))

  stage.addContactShadow({ size: 6.4, opacity: 0.42, position: [0, -1.38, 0], parent: root })

  let coverage = 60
  let focus = 'straw'
  function applyCoverage(v) {
    coverage = Math.max(0, Math.min(100, Number(v) || 0))
    const shown = Math.round(maxStraw * coverage / 100)
    strawA.count = Math.ceil(shown / 2)
    strawB.count = Math.floor(shown / 2)
    surfaceMat.color.set(coverage >= 60 ? 0x241E18 : coverage >= 30 ? 0x32281E : 0x4A3E30)
  }
  function applyFocus(next) {
    if (!next || !groups[next]) return
    if (groups[focus]) clearHighlight(groups[focus])
    focus = next
    highlight(groups[focus], { intensity: 0.1 })
  }
  applyCoverage(60)
  applyFocus('straw')

  return {
    root,
    pickTargets: keys.map((k) => groups[k]),
    setParam(p) {
      if (p && typeof p.coverage === 'number') applyCoverage(p.coverage)
      if (p?.focus) applyFocus(p.focus)
    },
    update(dt, t) {
      root.rotation.y = Math.sin(t * 0.14) * 0.12
      const infilCount = Math.round(dropCount * coverage / 100)
      infil.count = infilCount
      runoff.count = dropCount - infilCount
      dropSeeds.forEach((s, i) => {
        const tt = (t * 0.42 * s.speed + s.off) % 1
        let x = s.x
        let y = 1.55 - tt * 2.05
        let scale = 1
        if (i < infilCount) {
          // 落到地表后继续下渗并缩小消失
          if (tt > 0.75) scale = Math.max(0.01, 1 - (tt - 0.75) * 4)
        } else {
          // 落地后沿地表横向流走
          const flow = Math.max(0, tt - 0.7) / 0.3
          x = s.x + flow * 2.4
          y = tt < 0.7 ? 1.55 - tt * 2.1 : 0.09
        }
        dummy.position.set(x, y, s.z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(scale)
        dummy.updateMatrix()
        if (i < infilCount) infil.setMatrixAt(i, dummy.matrix)
        else runoff.setMatrixAt(i - infilCount, dummy.matrix)
      })
      infil.instanceMatrix.needsUpdate = true
      runoff.instanceMatrix.needsUpdate = true
    },
    disposeExtra() { disposeRoot(root) }
  }
}

export const LAB_BUILDERS = {
  soil: buildSoilScene,
  rice: buildRiceScene,
  beidou: buildBeidouScene,
  notill: buildNoTillScene
}
