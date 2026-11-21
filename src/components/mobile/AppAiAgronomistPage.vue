<script setup>
import { ref, computed, nextTick } from 'vue'
import {
  ChevronLeft, Sparkles, ScanLine, MessageSquare, Upload,
  CheckCircle2, Cpu, ShieldCheck, Send, Tractor, Sprout, Zap
} from 'lucide-vue-next'
import { useRuralPlatformStore } from '../../stores/ruralPlatformStore'

const props = defineProps({
  framed: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'go-village', 'open-product'])
const store = useRuralPlatformStore()

const mode = ref('vision') // 'vision' | 'chat'

/* ==================== 模式 A: AI 农情视觉扫描诊断 ==================== */
const sampleCases = [
  {
    id: 'soil',
    label: '黑土有机质快检',
    image: '/art-custom/black-soil-topdown.jpg',
    box: { x: 18, y: 20, w: 62, h: 56, label: '腐殖质团粒 · 98.2%' },
    metrics: [
      { k: '预测有机质', v: '4.81%', tone: 'text-[#1F4E3D]' },
      { k: '团粒孔隙度', v: '56.4%', tone: 'text-[#C88A32]' },
      { k: '土壤墒情', v: '优 (68%)', tone: 'text-[#2F6175]' }
    ],
    verdict: '耕作层熟化程度极佳，符合“梨树模式”保护性耕作一级黑土标准。',
    advice: '建议冬季保持秸秆全量覆盖免耕，春季采用北斗条带深松机作业以防表土风蚀。'
  },
  {
    id: 'rice',
    label: '水稻长势与叶绿素',
    image: '/art-custom/rice-tillering.jpg',
    box: { x: 24, y: 18, w: 54, h: 60, label: '健壮分蘖期 · 96.7%' },
    metrics: [
      { k: 'SPAD 叶绿素', v: '43.2', tone: 'text-[#1F4E3D]' },
      { k: '病斑检出率', v: '0.0%', tone: 'text-[#16A34A]' },
      { k: '推荐追肥', v: '无需化肥', tone: 'text-[#C88A32]' }
    ],
    verdict: '叶片翠绿挺拔，无稻瘟病与纹枯病斑特征，稻蟹共生微生态平衡良好。',
    advice: '保持浅水勤灌与间歇露田，预计 7 日后可调度多光谱无人机进行例行巡航。'
  },
  {
    id: 'corn',
    label: '玉米穗期成熟度',
    image: '/art-custom/waxy-corn.jpg',
    box: { x: 16, y: 15, w: 68, h: 66, label: '完熟黄金穗 · 97.4%' },
    metrics: [
      { k: '籽粒含水率', v: '26.8%', tone: 'text-[#C88A32]' },
      { k: '虫害风险', v: '极低 (1.2%)', tone: 'text-[#16A34A]' },
      { k: '最佳采收窗', v: '48h 内', tone: 'text-[#B83828]' }
    ],
    verdict: '苞叶微黄、籽粒饱满有光泽，已达到鲜食糯玉米最佳甜度与锁鲜窗口。',
    advice: '建议立即预约合作社采收并启动 4 小时真空锁鲜流程，同步生成一袋一码溯源批次。'
  }
]

const activeSample = ref(sampleCases[0])
const customImageUrl = ref('')
const isScanning = ref(false)
const scanDone = ref(true)

const displayImage = computed(() => customImageUrl.value || activeSample.value.image)

function runVisionScan(sample = null) {
  if (sample) {
    customImageUrl.value = ''
    activeSample.value = sample
  }
  isScanning.value = true
  scanDone.value = false
  window.setTimeout(() => {
    isScanning.value = false
    scanDone.value = true
  }, 1150)
}

function onFileUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    customImageUrl.value = String(reader.result || '')
    runVisionScan()
  }
  reader.readAsDataURL(file)
}

/* ==================== 模式 B: AI 农情问答助手（接入真实 Store 数据） ==================== */
const chatInput = ref('')
const chatBodyRef = ref(null)
const isTyping = ref(false)
const quickPrompts = [
  '现在在售哪些黑土特产？',
  '北斗农机当前作业状态？',
  '梨树模式怎么保护黑土？',
  '怎么申请保护性耕作补贴？'
]

