<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import echarts from '../lib/echarts.js'

const props = defineProps({
  visits: { type: Array, default: () => [] },
  hallHeat: { type: Array, default: () => [] }
})

const trendEl = ref(null)
const heatEl = ref(null)
let trendChart = null
let heatChart = null

const axisLabel = { color: '#6E6960', fontSize: 10, fontFamily: 'ui-monospace, monospace' }
const splitLine = { lineStyle: { color: 'rgba(28,27,24,0.07)' } }

function renderTrend() {
  if (!trendEl.value) return
  const dates = props.visits.map((v) => v.date)
  const counts = props.visits.map((v) => v.count)
  trendChart.setOption({
    animationDuration: 700,
    grid: { left: 48, right: 18, top: 24, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,253,249,0.96)',
      borderColor: 'rgba(28,27,24,0.10)',
      borderWidth: 1,
      textStyle: { color: '#1C1B18', fontSize: 12 },
      extraCssText: 'box-shadow:0 12px 32px rgba(28,27,24,0.08);border-radius:12px;'
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(28,27,24,0.14)' } },
      axisTick: { show: false },
      axisLabel
    },
    yAxis: {
      type: 'value',
      splitLine,
      axisLabel,
      axisLine: { show: false }
    },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      data: counts,
      lineStyle: { color: '#C88A32', width: 3 },
      itemStyle: { color: '#C88A32', borderColor: '#FFFDF9', borderWidth: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(200,138,50,0.26)' },
            { offset: 1, color: 'rgba(200,138,50,0.01)' }
          ]
        }
      }
    }]
  }, true)
}

function renderHeat() {
  if (!heatEl.value) return
  const colors = ['#C88A32', '#2E5A44', '#B83828']
  heatChart.setOption({
    animationDuration: 700,
    grid: { left: 116, right: 44, top: 12, bottom: 12 },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,253,249,0.96)',
      borderColor: 'rgba(28,27,24,0.10)',
      textStyle: { color: '#1C1B18', fontSize: 12 }
    },
    xAxis: { type: 'value', show: false, max: 60 },
    yAxis: {
      type: 'category',
      data: props.hallHeat.map((h) => h.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#5A564E', fontSize: 11 }
    },
    series: [{
      type: 'bar',
      barWidth: 15,
      data: props.hallHeat.map((h, i) => ({
        value: h.value,
        itemStyle: { color: colors[i % colors.length], borderRadius: [0, 8, 8, 0] }
      })),
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: '#1C1B18',
        fontSize: 11,
        fontFamily: 'ui-monospace, monospace'
      }
    }]
  }, true)
}

function resize() {
  trendChart?.resize()
  heatChart?.resize()
}

onMounted(async () => {
  await nextTick()
  trendChart = echarts.init(trendEl.value, null, { renderer: 'canvas' })
  heatChart = echarts.init(heatEl.value, null, { renderer: 'canvas' })
  renderTrend()
  renderHeat()
  window.addEventListener('resize', resize)
})

watch(() => [props.visits, props.hallHeat], () => {
  renderTrend()
  renderHeat()
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  trendChart?.dispose()
  heatChart?.dispose()
})
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-5 gap-5">
    <div class="xl:col-span-3 museum-card rounded-2xl border border-[#1C1B18]/10 p-5">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-bold text-[#1C1B18] font-editorial">近七日访问趋势</h3>
        <span class="text-[0.625rem] font-mono text-[#6E6960]">VISITORS / 7 DAYS</span>
      </div>
      <div ref="trendEl" class="w-full h-[14.375rem]"></div>
    </div>
    <div class="xl:col-span-2 museum-card rounded-2xl border border-[#1C1B18]/10 p-5">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-bold text-[#1C1B18] font-editorial">3D 展厅热度占比</h3>
        <span class="text-[0.625rem] font-mono text-[#6E6960]">HALL SHARE</span>
      </div>
      <div ref="heatEl" class="w-full h-[14.375rem]"></div>
    </div>
  </div>
</template>
