<script setup>
defineProps({
  label: { type: String, default: '' },
  dark: { type: Boolean, default: false }
})
</script>

<template>
  <div class="flex items-center gap-4 my-2 select-none" aria-hidden="true">
    <span
      class="h-px flex-1"
      :style="{
        background: dark
          ? 'linear-gradient(90deg, transparent 0%, rgba(229,193,117,0.45) 100%)'
          : 'linear-gradient(90deg, transparent 0%, rgba(31,84,64,0.28) 65%, rgba(200,155,69,0.5) 100%)'
      }"
    ></span>

    <div class="inline-flex items-center gap-2.5 shrink-0">
      <svg width="44" height="14" viewBox="0 0 44 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 7C7 7 9.5 3 14 7C9.5 11 7 7 2 7Z"
          :stroke="dark ? '#E5C175' : '#C89B45'"
          stroke-width="1"
          fill="none"
          opacity="0.7"
        />
        <rect
          x="19.5"
          y="4.5"
          width="5"
          height="5"
          transform="rotate(45 22 7)"
          :fill="dark ? '#E5C175' : '#1F5440'"
        />
        <path
          d="M42 7C37 7 34.5 3 30 7C34.5 11 37 7 42 7Z"
          :stroke="dark ? '#E5C175' : '#C89B45'"
          stroke-width="1"
          fill="none"
          opacity="0.7"
        />
      </svg>
      <span
        v-if="label"
        class="font-mono text-[0.65rem] tracking-[0.2em]"
        :class="dark ? 'text-[#E5C175]/80' : 'text-[#566E64]'"
      >
        {{ label }}
      </span>
    </div>

    <span
      class="h-px flex-1"
      :style="{
        background: dark
          ? 'linear-gradient(90deg, rgba(229,193,117,0.45) 0%, transparent 100%)'
          : 'linear-gradient(90deg, rgba(200,155,69,0.5) 0%, rgba(31,84,64,0.28) 35%, transparent 100%)'
      }"
    ></span>
  </div>
</template>
