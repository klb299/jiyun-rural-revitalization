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
  <article
    class="exhibit-card group relative h-full rounded-[1.5rem] overflow-hidden lift"
    :class="dark ? 'card-ink' : 'card-linen'"
  >
    <div class="exhibit-card__layout h-full">
      <div v-if="image" class="exhibit-card__media relative overflow-hidden bg-[#E8F0EC]">
        <img
          :src="image"
          :alt="title"
          loading="lazy"
          class="w-full aspect-[16/10] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div
          class="pointer-events-none absolute inset-0"
          style="background: linear-gradient(180deg, transparent 52%, rgba(14, 38, 29, 0.56) 100%)"
        ></div>
        <span
          v-if="index"
          class="absolute bottom-3 left-3 font-mono text-[0.65rem] font-semibold tracking-[0.14em] px-2.5 py-1 rounded-full bg-[#0E261D]/82 text-[#E5C175] backdrop-blur-sm border border-[#E5C175]/25"
        >
          {{ index }}
        </span>
        <span
          v-if="meta"
          class="absolute top-3 right-3 font-mono text-[0.625rem] tracking-[0.1em] px-2.5 py-1 rounded-full bg-white/88 text-[#10241C] backdrop-blur-sm"
        >
          {{ meta }}
        </span>
      </div>

      <div class="relative flex flex-col justify-between p-6 sm:p-7 lg:p-8">
        <div>
          <div v-if="tag" class="flex flex-wrap items-center gap-2 mb-3.5">
            <span
              class="inline-flex items-center gap-1.5 font-mono text-[0.65rem] font-semibold tracking-[0.14em] px-2.5 py-1 rounded-full"
              :class="dark ? 'bg-[#E5C175]/16 text-[#E5C175]' : 'bg-[#1F5440]/10 text-[#1A4333]'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="dark ? 'bg-[#E5C175]' : 'bg-[#C89B45]'"></span>
              {{ tag }}
            </span>
          </div>

          <h3
            class="display-3 mb-3 transition-colors duration-300"
            :class="dark ? 'text-[#F7FAF8] group-hover:text-[#E5C175]' : 'text-[#10241C] group-hover:text-[#1F5440]'"
          >
            <RouterLink :to="to" class="card-link focus-visible:outline-none">
              {{ title }}
            </RouterLink>
          </h3>

          <p
            class="text-[0.86rem] leading-[1.85] mb-6"
            :class="dark ? 'text-[#D7E4DD]/90' : 'text-[#3E554B]'"
          >
            {{ desc }}
          </p>
        </div>

        <footer class="flex items-center justify-between pt-4 border-t" :class="dark ? 'border-white/10' : 'border-[#0E261D]/8'">
          <span class="text-xs font-bold tracking-wide" :class="dark ? 'text-[#E5C175]' : 'text-[#1A4333]'">
            {{ cta }}
          </span>
          <span
            class="w-8 h-8 rounded-full grid place-items-center border transition-all duration-300"
            :class="dark
              ? 'border-[#E5C175]/35 text-[#E5C175] group-hover:bg-[#E5C175] group-hover:text-[#0E261D]'
              : 'border-[#0E261D]/16 text-[#10241C] group-hover:bg-[#0E261D] group-hover:text-[#E5C175] group-hover:border-[#0E261D]'"
          >
            <ArrowUpRight :size="14" aria-hidden="true" class="arrow-shift" />
          </span>
        </footer>
      </div>
    </div>
  </article>
</template>

<style scoped>
.exhibit-card:has(a.card-link) {
  position: relative;
}
.exhibit-card a.card-link::after {
  content: "";
  position: absolute;
  inset: 0;
}
.exhibit-card:has(a.card-link:focus-visible) {
  outline: 2px solid var(--accent-gold);
  outline-offset: 3px;
}
</style>
