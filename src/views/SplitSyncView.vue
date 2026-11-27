<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Smartphone, LayoutDashboard, Compass, Sparkles,
  Activity, ShoppingBag, Tractor, Sprout, CheckCircle2
} from 'lucide-vue-next'
import RuralAppShell from '../components/mobile/RuralAppShell.vue'
import AdminConsole from '../components/admin/AdminConsole.vue'
import BrandLogo from '../components/BrandLogo.vue'
import { useRuralPlatformStore } from '../stores/ruralPlatformStore'

const store = useRuralPlatformStore()
const appRef = ref(null)
const adminRef = ref(null)
const activeScenario = ref('s1')
const scenarioHint = ref('步骤提示：在左侧【严选集市】将商品加购并勾选补贴券下单 → 右侧【助农订单】点击一键批量发货 → 左侧物流实时更新！')

const scenarios = [
  {
    id: 's1',
    icon: ShoppingBag,
    label: '剧本① 城市直采与合作社发货',
    hint: '步骤提示：左侧【城市买家·严选集市】领券下单查看农户直达分成回执 → 右侧【合作社运营·助农订单】一键批量发货 → 左侧物流即时更新！',
    stage: () => {
      store.setAppPersona('consumer')
      appRef.value?.setTab('market')
      adminRef.value?.applyRole('coop', 'orders')
    }
  },
  {
    id: 's2',
    icon: Tractor,
    label: '剧本② 新农人预约与农机站派车',
    hint: '步骤提示：左侧【新农人端】提交 36 亩北斗深松预约工单 → 右侧【农机农技站·村务与派单】点击「一键指派北斗农机」 → 左侧与雷达即时回执！',
    stage: () => {
      store.setAppPersona('farmer')
      appRef.value?.setTab('home')
      appRef.value?.openBookingSheet?.()
      adminRef.value?.applyRole('agri', 'village')
    }
  },
  {
    id: 's3',
    icon: Sprout,
    label: '剧本③ 云认养审签与物候播报',
    hint: '步骤提示：左侧【城市买家·云认养】提交认养或点开云农田看板 → 右侧【合作社运营·云认养地块】审核生效或切换物候阶段 → 左侧成长日志同步刷新！',
    stage: () => {
      store.setAppPersona('consumer')
      appRef.value?.setTab('adopt')
      adminRef.value?.applyRole('coop', 'adoptions')
    }
  }
]

function runScenario(sc) {
  activeScenario.value = sc.id
  scenarioHint.value = sc.hint
  sc.stage()
}
</script>

<template>
  <div
    class="h-screen w-screen overflow-hidden flex flex-col bg-[#EDE9E0] text-[#1C1B18]"
    style="background-image: linear-gradient(180deg, rgba(244,240,230,0.78), rgba(237,233,224,0.82)), url('/art-custom/showcase-bg-pattern.jpg'); background-size: cover; background-position: center;"
  >
    <!-- 顶部答辩联动演示栏 + 三大真实角色剧本一键布景 -->
    <header class="shrink-0 px-5 py-2 bg-[#16261F] text-[#F7F4EE] border-b border-white/10 space-y-2">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <BrandLogo :size="28" variant="gold" />
          <span class="font-editorial font-bold text-sm truncate">吉韵禾野 · 多角色双端同屏实时联动实训台</span>
          <span class="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#86EFAC] text-[11px] font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse"></span>
            <span class="truncate max-w-[260px]">{{ store.lastSyncEvent }}</span>
          </span>
        </div>

        <nav aria-label="同屏台快捷跳转" class="flex items-center gap-1.5 shrink-0 text-xs">
          <RouterLink to="/" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 flex items-center gap-1.5 transition-colors">
            <Smartphone :size="13" aria-hidden="true" />
            <span>四端门户</span>
          </RouterLink>
          <RouterLink to="/admin" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 flex items-center gap-1.5 transition-colors">
            <LayoutDashboard :size="13" aria-hidden="true" />
            <span>全屏后台</span>
          </RouterLink>
          <RouterLink to="/bigscreen" class="px-3 py-1.5 rounded-full bg-[#C88A32]/22 border border-[#F0C275]/35 text-[#F5D393] hover:bg-[#C88A32]/35 flex items-center gap-1.5 transition-colors">
            <Activity :size="13" aria-hidden="true" />
            <span>数智大屏</span>
          </RouterLink>
          <RouterLink to="/museum" class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/18 flex items-center gap-1.5 transition-colors">
            <Compass :size="13" aria-hidden="true" />
            <span>3D 展馆</span>
          </RouterLink>
        </nav>
      </div>

      <!-- 一键场景剧本切换条 -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
        <div role="group" aria-label="双端联动实训剧本" class="flex flex-wrap items-center gap-1.5">
          <span class="text-[10.5px] font-mono text-[#F0C275] mr-1 flex items-center gap-1">
            <Sparkles :size="12" aria-hidden="true" />
            <span>一键加载闭环剧本：</span>
          </span>
          <button
            v-for="sc in scenarios"
            :key="sc.id"
            type="button"
            @click="runScenario(sc)"
            :aria-pressed="activeScenario === sc.id ? 'true' : 'false'"
            class="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            :class="activeScenario === sc.id
              ? 'bg-[#F0C275] text-[#16261F] shadow-xs'
              : 'bg-white/10 text-[#F7F4EE]/85 hover:bg-white/18'"
          >
            <component :is="sc.icon" :size="12" aria-hidden="true" />
            <span>{{ sc.label }}</span>
          </button>
        </div>

        <div class="hidden xl:flex items-center gap-1.5 text-[11px] text-[#D7E4DD] truncate max-w-[540px]">
          <CheckCircle2 :size="12.5" class="text-[#4ADE80] shrink-0" aria-hidden="true" />
          <span class="truncate">{{ scenarioHint }}</span>
        </div>
      </div>
    </header>

    <!-- 双端同屏主画布 -->
    <main class="flex-1 min-h-0 flex items-stretch gap-4 p-3.5 overflow-hidden">
      <!-- 左侧：移动端双身份 App 真机 -->
      <div class="shrink-0 w-[372px] flex flex-col items-center justify-center gap-1.5">
        <div class="w-[366px] flex-1 max-h-[756px] rounded-[2.95rem] p-[10px] bg-gradient-to-b from-[#3A3834] via-[#22211E] to-[#34322E] shadow-2xl">
          <div class="w-full h-full rounded-[2.4rem] overflow-hidden bg-[#F8F6F1]">
            <RuralAppShell ref="appRef" :framed="true" />
          </div>
        </div>
      </div>

      <!-- 右侧：实时分岗管理后台 -->
      <div class="flex-1 min-w-0 h-full">
        <AdminConsole ref="adminRef" :embedded="true" />
      </div>
    </main>
  </div>
</template>
