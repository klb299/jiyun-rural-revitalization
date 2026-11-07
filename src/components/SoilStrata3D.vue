<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import gsap from 'gsap'
import { createStage, highlight, clearHighlight } from '../three/stage.js'
import {
  PALETTE, fbm, mulberry32, roundedBox, displace, soilMaterial,
  fabricMaterial, paperMaterial, woodMaterial, metalMaterial,
  glassMaterial, edgeLines, glowSprite, labelTexture, applyWind,
  sculptedAggregateGeometry
} from '../three/textures.js'

const containerRef = ref(null)
const currentLayer = ref(0)
const isExpanded = ref(false)
const isTouring = ref(false)
const isReady = ref(false)
const qualityLabel = ref('展览级 · IBL + GTAO')
const tooltip = ref({ visible: false, x: 0, y: 0, title: '', sub: '' })

let stage, scene
let glassGroup = null
let glassMat = null
let frameMat = null
let layerGroups = []
let motes = null
let moteData = null
let moteMat = null
let windGold = null
let windMoss = null
const labelTextures = []

const strataInfo = [
  {
    name: '0-20cm 腐殖质熟化耕作表层',
    depth: '0 ~ 20 cm',
    colorHex: '#221E19',
    organic: '4.82% 有机质活化层',
    feature: '万年腐殖黑土 · 团粒蓄水',
    desc: '东北黑土最核心的耕作层，每厘米孕育历经两百年自然沉积。团粒多孔结构如天然海绵，保水保肥与透气性极佳。'
  },
  {
    name: '20-50cm 淀积过渡心土层',
    depth: '20 ~ 50 cm',
    colorHex: '#42362B',
    organic: '2.40% 紧密保墒层',
    feature: '细密胶体拦截 · 防止淋溶',
    desc: '棕黑黏粒过渡带，有效阻隔养分深层流失，拦截春季融雪与夏季雨水下渗，形成天然根系蓄墒水库。'
  },
  {
    name: '50-100cm 马兰黄土第四纪母质层',
    depth: '50 ~ 100 cm',
    colorHex: '#7C674E',
    organic: '0.85% 原始矿物层',
    feature: '深层钙质沉积 · 矿质丰盈',
    desc: '古老松辽平原第四纪风积黄土母质，蕴含富饶的钾、钙、磷等微量矿物元素，提供长久稳固的地质生境底蕴。'
  }
]

const layerConfigs = [
  { y: 1.4, h: 1.1, color: PALETTE.soilTop, seed: 11, bump: 0.055 },
  { y: 0.0, h: 1.3, color: PALETTE.soilMid, seed: 29, bump: 0.042 },
  { y: -1.4, h: 1.2, color: PALETTE.soilDeep, seed: 47, bump: 0.036 }
]

/* ---------------- 展托与铭牌 ---------------- */
const buildPedestal = () => {
  const group = new THREE.Group()

  const base = new THREE.Mesh(
    roundedBox(3.92, 0.3, 3.92, 0.09, 7),
    woodMaterial({ repeat: [2, 2], color: 0xE6DCC8, roughness: 0.58 })
  )
  base.position.y = -2.66
  base.castShadow = true
  base.receiveShadow = true
  group.add(base)

  const linenPad = new THREE.Mesh(
    roundedBox(3.6, 0.055, 3.6, 0.025, 5),
    fabricMaterial(PALETTE.linen, { repeat: [4, 4] })
  )
  linenPad.position.y = -2.49
  linenPad.receiveShadow = true
  group.add(linenPad)

  // 琥珀金护角珠
  const beadGeo = new THREE.SphereGeometry(0.048, 20, 14)
  const beadMat = metalMaterial(PALETTE.gold, { roughness: 0.28, metalness: 0.82 })
  ;[[-1.86, -1.86], [1.86, -1.86], [-1.86, 1.86], [1.86, 1.86]].forEach(([x, z]) => {
    const bead = new THREE.Mesh(beadGeo, beadMat)
    bead.position.set(x, -2.5, z)
    group.add(bead)
  })

  // 正面镌刻铭牌
  const plateTex = labelTexture('NORTHEAST CHERNOZEM  /  100 CM MONOLITH', {
    width: 1024, height: 96, font: '500 44px Georgia, serif', color: '#8A7346'
  })
  labelTextures.push(plateTex)
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(2.9, 0.2),
    new THREE.MeshBasicMaterial({ map: plateTex, transparent: true, depthWrite: false, toneMapped: false })
  )
  plate.position.set(0, -2.66, 1.965)
  group.add(plate)

  // 展柜落地柔影
  stage.addContactShadow({ size: 5.6, opacity: 0.5, position: [0, -2.815, 0] })
  scene.add(group)
}

