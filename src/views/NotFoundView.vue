<script setup>
/**
 * 404 导览页
 * 不做冷冰冰的报错，而是把观众重新接回乡村振兴的参观动线。
 */
import Reveal from '../components/editorial/Reveal.vue'
import { ArrowUpRight, ArrowLeft } from 'lucide-vue-next'

const routes = [
  { no: '01', name: '黑土地质标本馆', path: '/strata-3d', note: '一米剖面的万年沉积', tag: '微观 / 黑土' },
  { no: '02', name: '北斗农机解构馆', path: '/machinery-3d', note: '一台车的装配逻辑', tag: '工业 / 装备' },
  { no: '03', name: '松辽平原生态沙盘', path: '/sandbox-3d', note: '俯瞰一整片粮仓', tag: '宏观 / 平原' },
  { no: '04', name: '互动科普实验室', path: '/science', note: '团粒、稻作与定位原理', tag: '科教 / 实验' },
  { no: '05', name: '黑土振兴数智驾驶舱', path: '/dashboard', note: '把黑土脉搏画成图表', tag: '数据 / 遥测' },
  { no: '06', name: '吉林风物特产集市', path: '/products', note: '从田间到餐桌的产出', tag: '物产 / 流通' },
  { no: '07', name: '助农项目库', path: '/aid-projects', note: '六类带农路径与项目档案', tag: '助农 / 索引' },
  { no: '08', name: '认养一亩田', path: '/adopt-a-field', note: '四步农事流程与生长时间轴', tag: '助农 / 参与' },
  { no: '09', name: '一块地五笔收入', path: '/farm-income', note: '带农机制与风险承担', tag: '助农 / 机制' },
  { no: '10', name: '最后一公里实验室', path: '/last-mile', note: '三个痛点交互实验', tag: '助农 / 痛点' },
  { no: '11', name: '展览地图', path: '/exhibit-map', note: '六个尺度看全展结构', tag: '总览 / 动线' },
  { no: '12', name: '二十四节气', path: '/solar-terms', note: '全年农事索引', tag: '人文 / 农时' }
]
</script>

<template>
  <div class="relative min-h-[100dvh] surface-ink overflow-hidden flex items-center">
    <div class="absolute inset-0 coord-rule opacity-30 pointer-events-none"></div>
    <div class="absolute -right-[8%] -top-[20%] w-[40vw] h-[40vw] min-w-[22.5rem] min-h-[22.5rem] rounded-full border border-[#C88A32]/25 pointer-events-none"></div>
    <div class="absolute -left-10 bottom-0 watermark text-[30vw] leading-none select-none pointer-events-none">404</div>

    <div class="relative z-10 w-full max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24">
      <Reveal>
        <div class="flex flex-wrap items-center gap-3 mb-8">
          <span class="px-3 py-1.5 rounded-full bg-[#C88A32] text-[#1C1B18] font-mono text-[0.625rem] tracking-[0.2em] font-bold">WAYFINDING / 404</span>
          <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#F7F4EE]/80">JILIN DIGITAL RURAL MUSEUM</span>
        </div>
      </Reveal>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div class="lg:col-span-5">
          <h1 class="display-1 text-[#F7F4EE]" aria-label="这片田埂 还没修到">
            <span v-for="(ch, i) in Array.from('这片田埂')" :key="'a' + i" class="kin-char"
              :style="{ animationDelay: (0.12 + i * 0.07) + 's' }">{{ ch }}</span>
            <span class="block whitespace-nowrap text-[#C88A32]" :style="{ fontSize: '0.72em' }">
              <span v-for="(ch, i) in Array.from('还没修到')" :key="'b' + i" class="kin-char"
                :style="{ animationDelay: (0.44 + i * 0.07) + 's' }">{{ ch }}</span>
            </span>
          </h1>
          <Reveal :delay="560">
            <p class="lede text-[#F7F4EE]/90 mt-7 max-w-lg">
              你访问的这条参观动线暂未开放，可能链接已经调整，也可能这一块展陈还在策展中。展馆里已经开放的区域都在右侧，挑一处继续走。
            </p>
          </Reveal>
          <Reveal :delay="660">
            <div class="flex flex-wrap gap-3 mt-9">
              <RouterLink to="/" class="mag-btn mag-btn--gold">
                <span>返回序厅</span><span class="mag-btn__island"><ArrowLeft :size="16" /></span>
              </RouterLink>
              <RouterLink to="/exhibit-map" class="mag-btn mag-btn--light">
                <span>查看展览地图</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span>
              </RouterLink>
            </div>
          </Reveal>
          <Reveal :delay="740">
            <div class="mt-12 border-t border-[#F7F4EE]/18 pt-5 max-w-md">
              <div class="font-mono text-[0.5625rem] tracking-[0.2em] text-[#8A6324] mb-2">FIELD NOTE / 导览提示</div>
              <p class="text-[0.6875rem] leading-relaxed text-[#F7F4EE]/90">
                展馆按微观土壤、工业装备、宏观平原、人文专题、助农机制与落地痛点的尺度递进编排。从序厅出发，按兴趣挑几条动线走就好。
              </p>
            </div>
          </Reveal>
        </div>

        <div class="lg:col-span-7">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-stagger>
            <Reveal v-for="(r, i) in routes" :key="r.path" :delay="120 + i * 70">
              <RouterLink :to="r.path"
                class="group h-full flex flex-col p-6 border border-[#F7F4EE]/16 bg-[#F7F4EE]/5 hover:bg-[#F7F4EE]/10 hover:border-[#C88A32]/60 transition-all duration-500 lift">
                <div class="flex items-start justify-between gap-3 mb-6">
                  <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324]">{{ r.no }} / {{ r.tag }}</span>
                  <ArrowUpRight :size="16" class="text-[#C88A32] arrow-shift" />
                </div>
                <div class="font-editorial text-xl font-bold text-[#F7F4EE] group-hover:text-[#C88A32] transition-colors">{{ r.name }}</div>
                <div class="text-[0.6875rem] text-[#F7F4EE]/86 mt-2 flex-1">{{ r.note }}</div>
                <div class="mt-6 pt-4 border-t border-[#F7F4EE]/12 font-mono text-[0.5625rem] tracking-[0.14em] text-[#F7F4EE]/80">{{ r.path }}</div>
              </RouterLink>
            </Reveal>
          </div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#F7F4EE]/12 bg-[#1C1B18]/70 py-2.5" aria-hidden="true">
      <div class="marquee-track">
        <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[0.625rem] tracking-[0.22em] text-[#F7F4EE]/80 whitespace-nowrap">
          <span>黑土粮仓 · 吉韵新程</span><span class="text-[#C88A32]">✳</span>
          <span>黑土保育 / 智慧装备 / 稻作农时</span><span class="text-[#C88A32]">✳</span>
          <span>生态文旅 / 物产流通</span><span class="text-[#C88A32]">✳</span>
        </span>
      </div>
    </div>
  </div>
</template>
