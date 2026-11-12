<script setup>
/**
 * 最后一公里实验室
 * 把 2025–2026 年公开讨论的乡村振兴痛点做成三个可交互实验。
 * 矛盾类型、时间区间与成本量级均标注公开出处，具体读数为教学演示示意，
 * 不写人名、不外推地方调研样本、不编统计数字。
 */
import { ref, computed } from 'vue'
import Reveal from '../components/editorial/Reveal.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import { ArrowUpRight, ArrowRight, Check, AlertTriangle } from 'lucide-vue-next'

const gates = [
  { no: '01', k: '等不起', t: '三年才见效', d: '技术见效要 3–5 年，农户要的是当年收成', to: '#lab-1' },
  { no: '02', k: '对不上', t: '一块地六张报表', d: '平台互不互通，同一块地六套编号', to: '#lab-2' },
  { no: '03', k: '买不起', t: '算得过账吗', d: '装备适配规模经营，大国小农怎么算', to: '#lab-3' }
]

const sources = [
  { y: '2025.06', n: '经济参考报 · 智慧农业纵深发展仍面临三大障碍', u: '设备成本、数据孤岛、商业模式' },
  { y: '2025.12', n: '中国发展门户网 · 黑土地保护性利用技术模式区域适宜性评估', u: '3–5 年收益迟滞、秸秆资源冲突、推广落地难' },
  { y: '2026.02', n: '中央一号文件 / 农业农村部实施意见', u: '智慧农业行动计划、农技推广体系改革、不造盆景' },
  { y: '2026.03', n: '人民日报 · 从「新农具」看农业现代化大文章', u: '小农户买不起、不会用' },
  { y: '2026.07', n: '新华社《新华视点》· AI+农业如何从云上落到地里', u: '技术盆景、人才与地形适配' },
  { y: '2026.09', n: '中国农网 · 用算法种好地，让 AI 扛农活', u: '用不起、不会用、不敢用；集中服务降本' }
]

/* ---------------- 实验一：三年才见效 ---------------- */
// 示意指数，只表达趋势，不是实测值也不是百分比
const baseTrend = [
  { y: 1, nt: 46, ct: 50 },
  { y: 2, nt: 52, ct: 51 },
  { y: 3, nt: 61, ct: 52 },
  { y: 4, nt: 69, ct: 53 },
  { y: 5, nt: 77, ct: 54 },
  { y: 6, nt: 84, ct: 55 }
]
const year = ref(3)
const scale = ref('small')
const straw = ref('all')
const terrain = ref('flat')

const trend = computed(() => baseTrend.map((p) => {
  let nt = p.nt
  if (straw.value === 'partial') nt -= 7          // 覆盖不足，见效推后
  if (terrain.value === 'slope' && p.y <= 2) nt -= 5 // 坡岗地出苗风险
  return { ...p, nt: Math.max(38, nt) }
}))

const crossover = computed(() => {
  const hit = trend.value.find((p) => p.nt > p.ct + 5)
  return hit ? hit.y : 6
})

const canWait = computed(() => {
  if (scale.value === 'coop') return true
  return crossover.value <= 3 && straw.value === 'all' && terrain.value === 'flat'
})

const setOpt = (key, v) => {
  if (key === 'scale') scale.value = v
  else if (key === 'straw') straw.value = v
  else terrain.value = v
}

const verdict = computed(() => {
  if (scale.value === 'coop') {
    return {
      tone: 'good',
      t: '合作社托管，把最难的两年分摊掉了',
      d: '机具由合作社统一配置，农户不必独自扛前期投入，也就等得到地力回升那一年。这正是公开报道里「先作业、后核验、再补助」和全程托管要解决的问题。'
    }
  }
  if (!canWait.value) {
    return {
      tone: 'bad',
      t: '单户硬扛，多半撑不到见效那年',
      d: straw.value === 'partial'
        ? '秸秆还要当饲料或燃料，覆盖量不够，见效更晚，第 1–2 年的收成压力就已经落在这一户身上。'
        : terrain.value === 'slope'
          ? '坡岗地出苗不齐，前两年波动更大，而收益要 3–5 年才显出来。'
          : '收益迟滞与当年收成目标相冲突，技术是有效的，但账期对不上。'
    }
  }
  return {
    tone: 'mid',
    t: '勉强等得到，但风险全在这一户身上',
    d: '平地、全量还田、规模够大的情况下第 3 年开始反超，可一旦遇上旱涝或价格波动，前两年的现金压力仍然要自己承担。'
  }
})

