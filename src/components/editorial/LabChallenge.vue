<script setup>
/**
 * 互动实验挑战卡（科普实验室四关 / 最后一公里三关共用）。
 * 把「拖滑块看读数」变成有目标、有进度、有徽章收集的小游戏。
 * 只用全站既有色板与字体，不做卡通化游戏 UI；所有阈值都是教学演示条件，
 * 不代表真实产量或统计口径。
 */
import { Check } from 'lucide-vue-next'

defineProps({
  eyebrow: { type: String, default: 'MISSION / 本关任务' },
  goal: { type: String, required: true },
  hint: { type: String, required: true },
  current: { type: Number, required: true },
  total: { type: Number, required: true },
  done: { type: Boolean, default: false },
  badges: { type: Array, required: true }, // [{ id, no, name, done }]
  badgeLabel: { type: String, default: 'OBSERVER BADGES / 观察员徽章' },
  allDone: { type: Boolean, default: false },
  allDoneText: { type: String, default: '四关集齐 · 黑土观察员' }
})
</script>

<template>
  <div class="lab-card relative overflow-hidden rounded-[1.625rem] border bg-[#FFFDF9] p-5 sm:p-6 transition-colors duration-500"
    :class="done ? 'border-[#C88A32]/55' : 'border-[#1C1B18]/10'">
    <span class="lab-sweep absolute top-0 left-0 right-0 h-[2px] bg-[#C88A32] origin-left pointer-events-none"
      :style="{ transform: done ? 'scaleX(1)' : 'scaleX(0)' }"></span>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      <div class="lg:col-span-7">
        <div class="font-mono text-[0.5625rem] tracking-[0.2em] text-[#8A6324] mb-2">{{ eyebrow }}</div>
        <div class="font-editorial text-lg sm:text-xl font-bold text-[#1C1B18]">{{ goal }}</div>
        <p class="text-[0.6875rem] leading-[1.85] text-[#5A564E] mt-2">{{ hint }}</p>

        <div class="flex items-center gap-1.5 mt-4">
          <span v-for="i in total" :key="i"
            class="lab-cell h-2.5 flex-1 max-w-[3.375rem] rounded-full"
            :class="i <= current ? 'bg-[#C88A32] lab-cell--on' : 'bg-[#EFECE6]'"></span>
          <span class="font-mono text-[0.625rem] text-[#6E6960] ml-2 shrink-0">{{ current }} / {{ total }}</span>
        </div>
      </div>

      <div class="lg:col-span-5">
        <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#6E6960] mb-2">{{ badgeLabel }}</div>
        <div class="grid gap-2" :style="{ gridTemplateColumns: `repeat(${badges.length}, minmax(0, 1fr))` }">
          <div v-for="b in badges" :key="b.id"
            class="lab-badge rounded-xl border px-2 py-2.5 text-center transition-all duration-500"
            :class="b.done
              ? 'border-[#C88A32]/70 bg-[#C88A32]/14 text-[#A9701F] lab-badge--on'
              : 'border-[#1C1B18]/10 bg-[#EFECE6]/60 text-[#6E6960]'">
            <div class="font-mono text-[0.5625rem] tracking-[0.14em]">{{ b.no }}</div>
            <div class="text-[0.625rem] font-bold mt-1 truncate">{{ b.name }}</div>
          </div>
        </div>
        <div v-if="allDone"
          class="mt-3 rounded-xl bg-[#1C1B18] text-[#F7F4EE] px-3 py-2.5 text-[0.6875rem] font-bold flex items-center gap-2">
          <Check :size="14" class="text-[#C88A32] shrink-0" /> {{ allDoneText }}
        </div>
      </div>
    </div>
  </div>
</template>
