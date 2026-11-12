<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import { createStage, highlight, clearHighlight } from '../three/stage.js'
import {
  PALETTE, roundedBox, bevelCylinder, lathe, coilSpringGeometry,
  metalMaterial, lacquerMaterial, fabricMaterial, rubberMaterial,
  porcelainMaterial, paperMaterial, glassMaterial,
  labelTexture, mulberry32
} from '../three/textures.js'

const containerRef = ref(null)
const isExploded = ref(false)
const selectedPart = ref('all')
const isTouring = ref(false)
const isReady = ref(false)
const qualityLabel = ref('展览级 · IBL + GTAO')
const tooltip = ref({ visible: false, x: 0, y: 0, title: '', sub: '' })

let stage, scene
let carGroup = null
let signalRings = []
let headlightMats = []
let tickRing = null
const labelTextures = []
const pickTargets = []
let hoveredPart = null

const parts = {
  chassis: null,
  cabin: null,
  wheels: [],
  antenna: null,
  engine: null
}

const partsData = {
  all: {
    title: '长春造 · 北斗 5G 无人智慧拖拉机整机',
    tag: '整机总成',
    specs: '260 马力重负荷柴电混动',
    desc: '集成一汽工业底蕴与长春现代智能农机核心技术，支持超低温全天候自主作业，北斗高精度平准垄作。'
  },
  antenna: {
    title: '北斗三号双频 RTK 卫星定位天线',
    tag: '制导导航',
    specs: '定位精度 ±2.5 cm · 厘米级',
    desc: '自动接收北斗地基增强站信号，自主规划地块耕作航线，支持夜间与雨雪浓雾盲视起垄作业。'
  },
  engine: {
    title: '大扭矩智能混合动力总成',
    tag: '动力核心',
    specs: '低转速超大扭矩 · 节油 25%',
    desc: '专为东北深翻深松重阻力黑土设计，动力输出平顺强悍，有效减少黑土压实硬化。'
  },
  cabin: {
    title: '数字化全景智能电控舱',
    tag: '车载中枢',
    specs: '数字座舱 + 远程 5G 冗余控制',
    desc: '内置农情决策芯片，实时监测发动机扭矩、滑移率及排气温度，可实现单人远程调度多台机群。'
  },
  wheels: {
    title: '低压宽断面环保高浮力农用胎',
    tag: '底盘接地',
    specs: '超低接地比压 · 护土防压实',
    desc: '特种耐低温橡胶配方与超宽胎面，显著分散机身重量，严格保护黑土微观孔隙与蚯蚓生态通道。'
  },
  chassis: {
    title: '重载刚性车架与后桥传动总成',
    tag: '承载车架',
    specs: '双侧纵梁 · 全时四驱',
    desc: '高强度刚性车架承受深松作业巨大牵引阻力，前后配重平衡与低速大扭矩输出，确保黑土深耕不压实。'
  }
}

