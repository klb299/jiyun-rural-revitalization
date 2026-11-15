<script setup>
/**
 * WebGL 不可用时的静态展签
 * 不是一句冷冰冰的错误提示，而是把同一段乡村振兴展陈内容用图版 + 档案卡讲完，
 * 保证禁用硬件加速、老旧机房、虚拟机或上下文丢失时，展厅依然有内容可读。
 */
import { computed } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'

const props = defineProps({
  scene: { type: String, default: 'sandbox' },
  reason: { type: String, default: 'unsupported' } // unsupported / lost
})

const SCENES = {
  sandbox: {
    code: 'GALLERY 03',
    eyebrow: 'RURAL DIGITAL TWIN',
    title: '一方沙盘里的松辽平原',
    lead: '把耕地保育、防护林、水系与清洁能源收进同一张底图，看清一座粮仓怎么被组织起来。',
    image: '/art/diorama.svg',
    alt: '松辽平原黑土田块与林带俯视图版',
    points: [
      ['黑土格网', '规整田块、田埂与垄沟对应东北真实耕作单元，垄间留着秸秆覆盖。'],
      ['防护林带', '成行杨树与樟子松压住风沙，把耕地稳稳护在林网里。'],
      ['水系与能源', '蜿蜒松花江、灌溉渠与风电光伏并网，构成田间的生产与生态骨架。']
    ],
    to: '/dashboard',
    cta: '查看黑土振兴数智大屏'
  },
  strata: {
    code: 'GALLERY 01',
    eyebrow: 'VIRTUAL PEDOLOGY',
    title: '一米黑土，一万年沉积',
    lead: '黑土不是颜色，是被压缩的时间。三层剖面各自记录着一段成土与耕作的历史。',
    image: '/art/soil-strata.svg',
    alt: '黑土地质剖面的腐殖质层与淀积层图版',
    points: [
      ['腐殖质熟化层', '0 至 20 厘米，团粒结构撑起保水保肥能力，是粮食产能的根基。'],
      ['淀积心土层', '淋溶与淀积把铁锰锈斑、钙质结核留在这里，也留下退化风险。'],
      ['母质与保育', '深松、秸秆还田与轮作，让万年形成的耕层不被一代人耗尽。']
    ],
    to: '/science',
    cta: '进入黑土科普实验室'
  },
  machinery: {
    code: 'GALLERY 02',
    eyebrow: 'INDUSTRIAL DECONSTRUCTION',
    title: '一台车，拆解长春智造',
    lead: '北斗无人拖拉机把定位、动力、液压与轮胎串成一条完整的田间作业链。',
    image: '/art/machine.svg',
    alt: '北斗无人拖拉机结构解构图版',
    points: [
      ['北斗 RTK 天线', '厘米级定位让播种、施肥与收获沿同一条轨迹复现，不重不漏。'],
      ['动力与液压', '发动机、变速箱与多路液压输出，支撑深松、播种、植保多种农具。'],
      ['低压宽胎', '减小接地比压，避免压实耕层，保护黑土团粒与孔隙。']
    ],
    to: '/about',
    cta: '阅读技术架构说明'
  },
  science: {
    code: 'SCIENCE LAB',
    eyebrow: 'INTERACTIVE PEDAGOGY',
    title: '把原理，变成能看懂的事',
    lead: '团粒与孔隙、稻作五阶段、北斗定位误差，三件事撑起黑土农业的科学底色。',
    image: '/art/rice.svg',
    alt: '稻穗与黑土团粒科普图版',
    points: [
      ['团粒与孔隙', '45% 至 55% 的孔隙度，决定一捧黑土能存多少水、透多少气。'],
      ['稻作五阶段', '从浸种催芽到灌浆成熟，约 180 天里株高、水位与穗轴同步变化。'],
      ['定位误差', '卫星数从 6 颗减到 3 颗，作业精度会从 ±2.5 厘米退到米级。']
    ],
    to: '/strata-3d',
    cta: '返回黑土地质标本馆'
  }
}

const data = computed(() => SCENES[props.scene] || SCENES.sandbox)
const headline = computed(() =>
  props.reason === 'lost'
    ? '图形上下文中断，展台已切换为静态展签'
    : '当前设备未启用 WebGL，展台已切换为静态展签'
)
const hint = computed(() =>
  props.reason === 'lost'
    ? '刷新页面可重新加载可交互的三维展厅，以下内容不依赖图形加速，可以完整阅读。'
    : '开启浏览器硬件加速后即可获得可拖拽、可拾取的三维体验，以下内容不依赖图形加速，可以完整阅读。'
)
</script>

<template>
  <div class="stage-fallback h-full w-full overflow-auto">
    <div class="min-h-full grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <!-- 图版侧 -->
      <div class="relative bg-[#EFECE6] border-b lg:border-b-0 lg:border-r border-[#1C1B18]/12 overflow-hidden flex items-center justify-center p-5 sm:p-8">
        <img :src="data.image" :alt="data.alt" class="w-full h-full min-h-[13.75rem] lg:min-h-[26.25rem] object-contain" />
        <div class="absolute top-4 left-4 rounded-full bg-[#1C1B18] text-[#F7F4EE] px-3 py-1.5 font-mono text-[0.5625rem] tracking-[0.2em]">
          {{ data.code }} / STATIC PLATE
        </div>
        <div class="absolute bottom-4 left-4 font-mono text-[0.5625rem] tracking-[0.18em] text-[#1C1B18]/60">
          图版 / 乡村振兴数字展陈
        </div>
      </div>

      <!-- 档案侧 -->
      <div class="relative px-6 sm:px-9 py-8 sm:py-10 flex flex-col justify-center">
        <div class="font-mono text-[0.625rem] tracking-[0.24em] text-[#8A6324] mb-3">{{ data.eyebrow }}</div>
        <h3 class="font-editorial text-2xl sm:text-3xl font-bold leading-tight mb-4">{{ data.title }}</h3>
        <p class="text-sm leading-relaxed text-[#3A3630] mb-5">{{ data.lead }}</p>

        <div class="rounded-2xl border border-[#C88A32]/40 bg-[#C88A32]/8 px-4 py-3 mb-6">
          <div class="text-xs font-semibold mb-1">{{ headline }}</div>
          <div class="text-[0.6875rem] leading-relaxed text-[#1C1B18]/75">{{ hint }}</div>
        </div>

        <div class="space-y-3">
          <div v-for="(p, i) in data.points" :key="p[0]" class="flex gap-3 items-start">
            <span class="font-mono text-[0.625rem] text-[#8A6324] pt-1 shrink-0">{{ String(i + 1).padStart(2, '0') }}</span>
            <div>
              <div class="text-sm font-bold">{{ p[0] }}</div>
              <div class="text-xs leading-relaxed text-[#3A3630] mt-0.5">{{ p[1] }}</div>
            </div>
          </div>
        </div>

        <RouterLink
          :to="data.to"
          class="inline-flex items-center gap-2 self-start mt-7 rounded-full bg-[#1C1B18] text-[#F7F4EE] pl-5 pr-2 py-2 text-xs font-semibold hover:bg-[#C88A32] hover:text-[#1C1B18] transition-colors"
        >
          {{ data.cta }}
          <span class="w-7 h-7 rounded-full bg-[#F7F4EE]/15 flex items-center justify-center"><ArrowUpRight :size="14" /></span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage-fallback {
  background: #FFFDF9;
  color: #1C1B18;
}
</style>
