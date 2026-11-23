<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { navigateWithViewTransition } from '../lib/viewTransition.js'
import Reveal from '../components/editorial/Reveal.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import ExhibitCard from '../components/editorial/ExhibitCard.vue'
import {
  ArrowUpRight, Compass, Layers, FlaskConical, Sprout,
  Smartphone, Columns2, Monitor, ShieldCheck, BookOpen
} from 'lucide-vue-next'

const router = useRouter()

const enterGallery = (to) => {
  navigateWithViewTransition(router, to)
}

const heroStats = [
  { k: '沉积尺度', v: '200–400 年', sub: '自然形成 1cm 腐殖黑土' },
  { k: '三维展厅', v: '3 座 WebGL', sub: '微观地质 · 工业装备 · 宏观平原' },
  { k: '专题科普', v: '10 大章节', sub: '物候 · 非遗 · 节气 · 助农实践' },
  { k: '系统架构', v: '双端互通', sub: '与移动端 App 及后台同源共构' }
]

const galleries3D = [
  {
    index: 'GALLERY 01', tag: '微观地质 · 3D 剖面', meta: 'WebGL / 实时分层',
    title: '一米黑土，万年沉积',
    desc: '抽屉式分层展开的亚克力地质标本。腐殖质熟化层、淀积心土层与马兰黄土母质层，清晰呈现团粒结构、蚯蚓孔隙与梨树模式免耕保育原理。',
    image: '/photos/3d-strata.jpg', to: '/strata-3d', cta: '进入黑土地质标本馆'
  },
  {
    index: 'GALLERY 02', tag: '长春智造 · 工业解构', meta: 'WebGL / 爆炸拆解',
    title: '260 马力北斗无人拖拉机',
    desc: '摄影棚级三维装配解构展。一键爆炸拆解全景座舱、混合动力总成、金色北斗 RTK 天线与低压宽胎，细致读出长春现代农机装备实力。',
    image: '/art-custom/changchun-tractor.jpg', to: '/machinery-3d', cta: '进入北斗农机解构馆'
  },
  {
    index: 'GALLERY 03', tag: '数字孪生 · 宏观平原', meta: 'WebGL / 六视点漫游',
    title: '松辽平原生态微缩沙盘',
    desc: '按东北黑土农田地貌构建的 1:500 生态沙盘。金黄稻田、现代数字粮仓、成行防护林、清洁风电与蜿蜒松花江水系，六大视点自由飞行。',
    image: '/art-hd/songliao-plain.jpg', to: '/sandbox-3d', cta: '进入生态微缩沙盘'
  }
]

const thematicChapters = [
  {
    no: '01', tag: '物候剧情', title: '一粒米的旅程',
    desc: '五幕物候串起 180 天吉林稻作周期，从秸秆冬养、雪水春灌到 38℃ 低温慢烘与一袋一码溯源。',
    image: '/art-hd/golden-rice.jpg', to: '/journey'
  },
  {
    no: '02', tag: '生态非遗', title: '查干湖冬捕非遗馆',
    desc: '祭湖醒网、马拉绞盘、冰下走网、抓大放小，沉浸读懂国家级非遗背后的生态取予智慧。',
    image: '/art-hd/chagan-winter.jpg', to: '/chagan-lake'
  },
  {
    no: '03', tag: '农耕历法', title: '二十四节气农时谱',
    desc: '把二十四节气与吉林四季农事一一映射，呈现春生、夏长、秋收、冬藏的现代气象与农机协同。',
    image: '/art-hd/four-seasons.jpg', to: '/solar-terms'
  },
  {
    no: '04', tag: '地标风物', title: '吉林风物特产集市',
    desc: '九台贡米、长白山椴树雪蜜、松子人参、查干湖胖头鱼，产地与合作社流通链路公开透明。',
    image: '/art-custom/honey.jpg', to: '/products'
  },
  {
    no: '05', tag: '遥测看板', title: '黑土振兴数智驾驶舱',
    desc: '汇总土壤有机质、含水率、有效积温与农机作业状态，用数据图表透视粮食保供调度实况。',
    image: '/art-hd/jilin-harvest.jpg', to: '/dashboard'
  },
  {
    no: '06', tag: '带农机制', title: '助农项目库与云认养',
    desc: '系统梳理六类带农路径与合作社真实案例，并可交互体验认养一亩田与一块地五笔收入模型。',
    image: '/art-custom/rice-tillering.jpg', to: '/aid-projects'
  }
]

