/**
 * 吉韵新程 · 黑土粮仓 — 展览级 3D 舞台
 *
 * 统一提供：暖白画廊 IBL 环境反射、Neutral 色彩映射、柔和三点布光、
 * 半分辨率 GTAO 环境光遮蔽、双层柔和接触阴影、悬停射线拾取、
 * 相机飞行补间、帧率自适应降级与完整 GPU 资源回收。
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import gsap from 'gsap'
import { PALETTE, contactShadowTexture } from './textures.js'

/** 自建「暖白画廊」环境：顶部柔光天窗 + 暖金侧窗 + 冷白补光，供 PMREM 生成 IBL */
function buildGalleryEnvironment(renderer) {
  const env = new THREE.Scene()
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(24, 16, 24),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color().setRGB(0.90, 0.88, 0.84),
      side: THREE.BackSide,
      toneMapped: false
    })
  )
  env.add(room)

  const panel = (w, h, rgb, position, rotation) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().setRGB(rgb[0], rgb[1], rgb[2]),
        side: THREE.DoubleSide,
        toneMapped: false
      })
    )
    m.position.set(position[0], position[1], position[2])
    m.rotation.set(rotation[0], rotation[1], rotation[2])
    env.add(m)
  }

  // 顶部大面积柔光天窗（主反射条 + 副光栅条，勾勒高细分曲面与圆角倒角高光）
  panel(15, 9, [2.6, 2.52, 2.38], [0, 7.85, 0], [-Math.PI / 2, 0, 0])
  panel(5, 14, [1.75, 1.68, 1.54], [-6, 7.8, 0], [-Math.PI / 2, 0, 0])
  panel(3.2, 14, [2.1, 2.04, 1.92], [5.8, 7.8, 0], [-Math.PI / 2, 0, 0])
  // 琥珀金侧窗（金属件与烤漆暖调高光）
  panel(9, 7, [1.65, 1.24, 0.70], [-11.8, 1.5, 0], [0, Math.PI / 2, 0])
  // 冷白侧窗（玻璃与白瓷的清透边缘光）
  panel(9, 7, [1.36, 1.52, 1.68], [11.8, 1.5, 0], [0, -Math.PI / 2, 0])
  // 前向眼神光柔光带与后向轮廓光条
  panel(10, 4.5, [1.85, 1.80, 1.70], [0, 3.2, 11.8], [0, Math.PI, 0])
  panel(12, 3.6, [1.50, 1.32, 0.96], [0, 4.0, -11.8], [0, 0, 0])
  // 地面反弹光
  panel(18, 18, [0.88, 0.84, 0.76], [0, -7.85, 0], [Math.PI / 2, 0, 0])

  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()
  const rt = pmrem.fromScene(env, 0.035)

  env.traverse((o) => {
    if (o.geometry) o.geometry.dispose()
    if (o.material) o.material.dispose()
  })
  pmrem.dispose()
  return rt
}

const defaultConfig = {
  background: PALETTE.canvas,
  fov: 38,
  near: 0.1,
  far: 240,
  camera: [6, 4, 7],
  target: [0, 0, 0],
  minDistance: 3,
  maxDistance: 60,
  maxPolarAngle: Math.PI / 2 - 0.02,
  minPolarAngle: 0.12,
  exposure: 1.06,
  environmentIntensity: 0.72,
  hemiIntensity: 0.72,
  keyIntensity: 2.0,
  shadowSize: 2048,
  shadowFrustum: 12,
  shadowBias: -0.0004,
  shadowRadius: 4,
  ao: true,
  aoScale: 0.6,           // AO 内部计算分辨率比例（性能关键）
  aoRadius: 0.3,          // 世界空间 AO 采样半径
  aoIntensity: 0.42,
  aoSamples: 12,
  maxPixelRatio: 1.75,
  autoQuality: true,
  onQualityChange: null
}

/**
 * 创建统一舞台。返回对象包含 scene / camera / renderer / controls 等，
 * 组件只负责搭建内容与交互。
 */
