<script setup>
import { ref, computed } from 'vue'
import ScienceStage from '../components/science/ScienceStage.vue'
import WebGLStage from '../components/editorial/WebGLStage.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import Reveal from '../components/editorial/Reveal.vue'
import { ArrowUpRight, RotateCcw } from 'lucide-vue-next'

const activeMode = ref('soil')
const hoverKey = ref(null)

const labs = [
  { id: 'soil', no: '01', name: '黑土团粒与孔隙', en: 'SOIL MICROSTRUCTURE', short: '放大一厘米黑土，看清团粒、孔隙、菌丝与钙质结核', tone: 'ink' },
  { id: 'rice', no: '02', name: '稻作生长五阶段', en: 'RICE GROWTH CYCLE', short: '拖动时间轴，观察一株稻从育秧到成熟', tone: 'moss' },
  { id: 'beidou', no: '03', name: '北斗 RTK 定位原理', en: 'BEIDOU RTK GEOMETRY', short: '看田边基准站怎样帮农机，把十几米误差减到两三厘米', tone: 'gold' },
  { id: 'notill', no: '04', name: '秸秆覆盖免耕', en: 'NO-TILL & RESIDUE COVER', short: '调节秸秆覆盖率，看雨水是渗进黑土还是冲走表土', tone: 'clay' }
]

const notillStructures = [
  {
    key: 'straw', no: '01', name: '秸秆覆盖层', en: 'RESIDUE COVER',
    desc: '收获后把秸秆留在地表，不翻进土里。覆盖层挡住雨滴直接击打表土，减缓地表结皮，也给蚯蚓与微生物留下持续的食物和栖息环境。',
    metric: '0 – 100%', note: '可调覆盖率 · 模型示意'
  },
  {
    key: 'crumb', no: '02', name: '地表团粒', en: 'SURFACE AGGREGATE',
    desc: '不被翻动的团粒能长期保持，孔隙结构不被打散。雨滴先被秸秆减速，再从团粒之间渗下去，而不是把细颗粒冲走。',
    metric: '0.25 – 10 mm', note: '典型团粒粒径'
  },
  {
    key: 'pore', no: '03', name: '蚯蚓通道', en: 'MACROPORE',
    desc: '免耕让蚯蚓通道跨季节保留，成为雨水的快速下渗路径。翻耕会切断这些连续孔洞，春季融雪与暴雨更容易在地表形成径流。',
    metric: '连续大孔隙', note: '定性示意'
  },
  {
    key: 'opener', no: '04', name: '免耕开沟器', en: 'NO-TILL OPENER',
    desc: '只在地表切出一条窄缝，把种子与肥料送进土里，其余土层保持原状。圆盘切开秸秆，限深轮控制深度，随后把缝合上。',
    metric: '窄缝播种', note: '不翻转土层'
  }
]
const coverLevels = [0, 30, 60, 90]

const soils = [
  {
    key: 'crumb', no: '01', name: '团粒结构', en: 'AGGREGATE',
    desc: '腐殖质与黏粒胶结形成的毫米级团粒，是黑土疏松透气的根本原因。团粒之间的孔隙同时承担保水与通气，让「握之成团、松之即散」。',
    metric: '0.25 – 10 mm', note: '典型团粒粒径'
  },
  {
    key: 'pore', no: '02', name: '孔隙与蚯蚓通道', en: 'POROSITY',
    desc: '团粒之间与大孔隙构成水分和空气的通道。免耕覆盖让蚯蚓种群增加，通道得以长期保留，春雨能迅速下渗而不是冲刷地表带走表土。',
    metric: '45 – 55%', note: '健康黑土总孔隙度'
  },
  {
    key: 'hypha', no: '03', name: '菌丝与微生物', en: 'MYCELIUM',
    desc: '真菌菌丝把细小团粒缠成稳定的大团聚体，同时分解秸秆、释放养分。冬季秸秆覆盖下的微生物活性，决定来年春天的供肥能力。',
    metric: '200 – 400 年', note: '形成 1 cm 腐殖层所需时间'
  },
  {
    key: 'nodule', no: '04', name: '钙质结核', en: 'CALCAREOUS NODULE',
    desc: '心土与母质层中常见的浅色碳酸盐结核，是钙随水分下渗后重新沉淀的证据，也记录了这个地区干湿交替的古气候信息。',
    metric: '50 – 100 cm', note: '主要出现层位'
  }
]