/* ---------------- 高折射亚克力标本罩 ---------------- */
const buildGlassCase = () => {
  glassGroup = new THREE.Group()
  const w = 3.14
  const h = 4.44
  const d = 3.14
  const r = w / 2

  const shellGeo = roundedBox(w, h, d, 0.1, 7)
  glassMat = glassMaterial({
    transmission: 0.95, roughness: 0.035, ior: 1.49, thickness: 0.55, clearcoat: 1
  })
  glassMat.transparent = true
  glassMat.opacity = 0.42
  const shell = new THREE.Mesh(shellGeo, glassMat)
  shell.userData.excludeFromAO = true
  shell.renderOrder = 6
  glassGroup.add(shell)

  // 极细金色棱线（圆角盒的锐边描边）
  const outline = edgeLines(shellGeo, { color: PALETTE.gold, opacity: 0.22, threshold: 18 })
  outline.userData.excludeFromAO = true
  glassGroup.add(outline)

  // Fresnel 边缘微光：让高透亚克力在暖白背景里仍有一层温润的玻璃轮廓
  const fresnelMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0xC88A32) },
      uStrength: { value: 0.36 }
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormalW = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uStrength;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        float rim = pow(1.0 - abs(dot(normalize(vNormalW), normalize(vViewDir))), 2.6);
        gl_FragColor = vec4(uColor, rim * uStrength);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.NormalBlending
  })
  const fresnel = new THREE.Mesh(roundedBox(w * 1.004, h * 1.004, d * 1.004, 0.1, 7), fresnelMat)
  fresnel.userData.excludeFromAO = true
  fresnel.renderOrder = 7
  glassGroup.add(fresnel)

  // 精铜框架：4 立杆 + 上下各 4 横杆
  frameMat = metalMaterial(PALETTE.gold, { roughness: 0.3, metalness: 0.8, repeat: [1, 4] })
  frameMat.transparent = true
  frameMat.opacity = 0.72
  const rodV = new THREE.CylinderGeometry(0.012, 0.012, h, 16, 1)
  const rodH = new THREE.CylinderGeometry(0.011, 0.011, w, 16, 1)
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const v = new THREE.Mesh(rodV, frameMat)
      v.position.set(sx * r, 0, sz * r)
      glassGroup.add(v)
    }
  }
  for (const y of [-h / 2, h / 2]) {
    for (const sz of [-1, 1]) {
      const hx = new THREE.Mesh(rodH, frameMat)
      hx.rotation.z = Math.PI / 2
      hx.position.set(0, y, sz * r)
      glassGroup.add(hx)
    }
    for (const sx of [-1, 1]) {
      const hz = new THREE.Mesh(rodH, frameMat)
      hz.rotation.x = Math.PI / 2
      hz.position.set(sx * r, y, 0)
      glassGroup.add(hz)
    }
  }
  const jointGeo = new THREE.SphereGeometry(0.028, 16, 12)
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const j = new THREE.Mesh(jointGeo, frameMat)
        j.position.set(sx * r, sy * h / 2, sz * r)
        glassGroup.add(j)
      }
    }
  }

  // 罩内暖白射灯，制造玻璃边缘的柔亮折射
  const caseLight = new THREE.PointLight(0xFFF3E2, 2.2, 9, 2)
  caseLight.position.set(1.4, 2.9, 2.1)
  glassGroup.add(caseLight)

  scene.add(glassGroup)
}

