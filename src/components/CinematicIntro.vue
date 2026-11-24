<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import BrandLogo from './BrandLogo.vue'

const emit = defineEmits(['done'])

const TOTAL_DUR = 10.8
const CHAPTERS = [
  { id: 0, start: 0.0, num: '卷一', name: '展卷黑土' },
  { id: 1, start: 3.4, num: '卷二', name: '吉林风物' },
  { id: 2, start: 7.0, num: '卷三', name: '智绘丰年' }
]

// 全部由专项生成的高精国风原画驱动（零低多边形 / 严格遵循松辽平坦黑土平原 + 远缘低山丘陵真实地貌）
const ART = {
  dawn: '/art-custom/intro-scroll-dawn.jpg',
  changbai: '/art-custom/intro-mural-changbai.jpg',
  chagan: '/art-custom/intro-mural-chagan.jpg',
  paddy: '/art-custom/intro-mural-paddy.jpg',
  harvest: '/art-custom/intro-scroll-harvest.jpg',
  craneDeer: '/art-custom/intro-hero-crane-deer.webp',
  paperBg: '/art-custom/portal-linen-motif.jpg'
}

const galleryScrolls = [
  {
    src: ART.changbai,
    no: '壹',
    title: '长白林海',
    sub: '天池云雾 · 林下红参',
    cls: 'hang-scroll--left'
  },
  {
    src: ART.chagan,
    no: '贰',
    title: '查干冬捕',
    sub: '冰湖跃鲤 · 生态非遗',
    cls: 'hang-scroll--center'
  },
  {
    src: ART.paddy,
    no: '叁',
    title: '稻蟹共生',
    sub: '黑土活水 · 翡翠金穗',
    cls: 'hang-scroll--right'
  }
]

