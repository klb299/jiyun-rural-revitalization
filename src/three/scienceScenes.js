/**
 * 科普实验室的三套可交互 Three.js 场景
 * 每个 build 函数返回统一接口：{ root, pickTargets, update(dt,t), setParam(p), disposeExtra() }
 * 由 ScienceStage.vue 负责创建舞台、切换场景与拾取。
 */
import * as THREE from 'three'
import gsap from 'gsap'
import { highlight, clearHighlight } from './stage.js'
import {
  PALETTE, mulberry32, roundedBox, bevelCylinder, lathe, coilSpringGeometry,
  chernozemMaterial, grassMaterial, gravelMaterial,
  porcelainMaterial, metalMaterial, lacquerMaterial,
  glowSprite, applyWind, labelTexture, waterNormalMap,
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

  // 剖面前缘：按 0–20 / 20–50 / 50–100 cm 层厚分色
  const soilBands = [
    { y: 0.85, h: 0.78, c: 0x241D16 },
    { y: 0.05, h: 0.78, c: 0x33291F },
    { y: -0.75, h: 0.78, c: 0x453829 }
  ]
  soilBands.forEach((b) => {
    const band = new THREE.Mesh(
      roundedBox(3.34, b.h - 0.012, 0.014, 0.006, 2),
      new THREE.MeshStandardMaterial({ color: b.c, roughness: 0.99 })
    )
    band.position.set(0, b.y, 1.052)
    root.add(band)
  })
  ;[0.46, -0.34, -1.14].forEach((y) => {
    const seam = new THREE.Mesh(
      roundedBox(3.34, 0.014, 0.016, 0.004, 2),
      new THREE.MeshStandardMaterial({ color: 0x6B5942, roughness: 0.96 })
    )
    seam.position.set(0, y, 1.066)
    root.add(seam)
  })

  // 左侧深度标尺：把「放大一厘米」的尺度讲清楚
  const tickMat = new THREE.MeshBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.72 })
  const soilRuler = new THREE.Mesh(new THREE.BoxGeometry(0.012, 2.5, 0.012), tickMat)
  soilRuler.position.set(-1.82, 0, 1.08)
  soilRuler.userData.excludeFromAO = true
  root.add(soilRuler)
  ;[
    { y: 1.25, t: '0 cm' }, { y: 0.55, t: '20 cm' },
    { y: -0.25, t: '50 cm' }, { y: -1.25, t: '100 cm' }
  ].forEach((d) => {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.012), tickMat)
    tick.position.set(-1.77, d.y, 1.08)
    tick.userData.excludeFromAO = true
    root.add(tick)
    const tex = labelTexture(d.t, {
      width: 256, height: 64, color: '#C88A32',
      font: '600 40px ui-monospace, monospace', align: 'left'
    })
    const lab = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.13),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    )
    lab.position.set(-2.08, d.y, 1.09)
    lab.userData.excludeFromAO = true
    root.add(lab)
  })
  const scaleTex = labelTexture('× 100  /  1 cm SOIL', {
    width: 640, height: 72, color: '#C88A32',
    font: '600 34px ui-monospace, monospace', align: 'right'
  })
  const scaleLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.17),
    new THREE.MeshBasicMaterial({ map: scaleTex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
  )
  scaleLabel.position.set(0.85, 1.42, 0.9)
  scaleLabel.userData.excludeFromAO = true
  root.add(scaleLabel)

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
  const crumbCount = 40
  const crumbs = new THREE.InstancedMesh(crumbGeo, crumbMat, crumbCount)
  for (let i = 0; i < crumbCount; i++) {
    const yy = (rnd() - 0.5) * 2.25
    const layer = (yy + 1.125) / 2.25
    dummy.position.set((rnd() - 0.5) * 3.15, yy, 1.07 + rnd() * 0.05)
    // 腐殖质层团粒最发达，往下逐渐变小；整体留白，别铺满剖面
    const s = (0.35 + rnd() * 0.62) * (0.62 + layer * 0.6)
    dummy.scale.set(s, s * (0.7 + rnd() * 0.5), s * 0.55)
    dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3)
    dummy.updateMatrix()
    crumbs.setMatrixAt(i, dummy.matrix)
  }
  crumbs.instanceMatrix.needsUpdate = true
  crumbs.castShadow = true
  crumbGroup.add(crumbs)
  // 团粒内部与粒间的微孔隙
  const microPores = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.028, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x17120E, roughness: 1 }), 22
  )
  for (let i = 0; i < 22; i++) {
    dummy.position.set((rnd() - 0.5) * 3.1, (rnd() - 0.5) * 2.2, 1.115)
    const s = 0.5 + rnd() * 1.1
    dummy.scale.set(s, s * 0.8, s * 0.3)
    dummy.rotation.set(0, 0, 0)
    dummy.updateMatrix()
    microPores.setMatrixAt(i, dummy.matrix)
  }
  microPores.instanceMatrix.needsUpdate = true
  crumbGroup.add(microPores)
  groups.crumb = crumbGroup

  const poreGeo = new THREE.SphereGeometry(0.11, 14, 10)
  const poreMat = new THREE.MeshStandardMaterial({ color: 0x120E0B, roughness: 1 })
  const poreGroup = new THREE.Group()
  poreGroup.userData.key = 'pore'
  const poreCount = 22
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

  // 贯通的蚯蚓通道：从地表蜿蜒到母质层，带地表孔口与侧枝
  const burrowMat = new THREE.MeshStandardMaterial({ color: 0x2A211A, roughness: 0.98 })
  const burrowRimMat = new THREE.MeshStandardMaterial({ color: 0x8C583A, roughness: 0.9 })
  for (let b = 0; b < 4; b++) {
    const x0 = (rnd() - 0.5) * 2.7
    const pts = []
    for (let k = 0; k < 7; k++) {
      pts.push(new THREE.Vector3(
        x0 + Math.sin(k * 1.05 + b * 1.7) * 0.22,
        1.16 - k * 0.38,
        1.09 + Math.sin(k * 0.8) * 0.012
      ))
    }
    poreGroup.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.038 + rnd() * 0.012, 9, false), burrowMat
    ))
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 8, 20), burrowRimMat)
    rim.position.set(x0, 1.17, 1.1)
    poreGroup.add(rim)
    const branchPts = [
      pts[3].clone(),
      pts[3].clone().add(new THREE.Vector3(0.3, -0.18, 0)),
      pts[3].clone().add(new THREE.Vector3(0.55, -0.5, 0))
    ]
    poreGroup.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(branchPts), 20, 0.02, 7, false), burrowMat
    ))
  }
  groups.pore = poreGroup

  const hyphaMat = new THREE.MeshStandardMaterial({
    color: 0x9A7738, roughness: 0.85, metalness: 0.08, transparent: true, opacity: 0.86
  })
  const hyphaGroup = new THREE.Group()
  hyphaGroup.userData.key = 'hypha'
  const hyphaNodeMat = new THREE.MeshStandardMaterial({ color: 0xE8BC6E, roughness: 0.75 })
  const nodeGeo = new THREE.SphereGeometry(0.026, 10, 8)
  for (let r = 0; r < 3; r++) {
    const x0 = (rnd() - 0.5) * 2.7
    const pts = []
    for (let k = 0; k < 7; k++) {
      pts.push(new THREE.Vector3(
        x0 + Math.sin(k * 1.2 + r) * 0.3,
        1.12 - k * 0.34,
        1.12 + rnd() * 0.015
      ))
    }
    hyphaGroup.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.019, 8, false), hyphaMat
    ))
    // 两条侧枝从主干分出，绕向相邻团粒
    ;[2, 4].forEach((k, j) => {
      const start = pts[k]
      const side = j % 2 ? 1 : -1
      const bpts = [
        start.clone(),
        start.clone().add(new THREE.Vector3(side * 0.16, -0.1, 0.01)),
        start.clone().add(new THREE.Vector3(side * 0.34, -0.28, 0.02))
      ]
      hyphaGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bpts), 20, 0.009, 6, false), hyphaMat
      ))
      const node = new THREE.Mesh(nodeGeo, hyphaNodeMat)
      node.position.copy(start)
      hyphaGroup.add(node)
    })
  }
  groups.hypha = hyphaGroup

  const noduleGeo = sculptedAggregateGeometry(0.13, 2, 9131, 0.34)
  const noduleMat = new THREE.MeshStandardMaterial({ color: 0xD9CBA9, roughness: 0.92 })
  const noduleGroup = new THREE.Group()
  noduleGroup.userData.key = 'nodule'
  const noduleCount = 10
  const nodules = new THREE.InstancedMesh(noduleGeo, noduleMat, noduleCount)
  // 同心层理：外层壳体 + 更亮的碳酸钙内芯
  const cores = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.06, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xF2E7CD, roughness: 0.9 }), noduleCount
  )
  for (let i = 0; i < noduleCount; i++) {
    const x = (rnd() - 0.5) * 3.0
    const y = (rnd() - 0.5) * 2.1
    const s = 0.5 + rnd() * 1.15
    dummy.position.set(x, y, 1.075)
    dummy.scale.set(s, s * 0.8, s * 0.45)
    dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3)
    dummy.updateMatrix()
    nodules.setMatrixAt(i, dummy.matrix)
    dummy.position.set(x, y, 1.1)
    dummy.scale.setScalar(s * 0.55)
    dummy.updateMatrix()
    cores.setMatrixAt(i, dummy.matrix)
  }
  nodules.instanceMatrix.needsUpdate = true
  cores.instanceMatrix.needsUpdate = true
  nodules.castShadow = true
  noduleGroup.add(nodules, cores)
  // 母质层里散落的钙质斑片
  const fleckMat = new THREE.MeshStandardMaterial({ color: 0xCDBB98, roughness: 0.95, side: THREE.DoubleSide })
  const fleckGeo = new THREE.PlaneGeometry(0.09, 0.035)
  for (let i = 0; i < 8; i++) {
    const fleck = new THREE.Mesh(fleckGeo, fleckMat)
    fleck.rotation.set(0, 0, rnd() * Math.PI)
    fleck.position.set((rnd() - 0.5) * 3.1, -0.5 - rnd() * 0.7, 1.115)
    noduleGroup.add(fleck)
  }
  groups.nodule = noduleGroup

  // 根系细须：不参与拾取，只补剖面的纵向层次
  const fineRootMat = new THREE.MeshStandardMaterial({ color: 0x6B5942, roughness: 0.96 })
  for (let r = 0; r < 3; r++) {
    const x0 = (rnd() - 0.5) * 2.6
    const pts = []
    for (let k = 0; k < 6; k++) {
      pts.push(new THREE.Vector3(x0 + Math.sin(k * 1.3 + r) * 0.16, 1.16 - k * 0.4, 1.115))
    }
    root.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 26, 0.008, 5, false), fineRootMat
    ))
  }

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
    // 同一材质被几十个 mesh 共用，按材质去重，避免一次聚焦生成上百个重复 tween
    const tweened = new Set()
    keys.forEach((k) => {
      const target = k === focus ? 1 : 0.42
      groups[k].traverse((o) => {
        const m = o.material
        if (!o.isMesh || !m || tweened.has(m)) return
        tweened.add(m)
        gsap.to(m, { opacity: k === 'hypha' ? (target === 1 ? 0.95 : 0.3) : 1, duration: 0.5 })
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

  const rnd = mulberry32(9182)
  const dummy = new THREE.Object3D()
  const groups = {}
  const keys = ['plant', 'water', 'bund', 'canal']

  // 田床
  const bed = new THREE.Mesh(
    roundedBox(4.6, 0.32, 2.9, 0.1, 6),
    chernozemMaterial({ repeat: [5, 3], bumpScale: 0.03 })
  )
  bed.position.y = -0.9
  bed.receiveShadow = true
  bed.castShadow = true
  root.add(bed)

  // 1) 水层：法线细波 + 三圈扩散涟漪
  const waterGroup = new THREE.Group()
  waterGroup.userData.key = 'water'
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(4.5, 2.8, 40, 20),
    new THREE.MeshPhysicalMaterial({
      color: 0x9FC4CC, roughness: 0.12, metalness: 0.05,
      normalMap: waterNormalMap([6, 2]),
      normalScale: new THREE.Vector2(0.12, 0.12),
      transparent: true, opacity: 0.55, depthWrite: false,
      clearcoat: 1, side: THREE.DoubleSide
    })
  )
  water.rotation.x = -Math.PI / 2
  water.position.y = -0.71
  water.userData.excludeFromAO = true
  waterGroup.add(water)
  const ripples = []
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.215, 48),
      new THREE.MeshBasicMaterial({ color: 0xE8F4F6, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.set(-1.3 + i * 1.3, -0.695, 0.4 - i * 0.5)
    ring.userData.excludeFromAO = true
    waterGroup.add(ring)
    ripples.push(ring)
  }
  groups.water = waterGroup

  // 2) 四边田埂
  const bundGroup = new THREE.Group()
  bundGroup.userData.key = 'bund'
  const bundMat = chernozemMaterial({ repeat: [4, 1], bumpScale: 0.04, color: 0x7C6A52 })
  ;[
    { x: 0, z: -1.52, w: 4.9, d: 0.22 },
    { x: 0, z: 1.52, w: 4.9, d: 0.22 },
    { x: -2.36, z: 0, w: 0.22, d: 3.05 },
    { x: 2.36, z: 0, w: 0.22, d: 3.05 }
  ].forEach((b) => {
    const m = new THREE.Mesh(roundedBox(b.w, 0.26, b.d, 0.06, 4), bundMat)
    m.position.set(b.x, -0.74, b.z)
    m.castShadow = true
    m.receiveShadow = true
    bundGroup.add(m)
  })
  groups.bund = bundGroup

  // 3) 灌渠、闸门与水位标尺
  const canalGroup = new THREE.Group()
  canalGroup.userData.key = 'canal'
  const canal = new THREE.Mesh(
    roundedBox(0.34, 0.1, 3.05, 0.03, 4),
    new THREE.MeshStandardMaterial({ color: 0x3E5F68, roughness: 0.32, metalness: 0.12 })
  )
  canal.position.set(2.62, -0.76, 0)
  canalGroup.add(canal)
  const gate = new THREE.Mesh(
    roundedBox(0.42, 0.2, 0.5, 0.03, 4),
    metalMaterial(0x8C583A, { roughness: 0.6 }).clone()
  )
  gate.position.set(2.62, -0.68, 1.15)
  canalGroup.add(gate)
  const rulerMat = new THREE.MeshBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.75 })
  const wr = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.5, 0.012), rulerMat)
  wr.position.set(-2.52, -0.5, 1.0)
  wr.userData.excludeFromAO = true
  canalGroup.add(wr)
  ;[
    { y: -0.3, t: '15 cm' }, { y: -0.46, t: '5 cm' }, { y: -0.62, t: '0 cm' }
  ].forEach((d) => {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.012), rulerMat)
    tick.position.set(-2.47, d.y, 1.0)
    tick.userData.excludeFromAO = true
    canalGroup.add(tick)
    const tex = labelTexture(d.t, {
      width: 256, height: 64, color: '#C88A32',
      font: '600 40px ui-monospace, monospace', align: 'left'
    })
    const lab = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.115),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    )
    lab.position.set(-2.78, d.y, 1.01)
    lab.userData.excludeFromAO = true
    canalGroup.add(lab)
  })
  groups.canal = canalGroup

  // 4) 稻株：分节茎 / 弧面叶 / 下垂穗轴 / 谷粒，另加阶段专属的秧盘与稻花
  const stalkGeo = makeDetailedRiceStalkGeometry({ height: 0.95, grainCount: 12, leafCount: 4, widthScale: 1.6 })
  const plantMat = new THREE.MeshStandardMaterial({ color: 0x4E7A52, roughness: 0.84, metalness: 0.02, side: THREE.DoubleSide })
  const wind = applyWind(plantMat, { amount: 0.09, speed: 1.35, phaseScale: 1.2 })
  const rows = 6, cols = 14, count = rows * cols
  const plantGroup = new THREE.Group()
  plantGroup.userData.key = 'plant'
  const rice = new THREE.InstancedMesh(stalkGeo, plantMat, count)
  rice.castShadow = true
  plantGroup.add(rice)

  const trayMat = new THREE.MeshStandardMaterial({ color: 0x8C7A5A, roughness: 0.92 })
  const tray = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const cell = new THREE.Mesh(roundedBox(0.72, 0.06, 2.3, 0.02, 3), trayMat)
    cell.position.set(-1.84 + i * 0.92, -0.7, 0)
    tray.add(cell)
  }
  plantGroup.add(tray)
  const flowers = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.018, 6, 5),
    new THREE.MeshStandardMaterial({ color: 0xF2EDE0, roughness: 0.9 }), 36
  )
  const flowerDummy = new THREE.Object3D()
  for (let i = 0; i < 36; i++) {
    flowerDummy.position.set((rnd() - 0.5) * 4.0, -0.2 + rnd() * 0.25, (rnd() - 0.5) * 2.3)
    flowerDummy.scale.setScalar(0.7 + rnd() * 0.8)
    flowerDummy.updateMatrix()
    flowers.setMatrixAt(i, flowerDummy.matrix)
  }
  flowers.instanceMatrix.needsUpdate = true
  plantGroup.add(flowers)
  groups.plant = plantGroup

  const spots = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      spots.push({
        x: (c / (cols - 1) - 0.5) * 4.1 + (rnd() - 0.5) * 0.1,
        z: (r / (rows - 1) - 0.5) * 2.4 + (rnd() - 0.5) * 0.1,
        rx: (rnd() - 0.5) * 0.1, ry: rnd() * Math.PI * 2,
        tilt: rnd() - 0.5, hf: 0.82 + rnd() * 0.32,
        sx: 0.85 + rnd() * 0.3, sz: 0.85 + rnd() * 0.3
      })
    }
  }
  keys.forEach((k) => root.add(groups[k]))

  // 阶段展签：5 张纹理预生成，切换 map 不重复分配
  const phaseNames = [
    '01  SEEDLING / 育秧', '02  TILLERING / 分蘖', '03  HEADING / 抽穗',
    '04  GRAIN FILLING / 灌浆', '05  HARVEST / 成熟'
  ]
  const phaseTextures = phaseNames.map((t) => labelTexture(t, {
    width: 900, height: 80, color: '#C88A32',
    font: '600 34px ui-monospace, monospace', align: 'right'
  }))
  const phaseLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 0.19),
    new THREE.MeshBasicMaterial({ map: phaseTextures[0], transparent: true, depthWrite: false, side: THREE.DoubleSide })
  )
  phaseLabel.position.set(1.0, 0.62, 0.6)
  phaseLabel.userData.excludeFromAO = true
  root.add(phaseLabel)

  const phases = [
    { h: 0.22, color: 0x6E9B5E, lean: 0.02, water: 0.55 },
    { h: 0.52, color: 0x4E7A52, lean: 0.05, water: 0.42 },
    { h: 0.78, color: 0x57864C, lean: 0.08, water: 0.26 },
    { h: 0.95, color: 0x98955A, lean: 0.16, water: 0.08 },
    { h: 1.05, color: 0xA98843, lean: 0.26, water: 0 }
  ]
  let current = 0
  const proxy = { v: 0 }
  let focus = 'plant'

  function apply(p) {
    const idx = Math.max(0, Math.min(4, Math.round(p)))
    const a = phases[idx]
    plantMat.color.setHex(a.color)
    gsap.to(water.material, { opacity: a.water, duration: 0.6 })
    tray.visible = idx === 0
    flowers.visible = idx === 2
    ripples.forEach((r) => { r.visible = a.water > 0.05 })
    phaseLabel.material.map = phaseTextures[idx]
    phaseLabel.material.needsUpdate = true
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
  function applyFocus(next) {
    if (!next || !groups[next]) return
    if (groups[focus]) clearHighlight(groups[focus])
    focus = next
    highlight(groups[focus], { intensity: 0.1 })
  }
  apply(0)
  applyFocus('plant')

  stage.addContactShadow({ size: 7, opacity: 0.4, position: [0, -1.42, 0], parent: root })

  return {
    root,
    pickTargets: keys.map((k) => groups[k]),
    setParam(p) {
      if (p?.focus) applyFocus(p.focus)
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
      ripples.forEach((r, i) => {
        const k = (t * 0.35 + i * 0.33) % 1
        r.scale.setScalar(0.5 + k * 2.2)
        r.material.opacity = 0.3 * (1 - k)
      })
    },
    disposeExtra() {
      phaseTextures.forEach((t) => t.dispose())
      disposeRoot(root)
    }
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
  // 四类结构各自成组，便于拾取与高亮（与其余三个科普实验一致）
  const groups = {}
  const keys = ['sat', 'station', 'rover', 'track']
  let focus = 'sat'
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

  // 地面尺度标尺：与实验一 / 稻作场景的展签语言一致
  const rulerTex = labelTexture('0       5       10 m', {
    width: 512, height: 96, font: '600 40px ui-monospace, monospace', color: '#F0C275'
  })
  const ruler = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 0.34),
    new THREE.MeshBasicMaterial({ map: rulerTex, transparent: true, depthWrite: false, toneMapped: false })
  )
  ruler.rotation.x = -Math.PI / 2
  ruler.position.set(-1.75, -1.09, 1.92)
  ruler.userData.excludeFromAO = true
  root.add(ruler)
  for (let i = 0; i < 3; i++) {
    const tick = new THREE.Mesh(roundedBox(0.02, 0.012, 0.14, 0.004, 2), goldMetal)
    tick.position.set(-2.55 + i * 0.8, -1.085, 1.92)
    root.add(tick)
  }

  // ---------- 计划路线与实际路线：一眼看懂厘米级意味着什么 ----------
  const trackGroup = new THREE.Group()
  trackGroup.userData.key = 'track'
  root.add(trackGroup)
  groups.track = trackGroup

  const planLine = new THREE.Mesh(
    roundedBox(0.055, 0.014, 4.15, 0.007, 2),
    new THREE.MeshBasicMaterial({ color: PALETTE.gold })
  )
  planLine.position.set(0, -1.138, 0)
  planLine.userData.excludeFromAO = true
  trackGroup.add(planLine)

  const actualSegs = []
  const actualMat = new THREE.MeshStandardMaterial({
    color: 0x2E5A44, roughness: 0.55, metalness: 0.15,
    emissive: 0x2E5A44, emissiveIntensity: 0.28
  })
  const segGeo = roundedBox(0.052, 0.018, 0.18, 0.006, 2)
  for (let i = 0; i < 24; i++) {
    const seg = new THREE.Mesh(segGeo, actualMat)
    seg.position.set(0.012, -1.116, -1.98 + i * 0.172)
    trackGroup.add(seg)
    actualSegs.push(seg)
  }

  // ---------- 农机（移动站） ----------
  const tractor = new THREE.Group()
  tractor.userData.key = 'rover'
  tractor.position.set(0, -1.0, 0)
  groups.rover = tractor
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
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2
        const lug = new THREE.Mesh(roundedBox(0.19, 0.035, 0.055, 0.01, 2), tireMat)
        lug.position.set(sx * 0.53, 0.22 + Math.cos(a) * 0.225, sz * 0.48 + Math.sin(a) * 0.225)
        lug.rotation.x = a
        tractor.add(lug)
      }
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.012, 8, 24), hubMat)
      rim.rotation.y = Math.PI / 2
      rim.position.set(sx * 0.625, 0.22, sz * 0.48)
      tractor.add(rim)
    }
  }
  // 收敛后的农机细节：格栅竖条、排气立管、驾驶舱 A 柱、天线底座分件
  // 次要结构一律压暗，避免盖住红色机罩与金色 RTK 天线这两个主结构
  const darkTrim = new THREE.MeshStandardMaterial({ color: 0x2A2622, roughness: 0.9 })
  for (let i = 0; i < 5; i++) {
    const bar = new THREE.Mesh(roundedBox(0.028, 0.2, 0.02, 0.006, 2), darkTrim)
    bar.position.set(-0.2 + i * 0.1, 0.4, 0.782)
    tractor.add(bar)
  }
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.42, 12), darkTrim)
  exhaust.position.set(0.31, 0.72, 0.22)
  tractor.add(exhaust)
  for (const sx of [-1, 1]) {
    const pillar = new THREE.Mesh(roundedBox(0.035, 0.5, 0.035, 0.008, 2), darkTrim)
    pillar.position.set(sx * 0.4, 0.76, -0.3)
    tractor.add(pillar)
  }
  const antennaBase = new THREE.Mesh(bevelCylinder(0.09, 0.05, { bevel: 0.012, segments: 24 }), darkTrim)
  antennaBase.position.set(0, 1.1, -0.3)
  tractor.add(antennaBase)

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
  station.userData.key = 'station'
  station.position.set(-2.42, -1.16, 1.3)
  groups.station = station
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
  for (let i = 0; i < 3; i++) {
    const slot = new THREE.Mesh(roundedBox(0.2, 0.012, 0.012, 0.004, 2), darkTrim)
    slot.position.set(0, 0.66 + i * 0.05, 0.125)
    station.add(slot)
  }
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
  const satGroup = new THREE.Group()
  satGroup.userData.key = 'sat'
  satRoot.add(satGroup)
  groups.sat = satGroup
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
      const panelEdge = new THREE.Mesh(roundedBox(0.46, 0.008, 0.014, 0.003, 2), goldMetal)
      panelEdge.position.set(s * 0.41, 0.022, 0.115)
      panelEdge.rotation.z = s * 0.12
      g.add(panelEdge)
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
    satGroup.add(g)

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
    sp.scale.set(1.45, 0.36, 1)
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
  labelFix.scale.set(1.02, 0.26, 1)
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

  function applyFocus(next) {
    if (!next || !groups[next]) return
    if (groups[focus]) clearHighlight(groups[focus])
    focus = next
    highlight(groups[focus], { intensity: 0.1 })
  }
  applyFocus('sat')

  stage.addContactShadow({ size: 8, opacity: 0.38, position: [0, -1.5, 0], parent: root })

  return {
    root,
    pickTargets: keys.map((k) => groups[k]),
    setParam(p) {
      if (!p) return
      if (p.focus) applyFocus(p.focus)
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

  // 剖面前缘：按 0–20 / 20–50 / 50–100 cm 的层厚分色
  const layerBands = [
    { y: -0.15, h: 0.30, c: 0x241D16 },
    { y: -0.51, h: 0.42, c: 0x33291F },
    { y: -0.99, h: 0.54, c: 0x453829 }
  ]
  layerBands.forEach((b) => {
    const band = new THREE.Mesh(
      roundedBox(3.54, b.h - 0.012, 0.014, 0.006, 2),
      new THREE.MeshStandardMaterial({ color: b.c, roughness: 0.99 })
    )
    band.position.set(0, b.y, 1.103)
    root.add(band)
  })
  ;[-0.30, -0.72, -1.26].forEach((y) => {
    const seam = new THREE.Mesh(
      roundedBox(3.54, 0.014, 0.016, 0.004, 2),
      new THREE.MeshStandardMaterial({ color: 0x6B5942, roughness: 0.96 })
    )
    seam.position.set(0, y, 1.116)
    root.add(seam)
  })

  // 剖面里的团粒、孔隙与结核，贴在分色带之前
  const sectionRnd = mulberry32(8813)
  const secCrumbMat = new THREE.MeshStandardMaterial({ color: 0x4E3E2E, roughness: 0.97 })
  const secCrumbs = new THREE.InstancedMesh(sculptedAggregateGeometry(0.055, 1, 8813, 0.3), secCrumbMat, 42)
  for (let i = 0; i < 42; i++) {
    dummy.position.set((sectionRnd() - 0.5) * 3.3, -0.08 - sectionRnd() * 1.34, 1.12 + sectionRnd() * 0.01)
    const s = 0.5 + sectionRnd() * 1.0
    dummy.scale.set(s, s * 0.8, s * 0.4)
    dummy.rotation.set(sectionRnd() * 3, sectionRnd() * 3, sectionRnd() * 3)
    dummy.updateMatrix()
    secCrumbs.setMatrixAt(i, dummy.matrix)
  }
  secCrumbs.instanceMatrix.needsUpdate = true
  root.add(secCrumbs)

  const poreDots = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.035, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0x120E0B, roughness: 1 }), 34
  )
  for (let i = 0; i < 34; i++) {
    dummy.position.set((sectionRnd() - 0.5) * 3.25, -0.06 - sectionRnd() * 1.36, 1.128)
    const s = 0.5 + sectionRnd() * 1.1
    dummy.scale.set(s, s * 0.85, s * 0.3)
    dummy.rotation.set(0, 0, 0)
    dummy.updateMatrix()
    poreDots.setMatrixAt(i, dummy.matrix)
  }
  poreDots.instanceMatrix.needsUpdate = true
  root.add(poreDots)

  // 根系：从地表向下分叉
  const rootHairMat = new THREE.MeshStandardMaterial({ color: 0x4A3F30, roughness: 0.95 })
  for (let r = 0; r < 2; r++) {
    const x0 = (sectionRnd() - 0.5) * 2.7
    const pts = []
    for (let k = 0; k < 5; k++) {
      pts.push(new THREE.Vector3(x0 + Math.sin(k * 1.1 + r) * 0.14, -0.02 - k * 0.2, 1.13))
    }
    root.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 22, 0.009, 5, false), rootHairMat
    ))
  }

  // 左侧深度标尺：刻度线与数字展签
  const rulerMat = new THREE.MeshBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.72 })
  const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.012, 1.5, 0.012), rulerMat)
  ruler.position.set(-1.94, -0.75, 1.14)
  ruler.userData.excludeFromAO = true
  root.add(ruler)
  ;[
    { y: 0, t: '0 cm' }, { y: -0.3, t: '20 cm' },
    { y: -0.75, t: '50 cm' }, { y: -1.5, t: '100 cm' }
  ].forEach((d) => {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.012), rulerMat)
    tick.position.set(-1.89, d.y, 1.14)
    tick.userData.excludeFromAO = true
    root.add(tick)
    const tex = labelTexture(d.t, {
      width: 256, height: 64, color: '#C88A32',
      font: '600 40px ui-monospace, monospace', align: 'left'
    })
    const lab = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.13),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    )
    lab.position.set(-2.2, d.y, 1.15)
    lab.userData.excludeFromAO = true
    root.add(lab)
  })

  // 地表薄层：覆盖率越高越深越疏松
  const surfaceMat = new THREE.MeshStandardMaterial({ color: 0x241E18, roughness: 0.98 })
  const surface = new THREE.Mesh(roundedBox(3.56, 0.06, 2.16, 0.03, 4), surfaceMat)
  surface.position.y = 0.03
  surface.receiveShadow = true
  root.add(surface)

  const groups = {}
  const keys = ['straw', 'crumb', 'pore', 'opener']

  // 1) 秸秆覆盖：横卧细秆，数量随覆盖率变化
  // 带两道节的秸秆：沿长度方向做鼓包，再转到水平横卧
  const strawGeo = lathe([
    [0.010, -0.26], [0.016, -0.22], [0.013, -0.16],
    [0.012, 0.00], [0.017, 0.045], [0.013, 0.075],
    [0.012, 0.20], [0.016, 0.235], [0.011, 0.26]
  ], 10)
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
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, 0.011 + rnd() * 0.005, 7, false),
      new THREE.MeshStandardMaterial({ color: 0x403326, roughness: 0.92 })
    )
    poreGroup.add(tube)
  }
  groups.pore = poreGroup

  // 4) 免耕播种总成：18 个零件，可沿径向展开查看内部装配
  const openerGroup = new THREE.Group()
  openerGroup.userData.key = 'opener'
  const openerParts = []
  const partByKey = {}
  // 装配坐标重映射：原零件散落在 x 1.0–1.9 / y 0.1–1.0，相对 3.6 宽的土块太小。
  // 统一放大并移到土块上方居中，使收拢状态就能读出「一台播种机」。
  const fitPart = (base) => [
    (base[0] - 1.36) * 1.35,
    (base[1] - 0.45) * 1.35 + 0.62,
    (base[2] - 0.55) * 1.35
  ]
  const addPart = (mesh, base, dir, key) => {
    const fitted = fitPart(base)
    mesh.position.set(fitted[0], fitted[1], fitted[2])
    openerGroup.add(mesh)
    const v = new THREE.Vector3(base[0] - 1.38, base[1] - 0.45, base[2] - 0.55)
    if (v.lengthSq() < 0.001) v.set(dir[0], dir[1], dir[2])
    else v.normalize().add(new THREE.Vector3(dir[0], dir[1], dir[2]).multiplyScalar(0.35)).normalize()
    const entry = { mesh, base: new THREE.Vector3(fitted[0], fitted[1], fitted[2]), dir: v }
    openerParts.push(entry)
    if (key) {
      mesh.userData.key = key
      // 可聚焦零件必须独占材质，否则 highlight() 会串到共用 steel/darkSteel 的其它零件
      if (mesh.material && !Array.isArray(mesh.material)) mesh.material = mesh.material.clone()
      if (!partByKey[key]) partByKey[key] = []
      partByKey[key].push(entry)
    }
  }

  // 播种机机身框架：给散件一个可读的整体轮廓（纵梁 + 横梁 + 种箱托架）
  const frameMat = metalMaterial(0x3A3630, { roughness: 0.56, metalness: 0.55 }).clone()
  const chassis = new THREE.Group()
  chassis.userData.key = 'chassisFrame'
  const beam = new THREE.Mesh(roundedBox(1.9, 0.11, 0.16, 0.03, 4), frameMat)
  beam.position.set(0, 0.58, 0)
  chassis.add(beam)
  const cross = new THREE.Mesh(roundedBox(0.14, 0.09, 1.0, 0.03, 4), frameMat)
  cross.position.set(0.55, 0.58, 0)
  chassis.add(cross)
  const tongue = new THREE.Mesh(roundedBox(0.72, 0.08, 0.1, 0.025, 3), frameMat)
  tongue.position.set(1.15, 0.58, 0)
  tongue.rotation.z = -0.12
  chassis.add(tongue)
  openerGroup.add(chassis)

  const steel = metalMaterial(PALETTE.gold, { roughness: 0.32, metalness: 0.82 }).clone()
  const darkSteel = metalMaterial(0x6E6960, { roughness: 0.42 }).clone()

  // 缺刻圆盘：14 齿轮廓挤出，竖直切土不翻垄
  const toothShape = new THREE.Shape()
  const teeth = 14
  for (let i = 0; i <= teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2
    const rr = i % 2 ? 0.52 : 0.60
    if (i === 0) toothShape.moveTo(Math.cos(a) * rr, Math.sin(a) * rr)
    else toothShape.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
  }
  const notchedDiscGeo = new THREE.ExtrudeGeometry(toothShape, {
    depth: 0.04, bevelEnabled: true, bevelSize: 0.008,
    bevelThickness: 0.008, bevelSegments: 2, curveSegments: 1
  })
  const disc = new THREE.Mesh(notchedDiscGeo, steel)
  disc.rotation.y = Math.PI / 2
  addPart(disc, [0.75, 0.10, 0.62], [-1, 0, 0], 'disc')
  const disc2 = new THREE.Mesh(notchedDiscGeo.clone().scale(0.82, 0.82, 1), darkSteel)
  disc2.rotation.y = Math.PI / 2
  addPart(disc2, [0.75, 0.10, 0.18], [-1, 0, -1], 'disc2')

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.09, 24), lacquerMaterial(0x1C1B18).clone())
  hub.rotation.z = Math.PI / 2
  addPart(hub, [0.75, 0.10, 0.62], [-1, 1, 0], 'hub')
  const boltGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const bolt = new THREE.Mesh(boltGeo, steel)
    bolt.rotation.z = Math.PI / 2
    addPart(bolt, [0.98, 0.20 + Math.cos(a) * 0.055, 0.64 + Math.sin(a) * 0.055], [-1, Math.cos(a), Math.sin(a)], 'bolts')
  }

  const arm = new THREE.Mesh(roundedBox(0.82, 0.09, 0.1, 0.03, 4), darkSteel)
  arm.rotation.z = -0.32
  addPart(arm, [1.34, 0.50, 0.55], [0.4, 1, 0], 'arm')
  const spring = new THREE.Mesh(
    coilSpringGeometry({ radius: 0.055, tubeRadius: 0.011, height: 0.3, turns: 6 }), steel
  )
  addPart(spring, [1.28, 0.74, 0.55], [0, 1, 0.3], 'spring')
  const springCap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 24), darkSteel)
  addPart(springCap, [1.28, 0.90, 0.55], [0, 1, 0], 'springCap')

  const gaugeWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.155, 0.155, 0.055, 32),
    new THREE.MeshStandardMaterial({ color: 0x2E5A44, roughness: 0.86 })
  )
  gaugeWheel.rotation.z = Math.PI / 2
  addPart(gaugeWheel, [1.62, 0.13, 0.64], [1, -0.4, 0], 'gauge')
  const pressWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.05, 32), lacquerMaterial(0x1C1B18).clone()
  )
  pressWheel.rotation.z = Math.PI / 2
  addPart(pressWheel, [1.88, 0.12, 0.64], [1, -0.4, 0], 'press')

  const seedBox = new THREE.Mesh(
    roundedBox(0.36, 0.26, 0.28, 0.05, 5), porcelainMaterial({ repeat: [2, 2] }).clone()
  )
  addPart(seedBox, [1.52, 0.98, 0.55], [0.5, 1, 0], 'seedBox')
  const seedCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.22, 0.36, 0), new THREE.Vector3(0.10, 0.18, 0),
    new THREE.Vector3(-0.02, -0.06, 0), new THREE.Vector3(-0.14, -0.30, 0)
  ])
  addPart(new THREE.Mesh(new THREE.TubeGeometry(seedCurve, 32, 0.022, 8, false), darkSteel),
    [1.20, 0.50, 0.55], [0.6, 0, 0], 'seedTube')
  const boot = new THREE.Mesh(roundedBox(0.1, 0.2, 0.06, 0.02, 3), steel)
  boot.rotation.z = 0.25
  addPart(boot, [1.06, 0.13, 0.55], [-0.5, -1, 0], 'boot')
  const hitch = new THREE.Mesh(roundedBox(0.5, 0.06, 0.07, 0.02, 3), darkSteel)
  addPart(hitch, [1.72, 0.72, 0.55], [1, 0.5, 0], 'hitch')
  // 整机抬到剖面上方：让播种总成成为独立可读的机器，而不是贴在土块上的散件
  openerGroup.position.set(-0.35, 0.78, 0)
  openerGroup.scale.setScalar(1.28)
  // 整机抬到剖面上方：让播种总成成为独立可读的机器，而不是贴在土块上的散件
  openerGroup.position.set(-0.35, 0.78, 0)
  openerGroup.scale.setScalar(1.28)
  groups.opener = openerGroup

  keys.forEach((k) => root.add(groups[k]))

  // 直立残茬与垄线：免耕田的固定特征，不随覆盖率变化
  const stubbleMat = new THREE.MeshStandardMaterial({ color: 0xA98246, roughness: 0.94 })
  const cutMat = new THREE.MeshStandardMaterial({ color: 0xD8BC86, roughness: 0.86, side: THREE.DoubleSide })
  for (let i = 0; i < 9; i++) {
    const h = 0.16 + rnd() * 0.12
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, h, 9), stubbleMat)
    const x = (rnd() - 0.5) * 2.9
    const z = (rnd() - 0.5) * 1.7
    st.position.set(x, 0.06 + h / 2, z)
    st.rotation.z = (rnd() - 0.5) * 0.25
    st.castShadow = true
    root.add(st)
    // 斜切口：亮色薄椭圆，暗示收割留下的断面
    const cut = new THREE.Mesh(new THREE.CircleGeometry(0.023, 10), cutMat)
    cut.rotation.set(-Math.PI / 2 + 0.35, 0, 0)
    cut.position.set(x + 0.004, 0.06 + h, z)
    root.add(cut)
  }
  // 散落的碎秸秆屑
  const chipMat = new THREE.MeshStandardMaterial({ color: 0xB89457, roughness: 0.95, side: THREE.DoubleSide })
  const chipGeo = new THREE.PlaneGeometry(0.075, 0.022)
  for (let i = 0; i < 22; i++) {
    const chip = new THREE.Mesh(chipGeo, chipMat)
    chip.rotation.set(-Math.PI / 2, 0, rnd() * Math.PI)
    chip.position.set((rnd() - 0.5) * 3.2, 0.072, (rnd() - 0.5) * 1.9)
    root.add(chip)
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
  // 溅蚀：雨滴直接砸在裸露表土上溅起的细土粒，覆盖率越低越明显
  const splashCount = 20
  const splash = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.016, 6, 5),
    new THREE.MeshStandardMaterial({ color: 0x6B4A2E, roughness: 0.95, transparent: true, opacity: 0.9 }),
    splashCount
  )
  splash.userData.excludeFromAO = true
  splash.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  root.add(splash)

  const dropSeeds = Array.from({ length: dropCount }, () => ({
    x: (rnd() - 0.5) * 3.0, z: (rnd() - 0.5) * 1.7,
    off: rnd(), speed: 0.7 + rnd() * 0.5
  }))

  stage.addContactShadow({ size: 6.4, opacity: 0.42, position: [0, -1.38, 0], parent: root })

  let coverage = 60
  let focus = 'straw'
  let explode = 0
  let rain = 2
  let partFocus = null
  function applyCoverage(v) {
    coverage = Math.max(0, Math.min(100, Number(v) || 0))
    const shown = Math.round(maxStraw * coverage / 100)
    strawA.count = Math.ceil(shown / 2)
    strawB.count = Math.floor(shown / 2)
    surfaceMat.color.set(coverage >= 60 ? 0x241E18 : coverage >= 30 ? 0x32281E : 0x4A3E30)
  }
  function applyRain(v) {
    rain = Math.max(1, Math.min(3, Math.round(Number(v) || 2)))
  }
  function applyExplode(v) {
    explode = Math.max(0, Math.min(1, Number(v) || 0))
    openerParts.forEach(({ mesh, base, dir }) => {
      mesh.position.copy(base).addScaledVector(dir, explode * 0.42)
    })
  }
  function clearPartFocus() {
    if (partFocus && partByKey[partFocus]) {
      partByKey[partFocus].forEach((e) => clearHighlight(e.mesh))
    }
    partFocus = null
  }
  function applyPartFocus(key) {
    clearPartFocus()
    if (!key || !partByKey[key]) return
    clearHighlight(openerGroup)
    partFocus = key
    partByKey[key].forEach((e) => highlight(e.mesh, { intensity: 0.18 }))
  }
  function applyFocus(next) {
    clearPartFocus()
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
      if (p && typeof p.rain === 'number') applyRain(p.rain)
      if (p && typeof p.explode === 'number') applyExplode(p.explode)
      // 先切结构焦点再点零件，否则 applyFocus 会把零件高亮清掉
      if (p?.focus) applyFocus(p.focus)
      if (p && 'part' in p) {
        if (p.part) applyPartFocus(p.part)
        else clearPartFocus()
      }
    },
    update(dt, t) {
      root.rotation.y = Math.sin(t * 0.14) * 0.12
      const activeDrops = Math.round(dropCount * rain / 3)
      const infilCount = Math.round(activeDrops * coverage / 100)
      const rainSpeed = 0.7 + rain * 0.25
      infil.count = infilCount
      runoff.count = activeDrops - infilCount
      dropSeeds.forEach((s, i) => {
        if (i >= activeDrops) return
        const tt = (t * 0.42 * s.speed * rainSpeed + s.off) % 1
        let x = s.x
        let y = 1.55 - tt * 2.05
        let scale = 1
        if (i < infilCount) {
          // 沿孔隙蜿蜒下渗，不是笔直坠落
          x = s.x + Math.sin(tt * 7 + s.off * 9) * 0.05
          if (tt > 0.75) scale = Math.max(0.01, 1 - (tt - 0.75) * 4)
        } else {
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

      // 溅蚀土粒：覆盖率越低，裸露表土被砸得越明显
      const splashShown = Math.round(splashCount * (1 - coverage / 100) * rain / 3)
      splash.count = splashShown
      for (let i = 0; i < splashShown; i++) {
        const s = dropSeeds[i]
        const tt = (t * 0.8 + s.off) % 1
        dummy.position.set(
          s.x + (tt - 0.5) * 0.28,
          0.08 + Math.sin(tt * Math.PI) * 0.22,
          s.z + Math.cos(tt * 6 + i) * 0.04
        )
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(Math.sin(tt * Math.PI) * 0.9 + 0.1)
        dummy.updateMatrix()
        splash.setMatrixAt(i, dummy.matrix)
      }
      splash.instanceMatrix.needsUpdate = true
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
