<script setup>
import SoilStrata3D from '../components/SoilStrata3D.vue'
import WebGLStage from '../components/editorial/WebGLStage.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import Reveal from '../components/editorial/Reveal.vue'
import { ArrowUpRight, ArrowDown } from 'lucide-vue-next'

const layers = [
  {
    no: '01', depth: '0 – 20 cm', name: '腐殖质熟化耕作表层', color: '#221E19', bandColor: '#3A3026',
    organic: '4.82%', grow: 2, height: 'min-h-[164px]',
    desc: '万年枯荣累积的团粒结构，像天然海绵一样蓄水保肥。孔隙、蚯蚓通道与金色菌丝在这一层最为密集，是黑土肥力的全部来源。',
    key: '团粒蓄水 / 有机质活化'
  },
  {
    no: '02', depth: '20 – 50 cm', name: '淀积过渡心土层', color: '#42362B', bandColor: '#5C4836',
    organic: '2.40%', grow: 3, height: 'min-h-[196px]',
    desc: '棕黑黏粒构成的紧实过渡带，拦截春季融雪与夏季雨水下渗，把养分留在根系能够触及的深度，形成天然的地下蓄墒水库。',
    key: '胶体拦截 / 防止淋溶'
  },
  {
    no: '03', depth: '50 – 100 cm', name: '马兰黄土第四纪母质层', color: '#7C674E', bandColor: '#9A7E58', bandInk: true,
    organic: '0.85%', grow: 5, height: 'min-h-[230px]',
    desc: '松辽平原风积黄土母质，可见钙质结核与铁锰锈纹。钾、钙、磷等矿物元素在此缓慢释放，为上层土壤提供长久的地质底蕴。',
    key: '钙质沉积 / 矿质丰盈'
  }
]

const stats = [
  { value: '200', label: '年 / 形成 1 厘米黑土', note: '自然沉积所需时间', index: 'D-01', tone: 'gold' },
  { value: '4.82%', label: '表层有机质含量', note: '特级肥力黑土水平', index: 'D-02', tone: 'moss' },
  { value: '1.0 m', label: '标本下潜深度', note: '三层断代剖面', index: 'D-03', tone: 'ink' },
  { value: '3', label: '独立地质层位', note: '可分层展开与探针对焦', index: 'D-04', tone: 'linen' }
]

const statTone = {
  gold: 'card-gold text-[#1C1B18]',
  moss: 'card-moss text-[#F7F4EE]',
  ink: 'card-ink text-[#F7F4EE]',
  linen: 'card-linen text-[#1C1B18]'
}

const notes = [
  { k: 'SPECIMEN', v: '高透亚克力标本罩 / 物理折射' },
  { k: 'DETAIL', v: '团粒、孔隙、钙质结核、菌丝' },
  { k: 'INTERACTION', v: '分层展开 / 层位探针 / 环视导览' }
]

const depthTicks = [
  { d: '0', top: '0%' }, { d: '20', top: '20%' },
  { d: '50', top: '50%' }, { d: '100', top: '100%' }
]
</script>

