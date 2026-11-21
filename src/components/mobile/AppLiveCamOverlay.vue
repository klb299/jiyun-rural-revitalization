<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  X, Radio, Eye, EyeOff, Thermometer, Droplets, Wind,
  Heart, Send, ShoppingBag, MapPin, Play, Pause,
  Volume2, VolumeX, Video
} from 'lucide-vue-next'
import { useRuralPlatformStore } from '../../stores/ruralPlatformStore'

const props = defineProps({
  camId: { type: String, required: true },
  framed: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'buy-product', 'switch-cam'])

const store = useRuralPlatformStore()
const cam = computed(() => store.liveCams.find((c) => c.id === props.camId) || store.liveCams[0])
const linkedProduct = computed(() => store.products.find((p) => p.id === cam.value?.linkedProductId) || store.activeProducts[0])

/* ---------------- 实时视频流播控与清屏状态 ---------------- */
const isPlaying = ref(true)
const isMuted = ref(true)
const isCleanMode = ref(false)
const qualityIdx = ref(0)
const qualities = [
  { label: '1080P', bitrate: '4.8 Mbps' },
  { label: '720P', bitrate: '2.4 Mbps' },
  { label: '480P', bitrate: '1.1 Mbps' }
]
const currentQuality = computed(() => qualities[qualityIdx.value])
const cycleQuality = () => { qualityIdx.value = (qualityIdx.value + 1) % qualities.length }

const timecode = ref('')
const liveBitrate = ref('4.8 Mbps')
const commentInput = ref('')
const likeCount = ref(628)
const burstHearts = ref([])

