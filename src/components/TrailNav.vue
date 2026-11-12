<script setup>
/**
 * 全局动线索引条。
 * 一处改动覆盖 13 个展陈单元页，不逐页写「下一章」文案。
 * 顺序、名称与振兴归属全部来自 src/data/exhibitTrail.js（单一数据源）。
 *
 * 定位是「按展览地图编号的索引」，不是叙事推荐：多数页面自己有 NEXT CHAPTER
 * 叙事卡，两者语义不同，所以这里刻意用「前一段 / 后一段」而不是「上一站 / 下一站」。
 * 墨色薄带与全站页脚同色，贴在页脚上沿，避免在收束区与页脚之间插一条白条。
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-vue-next'
import { unitOf, prevOf, nextOf } from '../data/exhibitTrail'
import { useAppStore } from '../stores/appStore'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const current = computed(() => unitOf(route.path))
const prev = computed(() => prevOf(route.path))
const next = computed(() => nextOf(route.path))

// 先写方向再导航，避免 RouterLink 内部导航抢在标记之前执行。
// 保留 href 语义（右键新开、配置 base 后仍有效），点击时交给 router.push。
const go = (unit, direction) => {
  appStore.markTrail(direction)
  router.push(unit.path)
}
</script>

<template>
  <section v-if="current" class="trail-nav relative bg-[#1C1B18] text-[#F7F4EE] border-t border-[#F7F4EE]/10 overflow-hidden">
    <div class="trail-nav__line absolute top-0 left-0 right-0 h-px pointer-events-none"
      style="background: linear-gradient(90deg, transparent, rgba(200,138,50,.75), transparent)"></div>

    <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-5 sm:py-6">
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center">
        <!-- 索引 · 前一段 -->
        <a v-if="prev" :href="router.resolve(prev.path).href" @click.prevent="go(prev, 'back')"
          class="trail-item group relative flex items-center gap-3 sm:col-span-4 pb-2"
          :style="{ '--trail-i': 0 }">
          <span class="trail-edge absolute left-0 bottom-0 h-[2px] w-full bg-[#C88A32] origin-left scale-x-0 transition-transform duration-500"></span>
          <ArrowLeft :size="16" class="shrink-0 text-[#C88A32] transition-transform duration-500 group-hover:-translate-x-1" />
          <div class="min-w-0">
            <div class="font-mono text-[9px] tracking-[0.18em] text-[#F7F4EE]/62">
              索引 · {{ prev.isBoundary ? '回到起点' : '前一段' }} / {{ prev.no }}
            </div>
            <div class="font-editorial text-sm sm:text-base font-bold truncate text-[#F7F4EE] group-hover:text-[#C88A32] transition-colors">{{ prev.name }}</div>
          </div>
        </a>

        <!-- 当前位置：五大振兴视角下把地图页那把尺子带进单元页 -->
        <div class="trail-item sm:col-span-4 text-center" :style="{ '--trail-i': 1 }">
          <div class="font-mono text-[9px] tracking-[0.2em] text-[#C88A32]">
            {{ appStore.lensMode === 'revital' ? current.pillar + ' · ' : '策展动线 · ' }}{{ current.no }} / 13
          </div>
          <div class="font-mono text-[9px] tracking-[0.14em] text-[#F7F4EE]/58 mt-1">按展览地图编号 · {{ current.scale }}尺度</div>
          <RouterLink v-if="appStore.lensMode === 'revital'" to="/exhibit-map"
            class="inline-flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-[#F7F4EE]/85 hover:text-[#C88A32] transition-colors">
            回到展览地图，保持此视角 <ArrowUpRight :size="12" />
          </RouterLink>
        </div>

        <!-- 索引 · 后一段 -->
        <a v-if="next" :href="router.resolve(next.path).href" @click.prevent="go(next, 'forward')"
          class="trail-item group relative flex items-center justify-end gap-3 sm:col-span-4 text-right pb-2"
          :style="{ '--trail-i': 2 }">
          <span class="trail-edge absolute left-0 bottom-0 h-[2px] w-full bg-[#C88A32] origin-right scale-x-0 transition-transform duration-500"></span>
          <div class="min-w-0">
            <div class="font-mono text-[9px] tracking-[0.18em] text-[#F7F4EE]/62">
              索引 · {{ next.isBoundary ? '动线终点' : '后一段' }} / {{ next.no }}
            </div>
            <div class="font-editorial text-sm sm:text-base font-bold truncate text-[#F7F4EE] group-hover:text-[#C88A32] transition-colors">{{ next.name }}</div>
          </div>
          <ArrowRight :size="16" class="shrink-0 text-[#C88A32] transition-transform duration-500 group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  </section>
</template>
