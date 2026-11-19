# 视觉与体验交接 · VISUAL_HANDOFF

> 面向接手的 AI 或设计师：这份文档只讲**视觉、体验与待改进项**。
> 工程架构与历次改动看 `PROJECT_HANDOVER.md`，3D 层的接口与几何看 `3D_HANDOFF.md`。

---

## 0. 先跑起来，再读代码

```bash
cd D:/项目/wangyedazuoye
npm install
npm run dev            # 或 npm run build && npm run preview -- --host 127.0.0.1 --port 4173
```

本地预览 `http://127.0.0.1:4173/`，后台 `/admin`，演示密码 `admin123456`。

**接手第一步不要改代码。** 先按第 7 节跑一遍探针，拿到基线，再决定动哪里。当前基线已经记录在第 3 节，可以直接对比。

---

## 1. 项目速览

### 1.1 定位

「黑土粮仓 · 吉韵新程」是长春市高校大学生网页设计作品，选题乡村振兴。它不是信息门户，是一座**可以拖拽、可以下潜、可以漫游的线上美术馆**：三座 Three.js 实时展厅承担微观、工业、宏观尺度，十个图文专题补数据、农时、非遗、物产、助农机制与落地痛点。

### 1.2 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Vue 3.5（script setup）、Vue Router 4、Pinia 4 |
| 构建 | Vite 8、Tailwind CSS 4、PostCSS |
| 三维 | Three.js 0.187、自建 IBL 画廊环境、GTAO、物理折射、程序化几何与 Canvas 纹理 |
| 动效 | GSAP 3 + ScrollTrigger、CSS 逐字入场、滚动视差、reduced-motion 降级 |
| 图表 | ECharts 6（按需注册，`src/lib/echarts.js`） |
| 图版 | `scripts/generate_art.py` 生成 10 张 SVG，无外部图片依赖 |

### 1.3 路由（18 条）

| 路由 | 视图 | 首屏骨架 |
| --- | --- | --- |
| `/` | `HomeView` | 杂志封面：琥珀金大圆 + 旋转文字环 + Z 轴层叠图版 |
| `/exhibit-map` | `ExhibitMapView` | 刻度动线：巨型 13 水印 + 横向六段色块 + 独立横向滚动容器 |
| `/strata-3d` | `SoilStrataView` | 地层柱状档案：左侧按真实层厚堆叠的三色土带 |
| `/machinery-3d` | `MachineryView` | 工程图纸：图签栏 + 260 马力水印 + 件号表 |
| `/sandbox-3d` | `SandboxView` | 航测图：可点击六机位的测绘图 + 五色图例 |
| `/dashboard` | `DashboardView` | 琥珀金封面 + 墨色 4.82% 数据环 |
| `/journey` | `JourneyView` | 五幕物候：纵向幕次尺 + 180 天进度带 |
| `/chagan-lake` | `ChaganLakeView` | 冰湖：冰蓝渐变 + 放射冰裂同心圆 |
| `/solar-terms` | `SolarTermsView` | 四季色环：conic 四色 + 24 节气刻度 |
| `/products` | `ProductsView` | 市集：琥珀金 + 四张旋转层叠品类卡 |
| `/aid-projects` | `AidProjectsView` | 方位索引：六格抽象网格 + 项目档案 |
| `/adopt-a-field` | `AdoptFieldView` | 演示声明 + 地块索引格 |
| `/farm-income` | `FarmIncomeView` | 账本：五行示意账本 + 大字 |
| `/last-mile` | `LastMileView` | 墨色三道关卡 + 逐字标题 |
| `/science` | `ScienceView` | 科普舞台 + 三段控制面板 |
| `/about` | `AboutView` | 白皮书：墨色书脊 + 目录清单 |
| `/admin` | `AdminView` | 独立控制台：网格 + 09 水印 + 双线登录卡 |
| 其他 | `NotFoundView` | 墨色导览页 + 12 张入口卡 |

### 1.4 目录结构（接手必看）

```
src/
  style.css                    453 行，全部设计系统与动效工具类
  App.vue                      路由转场、滚动进度、rAF 节流、GSAP 编排
  router/index.js              17 路由 + meta.description + 锚点对齐
  components/
    AppNavbar.vue              悬浮胶囊导航，4 个分组
    AppFooter.vue              墨色收束，5 列
    CustomCursor.vue           方形精密准星（仅精确指针设备）
    editorial/                 Reveal / SectionHead / FigurePlate /
                               ExhibitCard / StatBlock / StageLoading /
                               StageFallback / WebGLStage / PageHero（已废弃）
    science/ScienceStage.vue   科普三实验的舞台容器
    *3D.vue                    三个展厅场景（2300 / 900 / 800 行量级）
  lib/
    echarts.js                 ECharts 按需注册
    textureCache.js            无 Three.js 依赖的纹理缓存（后台显存面板用）
  three/
    stage.js                   舞台：IBL、GTAO、软阴影、相机飞行、拾取
    textures.js                全部材质工厂 + 程序化几何
    scienceScenes.js           三个科普实验场景
  views/                       18 个视图，501 / 505 / 437 行是三巨头
```

源码约 9,600 行，`dist` 2.5 MB，26 个 JS chunk。

---

## 2. 设计系统（改动前必须读懂）

### 2.1 色板（严格锁定，不要引入新色）

| 语义 | 值 | 用途 |
| --- | --- | --- |
| 宣纸暖白 | `#F7F4EE` | 页面底 |
| 亚麻 | `#EFECE6` | 次级区块 |
| 纸白 | `#FFFDF9` | 卡片 |
| 深松烟墨 | `#1C1B18` | 正文、墨色展墙 |
| 暖岩灰 | `#5A564E` | 次级正文 |
| 浅砂灰 | `#8C867B` | 眉题、编号、图注（**见 P0-2**） |
| 秋收琥珀金 | `#C88A32` | 强调、CTA、色块 |
| 长白山苔藓青 | `#2E5A44` | 生态、正向状态 |
| 长春工匠赤红 | `#B83828` | 工业、警示、遮挡 |
| 黑土陶釉棕 | `#8C583A` | 土体、书脊 |
| 松花江微蓝 | `#8EBACB` | 水系 |

派生变量在 `style.css` 的 `:root`：`--bg-canvas`、`--ink-primary`、`--ink-muted`、`--accent-gold` 等。

### 2.2 排版

- 大标题：`display-1/2/3`，中文衬线优先，`letter-spacing: -0.045em`，`text-wrap: balance`。
- 眉题：`.eyebrow`，等宽、0.62rem、字距 0.2em、金色胶囊。
- 正文三级：`.lede`（1–1.16rem / 1.88）、`.body-copy`（0.9rem / 1.9）、`.caption`（0.66rem / 1.7）。
- **这四个基类放在 `@layer components` 里**，原因见第 8 节第一条坑。不要把它们移出去。

### 2.3 容器与材质

- `.bezel` + `.bezel-core`：双层机械边框，全站展品容器。
- `.card-ink / gold / moss / linen`：实心色块卡。
- `.surface-ink`：墨色展墙，带双径向渐变。
- `.coord-rule`：48px 网格底纹。
- `.marquee` + `.marquee-track`：无限字带，容器必须带 `aria-hidden="true"`。
- `.z-card`：Z 轴层叠卡 hover 归位。
- `.pill-nav` / `.pill-nav--solid`：悬浮导航，滚动后切实底。

### 2.4 动效

| 类 | 行为 |
| --- | --- |
| `.kin-char` | 逐字入场，0.95s，每个字 delay 递增 |
| `.reveal` / `.is-in` | 滚动入场，位移 + 缩放 + 模糊 |
| `.mag-btn` | 磁性胶囊按钮，含 `--light` / `--gold` 两个变体 |
| `.lift` | hover 上浮 9px |
| `.arrow-shift` | hover 时箭头位移 |
| `[data-parallax]` / `[data-stagger]` / `[data-stack]` | GSAP ScrollTrigger 编排 |