/* ---------------- 摄影棚磨砂刻度展台 ---------------- */
const buildPlatform = () => {
  const platform = new THREE.Mesh(
    bevelCylinder(4.8, 0.3, { bevel: 0.09, segments: 112, arcSegments: 7, bottomScale: 1.035 }),
    paperMaterial({ repeat: [3, 1], color: 0xECE8E0, roughness: 0.72 })
  )
  platform.position.y = -0.15
  platform.receiveShadow = true
  scene.add(platform)

  // 台面同心细金圈
  const gold = metalMaterial(PALETTE.gold, { roughness: 0.3, metalness: 0.8, repeat: [4, 1] })
  ;[4.18, 3.68, 2.55].forEach((r, i) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r, r + (i === 0 ? 0.022 : 0.008), 128),
      new THREE.MeshBasicMaterial({
        color: PALETTE.gold, transparent: true,
        opacity: i === 0 ? 0.5 : 0.2, side: THREE.DoubleSide, depthWrite: false
      })
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.006 + i * 0.001
    ring.userData.excludeFromAO = true
    scene.add(ring)
  })

  // 60 格精密刻度（长短交错）
  tickRing = new THREE.Group()
  const tickLong = new THREE.BoxGeometry(0.014, 0.004, 0.24)
  const tickShort = new THREE.BoxGeometry(0.01, 0.003, 0.12)
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2
    const major = i % 5 === 0
    const t = new THREE.Mesh(major ? tickLong : tickShort, gold)
    t.position.set(Math.cos(a) * 4.32, 0.009, Math.sin(a) * 4.32)
    t.rotation.y = -a + Math.PI / 2
    tickRing.add(t)
  }
  scene.add(tickRing)

  // 中心镌刻铭牌
  const badgeTex = labelTexture('CHANGCHUN  ·  BEIDOU 260  ·  RTK', {
    width: 1024, height: 128, font: '500 50px Georgia, serif', color: '#9A7B3F'
  })
  labelTextures.push(badgeTex)
  const badge = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.32),
    new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true, depthWrite: false, toneMapped: false })
  )
  badge.rotation.x = -Math.PI / 2
  badge.position.set(0, 0.011, 3.15)
  badge.userData.excludeFromAO = true
  scene.add(badge)

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.ShadowMaterial({ opacity: 0.1 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.31
  floor.receiveShadow = true
  scene.add(floor)

  const shadow = stage.addContactShadow({ size: 6.4, opacity: 0.55, position: [0, 0.013, 0] })
  shadow.scale.set(1.18, 1, 0.78)
}

/* ---------------- 底盘总成 ---------------- */
const buildChassis = () => {
  const group = new THREE.Group()
  group.position.set(0, 0.65, 0)
  group.userData.pickKey = 'chassis'
  group.userData.baseY = 0.65

  const darkMetal = lacquerMaterial(0x2A2927, { roughness: 0.44, metalness: 0.62, clearcoat: 0.35 })
  const frame = new THREE.Mesh(roundedBox(1.86, 0.46, 3.92, 0.14, 11), darkMetal)
  frame.castShadow = true
  frame.receiveShadow = true
  group.add(frame)

  // 双侧承载纵梁
  const beamMat = metalMaterial(0x4A4741, { roughness: 0.38, metalness: 0.72, repeat: [1, 4] })
  for (const sx of [-1, 1]) {
    const beam = new THREE.Mesh(roundedBox(0.12, 0.24, 4.18, 0.05, 5), beamMat)
    beam.position.set(sx * 0.92, -0.06, 0)
    beam.castShadow = true
    group.add(beam)
  }
  // 前后保险横梁
  for (const z of [-1.95, 1.95]) {
    const bumper = new THREE.Mesh(roundedBox(2.05, 0.16, 0.18, 0.06, 5), beamMat)
    bumper.position.set(0, -0.12, z)
    group.add(bumper)
  }
  // 传动轴与后桥
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.6, 20), beamMat)
  shaft.rotation.x = Math.PI / 2
  shaft.position.set(0, -0.22, 0)
  group.add(shaft)
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.5, 20), beamMat)
  axle.rotation.z = Math.PI / 2
  axle.position.set(0, -0.18, -0.9)
  group.add(axle)

  // 双侧液压管路：平滑空间曲线连接动力总成与后桥，两端琥珀金接头
  const hoseMat = lacquerMaterial(0x3A3A38, { roughness: 0.62, metalness: 0.26 })
  const couplerMat = metalMaterial(PALETTE.gold, { roughness: 0.3, metalness: 0.86 })
  for (const sx of [-1, 1]) {
    const pts = [
      new THREE.Vector3(sx * 0.54, 0.04, 1.62),
      new THREE.Vector3(sx * 0.73, -0.1, 0.82),
      new THREE.Vector3(sx * 0.69, -0.25, -0.18),
      new THREE.Vector3(sx * 0.61, -0.19, -1.08),
      new THREE.Vector3(sx * 0.43, -0.07, -1.72)
    ]
    const curve = new THREE.CatmullRomCurve3(pts)
    const hose = new THREE.Mesh(new THREE.TubeGeometry(curve, 56, 0.026, 12, false), hoseMat)
    hose.castShadow = true
    group.add(hose)
    for (const p of [pts[0], pts[pts.length - 1]]) {
      const coupler = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.09, 18), couplerMat)
      coupler.position.copy(p)
      group.add(coupler)
    }
  }

  // 纵梁铆钉阵列
  const rivetGeo = new THREE.SphereGeometry(0.026, 10, 8)
  const rivetMat = metalMaterial(0xB9B2A6, { roughness: 0.34, metalness: 0.84 })
  const rivets = new THREE.InstancedMesh(rivetGeo, rivetMat, 48)
  const dummy = new THREE.Object3D()
  let ri = 0
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 12; i++) {
      for (const dy of [-0.02, 0.09]) {
        dummy.position.set(sx * 0.985, dy, -1.85 + i * 0.34)
        dummy.scale.set(1, 1, 0.6)
        dummy.updateMatrix()
        rivets.setMatrixAt(ri++, dummy.matrix)
      }
    }
  }
  rivets.instanceMatrix.needsUpdate = true
  group.add(rivets)

  parts.chassis = group
  carGroup.add(group)
  pickTargets.push(group)
}

