<script setup>
import { ref, computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Home, ShoppingBag, Sprout, Megaphone, User,
  MapPin, Search, Bell, ChevronRight, Plus, Minus,
  CheckCircle2, Sparkles, ShieldCheck, Tractor, Layers,
  Compass, X, Send, PackageCheck, Clock, ArrowUpRight,
  Leaf, Droplets, Cpu, Award, ChevronLeft, Maximize2,
  QrCode, Heart, Radio, CalendarDays, Ticket, Truck, Volume2
} from 'lucide-vue-next'
import { useRuralPlatformStore } from '../../stores/ruralPlatformStore'
import BrandLogo from '../BrandLogo.vue'
import AppLiveCamOverlay from './AppLiveCamOverlay.vue'
import AppTraceabilityPage from './AppTraceabilityPage.vue'
import AppCertificateModal from './AppCertificateModal.vue'
import AppSolarAlmanacPage from './AppSolarAlmanacPage.vue'
import AppOriginMapCard from './AppOriginMapCard.vue'
import AppAiAgronomistPage from './AppAiAgronomistPage.vue'
import AppCarbonWalletPage from './AppCarbonWalletPage.vue'

const SoilStrata3D = defineAsyncComponent(() => import('../SoilStrata3D.vue'))
const SmartMachinery3D = defineAsyncComponent(() => import('../SmartMachinery3D.vue'))
const RuralSandbox3D = defineAsyncComponent(() => import('../RuralSandbox3D.vue'))

const props = defineProps({
  framed: { type: Boolean, default: true },
  initialTab: { type: String, default: 'home' }
})

const emit = defineEmits(['open-admin', 'open-split'])

const router = useRouter()
const store = useRuralPlatformStore()

const activeTab = ref(props.initialTab)
const scrollArea = ref(null)

/* ---------------- 全屏子页面状态 ---------------- */
const active3D = ref(null) // 'strata' | 'machinery' | 'sandbox' | null
const activeLiveCamId = ref(null)
const showTracePage = ref(false)
const traceCodeTarget = ref('')
const activeAdoptionId = ref(null)
const showSolarPage = ref(false)
const showAiPage = ref(false)
const showCarbonPage = ref(false)
const isSpeakingBrief = ref(false)
const selectedOrder = ref(null)

const hall3DMeta = {
  strata: { label: '黑土标本', route: '/strata-3d', component: SoilStrata3D },
  machinery: { label: '北斗农机', route: '/machinery-3d', component: SmartMachinery3D },
  sandbox: { label: '生态沙盘', route: '/sandbox-3d', component: RuralSandbox3D }
}

function closeOverlays() {
  active3D.value = null
  activeLiveCamId.value = null
  showTracePage.value = false
  activeAdoptionId.value = null
  showSolarPage.value = false
  showAiPage.value = false
  showCarbonPage.value = false
}

function setTab(tab) {
  closeOverlays()
  activeTab.value = tab
  if (scrollArea.value) scrollArea.value.scrollTop = 0
}

function open3DHall(key = 'machinery') {
  closeOverlays()
  active3D.value = key
}

function openLiveCam(camId) {
  closeOverlays()
  activeLiveCamId.value = camId || store.liveCams[0]?.id
}

function openTrace(code = '') {
  closeOverlays()
  traceCodeTarget.value = code
  showTracePage.value = true
}

function openSolar() {
  closeOverlays()
  showSolarPage.value = true
}

function openCert(adoptionId) {
  closeOverlays()
  activeAdoptionId.value = adoptionId || store.adoptions[0]?.id
}

function openAi() {
  closeOverlays()
  showAiPage.value = true
}

function openCarbon() {
  closeOverlays()
  showCarbonPage.value = true
}

function speakDailyBrief() {
  if (!('speechSynthesis' in window)) {
    showToast('当前浏览器不支持语音合成播报')
    return
  }
  window.speechSynthesis.cancel()
  if (isSpeakingBrief.value) {
    isSpeakingBrief.value = false
    return
  }
  const text = `欢迎来到吉韵禾野。今日节气${store.appConfig.solarTerm}，吉林黑土有机质实测4.82%，表层墒情68%，当前有${onlineMachineryCount.value}台北斗无人农机在线作业。最新置顶村务公告：${store.pinnedNotice?.title || '一切平稳有序'}。`
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  utter.rate = 1.02
  utter.onend = () => { isSpeakingBrief.value = false }
  utter.onerror = () => { isSpeakingBrief.value = false }
  isSpeakingBrief.value = true
  window.speechSynthesis.speak(utter)
  showToast('正在语音播报今日黑土农情…')
}

defineExpose({ setTab, activeTab, open3DHall, openLiveCam, openTrace, openSolar, openCert, openAi, openCarbon })

/* ---------------- 首页主视觉轮播 ---------------- */
const heroSlide = ref(0)
const heroSlides = computed(() => [
  {
    tag: '乡村振兴 · 黑土数字计划',
    title: store.appConfig.heroHeadline,
    sub: store.appConfig.heroSubline,
    image: '/art-hd/golden-rice.jpg',
    cta: '认养一亩黑土田',
    action: () => setTab('adopt')
  },
  {
    tag: '国家级非遗 · 冰湖直发',
    title: '查干湖冬捕季 · 冰下鲜鱼冷链直达',
    sub: '坚持抓大放小生态疏网 · 顺丰锁鲜 48 小时送达餐桌',
    image: '/art-hd/chagan-winter.jpg',
    cta: '进入冬捕慢直播',
    action: () => openLiveCam('cam-2')
  },
  {
    tag: '长春智造 · 北斗厘米级',
    title: '260 马力北斗无人农机 3D 沉浸解构',
    sub: '手机竖屏原生 3D 渲染 · 触控旋转与零件爆炸分解',
    image: '/art-custom/changchun-tractor.jpg',
    cta: '立即体验 3D 农机',
    action: () => open3DHall('machinery')
  }
])

let slideTimer = 0
onMounted(() => {
  slideTimer = window.setInterval(() => {
    heroSlide.value = (heroSlide.value + 1) % 3
  }, 5500)
})
onUnmounted(() => clearInterval(slideTimer))

/* ---------------- Toast 提示 ---------------- */
const toastMsg = ref('')
let toastTimer = 0
function showToast(msg) {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastMsg.value = '' }, 2600)
}

/* ---------------- 集市筛选、排序、收藏与弹窗 ---------------- */
const marketSearch = ref('')
const marketCategory = ref('全部')
const marketSort = ref('default') // 'default' | 'sales' | 'price' | 'share'
const categories = computed(() => {
  const set = new Set(['全部'])
  store.activeProducts.forEach((p) => set.add(p.category))
  return [...set]
})

const filteredProducts = computed(() => {
  const q = marketSearch.value.trim().toLowerCase()
  const list = store.activeProducts.filter((p) => {
    const matchCat = marketCategory.value === '全部' || p.category === marketCategory.value
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.origin.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
    return matchCat && matchQ
  })
  if (marketSort.value === 'sales') return [...list].sort((a, b) => b.sales - a.sales)
  if (marketSort.value === 'price') return [...list].sort((a, b) => a.price - b.price)
  if (marketSort.value === 'share') return [...list].sort((a, b) => b.farmerSharePct - a.farmerSharePct)
  return list
})

const selectedProduct = ref(null)
const showCartSheet = ref(false)
const orderSuccessReceipt = ref(null)
const selectedCouponId = ref('')
const checkoutForm = ref({
  customer: '林晓禾',
  phone: '138****4021',
  address: '吉林省长春市南关区人民大街 108 号'
})

const appliedDiscount = computed(() => {
  const cpn = store.coupons.find((c) => c.id === selectedCouponId.value)
  if (!cpn || store.cartTotal < cpn.minSpend) return 0
  return cpn.amount
})

const finalPayAmount = computed(() => Number(Math.max(0.1, store.cartTotal - appliedDiscount.value).toFixed(2)))

function isFav(id) {
  return store.favorites.includes(id)
}

function quickAdd(product) {
  store.addToCart(product, 1)
  showToast(`已将「${product.name}」加入助农购物袋`)
}

function submitCartOrder() {
  const firstProd = store.products.find((p) => p.id === store.cart[0]?.productId)
  const sharePct = firstProd?.farmerSharePct || 78
  const coopName = firstProd?.coop || '吉林黑土助农合作社'
  const order = store.placeOrder({ ...checkoutForm.value, discount: appliedDiscount.value })
  if (!order) return
  showCartSheet.value = false
  selectedCouponId.value = ''
  orderSuccessReceipt.value = {
    orderId: order.id,
    traceCode: order.traceCode,
    total: order.total,
    farmerGain: Number((order.total * sharePct / 100).toFixed(1)),
    sharePct,
    coopName,
    points: Math.round(order.total)
  }
  showToast(`下单成功 (${order.id})！已实时同步至管理后台`)
}

/* ---------------- 认养分类与弹窗 ---------------- */
const adoptCategory = ref('全部')
const adoptCategories = computed(() => {
  const set = new Set(['全部'])
  store.plots.forEach((p) => { if (p.category) set.add(p.category) })
  return [...set]
})
const filteredPlots = computed(() => {
  if (adoptCategory.value === '全部') return store.plots
  return store.plots.filter((p) => p.category === adoptCategory.value)
})

const selectedPlot = ref(null)
const adoptShares = ref(1)
function openPlotSheet(plot) {
  selectedPlot.value = plot
  adoptShares.value = 1
}
function confirmAdopt() {
  if (!selectedPlot.value) return
  const res = store.submitAdoption({
    plotId: selectedPlot.value.id,
    adopter: store.appConfig.userProfile.name,
    phone: '138****4021',
    shares: adoptShares.value
  })
  if (res) {
    selectedPlot.value = null
    showToast(`认养申请 ${res.plotCode} 已提交，等待后台审核`)
  } else {
    showToast('剩余份数不足')
  }
}

/* ---------------- 项目详情弹窗 ---------------- */
const selectedProject = ref(null)

