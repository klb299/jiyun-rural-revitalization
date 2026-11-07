<script setup>
import RuralDashboardCharts from '../components/RuralDashboardCharts.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import Reveal from '../components/editorial/Reveal.vue'
import { ArrowUpRight } from 'lucide-vue-next'

const telemetry = [
  { value: '38.6%', label: '土壤墒情含水率', note: '适宜稻麦分蘖 / 水温协同', tag: 'SOIL MOISTURE', tone: 'ink' },
  { value: '4.82%', label: '黑土表层有机质', note: '特级肥力 / 梨树模式', tag: 'ORGANIC MATTER', tone: 'moss' },
  { value: '2840℃', label: '年均有效积温', note: '优质粳稻黄金生长带', tag: 'ACCUMULATED TEMP', tone: 'linen' },
  { value: '186', label: '无人农机在线作业', note: '单位：台 / 长春周边北斗网联', tag: 'AUTONOMOUS FLEET', tone: 'gold' }
]

const toneClass = {
  ink: 'card-ink text-[#F7F4EE]',
  moss: 'card-moss text-[#F7F4EE]',
  linen: 'card-linen text-[#1C1B18]',
  gold: 'card-gold text-[#1C1B18]'
}

const toneNote = {
  ink: 'text-[#F7F4EE]/80',
  moss: 'text-[#F7F4EE]/86',
  linen: 'text-[#5A564E]',
  gold: 'text-[#1C1B18]/70'
}

const grainFlows = [
  { dest: '北京 · 绿色供应链直供', amount: '12,400 吨', mode: '运抵直达', time: '10 分钟前' },
  { dest: '上海 · 华东优质大米配送仓', amount: '24,800 吨', mode: '高铁冷链', time: '25 分钟前' },
  { dest: '广州 · 大湾区专用储备', amount: '18,500 吨', mode: '铁海联运', time: '1 小时前' },
  { dest: '长春本地 · 市民智慧菜篮子', amount: '8,200 吨', mode: '本地保供', time: '实时更新' }
]

const research = [
  { name: '免耕少耕覆盖技术', value: '+18.5%', note: '水分存蓄' },
  { name: '秋季秸秆生物深腐', value: '+0.12%', note: '有机质年增' },
  { name: '测土配方变量施肥', value: '-21.0%', note: '化肥施用' }
]

const decisions = [
  { k: 'SENSING', v: '空天地一体', d: '卫星遥感 / 无人机 / 地面探头' },
  { k: 'MODEL', v: '退化阻控', d: '健康培育数字化模型' },
  { k: 'ACTION', v: '变量作业', d: '处方图直达无人农机' }
]
</script>

