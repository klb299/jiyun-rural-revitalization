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
    <div class="bezel" :class="dark ? 'bezel--ink' : ''">
      <div class="bezel-core">
        <div class="relative" :class="ratio">
          <img :src="src" :alt="alt" loading="lazy"
            class="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-[1.05]"
            :class="contain ? 'object-contain!' : ''" />
          <span v-if="index"
            class="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-[#C88A32] text-[#1C1B18] font-mono text-[10px] font-bold tracking-[0.16em] shadow-lg">
            {{ index }}
          </span>
          <div class="absolute inset-4 border border-[#1C1B18]/10 rounded-2xl pointer-events-none"></div>
        </div>
      </div>
    </div>
    <figcaption class="mt-4 flex flex-wrap items-start justify-between gap-3">
      <p class="caption max-w-md" :class="dark ? 'text-[#F7F4EE]/80' : ''">{{ caption }}</p>
      <span v-if="credit" class="caption" :class="dark ? 'text-[#F7F4EE]/80' : ''">{{ credit }}</span>
    </figcaption>
  </figure>
</template>
