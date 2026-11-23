<script setup>
import SectionHead from '../components/editorial/SectionHead.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import Reveal from '../components/editorial/Reveal.vue'
import BrandLogo from '../components/BrandLogo.vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { ref } from 'vue'

// 附录 A 默认只展示 6 条，避免目录 + 16 条口径 + 7 条资料连起来像文档
const showAllNotes = ref(false)

const highlights = [
  {
    no: '01', k: 'TOPIC', title: '选题扎根本地',
    desc: '不写空洞的概念展。以长春「黑土粮仓」与国家农高区为现实坐标，地层、农机、稻作、冬捕与节气都能在吉林找到对应地点。'
  },
  {
    no: '02', k: 'INTERACTION', title: '展陈可以走进去',
    desc: '三座 Three.js 场景分别承担微观、工业与宏观尺度，分层展开、爆炸分解、六视点飞行与悬停探针构成完整的交互语言。'
  },
  {
    no: '03', k: 'ENGINEERING', title: '工程与美学同源',
    desc: 'Vite 构建、Pinia 状态、Router 路由与一整套浅色编辑式设计系统。几何、纹理、图版均由程序化生成，离线可运行。'
  }
]

const techStack = [
  { name: 'Vue 3.5', role: 'Composition API 与 script setup 组件体系' },
  { name: 'Vite 8.3', role: '开发服务器与生产构建，按路由自动分包' },
  { name: 'Three.js 0.187', role: '三座实时 3D 展厅、IBL、GTAO 与物理折射材质' },
  { name: 'GSAP 3.15', role: '相机飞行、分层展开与爆炸分解补间' },
  { name: 'ECharts 6.1', role: '黑土生境雷达、产量趋势、产业结构与后台图表' },
  { name: 'Tailwind CSS 4.3', role: '浅色编辑式设计系统与响应式布局' },
  { name: 'Pinia 4 / Router 4', role: '视点同步、策展数据持久化与全站十八条路由' },
  { name: 'Web Speech API', role: '全站中文语音导览' },
  { name: 'SVG 程序化图版', role: '十张统一色板的编辑式插画，无外部图片依赖' }
]

const institutions = [
  {
    no: 'R-01', name: '中国科学院东北地理与农业生态研究所', role: '黑土保育智库',
    desc: '位于长春高新区，主导「黑土粮仓」科技会战，突破免耕阻蚀、秸秆快速腐解与黑土健康培育等关键技术。'
  },
  {
    no: 'R-02', name: '吉林农业大学 / 吉林大学植物科学学院', role: '现代种业育种',
    desc: '扎根长春，培育耐寒、高抗、优质的寒地高产水稻与玉米品种，让「中国饭碗」装上更多吉林好粮。'
  },
  {
    no: 'R-03', name: '长春国家农业高新技术产业示范区', role: '产教融合高地',
    desc: '聚焦玉米全产业链与现代黑土地农业，建设农业科技成果转化与数字乡村孵化基地。'
  }
]

const structure = [
  { no: '00', name: '序厅', path: '/', note: '展览总览与实时沙盘预览' },
  { no: 'MAP', name: '展览地图', path: '/exhibit-map', note: '六个尺度的策展动线' },
  { no: '01–03', name: '三座 3D 展厅', path: '/strata-3d', note: '地质标本 / 农机解构 / 生态沙盘' },
  { no: '04', name: '数智驾驶舱', path: '/dashboard', note: '黑土遥测与保供调度' },
  { no: '05', name: '一粒米的旅程', path: '/journey', note: '五幕物候剧情' },
  { no: '06', name: '查干湖冬捕', path: '/chagan-lake', note: '四段非遗仪轨' },
  { no: '07', name: '二十四节气', path: '/solar-terms', note: '全年农事索引' },
  { no: '08', name: '吉林风物集市', path: '/products', note: '产地与流通' },
  { no: '09', name: '互动科普实验室', path: '/science', note: '四个可操作的 3D 实验' },
  { no: '10', name: '长春智库', path: '/about', note: '设计说明与科教支撑' },
  { no: 'A1', name: '助农项目库', path: '/aid-projects', note: '六类带农路径' },
  { no: 'A2', name: '认养一亩田', path: '/adopt-a-field', note: '四步农事流程' },
  { no: 'A3', name: '一块地五笔收入', path: '/farm-income', note: '收益与风险' },
  { no: 'A4', name: '最后一公里实验室', path: '/last-mile', note: '三个痛点交互实验' }
]