全部在 `@media (prefers-reduced-motion: reduce)` 下有降级，新增动效必须补进这个块。

### 2.5 每页首屏必须不同

这是本项目最重要的一条设计原则。前几轮吃过亏：所有页面共用 `PageHero` 对称两栏，被评价为「像模板、太朴素」。现在 18 页各有骨架（见 1.3 表），**新增页面时不要复用别人的首屏结构**，也不要复活 `PageHero`。

---

## 3. 当前完成度（已验证基线）

| 项目 | 结果 |
| --- | --- |
| 构建 | `✓ built in ~1.4s`，零 Error 零 Warning；`dist/` 约 2.5 MB |
| 首屏 | 主包 233 KB / gzip 88 KB + runtime 62 KB + pinia + 图标，不含 Three.js 与 ECharts，FCP 约 80 ms |
| 3D chunk | `stage` 693 KB（gzip 175 KB），只在 3D 页加载 |
| 图表 chunk | `echarts` 576 KB（gzip 195 KB），按需注册 |
| 展览地图 chunk | `ExhibitMapView` 23 KB（gzip 7.7 KB），独立异步，不进首屏 |
| 横向溢出 | 320 / 390 / 430 三档 × 9 页：0；历史七档基线亦为零 |
| 触控目标 / 输入框 | 320 / 390 / 430 × 9 页：`targetCount=0`、`inputCount=0` |
| 对比度 | 仅剩 19 处品牌金大字（2.68–2.84），均为用户确认保留的设计取舍；小字与正文全达标 |
| 死链 / 缺 alt / 空 section | 0 / 0 / 0（17 条路径） |
| CSS 断头选择器 | 0（`css_lint.py` 实测） |
| 控制台 | 桌面与移动端全程 0 Error / 0 Warning |
| WebGL 兜底 | 模拟无 WebGL 时 5 个含 3D 页面显示主题化静态展签 |
| 数据口径 | 附录 A 16 条、附录 B 7 条公开来源 |

---

## 4. 整体审美评价

> 本节是第十八轮改造**之前**的审计快照，问题项已在第 5 节的 P0 / P1 / P2 中处理完毕。保留原文是为了说明「为什么这么改」，不要再照着它重复改一遍。

### 4.1 做得好的，不要改坏

1. **统一的浅色艺术馆语言**。暖白宣纸底、墨色展墙做焦点、琥珀金做强调、苔藓青与工匠赤红分别留给生态与工业。三层色彩关系清晰，没有荧光感。
2. **每页一套首屏**。18 页里没有两页首屏结构相同，这是最难保持的部分，改动时优先保住。
3. **材质层次**。双层 bezel、实心色块 Bento、Z 轴层叠卡、胶片颗粒、柔光与斜切色块交替出现，页面不扁平。
4. **口径透明**。所有演示数字都标了性质、年份与来源，痛点实验室甚至把「技术不好看的前两年」摆出来。这在同类作品里少见，是最能体现诚实的部分。
5. **动效克制**。逐字标题、视差、错峰入场都在 30–60px 位移内，没有炫技式弹跳。

### 4.2 主要问题（按影响排序）

**A. 金色强调在浅底上对比不足。**
`#C88A32` 落在 `#F7F4EE` 上，实测对比度 **2.68**，低于 WCAG 大字号 3.0 的门槛。首页「吉韵新程」、项目库「哪片地上」都是这个组合。金色小字（如 `.eyebrow`、`SPECIMEN / DETAIL / INTERACTION`）实测 2.9，更低。视觉上「好看但有点飘」。

**B. 次级小字全站偏淡。**
`text-[#8C867B]` 实测对比 **3.29–3.56**，低于 4.5。这类 9–10px 的编号、图注、刻度、页脚链接遍布全站，是**数量最多**的低对比来源（单页最多 62 处）。`--ink-muted` 已在上一轮改成 `#787265`，但**大量硬编码的 `text-[#8C867B]` 没跟着改**，这是历史遗留。

**C. 移动端触控目标偏小。**
实测 320/390/430 三档：页脚链接高 **18px**、筛选与条件开关 **34px**、3D 组件自带按钮 **28px**。低于 36px 的建议值。文字内链 15–16px 属于行内链接，可接受，但页脚与开关需要改。

**D. 后台登录输入框 14px。**
`/admin` 密码框 `font-size: 14px`，iOS 聚焦时会自动放大页面。应为 16px。

**E. 动效语言开始疲劳。**
18 页都用「逐字标题 + 滚入 Reveal + 底部 marquee」三件套。前五页有仪式感，到第十页已经可以预判。需要引入**节奏差异**而不是更多动效。

**F. 信息密度后段偏重。**
`/about` 的目录 13 行、附录 A 16 条、附录 B 7 条，连起来像文档而不是展览。首屏很克制，越往下越像白皮书。

**G. 3D 与 2D 的质感衔接有断层。**
3D 是写实渲染（PBR、GTAO、物理折射），页面是平面编辑式（纸感、色块）。两者共用色板，但材质语言不连续。3D 舞台嵌在 bezel 里时，这种落差会被放大。

**H. 缺少总览型导航页。**
现在找内容依赖导航下拉、首页横带、404 导览三处。内容到 18 页后，缺一个「展览地图」式的总览（本轮已补 `/exhibit-map`）。

---

## 5. 待改进清单

> **状态（2026-11-07 第十八轮）：P0 / P1 / P2 三轮已全部执行完毕并终验通过。**
> 以下清单保留作为「为什么这么改」的原始审计依据，不要再当成待办重复执行。
> 落地记录与验证数字见第 11 节。唯一刻意不修的是浅底品牌金大标题（用户明确选择保留）。

优先级按「影响面 × 改动风险」排序。每条都给定位与建议改法，可直接执行。

### P0 · 可访问性硬指标

#### P0-1 金色强调色的对比度

- **现象**：金色大字 2.68、金色小字 2.9。
- **定位**：`src/style.css` 的 `--accent-gold`；各页 `text-[#C88A32]` 与 `.eyebrow` 的 `color: #8A6324`。
- **建议**：
  - 大字（display 级别）保持 `#C88A32`，但在浅底上改用深一档的 `#A9701F`（对比约 3.4），或在文字下方加 1px 同色描边。**不要**给大字加 text-shadow，会脏。
  - 小字（`.eyebrow`、眉题、编号）统一改成 `#8A6324` 或更深，目标 ≥4.5。
  - 深底上的金色不变。
- **风险**：金色是品牌色，大面积改会削弱识别度。建议只改「浅底上的小字」，大字保留并在文档里注明是设计取舍。

#### P0-2 全站次级小字对比度

- **现象**：`text-[#8C867B]` 实测 3.29–3.56，单页最多 62 处。
- **定位**：全站 18 个视图 + `AppFooter.vue` + 3D 组件 UI。
- **建议**：批量替换 `text-[#8C867B]` → `text-[#6E6960]`（对比约 4.6）。**注意**：只替换浅底上的用法；深色区块（`surface-ink`、`card-ink`、`card-moss`）里若出现该色，应改成 `text-[#F7F4EE]/78` 之类的浅色。
- **执行方式**：先 `grep -rn "text-\[#8C867B\]" src | wc -l` 统计，按所在 section 的 class 判断底色，分批替换，每批后跑 P0 探针复测。
- **风险**：眉题会变重，可能显得「灰块感」增强。若觉得过重，可只替换 ≤11px 的字号，12px 以上保留。

#### P0-3 移动端触控目标

