<script setup>
import { ref } from 'vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import Reveal from '../components/editorial/Reveal.vue'
import { ArrowUpRight } from 'lucide-vue-next'

const activeSeason = ref('spring')
const seasons = [
  { id: 'spring', name: '春生', sub: '破冰起垄', icon: '春', color: '#2E5A44' },
  { id: 'summer', name: '夏长', sub: '碧浪巡田', icon: '夏', color: '#C88A32' },
  { id: 'autumn', name: '秋收', sub: '金穗归仓', icon: '秋', color: '#B83828' },
  { id: 'winter', name: '冬藏', sub: '秸秆覆土', icon: '冬', color: '#8C583A' }
]

const seasonNotes = {
  spring: '冻土回升、雪水入田。一整年的节奏，从温室里的第一盘秧苗开始。',
  summer: '日照最长、温差渐起。稻株分蘖、抽穗、灌浆，黑土把养分一点点交出去。',
  autumn: '昼夜温差拉到十五度以上，米粒开始积累风味，收割与低温慢烘紧接着上场。',
  winter: '田面休耕、秸秆覆土。看似停摆的季节，其实是土壤微生物最安静的工作期。'
}

const solarTermsData = {
  spring: [
    { term: '立春 2.4', title: '大地解冻 · 选种育苗', act: '在温室大棚内进行耐寒粳稻育秧，浸种催芽，准备春耕底肥。' },
    { term: '雨水 2.19', title: '春润黑土 · 农机检修', act: '长春周边农机合作社全面调试北斗无人农机与精密播种机。' },
    { term: '惊蛰 3.5', title: '万物萌动 · 适温保墒', act: '利用秸秆覆盖阻滞土壤水分蒸发，测定黑土表层地温。' },
    { term: '春分 3.20', title: '昼夜均分 · 平整水田', act: '引松花江与饮马河活水泡田打浆，构建平整秧床。' },
    { term: '清明 4.4', title: '风和日丽 · 抢播玉米', act: '黄金玉米带大面积机械化精准单粒点播，铺设滴灌管带。' },
    { term: '谷雨 4.19', title: '雨生百谷 · 秧苗初插', act: '万亩智慧水田开始插秧作业，稻田放养幼蟹构建共生微生态。' }
  ],
  summer: [
    { term: '立夏 5.5', title: '春华初敛 · 分蘖旺盛', act: '水稻进入黄金分蘖期，植保无人机实施叶面微量元素精准追肥。' },
    { term: '小满 5.20', title: '麦粒初满 · 浅水勤灌', act: '实施科学浅水湿润灌溉，促进稻株根系向深层黑土下扎。' },
    { term: '芒种 6.5', title: '拔节孕穗 · 稻蟹共荣', act: '田间放养的中华绒螯蟹除虫除草，排泄物为水稻提供天然有机肥。' },
    { term: '夏至 6.21', title: '日长至极 · 强光合生', act: '东北长达十五小时日照为作物积累高糖分与高淀粉优质风味。' },
    { term: '小暑 7.6', title: '温风始至 · 抽穗扬花', act: '水稻开出洁白微小的稻花，进入决定整精米结实率的黄金期。' },
    { term: '大暑 7.22', title: '暑气蒸腾 · 灌浆关键', act: '黑土地昼夜温差加大，支链淀粉与芳香化合物高效合成。' }
  ],
  autumn: [
    { term: '立秋 8.7', title: '禾秀垂首 · 灌浆成熟', act: '稻穗逐渐变黄下垂，田间停止灌水准备落干晾田。' },
    { term: '处暑 8.22', title: '清风徐来 · 籽粒蜡熟', act: '有机物迅速由叶鞘向籽粒转移，米粒晶莹剔透度持续提升。' },
    { term: '白露 9.7', title: '凝露为白 · 稻香四溢', act: '昼夜温差达到十五度以上，锁住稻谷原始清香与胚芽营养。' },
    { term: '秋分 9.22', title: '丰收节 · 开镰收割', act: '全省迎来丰收，大型智能收割机全速推进，稻浪翻滚。' },
    { term: '寒露 10.8', title: '收割尾声 · 低温慢烘', act: '原粮进入现代烘干塔，38℃ 温和慢烘，确保食味值稳定。' },
    { term: '霜降 10.23', title: '气肃霜凝 · 颗粒归仓', act: '万吨级数字粮仓气调入库，完成全省秋粮收购与国家储备。' }
  ],
  winter: [
    { term: '立冬 11.7', title: '万物伏藏 · 秸秆粉碎', act: '实施梨树模式，将玉米秸秆粉碎均匀覆盖在黑土表面。' },
    { term: '小雪 11.22', title: '初雪落野 · 黑土静养', act: '白雪与秸秆形成双重防护层，保护深层土壤有益微生物菌群。' },
    { term: '大雪 12.6', title: '严冬封江 · 冰雪经济', act: '松花江畔雾凇晶莹，长春各大滑雪场与冰雪文旅全面开板。' },
    { term: '冬至 12.21', title: '数九寒天 · 冬捕起网', act: '查干湖冬捕正式开锣，万尾鲜鱼跃出冰面直发全国。' },
    { term: '小寒 1.5', title: '冻透三尺 · 粮安天下', act: '吉林大米依托全国冷链网络与电商直播，热销千家万户年夜饭。' },
    { term: '大寒 1.20', title: '严寒尽头 · 谋划新春', act: '农科专家深入乡村开展冬训，长春智库谋划新一年丰产蓝图。' }
  ]
}

