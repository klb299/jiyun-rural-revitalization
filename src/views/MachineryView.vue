<script setup>
import SmartMachinery3D from '../components/SmartMachinery3D.vue'
import WebGLStage from '../components/editorial/WebGLStage.vue'
import SectionHead from '../components/editorial/SectionHead.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import Reveal from '../components/editorial/Reveal.vue'
import { ArrowUpRight, ArrowDown } from 'lucide-vue-next'

const parts = [
  { no: 'P-01', tag: '制导导航', name: '北斗三号双频 RTK 天线', spec: '± 2.5 cm', desc: '碟形蘑菇头接收地基增强站信号，规划地块耕作航线。夜间、雨雪与浓雾条件下仍可盲视起垄。' },
  { no: 'P-02', tag: '动力核心', name: '大扭矩混合动力总成', spec: '260 HP', desc: '低转速超大扭矩，专为东北深翻深松的重阻力黑土设计，动力平顺且减少土壤压实。' },
  { no: 'P-03', tag: '车载中枢', name: '数字化全景电控舱', spec: '5G 冗余', desc: '高透全景玻璃罩内置农情决策芯片，实时监测扭矩、滑移率与排气温度，可单人调度多台机群。' },
  { no: 'P-04', tag: '底盘接地', name: '低压宽断面环保胎', spec: '超低比压', desc: '超宽胎面与人字深花纹分散机身重量，保护黑土微观孔隙与蚯蚓生态通道。' },
  { no: 'P-05', tag: '承载车架', name: '重载刚性车架与后桥', spec: '全时四驱', desc: '双侧纵梁、液压空间管路与铆接节点共同承受深松作业的巨大牵引阻力。' },
  { no: 'P-06', tag: '工业设计', name: '赤红烤漆与拉丝金属件', spec: 'clearcoat', desc: '长春工匠赤红双层清漆，琥珀金拉丝轮毂与精铜护角，延续汽车工业摇篮的制造语汇。' }
]

const stats = [
  { value: '260 HP', label: '重负荷柴电混合动力', note: '抵御东北严寒深松阻力', index: 'S-01' },
  { value: '±2.5 cm', label: '北斗三号 RTK 定位', note: '起垄笔直，无重复耕作', index: 'S-02' },
  { value: '24 h', label: '全天候无人昼夜作业', note: '抢抓春播黄金窗口期', index: 'S-03' },
  { value: '-25%', label: '燃油与人工综合成本', note: '智农装备全面降本增效', index: 'S-04' }
]

const heroMeta = [
  { k: 'ORIGIN', v: '长春 · 汽车工业摇篮' },
  { k: 'METHOD', v: '3D 机械爆炸分解' },
  { k: 'MATERIAL', v: '烤漆 / 拉丝金属 / 物理玻璃' }
]

const timeline = [
  { k: '1956', v: '长春第一汽车制造厂建成投产', d: '中国汽车工业开端' },
  { k: '2010s', v: '北斗高精度农业应用落地东北', d: '厘米级自动导航' },
  { k: '2026', v: '无人农机集群与数字孪生协同', d: '本展馆的展示对象' }
]

const partSpan = ['md:col-span-5', 'md:col-span-4', 'md:col-span-3', 'md:col-span-3', 'md:col-span-4', 'md:col-span-5']
</script>

