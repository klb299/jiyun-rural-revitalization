<script setup>
/**
 * 3D 展台统一包装层
 * 三件事：WebGL 能力检测、进入视口才激活（首屏瘦身）、上下文丢失后降级到静态展签。
 * 四个 Three.js 组件本身不需要改动，页面只需把 3D 组件放进默认插槽。
 */
import { ref, onMounted, onUnmounted } from 'vue'
import StageFallback from './StageFallback.vue'
import StageLoading from './StageLoading.vue'

const props = defineProps({
  scene: { type: String, default: 'sandbox' },
  lazy: { type: Boolean, default: false },
  idleLabel: { type: String, default: 'EXHIBIT STANDBY' },
  idleNote: { type: String, default: '展台待布置，向下继续参观' },
  busyLabel: { type: String, default: 'PREPARING EXHIBIT' },
  busyNote: { type: String, default: '正在布置展台' },
  tags: { type: Array, default: () => ['黑土', '稻作', '农机', '生态'] },
  tone: { type: String, default: 'light' }
})

const emit = defineEmits(['activate', 'lost'])

const rootRef = ref(null)
// 必须同步检测：子组件的 onMounted 早于父组件，若等到父组件挂载再判断，
// 3D 组件会抢先创建一次 WebGLRenderer 并在控制台留下错误。
const available = ref(typeof window !== 'undefined' ? detectWebGL() : false)
const active = ref(!props.lazy)
const broken = ref(false)
let observer = null

function detectWebGL() {
  try {
    if (!window.WebGLRenderingContext) return false
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return false
    // 立即释放探测用上下文，避免占用浏览器的上下文配额
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch (e) {
    return false
  }
}

function onContextLost(e) {
  // 不允许浏览器自动恢复，直接切到静态展签，恢复逻辑交给用户刷新
  e.preventDefault?.()
  broken.value = true
  active.value = false
  emit('lost')
}

onMounted(() => {
  if (!available.value) return

  // contextlost 不冒泡，必须在捕获阶段监听
  window.addEventListener('webglcontextlost', onContextLost, true)

  if (!props.lazy) return
  if (typeof IntersectionObserver === 'undefined') {
    active.value = true
    emit('activate')
    return
  }
  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      active.value = true
      emit('activate')
      observer?.disconnect()
      observer = null
    }
  }, { rootMargin: '360px 0px' })
  if (rootRef.value) {
    observer.observe(rootRef.value)
  } else {
    // 只在容器引用异常时兜底，绝不用定时器提前激活，否则懒加载就失效了
    active.value = true
    emit('activate')
    observer?.disconnect()
    observer = null
  }
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
  window.removeEventListener('webglcontextlost', onContextLost, true)
})
</script>

<template>
  <div ref="rootRef" class="stage-frame relative w-full h-full">
    <!-- 展柜四角定位标：把写实 3D 场景装裱进编辑式版式，只在实时渲染时出现 -->
    <template v-if="available && !broken">
      <span class="stage-corner stage-corner--tl" aria-hidden="true"></span>
      <span class="stage-corner stage-corner--tr" aria-hidden="true"></span>
      <span class="stage-corner stage-corner--bl" aria-hidden="true"></span>
      <span class="stage-corner stage-corner--br" aria-hidden="true"></span>
    </template>
    <StageFallback v-if="!available || broken" :scene="scene" :reason="broken ? 'lost' : 'unsupported'" />
    <template v-else>
      <slot v-if="active" />
      <StageLoading
        v-else
        variant="idle"
        :label="idleLabel"
        :note="idleNote"
        :tags="tags"
        :tone="tone"
      />
    </template>
  </div>
</template>
