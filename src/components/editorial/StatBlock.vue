<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  value: { type: String, required: true },
  label: { type: String, required: true },
  note: { type: String, default: '' },
  index: { type: String, default: '' },
  dark: { type: Boolean, default: false },
  accent: { type: String, default: '#C88A32' }
})

const el = ref(null)
const display = ref(props.value)
let observer = null
let frame = 0

onMounted(() => {
  const match = String(props.value).match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/)
  if (!match || !el.value || typeof IntersectionObserver === 'undefined') return
  const [, prefix, numStr, suffix] = match
  const target = parseFloat(numStr)
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0
  let started = false
  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || started) return
    started = true
    observer.disconnect()
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const duration = 1250
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      display.value = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }, { threshold: 0.4 })
  observer.observe(el.value)
})

onUnmounted(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="el" class="relative rounded-3xl px-5 py-6 border overflow-hidden"
    :class="dark ? 'bg-[#F7F4EE]/6 border-[#F7F4EE]/14' : 'bg-[#FFFDF9]/75 border-[#1C1B18]/8'">
    <span class="absolute -right-2 -bottom-8 font-editorial font-bold select-none pointer-events-none"
      :class="dark ? 'text-[#F7F4EE]/6' : 'text-[#1C1B18]/5'"
      style="font-size: 7rem; line-height: 1">{{ index.slice(-2) }}</span>
    <div class="relative flex items-start justify-between gap-3">
      <div class="font-editorial font-bold tabular-nums leading-none"
        :style="{ color: accent, fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }">{{ display }}</div>
      <span v-if="index" class="font-mono text-[10px] tracking-[0.2em] px-2 py-1 rounded-full"
        :class="dark ? 'bg-[#F7F4EE]/10 text-[#F7F4EE]/80' : 'bg-[#EFECE6] text-[#6E6960]'">{{ index }}</span>
    </div>
    <div class="relative mt-4 text-sm font-bold" :class="dark ? 'text-[#F7F4EE]' : 'text-[#1C1B18]'">{{ label }}</div>
    <div v-if="note" class="caption relative mt-1.5" :class="dark ? 'text-[#F7F4EE]/80' : ''">{{ note }}</div>
  </div>
</template>