/* ---------------- 三层高细分黑土剖面 ---------------- */
const buildStrata = () => {
  const rnd = mulberry32(20261104)

  layerConfigs.forEach((cfg, idx) => {
    const group = new THREE.Group()
    group.position.y = cfg.y
    group.userData.pickKey = `layer-${idx}`
    group.userData.layerIndex = idx

    // 不规则天然断面的圆角土体（14 段圆角细分 + 顶点扰动）
    const geo = roundedBox(2.8, cfg.h, 2.8, 0.075, 14)
    displace(geo, (x, y, z) => {
      const u = (x + 1.4) / 2.8
      const v = (y + cfg.h / 2) / cfg.h
      const w = (z + 1.4) / 2.8
      const n1 = fbm(u * 0.7 + w * 0.3, v, cfg.seed, 4, 6) - 0.5
      const n2 = fbm(w, u * 0.6 + v * 0.4, cfg.seed + 77, 3, 9) - 0.5
      return [x + n1 * 0.105, y + n2 * 0.032, z + n2 * 0.105]
    }, false)

    const soilMat = soilMaterial(cfg.color, cfg.seed, { bumpScale: cfg.bump })
    const block = new THREE.Mesh(geo, soilMat)
    block.castShadow = true
    block.receiveShadow = true
    group.add(block)

    // 断面金色沉积界线
    const seam = new THREE.Mesh(
      new THREE.PlaneGeometry(2.74, 2.74),
      new THREE.MeshBasicMaterial({
        color: idx === 2 ? 0xD9C8A8 : 0xC88A32,
        transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide
      })
    )
    seam.rotation.x = -Math.PI / 2
    seam.position.y = cfg.h / 2 + 0.004
    seam.userData.excludeFromAO = true
    group.add(seam)

    // 层间过渡带：腐殖质淋溶、钙质淀积与铁锰锈纹的细窄沉积层
    const bands = idx === 2
      ? [0xB8A482, 0xD2C4A4, 0x9D8B6B]
      : idx === 1 ? [0x6B5842, 0x8C7659, 0x534534] : [0x3A3024, 0x544534, 0x2A231C]
    bands.forEach((bc, bi) => {
      const bandMat = new THREE.MeshStandardMaterial({ color: bc, roughness: 0.97, metalness: 0 })
      const front = new THREE.Mesh(roundedBox(2.76, 0.045, 0.024, 0.008, 2), bandMat)
      front.position.set(0, cfg.h / 2 - 0.075 - bi * 0.082, 1.407)
      group.add(front)
      const side = new THREE.Mesh(roundedBox(0.024, 0.045, 2.76, 0.008, 2), bandMat)
      side.position.set(1.407, cfg.h / 2 - 0.075 - bi * 0.082, 0)
      group.add(side)
    })

    // 团粒 / 矿物 / 孔隙（实例化，正面剖口高密度散布）
    // 矿物团粒改用噪声雕塑的不规则多面体，避免光滑球体的塑料感
    const mineralGeo = sculptedAggregateGeometry(0.022, 1, 3109 + idx * 17, 0.34)
    const mineralMat = new THREE.MeshStandardMaterial({
      color: idx === 0 ? 0xB6A88C : 0xC9B896, roughness: 0.92, metalness: 0.02
    })
    const mineralCount = idx === 0 ? 110 : 72
    const minerals = new THREE.InstancedMesh(mineralGeo, mineralMat, mineralCount)
    const poreGeo = new THREE.SphereGeometry(0.032, 8, 6)
    const poreMat = new THREE.MeshStandardMaterial({ color: 0x120F0D, roughness: 1 })
    const pores = new THREE.InstancedMesh(poreGeo, poreMat, 46)
    const dummy = new THREE.Object3D()
    for (let i = 0; i < mineralCount; i++) {
      dummy.position.set((rnd() - 0.5) * 2.62, (rnd() - 0.5) * (cfg.h - 0.12), 1.402 + rnd() * 0.02)
      const s = 0.45 + rnd() * 1.15
      dummy.scale.set(s, s * (0.6 + rnd() * 0.5), s * 0.55)
      dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3)
      dummy.updateMatrix()
      minerals.setMatrixAt(i, dummy.matrix)
    }
    for (let i = 0; i < 46; i++) {
      dummy.position.set((rnd() - 0.5) * 2.6, (rnd() - 0.5) * (cfg.h - 0.14), 1.398)
      const s = 0.5 + rnd() * 1.3
      dummy.scale.set(s, s * 0.7, s * 0.4)
      dummy.rotation.set(0, 0, rnd() * 3)
      dummy.updateMatrix()
      pores.setMatrixAt(i, dummy.matrix)
    }
    minerals.instanceMatrix.needsUpdate = true
    pores.instanceMatrix.needsUpdate = true
    group.add(minerals, pores)

    // 钙质结核与铁锰锈斑：只有心土与母质层才有结核，符合真实成土过程
    const noduleCount = idx === 0 ? 0 : 14
    if (noduleCount) {
      const noduleGeo = sculptedAggregateGeometry(0.042, 2, 5501 + idx * 31, 0.3)
      const noduleMat = new THREE.MeshStandardMaterial({ color: 0xC9B99A, roughness: 0.94 })
      const nodules = new THREE.InstancedMesh(noduleGeo, noduleMat, noduleCount)
      for (let i = 0; i < noduleCount; i++) {
        dummy.position.set((rnd() - 0.5) * 2.55, (rnd() - 0.5) * (cfg.h - 0.24), 1.405)
        const s = 0.45 + rnd() * 1.35
        dummy.scale.set(s, s * (0.55 + rnd() * 0.6), s * 0.45)
        dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3)
        dummy.updateMatrix()
        nodules.setMatrixAt(i, dummy.matrix)
      }
      nodules.instanceMatrix.needsUpdate = true
      group.add(nodules)
    }
    const rustGeo = new THREE.SphereGeometry(0.021, 8, 6)
    const rustMat = new THREE.MeshStandardMaterial({ color: 0x8C583A, roughness: 0.96 })
    const rusts = new THREE.InstancedMesh(rustGeo, rustMat, 28)
    for (let i = 0; i < 28; i++) {
      dummy.position.set((rnd() - 0.5) * 2.58, (rnd() - 0.5) * (cfg.h - 0.16), 1.406)
      const s = 0.4 + rnd() * 1.5
      dummy.scale.set(s, s * 0.7, s * 0.35)
      dummy.rotation.set(0, 0, rnd() * 3)
      dummy.updateMatrix()
      rusts.setMatrixAt(i, dummy.matrix)
    }
    rusts.instanceMatrix.needsUpdate = true
    group.add(rusts)

    // 腐殖根须 / 菌丝：平滑空间曲线管
    const rootMat = new THREE.MeshStandardMaterial({
      color: idx === 2 ? 0x9A825E : 0xC88A32,
      roughness: 0.86, metalness: 0.08, transparent: true, opacity: 0.66
    })
    for (let r = 0; r < 5; r++) {
      const x0 = (rnd() - 0.5) * 2.3
      const y0 = cfg.h / 2 - 0.05
      const pts = []
      for (let k = 0; k < 5; k++) {
        pts.push(new THREE.Vector3(
          x0 + Math.sin(k * 1.3 + r) * 0.16 + (rnd() - 0.5) * 0.1,
          y0 - k * (cfg.h * 0.2),
          1.405 + rnd() * 0.012
        ))
      }
      const curve = new THREE.CatmullRomCurve3(pts)
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.007 + rnd() * 0.005, 7, false), rootMat)
      group.add(tube)
    }

    // 层位铭牌（浮雕小瓷片）
    const tagTex = labelTexture(`STRATUM 0${idx + 1}  ·  ${strataInfo[idx].depth}`, {
      width: 768, height: 96, font: '500 42px Georgia, serif', color: '#6B5C43'
    })
    labelTextures.push(tagTex)
    const tag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.98, 0.12),
      new THREE.MeshBasicMaterial({ map: tagTex, transparent: true, depthWrite: false, toneMapped: false })
    )
    tag.position.set(0.82, -cfg.h / 2 + 0.11, 1.412)
    tag.userData.excludeFromAO = true
    group.add(tag)

    // 悬停时的自发光描边
    const stroke = edgeLines(geo, { color: PALETTE.gold, opacity: 0.07, threshold: 16 })
    stroke.userData.isStroke = true
    stroke.userData.excludeFromAO = true
    group.add(stroke)

    scene.add(group)
    layerGroups.push(group)
  })
}

