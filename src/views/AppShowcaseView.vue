<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  Smartphone, Columns2, LayoutDashboard, Compass,
  Sparkles, ArrowRight, Tractor, Radio, QrCode,
  Award, CalendarDays, Activity, Clapperboard,
  ShoppingBag, Users, ShieldCheck, Gamepad2, Leaf, ScanLine
} from 'lucide-vue-next'
import RuralAppShell from '../components/mobile/RuralAppShell.vue'
import BrandLogo from '../components/BrandLogo.vue'
import { useRuralPlatformStore } from '../stores/ruralPlatformStore'
import { useAppStore } from '../stores/appStore'

const router = useRouter()
const store = useRuralPlatformStore()
const appStore = useAppStore()
const appRef = ref(null)

function activateMobilePersona(persona) {
  store.setAppPersona(persona)
  appRef.value?.setTab('home')
}

function enterAdminWithRole(role, tab = '') {
  store.setAdminRole(role)
  store.quickDemoLogin()
  router.push(tab ? `/admin?tab=${tab}` : '/admin')
}

const consumerTriggers = [
  {
    id: 'live',
    icon: Radio,
    badge: 'LIVE 验真',
    title: '产地实景慢直播',
    desc: '4 路全屏实景机位 + 气象弹幕 + 同款直采',
    run: () => { store.setAppPersona('consumer'); appRef.value?.openLiveCam('cam-2') }
  },
  {
    id: 'trace',
    icon: QrCode,
    badge: '防伪溯源',
    title: '一袋一码防伪核验',
    desc: '扫码查验 5 段黑土履历与合作社红章',
    run: () => { store.setAppPersona('consumer'); appRef.value?.openTrace('JL-JT-2026-0891') }
  },
  {
    id: 'cert',
    icon: Award,
    badge: '云认养',
    title: '云农田与黑金证书',
    desc: '远程测墒、无人机巡田与电子收藏证书',
    run: () => { store.setAppPersona('consumer'); appRef.value?.openCert() }
  },
  {
    id: 'market',
    icon: ShoppingBag,
    badge: '透明分成',
    title: '地标严选与积分兑券',
    desc: '78%+ 收益直达农户，支持公益分兑补贴券',
    run: () => { store.setAppPersona('consumer'); appRef.value?.setTab('market') }
  }
]

const farmerTriggers = [
  {
    id: 'booking',
    icon: Tractor,
    badge: '农机派单',
    title: '呼叫北斗无人农机',
    desc: '按亩数一键预约深松/免耕，直通农机站',
    run: () => { store.setAppPersona('farmer'); appRef.value?.openBookingSheet?.() }
  },
  {
    id: 'ai',
    icon: ScanLine,
    badge: '视觉问诊',
    title: 'AI 拍照看苗诊断',
    desc: '快检黑土有机质、水稻叶绿素与病虫处方',
    run: () => { store.setAppPersona('farmer'); appRef.value?.openAi() }
  },
  {
    id: 'ledger',
    icon: Leaf,
    badge: '分红补贴',
    title: '社员分红与免耕账本',
    desc: '核对 36 亩免耕补贴与合作社电商分成池',
    run: () => { store.setAppPersona('farmer'); appRef.value?.openCarbon() }
  },
  {
    id: '3d',
    icon: Compass,
    badge: '3D 装备',
    title: '260HP 农机三维解构',
    desc: '手机竖屏触控拆解长春造混动无人拖拉机',
    run: () => { store.setAppPersona('farmer'); appRef.value?.open3DHall('machinery') }
  }
]

const activeTriggers = computed(() =>
  store.appPersona === 'farmer' ? farmerTriggers : consumerTriggers
)
</script>

