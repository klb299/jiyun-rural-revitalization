<script setup>
import { shallowRef } from 'vue'
import WebGLStage from '../components/editorial/WebGLStage.vue'
import StageLoading from '../components/editorial/StageLoading.vue'
import Reveal from '../components/editorial/Reveal.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import ExhibitCard from '../components/editorial/ExhibitCard.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import { ArrowUpRight, ArrowDown } from 'lucide-vue-next'

const heroMeta = [
  { k: 'EXHIBITION', v: '2026 / 常设展' },
  { k: 'LOCATION', v: '吉林 · 长春' },
  { k: 'GALLERIES', v: '13 个展陈单元' },
  { k: 'TECHNOLOGY', v: 'Vue 3 × WebGL' }
]


const exhibits = [
  {
    index: 'GALLERY 01', tag: 'VIRTUAL PEDOLOGY', meta: '3D / 微观',
    title: '一米黑土，一万年沉积',
    desc: '抽屉式分层展开的亚克力地质标本。腐殖质熟化层、淀积心土层与马兰黄土母质层，在光线下呈现团粒、孔隙与金色菌丝的真实肌理。',
    image: '/art/soil-strata.svg', to: '/strata-3d', cta: '进入地质标本馆'
  },
  {
    index: 'GALLERY 02', tag: 'INDUSTRIAL DECONSTRUCTION', meta: '3D / 工业',
    title: '长春智造，一台车的解构',
    desc: '260 马力北斗无人拖拉机的摄影棚级装配展。一键爆炸分解驾驶舱、动力总成、RTK 天线与低压宽胎，读出一汽工业基因的每一处细节。',
    image: '/art/machine.svg', to: '/machinery-3d', cta: '进入农机解构馆'
  },
  {
    index: 'GALLERY 03', tag: 'RURAL DIGITAL TWIN', meta: '3D / 宏观',
    title: '松辽平原，收进一方沙盘',
    desc: '按东北真实农田地貌重做的数字微缩。深黑土格网、成行防护林、蜿蜒松花江、白瓷粮仓与巡田无人机，六个视点自由飞行。',
    image: '/art/diorama.svg', to: '/sandbox-3d', cta: '进入生态沙盘'
  }
]

const pillars = [
  {
    no: 'PILLAR 01', title: '梨树模式与耕地保育', to: '/strata-3d', image: '/art/soil-strata.svg',
    desc: '秸秆覆盖免耕播种，把风蚀水蚀挡在黑土之外。中科院东北地理所与梨树试验田长期定位观测，让「变薄、变瘦、变硬」的耕地重新呼吸。',
    tag: '黑土保护', tone: 'ink'
  },
  {
    no: 'PILLAR 02', title: '5G 与北斗自主作业', to: '/machinery-3d', image: '/art/machine.svg',
    desc: '厘米级 RTK 定位串起起垄、播种、植保全流程。长春现代农机研发高地提供的无人装备，让一季农忙从人力密集走向算法调度。',
    tag: '智慧装备', tone: 'gold'
  },
  {
    no: 'PILLAR 03', title: '松花江水与吉林大米', to: '/journey', image: '/art/rice.svg',
    desc: '长白山雪水经松花江灌区进入万亩稻田，一百八十天积温淬炼出优质粳稻。一袋一码的区块链溯源，把地块经纬度写进包装。',
    tag: '品质溯源', tone: 'moss'
  },
  {
    no: 'PILLAR 04', title: '冬捕非遗与冰雪文旅', to: '/chagan-lake', image: '/art/lake.svg',
    desc: '祭湖醒网、马拉绞盘、抓大放小。千年渔猎仪轨与生态增殖放流并行，把「冰天雪地也是金山银山」做成一条完整的富民产业链。',
    tag: '生态文旅', tone: 'linen'
  }
]

