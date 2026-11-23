<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import {
  LayoutDashboard, Columns2, Smartphone, Zap, Radio,
  TrendingUp, Users, Leaf, ShieldCheck, Activity
} from 'lucide-vue-next'
import echarts from '../lib/echarts.js'
import { useRuralPlatformStore } from '../stores/ruralPlatformStore'
import BrandLogo from '../components/BrandLogo.vue'

const store = useRuralPlatformStore()

/* ---------------- 实时电子时钟 ---------------- */
const nowText = ref('')
let clockTimer = 0
function updateClock() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  nowText.value = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}  ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/* ---------------- 中央 60fps 物流飞线与北斗孪生态势 Canvas ---------------- */
const mapCanvasRef = ref(null)
let rafId = 0
let startT = performance.now()
let pulseShockwaves = []

function triggerPulseArc() {
  const ord = store.simulateOrderFromAdmin()
  if (ord) {
    pulseShockwaves.push({ t0: (performance.now() - startT) * 0.001, label: `+¥${ord.total} ${ord.items[0]?.name}` })
  }
}

const originNodes = [
  { name: '查干湖冬捕', x: 0.22, y: 0.28, color: '#38BDF8' },
  { name: '九台核心稻区', x: 0.50, y: 0.48, color: '#4ADE80' },
  { name: '梨树黑土带', x: 0.28, y: 0.76, color: '#F0C275' },
  { name: '长白山林海', x: 0.80, y: 0.44, color: '#FB7185' }
]

const hubTargets = [
  { name: '京津冀冷链枢纽', x: 0.08, y: 0.88 },
  { name: '长三角直采仓', x: 0.90, y: 0.86 },
  { name: '大湾区前置仓', x: 0.86, y: 0.14 }
]

