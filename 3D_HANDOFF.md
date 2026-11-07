# 3D 模块交接说明（给外部 AI / 新同事）

> 本文件是「吉韵新程 · 黑土粮仓」Vue 3 + Three.js 展馆 3D 部分的完整上下文。
> 把它连同下面提到的源文件一起交给另一个 AI，它就能直接改 3D 外观、模型与交互，不需要重新摸索工程。

---

## 0. 一句话定位

这是一个**纯程序化生成**的农业数字展馆：没有外部模型文件（`.glb` / `.obj`）、没有外部贴图、没有网络请求。
所有几何、纹理、图版都由代码在运行时生成，因此改外观 = 改代码参数，不需要美术资源。

技术栈：Vue 3.5（`<script setup>`）、Three.js 0.187、Vite 8、GSAP 3.15、Tailwind CSS 4。

---

## 1. 文件地图：改什么就动哪个

### 1.1 3D 核心层（`src/three/`）

| 文件 | 行数 | 职责 | 什么时候动它 |
| --- | --- | --- | --- |
| `src/three/textures.js` | 1311 | **材质与纹理工厂**：所有程序化贴图（黑土团粒、垄沟、秸秆、砂石、草甸、河岸、纸质、木纹、瓷釉、拉丝金属）+ 几何工具（圆角盒、车削、倒角柱、顶点扰动、描边、弧面叶、翼型叶片、螺旋弹簧、雕塑团粒、精细稻株/玉米株）+ 风摆与水波动效 | 想改任何物件的表面质感、颜色、颗粒感或植株/叶片造型时 |
| `src/three/stage.js` | 540 | **统一舞台**：IBL 环境光、GTAO 后处理、软阴影、相机飞行、射线拾取、高亮描边、性能自适应 | 想改光照、后期、相机手感、拾取行为时 |
| `src/three/scienceScenes.js` | 544 | **科普实验室三个场景**：黑土团粒、稻作生长、北斗 RTK | 想改这三个科普实验时 |

### 1.2 三个主展厅场景组件（`src/components/`）

| 文件 | 行数 | 场景 | 关键结构 |
| --- | --- | --- | --- |
| `RuralSandbox3D.vue` | 2387 | 松辽平原生态微缩沙盘 | 地貌参数 `RIVER_Z(x)` / `RIVER_DZ(x)` 解析河道曲线；`FIELD_BLOCKS` 规整田块网格；`buildFieldBlocks` / `buildRoadNetwork` / `buildRiverBanks` / `buildFarmFacilities` 分区构建 |
| `SmartMachinery3D.vue` | 942 | 北斗无人拖拉机工业摄影棚 | `buildChassis` / `buildEngine` / `buildCabin` / `buildAntenna` / `buildWheels`；部件聚焦与爆炸分解 |
| `SoilStrata3D.vue` | 795 | 黑土地质标本馆（亚克力罩内三层剖面） | `layerConfigs` 层位表；`buildStrata` / `buildSeedlings` / `buildGlassCase` / `buildScaleRuler`；抽屉式分层展开 |

### 1.3 科普实验室

| 文件 | 行数 | 职责 |
| --- | --- | --- |
| `src/components/science/ScienceStage.vue` | 100 | 单个共享 3D 舞台容器，按 `mode` 重建场景，复用 `createStage` |
| `src/views/ScienceView.vue` | — | 页面：三个实验 tab、控制面板、实验档案卡片 |

### 1.4 与 3D 无关（别让外部 AI 动错文件）

`src/components/RuralDashboardCharts.vue`、`src/components/AdminCharts.vue` 是 ECharts 二维图表，不是 3D。
`src/views/*.vue` 是页面排版层，只有 `SandboxView / SoilStrataView / MachineryView / ScienceView` 会挂 3D 组件。

---

## 2. 最小可运行骨架

任何新的 3D 场景都按这个模式写：

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { createStage, highlight } from '../three/stage.js'
import { porcelainMaterial, roundedBox } from '../three/textures.js'

const containerRef = ref(null)
let stage = null

