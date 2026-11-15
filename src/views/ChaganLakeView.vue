<script setup>
import { ref } from 'vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import StatBlock from '../components/editorial/StatBlock.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import Reveal from '../components/editorial/Reveal.vue'
import { ArrowUpRight } from 'lucide-vue-next'

const activeCustom = ref(0)

const customs = [
  {
    no: '01', title: '祭湖醒网 · 千年契约', phase: '冬捕序幕 / 每年 12 月末', icon: '火',
    desc: '查干湖冬捕源于辽金时期。身着传统盛装的鱼把头率领渔工，在零下二十余度的冰湖之上举行「祭湖 · 醒网」古老仪式，表达对自然馈赠的感恩与敬畏。',
    detail: '国家级非物质文化遗产名录。遵循"猎捕有度、取之有时"的生态古训。',
    tag: '仪轨'
  },
  {
    no: '02', title: '马拉绞盘 · 冰下走网', phase: '核心技艺 / 千米巨网穿越冰层', icon: '马',
    desc: '完全不借助燃油发动机。依靠鱼把头观冰识鱼、人工凿孔，四匹蒙古马在冰面拉动木质绞盘，牵引长达两千米的冬捕大网在厚达一米的冰层下无声潜行。',
    detail: '古法机械动力工程奇迹。冰下走网需穿过上百个冰眼，分毫不差。',
    tag: '技艺'
  },
  {
    no: '03', title: '红日破冰 · 万尾腾跃', phase: '高潮时刻 / 单网出鱼数十万斤', icon: '鱼',
    desc: '随着大网缓缓拉出冰口，数十万尾银光闪烁的野生胖头鱼在冰雾中腾跃，水汽凝结成霜。数以万计的海内外游客汇聚冰湖，共同见证这一丰收盛景。',
    detail: '单网最高产量达数十万斤，屡次打破吉尼斯世界纪录。',
    tag: '盛景'
  },
  {
    no: '04', title: '抓大放小 · 生态永续', phase: '现代保护 / 六寸大眼网护佑幼鱼', icon: '生',
    desc: '严格使用「六寸网孔」，只捕五年以上成熟成鱼，让幼小鱼苗自由穿网继续繁衍。配合增殖放流与湿地水质净化，让「年年有鱼」不是一句祝愿，而是一套制度。',
    detail: '冰天雪地也是金山银山，前提是先把生态账算清楚。',
    tag: '永续'
  }
]

const stats = [
  { value: '500+', label: '平方公里水域', note: '吉林松原 / 查干湖湿地', index: 'L-01', accent: '#A9701F' },
  { value: '0.8–1.2', label: '米 / 冬季冰层厚度', note: '足以承载马拉绞盘作业', index: 'L-02', accent: 'var(--accent-water-ink)' },
  { value: '100万+', label: '年游客接待人次', note: '冰雪文旅与生态研学', index: 'L-03', accent: '#2E5A44' },
  { value: '六寸', label: '网孔下限', note: '抓大放小 / 只捕成鱼', index: 'L-04', accent: '#B83828' }
]

const heroMeta = [
  { k: 'HERITAGE', v: '国家级非物质文化遗产' },
  { k: 'ORIGIN', v: '辽金时期渔猎传统' },
  { k: 'SEASON', v: '每年 12 月末开网' }
]
</script>

