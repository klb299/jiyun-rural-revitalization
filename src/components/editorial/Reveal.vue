<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  as: { type: String, default: 'div' },
  delay: { type: Number, default: 0 },
  variant: { type: String, default: 'up' },
  once: { type: Boolean, default: true }
})

const el = ref(null)
let observer = null
let fallback = 0

onMounted(() => {
  if (!el.value) return
  // 延迟过长会让正文在进入视口后仍空白数百毫秒；统一钳到 200ms 以内。
  el.value.style.transitionDelay = `${Math.min(props.delay, 200)}ms`
  if (typeof IntersectionObserver === 'undefined') {
    el.value.classList.add('is-in')
    return
  }
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in')
        if (props.once) observer.unobserve(entry.target)
      } else if (!props.once) {
        entry.target.classList.remove('is-in')
      }
    })
  }, { threshold: 0.01, rootMargin: '0px 0px -20px 0px' })
  observer.observe(el.value)

  // 兜底：快速滚动或跳转时，接近视口的内容不应停留在隐藏态。
  // 原先 1200ms 才兜底，正好覆盖用户「滚到就截图」的窗口，缩短到 450ms。
  fallback = window.setTimeout(() => {
    if (!el.value || el.value.classList.contains('is-in')) return
    const rect = el.value.getBoundingClientRect()
    if (rect.top < window.innerHeight * 1.8) el.value.classList.add('is-in')
  }, 450)
})

onUnmounted(() => {
  observer?.disconnect()
  clearTimeout(fallback)
})
</script>

<template>
  <component
    :is="as"
    ref="el"
    class="reveal"
    :class="{
      'reveal--left': variant === 'left',
      'reveal--scale': variant === 'scale'
    }"
  >
    <slot />
  </component>
</template>