onMounted(() => {
  stage = createStage(containerRef.value, {
    background: '#F7F4EE',
    fov: 38,
    camera: [5, 3.5, 6.5],
    target: [0, 0, 0],
    shadowSize: 1024,
    ao: true,
    onFrame: (dt, t) => { /* 每帧动画写这里 */ }
  })

  const mesh = new THREE.Mesh(roundedBox(2, 1, 2, 0.1, 6), porcelainMaterial())
  mesh.castShadow = true
  stage.scene.add(mesh)

  stage.enablePicking(() => [mesh], {
    onClick: (obj) => console.log('clicked', obj)
  })
  stage.start()
})

onUnmounted(() => stage?.dispose())
</script>

<template>
  <div ref="containerRef" class="w-full h-full"></div>
</template>
```

---

## 3. 材质工厂速查（`textures.js`）

所有材质工厂都返回新的 `THREE.MeshStandardMaterial`（或 Physical），纹理由 Canvas 程序化绘制并缓存。

### 3.1 农业地表类

```js
chernozemMaterial({ repeat:[10,10], bumpScale:0.028, roughness:0.96 })  // 黑土团粒，深棕
furrowMaterial({ repeat:[5,2], bumpScale:0.05 })      // 起垄耕地的平行垄沟
stubbleMaterial({ repeat:[7,7], bumpScale:0.022 })    // 免耕秸秆碎屑，暗金褐
gravelMaterial({ repeat:[8,1], bumpScale:0.018 })     // 砂石机耕路，含两道车辙
grassMaterial({ repeat:[8,8], bumpScale:0.018 })      // 草甸细草点
meadowMaterial({ repeat:[14,14], bumpScale:0.016 })   // 田边休耕裸地，浅暖褐
bankMaterial({ repeat:[8,1], bumpScale:0.024 })       // 河岸卵石湿滩
soilMaterial(color, seed, { repeat, bumpScale })      // 通用土壤（老接口）
```

### 3.2 展陈物件类

```js
porcelainMaterial({ repeat:[2,2], roughness:0.28 })  // 白瓷釉（粮仓、卫星）
metalMaterial(color, { roughness:0.3, metalness:0.86, repeat:[2,2] })
lacquerMaterial(color, { roughness:0.26, metalness:0.16, clearcoat:0.9 })
paperMaterial({ repeat:[4,4], color, roughness:0.86 })
woodMaterial({ repeat:[2,2], color, roughness:0.62 })
ridgeMaterial(color, { repeat:[4,1], roughness:0.78 })   // 平行脊线（田垄、屋脊）
fabricMaterial(color, { repeat:[3,3], roughness:0.9 })
rubberMaterial({ repeat:[3,2], roughness:0.9 })
glassMaterial({...}) / sheerGlassMaterial({ tint:0xBBD9E4, opacity:0.34, roughness:0.12 })
```

### 3.3 几何工具

```js
roundedBox(w, h, d, radius=0.06, segments=5)   // 圆角盒（主力零件）
lathe(points, segments=64)                     // 车削体（粮仓锥顶、塔筒）
bevelCylinder(radius, height, { bevel, segments, arcSegments, bottomScale })
displace(geometry, fn, recomputeNormals=true)   // 顶点扰动，fn 返回 [x,y,z] 偏移
edgeLines(geometry, { color, opacity, threshold })  // 描边

// 高精度有机几何（2026-11-05 装配完成，均已接入场景）
curvedLeafGeometry({ length, width, arch, droop, twist, midrib, segU, segV })
coilSpringGeometry({ radius, tubeRadius, height, turns, tubularSegments, radialSegments })
airfoilBladeGeometry(length, maxChord, segU, segV)   // NACA 弯度翼型 + 根部圆过渡 + 扭转
sculptedAggregateGeometry(radius, detail, seed, amp) // 噪声雕塑团粒 / 结核
makeDetailedRiceStalkGeometry({ height, grainCount, leafCount, widthScale })
makeDetailedCornStalkGeometry({ height })
```

**注意**：`curvedLeafGeometry` 生成的是单层曲面（无厚度），用它的植株材质必须设 `side: THREE.DoubleSide`，否则背面叶片会被剔除。稻株的 `widthScale` 用于株高放大时同步加宽茎/叶/谷粒，默认 1；科普实验里株高 0.95 时用 1.6，否则远景看会像一丛干草。其余闭合几何（翼型、弹簧、团粒）绕序朝外，可用默认 FrontSide。

### 3.4 动效

```js
const update = applyWind(material, { amount:0.06, speed:1.5, phaseScale:0.8 })
update(t)   // 在 onFrame 里每帧调用；材质必须是双面才有明显效果