const ricePhases = [
  { no: 0, name: '育秧', time: '4 月下旬 – 5 月中', en: 'SEEDLING', desc: '温室浸种催芽，秧床保持浅水层。株高只有十几厘米，根系先在黑土表层铺开。', metric: '株高 12–18 cm' },
  { no: 1, name: '分蘖', time: '5 月下 – 6 月', en: 'TILLERING', desc: '稻株从基部分出侧茎，田间进入旺盛营养生长。浅水勤灌促使根系向深层黑土下扎。', metric: '单株 8–15 个分蘖' },
  { no: 2, name: '抽穗扬花', time: '7 月', en: 'HEADING', desc: '稻穗抽出并开出白色小花，决定结实率。东北十五小时长日照为光合积累提供充足能量。', metric: '结实率 90%+' },
  { no: 3, name: '灌浆', time: '8 月', en: 'GRAIN FILLING', desc: '有机物从叶鞘向籽粒转移，穗头逐渐变黄下垂。昼夜温差拉大，支链淀粉与芳香物质快速合成。', metric: '昼夜温差 15℃+' },
  { no: 4, name: '成熟收割', time: '9 月下 – 10 月', en: 'HARVEST', desc: '稻田落干，联合收割机脱粒，原粮进入 38℃ 低温慢烘塔，锁住胚芽清香与整精米率。', metric: '整精米率 72%+' }
]

const soilFocus = ref('crumb')
const riceStage = ref(0)
const satCount = ref(4)
const blocked = ref(false)
const coverage = ref(60)
const notillFocus = ref('straw')

const param = computed(() => {
  if (activeMode.value === 'soil') return { focus: soilFocus.value }
  if (activeMode.value === 'rice') return { stage: riceStage.value }
  if (activeMode.value === 'notill') return { coverage: coverage.value, focus: notillFocus.value }
  return { sats: satCount.value, blocked: blocked.value }
})

const activeSoil = computed(() => soils.find((s) => s.key === soilFocus.value) || soils[0])
const activeNotill = computed(() => notillStructures.find((s) => s.key === notillFocus.value) || notillStructures[0])
const coverReadout = computed(() => {
  const c = coverage.value
  const level = c >= 75 ? 3 : c >= 50 ? 2 : c >= 25 ? 1 : 0
  return {
    runoff: ['明显', '有', '较少', '很少'][level],
    loss: ['易发生', '可见', '少量', '很少'][level],
    water: ['弱', '一般', '较好', '好'][level],
    infilPct: c,
    runoffPct: 100 - c
  }
})
const activePhase = computed(() => ricePhases[riceStage.value])
const accuracy = computed(() => {
  if (blocked.value) return '± 1.2 m'
  if (satCount.value >= 5) return '± 2.0 cm'
  return '± 2.5 cm'
})

// 用「谁在帮谁校准」的三步讲清 RTK，术语只留在面板脚注
const rtSteps = computed(() => [
  { no: '01', t: '卫星报距离，单听会差十几米', d: '卫星只知道大概在这一带，还分不清是哪一垄。' },
  { no: '02', t: '田边基准站的位置早就量准了', d: '它也收同样的卫星信号，一对照就知道信号偏了多少。' },
  {
    no: '03',
    t: blocked.value ? '改正信号被挡住，这一步断了' : '把偏差发给农机，一减就准',
    d: blocked.value
      ? '林带或高压线挡住改正数，农机只能退回十几米级的单点定位。'
      : '农机收到基准站的改正数，把偏差减掉，剩下两三厘米。'
  }
])

const rtAnalogy = computed(() => blocked.value
  ? '同事喊的那句「多量了多少」被树林挡住了，你听不见，只能自己拿那把有误差的尺子瞎量。'
  : '就像拿一把有误差的卷尺量地，旁边同事站在一个早就量准的点上，告诉你这把尺多量了多少，你一减就准了。'
)

const rtResult = computed(() => blocked.value
  ? {
      title: '会重行、会漏行',
      desc: '播种轨迹跑偏一米多，种子撒重或漏下，后面施肥、喷药和无人机巡田也全跟着错。'
    }
  : {
      title: '不重不漏，垄线笔直',
      desc: '每一趟都压在同一条线上，省种省肥，后续机械进田也不会压坏相邻的垄。'
    }
)

const onSelect = (key) => {
  if (activeMode.value === 'soil') soilFocus.value = key
  else if (activeMode.value === 'notill') notillFocus.value = key
}

const resetLab = () => {
  soilFocus.value = 'crumb'
  riceStage.value = 0
  satCount.value = 4
  blocked.value = false
  coverage.value = 60
  notillFocus.value = 'straw'
}
</script>