<template>
  <!-- 移动端直接全屏原生 App 体验（锁满 100vw × 100dvh） -->
  <div class="md:hidden h-[100dvh] w-full overflow-hidden bg-[#F7F4EE]">
    <RuralAppShell :framed="false" />
  </div>

  <!-- 桌面端：高定新中式山水纹理 · 四维受众精准导览舱 -->
  <div
    class="hidden md:flex min-h-screen flex-col text-[#1C1B18] relative overflow-hidden bg-[#F4F0E6]"
    style="background-image: url('/art-custom/showcase-bg-pattern.jpg'); background-size: cover; background-position: center;"
  >
    <!-- 温润宣纸青绿光影叠层，兼顾雅致留白与文字高对比度 -->
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FAF8F2]/82 via-[#FAF7F0]/52 to-[#EDE7DA]/68"></div>
    <div class="pointer-events-none absolute -top-28 right-[12%] w-[460px] h-[460px] rounded-full bg-[#1F4E3D]/9 blur-[110px]"></div>

    <!-- 顶部轩窗全局模式栏 -->
    <header class="relative z-20 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-4 pb-2 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <BrandLogo :size="40" />
        <div>
          <div class="flex items-center gap-2">
            <span class="font-editorial font-bold text-[16px] leading-tight text-[#16261F]">吉韵禾野 · 乡村振兴四端协同平台</span>
            <span class="hidden xl:inline-flex px-2 py-0.5 rounded-md bg-[#B83828] text-[#FFF7EA] font-editorial text-[10px] font-bold tracking-wider shadow-2xs">四类精准受众</span>
          </div>
          <div class="font-mono text-[10px] tracking-[0.15em] text-[#5E5950]">CONSUMER · NEW FARMER · COOPERATIVE ADMIN · DIGITAL TWIN</div>
        </div>
      </div>

      <nav aria-label="系统终端切换" class="flex items-center gap-1 p-1.5 rounded-full bg-white/92 backdrop-blur-md border border-[#1C1B18]/10 shadow-[0_10px_28px_-18px_rgba(22,38,31,0.35)]">
        <RouterLink
          to="/"
          aria-current="page"
          class="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-[#16261F] text-[#F5D393] shadow-2xs"
        >
          <Smartphone :size="13.5" aria-hidden="true" />
          <span>双身份 App</span>
        </RouterLink>
        <RouterLink
          to="/split"
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-[#2E2C27] hover:bg-[#F3F0E8] transition-colors"
        >
          <Columns2 :size="13.5" aria-hidden="true" class="text-[#9A6518]" />
          <span>双端同屏实训</span>
        </RouterLink>
        <RouterLink
          to="/admin"
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-[#2E2C27] hover:bg-[#F3F0E8] transition-colors"
        >
          <LayoutDashboard :size="13.5" aria-hidden="true" class="text-[#1F4E3D]" />
          <span>分岗管理后台</span>
        </RouterLink>
        <RouterLink
          to="/bigscreen"
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-[#2E2C27] hover:bg-[#F3F0E8] transition-colors"
        >
          <Activity :size="13.5" aria-hidden="true" class="text-[#B83828]" />
          <span>指挥大屏</span>
        </RouterLink>
        <RouterLink
          to="/museum"
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-[#2E2C27] hover:bg-[#F3F0E8] transition-colors"
        >
          <Compass :size="13.5" aria-hidden="true" class="text-[#1F4E3D]" />
          <span>3D 展馆</span>
        </RouterLink>
        <RouterLink
          to="/game"
          class="hidden xl:flex px-3 py-1.5 rounded-full text-xs font-bold items-center gap-1 bg-[#FDF4E6] text-[#8A5810] border border-[#C88A32]/30 hover:bg-[#F8E7C9] transition-colors"
        >
          <Gamepad2 :size="13.5" aria-hidden="true" />
          <span>守护游戏</span>
        </RouterLink>
      </nav>
    </header>

    <!-- 主体双栏展示舱 -->
    <main class="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-4 grid grid-cols-1 lg:grid-cols-12 gap-7 xl:gap-9 items-center">
      <!-- 左栏：品牌定位 + 四类目标用户精准矩阵 + 随身份变化的真机遥控器 -->
      <div class="lg:col-span-7 space-y-4">
        <!-- 实时同步状态 + 节气 + 重播片头 -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3EE] border border-[#2E5A44]/22 text-[#184333] text-[11.5px] font-bold">
            <span class="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
            <span>{{ store.lastSyncEvent }}</span>
          </div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 border border-[#C88A32]/28 text-[#7F5B17] font-mono text-[11px] font-semibold">
            <span>{{ store.appConfig.solarTerm }}</span>
          </span>
          <button
            type="button"
            @click="appStore.replayCineIntro"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16261F] hover:bg-[#1F4E3D] text-[#F5D393] text-[11.5px] font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <Clapperboard :size="12.5" aria-hidden="true" />
            <span>重播宋韵展卷</span>
          </button>
        </div>

        <!-- 标题与核心价值主张 -->
        <div class="space-y-2">
          <h1 class="font-editorial text-3xl xl:text-[2.65rem] font-bold leading-[1.15] tracking-tight text-[#14241D]" style="text-wrap: balance;">
            因人设端，因事赋智：<span class="text-[#9A6518]">四类真实用户</span>精准协同的乡村振兴数字平台
          </h1>
          <p class="text-[13.5px] text-[#4A463F] leading-[1.7] max-w-2xl" style="text-wrap: pretty;">
            彻底告别“城乡功能混杂、角色定位模糊”的传统演示页：为<strong>城市消费者</strong>提供验真直采与云认养，为<strong>本地新农人</strong>打造北斗农机预约与 AI 看苗工作台，并与<strong>合作社/村委分岗后台</strong>及<strong>三维科普大屏</strong>毫秒级双向互通。
          </p>
        </div>

        <!-- 核心亮点：四类目标对象精准分流矩阵（2x2 轩窗高定卡） -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="font-mono text-[10.5px] font-bold tracking-[0.14em] text-[#5E5950]">01 · 选择目标用户角色 · 立即代入专属业务流</span>
            <span class="text-[11px] font-semibold text-[#1F4E3D]">当前右侧手机视角：{{ store.appPersona === 'farmer' ? '本地新农人 · 赵建国' : '城市消费者 · 林晓禾' }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <!-- 对象 1：城市助农消费者 -->
            <button
              type="button"
              @click="activateMobilePersona('consumer')"
              class="text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group"
              :class="store.appPersona === 'consumer'
                ? 'bg-[#16261F] text-[#F7F4EE] border-[#C88A32]/65 shadow-[0_18px_38px_-18px_rgba(22,38,31,0.55)]'
                : 'bg-white/92 hover:bg-white text-[#1C1B18] border-[#1C1B18]/10 hover:border-[#1F4E3D]/45 shadow-2xs'"
            >
              <div class="flex items-center justify-between gap-2">
                <span
                  class="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold"
                  :class="store.appPersona === 'consumer' ? 'bg-[#F0C275] text-[#16261F]' : 'bg-[#EAF3EE] text-[#1F4E3D]'"
                >C端 · 城市品质消费者</span>
                <span class="text-[10.5px] font-bold" :class="store.appPersona === 'consumer' ? 'text-[#86EFAC]' : 'text-[#7F5B17]'">
                  {{ store.appPersona === 'consumer' ? '● 右侧手机体验中' : '切换至该手机端 →' }}
                </span>
              </div>
              <div class="font-editorial text-[15px] font-bold mt-1.5 flex items-center gap-1.5">
                <span>林晓禾 · 产地溯源直采与云认养人</span>
              </div>
              <p class="text-[11px] mt-1 leading-relaxed" :class="store.appPersona === 'consumer' ? 'text-[#E5ECE8]/85' : 'text-[#5A564E]'">
                解决“怕假冒地标、不知钱是否到农户”痛点：看 4 路产地慢直播、扫一袋一码防伪、认养黑土田领收藏证书、积分兑补贴券。
              </p>
            </button>

            <!-- 对象 2：本地新农人与合作社社员 -->
            <button
              type="button"
              @click="activateMobilePersona('farmer')"
              class="text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group"
              :class="store.appPersona === 'farmer'
                ? 'bg-[#16261F] text-[#F7F4EE] border-[#C88A32]/65 shadow-[0_18px_38px_-18px_rgba(22,38,31,0.55)]'
                : 'bg-white/92 hover:bg-white text-[#1C1B18] border-[#1C1B18]/10 hover:border-[#1F4E3D]/45 shadow-2xs'"
            >
              <div class="flex items-center justify-between gap-2">
                <span
                  class="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold"
                  :class="store.appPersona === 'farmer' ? 'bg-[#F0C275] text-[#16261F]' : 'bg-[#FDF4E6] text-[#8A5810]'"
                >N端 · 本地新农人/社员</span>
                <span class="text-[10.5px] font-bold" :class="store.appPersona === 'farmer' ? 'text-[#86EFAC]' : 'text-[#7F5B17]'">
                  {{ store.appPersona === 'farmer' ? '● 右侧手机体验中' : '切换至该手机端 →' }}
                </span>
              </div>
              <div class="font-editorial text-[15px] font-bold mt-1.5 flex items-center gap-1.5">
                <span>赵建国 · 九台合作社种粮社员（36亩）</span>
              </div>
              <p class="text-[11px] mt-1 leading-relaxed" :class="store.appPersona === 'farmer' ? 'text-[#E5ECE8]/85' : 'text-[#5A564E]'">
                解决“大农机难约、病害难判、分红算不清”痛点：一键呼叫 260HP 北斗农机、AI 拍苗测叶绿素、在线核验免耕补贴与订单分红。
              </p>
            </button>

            <!-- 对象 3：合作社理事长 / 农机站长 / 驻村村委 -->
            <div class="p-3.5 rounded-2xl bg-white/93 border border-[#1C1B18]/10 shadow-2xs flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-[#EEF3F0] text-[#16261F]">B/G端 · 运营与治理中枢</span>
                  <span class="font-mono text-[10px] font-bold text-[#B83828]">待办 {{ store.totalPendingCount }} 项</span>
                </div>
                <div class="font-editorial text-[15px] font-bold text-[#16261F] mt-1.5">合作社理事长 · 农机站长 · 驻村书记</div>
                <p class="text-[11px] text-[#5A564E] mt-1 leading-relaxed">
                  按三大基层岗位精准分权：订单批量发货与物候播报、北斗 RTK 雷达一键派车、寒潮预警置顶下发。
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-[#1C1B18]/7">
                <button
                  type="button"
                  @click="enterAdminWithRole('coop', 'orders')"
                  class="px-2.5 py-1 rounded-lg bg-[#EAF3EE] hover:bg-[#1F4E3D] text-[#1F4E3D] hover:text-white text-[10.5px] font-bold transition-colors cursor-pointer"
                >
                  合作社履约 →
                </button>
                <button
                  type="button"
                  @click="enterAdminWithRole('agri', 'telemetry')"
                  class="px-2.5 py-1 rounded-lg bg-[#FDF4E6] hover:bg-[#C88A32] text-[#8A5810] hover:text-[#16261F] text-[10.5px] font-bold transition-colors cursor-pointer"
                >
                  农机站调度 →
                </button>
                <button
                  type="button"
                  @click="enterAdminWithRole('village', 'village')"
                  class="px-2.5 py-1 rounded-lg bg-[#F5F2EB] hover:bg-[#16261F] text-[#3E3B35] hover:text-[#F5D393] text-[10.5px] font-bold transition-colors cursor-pointer"
                >
                  村委治理 →
                </button>
              </div>
            </div>

            <!-- 对象 4：政企指挥与高校科普研学访客 -->
            <div class="p-3.5 rounded-2xl bg-white/93 border border-[#1C1B18]/10 shadow-2xs flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-[#FBECE9] text-[#9E2B1D]">V/P端 · 监管指挥与公众研学</span>
                  <span class="font-mono text-[10px] font-bold text-[#1F4E3D]">3 座 WebGL 馆</span>
                </div>
                <div class="font-editorial text-[15px] font-bold text-[#16261F] mt-1.5">农业监管部门 · 高校师生与社会访客</div>
                <p class="text-[11px] text-[#5A564E] mt-1 leading-relaxed">
                  宏观监管看松辽冷链飞线指挥大屏；公众科普逛一米黑土剖面、北斗农机爆炸解构与 13 单元数字展馆。
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-[#1C1B18]/7">
                <RouterLink
                  to="/bigscreen"
                  class="px-2.5 py-1 rounded-lg bg-[#16261F] hover:bg-[#1F4E3D] text-[#F5D393] text-[10.5px] font-bold transition-colors"
                >
                  数智大屏 →
                </RouterLink>
                <RouterLink
                  to="/museum"
                  class="px-2.5 py-1 rounded-lg bg-[#EAF3EE] hover:bg-[#1F4E3D] text-[#1F4E3D] hover:text-white text-[10.5px] font-bold transition-colors"
                >
                  3D 数字展馆 →
                </RouterLink>
                <RouterLink
                  to="/split"
                  class="px-2.5 py-1 rounded-lg bg-[#FDF4E6] hover:bg-[#C88A32] text-[#8A5810] hover:text-[#16261F] text-[10.5px] font-bold transition-colors"
                >
                  双端同屏台 →
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- 随身份联动的 4 枚真机高频实操遥控卡 -->
        <div class="space-y-1.5">
          <div class="font-mono text-[10.5px] font-bold tracking-[0.14em] text-[#5E5950]">
            02 · {{ store.appPersona === 'farmer' ? '【新农人端】四大田间刚需遥控（点击直接在右侧手机打开）' : '【城市消费端】四大助农验真遥控（点击直接在右侧手机打开）' }}
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="item in activeTriggers"
              :key="item.id"
              type="button"
              @click="item.run()"
              class="text-left p-2.5 rounded-2xl bg-white/94 hover:bg-white border border-[#1C1B18]/8 hover:border-[#C88A32]/65 transition-all shadow-2xs hover:shadow-sm cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between gap-1">
                  <span class="w-7 h-7 rounded-xl bg-[#EAF3EE] text-[#1F4E3D] flex items-center justify-center group-hover:bg-[#16261F] group-hover:text-[#F0C275] transition-colors">
                    <component :is="item.icon" :size="14" aria-hidden="true" />
                  </span>
                  <span class="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FDF4E6] text-[#8A5810]">{{ item.badge }}</span>
                </div>
                <div class="text-[12px] font-bold text-[#16261F] mt-2 flex items-center justify-between gap-1">
                  <span class="truncate">{{ item.title }}</span>
                  <ArrowRight :size="11.5" aria-hidden="true" class="text-[#7A746A] shrink-0 group-hover:translate-x-0.5 group-hover:text-[#1F4E3D] transition-all" />
                </div>
                <p class="text-[10px] text-[#5E5950] mt-0.5 leading-snug line-clamp-2">{{ item.desc }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- 底部全链路数据闭环动态条 -->
        <div class="bg-white/90 backdrop-blur-md rounded-2xl p-3 border border-[#C88A32]/24 shadow-[0_12px_28px_-20px_rgba(22,38,31,0.28)] flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <span class="w-8 h-8 rounded-xl bg-[#16261F] text-[#F0C275] flex items-center justify-center shrink-0">
              <ShieldCheck :size="15" aria-hidden="true" />
            </span>
            <div class="min-w-0">
              <div class="text-[11.5px] font-bold text-[#16261F] flex flex-wrap items-center gap-x-2">
                <span>助农累计 ¥{{ store.totalGMV.toLocaleString() }}</span>
                <span class="text-[#C88A32]">·</span>
                <span>带动 {{ store.totalHelpedHouseholds }} 户</span>
                <span class="text-[#C88A32]">·</span>
                <span class="text-[#1F4E3D]">社员示范户预计年收 ¥{{ store.farmerIncomeLedger.total.toLocaleString() }}</span>
              </div>
              <div class="text-[10.5px] text-[#5E5950] truncate">
                实时总线：{{ store.activityLogs[0]?.source }} · {{ store.activityLogs[0]?.action }}（{{ store.activityLogs[0]?.detail }}）
              </div>
            </div>
          </div>
          <RouterLink
            to="/split"
            class="px-4 py-2 rounded-full bg-gradient-to-r from-[#16261F] to-[#1F4E3D] text-[#F5D393] text-xs font-bold flex items-center gap-1.5 hover:brightness-110 transition-all shrink-0 shadow-xs"
          >
            <Columns2 :size="13.5" aria-hidden="true" />
            <span>开启双端剧本同屏实训</span>
          </RouterLink>
        </div>
      </div>

      <!-- 右栏：悬浮双身份切换条 + 高保真钛金 iPhone 16 Pro Max 真机画框 -->
      <div class="lg:col-span-5 flex flex-col items-center gap-2.5">
        <!-- 真机顶部悬浮用户身份切换胶囊 -->
        <div
          role="group"
          aria-label="切换移动端目标用户身份"
          class="inline-flex items-center gap-1 p-1 rounded-full bg-white/92 backdrop-blur-md border border-[#C88A32]/30 shadow-sm"
        >
          <button
            type="button"
            @click="activateMobilePersona('consumer')"
            :aria-pressed="store.appPersona === 'consumer' ? 'true' : 'false'"
            class="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            :class="store.appPersona === 'consumer'
              ? 'bg-[#16261F] text-[#F5D393] shadow-2xs'
              : 'text-[#4A463F] hover:bg-[#F3F0E8]'"
          >
            <ShoppingBag :size="12" aria-hidden="true" />
            <span>城市消费者 · 林晓禾</span>
          </button>
          <button
            type="button"
            @click="activateMobilePersona('farmer')"
            :aria-pressed="store.appPersona === 'farmer' ? 'true' : 'false'"
            class="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            :class="store.appPersona === 'farmer'
              ? 'bg-[#16261F] text-[#F5D393] shadow-2xs'
              : 'text-[#4A463F] hover:bg-[#F3F0E8]'"
          >
            <Tractor :size="12" aria-hidden="true" />
            <span>本地新农人 · 赵建国</span>
          </button>
        </div>

        <div class="phone-chassis relative w-[384px] h-[min(776px,calc(100vh-146px))] min-h-[620px] rounded-[3.25rem] p-[11px] bg-gradient-to-b from-[#3C3A35] via-[#21201D] to-[#34322D] shadow-[0_38px_84px_-24px_rgba(22,38,31,0.52),0_0_0_1px_rgba(255,255,255,0.22)_inset]">
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
