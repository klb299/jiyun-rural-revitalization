<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  value: { type: String, required: true },
  label: { type: String, required: true },
  note: { type: String, default: '' },
  index: { type: String, default: '' },
  dark: { type: Boolean, default: false },
  accent: { type: String, default: '#C89B45' }
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
    const duration = 950
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      display.value = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }, { threshold: 0.35 })
  observer.observe(el.value)
})

onUnmounted(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div
    ref="el"
    class="relative rounded-2xl px-5 py-5 border overflow-hidden transition-colors duration-300"
    :class="dark
      ? 'bg-white/[0.06] border-white/14 hover:border-[#E5C175]/40'
      : 'bg-[#FCFEFC] border-[#0E261D]/10 shadow-[0_14px_32px_-24px_rgba(14,38,29,0.28)] hover:border-[#1F5440]/30'"
  >
    <div class="flex items-start justify-between gap-3">
      <div
        class="font-editorial font-bold tabular-nums leading-none whitespace-nowrap"
        :style="{ color: dark ? '#E5C175' : (accent === '#C88A32' ? '#1A4333' : accent), fontSize: 'clamp(1.75rem, 2.7vw, 2.75rem)' }"
      >
        {{ display }}
      </div>
      <span
        v-if="index"
        class="font-mono text-[0.625rem] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-full"
        :class="dark ? 'bg-[#E5C175]/14 text-[#E5C175]' : 'bg-[#EAF1EC] text-[#3E554B]'"
      >
        {{ index }}
      </span>
    </div>
    <div class="mt-3.5 text-sm font-bold" :class="dark ? 'text-[#F7FAF8]' : 'text-[#10241C]'">{{ label }}</div>
    <div v-if="note" class="text-xs leading-relaxed mt-1" :class="dark ? 'text-[#D7E4DD]/80' : 'text-[#566E64]'">{{ note }}</div>
  </div>
</template>
