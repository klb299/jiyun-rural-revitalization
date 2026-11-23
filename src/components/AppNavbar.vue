<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Volume2, VolumeX, Menu, X, ArrowUpRight, ChevronDown, Smartphone, Columns2, Monitor } from 'lucide-vue-next'
import { useAppStore } from '../stores/appStore'

const route = useRoute()
const appStore = useAppStore()

const groups = [
  {
    id: 'hall', label: '3D 展厅', caption: 'THREE.JS 沉浸式数字展厅',
    items: [
      { name: '黑土地质标本馆', path: '/strata-3d', note: '一米剖面分层拆解与梨树模式保育', tag: '01' },
      { name: '北斗智慧农机馆', path: '/machinery-3d', note: '260 马力长春智造无人拖拉机爆炸解构', tag: '02' },
      { name: '松辽生态微缩沙盘', path: '/sandbox-3d', note: '松辽平原六视点飞行数字孪生', tag: '03' }
    ]
  },
  {
    id: 'topic', label: '专题科普', caption: '吉林黑土与农耕文化专题',
    items: [
      { name: '互动科普实验室', path: '/science', note: '4 项可操控 3D 农艺原理实验', tag: '04' },
      { name: '一粒米的旅程', path: '/journey', note: '180 天五幕物候剧情与一袋一码溯源', tag: '05' },
      { name: '查干湖冬捕非遗', path: '/chagan-lake', note: '冰湖渔猎四重仪轨与生态智慧', tag: '06' },
      { name: '二十四节气农时谱', path: '/solar-terms', note: '吉林四季农耕气象与黑土保育日历', tag: '07' },
      { name: '吉林风物特产集市', path: '/products', note: '地理标志农产与原产地直采目录', tag: '08' },
      { name: '黑土数智驾驶舱', path: '/dashboard', note: '墒情、有机质与粮食保供多维看板', tag: '09' }
    ]
  },
  {
    id: 'aid', label: '助农机制', caption: '乡村振兴带农实践研究',
    items: [
      { name: '助农项目档案库', path: '/aid-projects', note: '六类带农路径与合作社真实案例', tag: 'A1' },
      { name: '认养一亩田演示', path: '/adopt-a-field', note: '春耕夏管秋收直邮全流程体验', tag: 'A2' },
      { name: '一块地五笔收入', path: '/farm-income', note: '托管、分红与品牌溢价机制拆解', tag: 'A3' },
      { name: '最后一公里实验室', path: '/last-mile', note: '三大振兴痛点交互推演沙盘', tag: 'A4' }
    ]
  },
  {
    id: 'archive', label: '展馆档案', caption: '导览索引与答辩白皮书',
    items: [
      { name: '全展策展地图', path: '/exhibit-map', note: '13 个单元按五大振兴与尺度索引', tag: '00' },
      { name: '长春智库与白皮书', path: '/about', note: '选题背景、科教支撑与技术口径', tag: '10' },
      { name: '后台管理系统', path: '/admin', note: '进入吉韵禾野数智运营中枢', tag: '11' }
    ]
  }
]

const openPopoverId = ref('')
const hoverPreviewId = ref('')
const isMobileOpen = ref(false)
const isScrolled = ref(false)
const mobileOpenGroups = ref({ hall: true, topic: true, aid: false, archive: false })
const popoverRefs = ref({})
const triggerRefs = ref({})
const supportsNativePopover = ref(true)
const isAudioPlaying = computed(() => appStore.isAudioPlaying)

const setPopoverRef = (id, el) => { if (el) popoverRefs.value[id] = el }
const setTriggerRef = (id, el) => { if (el) triggerRefs.value[id] = el }

const isGroupActive = (g) => g.items.some((i) => i.path === route.path)

// 坐标校准兜底：当浏览器无 CSS Anchor Positioning 或原生锚点偏移未生效时，精确贴齐触发按钮下方
const positionPopoverFallback = (id) => {
  const trigger = triggerRefs.value[id]
  const pop = popoverRefs.value[id]
  if (!trigger || !pop) return
  const hasAnchor = typeof CSS !== 'undefined' && CSS.supports?.('position-area', 'block-end')
  const pr = pop.getBoundingClientRect()
  if (hasAnchor && pr.top > 30 && pr.left > 0 && pr.right <= window.innerWidth) return
  const tr = trigger.getBoundingClientRect()
  let top = tr.bottom + 8
  if (top + pr.height > window.innerHeight - 12 && tr.top - pr.height - 8 > 8) {
    top = tr.top - pr.height - 8
  }
  const left = Math.max(12, Math.min(tr.left, window.innerWidth - pr.width - 12))
  pop.style.top = `${Math.round(top)}px`
  pop.style.left = `${Math.round(left)}px`
}

