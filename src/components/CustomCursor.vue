<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 精密方形准星指针
 * 单元素跟随，避免此前「圆点 + 延迟圆环」双元素在快速移动或路由切换时
 * 出现严重分离与卡住的问题。仅在精确指针设备上启用。
 */
const el = ref(null)
const enabled = ref(false)
const hovering = ref(false)
const pressed = ref(false)

let raf = 0
let targetX = 0
let targetY = 0
let currentX = 0
let currentY = 0
let hasMoved = false

const onMove = (e) => {
  if (!enabled.value || !el.value) return
  targetX = e.clientX
  targetY = e.clientY
  if (!hasMoved) {
    hasMoved = true
    currentX = targetX
    currentY = targetY
    el.value.style.opacity = '1'
  }
  const target = e.target
  hovering.value = !!(target && target.closest &&
    target.closest('a, button, input, select, textarea, [role="button"], canvas, .cursor-pointer'))
}

const onDown = () => { pressed.value = true }
const onUp = () => { pressed.value = false }
const onLeave = () => { if (el.value) el.value.style.opacity = '0' }
const onEnter = () => { if (el.value && hasMoved) el.value.style.opacity = '1' }

const loop = () => {
  if (el.value) {
    // 高系数跟随，既有顺滑感又不会出现明显滞后
    currentX += (targetX - currentX) * 0.45
    currentY += (targetY - currentY) * 0.45
    el.value.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
  }
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  enabled.value = typeof window !== 'undefined' &&
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!enabled.value) return
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  document.addEventListener('pointerleave', onLeave)
  document.addEventListener('pointerenter', onEnter)
  raf = requestAnimationFrame(loop)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerdown', onDown)
  window.removeEventListener('pointerup', onUp)
  document.removeEventListener('pointerleave', onLeave)
  document.removeEventListener('pointerenter', onEnter)
})
</script>

<template>
  <div
    v-if="enabled"
    ref="el"
    class="cs-root"
    :class="{ 'is-hover': hovering, 'is-down': pressed }"
    aria-hidden="true"
  >
    <span class="cs-cross cs-cross--h"></span>
    <span class="cs-cross cs-cross--v"></span>
    <span class="cs-box"></span>
    <span class="cs-dot"></span>
    <span class="cs-tick cs-tick--tl"></span>
    <span class="cs-tick cs-tick--tr"></span>
    <span class="cs-tick cs-tick--bl"></span>
    <span class="cs-tick cs-tick--br"></span>
  </div>
</template>

<style scoped>
.cs-root {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
  will-change: transform;
  mix-blend-mode: normal;
}

.cs-cross,
.cs-box,
.cs-dot,
.cs-tick {
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  transition: transform 0.45s cubic-bezier(0.32, 0.72, 0, 1),
              width 0.45s cubic-bezier(0.32, 0.72, 0, 1),
              height 0.45s cubic-bezier(0.32, 0.72, 0, 1),
              background-color 0.35s ease,
              border-color 0.35s ease,
              opacity 0.35s ease;
}

.cs-cross--h {
  width: 34px;
  height: 1px;
  background: rgba(28, 27, 24, 0.34);
  transform: translate(-50%, -50%);
}

.cs-cross--v {
  width: 1px;
  height: 34px;
  background: rgba(28, 27, 24, 0.34);
  transform: translate(-50%, -50%);
}

.cs-box {
  width: 19px;
  height: 19px;
  border: 1px solid #1c1b18;
  background: rgba(247, 244, 238, 0.06);
  transform: translate(-50%, -50%);
}

.cs-dot {
  width: 3px;
  height: 3px;
  background: #c88a32;
  transform: translate(-50%, -50%);
}

.cs-tick {
  width: 4px;
  height: 4px;
  border: 1px solid #c88a32;
  opacity: 0;
  background: transparent;
}

.cs-tick--tl { transform: translate(calc(-50% - 13px), calc(-50% - 13px)); }
.cs-tick--tr { transform: translate(calc(-50% + 13px), calc(-50% - 13px)); }
.cs-tick--bl { transform: translate(calc(-50% - 13px), calc(-50% + 13px)); }
.cs-tick--br { transform: translate(calc(-50% + 13px), calc(-50% + 13px)); }

.cs-root.is-hover .cs-box {
  width: 30px;
  height: 30px;
  border-color: #c88a32;
  background: rgba(200, 138, 50, 0.1);
}

.cs-root.is-hover .cs-cross--h { width: 50px; background: rgba(200, 138, 50, 0.55); }
.cs-root.is-hover .cs-cross--v { height: 50px; background: rgba(200, 138, 50, 0.55); }
.cs-root.is-hover .cs-dot { width: 5px; height: 5px; }
.cs-root.is-hover .cs-tick { opacity: 1; }
.cs-root.is-down .cs-box { width: 13px; height: 13px; }
.cs-root.is-down .cs-cross--h { width: 22px; }
.cs-root.is-down .cs-cross--v { height: 22px; }
</style>