function updateClock() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  const f = p(Math.floor((d.getMilliseconds() / 1000) * 30))
  timecode.value = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}:${f}`
}

/* ---------------- Web Audio 现场风声模拟（默认静音，点击开启） ---------------- */
let audioCtx = null
let gainNode = null
function toggleSound() {
  isMuted.value = !isMuted.value
  if (!isMuted.value) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!audioCtx && AC) {
        audioCtx = new AC()
        const bufferSize = audioCtx.sampleRate * 2
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
        const data = buffer.getChannelData(0)
        let lastOut = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          data[i] = (lastOut + 0.02 * white) / 1.02
          lastOut = data[i]
          data[i] *= 0.8
        }
        const noise = audioCtx.createBufferSource()
        noise.buffer = buffer
        noise.loop = true
        const filter = audioCtx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 340
        gainNode = audioCtx.createGain()
        gainNode.gain.value = 0.08
        noise.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(audioCtx.destination)
        noise.start()
      } else if (audioCtx?.state === 'suspended') {
        audioCtx.resume()
      }
      if (gainNode) gainNode.gain.value = 0.08
    } catch {
      // 忽略浏览器音频策略限制
    }
  } else if (gainNode) {
    gainNode.gain.value = 0
  }
}

/* ---------------- 60fps Canvas 实景视频流模拟引擎 ---------------- */
const canvasRef = ref(null)
let rafId = 0
let clockTimer = 0
let simTimer = 0
let bgImg = null
let bgLoaded = false
let particles = []
let startTime = performance.now()
let pausedElapsed = 0

function initParticles(camKey) {
  particles = []
  const count = camKey === 'cam-2' ? 85 : camKey === 'cam-4' ? 35 : 55
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * (camKey === 'cam-2' ? 2.6 : 2.0),
      vx: (Math.random() - 0.35) * (camKey === 'cam-2' ? 0.08 : 0.03),
      vy: camKey === 'cam-2' ? (0.06 + Math.random() * 0.14) : (-0.015 - Math.random() * 0.03),
      alpha: 0.25 + Math.random() * 0.65,
      phase: Math.random() * Math.PI * 2
    })
  }
}

function loadCamImage(src) {
  bgLoaded = false
  const img = new Image()
  img.onload = () => {
    bgImg = img
    bgLoaded = true
  }
  img.src = src
}

function drawFrame(now) {
  rafId = requestAnimationFrame(drawFrame)
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

  const t = isPlaying.value ? (now - startTime) * 0.001 : pausedElapsed
  if (isPlaying.value) pausedElapsed = t

  ctx.clearRect(0, 0, w, h)

  // 1. 电影级无人机云台运镜 + 呼吸摇摄
  if (bgLoaded && bgImg) {
    const zoom = 1.14 + Math.sin(t * 0.26) * 0.055
    const panX = Math.sin(t * 0.32) * (w * 0.045)
    const panY = Math.cos(t * 0.22) * (h * 0.025)
    const imgRatio = bgImg.width / bgImg.height
    const viewRatio = w / h
    let drawW, drawH
    if (imgRatio > viewRatio) {
      drawH = h * zoom
      drawW = drawH * imgRatio
    } else {
      drawW = w * zoom
      drawH = drawW / imgRatio
    }
    const dx = (w - drawW) * 0.5 + panX
    const dy = (h - drawH) * 0.5 + panY
    ctx.drawImage(bgImg, dx, dy, drawW, drawH)
  }

  const camId = cam.value?.id || 'cam-1'

  // 2. 分机位实时气象/粒子/AR遥测叠加
  if (camId === 'cam-2') {
    // 查干湖冬捕：飘雪粒子 + 冰面冷雾流光
    const mist = ctx.createLinearGradient(0, h * 0.55, 0, h)
    mist.addColorStop(0, 'rgba(180,220,240,0)')
    mist.addColorStop(1, 'rgba(195,228,245,0.16)')
    ctx.fillStyle = mist
    ctx.fillRect(0, h * 0.55, w, h * 0.45)

    for (const p of particles) {
      if (isPlaying.value) {
        p.x = (p.x + (p.vx + Math.sin(t * 0.9 + p.phase) * 0.02) * 0.016 + 1) % 1
        p.y = (p.y + p.vy * 0.016) % 1
      }
      ctx.beginPath()
      ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`
      ctx.fill()
    }
  } else if (camId === 'cam-4') {
    // 北斗无人农机：绿色 RTK AR 扫描线与定位准星
    const scanY = ((t * 0.22) % 1) * h
    const grad = ctx.createLinearGradient(0, scanY - 40 * dpr, 0, scanY + 6 * dpr)
    grad.addColorStop(0, 'rgba(74, 222, 128, 0)')
    grad.addColorStop(1, 'rgba(74, 222, 128, 0.28)')
    ctx.fillStyle = grad
    ctx.fillRect(0, scanY - 40 * dpr, w, 46 * dpr)
    ctx.fillStyle = 'rgba(134, 239, 172, 0.7)'
    ctx.fillRect(0, scanY, w, 1.5 * dpr)

    // 中心 RTK 锁定准星
    const cx = w * 0.5 + Math.sin(t * 0.7) * 14 * dpr
    const cy = h * 0.46 + Math.cos(t * 0.6) * 8 * dpr
    const pulseR = (28 + Math.sin(t * 3.2) * 5) * dpr
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.65)'
    ctx.lineWidth = 1.4 * dpr
    ctx.beginPath()
    ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = 'rgba(74, 222, 128, 0.9)'
    ctx.font = `${10 * dpr}px ui-monospace, monospace`
    ctx.fillText('RTK LOCK ±2.1cm', cx + 34 * dpr, cy + 4 * dpr)
  } else {
    // 九台稻田 / 梨树黑土：金色暖阳浮尘与柔光晕
    const sunX = w * (0.72 + Math.sin(t * 0.2) * 0.06)
    const sunY = h * 0.24
    const flare = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, w * 0.5)
    flare.addColorStop(0, 'rgba(245, 208, 128, 0.24)')
    flare.addColorStop(1, 'rgba(245, 208, 128, 0)')
    ctx.fillStyle = flare
    ctx.fillRect(0, 0, w, h)

    for (const p of particles) {
      if (isPlaying.value) {
        p.x = (p.x + (p.vx + Math.sin(t * 0.6 + p.phase) * 0.015) * 0.016 + 1) % 1
        p.y = (p.y + p.vy * 0.016 + 1) % 1
      }
      const glow = 0.4 + 0.5 * Math.sin(t * 2.2 + p.phase)
      ctx.beginPath()
      ctx.arc(p.x * w, p.y * h, p.r * dpr, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(248, 220, 146, ${p.alpha * glow})`
      ctx.fill()
    }
  }

  // 3. 轻微摄像机监视器暗角与扫描线质感
  const vig = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.22, w * 0.5, h * 0.5, h * 0.72)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(8,14,11,0.52)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)
}

watch(() => cam.value?.id, (newId) => {
  if (!cam.value) return
  loadCamImage(cam.value.image)
  initParticles(newId)
}, { immediate: true })

onMounted(() => {
  updateClock()
  clockTimer = window.setInterval(updateClock, 120)
  simTimer = window.setInterval(() => {
    if (!isPlaying.value || !cam.value) return
    const delta = Math.floor(Math.random() * 5) - 2
    cam.value.viewers = Math.max(120, cam.value.viewers + delta)
    const base = qualityIdx.value === 0 ? 4.6 : qualityIdx.value === 1 ? 2.3 : 1.1
    liveBitrate.value = `${(base + (Math.random() * 0.4 - 0.15)).toFixed(1)} Mbps`
  }, 2400)
  rafId = requestAnimationFrame(drawFrame)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  clearInterval(clockTimer)
  clearInterval(simTimer)
  if (audioCtx) {
    audioCtx.close().catch(() => {})
    audioCtx = null
  }
})

function sendComment() {
  if (!commentInput.value.trim() || !cam.value) return
  store.addLiveComment(cam.value.id, commentInput.value)
  commentInput.value = ''
}

function triggerLike() {
  likeCount.value += 1
  const id = Date.now() + Math.random()
  burstHearts.value.push({ id, x: Math.round((Math.random() - 0.5) * 34) })
  window.setTimeout(() => {
    burstHearts.value = burstHearts.value.filter((h) => h.id !== id)
  }, 900)
}
</script>

<template>
  <div
    v-if="cam"
    class="absolute inset-0 z-40 bg-[#0D1612] text-white flex flex-col overflow-hidden"
  >
    <!-- 60fps 实景视频流模拟画布（点击画面亦可快捷切换清屏/恢复） -->
    <canvas ref="canvasRef" @click="isCleanMode = !isCleanMode" class="absolute inset-0 w-full h-full block cursor-pointer"></canvas>
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/88 transition-opacity duration-300"
      :class="isCleanMode ? 'opacity-20' : 'opacity-100'"
    ></div>

    <!-- 清屏模式悬浮恢复控制条（纯享高清实景画面） -->
    <Transition name="fade">
      <div
        v-if="isCleanMode"
        class="relative z-20 px-3.5 flex items-center justify-between"
        :class="framed ? 'pt-12' : 'pt-4'"
      >
        <div class="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/85 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse"></span>
          <span>{{ cam.shortTitle }} · 清屏纯享</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            @click="isCleanMode = false"
            class="h-8 px-3 rounded-full bg-black/55 backdrop-blur-md border border-[#F0C275]/45 text-[#F5D393] text-[10.5px] font-bold flex items-center gap-1 cursor-pointer shadow-md"
          >
            <Eye :size="12" />
            <span>恢复界面</span>
          </button>
          <button
            type="button"
            @click="emit('close')"
            class="w-8 h-8 rounded-full bg-black/55 backdrop-blur-md border border-white/15 flex items-center justify-center cursor-pointer"
            aria-label="退出慢直播"
          >
            <X :size="14" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- 顶部播控与机位切换 -->
    <div
      v-show="!isCleanMode"
      class="relative z-10 px-3.5 pb-2 space-y-2 transition-opacity duration-300"
      :class="framed ? 'pt-12' : 'pt-4'"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 bg-black/50 backdrop-blur-md pl-2 pr-3 py-1.5 rounded-full border border-white/15 min-w-0">
          <span
            class="w-2 h-2 rounded-full shrink-0"
            :class="cam.status === '直播中' && isPlaying ? 'bg-[#EF4444] animate-pulse' : 'bg-[#F0C275]'"
          ></span>
          <div class="min-w-0">
            <div class="text-[11.5px] font-bold truncate leading-tight flex items-center gap-1">
              <span>{{ cam.shortTitle }}</span>
              <span class="font-mono text-[8.5px] px-1 py-0.2 rounded bg-[#EF4444]/85 text-white">REC</span>
            </div>
            <div class="text-[9.5px] text-white/75 flex items-center gap-1">
              <Eye :size="9.5" />
              <span class="font-mono">{{ cam.viewers.toLocaleString() }} 在看 · {{ liveBitrate }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          <button
            type="button"
            @click="isCleanMode = true"
            class="h-7.5 px-2 rounded-full bg-black/48 backdrop-blur-md border border-[#F0C275]/35 text-[#F5D393] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            title="清屏纯享实景"
            aria-label="清屏纯享实景"
          >
            <EyeOff :size="11.5" />
            <span>清屏</span>
          </button>
          <button
            type="button"
            @click="isPlaying = !isPlaying"
            class="w-7.5 h-7.5 rounded-full bg-black/48 backdrop-blur-md border border-white/15 flex items-center justify-center cursor-pointer"
            :aria-label="isPlaying ? '暂停实景画面' : '恢复实景画面'"
          >
            <Pause v-if="isPlaying" :size="12.5" />
            <Play v-else :size="12.5" />
          </button>
          <button
            type="button"
            @click="toggleSound"
            class="w-7.5 h-7.5 rounded-full bg-black/48 backdrop-blur-md border border-white/15 flex items-center justify-center cursor-pointer"
            :aria-label="isMuted ? '开启现场环境音' : '静音'"
          >
            <VolumeX v-if="isMuted" :size="12.5" class="text-white/70" />
            <Volume2 v-else :size="12.5" class="text-[#4ADE80]" />
          </button>
          <button
            type="button"
            @click="emit('close')"
            class="w-7.5 h-7.5 rounded-full bg-black/48 backdrop-blur-md border border-white/15 flex items-center justify-center cursor-pointer"
            aria-label="退出慢直播"
          >
            <X :size="13.5" />
          </button>
        </div>
      </div>

      <!-- 4机位等宽一排全展示 -->
      <div class="grid grid-cols-4 gap-1">
        <button
          v-for="item in store.liveCams"
          :key="item.id"
          type="button"
          @click="emit('switch-cam', item.id)"
          class="px-1.5 py-1 rounded-full text-[9.5px] font-bold backdrop-blur-md border flex items-center justify-center gap-0.5 cursor-pointer transition-all truncate"
          :class="item.id === cam.id
            ? 'bg-[#C88A32] text-[#16261F] border-[#F0C275]'
            : 'bg-black/40 text-white/88 border-white/15'"
        >
          <Radio :size="9" class="shrink-0" />
          <span class="truncate">{{ item.shortTitle }}</span>
        </button>
      </div>
    </div>

    <!-- 中部：实景时间戳 + 画质切换 + IoT 悬浮气象条 -->
    <div v-show="!isCleanMode" class="relative z-10 px-3.5 mt-0.5 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/42 backdrop-blur-md text-[9.5px] font-mono text-white/90 border border-white/12">
          <Video :size="10" class="text-[#4ADE80]" />
          <span>{{ timecode }}</span>
        </div>
        <button
          type="button"
          @click="cycleQuality"
          class="px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md border border-[#F0C275]/40 text-[#F0C275] font-mono text-[9.5px] font-bold cursor-pointer"
        >
          {{ currentQuality.label }} · 60FPS
        </button>
      </div>

      <div class="grid grid-cols-3 gap-1.5">
        <div class="px-2.5 py-1.5 rounded-xl bg-black/42 backdrop-blur-md border border-white/12 flex items-center gap-1.5">
          <Thermometer :size="12" class="text-[#F0C275] shrink-0" />
          <div>
            <div class="text-[8.5px] text-white/60">实时气温</div>
            <div class="font-mono text-[11px] font-bold">{{ cam.temp }}</div>
          </div>
        </div>
        <div class="px-2.5 py-1.5 rounded-xl bg-black/42 backdrop-blur-md border border-white/12 flex items-center gap-1.5">
          <Droplets :size="12" class="text-[#7DD3FC] shrink-0" />
          <div>
            <div class="text-[8.5px] text-white/60">墒情 / 状态</div>
            <div class="font-mono text-[11px] font-bold truncate">{{ cam.soilMoisture }}</div>
          </div>
        </div>
        <div class="px-2.5 py-1.5 rounded-xl bg-black/42 backdrop-blur-md border border-white/12 flex items-center gap-1.5">
          <Wind :size="12" class="text-[#86EFAC] shrink-0" />
          <div>
            <div class="text-[8.5px] text-white/60">田间风速</div>
            <div class="font-mono text-[10.5px] font-bold truncate">{{ cam.wind }}</div>
          </div>
        </div>
      </div>

      <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/32 text-[9.5px] text-white/80">
        <MapPin :size="9.5" class="text-[#F0C275]" />
        <span>{{ cam.location }}</span>
      </div>
    </div>

    <!-- 底部交互区：实时弹幕 + 关联助农产品卡 + 发言与点赞 -->
    <div v-show="!isCleanMode" class="relative z-10 mt-auto px-3.5 space-y-2.5" :class="framed ? 'pb-6' : 'pb-4'">
      <div class="max-h-30 overflow-y-auto space-y-1.5 pr-10 no-scrollbar">
        <div
          v-for="cm in cam.comments"
          :key="cm.id"
          class="inline-block max-w-full px-2.5 py-1 rounded-2xl bg-black/46 backdrop-blur-md text-[11px] leading-snug border border-white/10"
        >
          <span class="text-[#F0C275] font-bold mr-1">{{ cm.user }}:</span>
          <span class="text-white/92">{{ cm.text }}</span>
        </div>
      </div>

      <!-- 关联助农好物悬浮卡 -->
      <div
        v-if="linkedProduct"
        @click="emit('buy-product', linkedProduct)"
        class="p-2 rounded-2xl bg-white/95 text-[#1C1B18] flex items-center gap-2.5 shadow-xl cursor-pointer active:scale-[0.99] transition-transform"
      >
        <img :src="linkedProduct.image" :alt="linkedProduct.name" class="w-12 h-12 rounded-xl object-cover shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded bg-[#B83828] text-white text-[8.5px] font-bold leading-none">直播直采</span>
            <span class="text-[11.5px] font-bold truncate">{{ linkedProduct.name }}</span>
          </div>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="font-mono text-[14px] font-bold text-[#B83828]">¥{{ linkedProduct.price }}</span>
            <span class="text-[9.5px] text-[#1F4E3D] font-medium">{{ linkedProduct.farmerSharePct }}% 直达农户</span>
          </div>
        </div>
        <div class="px-2.5 py-1.5 rounded-xl bg-[#1F4E3D] text-white text-[10.5px] font-bold shrink-0 flex items-center gap-1">
          <ShoppingBag :size="11" />
          <span>去抢购</span>
        </div>
      </div>

      <!-- 底部发弹幕 + 点赞 -->
      <div class="flex items-center gap-2 relative">
        <form @submit.prevent="sendComment" class="flex-1 flex items-center bg-black/48 backdrop-blur-md border border-white/18 rounded-full pl-3.5 pr-1.5 h-9.5">
          <input
            v-model="commentInput"
            type="text"
            placeholder="发一条弹幕为黑土助农打气…"
            class="flex-1 bg-transparent text-[11.5px] text-white placeholder:text-white/55 focus:outline-none"
          />
          <button
            type="submit"
            class="w-7 h-7 rounded-full bg-[#C88A32] text-[#16261F] flex items-center justify-center cursor-pointer"
            aria-label="发送弹幕"
          >
            <Send :size="12" />
          </button>
        </form>

        <div class="relative">
          <button
            type="button"
            @click="triggerLike"
            class="h-9.5 px-3 rounded-full bg-[#B83828] text-white flex items-center gap-1 text-[11px] font-bold shadow-lg cursor-pointer active:scale-90 transition-transform"
          >
            <Heart :size="14" class="fill-white" />
            <span class="font-mono">{{ likeCount }}</span>
          </button>
          <span
            v-for="h in burstHearts"
            :key="h.id"
            class="pointer-events-none absolute -top-2 left-1/2 text-[#F87171] heart-float"
            :style="{ marginLeft: `${h.x}px` }"
          >❤</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes heartUp {
  0% { opacity: 1; transform: translateY(0) scale(0.8); }
  100% { opacity: 0; transform: translateY(-64px) scale(1.4); }
}
.heart-float {
  animation: heartUp 0.9s ease-out forwards;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
</style>
