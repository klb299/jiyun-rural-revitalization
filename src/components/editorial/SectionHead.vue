<script setup>
import { ArrowUpRight } from 'lucide-vue-next'

defineProps({
  index: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dark: { type: Boolean, default: false },
  align: { type: String, default: 'left' },
  to: { type: String, default: '' },
  linkLabel: { type: String, default: '查看全部' }
})
</script>

<template>
  <header class="relative" :class="align === 'center' ? 'text-center' : ''">
    <div class="flex flex-wrap items-center gap-3" :class="align === 'center' ? 'justify-center' : ''">
      <span v-if="eyebrow" class="eyebrow" :class="dark ? 'text-[#E5C175]!' : ''">{{ eyebrow }}</span>
      <span v-if="index" class="font-mono text-[0.6875rem] tracking-[0.16em]" :class="dark ? 'text-[#C4D6CD]/80' : 'text-[#566E64]'">
        {{ index }}
      </span>
    </div>

    <div
      class="mt-4 mb-5 h-px w-full"
      :style="{
        background: dark
          ? 'linear-gradient(90deg, rgba(229,193,117,0.65) 0%, rgba(229,193,117,0.18) 38%, transparent 100%)'
          : 'linear-gradient(90deg, rgba(31,84,64,0.45) 0%, rgba(200,155,69,0.35) 32%, rgba(14,38,29,0.06) 72%, transparent 100%)'
      }"
    ></div>

    <div :class="align === 'center' ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-end'">
      <h2
        class="display-2"
        :class="[dark ? 'text-[#F7FAF8]' : 'text-[#10241C]', align === 'center' ? '' : 'lg:col-span-7']"
      >
        {{ title }}
      </h2>
      <div :class="align === 'center' ? 'mt-3' : 'lg:col-span-5'">
        <p v-if="description" class="body-copy text-[0.92rem]" :class="dark ? 'text-[#D7E4DD]/90' : ''">
          {{ description }}
        </p>
        <RouterLink
          v-if="to"
          :to="to"
          class="inline-flex items-center gap-2.5 mt-4 px-4 py-2 rounded-full border text-xs font-bold group transition-colors duration-250"
          :class="dark
            ? 'border-[#E5C175]/35 text-[#E5C175] hover:bg-[#E5C175] hover:text-[#0E261D]'
            : 'border-[#0E261D]/16 text-[#1A4333] hover:bg-[#0E261D] hover:text-[#E5C175] hover:border-[#0E261D]'"
        >
          <span>{{ linkLabel }}</span>
          <ArrowUpRight :size="14" aria-hidden="true" class="arrow-shift" />
        </RouterLink>
      </div>
    </div>
  </header>
</template>
