<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Volume2, VolumeX, Menu, X, ArrowUpRight, ChevronDown } from 'lucide-vue-next'
import { useAppStore } from '../stores/appStore'

const route = useRoute()
const appStore = useAppStore()

const groups = [
  {
    id: 'hall', label: '3D 展厅', caption: 'IMMERSIVE GALLERIES',
    items: [
      { name: '黑土地质标本', path: '/strata-3d', note: '一米剖面的微观世界', tag: '01' },
      { name: '北斗智慧农机', path: '/machinery-3d', note: '工业解构与爆炸图', tag: '02' },
      { name: '生态微缩沙盘', path: '/sandbox-3d', note: '松辽平原数字孪生', tag: '03' }
    ]
  },
  {
    id: 'topic', label: '专题展', caption: 'CURATED CHAPTERS',
    items: [
      { name: '数智驾驶舱', path: '/dashboard', note: '黑土生境实时遥测', tag: '04' },
      { name: '一粒米的旅程', path: '/journey', note: '从黑土到餐桌', tag: '05' },
      { name: '查干湖冬捕', path: '/chagan-lake', note: '冰湖渔猎非遗', tag: '06' },
      { name: '二十四节气', path: '/solar-terms', note: '吉林农耕物候谱', tag: '07' },
      { name: '吉林风物集市', path: '/products', note: '地理标志助农', tag: '08' },
      { name: '互动科普实验室', path: '/science', note: '四个可操作的 3D 原理演示', tag: '09' }
    ]
  },
  {
    id: 'aid', label: '助农项目', caption: 'RURAL REVITALIZATION',
    items: [
      { name: '助农项目库', path: '/aid-projects', note: '六类带农路径与项目档案', tag: 'A1' },
      { name: '认养一亩田', path: '/adopt-a-field', note: '走一遍从春耕到直邮', tag: 'A2' },
      { name: '一块地五笔收入', path: '/farm-income', note: '收益与风险写在同一页', tag: 'A3' },
      { name: '最后一公里实验室', path: '/last-mile', note: '三个痛点交互实验', tag: 'A4' }
    ]
  },
  {
    id: 'about', label: '关于', caption: 'COLOPHON',
    items: [
      { name: '展览地图', path: '/exhibit-map', note: '一条动线看全展结构', tag: '00' },
      { name: '长春智库与答辩说明', path: '/about', note: '选题 / 技术 / 科教支撑', tag: '10' },
      { name: '展馆管理后台', path: '/admin', note: '策展内容与访客管理', tag: '11' }
    ]
  }
]

const activeGroup = ref('')
const isMenuOpen = ref(false)
const isScrolled = ref(false)
const isAudioPlaying = computed(() => appStore.isAudioPlaying)

// 键盘 / 读屏：Esc 关闭所有浮层，焦点离开分组后收起下拉。
// 之前只有 @mouseleave，键盘用户打开后既关不掉、读屏也读不到展开状态。
const closeFloating = () => {
  activeGroup.value = ''
  isMenuOpen.value = false
}
const onGroupFocusOut = (e, id) => {
  if (activeGroup.value === id && !e.currentTarget.contains(e.relatedTarget)) activeGroup.value = ''
}

const onScroll = () => { isScrolled.value = window.scrollY > 12 }
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

watch(() => route.fullPath, () => {
  isMenuOpen.value = false
  activeGroup.value = ''
})

const playNarration = () => {
  appStore.toggleAudio()
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  if (appStore.isAudioPlaying) {
    const utter = new SpeechSynthesisUtterance(
      '欢迎来到《一厘米，四十公里》，吉韵新程黑土数字展馆。这里是世界三大黑土带之一，中国现代农业的坚实大粮仓。'
    )
    utter.lang = 'zh-CN'
    utter.rate = 0.95
    utter.onend = () => { appStore.isAudioPlaying = false }
    window.speechSynthesis.speak(utter)
  }
}
</script>

