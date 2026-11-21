<script setup>
import RuralSandbox3D from '../components/RuralSandbox3D.vue'
import WebGLStage from '../components/editorial/WebGLStage.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import Reveal from '../components/editorial/Reveal.vue'
import { useAppStore } from '../stores/appStore'
import { ArrowUpRight, ArrowDown } from 'lucide-vue-next'

const appStore = useAppStore()

const viewpoints = [
  { id: 'overview', no: 'V-01', name: '全域宏观全景', desc: '俯瞰松辽平原现代生态粮仓整体布局', tag: '全景', x: 50, y: 50 },
  { id: 'blacksoil', no: 'V-02', name: '黄金黑土示范田', desc: '规整黑土格网与成行稻浪的近景肌理', tag: '农田', x: 24, y: 28 },
  { id: 'silo', no: 'V-03', name: '现代恒温数字粮仓', desc: '白瓷立筒仓群、输粮廊道与检修环', tag: '设施', x: 72, y: 24 },
  { id: 'smartdrone', no: 'V-04', name: '植保巡检无人机', desc: '八字立体航线与多光谱扫描光斑', tag: '装备', x: 38, y: 72 },
  { id: 'greenhouse', no: 'V-05', name: '光伏农业大棚', desc: '玻璃拱棚骨架、光伏板与棚内作物畦', tag: '能源', x: 78, y: 68 },
  { id: 'windpower', no: 'V-06', name: '清洁能源风电', desc: '三台流线机组与金色叶尖的旋转轮廓', tag: '能源', x: 16, y: 62 }
]

const facilities = [
  { no: 'F-01', name: '深黑土规整田块', color: '#221E19', desc: '按东北国营农场大地块形态划分的矩形格网，田埂、垄脊与机耕路各自成层。' },
  { no: 'F-02', name: '行列防护林带', color: '#2E5A44', desc: '杨树与樟子松沿边界和田间路成行栽植，替代随机散点的装饰性绿化。' },
  { no: 'F-03', name: '蜿蜒松花江水系', color: '#8EBACB', desc: '解析曲线驱动的河床、水面、卵石岸、芦苇与汉白玉拱桥，共用同一条河道。' },
  { no: 'F-04', name: '白瓷数字粮仓', color: '#C88A32', desc: '104 段倒角筒仓、金色锥顶、竖向压筋、爬梯与空中输粮廊道。' },
  { no: 'F-05', name: '清洁能源机组', color: '#8C583A', desc: '三台带金色前缘叶片的风机，以及温室旁的光伏阵列与支架。' },
  { no: 'F-06', name: '田间服务设施', color: '#5A564E', desc: '灌溉泵房、晒场谷堆、秸秆捆垛、农业气象站、界桩与渠闸。' }
]

const heroMeta = [
  { k: 'SCALE', v: '1 : 微缩数字孪生' },
  { k: 'TERRAIN', v: '160 × 160 顶点地貌' },
  { k: 'VIEWPOINTS', v: '6 个策展机位' }
]

const legend = [
  { c: '#221E19', t: '黑土耕地' }, { c: '#2E5A44', t: '防护林带' },
  { c: '#8EBACB', t: '河湖水系' }, { c: '#C88A32', t: '粮仓设施' },
  { c: '#E7E0D0', t: '草甸田埂' }
]
</script>