- **现象**：页脚链接 18px、筛选/条件开关 34px、3D 按钮 28px。
- **定位**：`AppFooter.vue` 的链接 `li`；`AidProjectsView` 筛选按钮；`AdoptFieldView` / `LastMileView` 的条件按钮；`ScienceStage` 与三个 3D 组件内的工具栏。
- **建议**：页脚链接加 `py-1.5` 或 `leading-6`；34px 的按钮把 `py-2` 改 `py-2.5`；3D 工具栏 `py-1.5` 改 `py-2`。目标 ≥36px，密集工具栏可接受 36。
- **风险**：低。只影响垂直节奏。

#### P0-4 后台输入框字号

- **现象**：`/admin` 密码框 14px，iOS 聚焦自动放大。
- **定位**：`AdminView.vue` 登录区 `input`。
- **建议**：移动端 `text-[16px]`，桌面可保留 14px（用 `sm:text-sm`）。
- **风险**：无。

### P1 · 体验与节奏

#### P1-1 动效节奏差异化

- **问题**：18 页同一套入场节奏。
- **建议**（按页分配，不要全站一起改）：
  - 3D 三页：入场更快（0.5–0.7s），把注意力让给场景。
  - 助农三页：用「数据先到、标题后到」的反向顺序。
  - 痛点实验室：只在滚动到实验区时触发一次数字滚动，首屏不做逐字。
  - About：去掉逐字，改用整块淡入，符合白皮书气质。
- **风险**：中。改动集中在各页 `kin-char` 的 delay 与 `animation-duration`，不碰共享类。

#### P1-2 后段信息密度

- **问题**：`/about` 目录 13 行 + 附录 A 16 条 + 附录 B 7 条。
- **建议**：
  - 目录改成两列（7 + 6），高度减半。
  - 附录 A 默认折叠到 6 条，加「展开全部」。
  - 附录 A / B 之间加一条分隔式的「continue」引导，回到展览而不是继续读表。
- **风险**：中，涉及交互状态。

#### P1-3 3D 与 2D 的材质衔接

- **问题**：写实 3D 嵌在平面容器里，落差被 bezel 放大。
- **建议**：
  - 给 3D 舞台外框加一层同色系的柔和内阴影，模拟「展柜深处」。
  - 3D 组件的背景色与所在 section 的底色对齐（目前 `#F7F4EE` / `#F4F2EC` 略有差异）。
  - 在舞台四角加极细的金色定位角标，把写实场景「装裱」进编辑式版式。
- **风险**：低，纯视觉。不要改 3D 渲染参数。

#### P1-4 页脚与收束区

- **问题**：5 列在 1024 宽度偏挤；收束文案与全站调性比略平。
- **建议**：`md:grid-cols-5` 改成 `md:grid-cols-3 lg:grid-cols-5`，中等宽度两行；收束句改成一组对仗短句，与各页标题呼应。
- **风险**：低。

### P2 · 结构性与锦上添花

#### P2-1 新增「展览地图」总览

- 一条可滚动的横向时间轴或一张抽象方位图，把 17 个单元按「微观 → 工业 → 宏观 → 人文 → 助农 → 痛点」排列，标注每个单元的一句话。
- 可以复用 `/aid-projects` 的方位索引格语言，但**不要复用它的骨架**。
- 入口放导航「关于」分组或首页参观动线。

#### P2-2 后台视觉再对齐

- 现在后台是「浅色控制台」，功能排版正确但与展陈页语言有距离。
- 建议只做三件事：侧栏加金色顶边、表格表头改成 `eyebrow` 样式、空状态加一句展陈口吻的文案。**不要**把后台改成杂志式版式，会伤可用性。

#### P2-3 清理死文件

- `src/components/editorial/PageHero.vue` 零引用，可删。
- `ExhibitCard.vue` / `StatBlock.vue` 各只有 1 处引用，若该处也改成手写卡片即可删。
- 删除前先 `grep -rn "PageHero" src` 确认零引用。

#### P2-4 图标与图版体系

- 现在 lucide 图标与程序化 SVG 图版混用，线性图标与纸感图版的笔触不完全统一。
- 可选：把关键图标换成自绘 SVG，统一 1.5px 线宽与圆角。

---

## 6. 硬约束（违反会破坏已经建立的东西）

1. **真实性口径不可退让。**
   所有演示数字必须标性质与年份；助农三页主体必须是公开可查的现实对象；不写人名、自述、采访、覆盖户数、增收金额；地方调研样本不得外推为全国均值；示意数据必须写明「教学演示」。
2. **地图合规。**
   不接任何地图 SDK（Google / 高德 / 腾讯 / 百度 / OSM 均不用于本项目），不画行政区划边界与省界。方位表达只用抽象网格，并标注「方位示意，非行政区划地图」。
3. **色板锁定。**
   不引入色板外的新色。需要新色时从现有 11 色派生明度。
4. **动效必须降级。**
   新增动画必须补进 `@media (prefers-reduced-motion: reduce)`，否则不要合入。
5. **WebGL 必须有兜底。**
   新的 3D 场景必须包在 `WebGLStage` 里，不能直接挂组件。
6. **性能预算。**
   首屏 JS 不超过 260 KB（gzip 100 KB）；3D 与 ECharts 必须保持异步 chunk；新增依赖先看体积。
7. **中文引号。**
   Vue 模板属性里一律用「」，不要用 ASCII 双引号，否则会截断属性。
8. **锚点。**
   页面内 `<a href="#id">` 依赖全局 `scroll-margin-top: 92px` 与 `router.afterEach` 的双次对齐，不要删这两处。
9. **数量表述。**
   新增或删除页面后，必须同步：首页 heroMeta 的展陈单元数、`routeSteps`、策展导语、`AboutView` techStack 的路由数、白皮书目录、404 导览卡、README 表格。这类遗漏比代码 bug 更容易被发现。

---

## 7. 验证方法

### 7.1 构建

```bash
npm run build 2>&1 | tail -5
```

期望只有一行 `✓ built in`，没有 chunk 警告。

### 7.2 视觉探针（已在 `.workbuddy/tools/`）

```bash
npm run preview -- --host 127.0.0.1 --port 4173
npm run audit    # 一键跑全部 12 个探针并汇总结果（推荐）
```

等价的手工方式（调试单个探针时用）：

```bash
export PATH="$PATH:/c/Users/Administrator/.workbuddy/binaries/node/versions/22.22.2-6"

# 浏览器会话跨 shell 调用会被回收：open 与所有 run-code 必须写在同一条命令里
playwright-cli open --browser=chrome http://127.0.0.1:4173/ && \
playwright-cli run-code --filename .workbuddy/tools/audit-contrast.js && \
playwright-cli run-code --filename .workbuddy/tools/audit-mobile.js  && \
playwright-cli run-code --filename .workbuddy/tools/audit-links.js   && \
playwright-cli run-code --filename .workbuddy/tools/audit-detail.js   && \
playwright-cli run-code --filename .workbuddy/tools/audit-interactions.js
```

`run-code "$(cat ...)"` 在 Windows Git Bash 下会丢引号，统一用 `--filename`。输出里 CLI 会回显整段代码，用 `> /tmp/x.log` 存下来再 `sed -n '/^### Result/,/^### Ran/p'` 取纯结果。

覆盖范围（2026-11-09 第五轮统一扩充）：`audit-contrast` / `audit-mobile` / `audit-a11y` / `audit-links` / `audit-detail` 均覆盖 **17 条可访问路由**，`audit-mobile` 每页跑 320/390/430 三档；`audit-interactions.js` 验 10 条路由的 `data-motion` 分档、白皮书附录折叠、3D 装裱角标；`audit-round19.js` 在滚到后仅等 600ms 就检查「文字是否已可读」，并验认养页数据切换与后台导航；`audit-notill.js` / `audit-soil.js` / `audit-rice.js` 分别回归第 4 / 第 1 / 稻作三个科普实验的场景与交互；`audit-vt.js` 验证首页 → 3D 展厅的原生 View Transitions 调用、`vt-active` 生命周期、「减少动效」回退与控制台零错误。**新增页面时所有带 `paths` 的脚本都要补**，不能只补 `audit-links`。截图统一写到 `.workbuddy/shots/`。