<template>
  <div class="relative">
    <!-- 01 地层柱状档案：左侧是真实比例的三层土色，右侧是逐字标题 -->
    <section class="relative min-h-[100dvh] surface-ink flex overflow-hidden">
      <!-- 地层柱状档案：色带单独用更亮的 bandColor，原 color 留给下方档案卡，
           否则第一层 #221E19 会整个融进墨底，看起来像「左边没图」。 -->
      <div class="hidden lg:flex w-[19%] shrink-0 flex-col border-r border-[#F7F4EE]/20 bg-[#141310]">
        <div class="px-5 py-4 border-b border-[#F7F4EE]/14 shrink-0">
          <div class="font-mono text-[9px] tracking-[0.2em] text-[#F0C275]">STRATA COLUMN / 地层柱</div>
          <div class="font-mono text-[9px] tracking-[0.16em] text-[#F7F4EE]/86 mt-1.5">0 – 100 cm · 按真实层厚</div>
        </div>
        <div
          v-for="(l, i) in layers"
          :key="l.no"
          class="soil-band relative flex flex-col justify-end p-5 pb-7 border-b border-[#F7F4EE]/20"
          data-soil-band
          :style="{ backgroundColor: l.bandColor, flexGrow: l.grow, flexBasis: 0 }"
        >
          <span class="absolute top-4 right-5 font-editorial text-4xl font-bold text-[#F7F4EE]/22 select-none">0{{ i + 1 }}</span>
          <!-- 第三层提亮成黄土色后，亮金/白字会掉到 2.31 / 3.48，
               按底色分档改用墨色文字（与全站「按底色分档」约定一致）。 -->
          <div class="relative z-10">
            <div class="font-mono text-[10px] tracking-[0.2em] mb-1.5"
              :class="l.bandInk ? 'text-[#1C1B18]' : 'text-[#F0C275]'">{{ l.depth }}</div>
            <div class="text-[11px] leading-relaxed font-semibold"
              :class="l.bandInk ? 'text-[#1C1B18]' : 'text-[#F7F4EE]'">{{ l.name }}</div>
            <div class="font-mono text-[9px] tracking-[0.16em] mt-2"
              :class="l.bandInk ? 'text-[#1C1B18]' : 'text-[#F7F4EE]/90'">有机质 {{ l.organic }}</div>
          </div>
        </div>
        <div class="px-5 py-3 shrink-0 border-t border-[#F7F4EE]/14">
          <div class="font-mono text-[9px] tracking-[0.16em] text-[#F7F4EE]/86">LAYER 01–03 / 程序化生成</div>
        </div>
      </div>

      <div class="flex-1 relative flex items-center min-w-0">
        <div class="absolute inset-0 coord-rule opacity-30 pointer-events-none"></div>
        <div data-parallax="-9" class="absolute -right-24 -bottom-28 w-[36vw] h-[36vw] min-w-[320px] min-h-[320px] rounded-full border border-[#C88A32]/25 pointer-events-none"></div>

        <div class="relative z-10 w-full max-w-[1180px] mx-auto px-5 sm:px-10 lg:px-14 pt-28 pb-28">
          <Reveal>
            <div class="flex flex-wrap items-center gap-3 mb-9">
              <span class="px-3 py-1.5 rounded-full bg-[#C88A32] text-[#1C1B18] font-mono text-[10px] tracking-[0.2em] font-bold">GALLERY 01</span>
              <span class="font-mono text-[10px] tracking-[0.2em] text-[#F7F4EE]/80">VIRTUAL PEDOLOGY / 黑土地质标本馆</span>
            </div>
          </Reveal>

          <h1 class="display-1 text-[#F7F4EE]" aria-label="一米黑土 一万年沉积">
            <span v-for="(ch, i) in Array.from('一米黑土')" :key="'a' + i" class="kin-char"
              :style="{ animationDelay: (0.12 + i * 0.07) + 's' }">{{ ch }}</span>
            <span class="block text-[#C88A32]">
              <span v-for="(ch, i) in Array.from('一万年沉积')" :key="'b' + i" class="kin-char"
                :style="{ animationDelay: (0.44 + i * 0.06) + 's' }">{{ ch }}</span>
            </span>
          </h1>

          <Reveal :delay="560">
            <p class="font-editorial text-lg sm:text-2xl text-[#F7F4EE]/90 mt-7">深潜一米，读一层被压了万年的时间</p>
          </Reveal>
          <Reveal :delay="640">
            <p class="lede text-[#F7F4EE]/90 mt-5 max-w-2xl">
              打破地表宏观局限，以现代自然博物馆的亚克力切片形式，潜入探秘万年松辽平原的深厚黑土剖面与腐殖质团粒微观生命体系。耕地的产能，写在最上面那二十厘米里。
            </p>
          </Reveal>
          <Reveal :delay="720">
            <div class="flex flex-wrap gap-3 mt-9">
              <a href="#specimen" class="mag-btn mag-btn--gold"><span>查看实时标本</span><span class="mag-btn__island"><ArrowDown :size="16" /></span></a>
              <a href="#lishu" class="mag-btn mag-btn--light"><span>了解梨树模式</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
            </div>
          </Reveal>

          <Reveal :delay="820">
            <div class="flex flex-wrap gap-2 mt-12">
              <div v-for="l in layers" :key="l.no" class="flex items-center gap-2 rounded-full border border-[#F7F4EE]/18 px-3 py-1.5">
                <span class="w-3 h-3 rounded-full border border-[#F7F4EE]/25" :style="{ background: l.color }"></span>
                <span class="font-mono text-[9px] tracking-[0.16em] text-[#F7F4EE]/80">{{ l.depth }}</span>
                <span class="text-[10px] text-[#F7F4EE]/80">{{ l.name }}</span>
              </div>
            </div>
          </Reveal>
        </div>

        <!-- 有机质印章 -->
        <Reveal :delay="300" variant="scale" class="hidden xl:block absolute right-12 top-1/2 -translate-y-1/2">
          <div class="relative w-[210px] h-[210px] rounded-full border border-[#C88A32]/55 grid place-items-center text-center">
            <div class="absolute inset-3 rounded-full border border-[#C88A32]/25"></div>
            <div>
              <div class="font-mono text-[9px] tracking-[0.22em] text-[#8A6324] mb-3">ORGANIC MATTER</div>
              <div class="font-editorial text-5xl font-bold text-[#F7F4EE] leading-none">4.82<span class="text-xl">%</span></div>
              <div class="font-mono text-[9px] tracking-[0.18em] text-[#F7F4EE]/80 mt-3">表层 / 特级肥力</div>
            </div>
          </div>
        </Reveal>
      </div>

      <div class="absolute bottom-0 left-0 right-0 lg:left-[19%] marquee border-t border-[#F7F4EE]/12 bg-[#1C1B18]/70 py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[10px] tracking-[0.22em] text-[#F7F4EE]/80 whitespace-nowrap">
            <span>CHERNOZEM MONOLITH</span><span class="text-[#C88A32]">✳</span>
            <span>0 – 100 CM 断代剖面</span><span class="text-[#C88A32]">✳</span>
            <span>一厘米黑土 / 两百年</span><span class="text-[#C88A32]">✳</span>
            <span>梨树模式 · 秸秆覆盖免耕</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 02 标本抽屉：深度尺 + 双层 bezel -->
    <section id="specimen" class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="01 / 04" eyebrow="LIVE SPECIMEN / 实时标本" title="把一米土层，放进一只展柜"
          description="拖拽旋转、滚轮缩放。点击「抽屉分层展开」可让三层土体悬浮分离，悬停任意土层可读取即时档案。" />
      </Reveal>

      <Reveal :delay="100" variant="scale" class="mt-12">
        <div class="bezel">
          <div class="bezel-core relative">
            <div class="relative h-[600px] sm:h-[700px] overflow-hidden">
              <WebGLStage scene="strata"><SoilStrata3D /></WebGLStage>
              <!-- 左侧深度尺，与首屏层位柱呼应 -->
              <div class="hidden sm:block absolute left-0 top-0 bottom-0 w-14 border-r border-[#1C1B18]/10 bg-[#FFFDF9]/80 backdrop-blur-sm pointer-events-none z-10">
                <div v-for="t in depthTicks" :key="t.d" class="absolute left-0 right-0 flex items-center gap-1.5"
                  :style="{ top: t.top, transform: t.d === '100' ? 'translateY(-100%)' : 'none' }">
                  <span class="w-3 h-px bg-[#C88A32]"></span>
                  <span class="font-mono text-[9px] text-[#6E6960]">{{ t.d }}</span>
                </div>
                <div class="absolute bottom-3 left-3 font-mono text-[8px] tracking-[0.16em] text-[#6E6960]">CM</div>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 px-5 sm:px-8 py-6">
              <div v-for="n in notes" :key="n.k">
                <div class="font-mono text-[10px] tracking-[0.18em] text-[#8A6324] mb-1.5">{{ n.k }}</div>
                <div class="text-xs leading-relaxed text-[#3A3630]">{{ n.v }}</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>

    <!-- 03 地层档案：按真实层厚堆叠的横向色带，不再是三列等宽卡 -->
    <section class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <SectionHead index="02 / 04" eyebrow="STRATA ARCHIVE / 地层档案" title="三个层位，三种时间"
            description="色带高度按 20 / 30 / 50 厘米的真实层厚绘制。从耕作层到母质层，颜色由深松烟墨转向马兰黄土，记录的是完全不同的成土过程。" />
        </Reveal>

        <div class="mt-12 space-y-3" data-stagger>
          <Reveal v-for="(l, i) in layers" :key="l.no" :delay="i * 90">
            <article class="relative overflow-hidden text-[#F7F4EE] grid grid-cols-1 md:grid-cols-12 gap-6 items-center px-6 sm:px-9 py-8 lift"
              data-soil-band :class="l.height" :style="{ background: l.color }">
              <span class="absolute right-4 bottom-0 font-editorial text-[120px] leading-none font-bold text-[#F7F4EE]/6 pointer-events-none select-none">{{ l.no }}</span>
              <div class="md:col-span-3 relative z-10">
                <div class="font-mono text-[10px] tracking-[0.22em] text-[#8A6324] mb-2">LAYER {{ l.no }} / {{ l.depth }}</div>
                <h3 class="font-editorial text-2xl sm:text-3xl font-bold leading-tight">{{ l.name }}</h3>
                <div class="mt-4 inline-flex items-center gap-2 rounded-full border border-[#F7F4EE]/25 px-3 py-1">
                  <span class="w-2 h-2 rounded-full bg-[#C88A32]"></span>
                  <span class="font-mono text-[9px] tracking-[0.16em] text-[#F7F4EE]/86">{{ l.key }}</span>
                </div>
              </div>
              <p class="md:col-span-6 text-[13px] leading-[1.95] text-[#F7F4EE]/90 relative z-10">{{ l.desc }}</p>
              <div class="md:col-span-3 md:text-right relative z-10">
                <div class="font-mono text-[9px] tracking-[0.2em] text-[#F7F4EE]/80 mb-1">有机质 / ORGANIC</div>
                <div class="font-editorial text-4xl sm:text-5xl font-bold text-[#C88A32] leading-none">{{ l.organic }}</div>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 04 关键数据：非对称实心色块 Bento -->
    <section class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="03 / 04" eyebrow="IN NUMBERS / 关键数据" title="读懂黑土，先读懂时间" />
      </Reveal>
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mt-12" data-stagger>
        <Reveal v-for="(s, i) in stats" :key="s.label" :delay="i * 80"
          :class="i === 0 ? 'md:col-span-7' : i === 1 ? 'md:col-span-5' : i === 2 ? 'md:col-span-5' : 'md:col-span-7'">
          <div class="h-full p-8 sm:p-10 lift" :class="statTone[s.tone]">
            <div class="flex items-start justify-between gap-4 mb-8">
              <span class="font-mono text-[10px] tracking-[0.22em] opacity-65">{{ s.index }}</span>
              <span class="text-[10px] font-mono tracking-[0.16em] opacity-55">BLACK SOIL / JILIN</span>
            </div>
            <div class="font-editorial text-5xl sm:text-6xl font-bold leading-none">{{ s.value }}</div>
            <div class="text-sm font-semibold mt-5">{{ s.label }}</div>
            <div class="text-[11px] mt-2 opacity-70">{{ s.note }}</div>
          </div>
        </Reveal>
      </div>

      <!-- 梨树模式 -->
      <div id="lishu" class="mt-24 surface-ink relative overflow-hidden">
        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 px-6 sm:px-10 lg:px-14 py-14 sm:py-20">
          <Reveal class="lg:col-span-7">
            <div class="eyebrow mb-5 text-[#C88A32]">CONSERVATION / 梨树模式 · 黑土地保护</div>
            <h2 class="display-2 text-[#F7F4EE]">像保护大熊猫一样，<br /><span class="text-[#C88A32]">保护黑土地</span></h2>
            <p class="lede text-[#F7F4EE]/86 mt-7 max-w-2xl">
              秋收后不再翻耕，把玉米秸秆粉碎后均匀覆盖地表，来年春天用免耕播种机直接穿过覆盖层下种。这层「被子」减少土壤水分蒸发三成以上，让风蚀与水蚀失去着力点，蚯蚓数量可增加数倍。
            </p>
            <div class="grid grid-cols-3 gap-4 mt-10">
              <div v-for="n in [
                { k: 'WATER', v: '+30%', d: '土壤水分存蓄' },
                { k: 'EROSION', v: '-80%', d: '风蚀水蚀流失' },
                { k: 'BIOTA', v: '×6', d: '蚯蚓种群数量' }
              ]" :key="n.k" class="card-gold p-4 sm:p-5">
                <div class="font-mono text-[9px] tracking-[0.18em] text-[#1C1B18]/65">{{ n.k }}</div>
                <div class="font-editorial text-2xl sm:text-3xl font-bold mt-2">{{ n.v }}</div>
                <div class="text-[10px] mt-1 text-[#1C1B18]/70">{{ n.d }}</div>
              </div>
            </div>
          </Reveal>
          <Reveal :delay="140" class="lg:col-span-5" data-parallax="-6">
            <FigurePlate src="/art/soil-strata.svg" alt="黑土剖面层位图版" index="PLATE 01"
              caption="梨树模式的秸秆覆盖层，正是为了守住最上方 20 厘米的腐殖质熟化层。" credit="CHERNOZEM MONOLITH" />
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 05 文献与下一展厅 -->
    <section class="bg-[#C88A32]">
      <div class="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <Reveal class="lg:col-span-7">
          <div class="font-mono text-[10px] tracking-[0.22em] text-[#1C1B18]/70 mb-4">04 / 04 · SOURCES</div>
          <p class="text-[13px] leading-[2] text-[#1C1B18]/78 max-w-2xl">
            本展厅层位划分、有机质指标与保育技术数据参考中国科学院东北地理与农业生态研究所「黑土粮仓」科技会战公开成果、吉林省农业农村厅耕地质量年报与梨树模式长期定位试验资料。三维标本为教学示意复原，非实物扫描。
          </p>
        </Reveal>
        <Reveal :delay="120" class="lg:col-span-5 lg:text-right">
          <div class="caption text-[#1C1B18]/60 mb-3">NEXT GALLERY / 下一展厅</div>
          <RouterLink to="/machinery-3d" class="inline-flex items-baseline gap-3 min-h-[40px] group">
            <span class="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1B18] group-hover:text-[#FFFDF9] transition-colors">北斗智慧农机解构馆</span>
            <ArrowUpRight :size="22" class="text-[#1C1B18] arrow-shift" />
          </RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
