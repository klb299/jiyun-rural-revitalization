import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const SITE = '一厘米，四十公里'
const DEFAULT_DESC = '以 Vue 3 与 Three.js 构建的乡村振兴数字展馆，包含黑土地质标本、北斗智慧农机、松辽平原生态沙盘三座实时 3D 展厅与互动科普实验室。'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: '序厅 · 总览',
      description: '吉林现代数字乡村振兴与生态农业 3D 展馆序厅，从黑土粮仓出发，进入微观土壤、工业装备与宏观平原三条参观动线。'
    }
  },
  {
    path: '/strata-3d',
    name: 'SoilStrata3D',
    component: () => import('../views/SoilStrataView.vue'),
    meta: {
      title: '3D黑土地质标本展',
      description: '按真实层厚堆叠的一米黑土剖面，可分层展开、层位探针对焦，读懂腐殖质层、淀积层与黄土母质的成土过程及梨树模式保育原理。'
    }
  },
  {
    path: '/machinery-3d',
    name: 'Machinery3D',
    component: () => import('../views/MachineryView.vue'),
    meta: {
      title: '3D北斗农机解构馆',
      description: '260 马力北斗无人拖拉机的三维爆炸分解，逐一读取 RTK 天线、混合动力总成、全景电控舱与低压宽胎的装配逻辑。'
    }
  },
  {
    path: '/sandbox-3d',
    name: 'Sandbox3D',
    component: () => import('../views/SandboxView.vue'),
    meta: {
      title: '3D数字生态微缩沙盘',
      description: '按东北真实农田地貌重做的松辽平原数字孪生，黑土格网、行列防护林、蜿蜒松花江与清洁能源机组，支持六视点飞行。'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: {
      title: '黑土振兴数智大屏',
      description: '把土壤墒情、有机质、积温与农机作业状态汇总到同一张展台，用数据看懂黑土保护成效与粮食保供调度。'
    }
  },
  {
    path: '/journey',
    name: 'Journey',
    component: () => import('../views/JourneyView.vue'),
    meta: {
      title: '一粒米的数字旅程',
      description: '五幕物候剧情串起约 180 天稻作周期，从秸秆覆盖冬养、雪水灌溉、稻蟹共生到低温慢烘与一袋一码溯源。'
    }
  },
  {
    path: '/chagan-lake',
    name: 'ChaganLake',
    component: () => import('../views/ChaganLakeView.vue'),
    meta: {
      title: '查干湖冬捕生态非遗馆',
      description: '祭湖醒网、马拉绞盘、万尾腾跃、抓大放小，四段国家级非遗仪轨串起一套取之有度的生态智慧与冰雪富民产业。'
    }
  },
  {
    path: '/solar-terms',
    name: 'SolarTerms',
    component: () => import('../views/SolarTermsView.vue'),
    meta: {
      title: '二十四节气吉林农时谱',
      description: '把二十四节气与吉林农事一一对应，看春生、夏长、秋收、冬藏如何与现代农业气象、北斗农机和黑土保育叠在一起。'
    }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../views/ProductsView.vue'),
    meta: {
      title: '吉林风物特产集市',
      description: '黑土粳稻、黄金玉米、长白山林特与查干湖生态渔业四类物产，标注产地、认证与流通方式，让助农成为一条可追溯的链。'
    }
  },
  {
    path: '/aid-projects',
    name: 'AidProjects',
    component: () => import('../views/AidProjectsView.vue'),
    meta: {
      title: '助农项目库',
      description: '六类带农路径的方位索引与项目档案，按问题、做法、带农成效三段整理，主体与机制均取自公开可查的现实对象。'
    }
  },
  {
    path: '/adopt-a-field',
    name: 'AdoptField',
    component: () => import('../views/AdoptFieldView.vue'),
    meta: {
      title: '认养一亩田',
      description: '教学演示的认养流程：选示意地块、走春耕夏管秋收直邮四步、看生长阶段与收益去向，不产生真实交易。'
    }
  },
  {
    path: '/farm-income',
    name: 'FarmIncome',
    component: () => import('../views/FarmIncomeView.vue'),
    meta: {
      title: '一块地，五笔收入',
      description: '土地托管、订单收购、合作社分红、就地务工与品牌溢价五条带农机制，逐条写清谁参与、钱从哪来、风险谁担。'
    }
  },
  {
    path: '/last-mile',
    name: 'LastMile',
    component: () => import('../views/LastMileView.vue'),
    meta: {
      title: '最后一公里实验室',
      description: '把 2025 至 2026 年公开讨论的乡村振兴痛点做成三个交互实验：保护性耕作见效周期、涉农数据孤岛、小农户投入产出账。'
    }
  },
  {
    path: '/exhibit-map',
    name: 'ExhibitMap',
    component: () => import('../views/ExhibitMapView.vue'),
    meta: {
      title: '展览地图 · 策展动线总览',
      description: '把十三个展陈单元按微观黑土、工业装备、宏观平原、人文农时、助农机制与落地痛点排成一条抽象策展动线，一处看全展结构。'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: '长春智库与答辩白皮书',
      description: '选题背景、技术架构、科教支撑、答辩自述与展陈数据口径说明，附长春科研院所与农高区的现实坐标。'
    }
  },
  {
    path: '/science',
    name: 'Science',
    component: () => import('../views/ScienceView.vue'),
    meta: {
      title: '互动科普实验室',
      description: '三个可上手的 Three.js 科普实验：黑土团粒与孔隙、稻作生长五阶段、北斗 RTK 定位原理与误差演示。'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: {
      title: '数字展馆管理后台',
      description: '策展内容管理：地层档案、农机部件参数、沙盘漫游视点、访客留言与展馆设置。'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: '这条动线暂未开放 · 404',
      description: '未找到对应展陈单元，可从导览页重新进入黑土地质标本馆、北斗农机解构馆、生态沙盘、互动科普实验室与助农项目库。'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    // 带锚点的导航交给 afterEach 在布局稳定后精确对齐
    if (to.hash) return false
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

/** 同步 description 与分享卡标签，缺标签时自动补齐 */
function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

router.beforeEach((to, _from, next) => {
  const title = to.meta.title ? `${to.meta.title} - ${SITE}` : SITE
  const description = to.meta.description || DEFAULT_DESC
  document.title = title
  upsertMeta('name', 'description', description)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  next()
})

// 跨页锚点：路由视图与入场动效稳定后再定位，避免落在区块中部。
// 首次直接访问 URL 时异步 chunk 可能晚于首跳，因此做一次即时校正。
router.afterEach((to) => {
  if (!to.hash) return
  const align = (instant) => {
    try {
      const el = document.querySelector(to.hash)
      if (!el) return
      const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 92)
      window.scrollTo({ top, behavior: instant ? 'instant' : 'smooth' })
    } catch (e) {
      // 非法选择器时静默跳过，不影响导航
    }
  }
  window.setTimeout(() => align(false), 420)
  window.setTimeout(() => align(true), 1250)
})

export default router
