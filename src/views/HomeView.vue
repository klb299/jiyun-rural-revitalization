<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'
import { useRouter } from 'vue-router'
import { navigateWithViewTransition } from '../lib/viewTransition.js'
import Reveal from '../components/editorial/Reveal.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import ExhibitCard from '../components/editorial/ExhibitCard.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import { ArrowUpRight, ArrowDown } from 'lucide-vue-next'

const router = useRouter()
// 入场没播完就点 CTA 时，先把遮罩从 DOM 移除再启动 View Transitions。
// 否则 VT 的旧快照会带着半透明图版一起 morph 到 3D 页，中间态会脏。
// endPrelude 定义在下方，只在点击时调用，不存在 TDZ 问题。
const enterGallery = async (to) => {
  endPrelude()
  await nextTick()
  navigateWithViewTransition(router, to)
}

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
    image: '/photos/3d-strata.jpg', to: '/strata-3d', cta: '进入地质标本馆'
  },
  {
    index: 'GALLERY 02', tag: 'INDUSTRIAL DECONSTRUCTION', meta: '3D / 工业',
    title: '长春智造，一台车的解构',
    desc: '260 马力北斗无人拖拉机的摄影棚级装配展。一键爆炸分解驾驶舱、动力总成、RTK 天线与低压宽胎，读出一汽工业基因的每一处细节。',
    image: '/photos/3d-machinery.jpg', to: '/machinery-3d', cta: '进入农机解构馆'
  },
  {
    index: 'GALLERY 03', tag: 'RURAL DIGITAL TWIN', meta: '3D / 宏观',
    title: '松辽平原，收进一方沙盘',
    desc: '按东北真实农田地貌重做的数字微缩。深黑土格网、成行防护林、蜿蜒松花江、白瓷粮仓与巡田无人机，六个视点自由飞行。',
    image: '/photos/3d-sandbox.jpg', to: '/sandbox-3d', cta: '进入生态沙盘'
  }
]

const routeSteps = [
  { no: '01', name: '序厅 · 总览', note: '建立黑土粮仓的整体坐标', time: '约 2 分钟' },
  { no: '02', name: '三座 3D 展厅', note: '微观土壤 / 工业装配 / 宏观平原', time: '约 12 分钟' },
  { no: '03', name: '十个专题章节', note: '数据、旅程、非遗、节气、物产、科普、助农与痛点实验', time: '按兴趣选读' },
  { no: '04', name: '长春智库与答辩说明', note: '科教支撑、技术栈与设计自述', time: '约 4 分钟' }
]

// 首页不再挂载实时 3D 沙盘：实测滚动到第五屏时同步初始化 Three.js
// 会造成 4.6 秒主线程阻塞。改为真实航拍照片 + 进馆按钮，
// 完整 WebGL 沙盘仍保留在 /sandbox-3d，体验不缺、滚动不再卡死。

/* ---------------- 首屏一次性入场镜头 ----------------
 * 从黑土剖面推近，拉远成平原，落到沙盘俯视，然后淡出到稳定首屏。
 * 不是循环背景视频；点击或按键立即跳过，reduced-motion 下整个不渲染。
 * 遮罩 pointer-events:none，点击会穿透到下面的 CTA，不阻塞 View Transitions。
 */
const preludeOn = ref(false)
let preludeTl = null
let skipHandler = null

const endPrelude = () => {
  if (!preludeOn.value) return
  preludeTl?.kill()
  preludeOn.value = false
  if (skipHandler) {
    window.removeEventListener('pointerdown', skipHandler, true)
    window.removeEventListener('keydown', skipHandler)
    skipHandler = null
  }
}