</script>

<template>
  <div>
    <!-- 01 四季色环：conic 四色 + 24 节气刻度，点击切换季节 -->
    <section class="relative min-h-[100dvh] bg-[#F7F4EE] flex items-center overflow-hidden">
      <div class="absolute inset-0 coord-rule opacity-70 pointer-events-none"></div>
      <div class="absolute right-[4%] top-[14%] watermark text-[14vw] leading-none select-none pointer-events-none opacity-60">时</div>

      <div class="relative z-10 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="px-3 py-1.5 rounded-full bg-[#B83828] text-[#FFFDF9] font-mono text-[10px] tracking-[0.2em] font-bold">CHAPTER 07</span>
            <span class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960]">SOLAR TERMS / 二十四节气农耕物候谱</span>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-7">
            <h1 class="display-1 text-[#1C1B18]" aria-label="天地农时 写在黑土上">
              <span v-for="(ch, i) in Array.from('天地农时')" :key="'a' + i" class="kin-char"
                :style="{ animationDelay: (0.12 + i * 0.07) + 's' }">{{ ch }}</span>
              <span class="block whitespace-nowrap text-[#B83828]" :style="{ fontSize: '0.8em' }">
                <span v-for="(ch, i) in Array.from('写在黑土上')" :key="'b' + i" class="kin-char"
                  :style="{ animationDelay: (0.46 + i * 0.06) + 's' }">{{ ch }}</span>
              </span>
            </h1>
            <Reveal :delay="560"><p class="font-editorial text-lg sm:text-2xl text-[#5A564E] mt-7">春生、夏长、秋收、冬藏</p></Reveal>
            <Reveal :delay="640">
              <p class="lede mt-5 max-w-2xl">
                东北一年只有一季稻作，所以每个节气都格外要紧。这里把二十四节气与吉林农事一一对应，看千年农耕智慧如何与现代农业气象、北斗农机和黑土保育叠在一起。
              </p>
            </Reveal>
            <Reveal :delay="720">
              <div class="flex flex-wrap gap-3 mt-9">
                <a href="#seasons" class="mag-btn"><span>浏览四季物候</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
                <a href="#index" class="mag-btn mag-btn--light"><span>查看全年索引</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
              </div>
            </Reveal>
            <Reveal :delay="800">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 max-w-2xl">
                <button v-for="s in seasons" :key="s.id" @click="activeSeason = s.id"
                  class="group text-left p-4 border transition-all duration-500 cursor-pointer lift"
                  :class="activeSeason === s.id ? 'border-[#1C1B18] bg-[#FFFDF9]' : 'border-[#1C1B18]/12 bg-[#FFFDF9]/50'">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="w-2.5 h-2.5 rounded-full" :style="{ background: s.color }"></span>
                    <span class="font-editorial text-lg font-bold">{{ s.name }}</span>
                  </div>
                  <div class="text-[11px] text-[#5A564E]">{{ s.sub }}</div>
                </button>
              </div>
            </Reveal>
          </div>

          <!-- 四季色环 -->
          <Reveal :delay="240" variant="scale" class="lg:col-span-5" data-parallax="-7">
            <div class="relative w-full max-w-[400px] mx-auto aspect-square">
              <div class="absolute inset-0 rounded-full"
                style="background: conic-gradient(from -45deg, #2E5A44 0deg 90deg, #C88A32 90deg 180deg, #B83828 180deg 270deg, #8C583A 270deg 360deg); mask: radial-gradient(circle, transparent 57%, #000 58%); -webkit-mask: radial-gradient(circle, transparent 57%, #000 58%)"></div>
              <div class="absolute inset-[6%] rounded-full"
                style="background: repeating-conic-gradient(from 0deg, rgba(28,27,24,.55) 0deg 0.7deg, transparent 0.7deg 15deg); mask: radial-gradient(circle, transparent 91%, #000 92%); -webkit-mask: radial-gradient(circle, transparent 91%, #000 92%)"></div>
              <div class="absolute inset-[16%] rounded-full border border-[#1C1B18]/12"></div>
              <div class="absolute inset-[28%] rounded-full bg-[#FFFDF9] shadow-[0_24px_60px_-30px_rgba(28,27,24,.45)] grid place-items-center text-center p-5">
                <div>
                  <div class="font-mono text-[9px] tracking-[0.22em] text-[#6E6960] mb-3">CURRENT SEASON</div>
                  <div class="font-editorial text-4xl font-bold" :style="{ color: seasons.find(s => s.id === activeSeason)?.color }">
                    {{ seasons.find(s => s.id === activeSeason)?.name }}
                  </div>
                  <div class="text-xs mt-2 text-[#5A564E]">{{ seasons.find(s => s.id === activeSeason)?.sub }}</div>
                  <div class="text-[11px] leading-relaxed text-[#3A3630] mt-4">{{ seasonNotes[activeSeason] }}</div>
                </div>
              </div>
              <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[0.18em] text-[#6E6960] whitespace-nowrap">24 SOLAR TERMS / 全年农事刻度</div>
            </div>
          </Reveal>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#1C1B18]/10 bg-[#1C1B18] py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[10px] tracking-[0.22em] text-[#F7F4EE]/86 whitespace-nowrap">
            <span>立春 · 雨水 · 惊蛰 · 春分 · 清明 · 谷雨</span><span class="text-[#C88A32]">✳</span>
            <span>立夏 · 小满 · 芒种 · 夏至 · 小暑 · 大暑</span><span class="text-[#C88A32]">✳</span>
            <span>立秋 · 处暑 · 白露 · 秋分 · 寒露 · 霜降</span><span class="text-[#C88A32]">✳</span>
            <span>立冬 · 小雪 · 大雪 · 冬至 · 小寒 · 大寒</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 四季切换 -->
    <section id="seasons" class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
      <Reveal>
        <SectionHead
          index="01 / 04"
          eyebrow="FOUR SEASONS / 四季"
          title="一季稻作，四个章节"
          :description="seasonNotes[activeSeason]"
        />
      </Reveal>

      <Reveal :delay="90" class="mt-10">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            v-for="(s, i) in seasons"
            :key="s.id"
            @click="activeSeason = s.id"
            class="group text-left border p-5 sm:p-6 cursor-pointer transition-all duration-500"
            :class="activeSeason === s.id
              ? 'border-[#1C1B18] bg-[#1C1B18]'
              : 'border-[#1C1B18]/12 bg-[#FFFDF9]/60 hover:border-[#C88A32]'"
          >
            <div class="flex items-start justify-between mb-5">
              <span class="font-editorial text-3xl font-bold"
                :class="activeSeason === s.id ? 'text-[#C88A32]' : 'text-[#1C1B18]'">{{ s.icon }}</span>
              <span class="font-mono text-[10px] tracking-[0.18em]"
                :class="activeSeason === s.id ? 'text-[#F7F4EE]/80' : 'text-[#6E6960]'">0{{ i + 1 }}</span>
            </div>
            <div class="font-editorial text-xl font-bold"
              :class="activeSeason === s.id ? 'text-[#F7F4EE]' : 'text-[#1C1B18]'">{{ s.name }}</div>
            <div class="caption mt-1.5"
              :class="activeSeason === s.id ? 'text-[#F7F4EE]/80' : ''">{{ s.sub }}</div>
            <div class="mt-5 h-[3px] w-full origin-left transition-transform duration-500"
              :style="{ backgroundColor: s.color, transform: activeSeason === s.id ? 'scaleX(1)' : 'scaleX(0.18)' }"></div>
          </button>
        </div>
      </Reveal>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
        <Reveal v-for="(t, i) in solarTermsData[activeSeason]" :key="t.term" :delay="(i % 3) * 80" class="h-full">
          <article class="h-full border border-[#1C1B18]/10 bg-[#FFFDF9]/70 p-6 lift">
            <div class="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[#1C1B18]/10">
              <span class="font-mono text-[12px] font-bold text-[#8A6324]">{{ t.term }}</span>
              <span class="caption">{{ seasons.find(s => s.id === activeSeason).name }} / 物候节点</span>
            </div>
            <h3 class="font-editorial text-lg font-bold mb-3">{{ t.title }}</h3>
            <p class="body-copy text-[13px]!">{{ t.act }}</p>
          </article>
        </Reveal>
      </div>
    </section>

    <!-- 图文与农谚 -->
    <section class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <Reveal class="lg:col-span-5">
            <FigurePlate
              src="/art/seasons.svg"
              alt="二十四节气色环图版"
              index="PLATE 06"
              caption="每个扇区六个节气，构成黑土农事的最小时间单位。"
              credit="AGRICULTURAL CALENDAR"
            />
          </Reveal>
          <div class="lg:col-span-7">
            <Reveal>
              <SectionHead
                index="02 / 04"
                eyebrow="FARMING WISDOM / 农时与科技"
                title="老谚语，新传感器"
              />
            </Reveal>
            <Reveal :delay="100"><p class="lede mt-7">
              "清明忙种麦，谷雨种大田"这类谚语，本质是对地温、墒情与积温的长期统计。今天这些经验被拆成可测量的参数，由北斗农机、物联网液位计与植保无人机执行，但时间坐标仍然是二十四节气。
            </p></Reveal>
            <Reveal :delay="170">
              <div class="mt-9 border-l-2 border-[#C88A32] bg-[#FFFDF9]/70 p-6">
                <div class="eyebrow mb-3">FARMER'S ALMANAC</div>
                <p class="font-editorial text-xl sm:text-2xl leading-[1.8] text-[#1C1B18]">
                  春争日，夏争时。<br />万物生长靠节气，颗粒归仓靠黑土。
                </p>
                <p class="caption mt-4">吉林中部农区流传的农事谚语 / 展馆整理</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>

    <!-- 全年索引 -->
    <section id="index" class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead
          index="03 / 04"
          eyebrow="FULL INDEX / 全年索引"
          title="二十四条农事注脚"
          description="点击任意季节标题可切换上方卡片内容，快速回看对应物候。"
        />
      </Reveal>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 mt-12">
        <Reveal v-for="(s, i) in seasons" :key="s.id" :delay="i * 80">
          <div class="border-t border-[#1C1B18]/14 pt-6 pb-8">
            <button @click="activeSeason = s.id" class="group flex items-baseline gap-3 mb-4 cursor-pointer">
              <span class="font-editorial text-2xl font-bold" :style="{ color: s.color }">{{ s.name }}</span>
              <span class="caption group-hover:text-[#8A6324] transition-colors">{{ s.sub }} / 06 节气</span>
            </button>
            <div class="space-y-2.5">
              <div v-for="t in solarTermsData[s.id]" :key="t.term" class="grid grid-cols-[92px_1fr] gap-3 items-baseline">
                <span class="font-mono text-[10px] text-[#6E6960]">{{ t.term }}</span>
                <span class="text-xs text-[#5A564E]">{{ t.title }}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <section class="surface-ink">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
        <Reveal>
          <div class="eyebrow mb-4">04 / 04 · NEXT CHAPTER</div>
          <p class="text-[13px] leading-[2] text-[#F7F4EE]/90 max-w-2xl">农时的终点是产出。下一章走进吉林风物集市，看黑土、长白山与查干湖各自端出了什么。</p>
        </Reveal>
        <Reveal :delay="120">
          <RouterLink to="/products" class="inline-flex items-baseline gap-3 min-h-[40px] group">
            <span class="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F4EE] group-hover:text-[#C88A32] transition-colors">吉林风物特产集市</span>
            <ArrowUpRight :size="22" class="text-[#C88A32] arrow-shift" />
          </RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