const update = applyWave(material, { amplitude, speed, frequency,
  verticalAxis:'z'|'y', phaseFromZ:true })
```

### 3.5 其它

```js
labelTexture(text, { width, height, font, color })  // 生成文字贴图（展签、铭牌）
glowSprite(color)                                   // 径向光晕贴图
waterNormalMap(repeat) / contactShadowTexture()
mulberry32(seed)   // 可复现随机
fbm(u, v, seed, octaves, basePeriod)  // 噪声
PALETTE / CSS
```

---

## 4. 舞台 API（`stage.js`）

`createStage(container, options)` 返回：

| 成员 | 说明 |
| --- | --- |
| `stage.scene / camera / renderer / controls` | 直接操作 |
| `stage.start() / stop() / dispose()` | 生命周期，`dispose()` 会释放渲染器、后期、PMREM 与场景内全部材质几何 |
| `stage.flyTo({ position, target, duration, ease, onComplete })` | 相机平滑飞行，1.45s 默认 |
| `stage.enablePicking(getTargets, { onHover, onLeave, onClick })` | `getTargets` 每次都调用以返回最新数组；被拾取的 group 需设 `userData.pickKey` 或 `userData.key` |
| `stage.addContactShadow({ size, opacity, position, parent })` | 接地软阴影，`parent` 可指定挂到自定义 group |
| `stage.onCleanup(fn)` | 注册清理回调 |
| `stage.setQuality('high'|'low')` / `stage.quality` | 性能档位（`autoQuality` 自动降级） |
| `stage.resize()` | 手动触发尺寸更新 |

默认参数（`defaultConfig`）：`fov 38`、`exposure 1.06`、`environmentIntensity 0.72`、`keyIntensity 2.0`、`shadowSize 2048`、`ao true (aoScale .6 / aoRadius .3 / aoIntensity .42)`、`maxPixelRatio 1.75`、`autoQuality true`。

`highlight(object, { color, intensity })` / `clearHighlight(object)`：浅色场景里用暖金提亮被选中部件，**不要**用荧光自发光。

---

## 5. 科普场景构建器接口（`scienceScenes.js`）

三个函数签名一致：

```js
buildSoilScene(scene, stage)   // buildRiceScene / buildBeidouScene 同理
// 返回：
{
  root,                    // THREE.Group，挂在 scene 上
  pickTargets,             // 可拾取的 group 数组，每个设 userData.key
  update(dt, t),           // 每帧
  setParam({ ... }),       // 外部参数驱动（focus / stage / sats+blocked）
  disposeExtra()           // 释放本场景所有几何与材质
}
```

`LAB_BUILDERS = { soil, rice, beidou }` 是注册表，`ScienceStage.vue` 按 `mode` 取用。

**约定**：场景里所有对象必须挂在 `root` 下（展台用 `pedestal(root, ...)`、接地阴影用 `addContactShadow({ parent: root })`），
切换场景时 `scene.remove(api.root); api.disposeExtra()`，否则会残留并误删共享纹理。

---

## 6. 硬约束（改之前先看这条）

1. **色板**：暖白 `#F7F4EE` / 亚麻 `#EFECE6` / 墨黑 `#1C1B18` / 琥珀金 `#C88A32` / 苔藓青 `#2E5A44` / 赤红 `#B83828` / 陶釉棕 `#8C583A`。
   禁止深空紫、荧光青绿、纯黑底大屏。