onMounted(() => {
  // 借鉴 GoogleChromeLabs/quicklink：首页稳定后错峰预取三座 3D 展厅的路由 chunk，
  // 评委点 CTA 时不必再等 693KB 的 Three.js 异步包。放在动效降级判断之前，保证一定执行。
  window.__prefetchLog = []
  ;[
    () => import('./SoilStrataView.vue'),
    () => import('./MachineryView.vue'),
    () => import('./SandboxView.vue')
  ].forEach((job, i) => {
    window.setTimeout(() => {
      job().then(() => window.__prefetchLog.push('ok')).catch(() => window.__prefetchLog.push('fail'))
    }, 1200 + i * 1500)
  })

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  preludeOn.value = true
  skipHandler = () => endPrelude()
  window.addEventListener('pointerdown', skipHandler, { capture: true, once: true })
  window.addEventListener('keydown', skipHandler, { once: true })

  nextTick(() => {
    const layer = document.querySelector('.hero-prelude')
    if (!layer) { endPrelude(); return }
    const plates = layer.querySelectorAll('.prelude-plate')
    gsap.set(plates, { autoAlpha: 0, scale: 1.55 })
    // 定稿时长 3.36 秒：评委前三秒决定印象，6.4 秒遮罩会让人以为没加载完。
    // 三幕改成顺序切镜（上一幕淡出完才淡入下一幕）：压缩版若让两幕重叠，
    // luminosity 混合会把两张图版叠在一起，中间露出明显的拼接线。
    preludeTl = gsap.timeline({ onComplete: endPrelude })
    preludeTl
      .to(plates[0], { autoAlpha: 1, scale: 1.02, duration: 0.60, ease: 'power2.out' })
      .to(plates[0], { scale: 1.35, autoAlpha: 0, duration: 0.58, ease: 'power1.inOut' })
      .to(plates[1], { autoAlpha: 1, scale: 0.94, duration: 0.64, ease: 'power2.out' })
      .to(plates[1], { scale: 0.72, autoAlpha: 0, duration: 0.52, ease: 'power1.inOut' })
      .to(plates[2], { autoAlpha: 1, scale: 1, duration: 0.54, ease: 'power2.out' })
      .to(layer, { autoAlpha: 0, duration: 0.48, ease: 'power2.inOut' })
      .to('.prelude-progress', { width: '100%', duration: 3.36, ease: 'none' }, 0)
  })
})

onUnmounted(() => endPrelude())
</script>

