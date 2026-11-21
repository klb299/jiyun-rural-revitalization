<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import echarts from '../../lib/echarts.js'

const props = defineProps({
  trend: { type: Array, default: () => [] },
  categoryShare: { type: Array, default: () => [] }
})

const gmvEl = ref(null)
const shareEl = ref(null)
let gmvChart = null
let shareChart = null
let ro = null

const monoAxis = { color: '#6E6960', fontSize: 10, fontFamily: 'ui-monospace, monospace' }

function renderGmv() {
  if (!gmvChart || !props.trend.length) return
  gmvChart.setOption({
    animationDuration: 650,
    grid: { left: 52, right: 44, top: 28, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,253,249,0.97)',
      borderColor: 'rgba(28,27,24,0.1)',
      borderWidth: 1,
      textStyle: { color: '#1C1B18', fontSize: 12 },
      extraCssText: 'box-shadow:0 12px 30px rgba(28,27,24,0.08);border-radius:12px;'
    },
    legend: {
      top: 0,
      right: 8,
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 18,
      formatter: ' {name}',
      textStyle: { color: '#5A564E', fontSize: 11, padding: [0, 0, 0, 2] }
    },
    xAxis: {
      type: 'category',
      data: props.trend.map((d) => d.date),
      axisLine: { lineStyle: { color: 'rgba(28,27,24,0.12)' } },
      axisTick: { show: false },
      axisLabel: monoAxis
    },
    yAxis: [
      {
        type: 'value',
        name: '元',
        nameTextStyle: { color: '#8E887E', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(28,27,24,0.06)' } },
        axisLabel: monoAxis
      },
      {
        type: 'value',
        name: '单',
        nameTextStyle: { color: '#8E887E', fontSize: 10 },
        splitLine: { show: false },
        axisLabel: monoAxis
      }
    ],
    series: [
      {
        name: '助农成交额',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: props.trend.map((d) => d.gmv),
        lineStyle: { color: '#C88A32', width: 3 },
        itemStyle: { color: '#C88A32', borderColor: '#FFFFFF', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(200,138,50,0.28)' },
              { offset: 1, color: 'rgba(200,138,50,0.01)' }
            ]
          }
        }
      },
      {
        name: '订单量',
        type: 'bar',
        yAxisIndex: 1,
        barWidth: 14,
        data: props.trend.map((d) => d.orders),
        itemStyle: { color: 'rgba(31,78,61,0.28)', borderRadius: [6, 6, 0, 0] }
      }
    ]
  }, true)
}

function renderShare() {
  if (!shareChart || !props.categoryShare.length) return
  const palette = ['#1F4E3D', '#C88A32', '#3B6E82', '#B83828', '#7A6855', '#4D7C5D', '#9B5B3B', '#5E6E8A']
  shareChart.setOption({
    animationDuration: 650,
    tooltip: {
      trigger: 'item',
      formatter: '{b}：{c}%',
      backgroundColor: 'rgba(255,253,249,0.97)',
      borderColor: 'rgba(28,27,24,0.1)',
      textStyle: { color: '#1C1B18', fontSize: 12 }
    },
    grid: { left: 82, right: 44, top: 14, bottom: 14 },
    xAxis: { type: 'value', max: 100, show: false },
    yAxis: {
      type: 'category',
      data: props.categoryShare.map((c) => c.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#3E3B35', fontSize: 11.5, fontWeight: 500 }
    },
    series: [{
      type: 'bar',
      barWidth: 14,
      showBackground: true,
      backgroundStyle: { color: 'rgba(28,27,24,0.05)', borderRadius: 8 },
      data: props.categoryShare.map((c, idx) => ({
        value: c.value,
        itemStyle: { color: palette[idx % palette.length], borderRadius: 8 }
      })),
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: '#1C1B18',
        fontSize: 11,
        fontFamily: 'ui-monospace, monospace',
        fontWeight: 700
      }
    }]
  }, true)
}

function resize() {
  gmvChart?.resize()
  shareChart?.resize()
}

onMounted(async () => {
  await nextTick()
  if (gmvEl.value) gmvChart = echarts.init(gmvEl.value, null, { renderer: 'canvas' })
  if (shareEl.value) shareChart = echarts.init(shareEl.value, null, { renderer: 'canvas' })
  renderGmv()
  renderShare()
  ro = new ResizeObserver(resize)
  if (gmvEl.value) ro.observe(gmvEl.value)
  if (shareEl.value) ro.observe(shareEl.value)
})

watch(() => [props.trend, props.categoryShare], () => {
  renderGmv()
  renderShare()
}, { deep: true })

onUnmounted(() => {
  ro?.disconnect()
  gmvChart?.dispose()
  shareChart?.dispose()
})
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
    <div class="xl:col-span-7 bg-white/86 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 p-5 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)]">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h3 class="text-[14px] font-bold text-[#1C1B18]">近七日助农成交额与订单趋势</h3>
          <p class="text-[11px] text-[#6E6960]">App 端新订单实时累加至当日数据</p>
        </div>
        <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F6F5F0] text-[#6E6960]">GMV · 7D</span>
      </div>
      <div ref="gmvEl" class="w-full h-[220px]"></div>
    </div>

    <div class="xl:col-span-5 bg-white/86 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 p-5 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)]">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h3 class="text-[14px] font-bold text-[#1C1B18]">农产品品类销量占比</h3>
          <p class="text-[11px] text-[#6E6960]">各品类归一化占比（总计 100%）</p>
        </div>
        <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-[#EAF3EE] text-[#1F4E3D] font-bold">SUM = 100%</span>
      </div>
      <div ref="shareEl" class="w-full h-[220px]"></div>
    </div>
  </div>
</template>
