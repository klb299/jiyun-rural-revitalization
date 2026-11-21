<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Radio, Tractor, Compass, Wifi, Cpu, Zap, ShieldCheck } from 'lucide-vue-next'
import { useRuralPlatformStore } from '../../stores/ruralPlatformStore'

const store = useRuralPlatformStore()
const canvasRef = ref(null)
const selectedUnitId = ref('mac-1')
const latencyMs = ref(14)

const selectedUnit = computed(() =>
  store.machinery.find((m) => m.id === selectedUnitId.value) || store.machinery[0]
)

let rafId = 0
let pingTimer = 0
let startT = performance.now()

function drawRadar(now) {
  rafId = requestAnimationFrame(drawRadar)
  const canvas = canvasRef.value
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

  // 1. 深松墨科技雷达底图
  ctx.fillStyle = '#0E1C16'
  ctx.fillRect(0, 0, w, h)

  // 2. 经纬农田格网
  ctx.strokeStyle = 'rgba(134, 239, 172, 0.08)'
  ctx.lineWidth = 1 * dpr
  const step = 36 * dpr
  for (let x = 0; x < w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  // 3. 中心雷达同心圆 + 旋转扫描扇面
  const cx = w * 0.5
  const cy = h * 0.5
  const maxR = Math.min(w, h) * 0.44
  ;[0.35, 0.68, 1].forEach((f) => {
    ctx.beginPath()
    ctx.arc(cx, cy, maxR * f, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.16)'
    ctx.stroke()
  })

  const sweepAngle = t * 0.85
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(sweepAngle)
  const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR)
  sweepGrad.addColorStop(0, 'rgba(74, 222, 128, 0.24)')
  sweepGrad.addColorStop(1, 'rgba(74, 222, 128, 0.01)')
  ctx.fillStyle = sweepGrad
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.arc(0, 0, maxR, -0.45, 0)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(134, 239, 172, 0.7)'
  ctx.lineWidth = 1.5 * dpr
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(maxR, 0); ctx.stroke()
  ctx.restore()

  // 4. 三块示范黑土地块轮廓（九台 / 梨树 / 查干湖）
  const fieldRects = [
    { x: w * 0.12, y: h * 0.18, rw: w * 0.28, rh: h * 0.26, label: 'JT-A01 九台稻区', color: '#4ADE80' },
    { x: w * 0.58, y: h * 0.16, rw: w * 0.28, rh: h * 0.24, label: 'LS-B03 梨树免耕田', color: '#F0C275' },
    { x: w * 0.20, y: h * 0.58, rw: w * 0.30, rh: h * 0.26, label: 'CG-C02 查干湖湿地', color: '#38BDF8' }
  ]
  fieldRects.forEach((f) => {
    ctx.fillStyle = 'rgba(31, 78, 61, 0.26)'
    ctx.strokeStyle = f.color + '55'
    ctx.lineWidth = 1.2 * dpr
    ctx.fillRect(f.x, f.y, f.rw, f.rh)
    ctx.strokeRect(f.x, f.y, f.rw, f.rh)
    ctx.fillStyle = f.color
    ctx.font = `600 ${10 * dpr}px ui-monospace, monospace`
    ctx.fillText(f.label, f.x + 8 * dpr, f.y + 16 * dpr)
  })

  // 5. 实时移动的北斗农机与无人机轨迹
  store.machinery.forEach((m, idx) => {
    const isWorking = m.status === '作业中'
    const isSelected = m.id === selectedUnitId.value
    let px, py
    if (idx === 0) {
      // 九台地块往复深松轨迹
      const prog = isWorking ? (t * 0.16) % 1 : 0.35
      px = w * (0.15 + prog * 0.22)
      py = h * (0.28 + Math.sin(prog * Math.PI * 4) * 0.05)
    } else if (idx === 1) {
      // 梨树地块条带归行
      const prog = isWorking ? (t * 0.13 + 0.4) % 1 : 0.5
      px = w * (0.61 + prog * 0.22)
      py = h * (0.26 + Math.cos(prog * Math.PI * 3) * 0.04)
    } else if (idx === 2) {
      // 多光谱无人机 8 字巡航
      const a = isWorking ? t * 0.55 : 0.6
      px = w * 0.5 + Math.sin(a) * w * 0.26
      py = h * 0.52 + Math.sin(a * 2) * h * 0.18
    } else {
      px = w * 0.72
      py = h * 0.72
    }

    // 脉冲光环
    if (isWorking || isSelected) {
      const pr = (10 + Math.sin(t * 4 + idx) * 4) * dpr
      ctx.beginPath()
      ctx.arc(px, py, pr, 0, Math.PI * 2)
      ctx.strokeStyle = isSelected ? 'rgba(240, 194, 117, 0.85)' : 'rgba(74, 222, 128, 0.5)'
      ctx.lineWidth = 1.5 * dpr
      ctx.stroke()
    }

    // 机身点位
    ctx.beginPath()
    ctx.arc(px, py, (isSelected ? 6 : 4.5) * dpr, 0, Math.PI * 2)
    ctx.fillStyle = isWorking ? '#4ADE80' : m.status === '待命' ? '#F0C275' : '#94A3B8'
    ctx.fill()
    ctx.strokeStyle = '#0E1C16'
    ctx.lineWidth = 1.5 * dpr
    ctx.stroke()

    // 标签
    ctx.fillStyle = isSelected ? '#F5D393' : 'rgba(247,244,238,0.88)'
    ctx.font = `700 ${9.5 * dpr}px ui-monospace, monospace`
    ctx.fillText(`${m.code} [${m.status}]`, px + 9 * dpr, py + 3 * dpr)
  })
}