<template>
  <div class="relative">
    <!-- 01 杂志封面式首屏 -->
    <section data-cinema class="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#F7F4EE]">
      <div class="absolute inset-0 coord-rule opacity-70 pointer-events-none"></div>

      <!-- 大面积琥珀金圆 + 旋转文字环 -->
      <div data-cinema-seed data-parallax="-16" class="hero-seed absolute -right-[10%] -top-[16%] w-[42vw] h-[42vw] min-w-[25rem] min-h-[25rem] rounded-full pointer-events-none"
        style="background: radial-gradient(circle at 35% 30%, #E8BC6E 0%, #C88A32 52%, #A46C20 100%); box-shadow: 0 60px 140px -60px rgba(168,111,34,.65)">
        <svg viewBox="0 0 200 200" class="absolute inset-0 w-full h-full animate-[spin_34s_linear_infinite] opacity-70">
          <defs><path id="home-ring" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0"></path></defs>
          <text font-family="ui-monospace, monospace" font-size="8.5" letter-spacing="2.6" fill="#1C1B18">
            <textPath href="#home-ring">BLACK SOIL ATLAS · JILIN DIGITAL RURAL MUSEUM · 2026 · CHANGCHUN · </textPath>
          </text>
        </svg>
        <div class="absolute inset-[22%] rounded-full border border-[#1C1B18]/20"></div>
        <div class="hero-core absolute inset-[38%] rounded-full bg-[#1C1B18]/90 grid place-items-center">
          <span class="font-editorial text-[#F7F4EE] text-3xl sm:text-5xl font-bold">吉</span>
        </div>
      </div>

      <!-- 左下墨色斜切块 -->
      <div class="absolute -left-24 -bottom-32 w-[38vw] h-[32vw] min-w-[20rem] min-h-[17.5rem] bg-[#1C1B18] rotate-[-14deg] pointer-events-none opacity-[0.94]"></div>
      <div class="absolute left-8 bottom-10 z-10 hidden lg:block rot-tag text-[#FFFDF9]/95">EST. 2026 / CHANGCHUN</div>

      <div class="relative z-10 max-w-[90rem] mx-auto w-full px-5 sm:px-8 lg:px-12 pt-28 pb-20">
        <Reveal :delay="0">
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="eyebrow">2026 / CHANGCHUN / 常设展</span>
            <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#6E6960]">VOL. 01 — BLACK SOIL</span>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div class="lg:col-span-7">
            <h1 data-cinema-copy class="display-1 text-[#1C1B18]" aria-label="黑土粮仓 吉韵新程">
              <span class="cinema-line">
                <span v-for="(ch, i) in Array.from('黑土粮仓')" :key="'a' + i" class="kin-char"
                  :style="{ animationDelay: (0.1 + i * 0.07) + 's' }">{{ ch }}</span>
              </span>
              <span class="cinema-line block text-[#C88A32]">
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
                <!-- 原生 View Transitions 渐进增强：保留 href 语义，点击时交由 startViewTransition 接管 -->
                <a data-magnetic :href="router.resolve('/strata-3d').href" class="mag-btn" @click.prevent="enterGallery('/strata-3d')">
                  <span>从一米黑土开始</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span>
                </a>
                <a data-magnetic :href="router.resolve('/sandbox-3d').href" class="mag-btn mag-btn--light" @click.prevent="enterGallery('/sandbox-3d')">
                  <span>俯瞰松辽平原</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span>
                </a>
              </div>
            </Reveal>
          </div>

          <!-- Z 轴层叠图版 -->
          <div class="lg:col-span-5 relative hidden lg:block" data-parallax="-8">
            <div class="bezel z-card hero-plate">
              <div data-reveal-img class="bezel-core">
                <img src="/photos/field-sunset.jpg" alt="黑土平原上的落日实景" class="w-full aspect-[4/5] object-cover" />
              </div>
            </div>
            <div class="card-ink z-card absolute -bottom-10 -left-14 w-64 p-6" style="transform: rotate(5deg)">
              <div class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324] mb-3">FIELD NOTE / 001</div>
              <div class="font-editorial text-4xl font-bold leading-none">200<span class="text-lg ml-1">年</span></div>
              <p class="text-[0.75rem] leading-relaxed text-[#FFFDF9]/96 mt-3">形成一厘米黑土所需的时间。整座展馆，从这一个数字开始。</p>
            </div>
            <div class="absolute -top-5 -right-3 z-20 px-3 py-2 rounded-full bg-[#C88A32] text-[#1C1B18] font-mono text-[0.625rem] font-bold tracking-[0.16em] shadow-lg">PLATE 00</div>
          </div>
        </div>

        <!-- 滚动镜头进度线：桌面随首屏滚动走满，移动端与降级模式保持满格 -->
        <div class="mt-10 h-[2px] w-full bg-[#1C1B18]/8 overflow-hidden" aria-hidden="true">
          <div data-cinema-progress class="h-full w-full origin-left bg-[#C88A32]" style="transform: scaleX(1)"></div>
        </div>

        <Reveal :delay="760" class="mt-16">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-for="(m, i) in heroMeta" :key="m.k"
              class="rounded-2xl px-4 py-3.5 border"
              :class="i === 0 ? 'bg-[#C88A32]/18 border-[#C88A32]/40' : 'bg-[#FFFDF9]/72 border-[#1C1B18]/8'">
              <div class="font-mono text-[0.625rem] tracking-[0.2em] text-[#6E6960] mb-1.5">{{ m.k }}</div>
              <div class="text-xs sm:text-sm font-bold text-[#1C1B18]">{{ m.v }}</div>
            </div>
          </div>
        </Reveal>
      </div>

      <!-- 底部动态字带 -->
      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#1C1B18]/10 bg-[#1C1B18] py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[0.6875rem] tracking-[0.22em] text-[#FFFDF9]/95 whitespace-nowrap">
            <span>CHERNOZEM · 黑土粮仓</span><span class="text-[#C88A32]">✳</span>
            <span>3D INTERACTIVE GALLERIES</span><span class="text-[#C88A32]">✳</span>
            <span>SONGLIAO PLAIN DIGITAL TWIN</span><span class="text-[#C88A32]">✳</span>
            <span>吉韵新程</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
      <div class="absolute bottom-14 right-8 z-10 hidden sm:flex items-center gap-2 text-[#1C1B18]/45">
        <span class="font-mono text-[0.625rem] tracking-[0.2em]">SCROLL</span><ArrowDown :size="15" class="float-slow" />
      </div>

      <!-- 一次性入场镜头：剖面推近 → 拉远成平原 → 落到沙盘，随后淡出 -->
      <div v-if="preludeOn" class="hero-prelude absolute inset-0 z-[25] bg-[#1C1B18] overflow-hidden pointer-events-none">
        <div class="prelude-plate absolute inset-0 grid place-items-center">
          <img src="/art/soil-strata.svg" alt="黑土剖面图版" class="w-[125%] h-[125%] object-cover opacity-60" />
        </div>
        <div class="prelude-plate absolute inset-0 grid place-items-center">
          <img src="/art/hero-field.svg" alt="黑土田野等高线图版" class="w-[125%] h-[125%] object-cover opacity-60" />
        </div>
        <div class="prelude-plate absolute inset-0 grid place-items-center">
          <img src="/art/diorama.svg" alt="松辽平原沙盘图版" class="w-[125%] h-[125%] object-cover opacity-60" />
        </div>
        <!-- 纯光影：金圆柔光晕 + 底部暗角 + 统一压暗，不加色块（沿用 11-08 定稿） -->
        <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 32% 26%, rgba(232,188,110,.20), transparent 58%), linear-gradient(to top, rgba(28,27,24,.94), transparent 48%), rgba(28,27,24,.42)"></div>
        <div class="fixed z-[26] bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none">
          <div class="h-[2px] w-44 rounded-full bg-[#F7F4EE]/20 overflow-hidden">
            <div class="prelude-progress h-full w-0 bg-[#C88A32]"></div>
          </div>
          <span class="font-mono text-[0.625rem] tracking-[0.22em] text-[#FFFDF9]/95">点击任意处跳过</span>
        </div>
      </div>
    </section>

    <!-- 02 策展导语：墨色大区块 + 层叠图版 -->
    <section class="surface-ink relative overflow-hidden">
      <div class="absolute inset-0 coord-rule opacity-25 pointer-events-none"></div>
      <div class="absolute right-[3%] top-[2%] font-editorial font-bold text-[#F7F4EE]/[0.022] select-none pointer-events-none" style="font-size: 15rem; line-height: 1" aria-hidden="true">土</div>
      <div class="relative max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-24 sm:py-32 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
        <div class="lg:col-span-7">
          <Reveal><div class="eyebrow mb-7">CURATORIAL STATEMENT / 策展导语</div></Reveal>
          <Reveal :delay="90">
            <h2 class="display-1 text-[#F7F4EE] max-w-3xl" style="font-size: clamp(2.4rem, 4.6vw, 4.5rem)">
              黑土不是颜色，<br /><span class="text-[#C88A32]">是被压缩的时间</span>
            </h2>
          </Reveal>
          <Reveal :delay="180"><p class="lede text-[#FFFDF9]/95 mt-9 max-w-2xl">
            每一厘米腐殖层，都要经过两百到四百年的枯荣、冻融与微生物分解。我们把这条时间线拆成十三个可进入的展陈单元：三座 Three.js 实时场景分别承担微观、工业与宏观尺度，十个图文专题把数据、农时、非遗、物产、助农机制与落地痛点重新串回同一片土地，另有一张展览地图作为总览索引，把六段尺度摊成一条动线。
          </p></Reveal>
          <Reveal :delay="260">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12" data-stagger>
              <div v-for="n in [
                { k: 'SCALE', v: '1 cm → 40 km', d: '从团粒到平原的尺度跨越' },
                { k: 'RENDER', v: '实时 WebGL', d: 'IBL 环境光 / GTAO / 物理折射' },
                { k: 'SOURCE', v: '程序化生成', d: '几何、纹理、图版全部本地构建' }
              ]" :key="n.k" class="rounded-2xl bg-[#F7F4EE]/6 border border-[#F7F4EE]/12 p-5">
                <div class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324] mb-2">{{ n.k }}</div>
                <div class="font-editorial text-lg font-bold text-[#F7F4EE]">{{ n.v }}</div>
                <div class="caption text-[#FFFDF9]/96 mt-1.5">{{ n.d }}</div>
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
            <div class="font-mono text-[0.625rem] tracking-[0.18em] mb-1">FIELD CONTOURS / PLATE 02</div>
            <div class="font-editorial text-xl font-bold">图版 00</div>
          </div>
          <div class="absolute -top-6 right-0 rot-tag text-[#FFFDF9]/95">PROCEDURAL PLATE</div>
        </Reveal>
      </div>
    </section>

    <!-- 03 三大 3D 展厅：非对称层叠 -->
    <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="01 / 03" eyebrow="THREE INTERACTIVE GALLERIES" title="三座可以走进去的展厅" description="微观地质、工业装配、宏观平原，三套独立构建的 Three.js 场景共用一个光照与色彩秩序。" to="/sandbox-3d" link-label="从全景沙盘开始" />
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

    <!-- 04 平原影像：琥珀金区块 -->
    <section class="relative overflow-hidden" style="background: linear-gradient(150deg, #E4B463 0%, #C88A32 48%, #A9701F 100%)">
      <div class="absolute -right-20 -top-40 w-[32.5rem] h-[32.5rem] rounded-full pointer-events-none"
        style="background: radial-gradient(circle, rgba(255,253,249,.16), transparent 70%)"></div>
      <div class="relative max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <div class="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <div class="font-mono text-[0.625rem] tracking-[0.22em] text-[#1C1B18]/75 mb-3">03 / 06 · FIELD RECORD</div>
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
              <div class="h-[27.5rem] sm:h-[36.25rem] relative overflow-hidden">
                <div data-reveal-img class="absolute inset-0 overflow-hidden">
                  <img src="/photos/furrows.jpg" alt="黑土田块与规整垄沟的航拍实景" class="w-full h-full object-cover" loading="lazy" />
                </div>
                <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(28,27,24,.78), transparent 58%)"></div>
                <div class="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-[#1C1B18]/78 px-4 py-3">
                  <div>
                    <div class="font-mono text-[0.625rem] tracking-[0.18em] text-[#F0C275] mb-2">FIELD RECORD / 松辽平原</div>
                    <div class="font-editorial text-xl sm:text-2xl font-bold text-[#FFFDF9]">规整垄沟，是黑土被经营的样子</div>
                  </div>
                  <span class="font-mono text-[0.625rem] tracking-[0.16em] text-[#FFFDF9]/96">实景示意 · UNSPLASH</span>
                </div>
              </div>
            </div>
          </div>
          <p class="caption text-[#1C1B18]/80 mt-4">实景影像为产地示意，不对应吉林具体地块。进入完整沙盘展厅，可拖拽查看程序化生成的黑土田块、防护林与水系。</p>
        </Reveal>
      </div>
    </section>

    <!-- 05 参观动线 -->
    <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12">
      <Reveal class="lg:col-span-4">
        <div class="eyebrow mb-5">VISITOR ROUTE / 参观动线</div>
        <h2 class="display-2">一条动线，<br />走完一片黑土</h2>
        <p class="body-copy mt-6 max-w-sm">展馆按尺度递进编排。先建立整体印象，再依次进入微观、工业与宏观三个 3D 场景，最后用图文专题补足数据、农时、助农机制与人的故事。</p>
        <RouterLink to="/exhibit-map" class="link-line mt-6 text-[0.75rem] font-bold text-[#8A6324]">先看展览地图，按兴趣挑动线 <ArrowUpRight :size="14" class="arrow-shift" /></RouterLink>
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
            <span class="font-mono text-[0.6875rem] text-[#6E6960] flex items-center gap-3 whitespace-nowrap">{{ s.time }} <ArrowUpRight :size="16" class="arrow-shift text-[#8A6324]" /></span>
          </RouterLink>
        </Reveal>
      </div>
    </section>

    <!-- 科普实验室入口 -->
    <section class="relative overflow-hidden" data-tone="dark" style="background: linear-gradient(145deg, #407257 0%, #2E5A44 55%, #22402F 100%)">
      <div class="absolute inset-0 coord-rule opacity-20 pointer-events-none"></div>
      <div data-parallax="-10" class="absolute -right-[8%] -bottom-[40%] w-[34vw] h-[34vw] min-w-[20rem] min-h-[20rem] rounded-full pointer-events-none"
        style="background: radial-gradient(circle, rgba(200,138,50,.18), transparent 70%)"></div>
      <div class="relative max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <Reveal class="lg:col-span-5">
          <div class="eyebrow mb-6">INTERACTIVE SCIENCE LAB / 互动科普实验室</div>
          <h2 class="display-2 text-[#F7F4EE]">看得见，<br /><span class="text-[#E8BC6E]">才谈得上理解</span></h2>
          <p class="lede text-[#FFFDF9]/95 mt-7">
            四个可操作的 3D 原理演示。放大黑土团粒、拖动稻作时间轴、改变卫星数量看定位精度退化、调节秸秆覆盖率看雨水去向，把展签讲不清的事变成可以上手的操作。
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
              <div class="font-mono text-[0.625rem] tracking-[0.2em] text-[#FFFDF9]/95 mb-2">{{ lab.k }}</div>
              <h3 class="font-editorial text-xl font-bold text-[#F7F4EE] mb-3">{{ lab.t }}</h3>
              <p class="text-[0.75rem] leading-[1.8] text-[#FFFDF9]/96">{{ lab.d }}</p>
            </RouterLink>
          </Reveal>
        </div>
      </div>
    </section>

  </div>
</template>