<template>
  <header
    class="fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[87.5rem] z-50 transition-all duration-500"
    @mouseleave="activeGroup = ''"
    @keydown.esc="closeFloating"
  >
    <div
      class="pill-nav h-[4.125rem] px-4 sm:px-6 flex items-center justify-between gap-4 transition-[background,box-shadow] duration-500"
      :class="isScrolled ? 'pill-nav--solid' : ''"
    >
      <!-- 品牌 -->
      <RouterLink to="/" class="flex items-center gap-3 shrink-0 group">
        <div class="w-10 h-10 rounded-xl bg-[#1C1B18] text-[#F0C275] flex items-center justify-center font-editorial font-bold text-lg shadow-[inset_0_0_0_1px_rgba(240,194,117,0.35)] transition-transform duration-500 group-hover:rotate-6">
          吉
        </div>
        <div class="hidden sm:block">
          <div class="font-editorial font-bold text-[0.9375rem] leading-tight tracking-wide text-[#1C1B18]">一厘米，四十公里</div>
          <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#6E6960] mt-0.5">JILIN DIGITAL RURAL MUSEUM</div>
        </div>
      </RouterLink>

      <!-- 分组导航：disclosure 模式，鼠标 / 键盘 / 读屏三条路径都能开合 -->
      <nav class="hidden lg:flex items-center gap-1 h-full">
        <RouterLink
          to="/"
          class="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#16261F] text-[#F0C275] text-xs font-bold mr-1 hover:bg-[#1F4E3D] transition-colors"
        >← 返回 App</RouterLink>
        <RouterLink
          to="/museum"
          class="nav-link inline-flex items-center px-4 py-2 min-h-[2.5rem] text-xs font-semibold"
          :class="route.path === '/museum' ? 'nav-link--active' : 'text-[#5A564E] hover:text-[#1C1B18]'"
        >序厅</RouterLink>
        <div
          v-for="g in groups"
          :key="g.id"
          class="relative h-full flex items-center"
          @mouseenter="activeGroup = g.id"
          @focusout="onGroupFocusOut($event, g.id)"
        >
          <button
            class="nav-link flex items-center gap-1.5 px-4 py-2 min-h-[2.5rem] text-xs font-semibold cursor-pointer"
            :class="activeGroup === g.id || g.items.some(i => i.path === route.path)
              ? 'nav-link--active' : 'text-[#5A564E] hover:text-[#1C1B18]'"
            :aria-expanded="activeGroup === g.id"
            aria-haspopup="true"
            :aria-controls="'nav-panel-' + g.id"
            @click="activeGroup = activeGroup === g.id ? '' : g.id"
          >
            {{ g.label }}
            <ChevronDown :size="12" class="transition-transform duration-300" :class="activeGroup === g.id ? 'rotate-180' : ''" />
          </button>

          <!-- 下拉面板 -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            leave-active-class="transition duration-200 ease-in"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <!-- 用 v-show 保持 DOM 常驻，aria-controls 才不会指向不存在的 id；
                 display:none 的面板不进 Tab 序列，原有 Transition 动画照常生效。 -->
            <div
              v-show="activeGroup === g.id"
              :id="'nav-panel-' + g.id"
              class="absolute top-[3.875rem] left-1/2 -translate-x-1/2 w-[22.5rem] museum-card rounded-2xl border border-[#1C1B18]/10 p-3 shadow-2xl"
            >
              <div class="px-3 py-2 font-mono text-[0.625rem] tracking-[0.2em] text-[#8A6324]">{{ g.caption }}</div>
              <RouterLink
                v-for="item in g.items"
                :key="item.path"
                :to="item.path"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl group/item transition-colors duration-200 hover:bg-[#EFECE6]"
              >
                <span class="font-mono text-[0.625rem] text-[#6E6960] w-6">{{ item.tag }}</span>
                <span class="flex-1 min-w-0">
                  <span class="block text-xs font-semibold text-[#1C1B18] group-hover/item:text-[#8A6324] transition-colors">{{ item.name }}</span>
                  <span class="block text-[0.625rem] text-[#6E6960] mt-0.5 truncate">{{ item.note }}</span>
                </span>
                <ArrowUpRight :size="13" class="text-[#C88A32] opacity-0 group-hover/item:opacity-100 transition-opacity" />
              </RouterLink>
            </div>
          </Transition>
        </div>
      </nav>

      <!-- 右侧动作 -->
      <div class="flex items-center gap-2 sm:gap-3">
        <button
          @click="playNarration"
          class="hidden sm:flex items-center gap-2 px-3 py-2 min-h-[2.5rem] rounded-full border text-[0.6875rem] font-semibold transition-all duration-300 cursor-pointer"
          :class="isAudioPlaying
            ? 'border-[#C88A32] bg-[#C88A32]/12 text-[#8A6324]'
            : 'border-[#1C1B18]/14 text-[#5A564E] hover:border-[#1C1B18]/35 hover:text-[#1C1B18]'"
        >
          <VolumeX v-if="isAudioPlaying" :size="14" />
          <Volume2 v-else :size="14" />
          <span>{{ isAudioPlaying ? '解说中' : '语音导览' }}</span>
        </button>
        <RouterLink
          to="/strata-3d"
          class="hidden md:inline-flex items-center gap-2 px-4 py-2.5 bg-[#1C1B18] text-[#F7F4EE] text-[0.6875rem] font-bold rounded-full hover:bg-[#C88A32] hover:text-[#1C1B18] transition-colors duration-300 shadow-[0_10px_24px_-12px_rgba(28,27,24,0.6)]"
        >
          开始探索 <ArrowUpRight :size="13" />
        </RouterLink>
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-[#1C1B18]/14 text-[#1C1B18] cursor-pointer"
          :aria-label="isMenuOpen ? '关闭菜单' : '打开菜单'"
          :aria-expanded="isMenuOpen"
        >
          <X v-if="isMenuOpen" :size="18" />
          <Menu v-else :size="18" />
        </button>
      </div>
    </div>
  </header>

  <!-- 移动端全屏抽屉 -->
  <Transition
    enter-active-class="transition duration-400 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-250 ease-in"
    leave-to-class="opacity-0"
  >
    <div v-if="isMenuOpen" class="fixed inset-0 z-40 lg:hidden bg-[#F7F4EE] pt-[5.75rem] overflow-y-auto">
      <div class="max-w-[90rem] mx-auto px-6 py-10">
        <div class="eyebrow mb-8">EXHIBITION MAP / 展览地图</div>
        <RouterLink
          to="/"
          class="flex items-baseline gap-4 py-4 border-b border-[#1C1B18]/10"
        >
          <span class="font-mono text-[0.6875rem] text-[#6E6960]">00</span>
          <span class="font-editorial text-2xl font-bold text-[#1C1B18]">序厅 · 展览总览</span>
        </RouterLink>
        <template v-for="g in groups" :key="g.id">
          <div class="eyebrow mt-9 mb-3">{{ g.caption }}</div>
          <RouterLink
            v-for="item in g.items"
            :key="item.path"
            :to="item.path"
            class="flex items-baseline gap-4 py-3.5 border-b border-[#1C1B18]/10 group"
          >
            <span class="font-mono text-[0.6875rem] text-[#6E6960]">{{ item.tag }}</span>
            <span class="flex-1">
              <span class="block text-base font-semibold text-[#1C1B18] group-hover:text-[#C88A32] transition-colors">{{ item.name }}</span>
              <span class="block text-[0.6875rem] text-[#6E6960] mt-0.5">{{ item.note }}</span>
            </span>
            <ArrowUpRight :size="15" class="text-[#C88A32]" />
          </RouterLink>
        </template>
        <button
          @click="playNarration"
          class="w-full mt-9 py-3.5 rounded-xl border border-[#1C1B18]/18 text-xs font-semibold text-[#1C1B18] cursor-pointer"
        >{{ isAudioPlaying ? '停止语音导览' : '开启语音导览' }}</button>
      </div>
    </div>
  </Transition>
</template>