/** 全站展陈数字的口径、性质与参照年份，答辩时集中可查 */
const dataNotes = [
  { v: '4.82%', where: '地质标本馆 / 驾驶舱', kind: '表层土壤有机质示意值，用于表现特级肥力黑土的量级', year: '教学示意 · 参照 2024–2026 公开资料' },
  { v: '200 年 / cm', where: '序厅 / 地质标本馆', kind: '自然形成一厘米黑土所需时间的科普量级，非实测值', year: '科普量级' },
  { v: '8000+ 万亩', where: '序厅数据带', kind: '东北黑土区核心耕地保有量的展览化表述', year: '参照黑土地保护规划口径' },
  { v: '880 亿斤', where: '序厅数据带', kind: '吉林省年度粮食总产量的量级表述', year: '参照近年统计公报' },
  { v: '93.5%', where: '序厅数据带', kind: '农业综合机械化率的演示取值', year: '教学示意' },
  { v: '± 2.5 cm', where: '农机解构馆 / 科普实验室', kind: '北斗 RTK 固定解的典型定位精度', year: '通用技术参数' },
  { v: '约 180 天', where: '一粒米的旅程', kind: '东北单季稻作从育秧到收获的生育期概数', year: '农时概数' },
  { v: '38℃', where: '旅程 / 节气农时', kind: '稻谷低温循环烘干工艺的示意温度', year: '通用工艺参数' },
  { v: '六寸网孔', where: '查干湖冬捕', kind: '抓大放小的传统网目下限表述', year: '非遗技艺资料' },
  { v: '1200+ 处', where: '序厅数据带', kind: '绿色有机认证基地的展示性计数', year: '教学示意' },
  { v: '72%+', where: '旅程 / 节气 / 科普实验室', kind: '低温慢烘后的整精米率示意值', year: '通用工艺参数' },
  { v: '± 1.2 m', where: '科普实验室', kind: '卫星被遮挡、退化为单点定位时的误差演示值', year: '教学演示 · 非实测' },
  { v: '6 类 / 3 类 / 7 个', where: '助农项目库', kind: '页面内可数的带农路径数、产区类别数与产业环节数，不是统计值', year: '页面结构计数' },
  { v: '示意地块 A-01…A-06', where: '认养一亩田', kind: '教学演示用地块编号与凭证，不对应真实地块、农户或交易', year: '教学演示' },
  { v: '示意条形', where: '认养一亩田 / 一块地五笔收入', kind: '收益去向与叠加账本的条形长度，仅表达相对关系，不含金额与比例', year: '教学演示 · 非统计' },
  { v: '示意指数 / 档位', where: '最后一公里实验室', kind: '地力趋势、数据冲突读数与单户负担档位，均为教学演示示意，不是实测值', year: '教学演示 · 非统计' }
]

