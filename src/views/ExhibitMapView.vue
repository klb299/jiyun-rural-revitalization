<script setup>
/**
 * 展览地图 / 策展动线
 * 把已开放的十三个展陈单元按「微观 → 工业 → 宏观 → 人文 → 助农 → 痛点」的策展尺度
 * 排成一条抽象横向动线。全页不接任何地图 SDK，不画行政区划边界、省界、县界，
 * 不用任何经纬度或真实地理轮廓；只用刻度、编号、抽象色块与横向时间轴表达策展顺序。
 * 六段分组与先后顺序是策展编排，不是地理方位。
 * 数量表述只写页面里真实可数的单元数：十三个展陈单元、六段尺度。
 */
import { computed } from 'vue'
import { useAppStore } from '../stores/appStore'
import Reveal from '../components/editorial/Reveal.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import { ArrowUpRight, ArrowRight } from 'lucide-vue-next'

// count 为该段真实可数的展陈单元数，既用于刻度尺宽度比例，也用于段级索引，
// 不写覆盖户数、增收金额等未经核实的统计值。
const micro = {
  id: 'seg-micro', no: '01', scale: '微观', en: 'MICRO / SOIL & LAB', count: 2, range: '01–02',
  dot: '#8C583A', deep: true, title: '黑土与实验',
  lead: '从一米剖面与一颗团粒开始，先看清脚下的土地是怎么长出来的。',
  units: [
    { no: '01', name: '黑土地质标本馆', line: '一米剖面分层展开，读懂腐殖质层到黄土母质', to: '/strata-3d' },
    { no: '02', name: '互动科普实验室', line: '团粒孔隙、稻作五阶段与北斗 RTK 三个上手实验', to: '/science' }
  ]
}

const industrial = {
  id: 'seg-industrial', no: '02', scale: '工业', en: 'INDUSTRY / MACHINE & TELEMETRY', count: 2, range: '03–04',
  dot: '#B83828', deep: true, title: '装备与遥测',
  lead: '把一台拖拉机拆开，再把整片平原的作业状态收进一块屏。',
  units: [
    { no: '03', name: '北斗农机解构馆', line: '整车爆炸分解，逐一读取 RTK 天线与动力总成', to: '/machinery-3d' },
    { no: '04', name: '黑土振兴数智驾驶舱', line: '遥测与保供调度，把土壤墒情与农机作业汇总到同一张展台', to: '/dashboard' }
  ]
}

const macro = {
  id: 'seg-macro', no: '03', scale: '宏观', en: 'MACRO / THE PLAIN', count: 1, range: '05–05',
  dot: '#2E5A44', deep: true, title: '平原',
  lead: '镜头拉到最高，用六个视点重新看这片被黑土铺满的平原。',
  units: [
    { no: '05', name: '松辽平原生态沙盘', line: '六视点飞行，看黑土格网、防护林与水系怎么排布', to: '/sandbox-3d' }
  ]
}

const humanities = {
  id: 'seg-humanities', no: '04', scale: '人文', en: 'CULTURE / SEASONS & LOCAL', count: 4, range: '06–09',
  dot: '#C88A32', deep: false, title: '农时与风物',
  lead: '技术之外，是一年二十四节气里人的节奏，和一地长出来的物产。',
  units: [
    { no: '06', name: '一粒米的旅程', line: '五幕物候串起约一百八十天稻作周期', to: '/journey', fig: { src: '/art/rice.svg', alt: '一粒米的旅程：稻穗与一百八十天物候示意' } },
    { no: '07', name: '二十四节气吉林农时谱', line: '把节气与吉林农事一一对应', to: '/solar-terms', fig: { src: '/art/seasons.svg', alt: '二十四节气农时谱：四季色环与刻度示意' } },
    { no: '08', name: '查干湖冬捕生态非遗馆', line: '四段非遗仪轨与一套取之有度的生态智慧', to: '/chagan-lake', fig: { src: '/art/lake.svg', alt: '查干湖冬捕：冰湖同心圆与放射冰裂示意' } },
    { no: '09', name: '吉林风物特产集市', line: '四类物产标注产地、认证与流通方式', to: '/products', fig: { src: '/art/harvest.svg', alt: '吉林风物特产集市：粮仓与谷仓编号示意' } }
  ]
}

