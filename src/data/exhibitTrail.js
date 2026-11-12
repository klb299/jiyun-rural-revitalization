/**
 * 全站策展动线的单一数据源。
 *
 * 13 个展陈单元的顺序、路由、尺度段与五大振兴归属都写在这里，
 * 供全局「动线续接」组件、展览地图视角说明与方向转场共用。
 * 与 ExhibitMapView.vue 的 segments 通过编号 no 关联：新增单元时两处都要补一行，
 * 编号、路由、名称必须一致（数量口径 13 单元 / 6 段尺度 / 5 个振兴维度）。
 *
 * 人才振兴在本展馆没有对应单元，这是策展边界，不硬凑，见 NEXT_PHASE.md 答辩口径。
 */
export const trail = [
  { no: '01', path: '/strata-3d', name: '黑土地质标本馆', scale: '微观', pillar: '生态振兴', tagline: '一米剖面，读懂黑土怎么长出来' },
  { no: '02', path: '/science', name: '互动科普实验室', scale: '微观', pillar: '生态振兴', tagline: '四个可上手的 3D 原理实验' },
  { no: '03', path: '/machinery-3d', name: '北斗农机解构馆', scale: '工业', pillar: '产业振兴', tagline: '把一台智能拖拉机拆开看' },
  { no: '04', path: '/dashboard', name: '黑土振兴数智驾驶舱', scale: '工业', pillar: '产业振兴', tagline: '遥测与保供调度汇到一张展台' },
  { no: '05', path: '/sandbox-3d', name: '松辽平原生态沙盘', scale: '宏观', pillar: '生态振兴', tagline: '六个视点重新看整片平原' },
  { no: '06', path: '/journey', name: '一粒米的旅程', scale: '人文', pillar: '产业振兴', tagline: '五幕物候串起一百八十天' },
  { no: '07', path: '/solar-terms', name: '二十四节气吉林农时谱', scale: '人文', pillar: '文化振兴', tagline: '节气与吉林农事一一对应' },
  { no: '08', path: '/chagan-lake', name: '查干湖冬捕生态非遗馆', scale: '人文', pillar: '文化振兴', tagline: '四段非遗仪轨与取之有度' },
  { no: '09', path: '/products', name: '吉林风物特产集市', scale: '人文', pillar: '产业振兴', tagline: '产地、认证与流通方式' },
  { no: '10', path: '/aid-projects', name: '助农项目库', scale: '助农', pillar: '组织振兴', tagline: '六类带农路径的项目档案' },
  { no: '11', path: '/adopt-a-field', name: '认养一亩田', scale: '助农', pillar: '产业振兴', tagline: '从春耕到直邮的示意流程' },
  { no: '12', path: '/farm-income', name: '一块地五笔收入', scale: '助农', pillar: '组织振兴', tagline: '收益与风险写在同一页' },
  { no: '13', path: '/last-mile', name: '最后一公里实验室', scale: '痛点', pillar: '组织振兴', tagline: '把落不了地的原因也摆成展品' }
]

const FOYER = {
  no: '00', path: '/', name: '序厅 · 总览', scale: '起点', pillar: '策展起点',
  tagline: '从整片黑土的坐标重新出发', isBoundary: true
}
const MAP = {
  no: '—', path: '/exhibit-map', name: '展览地图', scale: '终点', pillar: '策展总览',
  tagline: '按尺度或按五大振兴重看全展', isBoundary: true
}

export const unitOf = (path) => trail.find((u) => u.path === path) || null
export const indexOfPath = (path) => trail.findIndex((u) => u.path === path)

export function prevOf(path) {
  const i = indexOfPath(path)
  if (i < 0) return null
  return i === 0 ? FOYER : trail[i - 1]
}

export function nextOf(path) {
  const i = indexOfPath(path)
  if (i < 0) return null
  return i === trail.length - 1 ? MAP : trail[i + 1]
}
