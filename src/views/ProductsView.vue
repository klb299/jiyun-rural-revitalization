<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import SectionHead from '../components/editorial/SectionHead.vue'
import FigurePlate from '../components/editorial/FigurePlate.vue'
import Reveal from '../components/editorial/Reveal.vue'
import { ArrowUpRight, Check, ShoppingBag } from 'lucide-vue-next'
import { useRuralPlatformStore } from '../stores/ruralPlatformStore'

const router = useRouter()
const store = useRuralPlatformStore()
const activeFilter = ref('all')
const toast = ref('')
let toastTimer = null

const storeIdMap = {
  1: 'prod-1',
  2: 'prod-3',
  3: 'prod-7',
  4: 'prod-11',
  5: 'prod-2',
  6: 'prod-5'
}

const categories = [
  { id: 'all', name: '全部吉林风物' },
  { id: 'grain', name: '优质粳稻谷物' },
  { id: 'mountain', name: '长白山珍稀林特' },
  { id: 'lake', name: '查干湖生态渔业' }
]

const products = [
  {
    id: 1, category: 'grain', name: '吉林秋田小町 / 稻花香粳米', origin: '长春九台 / 饮马河流域',
    tag: '国家地理标志', desc: '有机黑土栽培，松花江水源灌溉。米粒饱满半透明，煮饭油亮微甜，冷饭不回生。',
    price: '¥ 68.00 / 5kg', sales: '月销 12,000+ 件', image: '/art-hd/golden-rice.jpg', plate: 'PLATE 04', no: '01'
  },
  {
    id: 2, category: 'grain', name: '东北黄金甜糯玉米真空棒', origin: '四平 / 公主岭黄金玉米带',
    tag: '非转基因 · 鲜摘锁鲜', desc: '从采摘到真空高压灭菌不超过五小时，保留天然高膳食纤维与甜脆多汁。',
    price: '¥ 39.90 / 8 支装', sales: '月销 35,000+ 件', image: '/art-custom/waxy-corn.jpg', plate: 'PLATE 02', no: '02'
  },
  {
    id: 3, category: 'mountain', name: '长白山野生椴树雪蜜', origin: '长白山脉深山原始森林',
    tag: '天然成熟原蜜', desc: '每年夏至前后椴树花开，蜜蜂采自深山天然粉源，洁白如雪，带清雅薄荷淡香。',
    price: '¥ 88.00 / 500g', sales: '月销 8,600+ 件', image: '/art-custom/honey.jpg', plate: 'PLATE 03', no: '03'
  },
  {
    id: 4, category: 'mountain', name: '长白山红松子仁 / 破壁人参片', origin: '抚松 / 长白山腹地',
    tag: '药食同源', desc: '手工精选野生红松大籽，仁香醇厚；林下野山参低温超微打粉破壁。',
    price: '¥ 128.00 / 盒', sales: '月销 5,400+ 件', image: '/art-custom/pine-nuts.jpg', plate: 'PLATE 04', no: '04'
  },
  {
    id: 5, category: 'lake', name: '查干湖生态胖头鱼', origin: '松原 / 查干湖冬捕非遗区',
    tag: '国家非遗传统冬捕', desc: '天然大水面自然生长五年以上，纯野生无投喂，肉质紧密肥嫩，冬捕冷链直达。',
    price: '¥ 198.00 / 条约 6 斤', sales: '冬捕预订 28,000+ 件', image: '/art-hd/chagan-winter.jpg', plate: 'PLATE 05', no: '05'
  },
  {
    id: 6, category: 'grain', name: '延边有机黑豆与杂粮礼盒', origin: '延边朝鲜族自治州',
    tag: '绿色富硒认证', desc: '长白山矿泉水与火山灰土孕育，包含黑米、薏仁、红小豆、燕麦。',
    price: '¥ 79.00 / 礼盒装', sales: '月销 9,200+ 件', image: '/art-custom/soybeans-real.jpg', plate: 'PLATE 06', no: '06'
  }
]

