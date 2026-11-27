import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '..', 'dist')
const HOST = '127.0.0.1'
const BASE_PORT = Number(process.env.PORT || 4173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
}

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('[ERROR] 未找到 dist/index.html，请先运行 npm run build。')
  process.exit(1)
}

function createServer() {
  return http.createServer((req, res) => {
    const rawUrl = (req.url || '/').split('?')[0]
    let decoded = '/'
    try {
      decoded = decodeURIComponent(rawUrl)
    } catch {
      decoded = '/'
    }

    const safeRel = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '')
    let target = path.join(distDir, safeRel)

    // Directory or missing SPA route -> fallback to index.html
    if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) {
      const idxInDir = path.join(target, 'index.html')
      if (fs.existsSync(idxInDir) && fs.statSync(idxInDir).isFile()) {
        target = idxInDir
      } else {
        target = path.join(distDir, 'index.html')
      }
    }

    const ext = path.extname(target).toLowerCase()
    const contentType = MIME[ext] || 'application/octet-stream'
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    })
    fs.createReadStream(target).pipe(res)
  })
}

function openBrowser(url) {
  if (process.env.NO_OPEN === '1') return
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '""', url], { detached: true, stdio: 'ignore' }).unref()
  } else if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref()
  } else {
    spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref()
  }
}

function listenWithFallback(port, attemptsLeft = 15) {
  const server = createServer()
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      listenWithFallback(port + 1, attemptsLeft - 1)
    } else {
      console.error('[ERROR] 启动本地服务失败:', err.message)
      process.exit(1)
    }
  })
  server.listen(port, HOST, () => {
    const url = `http://${HOST}:${port}/`
    console.log('================================================================')
    console.log('  《吉韵禾野》乡村振兴双端协同数字平台 · 本地服务已启动')
    console.log('================================================================')
    console.log(`  主入口（四端门户） : ${url}`)
    console.log(`  双身份移动端 App   : ${url}app`)
    console.log(`  双端同屏实训台     : ${url}split`)
    console.log(`  四岗位管理后台     : ${url}admin`)
    console.log(`  县域数智指挥大屏   : ${url}bigscreen`)
    console.log(`  横版 3D 数字展馆   : ${url}museum`)
    console.log(`  四季互动科普游戏   : ${url}game`)
    console.log('----------------------------------------------------------------')
    console.log('  正在自动打开浏览器…… 关闭此窗口或按 Ctrl+C 即可停止服务。')
    console.log('================================================================')
    openBrowser(url)
  })
}

listenWithFallback(BASE_PORT)
