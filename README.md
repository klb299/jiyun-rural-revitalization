# 吉韵禾野 · 乡村振兴移动端 App 与后台管理系统

> **期末大作业作品 · 主题：乡村振兴（移动端 App 界面 + 后台管理系统 + 数智指挥大屏 + 3D 数字展馆）**  
> 立足吉林松辽黑土带，融合地标农产品助农直采、云认养一亩田、黑土慢直播、AI 智慧农艺师、北斗 5G 无人农机孪生调度与 3D 生态展厅的**双端实时联动数字乡村平台**。

---

## 一、作品全景与核心亮点

本项目采用**单仓库双端同源架构**（前端无外部后端依赖，基于 Pinia + `localStorage` + 跨标签页 `storage` 事件实现毫秒级实时双向同步），覆盖五大演示形态：

| 演示视角 | 访问路由 | 核心定位 |
| :--- | :--- | :--- |
| **移动端 App 体验舱（默认首页）** | `/` | 桌面端以钛金真机画框呈现新中式美学展示台与 6 大场景直达卡；手机屏幕（`< 768px`）自动铺满为原生全屏 App |
| **双端同屏实时联动（答辩首选）** | `/split` | 左侧移动端 App + 右侧后台管理系统同屏并置，现场演示下单、发货、改价、调物候、发公告的实时双向响应 |
| **独立后台管理系统** | `/admin` | 8 大数智运营模块 + `Ctrl + K` 全局指令检索 + ECharts 可视化 + 北斗 RTK 孪生雷达 + CSV / JSON 报表导出 |
| **乡村振兴数智指挥大屏** | `/bigscreen` | 全屏深松绿鎏金三栏指挥大屏，含松辽产区冷链动态飞线、四路实景监控墙、ECharts 遥测与实时成交流 |
| **全屏移动端 App / 3D 数字展馆** | `/app` · `/museum` | 独立全屏移动端视图，以及完整保留的 Three.js 3D 黑土剖面、北斗农机解构与松辽平原生态沙盘等展馆路线 |

> **后台演示账号说明**：访问 `/admin` 时可点击「一键免密体验」或输入演示密码 `admin123456`（纯前端演示门禁，无服务端鉴权，支持随时在设置页一键重置演示数据）。

---

## 二、功能矩阵

### 1. 移动端 App（[RuralAppShell.vue](src/components/mobile/RuralAppShell.vue)）

- **5 大底部主导航 Tab**：
  - **首页**：新中式青绿山水背景与轮播首图、4 路黑土慢直播动态环、5 项高频快捷金刚区、Web Speech 语音播报农情日报、**吉林四大风物产区手绘互动地图**（[AppOriginMapCard.vue](src/components/mobile/AppOriginMapCard.vue)）、手机竖屏原生 3D 展厅直达、振兴重点项目档案。
  - **集市**：覆盖 8 大品类的 **14 款吉林地理标志农产品**，支持关键词检索、品类切换、**4 维排序**（综合推荐 / 销量优先 / 价格升序 / 助农分成最高）、商品详情「透明助农收益分成条」、助农满减券核销、结算后弹出深松绿鎏金 **「助农直采下单成功」电子感谢回执**（实时核算直达合作社农户金额与公益积分）。
  - **认养**：覆盖 4 大类别（黑土粮田 / 生态蜂渔 / 林下果木 / 智慧温室）的 **7 块云认养实景地块**，支持分类筛选、在线认养申请、查看云农场实时农事日志与**电子黑土守护证书**（[AppCertificateModal.vue](src/components/mobile/AppCertificateModal.vue)）。
  - **村务**：村务置顶公告与寒潮农时预警、村民直报（农机预约 / 农技咨询 / 助农反馈）表单提交与后台回复实时回显。
  - **我的**：黑土守护者数字身份卡、我的订单与物流时间轴追踪、我的云认养档案、收藏夹与助农消费券管理。
