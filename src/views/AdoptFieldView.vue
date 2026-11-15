<script setup>
/**
 * 认养一亩田（教学演示）
 * 全部地块编号、流程、凭证均为示意，不对应真实地块、农户或交易。
 * 项目类型与农时环节沿用公开可查的现实做法，不编人名与统计数字。
 */
import { ref, computed } from 'vue'
import Reveal from '../components/editorial/Reveal.vue'
import PhotoNote from '../components/editorial/PhotoNote.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import { ArrowUpRight, ArrowRight, Check, Sprout } from 'lucide-vue-next'

/* 数据接入演示：切换后展示「接了真实业务系统」时认养档案的字段结构与交互形态。
   人名、编号、读数、凭证全部虚构，页面内明确标注，不产生真实认养关系。 */
const showMock = ref(false)
const mockFields = [
  { k: '认养人 / HOLDER', v: '李慕农（虚构）' },
  { k: '地块编号 / PLOT', v: 'A2-07' },
  { k: '认养面积 / AREA', v: '1.0 亩' },
  { k: '当前农事 / STAGE', v: '秋收已完成' },
  { k: '预计产量 / YIELD', v: '620 kg（演示值）' },
  { k: '凭证编号 / CERT', v: 'JY-2026-A2-07' }
]

const plots = [
  { id: 'A-01', zone: '中部平原 · 旱田', crop: '黄金玉米', type: '秸秆覆盖免耕推广', season: '4 月下播种 / 9 月下收获', color: '#8C583A' },
  { id: 'A-02', zone: '中部灌区 · 水田', crop: '优质粳稻', type: '稻米一袋一码溯源', season: '5 月中插秧 / 10 月初收割', color: '#2E5A44' },
  { id: 'A-03', zone: '中部平原 · 旱田', crop: '高油大豆', type: '北斗农机共享作业', season: '4 月下播种 / 9 月末收获', color: '#C88A32' },
  { id: 'A-04', zone: '东南山地 · 林下', crop: '椴树蜜与林特', type: '林下特产标准化采集', season: '6–7 月花期取蜜', color: '#B83828' },
  { id: 'A-05', zone: '西北湖泊 · 水域', crop: '生态胖头鱼', type: '冬捕非遗与生态研学', season: '12 月末冬捕季', color: '#8EBACB' },
  { id: 'A-06', zone: '全省产区 · 产地仓', crop: '杂粮与谷物', type: '电商直采与产地仓', season: '全年分批次直发', color: '#1C1B18' }
]

const steps = [
  { no: '01', name: '春耕备耕', time: '4 月 – 5 月', stage: 0, icon: '春',
    desc: '确认示意地块、品种与全年农事计划。秸秆覆盖的旱田不翻耕，水田泡田打浆，合作社统一调度免耕播种机与北斗农机。',
    note: '这一步决定后面所有作业能否沿着同一条线走。' },
  { no: '02', name: '夏管巡田', time: '6 月 – 8 月', stage: 1, icon: '夏',
    desc: '无人机多光谱巡田、浅水勤灌、稻蟹共生或玉米追肥。每一次作业都记进地块农事档案，成为日后扫码能看到的内容。',
    note: '长势记录不是给观众看的，是给收购与检测留的依据。' },
  { no: '03', name: '秋收烘干', time: '9 月 – 10 月', stage: 3, icon: '秋',
    desc: '联合收割机按地块分批脱粒，原粮进入低温慢烘塔，同步留样检测。分批而不是混仓，是一袋一码能成立的前提。',
    note: '整精米率与食味值，多半是在这一步定下来的。' },
  { no: '04', name: '分装直邮', time: '10 月以后', stage: 4, icon: '冬',
    desc: '按批次分装、赋码、预冷，冷链直发消费端。包装上能读到产区方位、农事节点与检测报告，不写具体农户姓名。',
    note: '缩短链路，产地才更早知道下一季该种什么。' }
]

const growth = [
  { k: '备耕', d: '地块整理、育秧与底肥准备' },
  { k: '出苗', d: '出苗齐整，进入田间普查' },
  { k: '旺长', d: '分蘖拔节，水肥与植保跟进' },
  { k: '成熟', d: '灌浆落干，籽粒定型' },
  { k: '收储', d: '分批收割、烘干与入仓' }
]

