<script setup>
import { ref, computed } from 'vue'
import {
  ChevronLeft, Leaf, Award, Sparkles, TrendingUp,
  CheckCircle2, Ticket, ShieldCheck
} from 'lucide-vue-next'
import { useRuralPlatformStore } from '../../stores/ruralPlatformStore'

const props = defineProps({
  framed: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])
const store = useRuralPlatformStore()

const tipMsg = ref('')
let tipTimer = 0
function showTip(msg) {
  tipMsg.value = msg
  clearTimeout(tipTimer)
  tipTimer = window.setTimeout(() => { tipMsg.value = '' }, 2600)
}

/* ---------------- 积分兑换助农补贴券目录（消费者实用闭环） ---------------- */
const redeemOptions = [
  { id: 'r1', title: '黑土守护专享补贴券', amount: 15, minSpend: 89, costPoints: 500, desc: '全场地理标志农产通用 · 不扣农户分成' },
  { id: 'r2', title: '合作社联名礼盒抵扣券', amount: 32, minSpend: 168, costPoints: 1000, desc: '适合认养礼箱、人参及查干湖鲜鱼直采' }
]

function handleRedeem(opt) {
  if ((store.appConfig.userProfile.points || 0) < opt.costPoints) {
    showTip(`公益积分不足 ${opt.costPoints} 分，可通过直采、云农田巡田或守护游戏获取`)
    return
  }
  const created = store.redeemPointsCoupon(opt)
  if (created) {
    showTip(`兑换成功！「满 ${opt.minSpend} 减 ${opt.amount}」已存入您的购物袋礼券包`)
  }
}

function handleConfirmSubsidy() {
  const ok = store.confirmNoTillSubsidy()
  if (ok) {
    showTip('已核验确认 36 亩免耕面积，补贴台账已同步上报管理后台！')
  }
}

/* ---------------- 一块地 · 五笔收入交互模拟器 ---------------- */
const muCount = ref(store.appPersona === 'farmer' ? 36 : 5)
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
      { label: '土地托管节本保底', val: trust, color: '#1F4E3D' },
      { label: '地理标志订单溢价', val: order, color: '#C88A32' },
      { label: '合作社年底二次分红', val: dividend, color: '#3B6E82' },
      { label: '就地农机/分拣务工', val: labor, color: '#B83828' },
      { label: '黑土免耕生态补贴', val: ecoSub, color: '#5A7A52' }
    ]
  }
})

