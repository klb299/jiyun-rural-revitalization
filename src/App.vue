<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUp } from 'lucide-vue-next'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import CustomCursor from './components/CustomCursor.vue'
import TrailNav from './components/TrailNav.vue'
import { useAppStore } from './stores/appStore'
import { unitOf } from './data/exhibitTrail'

gsap.registerPlugin(ScrollTrigger)

const route = useRoute()
const appStore = useAppStore()

// 13 个展陈单元页才出现动线续接带；序厅、地图、白皮书、后台与 404 不显示。
const isTrailPage = computed(() => !!unitOf(route.path))

// 沿动线往回走时，新页从左侧轻微滑入，与「向前推进」的默认转场区分开。
const enterFromClass = computed(() =>
  appStore.trailDirection === 'back' ? 'route-enter-from route-enter-from--back' : 'route-enter-from'
)
const leaveToClass = computed(() =>
  appStore.trailDirection === 'back' ? 'route-leave-to route-leave-to--back' : 'route-leave-to'
)

// 逐字节奏按页面气质分档，避免所有页面共用一套入场（见 VISUAL_HANDOFF P1-1）。
// fast：3D 三页把注意力让给场景；reverse：助农三页数据先到、标题后到；
// quiet / calm：痛点实验室与白皮书首屏不做逐字，整块呈现。
const motionMode = computed(() => {
  const name = route.name
  if (['SoilStrata3D', 'Machinery3D', 'Sandbox3D'].includes(name)) return 'fast'
  if (['AidProjects', 'AdoptField', 'FarmIncome'].includes(name)) return 'reverse'
  if (name === 'LastMile') return 'quiet'
  if (name === 'About') return 'calm'
  return 'default'
})

const scrollPct = ref(0)
const showTop = ref(false)
let motionContext = null
let motionTimer = 0

// 滚动事件可能高达每秒上百次，用 rAF 合并成一帧一次，
// 并缓存文档高度，避免每次都读取 scrollHeight 触发强制布局。
let scrollRaf = 0
let docHeight = 0
let lastMeasure = 0

const onScroll = () => {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0
    const now = performance.now()
    if (!docHeight || now - lastMeasure > 500) {
      docHeight = document.documentElement.scrollHeight - window.innerHeight
      lastMeasure = now
    }
    const y = window.scrollY || 0
    scrollPct.value = docHeight > 0 ? Math.min(1, y / docHeight) : 0
    showTop.value = y > 720
  })
}

const onResize = () => {
  docHeight = 0
  onScroll()
}

const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

// 转场结束再清空方向，之后的普通跳转回到默认过渡
const onRouteEntered = () => {
  scheduleMotion(60)
  appStore.clearTrail()
}

/** 滚动编排：视差、遮罩揭示、错峰入场、层叠卡深度 */
function initMotion() {
  motionContext?.revert()
  ScrollTrigger.getAll().forEach((t) => t.kill())
  motionContext = null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const root = document.querySelector('main')
  if (!root) return

  motionContext = gsap.context(() => {
    root.querySelectorAll('[data-parallax]').forEach((el) => {
      const amount = Number(el.dataset.parallax) || -12
      gsap.to(el, {
        yPercent: amount, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
      })
    })

    // 错峰入场只做位移，不碰 opacity：任何滚动路径下内容都保持可见
    root.querySelectorAll('[data-stagger]').forEach((el) => {
      gsap.from(el.children, {
        y: 30, duration: 0.9,
        stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      })
    })

    root.querySelectorAll('[data-stack] > *').forEach((el, i) => {
      gsap.to(el, {
        scale: 1 - Math.min(i, 3) * 0.018,
        y: -i * 5,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top 32%', end: 'bottom top', scrub: 1 }
      })
    })
  }, root)

  ScrollTrigger.refresh()
}

const scheduleMotion = (delay = 380) => {
  clearTimeout(motionTimer)
  motionTimer = window.setTimeout(initMotion, delay)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  onScroll()
  scheduleMotion(300)
})

watch(() => route.fullPath, () => {
  docHeight = 0 // 新页面高度不同，下一帧重新测量
  scheduleMotion(420)
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  clearTimeout(motionTimer)
  motionContext?.revert()
  ScrollTrigger.getAll().forEach((t) => t.kill())
})
</script>

<template>
  <div class="min-h-screen bg-[#F7F4EE] text-[#1C1B18] flex flex-col relative paper-grain">
    <CustomCursor />
    <a class="skip-link" href="#main-content">跳到展陈主内容</a>

    <div class="fixed top-0 left-0 h-[2px] bg-[#C88A32] z-[70] pointer-events-none"
      :style="{ width: `${scrollPct * 100}%` }"></div>
    <div :key="route.fullPath" class="route-progress fixed top-0 left-0 h-[2px] w-full bg-[#C88A32]/45 z-[69] pointer-events-none"></div>

    <AppNavbar />

    <main id="main-content" class="flex-grow" :data-motion="motionMode" :data-trail="appStore.trailDirection || ''" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="route-enter-active"
          :enter-from-class="enterFromClass"
          leave-active-class="route-leave-active"
          :leave-to-class="leaveToClass"
          mode="out-in"
          @after-enter="onRouteEntered"
        >
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>

      <!-- 全局动线续接：一处覆盖 13 个展陈单元页，与页面各自完成同节奏转场 -->
      <Transition name="trail" mode="out-in">
        <TrailNav v-if="isTrailPage" :key="route.fullPath" />
      </Transition>
    </main>

    <!-- 后台是独立控制台：AdminView 用低于悬浮导航的层级铺满视口，
         若同时渲染全站页脚，marquee 与展陈区块会从登录卡下方露出来。 -->
    <AppFooter v-if="route.name !== 'Admin'" />

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-3"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-y-3"
    >
      <button v-if="showTop" @click="toTop"
        class="fixed bottom-6 right-5 sm:right-8 z-40 w-11 h-11 rounded-full bg-[#1C1B18] text-[#F7F4EE] flex items-center justify-center shadow-lg hover:bg-[#C88A32] hover:text-[#1C1B18] transition-colors duration-300 cursor-pointer"
        aria-label="回到顶部">
        <ArrowUp :size="16" />
      </button>
    </Transition>
  </div>
</template>
