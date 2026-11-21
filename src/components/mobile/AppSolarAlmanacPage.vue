<script setup>
import { ref, computed } from 'vue'
import { ChevronLeft, Sun, Snowflake, Sprout, Wheat, Sparkles, ChevronRight } from 'lucide-vue-next'
import { useRuralPlatformStore } from '../../stores/ruralPlatformStore'

const props = defineProps({
  framed: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'open-product'])

const store = useRuralPlatformStore()
const activeSeason = ref('winter')

const seasons = [
  {
    id: 'spring',
    label: '春生',
    term: '谷雨 · 北斗精播',
    dates: '4月 — 5月',
    image: '/art-custom/changchun-tractor.jpg',
    icon: Sprout,
    accent: '#2E5A44',
    summary: '松辽平原地表解冻回温，北斗无人播种机沿秸秆行间精准下种，护住黑土春季宝贵底墒。',
    tasks: ['秸秆条带归行清理，免翻耕防风蚀', '稻田集中温室育秧，控温培育壮苗', '北斗 RTK 地基增强站开机校准'],
    productId: 'prod-1'
  },
  {
    id: 'summer',
    label: '夏长',
    term: '小暑 · 稻蟹共生',
    dates: '6月 — 8月',
    image: '/art-custom/rice-tillering.jpg',
    icon: Sun,
    accent: '#1F4E3D',
    summary: '雨热同季，玉米抽雄吐丝、水稻进入拔节孕穗期。多光谱无人机定时巡航，监测叶绿素与病虫害。',
    tasks: ['投放生态河蟹苗，实现一水两用零农药', '光伏温室大棚智能卷帘调光控湿', '玉米青纱帐水肥一体化精准滴灌'],
    productId: 'prod-3'
  },
  {
    id: 'autumn',
    label: '秋收',
    term: '寒露 · 金穗归仓',
    dates: '9月 — 10月',
    image: '/art-hd/jilin-harvest.jpg',
    icon: Wheat,
    accent: '#C88A32',
    summary: '180 天漫长灌浆迎来丰收季，联合收割机协同作业，新粮直接入驻充氮恒温数字粮仓低温慢烘。',
    tasks: ['九台贡米头茬收割并生成一袋一码溯源', '秸秆粉碎全量还田，为黑土织就越冬棉被', '非转基因高蛋白大豆分选入罐直发'],
    productId: 'prod-5'
  },
  {
    id: 'winter',
    label: '冬藏',
    term: '小雪 · 护土冬捕',
    dates: '11月 — 次年2月',
    image: '/art-hd/chagan-winter.jpg',
    icon: Snowflake,
    accent: '#3B6E82',
    summary: '千里黑土休养生息，松原查干湖冰封如玉。国家级非遗冬捕开启，冰雪经济与冷链物流点亮冬日乡野。',
    tasks: ['查干湖祭湖醒网、冰下走网“抓大放小”', '恒温粮仓与光伏温室防寒巡检预警', '黑土冻融交替休耕，蓄积来年丰收底气'],
    productId: 'prod-2'
  }
]

const current = computed(() => seasons.find((s) => s.id === activeSeason.value) || seasons[3])
const seasonalProduct = computed(() => store.products.find((p) => p.id === current.value.productId) || store.activeProducts[0])
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
      <span class="font-editorial text-[14.5px] font-bold text-[#16261F]">二十四节气 · 吉林农时谱</span>
      <span class="font-mono text-[10px] text-[#C88A32] font-bold">24 TERMS</span>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 app-scroll">
      <!-- 四季切换胶囊 -->
      <div class="grid grid-cols-4 gap-1.5 bg-white p-1.5 rounded-2xl border border-[#1C1B18]/8">
        <button
          v-for="s in seasons"
          :key="s.id"
          type="button"
          @click="activeSeason = s.id"
          class="py-2 rounded-xl text-[11.5px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
          :class="activeSeason === s.id ? 'bg-[#16261F] text-[#F0C275] shadow-xs' : 'text-[#5A564E]'"
        >
          <component :is="s.icon" :size="12" />
          <span>{{ s.label }}</span>
        </button>
      </div>

      <!-- 节气主画报 -->
      <div class="relative rounded-[1.5rem] overflow-hidden h-52 shadow-lg">
        <img :src="current.image" :alt="current.term" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#16261F]/92 via-[#16261F]/25 to-transparent"></div>
        <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 text-[#16261F] font-mono text-[10px] font-bold">
          {{ current.dates }}
        </span>
        <div class="absolute bottom-4 left-4 right-4 text-white">
          <div class="font-mono text-[9.5px] tracking-[0.2em] text-[#F0C275]">JILIN AGRICULTURAL ALMANAC</div>
          <h2 class="font-editorial text-[22px] font-bold mt-0.5">{{ current.term }}</h2>
          <p class="text-[11px] text-white/85 mt-1 leading-relaxed">{{ current.summary }}</p>
        </div>
      </div>

      <!-- 当季农事指南 -->
      <div class="bg-white rounded-2xl p-4 border border-[#1C1B18]/8 space-y-2.5">
        <div class="flex items-center justify-between">
          <h3 class="font-editorial text-[14px] font-bold text-[#1C1B18]">当季黑土农事重点</h3>
          <Sparkles :size="14" class="text-[#C88A32]" />
        </div>
        <div class="space-y-2">
          <div v-for="(t, i) in current.tasks" :key="i" class="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8F6F1]">
            <span class="w-5 h-5 rounded-full bg-[#1F4E3D] text-[#F0C275] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
              {{ i + 1 }}
            </span>
            <span class="text-[11.5px] text-[#3E3B35] leading-snug">{{ t }}</span>
          </div>
        </div>
      </div>

      <!-- 应季推荐风物 -->
      <div
        v-if="seasonalProduct"
        @click="emit('open-product', seasonalProduct)"
        class="bg-white rounded-2xl p-3 border border-[#C88A32]/30 flex items-center gap-3 shadow-xs cursor-pointer"
      >
        <img :src="seasonalProduct.image" :alt="seasonalProduct.name" class="w-16 h-16 rounded-xl object-cover shrink-0" />
        <div class="flex-1 min-w-0">
          <span class="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[#FDF4E6] text-[#9A6518]">应季精选风物</span>
          <div class="text-[13px] font-bold text-[#1C1B18] truncate mt-1">{{ seasonalProduct.name }}</div>
          <div class="font-mono text-[13px] font-bold text-[#B83828] mt-0.5">¥{{ seasonalProduct.price }} <span class="font-sans text-[10px] text-[#6E6960] font-normal">· {{ seasonalProduct.origin }}</span></div>
        </div>
        <ChevronRight :size="16" class="text-[#8E887E]" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-scroll::-webkit-scrollbar { width: 0; }
</style>