const badges = computed(() => [
  { id: 'b1', name: '黑土初芽', desc: '首次参与助农直采', unlocked: true, tone: 'from-[#2E5A44] to-[#16261F]' },
  { id: 'b2', name: '稻蟹守护者', desc: '累计固碳超过 30kg', unlocked: true, tone: 'from-[#C88A32] to-[#8A5810]' },
  { id: 'b3', name: '查干湖冰湖之友', desc: '支持非遗生态渔业', unlocked: true, tone: 'from-[#3B6E82] to-[#1E3F4D]' },
  {
    id: 'b4',
    name: '零碳领航员',
    desc: '累计固碳达 100kg 或完成守护战',
    unlocked: (store.appConfig.userProfile.carbonSavedKg || 0) >= 100 || (store.gameStats?.plays || 0) > 0,
    tone: 'from-[#1F5440] to-[#0E261D]'
  }
])
const unlockedBadgeCount = computed(() => badges.value.filter((b) => b.unlocked).length)
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
        class="min-h-[36px] px-3 rounded-full bg-white/12 text-[11.5px] font-bold flex items-center gap-0.5 cursor-pointer"
      >
        <ChevronLeft :size="14" aria-hidden="true" />
        <span>返回</span>
      </button>
      <span class="font-editorial text-[14.5px] font-bold">
        {{ store.appPersona === 'farmer' ? '社员分红与护土补贴账本' : '黑土碳汇与积分兑券中心' }}
      </span>
      <span class="font-mono text-[9.5px] text-[#86EFAC] font-bold">ESG · LIVE</span>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 app-scroll">
      <!-- 顶部即时反馈条 -->
      <div
        v-if="tipMsg"
        role="status"
        aria-live="polite"
        class="px-3.5 py-2.5 rounded-2xl bg-[#16261F] text-[#F5D393] text-[11.5px] font-semibold border border-[#F0C275]/35 flex items-center gap-2 shadow-md"
      >
        <CheckCircle2 :size="14" class="text-[#4ADE80] shrink-0" aria-hidden="true" />
        <span>{{ tipMsg }}</span>
      </div>

      <!-- ==================== 新农人视角：合作社社员实时收益与补贴核验总账 ==================== -->
      <template v-if="store.appPersona === 'farmer'">
        <div
          class="rounded-[1.5rem] text-[#F7F4EE] p-4 relative overflow-hidden shadow-lg border border-[#F0C275]/30"
          style="background-image: linear-gradient(135deg, rgba(16,32,25,0.92), rgba(22,46,35,0.78)), url('/art-custom/app-header-banner.jpg'); background-size: cover;"
        >
          <div class="font-mono text-[9.5px] tracking-[0.18em] text-[#86EFAC]">COOPERATIVE MEMBER LEDGER · 实时分红总账</div>
          <div class="flex items-baseline justify-between mt-1.5">
            <div>
              <div class="text-[11px] text-white/75">{{ store.appConfig.farmerProfile.name }} · 托管 {{ store.farmerIncomeLedger.mu }} 亩示范田</div>
              <div class="font-mono text-[28px] font-bold text-[#F5D393] leading-tight mt-0.5">
                ¥{{ store.farmerIncomeLedger.total.toLocaleString() }}
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/30 text-[10px] font-bold">
              随订单实时增长
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/12 text-[11px]">
            <div class="rounded-xl bg-white/8 p-2.5">
              <div class="text-white/65 text-[10px]">土地托管保底收入</div>
              <div class="font-mono font-bold text-white text-[14px] mt-0.5">¥{{ store.farmerIncomeLedger.trustBase.toLocaleString() }}</div>
            </div>
            <div class="rounded-xl bg-white/8 p-2.5">
              <div class="text-white/65 text-[10px]">集市直采分成回款</div>
              <div class="font-mono font-bold text-[#F5D393] text-[14px] mt-0.5">¥{{ store.farmerIncomeLedger.orderDividend.toLocaleString() }}</div>
            </div>
            <div class="rounded-xl bg-white/8 p-2.5">
              <div class="text-white/65 text-[10px]">云认养管护津贴</div>
              <div class="font-mono font-bold text-[#86EFAC] text-[14px] mt-0.5">¥{{ store.farmerIncomeLedger.adoptShare.toLocaleString() }}</div>
            </div>
            <div class="rounded-xl bg-white/8 p-2.5">
              <div class="text-white/65 text-[10px]">保护性耕作补贴</div>
              <div class="font-mono font-bold text-[#7DD3FC] text-[14px] mt-0.5">¥{{ store.farmerIncomeLedger.noTillSubsidy.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <!-- 保护性耕作补贴面积确认闭环 -->
        <div class="bg-white rounded-2xl p-3.5 border border-[#C88A32]/30 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[12.5px] font-bold text-[#16261F] flex items-center gap-1.5">
              <ShieldCheck :size="15" class="text-[#1F4E3D]" aria-hidden="true" />
              <span>2026 黑土保护性耕作补贴核验</span>
            </span>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold"
              :class="store.farmerIncomeLedger.confirmed ? 'bg-[#EAF3EE] text-[#1F4E3D]' : 'bg-[#FDF4E6] text-[#8A5810]'"
            >
              {{ store.farmerIncomeLedger.confirmed ? '已确认上报' : '待社员确认' }}
            </span>
          </div>
          <p class="text-[11px] text-[#5A564E] leading-relaxed">
            北斗农机遥测核定您名下秸秆全量覆盖免耕面积 <strong>{{ store.farmerIncomeLedger.mu }} 亩</strong>（单亩补贴 ¥72），共计应发补贴 <strong class="font-mono text-[#B83828]">¥{{ store.farmerIncomeLedger.noTillSubsidy }}</strong>。
          </p>
          <button
            type="button"
            :disabled="store.farmerIncomeLedger.confirmed"
            @click="handleConfirmSubsidy"
            class="w-full min-h-[38px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-65 disabled:cursor-default"
            :class="store.farmerIncomeLedger.confirmed ? 'bg-[#EAF3EE] text-[#1F4E3D]' : 'bg-[#1F4E3D] text-white hover:bg-[#16382B]'"
          >
            <CheckCircle2 :size="14" aria-hidden="true" />
            <span>{{ store.farmerIncomeLedger.confirmed ? '已完成面积确认 · 等待财政直发一卡通' : '核对面积无误 · 确认申领护土补贴' }}</span>
          </button>
        </div>
      </template>

      <!-- ==================== 城市消费者视角：固碳能量环 + 公益积分兑券闭环 ==================== -->
      <template v-else>
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
              <p class="text-[10.5px] text-white/80 mt-1.5">
                相当于守护 {{ Math.max(2.4, Number((store.appConfig.userProfile.carbonSavedKg * 0.06).toFixed(1))) }} ㎡ 万年黑土耕作层 · 可用公益积分 <strong class="font-mono text-[#F5D393]">{{ store.appConfig.userProfile.points }}</strong>
              </p>
              <div v-if="store.gameStats?.plays > 0" class="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-[#E5C175]/18 border border-[#E5C175]/35 text-[9.5px] text-[#F5D393] font-semibold">
                <span>黑土守护者最高 {{ store.gameStats.bestScore }} 分 · 已同步 +{{ store.gameStats.totalCarbon }} 积分</span>
              </div>
            </div>
            <div class="w-14 h-14 rounded-full border-4 border-[#4ADE80]/30 border-t-[#4ADE80] border-r-[#F0C275] flex items-center justify-center shrink-0">
              <Leaf :size="22" class="text-[#86EFAC]" aria-hidden="true" />
            </div>
          </div>
        </div>

        <!-- 公益积分兑换助农补贴券（真实写入优惠券包，结算直接立减！） -->
        <div class="bg-white rounded-2xl p-3.5 border border-[#C88A32]/28 space-y-2.5">
          <div class="flex items-center justify-between">
            <h3 class="font-editorial text-[14px] font-bold text-[#16261F] flex items-center gap-1.5">
              <Ticket :size="14" class="text-[#C88A32]" aria-hidden="true" />
              <span>公益积分兑换助农补贴券</span>
            </h3>
            <span class="font-mono text-[10.5px] font-bold text-[#1F4E3D]">当前 {{ store.appConfig.userProfile.points }} 分</span>
          </div>
          <div class="space-y-2">
            <div
              v-for="opt in redeemOptions"
              :key="opt.id"
              class="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#1C1B18]/8 flex items-center justify-between gap-2.5"
            >
              <div class="min-w-0">
                <div class="flex items-baseline gap-1.5">
                  <span class="font-mono text-[15px] font-bold text-[#B83828]">¥{{ opt.amount }}</span>
                  <span class="text-[11.5px] font-bold text-[#16261F] truncate">{{ opt.title }}</span>
                </div>
                <div class="text-[10px] text-[#5E5950] mt-0.5">满 {{ opt.minSpend }} 可用 · {{ opt.desc }}</div>
              </div>
              <button
                type="button"
                @click="handleRedeem(opt)"
                class="shrink-0 min-h-[36px] px-3 rounded-xl bg-[#16261F] hover:bg-[#1F4E3D] text-[#F5D393] text-[10.5px] font-bold cursor-pointer transition-colors"
              >
                {{ opt.costPoints }}分兑换
              </button>
            </div>
          </div>
        </div>

        <!-- 公益勋章墙 -->
        <div class="bg-white rounded-2xl p-3.5 border border-[#1C1B18]/8 space-y-2.5">
          <div class="flex items-center justify-between">
            <h3 class="font-editorial text-[14px] font-bold text-[#16261F] flex items-center gap-1.5">
              <Award :size="14" class="text-[#C88A32]" aria-hidden="true" />
              <span>黑土守护电子勋章墙</span>
            </h3>
            <span class="font-mono text-[10px] text-[#1F4E3D] font-bold">已点亮 {{ unlockedBadgeCount }}/{{ badges.length }}</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="b in badges"
              :key="b.id"
              class="p-2.5 rounded-xl border flex items-center gap-2"
              :class="b.unlocked ? 'bg-[#FAF8F4] border-[#C88A32]/25' : 'bg-[#F3F1EC] border-[#1C1B18]/6 opacity-55'"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br text-[#F5D393] flex items-center justify-center shrink-0" :class="b.tone">
                <CheckCircle2 v-if="b.unlocked" :size="14" aria-hidden="true" />
                <Sparkles v-else :size="14" aria-hidden="true" />
              </div>
              <div class="min-w-0">
                <div class="text-[11px] font-bold text-[#16261F] truncate">{{ b.name }}</div>
                <div class="text-[9.5px] text-[#6E6960] truncate">{{ b.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 一块地 · 五笔收入交互式助农测算器（城乡共读透明收益结构） -->
      <div class="bg-white rounded-2xl p-4 border border-[#1C1B18]/8 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-editorial text-[14.5px] font-bold text-[#16261F] flex items-center gap-1">
              <TrendingUp :size="14" class="text-[#1F4E3D]" aria-hidden="true" />
              <span>一块地 · 五笔收入增收测算器</span>
            </h3>
            <p class="text-[10px] text-[#6E6960]">拖动滑块测算黑土合作社带动农户五维综合收益</p>
          </div>
        </div>

        <div class="space-y-2.5 bg-[#F8F6F1] rounded-xl p-3">
          <div>
            <label for="calc-mu-range" class="flex justify-between text-[11px] font-bold mb-1">
              <span>参与托管 / 认养面积</span>
              <span class="font-mono text-[#1F4E3D]">{{ muCount }} 亩</span>
            </label>
            <input id="calc-mu-range" v-model.number="muCount" type="range" min="1" max="50" class="w-full accent-[#1F4E3D]" />
          </div>
          <div>
            <label for="calc-year-range" class="flex justify-between text-[11px] font-bold mb-1">
              <span>保护性耕作周期</span>
              <span class="font-mono text-[#9A6518]">{{ years }} 年</span>
            </label>
            <input id="calc-year-range" v-model.number="years" type="range" min="1" max="5" class="w-full accent-[#C88A32]" />
          </div>
        </div>

        <div class="flex items-baseline justify-between px-1">
          <span class="text-[11.5px] font-semibold text-[#5A564E]">预计带动农户综合总收入</span>
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
