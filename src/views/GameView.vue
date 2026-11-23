<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Play, RotateCcw, Volume2, VolumeX, Pause, Sparkles, Shield,
  Droplets, Tractor, Satellite, Trophy, CheckCircle2, ArrowUpRight,
  Zap, Award, Smartphone, Layers
} from 'lucide-vue-next'
import BrandLogo from '../components/BrandLogo.vue'
import NeoDivider from '../components/editorial/NeoDivider.vue'
import { gameAudio } from '../lib/gameAudio.js'
import { useRuralPlatformStore } from '../stores/ruralPlatformStore'

const store = useRuralPlatformStore()

// ======================== 游戏配置与状态 ========================
const LOGICAL_W = 1120
const LOGICAL_H = 580
const COLS = 5
const ROWS = 3
const PLOT_COUNT = COLS * ROWS

const SEASONS = [
  { id: 'spring', name: '春 · 惊蛰', sub: '精准播种 · 严防春风扬沙', skyTop: '#DDF0E6', skyMid: '#EDF6F0', skyBot: '#CBE4D6', accent: '#2D7A5C' },
  { id: 'summer', name: '夏 · 芒种', sub: '稻蟹共生 · 引水治虫保苗', skyTop: '#C5E7D7', skyMid: '#E3F3EA', skyBot: '#A8D8C1', accent: '#1F6B4E' },
  { id: 'autumn', name: '秋 · 秋分', sub: '金浪满野 · 北斗农机抢收', skyTop: '#F4DFB4', skyMid: '#F9EED4', skyBot: '#DFBE7E', accent: '#B87E1E' },
  { id: 'winter', name: '冬 · 小雪', sub: '秸秆覆盖 · 封土锁墒过冬', skyTop: '#16352E', skyMid: '#214A41', skyBot: '#396960', accent: '#6CC4D4' }
]

const TOOLS = [
  {
    id: 'straw', key: '1', name: '梨树秸秆覆盖', short: '挡风沙 · 锁黑土',
    counters: 'wind', badge: '防风固土', color: '#D49A3A', bg: 'from-[#3B2E16] to-[#261D0D]',
    desc: '铺设金黄秸秆棉被，拦截春季沙尘与冬季寒潮风蚀，提升黑土有机质。'
  },
  {
    id: 'water', key: '2', name: '稻蟹生态水闸', short: '引雪水 · 灭虫害',
    counters: 'pest', badge: '生态治虫', color: '#39A37C', bg: 'from-[#143B2E] to-[#0C251C]',
    desc: '引入长白山活水并释放稻田蟹，零农药清除虫害与干旱龟裂。'
  },
  {
    id: 'tractor', key: '3', name: '北斗无人农机', short: '厘米精播 · 抢收金稻',
    counters: 'ready', badge: '260马力', color: '#D9533F', bg: 'from-[#421C16] to-[#29100C]',
    desc: '调度长春造 260 马力北斗农机，沿 RTK 金线完成精准播种与秋收。'
  }
]

const canvasRef = ref(null)
const phase = ref('intro') // 'intro' | 'playing' | 'paused' | 'gameover'
const difficulty = ref('standard') // 'standard' (60s) | 'challenge' (75s)
const autoAssist = ref(false) // true = 轻松畅玩一键自动匹配工具；false = 手动策略（+25% 积分加成）
const activeTool = ref('tractor')
const muted = ref(false)
const syncedReward = ref(false)
const flashToolId = ref('')
let flashTimer = 0

// HUD 响应式读数（每 100ms 同步一次，避免 60fps 频繁触碰 Vue 响应式树）
const hud = ref({
  score: 0,
  harvestYuan: 0,
  soilHealth: 96,
  combo: 0,
  maxCombo: 0,
  energy: 35,
  timeLeft: 60,
  totalTime: 60,
  seasonIndex: 0,
  feverLeft: 0,
  rescuedCount: 0,
  harvestedPlots: 0,
  bonusCaught: 0,
  statusHint: '选择农艺工具，点击或按住鼠标连刷发光地块！'
})

const currentSeason = computed(() => SEASONS[hud.value.seasonIndex] || SEASONS[0])
const timeProgressPct = computed(() => {
  const t = hud.value.totalTime || 60
  return Math.max(0, Math.min(100, ((t - hud.value.timeLeft) / t) * 100))
})

const finalRank = computed(() => {
  const s = hud.value.score
  const soil = hud.value.soilHealth
  if (s >= 6500 && soil >= 75) return { code: 'S+', title: '特级黑土守护官', color: '#F5D383', desc: '四季统筹滴水不漏，黑土有机质稳步增长，合作社迎来特大丰收！' }
  if (s >= 4200 && soil >= 60) return { code: 'S', title: '松辽丰收领航员', color: '#E5C175', desc: '精准运用梨树模式与北斗农机，稳稳守住松辽黑土粮仓！' }
  if (s >= 2200) return { code: 'A', title: '智慧助农新农人', color: '#7EE0B5', desc: '熟悉四季物候节奏，已具备现代数智农业调度能力。' }
  return { code: 'B', title: '黑土保护见习官', color: '#A5D3DE', desc: '初探黑土农艺奥秘，试着按住鼠标连刷田块冲刺高连击吧！' }
})

const earnedCarbon = computed(() => Math.max(40, Math.round(hud.value.score / 22 + hud.value.soilHealth * 1.5)))
const bestScore = computed(() => store.gameStats?.bestScore || 0)

// ======================== 核心 60fps 引擎状态（纯 JS 零响应式开销） ========================
let rafId = 0
let lastTs = 0
let hudSyncAcc = 0
let isPointerDown = false
let lastSwipedPlot = -1

// 定制青绿山水全景原画 + 离屏微纹理黑土图案缓存
let backdropImg = null
let backdropReady = false
let soilPattern = null

function initVisualAssets() {
  if (typeof window === 'undefined') return
  if (!backdropImg) {
    backdropImg = new Image()
    backdropImg.decoding = 'async'
    backdropImg.onload = () => { backdropReady = true }
    backdropImg.src = '/art-custom/game-valley-backdrop.jpg'
  }
  if (!soilPattern) {
    const off = document.createElement('canvas')
    off.width = 128
    off.height = 128
    const octx = off.getContext('2d')
    octx.fillStyle = '#291F17'
    octx.fillRect(0, 0, 128, 128)
    // 确定性伪随机有机质黑土颗粒与矿质微粒
    let seed = 4219
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    for (let i = 0; i < 420; i++) {
      const gx = rand() * 128
      const gy = rand() * 128
      const r = 0.7 + rand() * 1.9
      const tone = rand()
      octx.fillStyle = tone < 0.45
        ? 'rgba(14, 10, 7, 0.36)'
        : tone < 0.82
          ? 'rgba(72, 56, 42, 0.32)'
          : 'rgba(176, 146, 106, 0.14)'
      octx.beginPath()
      octx.arc(gx, gy, r, 0, Math.PI * 2)
      octx.fill()
    }
    soilPattern = octx.createPattern(off, 'repeat')
  }
}

const world = {
  t: 0,
  timeLeft: 60,
  totalTime: 60,
  seasonIndex: 0,
  score: 0,
  harvestYuan: 0,
  soilHealth: 96,
  combo: 0,
  comboTimer: 0,
  maxCombo: 0,
  energy: 35,
  feverLeft: 0,
  shake: 0,
  rescuedCount: 0,
  harvestedPlots: 0,
  bonusCaught: 0,
  granaryFill: 0.15,
  eventCooldown: 0.8,
  bonusCooldown: 9.5,
  tutorialSteps: 2,
  statusHint: '春耕伊始：点击发光地块即可播种或护土！',
  plots: [],
  particles: [],
  floaters: [],
  tractors: [],
  ripples: [],
  waterWaves: [],
  crabs: [],
  satellites: [],
  weather: [],
  bonusFish: null,
  hoverPlot: -1
}

function buildPlots() {
  const arr = []
  const gridLeft = 104
  const gridTop = 216
  const colGap = 18
  const rowGap = 18
  const pw = 168
  const ph = 96
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c
      // 轻微梯田错位感，增强空间纵深
      const offsetX = (r - 1) * 14
      const x = gridLeft + c * (pw + colGap) + offsetX
      const y = gridTop + r * (ph + rowGap)
      arr.push({
        idx, r, c, x, y, w: pw, h: ph,
        cx: x + pw / 2, cy: y + ph / 2,
        stage: idx % 3 === 0 ? 'empty' : 'seedling', // 'empty' | 'seedling' | 'growing' | 'ripe' | 'mulched'
        crisis: null, // null | 'wind' | 'pest' | 'ready'
        crisisTimer: 0,
        crisisMax: 8,
        shield: 0, // 秸秆护盾剩余秒数
        moisture: 0.85,
        growth: idx % 3 === 0 ? 0 : 0.25,
        pulse: Math.random() * Math.PI * 2,
        flash: 0
      })
    }
  }
  return arr
}

function initWeather() {
  const w = []
  for (let i = 0; i < 65; i++) {
    w.push({
      x: Math.random() * LOGICAL_W,
      y: Math.random() * LOGICAL_H,
      vx: 28 + Math.random() * 65,
      vy: 15 + Math.random() * 45,
      size: 1.5 + Math.random() * 2.8,
      alpha: 0.25 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2
    })
  }
  return w
}

function resetWorld(forPlay = false) {
  const total = difficulty.value === 'challenge' ? 75 : 60
  world.t = 0
  world.timeLeft = total
  world.totalTime = total
  world.seasonIndex = 0
  world.score = 0
  world.harvestYuan = 0
  world.soilHealth = 96
  world.combo = 0
  world.comboTimer = 0
  world.maxCombo = 0
  world.energy = 35
  world.feverLeft = 0
  world.shake = 0
  world.rescuedCount = 0
  world.harvestedPlots = 0
  world.bonusCaught = 0
  world.granaryFill = 0.14
  world.eventCooldown = 0.7
  world.bonusCooldown = 9.0
  world.tutorialSteps = 2
  world.statusHint = '点击闪烁地块施展对应农艺，支持按住鼠标一笔连刷！'
  world.plots = buildPlots()
  world.particles = []
  world.floaters = []
  world.tractors = []
  world.ripples = []
  world.waterWaves = []
  world.crabs = []
  world.satellites = []
  world.weather = initWeather()
  world.bonusFish = null
  world.hoverPlot = -1
  syncedReward.value = false

  if (forPlay) {
    // 开局呈现层次丰富的黑土田园并立刻给出 3 块可交互目标，0 秒冷场！
    world.plots.forEach((p, i) => {
      if (i % 5 === 1) p.stage = 'growing'
      else if (i === 4 || i === 13) p.stage = 'ripe'
    })
    const p1 = world.plots[2]
    p1.stage = 'empty'; p1.crisis = 'ready'; p1.crisisTimer = 9; p1.crisisMax = 9
    const p2 = world.plots[7]
    p2.stage = 'growing'; p2.crisis = 'wind'; p2.crisisTimer = 9.5; p2.crisisMax = 9.5
    const p3 = world.plots[11]
    p3.stage = 'ripe'; p3.crisis = 'ready'; p3.crisisTimer = 9.5; p3.crisisMax = 9.5
    activeTool.value = 'tractor'
  } else {
    // 待机观赏态：铺满生机勃勃的翡翠稻浪、金黄垂穗与秸秆保温田
    world.plots.forEach((p, i) => {
      p.stage = i % 3 === 0 ? 'ripe' : (i % 4 === 1 ? 'mulched' : 'growing')
    })
  }
  syncHud()
}

function syncHud() {
  hud.value = {
    score: Math.round(world.score),
    harvestYuan: Math.round(world.harvestYuan),
    soilHealth: Math.max(0, Math.min(100, Math.round(world.soilHealth))),
    combo: world.combo,
    maxCombo: world.maxCombo,
    energy: Math.min(100, Math.round(world.energy)),
    timeLeft: Math.max(0, Number(world.timeLeft.toFixed(1))),
    totalTime: world.totalTime,
    seasonIndex: world.seasonIndex,
    feverLeft: Math.max(0, Number(world.feverLeft.toFixed(1))),
    rescuedCount: world.rescuedCount,
    harvestedPlots: world.harvestedPlots,
    bonusCaught: world.bonusCaught,
    statusHint: world.statusHint
  }
}

