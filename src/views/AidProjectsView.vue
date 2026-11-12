<script setup>
/**
 * 助农项目库
 * 项目主体全部采用公开可查的现实对象与项目类型，不编造示范工程专名、人名与统计数字。
 * 方位格是抽象索引，不是行政区划地图。
 */
import { ref, computed } from 'vue'
import Reveal from '../components/editorial/Reveal.vue'
import PhotoNote from '../components/editorial/PhotoNote.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import { ArrowUpRight, ArrowRight } from 'lucide-vue-next'

const projects = [
  {
    no: 'P-01', zone: '中部平原 · 梨树一带', zoneKey: '黑土保育',
    type: '秸秆覆盖免耕推广', tone: 'ink', color: '#221E19',
    basis: '中科院东北地理所「黑土粮仓」科技会战 · 梨树模式长期定位试验',
    problem: '春季风蚀带走表土，连年翻耕让耕层变薄变硬。',
    action: '秋收后秸秆粉碎均匀覆盖，来年免耕播种机直接穿过覆盖层下种，配套深松与轮作。',
    effect: '减少翻耕作业环节，保墒阻蚀，由合作社统一提供免耕装备与作业服务。',
    link: '/strata-3d', linkLabel: '黑土地质标本馆'
  },
  {
    no: 'P-02', zone: '长春周边 · 国家农高区', zoneKey: '智慧装备',
    type: '北斗农机共享作业', tone: 'gold', color: '#C88A32',
    basis: '长春国家农业高新技术产业示范区 · 北斗高精度农业应用',
    problem: '智能农机单价高，小农户单独购置不划算。',
    action: '合作社托管土地，RTK 无人拖拉机与植保无人机按作业面积统一调度。',
    effect: '单户不必购置装备也能用上厘米级起垄与植保，农忙窗口不再卡在机器和人手上。',
    link: '/machinery-3d', linkLabel: '北斗农机解构馆'
  },
  {
    no: 'P-03', zone: '中部灌区 · 九台、饮马河流域', zoneKey: '品质溯源',
    type: '稻米一袋一码溯源', tone: 'moss', color: '#2E5A44',
    basis: '吉林大米地理标志产区 · 松花江与饮马河灌区',
    problem: '好米卖不出好价，产地与年份说不清。',
    action: '地块编码、农事记录、水质与检测报告随包装二维码一并公开。',
    effect: '优质粳稻从「统货」变成可查产地的品牌粮，溢价有机会回到种植端。',
    link: '/journey', linkLabel: '一粒米的旅程'
  },
  {
    no: 'P-04', zone: '东南山地 · 长白山腹地', zoneKey: '林特山货',
    type: '林下特产标准化采集', tone: 'clay', color: '#8C583A',
    basis: '长白山椴树蜜、林下参等林特资源与地理标志体系',
    problem: '山货零散售卖，分级不一，收购价随行就市。',
    action: '统一采收标准、检测分级、包装与产地仓预冷，按等级稳定收购。',
    effect: '采集户按标准分级获得可预期的收购价，不必各自找销路。',
    link: '/products', linkLabel: '吉林风物集市'
  },
  {
    no: 'P-05', zone: '西北湖泊 · 查干湖', zoneKey: '冰雪文旅',
    type: '冬捕非遗与生态研学', tone: 'water', color: '#8EBACB',
    basis: '国家级非物质文化遗产查干湖冬捕 · 增殖放流与抓大放小',
    problem: '捕捞集中在冬季一季，收益季节性强。',
    action: '冬捕仪轨、冷链直发、冰雪研学与湿地保护并行，坚持六寸网孔与增殖放流。',
    effect: '渔猎技艺延伸出讲解、接待、冷链等常年岗位，前提是生态账先算清。',
    link: '/chagan-lake', linkLabel: '查干湖冬捕生态非遗馆'
  },
  {
    no: 'P-06', zone: '全省产区 · 产地仓与冷链', zoneKey: '电商直采',
    type: '电商直采与产地仓', tone: 'red', color: '#B83828',
    basis: '吉林大米、黄金玉米带产区的公开流通与消费帮扶方式',
    problem: '中间环节多，产后损耗与议价损耗叠加。',
    action: '产地就近分级、预冷与包装，冷链直发消费端，单位与平台按批次直采。',
    effect: '缩短流通链路，减少倒装损耗，让产地更早知道下一季该种什么。',
    link: '/products', linkLabel: '吉林风物集市'
  }
]

