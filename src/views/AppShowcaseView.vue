<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Smartphone, Columns2, LayoutDashboard, Compass,
  Sparkles, ArrowRight, Tractor, Radio, QrCode,
  Award, CalendarDays, Activity
} from 'lucide-vue-next'
import RuralAppShell from '../components/mobile/RuralAppShell.vue'
import BrandLogo from '../components/BrandLogo.vue'
import { useRuralPlatformStore } from '../stores/ruralPlatformStore'

const store = useRuralPlatformStore()
const appRef = ref(null)

const showcaseTriggers = [
  {
    id: 'live',
    icon: Radio,
    badge: 'LIVE',
    title: '黑土慢直播 · 产地实景',
    desc: '4 路全屏实景机位 + IoT 气象弹幕 + 一键抢购同款好物',
    run: () => appRef.value?.openLiveCam('cam-2')
  },
  {
    id: 'trace',
    icon: QrCode,
    badge: '溯源',
    title: '一袋一码 · 黑土防伪查验',
    desc: '激光扫码核验 5 步从黑土到餐桌全链路档案与合作社红章',
    run: () => appRef.value?.openTrace('JL-JT-2026-0891')
  },
  {
    id: '3d',
    icon: Tractor,
    badge: '3D',
    title: '手机屏原生 3D 沉浸展厅',
    desc: '黑土标本 / 北斗农机爆炸解构 / 生态沙盘，App 内无缝直览',
    run: () => appRef.value?.open3DHall('machinery')
  },
  {
    id: 'cert',
    icon: Award,
    badge: '认养',
    title: '我的云农田与黑金电子证书',
    desc: '远程测墒、无人机巡田互动与合作社认证黑土电子收藏证书',
    run: () => appRef.value?.openCert()
  },
  {
    id: 'solar',
    icon: CalendarDays,
    badge: '节气',
    title: '二十四节气 · 吉林农时画报',
    desc: '春生夏长秋收冬藏四季画报与当季黑土农事重点指引',
    run: () => appRef.value?.openSolar()
  },
  {
    id: 'ai',
    icon: Sparkles,
    badge: 'AI 诊断',
    title: 'AI 智慧农艺师 · 视觉快检',
    desc: '支持上传田间实拍激光扫描诊断 + 接入实时数据的农情 AI 问答',
    run: () => appRef.value?.openAi()
  }
]
</script>

