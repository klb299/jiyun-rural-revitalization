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

  return {
    activeFocusPoint,
    isAudioPlaying,
    isNightMode,
    visitorCount,
    sensorsData,
    setFocusPoint,
    toggleNightMode,
    toggleAudio
  }
})