const scienceLabs = [
  { no: '01', tag: 'SOIL MICRO', title: '黑土团粒与孔隙', desc: '3D 放大毫米级团粒、菌丝与蚯蚓大孔隙，点击部件直读土壤物理学档案。' },
  { no: '02', tag: 'RICE CYCLE', title: '稻作生长五阶段', desc: '拖动生育期时间轴，实时观察育秧、分蘖、抽穗、灌浆到成熟收割全形态演变。' },
  { no: '03', tag: 'BEIDOU RTK', title: '北斗厘米级定位', desc: '自由调节可见卫星数与遮挡条件，直观对比普通导航与 RTK 差分 2.5cm 轨迹精度。' },
  { no: '04', tag: 'LISHU NO-TILL', title: '秸秆覆盖免耕实验', desc: '调节地表秸秆覆盖率与降雨强度，模拟雨水下渗保墒与表土防风蚀实效。' }
]

const practiceUnits = [
  { tag: 'A1', title: '助农项目档案库', note: '六类带农路径与现实合作社案例汇编', to: '/aid-projects' },
  { tag: 'A2', title: '认养一亩田演示', note: '从春耕到秋收直邮的云认养全流程模拟', to: '/adopt-a-field' },
  { tag: 'A3', title: '一块地五笔收入', note: '土地托管、分红与品牌溢价的多元增收账', to: '/farm-income' },
  { tag: 'A4', title: '最后一公里实验室', note: '直面数据孤岛与转型周期的三大痛点推演', to: '/last-mile' }
]

onMounted(() => {
  // 错峰静默预取三座 3D 展厅异步路由 chunk，让评委点击即开
  ;[
    () => import('./SoilStrataView.vue'),
    () => import('./MachineryView.vue'),
    () => import('./SandboxView.vue')
  ].forEach((job, i) => {
    window.setTimeout(() => { job().catch(() => {}) }, 1200 + i * 1400)
  })
})
</script>

