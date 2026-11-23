<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Compass } from 'lucide-vue-next'
import { unitOf, prevOf, nextOf } from '../data/exhibitTrail'
import { useAppStore } from '../stores/appStore'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const current = computed(() => unitOf(route.path))
const prev = computed(() => prevOf(route.path))
const next = computed(() => nextOf(route.path))

const go = (unit, direction) => {
  appStore.markTrail(direction)
  router.push(unit.path)
}
</script>

<template>
  <section v-if="current" class="trail-nav relative bg-[#123126] text-[#F2F7F4] border-t border-[#E5C175]/20 overflow-hidden">
    <div class="trail-nav__line absolute top-0 left-0 right-0 h-px pointer-events-none"
      style="background: linear-gradient(90deg, transparent, rgba(229,193,117,0.65), transparent)"></div>

    <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-10 py-5">
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <a v-if="prev" :href="router.resolve(prev.path).href" @click.prevent="go(prev, 'back')"
          class="trail-item group flex items-center gap-3 sm:col-span-4 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#E5C175]/40 transition-all"
          :style="{ '--trail-i': 0 }">
          <ArrowLeft :size="16" aria-hidden="true" class="shrink-0 text-[#E5C175] transition-transform duration-300 group-hover:-translate-x-1" />
          <div class="min-w-0">
            <div class="font-mono text-[0.625rem] tracking-[0.14em] text-[#C4D6CD]/75">
              {{ prev.isBoundary ? '返回序厅' : '上一展区' }} · {{ prev.no }}
            </div>
            <div class="font-editorial text-sm sm:text-base font-bold truncate text-[#F7FAF8] group-hover:text-[#E5C175] transition-colors">{{ prev.name }}</div>
          </div>
        </a>

        <div class="trail-item sm:col-span-4 text-center py-1" :style="{ '--trail-i': 1 }">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5C175]/14 border border-[#E5C175]/28 font-mono text-[0.65rem] tracking-[0.14em] text-[#E5C175]">
            <Compass :size="12" aria-hidden="true" />
            <span>{{ appStore.lensMode === 'revital' ? current.pillar + ' · ' : '展陈动线 · ' }}{{ current.no }} / 13</span>
          </div>
          <div class="text-[0.6875rem] text-[#C4D6CD]/75 mt-1.5">
            当前单元：{{ current.name }}（{{ current.scale }}尺度）
          </div>
        </div>

        <a v-if="next" :href="router.resolve(next.path).href" @click.prevent="go(next, 'forward')"
          class="trail-item group flex items-center justify-end gap-3 sm:col-span-4 text-right px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#E5C175]/40 transition-all"
          :style="{ '--trail-i': 2 }">
          <div class="min-w-0">
            <div class="font-mono text-[0.625rem] tracking-[0.14em] text-[#C4D6CD]/75">
              {{ next.isBoundary ? '动线终点' : '下一展区' }} · {{ next.no }}
            </div>
            <div class="font-editorial text-sm sm:text-base font-bold truncate text-[#F7FAF8] group-hover:text-[#E5C175] transition-colors">{{ next.name }}</div>
          </div>
          <ArrowRight :size="16" aria-hidden="true" class="shrink-0 text-[#E5C175] transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  </section>
</template>