const aid = {
  id: 'seg-aid', no: '05', scale: '助农', en: 'MECHANISM / SUPPORT', count: 3, range: '10–12',
  dot: '#8EBACB', deep: false, title: '机制',
  lead: '技术落到地上以后，靠什么组织、靠什么记账、靠什么回到农户。',
  units: [
    { no: '10', name: '助农项目库', line: '六类带农路径，按问题、做法、成效三段整理', to: '/aid-projects' },
    { no: '11', name: '认养一亩田', line: '走一遍从春耕到直邮的示意流程，不产生真实交易', to: '/adopt-a-field' },
    { no: '12', name: '一块地五笔收入', line: '逐条写清收益靠哪几条路径回到农户', to: '/farm-income' }
  ]
}

const pain = {
  id: 'seg-pain', no: '06', scale: '痛点', en: 'LAST MILE / FRICTION', count: 1, range: '13–13',
  dot: '#1C1B18', deep: true, title: '落地',
  lead: '别的展厅讲成果，这里把「为什么落不了地」也摆成一件展品。',
  units: [
    { no: '13', name: '最后一公里实验室', line: '把见效周期、数据孤岛与小农户投入账做成三个实验', to: '/last-mile' }
  ]
}

const segments = [micro, industrial, macro, humanities, aid, pain]

/* ---------------- 第二种策展视角：五大振兴 ----------------
 * 13 个单元仍从 segments 派生，不另写一份清单，新增单元只需在段落与下面的 nos 各补一行。
 * 归属按「这个单元最能说明哪个振兴」判定，每个单元只出现一次，合计 13。
 * 人才与治理的缺口是策展边界，不是遗漏，显式标注为「本展馆未展开」。
 */
const allUnits = segments.flatMap((s) => s.units.map((u) => ({
  ...u, seg: s.scale, segNo: s.no, dot: s.dot, deep: s.deep
})))

const revitalizations = [
  {
    key: 'industry', no: '01', name: '产业振兴', en: 'INDUSTRY', color: '#C88A32',
    goal: '产业兴旺 · 生活富裕', nos: ['03', '04', '06', '09', '11'],
    note: '装备、遥测、溯源、流通与认养，连成从田间到餐桌的产业链。', gaps: []
  },
  {
    key: 'talent', no: '02', name: '人才振兴', en: 'TALENT', color: '#8C583A',
    goal: '人才支撑 · 队伍建设', nos: [],
    note: '本展馆未展开人才培育叙事，科普实验室只作为科教教具原型。',
    gaps: ['谁来种地 / 本土人才培育', '返乡创业与人才下乡服务', '产业带头人与治理人才培育']
  },
  {
    key: 'culture', no: '03', name: '文化振兴', en: 'CULTURE', color: '#B83828',
    goal: '乡风文明 · 社会文明程度', nos: ['07', '08'],
    note: '节气物候与冬捕非遗，是可观赏的乡土文脉。', gaps: []
  },
  {
    key: 'ecology', no: '04', name: '生态振兴', en: 'ECOLOGY', color: '#2E5A44',
    goal: '绿色发展 · 生态支撑点', nos: ['01', '02', '05'],
    note: '黑土剖面、免耕实验与平原沙盘，把耕地与水系放进同一幅图景。', gaps: []
  },
  {
    key: 'organization', no: '05', name: '组织振兴', en: 'ORGANIZATION', color: '#8EBACB',
    goal: '现代乡村社会治理体制', nos: ['10', '12', '13'],
    note: '合作社、托管与统一编码讲清经营组织，治理维度尚未展开。',
    gaps: ['村党组织与村「两委」', '村民自治与村规民约', '新型农村集体经济监管']
  }
]
const unitsOf = (pillar) => allUnits.filter((u) => pillar.nos.includes(u.no))

// 视角写进全局 store：从五大振兴视角点进任一单元，那间展厅与动线续接条
// 会继续沿用同一把尺子，回到地图也保持，不会每次都重置成按尺度看。
const appStore = useAppStore()
const viewMode = computed(() => appStore.lensMode)
const setView = (id) => appStore.setLens(id)
</script>

