<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import echarts from '../lib/echarts.js'

const soilRef = ref(null)
const yieldRef = ref(null)
const mixRef = ref(null)
let soilChart = null
let yieldChart = null
let mixChart = null

const INK = '#1C1B18'
const MUTED = '#6E6960'
const GOLD = '#C88A32'
const MOSS = '#2E5A44'
const RED = '#B83828'
const CLAY = '#8C583A'
const GRID = 'rgba(28,27,24,0.08)'

const tooltip = {
  backgroundColor: 'rgba(255,253,249,0.97)',
  borderColor: 'rgba(28,27,24,0.12)',
  borderWidth: 1,
  textStyle: { color: INK, fontSize: 12 },
  extraCssText: 'box-shadow:0 16px 40px -18px rgba(28,27,24,0.3);border-radius:10px;'
}

function initCharts() {
  if (soilRef.value) {
    soilChart = echarts.init(soilRef.value)
    soilChart.setOption({
      backgroundColor: 'transparent',
      tooltip,
      radar: {
        indicator: [
          { name: '有机质', max: 6 }, { name: '含水饱和度', max: 100 },
          { name: 'pH 适宜度', max: 10 }, { name: '生物活性', max: 100 },
          { name: '积温匹配', max: 100 }, { name: '免耕覆盖', max: 100 }
        ],
        shape: 'polygon',
        splitNumber: 4,
        splitArea: { areaStyle: { color: ['rgba(239,236,230,0.55)', 'rgba(247,244,238,0.55)'] } },
        axisLine: { lineStyle: { color: 'rgba(28,27,24,0.16)' } },
        splitLine: { lineStyle: { color: 'rgba(28,27,24,0.12)' } },
        axisName: { color: '#5A564E', fontSize: 11 }
      },
      series: [{
        name: '黑土地健康指标', type: 'radar', symbol: 'circle', symbolSize: 5,
        data: [{
          value: [4.82, 78, 6.8, 88, 92, 85], name: '长春九台示范区',
          areaStyle: { color: 'rgba(46,90,68,0.18)' },
          lineStyle: { color: MOSS, width: 2 },
          itemStyle: { color: MOSS }
        }]
      }]
    })
  }

  if (yieldRef.value) {
    yieldChart = echarts.init(yieldRef.value)
    yieldChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { ...tooltip, trigger: 'axis' },
      grid: { left: 46, right: 18, bottom: 34, top: 34 },
      xAxis: {
        type: 'category',
        data: ['2020', '2021', '2022', '2023', '2024', '2025', '2026E'],
        axisLine: { lineStyle: { color: 'rgba(28,27,24,0.2)' } },
        axisTick: { show: false },
        axisLabel: { color: MUTED, fontSize: 10, fontFamily: 'monospace' }
      },
      yAxis: {
        type: 'value', name: '亿斤', nameTextStyle: { color: MUTED, fontSize: 10 },
        splitLine: { lineStyle: { color: GRID } },
        axisLabel: { color: MUTED, fontSize: 10 }
      },
      series: [
        {
          name: '粮食总产量', type: 'bar', barWidth: 15,
          itemStyle: {
            borderRadius: [3, 3, 0, 0],
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: GOLD }, { offset: 1, color: CLAY }]
            }
          },
          data: [760.6, 807.8, 816.2, 837.3, 850.5, 868.0, 880.0]
        },
        {
          name: '高标准农田覆盖率', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
          itemStyle: { color: MOSS }, lineStyle: { color: MOSS, width: 2.5 },
          data: [58, 63, 68, 74, 79, 83, 87]
        }
      ]
    })
  }

  if (mixRef.value) {
    mixChart = echarts.init(mixRef.value)
    mixChart.setOption({
      backgroundColor: 'transparent',
      tooltip,
      legend: {
        bottom: 0, left: 'center', itemWidth: 10, itemHeight: 10,
        textStyle: { color: '#5A564E', fontSize: 10 }
      },
      series: [{
        name: '产业业态占比', type: 'pie', radius: ['48%', '72%'],
        center: ['50%', '44%'],
        itemStyle: { borderRadius: 5, borderColor: '#FFFDF9', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 42, name: '黄金玉米与粳稻', itemStyle: { color: GOLD } },
          { value: 24, name: '智慧畜牧养殖', itemStyle: { color: MOSS } },
          { value: 18, name: '长白山生态林果', itemStyle: { color: CLAY } },
          { value: 16, name: '查干湖渔业文旅', itemStyle: { color: RED } }
        ]
      }]
    })
  }
}

const handleResize = () => {
  soilChart?.resize()
  yieldChart?.resize()
  mixChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  soilChart?.dispose()
  yieldChart?.dispose()
  mixChart?.dispose()
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    <div class="border border-[#1C1B18]/10 bg-[#FFFDF9]/75 p-6">
      <div class="flex items-start justify-between gap-3 border-b border-[#1C1B18]/10 pb-4 mb-2">
        <div>
          <h3 class="font-editorial font-bold text-base text-[#1C1B18]">黑土生境健康雷达</h3>
          <p class="caption mt-1">长春九台 / 榆树试验田遥测</p>
        </div>
        <span class="font-mono text-[10px] px-2 py-1 bg-[#2E5A44]/10 text-[#2E5A44]">IoT ONLINE</span>
      </div>
      <div ref="soilRef" class="w-full h-[230px]"></div>
      <p class="caption mt-2 pt-3 border-t border-[#1C1B18]/8">监测显示有机质维持 4.82% 高位，免耕深松有效阻滞水土流失。</p>
    </div>

    <div class="border border-[#1C1B18]/10 bg-[#FFFDF9]/75 p-6">
      <div class="flex items-start justify-between gap-3 border-b border-[#1C1B18]/10 pb-4 mb-2">
        <div>
          <h3 class="font-editorial font-bold text-base text-[#1C1B18]">粮食总产与现代化趋势</h3>
          <p class="caption mt-1">大国粮仓稳产数据 / 2020–2026</p>
        </div>
        <span class="font-mono text-[10px] px-2 py-1 bg-[#C88A32]/12 text-[#8A6324]">880 亿斤</span>
      </div>
      <div ref="yieldRef" class="w-full h-[230px]"></div>
      <p class="caption mt-2 pt-3 border-t border-[#1C1B18]/8">连续超额完成国家粮食生产目标，单产与机械化率稳居第一方阵。</p>
    </div>

    <div class="border border-[#1C1B18]/10 bg-[#FFFDF9]/75 p-6">
      <div class="flex items-start justify-between gap-3 border-b border-[#1C1B18]/10 pb-4 mb-2">
        <div>
          <h3 class="font-editorial font-bold text-base text-[#1C1B18]">乡村产业多元结构</h3>
          <p class="caption mt-1">一二三产融合发展格局</p>
        </div>
        <span class="font-mono text-[10px] px-2 py-1 bg-[#EFECE6] text-[#5A564E]">100%</span>
      </div>
      <div ref="mixRef" class="w-full h-[230px]"></div>
      <p class="caption mt-2 pt-3 border-t border-[#1C1B18]/8">由单一传统种植，向农旅结合、特色深加工与林下经济多元蝶变。</p>
    </div>
  </div>
</template>