> `audit-a11y.js` 的 `perf.transferKB` 在有缓存的会话里会是 0，只能看资源条数；要测真实首屏体积须用全新 context 并禁用缓存。

对比度探针的判据与已知假阳性：
- **保留项**：浅底 `#C88A32` 大字 2.68–2.84（`吉韵新程`、`哪片地上`、`一张展览总览`、`耕种管加流`、白皮书 `01–03`、`500+`）是用户确认保留的品牌识别，不要「顺手修」成 `#A9701F`。
- `.kin-char` 在动画中间态会被算成半透明，忽略。
- `background-image` 渐变会让元素被跳过，`skipped.gradient` 就是这个计数，不是失败。
- 文字落在**非祖先的绝对定位色块**上时探针算不到真实底色：`/machinery-3d` 右上赤红斜切块上的白字会报 1.1，实为白字在 `#B83828` 上（约 5.4:1）。这是已知假阳性，别据此把白字改深。
- `parse()` 已支持 Tailwind v4 的 `oklab(L a b / alpha)`（标准 OKLab→sRGB 矩阵）；半透明文字（`fg.a < 1`）与 `aria-hidden="true"` 的装饰元素按 WCAG 口径跳过。
- 大字标题行高 0.98–1.28 是设计意图，`tightCount` 的这部分不用改。

### 7.3 控制台

```bash
playwright-cli console 2>&1 | grep -E "Total messages|\[ERROR\]|\[WARNING\]"
```

必须是 `0 (Errors: 0, Warnings: 0)`。

### 7.4 截图注意

- 连续 `page.goto` 循环截图时，第三页可能截到逐字动画刚重置的瞬间或转场灰罩，会误判为「标题不显示」。**单独打开该页重截再判断**。
- `canvas.screenshot()` 可能截到空白（`preserveDrawingBuffer: false`），3D 场景一律用整页截图并先 `scrollIntoView`。

---

## 8. 已知坑与经验（都是踩过的）

1. **排版基类的层叠优先级。**
   `.lede / .body-copy / .caption / .eyebrow` 若写在未分层 CSS 里，优先级高于 Tailwind 的 `@layer utilities`，会导致 `class="lede text-[#F7F4EE]/78"` 的颜色覆盖失效，墨底导语一直是深灰。它们现在在 `@layer components` 里，**不要移出去**。
2. **深色首屏不要用默认 `.mag-btn`。**
   `#1C1B18` 底在墨色背景上几乎同色，必须用 `--gold` 或 `--light` 变体。
3. **marquee 的 aria-hidden 容易漏。**
   `AppFooter.vue` 不在 `views/` 目录，批量脚本第一次就漏了它。改完要全站 `document.querySelectorAll('.marquee:not([aria-hidden])').length === 0`。
4. **ECharts 全量引入会带进 1.1 MB。**
   现在走 `src/lib/echarts.js` 按需注册。新增图表类型时必须在那里补注册，否则运行时报「组件不存在」但不一定进控制台错误。
5. **后台不能直接 import `textures.js`。**
   会把 694 KB 的 Three.js 拉进后台首屏。显存统计走 `src/lib/textureCache.js`。
6. **模块级缓存验证必须用 SPA 内导航。**
   `page.goto` 整页刷新会清空纹理缓存，后台显存面板会显示 0 组，误判为功能失效。
7. **跨页锚点需要两次对齐。**
   `router.afterEach` 在 420ms 平滑、1250ms 即时校正。只做一次会因异步 chunk 布局变化而跳偏。
8. **`PageHero` 已废弃。**
   不要复活它，也不要在新页面引用。
9. **未分层 CSS 会压过 `text-*` 工具类。**
   `.mag-btn`、`.rot-tag` 写在 `@layer components` 之外，里面的 `color:` 会赢过 Tailwind utilities。首页曾因此出现「纸白底 + 纸白字」的按钮（1.0:1）、金底白字（2.68:1）却长期没被发现；`.rot-tag` 则把墨底的 `text-[#F7F4EE]/85` 压成深灰（3.16:1）。**要改这类按钮颜色就加 `--light` / `--gold` 变体，别只加 `text-*` 类**；`.rot-tag` 现在不写死 color。
10. **数量口径是硬约束。**
    全站统一为「18 条路由 / 13 个展陈单元（3 个 3D + 10 个图文专题）/ 10 个专题章节 / 1 张展览地图（总览索引，不计入展陈单元）」。新增页面后必须同步 README 路由表、白皮书 `structure`、首页 `heroMeta` 与策展导语、导航、页脚、404 导览卡、四个探针的 `paths`。第十八轮就踩过「首页写 14、地图写 13」的冲突。
11. **地图类表达必须合规。**
    `/exhibit-map` 不接任何地图 SDK、不画行政区划边界、不用经纬度，只用抽象策展刻度与色块，并在页面明确标注「策展动线示意，非行政区划地图」。改这个页面时不要引入真实地理数据。
12. **新页首屏别撞旧标题。**
    展览地图初稿 H1 与首页 VISITOR ROUTE 区块都是「一条动线，走完一片黑土」，点进新页像没换页。现已改为「六个尺度，一张展览总览」。

第十九轮新增的 4 条（动画中间态、全屏层级、图版生成脚本、提亮底色后的对比复查）见第 12.5 节。

---

## 9. 建议接手顺序

**第十八轮已完成（2026-11-07）**：P0 四项可访问性硬指标、P1 四项体验与节奏、P2 四项结构性优化（含新增 `/exhibit-map`）全部落地并终验通过。落地记录与验证数字见第 11 节；下面这份三轮顺序保留作方法参考，不要再重复执行。

后续如果还要继续，建议按这个顺序：

1. **先跑第 7 节的探针拿当前基线**，不要凭截图判断对比度与溢出。
2. **再读第 6 节硬约束**，尤其是「每页一套首屏」和「色板锁定」。
3. 新增任何页面时，先按第 8 节第 10 条同步数量口径，再动视觉。
4. 若要继续提升，优先做内容层（更多真实可核对的展陈数据、附录 B 资料更新），而不是继续加动效或新颜色。

<details>
<summary>原始三轮接手顺序（历史）</summary>

**第一轮（只碰样式）**：P0-1 金色小字、P0-2 全站次级小字、P0-3 触控目标、P0-4 输入框字号。每改一批跑一次对比度与移动端探针，确认数字下降。

**第二轮（碰页面节奏）**：P1-1 动效差异化、P1-2 信息密度、P1-3 3D 装裱、P1-4 页脚。这一轮改的是「感觉」，每改一页截一张图对比，不要一次改完再看。

**第三轮（可选）**：P2-1 展览地图、P2-2 后台对齐、P2-3 清理死文件、P2-4 图标统一。

</details>

---

## 10. 不要做的事

- 不要把所有页面统一成一套首屏，那是被明确否掉的方向。
- 不要为了「高级感」加暗色模式、玻璃拟态、渐变光斑或大圆角。现有语言是克制的纸感 + 实心色块。
- 不要给演示数据补精确统计值来「显得专业」。现在的口径透明是加分项，不是缺陷。
- 不要引入新的 UI 组件库。Tailwind + 自定义类已经够用，加库会破坏视觉一致性。
- 不要在 `style.css` 里加 `!important` 去压 Tailwind，先查层叠层级。
- 不要把 3D 渲染参数当视觉问题调。3D 层已经稳定，改之前先读 `3D_HANDOFF.md`。
- 不要把浅底品牌金大标题当成对比度 bug 修掉，那是用户确认保留的设计取舍（见 7.2）。
- 不要给展览地图引入真实地图 SDK、行政区划边界或经纬度（见第 8 节第 11 条）。
- 不要只改一处数量表述。18 / 13 / 10 / 1 这组数字必须全站一致（见第 8 节第 10 条）。