<template>
  <!-- 移动端直接全屏原生 App 体验（锁满 100vw × 100dvh） -->
  <div class="md:hidden h-[100dvh] w-full overflow-hidden bg-[#F7F4EE]">
    <RuralAppShell :framed="false" />
  </div>

  <!-- 桌面端：高定新中式山水纹理展示舱 -->
  <div
    class="hidden md:flex min-h-screen flex-col text-[#1C1B18] relative overflow-hidden bg-[#F4F0E6]"
    style="background-image: url('/art-custom/showcase-bg-pattern.jpg'); background-size: cover; background-position: center;"
  >
    <!-- 柔和通透叠层，保证文字与卡片高对比清晰度 -->
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FAF7F0]/65 via-[#FAF7F0]/30 to-[#F4EFE4]/45"></div>

    <!-- 顶部极简模式切换栏 -->
    <header class="relative z-20 w-full max-w-[1380px] mx-auto px-6 lg:px-10 pt-5 pb-2 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <BrandLogo :size="40" />
        <div>
          <div class="font-editorial font-bold text-[15.5px] leading-tight text-[#16261F]">吉韵禾野 · 乡村振兴数字平台</div>
          <div class="font-mono text-[10px] tracking-[0.16em] text-[#6E6960]">MOBILE APP &amp; ADMIN MANAGEMENT SYSTEM</div>
        </div>
      </div>

      <nav aria-label="系统模式切换" class="flex items-center gap-1.5 p-1.5 rounded-full bg-white/88 backdrop-blur-md border border-[#1C1B18]/10 shadow-xs">
        <RouterLink
          to="/"
          class="px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-[#16261F] text-[#F5D393]"
        >
          <Smartphone :size="14" />
          <span>移动端 App</span>
        </RouterLink>
        <RouterLink
          to="/split"
          class="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-[#3E3B35] hover:bg-[#F3F0E9] transition-colors"
        >
          <Columns2 :size="14" class="text-[#C88A32]" />
          <span>双端同屏联动</span>
        </RouterLink>
        <RouterLink
          to="/admin"
          class="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-[#3E3B35] hover:bg-[#F3F0E9] transition-colors"
        >
          <LayoutDashboard :size="14" class="text-[#1F4E3D]" />
          <span>后台管理系统</span>
        </RouterLink>
        <RouterLink
          to="/bigscreen"
          class="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-[#3E3B35] hover:bg-[#F3F0E9] transition-colors"
        >
          <Activity :size="14" class="text-[#B83828]" />
          <span>数智大屏</span>
        </RouterLink>
        <RouterLink
          to="/museum"
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-[#5A564E] hover:bg-[#F3F0E9] transition-colors"
        >
          <Compass :size="14" />
          <span>3D 展馆</span>
        </RouterLink>
      </nav>
    </header>

    <!-- 主体双栏展示舱 -->
    <main class="relative z-10 flex-1 w-full max-w-[1380px] mx-auto px-6 lg:px-10 py-5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <!-- 左侧：品牌叙事 + 6大旗舰功能遥控面板 + 双端同步流 -->
      <div class="lg:col-span-7 space-y-5">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3EE] border border-[#2E5A44]/20 text-[#1F4E3D] text-xs font-bold">
          <span class="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>{{ store.lastSyncEvent }}</span>
        </div>

        <div class="space-y-2.5">
          <h1 class="font-editorial text-4xl xl:text-[3.1rem] font-bold leading-[1.12] tracking-tight text-[#16261F]">
            一端连乡野，一端驭数智<br />
            <span class="text-[#C88A32]">乡村振兴</span>双端协同系统
          </h1>
          <p class="text-[14px] text-[#5A564E] leading-relaxed max-w-xl">
            右侧为完全可交互的<strong>「吉韵禾野」乡村振兴移动端 App</strong>：融合黑土慢直播、一袋一码溯源、云认养电子证书、手机屏原生 3D 展厅与助农集市，并与<strong>后台管理系统</strong>实时双向同步。
          </p>
        </div>

        <!-- 6 大旗舰功能遥控体验卡（点击直接在右侧真机内打开对应页面） -->
        <div class="space-y-2 max-w-2xl">
          <div class="text-[10.5px] font-mono tracking-[0.16em] text-[#6E6960] uppercase">点击任意卡片 · 立即在右侧手机内直达体验</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
            <button
              v-for="item in showcaseTriggers"
              :key="item.id"
              type="button"
              @click="item.run()"
              class="text-left p-3 rounded-2xl bg-white/92 hover:bg-white border border-[#1C1B18]/8 hover:border-[#1F4E3D]/45 transition-all shadow-2xs hover:shadow-sm cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between gap-1">
                  <span class="w-7 h-7 rounded-xl bg-[#EAF3EE] text-[#1F4E3D] flex items-center justify-center group-hover:bg-[#16261F] group-hover:text-[#F0C275] transition-colors">
                    <component :is="item.icon" :size="14" />
                  </span>
                  <span class="font-mono text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[#FDF4E6] text-[#9A6518]">{{ item.badge }}</span>
                </div>
                <div class="text-[12.5px] font-bold text-[#16261F] mt-2 flex items-center justify-between">
                  <span class="truncate">{{ item.title }}</span>
                  <ArrowRight :size="12" class="text-[#8E887E] shrink-0 group-hover:translate-x-0.5 group-hover:text-[#1F4E3D] transition-all" />
                </div>
                <p class="text-[10.5px] text-[#6E6960] mt-1 leading-relaxed line-clamp-2">{{ item.desc }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- 实时双端动态条 + 核心入口 CTA -->
        <div class="max-w-2xl bg-white/85 backdrop-blur-xs rounded-2xl p-3.5 border border-[#1C1B18]/8 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <span class="w-8 h-8 rounded-xl bg-[#16261F] text-[#F0C275] flex items-center justify-center shrink-0">
              <Activity :size="15" />
            </span>
            <div class="min-w-0">
              <div class="text-[11px] font-bold text-[#16261F]">
                累计成交 ¥{{ store.totalGMV.toLocaleString() }} · 带动 {{ store.totalHelpedHouseholds }} 户 · 待办 {{ store.totalPendingCount }} 项
              </div>
              <div class="text-[10.5px] text-[#6E6960] truncate">
                最新动态：{{ store.activityLogs[0]?.source }} · {{ store.activityLogs[0]?.action }}（{{ store.activityLogs[0]?.detail }}）
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <RouterLink
              to="/split"
              class="px-4 py-2 rounded-full bg-[#16261F] text-[#F5D393] text-xs font-bold flex items-center gap-1.5 hover:bg-[#1F4E3D] transition-colors"
            >
              <Columns2 :size="14" />
              <span>双端同屏演示</span>
            </RouterLink>
            <RouterLink
              to="/admin"
              class="px-4 py-2 rounded-full bg-[#F5F2EB] border border-[#1C1B18]/12 text-[#16261F] text-xs font-bold hover:border-[#1F4E3D] transition-colors"
            >
              管理后台 →
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- 右侧：高保真钛金属 iPhone 16 Pro Max 真机演示框 -->
      <div class="lg:col-span-5 flex justify-center">
        <div class="phone-chassis relative w-[386px] h-[min(804px,calc(100vh-112px))] min-h-[640px] rounded-[3.25rem] p-[11px] bg-gradient-to-b from-[#3A3834] via-[#22211E] to-[#34322E] shadow-[0_38px_80px_-24px_rgba(22,38,31,0.48),0_0_0_1px_rgba(255,255,255,0.18)_inset]">
          <div class="absolute -left-[3px] top-28 w-[3px] h-7 rounded-l bg-[#4A4742]"></div>
          <div class="absolute -left-[3px] top-40 w-[3px] h-12 rounded-l bg-[#4A4742]"></div>
          <div class="absolute -left-[3px] top-56 w-[3px] h-12 rounded-l bg-[#4A4742]"></div>
          <div class="absolute -right-[3px] top-44 w-[3px] h-16 rounded-r bg-[#4A4742]"></div>

          <div class="w-full h-full rounded-[2.6rem] overflow-hidden bg-[#F7F4EE] ring-1 ring-black/60">
            <RuralAppShell ref="appRef" :framed="true" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