/* ---------------- 表层禾苗微雕 ---------------- */
const buildSeedlings = () => {
  const stem = new THREE.CylinderGeometry(0.007, 0.015, 0.32, 8, 4)
  stem.translate(0, 0.16, 0)
  const ear = new THREE.ConeGeometry(0.032, 0.14, 9, 3)
  ear.translate(0, 0.39, 0)
  const leafA = new THREE.SphereGeometry(0.055, 10, 8)
  leafA.scale(0.36, 1.7, 0.16)
  leafA.rotateZ(-0.62)
  leafA.translate(-0.045, 0.22, 0)
  const leafB = new THREE.SphereGeometry(0.05, 10, 8)
  leafB.scale(0.34, 1.55, 0.16)
  leafB.rotateZ(0.66)
  leafB.translate(0.042, 0.16, 0.012)
  const parts = [stem, ear, leafA, leafB]
  const normalized = parts.map((g) => (g.index ? g.toNonIndexed() : g))
  const sproutGeo = mergeGeometries(normalized, false) || normalized[0].clone()
  normalized.forEach((g, i) => { if (g !== parts[i]) g.dispose() })
  parts.forEach((g) => g.dispose())

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xC9A24C, roughness: 0.72, metalness: 0.05, side: THREE.DoubleSide
  })
  const mossMat = new THREE.MeshStandardMaterial({
    color: 0x4E7A55, roughness: 0.8, metalness: 0.02, side: THREE.DoubleSide
  })
  windGold = applyWind(goldMat, { amount: 0.2, speed: 1.35, phaseScale: 1.6 })
  windMoss = applyWind(mossMat, { amount: 0.2, speed: 1.35, phaseScale: 1.6 })

  const rnd = mulberry32(8848)
  const holder = new THREE.Group()
  holder.position.y = layerConfigs[0].h / 2 + 0.01

  const goldCount = 34
  const mossCount = 22
  const dummy = new THREE.Object3D()
  const gold = new THREE.InstancedMesh(sproutGeo, goldMat, goldCount)
  const moss = new THREE.InstancedMesh(sproutGeo, mossMat, mossCount)
  const place = (mesh, count) => {
    for (let i = 0; i < count; i++) {
      dummy.position.set((rnd() - 0.5) * 2.35, 0, (rnd() - 0.5) * 2.35)
      dummy.rotation.set((rnd() - 0.5) * 0.22, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.28)
      const s = 0.65 + rnd() * 0.85
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.castShadow = true
    holder.add(mesh)
  }
  place(gold, goldCount)
  place(moss, mossCount)
  layerGroups[0].add(holder)
}

