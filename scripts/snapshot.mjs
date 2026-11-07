/**
 * 每轮改版前留一份源码与文档快照。
 * 项目历史上不是 git 仓库，只能靠手动备份；保留这个脚本作为兜底。
 * 用法：npm run snapshot
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const targets = [
  'src', 'scripts', 'public',
  'index.html', 'vite.config.js', 'package.json',
  'README.md', 'PROJECT_HANDOVER.md', 'VISUAL_HANDOFF.md', '3D_HANDOFF.md'
]

const d = new Date()
const p = (n) => String(n).padStart(2, '0')
const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
const dest = join('.workbuddy', 'backup', `snapshot-${stamp}`)
mkdirSync(dest, { recursive: true })

const copied = []
for (const t of targets) {
  if (!existsSync(t)) continue
  cpSync(t, join(dest, t), { recursive: true })
  copied.push(t)
}

console.log(`[snapshot] 已备份 ${copied.length} 项到 ${dest}`)
console.log(`[snapshot] ${copied.join(', ')}`)
