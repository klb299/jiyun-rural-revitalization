<script setup>
import { ArrowUpRight } from 'lucide-vue-next'

const columns = [
  {
    title: '3D 核心展厅', caption: 'IMMERSIVE',
    links: [
      { name: '黑土地质标本', to: '/strata-3d' },
      { name: '北斗智慧农机', to: '/machinery-3d' },
      { name: '生态微缩沙盘', to: '/sandbox-3d' }
    ]
  },
  {
    title: '专题展陈', caption: 'CHAPTERS',
    links: [
      { name: '数智驾驶舱', to: '/dashboard' },
      { name: '一粒米的旅程', to: '/journey' },
      { name: '查干湖冬捕', to: '/chagan-lake' },
      { name: '二十四节气', to: '/solar-terms' },
      { name: '吉林风物集市', to: '/products' },
      { name: '互动科普实验室', to: '/science' }
    ]
  },
  {
    title: '助农项目', caption: 'RURAL REVITALIZATION',
    links: [
      { name: '助农项目库', to: '/aid-projects' },
      { name: '认养一亩田', to: '/adopt-a-field' },
      { name: '一块地，五笔收入', to: '/farm-income' },
      { name: '最后一公里实验室', to: '/last-mile' }
    ]
  },
  {
    title: '关于本站', caption: 'COLOPHON',
    links: [
      { name: '展览地图', to: '/exhibit-map' },
      { name: '长春智库与答辩说明', to: '/about' },
      { name: '策展管理后台', to: '/admin' },
      { name: '返回序厅', to: '/' }
    ]
  }
]
</script>

<template>
  <footer class="surface-ink relative overflow-hidden">
    <!-- 动态字带 -->
    <div class="marquee border-b border-[#F7F4EE]/14 py-3.5" aria-hidden="true">
      <div class="marquee-track">
        <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-7 pr-7 font-editorial text-lg sm:text-2xl text-[#F7F4EE]/80 whitespace-nowrap">
          <span>一厘米，四十公里</span><span class="text-[#C88A32]">✳</span>
          <span>BLACK SOIL ATLAS</span><span class="text-[#C88A32]">✳</span>
          <span>松辽平原 · 数字展陈</span><span class="text-[#C88A32]">✳</span>
          <span>JILIN DIGITAL RURAL MUSEUM</span><span class="text-[#C88A32]">✳</span>
        </span>
      </div>
    </div>
    <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-20 sm:pt-28 pb-10">
      <!-- 大标语 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end pb-16 border-b border-[#F7F4EE]/14">
        <div class="lg:col-span-8">
          <div class="eyebrow mb-6">CURATOR'S NOTE / 策展手记</div>
          <p class="display-2 text-[#F7F4EE] max-w-3xl">
            把一米土层，放进一只展柜。<br />
            把一整片平原，收进一条动线。
          </p>
        </div>
        <div class="lg:col-span-4 lg:text-right">
          <RouterLink
            to="/sandbox-3d"
            class="btn-on-ink inline-flex px-6 py-3.5 rounded-xl text-xs font-bold"
          >
            进入 3D 全景沙盘 <ArrowUpRight :size="14" class="arrow-shift" />
          </RouterLink>
        </div>
      </div>

      <!-- 链接矩阵 -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 py-14">
        <div class="col-span-2 md:col-span-1">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-9 h-9 bg-[#C88A32] text-[#1C1B18] flex items-center justify-center font-editorial font-bold">吉</div>
            <div class="font-editorial font-bold text-[#F7F4EE]">一厘米，四十公里</div>
          </div>
          <p class="text-[0.75rem] leading-[1.9] text-[#F7F4EE]/90 max-w-xs">
            长春市高校大学生网页设计作品。以 Vue 3 与 Three.js 构建吉林现代数字乡村振兴展陈，把黑土保育、智慧农机与生态非遗放进同一座可漫游的线上美术馆。
          </p>
          <div class="flex flex-wrap gap-2 mt-5">
            <span v-for="t in ['Vue 3.5', 'Three.js', 'ECharts', 'WebGL']" :key="t" class="px-2.5 py-1 border border-[#F7F4EE]/18 text-[0.625rem] font-mono text-[#F7F4EE]/80">{{ t }}</span>
          </div>
        </div>
        <div v-for="col in columns" :key="col.title">
          <div class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324] mb-2">{{ col.caption }}</div>
          <h4 class="text-sm font-bold text-[#F7F4EE] mb-5">{{ col.title }}</h4>
          <ul class="space-y-2.5">
            <li v-for="l in col.links" :key="l.to + l.name">
              <RouterLink :to="l.to" class="link-line inline-flex items-center min-h-[2.25rem] text-[0.75rem] text-[#F7F4EE]/90 hover:text-[#F7F4EE] transition-colors">
                {{ l.name }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- 文献与署名 -->
      <div class="border-t border-[#F7F4EE]/14 pt-8 flex flex-col md:flex-row justify-between gap-5">
        <p class="caption text-[#F7F4EE]/90 max-w-2xl">
          文献与数据参考：中国科学院东北地理与农业生态研究所（长春）、吉林省农业农村厅公开年报、长春国家农业高新技术产业示范区。展陈数据为教学演示用途。
        </p>
        <div class="font-mono text-[0.625rem] tracking-[0.14em] text-[#F7F4EE]/80 shrink-0">
          © 2026 JILIN DIGITAL RURAL MUSEUM
        </div>
      </div>
    </div>
    <div class="pointer-events-none absolute -bottom-16 right-2 font-editorial font-bold text-[#F7F4EE]/[0.035] leading-none select-none" style="font-size: clamp(10rem, 26vw, 26rem)">吉</div>
  </footer>
</template>