<template>
  <div>
    <!-- 01 琥珀金封面 -->
    <section class="relative overflow-hidden" style="background: linear-gradient(145deg, #E7BC6C 0%, #C88A32 48%, #A9701F 100%)">
      <div class="absolute inset-0 coord-rule opacity-25 pointer-events-none"></div>
      <div class="absolute -left-16 -bottom-28 font-editorial font-bold text-[#1C1B18]/[0.07] select-none" style="font-size: 30rem; line-height: 1">04</div>
      <div data-parallax="-12" class="absolute -right-[8%] -top-[20%] w-[34vw] h-[34vw] min-w-[340px] min-h-[340px] rounded-full bg-[#FFFDF9]/12 blur-2xl pointer-events-none"></div>

      <div class="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-28 sm:pt-32 pb-16 sm:pb-20">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3 mb-9">
            <span class="px-3 py-1.5 rounded-full bg-[#1C1B18] text-[#F7F4EE] font-mono text-[10px] tracking-[0.2em] font-bold">CHAPTER 04</span>
            <span class="font-mono text-[10px] tracking-[0.2em] text-[#1C1B18]/65">SMART RURAL TELEMETRY / 数智驾驶舱</span>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div class="lg:col-span-8">
            <h1 class="display-1 text-[#1C1B18]" aria-label="把黑土的脉搏，画成图表">
              <span v-for="(ch, i) in Array.from('把黑土的脉搏')" :key="'a' + i" class="kin-char"
                :style="{ animationDelay: (0.1 + i * 0.055) + 's' }">{{ ch }}</span>
              <span v-for="(ch, i) in Array.from('画成图表')" :key="'b' + i" class="kin-char"
                :style="{ animationDelay: (0.5 + i * 0.075) + 's' }">{{ ch }}</span>
            </h1>
            <Reveal :delay="620">
              <p class="font-editorial text-xl sm:text-2xl text-[#1C1B18]/80 mt-7">吉林黑土粮仓 · 数字乡村驾驶舱</p>
            </Reveal>
            <Reveal :delay="700">
              <p class="lede text-[#1C1B18]/75 mt-5 max-w-2xl">
                依托长春科研枢纽的空天地一体化监测，把土壤墒情、有机质、积温与农机作业状态汇总到同一张展台。这里既是数据看板，也是理解黑土保护成效的一把尺子。
              </p>
            </Reveal>
            <Reveal :delay="780">
              <div class="flex flex-wrap gap-3 mt-9">
                <a href="#telemetry" class="mag-btn"><span>查看实时监测</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
                <a href="#logistics" class="mag-btn mag-btn--light"><span>阅读保供调度</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
              </div>
            </Reveal>
          </div>

          <!-- 墨色数据环 -->
          <Reveal :delay="200" variant="scale" class="lg:col-span-4 hidden lg:block" data-parallax="-9">
            <div class="relative mx-auto w-[300px] h-[300px]">
              <div class="absolute inset-0 rounded-full bg-[#1C1B18] shadow-[0_40px_90px_-40px_rgba(28,27,24,0.8)]"></div>
              <div class="absolute inset-5 rounded-full border border-[#C88A32]/45"></div>
              <div class="absolute inset-10 rounded-full border border-[#F7F4EE]/12"></div>
              <svg viewBox="0 0 200 200" class="absolute inset-0 w-full h-full animate-[spin_30s_linear_infinite]">
                <defs><path id="dash-ring" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0"></path></defs>
                <text font-family="ui-monospace, monospace" font-size="8" letter-spacing="2.4" fill="#C88A32">
                  <textPath href="#dash-ring">SOIL HEALTH INDEX · JILIN · 5G IOT · 2026 · </textPath>
                </text>
              </svg>
              <div class="absolute inset-0 grid place-items-center text-center">
                <div>
                  <div class="font-mono text-[9px] tracking-[0.22em] text-[#8A6324] mb-2">ORGANIC MATTER</div>
                  <div class="font-editorial text-6xl font-bold text-[#F7F4EE] leading-none">4.82<span class="text-2xl">%</span></div>
                  <div class="font-mono text-[9px] tracking-[0.18em] text-[#F7F4EE]/80 mt-3">特级肥力黑土</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal :delay="860" class="mt-16">
          <div class="rounded-2xl bg-[#1C1B18] grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#F7F4EE]/12 overflow-hidden">
            <div v-for="m in [
              { k: 'SOURCE', v: '中科院东北地理所 / 农高区' },
              { k: 'LINK', v: '5G 专网双向回传' },
              { k: 'UPDATE', v: '教学演示数据' }
            ]" :key="m.k" class="px-6 py-5">
              <div class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-1.5">{{ m.k }}</div>
              <div class="text-sm font-semibold text-[#F7F4EE]">{{ m.v }}</div>
            </div>
          </div>
        </Reveal>
      </div>

      <div class="marquee border-t border-[#1C1B18]/15 py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[11px] tracking-[0.2em] text-[#1C1B18]/70 whitespace-nowrap">
            <span>REAL-TIME TELEMETRY</span><span>✳</span><span>黑土地生境健康</span><span>✳</span><span>880 亿斤 / 年</span><span>✳</span><span>GRAIN LOGISTICS</span><span>✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 02 非对称 KPI -->
    <section id="telemetry" class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal><SectionHead index="01 / 04" eyebrow="LIVE TELEMETRY / 实时遥测" title="四项指标，判断一季收成" description="数据链路以 5G 专网回传，数值为教学演示用的典型区间，用于说明指标体系而非实时生产报表。" /></Reveal>
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5 mt-14" data-stagger>
        <Reveal v-for="(t, i) in telemetry" :key="t.label" :delay="i * 80"
          :class="i === 0 ? 'md:col-span-7' : i === 1 ? 'md:col-span-5' : i === 2 ? 'md:col-span-5' : 'md:col-span-7'">
          <div class="h-full p-7 sm:p-8 relative overflow-hidden z-card lift" :class="toneClass[t.tone]">
            <span class="absolute -right-3 -bottom-12 font-editorial font-bold opacity-[0.08] select-none" style="font-size: 11rem; line-height: 1">0{{ i + 1 }}</span>
            <div class="relative font-mono text-[10px] tracking-[0.2em] opacity-65 mb-9">{{ t.tag }}</div>
            <div class="relative font-editorial font-bold leading-none" :style="{ fontSize: i === 0 ? 'clamp(3.4rem, 6vw, 5.6rem)' : 'clamp(2.5rem, 4vw, 3.8rem)' }">{{ t.value }}</div>
            <div class="relative mt-5 text-base font-bold">{{ t.label }}</div>
            <p class="relative text-[12px] leading-relaxed mt-2" :class="toneNote[t.tone]">{{ t.note }}</p>
          </div>
        </Reveal>
      </div>

      <!-- 图表双层壳 -->
      <Reveal :delay="140" class="mt-16">
        <div class="bezel">
          <div class="bezel-core">
            <div class="bg-[#1C1B18] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div class="font-editorial text-lg font-bold text-[#F7F4EE]">黑土生境可视化分析</div>
              <div class="font-mono text-[10px] tracking-[0.18em] text-[#8A6324]">ECHARTS / 3 VIEWS</div>
            </div>
            <div class="p-4 sm:p-7 bg-[#FFFDF9]">
              <RuralDashboardCharts />
            </div>
          </div>
        </div>
      </Reveal>
    </section>

    <!-- 03 保供调度：墨色区块 -->
    <section id="logistics" class="surface-ink relative overflow-hidden">
      <div class="absolute inset-0 coord-rule opacity-20 pointer-events-none"></div>
      <div class="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal><SectionHead index="02 / 04" eyebrow="GRAIN LOGISTICS / 保供调度" title="一粒米离田之后的路" description="从烘干塔、数字粮仓到全国干线冷链，每一批次都带着地块编号与检测报告进入流通。" dark /></Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-14">
          <Reveal class="lg:col-span-8">
            <div class="bezel bezel--ink h-full">
              <div class="bezel-core bg-[#F7F4EE] overflow-x-auto">
                <table class="w-full text-left min-w-[560px]">
                  <thead>
                    <tr class="bg-[#EFECE6]">
                      <th v-for="h in ['保供流向目的地', '本批次外运量', '物流形式', '时效状态']" :key="h" class="py-4 px-5 font-mono text-[10px] tracking-[0.16em] text-[#6E6960] font-medium">{{ h }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(f, i) in grainFlows" :key="f.dest" class="border-b border-[#1C1B18]/8 last:border-0 hover:bg-[#EFECE6]/60 transition-colors">
                      <td class="py-4 px-5 text-sm font-semibold text-[#1C1B18]"><span class="font-mono text-[10px] text-[#8A6324] mr-3">0{{ i + 1 }}</span>{{ f.dest }}</td>
                      <td class="py-4 px-5 font-mono text-sm font-bold text-[#8A6324]">{{ f.amount }}</td>
                      <td class="py-4 px-5"><span class="px-2.5 py-1 rounded-full bg-[#EFECE6] text-[11px] text-[#5A564E]">{{ f.mode }}</span></td>
                      <td class="py-4 px-5 font-mono text-[11px] text-[#6E6960]">{{ f.time }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
          <Reveal :delay="120" class="lg:col-span-4">
            <div class="card-gold h-full p-7 sm:p-8 relative overflow-hidden">
              <span class="absolute -right-6 -top-8 font-editorial font-bold text-[#1C1B18]/8 select-none" style="font-size: 10rem; line-height: 1">R</span>
              <div class="relative font-mono text-[10px] tracking-[0.2em] text-[#1C1B18]/70 mb-4">SCIENCE / 科技会战</div>
              <h3 class="display-3 relative mb-4">中科院「黑土粮仓」攻关</h3>
              <p class="relative text-[13px] leading-[1.85] text-[#1C1B18]/75 mb-8">
                以国家战略科技力量破解黑土「变薄、变瘦、变硬」难题，把免耕阻蚀、秸秆腐解与变量施肥做成可量化的工程指标。
              </p>
              <div class="relative space-y-3">
                <div v-for="r in research" :key="r.name" class="flex items-center justify-between gap-3 py-3 border-t border-[#1C1B18]/20">
                  <span class="text-xs font-semibold">{{ r.name }}</span>
                  <span class="text-right"><span class="font-mono text-base font-bold">{{ r.value }}</span><span class="caption block text-[#1C1B18]/60">{{ r.note }}</span></span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 04 决策链 -->
    <section class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <Reveal class="lg:col-span-5 relative" data-parallax="-8">
          <div class="bezel z-card" style="transform: rotate(-3deg)">
            <div class="bezel-core">
              <img src="/art/soil-strata.svg" alt="黑土剖面与监测层位图版" loading="lazy" class="w-full aspect-[4/5] object-cover" />
            </div>
          </div>
          <div class="absolute -bottom-7 -right-6 card-moss z-card px-6 py-4 rounded-2xl" style="transform: rotate(4deg)">
            <div class="font-mono text-[10px] tracking-[0.18em] text-[#F7F4EE]/80 mb-1">PLATE 01</div>
            <div class="font-editorial text-lg font-bold">剖面监测层位</div>
          </div>
        </Reveal>
        <div class="lg:col-span-7">
          <Reveal><SectionHead index="03 / 04" eyebrow="DATA INTERPRETATION / 读图" title="数据不是终点，决策才是" /></Reveal>
          <Reveal :delay="100"><p class="lede mt-8">
            当表层含水率低于阈值，智能水闸会依据液位计自动分流松花江灌区来水。当有机质年增量放缓，农技系统会建议调整秸秆还田比例与深松周期。驾驶舱把这些判断链路并排呈现，让「黑土地保护」从一个口号变成一组可以复核的参数。
          </p></Reveal>
          <Reveal :delay="180">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10" data-stagger>
              <div v-for="n in decisions" :key="n.k" class="card-linen p-5">
                <div class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324] mb-2">{{ n.k }}</div>
                <div class="font-editorial text-lg font-bold mb-1.5">{{ n.v }}</div>
                <div class="caption">{{ n.d }}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 05 收束 -->
    <section class="relative overflow-hidden" style="background: linear-gradient(145deg, #E7BC6C, #C88A32 55%, #A9701F 100%)">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <Reveal class="lg:col-span-8">
          <div class="font-mono text-[10px] tracking-[0.22em] text-[#1C1B18]/65 mb-4">04 / 04 · DATA NOTE</div>
          <p class="text-[13px] leading-[2] text-[#1C1B18]/78 max-w-2xl">
            本章图表与遥测数值为教学演示用的示意数据，结构与量级参考吉林省农业农村厅公开年报及中科院东北地理所「黑土粮仓」科技会战公开成果，不用于生产决策。
          </p>
        </Reveal>
        <Reveal :delay="120" class="lg:col-span-4 lg:text-right">
          <div class="caption text-[#1C1B18]/60 mb-3">NEXT CHAPTER / 下一专题</div>
          <RouterLink to="/journey" class="mag-btn">
            <span>一粒米的旅程</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span>
          </RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