// ======================== 粒子与特效生成器 ========================
function spawnBurst(x, y, color, count = 18, toGranary = false) {
  for (let i = 0; i < count; i++) {
    const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
    const spd = 45 + Math.random() * 140
    world.particles.push({
      x, y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 45,
      size: 2.5 + Math.random() * 4,
      color,
      life: 0.55 + Math.random() * 0.45,
      maxLife: 1.0,
      toGranary: toGranary && i < 6,
      tx: 132,
      ty: 118
    })
  }
}

function addFloater(x, y, text, color = '#F6D783', size = 16) {
  world.floaters.push({ x, y, text, color, size, life: 1.05, maxLife: 1.05 })
}

function spawnTractorSweep(plot, isHarvest) {
  world.tractors.push({
    x: plot.x - 16,
    y: plot.cy,
    endX: plot.x + plot.w + 18,
    speed: 310,
    isHarvest
  })
}

function spawnRipple(x, y, color) {
  world.ripples.push({ x, y, r: 10, maxR: 92, color, life: 0.65, maxLife: 0.65 })
}

function spawnWaterAndCrabs(plot) {
  world.waterWaves.push({
    x: plot.x, y: plot.y, w: plot.w, h: plot.h,
    progress: 0, life: 0.72, maxLife: 0.72
  })
  for (let i = 0; i < 2; i++) {
    world.crabs.push({
      x: plot.x + 26 + i * 32,
      y: plot.y + 34 + i * 28,
      vx: 62 + i * 18,
      vy: (i === 0 ? 1 : -1) * 10,
      life: 1.15,
      maxLife: 1.15,
      phase: i * 2.1
    })
  }
}

// ======================== 玩法交互逻辑 ========================
function triggerToolFlash(toolId) {
  flashToolId.value = toolId
  clearTimeout(flashTimer)
  flashTimer = window.setTimeout(() => { flashToolId.value = '' }, 850)
}

function applyToolToPlot(plot) {
  if (!plot || phase.value !== 'playing') return

  // 智能匹配模式：自动切到解决当前危机的最佳工具
  let chosen = activeTool.value
  if (autoAssist.value && plot.crisis) {
    if (plot.crisis === 'wind') chosen = 'straw'
    else if (plot.crisis === 'pest') chosen = 'water'
    else if (plot.crisis === 'ready') chosen = 'tractor'
    activeTool.value = chosen
  }

  const feverMul = world.feverLeft > 0 ? 2 : 1
  const manualBonus = autoAssist.value ? 1.0 : 1.25

  // 情况 1：命中活跃事件 / 危机
  if (plot.crisis) {
    const needMap = { wind: 'straw', pest: 'water', ready: 'tractor' }
    const needTool = needMap[plot.crisis]
    if (chosen === needTool) {
      const crisisType = plot.crisis
      plot.crisis = null
      plot.crisisTimer = 0
      plot.flash = 1.0

      world.combo += 1
      world.comboTimer = 3.8
      world.maxCombo = Math.max(world.maxCombo, world.combo)
      const comboMul = 1 + Math.min(world.combo - 1, 12) * 0.14
      const pts = Math.round(140 * comboMul * feverMul * manualBonus)
      world.score += pts
      world.energy = Math.min(100, world.energy + (world.feverLeft > 0 ? 4 : 11))
      world.rescuedCount += 1
      if (world.tutorialSteps > 0) world.tutorialSteps -= 1

      if (crisisType === 'wind') {
        plot.shield = 14
        if (world.seasonIndex === 3) plot.stage = 'mulched'
        world.soilHealth = Math.min(100, world.soilHealth + 2.5)
        world.harvestYuan += 650 * feverMul
        spawnRipple(plot.cx, plot.cy, '#E5C175')
        spawnBurst(plot.cx, plot.cy, '#F0C76B', 20)
        addFloater(plot.cx, plot.cy - 14, `秸秆固土 +${pts}`, '#F7D98B', 17)
        world.statusHint = `梨树模式生效！成功抵御风蚀，黑土有机质 +2.5%`
        gameAudio.playAction(world.combo)
      } else if (crisisType === 'pest') {
        plot.moisture = 1.0
        if (plot.stage === 'seedling') plot.stage = 'growing'
        world.soilHealth = Math.min(100, world.soilHealth + 1.5)
        world.harvestYuan += 820 * feverMul
        spawnRipple(plot.cx, plot.cy, '#4FD1A5')
        spawnWaterAndCrabs(plot)
        spawnBurst(plot.cx, plot.cy, '#6EE7B7', 22)
        addFloater(plot.cx, plot.cy - 14, `稻蟹清虫 +${pts}`, '#7CF0C2', 17)
        world.statusHint = `稻蟹共生生态治虫！零农药护苗，连击 ×${world.combo}`
        gameAudio.playAction(world.combo)
      } else if (crisisType === 'ready') {
        const wasRipe = plot.stage === 'ripe'
        spawnTractorSweep(plot, wasRipe)
        if (wasRipe) {
          plot.stage = world.seasonIndex >= 3 ? 'mulched' : 'empty'
          plot.growth = 0
          const yuan = Math.round(1680 * comboMul * feverMul)
          world.harvestYuan += yuan
          world.harvestedPlots += 1
          world.granaryFill = Math.min(1, world.granaryFill + 0.08)
          world.shake = Math.min(7, world.shake + 3.2)
          spawnRipple(plot.cx, plot.cy, '#F5C451')
          spawnBurst(plot.cx, plot.cy, '#FCD34D', 26, true)
          addFloater(plot.cx, plot.cy - 18, `金秋抢收 +¥${yuan}`, '#FDE68A', 19)
          world.statusHint = `260 马力北斗农机厘米级抢收！合作社增收 ¥${yuan}`
          gameAudio.playHarvest(world.combo)
        } else {
          plot.stage = 'seedling'
          plot.growth = 0.25
          world.harvestYuan += 520 * feverMul
          spawnRipple(plot.cx, plot.cy, '#F27D63')
          spawnBurst(plot.cx, plot.cy, '#86EFAC', 18)
          addFloater(plot.cx, plot.cy - 14, `北斗精播 +${pts}`, '#A7F3D0', 17)
          world.statusHint = `北斗 RTK 2.5cm 精准播种完成！连击 ×${world.combo}`
          gameAudio.playAction(world.combo)
        }
      }
      if (world.combo >= 3) {
        addFloater(plot.cx, plot.cy - 40, `COMBO ×${world.combo}${world.feverLeft > 0 ? ' · 2×狂欢' : ''}`, '#FFF2C2', 14)
      }
      syncHud()
      return
    } else {
      // 选错工具时温柔引导并高亮对应技能键
      const toolObj = TOOLS.find((t) => t.id === needTool)
      triggerToolFlash(needTool)
      addFloater(plot.cx, plot.cy - 12, `请按 [${toolObj.key}] ${toolObj.name}`, '#FCA5A5', 14)
      world.statusHint = `提示：该地块正处于突发状态，按数字键 [${toolObj.key}] 切换「${toolObj.name}」即可处置！`
      gameAudio.playMismatch()
      syncHud()
      return
    }
  }

  // 情况 2：主动养护空地或预防性覆盖（零惩罚，鼓励主动经营！）
  if (chosen === 'straw' && plot.shield <= 2) {
    plot.shield = 12
    plot.flash = 0.65
    world.score += 35 * feverMul
    world.soilHealth = Math.min(100, world.soilHealth + 0.6)
    spawnRipple(plot.cx, plot.cy, '#E5C175')
    addFloater(plot.cx, plot.cy - 10, '预铺秸秆护盾 +35', '#E5C175', 13)
    gameAudio.playAction(1)
    syncHud()
  } else if (chosen === 'tractor' && plot.stage === 'empty') {
    plot.stage = 'seedling'
    plot.growth = 0.2
    plot.flash = 0.7
    world.score += 55 * feverMul
    spawnTractorSweep(plot, false)
    spawnBurst(plot.cx, plot.cy, '#86EFAC', 12)
    addFloater(plot.cx, plot.cy - 10, '主动精播 +55', '#A7F3D0', 14)
    gameAudio.playAction(2)
    syncHud()
  } else if (chosen === 'tractor' && plot.stage === 'ripe') {
    plot.stage = 'empty'
    plot.growth = 0
    plot.flash = 1.0
    world.combo += 1
    world.comboTimer = 3.5
    world.maxCombo = Math.max(world.maxCombo, world.combo)
    const yuan = 1280 * feverMul
    world.score += 120 * feverMul
    world.harvestYuan += yuan
    world.harvestedPlots += 1
    world.granaryFill = Math.min(1, world.granaryFill + 0.06)
    spawnTractorSweep(plot, true)
    spawnBurst(plot.cx, plot.cy, '#FCD34D', 22, true)
    addFloater(plot.cx, plot.cy - 14, `满穗抢收 +¥${yuan}`, '#FDE68A', 17)
    gameAudio.playHarvest(world.combo)
    syncHud()
  } else if (chosen === 'water' && plot.stage === 'seedling') {
    plot.stage = 'growing'
    plot.growth = 0.65
    plot.moisture = 1.0
    plot.flash = 0.6
    world.score += 40 * feverMul
    spawnRipple(plot.cx, plot.cy, '#4FD1A5')
    spawnWaterAndCrabs(plot)
    addFloater(plot.cx, plot.cy - 10, '雪水催苗 +40', '#7CF0C2', 13)
    gameAudio.playAction(2)
    syncHud()
  }
}

function triggerBeidouUltimate() {
  if (phase.value !== 'playing' || world.energy < 100) return
  world.energy = 0
  world.feverLeft = 6.5
  world.shake = 8
  gameAudio.playUltimate()

  // 三颗北斗卫星掠空扫描
  for (let i = 0; i < 3; i++) {
    world.satellites.push({
      x: -120 - i * 130,
      y: 52 + i * 24,
      speed: 620,
      beamColor: i === 1 ? 'rgba(229, 193, 117, 0.34)' : 'rgba(79, 209, 165, 0.25)'
    })
  }

  let cleared = 0
  world.plots.forEach((p) => {
    p.flash = 1.0
    p.shield = Math.max(p.shield, 10)
    if (p.crisis) {
      p.crisis = null
      p.crisisTimer = 0
      cleared += 1
    }
    if (p.stage === 'empty' || p.stage === 'seedling' || p.stage === 'growing') {
      p.stage = 'ripe'
      p.crisis = 'ready'
      p.crisisTimer = 10
      p.crisisMax = 10
    }
    spawnBurst(p.cx, p.cy, '#F5D383', 10)
  })

  const bonus = 450 + cleared * 140
  world.score += bonus
  world.soilHealth = Math.min(100, world.soilHealth + 8)
  world.harvestYuan += 3200
  addFloater(LOGICAL_W / 2, 230, `北斗三星全域赋能 · 6.5秒 2×丰收狂欢 +${bonus}`, '#FFF3C4', 24)
  world.statusHint = '北斗卫星全域极光已触发！全田金稻瞬熟，快用 [3] 北斗农机按住连刷大抢收！'
  activeTool.value = 'tractor'
  syncHud()
}

// ======================== 随机节气事件调度 ========================
function spawnSeasonCrisis() {
  const s = world.seasonIndex
  const idlePlots = world.plots.filter((p) => !p.crisis)
  if (!idlePlots.length) return
  const pick = idlePlots[Math.floor(Math.random() * idlePlots.length)]

  // 按四季真实农事规律生成对应挑战
  if (s === 0) {
    // 春季：播种 + 偶发春季风沙
    if (pick.stage === 'empty' || Math.random() < 0.55) {
      pick.stage = 'empty'
      pick.crisis = 'ready'
    } else if (pick.shield <= 0) {
      pick.crisis = 'wind'
      gameAudio.playCrisis()
    } else {
      pick.crisis = 'ready'
    }
  } else if (s === 1) {
    // 夏季：生长抽穗 + 稻田虫害/干旱
    if (pick.stage === 'empty') pick.stage = 'seedling'
    if (Math.random() < 0.72) {
      pick.crisis = 'pest'
      gameAudio.playCrisis()
    } else if (pick.shield <= 0) {
      pick.crisis = 'wind'
    } else {
      pick.crisis = 'pest'
    }
  } else if (s === 2) {
    // 秋季：满穗金稻抢收黄金窗口 + 偶发阵风倒伏
    if (Math.random() < 0.78) {
      pick.stage = 'ripe'
      pick.crisis = 'ready'
    } else if (pick.shield <= 0) {
      pick.crisis = 'wind'
      gameAudio.playCrisis()
    } else {
      pick.stage = 'ripe'
      pick.crisis = 'ready'
    }
  } else {
    // 冬季：小雪寒潮封土（秸秆免耕覆盖）+ 残穗抢收
    if (Math.random() < 0.75) {
      pick.crisis = 'wind'
      gameAudio.playCrisis()
    } else {
      pick.stage = 'ripe'
      pick.crisis = 'ready'
    }
  }

  const baseLimit = difficulty.value === 'challenge' ? 6.6 : 8.2
  pick.crisisTimer = baseLimit
  pick.crisisMax = baseLimit
}

