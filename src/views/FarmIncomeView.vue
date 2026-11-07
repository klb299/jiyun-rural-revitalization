<script setup>
/**
 * 一块地，五笔收入
 * 只讲公开可查的带农机制与风险承担方式，不出现人名、自述、采访与统计数字。
 */
import Reveal from '../components/editorial/Reveal.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import { ArrowUpRight, ArrowRight } from 'lucide-vue-next'

const incomes = [
  {
    no: '01', name: '土地托管与代耕代种', color: '#221E19', tone: 'ink',
    who: '不愿流转土地的小农户、合作社与农机作业队',
    money: '保底收益加作业后的分成，土地经营权仍留在农户手里',
    risk: '自然风险由农户与农业保险共同承担，作业质量由服务方负责',
    link: '/strata-3d', linkLabel: '黑土地质标本馆'
  },
  {
    no: '02', name: '订单收购', color: '#C88A32', tone: 'gold',
    who: '种植户、加工企业与粮食收储主体',
    money: '播种前约定收购价与品质标准，优质部分另计溢价',
    risk: '价格波动按合同约定分摊，品质不达标由种植端承担',
    link: '/dashboard', linkLabel: '数智驾驶舱'
  },
  {
    no: '03', name: '合作社入股分红', color: '#2E5A44', tone: 'moss',
    who: '以农机、烘干、仓储或土地经营权入股的社员',
    money: '合作社对外作业服务收入与年末可分配盈余',
    risk: '经营风险由全体社员按股共同承担，不是固定利息',
    link: '/machinery-3d', linkLabel: '北斗农机解构馆'
  },
  {
    no: '04', name: '就地务工', color: '#8C583A', tone: 'clay',
    who: '本村与周边的季节性劳动力',
    money: '育秧、机耕、分拣、冷链与研学接待的劳务报酬',
    risk: '单一业态用工季节性明显，靠农文旅错峰对冲',
    link: '/chagan-lake', linkLabel: '查干湖冬捕生态非遗馆'
  },
  {
    no: '05', name: '品牌溢价与溯源', color: '#B83828', tone: 'red',
    who: '地理标志授权主体、检测机构与产地仓',
    money: '产地可查、分批留样带来的优质优价',
    risk: '品牌声誉由全体授权主体共担，一次失信全体受损',
    link: '/journey', linkLabel: '一粒米的旅程'
  }
]

const layers = [
  { k: '品牌溢价', h: '38px' },
  { k: '就地务工', h: '44px' },
  { k: '合作社分红', h: '50px' },
  { k: '订单收购', h: '56px' },
  { k: '托管保底', h: '62px' }
]
</script>

