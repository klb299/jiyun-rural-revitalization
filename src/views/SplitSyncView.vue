<script setup>
import { RouterLink } from 'vue-router'
import { Smartphone, LayoutDashboard, Compass, Sparkles, Activity } from 'lucide-vue-next'
import RuralAppShell from '../components/mobile/RuralAppShell.vue'
import AdminConsole from '../components/admin/AdminConsole.vue'
import { useRuralPlatformStore } from '../stores/ruralPlatformStore'

const store = useRuralPlatformStore()
</script>

<template>
  <div
    class="h-screen w-screen overflow-hidden flex flex-col bg-[#EDE9E0] text-[#1C1B18]"
    style="background-image: linear-gradient(180deg, rgba(244,240,230,0.72), rgba(237,233,224,0.78)), url('/art-custom/showcase-bg-pattern.jpg'); background-size: cover; background-position: center;"
  >
    <!-- 顶部答辩联动演示栏 -->
    <header class="shrink-0 h-13 px-5 bg-[#16261F] text-[#F7F4EE] flex items-center justify-between gap-4 border-b border-white/10">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-7 h-7 rounded-lg bg-[#C88A32] text-[#16261F] font-editorial font-bold flex items-center justify-center text-sm shrink-0">
          禾
        </div>
        <span class="font-editorial font-bold text-sm truncate">吉韵禾野 · 双端同屏实时联动演示</span>
        <span class="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#86EFAC] text-[11px] font-medium">
          <span class="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse"></span>
          <span>{{ store.lastSyncEvent }}</span>
        </span>
      </div>

      <div class="flex items-center gap-2 shrink-0 text-xs">
        <span class="hidden xl:inline-flex items-center gap-1 text-[#F0C275]/90 text-[11.5px] mr-2">
          <Sparkles :size="13" />
          <span>试试：在左侧 App 下单/认养/留言，或在右侧后台改价/发货/发公告！</span>
        </span>
        <RouterLink to="/" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 flex items-center gap-1.5 transition-colors">
          <Smartphone :size="13" />
          <span>单屏 App</span>
        </RouterLink>
        <RouterLink to="/admin" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 flex items-center gap-1.5 transition-colors">
          <LayoutDashboard :size="13" />
          <span>全屏后台</span>
        </RouterLink>
        <RouterLink to="/bigscreen" class="px-3 py-1.5 rounded-full bg-[#C88A32]/20 border border-[#F0C275]/35 text-[#F5D393] hover:bg-[#C88A32]/35 flex items-center gap-1.5 transition-colors">
          <Activity :size="13" />
          <span>数智大屏</span>
        </RouterLink>
        <RouterLink to="/museum" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 flex items-center gap-1.5 transition-colors">
          <Compass :size="13" />
          <span>3D 展馆</span>
        </RouterLink>
      </div>
    </header>

    <!-- 双端同屏主画布 -->
    <div class="flex-1 min-h-0 flex items-stretch gap-4 p-4 overflow-hidden">
      <!-- 左侧：移动端 App 真机 -->
      <div class="shrink-0 w-[372px] flex items-center justify-center">
        <div class="w-[366px] h-full max-h-[780px] rounded-[3rem] p-[10px] bg-gradient-to-b from-[#3A3834] via-[#22211E] to-[#34322E] shadow-2xl">
          <div class="w-full h-full rounded-[2.45rem] overflow-hidden bg-[#F8F6F1]">
            <RuralAppShell :framed="true" />
          </div>
        </div>
      </div>

      <!-- 右侧：实时管理后台 -->
      <div class="flex-1 min-w-0 h-full">
        <AdminConsole :embedded="true" />
      </div>
    </div>
  </div>
</template>