<template>
  <div class="relative">
    <!-- 01 工程图纸式首屏：图签栏 + 巨型马力水印 + 件号表 -->
    <section class="relative min-h-[100dvh] overflow-hidden bg-[#F4F2EC] flex items-center">
      <div class="absolute inset-0 coord-rule opacity-90 pointer-events-none"></div>
      <div class="absolute -left-6 top-1/2 -translate-y-1/2 watermark text-[26vw] leading-none select-none pointer-events-none">260</div>

      <!-- 右上赤红斜切装配色块 -->
      <div class="absolute -right-[8%] top-[17%] w-[40vw] h-[46vw] min-w-[22.5rem] bg-[#B83828] rotate-[18deg] pointer-events-none shadow-[0_50px_120px_-60px_rgba(184,56,40,.7)]">
        <div class="absolute inset-5 border border-[#FFFDF9]/25"></div>
      </div>
      <!-- 底色是右上赤红斜切定位块（非祖先元素），不要用 opacity 压白字：
           10px 与 12px 小字在 #B83828 上会掉到 4.5:1 以下。 -->
      <div class="hidden lg:block absolute right-[9%] top-[25%] z-10 text-[#FFFDF9] text-right">
        <div class="font-mono text-[0.625rem] tracking-[0.24em]">RATED POWER / 额定功率</div>
        <div class="font-editorial text-6xl font-bold leading-none mt-3">260<span class="text-2xl ml-2">HP</span></div>
        <div class="text-xs mt-3">为东北重阻力黑土的深松作业而生</div>
      </div>

      <div class="relative z-10 w-full max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24">
        <!-- 工程图签 -->
        <Reveal>
          <div class="flex flex-wrap items-stretch border border-[#1C1B18]/20 bg-[#FFFDF9]/85 backdrop-blur max-w-3xl">
            <div class="px-4 py-3 border-r border-[#1C1B18]/15 bg-[#1C1B18] text-[#F7F4EE]">
              <div class="font-mono text-[0.5625rem] tracking-[0.2em] opacity-65">DRAWING NO.</div>
              <div class="font-mono text-sm font-bold tracking-wider mt-1">G02 / 2026</div>
            </div>
            <div class="px-4 py-3 border-r border-[#1C1B18]/15 flex-1 min-w-[10rem]">
              <div class="font-mono text-[0.5625rem] tracking-[0.2em] text-[#6E6960]">TITLE</div>
              <div class="text-xs font-semibold mt-1">北斗无人拖拉机 · 总成解构</div>
            </div>
            <div class="px-4 py-3 hidden sm:block">
              <div class="font-mono text-[0.5625rem] tracking-[0.2em] text-[#6E6960]">SCALE / UNITS</div>
              <div class="font-mono text-xs mt-1">1 : 1 / CM · HP</div>
            </div>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mt-10">
          <div class="lg:col-span-8">
            <Reveal><div class="eyebrow mb-6 text-[#B83828]">BEIDOU AUTONOMOUS DESIGN / 3D 智慧农机解构馆</div></Reveal>
            <h1 class="display-1 text-[#1C1B18]" aria-label="长春智造 一台车的解构">
              <span v-for="(ch, i) in Array.from('长春智造')" :key="'a' + i" class="kin-char"
                :style="{ animationDelay: (0.12 + i * 0.07) + 's' }">{{ ch }}</span>
              <span class="block text-[#B83828]">
                <span v-for="(ch, i) in Array.from('一台车的解构')" :key="'b' + i" class="kin-char"
                  :style="{ animationDelay: (0.46 + i * 0.055) + 's' }">{{ ch }}</span>
              </span>
            </h1>
            <Reveal :delay="580">
              <p class="font-editorial text-lg sm:text-2xl text-[#1C1B18]/75 mt-7">从装配线，到黑土地</p>
            </Reveal>
            <Reveal :delay="660">
              <p class="lede text-[#1C1B18]/72 mt-5 max-w-2xl">
                传承长春「汽车工业摇篮」的制造基因，把一台大马力无人拖拉机放进浅灰白摄影棚。一键爆炸分解，让驾驶舱、动力总成、天线与轮组各自悬浮，读清每一处装配逻辑。
              </p>
            </Reveal>
            <Reveal :delay="740">
              <div class="flex flex-wrap gap-3 mt-9">
                <a href="#assembly" class="mag-btn"><span>查看 3D 装配</span><span class="mag-btn__island"><ArrowDown :size="16" /></span></a>
                <a href="#parts" class="mag-btn mag-btn--light"><span>阅读部件规格</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
              </div>
            </Reveal>
            <Reveal :delay="820">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-2xl">
                <div v-for="m in heroMeta" :key="m.k" class="border-t border-[#1C1B18]/25 pt-3">
                  <div class="font-mono text-[0.5625rem] tracking-[0.2em] text-[#B83828]">{{ m.k }}</div>
                  <div class="text-[0.6875rem] mt-1.5 text-[#3A3630]">{{ m.v }}</div>
                </div>
              </div>
            </Reveal>
          </div>

          <!-- 件号表：像工程图右侧的零件索引 -->
          <Reveal :delay="260" class="lg:col-span-4 hidden lg:block" data-parallax="-7">
            <div class="bezel">
              <div class="bezel-core p-6">
                <div class="font-mono text-[0.625rem] tracking-[0.2em] text-[#6E6960] mb-5">PARTS INDEX / 件号表</div>
                <div class="divide-y divide-[#1C1B18]/10">
                  <div v-for="p in parts" :key="p.no" class="flex items-center gap-3 py-2.5 group">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#B83828] shrink-0"></span>
                    <span class="font-mono text-[0.625rem] text-[#B83828] w-10 shrink-0">{{ p.no }}</span>
                    <span class="text-[0.6875rem] text-[#3A3630] truncate group-hover:text-[#B83828] transition-colors">{{ p.name }}</span>
                    <span class="ml-auto font-mono text-[0.5625rem] text-[#6E6960] shrink-0">{{ p.spec }}</span>
                  </div>
                </div>
                <div class="mt-5 pt-4 border-t border-[#1C1B18]/10 font-mono text-[0.5625rem] tracking-[0.16em] text-[#6E6960]">
                  06 ASSEMBLIES / EXPLODED VIEW
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#1C1B18]/12 bg-[#1C1B18] py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[0.625rem] tracking-[0.22em] text-[#F7F4EE]/86 whitespace-nowrap">
            <span>BEIDOU RTK ±2.5 CM</span><span class="text-[#C88A32]">✳</span>
            <span>无人深松 / 免耕播种 / 机群调度</span><span class="text-[#C88A32]">✳</span>
            <span>CHANGCHUN INDUSTRIAL LINEAGE</span><span class="text-[#C88A32]">✳</span>
            <span>长春智造 · 服务黑土</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 02 装配台：四角定位标记 + 双层 bezel + 图签栏 -->
    <section id="assembly" class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="01 / 04" eyebrow="EXPLODED VIEW / 实时装配" title="把整车拆开，再装回去"
          description="点击「3D 机械爆炸分解」观察部件悬浮，点击底部部件标签可让镜头平滑对焦，悬停模型任意总成可即时高亮。" />
      </Reveal>

      <Reveal :delay="100" variant="scale" class="mt-12">
        <div class="bezel">
          <div class="bezel-core relative">
            <div class="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-4 border-b border-[#1C1B18]/10">
              <div class="font-mono text-[0.625rem] tracking-[0.2em] text-[#6E6960]">ASSEMBLY BENCH / 装配台 01</div>
              <div class="flex items-center gap-2 font-mono text-[0.5625rem] tracking-[0.16em] text-[#6E6960]">
                <span class="w-1.5 h-1.5 rounded-full bg-[#B83828]"></span> LIVE / WEBGL · DRAG TO ORBIT
              </div>
            </div>
            <div class="relative h-[37.5rem] sm:h-[43.75rem] overflow-hidden">
              <WebGLStage scene="machinery"><SmartMachinery3D /></WebGLStage>
              <span class="hidden sm:block absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#B83828]/60 pointer-events-none z-10"></span>
              <span class="hidden sm:block absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#B83828]/60 pointer-events-none z-10"></span>
              <span class="hidden sm:block absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#B83828]/60 pointer-events-none z-10"></span>
              <span class="hidden sm:block absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#B83828]/60 pointer-events-none z-10"></span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 px-5 sm:px-8 py-6 border-t border-[#1C1B18]/10">
              <div v-for="n in [
                { k: '01 / 场景', v: '浅灰白摄影棚 + 112 段刻度展台' },
                { k: '02 / 部件', v: '座舱 / 动力 / 天线 / 四轮 / 车架' },
                { k: '03 / 操作', v: '爆炸分解 / 部件对焦 / 环视导览' }
              ]" :key="n.k">
                <div class="font-mono text-[0.625rem] tracking-[0.18em] text-[#B83828] mb-1.5">{{ n.k }}</div>
                <div class="text-xs leading-relaxed text-[#3A3630]">{{ n.v }}</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>

    <!-- 03 参数：横向非对称读数带 -->
    <section class="surface-ink border-y border-[#1C1B18]/10">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <SectionHead index="02 / 04" eyebrow="SPEC SHEET / 核心参数" title="四个数字，说明它为什么能下地"
            description="马力决定能否拉动深松犁，定位精度决定能否不重复、不漏作，续航与成本决定它能否真正走进田间。" dark />
        </Reveal>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mt-12" data-stagger>
          <Reveal v-for="(s, i) in stats" :key="s.label" :delay="i * 80"
            :class="i === 0 ? 'md:col-span-5' : i === 1 ? 'md:col-span-3' : i === 2 ? 'md:col-span-4' : 'md:col-span-12'">
            <div class="h-full p-7 sm:p-9 lift" :class="i === 0 ? 'card-gold text-[#1C1B18]' : 'border border-[#F7F4EE]/18 bg-[#F7F4EE]/5 text-[#F7F4EE]'">
              <div class="flex items-start justify-between gap-3 mb-6">
                <span class="font-mono text-[0.625rem] tracking-[0.2em] opacity-65">{{ s.index }}</span>
                <span class="font-mono text-[0.5625rem] tracking-[0.16em] opacity-50">SMART AGRI / JILIN</span>
              </div>
              <div class="font-editorial text-4xl sm:text-5xl font-bold leading-none" :class="i === 0 ? '' : 'text-[#C88A32]'">{{ s.value }}</div>
              <div class="text-sm font-semibold mt-4">{{ s.label }}</div>
              <div class="text-[0.6875rem] mt-1.5 opacity-70">{{ s.note }}</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 04 部件档案：非对称 Bento + 编号水印 -->
    <section id="parts" class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead index="03 / 04" eyebrow="COMPONENT ARCHIVE / 部件档案" title="六个总成，一条完整作业链"
          description="从卫星信号到轮胎接地，每个部件都对应黑土耕作中的一个真实约束。" />
      </Reveal>
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mt-12" data-stagger>
        <Reveal v-for="(p, i) in parts" :key="p.no" :delay="(i % 3) * 90" :class="partSpan[i]" class="h-full">
          <article class="h-full relative overflow-hidden border border-[#1C1B18]/12 bg-[#FFFDF9] p-7 lift flex flex-col">
            <span class="absolute -right-2 -bottom-6 watermark text-[6.875rem] leading-none pointer-events-none">{{ p.no.slice(-2) }}</span>
            <div class="relative z-10 flex items-start justify-between gap-3 mb-7">
              <span class="font-mono text-[0.6875rem] tracking-[0.18em] text-[#B83828]">{{ p.no }}</span>
              <span class="px-2 py-1 border border-[#1C1B18]/15 text-[0.625rem] font-mono text-[#5A564E]">{{ p.tag }}</span>
            </div>
            <h3 class="relative z-10 display-3 mb-4">{{ p.name }}</h3>
            <p class="relative z-10 body-copy text-[0.8125rem]! flex-1">{{ p.desc }}</p>
            <div class="relative z-10 pt-5 mt-6 border-t border-[#1C1B18]/12 font-editorial text-xl font-bold text-[#B83828]">{{ p.spec }}</div>
          </article>
        </Reveal>
      </div>

      <!-- 工业血脉：横向刻度时间轴 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mt-24 pt-16 border-t border-[#1C1B18]/12">
        <Reveal class="lg:col-span-5">
          <FigurePlate src="/art/machine.svg" alt="农机轮组与定位天线线稿图版" index="PLATE 02"
            caption="赤红机罩、金色轮毂与碟形 RTK 天线，构成展馆里最鲜明的一组工业色。" credit="AUTONOMOUS AGRI-ROBOTICS" />
        </Reveal>
        <div class="lg:col-span-7">
          <Reveal>
            <div class="eyebrow mb-4 text-[#B83828]">INDUSTRIAL LINEAGE / 工业血脉</div>
            <h2 class="display-2">从装配线，<br />到黑土地</h2>
            <p class="lede mt-6">
              长春是中国汽车工业的起点。同一套冲压、涂装与总装的质量标准，如今被移植到智能农机产线。展馆用赤红烤漆、拉丝金属与精铜护角把这段传承写进模型语言，也让冰冷的装备在暖白展厅里保持温度。
          </p>
          </Reveal>
          <div class="relative mt-10 pl-6 border-l-2 border-[#B83828]/35 space-y-7" data-stagger>
            <div v-for="r in timeline" :key="r.k" class="relative">
              <span class="absolute -left-[1.9375rem] top-1.5 w-3 h-3 rounded-full bg-[#B83828] ring-4 ring-[#F7F4EE]"></span>
              <div class="font-mono text-xs text-[#B83828] mb-1">{{ r.k }}</div>
              <div class="font-editorial text-lg font-bold">{{ r.v }}</div>
              <div class="caption mt-1">{{ r.d }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 05 下一展厅 -->
    <section class="bg-[#B83828]">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <Reveal class="lg:col-span-7">
          <div class="font-mono text-[0.625rem] tracking-[0.22em] text-[#FFFDF9]/86 mb-4">04 / 04 · COLOPHON</div>
          <p class="text-[0.8125rem] leading-[2] text-[#FFFDF9]/90 max-w-2xl">
            本展厅车型为面向教学展示的参数化概念复原，结构、材质与部件命名参考长春国家农业高新技术产业示范区公开资料与现代智能农机通用技术方案，非特定量产型号的工程图纸。
          </p>
        </Reveal>
        <Reveal :delay="120" class="lg:col-span-5 lg:text-right">
          <div class="caption text-[#FFFDF9]/90 mb-3">NEXT GALLERY / 下一展厅</div>
          <RouterLink to="/sandbox-3d" class="inline-flex items-baseline gap-3 min-h-[2.5rem] group">
            <span class="font-editorial text-2xl sm:text-3xl font-bold text-[#FFFDF9] group-hover:text-[#1C1B18] transition-colors">松辽平原生态沙盘</span>
            <ArrowUpRight :size="22" class="text-[#FFFDF9] arrow-shift" />
          </RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
