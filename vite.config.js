import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const rawBase = process.env.VITE_BASE || '/'
const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

/**
 * GitHub Pages 子路径适配插件：
 * 1) 在 generateBundle 阶段为动态数据/内联样式中引用的 public 资源前缀（/art-custom/、/art-hd/、/art/、/photos/）
 *    自动补齐 base 子路径，不干扰 Vue 模板编译且绝不重复拼接；
 * 2) 构建完成后复制 dist/index.html -> dist/404.html，保证 SPA 子路由（/split、/admin、/bigscreen 等）直访与刷新正常。
 */
function githubPagesBasePlugin(base) {
  const isSubpath = base !== '/'
  const publicPrefixRe = /(['"(])\/(art-custom|art-hd|art|photos)\//g

  return {
    name: 'github-pages-base-rewrite',
    generateBundle(_options, bundle) {
      if (!isSubpath) return
      for (const item of Object.values(bundle)) {
        if (item.type === 'chunk' && typeof item.code === 'string') {
          item.code = item.code.replace(publicPrefixRe, `$1${base}$2/`)
        } else if (item.type === 'asset' && typeof item.source === 'string' && /\.css$/.test(item.fileName)) {
          item.source = item.source.replace(publicPrefixRe, `$1${base}$2/`)
        }
      }
    },
    transformIndexHtml(html) {
      if (!isSubpath) return html
      return html.replace(publicPrefixRe, `$1${base}$2/`)
    },
    closeBundle() {
      const distDir = fileURLToPath(new URL('./dist', import.meta.url))
      const indexFile = resolve(distDir, 'index.html')
      const fallbackFile = resolve(distDir, '404.html')
      if (existsSync(indexFile)) {
        copyFileSync(indexFile, fallbackFile)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  // 本地与根域名用 '/'；部署到 GitHub Pages 子路径时设 VITE_BASE=/仓库名/ npm run build
  base: normalizedBase,
  plugins: [
    vue(),
    tailwindcss(),
    githubPagesBasePlugin(normalizedBase)
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