---

## 11. 第十八轮迭代记录（2026-11-07）

用户要求：先查工程日志与本机 skill，再按 `VISUAL_HANDOFF.md` 的 P0 / P1 / P2 继续优化，不确定处询问。用户在两处取舍上明确选择：**三轮全做（含新增页）**、**保留浅底品牌金大标题**。

项目不是 git 仓库，改前把 `src scripts index.html vite.config.js` 与三份交接文档备份到 `.workbuddy/backup/round18-20261107/`（约 947 KB）。

### 11.1 P0 · 可访问性

- 全站 `text-[#8C867B]` → `#6E6960`（约 133 处，含 ECharts 轴标签常量），`--ink-muted` 同步改为 `#6E6960`（暖白底 4.97:1）。
- `.eyebrow` → `#7A5518`；`.btn-outline:hover` → `#8A6324`；小金字统一为 `#8A6324`，并在 CSS 里按底色分档恢复：墨底 `#C88A32`、苔色/土色带 `#F0C275` / `#F7F4EE`、浅色卡片仍 `#8A6324`。土色带用 `[data-soil-band]` 标记。
- 修复两处真实低对比：金底白字「看五笔收入怎么来」改墨字；导航激活态 3 处小金字改 `#8A6324`。
- 触控目标统一 `min-h-[40px]`；后台所有 `input/textarea/select` 移动端 `text-[16px] sm:text-sm`；段落内行内链接按 WCAG 2.5.8 豁免。
- `ScienceStage.vue` 底部提示条由 `bg-[#1C1B18]/85` 改实底，减少探针假阳性。

### 11.2 P1 · 体验与节奏

- `App.vue` 按路由名计算 `motionMode`（`fast` / `reverse` / `quiet` / `calm` / `default`）写到 `<main :data-motion>`，`style.css` 用 `--kin-dur` / `--kin-delay` 控制逐字标题与 Reveal 节奏，不新增动画类型。实测 10 条路由分档全部命中。
- `WebGLStage.vue` 加 `.stage-frame` 内阴影装裱与四角 `.stage-corner` 定位标（实时渲染时才显示），实测 `frames=1 / corners=4`。
- `AboutView.vue` 目录改两列、附录 A 默认 6 条可展开到 16 条、加「回到展览地图」引导；实测按钮文案在「展开全部 16 条口径 ↔ 收起，只看前 6 条」间正确切换。
- `AppFooter.vue` 栅格改 5 列、链接加 `min-h-[36px]` 与更高对比、收束文案改「把一米土层，放进一只展柜。/ 把一整片平原，收进一条动线。」

### 11.3 P2 · 结构

- 新增 `/exhibit-map`（`ExhibitMapView.vue`）：六段尺度 / 13 个展陈单元、刻度动线、巨型 13 水印、独立横向滚动容器、引用 7 张既有 SVG 图版。首屏骨架与其它页不重复。
- 接入路由、导航「关于」分组、页脚「关于本站」列、白皮书 `structure`、404 导览卡（10 → 12 张）、首页参观动线入口、四个探针的 `paths`。
- `AdminView.vue` 侧栏金色顶边、表头 `eyebrow` 化、空状态展陈化；删除零引用 `PageHero.vue`；lucide 图标统一 1.5px 线宽。

### 11.4 地图合规

加载 `geo-map-compliance-guard` 后采用最严方案：**不接任何地图 SDK、不画行政区划边界、不使用经纬度**，只用抽象策展刻度与色块；页面明写「策展动线示意，非行政区划地图」，图版 caption 也逐条声明「不是行政区划地图，不对应真实地理方位」。

### 11.5 终验中额外发现并修掉的真问题

| 问题 | 根因 | 修法 |
| --- | --- | --- |
| 首页「进入科普实验室」纸白底纸白字 1.0:1、「进入 3D 标本馆」金底白字 2.68:1 | `.mag-btn` 是未分层 CSS，`color:#F7F4EE` 压过 `text-[#1C1B18]` | 改用 `mag-btn--light` / `mag-btn--gold` 变体 |
| `/about` 墨底竖排署名 3.16:1 | `.rot-tag` 的 `color: var(--ink-muted)` 压过 `text-[#F7F4EE]/85` | 移除该类写死的 color，交给调用方工具类 |
| 查干湖「0.8–1.2」2.02:1 | 水色 `#8EBACB`（只适合填充）被当作大数字文字色 | 新增派生变量 `--accent-water-ink: #3B6E82`（约 5.4:1） |
| `/machinery-3d` 赤红块上小字 | `opacity-75 / opacity-80` 压低白字 | 去掉 opacity，纯白字在 `#B83828` 上达标 |
| 展览地图 H1 与首页 VISITOR ROUTE 标题一字不差 | 子代理未查重 | 新页改「六个尺度，一张展览总览」 |
| 数量口径冲突 | 首页/路由 meta 写「十四个」，地图写「十三个」 | 统一 13 个展陈单元，展览地图作为总览索引不计入 |

### 11.6 探针改进

- `audit-contrast.js` / `audit-detail.js` 的 `parse()` 支持 Tailwind v4 的 `oklab(L a b / alpha)`（标准 OKLab→sRGB 矩阵），修掉 `/80` 半透明深底被跳过导致的 1.0x 假阳性。
- `bgOf()` 逐层按 alpha 混合、阈值降到 0.5。
- 半透明文字（`fg.a < 1`）与 `aria-hidden="true"` 装饰元素按 WCAG 口径跳过；`audit-mobile.js` 段落内 `<a>` 高度 < 24px 按行内豁免。
- 四个探针的 `paths` 均补 `/exhibit-map`。

### 11.7 验证结果

- `npm run build` 零 Error / 零 Warning，~1.4s；主包 233.06 KB（gzip 87.85 KB）、`ExhibitMapView` 23.02 KB（gzip 7.70 KB）、`stage` 693.11 KB（gzip 175.25 KB）、`echarts` 576.23 KB（gzip 195.37 KB），全在预算内。
- `audit-mobile`：9 页 × 320 / 390 / 430 三档返回 `[]`（零溢出、零小目标、零小字号输入框）。
- `audit-links`：`totalLinks 17 / broken [] / missingAlt [] / emptySections []`。
- `audit-contrast`：8 页共 19 项，**全部是 `#C88A32` 品牌金大字**（2.68–2.84），为用户确认保留项；小字、正文、控件全部达标。
- `audit-detail` 全站 17 页：除上述金字外只剩 `/machinery-3d` 4 项赤红定位块白字的已知假阳性。
- 实机：节奏分档 10/10、附录折叠生效、3D 装裱 1 框 + 4 角标、控制台 0 Error / 0 Warning；展览地图桌面 / 390px 移动端与首页按钮截图存于 `.workbuddy/shots/`。
- 同步更新 `README.md`、`VISUAL_HANDOFF.md`、`PROJECT_HANDOVER.md`（第十八节）、`3D_HANDOFF.md`（修正过时的 `springY = r * 0.94`）。

---

## 12. 第十九轮：用户截图反馈的可读性与结构修正（2026-11-07）

用户一次给 9 张截图，要求「理解所有问题，自己举一反三把问题都更正」。归纳成 5 类，全部落地并终验。

### 12.1 先分清「动画中间态」与「真低对比」