function spawnBonusFish() {
  const fromLeft = Math.random() > 0.5
  world.bonusFish = {
    x: fromLeft ? -45 : LOGICAL_W + 45,
    y: 235 + Math.random() * 190,
    vx: fromLeft ? 145 : -145,
    baseY: 235 + Math.random() * 190,
    phase: 0,
    r: 28
  }
}

// ======================== 60fps 仿真步进 ========================
function updateWorld(dt) {
  world.t += dt
  if (world.shake > 0) world.shake = Math.max(0, world.shake - dt * 22)

  // 更新背景天气粒子（待机态也流畅飘动）
  const windDir = world.seasonIndex === 0 ? 1.5 : (world.seasonIndex === 3 ? 0.6 : 1.0)
  world.weather.forEach((p) => {
    p.phase += dt * 2.2
    p.x += p.vx * windDir * dt
    p.y += p.vy * dt + Math.sin(p.phase) * 14 * dt
    if (p.x > LOGICAL_W + 20) p.x = -20
    if (p.y > LOGICAL_H + 20) { p.y = -15; p.x = Math.random() * LOGICAL_W }
  })

  if (phase.value !== 'playing') return

  world.timeLeft -= dt
  if (world.timeLeft <= 0) {
    world.timeLeft = 0
    phase.value = 'gameover'
    gameAudio.playVictory()
    syncHud()
    return
  }

  // 四季自动流转
  const elapsed = world.totalTime - world.timeLeft
  const nextSeason = Math.min(3, Math.floor((elapsed / world.totalTime) * 4))
  if (nextSeason !== world.seasonIndex) {
    world.seasonIndex = nextSeason
    const s = SEASONS[nextSeason]
    addFloater(LOGICAL_W / 2, 185, `节气更迭 · ${s.name}`, '#FFF2C2', 23)
    world.statusHint = `${s.name}已至：${s.sub}`
    // 季节推进自然促熟
    world.plots.forEach((p) => {
      if (nextSeason === 1 && p.stage === 'seedling') p.stage = 'growing'
      if (nextSeason === 2 && (p.stage === 'growing' || p.stage === 'seedling')) p.stage = 'ripe'
    })
  }

  if (world.feverLeft > 0) world.feverLeft = Math.max(0, world.feverLeft - dt)
  if (world.comboTimer > 0) {
    world.comboTimer -= dt
    if (world.comboTimer <= 0) world.combo = 0
  }

  // 生成新事件
  world.eventCooldown -= dt
  if (world.eventCooldown <= 0) {
    const activeCount = world.plots.filter((p) => p.crisis).length
    const cap = difficulty.value === 'challenge' ? 6 : 5
    if (activeCount < cap) spawnSeasonCrisis()
    const baseCd = difficulty.value === 'challenge' ? 1.05 : 1.35
    world.eventCooldown = world.feverLeft > 0 ? 0.72 : Math.max(0.75, baseCd - world.seasonIndex * 0.08)
  }

  // 生成飞掠彩蛋「查干湖金鲤」
  world.bonusCooldown -= dt
  if (world.bonusCooldown <= 0 && !world.bonusFish) {
    spawnBonusFish()
    world.bonusCooldown = 14 + Math.random() * 6
  }
  if (world.bonusFish) {
    const bf = world.bonusFish
    bf.phase += dt * 4.5
    bf.x += bf.vx * dt
    bf.y = bf.baseY + Math.sin(bf.phase) * 34
    if (Math.random() < 0.5) {
      world.particles.push({
        x: bf.x, y: bf.y, vx: -bf.vx * 0.15, vy: (Math.random() - 0.5) * 20,
        size: 3, color: '#FDE68A', life: 0.45, maxLife: 0.45, toGranary: false
      })
    }
    if (bf.x < -80 || bf.x > LOGICAL_W + 80) world.bonusFish = null
  }

  // 更新 15 块田地状态
  world.plots.forEach((p) => {
    p.pulse += dt * 3.8
    if (p.shield > 0) p.shield = Math.max(0, p.shield - dt)
    if (p.flash > 0) p.flash = Math.max(0, p.flash - dt * 2.2)

    if (p.crisis) {
      p.crisisTimer -= dt
      if (p.crisisTimer <= 0) {
        const lostType = p.crisis
        p.crisis = null
        if (lostType === 'wind' || lostType === 'pest') {
          world.soilHealth = Math.max(15, world.soilHealth - (lostType === 'wind' ? 4.5 : 3))
          world.combo = 0
          world.shake = Math.min(6, world.shake + 2.5)
          addFloater(p.cx, p.cy - 10, lostType === 'wind' ? '表土风蚀 -4%' : '虫害减产', '#F87171', 14)
        } else {
          addFloater(p.cx, p.cy - 10, '错过农时窗口', '#CBD5E1', 12)
        }
      }
    }
  })

  // 更新粒子
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const pt = world.particles[i]
    pt.life -= dt
    if (pt.life <= 0) { world.particles.splice(i, 1); continue }
    if (pt.toGranary) {
      pt.x += (pt.tx - pt.x) * Math.min(1, dt * 5.2)
      pt.y += (pt.ty - pt.y) * Math.min(1, dt * 5.2)
    } else {
      pt.x += pt.vx * dt
      pt.y += pt.vy * dt
      pt.vy += 190 * dt
    }
  }

  // 更新漂浮文字
  for (let i = world.floaters.length - 1; i >= 0; i--) {
    const fl = world.floaters[i]
    fl.life -= dt
    fl.y -= 36 * dt
    if (fl.life <= 0) world.floaters.splice(i, 1)
  }

  // 更新农机动画
  for (let i = world.tractors.length - 1; i >= 0; i--) {
    const tr = world.tractors[i]
    tr.x += tr.speed * dt
    if (tr.isHarvest && Math.random() < 0.7) {
      world.particles.push({
        x: tr.x - 10, y: tr.y - 6, vx: -40 - Math.random() * 40, vy: -60 - Math.random() * 50,
        size: 3.2, color: '#FCD34D', life: 0.45, maxLife: 0.45, toGranary: false
      })
    }
    if (tr.x > tr.endX) world.tractors.splice(i, 1)
  }

  // 更新涟漪
  for (let i = world.ripples.length - 1; i >= 0; i--) {
    const rp = world.ripples[i]
    rp.life -= dt
    rp.r = rp.maxR * (1 - rp.life / rp.maxLife)
    if (rp.life <= 0) world.ripples.splice(i, 1)
  }

  // 更新生态水闸浪潮与稻田蟹动画
  for (let i = world.waterWaves.length - 1; i >= 0; i--) {
    const ww = world.waterWaves[i]
    ww.life -= dt
    ww.progress = 1 - ww.life / ww.maxLife
    if (ww.life <= 0) world.waterWaves.splice(i, 1)
  }
  for (let i = world.crabs.length - 1; i >= 0; i--) {
    const cb = world.crabs[i]
    cb.life -= dt
    cb.phase += dt * 18
    cb.x += cb.vx * dt
    cb.y += Math.sin(cb.phase * 0.5) * 20 * dt + cb.vy * dt
    if (cb.life <= 0) world.crabs.splice(i, 1)
  }

  // 更新北斗卫星扫描
  for (let i = world.satellites.length - 1; i >= 0; i--) {
    const sat = world.satellites[i]
    sat.x += sat.speed * dt
    if (sat.x > LOGICAL_W + 180) world.satellites.splice(i, 1)
  }

  hudSyncAcc += dt
  if (hudSyncAcc >= 0.1) {
    hudSyncAcc = 0
    syncHud()
  }
}

// ======================== 60fps 新中式青绿山水 Canvas 渲染 ========================
function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// 优雅的实心渐变尖叶绘制（替代生硬折线，呈现植物自然弧度）
function drawLeafBlade(ctx, x, y, len, tipOffsetX, width, color) {
  const tipX = x + tipOffsetX
  const tipY = y - len
  const ctrlX = x + tipOffsetX * 0.42
  const ctrlY = y - len * 0.56
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x - width * 0.5, y)
  ctx.quadraticCurveTo(ctrlX - width * 0.48, ctrlY, tipX, tipY)
  ctx.quadraticCurveTo(ctrlX + width * 0.52, ctrlY, x + width * 0.5, y)
  ctx.closePath()
  ctx.fill()
}