/* ---------------- 赤红烤漆发动机舱 ---------------- */
const buildEngine = () => {
  const group = new THREE.Group()
  group.position.set(0, 1.2, 0.9)
  group.userData = { pickKey: 'engine', baseY: 1.2, baseZ: 0.9 }

  const red = lacquerMaterial(PALETTE.red, { roughness: 0.24, metalness: 0.2, clearcoat: 1 })
  const hood = new THREE.Mesh(roundedBox(1.54, 1.04, 1.9, 0.18, 12), red)
  hood.castShadow = true
  hood.receiveShadow = true
  group.add(hood)

  // 前脸型号铭牌与一对牵引钩：工业解构的收尾细节，压暗不抢红色机罩
  const faceBadgeTex = labelTexture('260 HP  ·  BD-5G', {
    width: 512, height: 96, font: '600 44px Georgia, serif', color: '#F0C275'
  })
  labelTextures.push(faceBadgeTex)
  const faceBadge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.135),
    new THREE.MeshBasicMaterial({ map: faceBadgeTex, transparent: true, depthWrite: false, toneMapped: false })
  )
  // 贴在可见的机罩侧面（前脸会被黑色格栅与保险杠挡住）
  faceBadge.rotation.y = Math.PI / 2
  faceBadge.position.set(0.782, 0.18, 0.15)
  faceBadge.userData.excludeFromAO = true
  group.add(faceBadge)
  const hookMat = metalMaterial(0x6A655C, { roughness: 0.55, metalness: 0.72 })
  for (const sx of [-1, 1]) {
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.016, 8, 16), hookMat)
    hook.position.set(sx * 0.42, -0.38, 0.99)
    group.add(hook)
  }

  // 顶部隆起筋线
  const ridgeMat = lacquerMaterial(0xC64A38, { roughness: 0.3, metalness: 0.18, clearcoat: 0.8 })
  for (const sx of [-1, 1]) {
    const ridge = new THREE.Mesh(roundedBox(0.1, 0.045, 1.66, 0.02, 4), ridgeMat)
    ridge.position.set(sx * 0.42, 0.535, 0)
    group.add(ridge)
  }

  // 侧面散热鳍片（实例化细密栅格）
  const finGeo = roundedBox(0.026, 0.028, 0.72, 0.008, 2)
  const finMat = lacquerMaterial(0x2A2523, { roughness: 0.66, metalness: 0.4, clearcoat: 0.2 })
  const fins = new THREE.InstancedMesh(finGeo, finMat, 36)
  const dummy = new THREE.Object3D()
  let k = 0
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 18; i++) {
      dummy.position.set(sx * 0.776, 0.24 - i * 0.042, -0.28)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      fins.setMatrixAt(k++, dummy.matrix)
    }
  }
  fins.instanceMatrix.needsUpdate = true
  group.add(fins)

  // 前脸进气格栅 + 车标 + 双前灯
  const grilleBase = new THREE.Mesh(
    roundedBox(1.32, 0.62, 0.08, 0.04, 4),
    lacquerMaterial(0x1A1918, { roughness: 0.8, metalness: 0.25, clearcoat: 0.1 })
  )
  grilleBase.position.set(0, 0.04, 0.956)
  group.add(grilleBase)

  const barGeo = roundedBox(1.18, 0.022, 0.035, 0.008, 2)
  const bars = new THREE.InstancedMesh(barGeo, metalMaterial(0x8C8880, { roughness: 0.34, metalness: 0.85 }), 9)
  for (let i = 0; i < 9; i++) {
    dummy.position.set(0, 0.3 - i * 0.066, 1.0)
    dummy.updateMatrix()
    bars.setMatrixAt(i, dummy.matrix)
  }
  bars.instanceMatrix.needsUpdate = true
  group.add(bars)

  const badge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.115, 0.02, 40),
    metalMaterial(PALETTE.gold, { roughness: 0.26, metalness: 0.9 })
  )
  badge.rotation.x = Math.PI / 2
  badge.position.set(0, 0.4, 1.01)
  group.add(badge)

  const lampRimMat = metalMaterial(0xB9B2A6, { roughness: 0.3, metalness: 0.82 })
  for (const sx of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.018, 12, 32), lampRimMat)
    rim.position.set(sx * 0.55, 0.22, 0.99)
    group.add(rim)
    const lampMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFF3D8, roughness: 0.12, metalness: 0,
      emissive: 0xFFE6B0, emissiveIntensity: 0.55, clearcoat: 1
    })
    headlightMats.push(lampMat)
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.088, 24, 16), lampMat)
    lamp.scale.z = 0.4
    lamp.position.set(sx * 0.55, 0.22, 1.0)
    group.add(lamp)
  }

  // 侧面型号铭牌
  const specTex = labelTexture('BEIDOU  ·  260 HP', {
    width: 640, height: 96, font: '600 50px Georgia, serif', color: '#F2DFC2'
  })
  labelTextures.push(specTex)
  for (const sx of [-1, 1]) {
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(0.86, 0.13),
      new THREE.MeshBasicMaterial({ map: specTex, transparent: true, depthWrite: false, toneMapped: false })
    )
    plate.position.set(sx * 0.782, -0.26, 0.18)
    plate.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2
    plate.userData.excludeFromAO = true
    group.add(plate)
  }

  // 排气管与进气滤清器
  const pipeMat = metalMaterial(0x6B665D, { roughness: 0.42, metalness: 0.78 })
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 1.1, 24), pipeMat)
  pipe.position.set(0.63, 0.92, 0.58)
  pipe.castShadow = true
  group.add(pipe)
  const pipeCap = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 10, 24), pipeMat)
  pipeCap.rotation.x = Math.PI / 2
  pipeCap.position.set(0.63, 1.47, 0.58)
  group.add(pipeCap)

  parts.engine = group
  carGroup.add(group)
  pickTargets.push(group)
}