用 computed style 探针在各区块滚动到位、**等动画完全结束**后取值，结果是 `isIn:true / opacity:1 / blur(0)`，文字颜色与背景全部正常。所以截图里「字都看不清」的主因不是配色，而是 `.reveal` 的 `blur(7px) + 0.95s + 最长 640ms delay`——用户滚到一段正文时，它会在近 1.6 秒里又糊又半透明。

> **经验（最容易误判的一处）**：收到「字看不清」的截图，先等动画结束再取 computed style。若结束后正常，是入场动画问题；若结束后仍低对比，才去改颜色。直接照截图改配色只会越改越乱。

### 12.2 改动清单

| 问题 | 根因 | 修法 |
| --- | --- | --- |
| 4 处深绿/苔绿底文字发灰（首页科普区、NEXT CHAPTER、LastMile 收束、展览地图宏观段） | `.reveal` 模糊淡入 + 长延迟 | 去掉 blur，过渡 `0.95s→0.45s`、位移 `34→16px`；`Reveal.vue` delay 钳到 ≤200ms、兜底 `1200→450ms`；`.kin-char` blur `7→2px`、时长 `0.95→0.7s` |
| 深底小字普遍偏淡 | `/35`–`/78` 的透明度用在墨底小字上 | 全站批量提亮 **143 处 / 22 文件**，正文类统一到 `/86`–`/92`；只保留 `/10` `/15` 的巨型装饰水印 |
| 黑土馆首屏左侧「看不到图」 | 三层色值第一层 `#221E19` 融进墨底、无纹理、全宽 marquee 压住底部 | 新增 `bandColor` 首屏专用亮色值 + `.soil-band` 层理纹理/竖刻度/金边 + 层位图签；marquee 改 `lg:left-[19%]` |
| 第三层提亮后 2.31 / 3.48 | 黄土底上仍用亮金/白字 | 加 `bandInk`，按底色分档改墨字（与全站约定一致） |
| 3×3 单色块图版太糙（3 处引用） | `diorama.svg` 只有 9 个纯色块 + 一条河 | 重做 `scripts/generate_art.py` 的 `art_diorama()`：渐变、4 种田块纹理、格网编号、河岸水系、田间道、桥、防护林、粮仓/风机、比例尺、图例、视点标记 |
| 图版右侧文字被压 | 河流画到画布最右 | 水系 `clip` 到 `x < 890`，右侧图例区保持干净 |
| `/admin` 没有导航栏 | 两个根都是 `fixed inset-0 z-[60]`，盖住 `z-50` 悬浮胶囊 | 改 `z-30` + `pt-[88px]`，aside/header sticky 改 `top-[88px]`，弹窗提 `z-[60]`；`App.vue` 对 `Admin` 路由隐藏 `AppFooter`，否则层级降低后全站页脚 marquee 会从登录卡下方漏出来 |
| 认养页缺数据接入演示 | — | 口径区块加「教学演示 / 模拟真实数据」切换，虚构认养档案 + 农事进度条，明确标注「均为虚构」 |
| 控制台 1 个 404 | 裸 SVG 页面请求 `/favicon.ico` | 补 `public/favicon.ico`（32×32 ICO，同色板） |

### 12.3 合规举一反三

清掉全站残留的经纬度标注：`SandboxView` 的 `N 43°50′ · E 125°20′`、`HomeView` 的 `45° N`、`RuralSandbox3D` 的 `44°N`，以及 `atlas.svg` / `hero-field.svg` / `panorama.svg` 的角标文字，全部换成抽象图版编号。**同时改了 `scripts/generate_art.py`**，否则重跑生成脚本会把清理结果覆盖回去。

> **硬约束补充**：`public/art/*.svg` 是 `scripts/generate_art.py` 生成的产物。要改图版必须改生成脚本再重跑，不要直接编辑 SVG 文件。

### 12.4 验证

- `npm run build` 零 Error / 零 Warning；主包 233 KB、展览地图 23 KB 异步 chunk、`stage` 693 KB / `echarts` 576 KB 未变。
- `audit-contrast`：8 页 19 项，**仍全部是用户确认保留的品牌金大字**；`/strata-3d` 由 2 项降到 0。
- `audit-mobile`：9 页 × 3 档 `[]`（新切换按钮从 36px 提到 40px 后归零）。
- `audit-links`：`17 / [] / [] / []`；`audit-interactions`：10/10 分档、折叠、1 框 4 角标。
- `audit-round19.js`（本轮新增）：11 个点位截图，**滚到后仅等 600ms**，`visibleRevealsNotReady = 0`；认养切换 `hasRecord / hasHolder / hasDisclaimer / aria-pressed` 全通过；admin `topElementIsNav = true`；控制台 `errors: []`。
- 截图在 `.workbuddy/shots/fix1–fix10*.png`。

### 12.5 新增已知坑

13. **不要把「入场动画中间态」当配色 bug 修**。见 12.1，先等动画结束取 computed style。
14. **全屏 `z-[60]` 页面会吞掉悬浮导航**。后台页若要显示全局导航，层级必须低于 `z-50`，并给内容留出 `pt-[88px]`。
15. **改图版要改生成脚本**。`python scripts/generate_art.py` 会重写 10 张 SVG；改完先 diff 确认只有预期文件变化。
16. **提亮底色要同步复查文字对比**。土层第三层提亮后，原先合格的亮金/白字立刻掉到 2.31 / 3.48。

---

## 13. 第二十轮：自查后的工程精进（2026-11-07）

用户要求「自查一下觉得哪里可以精进」。先跑新增的 `audit-a11y.js` 补探针盲区，结果健康：768/1024/1280/1920 × 6 页零溢出、6 页无未命名控件 / 未标注输入 / 缺 `alt`、reduced-motion 下 47 个入场元素全部可见、5 条路由 meta 全对、数量口径一致、无调试残留。真正的短板在工程与细节，按用户勾选全部落地。

### 13.1 导航下拉的键盘 / 读屏路径

4 个分组按钮原来只有 `@mouseenter` / `@mouseleave`，能点开但没有 `aria-*` 状态、没有 Esc 关闭、焦点移出不收起。现在：

- 补 `:aria-expanded`、`aria-haspopup="true"`、`:aria-controls`；
- 下拉面板从 `v-if` 改 `v-show`，让 `aria-controls` 指向的 id 始终存在（避免断头 ARIA 引用），`display:none` 时不进 Tab 序列，Transition 动画照常；
- header 加 `@keydown.esc`，分组容器加 `@focusout`（仅当焦点真正离开容器才收起）；移动端菜单按钮补 `aria-expanded`。

实测键盘路径：`false → Enter → true`（面板可见、含 3 个链接）`→ Esc → false`，焦点移出后也为 `false`。

> **注意原有逻辑**：`@mouseenter` 会先把 `activeGroup` 设为该分组，紧接着的 click 又按 toggle 清空。所以 Playwright 的 `click()`（会移动鼠标）看到的是「点了反而关掉」，纯键盘 Enter 才正常。**测这个组件要用 `focus() + keyboard`，不要用 `click()`。**

### 13.2 图片懒加载的边界

10 个 `<img>` 里 5 个已有 `loading="lazy"`；缺的 5 个中有 3 个其实是**首屏可见**（首页 hero 图版、沙盘首屏测绘图版、WebGL 兜底图），这些不能懒加载，否则拖慢首屏。只给真正首屏外的 2 处（`HomeView` 的 `hero-field.svg`、`DashboardView` 的 `soil-strata.svg`）加了 `loading="lazy"`。

### 13.3 SVG 降采样

`contour()` 默认 `step=8 → 14`，`hero-field` 散点 `260 → 160`、`panorama` 散点 `420 → 240`。10 张图版总计 **449 KB → 321 KB（省 128 KB / 28.6%）**，变化集中在 5 张等高线图版（panorama −39.7%、hero-field −37.1%、atlas −36.7%、harvest −34.5%、rice −19.4%），其余 5 张字节不变。截图确认曲线仍平滑无锯齿，10 张 XML 全部合法。**改的是 `scripts/generate_art.py`，可复跑。**

