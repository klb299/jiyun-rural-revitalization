<script setup>
defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '展陈图版' },
  caption: { type: String, default: '' },
  index: { type: String, default: '' },
  credit: { type: String, default: '' },
  ratio: { type: String, default: 'aspect-[4/3]' },
  dark: { type: Boolean, default: false },
  contain: { type: Boolean, default: false }
})
</script>

<template>
  <figure class="group">
    <div
      class="relative overflow-hidden rounded-[1.35rem] border shadow-[0_22px_50px_-30px_rgba(14,38,29,0.32)]"
      :class="[ratio, dark ? 'border-white/14 bg-[#0E261D]' : 'border-[#0E261D]/10 bg-[#EAF1EC]']"
    >
      <img
        :src="src"
        :alt="alt"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        :class="contain ? 'object-contain!' : ''"
      />
      <span
        v-if="index"
        class="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-[#0E261D]/82 text-[#E5C175] backdrop-blur-sm border border-[#E5C175]/28 font-mono text-[0.625rem] font-semibold tracking-[0.14em]"
      >
        {{ index }}
      </span>
    </div>
    <figcaption v-if="caption || credit" class="mt-3.5 flex flex-wrap items-start justify-between gap-3 px-0.5">
      <p class="text-xs leading-relaxed max-w-md" :class="dark ? 'text-[#D7E4DD]/85' : 'text-[#566E64]'">{{ caption }}</p>
      <span v-if="credit" class="font-mono text-[0.65rem] tracking-[0.12em]" :class="dark ? 'text-[#E5C175]/80' : 'text-[#7F5B17]'">{{ credit }}</span>
    </figcaption>
  </figure>
</template>