/* ---------------- 全景智能电控舱 ---------------- */
const buildCabin = () => {
  const group = new THREE.Group()
  group.position.set(0, 1.6, -0.6)
  group.userData = { pickKey: 'cabin', baseY: 1.6, baseZ: -0.6 }

  const shellMat = lacquerMaterial(0x33302B, { roughness: 0.38, metalness: 0.4, clearcoat: 0.6 })
  const lower = new THREE.Mesh(roundedBox(1.64, 0.56, 1.68, 0.14, 10), shellMat)
  lower.position.y = -0.42
  lower.castShadow = true
  group.add(lower)

  // 高折射全景玻璃（单一 transmission 材质，控制渲染开销）
  const glass = new THREE.Mesh(
    roundedBox(1.66, 0.98, 1.7, 0.1, 7),
    glassMaterial({ transmission: 0.9, roughness: 0.06, tint: 0xDCEBF2, thickness: 0.28 })
  )
  glass.position.y = 0.22
  glass.userData.excludeFromAO = true
  glass.renderOrder = 4
  group.add(glass)

  // 精细 A/B/C 柱与上下窗框
  const pillarMat = lacquerMaterial(0x2E2B27, { roughness: 0.36, metalness: 0.5 })
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const pillar = new THREE.Mesh(roundedBox(0.075, 1.02, 0.075, 0.025, 4), pillarMat)
      pillar.position.set(sx * 0.81, 0.22, sz * 0.83)
      group.add(pillar)
    }
  }
  for (const y of [-0.28, 0.72]) {
    for (const sx of [-1, 1]) {
      const rail = new THREE.Mesh(roundedBox(0.06, 0.055, 1.7, 0.02, 3), pillarMat)
      rail.position.set(sx * 0.81, y, 0)
      group.add(rail)
    }
    for (const sz of [-1, 1]) {
      const rail = new THREE.Mesh(roundedBox(1.66, 0.055, 0.06, 0.02, 3), pillarMat)
      rail.position.set(0, y, sz * 0.83)
      group.add(rail)
    }
  }

  // 流线白瓷车顶 + 工作灯 + 导流条
  const roof = new THREE.Mesh(
    roundedBox(1.88, 0.16, 1.9, 0.075, 7),
    porcelainMaterial({ repeat: [2, 2], roughness: 0.26 })
  )
  roof.position.y = 0.8
  roof.castShadow = true
  group.add(roof)
  for (const sx of [-1, 1]) {
    const strip = new THREE.Mesh(
      roundedBox(0.05, 0.035, 1.5, 0.015, 3),
      metalMaterial(PALETTE.gold, { roughness: 0.3, metalness: 0.8 })
    )
    strip.position.set(sx * 0.72, 0.89, 0)
    group.add(strip)
    const wl = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 18, 12),
      new THREE.MeshStandardMaterial({ color: 0xFFF4DC, emissive: 0xFFE3AE, emissiveIntensity: 0.4 })
    )
    wl.position.set(sx * 0.62, 0.8, 0.96)
    group.add(wl)
  }

  // 舱内可见内饰：织物座椅 / 方向盘 / 中控屏
  const seatMat = fabricMaterial(0x3B3A37, { repeat: [2, 2], roughness: 0.92 })
  const seat = new THREE.Mesh(roundedBox(0.56, 0.68, 0.42, 0.12, 6), seatMat)
  seat.position.set(0, -0.06, -0.28)
  seat.rotation.x = -0.12
  group.add(seat)
  const back = new THREE.Mesh(roundedBox(0.56, 0.2, 0.5, 0.08, 5), seatMat)
  back.position.set(0, -0.32, 0.02)
  group.add(back)

  const wheelRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.17, 0.022, 12, 40),
    lacquerMaterial(0x242220, { roughness: 0.55, metalness: 0.3 })
  )
  wheelRim.position.set(0, 0.12, 0.42)
  wheelRim.rotation.x = -0.7
  group.add(wheelRim)
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.03, 20),
    metalMaterial(PALETTE.gold, { roughness: 0.3, metalness: 0.85 })
  )
  hub.rotation.x = Math.PI / 2 - 0.7
  hub.position.set(0, 0.12, 0.42)
  group.add(hub)

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.24),
    new THREE.MeshStandardMaterial({
      color: 0x2E5A44, emissive: 0x2E5A44, emissiveIntensity: 0.42,
      roughness: 0.35, metalness: 0.1
    })
  )
  screen.position.set(0.48, 0.16, 0.55)
  screen.rotation.y = -0.5
  group.add(screen)

  // 数字仪表台、双操纵杆、空调出风口与顶灯
  const dashMat = lacquerMaterial(0x242220, { roughness: 0.5, metalness: 0.3 })
  const dash = new THREE.Mesh(roundedBox(0.94, 0.12, 0.3, 0.045, 5), dashMat)
  dash.position.set(0, 0.02, 0.62)
  group.add(dash)
  const cluster = new THREE.Mesh(
    roundedBox(0.38, 0.14, 0.022, 0.01, 3),
    new THREE.MeshStandardMaterial({
      color: 0x1C1B18, emissive: 0x2E5A44, emissiveIntensity: 0.34, roughness: 0.4
    })
  )
  cluster.position.set(-0.14, 0.09, 0.76)
  group.add(cluster)
  for (const sx of [-1, 1]) {
    const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.28, 12), dashMat)
    lever.position.set(sx * 0.34, 0.16, 0.34)
    lever.rotation.x = -0.22
    group.add(lever)
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.036, 16, 12),
      metalMaterial(PALETTE.gold, { roughness: 0.3, metalness: 0.85 })
    )
    knob.position.set(sx * 0.34, 0.31, 0.31)
    group.add(knob)
    const vent = new THREE.Mesh(roundedBox(0.14, 0.07, 0.022, 0.01, 2), pillarMat)
    vent.position.set(sx * 0.55, 0.3, 0.72)
    group.add(vent)
  }
  const domeLight = new THREE.Mesh(
    roundedBox(0.26, 0.022, 0.15, 0.01, 3),
    new THREE.MeshStandardMaterial({
      color: 0xFFF3D8, emissive: 0xFFE6B0, emissiveIntensity: 0.52, roughness: 0.4
    })
  )
  domeLight.position.set(0, 0.71, 0)
  group.add(domeLight)

  // 后视镜
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.34, 12), pillarMat)
    arm.position.set(sx * 0.95, 0.34, 0.62)
    arm.rotation.z = sx * 0.5
    group.add(arm)
    const mirror = new THREE.Mesh(roundedBox(0.16, 0.2, 0.05, 0.025, 4), shellMat)
    mirror.position.set(sx * 1.06, 0.5, 0.62)
    group.add(mirror)
  }

  parts.cabin = group
  carGroup.add(group)
  pickTargets.push(group)
}

