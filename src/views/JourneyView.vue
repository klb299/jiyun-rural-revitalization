<script setup>
import { ref } from 'vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import Reveal from '../components/editorial/Reveal.vue'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-vue-next'

const currentStep = ref(0)

const steps = [
  {
    no: '01', stage: '第一幕 · 黑土冬养', title: '沃野涵养 · 秸秆免耕覆盖',
    time: '11 月 – 翌年 3 月', location: '松辽平原 / 长春农安实验区',
    desc: '在长达半年的严寒冰雪期，金黄秸秆均匀覆盖在黑土地上，像盖了一层厚棉被，减少春季风蚀水蚀，保持土壤水分与有益微生物活性。这是「梨树模式」的起点，也是一粒米最先得到的庇护。',
    highlight: '黑土有机质蓄力达 4.8%', badge: '土壤保育', icon: '❄'
  },
  {
    no: '02', stage: '第二幕 · 春水唤醒', title: '引江入田 · 长白山雪水灌溉',
    time: '4 月 – 5 月', location: '松花江沿岸 / 饮马河流域灌区',
    desc: '冰雪消融，富含矿物质的长白山源头活水奔涌而来。智能水闸结合物联网液位计精准分流，为万亩秧苗提供清冽的微量元素补给。泡田、打浆、平整秧床，都在这一段时间里完成。',
    highlight: 'pH 6.8 天然弱碱雪水', badge: '生态灌溉', icon: '水'
  },
  {
    no: '03', stage: '第三幕 · 智慧巡耕', title: '科技护航 · 北斗农机与稻蟹共生',
    time: '6 月 – 8 月', location: '长春九台现代农业核心园区',
    desc: '北斗卫星导航带领无人插秧机与植保无人机群协同作业。稻田里放养中华绒螯蟹与稻田鸭，蟹吃虫草、蟹粪肥田、鸭踏浮泥，形成全程零化学农药的生态治虫闭环。',
    highlight: '绿色有机认证 100% 达标', badge: '绿色种养', icon: '蟹'
  },
  {
    no: '04', stage: '第四幕 · 金秋收割', title: '千重稻浪 · 低温低速慢烘',
    time: '9 月 – 10 月', location: '万吨级现代数字粮仓',
    desc: '秋风起，金色稻浪翻滚。联合收割机精准脱粒，原粮直接送入现代化烘干塔，采用 38℃ 低温低速循环烘干工艺，锁住稻谷原始胚芽清香，也把整精米率稳稳抬高。',
    highlight: '整精米率超过 72%', badge: '品质智造', icon: '稻'
  },
  {
    no: '05', stage: '第五幕 · 香飘万家', title: '一袋一码 · 区块链溯源抵京沪粤',
    time: '全年保供', location: '全国千家万户餐桌',
    desc: '每一包吉林大米包装上都印有唯一溯源二维码，消费者扫码即可查看地块经纬度、插秧日期、水质指标及检测报告。从黑土到餐桌的一百八十天，被压缩成一次扫码。',
    highlight: '全生命周期可追溯', badge: '数智溯源', icon: '米'
  }
]

const heroMeta = [
  { k: 'DURATION', v: '约 180 天' },
  { k: 'ACTS', v: '5 幕物候剧情' },
  { k: 'TRACE', v: '一袋一码区块链' }
]

