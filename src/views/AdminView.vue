<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { sharedTextureStats, disposeSharedTextures } from '../lib/textureCache.js'
import {
  LayoutDashboard, Layers, Cog, MapPin, MessageSquare, Settings,
  LogOut, Plus, Pencil, Trash2, Check, X, Save, RotateCcw,
  ArrowUpRight, ShieldCheck, Eye, Clock3, Bell
} from 'lucide-vue-next'
import { useAdminStore } from '../stores/adminStore'
import AdminCharts from '../components/AdminCharts.vue'

const store = useAdminStore()

/* ---------------- 3D 共享纹理维护 ---------------- */
const cacheStats = ref({ groups: 0, textures: 0, mb: 0 })
const cacheHint = ref('')
const refreshCacheStats = () => { cacheStats.value = sharedTextureStats() }
const releaseCache = () => {
  const n = disposeSharedTextures()
  refreshCacheStats()
  cacheHint.value = `已释放 ${n} 张共享纹理`
  window.setTimeout(() => { cacheHint.value = '' }, 3200)
}
onMounted(refreshCacheStats)

/* ---------------- 登录门禁 ---------------- */
const password = ref('')
const loginError = ref('')
const doLogin = () => {
  if (store.login(password.value)) {
    loginError.value = ''
    password.value = ''
  } else {
    loginError.value = '密码不对，再试一次'
  }
}
const doLogout = () => {
  store.logout()
  activeTab.value = 'overview'
}