<template>
  <div class="relative">
    <!-- 01 首屏：账本式构图 -->
    <section class="relative min-h-[100dvh] bg-[#EFECE6] flex items-center overflow-hidden">
      <div class="absolute inset-0 coord-rule opacity-50 pointer-events-none"></div>
      <div class="absolute -right-10 -top-16 watermark text-[24vw] leading-none select-none pointer-events-none">账</div>

      <div class="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="px-3 py-1.5 rounded-full bg-[#B83828] text-[#FFFDF9] font-mono text-[10px] tracking-[0.2em] font-bold">FARM INCOME / 带农机制</span>
            <span class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960]">JILIN RURAL REVITALIZATION · 农户账本</span>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-6">
            <h1 class="display-1 text-[#1C1B18]" aria-label="一块地 五笔收入">
              <span v-for="(ch, i) in Array.from('一块地')" :key="'a' + i" class="kin-char"
                :style="{ animationDelay: (0.12 + i * 0.08) + 's' }">{{ ch }}</span>
              <span class="block whitespace-nowrap text-[#B83828]" :style="{ fontSize: '0.8em' }">
                <span v-for="(ch, i) in Array.from('五笔收入')" :key="'b' + i" class="kin-char"
                  :style="{ animationDelay: (0.44 + i * 0.07) + 's' }">{{ ch }}</span>
              </span>
            </h1>
            <Reveal :delay="580">
              <p class="font-editorial text-lg sm:text-2xl text-[#5A564E] mt-7">乡村振兴不是一句口号，是账本上的几笔收入</p>
            </Reveal>
            <Reveal :delay="660">
              <p class="lede mt-5 max-w-xl">
                上一页讲有哪些助农项目，这一页只回答一个问题，钱到底靠什么回到农户手里。五条路径都是公开可查的机制，每条都写清谁参与、钱从哪来、风险由谁担。没有人名，没有采访，也没有编出来的统计数字。
              </p>
            </Reveal>
            <Reveal :delay="740">
              <div class="flex flex-wrap gap-3 mt-9">
                <a href="#mechanisms" class="mag-btn"><span>看五笔收入</span><span class="mag-btn__island"><ArrowRight :size="16" /></span></a>
                <RouterLink to="/aid-projects" class="mag-btn mag-btn--light"><span>回到项目库</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></RouterLink>
              </div>
            </Reveal>
            <Reveal :delay="820">
              <div class="mt-12 grid grid-cols-3 gap-4 max-w-lg">
                <div v-for="n in [
                  { k: 'PATHS', v: '5 条收入路径' },
                  { k: 'ACTORS', v: '农户 / 合作社 / 企业' },
                  { k: 'RULE', v: '收益与风险同写' }
                ]" :key="n.k" class="border-t border-[#1C1B18]/25 pt-3">
                  <div class="font-mono text-[9px] tracking-[0.18em] text-[#B83828]">{{ n.k }}</div>
                  <div class="text-[11px] mt-1.5 text-[#3A3630]">{{ n.v }}</div>
                </div>
              </div>
            </Reveal>
          </div>

          <!-- 账本卡 -->
          <Reveal :delay="220" variant="scale" class="lg:col-span-6" data-parallax="-6">
            <div class="bezel">
              <div class="bezel-core p-6 sm:p-8">
                <div class="flex items-center justify-between gap-3 pb-4 mb-2 border-b border-[#1C1B18]/12">
                  <span class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960]">HOUSEHOLD LEDGER / 示意账本</span>
                  <span class="font-mono text-[9px] tracking-[0.14em] text-[#B83828]">五笔，不是五次</span>
                </div>
                <div class="divide-y divide-[#1C1B18]/10">
                  <div v-for="(it, i) in incomes" :key="it.no" class="flex items-center gap-4 py-4">
                    <span class="font-mono text-[10px] tracking-[0.16em] text-[#6E6960] w-7 shrink-0">{{ it.no }}</span>
                    <span class="w-2.5 h-2.5 rounded-sm shrink-0" :style="{ background: it.color }"></span>
                    <span class="font-editorial text-base sm:text-lg font-bold flex-1">{{ it.name }}</span>
                    <span class="h-1.5 rounded-full shrink-0" :style="{ background: it.color, width: 18 + i * 9 + 'px' }"></span>
                  </div>
                </div>
                <div class="mt-5 pt-4 border-t border-[#1C1B18]/12 text-[11px] leading-[1.85] text-[#5A564E]">
                  同一块地可以同时产生几笔收入，这正是合作社、订单农业与产地仓存在的理由。条形长短仅为视觉节奏，不代表金额或比例。
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#1C1B18]/12 bg-[#1C1B18] py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[10px] tracking-[0.22em] text-[#F7F4EE]/86 whitespace-nowrap">
            <span>土地托管 / 订单收购</span><span class="text-[#C88A32]">✳</span>
            <span>合作社分红 / 就地务工</span><span class="text-[#C88A32]">✳</span>
            <span>品牌溢价与一袋一码</span><span class="text-[#C88A32]">✳</span>
            <span>收益与风险，写在同一页上</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 02 五笔机制档案 -->
    <section id="mechanisms" class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="01 / 03" eyebrow="FIVE MECHANISMS / 机制档案" title="收益从哪来，风险谁担着"
          description="每条都按「谁参与 / 钱从哪来 / 风险谁担」三段写。只讲机制，不写收益承诺。" />
      </Reveal>

      <div class="mt-12 grid grid-cols-1 md:grid-cols-12 gap-4" data-stagger>
        <Reveal v-for="(it, i) in incomes" :key="it.no" :delay="(i % 3) * 80"
          :class="i === 0 ? 'md:col-span-7' : i === 1 ? 'md:col-span-5' : i === 2 ? 'md:col-span-5' : i === 3 ? 'md:col-span-7' : 'md:col-span-12'">
          <div class="h-full relative overflow-hidden border border-[#1C1B18]/12 bg-[#FFFDF9] p-6 sm:p-8 lift">
            <span class="absolute -right-2 -bottom-8 font-editorial font-bold text-[#1C1B18]/6 select-none" style="font-size: 8rem; line-height: 1">{{ it.no }}</span>
            <div class="relative flex items-center gap-3 mb-6">
              <span class="w-3 h-3 rounded-sm" :style="{ background: it.color }"></span>
              <span class="font-mono text-[10px] tracking-[0.18em] text-[#6E6960]">INCOME {{ it.no }}</span>
            </div>
            <h3 class="relative font-editorial text-xl sm:text-2xl font-bold mb-6">{{ it.name }}</h3>
            <div class="relative grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div v-for="b in [
                { k: '谁参与', v: it.who },
                { k: '钱从哪来', v: it.money },
                { k: '风险谁担', v: it.risk }
              ]" :key="b.k" class="border-t border-[#1C1B18]/12 pt-4">
                <div class="font-mono text-[9px] tracking-[0.16em] text-[#8A6324] mb-2">{{ b.k }}</div>
                <p class="text-[12px] leading-[1.9] text-[#3A3630]">{{ b.v }}</p>
              </div>
            </div>
            <div class="relative mt-6 pt-4 border-t border-[#1C1B18]/10">
              <RouterLink :to="it.link" class="inline-flex items-center gap-2 text-[11px] font-bold text-[#8A6324] group">
                对应展陈 · {{ it.linkLabel }} <ArrowUpRight :size="14" class="arrow-shift" />
              </RouterLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- 03 叠加账本 + 口径 -->
    <section class="surface-ink">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <SectionHead index="02 / 03" eyebrow="STACKED LEDGER / 叠加账本" title="五笔，是叠在一起的"
            description="同一季里，托管保底、订单收购、分红、务工与品牌溢价可以同时发生，而不是五选一。" dark />
        </Reveal>

        <div class="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <Reveal :delay="120" class="lg:col-span-5">
            <div class="flex items-end gap-6">
              <div class="w-24 sm:w-32 flex flex-col gap-1.5">
                <div v-for="l in layers" :key="l.k"
                  class="rounded-sm flex items-center justify-center font-mono text-[9px] tracking-[0.12em] text-[#1C1B18]"
                  :style="{ height: l.h, minHeight: '34px', background: l.k === '订单收购' ? '#C88A32' : l.k === '合作社分红' ? '#8FBFA2' : l.k === '就地务工' ? '#D8C7A4' : l.k === '品牌溢价' ? '#E4A49A' : '#F0E6D2' }">
                </div>
              </div>
              <div class="flex-1 space-y-3">
                <div v-for="l in layers" :key="l.k" class="flex items-center gap-3">
                  <span class="h-px w-6 bg-[#F7F4EE]/30 shrink-0"></span>
                  <span class="text-[12px] text-[#F7F4EE]/92">{{ l.k }}</span>
                </div>
              </div>
            </div>
            <p class="text-[11px] leading-[1.9] text-[#F7F4EE]/86 mt-7">
              色块高度仅用于表达「可以叠加」这件事，是示意图层，不代表金额、比例或统计结果。
            </p>
          </Reveal>

          <Reveal :delay="200" class="lg:col-span-7">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="n in [
                { k: 'WHY COOP', t: '为什么要合作社', d: '单户买不起烘干与仓储，凑在一起才能把加工和议价这一笔留在村里。' },
                { k: 'WHY CONTRACT', t: '为什么要先定价', d: '丰产不丰收是老问题，订单把价格风险在播种前就摊开说清。' },
                { k: 'WHY TRACE', t: '为什么要一袋一码', d: '优质优价的前提是能证明优质，分批留样与检测让产地能被查到。' },
                { k: 'WHY MIX', t: '为什么要多业态', d: '农忙与冬捕季节错开，务工收入才不会只集中在短短几周。' }
              ]" :key="n.k" class="border border-[#F7F4EE]/18 bg-[#F7F4EE]/5 p-5">
                <div class="font-mono text-[9px] tracking-[0.18em] text-[#8A6324] mb-3">{{ n.k }}</div>
                <div class="font-editorial text-base font-bold text-[#F7F4EE] mb-2">{{ n.t }}</div>
                <p class="text-[11px] leading-[1.9] text-[#F7F4EE]/90">{{ n.d }}</p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal :delay="240">
          <div class="mt-14 pt-8 border-t border-[#F7F4EE]/18 flex flex-wrap items-center justify-between gap-6">
            <div>
              <div class="font-mono text-[9px] tracking-[0.18em] text-[#8A6324] mb-2">DATA NOTE / 口径说明</div>
              <p class="text-[12px] leading-[1.9] text-[#F7F4EE]/90 max-w-2xl">
                五条机制均为公开可查的带农方式，页面不含具体金额、户数、比例与人物信息。全站量级示意数字的性质与参照年份，见「关于」页附录 A。
              </p>
            </div>
            <RouterLink to="/about#data-notes" class="inline-flex items-center gap-2 text-xs font-bold text-[#8A6324] group shrink-0">
              查看数据口径 <ArrowUpRight :size="15" class="arrow-shift" />
            </RouterLink>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- 04 回链 -->
    <section class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="03 / 03" eyebrow="KEEP EXPLORING / 继续参观" title="从机制回到土地"
          description="机制讲完，可以回到项目库看具体路径，或去认养页把那一季走一遍。" />
      </Reveal>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12" data-stagger>
        <Reveal v-for="n in [
          { to: '/aid-projects', k: 'BACK / 索引', t: '助农项目库', d: '六类带农路径与项目档案' },
          { to: '/adopt-a-field', k: 'BACK / 参与', t: '认养一亩田', d: '四步流程与生长时间轴' },
          { to: '/products', k: 'RELATED / 产出', t: '吉林风物集市', d: '产地、认证与流通方式' }
        ]" :key="n.to" :delay="0">
          <RouterLink :to="n.to" class="group h-full bg-[#FFFDF9] border border-[#1C1B18]/10 p-7 lift block">
            <div class="font-mono text-[9px] tracking-[0.18em] text-[#8A6324] mb-5">{{ n.k }}</div>
            <div class="font-editorial text-xl font-bold mb-2 group-hover:text-[#8A6324] transition-colors">{{ n.t }}</div>
            <div class="text-[11px] leading-relaxed text-[#5A564E]">{{ n.d }}</div>
          </RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