const pickCategory = (id) => {
  activeFilter.value = id
  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const filtered = computed(() => activeFilter.value === 'all'
  ? products
  : products.filter((p) => p.category === activeFilter.value))

const addToList = (item) => {
  const mappedId = storeIdMap[item.id]
  const realProd = store.products.find((p) => p.id === mappedId) || store.activeProducts[0]
  if (realProd) {
    store.addToCart(realProd, 1)
  }
  toast.value = `已将「${item.name}」同步加入助农购物袋（当前 ${store.cartCount} 件）`
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2800)
}

const goCheckoutInApp = () => {
  store.setAppPersona('consumer')
  router.push('/app?tab=market')
}

onUnmounted(() => clearTimeout(toastTimer))

</script>

<template>
  <div>
    <!-- 01 市集标签墙：暖白宣纸与琥珀光晕 + Z 轴层叠品类卡 -->
    <section class="relative min-h-[100dvh] flex items-center overflow-hidden"
      style="background-image: linear-gradient(108deg, rgba(246,250,247,0.82) 0%, rgba(244,248,245,0.48) 55%, rgba(244,248,245,0.18) 100%), url('/art-custom/portal-gold-grain-band.jpg'); background-size: cover; background-position: center bottom;">
      <div class="absolute inset-0 coord-rule hero-grid-fade pointer-events-none"></div>

      <div class="relative z-10 w-full max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span class="px-3 py-1.5 rounded-full bg-[#1C1B18] text-[#F7F4EE] font-mono text-[0.625rem] tracking-[0.2em] font-bold">CHAPTER 08</span>
            <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#1C1B18]/70">SPECIALTY AGRI-FAIR / 吉林风物特产集市</span>
          </div>
        </Reveal>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-6">
            <h1 class="display-1 text-[#1C1B18]" aria-label="把白山松水 装进一只礼盒">
              <span v-for="(ch, i) in Array.from('把白山松水')" :key="'a' + i" class="kin-char"
                :style="{ animationDelay: (0.12 + i * 0.07) + 's' }">{{ ch }}</span>
              <span class="block whitespace-nowrap text-[#1C1B18]" :style="{ fontSize: '0.72em' }">
                <span v-for="(ch, i) in Array.from('装进一只礼盒')" :key="'b' + i" class="kin-char"
                  :style="{ animationDelay: (0.46 + i * 0.055) + 's' }">{{ ch }}</span>
              </span>
            </h1>
            <Reveal :delay="580"><p class="font-editorial text-lg sm:text-2xl text-[#1C1B18]/80 mt-7">从田间地头，到千家万户的最后一百米</p></Reveal>
            <Reveal :delay="660">
              <p class="lede text-[#1C1B18]/78 mt-5 max-w-xl">
                精选黑土粳稻、黄金玉米、长白山林特与查干湖生态渔业四类物产。每件风物都标注产地、认证与流通方式，让「助农」不只是一句口号，而是一条可以追溯的链。
              </p>
            </Reveal>
            <Reveal :delay="740">
              <div class="flex flex-wrap gap-3 mt-9">
                <a href="#catalog" class="mag-btn"><span>浏览全部风物</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
                <a href="#origins" class="mag-btn mag-btn--light"><span>阅读产地地图</span><span class="mag-btn__island"><ArrowUpRight :size="16" /></span></a>
              </div>
            </Reveal>
            <Reveal :delay="820">
              <div class="flex flex-wrap gap-2 mt-12 max-w-lg">
                <span v-for="t in ['产地到县域', '国家地理标志', '一袋一码', '冷链直达', '助农直采']" :key="t"
                  class="rounded-full border border-[#1C1B18]/30 px-3 py-1.5 font-mono text-[0.5625rem] tracking-[0.14em] text-[#1C1B18]/75">{{ t }}</span>
              </div>
            </Reveal>
          </div>

          <!-- 层叠品类标签卡 -->
          <div class="lg:col-span-6">
            <div class="grid grid-cols-2 gap-4 sm:gap-5" data-stagger>
              <Reveal v-for="(c, i) in categories" :key="c.id" :delay="180 + i * 90">
                <button @click="pickCategory(c.id)"
                  class="z-card group relative w-full text-left rounded-2xl bg-[#FFFDF9] border border-[#1C1B18]/10 shadow-[0_24px_54px_-32px_rgba(28,27,24,0.3)] p-5 sm:p-6 cursor-pointer"
                  :class="activeFilter === c.id ? 'ring-2 ring-[#1C1B18]' : ''"
                  >
                  <div class="flex items-start justify-between gap-2 mb-5">
                    <span class="font-mono text-[0.625rem] tracking-[0.18em] text-[#8A6324]">TAG 0{{ i + 1 }}</span>
                    <span class="w-6 h-6 rounded-full bg-[#1C1B18] text-[#F7F4EE] grid place-items-center">
                      <ArrowUpRight :size="13" class="arrow-shift" />
                    </span>
                  </div>
                  <div class="font-editorial text-lg sm:text-xl font-bold leading-snug mb-3">{{ c.name }}</div>
                  <div class="text-[0.6875rem] leading-relaxed text-[#5A564E] min-h-[2rem]">
                    {{ products.find(p => p.category === c.id)?.name || '四类风物 · 产地直采' }}
                  </div>
                  <div class="mt-5 pt-4 border-t border-dashed border-[#1C1B18]/20 flex items-center justify-between gap-2">
                    <span class="font-mono text-[0.5625rem] tracking-[0.14em] text-[#6E6960]">JILIN / ORIGIN</span>
                    <span class="text-[0.6875rem] font-bold text-[#8A6324]">
                      {{ products.find(p => p.category === c.id)?.price || '查看全部' }}
                    </span>
                  </div>
                </button>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 marquee border-t border-[#1C1B18]/15 bg-[#1C1B18] py-2.5" aria-hidden="true">
        <div class="marquee-track">
          <span v-for="n in 2" :key="n" class="flex shrink-0 items-center gap-6 pr-6 font-mono text-[0.625rem] tracking-[0.22em] text-[#F7F4EE]/86 whitespace-nowrap">
            <span>黑土粳稻 / 黄金玉米</span><span class="text-[#C88A32]">✳</span>
            <span>长白山椴树雪蜜 / 红松子</span><span class="text-[#C88A32]">✳</span>
            <span>查干湖生态胖头鱼</span><span class="text-[#C88A32]">✳</span>
            <span>产地可查 · 认证可验 · 流通可追</span><span class="text-[#C88A32]">✳</span>
          </span>
        </div>
      </div>
    </section>

    <!-- 目录 -->
    <section id="catalog" class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
      <Reveal>
        <SectionHead
          index="01 / 04"
          eyebrow="CURATED CATALOG / 风物目录"
          title="六件风物，三种地貌"
          description="按品类筛选。卡片中的价格与销量为教学演示数据，用于说明产地到消费者的信息结构。"
        />
      </Reveal>

      <Reveal :delay="90" class="mt-10">
        <div class="flex flex-wrap items-center gap-2 border-b border-[#1C1B18]/12 pb-6">
          <button
            v-for="c in categories"
            :key="c.id"
            @click="activeFilter = c.id"
            class="px-4 py-2.5 min-h-[2.5rem] rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300"
            :class="activeFilter === c.id
              ? 'bg-[#1C1B18] text-[#F7F4EE]'
              : 'border border-[#1C1B18]/14 text-[#5A564E] hover:border-[#C88A32] hover:text-[#C88A32]'"
          >{{ c.name }}</button>
          <span class="ml-auto font-mono text-[0.625rem] tracking-[0.16em] text-[#6E6960]">{{ filtered.length }} ITEMS</span>
        </div>
      </Reveal>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        <Reveal v-for="(p, i) in filtered" :key="p.id" :delay="(i % 3) * 90" class="h-full">
          <article class="h-full rounded-[1.75rem] border border-[#1C1B18]/10 bg-[#FFFDF9]/82 shadow-[0_24px_60px_-36px_rgba(28,27,24,0.28)] lift flex flex-col overflow-hidden">
            <div class="art-frame aspect-[16/9]">
              <img :src="p.image" :alt="p.name" loading="lazy" />
              <span class="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full font-mono text-[0.625rem] tracking-[0.16em] bg-[#FFFDF9]/92 text-[#1C1B18] shadow-sm">{{ p.plate }}</span>
              <span class="absolute bottom-3.5 right-4 font-editorial text-xl font-bold text-[#F7F4EE]/95 drop-shadow">{{ p.no }}</span>
            </div>
            <div class="p-6 flex flex-col flex-1">
              <div class="flex items-start justify-between gap-3 mb-4">
                <span class="px-2.5 py-1 rounded-full bg-[#C88A32]/14 text-[#8A6324] text-[0.625rem] font-mono">{{ p.tag }}</span>
                <span class="caption">{{ p.plate }}</span>
              </div>
              <h3 class="font-editorial font-bold text-lg sm:text-xl leading-snug text-[#1C1B18] mb-2">{{ p.name }}</h3>
              <div class="font-mono text-[0.625rem] tracking-[0.1em] text-[#6E6960] mb-4">产地 / {{ p.origin }}</div>
              <p class="body-copy text-[0.8125rem]! flex-1">{{ p.desc }}</p>
              <div class="mt-6 pt-5 border-t border-[#1C1B18]/10 flex items-baseline justify-between gap-3">
                <span class="font-editorial text-lg font-bold text-[#B83828]">{{ p.price }}</span>
                <span class="caption">{{ p.sales }}</span>
              </div>
              <button
                type="button"
                @click="addToList(p)"
                class="btn-solid mt-5 w-full py-3 rounded-full text-xs font-bold transition-colors duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                加入助农购物袋（双端互通） <ArrowUpRight :size="14" aria-hidden="true" />
              </button>
            </div>
          </article>
        </Reveal>
      </div>
    </section>

    <!-- 产地地图 -->
    <section id="origins" class="surface-linen border-y border-[#1C1B18]/10">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <!-- 原抽象等高线「地图」信息量太低，改为三类产地的实景索引卡 -->
          <Reveal class="lg:col-span-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div v-for="o in [
                { k: 'PLAIN', t: '中部平原', d: '粳稻 / 甜糯玉米', img: '/photos/field-sunset.jpg' },
                { k: 'FOREST', t: '东南山林', d: '椴树雪蜜 / 红松子', img: '/photos/forest.jpg' },
                { k: 'GRAIN', t: '黑土田块', d: '大豆 / 杂粮', img: '/art-hd/soil-specimen.jpg' }
              ]" :key="o.k" class="group rounded-2xl overflow-hidden border border-[#1C1B18]/12 bg-[#FFFDF9]">
                <div class="aspect-[3/4] overflow-hidden">
                  <img :src="o.img" :alt="o.t + '实景示意'" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
                <div class="p-4">
                  <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#8A6324] mb-1">{{ o.k }}</div>
                  <div class="font-editorial text-base font-bold text-[#1C1B18]">{{ o.t }}</div>
                  <div class="text-[0.625rem] text-[#6E6960] mt-1">{{ o.d }}</div>
                </div>
              </div>
            </div>
            <p class="caption mt-4">实景影像为产地示意，不对应具体地块；不接地图服务、不使用经纬度。</p>
          </Reveal>
          <div class="lg:col-span-6">
            <Reveal>
              <SectionHead
                index="02 / 04"
                eyebrow="ORIGIN / 三类产地"
                title="一件风物，背后是一整片地貌"
              />
            </Reveal>
            <Reveal :delay="100"><p class="lede mt-7">
              中部松辽平原的黑土与灌区给出粳稻和玉米，东南长白山林下给出椴树蜜、松子与人参，西北查干湖的大水面给出冬捕胖头鱼。三条物产带对应三种完全不同的生态本底，也决定了各自的采收节律与冷链方式。
            </p></Reveal>
            <Reveal :delay="170">
              <div class="mt-8 divide-y divide-[#1C1B18]/10 border-y border-[#1C1B18]/10">
                <div v-for="n in [
                  { k: 'PLAIN', v: '松辽平原', d: '粳稻 / 甜糯玉米 / 杂粮' },
                  { k: 'FOREST', v: '长白山林区', d: '椴树雪蜜 / 红松子 / 人参' },
                  { k: 'LAKE', v: '查干湖湿地', d: '冬捕胖头鱼 / 生态渔业' }
                ]" :key="n.k" class="grid grid-cols-[92px_1fr_auto] items-center gap-4 py-4">
                  <span class="font-mono text-[0.625rem] tracking-[0.16em] text-[#8A6324]">{{ n.k }}</span>
                  <span class="text-sm font-semibold">{{ n.v }}</span>
                  <span class="caption text-right hidden sm:block">{{ n.d }}</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>

    <!-- 助农说明 -->
    <section class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
      <Reveal>
        <SectionHead
          index="03 / 04"
          eyebrow="RURAL E-COMMERCE / 数字助农"
          title="把链路讲清楚，比卖出去更重要"
        />
      </Reveal>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
        <Reveal v-for="(n, i) in [
          { no: '01', k: 'ORIGIN', t: '产地可查', d: '每件风物标注到县域与流域，不做模糊的「东北特产」' },
          { no: '02', k: 'QUALITY', t: '认证可核', d: '地理标志、绿色食品与有机认证分别列示' },
          { no: '03', k: 'LOGISTICS', t: '链路可见', d: '从烘干、入库到冷链直发的节点全部标注' }
        ]" :key="n.no" :delay="i * 100">
          <div class="border-t border-[#1C1B18]/16 pt-6">
            <div class="flex items-baseline justify-between mb-4">
              <span class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324]">{{ n.k }}</span>
              <span class="font-mono text-[0.625rem] text-[#6E6960]">{{ n.no }}</span>
            </div>
            <h3 class="font-editorial text-xl font-bold mb-3">{{ n.t }}</h3>
            <p class="body-copy text-[0.8125rem]!">{{ n.d }}</p>
          </div>
        </Reveal>
      </div>
    </section>

    <section class="surface-ink">
      <div class="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
        <Reveal>
          <div class="eyebrow mb-4">04 / 04 · COLOPHON</div>
          <p class="text-[0.8125rem] leading-[2] text-[#F7F4EE]/90 max-w-2xl">本集市为教学演示模块，商品、价格、销量与下单交互均为模拟数据，不产生真实交易。</p>
        </Reveal>
        <Reveal :delay="120">
          <RouterLink to="/about" class="inline-flex items-baseline gap-3 min-h-[2.5rem] group">
            <span class="font-editorial text-2xl sm:text-3xl font-bold text-[#F7F4EE] group-hover:text-[#C88A32] transition-colors">长春智库与答辩说明</span>
            <ArrowUpRight :size="22" class="text-[#C88A32] arrow-shift" />
          </RouterLink>
        </Reveal>
      </div>
    </section>

    <!-- 展馆与移动端集市互通悬浮购物袋条 -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="store.cartCount > 0"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[75] w-[min(540px,calc(100vw-2.5rem))] rounded-2xl bg-[#10241C]/96 backdrop-blur-md text-[#F7FAF8] px-4 py-3 border border-[#E5C175]/40 shadow-2xl flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-9 h-9 rounded-xl bg-[#E5C175] text-[#10241C] flex items-center justify-center shrink-0">
            <ShoppingBag :size="16" aria-hidden="true" />
          </span>
          <div class="min-w-0">
            <div class="text-xs font-bold truncate">
              助农购物袋已选 {{ store.cartCount }} 件 · 合计 ¥{{ store.cartTotal }}
            </div>
            <div class="text-[11px] text-[#86EFAC] truncate">
              预计直达合作社农户 ¥{{ store.cartFarmerShareSummary.farmerGain }}（{{ store.cartFarmerShareSummary.sharePct }}%）
            </div>
          </div>
        </div>
        <button
          type="button"
          @click="goCheckoutInApp"
          class="shrink-0 min-h-[38px] px-3.5 py-2 rounded-xl bg-[#E5C175] text-[#10241C] text-xs font-bold hover:brightness-105 transition-all cursor-pointer flex items-center gap-1"
        >
          <span>去结算/核验</span>
          <ArrowUpRight :size="13" aria-hidden="true" />
        </button>
      </div>
    </Transition>

    <!-- 轻量提示 -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="toast" class="fixed top-22 left-1/2 -translate-x-1/2 z-[80] museum-card px-5 py-3 rounded-xl border border-[#C88A32]/40 flex items-center gap-2.5 shadow-xl">
        <Check :size="15" class="text-[#2E5A44]" />
        <span class="text-xs font-semibold text-[#1C1B18]">{{ toast }}</span>
      </div>
    </Transition>
  </div>
</template>