const onPopoverToggle = (id, event) => {
  const isOpen = event.newState === 'open'
  if (isOpen) {
    openPopoverId.value = id
    requestAnimationFrame(() => positionPopoverFallback(id))
  } else {
    if (openPopoverId.value === id) openPopoverId.value = ''
    if (hoverPreviewId.value === id) hoverPreviewId.value = ''
  }
}

const onItemPointerEnter = (id, event) => {
  if (event.pointerType === 'touch' || !window.matchMedia?.('(hover: hover)').matches) return
  if (!supportsNativePopover.value) {
    openPopoverId.value = id
    hoverPreviewId.value = id
    return
  }
  const pop = popoverRefs.value[id]
  const trigger = triggerRefs.value[id]
  if (!pop || openPopoverId.value === id) return
  try {
    hoverPreviewId.value = id
    pop.showPopover({ source: trigger })
  } catch {
    try { pop.showPopover() } catch { /* ignore */ }
  }
}

const onItemPointerLeave = (id) => {
  if (hoverPreviewId.value !== id) return
  hoverPreviewId.value = ''
  if (!supportsNativePopover.value) {
    if (openPopoverId.value === id) openPopoverId.value = ''
    return
  }
  const pop = popoverRefs.value[id]
  try { pop?.hidePopover() } catch { /* ignore */ }
}

// 若用户点击正在悬停预览的触发器，则将其固定打开而非立刻关闭
const onTriggerClick = (id, event) => {
  if (!supportsNativePopover.value) {
    event.preventDefault()
    openPopoverId.value = openPopoverId.value === id ? '' : id
    hoverPreviewId.value = ''
    return
  }
  if (hoverPreviewId.value === id && openPopoverId.value === id) {
    event.preventDefault()
    hoverPreviewId.value = ''
  }
}

const onGroupFocusOut = (id, event) => {
  if (openPopoverId.value !== id) return
  if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
    hoverPreviewId.value = ''
    if (!supportsNativePopover.value) {
      openPopoverId.value = ''
      return
    }
    try { popoverRefs.value[id]?.hidePopover() } catch { /* ignore */ }
  }
}

const closeAllPopovers = () => {
  openPopoverId.value = ''
  hoverPreviewId.value = ''
  isMobileOpen.value = false
  Object.values(popoverRefs.value).forEach((pop) => {
    try { pop?.hidePopover?.() } catch { /* ignore */ }
  })
}

const onScroll = () => { isScrolled.value = window.scrollY > 14 }

