<script setup>
/**
 * 田野实景横幅。
 * 一处组件复用到助农与痛点各页，避免全站只剩程序化图形带来的 AI 感。
 * 所有图片都是产地示意，不对应吉林具体地块，来源见 README。
 */
defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  label: { type: String, required: true },
  note: { type: String, required: true },
  credit: { type: String, default: '实景示意 · UNSPLASH' }
})
</script>

<template>
  <figure class="relative overflow-hidden rounded-[1.625rem] border border-[#1C1B18]/10 bg-[#FFFDF9]">
    <div data-reveal-img class="aspect-[16/6] sm:aspect-[16/5] overflow-hidden">
      <img :src="src" :alt="alt" class="w-full h-full object-cover" loading="lazy" />
    </div>
    <figcaption class="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 px-5 sm:px-6 py-4">
      <div>
        <div class="font-mono text-[0.5625rem] tracking-[0.18em] text-[#8A6324] mb-1">{{ label }}</div>
        <p class="text-[0.6875rem] leading-[1.8] text-[#5A564E]">{{ note }}</p>
      </div>
      <span class="font-mono text-[0.5625rem] tracking-[0.14em] text-[#6E6960] shrink-0">{{ credit }}</span>
    </figcaption>
  </figure>
</template>
