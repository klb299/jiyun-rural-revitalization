<script setup>
/**
 * 3D 展台加载展签
 * 用于异步 chunk 下载期间与进入视口前的占位，避免出现一块没有信息的空白。
 * 文案由展陈页面提供，始终围绕黑土、稻作、农机与生态四条乡村振兴主线。
 */
defineProps({
  label: { type: String, default: 'PREPARING EXHIBIT' },
  note: { type: String, default: '正在布置展台' },
  variant: { type: String, default: 'busy' }, // idle 待进入视口 / busy 正在载入
  tags: { type: Array, default: () => ['黑土', '稻作', '农机', '生态'] },
  tone: { type: String, default: 'light' } // light 暖白 / ink 墨色 / gold 琥珀金
})
</script>

<template>
  <div
    class="stage-loading absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
    :class="`stage-loading--${tone}`"
  >
    <div class="stage-loading__grid pointer-events-none"></div>
    <div class="stage-loading__halo pointer-events-none"></div>

    <div class="relative z-10 flex flex-col items-center text-center px-6">
      <div class="stage-mark" :class="{ 'stage-mark--idle': variant === 'idle' }">
        <i class="stage-mark__h"></i>
        <i class="stage-mark__v"></i>
        <span class="stage-mark__box"></span>
        <span class="stage-mark__dot"></span>
      </div>

      <div class="font-mono text-[10px] tracking-[0.26em] mt-8 mb-3 opacity-60">{{ label }}</div>
      <div class="font-editorial text-lg sm:text-xl font-bold tracking-tight">{{ note }}</div>
      <div class="mt-6 h-px w-16 bg-current opacity-30"></div>

      <div class="flex flex-wrap justify-center gap-2 mt-6">
        <span
          v-for="(t, i) in tags"
          :key="t"
          class="font-mono text-[9px] tracking-[0.16em] px-2.5 py-1 rounded-full border border-current/25 opacity-70"
        >{{ String(i + 1).padStart(2, '0') }} {{ t }}</span>
      </div>
    </div>

    <div class="absolute bottom-4 left-0 right-0 text-center font-mono text-[9px] tracking-[0.22em] opacity-45">
      JILIN RURAL REVITALIZATION / DIGITAL EXHIBITION
    </div>
  </div>
</template>

<style scoped>
.stage-loading {
  color: #1C1B18;
  background: #F7F4EE;
}
.stage-loading--ink { color: #F7F4EE; background: #1C1B18; }
.stage-loading--gold { color: #1C1B18; background: linear-gradient(150deg, #E4B463 0%, #C88A32 55%, #A9701F 100%); }

.stage-loading__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(currentColor 1px, transparent 1px),
    linear-gradient(90deg, currentColor 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.055;
  mask-image: radial-gradient(ellipse at center, #000 15%, transparent 78%);
}
.stage-loading__halo {
  position: absolute;
  width: 46%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid currentColor;
  opacity: 0.12;
  box-shadow: 0 0 0 38px currentColor, 0 0 0 39px transparent;
  box-shadow: 0 0 0 1px currentColor;
  animation: halo-breathe 4.2s var(--ease-out, ease) infinite;
}
@keyframes halo-breathe {
  0%, 100% { transform: scale(0.92); opacity: 0.08; }
  50% { transform: scale(1.06); opacity: 0.2; }
}

/* 与全站方形准星指针呼应，不用圆形 spinner */
.stage-mark {
  position: relative;
  width: 54px;
  height: 54px;
  animation: mark-turn 2.8s linear infinite;
}
.stage-mark--idle { animation-duration: 6s; opacity: 0.6; }
.stage-mark__h, .stage-mark__v {
  position: absolute;
  background: currentColor;
  opacity: 0.5;
}
.stage-mark__h { left: 0; top: 26px; width: 54px; height: 1px; }
.stage-mark__v { top: 0; left: 26px; width: 1px; height: 54px; }
.stage-mark__box {
  position: absolute;
  inset: 13px;
  border: 1px solid currentColor;
}
.stage-mark__dot {
  position: absolute;
  left: 24px;
  top: 24px;
  width: 6px;
  height: 6px;
  background: currentColor;
  transform: rotate(45deg);
  animation: dot-pulse 1.4s ease-in-out infinite;
}
@keyframes mark-turn { to { transform: rotate(360deg); } }
@keyframes dot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }

@media (prefers-reduced-motion: reduce) {
  .stage-mark, .stage-loading__halo, .stage-mark__dot { animation: none; }
}
</style>