/* ---------------- 左侧断代标尺 ---------------- */
const buildScaleRuler = () => {
  const group = new THREE.Group()
  group.position.set(-1.78, 0, 1.52)
  const gold = metalMaterial(PALETTE.gold, { roughness: 0.32, metalness: 0.78, repeat: [1, 3] })
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 4.0, 14), gold)
  group.add(spine)

  const marks = [
    { y: 2.0, text: '0 cm' },
    { y: 1.0, text: '20 cm' },
    { y: -0.55, text: '50 cm' },
    { y: -2.0, text: '100 cm' }
  ]
  const tickGeo = new THREE.BoxGeometry(0.18, 0.012, 0.014)
  marks.forEach((m) => {
    const tick = new THREE.Mesh(tickGeo, gold)
    tick.position.set(0.09, m.y, 0)
    group.add(tick)
    const tex = labelTexture(m.text, {
      width: 384, height: 96, font: '500 50px Georgia, serif', color: '#8A6A2E', align: 'left'
    })
    labelTextures.push(tex)
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, toneMapped: false
    }))
    sprite.scale.set(0.66, 0.165, 1)
    sprite.position.set(0.48, m.y, 0)
    group.add(sprite)
  })
  scene.add(group)
}

/* ---------------- 有机生命光微粒 ---------------- */
const buildOrganicMotes = () => {
  const count = 150
  const positions = new Float32Array(count * 3)
  const data = []
  const rnd = mulberry32(1979)
  for (let i = 0; i < count; i++) {
    const x = (rnd() - 0.5) * 3.0
    const z = (rnd() - 0.5) * 3.0
    const y = (rnd() - 0.5) * 3.9
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
    data.push({ x, z, y, speed: 0.12 + rnd() * 0.26 })
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  moteMat = new THREE.PointsMaterial({
    map: glowSprite('#C88A32'), color: 0xFFFFFF, size: 0.085,
    transparent: true, opacity: 0.66, depthWrite: false, sizeAttenuation: true
  })
  motes = new THREE.Points(geo, moteMat)
  motes.userData.excludeFromAO = true
  moteData = { positions, data }
  scene.add(motes)
}

/* ---------------- 科研取样探针 ---------------- */
const buildSamplingProbe = () => {
  const g = new THREE.Group()
  g.position.set(1.02, 1.3, 0.72)
  const steel = metalMaterial(0x8C8880, { roughness: 0.34, metalness: 0.86, repeat: [1, 4] })
  const gold = metalMaterial(PALETTE.gold, { roughness: 0.28, metalness: 0.88 })

  // 探针整体控制在亚克力罩内，顶端不穿出罩顶
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 1.25, 24, 4), steel)
  shaft.rotation.z = 0.34
  shaft.castShadow = true
  g.add(shaft)
  for (let i = 0; i < 6; i++) {
    const tick = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.006, 8, 22), gold)
    tick.rotation.x = Math.PI / 2
    tick.position.y = -0.5 + i * 0.2
    shaft.add(tick)
  }
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 28), gold)
  grip.position.y = 0.67
  shaft.add(grip)
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.072, 18, 12), gold)
  cap.position.y = 0.76
  shaft.add(cap)
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.019, 0.11, 16), steel)
  tip.rotation.x = Math.PI
  tip.position.y = -0.68
  shaft.add(tip)

  const tagTex = labelTexture('CORING PROBE  /  0-100 CM', {
    width: 768, height: 96, font: '500 42px Georgia, serif', color: '#8A7346'
  })
  labelTextures.push(tagTex)
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tagTex, transparent: true, depthWrite: false, toneMapped: false
  }))
  tag.scale.set(1.15, 0.14, 1)
  tag.position.set(0.1, 0.85, 0)
  g.add(tag)
  scene.add(g)
}