const goToAct = (i) => {
  currentStep.value = i
  document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div>
    <!-- 01 五幕物候：纵向幕次刻度尺，首屏即可点选剧情 -->
    <section class="relative min-h-[100dvh] bg-[#F7F4EE] flex items-center overflow-hidden">
      <div class="absolute inset-0 coord-rule opacity-70 pointer-events-none"></div>
      <div data-parallax="-9" class="absolute -right-[13%] -bottom-[30%] w-[44vw] h-[44vw] min-w-[23.75rem] min-h-[23.75rem] rounded-full border border-[#C88A32]/30 pointer-events-none"></div>
      <div class="absolute -left-16 top-1/4 watermark text-[22vw] leading-none select-none pointer-events-none">米</div>

      <div class="relative z-10 w-full max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="px-3 py-1.5 rounded-full bg-[#2E5A44] text-[#F7F4EE] font-mono text-[0.625rem] tracking-[0.2em] font-bold">CHAPTER 05</span>
            <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#6E6960]">GRAIN ODYSSEY / 一粒米的旅程 · 吉林大米数字生命周期</span>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-7">
            <h1 class="display-1 text-[#1C1B18]" aria-label="一百八十天 从黑土到餐桌">
              <span v-for="(ch, i) in Array.from('一百八十天')" :key="'a' + i" class="kin-char"
                :style="{ animationDelay: (0.12 + i * 0.06) + 's' }">{{ ch }}</span>
              <span class="block whitespace-nowrap text-[#2E5A44]" :style="{ fontSize: '0.72em' }">
                <span v-for="(ch, i) in Array.from('从黑土到餐桌')" :key="'b' + i" class="kin-char"
                  :style="{ animationDelay: (0.48 + i * 0.055) + 's' }">{{ ch }}</span>
              </span>
            </h1>
            <Reveal :delay="580"><p class="font-editorial text-lg sm:text-2xl text-[#5A564E] mt-7">一季稻作，五幕物候剧情</p></Reveal>
            <Reveal :delay="660">
              <p class="lede mt-5 max-w-2xl">
                把一季稻作拆成五个可切换的场景。点击右侧幕次，跟着一粒米经历冬养、春灌、夏耕、秋收与全年保供，读出吉林粳稻品质背后的每一个决定。
              </p>
            </Reveal>
            <Reveal :delay="740">
              <div class="flex flex-wrap gap-3 mt-9">
                <a href="#timeline" class="mag-btn"><span>进入五幕剧情</span><span class="mag-btn__island"><ArrowRight :size="16" /></span></a>
                <a href="#trace" class="mag-btn mag-btn--light"><span>查看溯源档案</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
              </div>
            </Reveal>
            <Reveal :delay="820">
              <div class="grid grid-cols-3 gap-4 mt-12 max-w-lg">
                <div v-for="m in heroMeta" :key="m.k" class="border-t border-[#1C1B18]/25 pt-3">
                  <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#2E5A44]">{{ m.k }}</div>
                  <div class="text-[0.6875rem] mt-1.5 text-[#3A3630]">{{ m.v }}</div>
                </div>
              </div>
            </Reveal>
            <!-- 一百八十天农时进度带 -->
            <Reveal :delay="900">
              <div class="mt-10 max-w-xl">
                <div class="flex h-2 rounded-full overflow-hidden">
                  <span class="flex-[3] bg-[#8EBACB]"></span><span class="flex-[2] bg-[#2E5A44]"></span>
                  <span class="flex-[3] bg-[#C88A32]"></span><span class="flex-[2] bg-[#B83828]"></span>
                  <span class="flex-[2] bg-[#8C583A]"></span>
                </div>
                <div class="flex justify-between font-mono text-[0.5625rem] tracking-[0.14em] text-[#6E6960] mt-2">
                  <span>11 月 冬养</span><span>4 月 春灌</span><span>6 月 夏耕</span><span>9 月 秋收</span><span>全年 保供</span>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal :delay="240" variant="scale" class="lg:col-span-5" data-parallax="-6">
            <div class="bezel">
              <div class="bezel-core p-6 sm:p-8">
                <div class="flex items-center justify-between gap-3 mb-6">
                  <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#6E6960]">ACT INDEX / 五幕剧情</span>
                  <span class="font-mono text-[0.5625rem] tracking-[0.16em] text-[#8A6324]">点击切换</span>
                </div>
                <div class="relative pl-7">
                  <div class="absolute left-[0.3125rem] top-3 bottom-3 w-px bg-[#C88A32]/35"></div>
                  <button v-for="(s, i) in steps" :key="s.no" @click="goToAct(i)"
                    class="relative block w-full text-left py-3.5 group cursor-pointer">
                    <span class="absolute -left-7 top-5 w-2.5 h-2.5 rotate-45 border transition-all duration-500"
                      :class="currentStep === i ? 'bg-[#C88A32] border-[#C88A32] scale-125' : 'bg-[#FFFDF9] border-[#C88A32]/60 group-hover:bg-[#C88A32]'"></span>
                    <div class="flex items-baseline gap-3">
                      <span class="font-mono text-[0.625rem] tracking-[0.16em]" :class="currentStep === i ? 'text-[#8A6324]' : 'text-[#6E6960]'">{{ s.no }}</span>
                      <span class="font-editorial text-lg font-bold group-hover:text-[#8A6324] transition-colors">{{ s.stage }}</span>
                    </div>
                    <div class="text-[0.6875rem] text-[#5A564E] mt-1 pl-8">{{ s.time }} · {{ s.badge }}</div>
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#1C1B18]/10 bg-[#1C1B18] py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[0.625rem] tracking-[0.22em] text-[#F7F4EE]/86 whitespace-nowrap">
            <span>黑土冬养 · 秸秆免耕</span><span class="text-[#C88A32]">✳</span>
            <span>长白山雪水灌溉</span><span class="text-[#C88A32]">✳</span>
            <span>北斗农机与稻蟹共生</span><span class="text-[#C88A32]">✳</span>
            <span>38℃ 低温慢烘 · 一袋一码</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 时间轴 -->
    <section id="timeline" class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
      <Reveal>
        <SectionHead
          index="01 / 04"
          eyebrow="PHENOLOGY TIMELINE / 物候时间轴"
          title="五幕，一季"
          description="从冬养到保供，每一幕都有明确的时间、地点与可核验的技术指标。"
        />
      </Reveal>

      <Reveal :delay="100" class="mt-12">
        <div class="relative">
          <div class="hidden sm:block absolute left-0 right-0 top-[1.4375rem] h-px bg-[#1C1B18]/14"></div>
          <div
            class="hidden sm:block absolute left-0 top-[1.4375rem] h-[2px] bg-[#C88A32] transition-all duration-700"
            :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"
          ></div>
          <div class="grid grid-cols-5 gap-2 sm:gap-4">
            <button
              v-for="(s, i) in steps"
              :key="s.no"
              @click="currentStep = i"
              class="group relative text-center cursor-pointer"
            >
              <div
                class="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-editorial text-sm sm:text-base font-bold border-2 transition-all duration-500"
                :class="i === currentStep
                  ? 'bg-[#1C1B18] text-[#F7F4EE] border-[#1C1B18] scale-110'
                  : i < currentStep
                    ? 'bg-[#C88A32]/15 text-[#C88A32] border-[#C88A32]/45'
                    : 'bg-[#FFFDF9] text-[#6E6960] border-[#1C1B18]/14 group-hover:border-[#C88A32]'"
              >{{ s.icon }}</div>
              <div class="font-mono text-[0.625rem] tracking-[0.14em] mt-3 hidden sm:block"
                :class="i === currentStep ? 'text-[#C88A32]' : 'text-[#6E6960]'">{{ s.no }}</div>
              <div class="text-[0.6875rem] font-semibold mt-1 hidden md:block truncate"
                :class="i === currentStep ? 'text-[#1C1B18]' : 'text-[#5A564E]'">{{ s.stage.split(' · ')[1] }}</div>
            </button>
          </div>
        </div>
      </Reveal>

      <!-- 当前幕详情 -->
      <Reveal :delay="160" class="mt-12">
        <div class="border border-[#1C1B18]/12 bg-[#FFFDF9]/80 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          <div class="lg:col-span-8 p-7 sm:p-10">
            <div class="flex flex-wrap items-center gap-3 mb-6">
              <span class="px-3 py-1 bg-[#C88A32]/12 text-[#8A6324] font-mono text-[0.625rem] tracking-[0.18em]">{{ steps[currentStep].badge }}</span>
              <span class="font-mono text-[0.625rem] tracking-[0.16em] text-[#6E6960]">{{ steps[currentStep].stage }}</span>
            </div>
            <h3 class="display-2 mb-5">{{ steps[currentStep].title }}</h3>
            <p class="lede max-w-2xl">{{ steps[currentStep].desc }}</p>
            <div class="mt-8 p-5 border-l-2 border-[#C88A32] bg-[#EFECE6]/60 flex items-start gap-4">
              <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#6E6960] pt-1">KEY METRIC</span>
              <div>
                <div class="font-editorial text-lg font-bold text-[#1C1B18]">{{ steps[currentStep].highlight }}</div>
                <div class="caption mt-1">长春农高区监测认证 / 教学展示指标</div>
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 mt-9 pt-6 border-t border-[#1C1B18]/10">
              <div class="font-mono text-[0.6875rem] text-[#5A564E]">{{ steps[currentStep].time }} · {{ steps[currentStep].location }}</div>
              <div class="flex items-center gap-2">
                <button
                  @click="currentStep = Math.max(0, currentStep - 1)"
                  :disabled="currentStep === 0"
                  class="px-4 py-2.5 min-h-[2.5rem] rounded-lg border border-[#1C1B18]/16 text-xs font-semibold disabled:opacity-35 cursor-pointer hover:border-[#C88A32] transition-colors flex items-center gap-1.5"
                ><ArrowLeft :size="14" /> 上一幕</button>
                <button
                  @click="currentStep = Math.min(steps.length - 1, currentStep + 1)"
                  :disabled="currentStep === steps.length - 1"
                  class="px-4 py-2.5 min-h-[2.5rem] rounded-lg bg-[#1C1B18] text-[#F7F4EE] text-xs font-semibold disabled:opacity-35 cursor-pointer hover:bg-[#C88A32] transition-colors flex items-center gap-1.5"
                >下一幕 <ArrowRight :size="14" /></button>
              </div>
            </div>
          </div>

          <!-- 溯源证书 -->
          <div class="lg:col-span-4 surface-ink p-7 sm:p-10 flex flex-col justify-between">
            <div>
              <div class="eyebrow mb-6">TRACEABILITY LABEL</div>
              <div class="w-16 h-16 rounded-full border border-[#C88A32]/60 flex items-center justify-center font-editorial text-2xl text-[#C88A32] mb-6">
                {{ steps[currentStep].icon }}
              </div>
              <h4 class="font-editorial text-xl font-bold text-[#F7F4EE] mb-2">长春农高区监测认证</h4>
              <p class="font-mono text-[0.6875rem] text-[#8A6324]">ID: JL-RICE-2026-0{{ currentStep + 1 }}</p>
              <p class="text-[0.75rem] leading-[1.9] text-[#F7F4EE]/90 mt-6">
                每一批次绑定地块编号、农事日期与检测报告。扫码即可回看本幕对应的灌溉、施肥、收割与烘干记录。
              </p>
            </div>
            <div class="mt-9 pt-5 border-t border-[#F7F4EE]/16 flex items-center justify-between">
              <span class="font-mono text-[0.625rem] text-[#F7F4EE]/80">BLOCKCHAIN VERIFIED</span>
              <span class="w-2 h-2 rounded-full bg-[#C88A32]"></span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>

    <!-- 图文与速览 -->
    <section id="trace" class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <SectionHead
            index="02 / 04"
            eyebrow="QUALITY ARCHIVE / 品质档案"
            title="好米不是偶然，是每一步都不肯将就"
          />
        </Reveal>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mt-12">
          <Reveal class="lg:col-span-5">
            <FigurePlate
              src="/photos/green-field.jpg"
              alt="稻穗与积温周期图版"
              index="PLATE 04"
              caption="东北长达十五小时的夏季日照与十五度以上昼夜温差，共同决定支链淀粉与芳香物质的积累。"
              credit="ONE GRAIN OF RICE"
            />
          </Reveal>
          <div class="lg:col-span-7">
            <Reveal><p class="lede">
              吉林粳稻的食味值来自一整条链：黑土供给有机质，长白山雪水提供矿物质，超长日照积累糖分，低温慢烘保留胚芽清香，一袋一码让所有环节可被回看。展馆把这条链拆成五幕，是为了说明品质不是某一个环节的功劳。
            </p></Reveal>
            <div class="mt-9 divide-y divide-[#1C1B18]/10 border-y border-[#1C1B18]/10">
              <button
                v-for="(s, i) in steps"
                :key="s.no"
                @click="goToAct(i)"
                class="w-full grid grid-cols-[52px_1fr_auto] items-center gap-4 py-4 text-left group cursor-pointer hover:bg-[#FFFDF9]/50 transition-colors px-2"
              >
                <span class="font-mono text-xs" :class="i === currentStep ? 'text-[#8A6324]' : 'text-[#6E6960]'">{{ s.no }}</span>
                <span>
                  <span class="block text-sm font-semibold group-hover:text-[#C88A32] transition-colors">{{ s.title }}</span>
                  <span class="caption block mt-0.5">{{ s.time }}</span>
                </span>
                <span class="font-mono text-[0.6875rem] text-[#6E6960] hidden sm:block">{{ s.highlight }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 收束 -->
    <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead
          index="03 / 04"
          eyebrow="EPILOGUE / 结语"
          title="从一粒米，回到一片土"
          description="旅程的终点是餐桌，起点仍是那层需要两百年才能长出一厘米的黑土。"
        />
      </Reveal>
      <Reveal :delay="100">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
          <div v-for="n in [
            { k: 'SOIL', v: '4.82%', d: '表层有机质，决定起点' },
            { k: 'TIME', v: '180 天', d: '从泡田到包装的周期' },
            { k: 'TRACE', v: '1 码', d: '回看全生命周期' }
          ]" :key="n.k" class="border-t border-[#1C1B18]/16 pt-5">
            <div class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324] mb-2">{{ n.k }}</div>
            <div class="font-editorial text-3xl font-bold mb-1.5">{{ n.v }}</div>
            <div class="caption">{{ n.d }}</div>
          </div>
        </div>
      </Reveal>
    </section>

    <section class="surface-ink">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
        <Reveal>
          <div class="eyebrow mb-4">04 / 04 · NEXT CHAPTER</div>
          <p class="text-[0.8125rem] leading-[2] text-[#F7F4EE]/90 max-w-2xl">同一片黑土，冬天还有另一副面孔。下一章走进查干湖冰面，看千年渔猎仪轨如何与生态永续并行。</p>
        </Reveal>
        <Reveal :delay="120">
          <RouterLink to="/chagan-lake" class="inline-flex items-baseline gap-3 min-h-[2.5rem] group">
            <span class="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F4EE] group-hover:text-[#C88A32] transition-colors">查干湖冬捕生态非遗馆</span>
            <ArrowUpRight :size="22" class="text-[#C88A32] arrow-shift" />
          </RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
