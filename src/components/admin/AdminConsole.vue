<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  LayoutDashboard, ShoppingBag, ClipboardList, Sprout,
  Tractor, Megaphone, Settings, LogOut, Plus, Pencil,
  Trash2, X, RotateCcw, Smartphone, Columns2,
  Send, Search, Sparkles, CheckCircle2, Truck,
  Compass, Radio, TrendingUp, Users, BellRing, Activity, Zap, Radar, Download, Command
} from 'lucide-vue-next'
import { useRuralPlatformStore } from '../../stores/ruralPlatformStore'
import RuralAdminCharts from './RuralAdminCharts.vue'
import AdminTelemetryMap from './AdminTelemetryMap.vue'
import BrandLogo from '../BrandLogo.vue'

const props = defineProps({
  embedded: { type: Boolean, default: false }
})

const store = useRuralPlatformStore()
const isAuthed = computed(() => props.embedded || store.authed)

/* ---------------- 登录门禁 ---------------- */
const password = ref('')
const loginError = ref('')
const doLogin = () => {
  if (store.login(password.value)) {
    loginError.value = ''
    password.value = ''
  } else {
    loginError.value = '密码不正确，可点击下方「一键免密体验」'
  }
}
const fillAndLogin = () => {
  store.quickDemoLogin()
  loginError.value = ''
}

/* ---------------- 侧边栏导航 ---------------- */
const activeTab = ref('overview')
const navTabs = computed(() => [
  { id: 'overview', label: '数智总览', icon: LayoutDashboard, badge: 0 },
  { id: 'telemetry', label: '北斗孪生调度', icon: Radar, badge: 0 },
  { id: 'products', label: '农产集市', icon: ShoppingBag, badge: 0 },
  { id: 'orders', label: '助农订单', icon: ClipboardList, badge: store.pendingOrdersCount },
  { id: 'adoptions', label: '云认养地块', icon: Sprout, badge: store.pendingAdoptionsCount },
  { id: 'projects', label: '项目·农机·直播', icon: Tractor, badge: 0 },
  { id: 'village', label: '村务与反馈', icon: Megaphone, badge: store.pendingFeedbacksCount },
  { id: 'settings', label: 'App 与系统设置', icon: Settings, badge: 0 }
])

const currentTabObj = computed(() => navTabs.value.find((t) => t.id === activeTab.value) || navTabs.value[0])

/* ---------------- 后台 Toast ---------------- */
const toast = ref('')
let toastTimer = 0
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toast.value = '' }, 2800)
}

function handleSimulateOrder() {
  const ord = store.simulateOrderFromAdmin()
  if (ord) showToast(`已模拟 App 新订单 ${ord.id}（¥${ord.total}），指标与队列已实时刷新`)
}

function exportOrdersCSV() {
  const header = ['订单编号', '买家', '收货地址', '商品明细', '金额(元)', '状态', '溯源码', '下单时间']
  const rows = store.orders.map((o) => [
    o.id,
    o.customer,
    `"${o.address}"`,
    `"${o.items.map((i) => `${i.name}x${i.qty}`).join(' / ')}"`,
    o.total,
    o.status,
    o.traceCode,
    o.createdAt
  ])
  const csv = '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `jiyun-orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  showToast('已导出助农订单 CSV 报表')
}

function batchShipPendingOrders() {
  const pending = store.orders.filter((o) => o.status === '待发货')
  if (!pending.length) return
  pending.forEach((o) => store.updateOrderStatus(o.id, '已发货'))
  showToast(`已一键批量发货 ${pending.length} 笔助农订单，App 物流追踪同步更新`)
}

function exportAdoptionsCSV() {
  const header = ['认养单号', '地块编号', '地块名称', '认养人', '份数', '金额(元)', '状态', '物候阶段', '申请时间']
  const rows = store.adoptions.map((a) => [a.id, a.plotCode, `"${a.plotName}"`, a.adopter, a.shares, a.amount, a.status, `"${a.stage}"`, a.createdAt])
  const csv = '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `jiyun-adoptions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  showToast('已导出云认养台账 CSV 报表')
}

