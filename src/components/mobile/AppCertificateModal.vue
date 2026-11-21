<script setup>
import { ref, computed } from 'vue'
import {
  ChevronLeft, Award, Droplets, Compass, Sparkles,
  CheckCircle2, Sprout, ShieldCheck, Calendar
} from 'lucide-vue-next'
import { useRuralPlatformStore } from '../../stores/ruralPlatformStore'

const props = defineProps({
  adoptionId: { type: String, required: true },
  framed: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])

const store = useRuralPlatformStore()
const adoption = computed(() => store.adoptions.find((a) => a.id === props.adoptionId) || store.adoptions[0])
const plot = computed(() => store.plots.find((p) => p.id === adoption.value?.plotId) || store.plots[0])

const showCert = ref(false)
const actionTip = ref('')

const stages = [
  { label: '春耕备播', sub: '北斗整地' },
  { label: '夏管蓄墒', sub: '生态除草' },
  { label: '生态灌浆', sub: '蟹稻共生' },
  { label: '秋收直邮', sub: '低温慢烘' }
]

function triggerCare(label, logMsg) {
  if (!adoption.value) return
  store.logFarmCareAction(adoption.value.id, logMsg)
  actionTip.value = `${label}指令已下发！公益积分 +15`
  window.setTimeout(() => { actionTip.value = '' }, 2400)
}
</script>