/* ---------------- 村务反馈表单 ---------------- */
const fbType = ref('农机预约')
const fbVillage = ref('九台区土们岭村')
const fbContent = ref('')
const fbTypes = ['农机预约', '农技咨询', '村务建议', '助农反馈']

function submitVillageFeedback() {
  if (!fbContent.value.trim()) {
    showToast('请先填写需要反馈或预约的具体内容')
    return
  }
  store.submitFeedback({
    user: `${store.appConfig.userProfile.name}（App用户）`,
    type: fbType.value,
    village: fbVillage.value,
    content: fbContent.value
  })
  fbContent.value = ''
  showToast('已提交至乡村治理后台，请留意官方回复')
}

/* ---------------- 统计与样式辅助 ---------------- */
const onlineMachineryCount = computed(() => store.machinery.filter((m) => m.status === '作业中').length)
const myOrders = computed(() => store.orders.slice(0, 6))
const myAdoptions = computed(() => store.adoptions)
const favProducts = computed(() => store.products.filter((p) => store.favorites.includes(p.id)))

const navItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'market', label: '集市', icon: ShoppingBag },
  { id: 'adopt', label: '认养', icon: Sprout },
  { id: 'village', label: '村务', icon: Megaphone },
  { id: 'profile', label: '我的', icon: User }
]

const statusBadgeClass = (status) => {
  if (status === '已发货' || status === '已生效' || status === '已回复' || status === '已验收') {
    return 'bg-[#2E5A44]/12 text-[#1F4E3D] border-[#2E5A44]/20'
  }
  if (status === '已完成') {
    return 'bg-[#1C1B18]/8 text-[#5A564E] border-[#1C1B18]/12'
  }
  return 'bg-[#C88A32]/15 text-[#9A6518] border-[#C88A32]/30'
}
</script>