### 13.4 工程基建

- **版本控制**：项目历史上不是 git 仓库，只有一份 `round18` 手动备份。现 `git init` + `.gitignore` + 首次提交 `ab25358`。忽略 `dist/`、`node_modules/`、`.playwright-cli/` 与备份/截图/审计日志；**`.workbuddy/tools/` 与 `.workbuddy/memory/` 必须提交**，它们是探针与工程日志。
- **脚本**：`package.json` 新增 `art` / `audit` / `snapshot` 三个入口；`npm run audit` 实测 7/7 探针取到结果。
- **环境坑**：本环境的 Node 被注入 `node-brokered-fs-shim`，凡使用 `fs` 的 `.mjs` 都会静默退出 127（纯 `console.log` 的 mjs 正常）。因此 `audit` / `snapshot` 改用 Python 实现，与既有 `generate_art.py` 一致。

### 13.5 明确不动的

`RuralSandbox3D.vue`（2387 行）与 `textures.js`（1306 行）暂不拆分；`ExhibitCard` / `StatBlock` / `StageFallback` 单引用组件暂不清理。`audit-a11y.js` 的 `perf.transferKB` 在有缓存会话里恒为 0，只可看资源条数。（品牌金大字「保留不修」的结论已在 11-08 更新为按底色分档，见第 14 节，本句以第 14 节为准。）

---

## 14. 第二十一轮：按用户标准微调视觉（2026-11-08）

用户明确「竞赛和网页大作业只要足够好看，没人关心技术栈」，并对上一轮给的五条改进逐条指示：1 不做、2 小改、3 与 4 先出样张再决定、5 直接改。**五条最终全部落地**。

### 14.1 五条最终状态

| 编号 | 结果 |
| --- | --- |
| 1 首屏主视觉大改 | **未做**（用户明确不要） |
| 2 小字密度 | 仅 `.eyebrow` 0.62→0.7rem、`.caption` 0.66→0.72rem；未动布局 / 主标题 / 文字块 |
| 3 金色不够跳 | 改为**按底色分档**：浅底 `#A9701F`、墨底 / 苔底保持 `#C88A32`、土色带保持 `#F0C275`；`style.css` 三条规则集中控制，删掉即可全站还原 |
| 4 图版偏平 | `hero-field.svg` 定稿「纯光影」（金圆柔光晕 + 底部暗角 + 主线提亮，**无一块色块**）；`panorama.svg` 套同一做法；`atlas.svg` 是浅底网格图版，只取主线加深加实 |
| 5 动效感知不到 | 首屏中心圆缩放弹出 + 图版推入旋转归位（0.75 / 0.95s，**无 blur**），挂在子元素避开 GSAP 视差层，`prefers-reduced-motion` 已降级 |

### 14.2 被否决的加法（不要再试）

第一版给 `hero-field.svg` 加过三条独立走向的波浪硬色带，用户反馈「加了色块反而更丑了，可以加，但不能这样加」。问题在**另起一套形状语言**、硬边界、铺满下半幅、压住等高线。改为同频 / 无硬边后给两个候选，用户选「纯光影」。视觉偏好详见 `.workbuddy/memory/MEMORY.md`。

### 14.3 顺带修的生成脚本缺陷

`head()` 的 clipPath 硬编码 `1200×820`，导致 1920×760 的 `panorama.svg` 右半整块空白、金圆被裁；`contour()` 的 `x1=W` 在定义期绑死 1200，等高线只画到左 2/3。改成运行时取 W 后路径最大 x 达 1918。**改图版必须改 `scripts/generate_art.py` 再 `npm run art`**，不要直接编辑 SVG 产物。

### 14.4 风格探索终止

用户觉得现有风格与 Claude 同质化，让去 GitHub 找替代。两批共 6 张首页样张（瑞士网格 / 新粗野 / 终端 → 暗色策展 / 沉浸式 / 冷调 Bento）**全部被否**，最终决定**保持现有视觉风格**。临时 HTML 与截图已清理，正式源码从未改动。详见 `NEXT_PHASE.md` 修正块与 `MEMORY.md`。

### 14.5 基线（11-08 快照 · 勿作当前校验基准）

`npm run build` 零警告；`npm run audit` 7/7 全绿；**对比度探针从 19 项降到 0 项**（浅底金大字达标、深底保持原金）；移动端 `[]` 零溢出；10 张 SVG XML 合法；工作树干净。

> **当前基线已变化**：截至 11-09 15:32 是 11 个探针 / 11/11、`c632e0d`、源码 16533 行。以 `NEXT_PHASE.md` 第 3 节为准，本节及第 13 节的 7/7 均为当时记录。

## 15. 全站联动层（2026-11-12）

* `src/data/exhibitTrail.js` 是 13 个展陈单元顺序与振兴归属的**单一数据源**，`src/components/TrailNav.vue` 是唯一渲染「动线索引条」的全局组件，在 `App.vue` 的 `<main>` 内、router-view 之后挂载。新增单元时在动线表与 `ExhibitMapView.vue` 的 segments 各补一行，编号必须一致。
* 索引条是**墨色薄带**，与页脚同色贴在页脚上沿。不要用浅色卡片：实拍会夹在墨色收束区与墨色页脚之间形成白条。
* 措辞必须用「索引 · 前一段 / 后一段」并标注「按展览地图编号」。多数页面自带 NEXT CHAPTER 叙事卡，两者语义不同，用「下一站」会与页内叙事互相矛盾。
* 视角状态在 `appStore.lensMode`（sessionStorage 只存枚举），方向在 `appStore.trailDirection`，由 `App.vue` 的 `clearTrail()` 在转场结束后清空。`main` 上的 `data-trail` 供观测。
* 动效清单：`.trail-nav__line` 金色细线 scaleX 横扫、`.trail-item` 按 `--trail-i` 错峰 70ms、`.trail-edge` hover scaleX 生长、`Transition name="trail"` 独立 out-in、`route-enter-from--back` 左侧滑入。全部有 reduced-motion 降级。

## 16. 深底可读性与真实图片（2026-11-12）

* **深底文字**：`style.css` 末尾有按底色分档的兜底规则，用属性选择器匹配 Tailwind 任意值类名，一处覆盖全站。内联渐变深底必须加 `data-tone="dark"` 才会被纳入。亮金规则**只作用于 `.eyebrow`**，不要改回 blanket 匹配 `text-[#8A6324]` —— 深底区块里常嵌套浅色卡片，会把表格数字与提示文字一起提亮到看不清（dashboard / sandbox 已踩过）。
* **真实图片**：`public/photos/` 9 张，Unsplash License 免费商用无需署名，均标「实景示意 · UNSPLASH / 不对应具体地块」。除首屏外一律 `loading="lazy"`。Unsplash 搜索页需鉴权，取图请用 `images.unsplash.com/photo-{id}?w=1000&q=72&fm=jpg` 直链 + 联系表筛选。
* **首页不要放实时 3D 沙盘**：滚到第五屏才同步初始化 Three.js 会造成约 4.6 秒主线程阻塞。完整 WebGL 沙盘只在 `/sandbox-3d`，首页用真实航拍照片 + 进馆按钮。
* **性能红线**：不给 `.reveal` 常驻 `will-change`；不用大面积 `blur-3xl`（改静态径向渐变）；滚动编排里不要给每层卡加 `scale` scrub；入场三幕不要 `filter: blur()` 动画与 `mix-blend-mode`。改后首页滚动约 17.8 ms/帧。

## 17. 真实图片的落点与边界（2026-11-12 收尾）

