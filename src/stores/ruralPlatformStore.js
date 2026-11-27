/**
 * 吉韵禾野 · 乡村振兴双端联动状态中枢 (App + 后台管理系统)
 * -----------------------------------------------------------
 * 移动端 App 与后台管理系统共用同一套响应式数据，持久化至 localStorage，
 * 并监听跨标签页 storage 事件，实现真正意义上的双端实时同步。
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'jiyun-rural-platform-v5'
const SESSION_KEY = 'jiyun-admin-session'
const ADMIN_PASSWORD = 'admin123456'

const defaultProducts = [
  {
    id: 'prod-1',
    name: '九台黑土有机贡米',
    subtitle: '2026新季头茬 · 稻蟹共生免农药',
    category: '黑土粳稻',
    origin: '吉林 · 长春九台区',
    coop: '九台黑土稻作专业合作社',
    price: 68,
    originalPrice: 88,
    unit: '5kg / 礼袋',
    stock: 146,
    sales: 1284,
    farmerSharePct: 78,
    badge: '地理标志',
    traceCode: 'JL-JT-2026-0891',
    status: '上架',
    image: '/art-hd/golden-rice.jpg',
    desc: '生长于松花江与饮马河冲积黑土核心带，180天漫长积温灌浆，全程北斗农机插秧与低温慢烘，米粒油润回甘，每袋附一袋一码溯源档案。'
  },
  {
    id: 'prod-2',
    name: '查干湖冰下鲜捕胖头鱼',
    subtitle: '国家级非遗冬捕 · 顺丰冷链锁鲜',
    category: '生态渔猎',
    origin: '吉林 · 松原查干湖',
    coop: '前郭查干湖生态渔业合作社',
    price: 198,
    originalPrice: 238,
    unit: '约 2.5kg / 条',
    stock: 64,
    sales: 892,
    farmerSharePct: 74,
    badge: '非遗直供',
    traceCode: 'JL-CGH-2026-0312',
    status: '上架',
    image: '/art-hd/chagan-winter.jpg',
    desc: '坚持“抓大放小”生态疏网，纯净冰湖天然饵料慢长五年，肉质细嫩无土腥味，现捕现发直达餐桌。'
  },
  {
    id: 'prod-3',
    name: '梨树黑土鲜食糯玉米',
    subtitle: '秸秆覆盖免耕黑土 · 真空锁鲜',
    category: '黄金玉米',
    origin: '吉林 · 四平梨树县',
    coop: '梨树保护性耕作联合社',
    price: 39.9,
    originalPrice: 52,
    unit: '10 穗 / 箱',
    stock: 320,
    sales: 2640,
    farmerSharePct: 81,
    badge: '黑土优品',
    traceCode: 'JL-LS-2026-1420',
    status: '上架',
    image: '/art-custom/waxy-corn.jpg',
    desc: '源自“梨树模式”保护性耕作示范田，腐殖质含量4.82%，皮薄软糯清甜，采摘后4小时内完成锁鲜蒸煮。'
  },
  {
    id: 'prod-4',
    name: '长白山林下仿野生人参礼盒',
    subtitle: '12年林下自然生长 · 权威检验证书',
    category: '长白山珍',
    origin: '吉林 · 白山抚松县',
    coop: '抚松林下参农合作社',
    price: 328,
    originalPrice: 398,
    unit: '2 支装 / 锦盒',
    stock: 38,
    sales: 416,
    farmerSharePct: 76,
    badge: '地理标志',
    traceCode: 'JL-CBS-2026-0109',
    status: '上架',
    image: '/art-custom/ginseng.jpg',
    desc: '长白山原始阔叶红松林下散播，不施肥不打药，由当地参农手工采挖并编号溯源，助力山区林农持续增收。'
  },
  {
    id: 'prod-5',
    name: '松辽平原非转基因高蛋白黄豆',
    subtitle: '黑土沃野直供 · 豆香浓郁',
    category: '黑土杂粮',
    origin: '吉林 · 农安合作社',
    coop: '农安青禾专业合作社',
    price: 29.8,
    originalPrice: 38,
    unit: '2.5kg / 罐',
    stock: 215,
    sales: 1530,
    farmerSharePct: 83,
    badge: '合作社直发',
    traceCode: 'JL-NA-2026-0774',
    status: '上架',
    image: '/art-custom/soybeans-real.jpg',
    desc: '蛋白含量高达42%，颗粒饱满圆润，适合鲜磨豆浆与手工豆腐，由农安青禾专业合作社统一分选直发。'
  },
  {
    id: 'prod-6',
    name: '吉林寒地黑土稻花香礼箱',
    subtitle: '合作社联名助农款 · 节日伴手礼',
    category: '黑土粳稻',
    origin: '吉林 · 舒兰现代农业园',
    coop: '舒兰优质稻米产销社',
    price: 128,
    originalPrice: 158,
    unit: '10kg / 礼盒',
    stock: 92,
    sales: 745,
    farmerSharePct: 79,
    badge: '助农推荐',
    traceCode: 'JL-SL-2026-0558',
    status: '上架',
    image: '/art-hd/jilin-harvest.jpg',
    desc: '双层牛皮纸环保礼盒，每售出一箱为舒兰稻农合作社注入生态护土专项基金，附带田间物候记录卡。'
  },
  {
    id: 'prod-7',
    name: '长白山原巢熟成椴树雪蜜',
    subtitle: '白山靖宇原始椴树林 · 结晶如脂清甜',
    category: '长白山珍',
    origin: '吉林 · 白山靖宇县',
    coop: '靖宇长白山中华蜂养蜂社',
    price: 89,
    originalPrice: 118,
    unit: '500g / 玻璃罐',
    stock: 134,
    sales: 1120,
    farmerSharePct: 80,
    badge: '地理标志',
    traceCode: 'JL-JY-2026-0618',
    status: '上架',
    image: '/art-custom/honey.jpg',
    desc: '采自长白山海拔 800 米原始紫椴树林，中华蜜蜂自然封盖酿造，色泽乳白如雪、花香馥郁，不勾兑不浓缩，直连林区蜂农。'
  },
  {
    id: 'prod-8',
    name: '汪清长白山头茬黑木耳（秋耳）',
    subtitle: '椴木小碗秋耳 · 肉厚胶质饱满',
    category: '长白山珍',
    origin: '吉林 · 延边汪清县',
    coop: '汪清黑木耳生态种植合作社',
    price: 56,
    originalPrice: 72,
    unit: '250g / 礼袋',
    stock: 268,
    sales: 1890,
    farmerSharePct: 82,
    badge: '国家地标',
    traceCode: 'JL-WQ-2026-0923',
    status: '上架',
    image: '/art-custom/black-fungus.jpg',
    desc: '昼夜大温差慢长而成的头茬秋耳，泡发率高达 1:14，口感脆滑柔韧，是延边汪清乡村振兴支柱产业代表特产。'
  },
  {
    id: 'prod-9',
    name: '集安鸭绿江河谷北冰红冰葡萄酒',
    subtitle: '零下8°C带冰采摘 · 寒地甜蜜佳酿',
    category: '乡野佳酿',
    origin: '吉林 · 通化集安市',
    coop: '集安山葡萄酿造庄园联合社',
    price: 168,
    originalPrice: 218,
    unit: '375ml / 礼盒装',
    stock: 74,
    sales: 518,
    farmerSharePct: 75,
    badge: '地理标志',
    traceCode: 'JL-JA-2026-0214',
    status: '上架',
    image: '/art-custom/ice-wine.jpg',
    desc: '中国农业科学院特产研究所培育“北冰红”品种，严冬挂枝自然结冰浓缩糖分与果香，口感醇厚甘冽，带动鸭绿江沿岸果农增收。'
  },
  {
    id: 'prod-10',
    name: '延边龙井霜降苹果梨鲜果礼箱',
    subtitle: '百年果园现摘直发 · 脆甜多汁',
    category: '寒地鲜果',
    origin: '吉林 · 延边龙井市',
    coop: '龙井万亩苹果梨产业合作社',
    price: 49.9,
    originalPrice: 66,
    unit: '2.5kg / 8-10果',
    stock: 185,
    sales: 1460,
    farmerSharePct: 81,
    badge: '原产直采',
    traceCode: 'JL-LJ-2026-1105',
    status: '上架',
    image: '/art-custom/apple-pear.jpg',
    desc: '北纬 42° 延边盆地充足光照孕育，果皮金黄带红晕、核小肉脆、汁水充盈，支持常温鲜食或冷冻自制东北特色冻梨。'
  },
  {
    id: 'prod-11',
    name: '长白山红松手剥开口大松子',
    subtitle: '原始红松林采塔 · 物理开口原味',
    category: '长白山珍',
    origin: '吉林 · 通化梅河口',
    coop: '梅河口长白山松果加工合作社',
    price: 78,
    originalPrice: 98,
    unit: '500g / 锁鲜罐',
    stock: 152,
    sales: 1340,
    farmerSharePct: 77,
    badge: '黑土优品',
    traceCode: 'JL-MHK-2026-0430',
    status: '上架',
    image: '/art-custom/pine-nuts.jpg',
    desc: '严选长白山成熟红松塔饱满大粒，低温慢烘物理开口，不漂白无添加，颗粒饱满油香浓郁，一捏即开。'
  },
  {
    id: 'prod-12',
    name: '松花江生态稻田大闸蟹礼盒',
    subtitle: '稻蟹共生零药肥 · 满黄满膏鲜活直发',
    category: '生态渔猎',
    origin: '吉林 · 松原前郭县',
    coop: '前郭生态渔农共生合作社',
    price: 158,
    originalPrice: 198,
    unit: '6 只装 / 公母对蟹',
    stock: 56,
    sales: 685,
    farmerSharePct: 76,
    badge: '生态直供',
    traceCode: 'JL-QG-2026-0719',
    status: '上架',
    image: '/art-custom/river-crab.jpg',
    desc: '生长于松花江灌区有机稻田，以田间浮游生物与嫩草为食，实现“一田双收”，肉质清甜紧实、蟹黄饱满。'
  },
  {
    id: 'prod-13',
    name: '延边朝鲜族非遗手作辣白菜组合',
    subtitle: '苹果梨天然发酵 · 附腌渍苏子叶',
    category: '非遗风味',
    origin: '吉林 · 延边延吉市',
    coop: '延吉非遗民俗食品工坊社',
    price: 45,
    originalPrice: 58,
    unit: '1.5kg / 冷链礼盒',
    stock: 210,
    sales: 1750,
    farmerSharePct: 79,
    badge: '非遗风味',
    traceCode: 'JL-YJ-2026-0832',
    status: '上架',
    image: '/art-custom/yanbian-kimchi.jpg',
    desc: '选用延边霜打大白菜与本地苹果梨汁手工涂抹发酵，酸辣脆爽层次丰富，内含双罐辣白菜与一罐秘制苏子叶。'
  },
  {
    id: 'prod-14',
    name: '镇赉光伏温室寒地奶油草莓礼盒',
    subtitle: '农光互补智能温室 · 冬季现摘空运',
    category: '寒地鲜果',
    origin: '吉林 · 白城镇赉县',
    coop: '镇赉农光互补智慧农业园',
    price: 86,
    originalPrice: 108,
    unit: '1kg / 礼盒直发',
    stock: 68,
    sales: 612,
    farmerSharePct: 80,
    badge: '智慧农业',
    traceCode: 'JL-ZL-2026-1208',
    status: '上架',
    image: '/art-custom/solar-strawberry.jpg',
    desc: '生长于白城镇赉光伏智慧温室，棚顶发电、棚下立体无土栽培，蜜蜂自然授粉，冬日里也能尝到一口爆汁的东北奶油草莓。'
  }
]

const defaultLiveCams = [
  {
    id: 'cam-1',
    title: '九台黑土稻田 · 越冬墒情实景',
    shortTitle: '九台稻田',
    location: '长春 · 九台区饮马河灌区',
    status: '直播中',
    viewers: 1842,
    image: '/art-hd/golden-rice.jpg',
    temp: '-4.2°C',
    humidity: '64%',
    soilMoisture: '68%',
    wind: '西北风 3级',
    linkedProductId: 'prod-1',
    comments: [
      { id: 'c1', user: '北方麦田', text: '这片黑土看着真肥沃，已下单两袋贡米！' },
      { id: 'c2', user: '晴空万里', text: '刚扫码查了溯源码，连合作社收割日期都清清楚楚' },
      { id: 'c3', user: '小禾苗', text: '希望能多看看北斗无人农机现场作业画面' }
    ]
  },
  {
    id: 'cam-2',
    title: '查干湖冰面冬捕 · 探鱼下网现场',
    shortTitle: '查干湖冬捕',
    location: '松原 · 前郭查干湖西岸',
    status: '直播中',
    viewers: 3426,
    image: '/art-hd/chagan-winter.jpg',
    temp: '-11.8°C',
    humidity: '52%',
    soilMoisture: '冰厚 42cm',
    wind: '微风 2级',
    linkedProductId: 'prod-2',
    comments: [
      { id: 'c4', user: '冰湖旅人', text: '非遗马拉绞盘太震撼了，坚持抓大放小点赞！' },
      { id: 'c5', user: '江南食客', text: '顺丰冷链发杭州两天就到，鱼头汤鲜掉眉毛' }
    ]
  },
  {
    id: 'cam-3',
    title: '梨树示范田 · 秸秆覆盖免耕保护',
    shortTitle: '梨树免耕田',
    location: '四平 · 梨树县泉眼沟村',
    status: '直播中',
    viewers: 965,
    image: '/art-hd/black-soil-contours.jpg',
    temp: '-5.6°C',
    humidity: '58%',
    soilMoisture: '62%',
    wind: '偏北风 3级',
    linkedProductId: 'prod-3',
    comments: [
      { id: 'c6', user: '农学研究生', text: '梨树模式把秸秆当棉被盖在黑土上，防风蚀效果太好了' }
    ]
  },
  {
    id: 'cam-4',
    title: '北斗 5G 无人拖拉机 · 秋季深松调度',
    shortTitle: '北斗农机',
    location: '长春 · 农安现代农高区',
    status: '直播中',
    viewers: 1520,
    image: '/art-custom/changchun-tractor.jpg',
    temp: '-4.9°C',
    humidity: '60%',
    soilMoisture: 'RTK ±2.1cm',
    wind: '西风 2级',
    linkedProductId: 'prod-5',
    comments: [
      { id: 'c7', user: '铁牛车迷', text: '260马力柴电混动起垄直线误差不到两厘米，硬核！' }
    ]
  }
]

const defaultOrders = [
  {
    id: 'ORD-20261121-01',
    customer: '林晓禾',
    phone: '138****4021',
    address: '吉林省长春市南关区人民大街 108 号',
    items: [
      { productId: 'prod-1', name: '九台黑土有机贡米', qty: 2, price: 68 }
    ],
    total: 136,
    discount: 0,
    status: '待发货',
    traceCode: 'JL-JT-2026-0891',
    createdAt: '2026-11-21 14:20'
  },
  {
    id: 'ORD-20261121-02',
    customer: '陈知远',
    phone: '139****8812',
    address: '北京市海淀区中关村南大街 27 号',
    items: [
      { productId: 'prod-2', name: '查干湖冰下鲜捕胖头鱼', qty: 1, price: 198 },
      { productId: 'prod-3', name: '梨树黑土鲜食糯玉米', qty: 1, price: 39.9 }
    ],
    total: 237.9,
    discount: 10,
    status: '已发货',
    traceCode: 'JL-CGH-2026-0312',
    createdAt: '2026-11-21 10:05'
  },
  {
    id: 'ORD-20261120-09',
    customer: '周明月',
    phone: '186****3309',
    address: '上海市徐汇区漕溪北路 88 号',
    items: [
      { productId: 'prod-4', name: '长白山林下仿野生人参礼盒', qty: 1, price: 328 }
    ],
    total: 328,
    discount: 25,
    status: '已完成',
    traceCode: 'JL-CBS-2026-0109',
    createdAt: '2026-11-20 18:42'
  },
  {
    id: 'ORD-20261120-05',
    customer: '王启铭',
    phone: '150****7166',
    address: '吉林省吉林市船营区松江中路 65 号',
    items: [
      { productId: 'prod-5', name: '松辽平原非转基因高蛋白黄豆', qty: 3, price: 29.8 }
    ],
    total: 89.4,
    discount: 0,
    status: '已完成',
    traceCode: 'JL-NA-2026-0774',
    createdAt: '2026-11-20 11:18'
  }
]

const defaultPlots = [
  {
    id: 'plot-a01',
    code: 'JT-A01',
    category: '黑土粮田',
    name: '九台核心黑土有机稻田',
    location: '长春 · 九台区饮马河灌区',
    area: '0.5 亩 / 份',
    priceYear: 980,
    organicPct: 4.82,
    moisturePct: 68,
    phValue: '6.7 微酸',
    stage: '秋收归仓 · 即将直邮',
    stageIndex: 3,
    slotsLeft: 12,
    totalSlots: 40,
    expectedYield: '保底直邮 120 斤头茬九台新米',
    image: '/art-hd/songliao-plain.jpg',
    coop: '九台黑土稻作专业合作社',
    farmerName: '赵振华（首席农技员）'
  },
  {
    id: 'plot-b03',
    code: 'LS-B03',
    category: '黑土粮田',
    name: '梨树秸秆免耕示范玉米田',
    location: '四平 · 梨树县国家百万亩绿色基地',
    area: '1.0 亩 / 份',
    priceYear: 680,
    organicPct: 4.65,
    moisturePct: 62,
    phValue: '6.8 中性',
    stage: '秸秆还田 · 越冬蓄墒',
    stageIndex: 1,
    slotsLeft: 18,
    totalSlots: 30,
    expectedYield: '保底直邮 60 穗鲜食玉米 + 杂粮包',
    image: '/art-hd/black-soil-contours.jpg',
    coop: '梨树现代保护性耕作联合社',
    farmerName: '李桂兰（示范田主理人）'
  },
  {
    id: 'plot-c02',
    code: 'CG-C02',
    category: '生态蜂渔',
    name: '查干湖稻蟹共生生态湿地田',
    location: '松原 · 前郭查干湖畔',
    area: '0.5 亩 / 份',
    priceYear: 1280,
    organicPct: 4.91,
    moisturePct: 74,
    phValue: '7.1 弱碱',
    stage: '生态养水 · 蟹稻轮作',
    stageIndex: 2,
    slotsLeft: 7,
    totalSlots: 25,
    expectedYield: '100 斤蟹田米 + 生态大闸蟹礼券',
    image: '/art-custom/river-crab.jpg',
    coop: '前郭生态渔农共生合作社',
    farmerName: '包玉山（湿地生态管护员）'
  },
  {
    id: 'plot-d05',
    code: 'CBS-D05',
    category: '林下果木',
    name: '长白山林下仿野生人参保育林地',
    location: '白山 · 抚松县原始阔叶红松林',
    area: '20 ㎡ 林地 / 份',
    priceYear: 1680,
    organicPct: 5.45,
    moisturePct: 71,
    phValue: '6.2 森林腐殖',
    stage: '林下休眠 · 积雪保温',
    stageIndex: 2,
    slotsLeft: 9,
    totalSlots: 20,
    expectedYield: '保底赠 10 年林下鲜参 2 支 + 参蜜礼盒',
    image: '/photos/forest.jpg',
    coop: '抚松长白山林下参农合作社',
    farmerName: '姜守林（林下参非遗传承人）'
  },
  {
    id: 'plot-e02',
    code: 'YN-E02',
    category: '林下果木',
    name: '延边龙井百年苹果梨生态果树',
    location: '延边 · 龙井市万亩生态果园',
    area: '1 棵挂牌果树 / 份',
    priceYear: 520,
    organicPct: 4.38,
    moisturePct: 59,
    phValue: '6.6 微酸',
    stage: '冬剪养树 · 挂牌定制',
    stageIndex: 1,
    slotsLeft: 24,
    totalSlots: 50,
    expectedYield: '保底直邮 30 斤霜降苹果梨 + 专属树牌',
    image: '/art-custom/apple-pear.jpg',
    coop: '龙井万亩苹果梨产业合作社',
    farmerName: '金明哲（果园技术理事长）'
  },
  {
    id: 'plot-f04',
    code: 'JY-F04',
    category: '生态蜂渔',
    name: '长白山靖宇椴树林智慧中华蜂箱',
    location: '白山 · 靖宇县原始紫椴沟',
    area: '1 座智慧蜂箱 / 份',
    priceYear: 760,
    organicPct: 5.12,
    moisturePct: 65,
    phValue: '箱温 26.4°C',
    stage: '越冬保温 · 蜜源备春',
    stageIndex: 2,
    slotsLeft: 14,
    totalSlots: 30,
    expectedYield: '保底直邮 6 斤头茬椴树雪蜜 + 巢蜜块',
    image: '/art-custom/honey.jpg',
    coop: '靖宇长白山中华蜂养蜂社',
    farmerName: '刘长河（首席养蜂技师）'
  },
  {
    id: 'plot-g01',
    code: 'ZL-G01',
    category: '智慧温室',
    name: '镇赉农光互补智慧奶油草莓温室畦',
    location: '白城 · 镇赉县光伏现代农业园',
    area: '15 ㎡ 智能畦 / 份',
    priceYear: 860,
    organicPct: 4.95,
    moisturePct: 76,
    phValue: '棚温 21.8°C',
    stage: '盛果采摘 · 冬季直邮中',
    stageIndex: 3,
    slotsLeft: 11,
    totalSlots: 35,
    expectedYield: '冬春 4 批直邮奶油草莓 + 绿电公益分红',
    image: '/art-custom/solar-strawberry.jpg',
    coop: '镇赉农光互补智慧农业园',
    farmerName: '王雪梅（温室智控主管）'
  }
]

const defaultAdoptions = [
  {
    id: 'ADP-2026-101',
    plotId: 'plot-a01',
    plotCode: 'JT-A01',
    plotName: '九台核心黑土有机稻田',
    adopter: '林晓禾',
    phone: '138****4021',
    shares: 1,
    amount: 980,
    status: '已生效',
    stage: '秋收归仓 · 即将直邮',
    createdAt: '2026-11-18 09:30',
    logs: [
      { time: '11-21 08:15', text: '恒温数字粮仓完成低温慢烘，含水率稳定在 14.2%，准备装袋贴码。' },
      { time: '11-19 15:40', text: '北斗无人收割机完成 JT-A01 地块收割，实测亩产 1140 斤。' },
      { time: '11-18 09:35', text: '合作社已核验认养档案并签发专属黑土守护电子证书。' }
    ]
  },
  {
    id: 'ADP-2026-102',
    plotId: 'plot-c02',
    plotCode: 'CG-C02',
    plotName: '查干湖稻蟹共生生态湿地田',
    adopter: '苏婉清',
    phone: '135****9204',
    shares: 2,
    amount: 2560,
    status: '待审核',
    stage: '生态养水 · 蟹稻轮作',
    createdAt: '2026-11-21 13:15',
    logs: [
      { time: '11-21 13:15', text: '已提交云认养申请，等待乡村振兴后台管理员核验生效。' }
    ]
  }
]

const defaultProjects = [
  {
    id: 'prj-1',
    name: '“梨树模式”万亩黑土保护性耕作基地',
    category: '生态保育',
    village: '四平 · 梨树县泉眼沟村',
    progress: 86,
    households: 342,
    fundWan: 480,
    status: '推进中',
    cover: '/art-hd/black-soil-contours.jpg',
    summary: '推广秸秆全量覆盖还田与条带免耕播种，减少表土风蚀水蚀，耕层有机质三年累计提升 0.35%。'
  },
  {
    id: 'prj-2',
    name: '北斗 5G 无人农机托管服务中心',
    category: '智慧装备',
    village: '长春 · 农安县合隆镇',
    progress: 94,
    households: 518,
    fundWan: 620,
    status: '推进中',
    cover: '/art-custom/changchun-tractor.jpg',
    summary: '集中调度 24 台 260 马力北斗无人拖拉机与植保无人机，小农户一键预约托管，亩均节本增效 210 元。'
  },
  {
    id: 'prj-3',
    name: '查干湖非遗冬捕冷链物流枢纽',
    category: '产业流通',
    village: '松原 · 前郭县查干湖镇',
    progress: 100,
    households: 276,
    fundWan: 350,
    status: '已验收',
    cover: '/art-hd/chagan-winter.jpg',
    summary: '建成产地预冷库与一鱼一码溯源分拣线，将鲜鱼出湖损耗率由 11% 压降至 2.3%，直发全国 280 城。'
  },
  {
    id: 'prj-4',
    name: '松辽农光互补智慧果蔬大棚',
    category: '绿色能源',
    village: '白城 · 镇赉县嘎什根乡',
    progress: 68,
    households: 189,
    fundWan: 510,
    status: '推进中',
    cover: '/art-hd/songliao-plain.jpg',
    summary: '棚顶清洁光伏并网发电，棚下反季节种植寒地有机果蔬，实现“一地两收”与村集体稳定分红。'
  }
]

const defaultNotices = [
  {
    id: 'ntc-1',
    tag: '农时预警',
    title: '小雪节气寒潮来袭：请做好设施大棚防风保温与粮仓通风降湿',
    content: '据省农气中心预报，未来 48 小时松辽平原气温将下降 8~10℃，请各合作社及时检查光伏大棚卷帘与恒温粮仓湿度传感器。',
    date: '2026-11-21',
    author: '吉林智慧农情中心',
    pinned: true
  },
  {
    id: 'ntc-2',
    tag: '惠农政策',
    title: '2026 年度黑土保护性耕作补贴线上确认通道已开启',
    content: '采用秸秆覆盖免耕作业的种植户与合作社，可通过本 App「村务」板块核对北斗农机作业面积并确认补贴发放账户。',
    date: '2026-11-19',
    author: '乡村数字政务办',
    pinned: false
  },
  {
    id: 'ntc-3',
    tag: '助农喜报',
    title: '“吉韵禾野”双十一助农专场累计直发黑土农产品 4.2 万单',
    content: '本季专场覆盖 14 个县域合作社，平均每单 78% 收益直达农户，感谢广大新农人与城市认养人的支持。',
    date: '2026-11-15',
    author: '吉韵禾野运营中心',
    pinned: false
  }
]

const defaultFeedbacks = [
  {
    id: 'fb-1',
    user: '赵建国（合作社社员）',
    type: '农机预约',
    village: '九台区土们岭村',
    content: '东片 36 亩稻田已完成收割，申请预约北斗深松机进行秋季秸秆归行与深松护土作业。',
    meta: { plotMu: 36, serviceType: '秋季深松整地', dateWindow: '明日上午 08:00-12:00', assignedMachineCode: '' },
    time: '2026-11-21 11:08',
    status: '待处理',
    reply: ''
  },
  {
    id: 'fb-2',
    user: '林晓禾（云认养用户）',
    type: '助农反馈',
    village: '长春市南关区',
    content: '上次认养的九台新米已经收到，口感非常软糯！希望明年能增加大棚采摘研学体验名额。',
    time: '2026-11-20 16:45',
    status: '已回复',
    reply: '感谢支持！2027 年春季研学名额已列入九台示范园计划，认养用户可优先免费报名。'
  },
  {
    id: 'fb-3',
    user: '孙秀兰（种植户）',
    type: '农技咨询',
    village: '梨树县泉眼沟村',
    content: '大棚草莓夜间湿度偏高，智能通风阈值建议调到多少合适？',
    time: '2026-11-20 09:20',
    status: '待处理',
    reply: ''
  }
]

const defaultMachinery = [
  { id: 'mac-1', code: 'BD-260-01', name: '长春造 260HP 北斗无人拖拉机 #01', area: '九台核心示范区', task: '秋季深松整地', batteryOrFuel: 84, status: '作业中' },
  { id: 'mac-2', code: 'BD-260-04', name: '长春造 260HP 北斗无人拖拉机 #04', area: '梨树免耕试验田', task: '秸秆条带归行', batteryOrFuel: 67, status: '作业中' },
  { id: 'mac-5', code: 'BD-260-06', name: '长春造 260HP 北斗无人拖拉机 #06', area: '九台农机共享站', task: '整备待命可派单', batteryOrFuel: 96, status: '待命' },
  { id: 'mac-3', code: 'DR-MS-08', name: '多光谱巡检植保无人机 #08', area: '查干湖生态稻区', task: '墒情遥感巡航', batteryOrFuel: 92, status: '待命' },
  { id: 'mac-4', code: 'HV-400-02', name: '智能联合收割机 #02', area: '农安青禾合作社', task: '维保检修中', batteryOrFuel: 100, status: '维护中' }
]

const defaultRevenueTrend = [
  { date: '11-15', gmv: 28400, orders: 142 },
  { date: '11-16', gmv: 34200, orders: 168 },
  { date: '11-17', gmv: 31800, orders: 155 },
  { date: '11-18', gmv: 42900, orders: 214 },
  { date: '11-19', gmv: 48600, orders: 239 },
  { date: '11-20', gmv: 53400, orders: 268 },
  { date: '11-21', gmv: 61800, orders: 312 }
]

const defaultCoupons = [
  { id: 'cpn-1', title: '黑土新米尝鲜券', amount: 10, minSpend: 60, tag: '助农补贴', claimed: true },
  { id: 'cpn-2', title: '满 199 助农直采礼券', amount: 25, minSpend: 199, tag: '合作社专享', claimed: true }
]

const defaultActivityLogs = [
  { id: 'log-1', time: '14:20', source: 'App 端', action: '新增助农订单', detail: '林晓禾下单 九台黑土有机贡米 ×2 (¥136)' },
  { id: 'log-2', time: '13:15', source: 'App 端', action: '提交云认养申请', detail: '苏婉清申请认养 CG-C02 查干湖蟹田 2 份' },
  { id: 'log-3', time: '11:08', source: 'App 端', action: '发起农机预约', detail: '九台区土们岭村申请 2 台北斗深松机' },
  { id: 'log-4', time: '09:30', source: '管理后台', action: '置顶农时预警', detail: '下发「小雪节气寒潮大棚保温提示」至 App 首页' }
]

const defaultAppConfig = {
  brandName: '吉韵禾野',
  brandSubtitle: '黑土乡村振兴数字平台',
  solarTerm: '小雪 · 护土蓄墒',
  regionLabel: '吉林 · 松辽黑土带',
  heroHeadline: '守住一厘米黑土，振兴四十公里乡野',
  heroSubline: '地理标志直采 · 云端认养一亩田 · 村务数智直通',
  userProfile: {
    name: '林晓禾',
    role: '黑土守护者 · LV.4',
    personaTag: '城市品质消费与云认养端',
    memberNo: 'JY-2026-0482',
    points: 2680,
    helpedHouseholds: 14,
    carbonSavedKg: 46.8
  },
  farmerProfile: {
    name: '赵建国',
    role: '核心示范社员 · 种粮大户',
    coop: '九台黑土稻作专业合作社',
    village: '九台区土们岭村',
    memberNo: 'NH-JT-0108',
    managedMu: 36,
    subsidyPerMu: 72,
    trustBaseIncome: 22320,
    noTillSubsidyConfirmed: false
  }
}

function normalizePublicPaths(raw) {
  let out = raw.replaceAll('/art-hd/smart-machinery.jpg', '/art-custom/changchun-tractor.jpg')
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
  if (base !== '/') {
    out = out.replace(/"\/(art-custom|art-hd|art|photos)\//g, `"${base}$1/`)
  }
  return out
}

function loadState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(normalizePublicPaths(raw))
  } catch {
    return null
  }
}

export const useRuralPlatformStore = defineStore('ruralPlatform', () => {
  const saved = loadState()

  const mergedAppConfig = {
    ...structuredClone(defaultAppConfig),
    ...(saved?.appConfig || {}),
    userProfile: {
      ...structuredClone(defaultAppConfig.userProfile),
      ...(saved?.appConfig?.userProfile || {})
    },
    farmerProfile: {
      ...structuredClone(defaultAppConfig.farmerProfile),
      ...(saved?.appConfig?.farmerProfile || {})
    }
  }

  const authed = ref(typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_KEY) === '1')
  // 双端精准受众身份：移动端 ('consumer' 城市助农消费者 ⇄ 'farmer' 本地新农人社员) & 后台岗位 ('all' | 'coop' | 'agri' | 'village')
  const appPersona = ref(saved?.appPersona === 'farmer' ? 'farmer' : 'consumer')
  const adminRole = ref(['all', 'coop', 'agri', 'village'].includes(saved?.adminRole) ? saved.adminRole : 'all')

  const products = ref(saved?.products || structuredClone(defaultProducts))
  const liveCams = ref(saved?.liveCams || structuredClone(defaultLiveCams))
  const orders = ref(saved?.orders || structuredClone(defaultOrders))
  const plots = ref(saved?.plots || structuredClone(defaultPlots))
  const adoptions = ref(saved?.adoptions || structuredClone(defaultAdoptions))
  const projects = ref(saved?.projects || structuredClone(defaultProjects))
  const notices = ref(saved?.notices || structuredClone(defaultNotices))
  const feedbacks = ref(saved?.feedbacks || structuredClone(defaultFeedbacks))
  const savedMachinery = Array.isArray(saved?.machinery) ? [...saved.machinery] : structuredClone(defaultMachinery)
  if (!savedMachinery.some((m) => m.code === 'BD-260-06')) {
    savedMachinery.splice(2, 0, structuredClone(defaultMachinery[2]))
  }
  const machinery = ref(savedMachinery)
  const revenueTrend = ref(saved?.revenueTrend || structuredClone(defaultRevenueTrend))
  const coupons = ref(saved?.coupons || structuredClone(defaultCoupons))
  const favorites = ref(saved?.favorites || ['prod-1', 'prod-2'])
  const activityLogs = ref(saved?.activityLogs || structuredClone(defaultActivityLogs))
  const appConfig = ref(mergedAppConfig)
  const gameStats = ref(saved?.gameStats || { bestScore: 0, plays: 0, lastRank: '', totalCarbon: 0 })
  const cart = ref([])
  const lastSyncEvent = ref('双端数据已就绪 · 毫秒级双向联动')

  // ---------------- 计算指标 ----------------
  const activeProducts = computed(() => products.value.filter((p) => p.status === '上架'))
  const liveCamOnlineCount = computed(() => liveCams.value.filter((c) => c.status === '直播中').length)
  const totalGMV = computed(() => Math.round(revenueTrend.value.reduce((sum, d) => sum + Number(d.gmv || 0), 0)))
  const pendingOrdersCount = computed(() => orders.value.filter((o) => o.status === '待发货').length)
  const pendingAdoptionsCount = computed(() => adoptions.value.filter((a) => a.status === '待审核').length)
  const pendingFeedbacksCount = computed(() => feedbacks.value.filter((f) => f.status === '待处理').length)
  const totalPendingCount = computed(() => pendingOrdersCount.value + pendingAdoptionsCount.value + pendingFeedbacksCount.value)
  const totalHelpedHouseholds = computed(() => projects.value.reduce((sum, p) => sum + Number(p.households || 0), 0))
  const pinnedNotice = computed(() => notices.value.find((n) => n.pinned) || notices.value[0] || null)

  // 合作社社员实时收益账本：订单直采分红池随全平台 GMV 实时增长
  const farmerIncomeLedger = computed(() => {
    const fp = appConfig.value.farmerProfile || defaultAppConfig.farmerProfile
    const mu = Number(fp.managedMu || 36)
    const trustBase = Number(fp.trustBaseIncome || mu * 620)
    const orderDividend = Math.round(totalGMV.value * 0.028)
    const noTillSubsidy = Math.round(mu * Number(fp.subsidyPerMu || 72))
    const adoptShare = adoptions.value.filter((a) => a.status === '已生效').length * 680
    const total = trustBase + orderDividend + noTillSubsidy + adoptShare
    return {
      mu,
      trustBase,
      orderDividend,
      noTillSubsidy,
      adoptShare,
      total,
      confirmed: Boolean(fp.noTillSubsidyConfirmed)
    }
  })

  // 严格归一化为 100% 的品类占比
  const categoryShare = computed(() => {
    const map = new Map()
    for (const p of products.value) {
      map.set(p.category, (map.get(p.category) || 0) + Number(p.sales || 0))
    }
    const entries = [...map.entries()]
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1
    const raw = entries.map(([name, val]) => ({
      name,
      sales: val,
      value: Math.round((val / total) * 100)
    }))
    if (raw.length > 0) {
      const diff = 100 - raw.reduce((s, r) => s + r.value, 0)
      raw[0].value += diff
    }
    return raw
  })

  const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))
  const cartTotal = computed(() => Number(cart.value.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)))

  // 按商品真实分成比例加权计算农户直达收益（平台补贴券不扣减农户分成）
  const cartFarmerShareSummary = computed(() => {
    if (!cart.value.length) return { farmerGain: 0, sharePct: 78, coopName: '吉林黑土助农合作社' }
    let gain = 0
    let raw = 0
    const coops = new Set()
    for (const c of cart.value) {
      const prod = products.value.find((p) => p.id === c.productId)
      const pct = Number(prod?.farmerSharePct || 78)
      const sub = c.price * c.qty
      raw += sub
      gain += sub * (pct / 100)
      if (prod?.coop) coops.add(prod.coop)
    }
    const sharePct = raw > 0 ? Math.round((gain / raw) * 100) : 78
    const coopList = [...coops]
    const coopName = coopList.length > 1 ? `${coopList[0]}等 ${coopList.length} 家合作社` : (coopList[0] || '吉林黑土助农合作社')
    return {
      farmerGain: Number(gain.toFixed(1)),
      sharePct,
      coopName
    }
  })

  // ---------------- 持久化与跨标签页同步 ----------------
  let isApplyingExternal = false

  function persist() {
    if (typeof window === 'undefined' || isApplyingExternal) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        appPersona: appPersona.value,
        adminRole: adminRole.value,
        products: products.value,
        liveCams: liveCams.value,
        orders: orders.value,
        plots: plots.value,
        adoptions: adoptions.value,
        projects: projects.value,
        notices: notices.value,
        feedbacks: feedbacks.value,
        machinery: machinery.value,
        revenueTrend: revenueTrend.value,
        coupons: coupons.value,
        favorites: favorites.value,
        activityLogs: activityLogs.value,
        appConfig: appConfig.value,
        gameStats: gameStats.value
      }))
    } catch {
      // 忽略配额异常
    }
  }

  watch(
    [appPersona, adminRole, products, liveCams, orders, plots, adoptions, projects, notices, feedbacks, machinery, revenueTrend, coupons, favorites, activityLogs, appConfig, gameStats],
    persist,
    { deep: true }
  )

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        isApplyingExternal = true
        const next = JSON.parse(e.newValue)
        if (next.appPersona) appPersona.value = next.appPersona
        if (next.adminRole) adminRole.value = next.adminRole
        if (next.products) products.value = next.products
        if (next.liveCams) liveCams.value = next.liveCams
        if (next.orders) orders.value = next.orders
        if (next.plots) plots.value = next.plots
        if (next.adoptions) adoptions.value = next.adoptions
        if (next.projects) projects.value = next.projects
        if (next.notices) notices.value = next.notices
        if (next.feedbacks) feedbacks.value = next.feedbacks
        if (next.machinery) machinery.value = next.machinery
        if (next.revenueTrend) revenueTrend.value = next.revenueTrend
        if (next.coupons) coupons.value = next.coupons
        if (next.favorites) favorites.value = next.favorites
        if (next.activityLogs) activityLogs.value = next.activityLogs
        if (next.appConfig) appConfig.value = next.appConfig
        if (next.gameStats) gameStats.value = next.gameStats
        lastSyncEvent.value = `跨端同步更新 · ${formatTimeNow().slice(11)}`
      } finally {
        window.setTimeout(() => { isApplyingExternal = false }, 50)
      }
    })
  }

  function formatTimeNow() {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  function pushLog(source, action, detail) {
    const now = formatTimeNow().slice(11)
    activityLogs.value.unshift({
      id: `log-${Date.now().toString(36)}`,
      time: now,
      source,
      action,
      detail
    })
    if (activityLogs.value.length > 20) activityLogs.value.pop()
    lastSyncEvent.value = `[${source}] ${action} · ${now}`
  }

  // ---------------- 鉴权 ----------------
  function login(pwd) {
    if (pwd.trim() === ADMIN_PASSWORD) {
      authed.value = true
      if (typeof window !== 'undefined') window.sessionStorage.setItem(SESSION_KEY, '1')
      return true
    }
    return false
  }

  function quickDemoLogin() {
    authed.value = true
    if (typeof window !== 'undefined') window.sessionStorage.setItem(SESSION_KEY, '1')
  }

  function logout() {
    authed.value = false
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY)
  }

  // ---------------- App 端交互动作 ----------------
  function toggleFavorite(productId) {
    const idx = favorites.value.indexOf(productId)
    if (idx === -1) favorites.value.push(productId)
    else favorites.value.splice(idx, 1)
  }

  function addToCart(product, qty = 1) {
    const existing = cart.value.find((c) => c.productId === product.id)
    if (existing) {
      existing.qty += qty
    } else {
      cart.value.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        unit: product.unit,
        qty
      })
    }
  }

  function updateCartQty(productId, delta) {
    const idx = cart.value.findIndex((c) => c.productId === productId)
    if (idx === -1) return
    cart.value[idx].qty += delta
    if (cart.value[idx].qty <= 0) cart.value.splice(idx, 1)
  }

  function setAppPersona(persona) {
    const next = persona === 'farmer' ? 'farmer' : 'consumer'
    if (appPersona.value === next) return
    appPersona.value = next
    const label = next === 'farmer' ? '本地新农人·社员工作台' : '城市助农消费与认养端'
    lastSyncEvent.value = `App 切换至「${label}」`
  }

  function setAdminRole(role) {
    if (!['all', 'coop', 'agri', 'village'].includes(role)) return
    adminRole.value = role
  }

  function placeOrder({ customer, phone, address, discount = 0, couponId = '' }) {
    if (!cart.value.length) return null
    const items = cart.value.map((c) => ({
      productId: c.productId,
      name: c.name,
      qty: c.qty,
      price: c.price
    }))
    const shareSummary = cartFarmerShareSummary.value
    const rawTotal = cartTotal.value
    const finalTotal = Number(Math.max(0.1, rawTotal - Number(discount || 0)).toFixed(2))
    const firstProd = products.value.find((p) => p.id === items[0].productId)
    const order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customer: customer || appConfig.value.userProfile.name,
      phone: phone || '138****4021',
      address: address || '吉林省长春市南关区人民大街 108 号',
      items,
      rawTotal,
      total: finalTotal,
      discount: Number(discount || 0),
      farmerGain: shareSummary.farmerGain,
      sharePct: shareSummary.sharePct,
      coopName: shareSummary.coopName,
      status: '待发货',
      traceCode: firstProd?.traceCode || 'JL-2026-LIVE',
      createdAt: formatTimeNow()
    }
    orders.value.unshift(order)

    if (couponId && couponId.startsWith('rcpn-')) {
      coupons.value = coupons.value.filter((c) => c.id !== couponId)
    }

    for (const item of items) {
      const p = products.value.find((x) => x.id === item.productId)
      if (p) {
        p.stock = Math.max(0, p.stock - item.qty)
        p.sales += item.qty
      }
    }
    if (revenueTrend.value.length) {
      const today = revenueTrend.value[revenueTrend.value.length - 1]
      today.gmv = Math.round(today.gmv + finalTotal)
      today.orders += 1
    }
    appConfig.value.userProfile.points += Math.round(finalTotal)
    appConfig.value.userProfile.helpedHouseholds += 1
    cart.value = []
    pushLog('App 端', `新订单 ${order.id}`, `${order.customer} 下单 ${items[0].name} 等 (实付 ¥${finalTotal} · 助农直达 ¥${shareSummary.farmerGain})`)
    return order
  }

  function redeemPointsCoupon({ title, amount, minSpend, costPoints }) {
    const cost = Number(costPoints || 500)
    if ((appConfig.value.userProfile.points || 0) < cost) return null
    appConfig.value.userProfile.points -= cost
    const created = {
      id: `rcpn-${Date.now().toString(36)}`,
      title: title || '黑土积分兑换补贴券',
      amount: Number(amount || 15),
      minSpend: Number(minSpend || 89),
      tag: '积分兑换',
      claimed: true
    }
    coupons.value.unshift(created)
    pushLog('App 端', '公益积分兑券', `消耗 ${cost} 积分兑换「满 ${created.minSpend} 减 ${created.amount}」助农券`)
    return created
  }

  function submitMachineryBooking({ plotMu = 36, serviceType = '秋季深松整地', village = '', dateWindow = '明日上午 08:00-12:00', note = '' }) {
    const fp = appConfig.value.farmerProfile || defaultAppConfig.farmerProfile
    const targetVillage = (village || fp.village || '九台区土们岭村').trim()
    const cleanMu = Math.max(1, Number(plotMu) || 36)
    const summaryText = `${targetVillage} ${cleanMu} 亩地块申请【${serviceType}】（期望时段：${dateWindow}）。${note ? `备注：${note.trim()}` : '请农机站协调北斗 260HP 机组进场。'}`
    const item = {
      id: `fb-${Date.now().toString(36)}`,
      user: `${fp.name}（合作社社员）`,
      type: '农机预约',
      village: targetVillage,
      content: summaryText,
      meta: {
        plotMu: cleanMu,
        serviceType,
        dateWindow,
        assignedMachineCode: ''
      },
      time: formatTimeNow(),
      status: '待处理',
      reply: ''
    }
    feedbacks.value.unshift(item)
    pushLog('新农人端', `北斗农机预约 (${cleanMu}亩)`, `${fp.name} 预约 ${serviceType} · 待农机站派单`)
    return item
  }

  function confirmNoTillSubsidy() {
    if (!appConfig.value.farmerProfile) {
      appConfig.value.farmerProfile = structuredClone(defaultAppConfig.farmerProfile)
    }
    if (appConfig.value.farmerProfile.noTillSubsidyConfirmed) return false
    appConfig.value.farmerProfile.noTillSubsidyConfirmed = true
    const fp = appConfig.value.farmerProfile
    const subTotal = Math.round(Number(fp.managedMu || 36) * Number(fp.subsidyPerMu || 72))
    pushLog('新农人端', '保护性耕作补贴确认', `${fp.name} 核验确认 ${fp.managedMu} 亩免耕作业面积（预计发放补贴 ¥${subTotal}）`)
    return true
  }

  function simulateOrderFromAdmin() {
    const sample = activeProducts.value[0] || products.value[0]
    if (!sample) return null
    cart.value = [{
      productId: sample.id,
      name: sample.name,
      price: sample.price,
      image: sample.image,
      unit: sample.unit,
      qty: 1
    }]
    return placeOrder({
      customer: '演示访客 · 程明',
      phone: '136****9088',
      address: '吉林省长春市朝阳区解放大路 251 号',
      discount: 0
    })
  }

  function submitAdoption({ plotId, adopter, phone, shares = 1 }) {
    const plot = plots.value.find((p) => p.id === plotId)
    if (!plot || plot.slotsLeft < shares) return null
    plot.slotsLeft -= shares
    const nowStr = formatTimeNow()
    const record = {
      id: `ADP-${Date.now().toString().slice(-5)}`,
      plotId: plot.id,
      plotCode: plot.code,
      plotName: plot.name,
      adopter: adopter || appConfig.value.userProfile.name,
      phone: phone || '138****4021',
      shares,
      amount: plot.priceYear * shares,
      status: '待审核',
      stage: plot.stage,
      createdAt: nowStr,
      logs: [
        { time: nowStr.slice(5), text: '已提交云认养申请，等待合作社与后台审核签发证书。' }
      ]
    }
    adoptions.value.unshift(record)
    appConfig.value.userProfile.points += 180 * shares
    appConfig.value.userProfile.carbonSavedKg = Number((appConfig.value.userProfile.carbonSavedKg + 8.5 * shares).toFixed(1))
    pushLog('App 端', `认养申请 ${record.plotCode}`, `${record.adopter} 认养 ${plot.name} ${shares} 份`)
    return record
  }

  function logFarmCareAction(adoptionId, actionText) {
    const adp = adoptions.value.find((a) => a.id === adoptionId)
    if (!adp) return
    if (!adp.logs) adp.logs = []
    adp.logs.unshift({ time: formatTimeNow().slice(5), text: actionText })
    appConfig.value.userProfile.points += 15
    pushLog('App 端', `云农田互动 (${adp.plotCode})`, actionText)
  }

  function addLiveComment(camId, text) {
    const cam = liveCams.value.find((c) => c.id === camId)
    if (!cam || !text.trim()) return
    cam.comments.push({
      id: `cm-${Date.now().toString(36)}`,
      user: appConfig.value.userProfile.name,
      text: text.trim()
    })
    if (cam.comments.length > 20) cam.comments.shift()
    cam.viewers += 1
  }

  function submitFeedback({ user, type, village, content }) {
    const item = {
      id: `fb-${Date.now().toString(36)}`,
      user: user || `${appConfig.value.userProfile.name}（App用户）`,
      type: type || '村务建议',
      village: village || '九台区现代农业示范村',
      content: content.trim(),
      time: formatTimeNow(),
      status: '待处理',
      reply: ''
    }
    feedbacks.value.unshift(item)
    pushLog('App 端', `村情直报 (${item.type})`, `${item.village}：${item.content.slice(0, 24)}`)
    return item
  }

  // ---------------- 后台管理动作 ----------------
  function upsertProduct(payload) {
    if (payload.id) {
      const idx = products.value.findIndex((p) => p.id === payload.id)
      if (idx !== -1) {
        products.value[idx] = { ...products.value[idx], ...payload }
        pushLog('管理后台', `更新商品`, `「${payload.name}」售价 ¥${payload.price} / 库存 ${payload.stock}`)
        return
      }
    }
    const created = {
      ...payload,
      id: `prod-${Date.now().toString(36)}`,
      coop: payload.coop || '吉林黑土助农合作社',
      sales: Number(payload.sales || 0),
      originalPrice: Number(payload.originalPrice || Math.round(Number(payload.price) * 1.25)),
      farmerSharePct: Number(payload.farmerSharePct || 78),
      image: payload.image || '/art-hd/golden-rice.jpg',
      traceCode: payload.traceCode || `JL-2026-${Math.floor(1000 + Math.random() * 9000)}`
    }
    products.value.unshift(created)
    pushLog('管理后台', `上架新品`, `「${created.name}」已同步至 App 集市`)
  }

  function toggleProductStatus(id) {
    const p = products.value.find((x) => x.id === id)
    if (!p) return
    p.status = p.status === '上架' ? '下架' : '上架'
    pushLog('管理后台', `商品${p.status}`, `「${p.name}」状态切换为 ${p.status}`)
  }

  function deleteProduct(id) {
    const idx = products.value.findIndex((x) => x.id === id)
    if (idx !== -1) {
      const name = products.value[idx].name
      products.value.splice(idx, 1)
      pushLog('管理后台', `删除商品`, `移除「${name}」`)
    }
  }

  function updateOrderStatus(id, status) {
    const o = orders.value.find((x) => x.id === id)
    if (!o) return
    o.status = status
    pushLog('管理后台', `订单${status}`, `订单 ${o.id} 已同步更新至 App「我的订单」`)
  }

  function updateAdoptionStatus(id, status) {
    const a = adoptions.value.find((x) => x.id === id)
    if (!a) return
    a.status = status
    if (!a.logs) a.logs = []
    a.logs.unshift({ time: formatTimeNow().slice(5), text: `后台管理员已审核通过，电子认养证书正式生效！` })
    pushLog('管理后台', `认养审核通过`, `地块 ${a.plotCode} (${a.adopter}) 证书生效`)
  }

  function updatePlotStage(plotId, stage, stageIndex) {
    const plot = plots.value.find((p) => p.id === plotId)
    if (!plot) return
    plot.stage = stage
    plot.stageIndex = stageIndex
    adoptions.value.forEach((a) => {
      if (a.plotId === plotId) {
        a.stage = stage
        if (!a.logs) a.logs = []
        a.logs.unshift({ time: formatTimeNow().slice(5), text: `田间物候进入新阶段：${stage}` })
      }
    })
    pushLog('管理后台', `更新地块物候`, `地块 ${plot.code} → ${stage}`)
  }

  function upsertProject(payload) {
    if (payload.id) {
      const idx = projects.value.findIndex((p) => p.id === payload.id)
      if (idx !== -1) {
        projects.value[idx] = { ...projects.value[idx], ...payload }
        pushLog('管理后台', `更新项目进度`, `「${payload.name}」当前进度 ${payload.progress}%`)
        return
      }
    }
    projects.value.unshift({
      ...payload,
      id: `prj-${Date.now().toString(36)}`,
      cover: payload.cover || '/art-hd/songliao-plain.jpg'
    })
    pushLog('管理后台', `新增振兴项目`, `「${payload.name}」已发布`)
  }

  function deleteProject(id) {
    projects.value = projects.value.filter((p) => p.id !== id)
    pushLog('管理后台', `移除项目`, `已归档并移除项目`)
  }

  function toggleLiveCamStatus(id) {
    const cam = liveCams.value.find((c) => c.id === id)
    if (!cam) return
    cam.status = cam.status === '直播中' ? '回放' : '直播中'
    pushLog('管理后台', `慢直播机位切换`, `「${cam.shortTitle}」切换为 ${cam.status}`)
  }

  function cycleMachineryStatus(id) {
    const m = machinery.value.find((x) => x.id === id)
    if (!m) return
    const order = ['作业中', '待命', '维护中']
    m.status = order[(order.indexOf(m.status) + 1) % order.length]
    pushLog('管理后台', `农机调度`, `${m.code} 切换为「${m.status}」`)
  }

  function publishNotice({ tag, title, content, pinned = true }) {
    if (pinned) {
      notices.value.forEach((n) => { n.pinned = false })
    }
    notices.value.unshift({
      id: `ntc-${Date.now().toString(36)}`,
      tag: tag || '村务公告',
      title: title.trim(),
      content: content.trim(),
      date: formatTimeNow().slice(0, 10),
      author: '乡村振兴管理中枢',
      pinned
    })
    pushLog('管理后台', `推送村务公告`, `「${title.trim().slice(0, 22)}」已置顶至 App 首页`)
  }

  function deleteNotice(id) {
    notices.value = notices.value.filter((n) => n.id !== id)
  }

  function replyFeedback(id, replyText) {
    const f = feedbacks.value.find((x) => x.id === id)
    if (!f) return
    f.reply = replyText.trim()
    f.status = '已回复'
    pushLog('管理后台', `回复村民直报`, `已答复「${f.user}」`)
  }

  function dispatchMachineryForFeedback(feedbackId, machineId = '') {
    const f = feedbacks.value.find((x) => x.id === feedbackId)
    if (!f) return null
    const taskName = f.meta?.serviceType || (f.content.includes('无人机') ? '多光谱无人机巡田' : '秋季深松整地')
    const needDrone = /无人机|巡田|巡航|飞防/.test(taskName)

    const targetMachine =
      machinery.value.find((m) => m.id === machineId) ||
      machinery.value.find((m) => m.status === '待命' && (needDrone ? m.code.startsWith('DR-') : m.code.startsWith('BD-'))) ||
      machinery.value.find((m) => (needDrone ? m.code.startsWith('DR-') : m.code.startsWith('BD-'))) ||
      machinery.value.find((m) => m.status === '待命') ||
      machinery.value[0]
    if (!targetMachine) return null

    targetMachine.status = '作业中'
    targetMachine.area = f.village || targetMachine.area
    targetMachine.task = taskName
    if (!f.meta) f.meta = {}
    f.meta.assignedMachineCode = targetMachine.code
    f.status = '已回复'
    f.reply = `【农机站已派单】已指派 ${targetMachine.name}（编号 ${targetMachine.code}）前往 ${f.village} 执行「${taskName}」，RTK 航线已下发，请保持田间通道畅通。`
    pushLog('农机调度站', `派单 ${targetMachine.code}`, `指派至 ${f.village} 执行${taskName}，社员端已同步`)
    return targetMachine
  }

  function deleteFeedback(id) {
    feedbacks.value = feedbacks.value.filter((x) => x.id !== id)
  }

  function recordGameReward({ score = 0, rank = '', carbonEarned = 0, harvestYuan = 0, soilHealth = 100 }) {
    const cleanScore = Math.max(0, Math.round(Number(score) || 0))
    const cleanCarbon = Math.max(0, Math.round(Number(carbonEarned) || 0))
    const cleanYuan = Math.max(0, Math.round(Number(harvestYuan) || 0))
    const cleanSoil = Math.max(0, Math.min(100, Math.round(Number(soilHealth) || 0)))

    gameStats.value = {
      bestScore: Math.max(gameStats.value?.bestScore || 0, cleanScore),
      plays: (gameStats.value?.plays || 0) + 1,
      lastRank: rank || gameStats.value?.lastRank || '',
      totalCarbon: (gameStats.value?.totalCarbon || 0) + cleanCarbon
    }

    if (appConfig.value?.userProfile) {
      appConfig.value.userProfile.points = (appConfig.value.userProfile.points || 0) + cleanCarbon
      const addedKg = Number(Math.max(0.4, cleanCarbon / 95).toFixed(1))
      appConfig.value.userProfile.carbonSavedKg = Number(((appConfig.value.userProfile.carbonSavedKg || 0) + addedKg).toFixed(1))
    }

    pushLog(
      '互动游戏',
      `黑土守护者结算 (${rank || '完赛'})`,
      `得分 ${cleanScore} · 助农产值 ¥${cleanYuan} · 黑土健康 ${cleanSoil}% · +${cleanCarbon} 积分直达 App 碳账本`
    )
    return gameStats.value
  }

  function resetAllDemoData() {
    appPersona.value = 'consumer'
    adminRole.value = 'all'
    products.value = structuredClone(defaultProducts)
    liveCams.value = structuredClone(defaultLiveCams)
    orders.value = structuredClone(defaultOrders)
    plots.value = structuredClone(defaultPlots)
    adoptions.value = structuredClone(defaultAdoptions)
    projects.value = structuredClone(defaultProjects)
    notices.value = structuredClone(defaultNotices)
    feedbacks.value = structuredClone(defaultFeedbacks)
    machinery.value = structuredClone(defaultMachinery)
    revenueTrend.value = structuredClone(defaultRevenueTrend)
    coupons.value = structuredClone(defaultCoupons)
    favorites.value = ['prod-1', 'prod-2']
    activityLogs.value = structuredClone(defaultActivityLogs)
    appConfig.value = structuredClone(defaultAppConfig)
    gameStats.value = { bestScore: 0, plays: 0, lastRank: '', totalCarbon: 0 }
    cart.value = []
    lastSyncEvent.value = '已恢复出厂答辩演示数据'
  }

  return {
    authed,
    appPersona,
    adminRole,
    products,
    activeProducts,
    liveCams,
    liveCamOnlineCount,
    orders,
    plots,
    adoptions,
    projects,
    notices,
    feedbacks,
    machinery,
    revenueTrend,
    coupons,
    favorites,
    activityLogs,
    appConfig,
    gameStats,
    cart,
    cartCount,
    cartTotal,
    cartFarmerShareSummary,
    farmerIncomeLedger,
    lastSyncEvent,
    totalGMV,
    pendingOrdersCount,
    pendingAdoptionsCount,
    pendingFeedbacksCount,
    totalPendingCount,
    totalHelpedHouseholds,
    pinnedNotice,
    categoryShare,
    setAppPersona,
    setAdminRole,
    login,
    quickDemoLogin,
    logout,
    toggleFavorite,
    addToCart,
    updateCartQty,
    placeOrder,
    redeemPointsCoupon,
    simulateOrderFromAdmin,
    submitAdoption,
    logFarmCareAction,
    addLiveComment,
    submitFeedback,
    submitMachineryBooking,
    confirmNoTillSubsidy,
    upsertProduct,
    toggleProductStatus,
    deleteProduct,
    updateOrderStatus,
    updateAdoptionStatus,
    updatePlotStage,
    upsertProject,
    deleteProject,
    toggleLiveCamStatus,
    cycleMachineryStatus,
    publishNotice,
    deleteNotice,
    replyFeedback,
    dispatchMachineryForFeedback,
    deleteFeedback,
    recordGameReward,
    resetAllDemoData
  }
})