function exportJsonSnapshot() {
  const payload = {
    exportedAt: new Date().toISOString(),
    summary: { gmv: store.totalGMV, products: store.products.length, orders: store.orders.length, plots: store.plots.length },
    products: store.products,
    orders: store.orders,
    plots: store.plots,
    adoptions: store.adoptions,
    projects: store.projects
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `jiyun-platform-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('已导出全平台 JSON 运营数据快照')
}

/* ---------------- 全局快捷指令搜索 (Ctrl + K) ---------------- */
const cmdDialogRef = ref(null)
const cmdQuery = ref('')

function openCmdPalette() {
  cmdQuery.value = ''
  cmdDialogRef.value?.showModal()
}

const cmdResults = computed(() => {
  const q = cmdQuery.value.trim().toLowerCase()
  const out = []
  navTabs.value.forEach((t) => {
    if (!q || t.label.toLowerCase().includes(q)) {
      out.push({ key: `tab-${t.id}`, group: '功能模块', title: t.label, sub: '切换至该管理面板', run: () => { activeTab.value = t.id } })
    }
  })
  store.products.forEach((p) => {
    if (!q || p.name.toLowerCase().includes(q) || p.origin.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) {
      out.push({ key: `p-${p.id}`, group: '地标商品', title: `${p.name}（¥${p.price}）`, sub: `${p.origin} · 余 ${p.stock}`, run: () => { activeTab.value = 'products'; openProdModal(p) } })
    }
  })
  store.orders.forEach((o) => {
    if (!q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)) {
      out.push({ key: `o-${o.id}`, group: '助农订单', title: `${o.id} · ${o.customer}`, sub: `¥${o.total} · ${o.status}`, run: () => { activeTab.value = 'orders' } })
    }
  })
  store.plots.forEach((pl) => {
    if (!q || pl.name.toLowerCase().includes(q) || pl.code.toLowerCase().includes(q)) {
      out.push({ key: `pl-${pl.id}`, group: '云认养地块', title: `${pl.code} · ${pl.name}`, sub: `${pl.category} · 余 ${pl.slotsLeft} 份`, run: () => { activeTab.value = 'adoptions' } })
    }
  })
  return out.slice(0, 12)
})

function runCmdItem(item) {
  cmdDialogRef.value?.close()
  item.run()
}

function onGlobalKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    if (!isAuthed.value) return
    e.preventDefault()
    openCmdPalette()
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKeydown))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKeydown))

/* ---------------- 区域示范带进度数据 ---------------- */
const regionalZones = [
  { name: '长春 · 九台黑土稻作核心带', pct: 92, color: '#1F4E3D', tag: '有机质 4.82%' },
  { name: '四平 · 梨树保护性耕作示范区', pct: 86, color: '#C88A32', tag: '秸秆覆盖率 94%' },
  { name: '松原 · 查干湖生态渔猎冷链圈', pct: 100, color: '#3B6E82', tag: '损耗压降至 2.3%' },
  { name: '白城 · 镇赉农光互补智慧大棚', pct: 68, color: '#B83828', tag: '年发绿电 420万度' }
]

/* ---------------- 商品管理 (原生 <dialog>) ---------------- */
const prodSearch = ref('')
const filteredProducts = computed(() => {
  const q = prodSearch.value.trim().toLowerCase()
  if (!q) return store.products
  return store.products.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.origin.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  )
})

const prodDialogRef = ref(null)
const prodForm = ref({
  id: '',
  name: '',
  subtitle: '',
  category: '黑土粳稻',
  origin: '吉林 · 长春九台区',
  price: 68,
  unit: '5kg / 礼袋',
  stock: 100,
  farmerSharePct: 78,
  badge: '地理标志',
  status: '上架',
  image: '/art-hd/golden-rice.jpg',
  desc: ''
})

const imageChoices = [
  { label: '黑土稻田', url: '/art-hd/golden-rice.jpg' },
  { label: '查干湖冬捕', url: '/art-hd/chagan-winter.jpg' },
  { label: '鲜食糯玉米', url: '/art-custom/waxy-corn.jpg' },
  { label: '长白山林下人参', url: '/art-custom/ginseng.jpg' },
  { label: '非转基因黄豆', url: '/art-custom/soybeans-real.jpg' },
  { label: '吉林丰收', url: '/art-hd/jilin-harvest.jpg' },
  { label: '长白山椴树雪蜜', url: '/art-custom/honey.jpg' },
  { label: '汪清秋木耳', url: '/art-custom/black-fungus.jpg' },
  { label: '集安冰葡萄酒', url: '/art-custom/ice-wine.jpg' },
  { label: '延边苹果梨', url: '/art-custom/apple-pear.jpg' },
  { label: '长白山红松子', url: '/art-custom/pine-nuts.jpg' },
  { label: '生态稻田大闸蟹', url: '/art-custom/river-crab.jpg' },
  { label: '延边非遗辣白菜', url: '/art-custom/yanbian-kimchi.jpg' },
  { label: '光伏草莓温室', url: '/art-custom/solar-strawberry.jpg' }
]

function openProdModal(item = null) {
  if (item) {
    prodForm.value = { ...item }
  } else {
    prodForm.value = {
      id: '',
      name: '',
      subtitle: '2026新季直采 · 一袋一码溯源',
      category: '黑土粳稻',
      origin: '吉林 · 长春九台区',
      price: 68,
      unit: '5kg / 礼袋',
      stock: 100,
      farmerSharePct: 78,
      badge: '地理标志',
      status: '上架',
      image: '/art-hd/golden-rice.jpg',
      desc: '产地直供优质黑土农产品，全程可溯源。'
    }
  }
  prodDialogRef.value?.showModal()
}

function saveProduct() {
  if (!prodForm.value.name.trim()) return
  store.upsertProduct({
    ...prodForm.value,
    price: Number(prodForm.value.price),
    stock: Number(prodForm.value.stock),
    farmerSharePct: Number(prodForm.value.farmerSharePct)
  })
  prodDialogRef.value?.close()
  showToast('商品已保存，移动端集市已实时同步')
}

/* ---------------- 项目新增弹窗 (原生 <dialog>) ---------------- */
const prjDialogRef = ref(null)
const prjForm = ref({
  name: '',
  category: '生态保育',
  village: '长春 · 九台区示范村',
  progress: 50,
  households: 160,
  fundWan: 280,
  status: '推进中',
  cover: '/art-hd/songliao-plain.jpg',
  summary: ''
})
function openPrjModal() {
  prjForm.value = {
    name: '',
    category: '生态保育',
    village: '长春 · 九台区示范村',
    progress: 50,
    households: 160,
    fundWan: 280,
    status: '推进中',
    cover: '/art-hd/songliao-plain.jpg',
    summary: '推动黑土生态保育与合作社数字化升级，稳定带动小农户持续增收。'
  }
  prjDialogRef.value?.showModal()
}
function saveProject() {
  if (!prjForm.value.name.trim()) return
  store.upsertProject({
    ...prjForm.value,
    progress: Number(prjForm.value.progress),
    households: Number(prjForm.value.households),
    fundWan: Number(prjForm.value.fundWan)
  })
  prjDialogRef.value?.close()
  showToast('新振兴项目已发布，App 首页项目档案同步更新')
}

/* ---------------- 订单筛选 ---------------- */
const orderFilter = ref('全部')
const filteredOrders = computed(() => {
  if (orderFilter.value === '全部') return store.orders
  return store.orders.filter((o) => o.status === orderFilter.value)
})

/* ---------------- 认养物候选项 ---------------- */
const plotStages = [
  { idx: 0, label: '春耕备播 · 北斗整地' },
  { idx: 1, label: '秸秆还田 · 越冬蓄墒' },
  { idx: 1, label: '冬剪养树 · 挂牌定制' },
  { idx: 2, label: '生态养水 · 蟹稻轮作' },
  { idx: 2, label: '林下休眠 · 积雪保温' },
  { idx: 2, label: '越冬保温 · 蜜源备春' },
  { idx: 3, label: '秋收归仓 · 即将直邮' },
  { idx: 3, label: '盛果采摘 · 冬季直邮中' }
]

/* ---------------- 村务公告发布 & 反馈回复 ---------------- */
const noticeForm = ref({ tag: '村务公告', title: '', content: '', pinned: true })
function handlePublishNotice() {
  if (!noticeForm.value.title.trim() || !noticeForm.value.content.trim()) {
    showToast('请填写公告标题与正文')
    return
  }
  store.publishNotice(noticeForm.value)
  noticeForm.value = { tag: '村务公告', title: '', content: '', pinned: true }
  showToast('公告已下发并置顶同步至 App 首页')
}

const replyDrafts = ref({})
function sendReply(fb) {
  const txt = (replyDrafts.value[fb.id] || '').trim()
  if (!txt) return
  store.replyFeedback(fb.id, txt)
  replyDrafts.value[fb.id] = ''
  showToast(`已回复「${fb.user}」，App 端即时可见`)
}

/* ---------------- 项目进度微调 ---------------- */
function bumpProjectProgress(prj, delta) {
  const next = Math.max(0, Math.min(100, prj.progress + delta))
  store.upsertProject({
    ...prj,
    progress: next,
    status: next === 100 ? '已验收' : '推进中'
  })
  showToast(`「${prj.name}」进度已更新为 ${next}%`)
}

const statusPill = (status) => {
  if (['上架', '已发货', '已生效', '已回复', '已验收', '作业中', '直播中'].includes(status)) {
    return 'bg-[#EAF3EE] text-[#1F4E3D] border-[#2E5A44]/20'
  }
  if (['待发货', '待审核', '待处理', '推进中', '待命'].includes(status)) {
    return 'bg-[#FDF4E6] text-[#9A6518] border-[#C88A32]/30'
  }
  return 'bg-[#1C1B18]/6 text-[#5A564E] border-[#1C1B18]/12'
}

watch(() => props.embedded, () => {
  if (props.embedded) activeTab.value = 'overview'
})
</script>

<template>
  <!-- ==================== 未登录：高定新中式管理员门禁 ==================== -->
  <div
    v-if="!isAuthed"
    class="min-h-screen w-full bg-[#F5F2EB] flex items-center justify-center p-6 relative overflow-hidden"
    style="background-image: linear-gradient(180deg, rgba(250,247,240,0.55), rgba(244,239,228,0.45)), url('/art-custom/showcase-bg-pattern.jpg'); background-size: cover; background-position: center;"
  >
    <div class="pointer-events-none absolute -top-32 -left-24 w-[460px] h-[460px] rounded-full bg-[#1F4E3D]/12 blur-[100px]"></div>
    <div class="pointer-events-none absolute -bottom-32 -right-24 w-[460px] h-[460px] rounded-full bg-[#C88A32]/14 blur-[100px]"></div>

    <div class="w-full max-w-[430px] bg-white rounded-[1.85rem] border border-[#1C1B18]/10 shadow-[0_28px_70px_-28px_rgba(22,38,31,0.28)] p-8 relative z-10">
      <div class="flex items-center gap-3 mb-6">
        <BrandLogo :size="48" />
        <div>
          <div class="font-mono text-[10px] tracking-[0.2em] text-[#6E6960]">RURAL REVITALIZATION ADMIN</div>
          <h1 class="font-editorial text-xl font-bold text-[#16261F]">吉韵禾野 · 后台管理系统</h1>
        </div>
      </div>

      <p class="text-[12.5px] text-[#5A564E] leading-relaxed mb-6">
        面向乡村振兴运营中枢的综合管理后台，与移动端 App 实时双向联动，统筹地理标志农产品、助农订单、云认养地块、慢直播机位与村务公告。
      </p>

      <form @submit.prevent="doLogin" class="space-y-4">
        <div>
          <label for="admin-pwd" class="block text-[11.5px] font-semibold text-[#1C1B18] mb-1.5">管理员通行密码</label>
          <input
            id="admin-pwd"
            v-model="password"
            type="password"
            placeholder="请输入演示密码 admin123456"
            class="w-full h-11 px-4 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/12 text-sm text-[#1C1B18] focus:outline-none focus:border-[#1F4E3D]"
          />
          <p v-if="loginError" class="text-[11.5px] text-[#B83828] mt-1.5">{{ loginError }}</p>
        </div>

        <button
          type="submit"
          class="w-full h-11 rounded-xl bg-[#16261F] text-[#F7F4EE] text-sm font-bold hover:bg-[#1F4E3D] transition-colors cursor-pointer"
        >
          进入管理中枢
        </button>

        <button
          type="button"
          @click="fillAndLogin"
          class="w-full h-10.5 rounded-xl bg-[#FDF4E6] border border-[#C88A32]/35 text-[#8A5810] text-xs font-bold hover:bg-[#C88A32]/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Sparkles :size="14" />
          <span>一键免密体验（演示密码：admin123456）</span>
        </button>
      </form>

      <div class="mt-6 pt-5 border-t border-[#1C1B18]/8 flex items-center justify-between text-xs text-[#6E6960]">
        <RouterLink to="/" class="hover:text-[#1F4E3D] font-medium flex items-center gap-1">
          <Smartphone :size="13" />
          <span>返回移动端 App</span>
        </RouterLink>
        <RouterLink to="/split" class="hover:text-[#1F4E3D] font-medium flex items-center gap-1">
          <Columns2 :size="13" />
          <span>双端同屏演示</span>
        </RouterLink>
      </div>
    </div>
  </div>

  <!-- ==================== 已登录：现代高定新中式 SaaS 后台 ==================== -->
  <div
    v-else
    class="flex bg-[#F4F0E6] text-[#1C1B18] w-full overflow-hidden"
    :class="embedded ? 'h-full rounded-2xl border border-[#C88A32]/20 shadow-sm' : 'h-screen'"
  >
    <!-- 左侧固定深松绿鎏金导航栏（融入淡雅青绿稻浪底纹） -->
    <aside
      class="shrink-0 text-[#F7F4EE] flex flex-col justify-between h-full border-r border-[#C88A32]/20"
      :class="embedded ? 'w-[196px]' : 'w-[248px]'"
      style="background-image: linear-gradient(180deg, rgba(16,32,25,0.92) 0%, rgba(16,30,24,0.86) 62%, rgba(12,24,19,0.72) 100%), url('/art-custom/app-header-banner.jpg'); background-size: cover; background-position: bottom center;"
    >
      <div class="p-4 overflow-y-auto">
        <div class="flex items-center gap-2.5 px-2 py-2 mb-5">
          <BrandLogo :size="36" variant="gold" />
          <div class="min-w-0">
            <div class="font-editorial font-bold text-[14.5px] leading-tight truncate">吉韵禾野中枢</div>
            <div class="font-mono text-[9px] tracking-[0.16em] text-[#F7F4EE]/55 mt-0.5">ADMIN CONSOLE v2.0</div>
          </div>
        </div>

        <nav aria-label="后台功能导航" class="space-y-1">
          <button
            v-for="tab in navTabs"
            :key="tab.id"
            type="button"
            @click="activeTab = tab.id"
            class="w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-[12.5px] font-medium transition-all cursor-pointer"
            :class="activeTab === tab.id
              ? 'bg-[#F7F4EE] text-[#16261F] font-bold shadow-sm'
              : 'text-[#F7F4EE]/75 hover:bg-white/8 hover:text-white'"
          >
            <span class="flex items-center gap-2.5 truncate">
              <component :is="tab.icon" :size="16" class="shrink-0" />
              <span class="truncate">{{ tab.label }}</span>
            </span>
            <span
              v-if="tab.badge > 0"
              class="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
              :class="activeTab === tab.id ? 'bg-[#B83828] text-white' : 'bg-[#C88A32] text-[#16261F]'"
            >
              {{ tab.badge }}
            </span>
          </button>
        </nav>
      </div>

      <div class="p-4 border-t border-white/10 space-y-1.5 text-[12px]">
        <RouterLink
          v-if="!embedded"
          to="/"
          class="w-full px-3 py-2 rounded-xl text-[#F7F4EE]/82 hover:bg-white/8 flex items-center gap-2 transition-colors"
        >
          <Smartphone :size="14" class="text-[#F0C275]" />
          <span>移动端 App 体验</span>
        </RouterLink>
        <RouterLink
          v-if="!embedded"
          to="/split"
          class="w-full px-3 py-2 rounded-xl text-[#F7F4EE]/82 hover:bg-white/8 flex items-center gap-2 transition-colors"
        >
          <Columns2 :size="14" class="text-[#86EFAC]" />
          <span>双端同屏实时联动</span>
        </RouterLink>
        <RouterLink
          to="/bigscreen"
          class="w-full px-3 py-2 rounded-xl text-[#F7F4EE]/82 hover:bg-white/8 flex items-center gap-2 transition-colors"
        >
          <Activity :size="14" class="text-[#F0C275]" />
          <span>数智指挥大屏</span>
        </RouterLink>
        <RouterLink
          to="/sandbox-3d"
          class="w-full px-3 py-2 rounded-xl text-[#F7F4EE]/82 hover:bg-white/8 flex items-center gap-2 transition-colors"
        >
          <Compass :size="14" class="text-[#7DD3FC]" />
          <span>3D 生态沙盘展厅</span>
        </RouterLink>
        <button
          v-if="!embedded"
          type="button"
          @click="store.logout()"
          class="w-full px-3 py-2 rounded-xl text-[#F7F4EE]/55 hover:text-white hover:bg-white/8 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut :size="14" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 右侧主工作区（融入宣纸青绿山水 + 鎏金稻穗丝绸背景） -->
    <div
      class="flex-1 min-w-0 flex flex-col h-full overflow-hidden"
      style="background-image: linear-gradient(180deg, rgba(250,247,240,0.62) 0%, rgba(246,242,233,0.42) 55%, rgba(244,239,228,0.28) 100%), url('/art-custom/showcase-bg-pattern.jpg'); background-size: cover; background-position: bottom center;"
    >
      <!-- 顶部栏（通透宣纸毛玻璃） -->
      <header class="shrink-0 z-20 h-15 px-6 bg-white/76 backdrop-blur-xl border-b border-[#C88A32]/16 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <h1 class="font-editorial text-[17.5px] font-bold text-[#16261F] truncate">{{ currentTabObj.label }}</h1>
          <span class="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF3EE] text-[#1F4E3D] text-[11px] font-semibold border border-[#2E5A44]/15">
            <span class="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span class="truncate max-w-[280px]">{{ store.lastSyncEvent }}</span>
          </span>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            @click="openCmdPalette"
            class="hidden md:inline-flex items-center gap-2 h-8.5 px-3 rounded-full bg-white/85 border border-[#C88A32]/22 text-[11.5px] text-[#5A564E] hover:border-[#1F4E3D] transition-colors cursor-pointer shadow-2xs"
          >
            <Search :size="12.5" class="text-[#1F4E3D]" />
            <span>全局检索商品 / 订单 / 地块</span>
            <kbd class="font-mono text-[9.5px] px-1.5 py-0.5 rounded bg-[#F5F2EB] text-[#6E6960] border border-[#1C1B18]/10">Ctrl K</kbd>
          </button>
          <RouterLink
            v-if="!embedded"
            to="/split"
            class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#16261F] text-[#F7F4EE] text-[11.5px] font-bold hover:bg-[#1F4E3D] transition-colors"
          >
            <Columns2 :size="13" class="text-[#F0C275]" />
            <span>同屏联动预览</span>
          </RouterLink>
          <div class="flex items-center gap-2 pl-2 border-l border-[#1C1B18]/10">
            <div class="w-7.5 h-7.5 rounded-full bg-gradient-to-br from-[#1F4E3D] to-[#12261E] text-[#F0C275] text-xs font-bold flex items-center justify-center">
              管
            </div>
            <span class="hidden lg:inline text-[12px] font-semibold text-[#1C1B18]">振兴管理员</span>
          </div>
        </div>
      </header>

      <!-- 主内容滚动区 -->
      <div class="flex-1 p-5 lg:p-6 space-y-5 overflow-y-auto">
        <!-- Toast（位于后台顶栏正下方，兼容单屏与分屏模式，绝不遮挡搜索栏与内容） -->
        <Transition name="fade">
          <div
            v-if="toast"
            class="fixed right-6 z-50 px-4 py-2.5 rounded-xl bg-[#16261F]/95 backdrop-blur-md text-[#F7F4EE] text-xs font-medium shadow-xl flex items-center gap-2 border border-[#F0C275]/35"
            :class="embedded ? 'top-[124px]' : 'top-[72px]'"
          >
            <CheckCircle2 :size="15" class="text-[#4ADE80] shrink-0" />
            <span>{{ toast }}</span>
          </div>
        </Transition>

        <!-- ==================== 1. 数智总览 ==================== -->
        <template v-if="activeTab === 'overview'">
          <!-- 高定指挥横幅（融合青绿鎏金稻浪插画） -->
          <div
            class="rounded-[1.45rem] text-[#F7F4EE] p-5 relative overflow-hidden shadow-lg border border-[#F0C275]/25"
            style="background-image: linear-gradient(100deg, rgba(16,32,25,0.90) 0%, rgba(22,46,35,0.76) 55%, rgba(22,38,31,0.58) 100%), url('/art-custom/app-header-banner.jpg'); background-size: cover; background-position: center;"
          >
            <div class="pointer-events-none absolute -right-12 -top-12 w-56 h-56 rounded-full bg-[#C88A32]/18 blur-3xl"></div>
            <div class="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-[#F0C275]">
                  <span>RURAL REVITALIZATION COMMAND CENTER</span>
                  <span>·</span>
                  <span>{{ store.appConfig.solarTerm }}</span>
                </div>
                <h2 class="font-editorial text-xl font-bold mt-1">吉林黑土乡村振兴数智运营中枢</h2>
                <p class="text-[12px] text-[#F7F4EE]/75 mt-1">
                  当前 {{ store.liveCamOnlineCount }} 路产地慢直播在线 · 监测合作社 14 家 · 所有操作毫秒级同步至移动端 App
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  @click="handleSimulateOrder"
                  class="px-3.5 py-2 rounded-xl bg-[#C88A32] text-[#16261F] text-xs font-bold flex items-center gap-1.5 hover:bg-[#D49A42] transition-colors cursor-pointer"
                >
                  <Zap :size="13" />
                  <span>模拟 App 新订单</span>
                </button>
                <button
                  type="button"
                  @click="openProdModal()"
                  class="px-3.5 py-2 rounded-xl bg-white/12 border border-white/18 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <Plus :size="13" />
                  <span>上架新品</span>
                </button>
                <button
                  type="button"
                  @click="activeTab = 'village'"
                  class="px-3.5 py-2 rounded-xl bg-white/12 border border-white/18 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <BellRing :size="13" />
                  <span>推送公告</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 4 个升级版核心 KPI 卡（毛玻璃鎏金微描边） -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              @click="activeTab = 'orders'"
              class="text-left bg-white/86 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 p-4 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.16)] hover:bg-white hover:border-[#C88A32]/50 transition-all cursor-pointer group"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold text-[#6E6960]">助农累计成交额</span>
                <span class="w-8 h-8 rounded-xl bg-[#FDF4E6] text-[#C88A32] flex items-center justify-center"><TrendingUp :size="15" /></span>
              </div>
              <div class="font-mono text-2xl font-bold text-[#16261F] mt-2">¥{{ store.totalGMV.toLocaleString() }}</div>
              <div class="text-[11px] text-[#1F4E3D] font-semibold mt-1">较上周 +18.4% · 实时累加</div>
            </button>

            <button
              type="button"
              @click="activeTab = 'products'"
              class="text-left bg-white/86 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 p-4 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.16)] hover:bg-white hover:border-[#1F4E3D]/40 transition-all cursor-pointer"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold text-[#6E6960]">在售地标农产品</span>
                <span class="w-8 h-8 rounded-xl bg-[#EAF3EE] text-[#1F4E3D] flex items-center justify-center"><ShoppingBag :size="15" /></span>
              </div>
              <div class="font-mono text-2xl font-bold text-[#1F4E3D] mt-2">{{ store.activeProducts.length }} <span class="text-xs font-normal text-[#6E6960]">/ {{ store.products.length }} 款</span></div>
              <div class="text-[11px] text-[#6E6960] mt-1">平均农户分成 78.5%</div>
            </button>

            <button
              type="button"
              @click="activeTab = 'projects'"
              class="text-left bg-white/86 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 p-4 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.16)] hover:bg-white hover:border-[#1F4E3D]/40 transition-all cursor-pointer"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold text-[#6E6960]">累计带动增收农户</span>
                <span class="w-8 h-8 rounded-xl bg-[#EEF2FA] text-[#2F5380] flex items-center justify-center"><Users :size="15" /></span>
              </div>
              <div class="font-mono text-2xl font-bold text-[#C88A32] mt-2">{{ store.totalHelpedHouseholds }} <span class="text-xs font-normal text-[#6E6960]">户</span></div>
              <div class="text-[11px] text-[#6E6960] mt-1">覆盖 {{ store.projects.length }} 个重点振兴项目</div>
            </button>

            <button
              type="button"
              @click="activeTab = 'orders'"
              class="text-left bg-white/86 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 p-4 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.16)] hover:bg-white hover:border-[#B83828]/40 transition-all cursor-pointer"
            >
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold text-[#6E6960]">待处理业务队列</span>
                <span class="w-8 h-8 rounded-xl bg-[#FBECE9] text-[#B83828] flex items-center justify-center"><BellRing :size="15" /></span>
              </div>
              <div class="font-mono text-2xl font-bold text-[#B83828] mt-2">{{ store.totalPendingCount }} <span class="text-xs font-normal text-[#6E6960]">项</span></div>
              <div class="text-[11px] text-[#6E6960] mt-1">
                订单 {{ store.pendingOrdersCount }} · 认养 {{ store.pendingAdoptionsCount }} · 反馈 {{ store.pendingFeedbacksCount }}
              </div>
            </button>
          </div>

          <!-- ECharts 双图 -->
          <RuralAdminCharts :trend="store.revenueTrend" :category-share="store.categoryShare" />

          <!-- 下半区三栏智能面板：最新订单 + 区域示范带进度 + 双端实时日志 -->
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <!-- 最新助农订单 -->
            <div class="xl:col-span-5 bg-white/86 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 p-5 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-bold text-[#16261F]">最新助农订单</h3>
                <button type="button" @click="activeTab = 'orders'" class="text-[11.5px] text-[#1F4E3D] font-bold cursor-pointer">全部订单 →</button>
              </div>
              <div class="divide-y divide-[#1C1B18]/6">
                <div v-for="ord in store.orders.slice(0, 4)" :key="ord.id" class="py-2.5 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-[12.5px] font-bold text-[#1C1B18] truncate">{{ ord.customer }} · {{ ord.items[0]?.name }}</div>
                    <div class="font-mono text-[10.5px] text-[#6E6960]">{{ ord.id }} · ¥{{ ord.total }}</div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-[10.5px] font-semibold px-2 py-0.5 rounded-full border" :class="statusPill(ord.status)">{{ ord.status }}</span>
                    <button
                      v-if="ord.status === '待发货'"
                      type="button"
                      @click="store.updateOrderStatus(ord.id, '已发货'); showToast(`订单 ${ord.id} 已发货，App 已同步`)"
                      class="px-2.5 py-1 rounded-lg bg-[#1F4E3D] text-white text-[11px] font-bold cursor-pointer"
                    >
                      发货
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 县域振兴示范带进度矩阵 -->
            <div class="xl:col-span-4 bg-white/86 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 p-5 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] space-y-3.5">
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-bold text-[#16261F]">重点振兴示范带进度</h3>
                <span class="font-mono text-[10px] text-[#6E6960]">JILIN 4 ZONES</span>
              </div>
              <div class="space-y-3">
                <div v-for="z in regionalZones" :key="z.name" class="space-y-1">
                  <div class="flex items-center justify-between text-[11.5px]">
                    <span class="font-semibold text-[#1C1B18] truncate">{{ z.name }}</span>
                    <span class="font-mono font-bold text-[#16261F]">{{ z.pct }}%</span>
                  </div>
                  <div class="h-2 rounded-full bg-[#F1EFE9] overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700" :style="{ width: `${z.pct}%`, backgroundColor: z.color }"></div>
                  </div>
                  <div class="text-[10px] text-[#6E6960]">{{ z.tag }}</div>
                </div>
              </div>
            </div>

            <!-- 双端实时同步审计日志 -->
            <div class="xl:col-span-3 bg-white/86 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 p-5 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-bold text-[#16261F] flex items-center gap-1.5">
                  <Activity :size="14" class="text-[#1F4E3D]" />
                  <span>双端同步动态</span>
                </h3>
                <span class="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              </div>
              <div class="space-y-2.5 max-h-[210px] overflow-y-auto pr-1">
                <div v-for="lg in store.activityLogs.slice(0, 6)" :key="lg.id" class="p-2.5 rounded-xl bg-[#F8F6F1] space-y-1">
                  <div class="flex items-center justify-between gap-1">
                    <span
                      class="px-1.5 py-0.2 rounded text-[9.5px] font-bold"
                      :class="lg.source === 'App 端' ? 'bg-[#FDF4E6] text-[#9A6518]' : 'bg-[#EAF3EE] text-[#1F4E3D]'"
                    >{{ lg.source }}</span>
                    <span class="font-mono text-[9.5px] text-[#8E887E]">{{ lg.time }}</span>
                  </div>
                  <div class="text-[11px] font-bold text-[#1C1B18]">{{ lg.action }}</div>
                  <div class="text-[10px] text-[#5A564E] line-clamp-2">{{ lg.detail }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ==================== 1.5 北斗孪生调度雷达 ==================== -->
        <template v-else-if="activeTab === 'telemetry'">
          <AdminTelemetryMap />
        </template>

        <!-- ==================== 2. 农产集市管理 ==================== -->
        <template v-else-if="activeTab === 'products'">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="relative w-full sm:w-72">
              <Search :size="14" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6960]" />
              <input
                v-model="prodSearch"
                type="search"
                placeholder="搜索商品名称、产地或品类…"
                class="w-full h-9.5 pl-9 pr-3 rounded-xl bg-white border border-[#1C1B18]/10 text-xs focus:outline-none focus:border-[#1F4E3D]"
              />
            </div>
            <button
              type="button"
              @click="openProdModal()"
              class="h-9.5 px-4 rounded-xl bg-[#1F4E3D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#16382B]"
            >
              <Plus :size="15" />
              <span>新增助农商品</span>
            </button>
          </div>

          <div class="bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 overflow-hidden shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)]">
            <div tabindex="0" role="region" aria-label="农产品列表" class="table-wrapper overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead class="bg-[#F8F6F1] text-[11px] font-semibold text-[#5A564E] border-b border-[#1C1B18]/8">
                  <tr>
                    <th class="py-3 px-4">商品信息</th>
                    <th class="py-3 px-3">品类 / 产地</th>
                    <th class="py-3 px-3">售价</th>
                    <th class="py-3 px-3">库存 / 销量</th>
                    <th class="py-3 px-3">状态</th>
                    <th class="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#1C1B18]/6 text-[12.5px]">
                  <tr v-for="p in filteredProducts" :key="p.id" class="hover:bg-[#FAF8F4]/70">
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        <img :src="p.image" :alt="p.name" class="w-11 h-11 rounded-xl object-cover shrink-0 border border-[#1C1B18]/8" />
                        <div class="min-w-0">
                          <div class="font-bold text-[#1C1B18]">{{ p.name }}</div>
                          <div class="text-[11px] text-[#6E6960] font-mono">{{ p.traceCode }} · 助农 {{ p.farmerSharePct }}%</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-3">
                      <div class="font-medium text-[#1C1B18]">{{ p.category }}</div>
                      <div class="text-[11px] text-[#6E6960]">{{ p.origin }}</div>
                    </td>
                    <td class="py-3 px-3 font-mono font-bold text-[#B83828]">¥{{ p.price }}</td>
                    <td class="py-3 px-3 font-mono text-[12px]">
                      <span :class="p.stock < 40 ? 'text-[#B83828] font-bold' : 'text-[#1C1B18]'">{{ p.stock }}</span>
                      <span class="text-[#8E887E]"> / {{ p.sales }}</span>
                    </td>
                    <td class="py-3 px-3">
                      <span class="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border" :class="statusPill(p.status)">
                        {{ p.status }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <div class="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="store.toggleProductStatus(p.id); showToast(`「${p.name}」已切换为${p.status}`)"
                          class="px-2.5 py-1 rounded-lg border border-[#1C1B18]/12 text-[11px] font-medium hover:bg-[#F3F0E9] cursor-pointer"
                        >
                          {{ p.status === '上架' ? '下架' : '上架' }}
                        </button>
                        <button
                          type="button"
                          @click="openProdModal(p)"
                          class="p-1.5 rounded-lg border border-[#1C1B18]/12 hover:bg-[#F3F0E9] cursor-pointer"
                          aria-label="编辑商品"
                        >
                          <Pencil :size="13" />
                        </button>
                        <button
                          type="button"
                          @click="store.deleteProduct(p.id); showToast('商品已删除')"
                          class="p-1.5 rounded-lg border border-[#B83828]/25 text-[#B83828] hover:bg-[#FBECE9] cursor-pointer"
                          aria-label="删除商品"
                        >
                          <Trash2 :size="13" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <!-- ==================== 3. 助农订单管理 ==================== -->
        <template v-else-if="activeTab === 'orders'">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="st in ['全部', '待发货', '已发货', '已完成']"
                :key="st"
                type="button"
                @click="orderFilter = st"
                class="px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors"
                :class="orderFilter === st ? 'bg-[#16261F] text-[#F0C275]' : 'bg-white border border-[#1C1B18]/10 text-[#5A564E]'"
              >
                {{ st }}
              </button>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-if="store.pendingOrdersCount > 0"
                type="button"
                @click="batchShipPendingOrders"
                class="px-3.5 py-1.5 rounded-full bg-[#1F4E3D] text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-[#16382B]"
              >
                <Truck :size="13" />
                <span>一键批量发货 ({{ store.pendingOrdersCount }})</span>
              </button>
              <button
                type="button"
                @click="exportOrdersCSV"
                class="px-3.5 py-1.5 rounded-full bg-white/90 border border-[#C88A32]/25 text-[#16261F] text-xs font-bold flex items-center gap-1 cursor-pointer hover:border-[#1F4E3D]"
              >
                <Download :size="13" />
                <span>导出 CSV 报表</span>
              </button>
              <button
                type="button"
                @click="handleSimulateOrder"
                class="px-3.5 py-1.5 rounded-full bg-[#FDF4E6] border border-[#C88A32]/35 text-[#8A5810] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Zap :size="13" />
                <span>模拟 App 下单</span>
              </button>
            </div>
          </div>

          <div class="bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 overflow-hidden shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)]">
            <div tabindex="0" role="region" aria-label="助农订单表" class="table-wrapper overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead class="bg-[#F8F6F1] text-[11px] font-semibold text-[#5A564E] border-b border-[#1C1B18]/8">
                  <tr>
                    <th class="py-3 px-4">订单编号 / 时间</th>
                    <th class="py-3 px-3">买家与收货地</th>
                    <th class="py-3 px-3">商品明细</th>
                    <th class="py-3 px-3">实付金额</th>
                    <th class="py-3 px-3">状态</th>
                    <th class="py-3 px-4 text-right">履约操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#1C1B18]/6 text-[12.5px]">
                  <tr v-for="ord in filteredOrders" :key="ord.id" class="hover:bg-[#FAF8F4]/70">
                    <td class="py-3 px-4">
                      <div class="font-mono font-bold text-[#1C1B18]">{{ ord.id }}</div>
                      <div class="font-mono text-[10.5px] text-[#6E6960]">{{ ord.createdAt }}</div>
                    </td>
                    <td class="py-3 px-3">
                      <div class="font-semibold">{{ ord.customer }} <span class="text-[#6E6960] font-normal">{{ ord.phone }}</span></div>
                      <div class="text-[11px] text-[#6E6960] max-w-[220px] truncate">{{ ord.address }}</div>
                    </td>
                    <td class="py-3 px-3">
                      <div v-for="(it, i) in ord.items" :key="i" class="text-[12px]">
                        {{ it.name }} <span class="font-mono text-[#6E6960]">×{{ it.qty }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-3 font-mono font-bold text-[#B83828]">¥{{ ord.total }}</td>
                    <td class="py-3 px-3">
                      <span class="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border" :class="statusPill(ord.status)">
                        {{ ord.status }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <button
                        v-if="ord.status === '待发货'"
                        type="button"
                        @click="store.updateOrderStatus(ord.id, '已发货'); showToast(`订单 ${ord.id} 已安排冷链发货，App 物流追踪已更新`)"
                        class="px-3 py-1.5 rounded-lg bg-[#1F4E3D] text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Truck :size="12" />
                        <span>确认发货</span>
                      </button>
                      <button
                        v-else-if="ord.status === '已发货'"
                        type="button"
                        @click="store.updateOrderStatus(ord.id, '已完成'); showToast(`订单 ${ord.id} 已签收完成`)"
                        class="px-3 py-1.5 rounded-lg bg-[#C88A32] text-[#16261F] text-[11px] font-bold cursor-pointer"
                      >
                        标记完成
                      </button>
                      <span v-else class="text-[11px] text-[#8E887E]">已归档</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <!-- ==================== 4. 云认养与地块管理 ==================== -->
        <template v-else-if="activeTab === 'adoptions'">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="plot in store.plots" :key="plot.id" class="bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 p-4 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] space-y-3">
              <div class="flex items-start gap-3">
                <img :src="plot.image" :alt="plot.name" class="w-15 h-15 rounded-xl object-cover shrink-0 border border-[#C88A32]/20" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1.5">
                    <span class="font-mono text-[11px] font-bold text-[#1F4E3D] bg-[#EAF3EE] px-2 py-0.5 rounded">{{ plot.code }}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDF4E6] text-[#9A6518]">{{ plot.category || '黑土粮田' }}</span>
                  </div>
                  <div class="font-bold text-[13px] text-[#16261F] truncate mt-1">{{ plot.name }}</div>
                  <div class="text-[10.5px] text-[#6E6960] truncate">{{ plot.coop }}</div>
                </div>
              </div>
              <div class="space-y-1">
                <div class="flex justify-between text-[10.5px]">
                  <span class="text-[#6E6960]">认养名额余量</span>
                  <span class="font-mono font-bold text-[#1F4E3D]">余 {{ plot.slotsLeft }} / {{ plot.totalSlots }} 份</span>
                </div>
                <div class="h-1.5 rounded-full bg-[#ECE8DF] overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-[#1F4E3D] to-[#C88A32]" :style="{ width: `${Math.round(((plot.totalSlots - plot.slotsLeft) / plot.totalSlots) * 100)}%` }"></div>
                </div>
              </div>
              <div>
                <label class="block text-[10.5px] text-[#6E6960] mb-1">切换当前物候阶段（App 云农田实时同步）</label>
                <select
                  :value="plot.stage"
                  @change="(e) => { const s = plotStages.find((x) => x.label === e.target.value); if (s) { store.updatePlotStage(plot.id, s.label, s.idx); showToast(`地块 ${plot.code} 物候已更新`) } }"
                  class="w-full h-9 px-2.5 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs font-medium"
                >
                  <option v-for="s in plotStages" :key="s.label" :value="s.label">{{ s.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 overflow-hidden shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)]">
            <div class="px-5 py-3.5 border-b border-[#1C1B18]/8 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 class="text-[13.5px] font-bold">云认养申请与证书审核</h3>
                <span class="text-[11px] text-[#6E6960]">点击「审核通过」后 App 端电子证书立即生效</span>
              </div>
              <button
                type="button"
                @click="exportAdoptionsCSV"
                class="px-3 py-1.5 rounded-full bg-white border border-[#C88A32]/25 text-[#16261F] text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:border-[#1F4E3D]"
              >
                <Download :size="12" />
                <span>导出认养 CSV</span>
              </button>
            </div>
            <div tabindex="0" role="region" aria-label="认养申请表" class="table-wrapper overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead class="bg-[#F8F6F1] text-[11px] font-semibold text-[#5A564E] border-b border-[#1C1B18]/8">
                  <tr>
                    <th class="py-3 px-4">认养单号</th>
                    <th class="py-3 px-3">地块与份数</th>
                    <th class="py-3 px-3">认养人</th>
                    <th class="py-3 px-3">金额</th>
                    <th class="py-3 px-3">状态</th>
                    <th class="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#1C1B18]/6 text-[12.5px]">
                  <tr v-for="adp in store.adoptions" :key="adp.id">
                    <td class="py-3 px-4 font-mono font-bold">{{ adp.id }}</td>
                    <td class="py-3 px-3">
                      <div class="font-semibold">{{ adp.plotName }}</div>
                      <div class="text-[11px] text-[#6E6960]">{{ adp.plotCode }} · {{ adp.shares }} 份 · {{ adp.stage }}</div>
                    </td>
                    <td class="py-3 px-3">{{ adp.adopter }}</td>
                    <td class="py-3 px-3 font-mono font-bold text-[#B83828]">¥{{ adp.amount }}</td>
                    <td class="py-3 px-3">
                      <span class="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border" :class="statusPill(adp.status)">
                        {{ adp.status }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <button
                        v-if="adp.status === '待审核'"
                        type="button"
                        @click="store.updateAdoptionStatus(adp.id, '已生效'); showToast(`认养单 ${adp.plotCode} 已签发电子证书`)"
                        class="px-3 py-1.5 rounded-lg bg-[#1F4E3D] text-white text-[11px] font-bold cursor-pointer"
                      >
                        审核通过
                      </button>
                      <span v-else class="text-[11px] text-[#1F4E3D] font-semibold">证书生效</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <!-- ==================== 5. 振兴项目 + 慢直播机位 + 北斗农机 ==================== -->
        <template v-else-if="activeTab === 'projects'">
          <div class="flex items-center justify-between">
            <h3 class="text-[14.5px] font-bold text-[#16261F]">重点乡村振兴项目档案</h3>
            <button
              type="button"
              @click="openPrjModal"
              class="h-9 px-3.5 rounded-xl bg-[#1F4E3D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus :size="14" />
              <span>新增振兴项目</span>
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div v-for="prj in store.projects" :key="prj.id" class="bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] p-4 flex gap-4">
              <img :src="prj.cover" :alt="prj.name" class="w-24 h-24 rounded-xl object-cover shrink-0" />
              <div class="flex-1 min-w-0 space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#EAF3EE] text-[#1F4E3D]">{{ prj.category }}</span>
                  <span class="text-[10.5px] font-semibold px-2 py-0.5 rounded-full border" :class="statusPill(prj.status)">{{ prj.status }}</span>
                </div>
                <div class="font-bold text-[13.5px] text-[#1C1B18] truncate">{{ prj.name }}</div>
                <div class="text-[11px] text-[#6E6960]">{{ prj.village }} · 带动 {{ prj.households }} 户 · 资金 {{ prj.fundWan }} 万</div>
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 rounded-full bg-[#1C1B18]/8 overflow-hidden">
                    <div class="h-full bg-[#1F4E3D] rounded-full transition-all" :style="{ width: `${prj.progress}%` }"></div>
                  </div>
                  <span class="font-mono text-xs font-bold text-[#1F4E3D] w-9">{{ prj.progress }}%</span>
                  <button type="button" @click="bumpProjectProgress(prj, -5)" class="w-6 h-6 rounded bg-[#F3F0E9] text-xs font-bold cursor-pointer">-</button>
                  <button type="button" @click="bumpProjectProgress(prj, 5)" class="w-6 h-6 rounded bg-[#1F4E3D] text-white text-xs font-bold cursor-pointer">+</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 产地慢直播机位控制台 -->
          <div class="bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-[14px] font-bold text-[#16261F] flex items-center gap-2">
                <Radio :size="15" class="text-[#B83828]" />
                <span>黑土慢直播机位控制台</span>
              </h3>
              <span class="text-[11px] text-[#6E6960]">切换「直播中 / 回放」将实时同步至 App 首页直播圈</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="cam in store.liveCams" :key="cam.id" class="p-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/8 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <img :src="cam.image" :alt="cam.title" class="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div class="min-w-0">
                    <div class="font-bold text-[12.5px] truncate">{{ cam.title }}</div>
                    <div class="text-[11px] text-[#6E6960]">{{ cam.location }} · {{ cam.viewers }} 人在看</div>
                  </div>
                </div>
                <button
                  type="button"
                  @click="store.toggleLiveCamStatus(cam.id); showToast(`机位「${cam.shortTitle}」已切换为 ${cam.status}`)"
                  class="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border cursor-pointer"
                  :class="statusPill(cam.status)"
                >
                  {{ cam.status }}
                </button>
              </div>
            </div>
          </div>

          <!-- 北斗农机调度台 -->
          <div class="bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-[14px] font-bold text-[#16261F]">北斗农机实时调度台账</h3>
              <span class="text-[11px] text-[#6E6960]">点击状态胶囊即可切换调度状态，同步至 App 农情看板</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="m in store.machinery" :key="m.id" class="p-3.5 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/8 flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-bold text-[12.5px] truncate">{{ m.name }}</div>
                  <div class="text-[11px] text-[#6E6960]">{{ m.area }} · {{ m.task }} · 能源 {{ m.batteryOrFuel }}%</div>
                </div>
                <button
                  type="button"
                  @click="store.cycleMachineryStatus(m.id); showToast(`${m.code} 已切换为 ${m.status}`)"
                  class="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border cursor-pointer"
                  :class="statusPill(m.status)"
                >
                  {{ m.status }}
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- ==================== 6. 村务公告与反馈回复 ==================== -->
        <template v-else-if="activeTab === 'village'">
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-5">
            <div class="xl:col-span-5 bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] p-5 space-y-3.5 h-fit">
              <h3 class="text-[14px] font-bold text-[#16261F]">下发新村务公告（实时推送至 App 首页）</h3>
              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] text-[#6E6960] mb-1">公告标签</label>
                  <select v-model="noticeForm.tag" class="w-full h-9 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs">
                    <option value="农时预警">农时预警</option>
                    <option value="惠农政策">惠农政策</option>
                    <option value="村务公告">村务公告</option>
                    <option value="助农喜报">助农喜报</option>
                  </select>
                </div>
                <div class="flex items-end pb-1.5">
                  <label class="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input v-model="noticeForm.pinned" type="checkbox" class="accent-[#1F4E3D] w-4 h-4" />
                    <span>置顶到 App 首页</span>
                  </label>
                </div>
              </div>
              <input
                v-model="noticeForm.title"
                type="text"
                placeholder="输入公告标题…"
                class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs"
              />
              <textarea
                v-model="noticeForm.content"
                rows="3"
                placeholder="输入详细公告正文…"
                class="w-full p-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs resize-none"
              ></textarea>
              <button
                type="button"
                @click="handlePublishNotice"
                class="w-full h-10 rounded-xl bg-[#1F4E3D] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send :size="13" />
                <span>立即推送至移动端 App</span>
              </button>

              <div class="pt-3 border-t border-[#1C1B18]/8 space-y-2">
                <div v-for="n in store.notices" :key="n.id" class="p-2.5 rounded-xl bg-[#F8F6F1] flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="text-[11.5px] font-bold text-[#1C1B18] line-clamp-1">
                      <span class="text-[#C88A32] mr-1">[{{ n.tag }}]</span>{{ n.title }}
                    </div>
                    <div class="text-[10px] text-[#6E6960] font-mono mt-0.5">{{ n.date }} {{ n.pinned ? '· 已置顶' : '' }}</div>
                  </div>
                  <button type="button" @click="store.deleteNotice(n.id)" class="text-[#B83828] p-1 cursor-pointer" aria-label="删除公告">
                    <Trash2 :size="13" />
                  </button>
                </div>
              </div>
            </div>

            <div class="xl:col-span-7 bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] p-5 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-[14px] font-bold text-[#16261F]">村民直报与反馈处理队列</h3>
                <span class="text-[11px] text-[#6E6960]">待处理 {{ store.pendingFeedbacksCount }} 条</span>
              </div>
              <div class="space-y-3">
                <div v-for="fb in store.feedbacks" :key="fb.id" class="p-4 rounded-2xl bg-[#FAF8F4] border border-[#1C1B18]/8 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="text-[12.5px] font-bold text-[#1C1B18]">{{ fb.user }} <span class="font-normal text-[#6E6960]">· {{ fb.village }}</span></div>
                    <span class="text-[10.5px] font-semibold px-2 py-0.5 rounded-full border" :class="statusPill(fb.status)">{{ fb.status }}</span>
                  </div>
                  <p class="text-[12px] text-[#3E3B35] leading-relaxed">{{ fb.content }}</p>
                  <div class="text-[10.5px] font-mono text-[#8E887E]">{{ fb.type }} · {{ fb.time }}</div>
                  <div v-if="fb.reply" class="p-2.5 rounded-xl bg-[#EAF3EE] text-[#1F4E3D] text-[11.5px]">
                    <strong>已回复：</strong>{{ fb.reply }}
                  </div>
                  <div class="flex items-center gap-2 pt-1">
                    <input
                      v-model="replyDrafts[fb.id]"
                      type="text"
                      placeholder="输入官方答复或调度安排，发送后 App 端实时显示…"
                      class="flex-1 h-9 px-3 rounded-xl bg-white border border-[#1C1B18]/12 text-xs"
                      @keydown.enter="sendReply(fb)"
                    />
                    <button
                      type="button"
                      @click="sendReply(fb)"
                      class="h-9 px-3.5 rounded-xl bg-[#1F4E3D] text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      发送回复
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ==================== 7. App 与系统设置 ==================== -->
        <template v-else-if="activeTab === 'settings'">
          <div class="max-w-2xl space-y-4">
            <div class="bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] p-5 space-y-4">
              <h3 class="text-[14px] font-bold text-[#16261F]">移动端 App 首页配置（修改后即时生效）</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">App 品牌名称</label>
                  <input v-model="store.appConfig.brandName" type="text" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">当前节气胶囊</label>
                  <input v-model="store.appConfig.solarTerm" type="text" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs" />
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">App 首屏主标语</label>
                <input v-model="store.appConfig.heroHeadline" type="text" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">App 首屏副标题</label>
                <input v-model="store.appConfig.heroSubline" type="text" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs" />
              </div>
            </div>

            <div class="bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 class="text-[13.5px] font-bold text-[#16261F]">导出全平台运营数据快照 (JSON)</h3>
                <p class="text-[11.5px] text-[#6E6960] mt-0.5">一键备份当前商品、订单、云认养地块与振兴项目实时状态</p>
              </div>
              <button
                type="button"
                @click="exportJsonSnapshot"
                class="px-4 py-2 rounded-xl bg-[#1F4E3D] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#16382B] cursor-pointer shrink-0"
              >
                <Download :size="14" />
                <span>导出 JSON</span>
              </button>
            </div>

            <div class="bg-white/88 backdrop-blur-md rounded-2xl border border-[#C88A32]/16 shadow-[0_8px_24px_-14px_rgba(22,38,31,0.14)] p-5 flex items-center justify-between gap-4">
              <div>
                <h3 class="text-[13.5px] font-bold text-[#1C1B18]">恢复初始演示数据</h3>
                <p class="text-[11.5px] text-[#6E6960] mt-0.5">重置商品、订单、云认养、慢直播、公告与反馈至默认答辩演示状态</p>
              </div>
              <button
                type="button"
                @click="store.resetAllDemoData(); showToast('已恢复初始演示数据')"
                class="px-4 py-2 rounded-xl border border-[#B83828]/30 text-[#B83828] text-xs font-bold flex items-center gap-1.5 hover:bg-[#FBECE9] cursor-pointer shrink-0"
              >
                <RotateCcw :size="14" />
                <span>一键重置</span>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ==================== 原生 <dialog>：全局快捷指令搜索 (Ctrl + K) ==================== -->
    <dialog
      ref="cmdDialogRef"
      closedby="any"
      aria-labelledby="cmd-dialog-title"
      class="admin-dialog m-auto w-[min(560px,calc(100vw-2rem))] rounded-[1.5rem] bg-white p-0 text-[#1C1B18] shadow-2xl border border-[#C88A32]/25"
    >
      <div class="p-4 border-b border-[#1C1B18]/8 flex items-center gap-2.5">
        <Search :size="16" class="text-[#1F4E3D] shrink-0" />
        <input
          id="cmd-dialog-title"
          v-model="cmdQuery"
          autofocus
          type="search"
          placeholder="搜索功能模块、14 款地标商品、订单号或 7 个云认养地块…"
          class="flex-1 bg-transparent text-sm text-[#16261F] placeholder:text-[#8E887E] focus:outline-none"
        />
        <button type="button" @click="cmdDialogRef?.close()" class="w-7 h-7 rounded-full bg-[#F5F2EB] flex items-center justify-center cursor-pointer" aria-label="关闭搜索">
          <X :size="14" />
        </button>
      </div>
      <div class="max-h-[340px] overflow-y-auto p-2 space-y-1">
        <button
          v-for="item in cmdResults"
          :key="item.key"
          type="button"
          @click="runCmdItem(item)"
          class="w-full px-3.5 py-2.5 rounded-xl hover:bg-[#F5F2EB] flex items-center justify-between gap-3 text-left cursor-pointer transition-colors"
        >
          <div class="min-w-0">
            <div class="text-[12.5px] font-bold text-[#16261F] truncate">{{ item.title }}</div>
            <div class="text-[11px] text-[#6E6960] truncate">{{ item.sub }}</div>
          </div>
          <span class="shrink-0 px-2 py-0.5 rounded-full bg-[#EAF3EE] text-[#1F4E3D] text-[10px] font-bold">{{ item.group }}</span>
        </button>
        <div v-if="!cmdResults.length" class="py-10 text-center text-xs text-[#6E6960]">未找到匹配的商品、订单或地块</div>
      </div>
    </dialog>

    <!-- ==================== 原生 <dialog>：新增/编辑商品 ==================== -->
    <dialog
      ref="prodDialogRef"
      closedby="any"
      aria-labelledby="prod-dialog-title"
      class="admin-dialog m-auto w-[min(520px,calc(100vw-2rem))] rounded-[1.5rem] bg-white p-0 text-[#1C1B18] shadow-2xl border border-[#1C1B18]/10"
    >
      <form @submit.prevent="saveProduct" class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 id="prod-dialog-title" class="font-editorial text-lg font-bold">{{ prodForm.id ? '编辑助农商品' : '新增助农商品' }}</h2>
          <button type="button" @click="prodDialogRef?.close()" class="w-8 h-8 rounded-full bg-[#F6F5F0] flex items-center justify-center cursor-pointer" aria-label="关闭弹窗">
            <X :size="15" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2">
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">商品名称</label>
            <input v-model="prodForm.name" required autofocus type="text" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">品类</label>
            <select v-model="prodForm.category" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs">
              <option value="黑土粳稻">黑土粳稻</option>
              <option value="生态渔猎">生态渔猎</option>
              <option value="黄金玉米">黄金玉米</option>
              <option value="长白山珍">长白山珍</option>
              <option value="黑土杂粮">黑土杂粮</option>
              <option value="寒地鲜果">寒地鲜果</option>
              <option value="乡野佳酿">乡野佳酿</option>
              <option value="非遗风味">非遗风味</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">产地</label>
            <input v-model="prodForm.origin" type="text" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">售价 (¥)</label>
            <input v-model.number="prodForm.price" type="number" step="0.1" min="1" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs font-mono" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">库存</label>
            <input v-model.number="prodForm.stock" type="number" min="0" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs font-mono" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">封面实景图</label>
            <select v-model="prodForm.image" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs">
              <option v-for="img in imageChoices" :key="img.url" :value="img.url">{{ img.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">角标</label>
            <input v-model="prodForm.badge" type="text" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" @click="prodDialogRef?.close()" class="h-9.5 px-4 rounded-xl bg-[#F6F5F0] text-xs font-semibold cursor-pointer">取消</button>
          <button type="submit" class="h-9.5 px-5 rounded-xl bg-[#1F4E3D] text-white text-xs font-bold cursor-pointer">保存并同步到 App</button>
        </div>
      </form>
    </dialog>

    <!-- ==================== 原生 <dialog>：新增振兴项目 ==================== -->
    <dialog
      ref="prjDialogRef"
      closedby="any"
      aria-labelledby="prj-dialog-title"
      class="admin-dialog m-auto w-[min(500px,calc(100vw-2rem))] rounded-[1.5rem] bg-white p-0 text-[#1C1B18] shadow-2xl border border-[#1C1B18]/10"
    >
      <form @submit.prevent="saveProject" class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 id="prj-dialog-title" class="font-editorial text-lg font-bold">新增乡村振兴项目</h2>
          <button type="button" @click="prjDialogRef?.close()" class="w-8 h-8 rounded-full bg-[#F6F5F0] flex items-center justify-center cursor-pointer" aria-label="关闭弹窗">
            <X :size="15" />
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2">
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">项目名称</label>
            <input v-model="prjForm.name" required autofocus type="text" placeholder="例如：长春九台数字稻作冷链中心" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">分类</label>
            <select v-model="prjForm.category" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs">
              <option value="生态保育">生态保育</option>
              <option value="智慧装备">智慧装备</option>
              <option value="产业流通">产业流通</option>
              <option value="绿色能源">绿色能源</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">所在村镇</label>
            <input v-model="prjForm.village" type="text" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">带动农户 (户)</label>
            <input v-model.number="prjForm.households" type="number" min="1" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs font-mono" />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">专项资金 (万元)</label>
            <input v-model.number="prjForm.fundWan" type="number" min="10" class="w-full h-9.5 px-3 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs font-mono" />
          </div>
          <div class="col-span-2">
            <label class="block text-[11px] font-semibold text-[#5A564E] mb-1">项目简介</label>
            <textarea v-model="prjForm.summary" rows="2" class="w-full p-2.5 rounded-xl bg-[#F8F6F1] border border-[#1C1B18]/10 text-xs resize-none"></textarea>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" @click="prjDialogRef?.close()" class="h-9.5 px-4 rounded-xl bg-[#F6F5F0] text-xs font-semibold cursor-pointer">取消</button>
          <button type="submit" class="h-9.5 px-5 rounded-xl bg-[#1F4E3D] text-white text-xs font-bold cursor-pointer">发布并同步到 App</button>
        </div>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
.table-wrapper {
  container-type: inline-size;
}
.table-wrapper thead {
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
}

dialog.admin-dialog:modal {
  overscroll-behavior: contain;
}
dialog.admin-dialog::backdrop {
  background: rgba(22, 38, 31, 0.48);
  backdrop-filter: blur(4px);
  overflow: hidden;
  overscroll-behavior: contain;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
