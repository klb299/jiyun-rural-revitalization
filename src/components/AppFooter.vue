<script setup>
import { ArrowUpRight, Smartphone, Columns2, Monitor, ShieldCheck } from 'lucide-vue-next'

const columns = [
  {
    title: '3D 核心展厅', caption: 'IMMERSIVE 3D',
    links: [
      { name: '黑土地质标本馆', to: '/strata-3d' },
      { name: '北斗智慧农机馆', to: '/machinery-3d' },
      { name: '松辽生态微缩沙盘', to: '/sandbox-3d' },
      { name: '互动科普实验室', to: '/science' }
    ]
  },
  {
    title: '吉林专题科普', caption: 'THEMATIC ATLAS',
    links: [
      { name: '一粒米的旅程', to: '/journey' },
      { name: '查干湖冬捕非遗', to: '/chagan-lake' },
      { name: '二十四节气农时谱', to: '/solar-terms' },
      { name: '吉林风物特产集市', to: '/products' },
      { name: '黑土数智驾驶舱', to: '/dashboard' }
    ]
  },
  {
    title: '助农机制实践', caption: 'RURAL PRACTICE',
    links: [
      { name: '助农项目档案库', to: '/aid-projects' },
      { name: '认养一亩田演示', to: '/adopt-a-field' },
      { name: '一块地五笔收入', to: '/farm-income' },
      { name: '最后一公里实验室', to: '/last-mile' }
    ]
  },
  {
    title: '平台直达入口', caption: 'PLATFORM HUB',
    links: [
      { name: '全展策展地图', to: '/exhibit-map' },
      { name: '长春智库与白皮书', to: '/about' },
      { name: '移动端 App 体验', to: '/' },
      { name: '后台管理系统', to: '/admin' }
    ]
  }
]
</script>

<template>
  <footer class="relative overflow-hidden bg-gradient-to-b from-[#112F24] via-[#0E261D] to-[#091A13] text-[#F2F7F4] border-t border-[#E5C175]/18">
    <!-- 柔和青绿山岚背景肌理 -->
    <div
      class="pointer-events-none absolute inset-0 opacity-15 bg-cover bg-center mix-blend-soft-light"
      style="background-image: url('/art-custom/showcase-bg-pattern.jpg')"
      aria-hidden="true"
    ></div>

    <div class="relative max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-10 pt-16 sm:pt-20 pb-10">
      <!-- 顶部互通引导带 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-12 border-b border-white/10">
        <div class="lg:col-span-7">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5C175]/12 border border-[#E5C175]/28 text-[#E5C175] text-[0.6875rem] font-semibold tracking-wider mb-4">
            <span class="w-1.5 h-1.5 rounded-full bg-[#E5C175]"></span>
            吉韵禾野 · 吉林黑土乡村振兴双端协同平台
          </div>
          <h2 class="font-editorial text-2xl sm:text-4xl font-bold text-[#F7FAF8] leading-snug">
            一端连乡野，一端驭数智。<br />
            <span class="text-[#E5C175]">从一厘米黑土，看见吉林现代农业全景。</span>
          </h2>
        </div>

        <div class="lg:col-span-5 flex flex-wrap lg:justify-end gap-2.5">
          <RouterLink
            to="/"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#E5C175] text-[#0E261D] text-xs font-bold hover:bg-[#F0D390] transition-colors"
          >
            <Smartphone :size="14" aria-hidden="true" /> 体验移动端 App
          </RouterLink>
          <RouterLink
            to="/split"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border border-white/18 text-[#F2F7F4] text-xs font-semibold hover:bg-white/18 transition-colors"
          >
            <Columns2 :size="14" aria-hidden="true" /> 双端同屏联动
          </RouterLink>
          <RouterLink
            to="/bigscreen"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border border-white/18 text-[#F2F7F4] text-xs font-semibold hover:bg-white/18 transition-colors"
          >
            <Monitor :size="14" aria-hidden="true" /> 数智指挥大屏
          </RouterLink>
        </div>
      </div>

      <!-- 链接矩阵 -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 py-12">
        <div class="col-span-2">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-9 h-9 rounded-xl bg-[#E5C175] text-[#0E261D] flex items-center justify-center font-editorial font-bold text-base">禾</div>
            <div>
              <div class="font-editorial font-bold text-base text-[#F7FAF8]">吉韵禾野 · 数字展馆</div>
              <div class="font-mono text-[0.6rem] tracking-[0.16em] text-[#E5C175]/80">JIYUN HEYE DIGITAL MUSEUM</div>
            </div>
          </div>
          <p class="text-xs leading-[1.9] text-[#D7E4DD]/80 max-w-sm">
            集移动端助农 App、横版后台管理系统、数智指挥大屏与 Three.js 三维黑土科普展馆于一体的乡村振兴数字示范平台，以新中式青绿山水美学呈现吉林黑土保育、北斗农机与生态非遗。
          </p>
          <div class="flex flex-wrap gap-1.5 mt-5">
            <span v-for="t in ['Vue 3.5', 'Three.js', 'ECharts 6', 'Pinia 4', 'Tailwind CSS 4']" :key="t"
              class="px-2.5 py-1 rounded-full border border-white/14 bg-white/5 text-[0.65rem] font-mono text-[#D7E4DD]">
              {{ t }}
            </span>
          </div>
        </div>

        <div v-for="col in columns" :key="col.title">
          <div class="font-mono text-[0.625rem] tracking-[0.16em] text-[#E5C175]/80 mb-1.5">{{ col.caption }}</div>
          <h3 class="text-sm font-bold text-[#F7FAF8] mb-4">{{ col.title }}</h3>
          <ul class="list-none m-0 p-0 space-y-1.5">
            <li v-for="l in col.links" :key="l.to + l.name">
              <RouterLink
                :to="l.to"
                class="footer-link inline-flex items-center gap-1 py-1 text-xs text-[#D7E4DD]/80 hover:text-[#E5C175]"
              >
                <span>{{ l.name }}</span>
                <ArrowUpRight :size="11" aria-hidden="true" class="opacity-50" />
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- 版权与数据口径 -->
      <div class="border-t border-white/10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p class="text-[0.72rem] leading-relaxed text-[#C4D6CD]/80 max-w-3xl flex items-start gap-2">
          <ShieldCheck :size="15" aria-hidden="true" class="text-[#E5C175] shrink-0 mt-0.5" />
          <span>文献与数据参考：中国科学院东北地理与农业生态研究所（长春）、吉林省农业农村厅公开年报、长春国家农业高新技术产业示范区。展陈与互动交易均为教学演示用途。</span>
        </p>
        <div class="font-mono text-[0.65rem] tracking-[0.12em] text-[#C4D6CD]/75 shrink-0">
          © 2026 吉韵禾野 · JIYUN HEYE
        </div>
      </div>
    </div>
  </footer>
</template>