const routeSteps = [
  { no: '01', name: '序厅 · 总览', note: '建立黑土粮仓的整体坐标', time: '约 2 分钟' },
  { no: '02', name: '三座 3D 展厅', note: '微观土壤 / 工业装配 / 宏观平原', time: '约 12 分钟' },
  { no: '03', name: '十个专题章节', note: '数据、旅程、非遗、节气、物产、科普、助农与痛点实验', time: '按兴趣选读' },
  { no: '04', name: '长春智库与答辩说明', note: '科教支撑、技术栈与设计自述', time: '约 4 分钟' }
]

const toneClass = {
  ink: 'card-ink text-[#F7F4EE]',
  gold: 'card-gold text-[#1C1B18]',
  moss: 'card-moss text-[#F7F4EE]',
  linen: 'card-linen text-[#1C1B18]'
}

const toneCaption = {
  ink: 'text-[#F7F4EE]/90',
  gold: 'text-[#1C1B18]/70',
  moss: 'text-[#F7F4EE]/86',
  linen: 'text-[#5A564E]'
}

// 首页沙盘按需加载：Three.js 只在展台滚入视口时才下载与初始化，
// 首屏不再为一个位于第五屏的三维场景付出整包体积与 WebGL 上下文。
const SandboxComponent = shallowRef(null)
let sandboxRequested = false
const loadSandbox = () => {
  if (sandboxRequested) return
  sandboxRequested = true
  import('../components/RuralSandbox3D.vue').then((m) => {
    SandboxComponent.value = m.default
  })
}
</script>

