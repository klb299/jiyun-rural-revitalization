import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      // 兼容 Vite 8 的 native configLoader，不用 __dirname
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // Three.js 与按需注册后的 ECharts 是异步 chunk，首屏不加载。
    // 550–700 kB 属于这两个库的必要体积，不再按默认 500 kB 阈值报警。
    chunkSizeWarningLimit: 750
  }
})
