<script setup>
import { ArrowUpRight } from 'lucide-vue-next'

defineProps({
  index: { type: String, default: '' },
  tag: { type: String, default: '' },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  image: { type: String, default: '' },
  to: { type: String, default: '' },
  cta: { type: String, default: '进入展厅' },
  meta: { type: String, default: '' },
  dark: { type: Boolean, default: false }
})
</script>

<template>
  <RouterLink :to="to" class="group block h-full rounded-[1.875rem] overflow-hidden z-card lift"
    :class="dark ? 'card-ink' : 'card-linen'">
    <div v-if="image" data-reveal-img class="relative m-2.5 rounded-[1.375rem] overflow-hidden bg-[#EFECE6]">
      <img :src="image" :alt="title" loading="lazy" class="w-full aspect-[16/10] object-cover transition-transform duration-[1.4s] group-hover:scale-[1.07]" />
      <span class="absolute bottom-3 right-4 font-mono text-[0.625rem] tracking-[0.2em] px-2 py-1 rounded-full bg-[#1C1B18]/80 text-[#F7F4EE]">{{ index }}</span>
    </div>
    <div class="relative p-6 sm:p-8">
      <span class="absolute -top-2 right-5 font-editorial font-bold select-none pointer-events-none"
        :class="dark ? 'text-[#F7F4EE]/8' : 'text-[#1C1B18]/7'"
        style="font-size: 5.5rem; line-height: 1">{{ index.slice(-2) }}</span>
      <div class="relative flex flex-wrap items-center gap-x-3 gap-y-2 mb-5 pr-16">
        <span class="font-mono text-[0.625rem] tracking-[0.2em] px-2.5 py-1 rounded-full"
          :class="dark ? 'bg-[#C88A32]/20 text-[#E1B265]' : 'bg-[#C88A32]/14 text-[#8A6324]'">{{ tag }}</span>
        <span class="font-mono text-[0.625rem] tracking-[0.12em] whitespace-nowrap" :class="dark ? 'text-[#F7F4EE]/80' : 'text-[#6E6960]'">{{ meta }}</span>
      </div>
      <h3 class="display-3 mb-3 relative transition-colors duration-500"
        :class="dark ? 'text-[#F7F4EE] group-hover:text-[#E1B265]' : 'text-[#1C1B18] group-hover:text-[#8A6324]'">{{ title }}</h3>
      <p class="body-copy text-[0.8125rem]! mb-7 relative" :class="dark ? 'text-[#F7F4EE]/90' : ''">{{ desc }}</p>
      <div class="relative inline-flex items-center gap-3 text-xs font-bold"
        :class="dark ? 'text-[#E1B265]' : 'text-[#1C1B18]'">
        <span class="link-line">{{ cta }}</span>
        <span class="w-9 h-9 rounded-full grid place-items-center border border-current/35 group-hover:bg-[#C88A32] group-hover:text-[#1C1B18] group-hover:border-[#C88A32] transition-all duration-500">
          <ArrowUpRight :size="15" class="arrow-shift" />
        </span>
      </div>
    </div>
  </RouterLink>
</template>