- **6 大高新技术沉浸功能页**：
  - **视频模拟慢直播（含清屏模式）**（[AppLiveCamOverlay.vue](src/components/mobile/AppLiveCamOverlay.vue)）：60fps HTML5 Canvas 程序化实景运镜（查干湖飞雪、稻田金尘、北斗 RTK 厘米级锁定准星）、实时帧时间码、画质切换、Web Audio 环境风声、实时弹幕点赞、关联特产直购，以及**一键清屏 / 轻触画面纯净观看**。
  - **AI 智慧农艺师**（[AppAiAgronomistPage.vue](src/components/mobile/AppAiAgronomistPage.vue)）：支持「AI 拍照诊断」（黑土大地俯拍有机质快检、水稻分蘖叶绿素检测、玉米成熟度检测 + 本地图片上传扫描框分析）与接入真实 Pinia 遥测数据的流式打字机农情问答。
  - **一盒一码数字溯源**（[AppTraceabilityPage.vue](src/components/mobile/AppTraceabilityPage.vue)）：激光扫描动画、批次号快捷查验、红章质检认证卡与区块链存证五段全链路履历。
  - **二十四节气吉林农时历**（[AppSolarAlmanacPage.vue](src/components/mobile/AppSolarAlmanacPage.vue)）：春生 / 夏长 / 秋收 / 冬藏四季切换、农事指南与应季风物直达。
  - **黑土碳账本与收益测算器**（[AppCarbonWalletPage.vue](src/components/mobile/AppCarbonWalletPage.vue)）：个人减碳贡献记录、荣誉徽章与「一块地 · 五笔收入」交互式滑块增收模型。
  - **App 内原生 3D 展厅**：深度适配手机竖屏视口与触控交互的 Three.js 黑土地质标本、长春造 260HP 北斗农机爆炸解构与松辽生态沙盘。

### 2. 后台管理系统（[AdminConsole.vue](src/components/admin/AdminConsole.vue)）

- **8 大运营模块**：
  1. **数智总览**：深松绿鎏金指挥横幅、实时核心 KPI、ECharts 近七日助农成交与订单双轴趋势图、严格归一化（`SUM = 100%`）的 8 品类销量占比图（[RuralAdminCharts.vue](src/components/admin/RuralAdminCharts.vue)）及最新双端动态流。
  2. **北斗孪生调度**（[AdminTelemetryMap.vue](src/components/admin/AdminTelemetryMap.vue)）：60fps 深松绿北斗三号 RTK 数字孪生雷达地图，实时可视化 4 台智能农机/无人机轨迹并支持单机远程切换作业状态。
  3. **农产集市**：14 款商品全生命周期管理，原生 `<dialog>` 弹窗支持新增、编辑定价/库存/分成比例、上下架与删除，实时同步 App 集市。
  4. **助农订单**：按状态筛选订单、单笔发货/完成履约、**一键批量发货**、模拟 App 进单及 **CSV 报表导出**。
  5. **云认养地块**：7 块可视化缩略图认养卡片与余量进度条、审核待生效认养单、在线推进 8 阶段农作物物候进度并同步写入用户云农场日志，支持 **导出认养台账 CSV**。
  6. **项目 · 农机 · 直播**：振兴重点工程进度与资金管控、新增项目弹窗、农机状态调度与 4 路慢直播机位启停切换。
  7. **村务与反馈**：发布/置顶村务公告直推 App 首页、回复处理村民预约与农技留言。
  8. **App 与系统设置**：动态修改 App 品牌副标题/节气标语/首页大标题、**导出全平台 JSON 快照备份**与一键重置初始演示数据。
- **全局效率增强**：支持键盘快捷键 **`Ctrl + K` / `Cmd + K`** 呼出全局指令检索框，跨模块检索商品、订单、认养地块与振兴项目一键直达。

---

## 三、推荐 3 分钟答辩演示路线

1. **开场切入 `/split`（双端同屏实时联动）**
   - 展示新中式青绿山水美学布局，介绍左屏移动端 App 与右屏后台管理系统共用同一套响应式数据中枢。
2. **演示「助农直采 + 后台履约」闭环（40 秒）**
   - 左侧 App 进入「集市」切换「助农分成最高」排序，任选商品下单结算，展示 **深松绿鎏金助农电子回执**（精确呈现合作社分成金额）；
   - 右侧后台「助农订单」实时红点跳动、进单入列，点击 **「一键批量发货」**，左侧 App「我的订单」同步刷新为已发货。
3. **演示「AI 农艺 + 视频慢直播 + 3D 农机」高新技术力（60 秒）**
   - 左侧 App 点开 **「AI 农技」**，展示黑土大地俯拍有机质视觉快检与实时问答；
   - 点开首页 **「查干湖冬捕」慢直播**，展示飞雪特效、弹幕互动与 **一键清屏**；
   - 点击首页 **「北斗农机 3D 展厅」**，与实景配图对照演示长春造 260HP 拖拉机的 3D 旋转与爆炸分解。