2. **不引入外部资源**：不加 `.glb`、`.hdr`、远程图片、CDN 字体。环境光由 `stage.js` 里的程序化 PMREM 生成。
3. **纹理只允许高频细粒与线性结构**，不要低频大斑块——俯视时会被读成沙丘或沙漠。
4. **不要用 ASCII 双引号写在 Vue 模板属性里**：`lead="他说"你好""` 会直接截断属性并让构建报
   `Unterminated string constant`。中文引号一律用 `「」`。
5. **不要用 GSAP 的 `from` 设置 `opacity: 0`** 做滚动入场：触发器没被命中时内容会永久隐藏。
   只做位移（`y`），或用 `Reveal.vue` 组件的 IntersectionObserver 方案。
6. **共享材质**：同一材质被多个 mesh 使用时，`highlight()` 会同时改掉它们。想单独高亮就克隆材质。
7. **移动端**：`html` 已设 `overflow-x: clip`；新增绝对定位装饰元素记得放在 `overflow-hidden` 的 section 内。
8. **构建**：`npm run build` 必须零 Error。改完用 `npm run build` 与浏览器实机检查各页 console。

---

## 7. 常见任务 → 改动点速查

| 想要的改动 | 去改哪里 |
| --- | --- |
| 沙盘地面颜色 / 土壤质感 | `RuralSandbox3D.vue` 的 `buildLandscape`（顶点色分区）+ `textures.js` 的 `chernozemMaterial` |
| 沙盘地貌起伏 | `RuralSandbox3D.vue` 的 `RIVER_Z / RIVER_DZ` 与 `buildLandscape` 里的 `fbm` 幅度 |
| 玉米青纱帐 / 稻穗造型 | `textures.js` 的 `makeDetailedCornStalkGeometry` / `makeDetailedRiceStalkGeometry`（沙盘与科普共用） |
| 风机叶片 | `RuralSandbox3D.vue` 的 `makeBladeGeometry()` → `airfoilBladeGeometry(length, 0.66, 28, 44)`；金色前缘条 `edge.position.x` 与弦长联动 |
| 粮仓造型 | `RuralSandbox3D.vue` 的 `buildSiloComplex`（`bodyGeo` / `capGeo` 用 `lathe` / `bevelCylinder`） |
| 农机构型 | `SmartMachinery3D.vue` 的 `buildChassis` / `buildEngine` / `buildCabin` / `buildWheels` |
| 轮内侧减震支柱 | `SmartMachinery3D.vue` 的 `buildWheels`，`innerX = -sign(cfg.x) * (w/2 + 0.09)` 把支柱移到胎宽之外、`springY = cfg.r * 0.52` 压到胎顶以下；含贯穿活塞杆、上下托盘与下摆臂。**不要再写回 `r * 0.94`**，那会让弹簧穿出胎面（第十四节已修） |
| 地质层位 | `SoilStrata3D.vue` 的 `layerConfigs` + `buildStrata` |
| 团粒 / 结核质感 | `textures.js` 的 `sculptedAggregateGeometry`，`SoilStrata3D.vue` 与 `scienceScenes.js` 均已接入 |
| 某个物件的表面质感 | `textures.js` 里对应材质工厂的 `bumpScale` / `repeat` / 基色 |
| 光照与氛围 | `stage.js` 的 `defaultConfig`（曝光、环境光强度、主光强度、AO 参数） |
| 相机手感 | `stage.js` 的 `createStage` 参数：`fov / minDistance / maxDistance / min-maxPolarAngle` |
| 新增一个可拾取热点 | 给 group 设 `userData.key`，加入场景返回的 `pickTargets`，页面侧监听 `stage.enablePicking` 的 `onClick` |
| 新增一个科普实验 | 在 `scienceScenes.js` 写 `buildXxxScene(scene, stage)`，注册进 `LAB_BUILDERS`，在 `ScienceStage.vue` 加相机参数，`ScienceView.vue` 加 tab 与控制面板 |

---

## 8. 本地运行

```bash
npm install
npm run dev        # 开发
npm run build      # 构建（必须零 Error）
npm run preview    # 预览构建产物
```

三个 3D 展厅路由：`/strata-3d`、`/machinery-3d`、`/sandbox-3d`，科普实验室 `/science`。
