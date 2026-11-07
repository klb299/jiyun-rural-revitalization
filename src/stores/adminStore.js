/**
 * 数字展馆后台管理状态
 * 独立于展陈前台的 appStore，数据全部落在 localStorage，无后端依赖。
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'jiyun-admin-v1'
const SESSION_KEY = 'jiyun-admin-session'
const ADMIN_PASSWORD = 'admin123456'

const defaultStrata = [
  {
    id: 's1', name: '0-20cm 腐殖质熟化耕作表层', depth: '0 ~ 20 cm',
    colorHex: '#221E19', organic: '4.82% 有机质活化层',
    feature: '万年腐殖黑土 · 团粒蓄水',
    desc: '东北黑土最核心的耕作层，每厘米孕育历经两百年自然沉积。团粒多孔结构如天然海绵，保水保肥与透气性极佳。'
  },
  {
    id: 's2', name: '20-50cm 淀积过渡心土层', depth: '20 ~ 50 cm',
    colorHex: '#42362B', organic: '2.40% 紧密保墒层',
    feature: '细密胶体拦截 · 防止淋溶',
    desc: '棕黑黏粒过渡带，有效阻隔养分深层流失，拦截春季融雪与夏季雨水下渗，形成天然根系蓄墒水库。'
  },
  {
    id: 's3', name: '50-100cm 马兰黄土第四纪母质层', depth: '50 ~ 100 cm',
    colorHex: '#7C674E', organic: '0.85% 原始矿物层',
    feature: '深层钙质沉积 · 矿质丰盈',
    desc: '古老松辽平原第四纪风积黄土母质，蕴含富饶的钾、钙、磷等微量矿物元素，提供长久稳固的地质生境底蕴。'
  }
]

const defaultParts = [
  {
    id: 'p1', tag: '整机总成', title: '长春造 · 北斗 5G 无人智慧拖拉机整机',
    specs: '260 马力重负荷柴电混动',
    desc: '集成一汽工业底蕴与长春现代智能农机核心技术，支持超低温全天候自主作业，北斗高精度平准垄作。'
  },
  {
    id: 'p2', tag: '制导导航', title: '北斗三号双频 RTK 卫星定位天线',
    specs: '定位精度 ±2.5 cm · 厘米级',
    desc: '自动接收北斗地基增强站信号，自主规划地块耕作航线，支持夜间与雨雪浓雾盲视起垄作业。'
  },
  {
    id: 'p3', tag: '动力核心', title: '大扭矩智能混合动力总成',
    specs: '低转速超大扭矩 · 节油 25%',
    desc: '专为东北深翻深松重阻力黑土设计，动力输出平顺强悍，有效减少黑土压实硬化。'
  },
  {
    id: 'p4', tag: '车载中枢', title: '数字化全景智能电控舱',
    specs: '数字座舱 + 远程 5G 冗余控制',
    desc: '内置农情决策芯片，实时监测发动机扭矩、滑移率及排气温度，可实现单人远程调度多台机群。'
  },
  {
    id: 'p5', tag: '底盘接地', title: '低压宽断面环保高浮力农用胎',
    specs: '超低接地比压 · 护土防压实',
    desc: '特种耐低温橡胶配方与超宽胎面，显著分散机身重量，严格保护黑土微观孔隙与蚯蚓生态通道。'
  },
  {
    id: 'p6', tag: '承载车架', title: '重载刚性车架与后桥传动总成',
    specs: '双侧纵梁 · 全时四驱',
    desc: '高强度刚性车架承受深松作业巨大牵引阻力，前后配重平衡与低速大扭矩输出，确保黑土深耕不压实。'
  }
]

const defaultViewpoints = [
  { id: 'overview', name: '全域宏观全景', desc: '俯瞰松辽平原现代生态粮仓整体布局', tag: '默认视点' },
  { id: 'blacksoil', name: '黄金黑土示范田', desc: '免耕秸秆覆盖保水保墒核心科研田', tag: '农田' },
  { id: 'silo', name: '现代恒温数字粮仓', desc: '充氮气调减损与数字粮情监控仓群', tag: '设施' },
  { id: 'smartdrone', name: '植保巡检无人机', desc: '多光谱成像与病虫害长势 AI 巡检', tag: '装备' },
  { id: 'greenhouse', name: '光伏农业大棚', desc: '板上绿电发电、板下有机果蔬种植', tag: '能源' },
  { id: 'windpower', name: '清洁能源风电', desc: '白城松原吉林风电赋能现代低碳乡村', tag: '能源' }
]

const defaultMessages = [
  { id: 'm1', name: '李老师', hall: '黑土地质标本馆', text: '第三层母质能不能加个放大按钮？', time: '11-04 09:12', approved: false },
  { id: 'm2', name: '王同学', hall: '北斗农机解构馆', text: '爆炸图挺帅的，就是想看轮胎花纹细节', time: '11-04 10:38', approved: false },
  { id: 'm3', name: '参观者 0327', hall: '生态微缩沙盘', text: '沙盘地面现在像真黑土了，好评', time: '11-04 13:05', approved: true },
  { id: 'm4', name: '张老师', hall: '生态微缩沙盘', text: '手机上有点卡，能不能默认开流畅模式', time: '11-03 16:41', approved: false },
  { id: 'm5', name: '赵同学', hall: '序厅', text: '三个展厅入口再明显一点就好了', time: '11-03 14:20', approved: true },
  { id: 'm6', name: '参观者 1180', hall: '黑土地质标本馆', text: '取样探针那个小细节很喜欢', time: '11-02 11:09', approved: true }
]

const defaultVisits = [
  { date: '10-29', count: 1180, avg: 186 },
  { date: '10-30', count: 1362, avg: 192 },
  { date: '10-31', count: 1298, avg: 205 },
  { date: '11-01', count: 1740, avg: 211 },
  { date: '11-02', count: 2036, avg: 224 },
  { date: '11-03', count: 1894, avg: 218 },
  { date: '11-04', count: 2412, avg: 236 }
]

const defaultSettings = {
  galleryTitle: '吉韵新程 · 黑土粮仓',
  notice: '三大 3D 展厅已完成展览级视觉升级，黑土地表按东北真实农田地貌重做。',
  defaultQuality: 'high',
  autoTour: true,
  allowMessages: true,
  visitorCounter: 128450,
  contactEmail: 'curator@jiyun-gallery.cn'
}

function readStorage() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export const useAdminStore = defineStore('admin', () => {
  const saved = readStorage()

  const authed = ref(typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_KEY) === '1')
  const strata = ref(saved?.strata || structuredClone(defaultStrata))
  const parts = ref(saved?.parts || structuredClone(defaultParts))
  const viewpoints = ref(saved?.viewpoints || structuredClone(defaultViewpoints))
  const messages = ref(saved?.messages || structuredClone(defaultMessages))
  const visits = ref(saved?.visits || structuredClone(defaultVisits))
  const settings = ref(saved?.settings || { ...defaultSettings })

  const pendingCount = computed(() => messages.value.filter((m) => !m.approved).length)
  const contentCount = computed(() => strata.value.length + parts.value.length + viewpoints.value.length)
  const todayVisits = computed(() => visits.value.length ? visits.value[visits.value.length - 1].count : 0)
  const hallHeat = computed(() => [
    { name: '黑土地质标本馆', value: 38 },
    { name: '北斗农机解构馆', value: 31 },
    { name: '生态微缩沙盘', value: 47 }
  ])

  function persist() {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        strata: strata.value,
        parts: parts.value,
        viewpoints: viewpoints.value,
        messages: messages.value,
        visits: visits.value,
        settings: settings.value
      }))
    } catch (e) {
      // 存储配额不足时保持内存态即可
    }
  }

  watch([strata, parts, viewpoints, messages, visits, settings], persist, { deep: true })

  function login(password) {
    if (password !== ADMIN_PASSWORD) return false
    authed.value = true
    if (typeof window !== 'undefined') window.sessionStorage.setItem(SESSION_KEY, '1')
    return true
  }

  function logout() {
    authed.value = false
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY)
  }

  const collections = { strata, parts, viewpoints }

  function upsert(type, form) {
    const list = collections[type]
    if (!list) return
    if (form.id) {
      const i = list.value.findIndex((x) => x.id === form.id)
      if (i >= 0) list.value[i] = { ...form }
      else list.value.push({ ...form })
    } else {
      list.value.push({ ...form, id: `${type}-${Date.now()}` })
    }
  }

  function remove(type, id) {
    const list = collections[type]
    if (!list) return
    list.value = list.value.filter((x) => x.id !== id)
  }

  function approveMessage(id) {
    const m = messages.value.find((x) => x.id === id)
    if (m) m.approved = true
  }

  function removeMessage(id) {
    messages.value = messages.value.filter((x) => x.id !== id)
  }

  function addMessage(form) {
    messages.value.unshift({
      id: `m-${Date.now()}`,
      name: form.name || '后台录入',
      hall: form.hall || '全馆',
      text: form.text || '',
      time: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
      approved: true
    })
  }

  function updateSettings(next) {
    settings.value = { ...settings.value, ...next }
  }

  function resetAll() {
    strata.value = structuredClone(defaultStrata)
    parts.value = structuredClone(defaultParts)
    viewpoints.value = structuredClone(defaultViewpoints)
    messages.value = structuredClone(defaultMessages)
    visits.value = structuredClone(defaultVisits)
    settings.value = { ...defaultSettings }
    persist()
  }

  return {
    authed, strata, parts, viewpoints, messages, visits, settings,
    pendingCount, contentCount, todayVisits, hallHeat,
    login, logout, upsert, remove, approveMessage, removeMessage,
    addMessage, updateSettings, resetAll
  }
})