<template>
  <div class="relative">
    <!-- 01 杂志封面式首屏 -->
    <section class="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#F7F4EE]">
      <div class="absolute inset-0 coord-rule opacity-70 pointer-events-none"></div>

      <!-- 大面积琥珀金圆 + 旋转文字环 -->
      <div data-parallax="-16" class="absolute -right-[10%] -top-[16%] w-[42vw] h-[42vw] min-w-[400px] min-h-[400px] rounded-full pointer-events-none"
        style="background: radial-gradient(circle at 35% 30%, #E8BC6E 0%, #C88A32 52%, #A46C20 100%); box-shadow: 0 60px 140px -60px rgba(168,111,34,.65)">
        <svg viewBox="0 0 200 200" class="absolute inset-0 w-full h-full animate-[spin_34s_linear_infinite] opacity-70">
          <defs><path id="home-ring" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0"></path></defs>
          <text font-family="ui-monospace, monospace" font-size="8.5" letter-spacing="2.6" fill="#1C1B18">
            <textPath href="#home-ring">BLACK SOIL ATLAS · JILIN DIGITAL RURAL MUSEUM · 2026 · CHANGCHUN · </textPath>
          </text>
        </svg>
        <div class="absolute inset-[22%] rounded-full border border-[#1C1B18]/20"></div>
        <div class="absolute inset-[38%] rounded-full bg-[#1C1B18]/90 grid place-items-center">
          <span class="font-editorial text-[#F7F4EE] text-3xl sm:text-5xl font-bold">吉</span>
        </div>
      </div>

      <!-- 左下墨色斜切块 -->
      <div class="absolute -left-24 -bottom-32 w-[38vw] h-[32vw] min-w-[320px] min-h-[280px] bg-[#1C1B18] rotate-[-14deg] pointer-events-none opacity-[0.94]"></div>
      <div class="absolute left-8 bottom-10 z-10 hidden lg:block rot-tag text-[#F7F4EE]/80">EST. 2026 / CHANGCHUN</div>

      <div class="relative z-10 max-w-[1440px] mx-auto w-full px-5 sm:px-8 lg:px-12 pt-28 pb-20">
        <Reveal :delay="0">
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="eyebrow">2026 / CHANGCHUN / 常设展</span>
            <span class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960]">VOL. 01 — BLACK SOIL</span>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div class="lg:col-span-7">
            <h1 class="display-1 text-[#1C1B18]" aria-label="黑土粮仓 吉韵新程">
              <span v-for="(ch, i) in Array.from('黑土粮仓')" :key="'a' + i" class="kin-char"
                :style="{ animationDelay: (0.1 + i * 0.07) + 's' }">{{ ch }}</span>
              <span class="block text-[#C88A32]">
                <span v-for="(ch, i) in Array.from('吉韵新程')" :key="'b' + i" class="kin-char"
                  :style="{ animationDelay: (0.42 + i * 0.07) + 's' }">{{ ch }}</span>
              </span>
            </h1>
            <Reveal :delay="520">
              <p class="font-editorial text-lg sm:text-2xl text-[#5A564E] mt-7">吉林现代数字乡村振兴与生态农业 3D 展馆</p>
            </Reveal>
            <Reveal :delay="600">
              <p class="lede mt-5 max-w-xl">
                世界三大黑土带之一，一厘米土层需要两百年沉积。我们把这条漫长的时间线，做成一座可以拖拽、可以下潜、可以漫游的线上美术馆。
              </p>
            </Reveal>
            <Reveal :delay="680">
              <div class="flex flex-wrap items-center gap-3 mt-9">
                <RouterLink to="/strata-3d" class="mag-btn">
                  <span>从一米黑土开始</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span>
                </RouterLink>
                <RouterLink to="/sandbox-3d" class="mag-btn mag-btn--light">
                  <span>俯瞰松辽平原</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span>
                </RouterLink>
              </div>
            </Reveal>
          </div>

          <!-- Z 轴层叠图版 -->
          <div class="lg:col-span-5 relative hidden lg:block" data-parallax="-8">
            <div class="bezel z-card" style="transform: rotate(-4deg)">
              <div class="bezel-core">
                <img src="/art/diorama.svg" alt="松辽平原田块俯视图版" class="w-full aspect-[4/5] object-cover" />
              </div>
            </div>
            <div class="card-ink z-card absolute -bottom-10 -left-14 w-64 p-6" style="transform: rotate(5deg)">
              <div class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-3">FIELD NOTE / 001</div>
              <div class="font-editorial text-4xl font-bold leading-none">200<span class="text-lg ml-1">年</span></div>
              <p class="text-[12px] leading-relaxed text-[#F7F4EE]/90 mt-3">形成一厘米黑土所需的时间。整座展馆，从这一个数字开始。</p>
            </div>
            <div class="absolute -top-5 -right-3 z-20 px-3 py-2 rounded-full bg-[#C88A32] text-[#1C1B18] font-mono text-[10px] font-bold tracking-[0.16em] shadow-lg">PLATE 00</div>
          </div>
        </div>

        <Reveal :delay="760" class="mt-16">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-for="(m, i) in heroMeta" :key="m.k"
              class="rounded-2xl px-4 py-3.5 border"
              :class="i === 0 ? 'bg-[#C88A32]/18 border-[#C88A32]/40' : 'bg-[#FFFDF9]/72 border-[#1C1B18]/8'">
              <div class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960] mb-1.5">{{ m.k }}</div>
              <div class="text-xs sm:text-sm font-bold text-[#1C1B18]">{{ m.v }}</div>
            </div>
          </div>
        </Reveal>
      </div>

      <!-- 底部动态字带 -->
      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#1C1B18]/10 bg-[#1C1B18] py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[11px] tracking-[0.22em] text-[#F7F4EE]/86 whitespace-nowrap">
            <span>CHERNOZEM · 黑土粮仓</span><span class="text-[#C88A32]">✳</span>
            <span>3D INTERACTIVE GALLERIES</span><span class="text-[#C88A32]">✳</span>
            <span>SONGLIAO PLAIN DIGITAL TWIN</span><span class="text-[#C88A32]">✳</span>
            <span>吉韵新程</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
      <div class="absolute bottom-14 right-8 z-10 hidden sm:flex items-center gap-2 text-[#1C1B18]/45">
        <span class="font-mono text-[10px] tracking-[0.2em]">SCROLL</span><ArrowDown :size="15" class="float-slow" />
      </div>
    </section>

    <!-- 02 非对称 Bento 数据带 -->
    <section class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="01 / 06" eyebrow="THE NUMBERS / 黑土尺度" title="先读四个数字" description="耕地、产量、机械化与认证基地，构成理解吉林粮仓的四把尺子。" />
      </Reveal>
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mt-14" data-stagger>
        <Reveal class="md:col-span-5">
          <div class="card-gold h-full p-7 sm:p-9 relative overflow-hidden">
            <span class="absolute -right-4 -bottom-12 font-editorial font-bold text-[#1C1B18]/10 select-none" style="font-size: 12rem; line-height: 1">01</span>
            <div class="relative font-mono text-[10px] tracking-[0.22em] text-[#1C1B18]/70 mb-8">CORE ARABLE LAND</div>
            <div class="relative font-editorial font-bold leading-none" style="font-size: clamp(3.4rem, 7vw, 6.4rem)">8000<span class="text-3xl ml-1">+</span></div>
            <div class="relative mt-5 text-lg font-bold">万亩黑土核心耕地</div>
            <p class="relative text-[13px] leading-relaxed text-[#1C1B18]/70 mt-3">东北黑土区黄金腹地，世界三大黑土带之一。</p>
          </div>
        </Reveal>
        <Reveal class="md:col-span-4">
          <div class="card-ink h-full p-7 sm:p-9 relative overflow-hidden">
            <span class="absolute -right-4 -bottom-12 font-editorial font-bold text-[#F7F4EE]/8 select-none" style="font-size: 12rem; line-height: 1">02</span>
            <div class="relative font-mono text-[10px] tracking-[0.22em] text-[#8A6324] mb-8">ANNUAL GRAIN OUTPUT</div>
            <div class="relative font-editorial font-bold leading-none text-[#F7F4EE]" style="font-size: clamp(3rem, 6vw, 5.4rem)">880</div>
            <div class="relative mt-5 text-lg font-bold">亿斤 / 吉林年粮食总产</div>
            <p class="relative text-[13px] leading-relaxed text-[#F7F4EE]/90 mt-3">连续多年超额完成国家粮食生产目标。</p>
          </div>
        </Reveal>
        <Reveal class="md:col-span-3">
          <div class="card-moss h-full p-7 relative overflow-hidden">
            <div class="font-mono text-[10px] tracking-[0.22em] text-[#F7F4EE]/80 mb-8">MECHANIZATION</div>
            <div class="font-editorial font-bold leading-none" style="font-size: clamp(2.6rem, 5vw, 4.4rem)">93.5<span class="text-2xl">%</span></div>
            <div class="mt-4 text-sm font-bold">综合机械化率</div>
            <p class="text-[12px] leading-relaxed text-[#F7F4EE]/90 mt-2">全程智慧农机作业覆盖。</p>
          </div>
        </Reveal>
        <Reveal class="md:col-span-12">
          <div class="card-linen p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
            <div>
              <div class="font-mono text-[10px] tracking-[0.22em] text-[#6E6960] mb-2">GREEN & ORGANIC BASES</div>
              <div class="font-editorial text-3xl sm:text-4xl font-bold">1200+ <span class="text-base font-normal text-[#5A564E]">处绿色有机认证基地</span></div>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="t in ['查干湖', '长白山', '松辽平原']" :key="t" class="px-3 py-1.5 rounded-full bg-[#1C1B18]/8 text-xs font-semibold">{{ t }}</span>
            </div>
          </div>
        </Reveal>
      </div>
      <Reveal :delay="120">
        <div class="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.14em] text-[#6E6960]">
          <span>DATA NOTE / 以上为教学演示用的量级与示意指标，非逐年统计值</span>
          <RouterLink to="/about#data-notes" class="text-[#8A6324] hover:text-[#1C1B18] transition-colors">
            在白皮书附录 A 查看口径与年份 <span class="arrow-shift inline-block ml-1">→</span>
          </RouterLink>
        </div>
      </Reveal>
    </section>

    <!-- 03 策展导语：墨色大区块 + 层叠图版 -->
    <section class="surface-ink relative overflow-hidden">
      <div class="absolute inset-0 coord-rule opacity-25 pointer-events-none"></div>
      <div class="absolute -left-20 top-1/3 font-editorial font-bold text-[#F7F4EE]/[0.045] select-none" style="font-size: 28rem; line-height: 1">土</div>
      <div class="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-24 sm:py-32 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
        <div class="lg:col-span-7">
          <Reveal><div class="eyebrow mb-7">CURATORIAL STATEMENT / 策展导语</div></Reveal>
          <Reveal :delay="90">
            <h2 class="display-1 text-[#F7F4EE] max-w-3xl" style="font-size: clamp(2.4rem, 4.6vw, 4.5rem)">
              黑土不是颜色，<br /><span class="text-[#C88A32]">是被压缩的时间</span>
            </h2>
          </Reveal>
          <Reveal :delay="180"><p class="lede text-[#F7F4EE]/86 mt-9 max-w-2xl">
            每一厘米腐殖层，都要经过两百到四百年的枯荣、冻融与微生物分解。我们把这条时间线拆成十三个可进入的展陈单元：三座 Three.js 实时场景分别承担微观、工业与宏观尺度，十个图文专题把数据、农时、非遗、物产、助农机制与落地痛点重新串回同一片土地，另有一张展览地图作为总览索引，把六段尺度摊成一条动线。
          </p></Reveal>
          <Reveal :delay="260">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12" data-stagger>
              <div v-for="n in [
                { k: 'SCALE', v: '1 cm → 40 km', d: '从团粒到平原的尺度跨越' },
                { k: 'RENDER', v: '实时 WebGL', d: 'IBL 环境光 / GTAO / 物理折射' },
                { k: 'SOURCE', v: '程序化生成', d: '几何、纹理、图版全部本地构建' }
              ]" :key="n.k" class="rounded-2xl bg-[#F7F4EE]/6 border border-[#F7F4EE]/12 p-5">
                <div class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-2">{{ n.k }}</div>
                <div class="font-editorial text-lg font-bold text-[#F7F4EE]">{{ n.v }}</div>
                <div class="caption text-[#F7F4EE]/90 mt-1.5">{{ n.d }}</div>
              </div>
            </div>
          </Reveal>
        </div>
        <Reveal :delay="150" variant="scale" class="lg:col-span-5 relative" data-parallax="-10">
          <div class="bezel bezel--ink z-card" style="transform: rotate(3deg)">
            <div class="bezel-core">
              <img src="/art/hero-field.svg" alt="黑土田野等高线图版" loading="lazy" class="w-full aspect-[4/5] object-cover" />
            </div>
          </div>
          <div class="absolute -bottom-8 -left-8 card-gold z-card px-6 py-5 rounded-2xl" style="transform: rotate(-4deg)">
            <div class="font-mono text-[10px] tracking-[0.18em] mb-1">FIELD CONTOURS / PLATE 02</div>
            <div class="font-editorial text-xl font-bold">图版 00</div>
          </div>
          <div class="absolute -top-6 right-0 rot-tag text-[#F7F4EE]/80">PROCEDURAL PLATE</div>
        </Reveal>
      </div>
    </section>

    <!-- 04 三大 3D 展厅：非对称层叠 -->
    <section class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="02 / 06" eyebrow="THREE INTERACTIVE GALLERIES" title="三座可以走进去的展厅" description="微观地质、工业装配、宏观平原，三套独立构建的 Three.js 场景共用一个光照与色彩秩序。" to="/sandbox-3d" link-label="从全景沙盘开始" />
      </Reveal>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-14" data-stack>
        <Reveal class="lg:col-span-6">
          <ExhibitCard v-bind="exhibits[0]" class="h-full" />
        </Reveal>
        <div class="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Reveal :delay="100" class="h-full"><ExhibitCard v-bind="exhibits[1]" dark class="h-full" /></Reveal>
          <Reveal :delay="190" class="h-full"><ExhibitCard v-bind="exhibits[2]" class="h-full" /></Reveal>
        </div>
      </div>
    </section>

    <!-- 05 实时沙盘：琥珀金区块 -->
    <section class="relative overflow-hidden" style="background: linear-gradient(150deg, #E4B463 0%, #C88A32 48%, #A9701F 100%)">
      <div class="absolute -right-20 -top-40 w-[520px] h-[520px] rounded-full bg-[#FFFDF9]/12 blur-3xl pointer-events-none"></div>
      <div class="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <div class="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <div class="font-mono text-[10px] tracking-[0.22em] text-[#1C1B18]/65 mb-3">03 / 06 · LIVE DIORAMA</div>
              <h2 class="display-2 text-[#1C1B18]">把整片平原，<br />放在展台上</h2>
            </div>
            <RouterLink to="/sandbox-3d" class="mag-btn mag-btn--light">
              <span>进入完整沙盘展厅</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span>
            </RouterLink>
          </div>
        </Reveal>
        <Reveal :delay="110" variant="scale">
          <div class="bezel">
            <div class="bezel-core relative">
              <div class="h-[440px] sm:h-[580px] relative overflow-hidden">
                <WebGLStage
                  scene="sandbox"
                  lazy
                  tone="gold"
                  idle-label="LIVE DIORAMA / STANDBY"
                  idle-note="松辽平原展台待布置，向下继续参观"
                  @activate="loadSandbox"
                >
                  <component :is="SandboxComponent" v-if="SandboxComponent" compact />
                  <StageLoading
                    v-else
                    variant="busy"
                    tone="gold"
                    label="BUILDING DIORAMA"
                    note="黑土田块与防护林正在生成"
                  />
                </WebGLStage>
                <div v-if="SandboxComponent" class="absolute bottom-5 left-5 rounded-2xl bg-[#1C1B18]/88 backdrop-blur px-4 py-3 pointer-events-none">
                  <div class="font-mono text-[10px] tracking-[0.18em] text-[#8A6324] mb-1">LIVE / WEBGL</div>
                  <div class="text-xs font-bold text-[#F7F4EE]">松辽平原实时数字孪生</div>
                </div>
                <div v-if="SandboxComponent" class="absolute top-5 right-5 rounded-full bg-[#FFFDF9]/85 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] pointer-events-none">DRAG TO ORBIT</div>
              </div>
            </div>
          </div>
          <p class="caption text-[#1C1B18]/70 mt-4">图版 03 / 规整黑土田块、行列防护林、蜿蜒水系与清洁能源机组，均为程序化几何生成。</p>
        </Reveal>
      </div>
    </section>

    <!-- 06 四大支柱：实心色块 Bento -->
    <section class="surface-linen">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal><SectionHead index="04 / 06" eyebrow="FOUR PILLARS" title="四条主线，读懂吉林乡村振兴" description="从耕地保育到装备升级，从品质溯源到生态文旅，每个支柱都对应一条完整参观动线。" /></Reveal>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mt-14" data-stagger>
          <Reveal v-for="(p, i) in pillars" :key="p.no" :delay="i * 80"
            :class="i === 0 ? 'md:col-span-7' : i === 1 ? 'md:col-span-5' : i === 2 ? 'md:col-span-5' : 'md:col-span-7'">
            <RouterLink :to="p.to" class="group block h-full overflow-hidden z-card lift" :class="toneClass[p.tone]">
              <div class="grid grid-cols-1 sm:grid-cols-5 h-full">
                <div class="sm:col-span-2 relative overflow-hidden">
                  <img :src="p.image" :alt="p.title" loading="lazy" class="w-full h-full min-h-[180px] object-cover transition-transform duration-[1.4s] group-hover:scale-[1.08]" />
                </div>
                <div class="sm:col-span-3 p-6 sm:p-8 relative">
                  <span class="absolute -top-8 right-2 font-editorial font-bold opacity-[0.07] select-none" style="font-size: 9rem; line-height: 1">{{ p.no.slice(-2) }}</span>
                  <div class="relative flex items-center justify-between gap-3 mb-6">
                    <span class="font-mono text-[10px] tracking-[0.2em] opacity-60">{{ p.no }}</span>
                    <span class="px-2.5 py-1 rounded-full bg-current/10 text-[10px] font-mono">{{ p.tag }}</span>
                  </div>
                  <h3 class="display-3 relative mb-3">{{ p.title }}</h3>
                  <p class="relative text-[13px] leading-[1.85]" :class="toneCaption[p.tone]">{{ p.desc }}</p>
                  <div class="relative mt-7 inline-flex items-center gap-2 text-xs font-bold">
                    <span class="link-line">查看对应展陈</span>
                    <span class="w-8 h-8 rounded-full grid place-items-center border border-current/35 group-hover:bg-[#C88A32] group-hover:text-[#1C1B18] transition-all duration-500"><ArrowUpRight :size="14" class="arrow-shift" /></span>
                  </div>
                </div>
              </div>
            </RouterLink>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 06b 助农专题入口：紧凑横带，不重排既有区块 -->
    <section class="bg-[#2E5A44]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-14">
        <Reveal>
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div class="lg:col-span-4">
              <div class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-3">RURAL REVITALIZATION / 助农专题</div>
              <h2 class="font-editorial text-2xl sm:text-3xl font-bold text-[#FFFDF9] leading-snug">技术落在哪片地上，<br />农户账本就多出哪几笔</h2>
            </div>
            <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <RouterLink v-for="n in [
                { to: '/aid-projects', k: '01 / 索引', t: '助农项目库', d: '六类带农路径' },
                { to: '/adopt-a-field', k: '02 / 参与', t: '认养一亩田', d: '四步农事流程' },
                { to: '/farm-income', k: '03 / 机制', t: '一块地五笔收入', d: '收益与风险' },
                { to: '/last-mile', k: '04 / 痛点', t: '最后一公里实验室', d: '三个交互实验' }
              ]" :key="n.to" :to="n.to"
                class="group border border-[#F7F4EE]/22 bg-[#F7F4EE]/6 p-5 hover:bg-[#F7F4EE]/12 transition-colors duration-500">
                <div class="font-mono text-[9px] tracking-[0.18em] text-[#8A6324] mb-3">{{ n.k }}</div>
                <div class="font-editorial text-lg font-bold text-[#FFFDF9] mb-1 group-hover:text-[#C88A32] transition-colors">{{ n.t }}</div>
                <div class="text-[11px] text-[#F7F4EE]/86">{{ n.d }}</div>
              </RouterLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- 07 参观动线 -->
    <section class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12">
      <Reveal class="lg:col-span-4">
        <div class="eyebrow mb-5">VISITOR ROUTE / 参观动线</div>
        <h2 class="display-2">一条动线，<br />走完一片黑土</h2>
        <p class="body-copy mt-6 max-w-sm">展馆按尺度递进编排。先建立整体印象，再依次进入微观、工业与宏观三个 3D 场景，最后用图文专题补足数据、农时、助农机制与人的故事。</p>
        <RouterLink to="/exhibit-map" class="link-line mt-6 text-[12px] font-bold text-[#8A6324]">先看展览地图，按兴趣挑动线 <ArrowUpRight :size="14" class="arrow-shift" /></RouterLink>
        <FigurePlate src="/art/seasons.svg" alt="二十四节气色环图版" index="PLATE 06" caption="春生、夏长、秋收、冬藏。吉林农耕物候是整座展馆的时间轴。" credit="SOLAR TERMS" class="mt-9" />
      </Reveal>
      <div class="lg:col-span-8" data-stagger>
        <Reveal v-for="(s, i) in routeSteps" :key="s.no" :delay="i * 80">
          <RouterLink :to="['/', '/strata-3d', '/journey', '/about'][i]" class="group grid grid-cols-[62px_1fr_auto] items-center gap-5 py-7 border-b border-[#1C1B18]/12 first:border-t hover:bg-[#EFECE6]/60 transition-colors duration-500 px-3">
            <span class="font-editorial text-3xl font-bold text-[#C88A32]">{{ s.no }}</span>
            <span>
              <span class="block font-editorial text-xl font-bold group-hover:text-[#8A6324] transition-colors">{{ s.name }}</span>
              <span class="caption block mt-1">{{ s.note }}</span>
            </span>
            <span class="font-mono text-[11px] text-[#6E6960] flex items-center gap-3 whitespace-nowrap">{{ s.time }} <ArrowUpRight :size="16" class="arrow-shift text-[#8A6324]" /></span>
          </RouterLink>
        </Reveal>
      </div>
    </section>

    <!-- 科普实验室入口 -->
    <section class="relative overflow-hidden" style="background: linear-gradient(145deg, #407257 0%, #2E5A44 55%, #22402F 100%)">
      <div class="absolute inset-0 coord-rule opacity-20 pointer-events-none"></div>
      <div data-parallax="-10" class="absolute -right-[8%] -bottom-[40%] w-[34vw] h-[34vw] min-w-[320px] min-h-[320px] rounded-full bg-[#C88A32]/18 blur-3xl pointer-events-none"></div>
      <div class="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <Reveal class="lg:col-span-5">
          <div class="eyebrow mb-6">INTERACTIVE SCIENCE LAB / 互动科普实验室</div>
          <h2 class="display-2 text-[#F7F4EE]">看得见，<br /><span class="text-[#E8BC6E]">才谈得上理解</span></h2>
          <p class="lede text-[#F7F4EE]/86 mt-7">
            三个可操作的 3D 原理演示。放大黑土团粒、拖动稻作时间轴、改变卫星数量看定位精度退化，把展签讲不清的事变成可以上手的操作。
          </p>
          <RouterLink to="/science" class="mag-btn mag-btn--light mt-9">
            <span>进入科普实验室</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span>
          </RouterLink>
        </Reveal>
        <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4" data-stagger>
          <Reveal v-for="(lab, i) in [
            { no: '01', k: 'SOIL', t: '黑土团粒', d: '团粒、孔隙、菌丝与结核，点击即读档案' },
            { no: '02', k: 'RICE', t: '稻作五阶段', d: '拖动时间轴，看一株稻从育秧到成熟' },
            { no: '03', k: 'BEIDOU', t: '北斗 RTK', d: '改卫星数与遮挡，看厘米级精度怎么来' }
          ]" :key="lab.no" :delay="i * 90">
            <RouterLink to="/science" class="group block h-full rounded-3xl bg-[#F7F4EE]/8 border border-[#F7F4EE]/16 p-6 hover:bg-[#F7F4EE]/14 transition-all duration-500 hover:-translate-y-2">
              <div class="flex items-start justify-between mb-8">
                <span class="font-editorial text-3xl font-bold text-[#E8BC6E]">{{ lab.no }}</span>
                <ArrowUpRight :size="16" class="text-[#E8BC6E] arrow-shift" />
              </div>
              <div class="font-mono text-[10px] tracking-[0.2em] text-[#F7F4EE]/80 mb-2">{{ lab.k }}</div>
              <h3 class="font-editorial text-xl font-bold text-[#F7F4EE] mb-3">{{ lab.t }}</h3>
              <p class="text-[12px] leading-[1.8] text-[#F7F4EE]/90">{{ lab.d }}</p>
            </RouterLink>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 08 收束 -->
    <section class="surface-ink relative overflow-hidden">
      <div class="absolute right-[8%] top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-[#C88A32]/30 pointer-events-none"></div>
      <div class="absolute right-[8%] top-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-[#C88A32]/20 pointer-events-none"></div>
      <div class="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-24 sm:py-32 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <Reveal class="lg:col-span-8">
          <div class="eyebrow mb-6">BEGIN THE VISIT</div>
          <h2 class="display-1 text-[#F7F4EE]">从一厘米开始，<br /><span class="text-[#C88A32]">看见一整片平原。</span></h2>
        </Reveal>
        <Reveal :delay="130" class="lg:col-span-4 lg:text-right">
          <div class="flex flex-wrap lg:justify-end gap-3">
            <RouterLink to="/strata-3d" class="mag-btn mag-btn--gold"><span>进入 3D 标本馆</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></RouterLink>
            <RouterLink to="/about" class="mag-btn mag-btn--light"><span>了解设计说明</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></RouterLink>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
</template>