/* ---------------- 导航 ---------------- */
const activeTab = ref('overview')
const tabs = [
  { id: 'overview', label: '总览', icon: LayoutDashboard },
  { id: 'strata', label: '黑土地层档案', icon: Layers },
  { id: 'parts', label: '农机部件参数', icon: Cog },
  { id: 'viewpoints', label: '沙盘漫游视点', icon: MapPin },
  { id: 'messages', label: '访客留言', icon: MessageSquare },
  { id: 'settings', label: '系统设置', icon: Settings }
]
const currentTab = computed(() => tabs.find((t) => t.id === activeTab.value) || tabs[0])
const todayText = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit'
}).replace(/\//g, ' / ')

/* ---------------- 展陈内容表格配置 ---------------- */
const tableConfig = {
  strata: {
    title: '黑土地层档案',
    hint: '对应 3D 黑土地质标本馆的三层断代剖面与探针卡片',
    rows: () => store.strata,
    columns: [
      { key: 'name', label: '地层名称' },
      { key: 'depth', label: '深度' },
      { key: 'organic', label: '有机质' },
      { key: 'feature', label: '核心特征' }
    ],
    fields: [
      { key: 'name', label: '地层名称' },
      { key: 'depth', label: '深度' },
      { key: 'colorHex', label: '标本色值' },
      { key: 'organic', label: '有机质指标' },
      { key: 'feature', label: '核心特征' },
      { key: 'desc', label: '策展解读', multiline: true }
    ],
    blank: { name: '', depth: '', colorHex: '#42362B', organic: '', feature: '', desc: '' }
  },
  parts: {
    title: '农机部件参数',
    hint: '对应 3D 北斗农机解构馆的部件聚焦按钮与规格便签',
    rows: () => store.parts,
    columns: [
      { key: 'tag', label: '部件标签' },
      { key: 'title', label: '部件名称' },
      { key: 'specs', label: '技术规格' },
      { key: 'desc', label: '解构说明' }
    ],
    fields: [
      { key: 'tag', label: '部件标签' },
      { key: 'title', label: '部件名称' },
      { key: 'specs', label: '技术规格' },
      { key: 'desc', label: '解构说明', multiline: true }
    ],
    blank: { tag: '', title: '', specs: '', desc: '' }
  },
  viewpoints: {
    title: '沙盘漫游视点',
    hint: '对应 3D 生态微缩沙盘的六视点飞行与左侧漫游栏',
    rows: () => store.viewpoints,
    columns: [
      { key: 'id', label: '视点标识' },
      { key: 'name', label: '视点名称' },
      { key: 'desc', label: '导览说明' },
      { key: 'tag', label: '分类' }
    ],
    fields: [
      { key: 'id', label: '视点标识' },
      { key: 'name', label: '视点名称' },
      { key: 'desc', label: '导览说明', multiline: true },
      { key: 'tag', label: '分类' }
    ],
    blank: { id: '', name: '', desc: '', tag: '' }
  }
}

/* ---------------- 编辑弹窗 ---------------- */
const editing = ref(null)
const openEdit = (type, row) => {
  const cfg = tableConfig[type]
  editing.value = {
    type,
    id: row?.id || null,
    form: row ? { ...row } : { ...cfg.blank }
  }
}
const saveEdit = () => {
  if (!editing.value) return
  store.upsert(editing.value.type, editing.value.form)
  editing.value = null
}

const pendingDelete = ref(null)
const confirmDelete = () => {
  if (!pendingDelete.value) return
  store.remove(pendingDelete.value.type, pendingDelete.value.id)
  pendingDelete.value = null
}

/* ---------------- 访客留言 ---------------- */
const showMessageForm = ref(false)
const messageForm = reactive({ name: '', hall: '全馆', text: '' })
const submitMessage = () => {
  if (!messageForm.text.trim()) return
  store.addMessage({ ...messageForm })
  messageForm.name = ''
  messageForm.text = ''
  showMessageForm.value = false
}

/* ---------------- 系统设置 ---------------- */
const settingsForm = reactive({ ...store.settings })
const savedHint = ref(false)
const saveSettings = () => {
  store.updateSettings({ ...settingsForm })
  savedHint.value = true
  setTimeout(() => { savedHint.value = false }, 2200)
}
const showReset = ref(false)
const doReset = () => {
  store.resetAll()
  Object.assign(settingsForm, store.settings)
  showReset.value = false
  savedHint.value = true
  setTimeout(() => { savedHint.value = false }, 2200)
}

const archiveNotes = [
  { tag: 'CURATION', title: '策展口径', desc: '条目参照项目方案与三大 3D 展厅内的展签文案整理，供内容校核与维护使用。' },
  { tag: 'LOCAL DEMO', title: '本地演示存储', desc: '无后端依赖，编辑写入浏览器 localStorage，刷新或重进后台都会保留。' },
  { tag: 'WORKFLOW', title: '维护建议', desc: '修改条目后，建议同步核对对应 3D 展厅的探针卡片与规格便签文案。' }
]

const stats = computed(() => [
  { label: '累计访问', value: store.settings.visitorCounter.toLocaleString(), unit: '人次', color: '#1C1B18', icon: Eye },
  { label: '今日访问', value: store.todayVisits.toLocaleString(), unit: '人次', color: '#C88A32', icon: ArrowUpRight },
  { label: '展陈条目', value: store.contentCount, unit: '条', color: '#2E5A44', icon: Layers },
  { label: '待审留言', value: store.pendingCount, unit: '条', color: '#B83828', icon: Bell }
])
</script>

<template>
  <!-- 登录 -->
  <!-- 层级必须低于悬浮导航（z-50），否则后台会变成没有导航栏的全屏孤岛；
       pt-[5.5rem] 给胶囊导航让出位置。 -->
  <div v-if="!store.authed" class="fixed inset-0 z-30 overflow-y-auto bg-[#F7F4EE] flex items-center justify-center px-6 pt-[5.5rem] paper-grain">
    <div class="absolute inset-0 coord-rule opacity-70 pointer-events-none"></div>
    <div class="absolute right-[6%] top-[8%] watermark text-[18vw] leading-none select-none pointer-events-none">09</div>
    <div class="museum-card relative z-10 w-full max-w-md rounded-3xl border border-[#1C1B18]/10 ring-1 ring-[#1C1B18]/8 ring-offset-4 ring-offset-[#F7F4EE] shadow-xl p-9 paper-grain lift">
      <div class="w-12 h-12 rounded-2xl bg-[#1C1B18] text-[#F7F4EE] flex items-center justify-center font-editorial text-2xl mb-6">吉</div>
      <div class="text-[0.625rem] font-mono uppercase tracking-[0.22em] text-[#8A6324] font-semibold mb-2">CURATOR CONSOLE</div>
      <h1 class="display-3 text-[#1C1B18] mb-2">数字展馆管理后台</h1>
      <p class="text-xs text-[#5A564E] leading-relaxed mb-7">
        管理三大 3D 展厅的策展文案、地层档案、部件参数、漫游视点与访客留言。
      </p>
      <label class="block text-[0.6875rem] font-semibold text-[#5A564E] mb-1.5">管理密码</label>
      <input
        v-model="password"
        type="password"
        placeholder="请输入管理密码"
        @keyup.enter="doLogin"
        class="w-full px-4 py-3 rounded-xl bg-[#F7F4EE] border border-[#1C1B18]/12 text-[1rem] sm:text-sm text-[#1C1B18] outline-none focus:border-[#C88A32] transition-colors"
      />
      <p v-if="loginError" class="text-[0.6875rem] text-[#B83828] mt-2">{{ loginError }}</p>
      <button
        @click="doLogin"
        class="w-full mt-5 py-3 rounded-xl bg-[#C88A32] text-[#1C1B18] text-sm font-semibold hover:bg-[#1C1B18] hover:text-[#F7F4EE] transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <ShieldCheck :size="16" /> 进入控制台
      </button>
      <div class="mt-6 pt-5 border-t border-[#1C1B18]/8 flex items-center justify-between text-[0.6875rem]">
        <RouterLink to="/" class="text-[#5A564E] hover:text-[#C88A32] transition-colors">← 返回展馆序厅</RouterLink>
        <span class="font-mono text-[#6E6960]">演示密码 admin123456</span>
      </div>
      <p class="mt-3 text-[0.625rem] leading-relaxed text-[#6E6960]">
        前端演示门禁，无服务端鉴权，登录状态仅保存在本机浏览器。请勿录入真实数据。
      </p>
    </div>
  </div>

  <!-- 控制台 -->
  <div v-else class="fixed inset-0 z-30 overflow-y-auto bg-[#F7F4EE] flex pt-[5.5rem]">
    <aside class="hidden md:flex w-[15.25rem] shrink-0 sticky top-[5.5rem] h-[calc(100vh-88px)] bg-[#EFECE6]/70 border-r border-[#1C1B18]/8 border-t-[3px] border-t-[#C88A32] flex-col">
      <div class="px-6 py-6 border-b border-[#1C1B18]/8">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-[#1C1B18] text-[#F7F4EE] flex items-center justify-center font-editorial text-lg shrink-0">吉</div>
          <div class="min-w-0">
            <div class="text-sm font-bold text-[#1C1B18] font-editorial truncate">策展控制台</div>
            <div class="text-[0.625rem] font-mono text-[#6E6960] truncate">JIYUN / ADMIN v1.0</div>
          </div>
        </div>
      </div>
      <nav class="flex-1 px-3 py-5 space-y-1">
        <button
          v-for="t in tabs"
          :key="t.id"
          @click="activeTab = t.id"
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 cursor-pointer"
          :class="activeTab === t.id
            ? 'bg-[#FFFFFF] text-[#1C1B18] border border-[#C88A32]/45 shadow-sm font-semibold'
            : 'text-[#5A564E] border border-transparent hover:bg-[#FFFFFF]/60 hover:text-[#1C1B18]'"
        >
          <component :is="t.icon" :size="16" :class="activeTab === t.id ? 'text-[#C88A32]' : ''" />
          <span class="flex-1">{{ t.label }}</span>
          <span
            v-if="t.id === 'messages' && store.pendingCount"
            class="px-1.5 py-0.5 rounded-md bg-[#B83828]/10 text-[#B83828] text-[0.625rem] font-mono font-bold"
          >{{ store.pendingCount }}</span>
        </button>
      </nav>
      <div class="px-4 py-4 border-t border-[#1C1B18]/8 space-y-1">
        <RouterLink to="/" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#5A564E] hover:bg-[#FFFFFF]/60 hover:text-[#1C1B18] transition-colors">
          <ArrowUpRight :size="15" /> 返回展馆前台
        </RouterLink>
        <button @click="doLogout" class="w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[2.5rem] rounded-xl text-xs text-[#B83828] hover:bg-[#B83828]/5 transition-colors cursor-pointer">
          <LogOut :size="15" /> 退出登录
        </button>
      </div>
    </aside>

    <main class="flex-1 min-w-0">
      <header class="sticky top-[5.5rem] z-20 h-16 border-b border-[#1C1B18]/8 flex items-center justify-between px-5 md:px-8 bg-[#F7F4EE]/98 backdrop-blur">
        <div class="flex items-center gap-2 text-xs">
          <span class="text-[#6E6960] font-mono">ADMIN</span>
          <span class="text-[#C8C1B4]">/</span>
          <span class="font-semibold text-[#1C1B18]">{{ currentTab.label }}</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="hidden sm:inline text-[0.6875rem] font-mono text-[#6E6960]">{{ todayText }}</span>
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full museum-panel border border-[#1C1B18]/10">
            <span class="w-1.5 h-1.5 rounded-full bg-[#2E5A44]"></span>
            <span class="text-[0.6875rem] font-medium text-[#1C1B18]">管理员在线</span>
          </div>
        </div>
      </header>

      <!-- 小屏 tab 条 -->
      <div class="md:hidden flex gap-2 overflow-x-auto px-5 py-3 border-b border-[#1C1B18]/8">
        <button
          v-for="t in tabs"
          :key="t.id"
          @click="activeTab = t.id"
          class="shrink-0 px-3 py-2.5 min-h-[2.5rem] rounded-lg text-[0.6875rem] font-medium cursor-pointer border"
          :class="activeTab === t.id ? 'bg-[#FFFFFF] border-[#C88A32] text-[#1C1B18]' : 'border-[#1C1B18]/10 text-[#5A564E]'"
        >{{ t.label }}</button>
      </div>

      <div class="p-5 md:p-8 max-w-[87.5rem] mx-auto">
        <!-- 总览 -->
        <section v-if="activeTab === 'overview'" class="space-y-6">
          <div>
            <div class="text-[0.625rem] font-mono uppercase tracking-[0.2em] text-[#8A6324] font-semibold mb-1">OVERVIEW / 策展态势</div>
            <h2 class="display-3 text-[#1C1B18]">展馆运行总览</h2>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="s in stats" :key="s.label" class="museum-card rounded-2xl border border-[#1C1B18]/10 p-5">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[0.6875rem] text-[#6E6960]">{{ s.label }}</span>
                <component :is="s.icon" :size="16" :style="{ color: s.color }" />
              </div>
              <div class="text-2xl font-black font-editorial tabular-nums" :style="{ color: s.color }">{{ s.value }}</div>
              <div class="text-[0.625rem] font-mono text-[#6E6960] mt-1">{{ s.unit }}</div>
            </div>
          </div>

          <AdminCharts :visits="store.visits" :hall-heat="store.hallHeat" />

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div class="lg:col-span-2 museum-card rounded-2xl border border-[#1C1B18]/10 p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-[#1C1B18] font-editorial">最新访客留言</h3>
                <button @click="activeTab = 'messages'" class="text-[0.6875rem] text-[#8A6324] hover:underline cursor-pointer">查看全部 →</button>
              </div>
              <div class="space-y-3">
                <div v-for="m in store.messages.slice(0, 3)" :key="m.id" class="flex items-start gap-3 pb-3 border-b border-[#1C1B18]/6 last:border-0 last:pb-0">
                  <div class="w-8 h-8 shrink-0 rounded-lg bg-[#EFECE6] flex items-center justify-center text-[0.6875rem] font-bold text-[#5A564E]">{{ m.name.slice(0, 1) }}</div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-semibold text-[#1C1B18]">{{ m.name }}</span>
                      <span class="text-[0.625rem] font-mono text-[#6E6960]">{{ m.hall }}</span>
                    </div>
                    <p class="text-[0.6875rem] text-[#5A564E] mt-0.5 truncate">{{ m.text }}</p>
                  </div>
                  <span class="text-[0.625rem] font-mono text-[#6E6960] shrink-0">{{ m.time }}</span>
                </div>
              </div>
            </div>
            <div class="museum-panel rounded-2xl border border-[#1C1B18]/10 p-5">
              <div class="flex items-center gap-2 mb-3">
                <Bell :size="15" class="text-[#C88A32]" />
                <h3 class="text-sm font-bold text-[#1C1B18] font-editorial">展馆公告</h3>
              </div>
              <p class="text-xs text-[#5A564E] leading-relaxed">{{ store.settings.notice }}</p>
              <div class="mt-5 pt-4 border-t border-[#1C1B18]/8 space-y-2 text-[0.6875rem] text-[#5A564E]">
                <div class="flex items-center gap-2"><Clock3 :size="13" class="text-[#6E6960]" /><span>默认画质 {{ store.settings.defaultQuality === 'high' ? '展览级 IBL + GTAO' : '流畅模式' }}</span></div>
                <div class="flex items-center gap-2"><ShieldCheck :size="13" class="text-[#6E6960]" /><span>自动导览 {{ store.settings.autoTour ? '已开启' : '已关闭' }}</span></div>
              </div>
            </div>
          </div>
        </section>

        <!-- 展陈内容表格 -->
        <section v-else-if="tableConfig[activeTab]" class="space-y-5">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div class="text-[0.625rem] font-mono uppercase tracking-[0.2em] text-[#8A6324] font-semibold mb-1">CURATION / 内容管理</div>
              <h2 class="display-3 text-[#1C1B18]">{{ tableConfig[activeTab].title }}</h2>
              <p class="text-[0.6875rem] text-[#6E6960] mt-1">{{ tableConfig[activeTab].hint }}</p>
            </div>
            <button
              @click="openEdit(activeTab, null)"
              class="museum-panel px-4 py-2.5 min-h-[2.5rem] rounded-xl text-xs font-semibold text-[#1C1B18] border border-[#1C1B18]/10 hover:border-[#C88A32] transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Plus :size="15" /> 新增条目
            </button>
          </div>

          <div class="museum-card rounded-2xl border border-[#1C1B18]/10 overflow-hidden">
            <div
              class="grid gap-4 px-5 py-3 bg-[#EFECE6]/70 border-b border-[#1C1B18]/8 border-t-2 border-t-[#C88A32] text-[0.625rem] font-mono font-semibold uppercase tracking-[0.2em] text-[#8A6324]"
              :style="{ gridTemplateColumns: `repeat(${tableConfig[activeTab].columns.length}, minmax(0, 1fr)) 6rem` }"
            >
              <div v-for="c in tableConfig[activeTab].columns" :key="c.key" class="truncate">{{ c.label }}</div>
              <div>操作</div>
            </div>
            <div
              v-for="row in tableConfig[activeTab].rows()"
              :key="row.id"
              class="grid gap-4 px-5 py-3.5 border-b border-[#1C1B18]/6 last:border-0 hover:bg-[#F7F4EE]/60 transition-colors items-center text-xs text-[#5A564E]"
              :style="{ gridTemplateColumns: `repeat(${tableConfig[activeTab].columns.length}, minmax(0, 1fr)) 6rem` }"
            >
              <div v-for="(c, ci) in tableConfig[activeTab].columns" :key="c.key" class="truncate" :class="ci === 0 ? 'font-semibold text-[#1C1B18]' : ''">
                <span v-if="c.key === 'colorHex'" class="inline-flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full border border-black/10" :style="{ backgroundColor: row.colorHex }"></span>
                  {{ row[c.key] }}
                </span>
                <span v-else>{{ row[c.key] }}</span>
              </div>
              <div class="flex items-center gap-1">
                <button @click="openEdit(activeTab, row)" title="编辑" class="p-1.5 rounded-lg hover:bg-[#C88A32]/10 hover:text-[#C88A32] transition-colors cursor-pointer">
                  <Pencil :size="14" />
                </button>
                <button @click="pendingDelete = { type: activeTab, id: row.id, name: row.name || row.title || row.id }" title="删除" class="p-1.5 rounded-lg hover:bg-[#B83828]/10 hover:text-[#B83828] transition-colors cursor-pointer">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
            <div v-if="!tableConfig[activeTab].rows().length" class="px-5 py-12 text-center text-xs text-[#6E6960]">这一格展签还空着，点右上角新增一条</div>
          </div>
          <p class="text-[0.625rem] font-mono text-[#6E6960]">共 {{ tableConfig[activeTab].rows().length }} 条 · 修改后自动保存到本地</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div v-for="note in archiveNotes" :key="note.tag" class="museum-panel rounded-2xl border border-[#1C1B18]/8 p-4">
              <div class="text-[0.625rem] font-mono uppercase tracking-widest text-[#8A6324] font-semibold mb-1.5">{{ note.tag }}</div>
              <h4 class="text-xs font-bold text-[#1C1B18] font-editorial mb-1">{{ note.title }}</h4>
              <p class="text-[0.6875rem] text-[#5A564E] leading-relaxed">{{ note.desc }}</p>
            </div>
          </div>
        </section>

        <!-- 访客留言 -->
        <section v-else-if="activeTab === 'messages'" class="space-y-5">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div class="text-[0.625rem] font-mono uppercase tracking-[0.2em] text-[#8A6324] font-semibold mb-1">FEEDBACK / 观众声音</div>
              <h2 class="display-3 text-[#1C1B18]">访客留言</h2>
              <p class="text-[0.6875rem] text-[#6E6960] mt-1">待审 {{ store.pendingCount }} 条 · 审核通过后计入展馆公开反馈</p>
            </div>
            <button
              @click="showMessageForm = !showMessageForm"
              class="museum-panel px-4 py-2.5 min-h-[2.5rem] rounded-xl text-xs font-semibold text-[#1C1B18] border border-[#1C1B18]/10 hover:border-[#C88A32] transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <Plus :size="15" /> 录入留言
            </button>
          </div>

          <div v-if="showMessageForm" class="museum-card rounded-2xl border border-[#C88A32]/30 p-5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label class="block text-[0.625rem] font-semibold text-[#5A564E] mb-1.5">访客称呼</label>
              <input v-model="messageForm.name" placeholder="选填" class="w-full px-3 py-2 rounded-lg bg-[#F7F4EE] border border-[#1C1B18]/10 text-[1rem] sm:text-xs outline-none focus:border-[#C88A32]" />
            </div>
            <div>
              <label class="block text-[0.625rem] font-semibold text-[#5A564E] mb-1.5">所属展厅</label>
              <input v-model="messageForm.hall" class="w-full px-3 py-2 rounded-lg bg-[#F7F4EE] border border-[#1C1B18]/10 text-[1rem] sm:text-xs outline-none focus:border-[#C88A32]" />
            </div>
            <div class="md:col-span-2 flex gap-2">
              <input v-model="messageForm.text" placeholder="留言内容" class="flex-1 px-3 py-2 rounded-lg bg-[#F7F4EE] border border-[#1C1B18]/10 text-[1rem] sm:text-xs outline-none focus:border-[#C88A32]" />
              <button @click="submitMessage" class="px-4 py-2.5 min-h-[2.5rem] rounded-lg bg-[#1C1B18] text-[#F7F4EE] text-xs font-semibold cursor-pointer hover:bg-[#C88A32] transition-colors">保存</button>
            </div>
          </div>

          <div class="space-y-3">
            <div v-for="m in store.messages" :key="m.id" class="museum-card rounded-2xl border border-[#1C1B18]/10 p-4 flex flex-wrap items-center gap-4">
              <div class="w-9 h-9 shrink-0 rounded-xl bg-[#EFECE6] flex items-center justify-center text-xs font-bold text-[#5A564E]">{{ m.name.slice(0, 1) }}</div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <span class="text-xs font-bold text-[#1C1B18]">{{ m.name }}</span>
                  <span class="text-[0.625rem] font-mono text-[#6E6960]">{{ m.hall }}</span>
                  <span
                    class="px-1.5 py-0.5 rounded-md text-[0.625rem] font-medium"
                    :class="m.approved ? 'bg-[#2E5A44]/10 text-[#2E5A44]' : 'bg-[#C88A32]/12 text-[#A06D24]'"
                  >{{ m.approved ? '已通过' : '待审核' }}</span>
                </div>
                <p class="text-xs text-[#5A564E]">{{ m.text }}</p>
              </div>
              <span class="text-[0.625rem] font-mono text-[#6E6960]">{{ m.time }}</span>
              <div class="flex items-center gap-1">
                <button v-if="!m.approved" @click="store.approveMessage(m.id)" title="通过" class="p-2 rounded-lg hover:bg-[#2E5A44]/10 text-[#2E5A44] transition-colors cursor-pointer">
                  <Check :size="15" />
                </button>
                <button @click="store.removeMessage(m.id)" title="删除" class="p-2 rounded-lg hover:bg-[#B83828]/10 text-[#B83828] transition-colors cursor-pointer">
                  <Trash2 :size="15" />
                </button>
              </div>
            </div>
            <div v-if="!store.messages.length" class="museum-card rounded-2xl border border-[#1C1B18]/10 px-5 py-12 text-center text-xs text-[#6E6960]">留言簿还空着，等第一位观众写下展签</div>
          </div>
        </section>

        <!-- 系统设置 -->
        <section v-else class="space-y-5 max-w-3xl">
          <div>
            <div class="text-[0.625rem] font-mono uppercase tracking-[0.2em] text-[#8A6324] font-semibold mb-1">SETTINGS / 展馆参数</div>
            <h2 class="display-3 text-[#1C1B18]">系统设置</h2>
            <p class="text-[0.6875rem] text-[#6E6960] mt-1">设置项保存在本地浏览器，用于演示展馆运行参数</p>
          </div>

          <div class="museum-card rounded-2xl border border-[#1C1B18]/10 p-6 space-y-5">
            <div>
              <label class="block text-[0.6875rem] font-semibold text-[#5A564E] mb-1.5">展馆名称</label>
              <input v-model="settingsForm.galleryTitle" class="w-full px-4 py-2.5 rounded-xl bg-[#F7F4EE] border border-[#1C1B18]/10 text-[1rem] sm:text-sm outline-none focus:border-[#C88A32]" />
            </div>
            <div>
              <label class="block text-[0.6875rem] font-semibold text-[#5A564E] mb-1.5">展馆公告</label>
              <textarea v-model="settingsForm.notice" rows="3" class="w-full px-4 py-2.5 rounded-xl bg-[#F7F4EE] border border-[#1C1B18]/10 text-[1rem] sm:text-sm leading-relaxed outline-none focus:border-[#C88A32] resize-none"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[0.6875rem] font-semibold text-[#5A564E] mb-1.5">默认渲染画质</label>
                <select v-model="settingsForm.defaultQuality" class="w-full px-4 py-2.5 rounded-xl bg-[#F7F4EE] border border-[#1C1B18]/10 text-[1rem] sm:text-sm outline-none focus:border-[#C88A32] cursor-pointer">
                  <option value="high">展览级 · IBL + GTAO</option>
                  <option value="lite">流畅模式 · 自适应</option>
                </select>
              </div>
              <div>
                <label class="block text-[0.6875rem] font-semibold text-[#5A564E] mb-1.5">访客基数</label>
                <input v-model.number="settingsForm.visitorCounter" type="number" class="w-full px-4 py-2.5 rounded-xl bg-[#F7F4EE] border border-[#1C1B18]/10 text-[1rem] sm:text-sm outline-none focus:border-[#C88A32]" />
              </div>
            </div>
            <div>
              <label class="block text-[0.6875rem] font-semibold text-[#5A564E] mb-1.5">联系邮箱</label>
              <input v-model="settingsForm.contactEmail" class="w-full px-4 py-2.5 rounded-xl bg-[#F7F4EE] border border-[#1C1B18]/10 text-[1rem] sm:text-sm outline-none focus:border-[#C88A32]" />
            </div>
            <div class="flex flex-wrap gap-6 pt-1">
              <label class="flex items-center gap-2.5 cursor-pointer select-none">
                <input v-model="settingsForm.autoTour" type="checkbox" class="w-4 h-4 accent-[#C88A32]" />
                <span class="text-xs text-[#1C1B18]">开启自动环视导览</span>
              </label>
              <label class="flex items-center gap-2.5 cursor-pointer select-none">
                <input v-model="settingsForm.allowMessages" type="checkbox" class="w-4 h-4 accent-[#C88A32]" />
                <span class="text-xs text-[#1C1B18]">开放访客留言</span>
              </label>
            </div>
            <div class="pt-3 border-t border-[#1C1B18]/8 flex items-center gap-3">
              <button @click="saveSettings" class="px-5 py-2.5 rounded-xl bg-[#1C1B18] text-[#F7F4EE] text-xs font-semibold hover:bg-[#C88A32] transition-colors cursor-pointer flex items-center gap-2">
                <Save :size="15" /> 保存设置
              </button>
              <span v-if="savedHint" class="text-[0.6875rem] text-[#2E5A44] font-medium">已保存</span>
            </div>
          </div>

          <div class="museum-panel rounded-2xl border border-[#B83828]/20 p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-[#1C1B18] font-editorial mb-1">恢复演示数据</h3>
              <p class="text-[0.6875rem] text-[#5A564E]">将地层、部件、视点、留言与设置全部还原为初始内容</p>
            </div>
            <button @click="showReset = true" class="px-4 py-2.5 min-h-[2.5rem] rounded-xl border border-[#B83828]/35 text-[#B83828] text-xs font-semibold hover:bg-[#B83828]/5 transition-colors cursor-pointer flex items-center gap-2">
              <RotateCcw :size="14" /> 重置全部
            </button>
          </div>

          <!-- 显存维护：共享纹理缓存可查询与释放 -->
          <div class="museum-card rounded-2xl border border-[#2E5A44]/25 p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-[#1C1B18] font-editorial mb-1">3D 共享纹理缓存</h3>
              <p class="text-[0.6875rem] leading-relaxed text-[#5A564E] max-w-lg">
                当前 {{ cacheStats.groups }} 组 / {{ cacheStats.textures }} 张纹理，估算占用 {{ cacheStats.mb }} MB 显存。
                离开 3D 展厅后可在此释放，下次进入展厅时程序化纹理会自动重建。
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <button @click="refreshCacheStats" class="px-3 py-2.5 min-h-[2.5rem] rounded-xl border border-[#1C1B18]/15 text-[#5A564E] text-[0.6875rem] font-semibold hover:border-[#C88A32] hover:text-[#8A6324] transition-colors cursor-pointer">
                刷新统计
              </button>
              <button @click="releaseCache" class="px-4 py-2.5 min-h-[2.5rem] rounded-xl bg-[#2E5A44] text-[#F7F4EE] text-xs font-semibold hover:bg-[#1C1B18] transition-colors cursor-pointer flex items-center gap-2">
                <RotateCcw :size="14" /> 释放缓存
              </button>
              <span v-if="cacheHint" class="text-[0.6875rem] text-[#2E5A44] font-medium">{{ cacheHint }}</span>
            </div>
          </div>

          <!-- 演示门禁说明 -->
          <div class="museum-card rounded-2xl border border-[#C88A32]/30 bg-[#C88A32]/8 p-5">
            <div class="font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324] font-semibold mb-3">DEMO ACCESS / 演示门禁说明</div>
            <p class="text-[0.6875rem] leading-[1.9] text-[#3A3630]">
              管理密码是前端演示常量，登录状态保存在浏览器 localStorage，没有服务端鉴权、没有数据库，也不做任何访问审计。本后台仅用于教学演示与竞赛答辩，请勿录入真实个人信息或用于生产环境。展陈数据的性质、口径与参照年份见「关于」页附录 A。
            </p>
          </div>
        </section>
      </div>
    </main>

    <!-- 编辑弹窗 -->
    <div v-if="editing" class="fixed inset-0 z-[60] bg-[#1C1B18]/25 backdrop-blur-sm flex items-center justify-center p-5" @click.self="editing = null">
      <div class="museum-card w-full max-w-xl rounded-3xl border border-[#1C1B18]/10 shadow-2xl p-7 max-h-[86vh] overflow-y-auto">
        <div class="flex items-start justify-between mb-6">
          <div>
            <div class="text-[0.625rem] font-mono uppercase tracking-[0.2em] text-[#8A6324] font-semibold mb-1">EDIT ENTRY</div>
            <h2 class="text-lg font-bold text-[#1C1B18] font-editorial">{{ editing.id ? '编辑' : '新增' }}{{ tableConfig[editing.type].title }}</h2>
          </div>
          <button @click="editing = null" class="p-2 rounded-lg hover:bg-[#EFECE6] cursor-pointer"><X :size="17" /></button>
        </div>
        <div class="space-y-4">
          <div v-for="f in tableConfig[editing.type].fields" :key="f.key">
            <label class="block text-[0.6875rem] font-semibold text-[#5A564E] mb-1.5">{{ f.label }}</label>
            <textarea
              v-if="f.multiline"
              v-model="editing.form[f.key]"
              rows="4"
              class="w-full px-4 py-2.5 rounded-xl bg-[#F7F4EE] border border-[#1C1B18]/10 text-[1rem] sm:text-sm leading-relaxed outline-none focus:border-[#C88A32] resize-none"
            ></textarea>
            <input
              v-else
              v-model="editing.form[f.key]"
              class="w-full px-4 py-2.5 rounded-xl bg-[#F7F4EE] border border-[#1C1B18]/10 text-[1rem] sm:text-sm outline-none focus:border-[#C88A32]"
            />
          </div>
        </div>
        <div class="mt-7 pt-5 border-t border-[#1C1B18]/8 flex justify-end gap-2">
          <button @click="editing = null" class="px-4 py-2.5 rounded-xl border border-[#1C1B18]/12 text-xs font-medium text-[#5A564E] hover:bg-[#EFECE6] cursor-pointer">取消</button>
          <button @click="saveEdit" class="px-5 py-2.5 rounded-xl bg-[#1C1B18] text-[#F7F4EE] text-xs font-semibold hover:bg-[#C88A32] transition-colors cursor-pointer flex items-center gap-2">
            <Save :size="14" /> 保存条目
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="pendingDelete" class="fixed inset-0 z-[60] bg-[#1C1B18]/25 backdrop-blur-sm flex items-center justify-center p-5" @click.self="pendingDelete = null">
      <div class="museum-card w-full max-w-sm rounded-2xl border border-[#1C1B18]/10 shadow-2xl p-6">
        <h3 class="text-sm font-bold text-[#1C1B18] font-editorial mb-2">确认删除这条内容？</h3>
        <p class="text-xs text-[#5A564E] mb-6 break-all">{{ pendingDelete.name }}</p>
        <div class="flex justify-end gap-2">
          <button @click="pendingDelete = null" class="px-4 py-2.5 min-h-[2.5rem] rounded-xl border border-[#1C1B18]/12 text-xs text-[#5A564E] cursor-pointer">取消</button>
          <button @click="confirmDelete" class="px-4 py-2.5 min-h-[2.5rem] rounded-xl bg-[#B83828] text-[#FFFDF9] text-xs font-semibold cursor-pointer">删除</button>
        </div>
      </div>
    </div>

    <!-- 重置确认 -->
    <div v-if="showReset" class="fixed inset-0 z-[60] bg-[#1C1B18]/25 backdrop-blur-sm flex items-center justify-center p-5" @click.self="showReset = false">
      <div class="museum-card w-full max-w-sm rounded-2xl border border-[#1C1B18]/10 shadow-2xl p-6">
        <h3 class="text-sm font-bold text-[#1C1B18] font-editorial mb-2">恢复全部演示数据？</h3>
        <p class="text-xs text-[#5A564E] mb-6">当前所有编辑内容会被覆盖，且无法撤销。</p>
        <div class="flex justify-end gap-2">
          <button @click="showReset = false" class="px-4 py-2.5 min-h-[2.5rem] rounded-xl border border-[#1C1B18]/12 text-xs text-[#5A564E] cursor-pointer">取消</button>
          <button @click="doReset" class="px-4 py-2.5 min-h-[2.5rem] rounded-xl bg-[#B83828] text-[#FFFDF9] text-xs font-semibold cursor-pointer">确认重置</button>
        </div>
      </div>
    </div>
  </div>
</template>