onMounted(() => {
  supportsNativePopover.value = typeof HTMLElement !== 'undefined' && Object.hasOwn(HTMLElement.prototype, 'popover')
  // 使用 setAttribute 设置 popover="auto"，避免在缺少原生支持的环境出现 IDL 属性竞态
  if (supportsNativePopover.value) {
    Object.values(popoverRefs.value).forEach((pop) => {
      if (pop && !pop.hasAttribute('popover')) pop.setAttribute('popover', 'auto')
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

watch(() => route.fullPath, () => {
  closeAllPopovers()
})

const playNarration = () => {
  appStore.toggleAudio()
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  if (appStore.isAudioPlaying) {
    const utter = new SpeechSynthesisUtterance(
      '欢迎来到吉韵禾野乡村振兴数字展馆。这里是世界三大黑土带之一，松辽平原现代农业的数字展陈空间。'
    )
    utter.lang = 'zh-CN'
    utter.rate = 0.98
    utter.onend = () => { appStore.isAudioPlaying = false }
    window.speechSynthesis.speak(utter)
  }
}
</script>

<template>
  <header class="portal-header" :class="{ 'is-scrolled': isScrolled }">
    <div class="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-10 h-[4.25rem] flex items-center justify-between gap-4">
      <!-- 品牌标识：与吉韵禾野全平台视觉统一 -->
      <RouterLink to="/museum" class="flex items-center gap-3 shrink-0 group">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B4A38] to-[#0E261D] text-[#E5C175] flex items-center justify-center font-editorial font-bold text-base shadow-[0_6px_16px_-6px_rgba(14,38,29,0.55),inset_0_0_0_1px_rgba(229,193,117,0.38)] transition-transform duration-300 group-hover:scale-105">
          禾
        </div>
        <div class="hidden sm:block leading-tight">
          <div class="flex items-center gap-2">
            <span class="font-editorial font-bold text-[0.95rem] tracking-wide text-[#10241C]">吉韵禾野</span>
            <span class="px-1.5 py-0.5 rounded-md bg-[#1F5440]/10 text-[#1A4333] text-[0.625rem] font-semibold">数字展馆</span>
          </div>
          <div class="font-mono text-[0.5625rem] tracking-[0.16em] text-[#566E64] mt-0.5">JIYUN HEYE · DIGITAL RURAL ATLAS</div>
        </div>
      </RouterLink>

      <!-- 单一语义化主导航（宽屏内联 + 原生 Popover 子菜单） -->
      <nav aria-label="展馆主导航" class="hidden lg:flex items-center gap-1">
        <ul class="flex items-center gap-1 list-none m-0 p-0">
          <li>
            <RouterLink
              to="/museum"
              class="portal-nav-link"
              :aria-current="route.path === '/museum' ? 'page' : undefined"
            >
              展馆序厅
            </RouterLink>
          </li>

          <li
            v-for="g in groups"
            :key="g.id"
            class="relative"
            @pointerenter="onItemPointerEnter(g.id, $event)"
            @pointerleave="onItemPointerLeave(g.id)"
            @focusout="onGroupFocusOut(g.id, $event)"
          >
            <button
              :ref="(el) => setTriggerRef(g.id, el)"
              type="button"
              class="portal-nav-link cursor-pointer"
              :class="{ 'is-section-active': isGroupActive(g) }"
              :style="{ anchorName: `--nav-anchor-${g.id}` }"
              :popovertarget="'portal-pop-' + g.id"
              :aria-controls="'portal-pop-' + g.id"
              :aria-expanded="openPopoverId === g.id ? 'true' : 'false'"
              @click="onTriggerClick(g.id, $event)"
            >
              <span>{{ g.label }}</span>
              <ChevronDown
                :size="13"
                aria-hidden="true"
                class="transition-transform duration-250"
                :class="openPopoverId === g.id ? 'rotate-180' : ''"
              />
            </button>

            <!-- 紧跟触发器后的原生 Popover 子菜单（兼容不支持原生 popover 的回退显隐） -->
            <div
              :id="'portal-pop-' + g.id"
              :ref="(el) => setPopoverRef(g.id, el)"
              popover="auto"
              class="portal-popover"
              :style="supportsNativePopover
                ? { positionAnchor: `--nav-anchor-${g.id}` }
                : { display: openPopoverId === g.id ? 'block' : 'none', top: '4.5rem' }"
              @toggle="onPopoverToggle(g.id, $event)"
            >
              <div class="px-3 pt-1.5 pb-2 border-b border-[#0E261D]/8 mb-1.5 flex items-center justify-between">
                <span class="text-[0.6875rem] font-bold tracking-wider text-[#1A4333]">{{ g.caption }}</span>
                <span class="font-mono text-[0.6rem] text-[#7F5B17]">{{ g.items.length }} 单元</span>
              </div>
              <ul class="list-none m-0 p-0 space-y-0.5">
                <li v-for="item in g.items" :key="item.path">
                  <RouterLink
                    :to="item.path"
                    :aria-current="route.path === item.path ? 'page' : undefined"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl group/item transition-colors duration-200 hover:bg-[#EAF1EC]"
                    :class="route.path === item.path ? 'bg-[#1F5440]/10 text-[#0E261D]' : ''"
                    @click="closeAllPopovers"
                  >
                    <span class="font-mono text-[0.625rem] font-semibold px-1.5 py-0.5 rounded bg-[#0E261D]/6 text-[#566E64] group-hover/item:bg-[#1F5440] group-hover/item:text-[#E5C175] transition-colors">
                      {{ item.tag }}
                    </span>
                    <span class="flex-1 min-w-0">
                      <span class="block text-[0.8125rem] font-semibold text-[#10241C] group-hover/item:text-[#1A4333] transition-colors">
                        {{ item.name }}
                      </span>
                      <span class="block text-[0.6875rem] text-[#566E64] mt-0.5 truncate">{{ item.note }}</span>
                    </span>
                    <ArrowUpRight :size="14" aria-hidden="true" class="text-[#C89B45] opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                  </RouterLink>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>

      <!-- 右侧：语音导览 + 平台多端一键切换 -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          @click="playNarration"
          class="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors duration-200 cursor-pointer"
          :class="isAudioPlaying
            ? 'border-[#C89B45] bg-[#C89B45]/14 text-[#7F5B17]'
            : 'border-[#0E261D]/14 text-[#3E554B] hover:border-[#1F5440]/40 hover:text-[#10241C] bg-white/60'"
        >
          <VolumeX v-if="isAudioPlaying" :size="14" aria-hidden="true" />
          <Volume2 v-else :size="14" aria-hidden="true" />
          <span>{{ isAudioPlaying ? '停止导览' : '语音导览' }}</span>
        </button>

        <div class="hidden md:flex items-center p-1 rounded-full bg-[#E8F0EC] border border-[#0E261D]/10 shrink-0">
          <RouterLink
            to="/"
            class="inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-semibold text-[#10241C] hover:bg-white transition-colors whitespace-nowrap"
          >
            <Smartphone :size="13" aria-hidden="true" class="text-[#1F5440]" />
            <span>移动端 App</span>
          </RouterLink>
          <RouterLink
            to="/split"
            class="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#3E554B] hover:bg-white hover:text-[#10241C] transition-colors whitespace-nowrap"
          >
            <Columns2 :size="13" aria-hidden="true" class="text-[#1F5440]" />
            <span>双端同屏</span>
          </RouterLink>
          <RouterLink
            to="/bigscreen"
            class="inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full bg-[#0E261D] text-[#E5C175] text-xs font-bold hover:bg-[#1A4333] transition-colors shadow-sm whitespace-nowrap"
          >
            <Monitor :size="13" aria-hidden="true" />
            <span>数智大屏</span>
          </RouterLink>
        </div>

        <button
          type="button"
          @click="isMobileOpen = !isMobileOpen"
          class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-[#0E261D]/14 bg-white/80 text-[#10241C] cursor-pointer"
          :aria-label="isMobileOpen ? '关闭菜单' : '打开菜单'"
          :aria-expanded="isMobileOpen ? 'true' : 'false'"
          aria-controls="portal-mobile-drawer"
        >
          <X v-if="isMobileOpen" :size="18" aria-hidden="true" />
          <Menu v-else :size="18" aria-hidden="true" />
        </button>
      </div>
    </div>
  </header>

  <!-- 移动端抽屉导航 -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-200 ease-in"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isMobileOpen"
      id="portal-mobile-drawer"
      class="fixed inset-0 z-40 lg:hidden bg-[#F3F6F3] pt-[4.75rem] overflow-y-auto"
    >
      <div class="max-w-2xl mx-auto px-5 py-6">
        <div class="grid grid-cols-3 gap-2 mb-6">
          <RouterLink to="/" class="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#0E261D] text-[#E5C175] text-xs font-bold">
            <Smartphone :size="14" aria-hidden="true" /> 移动端 App
          </RouterLink>
          <RouterLink to="/split" class="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-[#0E261D]/12 text-[#10241C] text-xs font-semibold">
            <Columns2 :size="14" aria-hidden="true" /> 双端同屏
          </RouterLink>
          <RouterLink to="/bigscreen" class="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-[#0E261D]/12 text-[#10241C] text-xs font-semibold">
            <Monitor :size="14" aria-hidden="true" /> 数智大屏
          </RouterLink>
        </div>

        <RouterLink
          to="/museum"
          :aria-current="route.path === '/museum' ? 'page' : undefined"
          class="flex items-center justify-between py-3.5 px-4 rounded-xl bg-white border border-[#0E261D]/10 font-editorial text-lg font-bold text-[#10241C] mb-4"
        >
          <span>展馆序厅 · 总览</span>
          <ArrowUpRight :size="16" aria-hidden="true" class="text-[#C89B45]" />
        </RouterLink>

        <div v-for="g in groups" :key="g.id" class="mb-3 rounded-2xl bg-white border border-[#0E261D]/8 overflow-hidden">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer"
            :aria-expanded="mobileOpenGroups[g.id] ? 'true' : 'false'"
            @click="mobileOpenGroups[g.id] = !mobileOpenGroups[g.id]"
          >
            <span class="text-sm font-bold text-[#10241C]">{{ g.label }} <span class="text-xs font-normal text-[#566E64] ml-1.5">{{ g.caption }}</span></span>
            <ChevronDown :size="15" aria-hidden="true" class="text-[#566E64] transition-transform" :class="mobileOpenGroups[g.id] ? 'rotate-180' : ''" />
          </button>
          <ul v-show="mobileOpenGroups[g.id]" class="list-none m-0 px-2 pb-2 space-y-1 border-t border-[#0E261D]/6">
            <li v-for="item in g.items" :key="item.path">
              <RouterLink
                :to="item.path"
                :aria-current="route.path === item.path ? 'page' : undefined"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EAF1EC]"
              >
                <span class="font-mono text-[0.65rem] text-[#566E64] w-6">{{ item.tag }}</span>
                <span class="flex-1 min-w-0">
                  <span class="block text-sm font-semibold text-[#10241C]">{{ item.name }}</span>
                  <span class="block text-xs text-[#566E64] truncate">{{ item.note }}</span>
                </span>
                <ArrowUpRight :size="14" aria-hidden="true" class="text-[#C89B45]" />
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Transition>
</template>