// 轻盈金箔微光星点（纯氛围点缀）
const goldSpecks = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 41 + 7) % 94 + 3}%`,
  top: `${(i * 29 + 13) % 86 + 7}%`,
  size: `${2.5 + (i % 4) * 1.4}px`,
  delay: `${(i * 0.37) % 4.5}s`,
  dur: `${4.2 + (i % 5) * 1.1}s`
}))

const elapsed = ref(0)
const isLeaving = ref(false)

const activeChapter = computed(() => {
  const t = elapsed.value
  if (t < CHAPTERS[1].start) return 0
  if (t < CHAPTERS[2].start) return 1
  return 2
})

// 双画轴左右展卷进度（0.15s -> 1.65s 从 0 展开到 1）
const scrollOpen = computed(() => {
  const raw = Math.max(0, Math.min(1, (elapsed.value - 0.15) / 1.5))
  // cubic-bezier 缓出感
  return 1 - Math.pow(1 - raw, 3)
})

const insetPct = computed(() => Number(((1 - scrollOpen.value) * 50).toFixed(2)))
const showSealStamp = computed(() => elapsed.value >= CHAPTERS[2].start + 1.05)
const showFinalCta = computed(() => elapsed.value >= CHAPTERS[2].start + 1.6)
const progressPct = computed(() => Math.min(100, (elapsed.value / TOTAL_DUR) * 100))

let rafId = 0
let startPerf = 0
let baseOffset = 0
let leaveTimer = 0

function tick(now) {
  if (!startPerf) startPerf = now
  const t = baseOffset + (now - startPerf) / 1000
  elapsed.value = t

  if (t >= TOTAL_DUR && !isLeaving.value) {
    finishIntro()
    return
  }
  rafId = requestAnimationFrame(tick)
}

function jumpToChapter(ch) {
  if (isLeaving.value) return
  baseOffset = Math.max(ch.start + 0.05, ch.id === 0 ? 1.7 : ch.start + 0.05)
  startPerf = performance.now()
  elapsed.value = baseOffset
}

function finishIntro() {
  if (isLeaving.value) return
  isLeaving.value = true
  cancelAnimationFrame(rafId)
  leaveTimer = window.setTimeout(() => {
    emit('done')
  }, 850)
}

function onKeyDown(e) {
  if (e.key === 'Escape' || e.code === 'Space' || e.key === 'Enter') {
    e.preventDefault()
    finishIntro()
  }
}

onMounted(() => {
  Object.values(ART).forEach((src) => {
    const img = new Image()
    img.src = src
  })
  document.documentElement.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeyDown)
  rafId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  clearTimeout(leaveTimer)
  document.documentElement.style.overflow = ''
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div
    class="scroll-intro"
    :class="[`is-ch-${activeChapter}`, { 'is-leaving': isLeaving }]"
    role="dialog"
    aria-modal="true"
    aria-label="吉韵禾野宋韵展卷开场"
  >
    <!-- 底层宣纸青绿装裱素底（开场卷轴未展开前呈现温润宣纸质感，彻底告别黑底电影风） -->
    <div
      class="scroll-paper-base"
      :style="{ backgroundImage: `url('${ART.paperBg}')` }"
      aria-hidden="true"
    ></div>

    <!-- 中央卷轴主画框（随左右紫檀鎏金画轴徐徐展开） -->
    <div class="scroll-stage-wrap">
      <div
        class="scroll-viewport"
        :style="{ clipPath: `inset(0 ${insetPct}% 0 ${insetPct}% round 6px)` }"
      >
        <!-- ============ 卷一：长白晨曦 · 青绿山水长卷 ============ -->
        <section class="scroll-scene scene-dawn" :class="{ 'is-active': activeChapter === 0 }">
          <img :src="ART.dawn" alt="长白晨曦青绿山水长卷" class="scene-bg-art scene-bg-art--pan" />
          <div class="scene-warm-veil" aria-hidden="true"></div>

          <!-- 宋式宣纸竖排题跋签（右上角留白处优雅浮现） -->
          <aside class="colophon-plaque" :class="{ 'is-on': elapsed >= 1.05 && activeChapter === 0 }">
            <span class="seal-mini">黑土</span>
            <h2 class="colophon-title">北纬四十三度 · 松辽沃野</h2>
            <p class="colophon-sub">二百至四百年沉积，方成一厘米腐殖黑土</p>
          </aside>
        </section>

        <!-- ============ 卷二：吉林风物 · 三联立轴画廊 ============ -->
        <section class="scroll-scene scene-gallery" :class="{ 'is-active': activeChapter === 1 }">
          <img :src="ART.dawn" alt="广袤松辽黑土平原" class="scene-bg-art scene-bg-art--slow" />
          <div class="scene-gallery-scrim" aria-hidden="true"></div>

          <!-- 顶部雅致墨韵卷首题字 -->
          <header class="gallery-head" :class="{ 'is-on': activeChapter === 1 }">
            <span class="gallery-eyebrow">卷二 · 吉林风物长卷</span>
            <h2 class="gallery-headline">长白林海、查干冰湖与黑土稻浪，皆入画中</h2>
          </header>

          <!-- 三联博物馆立轴挂画（错落景深浮现，纯工笔重彩原画） -->
          <div class="hang-scrolls" :class="{ 'is-on': activeChapter === 1 }">
            <figure
              v-for="(item, idx) in galleryScrolls"
              :key="item.title"
              class="hang-scroll"
              :class="item.cls"
              :style="{ '--idx': idx }"
            >
              <div class="hang-scroll__rod hang-scroll__rod--top" aria-hidden="true"></div>
              <div class="hang-scroll__silk">
                <div class="hang-scroll__imgbox">
                  <img :src="item.src" :alt="item.title" />
                </div>
                <figcaption class="hang-scroll__meta">
                  <span class="hang-scroll__no">{{ item.no }}</span>
                  <div>
                    <div class="hang-scroll__title">{{ item.title }}</div>
                    <div class="hang-scroll__sub">{{ item.sub }}</div>
                  </div>
                </figcaption>
              </div>
              <div class="hang-scroll__rod hang-scroll__rod--bot" aria-hidden="true"></div>
            </figure>
          </div>
        </section>

        <!-- ============ 卷三：金秋智农 · 丹顶衔穗 · 朱砂落印 ============ -->
        <section class="scroll-scene scene-finale" :class="{ 'is-active': activeChapter === 2 }">
          <img :src="ART.harvest" alt="金秋丰稔松辽智农画卷" class="scene-bg-art scene-bg-art--finale" />
          <div class="scene-finale-scrim" aria-hidden="true"></div>

          <div class="finale-layout">
            <!-- 左侧宋式锦绫印鉴主标题卡 -->
            <div class="finale-brand" :class="{ 'is-on': activeChapter === 2 }">
              <div class="finale-kicker">
                <BrandLogo :size="44" variant="gold" />
                <div class="finale-kicker-text">
                  <span>卷三 · 智绘丰年</span>
                  <small>JIYUN HEYE · DIGITAL RURAL PLATFORM</small>
                </div>
              </div>

              <div class="finale-title-row">
                <h1 class="finale-title">吉韵禾野</h1>
                <!-- 朱砂方形印章弹性落印 -->
                <span class="crimson-seal" :class="{ 'is-stamped': showSealStamp }" aria-label="吉韵印鉴">
                  <span>吉韵</span>
                  <span>黑土</span>
                </span>
              </div>

              <p class="finale-tagline">一端连乡野 · 一端驭数智</p>
              <p class="finale-desc">
                吉林黑土乡村振兴双端协同平台 — 移动端助农 App、数智管理后台、3D 数字展馆与四季交互体验同源共构。
              </p>

              <button
                type="button"
                class="finale-enter-btn"
                :class="{ 'is-on': showFinalCta }"
                @click="finishIntro"
              >
                <span>步入平台体验</span>
                <ChevronRight :size="15" aria-hidden="true" />
              </button>
            </div>

            <!-- 右侧透明底工笔重彩「丹顶鹤衔金穗 + 长白梅花鹿踏云」舒展升起 -->
            <div class="finale-hero-wrap" :class="{ 'is-on': activeChapter === 2 }">
              <div class="finale-sun-glow" aria-hidden="true"></div>
              <img
                :src="ART.craneDeer"
                alt="丹顶鹤衔金稻穗与长白梅花鹿踏青绿祥云"
                class="finale-hero-art"
              />
            </div>
          </div>
        </section>

        <!-- 柔和漂浮金箔微尘（纯光斑点缀，不画任何低多边形物体） -->
        <div class="gold-specks" aria-hidden="true">
          <i
            v-for="sp in goldSpecks"
            :key="sp.id"
            :style="{
              left: sp.left,
              top: sp.top,
              width: sp.size,
              height: sp.size,
              animationDelay: sp.delay,
              animationDuration: sp.dur
            }"
          ></i>
        </div>

        <!-- 内框宋式极细双金线装裱边 -->
        <div class="scroll-gold-frame" aria-hidden="true"></div>
      </div>

      <!-- 左右紫檀鎏金画轴（随展开进度平滑推向屏幕两端） -->
      <div
        class="scroll-spindle scroll-spindle--left"
        :style="{ left: `${insetPct}%` }"
        aria-hidden="true"
      >
        <i class="spindle-cap spindle-cap--top"></i>
        <i class="spindle-cap spindle-cap--bot"></i>
      </div>
      <div
        class="scroll-spindle scroll-spindle--right"
        :style="{ right: `${insetPct}%` }"
        aria-hidden="true"
      >
        <i class="spindle-cap spindle-cap--top"></i>
        <i class="spindle-cap spindle-cap--bot"></i>
      </div>
    </div>

    <!-- 顶部极简右上角「跳过展卷」胶囊（无电影场记、无闪烁红点、无时间码） -->
    <div class="scroll-top-bar">
      <div class="scroll-brand-mini">
        <BrandLogo :size="26" />
        <span>吉韵禾野 · 青绿画卷启幕</span>
      </div>
      <button type="button" class="scroll-skip-btn" @click="finishIntro">
        <span>跳过展卷</span>
        <ChevronRight :size="14" aria-hidden="true" />
      </button>
    </div>

    <!-- 底部三卷雅致切换导航 + 细金进度线 -->
    <div class="scroll-bottom-bar">
      <nav class="chapter-pills" aria-label="开场画卷章节">
        <button
          v-for="ch in CHAPTERS"
          :key="ch.id"
          type="button"
          class="chapter-pill"
          :class="{ 'is-active': activeChapter === ch.id }"
          @click="jumpToChapter(ch)"
        >
          <em>{{ ch.num }}</em>
          <span>{{ ch.name }}</span>
        </button>
      </nav>
      <div class="scroll-progress-line" aria-hidden="true">
        <b :style="{ width: `${progressPct}%` }"></b>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: hidden;
  background: #EDF2EE;
  color: #10241C;
  user-select: none;
  transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}

.scroll-intro.is-leaving {
  opacity: 0;
  transform: scale(1.035);
  pointer-events: none;
}

.scroll-paper-base {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.92;
}

/* 顶部极简装裱栏 */
.scroll-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 54px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(1.25rem, 3.2vw, 3rem);
}

.scroll-brand-mini {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: 'JiyunSerif', 'Noto Serif SC', serif;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #163327;
}

.scroll-skip-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.38rem 0.95rem;
  border-radius: 999px;
  background: rgba(16, 36, 28, 0.86);
  border: 1px solid rgba(229, 193, 117, 0.45);
  color: #F6E2B3;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.2s ease;
}

.scroll-skip-btn:hover {
  background: #1F5440;
  transform: translateX(2px);
}

/* 中央手卷主舞台（四周留出温润宣纸装裱天地边） */
.scroll-stage-wrap {
  position: absolute;
  top: 54px;
  bottom: 58px;
  left: clamp(1rem, 2.8vw, 2.8rem);
  right: clamp(1rem, 2.8vw, 2.8rem);
  z-index: 10;
}

.scroll-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 28px 64px -26px rgba(10, 30, 22, 0.48);
  background: #0F231B;
}

.scroll-gold-frame {
  position: absolute;
  inset: 10px;
  z-index: 12;
  pointer-events: none;
  border: 1px solid rgba(235, 202, 126, 0.42);
  border-radius: 3px;
  box-shadow: inset 0 0 0 4px rgba(14, 34, 26, 0.16);
}

/* 左右紫檀鎏金画轴 */
.scroll-spindle {
  position: absolute;
  top: -10px;
  bottom: -10px;
  width: 16px;
  z-index: 16;
  border-radius: 8px;
  background: linear-gradient(90deg, #21150D 0%, #5B3C24 38%, #825B3A 56%, #2C1B10 100%);
  box-shadow: 0 8px 24px rgba(12, 24, 18, 0.55);
  pointer-events: none;
}

.scroll-spindle--left {
  transform: translateX(-50%);
}

.scroll-spindle--right {
  transform: translateX(50%);
}

.spindle-cap {
  position: absolute;
  left: -2px;
  width: 20px;
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, #8B6520 0%, #F2D388 45%, #B8872C 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
}

.spindle-cap--top { top: -4px; }
.spindle-cap--bot { bottom: -4px; }

/* 场景公共层 */
.scroll-scene {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1);
}

.scroll-scene.is-active {
  opacity: 1;
  pointer-events: auto;
  z-index: 4;
}

.scene-bg-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
}

.scene-bg-art--pan {
  transform: scale(1.1) translateX(-1.8%);
  transition: transform 4.5s ease-out;
}

.scene-dawn.is-active .scene-bg-art--pan {
  transform: scale(1.03) translateX(1.8%);
}

.scene-bg-art--slow {
  filter: brightness(0.42) saturate(1.06);
  transform: scale(1.08);
  transition: transform 5s ease-out;
}

.scene-gallery.is-active .scene-bg-art--slow {
  transform: scale(1.01);
}

.scene-bg-art--finale {
  filter: brightness(0.86) contrast(1.04);
  transform: scale(1.07);
  transition: transform 5.2s ease-out;
}

.scene-finale.is-active .scene-bg-art--finale {
  transform: scale(1.0);
}

/* ============ 卷一：宋式竖排宣纸题跋签 ============ */
.scene-warm-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(14, 34, 26, 0.14) 0%, transparent 45%, rgba(16, 36, 28, 0.38) 100%);
}

.colophon-plaque {
  position: absolute;
  top: clamp(2rem, 6vh, 3.8rem);
  right: clamp(2rem, 5vw, 4.5rem);
  z-index: 5;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  gap: 1.15rem;
  padding: 1.5rem 1.35rem;
  border-radius: 10px;
  background: rgba(248, 245, 236, 0.88);
  border: 1px solid rgba(200, 155, 69, 0.45);
  box-shadow: 0 20px 48px -20px rgba(8, 24, 18, 0.55);
  backdrop-filter: blur(8px);
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.colophon-plaque.is-on {
  opacity: 1;
  transform: translateY(0);
}

.seal-mini {
  writing-mode: vertical-rl;
  padding: 0.35rem 0.25rem;
  border-radius: 4px;
  background: #B4382A;
  color: #FFF7E8;
  font-family: 'JiyunSerif', serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  box-shadow: inset 0 0 0 1px rgba(255, 235, 200, 0.45);
}

.colophon-title {
  margin: 0;
  writing-mode: vertical-rl;
  font-family: 'JiyunSerif', 'Noto Serif SC', serif;
  font-size: clamp(1.25rem, 2vw, 1.65rem);
  font-weight: 800;
  letter-spacing: 0.24em;
  color: #10241C;
  line-height: 1.3;
}

.colophon-sub {
  margin: 0;
  writing-mode: vertical-rl;
  font-family: 'JiyunSerif', serif;
  font-size: clamp(0.84rem, 1.15vw, 0.98rem);
  letter-spacing: 0.2em;
  color: #3E554B;
  line-height: 1.7;
  padding-top: 0.4rem;
  border-right: 1px solid rgba(200, 155, 69, 0.38);
  padding-right: 0.9rem;
}

/* ============ 卷二：三联立轴挂画画廊 ============ */
.scene-gallery-scrim {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(9, 26, 20, 0.28) 0%, rgba(6, 18, 14, 0.72) 100%);
}

.gallery-head {
  position: absolute;
  top: clamp(1.6rem, 4vh, 2.8rem);
  left: 0;
  right: 0;
  z-index: 5;
  text-align: center;
  padding: 0 1.5rem;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.75s ease 0.15s, transform 0.75s ease 0.15s;
}

.gallery-head.is-on {
  opacity: 1;
  transform: translateY(0);
}

.gallery-eyebrow {
  display: inline-block;
  padding: 0.25rem 0.9rem;
  border-radius: 999px;
  background: rgba(229, 193, 117, 0.16);
  border: 1px solid rgba(229, 193, 117, 0.42);
  color: #F4D891;
  font-size: 0.75rem;
  letter-spacing: 0.24em;
  margin-bottom: 0.55rem;
}

.gallery-headline {
  margin: 0;
  font-family: 'JiyunSerif', 'Noto Serif SC', serif;
  font-size: clamp(1.25rem, 2.2vw, 1.85rem);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #FFFBF0;
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.75);
}

.hang-scrolls {
  position: absolute;
  inset: clamp(6.8rem, 15vh, 8.8rem) clamp(1.5rem, 6vw, 5.5rem) clamp(1.8rem, 4.5vh, 3rem);
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1rem, 2.6vw, 2.4rem);
  align-items: center;
}

.hang-scroll {
  margin: 0;
  height: 100%;
  max-height: 520px;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(42px) scale(0.94);
  transition: opacity 0.85s ease, transform 0.95s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--idx) * 0.18s + 0.15s);
}

.hang-scrolls.is-on .hang-scroll {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.hang-scrolls.is-on .hang-scroll--center {
  transform: translateY(-12px) scale(1.03);
}

.hang-scroll__rod {
  height: 8px;
  margin: 0 -6px;
  border-radius: 999px;
  background: linear-gradient(180deg, #E5C175 0%, #7C5824 55%, #3A2411 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.48);
  flex-shrink: 0;
}

.hang-scroll__silk {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 10px 12px;
  background: linear-gradient(180deg, #F6F1E4 0%, #EAE2CF 100%);
  border-left: 1px solid rgba(200, 155, 69, 0.42);
  border-right: 1px solid rgba(200, 155, 69, 0.42);
  box-shadow: 0 24px 48px -22px rgba(0, 0, 0, 0.72);
}

.hang-scroll__imgbox {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgba(16, 36, 28, 0.16);
}

.hang-scroll__imgbox img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
  transition: transform 4.2s ease-out;
}

.hang-scrolls.is-on .hang-scroll__imgbox img {
  transform: scale(1.01);
}

.hang-scroll__meta {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding-top: 0.68rem;
}

.hang-scroll__no {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #143629;
  color: #F2D283;
  font-family: 'JiyunSerif', serif;
  font-size: 0.78rem;
  font-weight: 700;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.hang-scroll__title {
  font-family: 'JiyunSerif', serif;
  font-size: 0.96rem;
  font-weight: 800;
  color: #10241C;
  letter-spacing: 0.1em;
}

.hang-scroll__sub {
  font-size: 0.72rem;
  color: #51685E;
  letter-spacing: 0.08em;
  margin-top: 1px;
}

/* ============ 卷三：金秋智农 + 丹顶鹤梅花鹿 + 朱砂落印 ============ */
.scene-finale-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    102deg,
    rgba(10, 29, 22, 0.84) 0%,
    rgba(12, 34, 26, 0.62) 44%,
    rgba(14, 34, 26, 0.18) 76%,
    rgba(14, 34, 26, 0.34) 100%
  );
}

.finale-layout {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  align-items: center;
  padding: 0 clamp(2rem, 6vw, 5.5rem);
  gap: clamp(1rem, 3vw, 2.5rem);
}

.finale-brand {
  max-width: 560px;
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.9s ease 0.15s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
}

.finale-brand.is-on {
  opacity: 1;
  transform: translateY(0);
}

.finale-kicker {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

.finale-kicker-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.finale-kicker-text span {
  font-family: 'JiyunSerif', serif;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #F2D283;
}

.finale-kicker-text small {
  font-family: ui-monospace, Menlo, monospace;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: rgba(215, 232, 222, 0.72);
}

.finale-title-row {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

.finale-title {
  margin: 0;
  font-family: 'JiyunSerif', 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(3rem, 5.8vw, 5rem);
  font-weight: 800;
  letter-spacing: 0.16em;
  line-height: 1.05;
  background: linear-gradient(180deg, #FFFDF5 0%, #F7DB92 60%, #CA9634 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.55));
}

/* 朱砂落印（弹性压印动画） */
.crimson-seal {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background: #B93526;
  color: #FFF6E6;
  font-family: 'JiyunSerif', serif;
  font-size: 0.76rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0.06em;
  box-shadow: inset 0 0 0 1.5px rgba(255, 232, 194, 0.65), 0 8px 22px rgba(185, 53, 38, 0.45);
  opacity: 0;
  transform: scale(2.1) rotate(-14deg);
  transition: opacity 0.35s ease, transform 0.48s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.crimson-seal.is-stamped {
  opacity: 1;
  transform: scale(1) rotate(-4deg);
}

.finale-tagline {
  margin: 1rem 0 0;
  font-family: 'JiyunSerif', serif;
  font-size: clamp(1.1rem, 1.8vw, 1.48rem);
  font-weight: 600;
  letter-spacing: 0.24em;
  color: #F4DEA4;
}

.finale-desc {
  margin: 0.85rem 0 0;
  font-size: clamp(0.84rem, 1vw, 0.94rem);
  line-height: 1.85;
  color: rgba(235, 244, 239, 0.86);
  max-width: 460px;
}

.finale-enter-btn {
  margin-top: 1.65rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.72rem 1.55rem;
  border-radius: 999px;
  background: linear-gradient(90deg, #E8C472 0%, #F4DA98 100%);
  color: #0E261D;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  border: none;
  cursor: pointer;
  box-shadow: 0 14px 32px -10px rgba(232, 196, 114, 0.65);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.2s ease;
}

.finale-enter-btn.is-on {
  opacity: 1;
  transform: translateY(0);
}

.finale-enter-btn:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

/* 右侧丹顶鹤与梅花鹿工笔主视觉优雅升起（无旋转坛城、无侧向撞飞） */
.finale-hero-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  opacity: 0;
  transform: translateY(38px) scale(0.93);
  transition: opacity 1.15s ease 0.25s, transform 1.25s cubic-bezier(0.22, 1, 0.36, 1) 0.25s;
}

.finale-hero-wrap.is-on {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.finale-sun-glow {
  position: absolute;
  width: min(440px, 56vh);
  height: min(440px, 56vh);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(250, 222, 146, 0.32) 0%, rgba(110, 224, 180, 0.12) 48%, transparent 72%);
  filter: blur(18px);
  pointer-events: none;
}

.finale-hero-art {
  position: relative;
  z-index: 2;
  max-height: min(72vh, 580px);
  width: auto;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 20px 44px rgba(8, 22, 16, 0.52));
  animation: gentleFloat 4.8s ease-in-out infinite alternate;
}

@keyframes gentleFloat {
  from { transform: translateY(0px); }
  to { transform: translateY(-9px); }
}

/* 轻盈金箔星点 */
.gold-specks {
  position: absolute;
  inset: 0;
  z-index: 8;
  pointer-events: none;
}

.gold-specks i {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #FFF6D0 0%, rgba(235, 198, 108, 0.35) 60%, transparent 100%);
  opacity: 0;
  animation: speckFloat linear infinite;
}

@keyframes speckFloat {
  0% { opacity: 0; transform: translateY(16px) scale(0.7); }
  25% { opacity: 0.72; }
  75% { opacity: 0.48; }
  100% { opacity: 0; transform: translateY(-38px) scale(1.1); }
}

/* 底部雅致三卷导航栏 */
.scroll-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 58px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0 clamp(1.25rem, 3.2vw, 3rem);
}

.chapter-pills {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.chapter-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(16, 36, 28, 0.14);
  background: rgba(255, 255, 255, 0.65);
  color: #4D655B;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.chapter-pill em {
  font-style: normal;
  font-family: 'JiyunSerif', serif;
  font-weight: 700;
  color: #9A7022;
}

.chapter-pill.is-active {
  background: #122E23;
  border-color: #122E23;
  color: #F6E6BC;
}

.chapter-pill.is-active em {
  color: #F0CA74;
}

.scroll-progress-line {
  flex: 1;
  max-width: 280px;
  height: 2.5px;
  border-radius: 999px;
  background: rgba(16, 36, 28, 0.14);
  overflow: hidden;
}

.scroll-progress-line b {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #1F5440 0%, #C89B45 100%);
  transition: width 0.1s linear;
}

@media (max-width: 820px) {
  .colophon-plaque {
    right: 1rem;
    top: 1rem;
    padding: 1rem 0.9rem;
  }
  .hang-scrolls {
    grid-template-columns: 1fr;
    gap: 0.8rem;
    inset: 6.2rem 1rem 1rem;
  }
  .hang-scroll--left,
  .hang-scroll--right {
    display: none;
  }
  .finale-layout {
    grid-template-columns: 1fr;
    align-content: center;
    padding: 1.25rem;
  }
  .finale-hero-wrap {
    height: auto;
  }
  .finale-hero-art {
    max-height: 36vh;
  }
  .scroll-progress-line {
    display: none;
  }
}
</style>