4. **演示「北斗孪生调度 + `Ctrl+K` + 数智大屏」（50 秒）**
   - 右侧后台按下 **`Ctrl + K`** 检索「草莓」秒速跳转，切至 **「北斗孪生调度」** 远程切换农机作业状态；
   - 点击顶栏 **「数智大屏」** 进入 `/bigscreen`，在全屏飞线大屏中点击「模拟实时进单」收尾。

---

## 四、技术栈与目录结构

### 技术栈

| 层次 | 选型与版本 |
| :--- | :--- |
| 前端框架 | Vue `3.5.44`（`<script setup>`）、Vue Router `4.6.4`、Pinia `4.1.0` |
| 构建与样式 | Vite `8.3.5`、Tailwind CSS `4.3.4`、Lucide Vue Next `1.0.0` |
| 3D 与数据可视化 | Three.js `0.187.0`、ECharts `6.1.0`、GSAP `3.15.0`、HTML5 Canvas 2D |
| 状态与本地持久化 | Pinia 统一双端中枢 + `localStorage` + 跨标签页 `storage` 实时同步 |

### 核心目录结构

```text
src/
├── stores/
│   └── ruralPlatformStore.js         # 双端统一 Pinia 状态中枢（商品/订单/认养/直播/农机/村务/日志）
├── components/
│   ├── mobile/                       # 移动端 App 完整组件套件
│   │   ├── RuralAppShell.vue         # App 主框架（5 Tab + 集市/认养/村务/我的 + 3D 呼出）
│   │   ├── AppOriginMapCard.vue      # 吉林四大产区青绿山水手绘互动地图
│   │   ├── AppLiveCamOverlay.vue     # 60fps Canvas 视频模拟慢直播（含清屏模式）
│   │   ├── AppAiAgronomistPage.vue   # AI 视觉拍照诊断 + 实时农情问答
│   │   ├── AppTraceabilityPage.vue   # 一盒一码扫码溯源中心
│   │   ├── AppCertificateModal.vue   # 云农场成长日志 + 电子黑土守护证书
│   │   ├── AppSolarAlmanacPage.vue   # 二十四节气吉林农时历
│   │   └── AppCarbonWalletPage.vue   # 黑土碳账本 + 一块地五笔收入测算器
│   ├── admin/                        # 后台管理系统组件套件
│   │   ├── AdminConsole.vue          # 8 模块后台主控台（含 Ctrl+K 检索 / 原生 <dialog> / 导出）
│   │   ├── RuralAdminCharts.vue      # ECharts 双轴成交趋势与归一化品类图
│   │   └── AdminTelemetryMap.vue     # 北斗三号 RTK 60fps 数字孪生雷达调度图
│   ├── SoilStrata3D.vue              # 3D 黑土地质剖面（适配桌面 + App 竖屏）
│   ├── SmartMachinery3D.vue          # 3D 长春造北斗无人拖拉机（适配桌面 + App 竖屏）
│   └── RuralSandbox3D.vue            # 3D 松辽平原数字生态沙盘（适配桌面 + App 竖屏）
├── views/
│   ├── AppShowcaseView.vue           # / 移动端体验舱（手机自动全屏）
│   ├── MobileAppView.vue             # /app 全屏 App 路由
│   ├── SplitSyncView.vue             # /split 双端同屏实时联动台
│   ├── AdminView.vue                 # /admin 独立后台管理系统
│   ├── BigScreenView.vue             # /bigscreen 乡村振兴数智指挥大屏
│   └── ...                           # /museum 及全套 3D 展馆专题页面
public/
├── art-custom/                       # 本项目定制新中式背景、产区手绘地图、14 款地标特产与 3D 同款长春拖拉机实景图
└── art-hd/                           # 吉林黑土、稻田、查干湖冬捕等高清风物底图
```

---

## 五、快速启动

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run dev

# 生产环境构建（输出至 dist/）
npm run build

# 预览生产构建产物
npm run preview
```

> **数据口径声明**：平台内农产品价格、合作社分成比例、黑土有机质（4.82%）、北斗 RTK 精度（±2.5 cm）、累计成交额及带动农户数均为结合吉林现代农业与乡村振兴公开资料整理的教学演示数据，仅用于课程设计与交互演示，不产生真实交易。
