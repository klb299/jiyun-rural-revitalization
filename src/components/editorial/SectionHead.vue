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
  <div class="relative" :class="align === 'center' ? 'text-center' : ''">
    <span v-if="index" class="absolute -top-10 -left-3 font-editorial font-bold watermark select-none"
      style="font-size: clamp(6rem, 12vw, 12rem)">{{ index.slice(0, 2) }}</span>

    <div class="relative">
      <div class="flex items-center gap-3" :class="align === 'center' ? 'justify-center' : ''">
        <span class="eyebrow" :class="dark ? 'text-[#C88A32]!' : ''">{{ eyebrow }}</span>
        <span v-if="index" class="font-mono text-[0.625rem] tracking-[0.2em]" :class="dark ? 'text-[#F7F4EE]/80' : 'text-[#6E6960]'">{{ index }}</span>
      </div>

      <div class="mt-5 mb-6 h-[3px] w-full rounded-full"
        style="background: linear-gradient(90deg, #C88A32 0%, rgba(200,138,50,0.35) 26%, rgba(28,27,24,0.07) 60%, transparent 100%)"></div>

      <div :class="align === 'center' ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-end'">
        <h2 class="display-2" :class="[dark ? 'text-[#F7F4EE]' : 'text-[#1C1B18]', align === 'center' ? '' : 'lg:col-span-7']">
          {{ title }}
        </h2>
        <div :class="align === 'center' ? '' : 'lg:col-span-5'">
          <p v-if="description" class="body-copy" :class="dark ? 'text-[#F7F4EE]/90' : ''">{{ description }}</p>
          <RouterLink v-if="to" :to="to"
            class="inline-flex items-center gap-3 mt-4 min-h-[2.5rem] text-xs font-bold group"
            :class="dark ? 'text-[#C88A32]' : 'text-[#8A6324]'">
            <span class="link-line">{{ linkLabel }}</span>
            <span class="w-8 h-8 rounded-full grid place-items-center border border-current/30 group-hover:bg-[#C88A32] group-hover:text-[#1C1B18] group-hover:border-[#C88A32] transition-all duration-500">
              <ArrowUpRight :size="14" class="arrow-shift" />
            </span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