const messages = ref([
  {
    id: 'ai-0',
    role: 'ai',
    text: '你好！我是「吉韵禾野」AI 智慧农艺师，已接入吉林松辽黑土带实时农情遥测与集市数据库。你可以问我农技病虫害、实时农机调度、补贴政策或产地风物推荐！'
  }
])

function buildSmartReply(q) {
  const lower = q.toLowerCase()
  if (lower.includes('特产') || lower.includes('大米') || lower.includes('买') || lower.includes('在售')) {
    const names = store.activeProducts.slice(0, 3).map((p) => `「${p.name}」¥${p.price}`).join('、')
    return `当前集市共有 ${store.activeProducts.length} 款地理标志农产品在售，热销推荐：${names}。平均 78% 以上收益直达产地合作社，结算还可使用满 60 减 10 助农补贴券。`
  }
  if (lower.includes('农机') || lower.includes('北斗') || lower.includes('拖拉机')) {
    const working = store.machinery.filter((m) => m.status === '作业中')
    return `当前共有 ${working.length}/${store.machinery.length} 台智能装备在线作业中：${working.map((m) => `${m.name}（${m.area}·${m.task}）`).join('；')}。定位精度 ±2.5cm，需要预约作业可直接前往「村务」提交农机预约。`
  }
  if (lower.includes('梨树') || lower.includes('黑土') || lower.includes('保护')) {
    return '“梨树模式”核心是秸秆全量覆盖还田 + 条带免耕播种：把秸秆像棉被一样盖在黑土表面，可减少 70% 以上风蚀水蚀，示范田表层有机质已提升至 4.82%，保墒蓄水效果显著。'
  }
  if (lower.includes('补贴') || lower.includes('政策')) {
    return '2026 年度黑土保护性耕作补贴线上确认通道已开启！凡采用秸秆覆盖免耕的种植户与合作社，可在 App「村务」板块核对北斗农机作业面积并提交确认，后台审核通过后直发补贴账户。'
  }
  if (lower.includes('查干湖') || lower.includes('气温') || lower.includes('天气')) {
    const cgh = store.liveCams.find((c) => c.id === 'cam-2')
    return `查干湖西岸当前实时气温 ${cgh?.temp || '-11.8°C'}，${cgh?.soilMoisture || '冰厚 42cm'}，${cgh?.wind || '微风 2级'}，非常适合冰下冬捕作业。你可以直接在首页「黑土慢直播」观看实时实景画面！`
  }
  return `已收到你的农情咨询「${q}」。结合当前 ${store.appConfig.solarTerm} 物候与松辽示范带实测墒情（68%），建议做好设施大棚夜间保温与粮仓通风降湿；如需农技员上门或预约北斗农机，可一键前往「村务直通」提交直报。`
}

async function sendChat(text = null) {
  const q = (text ?? chatInput.value).trim()
  if (!q || isTyping.value) return
  chatInput.value = ''
  messages.value.push({ id: `u-${Date.now()}`, role: 'user', text: q })
  isTyping.value = true
  await nextTick()
  if (chatBodyRef.value) chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight

  const fullReply = buildSmartReply(q)
  messages.value.push({ id: `ai-${Date.now()}`, role: 'ai', text: '' })
  const targetIdx = messages.value.length - 1

  let i = 0
  const typer = window.setInterval(() => {
    i += 3
    if (messages.value[targetIdx]) {
      messages.value[targetIdx].text = fullReply.slice(0, i)
    }
    if (chatBodyRef.value) chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    if (i >= fullReply.length) {
      clearInterval(typer)
      isTyping.value = false
    }
  }, 22)
}
</script>

