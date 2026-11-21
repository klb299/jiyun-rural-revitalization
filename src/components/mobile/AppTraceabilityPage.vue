<script setup>
import { ref, computed } from 'vue'
import {
  ChevronLeft, QrCode, ShieldCheck, CheckCircle2,
  MapPin, Sprout, Tractor, PackageCheck, Sparkles, Search
} from 'lucide-vue-next'
import { useRuralPlatformStore } from '../../stores/ruralPlatformStore'

const props = defineProps({
  initialCode: { type: String, default: '' },
  framed: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'open-product'])

const store = useRuralPlatformStore()
const codeInput = ref(props.initialCode || store.products[0]?.traceCode || 'JL-JT-2026-0891')
const isScanning = ref(false)
const activeCode = ref(codeInput.value)

const matchedProduct = computed(() => {
  const c = activeCode.value.trim().toUpperCase()
  return store.products.find((p) => p.traceCode.toUpperCase() === c) || store.products[0]
})

function runVerify(code) {
  if (code) codeInput.value = code
  isScanning.value = true
  window.setTimeout(() => {
    activeCode.value = codeInput.value.trim() || store.products[0].traceCode
    isScanning.value = false
  }, 650)
}

const traceSteps = computed(() => [
  { stage: '01 黑土整地', date: '2026-04-18', desc: `${matchedProduct.value.origin} 秸秆覆田免耕，实测有机质 4.82%`, icon: Sprout },
  { stage: '02 北斗精播', date: '2026-05-12', desc: '260HP 北斗无人农机厘米级（±2.5cm）自主作业', icon: Tractor },
  { stage: '03 生态管护', date: '2026-08-06', desc: '多光谱无人机巡检 6 次，绿色零农残抽检合格', icon: ShieldCheck },
  { stage: '04 归仓赋码', date: '2026-10-28', desc: `${matchedProduct.value.coop || '产地合作社'} 恒温慢烘并生成唯一溯源码`, icon: QrCode },
  { stage: '05 冷链直发', date: '2026-11-20', desc: '产地直发顺丰冷链，一袋一码防伪核验通过', icon: PackageCheck }
])
</script>