* `public/photos/` 10 张，Unsplash License。三处 `FigurePlate`（地层馆 / 旅程 / 冬捕）换实景；助农三页与痛点页用 `src/components/editorial/PhotoNote.vue` 在首屏后插一条统一横幅。
* **不要把所有程序化图版都换掉**：`hero-field.svg`（纯光影定稿）、`atlas.svg`、`panorama.svg` 与各展厅图版是既有设计语言，全换会散掉整体感。真实照片只补在「原本全是色块与文字」的页面。
* 取图流程：Unsplash 搜索页需鉴权，用 `images.unsplash.com/photo-{id}?w=1000&q=72&fm=jpg` 直链批量拉候选 → 浏览器拼联系表 → 一次看清再挑 → 复拍验证内容。**ID 与内容必须看图确认**，凭编号猜会配错图（本轮下错过两次）。
* 部署前置已就绪：`VITE_BASE` 可配 `base`，README 第八节有完整步骤；但推送与建仓库属于需要用户授权的外部动作，不要自行执行。

## 18. 去冗杂与 GitHub 动效配方（2026-11-15）

* **首页只保留 6 段**：首屏 / 墨色策展导语 / 三大 3D 展厅 / 金色平原影像 / 参观动线 / 绿底科普入口。再往下加整段之前先看全页长图，重复讲展馆结构的内容一律不补。改首页前先备份，绿底科普段曾因夹在待删区间被误删，靠备份切片插回。
* **3D 是最大优势**：首页三张展厅卡用 `public/photos/3d-*.jpg` 真实 WebGL 截屏做封面，不用程序化 SVG。重截时先 `scrollIntoView` 让 canvas 进视口，否则 `clip` 截图会失败。
* **动效配方集中在 `src/App.vue` 的 `initMotion()`**，来源：`kash-123/cinematic-scroll-landing`（clipPath morph / 图片视差 / 进度线）、`ChillMonger04/Axel-Vanhessche-Portfolio`（mask 揭示）、`flash-hero/GOATED-UI-SKILL`（磁吸）。统一用 `gsap.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)')`，路由切换要 `motionMedia?.revert()`。
* **`[data-reveal-img]` 起始只裁 22%**，不要改回 100%：全页截图与打印会整块空白。首屏滚动镜头**不要 pin**，锁滚动会放大冗长感。
* 精简后首页滚动 14.7 ms/帧，比精简前更快。加动效前先想「这段能不能删」，比加特效有效。

## 19. 单位约定（2026-11-15）

* **排版与布局一律用 rem**：字号、间距、尺寸、位置、圆角、容器宽度。新增代码不要写 `text-[12px]` 这类固定像素任意值，写 `text-[0.75rem]`（按 16px 基准换算）。
* `html` 有流式根字号 `clamp(16px, 0.4vw + 10.2px, 20px)`，1440 及以下保持 16px、1920 起放大到 20px 上限。Tailwind 默认 spacing 本来就是 rem，会自动一起缩放。
* **保留 px 的例外**：≤3px 的细线、1px 边框、阴影、滚动条宽度、`backdrop-filter`。它们随字号缩放会变形或消失。
* 触控目标 `min-h-[2.5rem]` 在 16px 基准下正好 40px，不要改回更小的固定值。
* 加新断点前先想清楚：小屏不缩根字号是有意的，9–11px 展签小字再缩会不可读。

## 20. 交互挑战层（2026-11-15）

* `LabChallenge.vue` 是唯一挑战卡组件，科普实验室四关与最后一公里三关共用。新增关卡改 `ScienceView.vue` / `LastMileView.vue` 里的 `mission` / `lmStates` 条件即可，不要复制组件。
* 状态在 `appStore.labVisited / labBadges`，`sessionStorage` 键 `jiyun-labs`。徽章只增不减，`resetLab` 不清。
* **不要改既有按钮名与参数控件**：`audit-soil / rice / notill / beidou` 按可读名称查找，改名会连带破坏四个探针。
* 挑战卡刻意不做卡通游戏 UI：纸感浅底、细边框、金色扫线、中文衬线，完成态用浅底分档金 `#A9701F`。新动效只走 color / transform 并给 reduced-motion 降级。
* 自动测试定位结构卡时用 `.last()` 或按编号：实验切换 tab 的可读名称含「团粒 / 孔隙 / 菌丝 / 钙质结核」，`.first()` 会误点。

## 21. 3D 通用交互与加载（2026-11-15 收尾）

* 新增 3D 交互一律写在 `src/three/stage.js` 的 `createStage` 内（工具条 + 键盘 + 环绕视点），**不要改三个展厅组件**：它们已有各自的 `flyTo` 视点、爆炸分解、层位切换与自动旋转，改动风险高。
* 新工具条叫「四视点巡览」，原有「自动环视导览」是原地自转，文案必须区分。工具条挂底部居中，避开右上控件与四角装裱标；移动端按钮至少 44px。
* 3D 路由预取放在 `HomeView.onMounted` 且必须在 reduced-motion 的 `return` 之前。**不要用 `requestIdleCallback`**：本项目持续 rAF 时该回调可能一直不触发，实测定时触发才可靠。
* 图片别盲目换 WebP：Unsplash 这批图 WebP 比 JPG 大，已回退到 JPG q62。加 `index.html` 全局 preload 会在其它路由报「preloaded but not used」警告。
* 性能红线沿用：不给 `.reveal` 常驻 will-change、不加逐帧 scale scrub、不把 3D 沙盘放回首页。

## 22. 命名口径（2026-11-16）

* 作品主名 **一厘米，四十公里**，副名 **吉韵新程 · 黑土粮仓**。首屏大字按「一厘米，」/「四十公里」两行排，第一行墨色、第二行品牌金，逐字遮罩上推保持不变。
* 页面标题由 `src/router/index.js` 的 `SITE` 统一拼后缀，`meta.title` 不要再写站名，否则会重复两遍。
* 「黑土粮仓」有两层含义：**专有名词**（中科院科技会战、长春科研坐标、资料来源）必须原样保留；**旧品牌名**只在背景说明与分享卡 site_name 里作为副品牌出现。替换时逐处区分，不要全局查找替换。

## 23. 绿底文字与后台标题条（2026-11-19）

* 绿底区块（`data-tone="dark"` / `bg-[#2E5A44]`）内一律浅字。`style.css` 已有兜底规则覆盖 `.lede/.caption/text-[#5A564E]/text-[#6E6960]/text-[#1C1B18]` 等，并用 `:not()` 排除浅底卡与 `.mag-btn`，别把排除条件删掉，否则会误伤浅底正确墨字。
* 金色徽章与浅底按钮上的墨字是**正确**的，不要因为含 `text-[#1C1B18]` 就改成白色。
* 后台控制台 header 是 `sticky top-[5.5rem] z-20 bg-[#F7F4EE]/98`，配合外层 `pt-[5.5rem]`，滚动时标题条停在浮层导航下方。改后台布局时别把这两个值一起去掉。
* 用户反馈「看不清」时先取 computed color 与滚动位置，区分真实配色错误、`Reveal` 入场中间态与浏览器旧缓存，不要直接改色。

## 24. 深底区块不用淡入（2026-11-19）

* 深底（绿色 / 墨色）区块里的文字**不要用 `Reveal` 默认淡入**：半透明白字叠深底会读成黑字，用户滚动经过时尤其明显。用 `variant="solid"`，只做 16px 位移，始终 `opacity: 1`。
* 验证这类反馈要复现用户动作：滚到目标位置后 80ms 抓拍并检查 `getComputedStyle(el).opacity`，不要等 3 秒动画播完再判断。
* 上一轮误判成浏览器缓存，是因为验证时多等了 900ms 躲开中间态。记住这个坑。
