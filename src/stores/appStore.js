import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // Current active scene in 3D sandbox
  const activeFocusPoint = ref('overview') // 'overview', 'blacksoil', 'silo', 'windpower', 'smartdrone', 'greenhouse'
  
  // Audio narration state
  const isAudioPlaying = ref(false)
  
  // Night/Day cycle mode for 3D sandbox
  const isNightMode = ref(false)
  
  // Visitor interactive state
  const visitorCount = ref(128450)

  // 策展视角：展览地图的「按尺度 / 按五大振兴」选择贯穿到每个单元页，
  // 离开地图再回来仍保留，避免每进一间展厅就丢掉正在使用的那把尺子。
  // sessionStorage 只存一个视角枚举，不含任何个人信息；刷新后仍沿用刚才那把尺子。
  const LENS_KEY = 'jiyun-lens'
  const readLens = () => {
    try {
      return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(LENS_KEY) === 'revital'
        ? 'revital' : 'scale'
    } catch (e) {
      return 'scale'
    }
  }
  const lensMode = ref(readLens()) // 'scale' | 'revital'

  // 动线方向：由全局 TrailNav 写入，App.vue 的路由转场据此选择滑入方向，
  // 转场结束后清空，之后的普通跳转回到默认过渡。
  const trailDirection = ref(null) // 'forward' | 'back' | null

  // 互动实验的挑战进度：科普实验室四关 + 最后一公里三关共用一套徽章状态，
  // 两页之间联动。只记「看过哪些结构 / 拿到哪些章」，不存任何业务数据。
  const LAB_KEY = 'jiyun-labs'
  const emptyVisited = () => ({ soil: [], rice: [], beidou: [], notill: [], lm3: [] })
  const readLabs = () => {
    try {
      if (typeof sessionStorage === 'undefined') return null
      const d = JSON.parse(sessionStorage.getItem(LAB_KEY) || 'null')
      if (!d || typeof d !== 'object') return null
      return {
        visited: { ...emptyVisited(), ...(d.visited || {}) },
        badges: Array.isArray(d.badges) ? d.badges : []
      }
    } catch (e) { return null }
  }
  const savedLabs = readLabs()
  const labVisited = ref(savedLabs?.visited || emptyVisited())
  const labBadges = ref(savedLabs?.badges || [])
  const persistLabs = () => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(LAB_KEY, JSON.stringify({ visited: labVisited.value, badges: labBadges.value }))
      }
    } catch (e) { /* 隐私模式下写入失败，降级为本次会话内状态 */ }
  }
  
  // Real-time environmental telemetries (Simulated IoT sensors)
  const sensorsData = ref({
    soilMoisture: 38.6, // %
    organicMatter: 4.82, // % (High fertile Northeast black soil)
    sunlightHours: 2840, // annual hours
    temperature: 21.4, // Celsius
    phLevel: 6.8, // Slightly neutral
    airHumidity: 58.2 // %
  })

  const setFocusPoint = (point) => {
    activeFocusPoint.value = point
  }

  const toggleNightMode = () => {
    isNightMode.value = !isNightMode.value
  }

  const toggleAudio = () => {
    isAudioPlaying.value = !isAudioPlaying.value
  }

  const setLens = (mode) => {
    lensMode.value = mode === 'revital' ? 'revital' : 'scale'
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(LENS_KEY, lensMode.value)
    } catch (e) { /* 隐私模式下写入失败，静默降级为本次会话内状态 */ }
  }

  const markTrail = (direction) => {
    trailDirection.value = direction === 'back' ? 'back' : 'forward'
  }

  const clearTrail = () => {
    trailDirection.value = null
  }

  const visitLab = (lab, key) => {
    const arr = labVisited.value[lab]
    if (!arr || key === undefined || key === null || arr.includes(key)) return
    labVisited.value = { ...labVisited.value, [lab]: [...arr, key] }
    persistLabs()
  }

  const awardLab = (id) => {
    if (labBadges.value.includes(id)) return
    labBadges.value = [...labBadges.value, id]
    persistLabs()
  }

  // 电影级四幕开场动画状态：整站首访（/ 或 /museum）自动播放一次，随时支持跳过与点击重播
  const INTRO_KEY = 'jiyun-cine-intro-seen-v1'
  const showCineIntro = ref(false)
  const maybeAutoPlayIntro = (path) => {
    if (showCineIntro.value) return
    if (path !== '/' && path !== '/museum') return
    if (typeof window === 'undefined') return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    try {
      if (sessionStorage.getItem(INTRO_KEY) === '1') return
    } catch (e) { /* ignore */ }
    showCineIntro.value = true
  }
  const replayCineIntro = () => {
    showCineIntro.value = true
  }
  const finishCineIntro = () => {
    showCineIntro.value = false
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(INTRO_KEY, '1')
    } catch (e) { /* ignore */ }
  }

  return {
    activeFocusPoint,
    isAudioPlaying,
    isNightMode,
    visitorCount,
    sensorsData,
    lensMode,
    trailDirection,
    labVisited,
    labBadges,
    showCineIntro,
    setFocusPoint,
    toggleNightMode,
    toggleAudio,
    setLens,
    markTrail,
    clearTrail,
    visitLab,
    awardLab,
    maybeAutoPlayIntro,
    replayCineIntro,
    finishCineIntro
  }
})