<template>
  <div
    class="absolute inset-0 z-40 bg-[#F7F3EA] text-[#1C1B18] flex flex-col overflow-hidden"
    :class="framed ? 'pt-11' : ''"
    style="background-image: linear-gradient(180deg, rgba(247,243,234,0.22), rgba(247,243,234,0.45)), url('/art-custom/mobile-app-bg.jpg'); background-size: cover; background-position: center;"
  >
    <!-- 顶栏 -->
    <div class="shrink-0 h-12 px-3.5 bg-[#F7F4EE]/95 backdrop-blur-md border-b border-[#1C1B18]/8 flex items-center justify-between">
      <button
        type="button"
        @click="emit('close')"
        class="h-8 px-2.5 rounded-full bg-white border border-[#1C1B18]/10 text-[11.5px] font-bold flex items-center gap-0.5 cursor-pointer"
      >
        <ChevronLeft :size="14" />
        <span>返回</span>
      </button>
      <span class="font-editorial text-[14.5px] font-bold text-[#16261F]">一袋一码 · 黑土溯源查验</span>
      <span class="w-12 text-right font-mono text-[10px] text-[#1F4E3D] font-bold">VERIFIED</span>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 app-scroll">
      <!-- 扫码查验区 -->
      <div class="rounded-[1.4rem] bg-[#16261F] text-[#F7F4EE] p-4 relative overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="font-mono text-[9.5px] tracking-[0.2em] text-[#F0C275]">BLOCKCHAIN TRACEABILITY</div>
            <h2 class="font-editorial text-[17px] font-bold mt-0.5">吉林地理标志防伪溯源</h2>
          </div>
          <button
            type="button"
            @click="runVerify()"
            class="px-3 py-1.5 rounded-full bg-[#C88A32] text-[#16261F] text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
          >
            <QrCode :size="13" />
            <span>模拟扫码</span>
          </button>
        </div>

        <form @submit.prevent="runVerify()" class="flex items-center gap-1.5">
          <div class="relative flex-1">
            <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              v-model="codeInput"
              type="text"
              placeholder="输入溯源码如 JL-JT-2026-0891"
              class="w-full h-9 pl-8 pr-3 rounded-xl bg-white/10 border border-white/15 text-[11.5px] font-mono text-white placeholder:text-white/45 focus:outline-none focus:border-[#F0C275]"
            />
          </div>
          <button type="submit" class="h-9 px-3.5 rounded-xl bg-white text-[#16261F] text-[11.5px] font-bold cursor-pointer">
            查验
          </button>
        </form>

        <!-- 快捷示例批次（双列清晰排布，零裁切） -->
        <div class="grid grid-cols-2 gap-1.5 mt-2.5">
          <button
            v-for="p in store.products.slice(0, 4)"
            :key="p.id"
            type="button"
            @click="runVerify(p.traceCode)"
            class="px-2 py-1 rounded-lg text-[10px] font-mono text-center cursor-pointer transition-colors truncate"
            :class="matchedProduct.id === p.id ? 'bg-[#F0C275] text-[#16261F] font-bold' : 'bg-white/10 text-white/80 hover:bg-white/18'"
          >
            {{ p.traceCode }}
          </button>
        </div>

        <!-- 扫码激光动效 -->
        <div v-if="isScanning" class="absolute inset-0 bg-[#16261F]/90 backdrop-blur-xs flex flex-col items-center justify-center z-20">
          <div class="w-28 h-28 rounded-2xl border-2 border-[#F0C275]/70 relative overflow-hidden flex items-center justify-center">
            <QrCode :size="48" class="text-[#F0C275]/80" />
            <div class="scan-laser absolute inset-x-0 h-0.5 bg-[#4ADE80] shadow-[0_0_12px_#4ADE80]"></div>
          </div>
          <div class="font-mono text-[11px] text-[#4ADE80] mt-2.5 tracking-wider">正在核验吉林黑土溯源链…</div>
        </div>
      </div>

      <!-- 溯源电子证书卡 -->
      <div class="bg-white rounded-[1.4rem] p-4 border border-[#C88A32]/30 shadow-sm relative overflow-hidden space-y-3">
        <!-- 官方红章装饰 -->
        <div class="pointer-events-none absolute -right-2 top-3 w-16 h-16 rounded-full border-2 border-[#B83828]/45 flex flex-col items-center justify-center text-[#B83828]/65 rotate-[-14deg] font-editorial">
          <span class="text-[8px] font-bold tracking-widest">吉林地标</span>
          <span class="text-[11px] font-bold">核验真品</span>
        </div>

        <div class="flex items-center gap-2 text-[#1F4E3D]">
          <CheckCircle2 :size="16" class="text-[#22C55E]" />
          <span class="text-[12px] font-bold">官方认证 · 第 1 次扫码查验通过</span>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <img :src="matchedProduct.image" :alt="matchedProduct.name" class="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#1C1B18]/10" />
          <div class="min-w-0 pr-10">
            <h3 class="font-editorial text-[15px] font-bold text-[#1C1B18] leading-snug">{{ matchedProduct.name }}</h3>
            <div class="text-[11px] text-[#5A564E] flex items-center gap-1 mt-0.5">
              <MapPin :size="11" class="text-[#1F4E3D]" />
              <span>{{ matchedProduct.origin }}</span>
            </div>
            <div class="font-mono text-[10px] text-[#8A6324] font-semibold mt-0.5">批次号：{{ matchedProduct.traceCode }}</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center bg-[#F8F6F1] rounded-xl p-2.5">
          <div>
            <div class="text-[9.5px] text-[#6E6960]">黑土有机质</div>
            <div class="font-mono text-[13px] font-bold text-[#1F4E3D]">4.82%</div>
          </div>
          <div>
            <div class="text-[9.5px] text-[#6E6960]">农残快检</div>
            <div class="font-mono text-[13px] font-bold text-[#16A34A]">0 检出</div>
          </div>
          <div>
            <div class="text-[9.5px] text-[#6E6960]">农户直达比</div>
            <div class="font-mono text-[13px] font-bold text-[#C88A32]">{{ matchedProduct.farmerSharePct }}%</div>
          </div>
        </div>

        <div class="pt-1 border-t border-[#1C1B18]/6 font-mono text-[9.5px] text-[#8E887E] flex items-center justify-between">
          <span>HASH: 0x9F2A...E84C{{ matchedProduct.traceCode.slice(-4) }}</span>
          <button
            type="button"
            @click="emit('open-product', matchedProduct)"
            class="text-[#1F4E3D] font-sans font-bold text-[11px] cursor-pointer"
          >
            查看同款商品 →
          </button>
        </div>
      </div>

      <!-- 五步从黑土到餐桌时间轴 -->
      <div class="bg-white rounded-[1.4rem] p-4 border border-[#1C1B18]/8 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-editorial text-[14px] font-bold text-[#1C1B18]">从黑土到餐桌 · 全链路档案</h3>
          <span class="text-[10px] font-mono text-[#6E6960]">5 CHECKPOINTS</span>
        </div>

        <div class="space-y-3 relative pl-5 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[#2E5A44]/20">
          <div v-for="step in traceSteps" :key="step.stage" class="relative">
            <span class="absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full bg-[#1F4E3D] border-2 border-[#EAF3EE] flex items-center justify-center"></span>
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-bold text-[#1C1B18]">{{ step.stage }}</span>
              <span class="font-mono text-[10px] text-[#8E887E]">{{ step.date }}</span>
            </div>
            <p class="text-[11px] text-[#5A564E] mt-0.5 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes laserMove {
  0%, 100% { top: 8%; }
  50% { top: 88%; }
}
.scan-laser {
  animation: laserMove 1.1s ease-in-out infinite;
}
.app-scroll::-webkit-scrollbar { width: 0; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
</style>
