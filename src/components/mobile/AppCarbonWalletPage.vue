<script setup>
import { ref, computed } from 'vue'
import { ChevronLeft, Leaf, Award, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-vue-next'
import { useRuralPlatformStore } from '../../stores/ruralPlatformStore'

const props = defineProps({
  framed: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])
const store = useRuralPlatformStore()

/* ---------------- 一块地 · 五笔收入交互模拟器 ---------------- */
const muCount = ref(5)
const years = ref(3)

const incomeBreakdown = computed(() => {
  const m = muCount.value
  const y = years.value
  const trust = Math.round(m * 620 * y)
  const order = Math.round(m * 480 * y)
  const dividend = Math.round(m * 290 * y)
  const labor = Math.round(m * 350 * y)
  const ecoSub = Math.round(m * 180 * y)
  const total = trust + order + dividend + labor + ecoSub
  return {
    total,
    items: [
      { label: '土地托管降本', val: trust, color: '#1F4E3D' },
      { label: '地理标志订单溢价', val: order, color: '#C88A32' },
      { label: '合作社年底分红', val: dividend, color: '#3B6E82' },
      { label: '就地农机/分拣务工', val: labor, color: '#B83828' },
      { label: '黑土护土生态补贴', val: ecoSub, color: '#6E8464' }
    ]
  }
})

const badges = [
  { id: 'b1', name: '黑土初芽', desc: '首次参与助农直采', unlocked: true, tone: 'from-[#2E5A44] to-[#16261F]' },
  { id: 'b2', name: '稻蟹守护者', desc: '累计固碳超过 30kg', unlocked: true, tone: 'from-[#C88A32] to-[#8A5810]' },
  { id: 'b3', name: '查干湖冰湖之友', desc: '支持非遗生态渔业', unlocked: true, tone: 'from-[#3B6E82] to-[#1E3F4D]' },
  { id: 'b4', name: '零碳领航员', desc: '累计固碳达 100kg', unlocked: false, tone: 'from-[#6E6960] to-[#3E3B35]' }
]
</script>

<template>
  <div
    class="absolute inset-0 z-40 bg-[#F7F3EA] text-[#1C1B18] flex flex-col overflow-hidden"
    :class="framed ? 'pt-11' : ''"
    style="background-image: linear-gradient(180deg, rgba(247,243,234,0.22), rgba(247,243,234,0.45)), url('/art-custom/mobile-app-bg.jpg'); background-size: cover; background-position: center;"
  >
    <div class="shrink-0 h-12 px-3.5 bg-[#16261F] text-[#F7F4EE] flex items-center justify-between">
      <button
        type="button"
        @click="emit('close')"
        class="h-8 px-2.5 rounded-full bg-white/12 text-[11.5px] font-bold flex items-center gap-0.5 cursor-pointer"
      >
        <ChevronLeft :size="14" />
        <span>返回</span>
      </button>
      <span class="font-editorial text-[14.5px] font-bold">黑土碳汇与助农增收账本</span>
      <span class="font-mono text-[9.5px] text-[#86EFAC] font-bold">ESG · LIVE</span>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 app-scroll">
      <!-- 黑土固碳能量环卡 -->
      <div
        class="rounded-[1.5rem] text-[#F7F4EE] p-4 relative overflow-hidden shadow-lg border border-[#F0C275]/25"
        style="background-image: linear-gradient(135deg, rgba(16,32,25,0.9), rgba(22,46,35,0.75)), url('/art-custom/app-header-banner.jpg'); background-size: cover;"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="font-mono text-[9.5px] tracking-[0.2em] text-[#86EFAC]">BLACK SOIL CARBON LEDGER</div>
            <div class="flex items-baseline gap-1.5 mt-1">
              <span class="font-mono text-[30px] font-bold text-[#F5D393] leading-none">{{ store.appConfig.userProfile.carbonSavedKg }}</span>
              <span class="text-xs text-white/80">kg CO₂e</span>
            </div>
            <p class="text-[10.5px] text-white/75 mt-1.5">相当于守护 2.4 ㎡ 万年黑土耕作层 · 种植 3 棵防护林樟子松</p>
          </div>
          <div class="w-14 h-14 rounded-full border-4 border-[#4ADE80]/30 border-t-[#4ADE80] border-r-[#F0C275] flex items-center justify-center shrink-0">
            <Leaf :size="22" class="text-[#86EFAC]" />
          </div>
        </div>
      </div>

      <!-- 公益勋章墙 -->
      <div class="bg-white rounded-2xl p-3.5 border border-[#1C1B18]/8 space-y-2.5">
        <div class="flex items-center justify-between">
          <h3 class="font-editorial text-[14px] font-bold text-[#16261F] flex items-center gap-1.5">
            <Award :size="14" class="text-[#C88A32]" />
            <span>黑土守护电子勋章墙</span>
          </h3>
          <span class="font-mono text-[10px] text-[#1F4E3D] font-bold">已点亮 3/4</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="b in badges"
            :key="b.id"
            class="p-2.5 rounded-xl border flex items-center gap-2"
            :class="b.unlocked ? 'bg-[#FAF8F4] border-[#C88A32]/25' : 'bg-[#F3F1EC] border-[#1C1B18]/6 opacity-55'"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-br text-[#F5D393] flex items-center justify-center shrink-0" :class="b.tone">
              <CheckCircle2 v-if="b.unlocked" :size="14" />
              <Sparkles v-else :size="14" />
            </div>
            <div class="min-w-0">
              <div class="text-[11px] font-bold text-[#16261F] truncate">{{ b.name }}</div>
              <div class="text-[9.5px] text-[#6E6960] truncate">{{ b.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 一块地 · 五笔收入交互式助农账本 -->
      <div class="bg-white rounded-2xl p-4 border border-[#1C1B18]/8 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-editorial text-[14.5px] font-bold text-[#16261F] flex items-center gap-1">
              <TrendingUp :size="14" class="text-[#1F4E3D]" />
              <span>一块地 · 五笔收入增收模拟器</span>
            </h3>
            <p class="text-[10px] text-[#6E6960]">拖动滑块测算黑土合作社带动农户五维收益</p>
          </div>
        </div>

        <div class="space-y-2.5 bg-[#F8F6F1] rounded-xl p-3">
          <div>
            <div class="flex justify-between text-[11px] font-bold mb-1">
              <span>参与托管 / 认养面积</span>
              <span class="font-mono text-[#1F4E3D]">{{ muCount }} 亩</span>
            </div>
            <input v-model.number="muCount" type="range" min="1" max="30" class="w-full accent-[#1F4E3D]" />
          </div>
          <div>
            <div class="flex justify-between text-[11px] font-bold mb-1">
              <span>保护性耕作周期</span>
              <span class="font-mono text-[#C88A32]">{{ years }} 年</span>
            </div>
            <input v-model.number="years" type="range" min="1" max="5" class="w-full accent-[#C88A32]" />
          </div>
        </div>

        <div class="flex items-baseline justify-between px-1">
          <span class="text-[11.5px] font-semibold text-[#5A564E]">预计带动农户综合增收</span>
          <span class="font-mono text-[22px] font-bold text-[#B83828]">¥{{ incomeBreakdown.total.toLocaleString() }}</span>
        </div>

        <div class="space-y-2">
          <div v-for="it in incomeBreakdown.items" :key="it.label" class="space-y-0.5">
            <div class="flex justify-between text-[10.5px]">
              <span class="text-[#3E3B35]">{{ it.label }}</span>
              <span class="font-mono font-bold text-[#16261F]">¥{{ it.val.toLocaleString() }}</span>
            </div>
            <div class="h-1.5 rounded-full bg-[#ECE8DF] overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :style="{ width: `${Math.round((it.val / incomeBreakdown.total) * 100)}%`, backgroundColor: it.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-scroll::-webkit-scrollbar { width: 0; }
</style>