/* ---------------- 北斗 RTK 天线与信号涟漪 ---------------- */
const buildAntenna = () => {
  const group = new THREE.Group()
  group.position.set(0, 2.5, -0.6)
  group.userData = { pickKey: 'antenna', baseY: 2.5, baseZ: -0.6 }

  const darkMetal = metalMaterial(0x3A3833, { roughness: 0.32, metalness: 0.85 })
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.046, 0.52, 24), darkMetal)
  mast.position.y = 0.05
  group.add(mast)
  const collar = new THREE.Mesh(bevelCylinder(0.085, 0.07, { bevel: 0.02, segments: 40 }), darkMetal)
  collar.position.y = -0.18
  group.add(collar)

  // 平滑碟形蘑菇头（Lathe 倒角轮廓）
  const domeProfile = [
    [0, 0], [0.13, 0], [0.19, 0.012], [0.235, 0.045],
    [0.246, 0.085], [0.228, 0.125], [0.18, 0.152],
    [0.11, 0.166], [0.045, 0.17], [0, 0.17]
  ]
  const dome = new THREE.Mesh(
    lathe(domeProfile, 72),
    metalMaterial(PALETTE.gold, { roughness: 0.22, metalness: 0.88, repeat: [3, 1] })
  )
  dome.position.y = 0.3
  dome.castShadow = true
  group.add(dome)
  const topCap = new THREE.Mesh(
    lathe([[0, 0], [0.1, 0.006], [0.14, 0.02], [0.14, 0.032], [0, 0.036]], 48),
    porcelainMaterial({ repeat: [1, 1], roughness: 0.24 })
  )
  topCap.position.y = 0.465
  group.add(topCap)

  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.026, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x2E5A44, emissive: 0x2E5A44, emissiveIntensity: 0.9 })
  )
  led.position.set(0.16, 0.36, 0.16)
  group.add(led)

  // 三层金色信号涟漪
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.345, 64),
      new THREE.MeshBasicMaterial({
        color: PALETTE.gold, transparent: true, opacity: 0.4,
        side: THREE.DoubleSide, depthWrite: false
      })
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.52
    ring.userData.excludeFromAO = true
    ring.userData.phase = i / 3
    group.add(ring)
    signalRings.push(ring)
  }

  parts.antenna = group
  carGroup.add(group)
  pickTargets.push(group)
}

