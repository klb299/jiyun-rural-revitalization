<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import RuralAppShell from '../components/mobile/RuralAppShell.vue'

const route = useRoute()
const initialTab = computed(() => {
  const t = typeof route.query.tab === 'string' ? route.query.tab : 'home'
  return ['home', 'market', 'adopt', 'village', 'profile'].includes(t) ? t : 'home'
})
</script>

<template>
  <div class="h-[100dvh] w-full overflow-hidden bg-[#F8F6F1] md:bg-[#ECEAE3] flex justify-center">
    <RuralAppShell :framed="false" :initial-tab="initialTab" />
  </div>
</template>