<template>
  <div
    v-if="adoption && plot"
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
      <span class="font-editorial text-[14.5px] font-bold text-[#16261F]">我的云农田 · {{ adoption.plotCode }}</span>
      <button
        type="button"
        @click="showCert = !showCert"
        class="h-8 px-2.5 rounded-full bg-[#FDF4E6] border border-[#C88A32]/35 text-[#8A5810] text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
      >
        <Award :size="12" />
        <span>{{ showCert ? '农田看板' : '电子证书' }}</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 app-scroll">
      <!-- ==================== 视图 A: 黑金宣纸电子收藏证书 ==================== -->
      <div v-if="showCert" class="space-y-3 pb-2">
        <div class="rounded-[1.4rem] bg-[#16261F] p-1.5 shadow-xl">
          <div class="rounded-[1.15rem] border border-[#F0C275]/45 bg-gradient-to-b from-[#1A2F26] via-[#16261F] to-[#111D18] text-[#F7F4EE] p-4 relative overflow-hidden">
            <div class="text-center space-y-1 border-b border-[#F0C275]/25 pb-3">
              <div class="font-mono text-[8.5px] tracking-[0.22em] text-[#F0C275]">JILIN BLACK SOIL GUARDIAN CERTIFICATE</div>
              <h2 class="font-editorial text-[19px] font-bold text-[#F5D393] tracking-wide">黑土认养电子收藏证书</h2>
              <div class="font-mono text-[10px] text-[#F7F4EE]/60">证书编号：{{ adoption.id }}</div>
            </div>

            <div class="py-3.5 space-y-2.5 text-[11.5px] leading-relaxed">
              <p class="text-[#F7F4EE]/90">
                兹证明 <strong class="text-[#F5D393] text-[13.5px] px-1">{{ adoption.adopter }}</strong> 于 {{ adoption.createdAt.slice(0, 10) }} 参与「吉韵禾野 · 乡村振兴黑土守护计划」，成功认养：
              </p>
              <div class="rounded-xl bg-white/7 border border-[#F0C275]/25 p-2.5 space-y-1">
                <div class="font-editorial text-[14.5px] font-bold text-[#F5D393]">{{ plot.name }}</div>
                <div class="text-[10.5px] text-[#F7F4EE]/75">地块编号：{{ plot.code }} · {{ adoption.shares }} 份（{{ plot.area }}）</div>
                <div class="text-[10.5px] text-[#F7F4EE]/75">托管单位：{{ plot.coop }}</div>
                <div class="text-[10.5px] text-[#86EFAC]">预计固碳：8.5 kg CO₂e · {{ plot.expectedYield }}</div>
              </div>
            </div>

            <div class="pt-2.5 border-t border-[#F0C275]/20 flex items-end justify-between">
              <div class="space-y-0.5 text-[10px] text-[#F7F4EE]/65">
                <div>农田管护人：{{ plot.farmerName }}</div>
                <div>当前状态：<span class="text-[#86EFAC] font-bold">{{ adoption.status }}</span></div>
              </div>
              <!-- 合作社电子印章 -->
              <div class="w-15 h-15 rounded-full border-2 border-[#D94E3B] text-[#E56B59] flex flex-col items-center justify-center rotate-[-12deg] font-editorial bg-[#D94E3B]/10">
                <span class="text-[7.5px] font-bold">吉韵禾野</span>
                <span class="text-[9.5px] font-bold">黑土认证</span>
                <span class="text-[7px] font-mono">2026</span>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          @click="showCert = false"
          class="w-full h-9.5 rounded-xl bg-white border border-[#1C1B18]/12 text-xs font-bold cursor-pointer"
        >
          返回查看云农田实时数据
        </button>
      </div>

      <!-- ==================== 视图 B: 云农田实时成长看板 ==================== -->
      <template v-else>
        <!-- 顶部实景地块卡 -->
        <div class="relative rounded-[1.4rem] overflow-hidden h-40 shadow-md">
          <img :src="plot.image" :alt="plot.name" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#16261F]/92 via-[#16261F]/25 to-transparent"></div>
          <div class="absolute top-3 left-3 flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded-full bg-[#22C55E] text-[#0D2118] text-[10px] font-bold flex items-center gap-1">
              <CheckCircle2 :size="10" />
              <span>{{ adoption.status }}</span>
            </span>
            <span class="px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-white font-mono text-[10px]">{{ plot.code }}</span>
          </div>
          <div class="absolute bottom-3 left-3.5 right-3.5 text-white">
            <h2 class="font-editorial text-[17px] font-bold leading-snug">{{ plot.name }}</h2>
            <div class="text-[11px] text-white/80 mt-0.5">{{ plot.coop }} · {{ plot.farmerName }}</div>
          </div>
        </div>

        <!-- 四阶段生长进度条（后台切物候实时同步！） -->
        <div class="bg-white rounded-2xl p-3.5 border border-[#1C1B18]/8 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[12.5px] font-bold text-[#1C1B18]">当前物候阶段</span>
            <span class="text-[11px] font-bold text-[#C88A32]">{{ adoption.stage }}</span>
          </div>
          <div class="grid grid-cols-4 gap-1.5">
            <div
              v-for="(st, i) in stages"
              :key="st.label"
              class="rounded-xl p-2 text-center border transition-all"
              :class="i <= plot.stageIndex
                ? 'bg-[#EAF3EE] border-[#2E5A44]/30 text-[#1F4E3D]'
                : 'bg-[#F8F6F1] border-[#1C1B18]/6 text-[#9A948A]'"
            >
              <div class="font-mono text-[9.5px] font-bold">0{{ i + 1 }}</div>
              <div class="text-[10.5px] font-bold mt-0.5">{{ st.label }}</div>
              <div class="text-[9px] opacity-75">{{ st.sub }}</div>
            </div>
          </div>
        </div>

        <!-- 实时田间传感器数据 -->
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-white rounded-2xl p-3 border border-[#1C1B18]/8 text-center">
            <div class="text-[10px] text-[#6E6960]">黑土有机质</div>
            <div class="font-mono text-[15px] font-bold text-[#1F4E3D] mt-0.5">{{ plot.organicPct }}%</div>
          </div>
          <div class="bg-white rounded-2xl p-3 border border-[#1C1B18]/8 text-center">
            <div class="text-[10px] text-[#6E6960]">表层墒情</div>
            <div class="font-mono text-[15px] font-bold text-[#1C1B18] mt-0.5">{{ plot.moisturePct }}%</div>
          </div>
          <div class="bg-white rounded-2xl p-3 border border-[#1C1B18]/8 text-center">
            <div class="text-[10px] text-[#6E6960]">土壤酸碱度</div>
            <div class="font-mono text-[13px] font-bold text-[#C88A32] mt-1">{{ plot.phValue || '6.7 微酸' }}</div>
          </div>
        </div>

        <!-- 云端田间互动遥控按钮 -->
        <div class="bg-white rounded-2xl p-3.5 border border-[#1C1B18]/8 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[12.5px] font-bold text-[#1C1B18]">云端田间照料互动</span>
            <span class="text-[10px] text-[#1F4E3D] font-medium">同步后台日志</span>
          </div>
          <div v-if="actionTip" class="px-3 py-1.5 rounded-xl bg-[#EAF3EE] text-[#1F4E3D] text-[11px] font-bold">
            {{ actionTip }}
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="triggerCare('墒情检测', '云认养用户远程唤醒土壤探针，表层含水量 68%，墒情良好。')"
              class="p-2.5 rounded-xl bg-[#F8F6F1] hover:bg-[#EAF3EE] border border-[#1C1B18]/8 flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              <Droplets :size="16" class="text-[#2F6175]" />
              <span class="text-[10.5px] font-bold">远程测墒</span>
            </button>
            <button
              type="button"
              @click="triggerCare('无人机巡田', '已调度多光谱植保无人机飞越地块完成长势与叶绿素扫描。')"
              class="p-2.5 rounded-xl bg-[#F8F6F1] hover:bg-[#EAF3EE] border border-[#1C1B18]/8 flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              <Compass :size="16" class="text-[#1F4E3D]" />
              <span class="text-[10.5px] font-bold">无人机巡田</span>
            </button>
            <button
              type="button"
              @click="showCert = true"
              class="p-2.5 rounded-xl bg-[#FDF4E6] border border-[#C88A32]/30 flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              <Award :size="16" class="text-[#C88A32]" />
              <span class="text-[10.5px] font-bold text-[#8A5810]">收藏证书</span>
            </button>
          </div>
        </div>

        <!-- 实时田间成长日志 -->
        <div class="bg-white rounded-2xl p-3.5 border border-[#1C1B18]/8 space-y-2.5">
          <div class="flex items-center gap-1.5 text-[12.5px] font-bold text-[#1C1B18]">
            <Calendar :size="14" class="text-[#1F4E3D]" />
            <span>地块成长与管护日志</span>
          </div>
          <div class="space-y-2">
            <div
              v-for="(lg, idx) in (adoption.logs || [])"
              :key="idx"
              class="p-2.5 rounded-xl bg-[#F8F6F1] text-[11px] space-y-0.5"
            >
              <div class="font-mono text-[9.5px] text-[#8E887E]">{{ lg.time }}</div>
              <div class="text-[#3E3B35] leading-relaxed">{{ lg.text }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.app-scroll::-webkit-scrollbar { width: 0; }
</style>