function drawTwinMap(now) {
  rafId = requestAnimationFrame(drawTwinMap)
  const canvas = mapCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = Math.max(1, Math.round(rect.width * dpr))
  const h = Math.max(1, Math.round(rect.height * dpr))
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }

  const t = (now - startT) * 0.001
  ctx.clearRect(0, 0, w, h)

  // 1. 细腻经纬遥感网格
  ctx.strokeStyle = 'rgba(240, 194, 117, 0.06)'
  ctx.lineWidth = 1 * dpr
  const g = 42 * dpr
  for (let x = 0; x < w; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
  for (let y = 0; y < h; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }

  // 2. 助农冷链飞线弧光（从吉林四大产区发往全国冷链枢纽）
  const routes = [
    [originNodes[1], hubTargets[0], '#F0C275', 0],
    [originNodes[0], hubTargets[1], '#38BDF8', 0.33],
    [originNodes[2], hubTargets[0], '#4ADE80', 0.62],
    [originNodes[3], hubTargets[2], '#FB7185', 0.18],
    [originNodes[1], hubTargets[1], '#F5D393', 0.5]
  ]

  routes.forEach(([from, to, color, offset]) => {
    const x1 = from.x * w, y1 = from.y * h
    const x2 = to.x * w, y2 = to.y * h
    const cx = (x1 + x2) * 0.5
    const cy = Math.min(y1, y2) - h * 0.16

    // 静态微弱航线
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.quadraticCurveTo(cx, cy, x2, y2)
    ctx.strokeStyle = color + '38'
    ctx.lineWidth = 1.4 * dpr
    ctx.stroke()

    // 飞行流光粒子
    const prog = (t * 0.28 + offset) % 1
    const u = 1 - prog
    const px = u * u * x1 + 2 * u * prog * cx + prog * prog * x2
    const py = u * u * y1 + 2 * u * prog * cy + prog * prog * y2

    const glow = ctx.createRadialGradient(px, py, 0, px, py, 10 * dpr)
    glow.addColorStop(0, color)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(px, py, 10 * dpr, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(px, py, 2.4 * dpr, 0, Math.PI * 2)
    ctx.fill()
  })

  // 3. 产区脉冲节点
  originNodes.forEach((n, idx) => {
    const nx = n.x * w, ny = n.y * h
    const pr = (12 + ((t * 18 + idx * 6) % 16)) * dpr
    const pa = Math.max(0, 1 - (pr / (28 * dpr))) * 0.65
    ctx.beginPath()
    ctx.arc(nx, ny, pr, 0, Math.PI * 2)
    ctx.strokeStyle = n.color + Math.round(pa * 255).toString(16).padStart(2, '0')
    ctx.lineWidth = 1.5 * dpr
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(nx, ny, 5 * dpr, 0, Math.PI * 2)
    ctx.fillStyle = n.color
    ctx.fill()
    ctx.strokeStyle = '#0B1511'
    ctx.lineWidth = 1.5 * dpr
    ctx.stroke()

    ctx.fillStyle = 'rgba(11, 21, 17, 0.82)'
    ctx.fillRect(nx + 8 * dpr, ny - 10 * dpr, 78 * dpr, 19 * dpr)
    ctx.strokeStyle = n.color + '88'
    ctx.strokeRect(nx + 8 * dpr, ny - 10 * dpr, 78 * dpr, 19 * dpr)
    ctx.fillStyle = '#F7F4EE'
    ctx.font = `700 ${10 * dpr}px sans-serif`
    ctx.fillText(n.name, nx + 13 * dpr, ny + 3 * dpr)
  })

  // 4. 枢纽终点标记
  hubTargets.forEach((hb) => {
    const hx = hb.x * w, hy = hb.y * h
    ctx.fillStyle = '#F0C275'
    ctx.beginPath()
    ctx.arc(hx, hy, 3.2 * dpr, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(245, 211, 147, 0.85)'
    ctx.font = `600 ${9.5 * dpr}px sans-serif`
    ctx.fillText(hb.name, hx - (hb.x > 0.5 ? 64 : -8) * dpr, hy + 4 * dpr)
  })

  // 5. 新订单爆发冲击波提示
  pulseShockwaves = pulseShockwaves.filter((s) => t - s.t0 < 2.2)
  pulseShockwaves.forEach((s) => {
    const age = t - s.t0
    const nx = originNodes[1].x * w
    const ny = originNodes[1].y * h
    ctx.beginPath()
    ctx.arc(nx, ny, (10 + age * 42) * dpr, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(240, 194, 117, ${Math.max(0, 1 - age / 2.2)})`
    ctx.lineWidth = 2.5 * dpr
    ctx.stroke()
    ctx.fillStyle = `rgba(245, 211, 147, ${Math.max(0, 1 - age / 2.2)})`
    ctx.font = `700 ${12 * dpr}px ui-monospace, monospace`
    ctx.fillText(s.label, nx - 45 * dpr, ny - (18 + age * 26) * dpr)
  })
}

/* ---------------- 左右两侧暗夜流金 ECharts ---------------- */
const trendEl = ref(null)
const donutEl = ref(null)
let trendChart = null
let donutChart = null
let ro = null

function renderCharts() {
  if (trendChart) {
    trendChart.setOption({
      grid: { left: 46, right: 14, top: 20, bottom: 24 },
      tooltip: { trigger: 'axis', backgroundColor: '#12231C', borderColor: '#C88A32', textStyle: { color: '#F7F4EE', fontSize: 11 } },
      xAxis: {
        type: 'category',
        data: store.revenueTrend.map((d) => d.date),
        axisLine: { lineStyle: { color: 'rgba(247,244,238,0.16)' } },
        axisLabel: { color: '#9CA8A1', fontSize: 10, fontFamily: 'ui-monospace, monospace' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(247,244,238,0.06)' } },
        axisLabel: { color: '#9CA8A1', fontSize: 10, fontFamily: 'ui-monospace, monospace' }
      },
      series: [{
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: store.revenueTrend.map((d) => d.gmv),
        lineStyle: { color: '#F0C275', width: 2.5 },
        itemStyle: { color: '#F0C275', borderColor: '#0B1511', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(240,194,117,0.34)' },
              { offset: 1, color: 'rgba(240,194,117,0.01)' }
            ]
          }
        }
      }]
    }, true)
  }

  if (donutChart) {
    const colors = ['#4ADE80', '#F0C275', '#38BDF8', '#FB7185', '#A78BFA', '#34D399', '#F59E0B', '#60A5FA']
    const shareMap = new Map(store.categoryShare.map((c) => [c.name, c.value]))
    donutChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}：{c}%', backgroundColor: '#12231C', borderColor: '#C88A32', textStyle: { color: '#F7F4EE', fontSize: 11 } },
      legend: {
        orient: 'vertical',
        right: 2,
        top: 'middle',
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 5,
        textStyle: { color: '#D7E4DD', fontSize: 10.5, fontFamily: 'ui-monospace, "PingFang SC", sans-serif' },
        formatter: (name) => `${name} ${shareMap.get(name) ?? 0}%`
      },
      series: [{
        type: 'pie',
        radius: ['46%', '72%'],
        center: ['31%', '50%'],
        itemStyle: { borderColor: '#0E1C16', borderWidth: 2, borderRadius: 5 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          label: { show: true, formatter: '{b}\n{c}%', color: '#F5D393', fontSize: 11, fontWeight: 'bold' }
        },
        data: store.categoryShare.map((c, idx) => ({
          name: c.name,
          value: c.value,
          itemStyle: { color: colors[idx % colors.length] }
        }))
      }]
    }, true)
  }
}

onMounted(async () => {
  updateClock()
  clockTimer = window.setInterval(updateClock, 1000)
  rafId = requestAnimationFrame(drawTwinMap)
  await nextTick()
  if (trendEl.value) trendChart = echarts.init(trendEl.value)
  if (donutEl.value) donutChart = echarts.init(donutEl.value)
  renderCharts()
  ro = new ResizeObserver(() => { trendChart?.resize(); donutChart?.resize() })
  if (trendEl.value) ro.observe(trendEl.value)
  if (donutEl.value) ro.observe(donutEl.value)
})

watch(() => [store.revenueTrend, store.categoryShare], renderCharts, { deep: true })

onUnmounted(() => {
  clearInterval(clockTimer)
  cancelAnimationFrame(rafId)
  ro?.disconnect()
  trendChart?.dispose()
  donutChart?.dispose()
})
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-[#0A1410] text-[#F7F4EE] flex flex-col">
    <!-- 顶部鎏金指挥标题栏 -->
    <header class="shrink-0 h-14 px-5 bg-gradient-to-r from-[#0F2019] via-[#152D23] to-[#0F2019] border-b border-[#F0C275]/22 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <BrandLogo :size="34" variant="gold" />
        <div>
          <h1 class="font-editorial text-[17px] font-bold tracking-wider text-[#F5D393]">吉韵禾野 · 吉林黑土乡村振兴数智指挥大屏</h1>
          <div class="font-mono text-[9.5px] tracking-[0.22em] text-[#86EFAC]/75">RURAL REVITALIZATION DIGITAL TWIN COMMAND CENTER</div>
        </div>
      </div>

      <div class="hidden xl:flex items-center gap-3 font-mono text-xs text-[#F5D393]">
        <span class="px-2.5 py-1 rounded-full bg-[#4ADE80]/15 text-[#86EFAC] border border-[#4ADE80]/25 text-[10.5px] flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse"></span>
          <span>{{ store.appConfig.solarTerm }}</span>
        </span>
        <span>{{ nowText }}</span>
      </div>

      <div class="flex items-center gap-2 text-xs shrink-0">
        <button
          type="button"
          @click="triggerPulseArc"
          class="px-3 py-1.5 rounded-full bg-[#C88A32] text-[#0B1511] font-bold flex items-center gap-1 cursor-pointer hover:bg-[#F0C275] transition-colors"
        >
          <Zap :size="13" />
          <span>现场模拟下单</span>
        </button>
        <RouterLink to="/admin" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 flex items-center gap-1">
          <LayoutDashboard :size="13" />
          <span>管理后台</span>
        </RouterLink>
        <RouterLink to="/split" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 flex items-center gap-1">
          <Columns2 :size="13" />
          <span>双端同屏</span>
        </RouterLink>
        <RouterLink to="/" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 flex items-center gap-1">
          <Smartphone :size="13" />
          <span>App</span>
        </RouterLink>
      </div>
    </header>

    <!-- 三栏全屏指挥矩阵 -->
    <div class="flex-1 min-h-0 p-4 grid grid-cols-12 gap-4 overflow-hidden">
      <!-- 左栏：核心 KPI + 成交趋势 + 项目进度 -->
      <div class="col-span-12 lg:col-span-3 flex flex-col gap-3.5 min-h-0">
        <div class="grid grid-cols-2 gap-2.5 shrink-0">
          <div class="rounded-2xl bg-[#102019] border border-[#F0C275]/22 p-3">
            <div class="text-[10px] text-white/60 flex items-center gap-1"><TrendingUp :size="11" class="text-[#F0C275]" /><span>累计助农 GMV</span></div>
            <div class="font-mono text-lg font-bold text-[#F5D393] mt-1">¥{{ store.totalGMV.toLocaleString() }}</div>
          </div>
          <div class="rounded-2xl bg-[#102019] border border-[#4ADE80]/20 p-3">
            <div class="text-[10px] text-white/60 flex items-center gap-1"><Users :size="11" class="text-[#4ADE80]" /><span>带动增收农户</span></div>
            <div class="font-mono text-lg font-bold text-[#86EFAC] mt-1">{{ store.totalHelpedHouseholds }} 户</div>
          </div>
          <div class="rounded-2xl bg-[#102019] border border-white/10 p-3">
            <div class="text-[10px] text-white/60 flex items-center gap-1"><Leaf :size="11" class="text-[#38BDF8]" /><span>黑土有机质均值</span></div>
            <div class="font-mono text-lg font-bold text-[#7DD3FC] mt-1">4.82%</div>
          </div>
          <div class="rounded-2xl bg-[#102019] border border-white/10 p-3">
            <div class="text-[10px] text-white/60 flex items-center gap-1"><ShieldCheck :size="11" class="text-[#F0C275]" /><span>在线智能农机</span></div>
            <div class="font-mono text-lg font-bold text-white mt-1">{{ store.machinery.filter((m) => m.status === '作业中').length }} / {{ store.machinery.length }} 台</div>
          </div>
        </div>

        <div class="rounded-2xl bg-[#102019] border border-white/10 p-3.5 flex flex-col flex-1 min-h-0">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-[#F5D393]">近七日助农成交趋势</span>
            <span class="font-mono text-[9.5px] text-white/50">LIVE GMV</span>
          </div>
          <div ref="trendEl" class="flex-1 min-h-[140px] w-full"></div>
        </div>

        <div class="rounded-2xl bg-[#102019] border border-white/10 p-3.5 space-y-2.5 shrink-0">
          <div class="text-xs font-bold text-[#F5D393]">重点振兴工程进度</div>
          <div v-for="prj in store.projects.slice(0, 3)" :key="prj.id" class="space-y-1">
            <div class="flex justify-between text-[11px]">
              <span class="truncate text-white/85 pr-2">{{ prj.name }}</span>
              <span class="font-mono font-bold text-[#86EFAC]">{{ prj.progress }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-[#4ADE80] to-[#F0C275]" :style="{ width: `${prj.progress}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中栏：青绿山水夜视飞线态势图 + 四路慢直播监控矩阵 -->
      <div class="col-span-12 lg:col-span-6 flex flex-col gap-3.5 min-h-0">
        <div
          class="flex-1 min-h-0 rounded-[1.5rem] border border-[#F0C275]/28 relative overflow-hidden shadow-2xl"
          style="background-image: linear-gradient(180deg, rgba(10,20,16,0.68), rgba(10,20,16,0.58)), url('/art-custom/jilin-origin-map.jpg'); background-size: cover; background-position: center;"
        >
          <div class="absolute top-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            <span class="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#F0C275]/35 text-[#F5D393] font-mono text-[10.5px] font-bold">
              松辽黑土产销冷链飞线 · 实时数字孪生态势
            </span>
            <span class="font-mono text-[10px] text-[#86EFAC] bg-black/55 px-2.5 py-1 rounded-full">43.88°N · 125.32°E</span>
          </div>
          <canvas ref="mapCanvasRef" class="w-full h-full block"></canvas>
        </div>

        <!-- 底部 4 路慢直播实景监控墙 -->
        <div class="shrink-0 grid grid-cols-4 gap-2.5 h-[138px]">
          <div
            v-for="cam in store.liveCams"
            :key="cam.id"
            class="relative rounded-2xl overflow-hidden border border-white/14 group"
          >
            <img :src="cam.image" :alt="cam.shortTitle" class="w-full h-full object-cover opacity-85" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent"></div>
            <span class="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#B83828]/90 text-white font-mono text-[8.5px] font-bold flex items-center gap-1">
              <Radio :size="8.5" />
              <span>{{ cam.status }}</span>
            </span>
            <div class="absolute bottom-2 left-2.5 right-2.5">
              <div class="text-[11px] font-bold truncate">{{ cam.shortTitle }}</div>
              <div class="font-mono text-[9.5px] text-[#F0C275]">{{ cam.temp }} · {{ cam.viewers }} 在看</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右栏：品类占比环形图 + 实时双端事件流 -->
      <div class="col-span-12 lg:col-span-3 flex flex-col gap-3.5 min-h-0">
        <div class="rounded-2xl bg-[#102019] border border-white/10 p-3.5 flex flex-col h-[240px] shrink-0">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-[#F5D393]">地标品类销量结构</span>
            <span class="font-mono text-[9.5px] text-[#86EFAC]">SUM = 100%</span>
          </div>
          <div ref="donutEl" class="flex-1 w-full"></div>
        </div>

        <div class="rounded-2xl bg-[#102019] border border-white/10 p-3.5 flex-1 min-h-0 flex flex-col">
          <div class="flex items-center justify-between mb-2.5 shrink-0">
            <span class="text-xs font-bold text-[#F5D393] flex items-center gap-1.5">
              <Activity :size="13" class="text-[#4ADE80]" />
              <span>双端实时业务动态流</span>
            </span>
            <span class="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></span>
          </div>
          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            <div
              v-for="lg in store.activityLogs"
              :key="lg.id"
              class="p-2.5 rounded-xl bg-white/5 border border-white/8 space-y-0.5"
            >
              <div class="flex items-center justify-between text-[9.5px]">
                <span class="font-bold" :class="lg.source === 'App 端' ? 'text-[#F0C275]' : 'text-[#86EFAC]'">{{ lg.source }}</span>
                <span class="font-mono text-white/45">{{ lg.time }}</span>
              </div>
              <div class="text-[11.5px] font-bold text-white">{{ lg.action }}</div>
              <div class="text-[10px] text-white/65 leading-snug">{{ lg.detail }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
