<script setup>
import { ref, computed } from 'vue'
import { MapPin, ChevronRight, Radio, Sparkles } from 'lucide-vue-next'
import { useRuralPlatformStore } from '../../stores/ruralPlatformStore'

const emit = defineEmits(['open-product', 'open-cam'])
const store = useRuralPlatformStore()

// 坐标精准对齐 /art-custom/jilin-origin-map.jpg 手绘青绿山水插画的四大实景地标
const zones = [
  {
    id: 'chagan',
    name: '松原 · 查干湖',
    short: '查干湖',
    tag: '非遗冬捕',
    metric: '冰下鲜捕 · 生态疏网',
    x: 22,
    y: 26,
    color: '#2F6E7A',
    productId: 'prod-2',
    camId: 'cam-2'
  },
  {
    id: 'jiutai',
    name: '长春 · 九台稻区',
    short: '九台稻区',
    tag: '核心黑土',
    metric: '有机质 4.82% · 180天灌浆',
    x: 50,
    y: 48,
    color: '#1F4E3D',
    productId: 'prod-1',
    camId: 'cam-1'
  },
  {
    id: 'lishu',
    name: '四平 · 梨树县',
    short: '梨树免耕',
    tag: '保护性耕作',
    metric: '秸秆覆盖 · 黄金玉米带',
    x: 27,
    y: 78,
    color: '#C88A32',
    productId: 'prod-3',
    camId: 'cam-3'
  },
  {
    id: 'changbai',
    name: '白山 · 长白山',
    short: '长白山珍',
    tag: '原始林海',
    metric: '12年林下参 · 自然散播',
    x: 82,
    y: 44,
    color: '#B83828',
    productId: 'prod-4',
    camId: 'cam-4'
  }
]

const activeId = ref('jiutai')
const currentZone = computed(() => zones.find((z) => z.id === activeId.value) || zones[1])
const currentProduct = computed(() => store.products.find((p) => p.id === currentZone.value.productId) || store.activeProducts[0])
</script>

<template>
  <div class="bg-white/95 backdrop-blur-sm rounded-[1.45rem] border border-[#C88A32]/22 p-3.5 shadow-[0_10px_28px_-14px_rgba(22,38,31,0.18)] space-y-3">
    <div class="flex items-center justify-between gap-2">
      <div>
        <h3 class="font-editorial text-[15px] font-bold text-[#16261F] flex items-center gap-1.5">
          <span>吉林四大风物产区图鉴</span>
          <Sparkles :size="12" class="text-[#C88A32]" />
        </h3>
        <p class="text-[10px] text-[#6E6960]">青绿山水手绘产区 · 点击地标直达风物与慢直播</p>
      </div>
      <span class="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FDF4E6] text-[#9A6518] border border-[#C88A32]/25">4 ZONES</span>
    </div>

    <!-- 新中式青绿山水手绘产区交互画卷 -->
    <div class="relative h-48 rounded-2xl overflow-hidden border border-[#C88A32]/30 shadow-inner">
      <img
        src="/art-custom/jilin-origin-map.jpg"
        alt="吉林四大风物产区青绿山水手绘图鉴"
        class="w-full h-full object-cover"
      />
      <!-- 细腻金边内框与微渐变压角 -->
      <div class="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/35 rounded-2xl"></div>
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#16261F]/28 via-transparent to-transparent"></div>

      <!-- 4 个可点击脉冲产区坐标 -->
      <button
        v-for="z in zones"
        :key="z.id"
        type="button"
        @click="activeId = z.id"
        class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 cursor-pointer group z-10"
        :style="{ left: `${z.x}%`, top: `${z.y}%` }"
      >
        <span class="relative flex items-center justify-center">
          <span
            v-if="activeId === z.id"
            class="absolute w-7 h-7 rounded-full animate-ping opacity-45"
            :style="{ backgroundColor: z.color }"
          ></span>
          <span
            class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-transform"
            :class="activeId === z.id ? 'scale-125' : 'scale-100'"
            :style="{ backgroundColor: z.color }"
          ></span>
        </span>
        <span
          class="px-2 py-0.5 rounded-full text-[9.5px] font-bold shadow-md whitespace-nowrap transition-all backdrop-blur-md"
          :class="activeId === z.id
            ? 'bg-[#16261F]/95 text-[#F5D393] ring-1 ring-[#F0C275]/60 scale-105'
            : 'bg-white/90 text-[#16261F] border border-[#1C1B18]/12'"
        >
          {{ z.short }}
        </span>
      </button>
    </div>

    <!-- 当前选中产区的风物联展条 -->
    <div v-if="currentProduct" class="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-[#FAF7F0] to-[#F3EFE4] border border-[#C88A32]/20">
      <img :src="currentProduct.image" :alt="currentProduct.name" class="w-13 h-13 rounded-xl object-cover shrink-0 ring-1 ring-[#1C1B18]/10" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1 min-w-0">
          <span class="text-[10.5px] font-bold text-[#16261F] flex items-center gap-0.5 truncate">
            <MapPin :size="10" class="text-[#C88A32] shrink-0" />
            <span class="truncate">{{ currentZone.name }}</span>
          </span>
          <span class="shrink-0 whitespace-nowrap text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-[#EAF3EE] text-[#1F4E3D] leading-none">{{ currentZone.tag }}</span>
        </div>
        <div class="text-[11.5px] font-bold text-[#1C1B18] truncate mt-0.5">{{ currentProduct.name }}</div>
        <div class="text-[9.5px] text-[#6E6960] truncate">{{ currentZone.metric }}</div>
      </div>
      <div class="flex flex-col gap-1 shrink-0">
        <button
          type="button"
          @click="emit('open-product', currentProduct)"
          class="px-2.5 py-1 rounded-lg bg-[#1F4E3D] text-white text-[10px] font-bold flex items-center justify-center gap-0.5 cursor-pointer shadow-2xs"
        >
          <span>¥{{ currentProduct.price }}</span>
          <ChevronRight :size="10" />
        </button>
        <button
          type="button"
          @click="emit('open-cam', currentZone.camId)"
          class="px-2.5 py-1 rounded-lg bg-white border border-[#B83828]/25 text-[#B83828] text-[9.5px] font-bold flex items-center justify-center gap-0.5 cursor-pointer"
        >
          <Radio :size="9.5" />
          <span>看直播</span>
        </button>
      </div>
    </div>
  </div>
</template>