<template>
  <div class="relative">
    <!-- 01 首屏：一条贯穿整屏的横向刻度动线 + 巨型编号水印 + 六段色块索引 -->
    <section class="relative min-h-[100dvh] bg-[#F7F4EE] flex items-center overflow-hidden">
      <div class="absolute inset-0 coord-rule opacity-60 pointer-events-none"></div>
      <div class="absolute right-[3%] top-[10%] font-editorial font-bold watermark select-none"
        style="font-size: clamp(9rem, 26vw, 22rem)" aria-hidden="true">13</div>
      <div class="absolute -left-[14%] -bottom-[30%] w-[42vw] h-[42vw] min-w-[20rem] min-h-[20rem] rounded-full border border-[#C88A32]/20 pointer-events-none" aria-hidden="true"></div>

      <div class="relative z-10 w-full max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-28">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="eyebrow">EXHIBIT MAP / 展览地图</span>
            <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#6E6960]">JILIN RURAL REVITALIZATION · 一条策展动线</span>
          </div>
        </Reveal>

        <Reveal :delay="80">
          <!-- 首页「参观动线」区块已用「一条动线，走完一片黑土」，此处必须换标题，
               否则从首页点进本页会像没换页。 -->
          <h1 class="display-1 text-[#1C1B18] max-w-4xl"
            style="font-size: clamp(2.7rem, 7vw, 7rem)" aria-label="六个尺度，一张展览总览">
            六个尺度，
            <span class="block text-[#C88A32]" style="font-size: 0.82em">一张展览总览</span>
          </h1>
        </Reveal>

        <Reveal :delay="160">
          <p class="inline-flex items-center gap-2 mt-7 px-3 py-2 rounded-md border border-[#1C1B18]/15 bg-[#FFFDF9]/70 font-mono text-[0.625rem] tracking-[0.14em] text-[#6E6960]">
            <span class="w-2 h-2 rounded-sm bg-[#2E5A44] shrink-0"></span>
            策展动线示意，非行政区划地图
          </p>
        </Reveal>

        <Reveal :delay="220">
          <p class="lede mt-6 max-w-2xl">
            全展十三个展陈单元按尺度递进排成一条线：从一米黑土剖面走到装备与遥测，越过平原，落进农时与风物，再落到助农机制与落地痛点。刻度与色块只用来数清单元、看清顺序，点开任一段就能直接进到那一间展厅。
          </p>
        </Reveal>

        <Reveal :delay="300">
          <div class="flex flex-wrap gap-3 mt-8">
            <a href="#seg-micro" class="mag-btn"><span>沿动线走一遍</span><span class="mag-btn__island"><ArrowRight :size="16" /></span></a>
            <RouterLink to="/about#data-notes" class="mag-btn mag-btn--light"><span>看展陈数据口径</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></RouterLink>
          </div>
        </Reveal>

        <!-- 横向刻度动线：独立横滑容器，不撑破页面 -->
        <div class="mt-12 sm:mt-16">
          <div class="h-3 w-full opacity-70"
            style="background-image: repeating-linear-gradient(to right, rgba(28,27,24,0.28) 0 1px, transparent 1px 18px)" aria-hidden="true"></div>
          <div class="overflow-x-auto pb-3">
            <div class="flex min-w-[45rem] gap-1.5 pt-1.5">
              <a v-for="seg in segments" :key="seg.id" :href="'#' + seg.id"
                class="group relative flex flex-col justify-between min-w-[6.875rem] min-h-[8rem] p-3 sm:p-4 rounded-t-md transition-transform duration-500 hover:-translate-y-1"
                :class="seg.deep ? 'text-[#F7F4EE]' : 'text-[#1C1B18]'"
                :style="{ flex: seg.count + ' 1 0%', background: seg.dot }">
                <div class="flex items-baseline justify-between gap-2">
                  <span class="font-mono text-[0.625rem] tracking-[0.18em] opacity-80">{{ seg.no }} / 06</span>
                  <span class="font-mono text-[0.5625rem] tracking-[0.14em] opacity-70">{{ seg.range }}</span>
                </div>
                <div class="mt-5">
                  <div class="font-editorial text-lg sm:text-2xl font-bold leading-tight">{{ seg.scale }}</div>
                  <div class="font-mono text-[0.5625rem] tracking-[0.12em] opacity-75 mt-1 truncate">{{ seg.en }}</div>
                </div>
                <div class="mt-4 flex items-center gap-1.5">
                  <span v-for="u in seg.units" :key="u.no" class="w-1.5 h-1.5 rounded-full bg-current opacity-55"></span>
                  <span class="ml-auto font-mono text-[0.5625rem] tracking-[0.14em] opacity-80">↗</span>
                </div>
              </a>
            </div>
          </div>
          <div class="h-[3px] w-full bg-[#1C1B18]/70" aria-hidden="true"></div>
          <div class="flex flex-wrap items-center justify-between gap-2 mt-2 font-mono text-[0.5625rem] tracking-[0.16em] text-[#6E6960]">
            <RouterLink to="/" class="link-line">00 / 序厅 · 建立整片黑土的坐标</RouterLink>
            <span>13 / 十三个展陈单元 · 动线终点</span>
          </div>
        </div>

        <Reveal :delay="260">
          <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <a v-for="seg in segments" :key="'lg-' + seg.id" :href="'#' + seg.id"
              class="inline-flex items-center gap-2 group">
              <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ background: seg.dot }"></span>
              <span class="font-mono text-[0.5625rem] tracking-[0.14em] text-[#6E6960] group-hover:text-[#8A6324] transition-colors">{{ seg.no }} {{ seg.scale }} · {{ seg.count }} 个单元</span>
            </a>
          </div>
        </Reveal>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#1C1B18]/10 bg-[#1C1B18] py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[0.625rem] tracking-[0.22em] text-[#FFFDF9]/95 whitespace-nowrap">
            <span>微观 / 工业 / 宏观</span><span class="text-[#C88A32]">✳</span>
            <span>人文 / 助农 / 痛点</span><span class="text-[#C88A32]">✳</span>
            <span>十三个展陈单元，一条策展动线</span><span class="text-[#C88A32]">✳</span>
            <span>策展动线示意，非行政区划地图</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 01b 政策视角：同一批 13 个单元，按尺度 / 按五大振兴两种归组方式 -->
    <section class="relative surface-linen border-y border-[#1C1B18]/10 overflow-hidden">
      <div class="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style="background: linear-gradient(90deg, transparent, rgba(200,138,50,.55), transparent)"></div>
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div class="lg:col-span-7">
            <div class="eyebrow mb-4">POLICY LENS / 换一把尺子</div>
            <h2 class="display-2 lens-title text-[#1C1B18]">同一座展馆，两种看法</h2>
            <p class="lede mt-5 max-w-2xl">
              按尺度看是策展顺序，按五大振兴看是政策坐标。十三个单元不增不减，只是重新归位，尚未展开的维度会如实标注，不硬凑满五项。
            </p>
          </div>
          <div class="lg:col-span-5 flex lg:justify-end">
            <div class="inline-flex items-center p-1 rounded-full bg-[#1C1B18] shadow-[0_18px_40px_-24px_rgba(28,27,24,.7)]">
              <button v-for="opt in [
                { id: 'scale', label: '按尺度看' },
                { id: 'revital', label: '按五大振兴看' }
              ]" :key="opt.id" @click="setView(opt.id)"
                class="w-[7.75rem] sm:w-[9.5rem] py-2.5 rounded-full text-[0.6875rem] sm:text-xs font-bold tracking-[0.08em] transition-all duration-500 cursor-pointer"
                :class="viewMode === opt.id
                  ? 'bg-[#C88A32] text-[#1C1B18] shadow-[inset_0_1px_0_rgba(255,255,255,.38)]'
                  : 'bg-[#1C1B18] text-[#F7F4EE]/78 hover:text-[#F7F4EE]'">
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-10 sm:mt-12 min-h-[22.5rem] sm:min-h-[26.25rem]">
          <Transition name="lens" mode="out-in">
            <!-- 视角 A：六段尺度 -->
            <div v-if="viewMode === 'scale'" key="scale" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="(seg, i) in segments" :key="seg.id" class="lens-item group relative bg-[#FFFDF9] border border-[#1C1B18]/10 rounded-2xl p-5 sm:p-6 overflow-hidden lift"
                :style="{ '--lens-i': i }">
                <div class="absolute top-0 left-0 right-0 h-1" :style="{ background: seg.dot }"></div>
                <div class="flex items-baseline justify-between gap-2 mb-4">
                  <span class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#6E6960]">{{ seg.no }} / 06 · {{ seg.range }}</span>
                  <span class="font-mono text-[0.625rem] tracking-[0.14em] text-[#6E6960]">{{ seg.count }} 个单元</span>
                </div>
                <div class="font-editorial text-xl font-bold text-[#1C1B18]">{{ seg.scale }} · {{ seg.title }}</div>
                <div class="font-mono text-[0.625rem] tracking-[0.12em] text-[#6E6960] mt-1">{{ seg.en }}</div>
                <p class="text-[0.6875rem] leading-[1.85] text-[#5A564E] mt-3">{{ seg.lead }}</p>
                <div class="mt-4 pt-3 border-t border-[#1C1B18]/10 space-y-1.5">
                  <RouterLink v-for="u in seg.units" :key="u.no" :to="u.to" class="flex items-center gap-2 group/link">
                    <span class="font-mono text-[0.5625rem] text-[#8A6324] w-5 shrink-0">{{ u.no }}</span>
                    <span class="text-[0.75rem] text-[#3A3630] group-hover/link:text-[#8A6324] transition-colors truncate">{{ u.name }}</span>
                    <ArrowUpRight :size="12" class="ml-auto shrink-0 text-[#8A6324]" />
                  </RouterLink>
                </div>
              </div>
            </div>

            <!-- 视角 B：五大振兴 -->
            <div v-else key="revital" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div v-for="(pillar, i) in revitalizations" :key="pillar.key"
                class="lens-item relative bg-[#FFFDF9] border border-[#1C1B18]/10 rounded-2xl p-4 sm:p-5 flex flex-col"
                :style="{ '--lens-i': i }">
                <div class="h-[3px] w-10 rounded-full mb-4" :style="{ background: pillar.color }"></div>
                <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#6E6960]">{{ pillar.no }} / 05</div>
                <div class="font-editorial text-lg font-bold text-[#1C1B18] mt-1">{{ pillar.name }}</div>
                <div class="font-mono text-[0.5625rem] tracking-[0.14em] text-[#6E6960] mt-0.5">{{ pillar.en }}</div>
                <div class="text-[0.6875rem] leading-[1.6] text-[#8A6324] mt-2">{{ pillar.goal }}</div>

                <div class="mt-4 pt-3 border-t border-[#1C1B18]/10 flex-1 space-y-1.5">
                  <RouterLink v-for="u in unitsOf(pillar)" :key="u.no" :to="u.to"
                    class="flex items-center gap-2 rounded-lg bg-[#EFECE6]/70 px-2.5 py-2 hover:bg-[#C88A32]/15 transition-colors duration-300">
                    <span class="font-mono text-[0.5625rem] text-[#8A6324] w-5 shrink-0">{{ u.no }}</span>
                    <span class="text-[0.6875rem] leading-snug text-[#3A3630]">{{ u.name }}</span>
                  </RouterLink>
                  <div v-if="!pillar.nos.length" class="rounded-lg border border-dashed border-[#1C1B18]/25 bg-[#EFECE6]/60 px-2.5 py-3">
                    <div class="font-mono text-[0.5625rem] tracking-[0.16em] text-[#8A6324] mb-1">本展馆未展开</div>
                    <p class="text-[0.625rem] leading-[1.7] text-[#5A564E]">{{ pillar.note }}</p>
                  </div>
                  <div v-for="g in pillar.gaps" :key="g" class="flex items-start gap-2 rounded-lg border border-dashed border-[#1C1B18]/18 px-2.5 py-2">
                    <span class="w-1 h-1 rounded-full bg-[#8C867B] mt-1.5 shrink-0"></span>
                    <span class="text-[0.6875rem] leading-[1.6] text-[#6E6960]">{{ g }}</span>
                  </div>
                </div>

                <div class="mt-3 text-[0.625rem] leading-[1.65] text-[#6E6960]" v-if="pillar.nos.length">{{ pillar.note }}</div>
                <div class="mt-3 pt-3 border-t border-[#1C1B18]/10 flex items-center justify-between gap-2">
                  <span class="font-mono text-[0.625rem] tracking-[0.14em] text-[#6E6960]">{{ pillar.nos.length }} 个展陈单元</span>
                  <span v-if="pillar.gaps.length" class="font-mono text-[0.625rem] text-[#8A6324]">待展开 {{ pillar.gaps.length }}</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="mt-9 pt-5 border-t border-[#1C1B18]/10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <span class="font-mono text-[0.5625rem] tracking-[0.16em] text-[#6E6960]">二十字总要求 / 产业兴旺 · 生态宜居 · 乡风文明 · 治理有效 · 生活富裕</span>
          <span class="text-[0.625rem] text-[#5A564E]">五个振兴共同指向农业全面升级、农村全面进步、农民全面发展</span>
        </div>
      </div>
    </section>

    <!-- 02 微观 · 黑土与实验：浅底，段头与纵排索引卡在左，图版框在右 -->
    <section :id="micro.id" class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <Reveal class="lg:col-span-5">
          <div class="flex items-center gap-3">
            <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324]">{{ micro.no }} / 06</span>
            <span class="w-3 h-3 rounded-sm" :style="{ background: micro.dot }"></span>
            <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#6E6960]">{{ micro.en }}</span>
          </div>
          <h2 class="display-2 mt-5 text-[#1C1B18]">{{ micro.scale }} · {{ micro.title }}</h2>
          <p class="lede mt-5 max-w-md">{{ micro.lead }}</p>
          <div class="mt-9 space-y-3">
            <RouterLink v-for="u in micro.units" :key="u.no" :to="u.to"
              class="group flex items-start gap-4 p-5 bg-[#FFFDF9] border border-[#1C1B18]/10 lift">
              <span class="font-editorial text-2xl font-bold text-[#8A6324] w-9 shrink-0">{{ u.no }}</span>
              <span class="flex-1">
                <span class="block font-editorial text-lg font-bold text-[#1C1B18] group-hover:text-[#8A6324] transition-colors">{{ u.name }}</span>
                <span class="block text-[0.75rem] leading-[1.8] text-[#5A564E] mt-1">{{ u.line }}</span>
              </span>
              <ArrowUpRight :size="16" class="text-[#8A6324] arrow-shift shrink-0 mt-1" />
            </RouterLink>
          </div>
        </Reveal>

        <Reveal :delay="140" variant="scale" class="lg:col-span-7">
          <FigurePlate src="/art/soil-strata.svg" ratio="aspect-[3/2]" index="01–02"
            alt="黑土地质标本馆：一米黑土剖面的分层与深度标尺示意"
            caption="标本馆按真实层厚堆叠一米剖面，深度标尺为教学演示口径；剖面条带不是地理方位。" />
        </Reveal>
      </div>
    </section>

    <!-- 03 工业 · 装备与遥测：墨色展墙反白，横排段头，左侧图版框，右侧两列索引卡 -->
    <section :id="industrial.id" class="surface-ink border-y border-[#F7F4EE]/10">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <div class="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div class="flex items-center gap-3">
                <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324]">{{ industrial.no }} / 06</span>
                <span class="w-3 h-3 rounded-sm" :style="{ background: industrial.dot }"></span>
                <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#FFFDF9]/95">{{ industrial.en }}</span>
              </div>
              <h2 class="display-2 mt-5 text-[#F7F4EE]">{{ industrial.scale }} · {{ industrial.title }}</h2>
            </div>
            <p class="lede text-[#FFFDF9]/95 max-w-md">{{ industrial.lead }}</p>
          </div>
        </Reveal>

        <div class="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Reveal :delay="120" class="lg:col-span-5">
            <FigurePlate dark src="/art/machine.svg" ratio="aspect-[3/2]" index="03–04"
              alt="北斗农机解构馆：整车爆炸分解与 RTK 天线示意"
              caption="工程图纸式图版，标注为装配示意，不是行政区划地图，也不对应真实地理方位。" />
          </Reveal>
          <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Reveal v-for="(u, i) in industrial.units" :key="u.no" :delay="180 + i * 80">
              <RouterLink :to="u.to"
                class="group h-full min-h-[13.125rem] flex flex-col justify-between p-6 border border-[#F7F4EE]/18 bg-[#F7F4EE]/5 hover:bg-[#F7F4EE]/10 transition-colors duration-500">
                <div class="flex items-start justify-between gap-3">
                  <span class="font-editorial text-4xl font-bold text-[#C88A32]">{{ u.no }}</span>
                  <ArrowUpRight :size="16" class="text-[#C88A32] arrow-shift" />
                </div>
                <div>
                  <div class="font-editorial text-xl font-bold text-[#F7F4EE] mb-2 group-hover:text-[#C88A32] transition-colors">{{ u.name }}</div>
                  <div class="text-[0.75rem] leading-[1.85] text-[#FFFDF9]/95">{{ u.line }}</div>
                </div>
              </RouterLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>

    <!-- 04 宏观 · 平原：苔藓青实心段，抽象网格图版在左，单一焦点单元在右 -->
    <section :id="macro.id" class="bg-[#2E5A44]">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <Reveal :delay="120" variant="scale" class="lg:col-span-7">
            <FigurePlate dark src="/art/diorama.svg" ratio="aspect-[3/2]" index="05"
              alt="宏观尺度段图版：三乘三抽象色块网格与蜿蜒曲线，表达策展顺序"
              caption="三乘三抽象色块网格只用来表达策展顺序，不是行政区划地图，不画省界县界，也不含经纬度。" />
          </Reveal>
          <Reveal class="lg:col-span-5">
            <div class="relative">
              <span class="absolute -top-16 -left-2 font-editorial font-bold text-[#F7F4EE]/10 select-none pointer-events-none"
                style="font-size: clamp(7rem, 14vw, 12rem); line-height: 1" aria-hidden="true">05</span>
              <div class="relative flex items-center gap-3">
                <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324]">{{ macro.no }} / 06</span>
                <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#FFFDF9]/95">{{ macro.en }}</span>
              </div>
              <h2 class="display-2 mt-5 text-[#F7F4EE]">{{ macro.scale }} · {{ macro.title }}</h2>
              <p class="lede text-[#FFFDF9]/96 mt-5">{{ macro.lead }}</p>
              <RouterLink v-for="u in macro.units" :key="u.no" :to="u.to"
                class="group mt-9 block border-t border-[#F7F4EE]/25 pt-6">
                <div class="flex items-center gap-3">
                  <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#8A6324]">{{ u.no }} / 单一焦点</span>
                  <ArrowUpRight :size="16" class="text-[#C88A32] arrow-shift" />
                </div>
                <div class="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F4EE] mt-3 group-hover:text-[#C88A32] transition-colors">{{ u.name }}</div>
                <div class="text-[0.8125rem] leading-[1.9] text-[#FFFDF9]/96 mt-3">{{ u.line }}</div>
              </RouterLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 05 人文 · 农时与风物：亚麻底，段头在上，四张带缩略图版的索引卡横排 -->
    <section :id="humanities.id" class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <div class="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div class="flex items-center gap-3">
                <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324]">{{ humanities.no }} / 06</span>
                <span class="w-3 h-3 rounded-sm" :style="{ background: humanities.dot }"></span>
                <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#6E6960]">{{ humanities.en }}</span>
              </div>
              <h2 class="display-2 mt-5 text-[#1C1B18]">{{ humanities.scale }} · {{ humanities.title }}</h2>
            </div>
            <p class="lede max-w-md">{{ humanities.lead }}</p>
          </div>
        </Reveal>

        <div class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Reveal v-for="(u, i) in humanities.units" :key="u.no" :delay="i * 70">
            <RouterLink :to="u.to" class="group block h-full bg-[#FFFDF9] border border-[#1C1B18]/10 lift overflow-hidden">
              <div class="relative aspect-[3/2] overflow-hidden bg-[#EFECE6]">
                <img :src="u.fig.src" :alt="u.fig.alt" loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-[1.05]" />
              </div>
              <div class="p-5">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#8A6324]">{{ u.no }} / 09</span>
                  <ArrowUpRight :size="15" class="text-[#8A6324] arrow-shift" />
                </div>
                <div class="font-editorial text-lg font-bold text-[#1C1B18] mt-3 group-hover:text-[#8A6324] transition-colors">{{ u.name }}</div>
                <div class="text-[0.75rem] leading-[1.8] text-[#5A564E] mt-2">{{ u.line }}</div>
              </div>
            </RouterLink>
          </Reveal>
        </div>
        <Reveal :delay="160">
          <p class="caption mt-7">四张图版分别为稻穗、四季色环、冰湖同心圆与粮仓编号，均为抽象示意，不含行政区划边界与经纬度。</p>
        </Reveal>
      </div>
    </section>

    <!-- 06 助农 · 机制：纸白底，三张实心色块卡横排，每卡一个大编号 -->
    <section :id="aid.id" class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div class="flex items-center gap-3">
              <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324]">{{ aid.no }} / 06</span>
              <span class="w-3 h-3 rounded-sm" :style="{ background: aid.dot }"></span>
              <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#6E6960]">{{ aid.en }}</span>
            </div>
            <h2 class="display-2 mt-5 text-[#1C1B18]">{{ aid.scale }} · {{ aid.title }}</h2>
          </div>
          <p class="lede max-w-md">{{ aid.lead }}</p>
        </div>
      </Reveal>

      <div class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Reveal v-for="(u, i) in aid.units" :key="u.no" :delay="i * 80">
          <RouterLink :to="u.to"
            class="group relative block h-full min-h-[14.375rem] p-6 card-linen border border-[#1C1B18]/10 lift overflow-hidden">
            <span class="absolute top-0 left-0 right-0 h-1.5"
              :style="{ background: ['#8EBACB', '#C88A32', '#2E5A44'][i] }" aria-hidden="true"></span>
            <span class="absolute -right-2 -bottom-8 font-editorial font-bold text-[#1C1B18]/6 select-none pointer-events-none"
              style="font-size: 8rem; line-height: 1" aria-hidden="true">{{ u.no }}</span>
            <div class="relative flex flex-col h-full justify-between">
              <div class="flex items-start justify-between gap-3">
                <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#8A6324]">{{ u.no }} / 12</span>
                <ArrowUpRight :size="16" class="text-[#8A6324] arrow-shift" />
              </div>
              <div>
                <div class="font-editorial text-2xl font-bold text-[#1C1B18] mb-2 group-hover:text-[#8A6324] transition-colors">{{ u.name }}</div>
                <div class="text-[0.75rem] leading-[1.85] text-[#5A564E]">{{ u.line }}</div>
              </div>
            </div>
          </RouterLink>
        </Reveal>
      </div>
    </section>

    <!-- 07 痛点 · 落地：墨色实心收束段，巨型编号水印 + 单一单元入口 -->
    <section :id="pain.id" class="bg-[#1C1B18]">
      <div class="relative max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-24 sm:py-32 overflow-hidden">
        <span class="absolute right-[2%] -top-6 font-editorial font-bold text-[#F7F4EE]/6 select-none pointer-events-none"
          style="font-size: clamp(9rem, 24vw, 20rem); line-height: 1" aria-hidden="true">13</span>
        <Reveal>
          <div class="relative max-w-2xl">
            <div class="flex items-center gap-3">
              <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324]">{{ pain.no }} / 06 · 动线终点</span>
              <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#FFFDF9]/95">{{ pain.en }}</span>
            </div>
            <h2 class="display-2 mt-6 text-[#F7F4EE]">{{ pain.scale }} · {{ pain.title }}</h2>
            <p class="lede text-[#FFFDF9]/96 mt-6">{{ pain.lead }}</p>
            <RouterLink v-for="u in pain.units" :key="u.no" :to="u.to"
              class="group inline-flex items-center gap-4 mt-10 min-h-[2.75rem]">
              <span class="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F4EE] group-hover:text-[#C88A32] transition-colors">{{ u.name }}</span>
              <ArrowUpRight :size="22" class="text-[#C88A32] arrow-shift" />
            </RouterLink>
            <div class="text-[0.75rem] leading-[1.9] text-[#FFFDF9]/95 mt-4">{{ pain.units[0].line }}</div>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- 08 收束：诚实的参观说明 + 白皮书 / 数据口径 / 痛点 / 返回序厅 -->
    <section class="surface-linen border-t border-[#1C1B18]/10">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div class="lg:col-span-5">
              <div class="eyebrow mb-4">VISIT NOTE / 参观说明</div>
              <h2 class="display-2 text-[#1C1B18]">关于这座展馆</h2>
              <p class="lede mt-6">
                本站不依赖后端服务，页面、图版与三个展厅都在本地打包，断网也能完整参观；展陈里的读数、编号与流程均为教学演示，不代表真实产量、真实交易或统计结论。本页的六段尺度与先后顺序是策展编排，不是地理方位，刻度与色块只用来数清单元。
              </p>
              <p class="font-mono text-[0.625rem] tracking-[0.14em] text-[#6E6960] mt-6">策展动线示意，非行政区划地图</p>
            </div>
            <div class="lg:col-span-7">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div v-for="n in [
                  { k: 'NOTE 01', t: '不依赖后端', d: '没有账号、下单或数据回传，参观不被服务端状态打断。' },
                  { k: 'NOTE 02', t: '断网可参观', d: '资源随页面一起加载，离线也能走完这条动线。' },
                  { k: 'NOTE 03', t: '数据为教学演示', d: '读数只表达趋势与关系，不写覆盖户数与增收金额。' }
                ]" :key="n.k" class="bg-[#FFFDF9] border border-[#1C1B18]/10 p-5">
                  <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#8A6324] mb-4">{{ n.k }}</div>
                  <div class="font-editorial text-lg font-bold text-[#1C1B18] mb-2">{{ n.t }}</div>
                  <div class="text-[0.6875rem] leading-[1.85] text-[#5A564E]">{{ n.d }}</div>
                </div>
              </div>

              <div class="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RouterLink v-for="n in [
                  { to: '/about#data-notes', k: 'DATA / 口径', t: '展陈数据口径与来源', d: '查附录 A 与附录 B 的公开资料' },
                  { to: '/last-mile', k: 'LAST MILE / 痛点', t: '最后一公里实验室', d: '回到动线终点，看三个落地实验' },
                  { to: '/about', k: 'WHITE PAPER / 说明', t: '长春智库与答辩白皮书', d: '收束区说明，不算展陈单元' },
                  { to: '/', k: 'FOYER / 序厅', t: '返回序厅', d: '从整片黑土的坐标重新出发' }
                ]" :key="n.to" :to="n.to"
                  class="group bg-[#FFFDF9]/70 border border-[#1C1B18]/10 p-5 lift">
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#8A6324]">{{ n.k }}</span>
                    <ArrowUpRight :size="15" class="text-[#8A6324] arrow-shift" />
                  </div>
                  <div class="font-editorial text-lg font-bold text-[#1C1B18] mt-3 group-hover:text-[#8A6324] transition-colors">{{ n.t }}</div>
                  <div class="text-[0.6875rem] leading-[1.8] text-[#5A564E] mt-1">{{ n.d }}</div>
                </RouterLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
</template>