/* ---------------- 超宽低压轮胎组 ---------------- */
const buildWheels = () => {
  const configs = [
    { x: 1.18, y: 0.86, z: -0.95, r: 0.86, w: 0.56, hub: 0.45, scale: 1 },
    { x: -1.18, y: 0.86, z: -0.95, r: 0.86, w: 0.56, hub: 0.45, scale: 1 },
    { x: 1.08, y: 0.62, z: 1.15, r: 0.62, w: 0.44, hub: 0.31, scale: 0.72 },
    { x: -1.08, y: 0.62, z: 1.15, r: 0.62, w: 0.44, hub: 0.31, scale: 0.72 }
  ]

  const tireMat = rubberMaterial({ repeat: [4, 2], roughness: 0.92 })
  const lugMat = rubberMaterial({ repeat: [1, 1], roughness: 0.96 })
  const hubMat = metalMaterial(PALETTE.gold, { roughness: 0.28, metalness: 0.9, repeat: [3, 1] })
  const boltMat = metalMaterial(0x8C8579, { roughness: 0.3, metalness: 0.88 })
  const rnd = mulberry32(2605)

  configs.forEach((cfg, wi) => {
    const group = new THREE.Group()
    group.position.set(cfg.x, cfg.y, cfg.z)
    group.userData = { pickKey: 'wheels', origX: cfg.x, index: wi }

    // 圆角胎体（96 段回转）
    const tire = new THREE.Mesh(
      bevelCylinder(cfg.r, cfg.w, { bevel: 0.15 * cfg.scale, segments: 112, arcSegments: 9 }),
      tireMat
    )
    tire.rotation.z = Math.PI / 2
    tire.castShadow = true
    tire.receiveShadow = true
    group.add(tire)

    // 人字形深花纹：3 排 × 32 块实例化
    const lugGeo = roundedBox(cfg.w * 0.24, 0.075 * cfg.scale, 0.12 * cfg.scale, 0.02, 2)
    const perRow = 32
    const lugs = new THREE.InstancedMesh(lugGeo, lugMat, perRow * 3)
    const dummy = new THREE.Object3D()
    let n = 0
    for (let row = 0; row < 3; row++) {
      const axial = (row - 1) * cfg.w * 0.28
      for (let i = 0; i < perRow; i++) {
        const a = (i / perRow) * Math.PI * 2 + row * 0.06
        dummy.position.set(axial, Math.cos(a) * (cfg.r - 0.005), Math.sin(a) * (cfg.r - 0.005))
        dummy.rotation.set(a, 0, (row - 1) * 0.32)
        const s = 0.9 + rnd() * 0.2
        dummy.scale.set(s, s, s)
        dummy.updateMatrix()
        lugs.setMatrixAt(n++, dummy.matrix)
      }
    }
    lugs.instanceMatrix.needsUpdate = true
    lugs.castShadow = true
    group.add(lugs)

    // 镂空轮辐盘（ExtrudeGeometry 带 8 个椭圆减重孔）
    const shape = new THREE.Shape()
    shape.absarc(0, 0, cfg.hub, 0, Math.PI * 2, false)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const hole = new THREE.Path()
      hole.absellipse(
        Math.cos(a) * cfg.hub * 0.62,
        Math.sin(a) * cfg.hub * 0.62,
        cfg.hub * 0.14, cfg.hub * 0.23,
        0, Math.PI * 2, true, a
      )
      shape.holes.push(hole)
    }
    const rimGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.055, bevelEnabled: true, bevelSize: 0.012,
      bevelThickness: 0.012, bevelSegments: 4, curveSegments: 52
    })
    rimGeo.computeVertexNormals()
    for (const sx of [-1, 1]) {
      const rim = new THREE.Mesh(rimGeo, hubMat)
      rim.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2
      rim.position.x = sx * (cfg.w / 2 + 0.005)
      rim.castShadow = true
      group.add(rim)
    }

    // 中心盖 + 8 颗轮毂螺栓
    const cap = new THREE.Mesh(bevelCylinder(cfg.hub * 0.3, 0.05, { bevel: 0.015, segments: 48 }), hubMat)
    cap.rotation.z = Math.PI / 2
    cap.position.x = cfg.w / 2 + 0.075
    group.add(cap)
    const boltGeo = new THREE.SphereGeometry(0.022 * cfg.scale, 12, 8)
    const bolts = new THREE.InstancedMesh(boltGeo, boltMat, 8)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      dummy.position.set(cfg.w / 2 + 0.07, Math.cos(a) * cfg.hub * 0.38, Math.sin(a) * cfg.hub * 0.38)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      bolts.setMatrixAt(i, dummy.matrix)
    }
    bolts.instanceMatrix.needsUpdate = true
    group.add(bolts)

    // 胎侧双圈压线与中心铭牌
    const sideRingMat = metalMaterial(0x8C8579, { roughness: 0.5, metalness: 0.6 })
    for (const rr of [cfg.r * 0.86, cfg.r * 0.72]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.012, 8, 72), sideRingMat)
      ring.rotation.y = Math.PI / 2
      ring.position.x = cfg.w / 2 + 0.012
      group.add(ring)
    }
    const badgeTex = labelTexture('BD 260', {
      width: 512, height: 128, font: '600 66px Georgia, serif', color: '#5A4A2E'
    })
    labelTextures.push(badgeTex)
    const badge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.05),
      new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true, depthWrite: false, toneMapped: false })
    )
    badge.rotation.y = Math.PI / 2
    badge.position.set(cfg.w / 2 + 0.104, 0, 0)
    badge.userData.excludeFromAO = true
    group.add(badge)

    // 轮内侧悬挂：真实拖拉机的减震支柱在车架与轮轴之间，位于胎宽之外、胎顶之下。
    // 早期版本把四根短弹簧摆在胎面投影内且顶端高于胎冠，从俯视看像插在轮胎上，已修正。
    const springMat = metalMaterial(0xA9A196, { roughness: 0.38, metalness: 0.82, repeat: [1, 1] })
    const damperMat = metalMaterial(0x5A564E, { roughness: 0.44, metalness: 0.68 })
    const springH = 0.34 * cfg.scale
    const springGeo = coilSpringGeometry({
      radius: 0.055 * cfg.scale, tubeRadius: 0.012 * cfg.scale,
      height: springH, turns: 6, tubularSegments: 72, radialSegments: 10
    })
    // x 移到轮胎内侧端面之外，y 压到胎顶以下，两个方向都不与胎体相交
    const innerX = -Math.sign(cfg.x) * (cfg.w * 0.5 + 0.09)
    const springY = cfg.r * 0.52
    const spring = new THREE.Mesh(springGeo, springMat)
    spring.position.set(innerX, springY, 0)
    spring.rotation.z = 0.12
    spring.castShadow = true
    group.add(spring)

    // 贯穿弹簧的活塞杆，让支柱读起来是一套完整减震器而不是裸弹簧
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018 * cfg.scale, 0.018 * cfg.scale, springH * 1.45, 16),
      damperMat
    )
    rod.position.copy(spring.position)
    rod.rotation.z = spring.rotation.z
    rod.castShadow = true
    group.add(rod)

    const cupGeo = bevelCylinder(0.078 * cfg.scale, 0.026 * cfg.scale, { bevel: 0.007, segments: 28 })
    for (const sy of [-1, 1]) {
      const cup = new THREE.Mesh(cupGeo, hubMat)
      cup.position.set(innerX, springY + sy * springH * 0.5, 0)
      cup.castShadow = true
      group.add(cup)
    }

    // 下摆臂：从轮轴连到支柱下端，交代受力路径
    const arm = new THREE.Mesh(
      roundedBox(Math.abs(innerX), 0.055 * cfg.scale, 0.09 * cfg.scale, 0.02, 3),
      damperMat
    )
    arm.position.set(innerX * 0.5, springY - springH * 0.5, 0)
    arm.castShadow = true
    group.add(arm)

    // 挡泥板（后轮半圆弧护罩）
    if (cfg.z < 0) {
      const fender = new THREE.Mesh(
        new THREE.TorusGeometry(cfg.r + 0.13, 0.075, 12, 64, Math.PI),
        lacquerMaterial(0x35322E, { roughness: 0.46, metalness: 0.32, clearcoat: 0.35 })
      )
      // 半圆弧在 YZ 平面（轮胎轴沿 x），正确罩住胎面上半周
      fender.rotation.y = Math.PI / 2
      fender.castShadow = true
      group.add(fender)
    }

    carGroup.add(group)
    parts.wheels.push(group)
    pickTargets.push(group)
  })
}

