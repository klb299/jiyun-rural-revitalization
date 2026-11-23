<script setup>
import { useId } from 'vue'

defineProps({
  size: { type: [Number, String], default: 38 },
  variant: { type: String, default: 'dark' }, // 'dark' (深松墨玉鎏金) | 'gold' (鎏金深松)
  decorative: { type: Boolean, default: true }
})

const uid = useId()
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :aria-hidden="decorative ? 'true' : undefined"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : '吉韵禾野品牌徽标'"
    class="shrink-0 select-none"
    style="filter: drop-shadow(0 4px 10px rgba(14, 38, 29, 0.24));"
  >
    <defs>
      <linearGradient :id="`bg-${uid}`" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
        <template v-if="variant === 'gold'">
          <stop offset="0%" stop-color="#F6DE9B" />
          <stop offset="52%" stop-color="#D7A950" />
          <stop offset="100%" stop-color="#A67926" />
        </template>
        <template v-else>
          <stop offset="0%" stop-color="#215B45" />
          <stop offset="55%" stop-color="#113326" />
          <stop offset="100%" stop-color="#091C15" />
        </template>
      </linearGradient>

      <linearGradient :id="`gold-${uid}`" x1="20" y1="10" x2="46" y2="54" gradientUnits="userSpaceOnUse">
        <template v-if="variant === 'gold'">
          <stop offset="0%" stop-color="#1A4937" />
          <stop offset="100%" stop-color="#0B2219" />
        </template>
        <template v-else>
          <stop offset="0%" stop-color="#FFF2C2" />
          <stop offset="48%" stop-color="#E7C272" />
          <stop offset="100%" stop-color="#BD8C33" />
        </template>
      </linearGradient>

      <linearGradient :id="`jade-${uid}`" x1="12" y1="38" x2="52" y2="56" gradientUnits="userSpaceOnUse">
        <template v-if="variant === 'gold'">
          <stop offset="0%" stop-color="#1F5641" stop-opacity="0.72" />
          <stop offset="100%" stop-color="#0E261D" stop-opacity="0.95" />
        </template>
        <template v-else>
          <stop offset="0%" stop-color="#4FA381" stop-opacity="0.88" />
          <stop offset="100%" stop-color="#1F5943" stop-opacity="0.45" />
        </template>
      </linearGradient>

      <clipPath :id="`clip-${uid}`">
        <rect x="2" y="2" width="60" height="60" rx="16" />
      </clipPath>
    </defs>

    <!-- 外层深松墨玉 / 鎏金底章 -->
    <rect x="2" y="2" width="60" height="60" rx="16" :fill="`url(#bg-${uid})`" />

    <!-- 极细宋式双层框与四角回纹点缀 -->
    <rect
      x="5.5"
      y="5.5"
      width="53"
      height="53"
      rx="12.5"
      :stroke="`url(#gold-${uid})`"
      stroke-width="0.9"
      stroke-opacity="0.58"
    />
    <path
      d="M11 9.5H15.5M9.5 11V15.5M53 9.5H48.5M54.5 11V15.5M11 54.5H15.5M9.5 53V48.5M53 54.5H48.5M54.5 53V48.5"
      :stroke="`url(#gold-${uid})`"
      stroke-width="1"
      stroke-linecap="round"
      stroke-opacity="0.52"
    />

    <g :clip-path="`url(#clip-${uid})`">
      <!-- 底部松辽青绿山川叠峦与松花江鎏金水纹 -->
      <path
        d="M4 47C13 40 22 39 32 43.5C41 47.5 51 43 60 37.5V60H4V47Z"
        :fill="`url(#jade-${uid})`"
      />
      <path
        d="M5 51.5C16 45.5 27 46 37 49.5C45 52.3 53 49.8 60 45.5"
        :stroke="`url(#gold-${uid})`"
        stroke-width="1.35"
        stroke-linecap="round"
        stroke-opacity="0.88"
      />
      <path
        d="M11 55.5C22 51.5 34 52 46 54.5C51 55.5 56 54.2 60 52"
        :stroke="`url(#gold-${uid})`"
        stroke-width="0.85"
        stroke-linecap="round"
        stroke-opacity="0.48"
      />

      <!-- 左右舒展禾叶托底 -->
      <path
        d="M31.6 46.5C24.8 44.5 18.8 39.6 15.8 33.4C22.4 34.4 28.4 38.6 31.6 44.4"
        :fill="`url(#gold-${uid})`"
        fill-opacity="0.28"
        :stroke="`url(#gold-${uid})`"
        stroke-width="1.15"
        stroke-linejoin="round"
      />
      <path
        d="M32.4 46.5C39.2 44.5 45.2 39.6 48.2 33.4C41.6 34.4 35.6 38.6 32.4 44.4"
        :fill="`url(#gold-${uid})`"
        fill-opacity="0.28"
        :stroke="`url(#gold-${uid})`"
        stroke-width="1.15"
        stroke-linejoin="round"
      />

      <!-- 中心雕塑感鎏金嘉禾主穗 -->
      <path
        d="M32 47.5V19.5"
        :stroke="`url(#gold-${uid})`"
        stroke-width="1.65"
        stroke-linecap="round"
      />

      <!-- 左侧四颗饱满稻谷 -->
      <path d="M31.5 38.2C26.4 37.2 22.8 33.6 22.2 29.2C26.7 29.8 30.2 33.2 31.5 38.2Z" :fill="`url(#gold-${uid})`" />
      <path d="M31.5 31.6C27.0 30.6 23.8 27.4 23.3 23.4C27.4 24.0 30.4 27.1 31.5 31.6Z" :fill="`url(#gold-${uid})`" />
      <path d="M31.5 25.4C27.8 24.5 25.4 21.8 25.2 18.4C28.4 19.0 30.8 21.6 31.5 25.4Z" :fill="`url(#gold-${uid})`" />

      <!-- 右侧四颗饱满稻谷 -->
      <path d="M32.5 38.2C37.6 37.2 41.2 33.6 41.8 29.2C37.3 29.8 33.8 33.2 32.5 38.2Z" :fill="`url(#gold-${uid})`" />
      <path d="M32.5 31.6C37.0 30.6 40.2 27.4 40.7 23.4C36.6 24.0 33.6 27.1 32.5 31.6Z" :fill="`url(#gold-${uid})`" />
      <path d="M32.5 25.4C36.2 24.5 38.6 21.8 38.8 18.4C35.6 19.0 33.2 21.6 32.5 25.4Z" :fill="`url(#gold-${uid})`" />

      <!-- 穗顶饱满主谷与北斗数智星芒 -->
      <path d="M32 13.4C34.2 16.0 34.4 19.4 32 21.6C29.6 19.4 29.8 16.0 32 13.4Z" :fill="`url(#gold-${uid})`" />
      <path
        d="M32 8.2L33.1 10.6L35.5 11.7L33.1 12.8L32 15.2L30.9 12.8L28.5 11.7L30.9 10.6L32 8.2Z"
        :fill="variant === 'gold' ? '#0E261D' : '#FFF4CA'"
        fill-opacity="0.92"
      />
    </g>
  </svg>
</template>