<template>
  <div>
    <!-- 封面 -->
    <section class="surface-ink relative overflow-hidden">
      <div class="absolute inset-0 coord-rule opacity-25 pointer-events-none"></div>
      <div data-parallax="-12" class="absolute -right-[6%] -top-[30%] w-[34vw] h-[34vw] min-w-[340px] min-h-[340px] rounded-full pointer-events-none"
        style="background: radial-gradient(circle at 35% 30%, #E8BC6E, #C88A32 55%, #A46C20); box-shadow: 0 60px 140px -60px rgba(168,111,34,.6)">
        <svg viewBox="0 0 200 200" class="absolute inset-0 w-full h-full animate-[spin_32s_linear_infinite] opacity-70">
          <defs><path id="lab-ring" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0"></path></defs>
          <text font-family="ui-monospace, monospace" font-size="8.5" letter-spacing="2.6" fill="#1C1B18">
            <textPath href="#lab-ring">INTERACTIVE SCIENCE LAB · SOIL · RICE · BEIDOU · NO-TILL · 2026 · </textPath>
          </text>
        </svg>
        <div class="absolute inset-[36%] rounded-full bg-[#1C1B18] grid place-items-center">
          <span class="font-editorial text-[#C88A32] text-3xl font-bold">科</span>
        </div>
      </div>

      <div class="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-28 sm:pt-32 pb-16 sm:pb-20">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3 mb-9">
            <span class="eyebrow">INTERACTIVE SCIENCE LAB / 互动科普实验室</span>
            <span class="font-mono text-[10px] tracking-[0.2em] text-[#F7F4EE]/80">CHAPTER 10 · FOUR EXPERIMENTS</span>
          </div>
        </Reveal>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div class="lg:col-span-8">
            <h1 class="display-1 text-[#F7F4EE]" aria-label="把原理，变成可以上手的东西">
              <span v-for="(ch, i) in Array.from('把原理，')" :key="'a' + i" class="kin-char" :style="{ animationDelay: (0.1 + i * 0.08) + 's' }">{{ ch }}</span>
              <span class="block text-[#C88A32]">
                <span v-for="(ch, i) in Array.from('变成可以上手的')" :key="'b' + i" class="kin-char" :style="{ animationDelay: (0.36 + i * 0.05) + 's' }">{{ ch }}</span>
              </span>
            </h1>
            <Reveal :delay="700"><p class="font-editorial text-xl sm:text-2xl text-[#F7F4EE]/86 mt-7">四个可操作的 3D 原理演示</p></Reveal>
            <Reveal :delay="780"><p class="lede text-[#F7F4EE]/90 mt-5 max-w-2xl">
              黑土为什么疏松、稻株怎样长成、北斗凭什么定位到厘米、秸秆留在地表会发生什么。文字讲不清的地方，就把它做成可以拖拽、可以切换、可以看见变化的模型。
            </p></Reveal>
          </div>
          <Reveal :delay="300" class="lg:col-span-4">
            <div class="card-gold p-7 sm:p-8 relative overflow-hidden">
              <div class="font-mono text-[10px] tracking-[0.2em] text-[#1C1B18]/65 mb-5">HOW TO USE</div>
              <p class="font-editorial text-xl leading-[1.7] font-bold">选一个实验，<br />然后动手改参数。</p>
              <p class="text-[13px] leading-[1.85] text-[#1C1B18]/72 mt-4">拖拽旋转模型，点击高亮结构，拖动时间轴或开关，观察场景与读数的实时变化。</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 实验选择 -->
    <section class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" data-stagger>
        <button v-for="lab in labs" :key="lab.id" @click="activeMode = lab.id"
          class="group text-left rounded-[26px] p-6 sm:p-7 border transition-all duration-500 cursor-pointer"
          :class="activeMode === lab.id
            ? 'bg-[#1C1B18] border-[#1C1B18] text-[#F7F4EE] shadow-[0_28px_60px_-30px_rgba(28,27,24,0.65)]'
            : 'bg-[#FFFDF9]/75 border-[#1C1B18]/8 text-[#1C1B18] hover:border-[#C88A32]/50'">
          <div class="flex items-start justify-between gap-4 mb-6">
            <span class="font-editorial text-4xl font-bold" :class="activeMode === lab.id ? 'text-[#C88A32]' : 'text-[#C88A32]'">{{ lab.no }}</span>
            <span class="w-9 h-9 rounded-full grid place-items-center border border-current/30 group-hover:bg-[#C88A32] group-hover:text-[#1C1B18] transition-all duration-500">
              <ArrowUpRight :size="15" class="arrow-shift" />
            </span>
          </div>
          <div class="font-mono text-[10px] tracking-[0.18em] opacity-55 mb-2">{{ lab.en }}</div>
          <h3 class="font-editorial text-xl sm:text-2xl font-bold">{{ lab.name }}</h3>
          <p class="text-[12px] leading-relaxed mt-2 opacity-70">{{ lab.short }}</p>
        </button>
      </div>
    </section>

    <!-- 主实验台 -->
    <section class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
        <Reveal><SectionHead :index="activeMode === 'soil' ? '01 / 04' : activeMode === 'rice' ? '02 / 04' : activeMode === 'beidou' ? '03 / 04' : '04 / 04'"
          :eyebrow="labs.find(l => l.id === activeMode).en" :title="labs.find(l => l.id === activeMode).name"
          :description="labs.find(l => l.id === activeMode).short" /></Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-14">
          <!-- 3D 舞台 -->
          <Reveal variant="scale" class="lg:col-span-8">
            <div class="bezel">
              <div class="bezel-core relative">
                <div class="h-[480px] sm:h-[600px] relative">
                  <WebGLStage scene="science">
                    <ScienceStage :mode="activeMode" :param="param" @select="onSelect" @hover="hoverKey = $event" />
                  </WebGLStage>
                  <div v-if="hoverKey && (activeMode === 'soil' || activeMode === 'notill')"
                    class="absolute top-4 right-4 z-10 rounded-full bg-[#C88A32] text-[#1C1B18] px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] font-bold pointer-events-none">
                    点击聚焦 · {{ activeMode === 'soil'
                      ? (soils.find(s => s.key === hoverKey) || {}).name
                      : (notillStructures.find(s => s.key === hoverKey) || {}).name }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 mt-4">
              <p class="caption">实时 WebGL / 程序化几何与材质 / 可自由旋转与缩放</p>
              <button @click="resetLab" class="inline-flex items-center gap-2 text-xs font-bold text-[#8A6324] cursor-pointer group">
                <RotateCcw :size="14" class="group-hover:-rotate-45 transition-transform duration-500" /> 重置实验参数
              </button>
            </div>
          </Reveal>

          <!-- 控制面板 -->
          <div class="lg:col-span-4 flex flex-col gap-5">
            <!-- 实验一 -->
            <template v-if="activeMode === 'soil'">
              <Reveal>
                <div class="card-linen p-6 sm:p-7">
                  <div class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960] mb-4">SELECT A STRUCTURE</div>
                  <div class="grid grid-cols-2 gap-2">
                    <button v-for="s in soils" :key="s.key" @click="soilFocus = s.key"
                      class="px-3 py-3 rounded-xl text-xs font-bold text-left transition-all duration-400 cursor-pointer"
                      :class="soilFocus === s.key ? 'bg-[#1C1B18] text-[#F7F4EE]' : 'bg-[#EFECE6] text-[#5A564E] hover:bg-[#C88A32]/20'">
                      <span class="font-mono text-[9px] tracking-[0.16em] opacity-60 block mb-1">{{ s.no }}</span>{{ s.name }}
                    </button>
                  </div>
                </div>
              </Reveal>
              <Reveal :delay="90">
                <div class="card-ink p-6 sm:p-7 flex-1 relative overflow-hidden">
                  <span class="absolute -right-4 -bottom-10 font-editorial font-bold text-[#F7F4EE]/7 select-none" style="font-size: 9rem; line-height: 1">{{ activeSoil.no }}</span>
                  <div class="relative font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-3">{{ activeSoil.en }}</div>
                  <h3 class="display-3 relative mb-4">{{ activeSoil.name }}</h3>
                  <p class="relative text-[13px] leading-[1.9] text-[#F7F4EE]/86">{{ activeSoil.desc }}</p>
                  <div class="relative mt-7 pt-5 border-t border-[#F7F4EE]/16 flex items-end justify-between gap-3">
                    <div>
                      <div class="caption text-[#F7F4EE]/90 mb-1">{{ activeSoil.note }}</div>
                      <div class="font-editorial text-2xl font-bold text-[#C88A32]">{{ activeSoil.metric }}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </template>

            <!-- 实验二 -->
            <template v-else-if="activeMode === 'rice'">
              <Reveal>
                <div class="card-linen p-6 sm:p-7">
                  <div class="flex items-center justify-between gap-3 mb-5">
                    <span class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960]">GROWTH TIMELINE</span>
                    <span class="font-mono text-[10px] text-[#8A6324]">{{ riceStage + 1 }} / 5</span>
                  </div>
                  <input v-model.number="riceStage" type="range" min="0" max="4" step="1"
                    aria-label="稻作生长阶段" class="w-full accent-[#C88A32] cursor-pointer" />
                  <div class="grid grid-cols-5 gap-1.5 mt-4">
                    <button v-for="p in ricePhases" :key="p.no" @click="riceStage = p.no"
                      class="py-2.5 min-h-[40px] rounded-lg text-[11px] font-bold transition-all duration-300 cursor-pointer"
                      :class="riceStage === p.no ? 'bg-[#2E5A44] text-[#F7F4EE]' : 'bg-[#EFECE6] text-[#5A564E]'">{{ p.name }}</button>
                  </div>
                  <div class="mt-5 h-2 rounded-full bg-[#EFECE6] overflow-hidden">
                    <div class="h-full bg-[#C88A32] transition-all duration-700" :style="{ width: ((riceStage + 1) / 5 * 100) + '%' }"></div>
                  </div>
                </div>
              </Reveal>
              <Reveal :delay="90">
                <div class="card-moss p-6 sm:p-7 flex-1 relative overflow-hidden">
                  <span class="absolute -right-4 -bottom-10 font-editorial font-bold text-[#F7F4EE]/8 select-none" style="font-size: 9rem; line-height: 1">0{{ riceStage + 1 }}</span>
                  <div class="relative font-mono text-[10px] tracking-[0.2em] text-[#F7F4EE]/80 mb-3">{{ activePhase.en }}</div>
                  <h3 class="display-3 relative mb-2">{{ activePhase.name }}</h3>
                  <div class="relative font-mono text-[11px] text-[#8A6324] mb-4">{{ activePhase.time }}</div>
                  <p class="relative text-[13px] leading-[1.9] text-[#F7F4EE]/86">{{ activePhase.desc }}</p>
                  <div class="relative mt-7 pt-5 border-t border-[#F7F4EE]/16">
                    <div class="caption text-[#F7F4EE]/90 mb-1">关键指标</div>
                    <div class="font-editorial text-xl font-bold text-[#F7F4EE]">{{ activePhase.metric }}</div>
                  </div>
                </div>
              </Reveal>
            </template>

            <!-- 实验三：先讲人话，再给术语 -->
            <template v-else-if="activeMode === 'beidou'">
              <!-- 读数 -->
              <Reveal>
                <div class="card-ink p-6 sm:p-7">
                  <div class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-4">POSITIONING ERROR / 定位误差</div>
                  <div class="font-editorial font-bold leading-none text-[#F7F4EE]" style="font-size: clamp(2.4rem, 3.4vw, 3.2rem)">{{ accuracy }}</div>
                  <p class="text-[12px] leading-[1.85] text-[#F7F4EE]/90 mt-4">
                    {{ blocked ? '差不多一步远，农机分不清该在哪一垄下种。' : '不到两根手指宽，农机知道该把种子撒在哪条线上。' }}
                  </p>
                  <div class="mt-5 pt-4 border-t border-[#F7F4EE]/16">
                    <div class="flex justify-between font-mono text-[9px] tracking-[0.14em] text-[#F7F4EE]/80 mb-2">
                      <span>2.5 厘米</span><span>1.2 米</span>
                    </div>
                    <div class="h-1.5 rounded-full bg-[#F7F4EE]/12 relative overflow-hidden">
                      <div class="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                        :class="blocked ? 'bg-[#B83828] w-full' : 'bg-[#C88A32] w-[6%]'"></div>
                    </div>
                  </div>
                </div>
              </Reveal>

              <!-- 三步看懂 -->
              <Reveal :delay="80">
                <div class="card-linen p-6 sm:p-7">
                  <div class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960] mb-5">三步看懂 / HOW IT WORKS</div>
                  <div class="space-y-4">
                    <div v-for="s in rtSteps" :key="s.no" class="flex gap-3">
                      <span class="shrink-0 w-7 h-7 rounded-full grid place-items-center font-mono text-[10px] font-bold"
                        :class="blocked && s.no === '03' ? 'bg-[#B83828] text-[#F7F4EE]' : 'bg-[#1C1B18] text-[#F7F4EE]'">{{ s.no }}</span>
                      <div>
                        <div class="text-[13px] font-bold leading-snug">{{ s.t }}</div>
                        <div class="text-[11px] leading-[1.8] text-[#5A564E] mt-1">{{ s.d }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="mt-5 rounded-xl border border-[#C88A32]/35 bg-[#C88A32]/8 px-4 py-3">
                    <div class="font-mono text-[9px] tracking-[0.16em] text-[#8A6324] mb-1.5">打个比方</div>
                    <p class="text-[11px] leading-[1.85] text-[#3A3630]">{{ rtAnalogy }}</p>
                  </div>
                </div>
              </Reveal>

              <!-- 田里会发生什么：把 3D 里的双线对比再讲一遍 -->
              <Reveal :delay="140">
                <div class="rounded-2xl border p-5 transition-colors duration-500"
                  :class="blocked ? 'border-[#B83828]/30 bg-[#B83828]/6' : 'border-[#2E5A44]/25 bg-[#2E5A44]/6'">
                  <div class="font-mono text-[9px] tracking-[0.18em] mb-3" :class="blocked ? 'text-[#B83828]' : 'text-[#2E5A44]'">
                    田里会发生什么 / IN THE FIELD
                  </div>
                  <div class="relative h-9 rounded-lg bg-[#FFFDF9]/70 overflow-hidden mb-3">
                    <div class="absolute left-3 right-3 top-[13px] h-[2px] bg-[#C88A32]"></div>
                    <div class="absolute left-3 right-3 h-[2px] transition-all duration-700"
                      :class="blocked ? 'top-[25px] bg-[#B83828]' : 'top-[14px] bg-[#2E5A44]'"></div>
                    <span class="absolute right-3 top-1 font-mono text-[8px] text-[#6E6960]">计划线</span>
                  </div>
                  <div class="text-[13px] font-bold" :class="blocked ? 'text-[#B83828]' : 'text-[#2E5A44]'">{{ rtResult.title }}</div>
                  <p class="text-[11px] leading-[1.85] text-[#3A3630] mt-1.5">{{ rtResult.desc }}</p>
                </div>
              </Reveal>

              <!-- 动手调参 -->
              <Reveal :delay="190">
                <div class="card-linen p-6 sm:p-7">
                  <div class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960] mb-4">试试看 / TRY IT</div>
                  <input v-model.number="satCount" type="range" min="3" max="6" step="1" aria-label="可见卫星数量" class="w-full accent-[#C88A32] cursor-pointer" />
                  <div class="flex items-center justify-between mt-2 text-xs font-semibold">
                    <span>天上能看见几颗卫星</span><span class="font-mono text-[#8A6324]">{{ satCount }} 颗</span>
                  </div>
                  <div class="flex justify-between font-mono text-[9px] text-[#6E6960] mt-1 px-0.5">
                    <span>3</span><span>4</span><span>5</span><span>6</span>
                  </div>
                  <button @click="blocked = !blocked"
                    class="w-full mt-5 py-3 rounded-xl text-xs font-bold transition-all duration-400 cursor-pointer"
                    :class="blocked ? 'bg-[#B83828] text-[#F7F4EE]' : 'bg-[#EFECE6] text-[#5A564E] hover:bg-[#C88A32]/20'">
                    {{ blocked ? '移开林带，恢复改正信号' : '让林带挡住改正信号' }}
                  </button>
                  <p class="text-[10px] leading-[1.8] text-[#5A564E] mt-3">
                    卫星多几颗会更稳，但真正把误差压到厘米级的，是田边基准站那句「改正数」有没有送到。
                  </p>
                  <div class="mt-4 pt-3 border-t border-[#1C1B18]/8 font-mono text-[9px] leading-[1.8] text-[#6E6960]">
                    术语：RTK 即实时动态载波相位差分，基准站与移动站对 B1/B2 双频观测值做差分。
                  </div>
                </div>
              </Reveal>
            </template>

            <!-- 实验四：秸秆覆盖率决定雨水去向 -->
            <template v-else-if="activeMode === 'notill'">
              <Reveal>
                <div class="card-linen p-6 sm:p-7">
                  <div class="flex items-center justify-between gap-3 mb-5">
                    <span class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960]">RESIDUE COVER / 秸秆覆盖率</span>
                    <span class="font-mono text-[10px] text-[#8A6324]">{{ coverage }}%</span>
                  </div>
                  <input v-model.number="coverage" type="range" min="0" max="100" step="10"
                    aria-label="秸秆覆盖率" class="w-full accent-[#C88A32] cursor-pointer" />
                  <div class="grid grid-cols-4 gap-1.5 mt-4">
                    <button v-for="c in coverLevels" :key="c" @click="coverage = c"
                      class="py-2.5 min-h-[40px] rounded-lg text-[11px] font-bold transition-all duration-300 cursor-pointer"
                      :class="coverage === c ? 'bg-[#2E5A44] text-[#F7F4EE]' : 'bg-[#EFECE6] text-[#5A564E]'">{{ c }}%</button>
                  </div>
                  <div class="mt-5 flex gap-1.5 h-2">
                    <div class="rounded-full bg-[#8EBACB] transition-all duration-700" :style="{ width: coverReadout.infilPct + '%' }"></div>
                    <div class="rounded-full bg-[#8C583A] transition-all duration-700" :style="{ width: coverReadout.runoffPct + '%' }"></div>
                  </div>
                  <div class="flex justify-between font-mono text-[9px] tracking-[0.12em] text-[#6E6960] mt-2">
                    <span>下渗 {{ coverReadout.infilPct }}%</span><span>径流 {{ coverReadout.runoffPct }}%</span>
                  </div>
                  <p class="text-[10px] leading-[1.8] text-[#5A564E] mt-3">模型内部的示意比例，用于观察趋势，不是实测统计值。</p>
                </div>
              </Reveal>

              <Reveal :delay="80">
                <div class="card-ink p-6 sm:p-7">
                  <div class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-4">WHAT CHANGES / 田里会怎样</div>
                  <div class="space-y-3">
                    <div v-for="r in [
                      { k: '地表径流', v: coverReadout.runoff },
                      { k: '表土流失', v: coverReadout.loss },
                      { k: '蓄水保墒', v: coverReadout.water }
                    ]" :key="r.k" class="flex items-center justify-between gap-3 pb-2 border-b border-[#F7F4EE]/12">
                      <span class="text-[12px] text-[#F7F4EE]/90">{{ r.k }}</span>
                      <span class="font-editorial text-base font-bold text-[#C88A32]">{{ r.v }}</span>
                    </div>
                  </div>
                  <p class="text-[11px] leading-[1.9] text-[#F7F4EE]/90 mt-4">
                    秸秆盖得越密，雨滴越难直接砸实表土；连续孔隙保留下来，水往里渗而不是带着土往外流。
                  </p>
                </div>
              </Reveal>

              <Reveal :delay="140">
                <div class="card-linen p-6 sm:p-7 flex-1 relative overflow-hidden">
                  <span class="absolute -right-4 -bottom-10 font-editorial font-bold text-[#1C1B18]/6 select-none" style="font-size: 9rem; line-height: 1">{{ activeNotill.no }}</span>
                  <div class="relative font-mono text-[10px] tracking-[0.2em] text-[#6E6960] mb-4">SELECT A STRUCTURE / 点击模型或下方结构</div>
                  <div class="relative grid grid-cols-2 gap-2">
                    <button v-for="s in notillStructures" :key="s.key" @click="notillFocus = s.key"
                      class="px-3 py-3 rounded-xl text-xs font-bold text-left transition-all duration-400 cursor-pointer"
                      :class="notillFocus === s.key ? 'bg-[#1C1B18] text-[#F7F4EE]' : 'bg-[#EFECE6] text-[#5A564E] hover:bg-[#C88A32]/20'">
                      <span class="font-mono text-[9px] tracking-[0.16em] opacity-60 block mb-1">{{ s.no }}</span>{{ s.name }}
                    </button>
                  </div>
                  <div class="relative mt-6 pt-5 border-t border-[#1C1B18]/10">
                    <div class="font-mono text-[9px] tracking-[0.2em] text-[#8A6324] mb-2">{{ activeNotill.en }}</div>
                    <h3 class="font-editorial text-xl font-bold mb-2">{{ activeNotill.name }}</h3>
                    <p class="text-[12px] leading-[1.9] text-[#5A564E]">{{ activeNotill.desc }}</p>
                    <div class="flex items-end justify-between gap-3 mt-4">
                      <span class="caption">{{ activeNotill.note }}</span>
                      <span class="font-editorial text-lg font-bold text-[#8A6324]">{{ activeNotill.metric }}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- 四个实验说明 -->
    <section class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal><SectionHead index="LAB NOTES" eyebrow="FOUR EXPERIMENTS / 实验档案" title="每个模型，回答一个具体问题" description="不是为了炫技，而是把文字讲不清的结构与过程，变成可以亲手改变的东西。" /></Reveal>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-14" data-stagger>
        <Reveal>
          <div class="card-ink h-full p-7 sm:p-8">
            <div class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-6">EXPERIMENT 01</div>
            <h3 class="display-3 mb-4">黑土为什么疏松</h3>
            <p class="text-[13px] leading-[1.9] text-[#F7F4EE]/86">把一厘米土层放大到可交互的尺度，用四类结构解释保水保肥的物理基础：团粒负责胶结，孔隙负责通气透水，菌丝负责稳定与供肥，结核记录淋溶历史。点击任一结构即可聚焦并读取档案。</p>
            <div class="mt-7 flex flex-wrap gap-2">
              <span v-for="t in ['团粒', '孔隙', '菌丝', '结核']" :key="t" class="px-2.5 py-1 rounded-full bg-[#F7F4EE]/10 text-[11px]">{{ t }}</span>
            </div>
          </div>
        </Reveal>
        <Reveal :delay="90">
          <div class="card-moss h-full p-7">
            <div class="font-mono text-[10px] tracking-[0.2em] text-[#F7F4EE]/80 mb-6">EXPERIMENT 02</div>
            <h3 class="display-3 mb-4">一百八十天怎么长</h3>
            <p class="text-[13px] leading-[1.9] text-[#F7F4EE]/86">拖动时间轴，稻株高度、颜色、穗头倾角与田间水位同步变化。五个阶段对应吉林中部真实农时，读数来自公开农技资料的典型区间。</p>
            <div class="mt-7 font-mono text-[11px] text-[#8A6324]">SEEDLING → HARVEST</div>
          </div>
        </Reveal>
        <Reveal :delay="180">
          <div class="card-gold h-full p-7">
            <div class="font-mono text-[10px] tracking-[0.2em] text-[#1C1B18]/65 mb-6">EXPERIMENT 03</div>
            <h3 class="display-3 mb-4">厘米级从哪来</h3>
            <p class="text-[13px] leading-[1.9] text-[#1C1B18]/78">天上卫星、田边基准站、地里农机，三者怎么配合才能让播种不重不漏。挡住改正信号，看轨迹立刻跑偏。</p>
            <div class="mt-7 font-mono text-[11px] font-bold">2.5 cm ↔ 1.2 m</div>
          </div>
        </Reveal>
        <Reveal :delay="240">
          <div class="card-linen h-full p-7">
            <div class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-6">EXPERIMENT 04</div>
            <h3 class="display-3 mb-4">秸秆留在地表</h3>
            <p class="text-[13px] leading-[1.9] text-[#5A564E]">把覆盖率从 0 拉到 90%，看雨滴从「沿地表冲走表土」变成「顺着孔隙往下渗」。翻不翻那一下的差别，被直接画进同一个模型里。</p>
            <div class="mt-7 font-mono text-[11px] text-[#8A6324]">0% → 100% COVER</div>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- 图文收束 -->
    <section class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <Reveal class="lg:col-span-5">
          <FigurePlate src="/art/soil-strata.svg" alt="黑土层位图版" index="PLATE 01" caption="科普实验里出现的结构，都能在真实的一米剖面中找到对应层位。" credit="CHERNOZEM MONOLITH" />
        </Reveal>
        <div class="lg:col-span-7">
          <Reveal><div class="eyebrow mb-5">WHY A LAB / 为什么做实验室</div></Reveal>
          <Reveal :delay="80"><h2 class="display-2">看得见，<br />才谈得上理解</h2></Reveal>
          <Reveal :delay="150"><p class="lede mt-7">
            展馆里的三座 3D 展厅偏重现览与沉浸，而这里偏重「改一个参数，看一个结果」。四个实验分别对应土壤学、作物生理、卫星导航与保护性耕作，把黑土保护背后的科学原理从展签里拿出来，变成可以上手的操作。
          </p></Reveal>
          <Reveal :delay="220">
            <div class="flex flex-wrap gap-3 mt-9">
              <RouterLink to="/strata-3d" class="mag-btn"><span>去看一米黑土标本</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></RouterLink>
              <RouterLink to="/machinery-3d" class="mag-btn mag-btn--light"><span>去看北斗农机解构</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></RouterLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 注释 -->
    <section class="surface-ink">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-18 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <Reveal>
          <div class="eyebrow mb-4">DATA NOTE / 数据说明</div>
          <p class="text-[13px] leading-[2] text-[#F7F4EE]/90 max-w-2xl">
            四个实验为教学演示用的参数化模型，结构与量级参考中国科学院东北地理与农业生态研究所「黑土粮仓」科技会战公开成果、吉林省农技推广资料、保护性耕作公开科普材料与北斗 RTK 通用原理，非实物扫描与工程测量数据。覆盖率、下渗与径流比例均为模型内部示意，用于观察趋势，不作生产决策依据。
          </p>
        </Reveal>
        <Reveal :delay="100">
          <RouterLink to="/" class="mag-btn mag-btn--light"><span>返回序厅</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