<template>
  <div class="relative">
    <!-- 01 航测图首屏：坐标网格 + 可点击的六机位测绘图 -->
    <section class="relative min-h-[100dvh] surface-ink overflow-hidden flex items-center">
      <div class="absolute inset-0 coord-rule opacity-40 pointer-events-none"></div>

      <div class="relative z-10 w-full max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="px-3 py-1.5 rounded-full bg-[#C88A32] text-[#1C1B18] font-mono text-[0.625rem] tracking-[0.2em] font-bold">GALLERY 03</span>
            <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#F7F4EE]/80">RURAL DIGITAL TWIN / 生态微缩沙盘</span>
            <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#F7F4EE]/80">SHEET 03 / AERIAL SURVEY / GRID 03-06</span>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div class="lg:col-span-6">
            <h1 class="display-1 text-[#F7F4EE]" aria-label="松辽平原 收进一方沙盘">
              <span v-for="(ch, i) in Array.from('松辽平原')" :key="'a' + i" class="kin-char"
                :style="{ animationDelay: (0.12 + i * 0.07) + 's' }">{{ ch }}</span>
              <span class="block whitespace-nowrap text-[#C88A32]" :style="{ fontSize: '0.76em' }">
                <span v-for="(ch, i) in Array.from('收进一方沙盘')" :key="'b' + i" class="kin-char"
                  :style="{ animationDelay: (0.46 + i * 0.055) + 's' }">{{ ch }}</span>
              </span>
            </h1>
            <Reveal :delay="600">
              <p class="font-editorial text-lg sm:text-2xl text-[#F7F4EE]/90 mt-7">可以俯瞰，也可以走近的乡村图景</p>
            </Reveal>
            <Reveal :delay="680">
              <p class="lede text-[#F7F4EE]/90 mt-5 max-w-xl">
                把一整片黑土平原压缩成可旋转的展台。地表按东北真实农田地貌重做，深黑土田块、成行防护林、蜿蜒水系与清洁能量机组，共用一张底图。
              </p>
            </Reveal>
            <Reveal :delay="760">
              <div class="flex flex-wrap gap-3 mt-9">
                <a href="#diorama" class="mag-btn mag-btn--gold"><span>进入实时沙盘</span><span class="mag-btn__island"><ArrowDown :size="16" /></span></a>
                <a href="#viewpoints" class="mag-btn mag-btn--light"><span>查看漫游视点</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
              </div>
            </Reveal>
            <Reveal :delay="840">
              <div class="grid grid-cols-3 gap-4 mt-12 max-w-lg">
                <div v-for="m in heroMeta" :key="m.k" class="border-t border-[#F7F4EE]/25 pt-3">
                  <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#8A6324]">{{ m.k }}</div>
                  <div class="text-[0.6875rem] mt-1.5 text-[#F7F4EE]/86">{{ m.v }}</div>
                </div>
              </div>
            </Reveal>
            <Reveal :delay="900">
              <div class="flex flex-wrap gap-3 mt-8">
                <span v-for="l in legend" :key="l.t" class="flex items-center gap-1.5 font-mono text-[0.5625rem] tracking-[0.12em] text-[#F7F4EE]/80">
                  <span class="w-2.5 h-2.5 rounded-sm border border-[#F7F4EE]/25" :style="{ background: l.c }"></span>{{ l.t }}
                </span>
              </div>
            </Reveal>
          </div>

          <!-- 测绘图框 + 六机位标记 -->
          <Reveal :delay="220" variant="scale" class="lg:col-span-6" data-parallax="-6">
            <div class="bezel bezel--ink">
              <div class="bezel-core relative">
                <div class="relative aspect-[4/3.4] overflow-hidden bg-[#221E19]">
                  <img src="/art-hd/songliao-plain.jpg" alt="松辽平原田块与水系测绘图版" class="w-full h-full object-cover opacity-90" />
                  <div class="absolute inset-0 coord-rule opacity-30 pointer-events-none"></div>
                  <span class="absolute top-3 left-3 font-mono text-[0.5625rem] tracking-[0.16em] text-[#F7F4EE]/86">FIG. 03 / LAND USE</span>
                  <span class="absolute bottom-3 right-3 font-mono text-[0.5625rem] tracking-[0.16em] text-[#F7F4EE]/86">0 ─── 500 M</span>

                  <button
                    v-for="v in viewpoints"
                    :key="v.id"
                    @click="appStore.setFocusPoint(v.id)"
                    class="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center group cursor-pointer"
                    :style="{ left: v.x + '%', top: v.y + '%' }"
                    :aria-label="'飞行至' + v.name"
                  >
                    <span class="block w-3 h-3 rotate-45 border-2 transition-all duration-500"
                      :class="appStore.activeFocusPoint === v.id
                        ? 'bg-[#C88A32] border-[#FFFDF9] scale-150 shadow-[0_0_18px_4px_rgba(200,138,50,.7)]'
                        : 'bg-[#1C1B18]/80 border-[#F7F4EE]/80 group-hover:bg-[#C88A32] group-hover:scale-150'"></span>
                    <span class="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-2 py-1 font-mono text-[0.5625rem] tracking-[0.12em] bg-[#1C1B18]/90 text-[#F7F4EE] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {{ v.no }} {{ v.name }}
                    </span>
                  </button>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-t border-[#1C1B18]/10">
                  <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#6E6960]">AERIAL SURVEY / 六个策展机位</span>
                  <span class="font-mono text-[0.5625rem] tracking-[0.16em] text-[#8A6324]">点击菱形标记即可飞行</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#F7F4EE]/12 bg-[#1C1B18]/70 py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[0.625rem] tracking-[0.22em] text-[#F7F4EE]/80 whitespace-nowrap">
            <span>SONGLIAO PLAIN DIGITAL TWIN</span><span class="text-[#C88A32]">✳</span>
            <span>黑土格网 / 防护林 / 松花江</span><span class="text-[#C88A32]">✳</span>
            <span>粮仓 · 风机 · 光伏 · 巡田无人机</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 02 实时沙盘：测绘框四角 + 比例尺 -->
    <section id="diorama" class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="01 / 04" eyebrow="LIVE DIORAMA / 实时渲染" title="可旋转、可飞行、可走近"
          description="使用顶部视角按钮切换六个策展机位，也可直接拖拽旋转、滚轮缩放。悬停任意设施会显示即时档案，点击可自动飞行对焦。" />
      </Reveal>

      <Reveal :delay="100" variant="scale" class="mt-12">
        <div class="bezel">
          <div class="bezel-core relative">
            <div class="relative h-[40rem] sm:h-[47.5rem] overflow-hidden">
              <WebGLStage scene="sandbox"><RuralSandbox3D /></WebGLStage>
              <span class="hidden sm:block absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-[#C88A32]/70 pointer-events-none z-10"></span>
              <span class="hidden sm:block absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-[#C88A32]/70 pointer-events-none z-10"></span>
              <span class="hidden sm:block absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-[#C88A32]/70 pointer-events-none z-10"></span>
              <span class="hidden sm:block absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-[#C88A32]/70 pointer-events-none z-10"></span>
              <div class="hidden sm:flex absolute bottom-5 right-8 items-center gap-2 pointer-events-none z-10">
                <span class="w-16 h-1.5 border-x border-b border-[#1C1B18]/60"></span>
                <span class="font-mono text-[0.5625rem] tracking-[0.14em] text-[#1C1B18]/60">500 M</span>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 px-5 sm:px-8 py-6 border-t border-[#1C1B18]/10">
              <div v-for="n in [
                { k: '01 / 地貌', v: '冲积平原极缓起伏 / 河床下凹 / 耕地压平' },
                { k: '02 / 材质', v: '黑土团粒 / 砂石车辙 / 物理折射水面' },
                { k: '03 / 动态', v: '风机旋转 / 稻浪风摆 / 无人机巡检 / 水波' }
              ]" :key="n.k">
                <div class="font-mono text-[0.625rem] tracking-[0.18em] text-[#2E5A44] mb-1.5">{{ n.k }}</div>
                <div class="text-xs leading-relaxed text-[#3A3630]">{{ n.v }}</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>

    <!-- 03 漫游视点：航线式列表，不是等宽卡片 -->
    <section id="viewpoints" class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <SectionHead index="02 / 04" eyebrow="CAMERA ROUTE / 漫游视点" title="六个机位，六种读法"
            description="点击任意视点，镜头会以平滑曲线飞向对应区域。也可在上方沙盘里使用顶部快捷按钮。" />
        </Reveal>

        <div class="mt-14 relative">
          <div class="hidden lg:block absolute left-[6.5%] top-6 bottom-6 w-px bg-[#C88A32]/35"></div>
          <div class="space-y-2" data-stagger>
            <Reveal v-for="(v, i) in viewpoints" :key="v.id" :delay="i * 60">
              <button @click="appStore.setFocusPoint(v.id)"
                class="group relative w-full grid grid-cols-[auto_1fr_auto] sm:grid-cols-[92px_1fr_auto] items-center gap-4 sm:gap-7 py-5 px-4 sm:px-6 text-left border transition-all duration-500 cursor-pointer lift"
                :class="appStore.activeFocusPoint === v.id
                  ? 'border-[#C88A32] bg-[#FFFDF9] shadow-[0_18px_44px_-30px_rgba(28,27,24,.5)]'
                  : 'border-[#1C1B18]/10 bg-[#FFFDF9]/55 hover:border-[#C88A32]/60'">
                <span class="hidden lg:block absolute -left-[3px] w-2 h-2 rotate-45 border transition-colors"
                  :class="appStore.activeFocusPoint === v.id ? 'bg-[#C88A32] border-[#C88A32]' : 'bg-[#EFECE6] border-[#C88A32]/55'"></span>
                <span class="font-mono text-[0.6875rem] tracking-[0.18em] pl-0 lg:pl-3"
                  :class="appStore.activeFocusPoint === v.id ? 'text-[#8A6324]' : 'text-[#6E6960]'">{{ v.no }}</span>
                <span class="min-w-0">
                  <span class="block font-editorial text-xl sm:text-2xl font-bold group-hover:text-[#8A6324] transition-colors">{{ v.name }}</span>
                  <span class="block text-[0.6875rem] sm:text-xs text-[#5A564E] mt-1.5">{{ v.desc }}</span>
                </span>
                <span class="flex items-center gap-3 shrink-0">
                  <span class="hidden sm:inline px-2 py-1 border border-[#1C1B18]/15 font-mono text-[0.5625rem] tracking-[0.14em] text-[#5A564E]">{{ v.tag }}</span>
                  <span class="font-mono text-[0.625rem] tracking-[0.16em] text-[#8A6324]">飞行至此</span>
                  <ArrowUpRight :size="16" class="text-[#C88A32] arrow-shift" />
                </span>
              </button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>

    <!-- 04 设施档案与地貌校核 -->
    <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="03 / 04" eyebrow="FACILITY INDEX / 设施档案" title="一座沙盘里的六类真实要素"
          description="每一类设施都对应东北黑土农区里真实存在的生产、生态或基础设施，不使用空洞的装饰性占位。" />
      </Reveal>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 mt-12">
        <Reveal v-for="(f, i) in facilities" :key="f.no" :delay="(i % 2) * 80">
          <div class="grid grid-cols-[52px_1fr] gap-5 py-6 border-b border-[#1C1B18]/12">
            <div>
              <span class="block w-4 h-4 rounded-sm mb-3 border border-[#1C1B18]/15" :style="{ background: f.color }"></span>
              <span class="font-mono text-[0.625rem] tracking-[0.16em] text-[#8A6324]">{{ f.no }}</span>
            </div>
            <div>
              <h3 class="font-editorial text-lg font-bold mb-2">{{ f.name }}</h3>
              <p class="body-copy text-[0.8125rem]!">{{ f.desc }}</p>
            </div>
          </div>
        </Reveal>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mt-24 pt-16 border-t border-[#1C1B18]/12">
        <Reveal class="lg:col-span-5">
          <FigurePlate src="/art-hd/songliao-plain.jpg" alt="沙盘田块格网俯视图版" index="PLATE 03"
            caption="深黑土耕地、浅色草甸底、蜿蜒水系与圆仓组群，构成俯视时的四层色彩秩序。" credit="SONGLIAO PLAIN" />
        </Reveal>
        <div class="lg:col-span-7">
          <Reveal>
            <div class="eyebrow mb-4">TERRAIN STUDY / 地貌校核</div>
            <h2 class="display-2">这里不是沙丘，<br />是被耕作了百年的平原</h2>
          </Reveal>
          <Reveal :delay="100">
            <p class="lede mt-6">
              松辽平原是开阔的冲积平原，地表起伏极缓，农田由规整的大地块与笔直机耕路组织，而不是风成沙丘的波纹。沙盘把展托下沉、地形改为大尺度极缓起伏，再用黑土团粒、垄沟、秸秆碎屑与砂石车辙四类程序化材质分别刻画耕地、田边、路面与河岸。
            </p>
          </Reveal>
          <Reveal :delay="170">
            <p class="body-copy mt-4">
              稻株沿垄成行，穗头由颗粒化几何构成。风机叶片加了金色前缘，即使在接近俯视的角度也能读出旋转轮廓。河道用一条解析曲线统一驱动地形下凹、河床、水面、芦苇与桥的位置，避免出现浮在地面上的蓝色直线。
            </p>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 05 下一专题 -->
    <section class="bg-[#2E5A44]">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <Reveal class="lg:col-span-7">
          <div class="font-mono text-[0.625rem] tracking-[0.22em] text-[#F7F4EE]/86 mb-4">04 / 04 · NEXT CHAPTER</div>
          <p class="text-[0.8125rem] leading-[2] text-[#F7F4EE]/90 max-w-2xl">
            沙盘里的每一组设施都能在专题章节里找到更细的数据与故事。数智驾驶舱承接黑土遥测，一粒米的旅程承接稻作时序，二十四节气承接农时，吉林风物集市承接产出。
          </p>
        </Reveal>
        <Reveal :delay="120" class="lg:col-span-5 lg:text-right">
          <div class="caption text-[#F7F4EE]/90 mb-3">NEXT CHAPTER / 下一专题</div>
          <RouterLink to="/dashboard" class="inline-flex items-baseline gap-3 min-h-[2.5rem] group">
            <span class="font-editorial text-2xl sm:text-3xl font-bold text-[#FFFDF9] group-hover:text-[#C88A32] transition-colors">黑土振兴数智驾驶舱</span>
            <ArrowUpRight :size="22" class="text-[#C88A32] arrow-shift" />
          </RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