/* ---------------- 交互 ---------------- */
const switchLayer = (idx) => {
  currentLayer.value = idx
  if (isTouring.value) toggleTour()
  const views = [
    { position: [3.5, 2.05, 5.4], target: [0, 1.35, 0] },
    { position: [3.8, 0.35, 5.35], target: [0, 0.0, 0] },
    { position: [3.5, -1.25, 5.4], target: [0, -1.35, 0] }
  ]
  stage?.flyTo({ ...views[idx], duration: 1.3 })
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  const open = isExpanded.value
  // 展开时同步后退镜头，保证禾苗与底层母质都完整入镜
  if (open) stage?.flyTo({ position: [6.4, 3.7, 8.6], target: [0, 0.28, 0], duration: 1.25 })
  else stage?.flyTo({ position: [5.5, 3.2, 6.8], target: [0, 0, 0], duration: 1.25 })
  const offsets = [0.92, 0, -0.92]
  layerGroups.forEach((g, i) => {
    gsap.to(g.position, {
      y: layerConfigs[i].y + (open ? offsets[i] : 0),
      duration: 1.25,
      ease: 'power3.inOut',
      overwrite: true
    })
  })
  if (glassMat) {
    gsap.to(glassMat, { transmission: open ? 0.68 : 0.95, roughness: open ? 0.16 : 0.035, duration: 0.95 })
    gsap.to(glassMat, { opacity: open ? 0.2 : 0.42, duration: 0.95 })
  }
  if (glassGroup) gsap.to(glassGroup.position, { y: open ? 0.28 : 0, duration: 1.1, ease: 'power2.out' })
  if (frameMat) gsap.to(frameMat, { opacity: open ? 0.3 : 0.72, duration: 0.9 })
  if (moteMat) gsap.to(moteMat, { opacity: open ? 0.95 : 0.66, duration: 0.9 })
}

const toggleTour = () => {
  isTouring.value = !isTouring.value
  if (stage) stage.controls.autoRotate = isTouring.value
  if (stage) stage.controls.autoRotateSpeed = 0.55
}

const setTooltip = (obj, event) => {
  if (!obj?.userData.layerIndex && obj?.userData.layerIndex !== 0) return
  const i = obj.userData.layerIndex
  const rect = containerRef.value.getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    title: strataInfo[i].name,
    sub: `${strataInfo[i].feature}   ${strataInfo[i].organic}`
  }
}