function renderWorld(ctx) {
  ctx.save()
  if (world.shake > 0.2) {
    ctx.translate((Math.random() - 0.5) * world.shake, (Math.random() - 0.5) * world.shake)
  }

  const s = SEASONS[world.seasonIndex]
  const isWinter = world.seasonIndex === 3
  const isAutumn = world.seasonIndex === 2
  const isSummer = world.seasonIndex === 1

  // 1. 定制新中式青绿山水全景底画（未加载完成前用青绿渐变兜底，零白屏）
  if (backdropReady && backdropImg) {
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(backdropImg, 0, 0, LOGICAL_W, LOGICAL_H)
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, LOGICAL_H)
    sky.addColorStop(0, s.skyTop)
    sky.addColorStop(0.35, s.skyMid)
    sky.addColorStop(1, isWinter ? '#17342D' : '#C8DFD0')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H)
  }

  // 2. 四季动态光影色温与丁达尔天光（让同一幅千里江山图随节气实时变幻！）
  if (isWinter) {
    // 寒冬小雪：静谧黛青月色纱幕 + 远山明月光晕 + 闪烁微星
    const wGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H)
    wGrad.addColorStop(0, 'rgba(11, 34, 42, 0.62)')
    wGrad.addColorStop(0.38, 'rgba(15, 44, 50, 0.52)')
    wGrad.addColorStop(1, 'rgba(10, 30, 34, 0.60)')
    ctx.fillStyle = wGrad
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H)

    const moonHalo = ctx.createRadialGradient(640, 48, 6, 640, 48, 130)
    moonHalo.addColorStop(0, 'rgba(232, 250, 255, 0.90)')
    moonHalo.addColorStop(0.28, 'rgba(148, 224, 238, 0.34)')
    moonHalo.addColorStop(1, 'rgba(148, 224, 238, 0)')
    ctx.fillStyle = moonHalo
    ctx.beginPath()
    ctx.arc(640, 48, 130, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#F2FDFF'
    ctx.beginPath()
    ctx.arc(640, 48, 15, 0, Math.PI * 2)
    ctx.fill()

    // 冬夜微星
    for (let st = 0; st < 16; st++) {
      const sx = (st * 73 + 29) % LOGICAL_W
      const sy = 14 + ((st * 37) % 62)
      const alpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(world.t * 3 + st * 1.7))
      ctx.fillStyle = `rgba(235, 250, 255, ${alpha})`
      ctx.beginPath()
      ctx.arc(sx, sy, st % 3 === 0 ? 1.8 : 1.1, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (isAutumn) {
    // 金秋秋分：温暖琥珀鎏金夕照漫射
    const aGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H)
    aGrad.addColorStop(0, 'rgba(238, 172, 58, 0.26)')
    aGrad.addColorStop(0.45, 'rgba(218, 148, 42, 0.18)')
    aGrad.addColorStop(1, 'rgba(182, 120, 32, 0.22)')
    ctx.fillStyle = aGrad
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H)
  } else if (isSummer) {
    // 盛夏芒种：通透碧玉青翠天光
    const smGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H)
    smGrad.addColorStop(0, 'rgba(32, 156, 112, 0.10)')
    smGrad.addColorStop(1, 'rgba(16, 102, 72, 0.12)')
    ctx.fillStyle = smGrad
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H)
  }

  // 春夏秋斜射丁达尔晨光光柱（微动呼吸感）
  if (!isWinter) {
    ctx.save()
    const beamBase = isAutumn ? '255, 214, 118' : '255, 246, 206'
    for (let b = 0; b < 4; b++) {
      const bx0 = 380 + b * 145 + Math.sin(world.t * 0.45 + b) * 18
      const bg = ctx.createLinearGradient(bx0, 0, bx0 - 110, 260)
      bg.addColorStop(0, `rgba(${beamBase}, ${isAutumn ? 0.20 : 0.15})`)
      bg.addColorStop(1, `rgba(${beamBase}, 0)`)
      ctx.fillStyle = bg
      ctx.beginPath()
      ctx.moveTo(bx0 - 24, 0)
      ctx.lineTo(bx0 + 36, 0)
      ctx.lineTo(bx0 - 80, 260)
      ctx.lineTo(bx0 - 165, 260)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }

  // 狂欢模式鎏金极光天幕
  if (world.feverLeft > 0) {
    const fg = ctx.createRadialGradient(LOGICAL_W / 2, 120, 40, LOGICAL_W / 2, 260, 620)
    fg.addColorStop(0, 'rgba(250, 216, 122, 0.36)')
    fg.addColorStop(1, 'rgba(250, 216, 122, 0)')
    ctx.fillStyle = fg
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H)
  }

  // 3. 远山漂浮轻纱云霭 + 松花江流动金波
  for (let c = 0; c < 4; c++) {
    const cx = ((c * 315 + world.t * 10) % (LOGICAL_W + 260)) - 130
    const cy = 112 + (c % 2) * 18
    const cg = ctx.createRadialGradient(cx, cy, 8, cx, cy, 125)
    cg.addColorStop(0, isWinter ? 'rgba(205, 238, 245, 0.14)' : 'rgba(255, 253, 244, 0.34)')
    cg.addColorStop(1, 'rgba(255, 253, 244, 0)')
    ctx.fillStyle = cg
    ctx.beginPath()
    ctx.ellipse(cx, cy, 125, 18, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // 松花江水面实时流动金光涟漪（贴合原画江带走势）
  ctx.strokeStyle = isWinter ? 'rgba(186, 236, 244, 0.36)' : 'rgba(255, 244, 200, 0.62)'
  ctx.lineWidth = 1.4
  ctx.lineCap = 'round'
  for (let i = 0; i < 16; i++) {
    const rx = ((i * 76 + world.t * 22) % (LOGICAL_W - 140)) + 40
    // 贴合原画江带从左下略向右上弯曲的曲线
    const ry = 205 - (rx / LOGICAL_W) * 56 + Math.sin(world.t * 2.2 + i) * 3 + (i % 3) * 5
    const len = 18 + (i % 4) * 7
    ctx.beginPath()
    ctx.moveTo(rx, ry)
    ctx.lineTo(rx + len, ry - 0.8)
    ctx.stroke()
  }

  // 4. 左侧白瓷鎏金现代数字粮仓（立体阴影 + 动态蓄满发光金窗）
  const gx = 82
  const gy = 104
  // 粮仓投影
  ctx.fillStyle = 'rgba(12, 34, 26, 0.24)'
  ctx.beginPath()
  ctx.ellipse(gx + 36, gy + 64, 48, 9, 0, 0, Math.PI * 2)
  ctx.fill()

  for (let k = 0; k < 2; k++) {
    const sx = gx + k * 42
    // 白瓷圆柱体高光渐变
    const siloGrad = ctx.createLinearGradient(sx, gy, sx + 34, gy)
    siloGrad.addColorStop(0, '#DCE7E1')
    siloGrad.addColorStop(0.35, '#FBFCFB')
    siloGrad.addColorStop(0.75, '#E7EFEA')
    siloGrad.addColorStop(1, '#B9CCC2')
    ctx.fillStyle = siloGrad
    drawRoundedRect(ctx, sx, gy, 34, 62, 6)
    ctx.fill()
    ctx.strokeStyle = 'rgba(22, 62, 48, 0.28)'
    ctx.lineWidth = 1
    ctx.stroke()

    // 仓内玻璃视窗与丰收金液柱
    ctx.fillStyle = '#122E24'
    drawRoundedRect(ctx, sx + 7, gy + 11, 20, 44, 3)
    ctx.fill()
    const fillH = Math.max(4, Math.round(42 * world.granaryFill))
    const gFill = ctx.createLinearGradient(0, gy + 54 - fillH, 0, gy + 54)
    gFill.addColorStop(0, '#FFF1A8')
    gFill.addColorStop(0.45, '#EAB949')
    gFill.addColorStop(1, '#B8801C')
    ctx.fillStyle = gFill
    drawRoundedRect(ctx, sx + 8, gy + 54 - fillH, 18, fillH, 2)
    ctx.fill()

    // 鎏金穹顶檐口
    const roofGrad = ctx.createLinearGradient(sx - 2, gy - 14, sx + 36, gy + 4)
    roofGrad.addColorStop(0, '#F4D484')
    roofGrad.addColorStop(0.5, '#C8983C')
    roofGrad.addColorStop(1, '#8E651B')
    ctx.beginPath()
    ctx.moveTo(sx - 3, gy + 3)
    ctx.lineTo(sx + 17, gy - 13)
    ctx.lineTo(sx + 37, gy + 3)
    ctx.closePath()
    ctx.fillStyle = roofGrad
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 245, 210, 0.55)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
  // 粮仓磨砂铭牌
  ctx.fillStyle = 'rgba(12, 34, 26, 0.78)'
  drawRoundedRect(ctx, gx + 4, gy + 66, 68, 18, 9)
  ctx.fill()
  ctx.fillStyle = '#F5D88B'
  ctx.font = 'bold 10.5px "PingFang SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`数字粮仓 ${Math.round(world.granaryFill * 100)}%`, gx + 38, gy + 78.5)

  // 5. 右侧北斗 RTK 基准站塔（双圈金色脉冲雷达波）
  const bx = 1002
  const by = 102
  ctx.fillStyle = 'rgba(12, 34, 26, 0.22)'
  ctx.beginPath()
  ctx.ellipse(bx, by + 60, 22, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#E5C175'
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(bx, by)
  ctx.lineTo(bx - 13, by + 58)
  ctx.moveTo(bx, by)
  ctx.lineTo(bx + 13, by + 58)
  ctx.moveTo(bx - 5, by + 22)
  ctx.lineTo(bx + 5, by + 22)
  ctx.moveTo(bx - 9, by + 40)
  ctx.lineTo(bx + 9, by + 40)
  ctx.stroke()

  // 天线金球 + 双波脉冲环
  const beaconGlow = ctx.createRadialGradient(bx, by - 4, 2, bx, by - 4, 18)
  beaconGlow.addColorStop(0, 'rgba(255, 232, 150, 0.95)')
  beaconGlow.addColorStop(1, 'rgba(229, 193, 117, 0)')
  ctx.fillStyle = beaconGlow
  ctx.beginPath()
  ctx.arc(bx, by - 4, 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(bx, by - 4, 5, 0, Math.PI * 2)
  ctx.fillStyle = '#FFF3BE'
  ctx.fill()

  for (let p = 0; p < 2; p++) {
    const pulseR = 10 + (((world.t * 28) + p * 22) % 44)
    ctx.beginPath()
    ctx.arc(bx, by - 4, pulseR, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(245, 211, 131, ${Math.max(0, (1 - pulseR / 54) * 0.85)})`
    ctx.lineWidth = 1.6
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(12, 34, 26, 0.78)'
  drawRoundedRect(ctx, bx - 38, by + 64, 76, 18, 9)
  ctx.fill()
  ctx.fillStyle = '#F5D88B'
  ctx.fillText('北斗 RTK 站', bx, by + 76.5)

  // 6. 农田间清浅引水脉络（柔和水渠线，呼应江水入田）
  ctx.save()
  ctx.strokeStyle = isWinter ? 'rgba(120, 206, 224, 0.28)' : 'rgba(66, 156, 142, 0.34)'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(96, 321)
  ctx.lineTo(1024, 321)
  ctx.moveTo(96, 435)
  ctx.lineTo(1024, 435)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255, 248, 218, 0.45)'
  ctx.lineWidth = 1.2
  for (let k = 0; k < 6; k++) {
    const cx = 110 + ((k * 168 + world.t * 34) % 880)
    ctx.beginPath()
    ctx.moveTo(cx, 321)
    ctx.lineTo(cx + 22, 321)
    ctx.moveTo(LOGICAL_W - cx, 435)
    ctx.lineTo(LOGICAL_W - cx - 22, 435)
    ctx.stroke()
  }
  ctx.restore()

  // 7. 绘制 15 块高精微纹理 3D 立体黑土农田
  world.plots.forEach((p) => {
    const isHover = world.hoverPlot === p.idx && phase.value === 'playing'

    // 农田柔和投影
    ctx.fillStyle = 'rgba(10, 28, 21, 0.30)'
    drawRoundedRect(ctx, p.x + 2, p.y + 8, p.w, p.h, 16)
    ctx.fill()

    // 立体青绿夯土田埂（带日照上缘与阴影下唇）
    const bermGrad = ctx.createLinearGradient(p.x, p.y - 4, p.x, p.y + p.h + 4)
    bermGrad.addColorStop(0, isWinter ? '#406E63' : (isAutumn ? '#B8A86C' : '#96BF9E'))
    bermGrad.addColorStop(0.5, isWinter ? '#284C43' : (isAutumn ? '#8A7E4C' : '#5E8E70'))
    bermGrad.addColorStop(1, isWinter ? '#17322B' : (isAutumn ? '#5D5632' : '#355A45'))
    ctx.fillStyle = bermGrad
    drawRoundedRect(ctx, p.x - 4, p.y - 4, p.w + 8, p.h + 8, 17)
    ctx.fill()

    // 田埂顶部受光细金线 + 小型木质入水闸口
    ctx.strokeStyle = isWinter ? 'rgba(180, 232, 236, 0.32)' : 'rgba(255, 250, 226, 0.42)'
    ctx.lineWidth = 1.1
    drawRoundedRect(ctx, p.x - 3.5, p.y - 3.5, p.w + 7, p.h + 7, 16.5)
    ctx.stroke()
    ctx.fillStyle = '#533B28'
    ctx.fillRect(p.cx - 8, p.y - 4.5, 16, 4)
    ctx.fillStyle = 'rgba(120, 224, 206, 0.65)'
    ctx.fillRect(p.cx - 5, p.y - 3.5, 10, 2)

    // 肥沃微纹理黑土基底（离屏腐殖质颗粒图案 + 深度光照）
    ctx.save()
    drawRoundedRect(ctx, p.x, p.y, p.w, p.h, 13)
    ctx.clip()

    if (soilPattern) {
      ctx.fillStyle = soilPattern
      ctx.fillRect(p.x, p.y, p.w, p.h)
    }
    const soilOverlay = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h)
    soilOverlay.addColorStop(0, 'rgba(66, 51, 38, 0.45)')
    soilOverlay.addColorStop(0.55, 'rgba(36, 27, 20, 0.36)')
    soilOverlay.addColorStop(1, 'rgba(16, 12, 9, 0.62)')
    ctx.fillStyle = soilOverlay
    ctx.fillRect(p.x, p.y, p.w, p.h)

    // 立体深耕弧形垄沟（受光面 + 暗槽面）
    for (let row = 1; row <= 4; row++) {
      const ly = p.y + (p.h / 5) * row
      ctx.strokeStyle = 'rgba(8, 5, 3, 0.52)'
      ctx.lineWidth = 2.6
      ctx.beginPath()
      ctx.moveTo(p.x + 10, ly + 1.8)
      ctx.lineTo(p.x + p.w - 10, ly + 1.8)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(235, 205, 165, 0.13)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(p.x + 10, ly)
      ctx.lineTo(p.x + p.w - 10, ly)
      ctx.stroke()
    }

    // 湿润水田镜面微光反射（秧苗/生长期或刚浇水后）
    if (p.stage === 'seedling' || p.moisture > 0.92) {
      const wetGrad = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y + p.h)
      wetGrad.addColorStop(0, 'rgba(130, 224, 212, 0.14)')
      wetGrad.addColorStop(0.5, 'rgba(255, 250, 220, 0.04)')
      wetGrad.addColorStop(1, 'rgba(72, 178, 162, 0.12)')
      ctx.fillStyle = wetGrad
      ctx.fillRect(p.x, p.y, p.w, p.h)
    }

    // 梨树模式金黄交错秸秆棉被（多色层次 + 投影立体感）
    if (p.stage === 'mulched' || p.shield > 0) {
      ctx.lineCap = 'round'
      for (let k = 0; k < 11; k++) {
        const sx = p.x + 12 + k * 14
        const tilt = (k % 2 === 0 ? 10 : 6)
        ctx.strokeStyle = 'rgba(14, 10, 5, 0.38)'
        ctx.lineWidth = 3.0
        ctx.beginPath()
        ctx.moveTo(sx + 1, p.y + 15)
        ctx.lineTo(sx + tilt + 1, p.y + p.h - 13)
        ctx.stroke()

        ctx.strokeStyle = k % 2 === 0 ? 'rgba(236, 196, 104, 0.78)' : 'rgba(205, 158, 66, 0.74)'
        ctx.lineWidth = 2.2
        ctx.beginPath()
        ctx.moveTo(sx, p.y + 14)
        ctx.lineTo(sx + tilt, p.y + p.h - 14)
        ctx.stroke()
      }
      for (let r = 0; r < 3; r++) {
        const sy = p.y + 24 + r * 24
        ctx.strokeStyle = 'rgba(248, 224, 152, 0.45)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(p.x + 14, sy + (r % 2) * 3)
        ctx.lineTo(p.x + p.w - 14, sy + 5 - (r % 2) * 2)
        ctx.stroke()
      }
    }

    // 空地待播时的北斗精准网格金点
    if (p.stage === 'empty' && p.crisis === 'ready') {
      ctx.fillStyle = `rgba(245, 211, 131, ${0.42 + Math.sin(world.t * 6) * 0.25})`
      for (let rr = 0; rr < 3; rr++) {
        for (let cc = 0; cc < 6; cc++) {
          ctx.beginPath()
          ctx.arc(p.x + 22 + cc * 24, p.y + 28 + rr * 22, 1.8, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // 高精尖叶水墨植物层（秧苗 / 茂盛稻浪 / 垂穗金稻海）
    if (p.stage === 'seedling' || p.stage === 'growing' || p.stage === 'ripe') {
      const cols = 6
      const rows = 3
      for (let rr = 0; rr < rows; rr++) {
        for (let cc = 0; cc < cols; cc++) {
          const bx0 = p.x + 21 + cc * 24.5 + (rr % 2) * 3
          const by0 = p.y + 32 + rr * 23
          // 随位置传播的真实微风稻浪相位
          const windWave = Math.sin(world.t * 3.1 + bx0 * 0.022 + by0 * 0.018) * (p.stage === 'seedling' ? 2.4 : 5.4)

          // 植株根部柔影 / 浅水倒影圈
          ctx.fillStyle = p.stage === 'seedling' ? 'rgba(130, 228, 206, 0.16)' : 'rgba(8, 16, 12, 0.34)'
          ctx.beginPath()
          ctx.ellipse(bx0, by0 + 1, p.stage === 'seedling' ? 6.5 : 8.5, 2.8, 0, 0, Math.PI * 2)
          ctx.fill()

          if (p.stage === 'seedling') {
            // 嫩绿三叶尖瓣翡翠秧苗
            drawLeafBlade(ctx, bx0, by0, 11, -6 + windWave * 0.5, 2.8, '#4CC988')
            drawLeafBlade(ctx, bx0, by0, 14, windWave * 0.7, 2.6, '#7EF0AE')
            drawLeafBlade(ctx, bx0, by0, 11, 6 + windWave * 0.6, 2.8, '#5CD998')
          } else if (p.stage === 'growing') {
            // 饱满双层翡翠禾丛（深绿背叶 + 明绿前景叶）
            drawLeafBlade(ctx, bx0 - 2, by0, 16, -9 + windWave * 0.6, 3.4, '#1F7A54')
            drawLeafBlade(ctx, bx0 + 2, by0, 16, 8 + windWave * 0.7, 3.4, '#248A5E')
            drawLeafBlade(ctx, bx0 - 1, by0 + 1, 20, -4 + windWave * 0.85, 3.6, '#39B57A')
            drawLeafBlade(ctx, bx0 + 1, by0 + 1, 19, 5 + windWave * 0.95, 3.4, '#66DF9B')
          } else {
            // 成熟期沉甸甸垂穗金稻海（拱形稻秆 + 多粒饱满金穗 + 高光粒尖）
            drawLeafBlade(ctx, bx0 - 2, by0, 15, -8 + windWave * 0.5, 3.2, '#9A7824')
            drawLeafBlade(ctx, bx0 + 2, by0, 15, 7 + windWave * 0.6, 3.2, '#B98D2B')

            const tipX = bx0 + windWave + 5
            const tipY = by0 - 20
            ctx.strokeStyle = '#E5B23E'
            ctx.lineWidth = 2.0
            ctx.beginPath()
            ctx.moveTo(bx0, by0)
            ctx.quadraticCurveTo(bx0 + windWave * 0.4, by0 - 18, tipX, tipY)
            ctx.stroke()

            // 垂穗金谷粒集群
            ctx.fillStyle = '#E5A92A'
            ctx.beginPath()
            ctx.ellipse(tipX - 1.5, tipY + 0.5, 4.0, 2.2, 0.35, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#FAD364'
            ctx.beginPath()
            ctx.ellipse(tipX + 2.2, tipY + 2.5, 4.4, 2.3, 0.62, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#FFF5C4'
            ctx.beginPath()
            ctx.ellipse(tipX + 3.4, tipY + 2.2, 2.1, 1.1, 0.55, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    }

    // 生态水闸涌浪特效（裁切在当前农田内由左向右席卷！）
    world.waterWaves.forEach((ww) => {
      if (ww.x !== p.x || ww.y !== p.y) return
      const wx = p.x - 40 + ww.progress * (p.w + 90)
      const wg = ctx.createLinearGradient(wx - 48, p.y, wx + 22, p.y)
      wg.addColorStop(0, 'rgba(79, 209, 165, 0)')
      wg.addColorStop(0.55, 'rgba(79, 209, 165, 0.48)')
      wg.addColorStop(0.88, 'rgba(218, 255, 245, 0.72)')
      wg.addColorStop(1, 'rgba(218, 255, 245, 0)')
      ctx.fillStyle = wg
      ctx.fillRect(p.x, p.y, p.w, p.h)
    })

    // 操作命中闪光反馈
    if (p.flash > 0) {
      ctx.fillStyle = `rgba(255, 245, 202, ${p.flash * 0.36})`
      ctx.fillRect(p.x, p.y, p.w, p.h)
    }

    ctx.restore() // 结束地块内裁剪

    // 秸秆护盾青金光边与小盾标
    if (p.shield > 0) {
      ctx.strokeStyle = 'rgba(240, 205, 118, 0.82)'
      ctx.lineWidth = 2.0
      drawRoundedRect(ctx, p.x + 1.5, p.y + 1.5, p.w - 3, p.h - 3, 12)
      ctx.stroke()

      if (!p.crisis) {
        ctx.fillStyle = 'rgba(16, 40, 31, 0.82)'
        drawRoundedRect(ctx, p.x + p.w - 48, p.y + 6, 42, 16, 8)
        ctx.fill()
        ctx.fillStyle = '#F5D383'
        ctx.font = 'bold 9.5px "PingFang SC", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('护土盾', p.x + p.w - 27, p.y + 17)
      }
    }

    // 危机 / 农时窗口动态特效与倒计时进度条
    if (p.crisis) {
      const ratio = Math.max(0, p.crisisTimer / p.crisisMax)
      const pulseAlpha = 0.58 + Math.sin(world.t * 8 + p.idx) * 0.32
      const cfg = p.crisis === 'wind'
        ? { stroke: `rgba(245, 182, 66, ${pulseAlpha})`, badgeBg: 'rgba(182, 112, 18, 0.94)', border: '#FCE09B', label: '[1] 风沙侵蚀 · 铺秸秆' }
        : p.crisis === 'pest'
          ? { stroke: `rgba(242, 92, 84, ${pulseAlpha})`, badgeBg: 'rgba(176, 48, 36, 0.94)', border: '#FCA5A5', label: '[2] 虫害预警 · 开水闸' }
          : { stroke: `rgba(252, 214, 88, ${pulseAlpha})`, badgeBg: 'rgba(20, 74, 54, 0.94)', border: '#F6D783', label: p.stage === 'ripe' ? '[3] 金稻满穗 · 抢收!' : '[3] 精播窗口 · 派农机' }

      ctx.strokeStyle = cfg.stroke
      ctx.lineWidth = 3.2
      drawRoundedRect(ctx, p.x - 1.5, p.y - 1.5, p.w + 3, p.h + 3, 15)
      ctx.stroke()

      // 危机可视化动效
      if (p.crisis === 'wind') {
        ctx.strokeStyle = 'rgba(248, 206, 120, 0.80)'
        ctx.lineWidth = 2.0
        for (let w = 0; w < 3; w++) {
          const wy = p.y + 30 + w * 21
          const shift = Math.sin(world.t * 10 + w * 1.4) * 14
          ctx.beginPath()
          ctx.moveTo(p.x + 16 + shift, wy)
          ctx.bezierCurveTo(p.x + 56, wy - 9, p.x + 112, wy + 9, p.x + p.w - 16 + shift, wy)
          ctx.stroke()
        }
      } else if (p.crisis === 'pest') {
        // 振翅飞虫特效
        for (let b = 0; b < 6; b++) {
          const bx = p.cx + Math.cos(world.t * 5.2 + b * 1.5) * (24 + b * 4.5)
          const by = p.cy + Math.sin(world.t * 7.4 + b * 1.9) * 18
          const wing = Math.sin(world.t * 32 + b) * 3.5
          ctx.fillStyle = 'rgba(254, 215, 170, 0.78)'
          ctx.beginPath()
          ctx.ellipse(bx - 3, by - 2 + wing * 0.4, 3.2, 1.5, -0.4, 0, Math.PI * 2)
          ctx.ellipse(bx + 3, by - 2 - wing * 0.4, 3.2, 1.5, 0.4, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#EF4444'
          ctx.beginPath()
          ctx.arc(bx, by, 2.6, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (p.crisis === 'ready' && p.stage === 'ripe') {
        // 成熟金穗星芒萤火
        for (let sp = 0; sp < 5; sp++) {
          const sx = p.x + 22 + ((sp * 31 + world.t * 16) % (p.w - 44))
          const sy = p.y + 34 + Math.sin(world.t * 4 + sp * 2) * 18
          const r = 1.8 + Math.sin(world.t * 9 + sp) * 0.9
          ctx.fillStyle = '#FFF6C4'
          ctx.beginPath()
          ctx.arc(sx, sy, Math.max(0.8, r), 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // 底部精致倒计时进度条
      ctx.fillStyle = 'rgba(8, 22, 16, 0.62)'
      drawRoundedRect(ctx, p.x + 12, p.y + p.h - 11, p.w - 24, 5.5, 3)
      ctx.fill()
      ctx.fillStyle = ratio < 0.3 ? '#F87171' : '#F6D783'
      drawRoundedRect(ctx, p.x + 12, p.y + p.h - 11, (p.w - 24) * ratio, 5.5, 3)
      ctx.fill()

      // 高清磨砂行动胶囊
      ctx.fillStyle = cfg.badgeBg
      drawRoundedRect(ctx, p.x + 12, p.y + 7, p.w - 24, 22, 11)
      ctx.fill()
      ctx.strokeStyle = cfg.border
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = '#FFFDF6'
      ctx.font = 'bold 11px "PingFang SC", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(cfg.label, p.cx, p.y + 21.8)
    } else if (isHover) {
      ctx.strokeStyle = 'rgba(245, 211, 131, 0.92)'
      ctx.lineWidth = 2.4
      drawRoundedRect(ctx, p.x - 1, p.y - 1, p.w + 2, p.h + 2, 14)
      ctx.stroke()
    }
  })

  // 8. 生态稻田蟹巡田治虫动画
  world.crabs.forEach((cb) => {
    const a = Math.min(1, cb.life / 0.35)
    ctx.save()
    ctx.globalAlpha = a
    ctx.translate(cb.x, cb.y)
    // 蟹壳（朱金渐变）
    ctx.fillStyle = '#D95B38'
    ctx.beginPath()
    ctx.ellipse(0, 0, 7.5, 5.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#F5B864'
    ctx.beginPath()
    ctx.ellipse(0, -1, 4.5, 3.0, 0, 0, Math.PI * 2)
    ctx.fill()
    // 挥舞双螯
    const pinch = Math.sin(cb.phase) * 2
    ctx.strokeStyle = '#E0643C'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-5, -3); ctx.lineTo(-10, -7 + pinch)
    ctx.moveTo(5, -3); ctx.lineTo(10, -7 - pinch)
    // 小蟹脚
    ctx.lineWidth = 1.3
    for (let lg = -1; lg <= 1; lg++) {
      ctx.moveTo(-6, lg * 2.4); ctx.lineTo(-10, lg * 3.5 + pinch * 0.4)
      ctx.moveTo(6, lg * 2.4); ctx.lineTo(10, lg * 3.5 - pinch * 0.4)
    }
    ctx.stroke()
    ctx.restore()
  })

  // 9. 涟漪光环
  world.ripples.forEach((rp) => {
    ctx.beginPath()
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
    ctx.strokeStyle = rp.color
    ctx.globalAlpha = Math.max(0, rp.life / rp.maxLife)
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.globalAlpha = 1
  })

  // 10. 精细版长春造 260 马力赤红北斗无人农机 + 立体投影 + 扇形 RTK 激光网
  world.tractors.forEach((tr) => {
    ctx.save()
    ctx.translate(tr.x, tr.y)

    // 前向扇形 RTK 金碧扫描激光网
    const beam = ctx.createLinearGradient(12, 0, 74, 0)
    beam.addColorStop(0, 'rgba(246, 214, 126, 0.56)')
    beam.addColorStop(0.55, 'rgba(79, 209, 165, 0.24)')
    beam.addColorStop(1, 'rgba(246, 214, 126, 0)')
    ctx.fillStyle = beam
    ctx.beginPath()
    ctx.moveTo(14, -10)
    ctx.lineTo(74, -30)
    ctx.lineTo(74, 30)
    ctx.lineTo(14, 10)
    ctx.closePath()
    ctx.fill()

    // 地面柔影
    ctx.fillStyle = 'rgba(8, 20, 14, 0.36)'
    drawRoundedRect(ctx, -20, -14, 42, 32, 8)
    ctx.fill()

    // 四条高压花纹宽胎
    ctx.fillStyle = '#18181B'
    drawRoundedRect(ctx, -18, -18, 15, 7, 2)
    ctx.fill()
    drawRoundedRect(ctx, -18, 11, 15, 7, 2)
    ctx.fill()
    drawRoundedRect(ctx, 4, -15, 11, 6, 2)
    ctx.fill()
    drawRoundedRect(ctx, 4, 9, 11, 6, 2)
    ctx.fill()

    // 金属赤红车身机罩 + 鎏金腰线
    const hoodGrad = ctx.createLinearGradient(-18, -12, 20, 12)
    hoodGrad.addColorStop(0, '#E04436')
    hoodGrad.addColorStop(0.5, '#C22C20')
    hoodGrad.addColorStop(1, '#8F1C14')
    ctx.fillStyle = hoodGrad
    drawRoundedRect(ctx, -18, -12, 36, 24, 6)
    ctx.fill()
    ctx.fillStyle = '#F5D383'
    ctx.fillRect(0, -10, 15, 2)
    ctx.fillRect(0, 8, 15, 2)

    // 全景电控玻璃座舱 + 釉面反光
    ctx.fillStyle = '#EEF5F1'
    drawRoundedRect(ctx, -14, -9, 15, 18, 4)
    ctx.fill()
    ctx.fillStyle = '#183C30'
    drawRoundedRect(ctx, -12, -7, 11, 14, 2.5)
    ctx.fill()
    ctx.strokeStyle = 'rgba(186, 244, 232, 0.55)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(-10, -5); ctx.lineTo(-4, -5)
    ctx.stroke()

    // 顶部金色北斗 RTK 蘑菇头 + 实时定位脉冲光环
    ctx.beginPath()
    ctx.arc(-6, 0, 4.4, 0, Math.PI * 2)
    ctx.fillStyle = '#F8CF64'
    ctx.fill()
    ctx.strokeStyle = '#FFF7D4'
    ctx.lineWidth = 1.1
    ctx.stroke()

    // 双束暖白 LED 车灯
    ctx.fillStyle = '#FFF9D6'
    ctx.beginPath()
    ctx.arc(17, -6, 2.2, 0, Math.PI * 2)
    ctx.arc(17, 6, 2.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  })

  // 11. 飞掠彩蛋「查干湖金鲤」（灵动摆尾 + 半透鎏金纱鳍）
  if (world.bonusFish) {
    const bf = world.bonusFish
    const wag = Math.sin(world.t * 14) * 5
    ctx.save()
    ctx.translate(bf.x, bf.y)
    if (bf.vx < 0) ctx.scale(-1, 1)

    // 水玉金辉外环
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 40)
    glow.addColorStop(0, 'rgba(254, 224, 92, 0.78)')
    glow.addColorStop(0.55, 'rgba(79, 209, 165, 0.24)')
    glow.addColorStop(1, 'rgba(254, 224, 92, 0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(0, 0, 40, 0, Math.PI * 2)
    ctx.fill()

    // 飘逸半透纱尾鳍
    ctx.fillStyle = 'rgba(255, 232, 146, 0.85)'
    ctx.beginPath()
    ctx.moveTo(-16, 0)
    ctx.quadraticCurveTo(-28, -12 + wag, -36, -9 + wag)
    ctx.quadraticCurveTo(-28, wag * 0.4, -36, 9 + wag)
    ctx.quadraticCurveTo(-28, 12 + wag, -16, 0)
    ctx.closePath()
    ctx.fill()

    // 胸鳍
    ctx.fillStyle = 'rgba(255, 222, 122, 0.75)'
    ctx.beginPath()
    ctx.ellipse(2, 10, 7, 3.5, 0.65, 0, Math.PI * 2)
    ctx.ellipse(2, -10, 7, 3.5, -0.65, 0, Math.PI * 2)
    ctx.fill()

    // 朱金渐变锦鲤鱼身
    const koiGrad = ctx.createLinearGradient(-18, -10, 20, 10)
    koiGrad.addColorStop(0, '#F59E0B')
    koiGrad.addColorStop(0.5, '#FCD34D')
    koiGrad.addColorStop(1, '#EA580C')
    ctx.fillStyle = koiGrad
    ctx.beginPath()
    ctx.ellipse(0, 0, 21, 11.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // 背部高光与灵动黑眸
    ctx.fillStyle = 'rgba(255, 252, 225, 0.55)'
    ctx.beginPath()
    ctx.ellipse(2, -4, 11, 3.5, -0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#10241C'
    ctx.beginPath()
    ctx.arc(12, -2.5, 2.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(12.8, -3.2, 0.8, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    ctx.fillStyle = 'rgba(11, 32, 24, 0.90)'
    drawRoundedRect(ctx, bf.x - 45, bf.y - 42, 90, 20, 10)
    ctx.fill()
    ctx.strokeStyle = '#F6D783'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = '#FEF08A'
    ctx.font = 'bold 10.5px "PingFang SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('点我 · 查干金鲤!', bf.x, bf.y - 28.5)
  }

  // 12. 北斗卫星群全域扫描极光
  world.satellites.forEach((sat) => {
    const lg = ctx.createLinearGradient(sat.x - 50, sat.y, sat.x + 50, LOGICAL_H)
    lg.addColorStop(0, sat.beamColor)
    lg.addColorStop(1, 'rgba(229, 193, 117, 0)')
    ctx.fillStyle = lg
    ctx.beginPath()
    ctx.moveTo(sat.x - 10, sat.y + 8)
    ctx.lineTo(sat.x + 10, sat.y + 8)
    ctx.lineTo(sat.x + 135, LOGICAL_H)
    ctx.lineTo(sat.x - 135, LOGICAL_H)
    ctx.closePath()
    ctx.fill()

    // 双翼蓝色太阳电池板 + 金色星体
    ctx.fillStyle = '#38BDF8'
    drawRoundedRect(ctx, sat.x - 30, sat.y - 4.5, 19, 9, 2)
    ctx.fill()
    drawRoundedRect(ctx, sat.x + 11, sat.y - 4.5, 19, 9, 2)
    ctx.fill()
    ctx.fillStyle = '#F6D783'
    drawRoundedRect(ctx, sat.x - 9, sat.y - 7.5, 18, 15, 3)
    ctx.fill()
  })

  // 13. 爆裂星芒粒子
  world.particles.forEach((pt) => {
    const a = Math.max(0, Math.min(1, pt.life / pt.maxLife))
    ctx.globalAlpha = a
    ctx.fillStyle = pt.color
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1

  // 14. 四季诗意氛围粒子（春杏花瓣 / 夏萤火虫 / 秋金叶 / 冬瑞雪）
  world.weather.forEach((w) => {
    ctx.globalAlpha = w.alpha
    if (isWinter) {
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(w.x, w.y, w.size, 0, Math.PI * 2)
      ctx.fill()
    } else if (isAutumn) {
      ctx.save()
      ctx.translate(w.x, w.y)
      ctx.rotate(w.phase)
      ctx.fillStyle = '#F4C65E'
      ctx.beginPath()
      ctx.ellipse(0, 0, w.size * 1.9, w.size * 0.75, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    } else if (isSummer) {
      const glowA = w.alpha * (0.55 + 0.45 * Math.sin(w.phase * 2))
      ctx.globalAlpha = glowA
      ctx.fillStyle = '#C4FCEC'
      ctx.beginPath()
      ctx.arc(w.x, w.y, w.size * 0.95, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // 春季淡粉杏花瓣
      ctx.save()
      ctx.translate(w.x, w.y)
      ctx.rotate(w.phase * 0.8)
      ctx.fillStyle = '#FFF5EB'
      ctx.beginPath()
      ctx.ellipse(0, 0, w.size * 1.4, w.size * 0.8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  })
  ctx.globalAlpha = 1

  // 15. 弹性弹出漂浮得分与连击文字
  world.floaters.forEach((fl) => {
    const progress = 1 - fl.life / fl.maxLife
    const popScale = progress < 0.14 ? 0.72 + (progress / 0.14) * 0.38 : (progress < 0.24 ? 1.1 - ((progress - 0.14) / 0.1) * 0.1 : 1)
    const a = Math.max(0, Math.min(1, fl.life / (fl.maxLife * 0.35)))
    ctx.save()
    ctx.globalAlpha = a
    ctx.translate(fl.x, fl.y)
    ctx.scale(popScale, popScale)
    ctx.font = `bold ${fl.size}px "PingFang SC", "Microsoft YaHei", sans-serif`
    ctx.textAlign = 'center'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 5
    ctx.strokeStyle = 'rgba(7, 22, 16, 0.94)'
    ctx.strokeText(fl.text, 0, 0)
    ctx.fillStyle = fl.color
    ctx.fillText(fl.text, 0, 0)
    ctx.restore()
  })
  ctx.globalAlpha = 1
  ctx.restore()
}

// ======================== 指针与键盘控制 ========================
function getCanvasCoords(e) {
  const cv = canvasRef.value
  if (!cv) return null
  const rect = cv.getBoundingClientRect()
  return {
    x: ((e.clientX - rect.left) / rect.width) * LOGICAL_W,
    y: ((e.clientY - rect.top) / rect.height) * LOGICAL_H
  }
}

function findPlotAt(x, y) {
  for (const p of world.plots) {
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return p
  }
  return null
}

function handlePointerDown(e) {
  if (phase.value !== 'playing') return
  isPointerDown = true
  lastSwipedPlot = -1
  const pt = getCanvasCoords(e)
  if (!pt) return

  // 优先检测是否击中飞掠彩蛋「查干湖金鲤」
  if (world.bonusFish) {
    const dx = pt.x - world.bonusFish.x
    const dy = pt.y - world.bonusFish.y
    if (Math.hypot(dx, dy) <= world.bonusFish.r + 20) {
      const bx = world.bonusFish.x
      const by = world.bonusFish.y
      world.bonusFish = null
      world.score += 360 * (world.feverLeft > 0 ? 2 : 1)
      world.energy = Math.min(100, world.energy + 28)
      world.bonusCaught += 1
      world.harvestYuan += 1880
      spawnBurst(bx, by, '#FDE047', 30, true)
      addFloater(bx, by - 12, '捕获查干金鲤! +360 · 能量+28%', '#FEF08A', 19)
      world.statusHint = '太棒了！捕获生态查干湖金鲤，北斗卫星能量暴涨！'
      gameAudio.playBonus()
      syncHud()
      return
    }
  }

  const plot = findPlotAt(pt.x, pt.y)
  if (plot) {
    lastSwipedPlot = plot.idx
    applyToolToPlot(plot)
  }
}

function handlePointerMove(e) {
  const pt = getCanvasCoords(e)
  if (!pt) return
  const plot = findPlotAt(pt.x, pt.y)
  world.hoverPlot = plot ? plot.idx : -1
  if (isPointerDown && phase.value === 'playing' && plot && plot.idx !== lastSwipedPlot) {
    lastSwipedPlot = plot.idx
    applyToolToPlot(plot)
  }
}

function handlePointerUp() {
  isPointerDown = false
  lastSwipedPlot = -1
}

function onKeyDown(e) {
  if (phase.value !== 'playing' && phase.value !== 'paused') return
  if (e.key === '1') activeTool.value = 'straw'
  else if (e.key === '2') activeTool.value = 'water'
  else if (e.key === '3') activeTool.value = 'tractor'
  else if (e.code === 'Space') {
    e.preventDefault()
    triggerBeidouUltimate()
  } else if (e.key === 'p' || e.key === 'P') {
    togglePause()
  }
}

function startGame() {
  resetWorld(true)
  phase.value = 'playing'
  gameAudio.playAction(3)
}

function togglePause() {
  if (phase.value === 'playing') phase.value = 'paused'
  else if (phase.value === 'paused') phase.value = 'playing'
}

function toggleMute() {
  muted.value = !muted.value
  gameAudio.muted = muted.value
}

function syncRewardToPlatform() {
  if (syncedReward.value) return
  store.recordGameReward({
    score: hud.value.score,
    rank: `${finalRank.value.code} ${finalRank.value.title}`,
    carbonEarned: earnedCarbon.value,
    harvestYuan: hud.value.harvestYuan,
    soilHealth: hud.value.soilHealth
  })
  syncedReward.value = true
  gameAudio.playBonus()
}

// ======================== 生命周期与高分屏 Canvas 循环 ========================
function loop(ts) {
  if (!lastTs) lastTs = ts
  const dt = Math.min(0.05, (ts - lastTs) / 1000)
  lastTs = ts

  updateWorld(dt)

  const cv = canvasRef.value
  if (cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const needW = Math.round(LOGICAL_W * dpr)
    const needH = Math.round(LOGICAL_H * dpr)
    if (cv.width !== needW || cv.height !== needH) {
      cv.width = needW
      cv.height = needH
    }
    const ctx = cv.getContext('2d')
    ctx.save()
    ctx.scale(dpr, dpr)
    renderWorld(ctx)
    ctx.restore()
  }

  rafId = requestAnimationFrame(loop)
}

onMounted(() => {
  initVisualAssets()
  resetWorld(false)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('pointerup', handlePointerUp)
  rafId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  clearTimeout(flashTimer)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('pointerup', handlePointerUp)
})
</script>

<template>
  <div class="relative pt-[5.2rem] pb-16">
    <section class="max-w-[82rem] mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 顶部精炼标题带 -->
      <div class="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="eyebrow">INTERACTIVE GAME · 黑土守护者</span>
            <span class="font-mono text-[0.6875rem] px-2.5 py-0.5 rounded-full bg-white/80 border border-[#0E261D]/10 text-[#3E554B]">
              60fps 新中式互动体验 · 积分直通 App 碳账本
            </span>
          </div>
          <h1 class="font-editorial text-2xl sm:text-3xl font-bold text-[#10241C]">
            黑土守护者 · 四季丰收保卫战
          </h1>
        </div>

        <div class="flex items-center gap-2.5">
          <div v-if="bestScore > 0" class="px-3.5 py-1.5 rounded-full bg-white/85 border border-[#C89B45]/35 text-xs font-semibold text-[#7F5B17] flex items-center gap-1.5 shadow-2xs">
            <Trophy :size="14" aria-hidden="true" class="text-[#C89B45]" />
            <span>最高纪录 {{ bestScore }} 分</span>
          </div>
          <button
            type="button"
            @click="autoAssist = !autoAssist"
            class="px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer"
            :class="autoAssist
              ? 'bg-[#1F5440] text-[#E5C175] border-[#1F5440]'
              : 'bg-white/85 text-[#3E554B] border-[#0E261D]/14 hover:border-[#1F5440]/40'"
            title="开启后点击地块将自动匹配最优农艺工具；关闭时手动切键可获 +25% 策略加分"
          >
            {{ autoAssist ? '模式：轻松一键' : '模式：手动策略 (+25%分)' }}
          </button>
          <button
            type="button"
            @click="toggleMute"
            class="w-9 h-9 rounded-full bg-white/85 border border-[#0E261D]/14 flex items-center justify-center text-[#10241C] hover:border-[#C89B45] transition-colors cursor-pointer"
            :aria-label="muted ? '开启五声配乐音效' : '静音'"
          >
            <VolumeX v-if="muted" :size="16" aria-hidden="true" />
            <Volume2 v-else :size="16" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- 主游艺展台容器（深松墨玉鎏金边框） -->
      <div class="rounded-[1.65rem] overflow-hidden bg-[#0D231B] border border-[#E5C175]/28 shadow-[0_32px_72px_-32px_rgba(10,30,22,0.58)]">
        <!-- 顶部实时战况 HUD -->
        <div class="px-4 sm:px-6 py-3 bg-gradient-to-r from-[#0C2119] via-[#143529] to-[#0C2119] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-[#F2F7F4]">
          <!-- 四季与倒计时 -->
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-full bg-[#E5C175]/16 border border-[#E5C175]/35 text-[#E5C175] text-xs font-bold whitespace-nowrap">
              {{ currentSeason.name }}
            </span>
            <div class="w-28 sm:w-36">
              <div class="flex items-center justify-between font-mono text-[0.65rem] text-[#C4D6CD]">
                <span>四季进度</span>
                <span class="font-bold text-[#F7FAF8] tabular-nums">{{ hud.timeLeft.toFixed(1) }}s</span>
              </div>
              <div class="h-1.5 rounded-full bg-white/12 overflow-hidden mt-1">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-[#4FD1A5] via-[#E5C175] to-[#6CC4D4] transition-all duration-150"
                  :style="{ width: `${timeProgressPct}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 核心三指标：黑土健康 / 产值 / 总分与连击 -->
          <div class="flex flex-wrap items-center gap-4 sm:gap-6">
            <div class="flex items-center gap-2">
              <Shield :size="15" aria-hidden="true" :class="hud.soilHealth < 45 ? 'text-[#F87171]' : 'text-[#4FD1A5]'" />
              <div>
                <div class="text-[0.625rem] text-[#C4D6CD]/80 leading-none">黑土有机质</div>
                <div class="font-mono text-sm font-bold tabular-nums mt-0.5" :class="hud.soilHealth < 45 ? 'text-[#FCA5A5]' : 'text-[#86EFAC]'">
                  {{ hud.soilHealth }}%
                </div>
              </div>
            </div>

            <div>
              <div class="text-[0.625rem] text-[#C4D6CD]/80 leading-none">合作社产值</div>
              <div class="font-mono text-sm font-bold text-[#E5C175] tabular-nums mt-0.5">
                ¥{{ hud.harvestYuan.toLocaleString() }}
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <div>
                <div class="text-[0.625rem] text-[#C4D6CD]/80 leading-none">当前积分</div>
                <div class="font-mono text-base font-bold text-[#FFFDF5] tabular-nums mt-0.5">
                  {{ hud.score.toLocaleString() }}
                </div>
              </div>
              <span
                v-if="hud.combo >= 2"
                class="px-2.5 py-0.5 rounded-full bg-[#E5C175] text-[#0E261D] font-mono text-xs font-extrabold animate-bounce"
              >
                ×{{ hud.combo }}
              </span>
            </div>

            <div v-if="phase === 'playing' || phase === 'paused'" class="flex items-center gap-1.5">
              <button
                type="button"
                @click="togglePause"
                class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F2F7F4] cursor-pointer"
                :aria-label="phase === 'paused' ? '继续游戏' : '暂停游戏'"
              >
                <Play v-if="phase === 'paused'" :size="14" aria-hidden="true" />
                <Pause v-else :size="14" aria-hidden="true" />
              </button>
              <button
                type="button"
                @click="startGame"
                class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F2F7F4] cursor-pointer"
                aria-label="重新开始"
              >
                <RotateCcw :size="14" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <!-- 中央 60fps Canvas 舞台 -->
        <div class="relative w-full aspect-[1120/580] bg-[#0F281F] select-none touch-none overflow-hidden">
          <canvas
            ref="canvasRef"
            class="w-full h-full block cursor-crosshair"
            role="application"
            aria-label="黑土守护者四季保卫战交互游戏画布"
            @pointerdown="handlePointerDown"
            @pointermove="handlePointerMove"
          ></canvas>

          <!-- 实时轻提示条（游戏进行中） -->
          <div
            v-if="phase === 'playing'"
            aria-live="polite"
            class="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#0C2119]/82 border border-[#E5C175]/28 backdrop-blur-md text-xs text-[#F2F7F4] max-w-[92%] truncate shadow-lg"
          >
            <span v-if="hud.feverLeft > 0" class="text-[#FDE047] font-bold mr-2">⚡ 北斗 2× 黄金丰收狂欢 ({{ hud.feverLeft.toFixed(1) }}s)</span>
            <span>{{ hud.statusHint }}</span>
          </div>

          <!-- 开局遮罩（清晰极简 3 步玩法 + 难度选择） -->
          <div
            v-if="phase === 'intro'"
            class="absolute inset-0 bg-[#0B1E17]/74 backdrop-blur-[5px] flex items-center justify-center p-4 sm:p-6"
          >
            <div class="w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#133327]/96 to-[#0B2018]/98 border border-[#E5C175]/35 p-6 sm:p-8 text-center text-[#F2F7F4] shadow-2xl">
              <div class="flex justify-center mb-3">
                <BrandLogo :size="54" variant="gold" />
              </div>
              <div class="font-mono text-[0.6875rem] tracking-[0.22em] text-[#E5C175] mb-1.5">
                JIYUN HEYE · INTERACTIVE CHALLENGE
              </div>
              <h2 class="font-editorial text-2xl sm:text-3xl font-bold text-[#FFFDF5]">
                黑土守护者 · 四季丰收保卫战
              </h2>
              <p class="text-xs sm:text-sm text-[#D7E4DD]/90 mt-2 max-w-xl mx-auto leading-relaxed">
                在 60 秒内跨越吉林春夏秋冬四季，灵活调度三大智慧农艺与北斗卫星大招，守住黑土有机质厚度并冲刺合作社大丰收！支持鼠标/触屏<strong class="text-[#E5C175]">按住一笔连刷</strong>。
              </p>

              <div class="grid grid-cols-3 gap-2.5 mt-5 text-left">
                <div class="rounded-2xl bg-white/[0.06] border border-white/10 p-3">
                  <div class="text-xs font-bold text-[#F5D383] flex items-center gap-1.5">
                    <Shield :size="14" aria-hidden="true" /> [1] 梨树秸秆
                  </div>
                  <p class="text-[0.7rem] text-[#C4D6CD] mt-1 leading-snug">拦截春风沙与冬寒潮，提升黑土有机质</p>
                </div>
                <div class="rounded-2xl bg-white/[0.06] border border-white/10 p-3">
                  <div class="text-xs font-bold text-[#7EE0B5] flex items-center gap-1.5">
                    <Droplets :size="14" aria-hidden="true" /> [2] 稻蟹水闸
                  </div>
                  <p class="text-[0.7rem] text-[#C4D6CD] mt-1 leading-snug">引长白山雪水，零农药生态剿灭虫害</p>
                </div>
                <div class="rounded-2xl bg-white/[0.06] border border-white/10 p-3">
                  <div class="text-xs font-bold text-[#FCA5A5] flex items-center gap-1.5">
                    <Tractor :size="14" aria-hidden="true" /> [3] 北斗农机
                  </div>
                  <p class="text-[0.7rem] text-[#C4D6CD] mt-1 leading-snug">厘米级精播抢收，攒满能量放北斗大招</p>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-center gap-2.5 mt-5">
                <button
                  type="button"
                  @click="difficulty = 'standard'"
                  class="px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-colors"
                  :class="difficulty === 'standard' ? 'bg-[#E5C175]/20 border-[#E5C175] text-[#F5D383]' : 'bg-white/5 border-white/15 text-[#C4D6CD]'"
                >标准体验 · 60 秒</button>
                <button
                  type="button"
                  @click="difficulty = 'challenge'"
                  class="px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-colors"
                  :class="difficulty === 'challenge' ? 'bg-[#E5C175]/20 border-[#E5C175] text-[#F5D383]' : 'bg-white/5 border-white/15 text-[#C4D6CD]'"
                >高能挑战 · 75 秒</button>
              </div>

              <button
                type="button"
                @click="startGame"
                class="mt-6 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#E8C574] to-[#C89B45] text-[#0E261D] font-bold text-sm hover:from-[#F2D58E] hover:to-[#D8AB54] shadow-[0_14px_34px_-10px_rgba(229,193,117,0.7)] transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Play :size="16" aria-hidden="true" />
                <span>立即开始守护黑土</span>
              </button>
            </div>
          </div>

          <!-- 暂停遮罩 -->
          <div
            v-if="phase === 'paused'"
            class="absolute inset-0 bg-[#0B1E17]/72 backdrop-blur-sm flex flex-col items-center justify-center text-[#F2F7F4] gap-4"
          >
            <div class="font-editorial text-3xl font-bold text-[#E5C175]">农事已暂停</div>
            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="togglePause"
                class="px-6 py-2.5 rounded-full bg-[#E5C175] text-[#0E261D] text-sm font-bold cursor-pointer"
              >继续守护</button>
              <button
                type="button"
                @click="startGame"
                class="px-5 py-2.5 rounded-full bg-white/12 border border-white/20 text-sm font-semibold cursor-pointer"
              >重新开局</button>
            </div>
          </div>

          <!-- 结算鎏金勋章面板 -->
          <div
            v-if="phase === 'gameover'"
            class="absolute inset-0 bg-[#0A1D16]/82 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div class="w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#15392C] to-[#0B2018] border border-[#E5C175]/45 p-6 sm:p-7 text-center text-[#F2F7F4] shadow-2xl">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5C175]/16 border border-[#E5C175]/35 text-[#E5C175] font-mono text-[0.6875rem] tracking-widest mb-3">
                <Award :size="14" aria-hidden="true" /> 四季农事考核结算
              </div>

              <div class="flex items-center justify-center gap-4">
                <div
                  class="w-16 h-16 rounded-2xl bg-[#E5C175]/18 border-2 border-[#E5C175] flex items-center justify-center font-editorial text-3xl font-extrabold"
                  :style="{ color: finalRank.color }"
                >
                  {{ finalRank.code }}
                </div>
                <div class="text-left">
                  <div class="font-editorial text-2xl font-bold text-[#FFFDF5]">{{ finalRank.title }}</div>
                  <p class="text-xs text-[#D7E4DD]/85 mt-1 max-w-xs">{{ finalRank.desc }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
                <div class="rounded-xl bg-white/[0.06] border border-white/10 p-3">
                  <div class="text-[0.65rem] text-[#C4D6CD]">综合积分</div>
                  <div class="font-mono text-lg font-bold text-[#FFFDF5] mt-0.5">{{ hud.score.toLocaleString() }}</div>
                </div>
                <div class="rounded-xl bg-white/[0.06] border border-white/10 p-3">
                  <div class="text-[0.65rem] text-[#C4D6CD]">合作社产值</div>
                  <div class="font-mono text-lg font-bold text-[#E5C175] mt-0.5">¥{{ hud.harvestYuan.toLocaleString() }}</div>
                </div>
                <div class="rounded-xl bg-white/[0.06] border border-white/10 p-3">
                  <div class="text-[0.65rem] text-[#C4D6CD]">黑土有机质</div>
                  <div class="font-mono text-lg font-bold text-[#7EE0B5] mt-0.5">{{ hud.soilHealth }}%</div>
                </div>
                <div class="rounded-xl bg-white/[0.06] border border-white/10 p-3">
                  <div class="text-[0.65rem] text-[#C4D6CD]">最高连击</div>
                  <div class="font-mono text-lg font-bold text-[#FDE047] mt-0.5">×{{ hud.maxCombo }}</div>
                </div>
              </div>

              <div class="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  @click="syncRewardToPlatform"
                  :disabled="syncedReward"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer disabled:cursor-default"
                  :class="syncedReward
                    ? 'bg-[#1F5440] text-[#86EFAC] border border-[#4ADE80]/40'
                    : 'bg-[#E5C175] text-[#0E261D] hover:bg-[#F1D58E] shadow-lg'"
                >
                  <CheckCircle2 v-if="syncedReward" :size="15" aria-hidden="true" />
                  <Sparkles v-else :size="15" aria-hidden="true" />
                  <span>{{ syncedReward ? `已同步 +${earnedCarbon} 碳积分至 App 与后台！` : `领取 +${earnedCarbon} 碳积分并同步至 App 账本` }}</span>
                </button>

                <button
                  type="button"
                  @click="startGame"
                  class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/12 border border-white/20 text-xs font-semibold text-[#F2F7F4] hover:bg-white/20 cursor-pointer"
                >
                  <RotateCcw :size="14" aria-hidden="true" />
                  <span>再战一季</span>
                </button>

                <RouterLink
                  v-if="syncedReward"
                  to="/split"
                  class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#E5C175]/45 text-xs font-semibold text-[#E5C175] hover:bg-[#E5C175]/12"
                >
                  <Smartphone :size="14" aria-hidden="true" />
                  <span>去双端同屏台看同步记录</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部四大农艺技能操作台 -->
        <div class="p-3.5 sm:p-4 bg-[#0B1E17] border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <button
            v-for="tool in TOOLS"
            :key="tool.id"
            type="button"
            @click="activeTool = tool.id"
            class="relative group text-left rounded-2xl p-3 sm:p-3.5 border transition-all duration-200 cursor-pointer bg-gradient-to-br"
            :class="[
              tool.bg,
              activeTool === tool.id
                ? 'border-[#E5C175] ring-2 ring-[#E5C175]/40 -translate-y-0.5 shadow-lg'
                : 'border-white/10 hover:border-white/28 opacity-85 hover:opacity-100',
              flashToolId === tool.id ? 'animate-pulse ring-2 ring-[#FDE047]' : ''
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FFFDF5]">
                <Shield v-if="tool.id === 'straw'" :size="15" aria-hidden="true" :style="{ color: tool.color }" />
                <Droplets v-else-if="tool.id === 'water'" :size="15" aria-hidden="true" :style="{ color: tool.color }" />
                <Tractor v-else :size="15" aria-hidden="true" :style="{ color: tool.color }" />
                <span>{{ tool.name }}</span>
              </span>
              <kbd class="px-1.5 py-0.5 rounded-md bg-white/12 font-mono text-[0.65rem] font-bold text-[#E5C175]">
                {{ tool.key }}
              </kbd>
            </div>
            <div class="flex items-center justify-between mt-1.5">
              <span class="text-[0.7rem] text-[#D7E4DD]/85">{{ tool.short }}</span>
              <span
                class="text-[0.625rem] font-semibold px-2 py-0.5 rounded-full"
                :style="{ backgroundColor: tool.color + '24', color: '#F7FAF8' }"
              >{{ tool.badge }}</span>
            </div>
          </button>

          <!-- 第 4 槽：北斗全域大招能量按钮 -->
          <button
            type="button"
            @click="triggerBeidouUltimate"
            :disabled="hud.energy < 100 || phase !== 'playing'"
            class="relative overflow-hidden text-left rounded-2xl p-3 sm:p-3.5 border transition-all duration-250"
            :class="hud.energy >= 100 && phase === 'playing'
              ? 'bg-gradient-to-br from-[#D8A646] via-[#C89B45] to-[#9E7020] border-[#FFF2C2] text-[#0E261D] shadow-[0_0_26px_rgba(229,193,117,0.6)] cursor-pointer animate-pulse'
              : 'bg-[#122D23] border-white/10 text-[#C4D6CD] cursor-not-allowed'"
          >
            <div class="flex items-center justify-between gap-2 relative z-10">
              <span class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold">
                <Satellite :size="15" aria-hidden="true" />
                <span>北斗全域极光</span>
              </span>
              <kbd
                class="px-1.5 py-0.5 rounded-md font-mono text-[0.625rem] font-bold"
                :class="hud.energy >= 100 ? 'bg-[#0E261D]/20 text-[#0E261D]' : 'bg-white/10 text-[#E5C175]'"
              >Space</kbd>
            </div>
            <div class="mt-2 relative z-10">
              <div class="flex items-center justify-between text-[0.68rem] font-semibold mb-1">
                <span>{{ hud.energy >= 100 ? '能量已满 · 点击释放大招!' : '连击蓄能 · 全图清灾+2×分' }}</span>
                <span class="font-mono">{{ hud.energy }}%</span>
              </div>
              <div class="h-1.5 rounded-full overflow-hidden" :class="hud.energy >= 100 ? 'bg-[#0E261D]/25' : 'bg-white/12'">
                <div
                  class="h-full rounded-full transition-all duration-200"
                  :class="hud.energy >= 100 ? 'bg-[#0E261D]' : 'bg-gradient-to-r from-[#4FD1A5] to-[#F5D383]'"
                  :style="{ width: `${hud.energy}%` }"
                ></div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <NeoDivider label="PLAY & LEARN · 玩中学农艺" class="mt-12 mb-8" />

      <!-- 玩中学：三大农艺知识点直通对应 3D 展厅 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <RouterLink
          to="/strata-3d"
          class="group card-linen p-6 lift relative overflow-hidden"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center gap-1.5 text-xs font-bold text-[#7F5B17]">
              <Shield :size="15" aria-hidden="true" class="text-[#C89B45]" /> 梨树模式 · 秸秆覆盖
            </span>
            <ArrowUpRight :size="15" aria-hidden="true" class="text-[#C89B45] arrow-shift" />
          </div>
          <h3 class="font-editorial text-lg font-bold text-[#10241C] group-hover:text-[#1F5440]">为什么铺秸秆能守住黑土？</h3>
          <p class="text-xs leading-[1.85] text-[#3E554B] mt-2">
            秋季收割后保留秸秆覆盖地表，可减少春季风蚀水蚀达 70% 以上，并持续为黑土腐殖质层补充有机养分。进入 3D 地质标本馆查看一米剖面实景。
          </p>
        </RouterLink>

        <RouterLink
          to="/machinery-3d"
          class="group card-linen p-6 lift relative overflow-hidden"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F5440]">
              <Zap :size="15" aria-hidden="true" class="text-[#C89B45]" /> 北斗 RTK · 2.5cm 精度
            </span>
            <ArrowUpRight :size="15" aria-hidden="true" class="text-[#C89B45] arrow-shift" />
          </div>
          <h3 class="font-editorial text-lg font-bold text-[#10241C] group-hover:text-[#1F5440]">长春造 260 马力农机如何无人巡耕？</h3>
          <p class="text-xs leading-[1.85] text-[#3E554B] mt-2">
            依靠田边地面基准站与北斗双频卫星实时差分纠偏，拖拉机作业交接行误差小于 2.5 厘米，大幅降低重播漏播与燃油损耗。进入 3D 农机解构馆拆解核心部件。
          </p>
        </RouterLink>

        <RouterLink
          to="/science"
          class="group card-linen p-6 lift relative overflow-hidden"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F5440]">
              <Layers :size="15" aria-hidden="true" class="text-[#C89B45]" /> 生态闭环 · 稻蟹共生
            </span>
            <ArrowUpRight :size="15" aria-hidden="true" class="text-[#C89B45] arrow-shift" />
          </div>
          <h3 class="font-editorial text-lg font-bold text-[#10241C] group-hover:text-[#1F5440]">稻蟹共生怎样做到全程零农药？</h3>
          <p class="text-xs leading-[1.85] text-[#3E554B] mt-2">
            河蟹在浅水稻田中捕食害虫与杂草、排泄物天然肥田，形成绿色生态循环，让吉林粳稻品质与合作社亩均收益双提升。进入互动科普实验室动手做实验。
          </p>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
