/**
 * 一键跑全部视觉 / 可访问性探针，并汇总每段 ### Result。
 *
 * 前置：另开一个终端跑
 *   npm run preview -- --host 127.0.0.1 --port 4173
 * 用法：
 *   npm run audit
 * 若 playwright-cli 不在 PATH，可设 PLAYWRIGHT_CLI=/path/to/playwright-cli。
 *
 * 注意：open 与所有 run-code 必须拼进同一条 shell 命令。跨 shell 调用时
 * playwright 的浏览器会话会被回收，报 "Browser 'default' is not open"。
 */
import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const BASE = 'http://127.0.0.1:4173'
const probes = [
  'audit-contrast.js',
  'audit-mobile.js',
  'audit-links.js',
  'audit-detail.js',
  'audit-interactions.js',
  'audit-round19.js',
  'audit-a11y.js'
]

// playwright-cli 通常与 node 同目录，补进 PATH 免得每次手动 export
process.env.PATH = `${dirname(process.execPath)}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}`
const cli = process.env.PLAYWRIGHT_CLI || 'playwright-cli'

try {
  const r = await fetch(`${BASE}/`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
} catch {
  console.error(`[audit] 预览服务不可达：${BASE}/`)
  console.error('请先在另一个终端执行：npm run preview -- --host 127.0.0.1 --port 4173')
  process.exit(1)
}

const logDir = '.workbuddy/audit'
mkdirSync(logDir, { recursive: true })

const commands = [
  `${cli} open --browser=chrome ${BASE}/`,
  ...probes.map(p => `${cli} run-code --filename .workbuddy/tools/${p}`)
]
let all = ''
try {
  all = execSync(commands.join(' && '), {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe']
  })
} catch (e) {
  all = `${e.stdout || ''}\n${e.stderr || ''}`
}

writeFileSync(`${logDir}/latest.log`, all, 'utf8')

const results = [...all.matchAll(/### Result\r?\n([\s\S]*?)(?=\r?\n### Ran)/g)].map(m => m[1].trim())
let failed = 0
probes.forEach((p, i) => {
  const r = results[i]
  console.log(`\n=== ${p} ===`)
  if (!r) { failed++; console.log('（未取到 Result，详见 .workbuddy/audit/latest.log）'); return }
  console.log(r.length > 1600 ? `${r.slice(0, 1600)}\n…（已截断，完整结果见日志）` : r)
})

console.log(`\n[audit] ${probes.length - failed}/${probes.length} 个探针取到结果，完整日志：${logDir}/latest.log`)
if (failed) process.exitCode = 1
