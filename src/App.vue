<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUp } from 'lucide-vue-next'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import TrailNav from './components/TrailNav.vue'
import { useAppStore } from './stores/appStore'
import { unitOf } from './data/exhibitTrail'

gsap.registerPlugin(ScrollTrigger)

const route = useRoute()
const appStore = useAppStore()

// 独立双端壳页面（App 体验舱、全屏 App、双端同屏、独立后台）不使用展馆悬浮导航与页脚
const isStandaloneShell = computed(() => Boolean(route.meta?.standaloneShell))

// 13 个展陈单元页才出现动线续接带；序厅、地图、白皮书、后台与 404 不显示。
const isTrailPage = computed(() => !isStandaloneShell.value && !!unitOf(route.path))

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
let motionMedia = null
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

// 旧页面退场完毕、新页面挂载前立刻回到顶部（使用 instant 绕开 html 的 smooth 滚动，
// 防止 out-in 过渡期间滚动动画被中断导致停留在半腰）
const onRouteBeforeEnter = () => {
  if (route.hash) return
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  scrollPct.value = 0
  showTop.value = false
}

// 转场结束再清空方向，之后的普通跳转回到默认过渡
const onRouteEntered = () => {
  if (!route.hash && window.scrollY > 0) {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }
  scheduleMotion(60)
  appStore.clearTrail()
}

/** 滚动编排：视差、遮罩揭示、错峰入场、层叠卡深度 */
function initMotion() {
  motionContext?.revert()
  motionMedia?.revert()
  ScrollTrigger.getAll().forEach((t) => t.kill())
  motionContext = null
  motionMedia = null
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

    // 层叠卡的景深改为静态：原先每层一个 scrub 动画，滚动时逐帧改 scale，
    // 是首页掉帧的主要来源之一。静态数值在视觉上几乎看不出差别。
    root.querySelectorAll('[data-stack] > *').forEach((el, i) => {
      gsap.set(el, { scale: 1 - Math.min(i, 3) * 0.018, y: -i * 5 })
    })
  }, root)

  // ------------------------------------------------------------------
  // GitHub 案例配方（来源见 PROJECT_HANDOVER 第三十一节）
  // kash-123/cinematic-scroll-landing → references/motion-recipes.md：
  //   clipPath inset() 图片 morph + 图片内 yPercent 视差 + 进度线 scaleX
  // Axel Vanhessche Awwwards 作品 → SVG / clip mask 揭示
  // GOATED-UI-SKILL → 磁吸微交互
  // 只作用于桌面且未开启「减少动态效果」；移动端与降级模式看静态内容。
  // ------------------------------------------------------------------
  motionMedia = gsap.matchMedia()
  motionMedia.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const cleanups = []

    // A. 实景照片：从遮罩里向上展开，图片本身做轻微视差
    root.querySelectorAll('[data-reveal-img]').forEach((wrap) => {
      const img = wrap.querySelector('img')
      if (!img) return
      // 只从底部 22% 起裁：全页截图 / 打印 / JS 未触发时图片仍完整可见，
      // 滚动时保留最后一段向上展开的揭示感，不会出现整块空白。
      gsap.fromTo(wrap, { clipPath: 'inset(0 0 22% 0)' }, {
        clipPath: 'inset(0 0 0% 0)', ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top 92%', end: 'top 42%', scrub: true }
      })
      gsap.fromTo(img, { yPercent: -5, scale: 1.1 }, {
        yPercent: 5, scale: 1.1, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true }
      })
    })

    // B. 首屏滚动镜头：金色圆远景化、标题上推淡出、进度线走满（不 pin，不锁滚动）
    const cinema = root.querySelector('[data-cinema]')
    if (cinema) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: cinema, start: 'top top', end: 'bottom 42%', scrub: 0.6 }
      })
      const seed = cinema.querySelector('[data-cinema-seed]')
      const copy = cinema.querySelector('[data-cinema-copy]')
      const line = cinema.querySelector('[data-cinema-progress]')
      if (seed) tl.to(seed, { scale: 1.2, xPercent: 9, opacity: 0.42, ease: 'none' }, 0)
      if (copy) tl.to(copy, { yPercent: -12, opacity: 0.18, ease: 'none' }, 0)
      if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
    }

    // C. 磁吸按钮：主 CTA 轻微跟随光标，离开归位
    root.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' })
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' })
      const onMove = (e) => {
        const r = btn.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.16)
        yTo((e.clientY - r.top - r.height / 2) * 0.18)
      }
      const onLeave = () => { xTo(0); yTo(0) }
      btn.addEventListener('mousemove', onMove)
      btn.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        btn.removeEventListener('mousemove', onMove)
        btn.removeEventListener('mouseleave', onLeave)
        gsap.set(btn, { x: 0, y: 0 })
      })
    })

    return () => cleanups.forEach((fn) => fn())
  })

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
  <!-- 独立双端壳：移动端 App / 双端同屏 / 后台管理系统（零遮挡、零嵌套 main、零横向溢出） -->
  <div v-if="isStandaloneShell" class="min-h-[100dvh] w-full max-w-full overflow-x-clip bg-[#F6F5F0] text-[#1C1B18]">
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="route.fullPath" />
    </router-view>
  </div>

  <!-- 3D 数字展馆 & 专题科普网壳：与吉韵禾野统一的新中式青绿山水 · 深松鎏金风格 -->
  <div v-else class="museum-portal min-h-screen bg-[#F3F6F3] text-[#10241C] flex flex-col relative">
    <a class="skip-link" href="#main-content">跳到展陈主内容</a>

    <div class="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-[#1F5440] via-[#C89B45] to-[#E5C175] z-[70] pointer-events-none"
      :style="{ width: `${scrollPct * 100}%` }"></div>
    <div :key="route.fullPath" class="route-progress fixed top-0 left-0 h-[2px] w-full bg-[#C89B45]/45 z-[69] pointer-events-none"></div>

    <AppNavbar />

    <main id="main-content" class="flex-grow" :data-motion="motionMode" :data-trail="appStore.trailDirection || ''" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="route-enter-active"
          :enter-from-class="enterFromClass"
          leave-active-class="route-leave-active"
          :leave-to-class="leaveToClass"
          mode="out-in"
          @before-enter="onRouteBeforeEnter"
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

    <AppFooter />

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-3"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-y-3"
    >
      <button v-if="showTop" @click="toTop"
        class="fixed bottom-6 right-5 sm:right-8 z-40 to-top w-11 h-11 rounded-full text-[#F3F7F4] flex items-center justify-center hover:bg-[#C89B45] hover:text-[#0E261D] transition-colors duration-300 cursor-pointer"
        aria-label="回到顶部">
        <ArrowUp :size="16" />
      </button>
    </Transition>
  </div>
</template>