const toPath = (arr, key) => arr.map((p, i) => `${40 + i * 104},${200 - p[key] * 1.75}`).join(' ')

/* ---------------- 实验二：六张报表 ---------------- */
const boards = [
  { k: '土壤', en: 'SOIL', id: 'LK-2026-041', area: '12.6', date: '4 月 18 日', color: '#8C583A' },
  { k: '气象', en: 'WEATHER', id: 'JLA-7-2', area: '12.6', date: '4 月 21 日', color: '#8EBACB' },
  { k: '农机', en: 'MACHINE', id: 'A-07', area: '13.1', date: '4 月 18 日', color: '#C88A32' },
  { k: '补贴', en: 'SUBSIDY', id: '梨-2026-118', area: '12.6', date: '4 月 25 日', color: '#2E5A44' },
  { k: '保险', en: 'INSURANCE', id: 'BX-0917', area: '12.1', date: '4 月 18 日', color: '#B83828' },
  { k: '电商', en: 'E-COMMERCE', id: 'A-07', area: '12.6', date: '5 月 02 日', color: '#1C1B18' }
]
const merged = ref(false)
const unified = ref(false)
const conflicts = [
  { k: '地块编号', d: '六个系统出现四种写法，无法确认是不是同一块地' },
  { k: '作业日期', d: '同一趟播种被记成四个日期，补贴核验时互相打架' },
  { k: '地块面积', d: '12.1 到 13.1 不等，保险与补贴按不同基数计算' },
  { k: '重复填报', d: '植保数据接不进监管平台，同一份作业要人工再录一遍' }
]

/* ---------------- 实验三：算得过账吗 ---------------- */
const acres = ref(30)
const mode = ref('buy')
const modes = [
  { id: 'buy', t: '自购装备', d: '一次性买下传感、机具与系统' },
  { id: 'share', t: '合作社共享', d: '集中购置、多家共用、按亩分摊' },
  { id: 'service', t: 'AI 农服', d: '不买设备，按需购买作业服务' }
]

const ledger = computed(() => {
  const a = Math.max(10, Math.min(300, acres.value))
  const level = mode.value === 'buy' ? (a < 50 ? 4 : a < 150 ? 3 : 2) : mode.value === 'share' ? 2 : 1
  const payback = mode.value === 'buy' ? '5 年以上' : mode.value === 'share' ? '2–3 年' : '当季即可'
  const label = mode.value === 'buy'
    ? (a < 50 ? '单亩分摊极高' : a < 150 ? '仍然吃力' : '规模足够才摊得薄')
    : mode.value === 'share' ? '固定投入由集体分担' : '按作业量付费，不承担设备折旧'
  return { level, payback, label, width: 20 + level * 20 + '%' }
})

const fixes = [
  { k: '01', t: '先作业、后核验、再补助', d: '把补贴发在真实作业之后，减少重复填报，也让保护性耕作的收益早一点到账。', y: '四平市 2026 公开纪实' },
  { k: '02', t: '合作社全程托管', d: '碎片化地块整合成规模化生产单元，大农机才有用武之地，单户不必自购装备。', y: '梨树模式 3.0 / 中国农大' },
  { k: '03', t: '农机共享与 AI 农服', d: '从「买重装备」转向「买轻服务」，复杂分析留在后台，农户只收可执行的农事建议。', y: '中国农网 2026.09' },
  { k: '04', t: '农技下沉与村域治理', d: '农技员县管乡用、下沉到村，科技小院与驻社研究生补上「最后一公里」的人；村「两委」与村规民约则把服务稳在村庄里。', y: '2026 中央一号文件' }
]
</script>