const zones = ['全部', '黑土保育', '智慧装备', '品质溯源', '林特山货', '冰雪文旅', '电商直采']
const activeZone = ref('全部')
const activeProject = ref(0)
const filtered = computed(() => activeZone.value === '全部'
  ? projects
  : projects.filter((p) => p.zoneKey === activeZone.value))

const chain = [
  { k: '耕', t: '免耕保育', p: 'P-01' },
  { k: '种', t: '北斗精播', p: 'P-02' },
  { k: '管', t: '无人机巡田', p: 'P-02' },
  { k: '收', t: '低温慢烘', p: 'P-03' },
  { k: '加', t: '分级包装', p: 'P-04' },
  { k: '流', t: '产地仓冷链', p: 'P-06' },
  { k: '旅', t: '非遗研学', p: 'P-05' }
]

const current = computed(() => projects[activeProject.value])

// 模板里不能直接用 document，统一走方法
const goArchive = (p) => {
  activeProject.value = projects.indexOf(p)
  document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="relative">
    <!-- 01 首屏：抽象方位索引格，不是行政区划地图 -->
    <section class="relative min-h-[100dvh] bg-[#F7F4EE] flex items-center overflow-hidden">
      <div class="absolute inset-0 coord-rule opacity-70 pointer-events-none"></div>
      <div data-parallax="-9" class="absolute -right-[12%] -top-[20%] w-[40vw] h-[40vw] min-w-[360px] min-h-[360px] rounded-full border border-[#C88A32]/25 pointer-events-none"></div>

      <div class="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="px-3 py-1.5 rounded-full bg-[#2E5A44] text-[#F7F4EE] font-mono text-[10px] tracking-[0.2em] font-bold">AID PROJECTS / 助农项目</span>
            <span class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960]">JILIN RURAL REVITALIZATION · 六类带农路径</span>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-5">
            <h1 class="display-1 text-[#1C1B18]" aria-label="项目落在 哪片地上">
              <span v-for="(ch, i) in Array.from('项目落在')" :key="'a' + i" class="kin-char"
                :style="{ animationDelay: (0.12 + i * 0.07) + 's' }">{{ ch }}</span>
              <span class="block whitespace-nowrap text-[#C88A32]" :style="{ fontSize: '0.78em' }">
                <span v-for="(ch, i) in Array.from('哪片地上')" :key="'b' + i" class="kin-char"
                  :style="{ animationDelay: (0.46 + i * 0.07) + 's' }">{{ ch }}</span>
              </span>
            </h1>
            <Reveal :delay="580">
              <p class="font-editorial text-lg sm:text-2xl text-[#5A564E] mt-7">从耕地、装备到流通，把带农这件事摊开看</p>
            </Reveal>
            <Reveal :delay="660">
              <p class="lede mt-5 max-w-xl">
                展馆里的三座 3D 展厅讲技术怎么工作，这一章讲技术落到地上以后，谁在组织、谁在出力、农户的账本靠什么多出几笔。下面六类路径都对应公开可查的现实主体与项目类型，点一格就能读到它的做法。
              </p>
            </Reveal>
            <Reveal :delay="740">
              <div class="flex flex-wrap gap-3 mt-9">
                <a href="#archive" class="mag-btn"><span>查看项目档案</span><span class="mag-btn__island"><ArrowRight :size="16" /></span></a>
                <RouterLink to="/adopt-a-field" class="mag-btn mag-btn--light"><span>去认养一亩田</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></RouterLink>
              </div>
            </Reveal>
            <Reveal :delay="820">
              <div class="grid grid-cols-3 gap-4 mt-12 max-w-lg">
                <div v-for="s in [
                  { k: 'PATHS', v: '6 类带农路径' },
                  { k: 'REGIONS', v: '3 类产区' },
                  { k: 'LINKS', v: '7 个产业环节' }
                ]" :key="s.k" class="border-t border-[#1C1B18]/25 pt-3">
                  <div class="font-mono text-[9px] tracking-[0.18em] text-[#2E5A44]">{{ s.k }}</div>
                  <div class="text-[11px] mt-1.5 text-[#3A3630]">{{ s.v }}</div>
                </div>
              </div>
            </Reveal>
          </div>

          <!-- 方位索引格 -->
          <Reveal :delay="220" variant="scale" class="lg:col-span-7" data-parallax="-6">
            <div class="bezel">
              <div class="bezel-core p-5 sm:p-7">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-5">
                  <span class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960]">ZONE INDEX / 方位索引</span>
                  <span class="font-mono text-[9px] tracking-[0.14em] text-[#8A6324]">方位示意，非行政区划地图</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button v-for="(p, i) in projects" :key="p.no" @click="activeProject = i"
                    class="group relative text-left p-4 sm:p-5 border transition-all duration-500 cursor-pointer lift overflow-hidden"
                    :class="activeProject === i ? 'border-[#C88A32] bg-[#FFFDF9] shadow-[0_18px_44px_-30px_rgba(28,27,24,.5)]' : 'border-[#1C1B18]/12 bg-[#F7F4EE]/60'">
                    <span class="absolute -right-3 -bottom-4 font-editorial font-bold text-[#1C1B18]/6 select-none" style="font-size: 5rem; line-height: 1">{{ p.no.slice(-2) }}</span>
                    <div class="relative flex items-center gap-2 mb-4">
                      <span class="w-3 h-3 rounded-sm border border-[#1C1B18]/15 shrink-0" :style="{ background: p.color }"></span>
                      <span class="font-mono text-[9px] tracking-[0.16em] text-[#6E6960]">{{ p.no }}</span>
                    </div>
                    <div class="relative text-[10px] text-[#5A564E] mb-1.5">{{ p.zone }}</div>
                    <div class="relative font-editorial text-[13px] sm:text-[15px] font-bold leading-snug text-balance group-hover:text-[#8A6324] transition-colors">{{ p.type }}</div>
                  </button>
                </div>
                <div class="mt-5 pt-4 border-t border-[#1C1B18]/10 font-mono text-[9px] tracking-[0.14em] text-[#6E6960]">
                  点击任一格读取项目档案 · 六类路径均为公开项目类型整理
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#1C1B18]/10 bg-[#1C1B18] py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[10px] tracking-[0.22em] text-[#F7F4EE]/86 whitespace-nowrap">
            <span>黑土保育 / 智慧装备</span><span class="text-[#C88A32]">✳</span>
            <span>品质溯源 / 林特山货</span><span class="text-[#C88A32]">✳</span>
            <span>冰雪文旅 / 电商直采</span><span class="text-[#C88A32]">✳</span>
            <span>带农不是一句口号，是账本上的几笔收入</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 田野实景：首屏与内容之间的一处真实影像，避免全页程序化图形 -->
    <section class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-14 sm:pt-20">
      <Reveal>
        <PhotoNote src="/photos/green-field.jpg" alt="六类带农路径所在的田野实景" label="FIELD NOTE / 六类带农路径" note="照片用于对照真实田野与作业环境，页面里的项目编号、机制与成效仍为教学演示整理，不对应具体地块或经营主体。" />
      </Reveal>
    </section>

    <!-- 02 项目档案 -->
    <section id="archive" class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="01 / 03" eyebrow="PROJECT DOSSIER / 项目档案" title="问题、做法、带农成效"
          description="每类路径按三段写清楚，不写示范工程专名，不写未经核实的户数金额。" />
      </Reveal>

      <Reveal :delay="100" variant="scale" class="mt-12">
        <div class="card-ink p-7 sm:p-10 relative overflow-hidden">
          <div class="absolute right-6 top-6 font-editorial font-bold text-[#F7F4EE]/8 select-none" style="font-size: 8rem; line-height: 1">{{ current.no }}</div>
          <div class="relative flex flex-wrap items-center gap-3 mb-6">
            <span class="w-3 h-3 rounded-sm" :style="{ background: current.color }"></span>
            <span class="font-mono text-[10px] tracking-[0.2em] text-[#8A6324]">{{ current.no }} / {{ current.zoneKey }}</span>
            <span class="font-mono text-[10px] tracking-[0.16em] text-[#F7F4EE]/80">{{ current.zone }}</span>
          </div>
          <h3 class="relative font-editorial text-2xl sm:text-4xl font-bold text-[#F7F4EE] mb-3">{{ current.type }}</h3>
          <div class="relative font-mono text-[10px] tracking-[0.14em] text-[#F7F4EE]/80 mb-9">公开依据 / {{ current.basis }}</div>
          <div class="relative grid grid-cols-1 md:grid-cols-3 gap-7">
            <div v-for="(b, i) in [
              { k: '01 / 遇到的问题', v: current.problem },
              { k: '02 / 采取的做法', v: current.action },
              { k: '03 / 带农成效', v: current.effect }
            ]" :key="b.k" class="border-t border-[#F7F4EE]/20 pt-5">
              <div class="font-mono text-[9px] tracking-[0.18em] text-[#8A6324] mb-3">{{ b.k }}</div>
              <p class="text-[13px] leading-[1.95] text-[#F7F4EE]/92">{{ b.v }}</p>
            </div>
          </div>
          <div class="relative mt-9 pt-6 border-t border-[#F7F4EE]/16 flex flex-wrap items-center justify-between gap-4">
            <span class="font-mono text-[9px] tracking-[0.14em] text-[#F7F4EE]/80">教学演示整理 · 项目类型与机制可公开查证</span>
            <RouterLink :to="current.link" class="inline-flex items-center gap-2 text-xs font-bold text-[#8A6324] group">
              去看对应展陈 · {{ current.linkLabel }} <ArrowUpRight :size="15" class="arrow-shift" />
            </RouterLink>
          </div>
        </div>
      </Reveal>
    </section>

    <!-- 03 产业环节链条 + 分类筛选 -->
    <section class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <SectionHead index="02 / 03" eyebrow="FROM FIELD TO TABLE / 产业环节" title="七个环节，串起六类路径"
            description="助农不是只在销售端帮忙。从耕、种、管、收到加工、流通与文旅，每个环节都有对应的组织方式。" />
        </Reveal>

        <div class="mt-12 flex flex-wrap gap-2" data-stagger>
          <button v-for="z in zones" :key="z" @click="activeZone = z"
            class="px-4 py-2.5 min-h-[40px] rounded-full text-xs font-semibold border transition-all duration-400 cursor-pointer"
            :class="activeZone === z ? 'bg-[#1C1B18] text-[#F7F4EE] border-[#1C1B18]' : 'bg-[#FFFDF9]/60 text-[#5A564E] border-[#1C1B18]/12 hover:border-[#C88A32]'">
            {{ z }}
          </button>
        </div>

        <div class="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3" data-stagger>
          <Reveal v-for="(c, i) in chain" :key="c.k" :delay="i * 60">
            <div class="h-full bg-[#FFFDF9]/75 border border-[#1C1B18]/10 p-4 lift">
              <div class="font-editorial text-3xl font-bold text-[#C88A32] mb-3">{{ c.k }}</div>
              <div class="text-[12px] font-semibold mb-2">{{ c.t }}</div>
              <div class="font-mono text-[9px] text-[#6E6960]">{{ c.p }}</div>
            </div>
          </Reveal>
        </div>

        <div class="mt-12 grid grid-cols-1 md:grid-cols-12 gap-4" data-stagger>
          <Reveal v-for="(p, i) in filtered" :key="p.no" :delay="(i % 3) * 70"
            :class="filtered.length === 1 ? 'md:col-span-12' : 'md:col-span-6 lg:col-span-4'">
            <button @click="goArchive(p)"
              class="group w-full h-full text-left bg-[#FFFDF9] border border-[#1C1B18]/10 p-6 lift cursor-pointer">
              <div class="flex items-center justify-between gap-2 mb-5">
                <span class="font-mono text-[10px] tracking-[0.18em] text-[#8A6324]">{{ p.no }} / {{ p.zoneKey }}</span>
                <ArrowUpRight :size="15" class="text-[#C88A32] arrow-shift" />
              </div>
              <div class="font-editorial text-lg font-bold mb-2 group-hover:text-[#8A6324] transition-colors">{{ p.type }}</div>
              <div class="text-[11px] text-[#5A564E] mb-4">{{ p.zone }}</div>
              <p class="text-[12px] leading-[1.85] text-[#3A3630]">{{ p.effect }}</p>
            </button>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 04 口径与下游入口 -->
    <section class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div class="lg:col-span-5">
            <div class="eyebrow mb-4">DATA NOTE / 口径说明</div>
            <h2 class="display-2">不编数字，也不编名字</h2>
            <p class="lede mt-6">
              这一章的项目主体、机制名称与地理方位都能在公开资料里查到。带农成效用定性描述，不写未经核实的覆盖户数与增收金额，也没有有名有姓的人物故事。首页与附录 A 用同一套教学演示口径。
            </p>
            <RouterLink to="/about#data-notes" class="inline-flex items-center gap-2 mt-7 text-xs font-bold text-[#8A6324] group">
              查看展陈数据口径与来源 <ArrowUpRight :size="15" class="arrow-shift" />
            </RouterLink>
          </div>
          <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RouterLink v-for="n in [
              { to: '/adopt-a-field', k: 'NEXT / 参与', t: '认养一亩田', d: '走一遍从春耕到直邮的示意流程' },
              { to: '/farm-income', k: 'NEXT / 机制', t: '一块地，五笔收入', d: '看清收益靠哪几条路径回到农户' },
              { to: '/products', k: 'RELATED / 产出', t: '吉林风物集市', d: '产地、认证与流通方式' },
              { to: '/about', k: 'RELATED / 依据', t: '长春智库与答辩说明', d: '科教支撑与资料性质' }
            ]" :key="n.to" :to="n.to" class="group bg-[#FFFDF9] border border-[#1C1B18]/10 p-6 lift">
              <div class="font-mono text-[9px] tracking-[0.18em] text-[#8A6324] mb-4">{{ n.k }}</div>
              <div class="font-editorial text-xl font-bold mb-2 group-hover:text-[#8A6324] transition-colors">{{ n.t }}</div>
              <div class="text-[11px] leading-relaxed text-[#5A564E]">{{ n.d }}</div>
            </RouterLink>
          </div>
        </div>
      </Reveal>
    </section>

    <!-- 05 收束 -->
    <section class="bg-[#C88A32]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 flex flex-wrap items-end justify-between gap-8">
        <Reveal>
          <div class="font-mono text-[10px] tracking-[0.22em] text-[#1C1B18]/70 mb-4">03 / 03 · SUMMARY</div>
          <p class="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1B18] max-w-2xl leading-snug">
            技术落在哪片地上，农户的账本就多出哪几笔。
          </p>
        </Reveal>
        <Reveal :delay="120">
          <RouterLink to="/farm-income" class="inline-flex items-baseline gap-3 min-h-[40px] group">
            <span class="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1B18] group-hover:text-[#FFFDF9] transition-colors">看五笔收入怎么来</span>
            <ArrowUpRight :size="22" class="text-[#1C1B18] arrow-shift" />
          </RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