// 最后一公里实验室依据的公开资料，与症结类型一一对应
const references = [
  { y: '2025.02', n: '中央一号文件政策解读 · 整治形式主义为基层减负', u: '把基层痛点作为靶点、整治指尖上的形式主义' },
  { y: '2025.06', n: '经济参考报 · 智慧农业纵深发展仍面临三大障碍', u: '设备成本、涉农平台数据孤岛、补贴重复填报' },
  { y: '2025.12', n: '中国发展门户网 · 黑土地保护性利用区域适宜性评估', u: '3–5 年收益迟滞、秸秆资源冲突、推广落地难' },
  { y: '2026.02', n: '中央一号文件 / 农业农村部实施意见', u: '智慧农业行动计划、农技推广体系改革、不造盆景' },
  { y: '2026.03', n: '人民日报 · 从「新农具」看农业现代化大文章', u: '小农户买不起、不会用' },
  { y: '2026.07', n: '新华社《新华视点》· AI+农业如何从云上落到地里', u: '技术盆景、人才短缺、山地算法适配' },
  { y: '2026.09', n: '中国农网 · 用算法种好地，让 AI 扛农活', u: '用不起、不会用、不敢用；集中服务降本' }
]
</script>

<template>
  <div>
    <!-- 01 白皮书封面：鎏金松纹书脊 + 青绿山水工笔底景 -->
    <section class="relative min-h-[100dvh] flex items-stretch overflow-hidden border-b border-[#0E261D]/10">
      <div class="pointer-events-none absolute inset-0 bg-cover bg-right-bottom opacity-90" style="background-image: url('/art-custom/portal-hero-qinglv.jpg')" aria-hidden="true"></div>
      <div class="pointer-events-none absolute inset-0" style="background: linear-gradient(108deg, rgba(244,248,245,0.88) 0%, rgba(244,248,245,0.68) 52%, rgba(244,248,245,0.20) 100%)" aria-hidden="true"></div>

      <!-- 左侧深松鎏金山水书脊 -->
      <div class="hidden lg:flex relative z-10 w-[5.5rem] shrink-0 bg-[#0D241B] text-[#F2F7F4] flex-col items-center justify-between pt-24 pb-12 border-r border-[#E5C175]/22 bg-cover bg-bottom" style="background-image: linear-gradient(180deg, rgba(13,36,27,0.86), rgba(10,28,21,0.72)), url('/art-custom/portal-dark-shanshui.jpg')">
        <BrandLogo :size="44" variant="gold" />
        <span class="font-mono text-[0.625rem] tracking-[0.26em] text-[#E5C175]/85 [writing-mode:vertical-rl]">JIYUN HEYE · COLOPHON 2026</span>
        <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#E5C175]">09</span>
      </div>

      <div class="relative z-10 flex-1 min-w-0 flex items-center">
        <div class="w-full max-w-[82.5rem] mx-auto px-5 sm:px-8 lg:px-14 pt-28 pb-24">
          <Reveal>
            <div class="flex flex-wrap items-center gap-3 mb-9">
              <span class="px-3 py-1.5 rounded-full bg-[#1C1B18] text-[#F7F4EE] font-mono text-[0.625rem] tracking-[0.2em] font-bold">COLOPHON 09</span>
              <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#6E6960]">CHANGCHUN ACADEMY / 长春智库与设计说明</span>
            </div>
          </Reveal>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div class="lg:col-span-7">
              <h1 class="display-1 text-[#1C1B18]" aria-label="把一片黑土 做成一座展馆">
                <span v-for="(ch, i) in Array.from('把一片黑土')" :key="'a' + i" class="kin-char"
                  :style="{ animationDelay: (0.12 + i * 0.065) + 's' }">{{ ch }}</span>
                <span class="block whitespace-nowrap text-[#1F5440]" :style="{ fontSize: '0.76em' }">
                  <span v-for="(ch, i) in Array.from('做成一座展馆')" :key="'b' + i" class="kin-char"
                    :style="{ animationDelay: (0.46 + i * 0.055) + 's' }">{{ ch }}</span>
                </span>
              </h1>
              <Reveal :delay="580"><p class="font-editorial text-lg sm:text-2xl text-[#5A564E] mt-7">选题背景 · 技术架构 · 科教支撑 · 答辩自述</p></Reveal>
              <Reveal :delay="660">
                <p class="lede mt-5 max-w-2xl">
                  立足长春，放眼白山松水。以当代大学生的数字化创意与前端编码实践，把黑土保护、智慧农机与生态非遗组织成一次完整、可读、可漫游的线上展览。
                </p>
              </Reveal>
              <Reveal :delay="740">
                <div class="flex flex-wrap gap-3 mt-9">
                  <a href="#highlights" class="mag-btn"><span>阅读设计亮点</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
                  <a href="#stack" class="mag-btn mag-btn--light"><span>查看技术架构</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
                </div>
              </Reveal>
              <Reveal :delay="820">
                <div class="mt-12 border-t border-[#1C1B18]/20 pt-5 grid grid-cols-3 gap-4 max-w-lg">
                  <div>
                    <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#8C583A]">CATEGORY</div>
                    <div class="text-[0.6875rem] mt-1.5 text-[#3A3630]">乡村振兴 · 讲好中国故事</div>
                  </div>
                  <div>
                    <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#8C583A]">STACK</div>
                    <div class="text-[0.6875rem] mt-1.5 text-[#3A3630]">Vue 3 × Three.js × Vite</div>
                  </div>
                  <div>
                    <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#8C583A]">YEAR</div>
                    <div class="text-[0.6875rem] mt-1.5 text-[#3A3630]">2026 / 长春</div>
                  </div>
                </div>
              </Reveal>
            </div>

            <!-- 目录清单 -->
            <Reveal :delay="240" class="lg:col-span-5" data-parallax="-6">
              <div class="bezel">
                <div class="bezel-core p-6 sm:p-7">
                  <div class="flex items-center justify-between gap-3 mb-5">
                    <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#6E6960]">CONTENTS / 展览目录</span>
                    <span class="font-mono text-[0.5625rem] tracking-[0.16em] text-[#8C583A]">{{ structure.length }} 章</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-0.5">
                    <RouterLink v-for="s in structure" :key="s.no" :to="s.path"
                      class="flex items-start gap-2.5 py-2.5 px-2 -mx-2 rounded-xl border-b border-[#1C1B18]/8 group hover:bg-[#EFECE6]/70 transition-colors">
                      <span class="font-mono text-[0.625rem] text-[#8C583A] w-10 pt-0.5 shrink-0">{{ s.no }}</span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-[0.8125rem] font-semibold text-[#1C1B18] group-hover:text-[#8C583A] transition-colors truncate">{{ s.name }}</span>
                        <span class="block text-[0.625rem] text-[#6E6960] mt-0.5 truncate">{{ s.note }}</span>
                      </span>
                    </RouterLink>
                  </div>
                  <div class="mt-5 pt-4 border-t border-[#1C1B18]/10 font-mono text-[0.5625rem] tracking-[0.16em] text-[#6E6960]">
                    全部图版 / 几何 / 纹理均为程序化生成 · 离线可运行
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#1C1B18]/12 bg-[#1C1B18] py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[0.625rem] tracking-[0.22em] text-[#F7F4EE]/86 whitespace-nowrap">
            <span>一厘米，四十公里</span><span class="text-[#C88A32]">✳</span>
            <span>长春市高校大学生网页设计作品</span><span class="text-[#C88A32]">✳</span>
            <span>科教支撑 / 中科院东北地理所 · 吉林农大 · 长春农高区</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 设计亮点 -->
    <section id="highlights" class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
      <Reveal>
        <SectionHead
          index="01 / 04"
          eyebrow="DESIGN RATIONALE / 设计自述"
          title="三个理由，说明它为什么这样做"
          description="从选题、交互到工程实现，每一层都尽量回答一个具体的问题，而不是堆砌效果。"
        />
      </Reveal>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Reveal v-for="(h, i) in highlights" :key="h.no" :delay="i * 100" class="h-full">
          <article class="h-full border border-[#1C1B18]/10 bg-[#FFFDF9]/70 p-7 lift">
            <div class="flex items-center justify-between mb-7">
              <span class="font-editorial text-3xl font-bold text-[#C88A32]">{{ h.no }}</span>
              <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#6E6960]">{{ h.k }}</span>
            </div>
            <h3 class="display-3 mb-4">{{ h.title }}</h3>
            <p class="body-copy text-[0.8125rem]!">{{ h.desc }}</p>
          </article>
        </Reveal>
      </div>
    </section>

    <!-- 技术架构 -->
    <section id="stack" class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <SectionHead
            index="02 / 04"
            eyebrow="ARCHITECTURE STACK / 技术架构"
            title="一套轻量，但完整的工程"
            description="无数据库、无外部模型与贴图依赖。全部视觉资产由代码生成，构建产物可直接静态托管。"
          />
        </Reveal>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-12">
          <Reveal v-for="(t, i) in techStack" :key="t.name" :delay="(i % 3) * 70">
            <div class="border border-[#1C1B18]/10 bg-[#FFFDF9]/70 p-5 h-full hover:border-[#C88A32]/50 transition-colors duration-300">
              <div class="font-mono text-[0.75rem] font-bold text-[#8A6324] mb-2">{{ t.name }}</div>
              <div class="text-[0.75rem] leading-[1.8] text-[#5A564E]">{{ t.role }}</div>
            </div>
          </Reveal>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mt-20 pt-16 border-t border-[#1C1B18]/12">
          <Reveal class="lg:col-span-5">
            <FigurePlate
              src="/art-hd/black-soil-contours.jpg"
              alt="黑土田野等高线图版"
              index="PLATE 00"
              caption="全站视觉以暖白宣纸底、亚麻容器与墨黑正文为骨架，琥珀金标记焦点，苔藓青与工匠赤红分别留给生态与工业。"
              credit="FIELD CONTOURS"
            />
          </Reveal>
          <div class="lg:col-span-7">
            <Reveal>
              <div class="eyebrow mb-4">VISUAL SYSTEM / 视觉系统</div>
              <h3 class="display-2">克制，是为了让内容更有分量</h3>
            </Reveal>
            <Reveal :delay="100"><p class="lede mt-6">
              全站不使用暗黑荧光与发光描边。大字号衬线标题、编号、细线与留白承担节奏，墨色区块只在三处关键位置出现，用来制造视觉焦点。入场、悬停与页面转场动效统一使用同一条缓动曲线，幅度控制在数十像素内，避免喧宾夺主。
            </p></Reveal>
            <Reveal :delay="170"><p class="body-copy mt-4">
              3D 场景与 2D 页面共享同一套色板与材质逻辑：黑土团粒、亚麻织物、拉丝金属、白瓷釉与物理折射玻璃，都可以在图文页面里找到对应的色彩回响。桌面与移动端使用同一套断点与组件，只是改变栅格，不削减内容。
            </p></Reveal>
          </div>
        </div>
      </div>
    </section>

    <!-- 附录 A：展陈数据口径与来源 -->
    <section id="data-notes" class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24">
        <Reveal>
          <div class="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <div class="font-mono text-[0.625rem] tracking-[0.24em] text-[#8C583A] mb-3">APPENDIX A / DATA PROVENANCE</div>
              <h2 class="display-2 text-[#1C1B18]">展陈数据口径与来源</h2>
            </div>
            <p class="text-[0.6875rem] leading-relaxed text-[#5A564E] max-w-sm">
              展馆内所有数字均为教学演示用的量级与示意指标，不对应某一年的精确统计值，不用于生产决策。
            </p>
          </div>
        </Reveal>

        <div class="border-t border-[#1C1B18]/15" data-stagger>
          <Reveal v-for="(n, i) in (showAllNotes ? dataNotes : dataNotes.slice(0, 6))" :key="n.v" :delay="i * 40">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 py-4 border-b border-[#1C1B18]/12 items-baseline">
              <div class="md:col-span-2 font-editorial text-xl font-bold text-[#8C583A]">{{ n.v }}</div>
              <div class="md:col-span-2 font-mono text-[0.625rem] tracking-[0.14em] text-[#6E6960]">{{ n.where }}</div>
              <div class="md:col-span-5 text-[0.75rem] leading-relaxed text-[#3A3630]">{{ n.kind }}</div>
              <div class="md:col-span-3 md:text-right font-mono text-[0.625rem] tracking-[0.12em] text-[#5A564E]">{{ n.year }}</div>
            </div>
          </Reveal>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
          <button type="button" @click="showAllNotes = !showAllNotes"
            class="px-5 py-2.5 min-h-[2.5rem] rounded-full border border-[#1C1B18]/18 text-[0.75rem] font-bold text-[#1C1B18] hover:border-[#C88A32] hover:text-[#8A6324] transition-colors cursor-pointer">
            {{ showAllNotes ? '收起，只看前 6 条' : '展开全部 ' + dataNotes.length + ' 条口径' }}
          </button>
          <span class="font-mono text-[0.625rem] tracking-[0.14em] text-[#6E6960]">默认只列最常被引用的 6 条</span>
        </div>

        <Reveal :delay="120">
          <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="card-ink p-6">
              <div class="font-mono text-[0.5625rem] tracking-[0.2em] text-[#8A6324] mb-3">REFERENCE / 参照资料</div>
              <p class="text-[0.6875rem] leading-relaxed text-[#F7F4EE]/90">
                吉林省国民经济和社会发展统计公报、黑土地保护规划公开资料、中科院东北地理所「黑土粮仓」科技会战成果、梨树模式长期定位试验资料、智能农机与北斗高精度定位通用技术参数。
              </p>
            </div>
            <div class="card-gold p-6">
              <div class="font-mono text-[0.5625rem] tracking-[0.2em] text-[#1C1B18]/65 mb-3">MODEL / 模型性质</div>
              <p class="text-[0.6875rem] leading-relaxed text-[#1C1B18]/80">
                三座 3D 展厅与科普实验的模型均为参数化概念复原，几何、纹理与图版由本地程序化生成，不是实物扫描，也不是特定量产型号的工程图纸。
              </p>
            </div>
            <div class="card-moss p-6">
              <div class="font-mono text-[0.5625rem] tracking-[0.2em] text-[#F7F4EE]/86 mb-3">PURPOSE / 使用范围</div>
              <p class="text-[0.6875rem] leading-relaxed text-[#F7F4EE]/90">
                本展馆用于教学展示与竞赛答辩，帮助观众建立对黑土保育、智慧农业与乡村产业的整体认识，不作为农业生产、投资决策或统计引用依据。
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal :delay="160">
          <div class="mt-12 pt-8 border-t border-[#1C1B18]/12 flex flex-wrap items-center justify-between gap-6">
            <p class="body-copy max-w-xl">
              口径与来源读到这里就够了。展览本身还在前面，回到动线，从任意一段继续参观。
            </p>
            <RouterLink to="/exhibit-map"
              class="btn-solid px-6 py-3 min-h-[2.5rem] rounded-full text-xs font-bold">
              回到展览地图 <ArrowUpRight :size="15" class="arrow-shift" />
            </RouterLink>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- 附录 B：公开资料索引 -->
    <section id="references" class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
      <Reveal>
        <div class="flex flex-wrap items-end justify-between gap-6 mb-9">
          <div>
            <div class="font-mono text-[0.625rem] tracking-[0.24em] text-[#8C583A] mb-3">APPENDIX B / REFERENCES</div>
            <h2 class="display-2 text-[#1C1B18]">公开资料索引</h2>
          </div>
          <RouterLink to="/last-mile" class="inline-flex items-center gap-2 text-xs font-bold text-[#8A6324] group">
            回到最后一公里实验室 <ArrowUpRight :size="15" class="arrow-shift" />
          </RouterLink>
        </div>
        <p class="lede max-w-3xl mb-8">
          「最后一公里实验室」的三个实验，矛盾类型、时间区间与成本量级都来自下列公开报道与政策文件。页面里的地块编号、示意指数与负担档位是教学演示用，不写人名，也不把地方调研样本外推为全国均值。
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 border-t border-[#1C1B18]/12">
          <div v-for="r in references" :key="r.n" class="flex gap-4 py-4 border-b border-[#1C1B18]/12">
            <span class="font-mono text-[0.625rem] tracking-[0.14em] text-[#8C583A] shrink-0 w-16">{{ r.y }}</span>
            <div>
              <div class="text-[0.75rem] font-semibold text-[#1C1B18] leading-snug">{{ r.n }}</div>
              <div class="text-[0.6875rem] text-[#5A564E] mt-1">{{ r.u }}</div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>

    <!-- 科教支撑 -->
    <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead
          index="03 / 04"
          eyebrow="ACADEMIC SUPPORT / 科教支撑"
          title="数据背后，是长春的科研力量"
        />
      </Reveal>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Reveal v-for="(inst, i) in institutions" :key="inst.no" :delay="i * 100" class="h-full">
          <article class="h-full border-t-2 border-[#C88A32] bg-[#FFFDF9]/70 p-7 lift">
            <div class="flex items-center justify-between mb-5">
              <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#6E6960]">{{ inst.no }}</span>
              <span class="px-2 py-1 bg-[#EFECE6] text-[0.625rem] font-mono text-[#5A564E]">{{ inst.role }}</span>
            </div>
            <h3 class="font-editorial text-lg font-bold leading-[1.5] mb-4">{{ inst.name }}</h3>
            <p class="body-copy text-[0.8125rem]!">{{ inst.desc }}</p>
          </article>
        </Reveal>
      </div>
    </section>

    <!-- 展馆结构索引 -->
    <section class="surface-ink">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <Reveal>
          <SectionHead
            index="04 / 04"
            eyebrow="SITE MAP / 展馆结构"
            title="十三个单元，一条完整动线"
            description="点击任意条目可直接前往对应展厅。"
            dark
            to="/"
            link-label="返回序厅"
          />
        </Reveal>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 mt-12">
          <Reveal v-for="(s, i) in structure" :key="s.no" :delay="(i % 2) * 80">
            <RouterLink :to="s.path" class="group grid grid-cols-[56px_1fr_auto] items-center gap-4 py-5 border-b border-[#F7F4EE]/14">
              <span class="font-mono text-[0.6875rem] text-[#8A6324]">{{ s.no }}</span>
              <span>
                <span class="block font-editorial text-lg font-bold text-[#F7F4EE] group-hover:text-[#C88A32] transition-colors">{{ s.name }}</span>
                <span class="caption block mt-1 text-[#F7F4EE]/90">{{ s.note }}</span>
              </span>
              <ArrowUpRight :size="16" class="text-[#C88A32] arrow-shift" />
            </RouterLink>
          </Reveal>
        </div>

        <Reveal :delay="160" class="mt-16 pt-10 border-t border-[#F7F4EE]/14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div class="eyebrow mb-3">COLOPHON / 署名</div>
            <p class="text-[0.8125rem] leading-[1.9] text-[#F7F4EE]/90 max-w-2xl">
              长春市高校大学生网页设计作品。选题类别：乡村振兴 · 讲好中国故事。展陈数据为教学演示用途，参考文献已在各章节末尾列示。
            </p>
          </div>
          <RouterLink to="/admin" class="btn-on-ink px-5 py-3 rounded-lg text-xs font-semibold shrink-0">
            进入策展管理后台 →
          </RouterLink>
        </Reveal>
      </div>
    </section>
  </div>
</template>