onMounted(() => {
  rafId = requestAnimationFrame(drawRadar)
  pingTimer = window.setInterval(() => {
    latencyMs.value = 11 + Math.floor(Math.random() * 7)
  }, 1800)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  clearInterval(pingTimer)
})
</script>

<template>
  <div class="space-y-4">
    <!-- 顶部遥测状态条 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="rounded-2xl bg-[#12231C] text-[#F7F4EE] p-3.5 border border-[#4ADE80]/20 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#4ADE80]/15 text-[#4ADE80] flex items-center justify-center shrink-0"><Wifi :size="17" /></div>
        <div>
          <div class="text-[10.5px] text-white/60">北斗 RTK 链路延迟</div>
          <div class="font-mono text-lg font-bold text-[#4ADE80]">{{ latencyMs }} ms</div>
        </div>
      </div>
      <div class="rounded-2xl bg-[#12231C] text-[#F7F4EE] p-3.5 border border-[#F0C275]/20 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#F0C275]/15 text-[#F0C275] flex items-center justify-center shrink-0"><Compass :size="17" /></div>
        <div>
          <div class="text-[10.5px] text-white/60">厘米级定位精度</div>
          <div class="font-mono text-lg font-bold text-[#F0C275]">±2.1 cm</div>
        </div>
      </div>
      <div class="rounded-2xl bg-[#12231C] text-[#F7F4EE] p-3.5 border border-white/10 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-white/10 text-[#7DD3FC] flex items-center justify-center shrink-0"><Tractor :size="17" /></div>
        <div>
          <div class="text-[10.5px] text-white/60">在线作业农机</div>
          <div class="font-mono text-lg font-bold text-white">{{ store.machinery.filter((m) => m.status === '作业中').length }} / {{ store.machinery.length }} 台</div>
        </div>
      </div>
      <div class="rounded-2xl bg-[#12231C] text-[#F7F4EE] p-3.5 border border-white/10 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-white/10 text-[#86EFAC] flex items-center justify-center shrink-0"><Cpu :size="17" /></div>
        <div>
          <div class="text-[10.5px] text-white/60">AI 视觉诊断节点</div>
          <div class="font-mono text-lg font-bold text-[#86EFAC]">ONLINE</div>
        </div>
      </div>
    </div>

    <!-- 主雷达画布 + 右侧指令控制面板 -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div class="xl:col-span-8 rounded-[1.4rem] overflow-hidden border border-[#1F4E3D]/40 bg-[#0E1C16] relative shadow-lg">
        <div class="absolute top-3 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div class="px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-[#4ADE80]/30 text-[#86EFAC] font-mono text-[10.5px] font-bold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></span>
            <span>BEIDOU-3 RTK DIGITAL TWIN RADAR · 60FPS</span>
          </div>
          <span class="font-mono text-[10px] text-white/60 bg-black/45 px-2.5 py-1 rounded-full">43.88°N 125.32°E</span>
        </div>
        <canvas ref="canvasRef" class="w-full h-[380px] block"></canvas>
      </div>

      <!-- 右侧单机遥测与远程调度 -->
      <div class="xl:col-span-4 bg-white rounded-[1.4rem] border border-[#1C1B18]/8 p-5 flex flex-col justify-between space-y-4">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-[14px] font-bold text-[#16261F]">单机远程调度控制台</h3>
            <span class="font-mono text-[10px] text-[#1F4E3D] font-bold">SYNC TO APP</span>
          </div>

          <!-- 设备选择列表 -->
          <div class="space-y-1.5">
            <button
              v-for="m in store.machinery"
              :key="m.id"
              type="button"
              @click="selectedUnitId = m.id"
              class="w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 cursor-pointer transition-all"
              :class="selectedUnitId === m.id
                ? 'bg-[#16261F] text-[#F7F4EE] border-[#16261F]'
                : 'bg-[#F8F6F1] text-[#1C1B18] border-[#1C1B18]/8 hover:border-[#1F4E3D]/40'"
            >
              <div class="min-w-0">
                <div class="font-mono text-[11px] font-bold" :class="selectedUnitId === m.id ? 'text-[#F0C275]' : 'text-[#1F4E3D]'">{{ m.code }}</div>
                <div class="text-[11.5px] font-semibold truncate">{{ m.name }}</div>
              </div>
              <span
                class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="m.status === '作业中' ? 'bg-[#22C55E]/20 text-[#15803D]' : m.status === '待命' ? 'bg-[#C88A32]/20 text-[#9A6518]' : 'bg-black/10 text-[#6E6960]'"
              >
                {{ m.status }}
              </span>
            </button>
          </div>

          <!-- 当前选中设备详细遥测 -->
          <div v-if="selectedUnit" class="p-3.5 rounded-2xl bg-[#F8F6F1] border border-[#1C1B18]/8 space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-[#6E6960]">作业区域</span><span class="font-bold">{{ selectedUnit.area }}</span></div>
            <div class="flex justify-between"><span class="text-[#6E6960]">当前任务</span><span class="font-bold">{{ selectedUnit.task }}</span></div>
            <div class="flex justify-between"><span class="text-[#6E6960]">剩余能源</span><span class="font-mono font-bold text-[#1F4E3D]">{{ selectedUnit.batteryOrFuel }}%</span></div>
          </div>
        </div>

        <button
          v-if="selectedUnit"
          type="button"
          @click="store.cycleMachineryStatus(selectedUnit.id)"
          class="w-full h-10.5 rounded-xl bg-[#1F4E3D] hover:bg-[#16382B] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Zap :size="14" class="text-[#F0C275]" />
          <span>切换 {{ selectedUnit.code }} 调度状态（同步 App）</span>
        </button>
      </div>
    </div>
  </div>
</template>