/* ---------------- 交互 ---------------- */
const toggleExplode = () => {
  isExploded.value = !isExploded.value
  const f = isExploded.value ? 1 : 0
  const ease = 'power3.inOut'
  // 爆炸图自动切到更开阔的机位，让天线与驾驶舱悬浮总成完整入镜
  if (f) stage?.flyTo({ position: [8.6, 6.0, 10.6], target: [0, 2.25, 0], duration: 1.25 })
  else stage?.flyTo({ position: [6.5, 4.0, 7.5], target: [0, 1.2, 0], duration: 1.25 })
  if (parts.cabin) gsap.to(parts.cabin.position, { y: 1.6 + f * 1.55, z: -0.6 - f * 0.15, duration: 1.2, ease, overwrite: true })
  if (parts.antenna) gsap.to(parts.antenna.position, { y: 2.5 + f * 2.15, duration: 1.2, ease, overwrite: true })
  if (parts.engine) gsap.to(parts.engine.position, { z: 0.9 + f * 1.7, y: 1.2 + f * 0.12, duration: 1.2, ease, overwrite: true })
  parts.wheels.forEach((w) => {
    const ox = w.userData.origX
    gsap.to(w.position, { x: ox + Math.sign(ox) * f * 1.25, duration: 1.2, ease, overwrite: true })
  })
  gsap.to(tickRing.rotation, { y: f * 0.12, duration: 1.2, ease })
}

const focusPart = (partKey) => {
  selectedPart.value = partKey
  const views = {
    all: { position: [6.5, 4.0, 7.5], target: [0, 1.2, 0] },
    antenna: { position: [2.4, 4.3, 3.4], target: [0, 2.9, -0.6] },
    engine: { position: [3.2, 2.1, 4.4], target: [0, 1.15, 1.0] },
    cabin: { position: [3.9, 3.1, 3.9], target: [0, 1.85, -0.6] },
    wheels: { position: [4.3, 1.3, 3.0], target: [0, 0.7, 0] },
    chassis: { position: [4.0, 1.5, 4.6], target: [0, 0.65, 0] }
  }
  stage?.flyTo({ ...(views[partKey] || views.all), duration: 1.3 })
}

const toggleTour = () => {
  isTouring.value = !isTouring.value
  if (stage) {
    stage.controls.autoRotate = isTouring.value
    stage.controls.autoRotateSpeed = 0.5
  }
}

const showTooltip = (obj, event) => {
  const key = obj.userData.pickKey
  if (!partsData[key]) return
  const rect = containerRef.value.getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    title: partsData[key].title,
    sub: partsData[key].specs
  }
}

const initThree = () => {
  if (!containerRef.value) return
  stage = createStage(containerRef.value, {
    background: 0xF4F2EC,
    fov: 38,
    camera: [6.5, 4.0, 7.5],
    target: [0, 1.2, 0],
    minDistance: 3.4,
    maxDistance: 15,
    maxPolarAngle: Math.PI / 2 + 0.04,
    minPolarAngle: 0.25,
    exposure: 1.08,
    environmentIntensity: 0.82,
    keyIntensity: 2.1,
    shadowSize: 2048,
    shadowFrustum: 8,
    aoRadius: 0.3,
    aoIntensity: 0.44,
    onQualityChange: (q) => { qualityLabel.value = q === 'high' ? '展览级 · IBL + GTAO' : '流畅模式 · 自适应' },
    onFrame: (dt, t) => {
      signalRings.forEach((ring) => {
        const p = (t * 0.55 + ring.userData.phase) % 1
        const s = 0.6 + p * 1.8
        ring.scale.set(s, s, 1)
        ring.material.opacity = (1 - p) * 0.4
      })
      headlightMats.forEach((m, i) => {
        m.emissiveIntensity = 0.42 + Math.sin(t * 1.6 + i) * 0.12
      })
      if (carGroup) carGroup.position.y = Math.sin(t * 0.55) * 0.006
    }
  })
  if (!stage) return
  scene = stage.scene

  carGroup = new THREE.Group()
  scene.add(carGroup)

  buildPlatform()
  buildChassis()
  buildEngine()
  buildCabin()
  buildAntenna()
  buildWheels()

  stage.enablePicking(() => pickTargets, {
    onHover: (obj, hit, event) => {
      hoveredPart = obj
      highlight(obj, { intensity: 0.16 })
      showTooltip(obj, event)
    },
    onMove: (payload) => showTooltip(payload.object, payload.event),
    onLeave: (obj) => {
      clearHighlight(obj)
      hoveredPart = null
      tooltip.value.visible = false
    },
    onClick: (obj) => focusPart(obj.userData.pickKey)
  })

  stage.onCleanup(() => labelTextures.forEach((t) => t.dispose()))
  stage.start()
  requestAnimationFrame(() => { isReady.value = true })
}

onMounted(() => initThree())

onUnmounted(() => {
  parts.wheels.forEach((w) => gsap.killTweensOf(w.position))
  ;[parts.cabin, parts.antenna, parts.engine].forEach((p) => p && gsap.killTweensOf(p.position))
  stage?.dispose()
  stage = null
  pickTargets.length = 0
  parts.wheels.length = 0
})
</script>