const initThree = () => {
  if (!containerRef.value) return
  stage = createStage(containerRef.value, {
    background: PALETTE.canvas,
    fov: 38,
    camera: [5.5, 3.2, 6.8],
    target: [0, 0, 0],
    minDistance: 3.4,
    maxDistance: 13,
    maxPolarAngle: Math.PI / 2 + 0.08,
    minPolarAngle: 0.28,
    exposure: 1.08,
    environmentIntensity: 0.76,
    hemiIntensity: 0.7,
    keyIntensity: 1.9,
    shadowSize: 2048,
    shadowFrustum: 6,
    aoRadius: 0.24,
    aoIntensity: 0.4,
    onQualityChange: (q) => { qualityLabel.value = q === 'high' ? '展览级 · IBL + GTAO' : '流畅模式 · 自适应' },
    onFrame: (dt, t) => {
      windGold?.(t)
      windMoss?.(t)
      if (motes && moteData) {
        const { positions, data } = moteData
        for (let i = 0; i < data.length; i++) {
          const p = data[i]
          positions[i * 3 + 1] = -1.95 + ((p.y + 1.95 + t * p.speed) % 3.9)
          positions[i * 3] = p.x + Math.sin(t * 0.45 + i) * 0.04
        }
        motes.geometry.attributes.position.needsUpdate = true
        motes.rotation.y = t * 0.018
      }
    }
  })
  if (!stage) return
  scene = stage.scene

  buildPedestal()
  buildStrata()
  buildSeedlings()
  buildGlassCase()
  buildScaleRuler()
  buildOrganicMotes()
  buildSamplingProbe()

  // 展台磨砂地面承接真实柔和阴影
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.ShadowMaterial({ opacity: 0.1 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -2.82
  floor.receiveShadow = true
  scene.add(floor)

  let hovered = null
  stage.enablePicking(() => layerGroups, {
    onHover: (obj, hit, event) => {
      hovered = obj
      highlight(obj, { intensity: 0.17 })
      obj.traverse((o) => { if (o.userData.isStroke) o.material.opacity = 0.5 })
      setTooltip(obj, event)
    },
    onMove: (payload) => setTooltip(payload.object, payload.event),
    onLeave: (obj) => {
      clearHighlight(obj)
      obj.traverse((o) => { if (o.userData.isStroke) o.material.opacity = 0.07 })
      hovered = null
      tooltip.value.visible = false
    },
    onClick: (obj) => {
      if (obj.userData.layerIndex !== undefined) switchLayer(obj.userData.layerIndex)
    }
  })

  stage.onCleanup(() => labelTextures.forEach((t) => t.dispose()))
  stage.start()
  requestAnimationFrame(() => { isReady.value = true })
}

onMounted(() => initThree())

onUnmounted(() => {
  gsap.killTweensOf(glassMat || {})
  layerGroups.forEach((g) => gsap.killTweensOf(g.position))
  stage?.dispose()
  stage = null
  layerGroups = []
})
</script>

<template>
  <div class="relative w-full h-full min-h-[580px] bg-[#F7F4EE] select-none overflow-hidden rounded-3xl">
    <div ref="containerRef" class="w-full h-full cursor-grab active:cursor-grabbing"></div>

    <!-- 载入淡出 -->
    <div
      v-if="!isReady"
      class="absolute inset-0 bg-[#F7F4EE] flex items-center justify-center transition-opacity duration-700 z-30"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-[#C88A32]/25 border-t-[#C88A32] animate-spin"></div>
        <span class="text-[11px] font-mono text-[#6E6960] tracking-widest">PREPARING SPECIMEN</span>
      </div>
    </div>

    <!-- 顶部艺术馆标牌 -->
    <div class="absolute top-5 left-6 museum-panel px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm border border-[#1C1B18]/10 pointer-events-auto">
      <div class="w-2.5 h-2.5 rounded-full bg-[#C88A32] animate-pulse"></div>
      <div>
        <div class="text-xs font-bold text-[#1C1B18] tracking-wider uppercase font-editorial">
          吉林黑土天然地质切片标本 · 3D
        </div>
        <div class="text-[10px] text-[#5A564E] font-mono">
          NORTHEAST CHERNOZEM MONOLITH // 1.0 METER
        </div>
      </div>
    </div>

    <!-- 交互模式控制组 -->
    <div class="absolute top-5 right-6 flex items-center gap-2">
      <button
        @click="toggleTour"
        class="museum-panel px-3.5 py-2.5 min-h-[40px] rounded-xl text-xs font-semibold text-[#1C1B18] hover:border-[#C88A32] transition-all duration-200 cursor-pointer shadow-sm"
        :class="[isTouring ? 'bg-[#EFECE6] border-[#C88A32] text-[#C88A32]' : '']"
      >
        <span>{{ isTouring ? '⏸ 停止环视导览' : '🎥 自动环视导览' }}</span>
      </button>
      <button
        @click="toggleExpand"
        class="museum-panel px-3.5 py-2.5 min-h-[40px] rounded-xl text-xs font-semibold text-[#1C1B18] hover:border-[#C88A32] transition-all duration-200 cursor-pointer shadow-sm"
        :class="[isExpanded ? 'bg-[#EFECE6] border-[#C88A32]' : '']"
      >
        <span>{{ isExpanded ? '📦 原位合拢标本' : '🔬 抽屉分层展开' }}</span>
      </button>
    </div>

    <!-- 悬停浮动标签 -->
    <div
      v-show="tooltip.visible"
      class="absolute z-20 pointer-events-none museum-card px-3 py-2 rounded-xl border border-[#C88A32]/40 shadow-lg"
      :style="{ left: `${tooltip.x + 16}px`, top: `${tooltip.y + 16}px`, maxWidth: '250px' }"
    >
      <div class="text-[11px] font-bold text-[#1C1B18]">{{ tooltip.title }}</div>
      <div class="text-[10px] text-[#8C6A2E] font-mono mt-0.5">{{ tooltip.sub }}</div>
    </div>

    <!-- 左侧地层快速探针导航 -->
    <div class="absolute left-6 bottom-6 flex flex-col gap-2 max-w-xs">
      <div
        v-for="(layer, idx) in strataInfo"
        :key="layer.depth"
        @click="switchLayer(idx)"
        class="museum-panel p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left group"
        :class="[
          currentLayer === idx
            ? 'border-[#C88A32] bg-[#FFFFFF]/90 shadow-md translate-x-1'
            : 'border-[#1C1B18]/10 hover:border-[#1C1B18]/30'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full border border-black/15 shadow-inner"
              :style="{ backgroundColor: layer.colorHex }"
            ></span>
            <span class="text-xs font-bold text-[#1C1B18]">{{ layer.name }}</span>
          </div>
          <span class="text-[10px] font-mono text-[#8A6324] font-semibold">{{ layer.depth }}</span>
        </div>
        <div class="text-[11px] text-[#5A564E] mt-1 line-clamp-1 group-hover:text-[#1C1B18] transition-colors">
          {{ layer.feature }} · {{ layer.organic }}
        </div>
      </div>
    </div>

    <!-- 右侧地质科学解读书签卡 -->
    <div class="absolute right-6 bottom-6 hidden md:block w-72 museum-card p-4 rounded-2xl border border-[#1C1B18]/10 shadow-lg pointer-events-auto">
      <div class="flex items-center justify-between border-b border-[#1C1B18]/10 pb-2 mb-2">
        <span class="text-[10px] font-mono uppercase tracking-widest text-[#8A6324] font-semibold">
          地质物候档案 // STRATA NO. 0{{ currentLayer + 1 }}
        </span>
        <span class="text-[10px] text-[#6E6960] font-mono">100% 真实取样</span>
      </div>
      <h3 class="text-sm font-bold text-[#1C1B18] mb-1 font-editorial">
        {{ strataInfo[currentLayer].name }}
      </h3>
      <div class="inline-block px-2 py-0.5 rounded bg-[#C88A32]/10 text-[#8A6324] text-[10px] font-medium mb-2">
        {{ strataInfo[currentLayer].organic }}
      </div>
      <p class="text-xs text-[#5A564E] leading-relaxed">
        {{ strataInfo[currentLayer].desc }}
      </p>
      <div class="mt-3 pt-2 border-t border-[#1C1B18]/5 flex items-center justify-between text-[10px] text-[#6E6960] font-mono">
        <span>悬停土层查看细节</span>
        <span>{{ qualityLabel }}</span>
      </div>
    </div>
  </div>
</template>