<template>
  <div
    class="absolute inset-0 z-40 bg-[#F7F3EA] text-[#1C1B18] flex flex-col overflow-hidden"
    :class="framed ? 'pt-11' : ''"
    style="background-image: linear-gradient(180deg, rgba(247,243,234,0.22), rgba(247,243,234,0.45)), url('/art-custom/mobile-app-bg.jpg'); background-size: cover; background-position: center;"
  >
    <!-- 顶栏 -->
    <div class="shrink-0 h-12 px-3.5 bg-[#16261F] text-[#F7F4EE] flex items-center justify-between gap-2">
      <button
        type="button"
        @click="emit('close')"
        class="h-8 px-2.5 rounded-full bg-white/12 text-[11.5px] font-bold flex items-center gap-0.5 cursor-pointer"
      >
        <ChevronLeft :size="14" />
        <span>返回</span>
      </button>
      <div class="flex items-center gap-1.5">
        <Sparkles :size="14" class="text-[#F0C275]" />
        <span class="font-editorial text-[14.5px] font-bold">AI 智慧农艺师</span>
      </div>
      <span class="font-mono text-[9.5px] px-2 py-0.5 rounded-full bg-[#4ADE80]/20 text-[#86EFAC] font-bold">VISION AI</span>
    </div>

    <!-- 模式双切 -->
    <div class="shrink-0 px-4 pt-3 pb-2 bg-[#F6F2E9]">
      <div class="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-white border border-[#1C1B18]/10">
        <button
          type="button"
          @click="mode = 'vision'"
          class="py-2 rounded-xl text-[11.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          :class="mode === 'vision' ? 'bg-[#16261F] text-[#F0C275] shadow-xs' : 'text-[#5A564E]'"
        >
          <ScanLine :size="13" />
          <span>AI 拍照诊断</span>
        </button>
        <button
          type="button"
          @click="mode = 'chat'"
          class="py-2 rounded-xl text-[11.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          :class="mode === 'chat' ? 'bg-[#16261F] text-[#F0C275] shadow-xs' : 'text-[#5A564E]'"
        >
          <MessageSquare :size="13" />
          <span>农情智能问答</span>
        </button>
      </div>
    </div>

    <!-- ==================== 模式 A: AI 视觉扫描 ==================== -->
    <div v-if="mode === 'vision'" class="flex-1 overflow-y-auto px-4 pb-5 space-y-3.5 app-scroll">
      <!-- 视觉识别取景框 -->
      <div class="relative rounded-[1.4rem] overflow-hidden h-52 bg-[#122019] shadow-lg border border-[#1F4E3D]/30">
        <img :src="displayImage" alt="AI 农情诊断样本" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25"></div>

        <!-- 四角科技取景框 -->
        <div class="pointer-events-none absolute inset-3 border border-white/18 rounded-xl"></div>

        <!-- 扫描激光网 -->
        <div v-if="isScanning" class="absolute inset-0 bg-[#0D1E16]/45 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center">
          <div class="ai-laser absolute inset-x-3 h-0.5 bg-[#4ADE80] shadow-[0_0_16px_#4ADE80]"></div>
          <div class="px-3 py-1 rounded-full bg-black/65 border border-[#4ADE80]/50 font-mono text-[10.5px] text-[#86EFAC] flex items-center gap-1.5">
            <Cpu :size="12" class="animate-spin" />
            <span>NEURAL AGRI-NET ANALYZING…</span>
          </div>
        </div>

        <!-- AI 识别目标检测框 -->
        <div
          v-else-if="scanDone"
          class="pointer-events-none absolute border-2 border-[#4ADE80] rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.35)] transition-all duration-500"
          :style="{ left: `${activeSample.box.x}%`, top: `${activeSample.box.y}%`, width: `${activeSample.box.w}%`, height: `${activeSample.box.h}%` }"
        >
          <span class="absolute -top-5 left-0 px-2 py-0.5 rounded-md bg-[#4ADE80] text-[#0D2118] font-mono text-[9.5px] font-bold whitespace-nowrap shadow-sm">
            {{ activeSample.box.label }}
          </span>
        </div>

        <!-- 右下角上传实拍按钮 -->
        <label class="absolute bottom-2.5 right-2.5 z-10 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-black/80">
          <Upload :size="11" />
          <span>上传田间实拍</span>
          <input type="file" accept="image/*" class="hidden" @change="onFileUpload" />
        </label>
      </div>

      <!-- 样本快切按钮 -->
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="s in sampleCases"
          :key="s.id"
          type="button"
          @click="runVisionScan(s)"
          class="py-2 px-1.5 rounded-xl border text-[10.5px] font-bold cursor-pointer transition-all truncate"
          :class="!customImageUrl && activeSample.id === s.id
            ? 'bg-[#16261F] text-[#F0C275] border-[#16261F]'
            : 'bg-white text-[#3E3B35] border-[#1C1B18]/10'"
        >
          {{ s.label }}
        </button>
      </div>

      <!-- AI 结构化诊断报告卡 -->
      <div class="bg-white rounded-2xl p-3.5 border border-[#1C1B18]/8 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-[12.5px] font-bold text-[#16261F] flex items-center gap-1.5">
            <CheckCircle2 :size="14" class="text-[#22C55E]" />
            <span>AI 多光谱视觉诊断报告</span>
          </span>
          <span class="font-mono text-[9.5px] text-[#6E6960]">0.38s</span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center bg-[#F8F6F1] rounded-xl p-2.5">
          <div v-for="m in activeSample.metrics" :key="m.k">
            <div class="text-[9.5px] text-[#6E6960]">{{ m.k }}</div>
            <div class="font-mono text-[13px] font-bold mt-0.5" :class="m.tone">{{ m.v }}</div>
          </div>
        </div>

        <div class="space-y-1.5 text-[11.5px] leading-relaxed">
          <div class="text-[#1C1B18]"><strong>诊断结论：</strong>{{ activeSample.verdict }}</div>
          <div class="p-2.5 rounded-xl bg-[#EAF3EE] text-[#1F4E3D]">
            <strong>绿色处方：</strong>{{ activeSample.advice }}
          </div>
        </div>

        <button
          type="button"
          @click="emit('go-village')"
          class="w-full h-9.5 rounded-xl bg-[#1F4E3D] text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Tractor :size="13" />
          <span>一键预约北斗植保机 / 同步农技员</span>
        </button>
      </div>
    </div>

    <!-- ==================== 模式 B: 智能农情对话 ==================== -->
    <div v-else class="flex-1 flex flex-col min-h-0">
      <div ref="chatBodyRef" class="flex-1 overflow-y-auto px-4 py-2 space-y-3 app-scroll">
        <div
          v-for="m in messages"
          :key="m.id"
          class="flex"
          :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[84%] rounded-2xl px-3.5 py-2.5 text-[11.5px] leading-relaxed shadow-2xs"
            :class="m.role === 'user'
              ? 'bg-[#16261F] text-[#F7F4EE] rounded-br-sm'
              : 'bg-white border border-[#1C1B18]/8 text-[#1C1B18] rounded-bl-sm'"
          >
            <div v-if="m.role === 'ai'" class="flex items-center gap-1 text-[9.5px] font-bold text-[#1F4E3D] mb-1">
              <Sparkles :size="10" class="text-[#C88A32]" />
              <span>吉韵 AI 农艺师</span>
            </div>
            <div>{{ m.text }}</div>
          </div>
        </div>
      </div>

      <!-- 快捷提问胶囊 -->
      <div class="px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          v-for="q in quickPrompts"
          :key="q"
          type="button"
          @click="sendChat(q)"
          class="shrink-0 px-2.5 py-1 rounded-full bg-white border border-[#C88A32]/30 text-[10.5px] font-semibold text-[#16261F] cursor-pointer hover:bg-[#FDF4E6]"
        >
          {{ q }}
        </button>
      </div>

      <!-- 底部输入栏 -->
      <form @submit.prevent="sendChat()" class="shrink-0 p-3 bg-white border-t border-[#1C1B18]/8 flex items-center gap-2">
        <input
          v-model="chatInput"
          type="text"
          placeholder="问农技、查实时农机、查特产或补贴政策…"
          class="flex-1 h-9.5 px-3.5 rounded-full bg-[#F6F2E9] text-[11.5px] focus:outline-none focus:ring-1 focus:ring-[#1F4E3D]"
        />
        <button
          type="submit"
          class="w-9.5 h-9.5 rounded-full bg-[#16261F] text-[#F0C275] flex items-center justify-center cursor-pointer shrink-0"
          aria-label="发送提问"
        >
          <Send :size="14" />
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes aiLaser {
  0%, 100% { top: 10%; }
  50% { top: 88%; }
}
.ai-laser {
  animation: aiLaser 1.1s ease-in-out infinite;
}
.app-scroll::-webkit-scrollbar { width: 0; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
</style>