<template>
  <div class="relative w-full h-full min-h-[580px] bg-[#F4F2EC] select-none overflow-hidden rounded-3xl">
    <div ref="containerRef" class="w-full h-full cursor-grab active:cursor-grabbing"></div>

    <div
      v-if="!isReady"
      class="absolute inset-0 bg-[#F4F2EC] flex items-center justify-center transition-opacity duration-700 z-30"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-[#B83828]/25 border-t-[#B83828] animate-spin"></div>
        <span class="text-[11px] font-mono text-[#6E6960] tracking-widest">ASSEMBLING MACHINERY</span>
      </div>
    </div>

    <!-- 顶栏画廊式标牌 -->
    <div class="absolute top-5 left-6 museum-panel px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm border border-[#1C1B18]/10 pointer-events-auto">
      <div class="w-2.5 h-2.5 rounded-full bg-[#B83828] animate-pulse"></div>
      <div>
        <div class="text-xs font-bold text-[#1C1B18] tracking-wider uppercase font-editorial">
          长春智造 · 北斗智慧农机 3D 数字化装配馆
        </div>
        <div class="text-[10px] text-[#5A564E] font-mono">
          CHANGCHUN AGRI-ROBOTICS INDUSTRIAL SHOWROOM
        </div>
      </div>
    </div>

    <div class="absolute top-5 right-6 flex items-center gap-2">
      <button
        @click="toggleTour"
        class="museum-panel px-3.5 py-2.5 min-h-[40px] rounded-xl text-xs font-semibold text-[#1C1B18] hover:border-[#C88A32] transition-all duration-200 cursor-pointer shadow-sm"
        :class="[isTouring ? 'bg-[#EFECE6] border-[#C88A32] text-[#C88A32]' : '']"
      >
        <span>{{ isTouring ? '⏸ 停止环视导览' : '🎥 自动环视导览' }}</span>
      </button>
      <button
        @click="toggleExplode"
        class="museum-panel px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-semibold text-[#1C1B18] hover:border-[#C88A32] transition-all duration-200 cursor-pointer shadow-sm"
        :class="[isExploded ? 'bg-[#EAE4D8] border-[#C88A32]' : '']"
      >
        <span>{{ isExploded ? '🔩 机械合拢总成' : '💥 3D 机械爆炸分解 (Exploded View)' }}</span>
      </button>
    </div>

    <!-- 悬停浮动标签 -->
    <div
      v-show="tooltip.visible"
      class="absolute z-20 pointer-events-none museum-card px-3 py-2 rounded-xl border border-[#C88A32]/40 shadow-lg"
      :style="{ left: `${tooltip.x + 16}px`, top: `${tooltip.y + 16}px`, maxWidth: '260px' }"
    >
      <div class="text-[11px] font-bold text-[#1C1B18]">{{ tooltip.title }}</div>
      <div class="text-[10px] text-[#8C6A2E] font-mono mt-0.5">{{ tooltip.sub }}</div>
    </div>

    <!-- 部件结构聚焦切换按钮 -->
    <div class="absolute left-6 bottom-6 flex flex-wrap gap-2 max-w-lg">
      <button
        v-for="(val, key) in partsData"
        :key="key"
        @click="focusPart(key)"
        class="museum-panel px-3 py-2.5 min-h-[40px] rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer"
        :class="[
          selectedPart === key
            ? 'border-[#C88A32] bg-[#FFFFFF] text-[#C88A32] shadow-sm font-semibold'
            : 'border-[#1C1B18]/10 text-[#5A564E] hover:border-[#1C1B18]/30 hover:text-[#1C1B18]'
        ]"
      >
        {{ val.tag }}
      </button>
    </div>

    <!-- 右侧部件档案：加宽并拉开层级，避免中英混排挤成一行 -->
    <div class="absolute right-6 bottom-6 hidden lg:block w-[330px] museum-card p-5 rounded-2xl border border-[#1C1B18]/10 shadow-lg pointer-events-auto">
      <div class="flex items-center gap-2 pb-3 mb-4 border-b border-[#1C1B18]/10">
        <span class="w-1.5 h-1.5 rounded-full bg-[#B83828] shrink-0"></span>
        <span class="font-mono text-[10px] tracking-[0.18em] text-[#B83828] font-bold">PART SPEC / 部件档案</span>
        <span class="ml-auto font-mono text-[9px] tracking-[0.14em] text-[#6E6960]">{{ selectedPart.toUpperCase() }}</span>
      </div>
      <div class="font-mono text-[9px] tracking-[0.16em] text-[#6E6960] mb-2">长春 · 汽车工业摇篮 / {{ partsData[selectedPart].tag }}</div>
      <h3 class="font-editorial text-base font-bold text-[#1C1B18] leading-snug mb-3">
        {{ partsData[selectedPart].title }}
      </h3>
      <div class="inline-flex px-2.5 py-1 rounded-full bg-[#C88A32]/12 text-[#8A6324] text-[11px] font-mono font-semibold">
        {{ partsData[selectedPart].specs }}
      </div>
      <p class="text-xs leading-[1.85] text-[#3A3630] mt-3">
        {{ partsData[selectedPart].desc }}
      </p>
      <div class="mt-4 pt-3 border-t border-[#1C1B18]/8 flex items-center justify-between gap-2 font-mono text-[9px] tracking-[0.12em] text-[#6E6960]">
        <span>悬停部件即时高亮</span>
        <span class="truncate">{{ qualityLabel }}</span>
      </div>
    </div>
  </div>
</template>