<template>
  <div>
    <!-- 01 冰湖：放射冰裂 + 四段仪轨刻度 -->
    <section class="relative min-h-[100dvh] overflow-hidden flex items-center"
      style="background: radial-gradient(85% 110% at 76% 18%, #24505D 0%, #16323C 42%, #0F2028 100%)">
      <div class="absolute inset-0 coord-rule opacity-30 pointer-events-none"></div>

      <!-- 右侧冰面同心裂 -->
      <div data-parallax="-10" class="absolute -right-[10%] top-1/2 -translate-y-1/2 w-[52vw] h-[52vw] min-w-[26.25rem] min-h-[26.25rem] pointer-events-none">
        <div class="absolute inset-0 rounded-full border border-[#CFE3E8]/18"></div>
        <div class="absolute inset-[9%] rounded-full border border-[#CFE3E8]/14"></div>
        <div class="absolute inset-[19%] rounded-full border border-[#CFE3E8]/12"></div>
        <div class="absolute inset-[30%] rounded-full border border-[#C88A32]/35"></div>
        <svg viewBox="0 0 200 200" class="absolute inset-0 w-full h-full opacity-45">
          <g stroke="#CFE3E8" stroke-width="0.55" fill="none">
            <path d="M100 100 L100 6 M100 100 L178 38 M100 100 L194 118 M100 100 L142 190 M100 100 L44 186 M100 100 L4 128 M100 100 L18 44 M100 100 L62 12"></path>
            <path d="M100 100 L138 22 M100 100 L186 78 M100 100 L172 168 M100 100 L88 196 M100 100 L22 168 M100 100 L2 82 M100 100 L44 20"></path>
          </g>
        </svg>
        <div class="absolute inset-[40%] rounded-full bg-[#C88A32] grid place-items-center shadow-[0_0_70px_rgba(200,138,50,.4)]">
          <span class="font-editorial text-[#1C1B18] text-3xl sm:text-5xl font-bold">冬捕</span>
        </div>
      </div>

      <div class="relative z-10 w-full max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="px-3 py-1.5 rounded-full bg-[#C88A32] text-[#1C1B18] font-mono text-[0.625rem] tracking-[0.2em] font-bold">CHAPTER 06</span>
            <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#CFE3E8]/65">INTANGIBLE HERITAGE / 查干湖冬捕生态非遗馆</span>
          </div>
        </Reveal>

        <div class="max-w-3xl">
          <h1 class="display-1 text-[#F7F4EE]" aria-label="冰湖腾鱼 千年渔猎焕新生">
            <span v-for="(ch, i) in Array.from('冰湖腾鱼')" :key="'a' + i" class="kin-char"
              :style="{ animationDelay: (0.12 + i * 0.07) + 's' }">{{ ch }}</span>
            <span class="block whitespace-nowrap text-[#C88A32]" :style="{ fontSize: '0.62em' }">
              <span v-for="(ch, i) in Array.from('千年渔猎焕新生')" :key="'b' + i" class="kin-char"
                :style="{ animationDelay: (0.46 + i * 0.05) + 's' }">{{ ch }}</span>
            </span>
          </h1>
          <Reveal :delay="560"><p class="font-editorial text-lg sm:text-2xl text-[#CFE3E8]/85 mt-7">圣水湖畔雪映红，一网拉出半个冬天</p></Reveal>
          <Reveal :delay="640">
            <p class="lede text-[#CFE3E8]/85 mt-5 max-w-2xl">
              探寻中国北方现存唯一的古老渔猎部落传奇。祭湖醒网、马拉绞盘、万尾腾跃、抓大放小，四段仪轨串起一套关于「取之有度」的生态智慧。
            </p>
          </Reveal>
          <Reveal :delay="720">
            <div class="flex flex-wrap gap-3 mt-9">
              <a href="#rites" class="mag-btn mag-btn--gold"><span>进入四段仪轨</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
              <a href="#ecology" class="mag-btn mag-btn--light"><span>阅读生态解读</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
            </div>
          </Reveal>

          <!-- 四段仪轨刻度，首屏可切换 -->
          <Reveal :delay="800">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 max-w-2xl">
              <button v-for="(c, i) in customs" :key="c.no" @click="activeCustom = i"
                class="text-left pt-3 border-t-2 transition-all duration-500 cursor-pointer group"
                :class="activeCustom === i ? 'border-[#C88A32]' : 'border-[#CFE3E8]/25 hover:border-[#C88A32]/60'">
                <div class="font-mono text-[0.5625rem] tracking-[0.18em] mb-1.5" :class="activeCustom === i ? 'text-[#8A6324]' : 'text-[#CFE3E8]/50'">{{ c.no }} / {{ c.tag }}</div>
                <div class="text-[0.75rem] font-semibold" :class="activeCustom === i ? 'text-[#F7F4EE]' : 'text-[#CFE3E8]/70 group-hover:text-[#F7F4EE]'">{{ c.title.split(' · ')[0] }}</div>
              </button>
            </div>
          </Reveal>
          <Reveal :delay="880">
            <div class="grid grid-cols-3 gap-4 mt-10 max-w-lg">
              <div v-for="m in heroMeta" :key="m.k" class="border-t border-[#CFE3E8]/25 pt-3">
                <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#8A6324]">{{ m.k }}</div>
                <div class="text-[0.6875rem] mt-1.5 text-[#CFE3E8]/80">{{ m.v }}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#CFE3E8]/15 bg-[#0B1B22]/75 py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[0.625rem] tracking-[0.22em] text-[#CFE3E8]/70 whitespace-nowrap">
            <span>祭湖醒网 · 国家级非遗</span><span class="text-[#C88A32]">✳</span>
            <span>马拉绞盘 / 冰下走网</span><span class="text-[#C88A32]">✳</span>
            <span>抓大放小 / 六寸网孔</span><span class="text-[#C88A32]">✳</span>
            <span>冰天雪地也是金山银山</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 数据 -->
    <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead
          index="01 / 04"
          eyebrow="IN NUMBERS / 冰湖尺度"
          title="一片湖，撑起一整个冬季"
        />
      </Reveal>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mt-12">
        <Reveal v-for="(s, i) in stats" :key="s.label" :delay="i * 80">
          <StatBlock v-bind="s" />
        </Reveal>
      </div>
    </section>

    <!-- 四段仪轨 -->
    <section id="rites" class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <SectionHead
            index="02 / 04"
            eyebrow="FOUR RITES / 冬捕仪轨"
            title="四段仪轨，一套生态秩序"
            description="点击任意卡片切换详情。四段仪轨并非并列的表演，而是从敬畏、技艺、丰收到克制的一条完整叙事。"
          />
        </Reveal>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-12">
          <Reveal v-for="(c, i) in customs" :key="c.no" :delay="i * 90">
            <button
              @click="activeCustom = i"
              class="group w-full h-full text-left border p-6 lift cursor-pointer"
              :class="activeCustom === i
                ? 'border-[#C88A32] bg-[#FFFDF9]'
                : 'border-[#1C1B18]/10 bg-[#FFFDF9]/55'"
            >
              <div class="flex items-start justify-between mb-8">
                <span class="w-10 h-10 rounded-full border border-[#1C1B18]/16 flex items-center justify-center font-editorial text-lg"
                  :class="activeCustom === i ? 'bg-[#C88A32] text-[#1C1B18] border-[#C88A32]' : 'text-[#5A564E]'">{{ c.icon }}</span>
                <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#6E6960]">{{ c.no }}</span>
              </div>
              <h3 class="display-3 group-hover:text-[#C88A32] transition-colors">{{ c.title }}</h3>
              <p class="caption mt-3">{{ c.phase }}</p>
              <div class="mt-6 pt-4 border-t border-[#1C1B18]/10 flex items-center justify-between">
                <span class="px-2 py-1 bg-[#EFECE6] text-[0.625rem] font-mono text-[#5A564E]">{{ c.tag }}</span>
                <ArrowUpRight :size="15" class="text-[#C88A32] arrow-shift" />
              </div>
            </button>
          </Reveal>
        </div>

        <Reveal :delay="140" class="mt-8">
          <div class="border border-[#1C1B18]/12 bg-[#FFFDF9]/85 p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div class="lg:col-span-8">
              <div class="flex items-center gap-3 mb-5">
                <span class="font-mono text-[0.6875rem] tracking-[0.18em] text-[#8A6324]">RITE {{ customs[activeCustom].no }}</span>
                <span class="h-px w-12 bg-[#C88A32]/50"></span>
                <span class="caption">{{ customs[activeCustom].phase }}</span>
              </div>
              <h3 class="display-2 mb-5">{{ customs[activeCustom].title }}</h3>
              <p class="lede">{{ customs[activeCustom].desc }}</p>
            </div>
            <div class="lg:col-span-4 border-l-0 lg:border-l border-[#1C1B18]/10 lg:pl-8 pt-6 lg:pt-0 border-t lg:border-t-0">
              <div class="eyebrow mb-4">ECOLOGICAL CODE</div>
              <p class="font-editorial text-lg leading-[1.85] text-[#1C1B18]">{{ customs[activeCustom].detail }}</p>
              <div class="mt-8 font-mono text-[0.625rem] tracking-[0.16em] text-[#6E6960]">查干湖国家非遗典藏 / 教学整理</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- 生态与文旅 -->
    <section id="ecology" class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <Reveal class="lg:col-span-5">
          <FigurePlate
            src="/photos/winter.jpg"
            alt="冰湖同心裂艺术图版"
            index="PLATE 05"
            caption="六寸网孔、增殖放流与湿地净化，共同决定这片水面能否年年有鱼。"
            credit="WINTER FISHERY"
          />
        </Reveal>
        <div class="lg:col-span-7">
          <Reveal>
            <SectionHead
              index="03 / 04"
              eyebrow="ECOLOGY & ECONOMY / 生态与文旅"
              title="冷资源，撬动热经济"
            />
          </Reveal>
          <Reveal :delay="100"><p class="lede mt-7">
            查干湖冬捕早已不只是一项捕捞技艺。民俗摄影、冰雪冬令营、冷链直发与生态研学围绕同一张网展开，形成数十亿元级的乡村文旅产业链。但所有收益的前提，是"抓大放小"这条从未让位的古训。
          </p></Reveal>
          <Reveal :delay="170">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-9">
              <div v-for="n in [
                { k: 'NET', v: '六寸网孔', d: '只捕五年以上成鱼' },
                { k: 'RELEASE', v: '增殖放流', d: '持续补充鱼类种群' },
                { k: 'WETLAND', v: '湿地净化', d: '维护大水面水质' }
              ]" :key="n.k" class="border-t border-[#1C1B18]/14 pt-4">
                <div class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324]">{{ n.k }}</div>
                <div class="font-editorial text-lg font-bold mt-1.5">{{ n.v }}</div>
                <div class="caption mt-1">{{ n.d }}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <section class="surface-ink">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
        <Reveal>
          <div class="eyebrow mb-4">04 / 04 · NEXT CHAPTER</div>
          <p class="text-[0.8125rem] leading-[2] text-[#F7F4EE]/90 max-w-2xl">冬捕是东北一年里最冷的一幕，而农时从不因寒冷停下。下一章把二十四个节气摊开，看黑土如何按时间耕作。</p>
        </Reveal>
        <Reveal :delay="120">
          <RouterLink to="/solar-terms" class="inline-flex items-baseline gap-3 min-h-[2.5rem] group">
            <span class="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F4EE] group-hover:text-[#C88A32] transition-colors">二十四节气农耕物候谱</span>
            <ArrowUpRight :size="22" class="text-[#C88A32] arrow-shift" />
          </RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