// level 只用于条形视觉长短，不代表金额或比例，源码里不写具体百分数
const flows = [
  { k: '种植端', d: '籽粒与劳务所得，是这几笔收入里最基础的一笔', level: 4 },
  { k: '村集体与合作社', d: '统一组织作业、仓储与议价，按约定方式分配', level: 3 },
  { k: '加工与冷链', d: '烘干、分级、包装与运输产生的实际成本', level: 2 },
  { k: '服务与平台', d: '农技、溯源、导览与订单履约的服务成本', level: 1 }
]

const activePlot = ref(0)
const activeStep = ref(0)
const stageIndex = ref(0)
const certificate = ref(false)

const plot = computed(() => plots[activePlot.value])
const step = computed(() => steps[activeStep.value])

const pickStep = (i) => {
  activeStep.value = i
  stageIndex.value = steps[i].stage
}

// 拖动时间轴时同步左侧流程高亮，避免两处状态各说各话
const syncStepFromStage = () => {
  const i = steps.findIndex((s) => s.stage === stageIndex.value)
  if (i >= 0) activeStep.value = i
}

const makeCertificate = () => { certificate.value = true }
</script>

<template>
  <div class="relative">
    <!-- 01 首屏：演示声明 + 地块俯视示意 -->
    <section class="relative min-h-[100dvh] overflow-hidden flex items-center"
      style="background: linear-gradient(148deg, #F0DFC0 0%, #E4BE79 48%, #C88A32 100%)">
      <div class="absolute inset-0 coord-rule opacity-30 pointer-events-none"></div>
      <div data-parallax="-8" class="absolute -left-[12%] -bottom-[26%] w-[42vw] h-[42vw] min-w-[22.5rem] min-h-[22.5rem] rounded-full bg-[#FFFDF9]/15 blur-2xl pointer-events-none"></div>

      <div class="relative z-10 w-full max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24">
        <!-- 演示声明放最前，不藏在小字里 -->
        <Reveal>
          <div class="mb-8 inline-flex flex-wrap items-center gap-3 rounded-full border border-[#1C1B18]/35 bg-[#FFFDF9]/75 px-4 py-2.5">
            <span class="w-2 h-2 rounded-full bg-[#B83828] shrink-0"></span>
            <span class="text-[0.6875rem] font-semibold text-[#1C1B18]">教学演示的认养流程示意</span>
            <span class="text-[0.6875rem] text-[#5A564E]">不产生真实交易，不对应真实地块与农户，不收集个人信息</span>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-6">
            <Reveal><div class="eyebrow mb-6 text-[#1C1B18]">ADOPT A FIELD / 认养一亩田</div></Reveal>
            <h1 class="display-1 text-[#1C1B18]" aria-label="认养一亩 黑土地">
              <span v-for="(ch, i) in Array.from('认养一亩')" :key="'a' + i" class="kin-char"
                :style="{ animationDelay: (0.14 + i * 0.07) + 's' }">{{ ch }}</span>
              <span class="block whitespace-nowrap text-[#1C1B18]" :style="{ fontSize: '0.78em' }">
                <span v-for="(ch, i) in Array.from('黑土地')" :key="'b' + i" class="kin-char"
                  :style="{ animationDelay: (0.46 + i * 0.08) + 's' }">{{ ch }}</span>
              </span>
            </h1>
            <Reveal :delay="580">
              <p class="font-editorial text-lg sm:text-2xl text-[#1C1B18]/80 mt-7">把那 180 天，从旁观变成跟着走一遍</p>
            </Reveal>
            <Reveal :delay="660">
              <p class="lede text-[#1C1B18]/82 mt-5 max-w-xl">
                「一粒米的旅程」讲的是米怎么走完一季，这里让你先选一块示意地块，再顺着春耕、夏管、秋收、直邮四步看下去。地块编号与凭证都是演示用的，项目类型与农时环节来自公开做法。
              </p>
            </Reveal>
            <Reveal :delay="740">
              <div class="flex flex-wrap gap-3 mt-9">
                <a href="#process" class="mag-btn"><span>走一遍认养流程</span><span class="mag-btn__island"><ArrowRight :size="16" /></span></a>
                <RouterLink to="/farm-income" class="mag-btn mag-btn--light"><span>看收益怎么分配</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></RouterLink>
              </div>
            </Reveal>
            <Reveal :delay="820">
              <div class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
                <div v-for="n in [
                  { k: 'PLOTS', v: '6 块示意地块' },
                  { k: 'STEPS', v: '4 步农事流程' },
                  { k: 'STAGES', v: '5 个生长阶段' }
                ]" :key="n.k" class="border-t border-[#1C1B18]/30 pt-3">
                  <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#1C1B18]/70">{{ n.k }}</div>
                  <div class="text-[0.6875rem] mt-1.5 text-[#1C1B18]">{{ n.v }}</div>
                </div>
              </div>
            </Reveal>
          </div>

          <!-- 田块俯视示意 + 地块档案 -->
          <Reveal :delay="220" variant="scale" class="lg:col-span-6" data-parallax="-6">
            <div class="bezel">
              <div class="bezel-core p-5 sm:p-6">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-5">
                  <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#6E6960]">PLOT INDEX / 地块索引</span>
                  <span class="font-mono text-[0.5625rem] tracking-[0.14em] text-[#8A6324]">示意分区，非真实地块</span>
                </div>
                <div class="grid grid-cols-3 gap-2.5">
                  <button v-for="(p, i) in plots" :key="p.id" @click="activePlot = i; certificate = false"
                    class="group relative aspect-[4/3] border text-left p-3 transition-all duration-500 cursor-pointer overflow-hidden"
                    :class="activePlot === i ? 'border-[#1C1B18] ring-2 ring-[#1C1B18]/25' : 'border-[#1C1B18]/12 hover:border-[#1C1B18]/40'">
                    <span class="absolute inset-0 opacity-14" :style="{ background: `repeating-linear-gradient(90deg, ${p.color} 0 0.3125rem, transparent 0.3125rem 0.875rem)` }"></span>
                    <span class="relative font-mono text-[0.625rem] font-bold text-[#1C1B18]">{{ p.id }}</span>
                    <span class="relative block text-[0.6875rem] font-semibold leading-snug text-[#1C1B18] mt-2">{{ p.crop }}</span>
                  </button>
                </div>
                <div class="mt-5 pt-4 border-t border-[#1C1B18]/10 grid grid-cols-2 gap-3">
                  <div>
                    <div class="font-mono text-[0.5625rem] tracking-[0.16em] text-[#6E6960] mb-1">示意地块</div>
                    <div class="font-editorial text-lg font-bold">{{ plot.id }} · {{ plot.crop }}</div>
                  </div>
                  <div>
                    <div class="font-mono text-[0.5625rem] tracking-[0.16em] text-[#6E6960] mb-1">方位与农时</div>
                    <div class="text-[0.6875rem] text-[#3A3630]">{{ plot.zone }} · {{ plot.season }}</div>
                  </div>
                  <div class="col-span-2">
                    <div class="font-mono text-[0.5625rem] tracking-[0.16em] text-[#6E6960] mb-1">对应公开项目类型</div>
                    <div class="text-[0.75rem] font-semibold text-[#8A6324]">{{ plot.type }}</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#1C1B18]/15 bg-[#1C1B18] py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[0.625rem] tracking-[0.22em] text-[#F7F4EE]/86 whitespace-nowrap">
            <span>春耕备耕 / 夏管巡田</span><span class="text-[#C88A32]">✳</span>
            <span>秋收烘干 / 分装直邮</span><span class="text-[#C88A32]">✳</span>
            <span>一袋一码 · 分批留样 · 冷链直达</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 田野实景：首屏与内容之间的一处真实影像，避免全页程序化图形 -->
    <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-14 sm:pt-20">
      <Reveal>
        <PhotoNote src="/photos/seedlings.jpg" alt="育秧盘中的幼苗实景" label="FIELD NOTE / 育秧与农时" note="认养流程是教学演示，不产生真实交易。照片只用来对照一季农事从育秧开始的真实节奏。" />
      </Reveal>
    </section>

    <!-- 02 四步流程 + 生长时间轴 -->
    <section id="process" class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="01 / 03" eyebrow="FOUR STEPS / 认养流程" title="跟着一块地，走完一季"
          description="点任一步切换，右侧生长阶段会同步跳到对应位置。流程与农时来自公开做法，地块与凭证是演示用。" />
      </Reveal>

      <div class="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-5 space-y-3" data-stagger>
          <Reveal v-for="(s, i) in steps" :key="s.no" :delay="i * 70">
            <button @click="pickStep(i)"
              class="group w-full text-left p-5 border transition-all duration-500 cursor-pointer lift"
              :class="activeStep === i ? 'border-[#C88A32] bg-[#FFFDF9]' : 'border-[#1C1B18]/12 bg-[#FFFDF9]/55'">
              <div class="flex items-center gap-3 mb-3">
                <span class="w-9 h-9 rounded-xl grid place-items-center font-editorial text-lg font-bold"
                  :class="activeStep === i ? 'bg-[#C88A32] text-[#1C1B18]' : 'bg-[#EFECE6] text-[#5A564E]'">{{ s.icon }}</span>
                <div>
                  <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#6E6960]">{{ s.no }} / {{ s.time }}</div>
                  <div class="font-editorial text-lg font-bold">{{ s.name }}</div>
                </div>
                <ArrowRight :size="16" class="ml-auto text-[#C88A32] arrow-shift" />
              </div>
              <p class="text-[0.75rem] leading-[1.9] text-[#3A3630]">{{ s.desc }}</p>
            </button>
          </Reveal>
        </div>

        <div class="lg:col-span-7">
          <Reveal :delay="140">
            <div class="bezel h-full">
              <div class="bezel-core p-7 sm:p-9 h-full">
                <div class="flex flex-wrap items-center justify-between gap-3 mb-8">
                  <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#6E6960]">GROWTH TIMELINE / 生长阶段</span>
                  <span class="font-mono text-[0.5625rem] tracking-[0.14em] text-[#8A6324]">{{ plot.id }} · {{ plot.crop }}</span>
                </div>
                <div class="font-editorial text-3xl sm:text-4xl font-bold text-[#1C1B18] mb-2">{{ step.name }}</div>
                <p class="text-[0.8125rem] leading-[1.95] text-[#3A3630] mb-8">{{ step.note }}</p>

                <input v-model.number="stageIndex" type="range" min="0" max="4" step="1"
                  aria-label="生长阶段" @input="syncStepFromStage"
                  class="w-full accent-[#C88A32] cursor-pointer" />
                <div class="flex justify-between font-mono text-[0.5625rem] tracking-[0.14em] text-[#6E6960] mt-2">
                  <span v-for="g in growth" :key="g.k">{{ g.k }}</span>
                </div>

                <div class="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="card-moss p-5">
                    <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#F7F4EE]/86 mb-2">CURRENT STAGE / 当前阶段</div>
                    <div class="font-editorial text-2xl font-bold text-[#FFFDF9] mb-2">{{ growth[stageIndex].k }}</div>
                    <div class="text-[0.6875rem] leading-relaxed text-[#F7F4EE]/92">{{ growth[stageIndex].d }}</div>
                  </div>
                  <div class="card-linen p-5">
                    <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#6E6960] mb-2">FARM RECORD / 农事档案</div>
                    <div class="text-[0.75rem] leading-[1.9] text-[#3A3630]">
                      每一次作业都记进地块档案，成为包装上那一枚溯源码能读到的内容。分批留样与检测在秋收环节完成。
                    </div>
                  </div>
                </div>
                <div class="mt-7 pt-5 border-t border-[#1C1B18]/10 font-mono text-[0.5625rem] tracking-[0.14em] text-[#6E6960]">
                  阶段名称与农时为公开资料整理，地块编号为教学演示用
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 03 示意分配 -->
    <section class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <SectionHead index="02 / 03" eyebrow="WHERE THE MONEY GOES / 收益去向" title="一笔钱，流回哪几处"
            description="只画去向，不给比例。条形长度仅表示相对关系，不构成分配方案，也不含任何统计数字。" />
        </Reveal>
        <div class="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div class="lg:col-span-7 space-y-5" data-stagger>
            <Reveal v-for="(f, i) in flows" :key="f.k" :delay="i * 80">
              <div class="bg-[#FFFDF9]/75 border border-[#1C1B18]/10 p-5">
                <div class="flex items-baseline justify-between gap-3 mb-3">
                  <span class="font-editorial text-lg font-bold">{{ f.k }}</span>
                  <span class="font-mono text-[0.5625rem] tracking-[0.14em] text-[#6E6960]">0{{ i + 1 }}</span>
                </div>
                <div class="h-2 rounded-full bg-[#EFECE6] overflow-hidden mb-3">
                  <div class="h-full rounded-full bg-[#C88A32]" :style="{ width: (f.level * 23) + '%' }"></div>
                </div>
                <p class="text-[0.6875rem] leading-[1.85] text-[#3A3630]">{{ f.d }}</p>
              </div>
            </Reveal>
          </div>
          <Reveal :delay="160" class="lg:col-span-5">
            <div class="card-ink p-7 sm:p-8">
              <div class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324] mb-6">DEMO CERTIFICATE / 示意凭证</div>
              <div class="border border-dashed border-[#F7F4EE]/30 p-6 mb-6">
                <div class="font-mono text-[0.5625rem] tracking-[0.16em] text-[#F7F4EE]/80 mb-4">ADOPT · {{ plot.id }} · 2026</div>
                <div class="font-editorial text-2xl font-bold text-[#F7F4EE] mb-2">{{ plot.crop }}</div>
                <div class="text-[0.6875rem] text-[#F7F4EE]/90 mb-4">{{ plot.zone }} · {{ plot.type }}</div>
                <div class="flex flex-wrap items-center justify-between gap-2 text-[0.6875rem]">
                  <span class="flex items-center gap-2 text-[#C88A32]">
                    <Sprout :size="14" /> 当前阶段 · {{ growth[stageIndex].k }}
                  </span>
                  <span :class="certificate ? 'text-[#C88A32] font-semibold' : 'text-[#F7F4EE]/80'">
                    {{ certificate ? '已生成 · 仅演示' : '尚未生成' }}
                  </span>
                </div>
              </div>
              <button @click="makeCertificate"
                class="w-full py-3 rounded-xl bg-[#C88A32] text-[#1C1B18] text-xs font-bold hover:bg-[#FFFDF9] transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Check :size="15" /> {{ certificate ? '已生成示意凭证' : '生成示意凭证' }}
              </button>
              <p class="text-[0.625rem] leading-[1.85] text-[#F7F4EE]/86 mt-4">
                仅用于展示认养流程会产出哪些信息，不产生真实交易、不记录任何个人信息。刷新页面即消失。
              </p>
              <div class="mt-6 pt-5 border-t border-[#F7F4EE]/16">
                <RouterLink to="/farm-income" class="inline-flex items-center gap-2 text-xs font-bold text-[#8A6324] group">
                  展开看五笔收入 <ArrowUpRight :size="15" class="arrow-shift" />
                </RouterLink>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 04 口径与回链 -->
    <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div class="lg:col-span-5">
            <div class="eyebrow mb-4">DATA NOTE / 口径说明</div>
            <h2 class="display-2">不写比例，不写人名</h2>

            <!-- 数据接入演示：默认仍是教学演示口径。切到「模拟真实数据」只演示
                 接入业务系统后的字段结构与交互形态，不产生任何真实记录。 -->
            <div class="inline-flex mt-6 p-1 rounded-full border border-[#1C1B18]/15 bg-[#FFFDF9]" role="group" aria-label="数据演示模式">
              <button
                v-for="m in [{ k: false, t: '教学演示' }, { k: true, t: '模拟真实数据' }]"
                :key="String(m.k)"
                type="button"
                :aria-pressed="showMock === m.k"
                @click="showMock = m.k"
                class="px-4 py-2 min-h-[2.5rem] rounded-full text-[0.6875rem] font-bold transition-colors cursor-pointer"
                :class="showMock === m.k ? 'bg-[#1C1B18] text-[#F7F4EE]' : 'text-[#6E6960] hover:text-[#1C1B18]'"
              >{{ m.t }}</button>
            </div>

            <div v-if="!showMock">
              <p class="lede mt-6">
                这页的地块编号、农事流程、收益去向与凭证全部是教学演示。项目类型、农时环节和流通做法取自公开资料，与项目库、附录 A 共用同一套口径。想看真实机制，去下一页。
              </p>
              <RouterLink to="/about#data-notes" class="inline-flex items-center gap-2 mt-7 text-xs font-bold text-[#8A6324] group">
                查看展陈数据口径与来源 <ArrowUpRight :size="15" class="arrow-shift" />
              </RouterLink>
            </div>

            <div v-else class="mt-6 rounded-2xl bg-[#1C1B18] text-[#F7F4EE] p-6 border border-[#C88A32]/25">
              <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div class="font-mono text-[0.5625rem] tracking-[0.2em] text-[#F0C275]">ADOPTION RECORD / 认养档案</div>
                <span class="font-mono text-[0.5625rem] tracking-[0.14em] px-2.5 py-1 rounded-full border border-[#F0C275]/45 text-[#F0C275]">演示数据 · 非真实记录</span>
              </div>
              <div class="grid grid-cols-2 gap-x-6 gap-y-4">
                <div v-for="f in mockFields" :key="f.k">
                  <div class="font-mono text-[0.5625rem] tracking-[0.14em] text-[#F7F4EE]/90 mb-1">{{ f.k }}</div>
                  <div class="font-editorial text-sm font-bold text-[#F7F4EE]">{{ f.v }}</div>
                </div>
              </div>
              <div class="mt-6 pt-5 border-t border-[#F7F4EE]/18">
                <div class="flex items-center justify-between font-mono text-[0.5625rem] tracking-[0.16em] text-[#F7F4EE]/90 mb-2">
                  <span>农事进度 / FARMING STAGE</span><span>04 / 04</span>
                </div>
                <div class="flex gap-1.5">
                  <span v-for="i in 4" :key="i" class="h-1.5 flex-1 rounded-full bg-[#C88A32]"></span>
                </div>
                <div class="flex justify-between mt-2 font-mono text-[0.5625rem] text-[#F7F4EE]/90">
                  <span>春耕</span><span>夏管</span><span>秋收</span><span>直邮</span>
                </div>
              </div>
              <p class="mt-5 text-[0.625rem] leading-[1.9] text-[#F7F4EE]/90">
                以上人名、编号、读数与凭证均为虚构，仅用于演示「接入真实业务数据后」的字段结构与交互形态；本页不产生真实认养关系、不收集个人信息、不发生交易。
              </p>
            </div>
          </div>
          <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RouterLink v-for="n in [
              { to: '/aid-projects', k: 'BACK / 索引', t: '助农项目库', d: '六类带农路径与项目档案' },
              { to: '/farm-income', k: 'NEXT / 机制', t: '一块地，五笔收入', d: '收益靠哪几条路径回到农户' },
              { to: '/journey', k: 'RELATED / 时序', t: '一粒米的旅程', d: '五幕物候与一袋一码溯源' },
              { to: '/products', k: 'RELATED / 产出', t: '吉林风物集市', d: '产地、认证与流通方式' }
            ]" :key="n.to" :to="n.to" class="group bg-[#FFFDF9] border border-[#1C1B18]/10 p-6 lift">
              <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#8A6324] mb-4">{{ n.k }}</div>
              <div class="font-editorial text-xl font-bold mb-2 group-hover:text-[#8A6324] transition-colors">{{ n.t }}</div>
              <div class="text-[0.6875rem] leading-relaxed text-[#5A564E]">{{ n.d }}</div>
            </RouterLink>
          </div>
        </div>
      </Reveal>
    </section>

    <!-- 05 收束 -->
    <section class="bg-[#2E5A44]">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 flex flex-wrap items-end justify-between gap-8">
        <Reveal>
          <div class="font-mono text-[0.625rem] tracking-[0.22em] text-[#F7F4EE]/86 mb-4">03 / 03 · SUMMARY</div>
          <p class="font-editorial text-2xl sm:text-3xl font-bold text-[#FFFDF9] max-w-2xl leading-snug">
            认养是一扇门，门后是农户账本上实实在在的几笔收入。
          </p>
        </Reveal>
        <Reveal :delay="120">
          <RouterLink to="/farm-income" class="inline-flex items-baseline gap-3 min-h-[2.5rem] group">
            <span class="font-editorial text-2xl sm:text-3xl font-bold text-[#FFFDF9] group-hover:text-[#C88A32] transition-colors">一块地，五笔收入</span>
            <ArrowUpRight :size="22" class="text-[#C88A32] arrow-shift" />
          </RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