export function createStage(container, options = {}) {
  const cfg = { ...defaultConfig, ...options }
  if (!container) return null

  const width = Math.max(container.clientWidth, 1)
  const height = Math.max(container.clientHeight, 1)

  /* ---------------- renderer ---------------- */
  // 虚拟机、老旧机房或关闭硬件加速时 WebGLRenderer 会直接抛错。
  // 这里返回 null，由 WebGLStage 包装层切换到乡村振兴主题的静态展签，避免整页白屏。
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
  } catch (e) {
    return null
  }
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  const cores = navigator.hardwareConcurrency || 4
  let quality = (isMobile || cores <= 2 || cfg.ao === false) ? 'lite' : 'high'
  let pixelRatio = Math.min(window.devicePixelRatio || 1, quality === 'high' ? cfg.maxPixelRatio : 1.25)
  renderer.setPixelRatio(pixelRatio)
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  // Khronos PBR Neutral：产品/展品级色彩映射，保留暖白而不压灰、不泛荧光
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = cfg.exposure
  renderer.shadowMap.enabled = true
  // r187 起 PCFSoftShadowMap 已移除，PCFShadowMap 配合 radius / normalBias 实现柔和半影
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.setClearColor(cfg.background, 1)
  container.appendChild(renderer.domElement)

  // 上下文丢失后立刻停帧，否则渲染循环会持续抛出 GL 错误。
  // 页面层的 WebGLStage 会在捕获阶段收到同一事件并切换为静态展签。
  const onContextLost = (e) => {
    e.preventDefault?.()
    renderer.setAnimationLoop(null)
  }
  renderer.domElement.addEventListener('webglcontextlost', onContextLost, false)

  /* ---------------- scene / camera ---------------- */
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(cfg.background)
  const envRT = buildGalleryEnvironment(renderer)
  scene.environment = envRT.texture
  scene.environmentIntensity = cfg.environmentIntensity

  const camera = new THREE.PerspectiveCamera(cfg.fov, width / height, cfg.near, cfg.far)
  camera.position.set(cfg.camera[0], cfg.camera[1], cfg.camera[2])

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.055
  controls.rotateSpeed = 0.62
  controls.zoomSpeed = 0.72
  controls.panSpeed = 0.6
  controls.target.set(cfg.target[0], cfg.target[1], cfg.target[2])
  controls.minDistance = cfg.minDistance
  controls.maxDistance = cfg.maxDistance
  controls.maxPolarAngle = cfg.maxPolarAngle
  controls.minPolarAngle = cfg.minPolarAngle
  controls.update()

  /* ---------------- 柔和三点布光 ---------------- */
  const hemi = new THREE.HemisphereLight(0xFFFFFF, 0xEDE6D8, cfg.hemiIntensity)
  scene.add(hemi)

  const key = new THREE.DirectionalLight(0xFFF8EA, cfg.keyIntensity)
  key.position.set(9, 14, 8)
  key.castShadow = true
  key.shadow.mapSize.set(cfg.shadowSize, cfg.shadowSize)
  key.shadow.bias = cfg.shadowBias
  key.shadow.normalBias = 0.018
  key.shadow.radius = cfg.shadowRadius
  const f = cfg.shadowFrustum
  key.shadow.camera.left = -f
  key.shadow.camera.right = f
  key.shadow.camera.top = f
  key.shadow.camera.bottom = -f
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 70
  key.shadow.camera.updateProjectionMatrix()
  scene.add(key)

  const fill = new THREE.DirectionalLight(0xDFEBF2, 0.58)
  fill.position.set(-10, 7, -6)
  scene.add(fill)

  const rim = new THREE.DirectionalLight(PALETTE.gold, 0.36)
  rim.position.set(-5, 3, -10)
  scene.add(rim)

  /* ---------------- 后期：GTAO + 色彩映射 ---------------- */
  let composer = null
  let aoPass = null
  let postOK = false

  const disposePost = () => {
    if (composer) {
      composer.passes.forEach((p) => p !== aoPass && p.dispose?.())
      composer.dispose()
    }
    if (aoPass) aoPass.dispose()
    composer = null
    aoPass = null
    postOK = false
  }

  const buildPost = () => {
    try {
      composer = new EffectComposer(renderer)
      composer.setPixelRatio(pixelRatio)
      composer.setSize(width, height)
      composer.addPass(new RenderPass(scene, camera))
      aoPass = new GTAOPass(
        scene,
        camera,
        Math.max(2, Math.round(width * pixelRatio * cfg.aoScale)),
        Math.max(2, Math.round(height * pixelRatio * cfg.aoScale)),
        undefined,
        {
          radius: cfg.aoRadius,
          distanceExponent: 1.35,
          thickness: 0.9,
          distanceFallOff: 1,
          scale: 1,
          samples: cfg.aoSamples,
          screenSpaceRadius: false
        },
        { radius: 5, samples: 12, rings: 2, lumaPhi: 8, depthPhi: 2, normalPhi: 2 }
      )
      aoPass.output = GTAOPass.OUTPUT.Default
      aoPass.blendIntensity = cfg.aoIntensity

      // 透明 / 折射物体不参与 AO 的 GBuffer，避免玻璃产生整片假暗斑
      const originalOverride = aoPass._overrideVisibility.bind(aoPass)
      aoPass._overrideVisibility = function () {
        originalOverride()
        const cache = this._visibilityCache
        scene.traverse((o) => {
          if (!o.isMesh || !o.visible) return
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          const isGlass = mats.some((m) => m && (
            m.userData?.excludeFromAO ||
            m.transmission > 0 ||
            (m.transparent && m.opacity < 0.8)
          ))
          if (isGlass || o.userData.excludeFromAO) {
            o.visible = false
            cache.push(o)
          }
        })
      }

      composer.addPass(aoPass)
      composer.addPass(new OutputPass())
      postOK = true
    } catch (err) {
      console.warn('[museum stage] 后期链不可用，已回退到直接渲染', err)
      disposePost()
    }
  }

  if (quality === 'high') buildPost()

  /* ---------------- 柔和接触阴影 ---------------- */
  const shadowMap = contactShadowTexture()
  const shadowGeo = new THREE.PlaneGeometry(1, 1)

  /**
   * 双层贴片式接触阴影：内层浓、外层散，叠在地面形成柔和的落地感。
   * 与真实 PCFSoft 阴影贴图互补，不需要额外场景渲染，帧率友好。
   */
  function addContactShadow({ size = 4, opacity = 0.55, position = [0, 0.01, 0], parent = scene } = {}) {
    const group = new THREE.Group()
    const layer = (scale, op) => {
      const mat = new THREE.MeshBasicMaterial({
        map: shadowMap,
        transparent: true,
        opacity: op,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -2
      })
      const mesh = new THREE.Mesh(shadowGeo, mat)
      mesh.rotation.x = -Math.PI / 2
      mesh.scale.set(scale, scale, 1)
      mesh.renderOrder = 2
      mesh.userData.excludeFromAO = true
      group.add(mesh)
    }
    layer(size, opacity)
    layer(size * 1.5, opacity * 0.38)
    group.position.set(position[0], position[1], position[2])
    group.userData.excludeFromAO = true
    parent.add(group)
    return group
  }

  /* ---------------- 悬停射线拾取 ---------------- */
  const cleanups = []

  function enablePicking(getTargets, handlers = {}) {
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let hovered = null
    let raf = 0

    const resolve = () => (typeof getTargets === 'function' ? getTargets() : getTargets) || []

    const hitTest = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(resolve(), true)
      return hits.length ? hits[0] : null
    }

    const onMove = (event) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const hit = hitTest(event)
        let obj = hit?.object || null
        // 上溯到打了 userData.pickKey 的语义部件
        while (obj && !obj.userData.pickKey && obj.parent) obj = obj.parent
        if (obj === hovered) {
          if (hit) handlers.onMove?.({ object: obj, hit, event })
          return
        }
        if (hovered) handlers.onLeave?.(hovered, event)
        hovered = obj || null
        renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab'
        if (hovered) handlers.onHover?.(hovered, hit, event)
      })
    }

    const onLeave = () => {
      if (hovered) handlers.onLeave?.(hovered)
      hovered = null
      renderer.domElement.style.cursor = 'grab'
    }

    const onClick = (event) => {
      const hit = hitTest(event)
      if (!hit) return
      let obj = hit.object
      while (obj && !obj.userData.pickKey && obj.parent) obj = obj.parent
      if (obj?.userData.pickKey) handlers.onClick?.(obj, hit, event)
    }

    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerleave', onLeave)
    renderer.domElement.addEventListener('click', onClick)
    renderer.domElement.style.cursor = 'grab'

    const off = () => {
      cancelAnimationFrame(raf)
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('pointerleave', onLeave)
      renderer.domElement.removeEventListener('click', onClick)
    }
    cleanups.push(off)
    return off
  }

  /* ---------------- 相机飞行 ---------------- */
  function flyTo({ position, target, duration = 1.45, ease = 'power3.inOut', onComplete } = {}) {
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(controls.target)
    const tl = gsap.timeline({ onComplete })
    if (position) {
      tl.to(camera.position, {
        x: position[0], y: position[1], z: position[2],
        duration, ease
      }, 0)
    }
    if (target) {
      tl.to(controls.target, {
        x: target[0], y: target[1], z: target[2],
        duration, ease,
        onUpdate: () => controls.update()
      }, 0)
    }
    return tl
  }

  /* ---------------- 尺寸与画质 ---------------- */
  function resize() {
    const w = Math.max(container.clientWidth, 1)
    const h = Math.max(container.clientHeight, 1)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (composer) {
      composer.setPixelRatio(pixelRatio)
      composer.setSize(w, h)
      if (aoPass) {
        // composer.setSize 会把 AO 撑到全分辨率，这里压回半分辨率
        aoPass.setSize(
          Math.max(2, Math.round(w * pixelRatio * cfg.aoScale)),
          Math.max(2, Math.round(h * pixelRatio * cfg.aoScale))
        )
      }
    }
  }

  function setQuality(next) {
    if (next === quality) return
    quality = next
    if (quality === 'lite') {
      disposePost()
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25)
    } else {
      pixelRatio = Math.min(window.devicePixelRatio || 1, cfg.maxPixelRatio)
      buildPost()
    }
    renderer.setPixelRatio(pixelRatio)
    resize()
    cfg.onQualityChange?.(quality)
  }

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => resize())
    : null
  resizeObserver?.observe(container)
  window.addEventListener('resize', resize)

  /* ---------------- 主循环 + 帧率自适应 ---------------- */
  const timer = new THREE.Timer()
  timer.connect(document)
  let running = false
  let warmup = 90
  let sampleTime = 0
  let sampleFrames = 0
  let slowStreak = 0

  const stage = {
    scene, camera, renderer, controls,
    get composer() { return composer },
    get aoPass() { return aoPass },
    get quality() { return quality },
    get hasPost() { return postOK },
    flyTo,
    enablePicking,
    addContactShadow,
    setQuality,
    resize,
    onCleanup(fn) { cleanups.push(fn) },
    start() {
      if (running) return
      running = true
      timer.reset()
      renderer.setAnimationLoop(loop)
    },
    stop() {
      running = false
      renderer.setAnimationLoop(null)
    },
    dispose
  }

  function loop(timestamp) {
    timer.update(timestamp)
    const dt = Math.min(timer.getDelta(), 0.05)
    const elapsed = timer.getElapsed()

    cfg.onFrame?.(dt, elapsed, stage)
    controls.update()

    if (postOK && composer) composer.render(dt)
    else renderer.render(scene, camera)

    if (cfg.autoQuality && quality === 'high' && warmup <= 0) {
      sampleTime += dt
      sampleFrames++
      if (sampleTime >= 1.6) {
        const avg = sampleTime / sampleFrames
        slowStreak = avg > 0.034 ? slowStreak + 1 : 0
        if (slowStreak >= 2) setQuality('lite')   // 连续低帧率自动关闭 AO 保证流畅
        sampleTime = 0
        sampleFrames = 0
      }
    }
    if (warmup > 0) warmup--
  }

  /* ---------------- 完整资源回收 ---------------- */
  function dispose() {
    stage.stop()
    timer.disconnect()
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(controls.target)
    resizeObserver?.disconnect()
    window.removeEventListener('resize', resize)
    cleanups.forEach((fn) => { try { fn() } catch (e) { /* noop */ } })
    cleanups.length = 0
    controls.dispose()

    scene.traverse((o) => {
      if (o.geometry && !o.geometry.userData?.shared) o.geometry.dispose()
      const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : [])
      mats.forEach((m) => {
        Object.keys(m).forEach((k) => {
          const v = m[k]
          if (v && v.isTexture && !v.userData?.shared) v.dispose()
        })
        m.dispose()
      })
    })
    shadowGeo.dispose()
    disposePost()
    if (envRT) envRT.dispose()
    renderer.domElement.removeEventListener('webglcontextlost', onContextLost, false)
    try {
      renderer.dispose()
    } catch (e) {
      // 上下文已丢失时释放可能失败，忽略即可，DOM 仍需移除
    }
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
  }

  return stage
}

/* ------------------------------------------------------------------ *
 * 交互高亮：微自发光描边（浅色场景里用暖金提亮，不用荧光）
 * ------------------------------------------------------------------ */
export function highlight(object, { color = PALETTE.gold, intensity = 0.22 } = {}) {
  if (!object) return
  object.traverse((o) => {
    if (!o.isMesh || !o.material?.emissive) return
    const m = o.material
    if (!m.userData.baseEmissive) {
      m.userData.baseEmissive = m.emissive.clone()
      m.userData.baseEmissiveIntensity = m.emissiveIntensity
    }
    m.emissive.setHex(color)
    m.emissiveIntensity = intensity
  })
}

export function clearHighlight(object) {
  if (!object) return
  object.traverse((o) => {
    if (!o.isMesh || !o.material?.emissive || !o.material.userData.baseEmissive) return
    const m = o.material
    m.emissive.copy(m.userData.baseEmissive)
    m.emissiveIntensity = m.userData.baseEmissiveIntensity
    delete m.userData.baseEmissive
  })
}
