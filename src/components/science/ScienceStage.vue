<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { createStage } from '../../three/stage.js'
import { LAB_BUILDERS } from '../../three/scienceScenes.js'
import { PALETTE } from '../../three/textures.js'

const props = defineProps({
  mode: { type: String, default: 'soil' },
  param: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['select', 'hover', 'ready'])

const containerRef = ref(null)
const isReady = ref(false)
let stage = null
let api = null

function buildScene(mode) {
  if (!stage) return
  if (api) {
    stage.scene.remove(api.root)
    api.disposeExtra()
    api = null
  }
  const builder = LAB_BUILDERS[mode] || LAB_BUILDERS.soil
  api = builder(stage.scene, stage)
  api.setParam(props.param)
}

onMounted(() => {
  if (!containerRef.value) return
  stage = createStage(containerRef.value, {
    background: PALETTE.canvas,
    fov: 38,
    camera: [5.2, 3.5, 6.6],
    target: [0, 0, 0],
    minDistance: 3.4,
    maxDistance: 12,
    minPolarAngle: 0.24,
    maxPolarAngle: Math.PI / 2 - 0.02,
    exposure: 1.08,
    environmentIntensity: 0.76,
    keyIntensity: 1.9,
    shadowSize: 1024,
    shadowFrustum: 6,
    ao: true,
    aoScale: 0.6,
    aoRadius: 0.3,
    aoIntensity: 0.36,
    aoSamples: 8,
    maxPixelRatio: 1.5,
    onFrame: (dt, t) => api?.update(dt, t)
  })
  if (!stage) return

  buildScene(props.mode)
  stage.enablePicking(() => api?.pickTargets || [], {
    onHover: (obj) => emit('hover', obj?.userData?.key || null),
    onLeave: () => emit('hover', null),
    onClick: (obj) => {
      const key = obj?.userData?.key
      if (key) emit('select', key)
    }
  })
  stage.start()
  requestAnimationFrame(() => {
    isReady.value = true
    emit('ready')
  })
})

watch(() => props.mode, (m) => buildScene(m))
watch(() => props.param, (p) => api?.setParam(p), { deep: true })

onUnmounted(() => {
  stage?.dispose()
  stage = null
  api = null
})
</script>

<template>
  <div class="relative w-full h-full">
    <div ref="containerRef" class="w-full h-full cursor-crosshair"></div>

    <div v-if="!isReady"
      class="absolute inset-0 bg-[#F7F4EE] flex items-center justify-center z-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-[#C88A32]/25 border-t-[#C88A32] animate-spin"></div>
        <span class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960]">CALIBRATING LAB</span>
      </div>
    </div>

    <div class="absolute bottom-4 left-4 z-10 rounded-full bg-[#1C1B18] px-3 py-1.5 flex items-center gap-2 pointer-events-none">
      <span class="w-1.5 h-1.5 rounded-full bg-[#C88A32] animate-pulse"></span>
      <span class="font-mono text-[10px] tracking-[0.16em] text-[#F7F4EE]">拖拽旋转 · 滚轮缩放 · 点击结构</span>
    </div>
  </div>
</template>