<template>
  <div
    class="rural-app relative flex flex-col bg-[#F7F3EA] text-[#1C1B18] overflow-hidden select-none"
    :class="framed ? 'w-full h-full rounded-[2.6rem]' : 'h-[100dvh] w-full md:max-w-[430px] md:mx-auto md:shadow-2xl'"
    style="background-image: linear-gradient(180deg, rgba(247,243,234,0.14) 0%, rgba(247,243,234,0.34) 48%, rgba(247,243,234,0.10) 100%), url('/art-custom/mobile-app-bg.jpg'); background-size: cover; background-position: center;"
  >
    <!-- 顶部状态栏（透出青绿鎏金水墨云雾底纹） -->
    <div
      v-if="framed"
      class="shrink-0 h-11 px-7 pt-2.5 flex items-center justify-between bg-transparent z-20 relative"
    >
      <span class="text-[12px] font-semibold tracking-tight text-[#1C1B18]">17:20</span>
      <div class="w-[104px] h-[26px] rounded-full bg-[#111110] flex items-center justify-end px-2.5 shadow-inner">
        <span class="w-2.5 h-2.5 rounded-full bg-[#1E2E26] ring-1 ring-white/15"></span>
      </div>
      <div class="flex items-center gap-1.5 text-[11px] font-semibold text-[#1C1B18]">
        <span>5G</span>
        <div class="w-5 h-2.5 rounded-[3px] border border-[#1C1B18]/70 p-[1.5px] flex items-center">
          <div class="w-full h-full bg-[#1C1B18] rounded-[1px]"></div>
        </div>
      </div>
    </div>

    <!-- 主内容滚动区 -->
    <div ref="scrollArea" class="flex-1 overflow-y-auto overscroll-contain pb-24 app-scroll">

      <!-- ==================== TAB 1: 首页 ==================== -->
      <div v-if="activeTab === 'home'" class="relative">
        <div class="relative px-4 pt-2 pb-4 space-y-4">
          <!-- 顶部定位 + 节气胶囊 + 扫码 + 通知（通透暖白微胶囊保证青绿水墨底上的高对比度） -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0 px-2 py-1 rounded-2xl bg-white/72 backdrop-blur-md border border-white/60 shadow-2xs">
              <BrandLogo :size="32" />
              <div class="min-w-0 pr-1">
                <div class="flex items-center gap-1.5">
                  <span class="font-editorial text-[14px] font-bold text-[#16261F] whitespace-nowrap shrink-0">{{ store.appConfig.brandName }}</span>
                  <button
                    type="button"
                    @click="openSolar"
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#1F4E3D] text-[#F5D393] hover:bg-[#16261F] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    {{ store.appConfig.solarTerm.split(' · ')[0] }}
                  </button>
                </div>
                <div class="flex items-center gap-1 text-[9.5px] text-[#3E3B35] font-medium truncate">
                  <MapPin :size="9.5" class="text-[#B8761A] shrink-0" />
                  <span class="truncate">{{ store.appConfig.regionLabel }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                @click="openAi()"
                class="h-8 px-2.5 rounded-full bg-gradient-to-r from-[#16261F] to-[#1F4E3D] text-[#F5D393] border border-[#F0C275]/35 flex items-center gap-1 text-[10px] font-bold shadow-xs cursor-pointer active:scale-95 transition-transform"
                title="AI 智慧农艺师"
              >
                <Sparkles :size="12" />
                <span>AI农艺</span>
              </button>
              <button
                type="button"
                @click="openTrace()"
                class="w-8 h-8 rounded-full bg-white/90 border border-[#1C1B18]/8 flex items-center justify-center text-[#1F4E3D] shadow-2xs cursor-pointer"
                aria-label="扫码溯源"
                title="一袋一码溯源"
              >
                <QrCode :size="15" />
              </button>
              <button
                type="button"
                @click="setTab('village')"
                class="relative w-8 h-8 rounded-full bg-white/90 border border-[#1C1B18]/8 flex items-center justify-center text-[#1C1B18] shadow-2xs cursor-pointer"
                aria-label="查看村务通知"
              >
                <Bell :size="15" />
                <span v-if="store.notices.length" class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B83828]"></span>
              </button>
            </div>
          </div>

          <!-- 搜索条 -->
          <button
            type="button"
            @click="setTab('market')"
            class="w-full h-10 px-3.5 rounded-2xl bg-white/95 border border-[#1C1B18]/8 flex items-center justify-between text-[12px] text-[#7A746A] shadow-[0_6px_20px_-10px_rgba(22,38,31,0.16)] cursor-pointer text-left"
          >
            <span class="flex items-center gap-2 truncate">
              <Search :size="14" class="text-[#1F4E3D] shrink-0" />
              <span class="truncate">搜九台贡米、查干湖胖头鱼、云认养…</span>
            </span>
            <span class="shrink-0 px-2 py-0.5 rounded-full bg-[#FDF4E6] text-[#9A6518] text-[9.5px] font-bold">地理标志</span>
          </button>

          <!-- 画报级多幕主视觉轮播 -->
          <div class="relative rounded-[1.5rem] overflow-hidden h-[204px] shadow-[0_18px_36px_-16px_rgba(22,38,31,0.42)]">
            <img
              :src="heroSlides[heroSlide].image"
              :alt="heroSlides[heroSlide].title"
              class="w-full h-full object-cover transition-all duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#12211B]/95 via-[#12211B]/35 to-black/10"></div>

            <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-white/90 text-[#16261F] text-[10px] font-bold tracking-wide shadow-xs">
                {{ heroSlides[heroSlide].tag }}
              </span>
              <!-- 指示点 -->
              <div class="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full">
                <button
                  v-for="(_, idx) in heroSlides"
                  :key="idx"
                  type="button"
                  @click="heroSlide = idx"
                  class="h-1.5 rounded-full transition-all cursor-pointer"
                  :class="heroSlide === idx ? 'w-4 bg-[#F0C275]' : 'w-1.5 bg-white/45'"
                  :aria-label="`切换第 ${idx + 1} 张轮播`"
                ></button>
              </div>
            </div>

            <div class="absolute bottom-3.5 left-3.5 right-3.5 text-[#F7F4EE]">
              <h2 class="font-editorial text-[19px] leading-snug font-bold tracking-tight">
                {{ heroSlides[heroSlide].title }}
              </h2>
              <p class="text-[11px] text-[#F7F4EE]/82 mt-1 line-clamp-1">
                {{ heroSlides[heroSlide].sub }}
              </p>
              <div class="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  @click="heroSlides[heroSlide].action()"
                  class="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D49A42] to-[#C88A32] text-[#16261F] text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-transform shadow-sm"
                >
                  <span>{{ heroSlides[heroSlide].cta }}</span>
                  <ChevronRight :size="12" />
                </button>
                <button
                  type="button"
                  @click="openTrace()"
                  class="px-3 py-1.5 rounded-full bg-white/16 backdrop-blur-md text-white text-[11px] font-medium border border-white/25 cursor-pointer"
                >
                  一袋一码溯源
                </button>
              </div>
            </div>
          </div>

          <!-- 「黑土慢直播 · 产地直击」横滑 Story 圈 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
                <h3 class="font-editorial text-[14px] font-bold text-[#16261F]">黑土慢直播 · 产地实景</h3>
              </div>
              <span class="font-mono text-[10px] text-[#1F4E3D] font-semibold">{{ store.liveCamOnlineCount }} 路机位在线</span>
            </div>
            <div class="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
              <button
                v-for="cam in store.liveCams"
                :key="cam.id"
                type="button"
                @click="openLiveCam(cam.id)"
                class="shrink-0 flex flex-col items-center gap-1.5 w-[72px] cursor-pointer group"
              >
                <div
                  class="relative p-[2.5px] rounded-full transition-transform group-active:scale-95"
                  :class="cam.status === '直播中'
                    ? 'bg-gradient-to-tr from-[#B83828] via-[#C88A32] to-[#2E5A44]'
                    : 'bg-[#1C1B18]/18'"
                >
                  <div class="p-[2px] rounded-full bg-[#F7F4EE]">
                    <img :src="cam.image" :alt="cam.shortTitle" class="w-13 h-13 rounded-full object-cover" />
                  </div>
                  <span
                    class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded-full text-[8px] font-bold tracking-wider text-white shadow-xs whitespace-nowrap"
                    :class="cam.status === '直播中' ? 'bg-[#B83828]' : 'bg-[#6E6960]'"
                  >
                    {{ cam.status === '直播中' ? 'LIVE' : '回放' }}
                  </span>
                </div>
                <span class="text-[10.5px] font-semibold text-[#1C1B18] truncate w-full text-center">{{ cam.shortTitle }}</span>
              </button>
            </div>
          </div>

          <!-- 5 宫格高定金刚区 -->
          <div class="grid grid-cols-5 gap-1.5">
            <button
              type="button"
              @click="setTab('market')"
              class="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl bg-white border border-[#1C1B18]/6 shadow-2xs cursor-pointer active:scale-95 transition-transform"
            >
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FDF4E6] to-[#F7E3C0] text-[#B8761A] flex items-center justify-center">
                <ShoppingBag :size="16" />
              </div>
              <span class="text-[10px] font-bold text-[#1C1B18]">风物直采</span>
            </button>
            <button
              type="button"
              @click="setTab('adopt')"
              class="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl bg-white border border-[#1C1B18]/6 shadow-2xs cursor-pointer active:scale-95 transition-transform"
            >
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EAF3EE] to-[#D1E7DB] text-[#1F4E3D] flex items-center justify-center">
                <Sprout :size="16" />
              </div>
              <span class="text-[10px] font-bold text-[#1C1B18]">云认养</span>
            </button>
            <button
              type="button"
              @click="openTrace()"
              class="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl bg-white border border-[#1C1B18]/6 shadow-2xs cursor-pointer active:scale-95 transition-transform"
            >
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FBECE9] to-[#F5D0C9] text-[#B83828] flex items-center justify-center">
                <QrCode :size="16" />
              </div>
              <span class="text-[10px] font-bold text-[#1C1B18]">一袋一码</span>
            </button>
            <button
              type="button"
              @click="openSolar()"
              class="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl bg-white border border-[#1C1B18]/6 shadow-2xs cursor-pointer active:scale-95 transition-transform"
            >
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EEF2FA] to-[#D9E4F5] text-[#2F5380] flex items-center justify-center">
                <CalendarDays :size="16" />
              </div>
              <span class="text-[10px] font-bold text-[#1C1B18]">农时节气</span>
            </button>
            <button
              type="button"
              @click="open3DHall('sandbox')"
              class="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl bg-white border border-[#1C1B18]/6 shadow-2xs cursor-pointer active:scale-95 transition-transform"
            >
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1F4E3D] to-[#16261F] text-[#F0C275] flex items-center justify-center">
                <Compass :size="16" />
              </div>
              <span class="text-[10px] font-bold text-[#1C1B18]">3D 沙盘</span>
            </button>
          </div>

          <!-- 实时村务公告条（后台实时置顶推送） -->
          <button
            v-if="store.pinnedNotice"
            type="button"
            @click="setTab('village')"
            class="w-full px-3 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFFDF7] to-[#FDF6E8] border border-[#C88A32]/30 flex items-center gap-2 text-left cursor-pointer shadow-2xs"
          >
            <span class="shrink-0 px-1.5 py-0.5 rounded-md bg-[#C88A32] text-[#16261F] text-[9.5px] font-bold">
              {{ store.pinnedNotice.tag }}
            </span>
            <span class="text-[11.5px] font-semibold text-[#1C1B18] truncate flex-1">
              {{ store.pinnedNotice.title }}
            </span>
            <ChevronRight :size="13" class="text-[#8E887E] shrink-0" />
          </button>

          <!-- 黑土农情实时遥测卡（融入青绿鎏金插画底纹） -->
          <div
            class="rounded-[1.4rem] text-[#F7F4EE] p-4 shadow-lg relative overflow-hidden border border-[#F0C275]/25"
            style="background-image: linear-gradient(135deg, rgba(16,32,25,0.86) 0%, rgba(22,42,33,0.72) 100%), url('/art-custom/app-header-banner.jpg'); background-size: cover; background-position: center;"
          >
            <div class="flex items-center justify-between mb-3 relative z-10">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></span>
                <span class="text-[12.5px] font-bold tracking-wide">黑土农情实时遥测</span>
              </div>
              <button
                type="button"
                @click="speakDailyBrief"
                class="px-2 py-0.5 rounded-full text-[9.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                :class="isSpeakingBrief ? 'bg-[#C88A32] text-[#16261F]' : 'bg-white/12 text-[#F0C275] hover:bg-white/20'"
              >
                <Volume2 :size="10.5" />
                <span>{{ isSpeakingBrief ? '播报中…' : '语音播报' }}</span>
              </button>
            </div>
            <div class="grid grid-cols-3 gap-2 relative z-10">
              <div class="rounded-xl bg-white/7 p-2.5 border border-white/10 space-y-1">
                <div class="flex items-center gap-1 text-[10px] text-[#F7F4EE]/70">
                  <Leaf :size="11" class="text-[#F0C275]" />
                  <span>有机质</span>
                </div>
                <div class="font-mono text-[16px] font-bold text-[#F0C275] leading-none">4.82%</div>
                <div class="h-1 rounded-full bg-white/12 overflow-hidden">
                  <div class="h-full w-[86%] rounded-full bg-[#F0C275]"></div>
                </div>
                <div class="text-[9px] text-[#86EFAC]">优 · 护土达标</div>
              </div>
              <div class="rounded-xl bg-white/7 p-2.5 border border-white/10 space-y-1">
                <div class="flex items-center gap-1 text-[10px] text-[#F7F4EE]/70">
                  <Droplets :size="11" class="text-[#7DD3FC]" />
                  <span>表层墒情</span>
                </div>
                <div class="font-mono text-[16px] font-bold text-white leading-none">68%</div>
                <div class="h-1 rounded-full bg-white/12 overflow-hidden">
                  <div class="h-full w-[68%] rounded-full bg-[#7DD3FC]"></div>
                </div>
                <div class="text-[9px] text-[#F7F4EE]/65">适宜越冬蓄墒</div>
              </div>
              <div class="rounded-xl bg-white/7 p-2.5 border border-white/10 space-y-1">
                <div class="flex items-center gap-1 text-[10px] text-[#F7F4EE]/70">
                  <Cpu :size="11" class="text-[#A7F3D0]" />
                  <span>在线农机</span>
                </div>
                <div class="font-mono text-[16px] font-bold text-white leading-none">{{ onlineMachineryCount }}/{{ store.machinery.length }}</div>
                <div class="h-1 rounded-full bg-white/12 overflow-hidden">
                  <div class="h-full rounded-full bg-[#4ADE80]" :style="{ width: `${(onlineMachineryCount / Math.max(1, store.machinery.length)) * 100}%` }"></div>
                </div>
                <div class="text-[9px] text-[#F7F4EE]/65">北斗 ±2.5cm</div>
              </div>
            </div>
          </div>

          <!-- 吉林四大风物产区交互图鉴 -->
          <AppOriginMapCard
            @open-product="(p) => { selectedProduct = p }"
            @open-cam="(id) => openLiveCam(id)"
          />

          <!-- 3D 沉浸展厅三联卡（App 竖屏原生直览） -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-editorial text-[14.5px] font-bold text-[#16261F]">3D 乡村振兴沉浸展厅</h3>
              <button type="button" @click="open3DHall('strata')" class="text-[11px] text-[#1F4E3D] font-bold flex items-center gap-0.5 cursor-pointer">
                <span>手机屏直览</span>
                <ChevronRight :size="12" />
              </button>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="open3DHall('strata')"
                class="group relative h-26 rounded-2xl overflow-hidden text-left cursor-pointer shadow-xs"
              >
                <img src="/art-hd/soil-specimen.jpg" alt="3D黑土剖面" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-transparent"></div>
                <span class="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-black/50 text-[#F0C275] font-mono text-[8.5px] font-bold">3D</span>
                <div class="absolute bottom-2 left-2 right-2 text-white">
                  <Layers :size="12" class="text-[#F0C275] mb-0.5" />
                  <div class="text-[11px] font-bold leading-tight">黑土标本</div>
                  <div class="text-[8.5px] text-white/70">分层剖析</div>
                </div>
              </button>
              <button
                type="button"
                @click="open3DHall('machinery')"
                class="group relative h-26 rounded-2xl overflow-hidden text-left cursor-pointer shadow-xs"
              >
                <img src="/art-custom/changchun-tractor.jpg" alt="3D北斗农机" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-transparent"></div>
                <span class="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-black/50 text-[#F0C275] font-mono text-[8.5px] font-bold">3D</span>
                <div class="absolute bottom-2 left-2 right-2 text-white">
                  <Tractor :size="12" class="text-[#F0C275] mb-0.5" />
                  <div class="text-[11px] font-bold leading-tight">北斗农机</div>
                  <div class="text-[8.5px] text-white/70">爆炸解构</div>
                </div>
              </button>
              <button
                type="button"
                @click="open3DHall('sandbox')"
                class="group relative h-26 rounded-2xl overflow-hidden text-left cursor-pointer shadow-xs"
              >
                <img src="/art-hd/songliao-plain.jpg" alt="3D生态沙盘" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-transparent"></div>
                <span class="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-black/50 text-[#F0C275] font-mono text-[8.5px] font-bold">3D</span>
                <div class="absolute bottom-2 left-2 right-2 text-white">
                  <Compass :size="12" class="text-[#F0C275] mb-0.5" />
                  <div class="text-[11px] font-bold leading-tight">生态沙盘</div>
                  <div class="text-[8.5px] text-white/70">六视点漫游</div>
                </div>
              </button>
            </div>
          </div>

          <!-- 产地直采热卖横滑橱窗 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-editorial text-[14.5px] font-bold text-[#16261F]">当季助农风物热卖</h3>
              <button type="button" @click="setTab('market')" class="text-[11px] text-[#1F4E3D] font-bold flex items-center gap-0.5 cursor-pointer">
                <span>逛集市</span>
                <ChevronRight :size="12" />
              </button>
            </div>
            <div class="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              <div
                v-for="item in store.activeProducts.slice(0, 8)"
                :key="item.id"
                class="shrink-0 w-[148px] bg-white rounded-2xl overflow-hidden border border-[#1C1B18]/7 shadow-2xs"
              >
                <div class="relative h-24 cursor-pointer" @click="selectedProduct = item">
                  <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                  <span class="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-[#16261F]/85 text-[#F0C275] text-[8.5px] font-bold">{{ item.badge }}</span>
                </div>
                <div class="p-2.5">
                  <div class="text-[11.5px] font-bold text-[#1C1B18] truncate cursor-pointer" @click="selectedProduct = item">{{ item.name }}</div>
                  <div class="text-[9.5px] text-[#6E6960] truncate">{{ item.origin }}</div>
                  <div class="flex items-center justify-between mt-2">
                    <span class="font-mono text-[13.5px] font-bold text-[#B83828]">¥{{ item.price }}</span>
                    <button
                      type="button"
                      @click="quickAdd(item)"
                      class="w-6 h-6 rounded-full bg-[#1F4E3D] text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                      aria-label="加入购物袋"
                    >
                      <Plus :size="12" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 重点助农项目档案 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-editorial text-[14.5px] font-bold text-[#16261F]">振兴重点项目档案</h3>
              <span class="text-[10.5px] text-[#1F4E3D] font-semibold">带动 {{ store.totalHelpedHouseholds }} 户增收</span>
            </div>
            <div class="space-y-2.5">
              <div
                v-for="prj in store.projects"
                :key="prj.id"
                @click="selectedProject = prj"
                class="bg-white rounded-2xl p-2.5 border border-[#1C1B18]/6 shadow-2xs flex gap-3 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <img :src="prj.cover" :alt="prj.name" class="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div class="flex items-center justify-between gap-1">
                      <span class="text-[9.5px] font-bold text-[#1F4E3D] bg-[#EAF3EE] px-1.5 py-0.5 rounded">{{ prj.category }}</span>
                      <span class="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full border" :class="statusBadgeClass(prj.status)">{{ prj.status }}</span>
                    </div>
                    <h4 class="text-[12.5px] font-bold text-[#1C1B18] mt-1 line-clamp-1">{{ prj.name }}</h4>
                    <p class="text-[10.5px] text-[#6E6960] truncate">{{ prj.village }} · 带动 {{ prj.households }} 户</p>
                  </div>
                  <div class="flex items-center gap-2 mt-1.5">
                    <div class="flex-1 h-1.5 rounded-full bg-[#1C1B18]/8 overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-[#1F4E3D] to-[#C88A32] transition-all duration-500" :style="{ width: `${prj.progress}%` }"></div>
                    </div>
                    <span class="font-mono text-[10px] font-bold text-[#1F4E3D]">{{ prj.progress }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== TAB 2: 助农集市 ==================== -->
      <div v-else-if="activeTab === 'market'" class="px-4 pt-3 pb-6 space-y-3.5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-editorial text-[20px] font-bold text-[#16261F]">风物助农集市</h2>
            <p class="text-[11px] text-[#6E6960]">产地直发 · 一袋一码 · 收益透明直达合作社</p>
          </div>
          <button
            type="button"
            @click="showCartSheet = true"
            class="relative px-3 py-1.5 rounded-full bg-[#16261F] text-[#F7F4EE] text-[11.5px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingBag :size="13" class="text-[#F0C275]" />
            <span>购物袋</span>
            <span v-if="store.cartCount" class="px-1.5 py-0.2 rounded-full bg-[#C88A32] text-[#16261F] text-[10px] font-bold">{{ store.cartCount }}</span>
          </button>
        </div>

        <!-- 助农补贴专享横幅 -->
        <div class="rounded-2xl bg-gradient-to-r from-[#1F4E3D] to-[#2C644F] text-[#F7F4EE] px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-xs">
          <div class="flex items-center gap-2 min-w-0">
            <Ticket :size="18" class="text-[#F0C275] shrink-0" />
            <div class="min-w-0">
              <div class="text-[11.5px] font-bold truncate">黑土助农礼券已到账（满 60 减 10 / 满 199 减 25）</div>
              <div class="text-[9.5px] text-white/75">结算时可直接勾选抵扣，补贴不扣减农户分成</div>
            </div>
          </div>
          <span class="shrink-0 px-2 py-0.5 rounded-full bg-[#F0C275] text-[#16261F] text-[9.5px] font-bold">可用 2 张</span>
        </div>

        <!-- 搜索输入框 -->
        <div class="relative">
          <Search :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A746A]" />
          <input
            v-model="marketSearch"
            type="search"
            placeholder="搜索农产品名称、合作社或产地…"
            class="w-full h-9.5 pl-9 pr-3 rounded-xl bg-white border border-[#1C1B18]/10 text-[12px] text-[#1C1B18] placeholder:text-[#9A948A] focus:outline-none focus:border-[#1F4E3D]"
          />
        </div>

        <!-- 分类胶囊 -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            @click="marketCategory = cat"
            class="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer"
            :class="marketCategory === cat ? 'bg-[#16261F] text-[#F0C275]' : 'bg-white text-[#5A564E] border border-[#1C1B18]/8'"
          >
            {{ cat }}
          </button>
        </div>

        <!-- 排序筛选条 -->
        <div class="flex items-center justify-between gap-2 px-1 text-[10.5px]">
          <div class="flex items-center gap-3">
            <button
              v-for="s in [
                { id: 'default', label: '综合推荐' },
                { id: 'sales', label: '销量优先' },
                { id: 'price', label: '价格升序' },
                { id: 'share', label: '助农分成最高' }
              ]"
              :key="s.id"
              type="button"
              @click="marketSort = s.id"
              class="cursor-pointer transition-colors"
              :class="marketSort === s.id ? 'font-bold text-[#1F4E3D] underline underline-offset-4' : 'text-[#6E6960]'"
            >
              {{ s.label }}
            </button>
          </div>
          <span class="font-mono text-[9.5px] text-[#8E887E]">{{ filteredProducts.length }} 款</span>
        </div>

        <!-- 2列商品网格 -->
        <div v-if="filteredProducts.length" class="grid grid-cols-2 gap-2.5">
          <div
            v-for="item in filteredProducts"
            :key="item.id"
            class="bg-white rounded-2xl overflow-hidden border border-[#1C1B18]/7 shadow-2xs flex flex-col"
          >
            <div class="relative h-29 cursor-pointer" @click="selectedProduct = item">
              <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
              <span class="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-[#16261F]/85 text-[#F0C275] text-[9px] font-bold backdrop-blur-xs">
                {{ item.badge }}
              </span>
              <button
                type="button"
                @click.stop="store.toggleFavorite(item.id)"
                class="absolute top-2 right-2 w-6.5 h-6.5 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center cursor-pointer"
                aria-label="收藏商品"
              >
                <Heart :size="12" :class="isFav(item.id) ? 'fill-[#F87171] text-[#F87171]' : 'text-white'" />
              </button>
              <span class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/55 text-white text-[9px] font-mono">
                助农 {{ item.farmerSharePct }}%
              </span>
            </div>
            <div class="p-2.5 flex-1 flex flex-col justify-between">
              <div class="cursor-pointer" @click="selectedProduct = item">
                <h4 class="text-[12.5px] font-bold text-[#1C1B18] leading-snug line-clamp-1">{{ item.name }}</h4>
                <p class="text-[10px] text-[#6E6960] mt-0.5 line-clamp-1">{{ item.origin }}</p>
              </div>
              <div class="flex items-end justify-between mt-2.5">
                <div>
                  <div class="flex items-baseline gap-1">
                    <span class="text-[10px] font-bold text-[#B83828]">¥</span>
                    <span class="font-mono text-[15px] font-bold text-[#B83828] leading-none">{{ item.price }}</span>
                    <span class="font-mono text-[9.5px] text-[#9A948A] line-through">¥{{ item.originalPrice }}</span>
                  </div>
                  <div class="text-[9.5px] text-[#8E887E] mt-0.5">余 {{ item.stock }} · 销 {{ item.sales }}</div>
                </div>
                <button
                  type="button"
                  @click="quickAdd(item)"
                  class="w-7 h-7 rounded-full bg-[#1F4E3D] text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform shadow-xs"
                  aria-label="加入购物袋"
                >
                  <Plus :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="py-12 text-center text-[12px] text-[#6E6960]">暂无符合条件的在售农产品</div>
      </div>

      <!-- ==================== TAB 3: 云认养 ==================== -->
      <div v-else-if="activeTab === 'adopt'" class="px-4 pt-3 pb-6 space-y-4">
        <div
          class="rounded-[1.45rem] text-[#F7F4EE] p-4 relative overflow-hidden shadow-md border border-[#F0C275]/25"
          style="background-image: linear-gradient(135deg, rgba(18,42,32,0.86), rgba(15,31,24,0.72)), url('/art-custom/app-header-banner.jpg'); background-size: cover; background-position: center;"
        >
          <div class="relative z-10">
            <span class="text-[9.5px] font-mono tracking-[0.2em] text-[#F0C275]">CLOUD FARM ADOPTION</span>
            <h2 class="font-editorial text-[21px] font-bold mt-1">认养一亩黑土田</h2>
            <p class="text-[11px] text-[#F7F4EE]/82 mt-1 leading-relaxed">
              春耕托管、北斗监测、秋收直邮。点击下方「我的云农田」可远程测墒、召唤无人机巡田并领取黑金电子收藏证书。
            </p>
          </div>
          <Sprout :size="80" class="absolute -right-2 -bottom-3 text-white/8" />
        </div>

        <!-- 我的云农田（可点击进入实时看板与电子证书！） -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="font-editorial text-[14.5px] font-bold text-[#16261F]">我的云农田与电子证书</h3>
            <span class="text-[10.5px] text-[#1F4E3D] font-semibold">点击进入田间看板</span>
          </div>
          <div
            v-for="adp in myAdoptions"
            :key="adp.id"
            @click="openCert(adp.id)"
            class="bg-white rounded-2xl p-3.5 border border-[#C88A32]/30 shadow-2xs space-y-2 cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#EAF3EE] text-[#1F4E3D]">{{ adp.plotCode }}</span>
                <span class="text-[11px] text-[#6E6960]">{{ adp.shares }} 份 · ¥{{ adp.amount }}</span>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border" :class="statusBadgeClass(adp.status)">
                {{ adp.status }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="text-[13px] font-bold text-[#1C1B18]">{{ adp.plotName }}</div>
                <div class="text-[10.5px] text-[#C88A32] font-semibold mt-0.5">物候：{{ adp.stage }}</div>
              </div>
              <span class="shrink-0 px-2.5 py-1 rounded-full bg-[#16261F] text-[#F0C275] text-[10px] font-bold flex items-center gap-1">
                <Award :size="11" />
                <span>进田/证书</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 可认养示范地块列表（支持多元生态分类筛选） -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-editorial text-[14.5px] font-bold text-[#16261F]">精选黑土与林下认养项目</h3>
            <span class="font-mono text-[10px] text-[#1F4E3D] font-bold">共 {{ filteredPlots.length }} 项</span>
          </div>

          <!-- 认养类型胶囊 -->
          <div class="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              v-for="cat in adoptCategories"
              :key="cat"
              type="button"
              @click="adoptCategory = cat"
              class="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer"
              :class="adoptCategory === cat ? 'bg-[#16261F] text-[#F0C275]' : 'bg-white/90 text-[#5A564E] border border-[#1C1B18]/8'"
            >
              {{ cat }}
            </button>
          </div>

          <div
            v-for="plot in filteredPlots"
            :key="plot.id"
            class="bg-white rounded-2xl overflow-hidden border border-[#1C1B18]/8 shadow-xs"
          >
            <div class="relative h-33">
              <img :src="plot.image" :alt="plot.name" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/88 via-black/32 to-transparent"></div>
              <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/92 text-[#1F4E3D] font-mono text-[10px] font-bold">
                地块 {{ plot.code }}
              </span>
              <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#C88A32] text-[#16261F] text-[10px] font-bold">
                余 {{ plot.slotsLeft }}/{{ plot.totalSlots }} 份
              </span>
              <div class="absolute bottom-2.5 left-3 right-3 text-white">
                <div class="text-[14.5px] font-bold">{{ plot.name }}</div>
                <div class="text-[10.5px] text-white/82">{{ plot.location }} · {{ plot.area }}</div>
              </div>
            </div>
            <div class="p-3 space-y-2.5">
              <div class="grid grid-cols-3 gap-1.5 text-center bg-[#F8F6F1] rounded-xl p-2">
                <div>
                  <div class="text-[9.5px] text-[#6E6960]">有机质</div>
                  <div class="font-mono text-[12px] font-bold text-[#1F4E3D]">{{ plot.organicPct }}%</div>
                </div>
                <div>
                  <div class="text-[9.5px] text-[#6E6960]">土壤墒情</div>
                  <div class="font-mono text-[12px] font-bold text-[#1C1B18]">{{ plot.moisturePct }}%</div>
                </div>
                <div>
                  <div class="text-[9.5px] text-[#6E6960]">当前物候</div>
                  <div class="text-[10.5px] font-bold text-[#C88A32] truncate">{{ plot.stage.split(' · ')[0] }}</div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-[10.5px] text-[#5A564E]">{{ plot.expectedYield }}</div>
                  <div class="flex items-baseline gap-1 mt-0.5">
                    <span class="font-mono text-[16px] font-bold text-[#B83828]">¥{{ plot.priceYear }}</span>
                    <span class="text-[10px] text-[#6E6960]">/ 年</span>
                  </div>
                </div>
                <button
                  type="button"
                  @click="openPlotSheet(plot)"
                  class="px-3.5 py-2 rounded-xl bg-[#1F4E3D] text-white text-[11.5px] font-bold cursor-pointer active:scale-95 transition-transform"
                >
                  立即认养
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== TAB 4: 乡情村务 ==================== -->
      <div v-else-if="activeTab === 'village'" class="px-4 pt-3 pb-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-editorial text-[20px] font-bold text-[#16261F]">数字乡村 · 村务直通</h2>
            <p class="text-[11px] text-[#6E6960]">公告实时下发 · 农机一键预约 · 留言直达管理后台</p>
          </div>
          <button
            type="button"
            @click="openSolar"
            class="px-2.5 py-1.5 rounded-full bg-[#EAF3EE] text-[#1F4E3D] text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <CalendarDays :size="12" />
            <span>农时谱</span>
          </button>
        </div>

        <!-- 村务公告栏 -->
        <div class="space-y-2">
          <h3 class="text-[12.5px] font-bold text-[#1C1B18] flex items-center gap-1.5">
            <Megaphone :size="14" class="text-[#C88A32]" />
            <span>最新村务与农情公告</span>
          </h3>
          <div
            v-for="n in store.notices"
            :key="n.id"
            class="bg-white rounded-2xl p-3.5 border shadow-2xs"
            :class="n.pinned ? 'border-[#C88A32]/45 bg-[#FFFDF8]' : 'border-[#1C1B18]/7'"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5">
                <span class="px-1.5 py-0.5 rounded text-[9.5px] font-bold" :class="n.pinned ? 'bg-[#C88A32] text-[#16261F]' : 'bg-[#EAF3EE] text-[#1F4E3D]'">
                  {{ n.tag }}
                </span>
                <span v-if="n.pinned" class="text-[9.5px] font-bold text-[#B83828]">置顶公告</span>
              </div>
              <span class="font-mono text-[10px] text-[#8E887E]">{{ n.date }}</span>
            </div>
            <h4 class="text-[13px] font-bold text-[#1C1B18] mt-1.5 leading-snug">{{ n.title }}</h4>
            <p class="text-[11px] text-[#5A564E] mt-1 leading-relaxed">{{ n.content }}</p>
          </div>
        </div>

        <!-- 村情直报 / 农机预约表单 -->
        <div class="bg-white rounded-2xl p-3.5 border border-[#1C1B18]/8 shadow-xs space-y-2.5">
          <div class="flex items-center justify-between">
            <h3 class="text-[13px] font-bold text-[#1C1B18]">村情直报 / 农机预约</h3>
            <span class="text-[10px] text-[#1F4E3D] font-bold">实时同步后台</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="t in fbTypes"
              :key="t"
              type="button"
              @click="fbType = t"
              class="px-2.5 py-1 rounded-full text-[10.5px] font-bold cursor-pointer transition-colors"
              :class="fbType === t ? 'bg-[#16261F] text-[#F0C275]' : 'bg-[#F3F0E9] text-[#5A564E]'"
            >
              {{ t }}
            </button>
          </div>
          <input
            v-model="fbVillage"
            type="text"
            placeholder="所在村屯 / 合作社"
            class="w-full h-9 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/8 text-[11.5px] text-[#1C1B18] focus:outline-none focus:border-[#1F4E3D]"
          />
          <textarea
            v-model="fbContent"
            rows="3"
            placeholder="填写农机作业预约、病虫害咨询或村务建议，提交后将立即出现在管理后台…"
            class="w-full p-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/8 text-[11.5px] text-[#1C1B18] resize-none focus:outline-none focus:border-[#1F4E3D]"
          ></textarea>
          <button
            type="button"
            @click="submitVillageFeedback"
            class="w-full h-9.5 rounded-xl bg-[#1F4E3D] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] transition-transform"
          >
            <Send :size="13" />
            <span>提交至乡村治理中枢</span>
          </button>
        </div>

        <!-- 历史反馈与后台官方回复 -->
        <div class="space-y-2">
          <h3 class="text-[12.5px] font-bold text-[#1C1B18]">最新直报与官方回复</h3>
          <div
            v-for="fb in store.feedbacks"
            :key="fb.id"
            class="bg-white rounded-2xl p-3 border border-[#1C1B18]/7 space-y-1.5"
          >
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-[#1C1B18]">{{ fb.user }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full border font-semibold" :class="statusBadgeClass(fb.status)">
                {{ fb.status }}
              </span>
            </div>
            <p class="text-[11.5px] text-[#5A564E] leading-relaxed">{{ fb.content }}</p>
            <div class="text-[10px] text-[#8E887E] font-mono">{{ fb.type }} · {{ fb.village }} · {{ fb.time }}</div>
            <div v-if="fb.reply" class="mt-2 p-2.5 rounded-xl bg-[#EAF3EE] border border-[#2E5A44]/15 text-[11px] text-[#1F4E3D]">
              <span class="font-bold">后台官方回复：</span>{{ fb.reply }}
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== TAB 5: 我的 ==================== -->
      <div v-else-if="activeTab === 'profile'" class="px-4 pt-3 pb-6 space-y-4">
        <!-- 黑金翡翠质感会员卡（融入青绿鎏金山水底纹） -->
        <div
          class="rounded-[1.5rem] text-[#F7F4EE] p-4 relative overflow-hidden shadow-lg border border-[#F0C275]/35"
          style="background-image: linear-gradient(135deg, rgba(16,32,25,0.88), rgba(14,24,19,0.78)), url('/art-custom/app-header-banner.jpg'); background-size: cover; background-position: center;"
        >
          <div class="flex items-center gap-3 relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F0C275] to-[#C88A32] text-[#16261F] flex items-center justify-center font-editorial font-bold text-xl shrink-0 shadow-sm">
              林
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-[15.5px] font-bold">{{ store.appConfig.userProfile.name }}</span>
                <span class="px-2 py-0.5 rounded-full bg-[#F0C275]/20 text-[#F5D393] text-[9.5px] font-bold border border-[#F0C275]/30">
                  {{ store.appConfig.userProfile.role }}
                </span>
              </div>
              <div class="font-mono text-[10px] text-[#F7F4EE]/60 mt-0.5">NO. {{ store.appConfig.userProfile.memberNo }} · 吉林黑土守护计划</div>
            </div>
            <button
              type="button"
              @click="openCert()"
              class="px-2.5 py-1 rounded-full bg-[#F0C275] text-[#16261F] text-[10px] font-bold cursor-pointer shrink-0"
            >
              电子证书
            </button>
          </div>
          <div class="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center relative z-10">
            <div>
              <div class="font-mono text-[16px] font-bold text-[#F5D393]">{{ store.appConfig.userProfile.points }}</div>
              <div class="text-[10px] text-[#F7F4EE]/65">助农公益分</div>
            </div>
            <div>
              <div class="font-mono text-[16px] font-bold text-white">{{ store.appConfig.userProfile.helpedHouseholds }} 户</div>
              <div class="text-[10px] text-[#F7F4EE]/65">累计帮扶</div>
            </div>
            <button type="button" @click="openCarbon()" class="cursor-pointer group">
              <div class="font-mono text-[16px] font-bold text-[#86EFAC] group-hover:underline">{{ store.appConfig.userProfile.carbonSavedKg }}kg</div>
              <div class="text-[10px] text-[#F7F4EE]/75">黑土固碳 ›</div>
            </button>
          </div>
          <Award :size="92" class="absolute -right-3 -top-3 text-[#F0C275]/6" />
        </div>

        <!-- 快捷工具条（收藏 / 溯源 / 证书 / 礼券） -->
        <div class="grid grid-cols-4 gap-2">
          <button type="button" @click="openCert()" class="bg-white rounded-2xl py-2.5 border border-[#1C1B18]/7 flex flex-col items-center gap-1 cursor-pointer">
            <Award :size="16" class="text-[#C88A32]" />
            <span class="text-[10px] font-bold">认养证书</span>
          </button>
          <button type="button" @click="openTrace()" class="bg-white rounded-2xl py-2.5 border border-[#1C1B18]/7 flex flex-col items-center gap-1 cursor-pointer">
            <QrCode :size="16" class="text-[#1F4E3D]" />
            <span class="text-[10px] font-bold">溯源查验</span>
          </button>
          <button type="button" @click="setTab('market')" class="bg-white rounded-2xl py-2.5 border border-[#1C1B18]/7 flex flex-col items-center gap-1 cursor-pointer">
            <Heart :size="16" class="text-[#B83828]" />
            <span class="text-[10px] font-bold">收藏 ({{ favProducts.length }})</span>
          </button>
          <button type="button" @click="openCarbon()" class="bg-white rounded-2xl py-2.5 border border-[#1C1B18]/7 flex flex-col items-center gap-1 cursor-pointer">
            <Leaf :size="16" class="text-[#1F4E3D]" />
            <span class="text-[10px] font-bold">碳汇账本</span>
          </button>
        </div>

        <!-- 我的助农订单（点击可查看实时冷链物流进度！） -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="font-editorial text-[14.5px] font-bold text-[#16261F]">我的助农订单</h3>
            <span class="text-[10.5px] text-[#6E6960]">点击查看物流轨迹 · 共 {{ store.orders.length }} 单</span>
          </div>
          <div
            v-for="ord in myOrders"
            :key="ord.id"
            @click="selectedOrder = ord"
            class="bg-white rounded-2xl p-3 border border-[#1C1B18]/8 space-y-1.5 cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div class="flex items-center justify-between">
              <span class="font-mono text-[10.5px] font-semibold text-[#5A564E]">{{ ord.id }}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1" :class="statusBadgeClass(ord.status)">
                <PackageCheck v-if="ord.status !== '待发货'" :size="10" />
                <Clock v-else :size="10" />
                <span>{{ ord.status }}</span>
              </span>
            </div>
            <div class="text-[12px] font-bold text-[#1C1B18]">
              {{ ord.items.map((i) => `${i.name} ×${i.qty}`).join('、') }}
            </div>
            <div class="flex items-center justify-between text-[10.5px] text-[#6E6960]">
              <span class="font-mono">溯源码：{{ ord.traceCode }}</span>
              <span class="font-mono text-[13px] font-bold text-[#B83828]">¥{{ ord.total }}</span>
            </div>
          </div>
        </div>

        <!-- 快捷入口：切换后台管理系统 / 双端同屏 -->
        <div class="bg-white rounded-2xl border border-[#1C1B18]/8 divide-y divide-[#1C1B18]/6 overflow-hidden">
          <button
            type="button"
            @click="emit('open-admin'); router.push('/admin')"
            class="w-full px-3.5 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-[#F8F6F1]"
          >
            <div class="flex items-center gap-2.5">
              <ShieldCheck :size="16" class="text-[#1F4E3D]" />
              <div>
                <div class="text-[12.5px] font-bold text-[#1C1B18]">进入乡村振兴后台管理系统</div>
                <div class="text-[10px] text-[#6E6960]">管理商品、审核订单与认养、下发村务公告</div>
              </div>
            </div>
            <ArrowUpRight :size="15" class="text-[#6E6960]" />
          </button>
          <button
            type="button"
            @click="emit('open-split'); router.push('/split')"
            class="w-full px-3.5 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-[#F8F6F1]"
          >
            <div class="flex items-center gap-2.5">
              <Sparkles :size="16" class="text-[#C88A32]" />
              <div>
                <div class="text-[12.5px] font-bold text-[#1C1B18]">双端同屏实时联动演示</div>
                <div class="text-[10px] text-[#6E6960]">左屏 App + 右屏管理后台，答辩演示推荐</div>
              </div>
            </div>
            <ArrowUpRight :size="15" class="text-[#6E6960]" />
          </button>
        </div>
      </div>
    </div>

    <!-- 底部悬浮购物车条 -->
    <Transition name="sheet">
      <div
        v-if="activeTab === 'market' && store.cartCount > 0 && !showCartSheet"
        class="absolute bottom-[68px] left-3 right-3 z-20 rounded-2xl bg-[#16261F] text-white px-3.5 py-2.5 shadow-xl flex items-center justify-between border border-[#F0C275]/25"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-[#C88A32] text-[#16261F] font-mono font-bold text-xs flex items-center justify-center">
            {{ store.cartCount }}
          </div>
          <div>
            <div class="font-mono text-[14px] font-bold leading-none">¥{{ store.cartTotal }}</div>
            <div class="text-[9.5px] text-white/65 mt-0.5">顺丰助农包邮 · 结算可用优惠券</div>
          </div>
        </div>
        <button
          type="button"
          @click="showCartSheet = true"
          class="px-3.5 py-1.5 rounded-xl bg-[#C88A32] text-[#16261F] text-[11.5px] font-bold cursor-pointer"
        >
          去结算
        </button>
      </div>
    </Transition>

    <!-- 底部 5-Tab 导航栏（通透毛玻璃，透出底部青绿山水画卷） -->
    <nav
      aria-label="App 底部导航"
      class="shrink-0 absolute bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-[#C88A32]/20 px-2 pt-1.5 z-20 shadow-[0_-8px_24px_-12px_rgba(22,38,31,0.18)]"
      :class="framed ? 'pb-4' : 'pb-[max(0.5rem,env(safe-area-inset-bottom))]'"
    >
      <div class="grid grid-cols-5">
        <button
          v-for="tab in navItems"
          :key="tab.id"
          type="button"
          @click="setTab(tab.id)"
          class="relative flex flex-col items-center justify-center py-1 gap-0.5 cursor-pointer transition-colors"
          :class="activeTab === tab.id ? 'text-[#1F4E3D]' : 'text-[#8A8479]'"
        >
          <component :is="tab.icon" :size="19" :stroke-width="activeTab === tab.id ? 2.2 : 1.6" />
          <span class="text-[10px]" :class="activeTab === tab.id ? 'font-bold' : 'font-medium'">{{ tab.label }}</span>
          <span
            v-if="tab.id === 'market' && store.cartCount > 0"
            class="absolute top-0 right-3.5 min-w-[14px] h-[14px] px-1 rounded-full bg-[#B83828] text-white text-[9px] font-bold flex items-center justify-center"
          >{{ store.cartCount }}</span>
        </button>
      </div>
      <div v-if="framed" class="w-28 h-1 rounded-full bg-[#1C1B18]/20 mx-auto mt-2"></div>
    </nav>

    <!-- ==================== 弹层：商品详情（含“一块地收益透明条”+ 直达溯源） ==================== -->
    <div v-if="selectedProduct" class="absolute inset-0 z-30 bg-black/48 flex items-end" @click.self="selectedProduct = null">
      <div class="w-full max-h-[86%] bg-[#F7F4EE] rounded-t-[1.75rem] overflow-y-auto p-4 space-y-3 shadow-2xl app-scroll">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-[#1F4E3D] bg-[#EAF3EE] px-2.5 py-0.5 rounded-full">{{ selectedProduct.badge }}</span>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              @click="store.toggleFavorite(selectedProduct.id)"
              class="w-7.5 h-7.5 rounded-full bg-white flex items-center justify-center cursor-pointer"
              aria-label="收藏"
            >
              <Heart :size="14" :class="isFav(selectedProduct.id) ? 'fill-[#B83828] text-[#B83828]' : 'text-[#5A564E]'" />
            </button>
            <button type="button" @click="selectedProduct = null" class="w-7.5 h-7.5 rounded-full bg-white flex items-center justify-center cursor-pointer" aria-label="关闭">
              <X :size="15" />
            </button>
          </div>
        </div>
        <img :src="selectedProduct.image" :alt="selectedProduct.name" class="w-full h-40 rounded-2xl object-cover" />
        <div>
          <h3 class="font-editorial text-[17.5px] font-bold text-[#16261F]">{{ selectedProduct.name }}</h3>
          <p class="text-[11.5px] text-[#6E6960] mt-0.5">{{ selectedProduct.subtitle }}</p>
        </div>
        <div class="flex items-baseline justify-between bg-white rounded-xl p-3 border border-[#1C1B18]/7">
          <div>
            <span class="font-mono text-[21px] font-bold text-[#B83828]">¥{{ selectedProduct.price }}</span>
            <span class="text-[11px] text-[#8E887E] line-through ml-1.5">¥{{ selectedProduct.originalPrice }}</span>
            <span class="text-[10.5px] text-[#6E6960] ml-1.5">{{ selectedProduct.unit }}</span>
          </div>
          <span class="text-[10.5px] text-[#1F4E3D] font-bold">库存 {{ selectedProduct.stock }}</span>
        </div>

        <!-- 一块地 · 收益去向透明可视化条 -->
        <div class="bg-white rounded-xl p-3 border border-[#2E5A44]/20 space-y-2">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-bold text-[#1F4E3D]">每一单钱去哪了 · 助农收益透明账</span>
            <button
              type="button"
              @click="const code = selectedProduct.traceCode; selectedProduct = null; openTrace(code)"
              class="text-[10.5px] text-[#C88A32] font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <QrCode :size="11" />
              <span>核验溯源码</span>
            </button>
          </div>
          <div class="h-2.5 rounded-full overflow-hidden flex bg-[#ECE8DF]">
            <div class="bg-[#1F4E3D]" :style="{ width: `${selectedProduct.farmerSharePct}%` }"></div>
            <div class="bg-[#C88A32] w-[12%]"></div>
            <div class="bg-[#3B6E82] w-[6%]"></div>
            <div class="bg-[#9A948A] flex-1"></div>
          </div>
          <div class="grid grid-cols-3 text-[9.5px] text-[#5A564E] font-medium">
            <span class="flex items-center gap-1"><i class="w-2 h-2 rounded-full bg-[#1F4E3D]"></i>合作社 {{ selectedProduct.farmerSharePct }}%</span>
            <span class="flex items-center gap-1"><i class="w-2 h-2 rounded-full bg-[#C88A32]"></i>冷链 12%</span>
            <span class="flex items-center gap-1"><i class="w-2 h-2 rounded-full bg-[#3B6E82]"></i>护土基金 6%</span>
          </div>
        </div>

        <p class="text-[11.5px] text-[#5A564E] leading-relaxed">{{ selectedProduct.desc }}</p>
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            @click="quickAdd(selectedProduct); selectedProduct = null"
            class="h-10.5 rounded-xl bg-white border border-[#1F4E3D] text-[#1F4E3D] text-[12px] font-bold cursor-pointer"
          >
            加入购物袋
          </button>
          <button
            type="button"
            @click="store.addToCart(selectedProduct, 1); selectedProduct = null; showCartSheet = true"
            class="h-10.5 rounded-xl bg-[#1F4E3D] text-white text-[12px] font-bold cursor-pointer"
          >
            立即助农购买
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== 弹层：购物袋与优惠券结算 ==================== -->
    <div v-if="showCartSheet" class="absolute inset-0 z-30 bg-black/48 flex items-end" @click.self="showCartSheet = false">
      <div class="w-full max-h-[86%] bg-[#F7F4EE] rounded-t-[1.75rem] overflow-y-auto p-4 space-y-3 shadow-2xl app-scroll">
        <div class="flex items-center justify-between">
          <h3 class="font-editorial text-[16px] font-bold text-[#16261F]">助农购物袋 ({{ store.cartCount }})</h3>
          <button type="button" @click="showCartSheet = false" class="w-7 h-7 rounded-full bg-white flex items-center justify-center cursor-pointer" aria-label="关闭">
            <X :size="15" />
          </button>
        </div>
        <div v-if="store.cart.length" class="space-y-2.5">
          <div v-for="c in store.cart" :key="c.productId" class="bg-white rounded-xl p-2.5 flex items-center gap-2.5 border border-[#1C1B18]/6">
            <img :src="c.image" :alt="c.name" class="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="text-[12px] font-bold truncate">{{ c.name }}</div>
              <div class="font-mono text-[12px] text-[#B83828] font-bold">¥{{ c.price }}</div>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" @click="store.updateCartQty(c.productId, -1)" class="w-6 h-6 rounded-full bg-[#F3F0E9] flex items-center justify-center cursor-pointer"><Minus :size="12" /></button>
              <span class="font-mono text-[12px] font-bold w-4 text-center">{{ c.qty }}</span>
              <button type="button" @click="store.updateCartQty(c.productId, 1)" class="w-6 h-6 rounded-full bg-[#1F4E3D] text-white flex items-center justify-center cursor-pointer"><Plus :size="12" /></button>
            </div>
          </div>

          <!-- 助农优惠券选择 -->
          <div class="bg-white rounded-xl p-3 border border-[#1C1B18]/6 space-y-2">
            <div class="text-[11px] font-bold text-[#1C1B18] flex items-center gap-1">
              <Ticket :size="13" class="text-[#C88A32]" />
              <span>助农补贴券（不扣减农户分成）</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                v-for="cpn in store.coupons"
                :key="cpn.id"
                type="button"
                :disabled="store.cartTotal < cpn.minSpend"
                @click="selectedCouponId = selectedCouponId === cpn.id ? '' : cpn.id"
                class="p-2 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                :class="selectedCouponId === cpn.id ? 'border-[#C88A32] bg-[#FDF4E6]' : 'border-[#1C1B18]/10 bg-[#F8F6F1]'"
              >
                <div class="font-mono text-[13px] font-bold text-[#B83828]">-¥{{ cpn.amount }}</div>
                <div class="text-[9.5px] text-[#5A564E]">满 {{ cpn.minSpend }} 可用</div>
              </button>
            </div>
          </div>

          <div class="bg-white rounded-xl p-3 border border-[#1C1B18]/6 space-y-2">
            <div class="text-[11px] font-bold text-[#1C1B18]">收货信息（演示）</div>
            <input v-model="checkoutForm.customer" type="text" placeholder="收件人" class="w-full h-8 px-2.5 rounded-lg bg-[#F8F6F1] text-[11.5px]" />
            <input v-model="checkoutForm.address" type="text" placeholder="收货地址" class="w-full h-8 px-2.5 rounded-lg bg-[#F8F6F1] text-[11.5px]" />
          </div>

          <button
            type="button"
            @click="submitCartOrder"
            class="w-full h-11 rounded-xl bg-[#1F4E3D] text-white text-[12.5px] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <CheckCircle2 :size="15" />
            <span>提交订单 · 实付 ¥{{ finalPayAmount }}</span>
          </button>
        </div>
        <div v-else class="py-10 text-center text-[12px] text-[#6E6960]">购物袋还是空的，去集市逛逛吧</div>
      </div>
    </div>

    <!-- ==================== 弹层：下单成功 · 助农增收电子感谢回执 ==================== -->
    <div v-if="orderSuccessReceipt" class="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-5" @click.self="orderSuccessReceipt = null">
      <div class="w-full rounded-[1.6rem] bg-[#16261F] p-1.5 shadow-2xl border border-[#F0C275]/40">
        <div class="rounded-[1.35rem] bg-gradient-to-b from-[#1B3329] via-[#152720] to-[#101E18] text-[#F7F4EE] p-5 text-center space-y-3.5 relative overflow-hidden">
          <div class="w-12 h-12 rounded-2xl bg-[#4ADE80]/15 border border-[#4ADE80]/35 text-[#4ADE80] mx-auto flex items-center justify-center">
            <CheckCircle2 :size="26" />
          </div>
          <div>
            <div class="font-mono text-[9.5px] tracking-[0.22em] text-[#F0C275]">RURAL REVITALIZATION RECEIPT</div>
            <h3 class="font-editorial text-[19px] font-bold text-[#F5D393] mt-0.5">助农直采下单成功</h3>
            <p class="font-mono text-[10.5px] text-white/65 mt-0.5">订单号 {{ orderSuccessReceipt.orderId }} · 已实时同步后台</p>
          </div>
          <div class="rounded-2xl bg-white/8 border border-[#F0C275]/25 p-3.5 space-y-1.5 text-left">
            <div class="text-[11px] text-[#86EFAC] font-bold flex items-center gap-1">
              <Sparkles :size="12" />
              <span>您的每一次消费，都在为黑土乡村增收</span>
            </div>
            <p class="text-[11.5px] text-white/90 leading-relaxed">
              本单实付 <strong class="font-mono text-[#F5D393]">¥{{ orderSuccessReceipt.total }}</strong>，其中约 <strong class="font-mono text-[#86EFAC]">¥{{ orderSuccessReceipt.farmerGain }}（{{ orderSuccessReceipt.sharePct }}%）</strong> 将直接结算至 <strong>{{ orderSuccessReceipt.coopName }}</strong> 农户账户，同时为您累计 <strong class="font-mono text-[#F5D393]">+{{ orderSuccessReceipt.points }}</strong> 公益积分。
            </p>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              @click="const code = orderSuccessReceipt.traceCode; orderSuccessReceipt = null; openTrace(code)"
              class="h-9.5 rounded-xl bg-white/12 border border-white/18 text-white text-[11px] font-bold cursor-pointer"
            >
              查验一袋一码
            </button>
            <button
              type="button"
              @click="orderSuccessReceipt = null; setTab('profile')"
              class="h-9.5 rounded-xl bg-[#C88A32] text-[#16261F] text-[11px] font-bold cursor-pointer"
            >
              查看我的订单
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 弹层：订单冷链物流追踪 ==================== -->
    <div v-if="selectedOrder" class="absolute inset-0 z-30 bg-black/48 flex items-end" @click.self="selectedOrder = null">
      <div class="w-full bg-[#F7F4EE] rounded-t-[1.75rem] p-4 space-y-3.5 shadow-2xl">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-editorial text-[16px] font-bold text-[#16261F]">助农冷链物流追踪</h3>
            <div class="font-mono text-[10px] text-[#6E6960]">{{ selectedOrder.id }} · 溯源码 {{ selectedOrder.traceCode }}</div>
          </div>
          <button type="button" @click="selectedOrder = null" class="w-7 h-7 rounded-full bg-white flex items-center justify-center cursor-pointer" aria-label="关闭">
            <X :size="15" />
          </button>
        </div>

        <div class="bg-white rounded-2xl p-3.5 border border-[#1C1B18]/8 space-y-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-[#EAF3EE] text-[#1F4E3D] flex items-center justify-center shrink-0">
              <CheckCircle2 :size="15" />
            </div>
            <div>
              <div class="text-[12px] font-bold text-[#1C1B18]">合作社已接单 · 产地分拣贴溯源码</div>
              <div class="font-mono text-[10px] text-[#6E6960]">{{ selectedOrder.createdAt }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2.5" :class="selectedOrder.status === '待发货' ? 'opacity-40' : ''">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="selectedOrder.status !== '待发货' ? 'bg-[#FDF4E6] text-[#C88A32]' : 'bg-[#ECE8DF] text-[#8E887E]'">
              <Truck :size="15" />
            </div>
            <div>
              <div class="text-[12px] font-bold text-[#1C1B18]">顺丰助农冷链专车已揽收发运</div>
              <div class="text-[10px] text-[#6E6960]">{{ selectedOrder.status !== '待发货' ? '后台已操作确认发货，正发往收货地址' : '等待后台管理中枢操作发货' }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2.5" :class="selectedOrder.status !== '已完成' ? 'opacity-40' : ''">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="selectedOrder.status === '已完成' ? 'bg-[#1F4E3D] text-white' : 'bg-[#ECE8DF] text-[#8E887E]'">
              <PackageCheck :size="15" />
            </div>
            <div>
              <div class="text-[12px] font-bold text-[#1C1B18]">买家已签收 · 收益已结算至合作社</div>
              <div class="text-[10px] text-[#6E6960]">{{ selectedOrder.address }}</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="const code = selectedOrder.traceCode; selectedOrder = null; openTrace(code)"
          class="w-full h-10 rounded-xl bg-[#16261F] text-[#F0C275] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <QrCode :size="14" />
          <span>查看该订单商品一袋一码溯源档案</span>
        </button>
      </div>
    </div>

    <!-- ==================== 弹层：认养确认 ==================== -->
    <div v-if="selectedPlot" class="absolute inset-0 z-30 bg-black/48 flex items-end" @click.self="selectedPlot = null">
      <div class="w-full bg-[#F7F4EE] rounded-t-[1.75rem] p-4 space-y-3 shadow-2xl">
        <div class="flex items-center justify-between">
          <h3 class="font-editorial text-[16px] font-bold text-[#16261F]">确认云认养 · {{ selectedPlot.code }}</h3>
          <button type="button" @click="selectedPlot = null" class="w-7 h-7 rounded-full bg-white flex items-center justify-center cursor-pointer" aria-label="关闭">
            <X :size="15" />
          </button>
        </div>
        <div class="bg-white rounded-xl p-3 border border-[#1C1B18]/8 space-y-1">
          <div class="text-[13px] font-bold text-[#1C1B18]">{{ selectedPlot.name }}</div>
          <div class="text-[11px] text-[#6E6960]">托管合作社：{{ selectedPlot.coop }}</div>
          <div class="text-[11px] text-[#1F4E3D] font-semibold">预计回报：{{ selectedPlot.expectedYield }}</div>
        </div>
        <div class="flex items-center justify-between bg-white rounded-xl p-3 border border-[#1C1B18]/8">
          <span class="text-[12px] font-semibold">认养份数</span>
          <div class="flex items-center gap-2.5">
            <button type="button" @click="adoptShares = Math.max(1, adoptShares - 1)" class="w-7 h-7 rounded-full bg-[#F3F0E9] flex items-center justify-center cursor-pointer"><Minus :size="13" /></button>
            <span class="font-mono text-[14px] font-bold">{{ adoptShares }}</span>
            <button type="button" @click="adoptShares = Math.min(selectedPlot.slotsLeft, adoptShares + 1)" class="w-7 h-7 rounded-full bg-[#1F4E3D] text-white flex items-center justify-center cursor-pointer"><Plus :size="13" /></button>
          </div>
        </div>
        <button
          type="button"
          @click="confirmAdopt"
          class="w-full h-10.5 rounded-xl bg-[#C88A32] text-[#16261F] text-[12.5px] font-bold cursor-pointer"
        >
          确认认养 · ¥{{ selectedPlot.priceYear * adoptShares }} / 年
        </button>
      </div>
    </div>

    <!-- ==================== 弹层：振兴项目详情 ==================== -->
    <div v-if="selectedProject" class="absolute inset-0 z-30 bg-black/48 flex items-end" @click.self="selectedProject = null">
      <div class="w-full bg-[#F7F4EE] rounded-t-[1.75rem] p-4 space-y-3 shadow-2xl">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-[#1F4E3D] bg-[#EAF3EE] px-2 py-0.5 rounded-full">{{ selectedProject.category }}</span>
          <button type="button" @click="selectedProject = null" class="w-7 h-7 rounded-full bg-white flex items-center justify-center cursor-pointer" aria-label="关闭">
            <X :size="15" />
          </button>
        </div>
        <img :src="selectedProject.cover" :alt="selectedProject.name" class="w-full h-36 rounded-2xl object-cover" />
        <h3 class="font-editorial text-[16px] font-bold text-[#16261F]">{{ selectedProject.name }}</h3>
        <div class="grid grid-cols-3 gap-2 text-center bg-white rounded-xl p-2.5 border border-[#1C1B18]/7">
          <div>
            <div class="text-[10px] text-[#6E6960]">实施进度</div>
            <div class="font-mono text-[14px] font-bold text-[#1F4E3D]">{{ selectedProject.progress }}%</div>
          </div>
          <div>
            <div class="text-[10px] text-[#6E6960]">带动农户</div>
            <div class="font-mono text-[14px] font-bold text-[#1C1B18]">{{ selectedProject.households }} 户</div>
          </div>
          <div>
            <div class="text-[10px] text-[#6E6960]">专项资金</div>
            <div class="font-mono text-[14px] font-bold text-[#C88A32]">{{ selectedProject.fundWan }} 万</div>
          </div>
        </div>
        <p class="text-[11.5px] text-[#5A564E] leading-relaxed">{{ selectedProject.summary }}</p>
      </div>
    </div>

    <!-- ==================== App 全屏沉浸子页面（带丝滑过渡） ==================== -->
    <Transition name="slide-up">
      <AppLiveCamOverlay
        v-if="activeLiveCamId"
        :cam-id="activeLiveCamId"
        :framed="framed"
        @close="activeLiveCamId = null"
        @switch-cam="(id) => { activeLiveCamId = id }"
        @buy-product="(p) => { activeLiveCamId = null; selectedProduct = p }"
      />
    </Transition>

    <Transition name="slide-up">
      <AppTraceabilityPage
        v-if="showTracePage"
        :initial-code="traceCodeTarget"
        :framed="framed"
        @close="showTracePage = false"
        @open-product="(p) => { showTracePage = false; selectedProduct = p }"
      />
    </Transition>

    <Transition name="slide-up">
      <AppCertificateModal
        v-if="activeAdoptionId"
        :adoption-id="activeAdoptionId"
        :framed="framed"
        @close="activeAdoptionId = null"
      />
    </Transition>

    <Transition name="slide-up">
      <AppSolarAlmanacPage
        v-if="showSolarPage"
        :framed="framed"
        @close="showSolarPage = false"
        @open-product="(p) => { showSolarPage = false; selectedProduct = p }"
      />
    </Transition>

    <Transition name="slide-up">
      <AppAiAgronomistPage
        v-if="showAiPage"
        :framed="framed"
        @close="showAiPage = false"
        @go-village="showAiPage = false; setTab('village')"
        @open-product="(p) => { showAiPage = false; selectedProduct = p }"
      />
    </Transition>

    <Transition name="slide-up">
      <AppCarbonWalletPage
        v-if="showCarbonPage"
        :framed="framed"
        @close="showCarbonPage = false"
      />
    </Transition>

    <!-- ==================== App 内置 3D 沉浸展厅全屏弹层 ==================== -->
    <div
      v-if="active3D"
      class="absolute inset-0 z-35 bg-[#F7F4EE] flex flex-col overflow-hidden"
      :class="framed ? 'pt-11' : ''"
    >
      <div class="shrink-0 h-12 px-3 bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[#1C1B18]/8 flex items-center justify-between gap-2 z-20">
        <button
          type="button"
          @click="active3D = null"
          class="h-8 px-2.5 rounded-full bg-white border border-[#1C1B18]/10 text-[11.5px] font-bold text-[#1C1B18] flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          <ChevronLeft :size="14" />
          <span>返回</span>
        </button>

        <div class="flex items-center gap-1 p-0.5 rounded-full bg-[#ECE8DF]">
          <button
            v-for="(meta, key) in hall3DMeta"
            :key="key"
            type="button"
            @click="active3D = key"
            class="px-2.5 py-1 rounded-full text-[10.5px] font-bold transition-colors cursor-pointer"
            :class="active3D === key ? 'bg-[#16261F] text-[#F0C275]' : 'text-[#5A564E]'"
          >
            {{ meta.label }}
          </button>
        </div>

        <button
          type="button"
          @click="router.push(hall3DMeta[active3D].route)"
          class="w-8 h-8 rounded-full bg-white border border-[#1C1B18]/10 text-[#1F4E3D] flex items-center justify-center cursor-pointer shrink-0"
          title="切换桌面大屏展厅"
          aria-label="切换桌面大屏展厅"
        >
          <Maximize2 :size="13" />
        </button>
      </div>

      <div class="flex-1 min-h-0 relative">
        <component :is="hall3DMeta[active3D].component" :key="active3D" :mobile="true" />
      </div>
    </div>

    <!-- App 顶部 Toast -->
    <Transition name="toast">
      <div
        v-if="toastMsg"
        class="absolute top-14 left-4 right-4 z-50 px-3.5 py-2.5 rounded-2xl bg-[#16261F]/95 text-[#F7F4EE] text-[11.5px] font-medium shadow-xl flex items-center gap-2 backdrop-blur-md border border-[#F0C275]/25"
      >
        <CheckCircle2 :size="14" class="text-[#4ADE80] shrink-0" />
        <span class="leading-snug">{{ toastMsg }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app-scroll::-webkit-scrollbar { width: 0; height: 0; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-10px); }
.sheet-enter-active, .sheet-leave-active { transition: all 0.25s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; transform: translateY(14px); }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.22s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(24px); opacity: 0; }
</style>