<template>
  <div class="relative">
    <!-- 01 新中式青绿山水首屏（零遮罩、瞬时首屏呈现） -->
    <section class="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      <!-- 柔雾青绿山水画底纹 -->
      <div
        class="pointer-events-none absolute inset-0 bg-cover bg-center opacity-35"
        style="background-image: url('/art-custom/showcase-bg-pattern.jpg')"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute inset-0"
        style="background: radial-gradient(60% 70% at 80% 16%, rgba(200,155,69,0.14), transparent 62%), linear-gradient(180deg, rgba(243,246,243,0.45) 0%, rgba(243,246,243,0.82) 72%, #F3F6F3 100%)"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <!-- 左侧策展叙事 -->
          <div class="lg:col-span-7">
            <div class="flex flex-wrap items-center gap-2.5 mb-6">
              <span class="eyebrow">吉韵禾野 · 乡村振兴数字展馆</span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#0E261D]/10 font-mono text-[0.6875rem] text-[#3E554B]">
                <Layers :size="12" aria-hidden="true" class="text-[#1F5440]" />
                13 个沉浸式专题与 3D 单元
              </span>
            </div>

            <h1 class="display-1 text-[#10241C]">
              一厘米黑土，
              <span class="block mt-1 bg-gradient-to-r from-[#1A4B38] via-[#26614A] to-[#9B7124] bg-clip-text text-transparent">
                四十公里沃野
              </span>
            </h1>

            <p class="font-editorial text-lg sm:text-xl text-[#1A4333] mt-5 font-semibold">
              吉林黑土生态保育 · 智慧农机装备 · 农耕非遗数字科普总览
            </p>

            <p class="lede mt-4 max-w-2xl text-[#3E554B]">
              世界三大黑土带之一，每形成一厘米腐殖层需要两百至四百年沉积。本展馆以新中式青绿山水美学串联微观黑土剖面、长春智造北斗农机、松辽平原沙盘及十个农耕助农专题，并与移动端 App 和后台管理系统实时互通。
            </p>

            <div class="flex flex-wrap items-center gap-3 mt-8">
              <a
                :href="router.resolve('/strata-3d').href"
                class="mag-btn"
                @click.prevent="enterGallery('/strata-3d')"
              >
                <span>进入 3D 黑土地质标本</span>
                <span class="mag-btn__island"><ArrowUpRight :size="16" aria-hidden="true" /></span>
              </a>
              <RouterLink to="/science" class="mag-btn mag-btn--light">
                <span>开启互动科普实验室</span>
                <span class="mag-btn__island"><FlaskConical :size="15" aria-hidden="true" /></span>
              </RouterLink>
              <RouterLink
                to="/exhibit-map"
                class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-[#1A4333] hover:bg-[#1F5440]/8 transition-colors"
              >
                <Compass :size="15" aria-hidden="true" class="text-[#C89B45]" />
                <span>浏览全展策展地图</span>
              </RouterLink>
            </div>
          </div>

          <!-- 右侧端庄 Bento 图景矩阵（零倾斜噪点） -->
          <div class="lg:col-span-5 space-y-3.5">
            <RouterLink
              to="/sandbox-3d"
              class="group block relative rounded-[1.5rem] overflow-hidden border border-[#0E261D]/12 shadow-[0_26px_58px_-32px_rgba(14,38,29,0.42)] bg-[#0E261D]"
            >
              <img
                src="/art-hd/songliao-plain.jpg"
                alt="松辽平原黑土农田与防护林鸟瞰图景"
                class="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E261D]/86 via-[#0E261D]/20 to-transparent"></div>
              <div class="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-[#0E261D]/78 border border-[#E5C175]/35 text-[#E5C175] font-mono text-[0.625rem] tracking-[0.14em] backdrop-blur-sm">
                SONGLIAO PLAIN · 1:500
              </div>
              <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <div class="font-editorial text-lg font-bold text-[#F7FAF8]">松辽平原数字生态沙盘</div>
                  <div class="text-xs text-[#D7E4DD]/85 mt-0.5">稻田格网 · 现代粮仓 · 松花江水系 3D 实时漫游</div>
                </div>
                <span class="w-8 h-8 rounded-full bg-[#E5C175] text-[#0E261D] grid place-items-center shrink-0">
                  <ArrowUpRight :size="15" aria-hidden="true" />
                </span>
              </div>
            </RouterLink>

            <div class="grid grid-cols-2 gap-3.5">
              <RouterLink
                to="/strata-3d"
                class="group relative rounded-2xl overflow-hidden border border-[#0E261D]/10 shadow-sm bg-[#0E261D]"
              >
                <img
                  src="/art-custom/black-soil-topdown.jpg"
                  alt="梨树模式黑土秸秆覆盖俯拍实景"
                  class="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-[#0E261D]/85 via-transparent to-transparent"></div>
                <div class="absolute bottom-3 left-3 right-3">
                  <div class="font-mono text-[0.6rem] text-[#E5C175] tracking-wider">GALLERY 01</div>
                  <div class="text-xs font-bold text-[#F7FAF8] mt-0.5">梨树模式 · 黑土剖面</div>
                </div>
              </RouterLink>

              <RouterLink
                to="/machinery-3d"
                class="group relative rounded-2xl overflow-hidden border border-[#0E261D]/10 shadow-sm bg-[#0E261D]"
              >
                <img
                  src="/art-custom/changchun-tractor.jpg"
                  alt="长春智造 260 马力北斗无人拖拉机"
                  class="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-[#0E261D]/85 via-transparent to-transparent"></div>
                <div class="absolute bottom-3 left-3 right-3">
                  <div class="font-mono text-[0.6rem] text-[#E5C175] tracking-wider">GALLERY 02</div>
                  <div class="text-xs font-bold text-[#F7FAF8] mt-0.5">北斗 260 马力农机</div>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- 底部四项核心指标条 -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-12">
          <div
            v-for="s in heroStats"
            :key="s.k"
            class="rounded-2xl bg-white/84 backdrop-blur-md border border-[#0E261D]/10 px-5 py-4 shadow-[0_12px_28px_-22px_rgba(14,38,29,0.28)]"
          >
            <div class="text-[0.6875rem] font-semibold tracking-wider text-[#566E64]">{{ s.k }}</div>
            <div class="font-editorial text-xl sm:text-2xl font-bold text-[#10241C] mt-1">{{ s.v }}</div>
            <div class="text-xs text-[#3E554B] mt-1">{{ s.sub }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 02 三大 WebGL 3D 展厅（采用容器查询响应式画廊：首卡宽屏左右分栏 + 下排双卡并列） -->
    <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-22">
      <Reveal>
        <SectionHead
          index="01 / 04"
          eyebrow="THREE INTERACTIVE 3D GALLERIES"
          title="三座可步入的三维数字展厅"
          description="从一米黑土剖面、长春智造无人农机到松辽平原生态沙盘，三套 Three.js 实时场景在统一光影秩序下自由拖拽拆解。"
          to="/sandbox-3d"
          link-label="直达 3D 全景沙盘"
        />
      </Reveal>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">
        <Reveal class="lg:col-span-12">
          <ExhibitCard v-bind="galleries3D[0]" dark />
        </Reveal>
        <Reveal :delay="80" class="lg:col-span-6">
          <ExhibitCard v-bind="galleries3D[1]" />
        </Reveal>
        <Reveal :delay="150" class="lg:col-span-6">
          <ExhibitCard v-bind="galleries3D[2]" />
        </Reveal>
      </div>
    </section>

    <!-- 03 吉林农耕与非遗专题科普矩阵（6 宫格可视化入口） -->
    <section class="surface-linen border-y border-[#0E261D]/8">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-22">
        <Reveal>
          <SectionHead
            index="02 / 04"
            eyebrow="THEMATIC KNOWLEDGE PORTAL"
            title="吉林农耕文化与专题科普"
            description="把一粒米的 180 天、查干湖冰下非遗、二十四节气农时谱与地理标志风物，收进清朗易读的数字画册。"
            to="/exhibit-map"
            link-label="查看全部 13 个单元"
          />
        </Reveal>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          <Reveal v-for="(c, i) in thematicChapters" :key="c.to" :delay="(i % 3) * 70">
            <article class="group relative h-full flex flex-col rounded-[1.4rem] overflow-hidden bg-[#FCFEFC] border border-[#0E261D]/10 shadow-[0_18px_40px_-28px_rgba(14,38,29,0.28)] lift">
              <div class="relative overflow-hidden bg-[#E8F0EC]">
                <img
                  :src="c.image"
                  :alt="c.title"
                  loading="lazy"
                  class="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-[#0E261D]/55 via-transparent to-transparent"></div>
                <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0E261D]/82 text-[#E5C175] text-[0.65rem] font-semibold tracking-wider backdrop-blur-sm">
                  {{ c.tag }}
                </span>
                <span class="absolute bottom-3 right-3 font-mono text-[0.65rem] text-white/90 font-semibold">
                  CH. {{ c.no }}
                </span>
              </div>

              <div class="flex flex-col flex-1 justify-between p-5 sm:p-6">
                <div>
                  <h3 class="font-editorial text-xl font-bold text-[#10241C] group-hover:text-[#1F5440] transition-colors">
                    <RouterLink :to="c.to" class="after:content-[''] after:absolute after:inset-0 focus-visible:outline-none">
                      {{ c.title }}
                    </RouterLink>
                  </h3>
                  <p class="text-[0.83rem] leading-[1.8] text-[#3E554B] mt-2.5">{{ c.desc }}</p>
                </div>
                <div class="mt-5 pt-3.5 border-t border-[#0E261D]/8 flex items-center justify-between text-xs font-bold text-[#1A4333]">
                  <span>阅读本专题</span>
                  <ArrowUpRight :size="15" aria-hidden="true" class="text-[#C89B45] arrow-shift" />
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 04 互动科普实验室（深松墨玉沉浸区块） -->
    <section class="surface-ink relative overflow-hidden" data-tone="dark">
      <div class="relative max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-22">
        <Reveal variant="solid">
          <SectionHead
            dark
            index="03 / 04"
            eyebrow="INTERACTIVE SCIENCE LAB"
            title="动手操作，看懂黑土里的科学原理"
            description="四套基于 Three.js 构建的交互式农艺实验：调参数、切剖面、控降雨，让课本与展签上的抽象原理一目了然。"
            to="/science"
            link-label="进入互动科普实验室"
          />
        </Reveal>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          <Reveal variant="solid" v-for="(lab, i) in scienceLabs" :key="lab.no" :delay="i * 70">
            <RouterLink
              to="/science"
              class="group flex flex-col justify-between h-full rounded-2xl bg-white/[0.06] border border-white/14 p-6 hover:bg-white/[0.11] hover:border-[#E5C175]/45 transition-all duration-300 hover:-translate-y-1.5"
            >
              <div>
                <div class="flex items-center justify-between mb-5">
                  <span class="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[#E5C175]/16 text-[#E5C175]">
                    LAB {{ lab.no }}
                  </span>
                  <ArrowUpRight :size="16" aria-hidden="true" class="text-[#E5C175] arrow-shift" />
                </div>
                <div class="font-mono text-[0.625rem] tracking-[0.16em] text-[#C4D6CD]/75 mb-1.5">{{ lab.tag }}</div>
                <h3 class="font-editorial text-lg font-bold text-[#F7FAF8] mb-2.5">{{ lab.title }}</h3>
                <p class="text-xs leading-[1.85] text-[#D7E4DD]/85">{{ lab.desc }}</p>
              </div>
              <div class="mt-5 pt-3 border-t border-white/10 text-[0.72rem] font-semibold text-[#E5C175]">
                立即上手实验 →
              </div>
            </RouterLink>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 05 助农研究实践 & 平台全域协同导航 -->
    <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-22">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- 左侧：助农机制四单元 -->
        <div class="lg:col-span-7">
          <div class="eyebrow mb-3">RURAL PRACTICE / 助农机制深度拆解</div>
          <h2 class="display-2 text-[#10241C]">从产品助农到机制兴农</h2>
          <p class="body-copy mt-3 max-w-xl">
            不只展示农产品，更用真实合作社案例与互动模型讲清「钱从哪里来、农民如何稳定增收、最后一公里难在哪里」。
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">
            <RouterLink
              v-for="u in practiceUnits"
              :key="u.to"
              :to="u.to"
              class="group rounded-2xl bg-[#FCFEFC] border border-[#0E261D]/10 p-5 hover:border-[#1F5440]/40 hover:shadow-[0_18px_36px_-26px_rgba(14,38,29,0.3)] transition-all"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="font-mono text-[0.65rem] font-bold px-2 py-0.5 rounded-md bg-[#1F5440]/10 text-[#1A4333]">{{ u.tag }}</span>
                <ArrowUpRight :size="15" aria-hidden="true" class="text-[#C89B45] arrow-shift" />
              </div>
              <div class="font-editorial text-lg font-bold text-[#10241C] group-hover:text-[#1F5440] transition-colors">{{ u.title }}</div>
              <p class="text-xs leading-relaxed text-[#566E64] mt-1.5">{{ u.note }}</p>
            </RouterLink>
          </div>
        </div>

        <!-- 右侧：全平台多端协同名片 -->
        <div class="lg:col-span-5">
          <div class="rounded-[1.6rem] bg-gradient-to-br from-[#163D2E] to-[#0E261D] text-[#F2F7F4] p-7 sm:p-8 border border-[#E5C175]/22 shadow-[0_26px_54px_-28px_rgba(14,38,29,0.58)]">
            <div class="flex items-center gap-2 text-[#E5C175] font-mono text-[0.6875rem] tracking-[0.14em] mb-3">
              <Sprout :size="14" aria-hidden="true" />
              <span>MULTI-TERMINAL PLATFORM</span>
            </div>
            <h3 class="font-editorial text-2xl font-bold text-[#F7FAF8]">吉韵禾野 · 全域多端联动</h3>
            <p class="text-xs leading-[1.85] text-[#D7E4DD]/85 mt-2.5">
              本专题科普展馆与移动端助农 App、横版后台管理系统及数智指挥大屏共用同一底座，可随时一键切换演示场景。
            </p>

            <div class="space-y-2.5 mt-6">
              <RouterLink
                to="/"
                class="flex items-center justify-between px-4 py-3 rounded-xl bg-[#E5C175] text-[#0E261D] font-bold text-xs hover:bg-[#F0D390] transition-colors"
              >
                <span class="flex items-center gap-2.5"><Smartphone :size="15" aria-hidden="true" /> 移动端 App 交互体验舱</span>
                <ArrowUpRight :size="15" aria-hidden="true" />
              </RouterLink>
              <RouterLink
                to="/split"
                class="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 border border-white/14 text-[#F7FAF8] font-semibold text-xs hover:bg-white/16 transition-colors"
              >
                <span class="flex items-center gap-2.5"><Columns2 :size="15" aria-hidden="true" class="text-[#E5C175]" /> 双端同屏联动台（左 App + 右后台）</span>
                <ArrowUpRight :size="15" aria-hidden="true" class="text-[#E5C175]" />
              </RouterLink>
              <RouterLink
                to="/bigscreen"
                class="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 border border-white/14 text-[#F7FAF8] font-semibold text-xs hover:bg-white/16 transition-colors"
              >
                <span class="flex items-center gap-2.5"><Monitor :size="15" aria-hidden="true" class="text-[#E5C175]" /> 乡村振兴数智指挥大屏</span>
                <ArrowUpRight :size="15" aria-hidden="true" class="text-[#E5C175]" />
              </RouterLink>
              <RouterLink
                to="/about"
                class="flex items-center justify-between px-4 py-3 rounded-xl bg-white/6 border border-white/10 text-[#D7E4DD] font-semibold text-xs hover:bg-white/12 transition-colors"
              >
                <span class="flex items-center gap-2.5"><BookOpen :size="15" aria-hidden="true" class="text-[#E5C175]" /> 长春智库与项目答辩白皮书</span>
                <ArrowUpRight :size="15" aria-hidden="true" class="text-[#E5C175]" />
              </RouterLink>
            </div>

            <div class="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-[0.7rem] text-[#C4D6CD]/80">
              <ShieldCheck :size="14" aria-hidden="true" class="text-[#E5C175] shrink-0" />
              <span>所有端共用 Vue 3 + Pinia 4 + Three.js 0.187 统一代码库</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