<template>
  <div class="relative">
    <!-- 01 首屏：三道关卡 -->
    <section class="relative min-h-[100dvh] surface-ink flex items-center overflow-hidden">
      <div class="absolute inset-0 coord-rule opacity-30 pointer-events-none"></div>
      <div data-parallax="-9" class="absolute -right-[10%] -top-[18%] w-[42vw] h-[42vw] min-w-[380px] min-h-[380px] rounded-full border border-[#C88A32]/25 pointer-events-none"></div>

      <div class="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="px-3 py-1.5 rounded-full bg-[#C88A32] text-[#1C1B18] font-mono text-[10px] tracking-[0.2em] font-bold">LAST MILE / 最后一公里</span>
            <span class="font-mono text-[10px] tracking-[0.2em] text-[#F7F4EE]/80">基于 2025–2026 年公开讨论的痛点实验</span>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-7">
            <h1 class="display-1 text-[#F7F4EE]" aria-label="技术进了展厅 却进不了田">
              <span v-for="(ch, i) in Array.from('技术进了展厅')" :key="'a' + i" class="kin-char"
                :style="{ animationDelay: (0.12 + i * 0.055) + 's' }">{{ ch }}</span>
              <span class="block whitespace-nowrap text-[#C88A32]" :style="{ fontSize: '0.68em' }">
                <span v-for="(ch, i) in Array.from('却进不了田')" :key="'b' + i" class="kin-char"
                  :style="{ animationDelay: (0.48 + i * 0.055) + 's' }">{{ ch }}</span>
              </span>
            </h1>
            <Reveal :delay="600">
              <p class="font-editorial text-lg sm:text-2xl text-[#F7F4EE]/90 mt-7">别的展馆展示成果，这里把「为什么落不了地」做成展品</p>
            </Reveal>
            <Reveal :delay="680">
              <p class="lede text-[#F7F4EE]/90 mt-5 max-w-2xl">
                公开讨论里最集中的痛点已经不是技术够不够先进，而是小农户用不起、系统给的数据对不上、见效要等三五年。下面三个实验都源自公开报道与政策文件，读数只是教学演示示意，矛盾类型和机制才是要讲的东西。
              </p>
            </Reveal>
            <Reveal :delay="760">
              <div class="flex flex-wrap gap-3 mt-9">
                <a href="#lab-1" class="mag-btn mag-btn--gold"><span>开始第一个实验</span><span class="mag-btn__island"><ArrowRight :size="16" /></span></a>
                <RouterLink to="/about#references" class="mag-btn mag-btn--light"><span>查看公开资料索引</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></RouterLink>
              </div>
            </Reveal>
            <Reveal :delay="840">
              <div class="mt-12 grid grid-cols-3 gap-4 max-w-lg">
                <div v-for="n in [
                  { k: 'GATES', v: '3 道关卡' },
                  { k: 'SOURCES', v: '6 组公开资料' },
                  { k: 'RULE', v: '读数均为示意' }
                ]" :key="n.k" class="border-t border-[#F7F4EE]/25 pt-3">
                  <div class="font-mono text-[9px] tracking-[0.18em] text-[#8A6324]">{{ n.k }}</div>
                  <div class="text-[11px] mt-1.5 text-[#F7F4EE]/92">{{ n.v }}</div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal :delay="240" class="lg:col-span-5">
            <div class="space-y-3">
              <a v-for="g in gates" :key="g.no" :href="g.to"
                class="group flex items-center gap-4 p-5 border border-[#F7F4EE]/18 bg-[#F7F4EE]/5 hover:bg-[#F7F4EE]/10 transition-colors duration-500">
                <span class="font-mono text-[10px] tracking-[0.18em] text-[#8A6324] w-7 shrink-0">{{ g.no }}</span>
                <div class="flex-1">
                  <div class="font-mono text-[9px] tracking-[0.16em] text-[#F7F4EE]/86 mb-1">{{ g.k }}</div>
                  <div class="font-editorial text-lg font-bold text-[#F7F4EE] group-hover:text-[#C88A32] transition-colors">{{ g.t }}</div>
                  <div class="text-[11px] text-[#F7F4EE]/92 mt-1">{{ g.d }}</div>
                </div>
                <ArrowUpRight :size="16" class="text-[#C88A32] arrow-shift shrink-0" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#F7F4EE]/12 bg-[#1C1B18]/70 py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[10px] tracking-[0.22em] text-[#F7F4EE]/86 whitespace-nowrap">
            <span>等不起 / 对不上 / 买不起</span><span class="text-[#C88A32]">✳</span>
            <span>盆景要变成风景，靠的是组织方式</span><span class="text-[#C88A32]">✳</span>
            <span>不造盆景 · 不搞一刀切 · 不为基层添负担</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 02 实验一：三年才见效 -->
    <section id="lab-1" class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="01 / 03" eyebrow="EXPERIMENT 01 / 时间账" title="三年才见效，你等得起吗"
          description="公开研究指出保护性耕作的增产提质通常要 3–5 年才显现，农户追的却是当年收益。拖年份、换条件，看这一户能不能撑到反超那年。" />
      </Reveal>

      <div class="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Reveal :delay="100" class="lg:col-span-7">
          <div class="bezel h-full">
            <div class="bezel-core p-6 sm:p-8">
              <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
                <span class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960]">SOIL & YIELD INDEX / 地力与收成示意指数</span>
                <span class="font-mono text-[9px] tracking-[0.14em] text-[#8A6324]">示意趋势，非实测值</span>
              </div>
              <svg viewBox="0 0 600 230" class="w-full h-auto" role="img" aria-label="免耕与传统翻耕六年示意趋势对比">
                <g stroke="rgba(28,27,24,0.1)" stroke-width="1">
                  <line v-for="i in 4" :key="'h' + i" x1="40" :y1="30 + i * 42" x2="580" :y2="30 + i * 42" />
                  <line v-for="i in 6" :key="'v' + i" :x1="40 + (i - 1) * 104" y1="20" :x2="40 + (i - 1) * 104" y2="210" />
                </g>
                <polyline :points="toPath(trend, 'ct')" fill="none" stroke="#8C867B" stroke-width="2.5" stroke-dasharray="7 5" />
                <polyline :points="toPath(trend, 'nt')" fill="none" stroke="#2E5A44" stroke-width="3.5" />
                <g v-for="(p, i) in trend" :key="'d' + i">
                  <circle :cx="40 + i * 104" :cy="200 - p.nt * 1.75" r="5" fill="#2E5A44" />
                  <circle :cx="40 + i * 104" :cy="200 - p.ct * 1.75" r="4" fill="#8C867B" />
                </g>
                <line :x1="40 + (year - 1) * 104" y1="18" :x2="40 + (year - 1) * 104" y2="212" stroke="#C88A32" stroke-width="2" />
                <g font-family="ui-monospace, monospace" font-size="12" fill="#8C867B">
                  <text v-for="(p, i) in trend" :key="'t' + i" :x="40 + i * 104" y="226" text-anchor="middle">第 {{ p.y }} 年</text>
                </g>
              </svg>
              <div class="flex flex-wrap gap-5 mt-4 text-[11px]">
                <span class="flex items-center gap-2"><span class="w-5 h-0.5 bg-[#2E5A44]"></span>秸秆覆盖免耕</span>
                <span class="flex items-center gap-2"><span class="w-5 h-0.5 bg-[#8C867B]"></span>传统翻耕</span>
                <span class="flex items-center gap-2"><span class="w-0.5 h-3 bg-[#C88A32]"></span>当前年份</span>
              </div>
              <div class="mt-6">
                <label class="block font-mono text-[9px] tracking-[0.16em] text-[#6E6960] mb-2" for="year-range">观察年份</label>
                <input id="year-range" v-model.number="year" type="range" min="1" max="6" step="1" aria-label="观察年份"
                  class="w-full accent-[#C88A32] cursor-pointer" />
                <div class="flex justify-between font-mono text-[9px] text-[#6E6960] mt-1"><span>1</span><span>3</span><span>6</span></div>
              </div>
              <div class="mt-6 pt-5 border-t border-[#1C1B18]/10 font-mono text-[9px] leading-[1.9] text-[#6E6960]">
                趋势依据：中国发展门户网 2025.12 区域适宜性评估（收益迟滞 3–5 年）、中国农大梨树 16 年定位试验（有机质 1.7% 升至 2.8%）。曲线为教学演示示意，不代表任何实测产量。
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal :delay="180" class="lg:col-span-5">
          <div class="h-full flex flex-col gap-4">
            <div class="bg-[#FFFDF9] border border-[#1C1B18]/12 p-5 sm:p-6">
              <div class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960] mb-5">换三个条件试试</div>
              <div v-for="o in [
                { k: '经营方式', key: 'scale', opts: [{ v: 'small', t: '单户自担' }, { v: 'coop', t: '合作社托管' }] },
                { k: '秸秆用途', key: 'straw', opts: [{ v: 'all', t: '全量还田' }, { v: 'partial', t: '部分离田' }] },
                { k: '地块条件', key: 'terrain', opts: [{ v: 'flat', t: '平地' }, { v: 'slope', t: '坡岗地' }] }
              ]" :key="o.key" class="mb-4">
                <div class="text-[11px] font-semibold text-[#3A3630] mb-2">{{ o.k }}</div>
                <div class="grid grid-cols-2 gap-2">
                  <button v-for="op in o.opts" :key="op.v" @click="setOpt(o.key, op.v)"
                    class="py-2.5 min-h-[40px] rounded-lg text-[11px] font-semibold border transition-all duration-300 cursor-pointer"
                    :class="(o.key === 'scale' ? scale : o.key === 'straw' ? straw : terrain) === op.v
                      ? 'bg-[#1C1B18] text-[#F7F4EE] border-[#1C1B18]' : 'bg-[#EFECE6] text-[#5A564E] border-transparent hover:border-[#C88A32]'">
                    {{ op.t }}
                  </button>
                </div>
              </div>
              <div class="font-mono text-[9px] tracking-[0.14em] text-[#6E6960]">
                开关依据：机具投入高、秸秆与饲料燃料争资源、坡岗地出苗不齐、合作社托管分摊成本。
              </div>
            </div>

            <div class="flex-1 p-5 sm:p-6 border transition-colors duration-500"
              :class="verdict.tone === 'good' ? 'bg-[#2E5A44]/8 border-[#2E5A44]/30' : verdict.tone === 'bad' ? 'bg-[#B83828]/8 border-[#B83828]/30' : 'bg-[#C88A32]/8 border-[#C88A32]/35'">
              <div class="flex items-center gap-2 mb-3">
                <Check v-if="verdict.tone === 'good'" :size="15" class="text-[#2E5A44]" />
                <AlertTriangle v-else :size="15" :class="verdict.tone === 'bad' ? 'text-[#B83828]' : 'text-[#8A6324]'" />
                <span class="font-mono text-[9px] tracking-[0.18em] text-[#6E6960]">第 {{ year }} 年 · 反超约在第 {{ crossover }} 年</span>
              </div>
              <div class="font-editorial text-lg sm:text-xl font-bold mb-2"
                :class="verdict.tone === 'good' ? 'text-[#2E5A44]' : verdict.tone === 'bad' ? 'text-[#B83828]' : 'text-[#8A6324]'">
                {{ verdict.t }}
              </div>
              <p class="text-[12px] leading-[1.9] text-[#3A3630]">{{ verdict.d }}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- 03 实验二：六张报表 -->
    <section id="lab-2" class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <SectionHead index="02 / 03" eyebrow="EXPERIMENT 02 / 数据账" title="一块地，六张报表"
            description="同一块示意黑土地，六个系统各记一套。先点合并，看看会撞上什么，再点统一编码，看一张底图怎么把六张表对齐。" />
        </Reveal>

        <div class="mt-12 flex flex-wrap gap-3">
          <button @click="merged = true" :disabled="merged"
            class="px-5 py-3 rounded-xl text-xs font-bold transition-all duration-400 cursor-pointer disabled:opacity-45 disabled:cursor-default"
            :class="merged ? 'bg-[#EFECE6] text-[#5A564E]' : 'bg-[#1C1B18] text-[#F7F4EE]'">
            {{ merged ? '已尝试合并' : '① 尝试合并六张报表' }}
          </button>
          <button @click="unified = true" :disabled="!merged || unified"
            class="px-5 py-3 rounded-xl text-xs font-bold transition-all duration-400 cursor-pointer disabled:opacity-45 disabled:cursor-default"
            :class="unified ? 'bg-[#EFECE6] text-[#5A564E]' : merged ? 'bg-[#C88A32] text-[#1C1B18]' : 'bg-[#EFECE6] text-[#6E6960]'">
            {{ unified ? '已统一地块编码' : '② 统一地块编码' }}
          </button>
        </div>

        <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger>
          <Reveal v-for="(b, i) in boards" :key="b.k" :delay="(i % 3) * 70">
            <div class="h-full p-5 border transition-all duration-600 bg-[#FFFDF9]"
              :class="unified ? 'border-[#2E5A44]/40' : merged ? 'border-[#B83828]/35' : 'border-[#1C1B18]/12'">
              <div class="flex items-center gap-2 mb-5">
                <span class="w-2.5 h-2.5 rounded-sm" :style="{ background: b.color }"></span>
                <span class="font-mono text-[9px] tracking-[0.18em] text-[#6E6960]">{{ b.en }}</span>
                <span class="ml-auto text-[11px] font-bold">{{ b.k }}</span>
              </div>
              <div class="space-y-2 font-mono text-[11px]">
                <div class="flex justify-between gap-2"><span class="text-[#6E6960]">地块编号</span><span :class="unified ? 'text-[#2E5A44] font-bold' : merged ? 'text-[#B83828]' : 'text-[#1C1B18]'">{{ unified ? 'A-07' : b.id }}</span></div>
                <div class="flex justify-between gap-2"><span class="text-[#6E6960]">面积（亩）</span><span :class="unified ? 'text-[#2E5A44] font-bold' : merged ? 'text-[#B83828]' : 'text-[#1C1B18]'">{{ unified ? '12.6' : b.area }}</span></div>
                <div class="flex justify-between gap-2"><span class="text-[#6E6960]">作业日期</span><span :class="unified ? 'text-[#2E5A44] font-bold' : merged ? 'text-[#B83828]' : 'text-[#1C1B18]'">{{ unified ? '4 月 18 日' : b.date }}</span></div>
              </div>
              <div class="mt-4 pt-3 border-t border-[#1C1B18]/10 text-[10px]"
                :class="unified ? 'text-[#2E5A44]' : 'text-[#6E6960]'">
                {{ unified ? '已并入一张底图' : merged ? '与其他系统冲突' : '独立记录，未校验' }}
              </div>
            </div>
          </Reveal>
        </div>

        <div v-if="merged && !unified" class="mt-8 rounded-2xl border border-[#B83828]/30 bg-[#B83828]/6 p-6">
          <div class="font-mono text-[10px] tracking-[0.18em] text-[#B83828] mb-4">合并失败 · 撞上四类矛盾</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="c in conflicts" :key="c.k" class="border-t border-[#B83828]/25 pt-3">
              <div class="text-[12px] font-bold mb-1">{{ c.k }}</div>
              <div class="text-[11px] leading-[1.8] text-[#3A3630]">{{ c.d }}</div>
            </div>
          </div>
        </div>
        <div v-if="unified" class="mt-8 rounded-2xl border border-[#2E5A44]/35 bg-[#2E5A44]/8 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="font-mono text-[10px] tracking-[0.18em] text-[#2E5A44] mb-2">一张底图 · A-07</div>
            <p class="text-[12px] leading-[1.9] text-[#3A3630] max-w-2xl">
              统一地块编码之后，土壤、气象、农机、补贴、保险与电商读到的是同一块地。重复填报消失，核验有了共同基数，数据才谈得上在保险、信贷这些场景里被用起来。
            </p>
          </div>
          <RouterLink to="/dashboard" class="inline-flex items-center gap-2 text-xs font-bold text-[#2E5A44] shrink-0">
            去看整合后的数据视图 <ArrowUpRight :size="15" class="arrow-shift" />
          </RouterLink>
        </div>

        <div class="mt-8 font-mono text-[9px] leading-[1.9] text-[#5A564E]">
          矛盾类型依据：经济参考报 2025.06（涉农平台互不互通、植保数据接不进监管平台、补贴重复填报）、2025 中央一号文件（整治指尖上的形式主义）、2026 中央一号文件（健全天空地一体化观测网络、建设农业农村大数据平台）。六张表的编号与读数均为教学演示示意，不是任何真实系统的数据。
        </div>
      </div>
    </section>

    <!-- 04 实验三：算得过账吗 -->
    <section id="lab-3" class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="03 / 03" eyebrow="EXPERIMENT 03 / 经济账" title="算得过账吗"
          description="公开报道里最常见的一句话是「买不起、不会用、不敢用」。换个经营规模，再换一种获得技术的方式，看单户的账怎么变。" />
      </Reveal>

      <div class="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Reveal :delay="100" class="lg:col-span-5">
          <div class="card-ink h-full p-7 sm:p-8">
            <div class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-6">INPUT / 两个变量</div>
            <label class="block font-mono text-[9px] tracking-[0.16em] text-[#F7F4EE]/80 mb-2" for="acre-range">经营规模（亩）</label>
            <input id="acre-range" v-model.number="acres" type="range" min="10" max="300" step="10" aria-label="经营规模"
              class="w-full accent-[#C88A32] cursor-pointer" />
            <div class="flex justify-between font-mono text-[9px] text-[#F7F4EE]/80 mt-1"><span>10</span><span>150</span><span>300</span></div>
            <div class="font-editorial text-4xl font-bold text-[#F7F4EE] mt-5">{{ acres }} <span class="text-base font-normal">亩</span></div>

            <div class="mt-8 space-y-2">
              <button v-for="m in modes" :key="m.id" @click="mode = m.id"
                class="w-full text-left p-4 border transition-all duration-400 cursor-pointer"
                :class="mode === m.id ? 'border-[#C88A32] bg-[#F7F4EE]/10' : 'border-[#F7F4EE]/18 hover:bg-[#F7F4EE]/5'">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[13px] font-bold text-[#F7F4EE]">{{ m.t }}</span>
                  <span class="font-mono text-[9px]" :class="mode === m.id ? 'text-[#8A6324]' : 'text-[#F7F4EE]/80'">{{ mode === m.id ? '当前' : '切换' }}</span>
                </div>
                <div class="text-[11px] text-[#F7F4EE]/92 mt-1">{{ m.d }}</div>
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal :delay="180" class="lg:col-span-7">
          <div class="bezel h-full">
            <div class="bezel-core p-7 sm:p-9 h-full">
              <div class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960] mb-7">OUTPUT / 单户要承担什么</div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div v-for="n in [
                  { k: '固定投入', v: modes.find(m => m.id === mode).t, d: ledger.label },
                  { k: '回本周期', v: ledger.payback, d: '公开报道里数字化项目常超 5 年' },
                  { k: '农户门槛', v: mode === 'buy' ? '买不起 + 不会用' : mode === 'share' ? '会用服务即可' : '手机收指令即可', d: '从看数据变成可执行建议' }
                ]" :key="n.k" class="border-t border-[#1C1B18]/15 pt-4">
                  <div class="font-mono text-[9px] tracking-[0.16em] text-[#8A6324] mb-2">{{ n.k }}</div>
                  <div class="font-editorial text-lg sm:text-xl font-bold mb-2">{{ n.v }}</div>
                  <div class="text-[11px] leading-[1.8] text-[#5A564E]">{{ n.d }}</div>
                </div>
              </div>

              <div class="mt-9">
                <div class="flex justify-between font-mono text-[9px] tracking-[0.14em] text-[#6E6960] mb-2">
                  <span>单户相对负担（示意档位）</span><span>{{ ledger.level }} / 4</span>
                </div>
                <div class="h-3 rounded-full bg-[#EFECE6] overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700"
                    :class="ledger.level >= 4 ? 'bg-[#B83828]' : ledger.level === 3 ? 'bg-[#C88A32]' : 'bg-[#2E5A44]'"
                    :style="{ width: ledger.width }"></div>
                </div>
              </div>

              <div class="mt-8 rounded-xl border border-[#C88A32]/35 bg-[#C88A32]/8 px-5 py-4">
                <div class="font-mono text-[9px] tracking-[0.16em] text-[#8A6324] mb-2">公开讨论里的破局方向</div>
                <p class="text-[12px] leading-[1.9] text-[#3A3630]">
                  从「买重装备」转向「买轻服务」。合作社集中购置、多人共享、按需服务，复杂分析留在后台，农户只收能执行的农事指令。中国农网 2026.09 的对话里提到，集中服务模式可大幅降低单户智慧农业服务成本。
                </p>
              </div>
              <div class="mt-7 pt-5 border-t border-[#1C1B18]/10 flex flex-wrap gap-4">
                <RouterLink to="/farm-income" class="inline-flex items-center gap-2 text-xs font-bold text-[#8A6324]">
                  土地托管与合作社分红 <ArrowUpRight :size="15" class="arrow-shift" />
                </RouterLink>
                <RouterLink to="/aid-projects" class="inline-flex items-center gap-2 text-xs font-bold text-[#8A6324]">
                  北斗农机共享作业 <ArrowUpRight :size="15" class="arrow-shift" />
                </RouterLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- 05 收束：从盆景到风景 -->
    <section class="bg-[#2E5A44]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <div class="font-mono text-[10px] tracking-[0.22em] text-[#8A6324] mb-4">FROM SHOWCASE TO LANDSCAPE / 从盆景到风景</div>
          <h2 class="display-2 text-[#FFFDF9] max-w-3xl">解开这三道关卡的，不是更炫的技术</h2>
          <p class="lede text-[#F7F4EE]/92 mt-6 max-w-2xl">
            公开报道与政策文件里反复出现的答案，是组织方式：托管分摊投入、共享替代购置、统一编码打通数据、农技力量下沉到村。下面四条都能在公开资料里查到。
          </p>
        </Reveal>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-12" data-stagger>
          <Reveal v-for="(f, i) in fixes" :key="f.k" :delay="i * 70">
            <div class="h-full border border-[#F7F4EE]/22 bg-[#F7F4EE]/6 p-6">
              <div class="font-mono text-[10px] tracking-[0.18em] text-[#8A6324] mb-4">{{ f.k }} / {{ f.y }}</div>
              <div class="font-editorial text-lg font-bold text-[#FFFDF9] mb-3">{{ f.t }}</div>
              <p class="text-[11px] leading-[1.9] text-[#F7F4EE]/90">{{ f.d }}</p>
            </div>
          </Reveal>
        </div>

        <!-- 人才与治理：本展馆尚未展开的两个维度，只列公开政策方向，不编数据与人名 -->
        <Reveal :delay="140">
          <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="g in [
              { k: 'TALENT / 人才振兴', t: '谁来种地，技术怎么传到田里', items: ['科技小院与驻社研究生', '返乡创业与人才下乡服务', '产业带头人与治理人才培育'] },
              { k: 'GOVERNANCE / 组织振兴', t: '经营组织之外，还有乡村治理', items: ['村党组织与村「两委」', '村民自治与村规民约', '新型农村集体经济监管'] }
            ]" :key="g.k" class="border border-[#F7F4EE]/20 bg-[#F7F4EE]/6 p-6">
              <div class="font-mono text-[9px] tracking-[0.18em] text-[#F0C275] mb-3">{{ g.k }}</div>
              <div class="font-editorial text-lg font-bold text-[#FFFDF9] mb-4">{{ g.t }}</div>
              <div class="space-y-2">
                <div v-for="it in g.items" :key="it" class="flex items-start gap-2 border-t border-dashed border-[#F7F4EE]/18 pt-2">
                  <span class="w-1 h-1 rounded-full bg-[#C88A32] mt-1.5 shrink-0"></span>
                  <span class="text-[11px] leading-[1.7] text-[#F7F4EE]/82">{{ it }}</span>
                </div>
              </div>
              <div class="mt-4 font-mono text-[9px] tracking-[0.14em] text-[#F0C275]">本展馆未展开 · 政策方向</div>
            </div>
          </div>
        </Reveal>

        <Reveal :delay="160">
          <div class="mt-12 border-t border-[#F7F4EE]/20 pt-8">
            <div class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-5">PUBLIC SOURCES / 本页依据的公开资料</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div v-for="s in sources" :key="s.n" class="flex gap-4 py-3 border-b border-[#F7F4EE]/12">
                <span class="font-mono text-[10px] text-[#8A6324] shrink-0 w-16">{{ s.y }}</span>
                <div>
                  <div class="text-[11px] font-semibold text-[#FFFDF9] leading-snug">{{ s.n }}</div>
                  <div class="text-[10px] text-[#F7F4EE]/80 mt-1">{{ s.u }}</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal :delay="200">
          <div class="mt-12 pt-7 border-t border-[#F7F4EE]/20 flex flex-wrap items-center justify-between gap-5">
            <p class="text-[11px] leading-[1.9] text-[#F7F4EE]/90 max-w-2xl">
              本页的矛盾类型、时间区间与成本量级均来自 2025–2026 年公开报道与政策文件，具体读数、地块编号与示意指数为教学演示，不写人名、不外推地方调研样本，也不构成任何投资或生产建议。
            </p>
            <RouterLink to="/about#references" class="inline-flex items-center gap-2 text-xs font-bold text-[#8A6324] shrink-0">
              查看公开资料索引 <ArrowUpRight :size="15" class="arrow-shift" />
            </RouterLink>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
</template>
