"""
吉韵新程 · 黑土粮仓 — 编辑式艺术图版生成器

生成一组统一暖调色板的 SVG 插画，供各展陈页面的图文模块使用。
无外部依赖，可重复生成；运行：python scripts/generate_art.py
"""
import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "art"
OUT.mkdir(parents=True, exist_ok=True)

CANVAS = "#F7F4EE"
LINEN = "#EFECE6"
PAPER = "#FFFDF9"
INK = "#1C1B18"
INK2 = "#5A564E"
INK3 = "#8C867B"
GOLD = "#C88A32"
MOSS = "#2E5A44"
RED = "#B83828"
CLAY = "#8C583A"
WATER = "#8EBACB"
SOIL = ["#241E18", "#3B3025", "#574736", "#7C674E", "#A89070"]

W, H = 1200, 820


def head(dark=False):
    bg = INK if dark else CANVAS
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img">',
        '<defs>',
        '<linearGradient id="warm" x1="0" y1="0" x2="1" y2="1">'
        f'<stop offset="0" stop-color="{GOLD}" stop-opacity="0.95"/>'
        f'<stop offset="1" stop-color="{CLAY}" stop-opacity="0.75"/></linearGradient>',
        '<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{PAPER}" stop-opacity="0.85"/>'
        f'<stop offset="1" stop-color="{PAPER}" stop-opacity="0"/></linearGradient>',
        '<linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{SOIL[0]}"/>'
        f'<stop offset="1" stop-color="{SOIL[3]}"/></linearGradient>',
        f'<clipPath id="frame"><rect x="0" y="0" width="{W}" height="{H}"/></clipPath>',
        '</defs>',
        f'<rect width="{W}" height="{H}" fill="{bg}"/>',
        '<g clip-path="url(#frame)">',
    ]


def tail():
    return ['</g>', f'<rect x="14" y="14" width="{W - 28}" height="{H - 28}" fill="none" stroke="{INK}" stroke-opacity="0.14"/>', '</svg>']


def text(x, y, s, size=15, color=INK2, anchor="start", spacing=3, opacity=1, weight=400, mono=False):
    family = "ui-monospace, Menlo, monospace" if mono else "Georgia, 'Times New Roman', serif"
    return (f'<text x="{x}" y="{y}" fill="{color}" fill-opacity="{opacity}" font-size="{size}" '
            f'font-family="{family}" font-weight="{weight}" letter-spacing="{spacing}" '
            f'text-anchor="{anchor}">{s}</text>')


def line(x1, y1, x2, y2, color=INK, width=1, opacity=0.16):
    return f'<path d="M{x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f}" stroke="{color}" stroke-width="{width}" stroke-opacity="{opacity}" fill="none"/>'


def poly(points, color=INK, width=1.2, opacity=0.5, fill="none"):
    d = " ".join(f"{'L' if i else 'M'}{x:.1f} {y:.1f}" for i, (x, y) in enumerate(points))
    return f'<path d="{d}" stroke="{color}" stroke-width="{width}" stroke-opacity="{opacity}" fill="{fill}" stroke-linecap="round" stroke-linejoin="round"/>'


def contour(y0, amp, phase, color, opacity=0.35, width=1.2, freq=0.011, step=14, x0=0, x1=None):
    # x1 默认取「调用时」的画布宽度；原先 x1=W 在定义期就绑死 1200，
    # 导致 1920 宽的 panorama 右半没有等高线。
    if x1 is None:
        x1 = W
    pts = []
    x = x0
    while x <= x1:
        y = y0 + math.sin(x * freq + phase) * amp + math.sin(x * freq * 2.7 + phase * 1.7) * amp * 0.28
        pts.append((x, y))
        x += step
    return poly(pts, color, width, opacity)


def dots(rnd, n, color, opacity=0.3, box=(0, 0, W, H), r=(0.6, 2.2)):
    out = []
    for _ in range(n):
        x = rnd.uniform(box[0], box[2])
        y = rnd.uniform(box[1], box[3])
        rr = rnd.uniform(r[0], r[1])
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rr:.2f}" fill="{color}" fill-opacity="{opacity * rnd.uniform(0.4, 1):.2f}"/>')
    return out


def corner(index, title, dark=False):
    c = CANVAS if dark else INK2
    return [
        text(46, 62, index, 13, GOLD, spacing=4, mono=True),
        text(46, H - 46, title, 14, c, spacing=3.4, opacity=0.72, mono=True),
        line(46, 78, 210, 78, GOLD, 1, 0.55),
        line(46, H - 68, 340, H - 68, c, 1, 0.2),
    ]


def art_hero():
    s = head(dark=True)
    # 4 号定稿「纯光影」（用户 2026-11-08 选定候选 B）：完全不加色块，
    # 只用金圆柔光晕 + 底部暗角 + 每 5 条里的主线提亮，保住墨底通透感。
    # 第一版「三条独立波浪硬色带」已被否决：走向与等高线不一致、硬边界、
    # 铺满下半幅且显脏，不要再改回去。
    s.append('<defs>')
    s.append('<radialGradient id="halo" cx="50%" cy="50%" r="50%">'
             f'<stop offset="0" stop-color="{GOLD}" stop-opacity="0.20"/>'
             f'<stop offset="1" stop-color="{GOLD}" stop-opacity="0"/>'
             '</radialGradient>')
    s.append('<linearGradient id="vign" x1="0" y1="0" x2="0" y2="1">'
             f'<stop offset="0" stop-color="{INK}" stop-opacity="0"/>'
             f'<stop offset="1" stop-color="{INK}" stop-opacity="0.55"/>'
             '</linearGradient>')
    s.append('</defs>')
    s.append(f'<circle cx="870" cy="250" r="330" fill="url(#halo)"/>')
    s.append(f'<rect x="0" y="560" width="{W}" height="{H - 560}" fill="url(#vign)"/>')
    for i in range(0, 30, 5):
        s.append(contour(300 + i * 17, 22 + i * 1.5, i * 0.32, GOLD,
                         0.5, 2.2, freq=0.008 + i * 0.0002))
    s.append(f'<circle cx="870" cy="250" r="176" fill="{GOLD}" fill-opacity="0.14"/>')
    s.append(f'<circle cx="870" cy="250" r="126" fill="url(#warm)" fill-opacity="0.55"/>')
    s.append(f'<circle cx="870" cy="250" r="176" fill="none" stroke="{GOLD}" stroke-opacity="0.4"/>')
    for i in range(30):
        y = 300 + i * 17
        s.append(contour(y, 22 + i * 1.5, i * 0.32, GOLD if i % 5 == 0 else SOIL[3],
                         0.12 if i % 5 else 0.42, 1 if i % 5 else 1.8, freq=0.008 + i * 0.0002))
    for i in range(16):
        s.append(line(0, 300 + i * 34, W, 300 + i * 34, CANVAS, 1, 0.035))
    for i in range(24):
        s.append(line(50 + i * 50, 0, 50 + i * 50, H, CANVAS, 1, 0.03))
    rnd = random.Random(12)
    s += dots(rnd, 160, GOLD, 0.22, (0, 280, W, H))
    s.append(text(72, 196, "THE BLACK SOIL", 62, PAPER, spacing=2, weight=700))
    s.append(text(76, 246, "ATLAS  /  JILIN  ·  2026", 17, GOLD, spacing=6, mono=True))
    s += corner("PLATE 00", "FIELD CONTOURS / PLATE 02", dark=True)
    return s + tail()


def art_soil():
    s = head()
    s.append(f'<rect x="120" y="120" width="600" height="580" fill="{LINEN}"/>')
    tops = [150, 300, 470, 650]
    for i in range(3):
        y, hh = tops[i], tops[i + 1] - tops[i] - 8
        s.append(f'<rect x="150" y="{y}" width="540" height="{hh}" fill="{SOIL[i]}"/>')
        s.append(f'<rect x="150" y="{y}" width="540" height="6" fill="{GOLD}" fill-opacity="{0.5 - i * 0.1:.2f}"/>')
        rnd = random.Random(30 + i)
        s += dots(rnd, 90 - i * 18, PAPER, 0.22, (160, y + 8, 680, y + hh - 8), (1, 3.6))
        for k in range(5):
            yy = y + 22 + k * (hh / 6)
            s.append(poly([(160, yy), (300, yy + rnd.uniform(-6, 6)), (460, yy + rnd.uniform(-5, 5)), (680, yy)],
                          PAPER, 0.7, 0.09))
        s.append(text(712, y + 34, f"0{i + 1} / {['0-20 CM', '20-50 CM', '50-100 CM'][i]}", 13, INK2, mono=True))
        s.append(line(700, y + 44, 880, y + 44, INK, 1, 0.18))
    s.append(f'<rect x="930" y="120" width="150" height="580" fill="{PAPER}"/>')
    for i in range(11):
        y = 150 + i * 50
        s.append(line(940, y, 940 + (34 if i % 5 == 0 else 16), y, INK2, 1, 0.5))
        if i % 5 == 0:
            s.append(text(984, y + 5, f"{i * 10}", 12, INK2, mono=True))
    s.append(f'<rect x="150" y="120" width="540" height="580" fill="none" stroke="{INK}" stroke-opacity="0.22"/>')
    s += corner("PLATE 01", "CHERNOZEM MONOLITH / 1.0 M")
    return s + tail()


def art_machine():
    s = head()
    for i in range(22):
        s.append(line(60 + i * 52, 60, 60 + i * 52, H - 60, INK, 1, 0.05))
    for i in range(15):
        s.append(line(60, 70 + i * 48, W - 60, 70 + i * 48, INK, 1, 0.05))
    s.append(f'<rect x="220" y="330" width="560" height="150" rx="34" fill="{RED}" fill-opacity="0.88"/>')
    s.append(f'<rect x="560" y="230" width="270" height="220" rx="30" fill="{INK}" fill-opacity="0.9"/>')
    s.append(f'<rect x="580" y="252" width="230" height="150" rx="22" fill="{WATER}" fill-opacity="0.38"/>')
    s.append(f'<rect x="220" y="330" width="560" height="150" rx="34" fill="none" stroke="{INK}" stroke-opacity="0.35"/>')
    for cx, cy, rr in [(330, 500, 128), (700, 500, 96)]:
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{rr}" fill="{INK}"/>')
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{rr * 0.72:.1f}" fill="{CANVAS}"/>')
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{rr * 0.56:.1f}" fill="url(#warm)"/>')
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{rr * 0.24:.1f}" fill="{INK}"/>')
        for k in range(24):
            a = k * math.pi / 12
            s.append(line(cx + math.cos(a) * rr * 0.76, cy + math.sin(a) * rr * 0.76,
                          cx + math.cos(a) * rr * 0.95, cy + math.sin(a) * rr * 0.95, INK, 2, 0.28))
    s.append(line(700, 230, 700, 120, INK, 2, 0.4))
    s.append(f'<ellipse cx="700" cy="112" rx="42" ry="15" fill="{GOLD}"/>')
    for k in range(3):
        s.append(f'<circle cx="700" cy="{112 - 42 - k * 26}" r="{13 - k * 2}" fill="none" stroke="{GOLD}" stroke-opacity="{0.5 - k * 0.14:.2f}"/>')
    s.append(text(880, 300, "BEIDOU", 30, INK, spacing=5, weight=700))
    s.append(text(882, 330, "RTK  ± 2.5 CM", 14, GOLD, spacing=3, mono=True))
    s.append(line(880, 348, 1090, 348, INK, 1, 0.25))
    s += corner("PLATE 02", "AUTONOMOUS AGRI-ROBOTICS")
    return s + tail()


def art_diorama():
    """松辽平原土地利用抽象测绘图版。

    3×3 格网只表达策展顺序与地类，不是行政区划地图：不画省界县界、
    不含经纬度、不对应真实地理轮廓。旧版是九个纯色块，观感单薄；
    新版每格叠加渐变、垄线/作物点阵与格网编号，并补河岸、防护林、
    粮仓、风机、桥、比例尺与图例，让它读成一张测绘插图。
    只使用既有色板（含明暗派生），不引入新色。
    """
    rnd = random.Random(2026)
    s = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img">',
        '<title>松辽平原土地利用抽象测绘图版</title>',
        '<defs>',
        f'<clipPath id="frame"><rect x="0" y="0" width="{W}" height="{H}"/></clipPath>',
        # 水系只画在 3×3 网格区，不越界压到右侧图例
        '<clipPath id="gridclip"><rect x="0" y="0" width="890" height="820"/></clipPath>',
        # 测绘底纹
        '<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">'
        '<path d="M40 0 H0 V40" fill="none" stroke="#F7F4EE" stroke-opacity="0.045" stroke-width="1"/></pattern>',
        # 四种地类渐变，色值全部取自既有色板
        '<linearGradient id="gp" x1="0" y1="0" x2="0.65" y2="1">'
        f'<stop offset="0" stop-color="{MOSS}"/><stop offset="1" stop-color="{INK}"/></linearGradient>',
        '<linearGradient id="gr" x1="0" y1="0" x2="0.65" y2="1">'
        f'<stop offset="0" stop-color="{GOLD}"/><stop offset="1" stop-color="{CLAY}"/></linearGradient>',
        '<linearGradient id="gd" x1="0" y1="0" x2="0.65" y2="1">'
        f'<stop offset="0" stop-color="{CLAY}"/><stop offset="1" stop-color="{INK}"/></linearGradient>',
        '<linearGradient id="gf" x1="0" y1="0" x2="0.65" y2="1">'
        f'<stop offset="0" stop-color="{MOSS}" stop-opacity="0.75"/><stop offset="1" stop-color="{INK}"/></linearGradient>',
        # 田块纹理：水平垄、垂直垄、斜垄、作物点阵
        '<pattern id="ridge-h" width="80" height="14" patternUnits="userSpaceOnUse">'
        '<path d="M0 13 H80" stroke="#F7F4EE" stroke-opacity="0.17" stroke-width="1"/>'
        '<path d="M0 6 H80" stroke="#1C1B18" stroke-opacity="0.16" stroke-width="1"/></pattern>',
        '<pattern id="ridge-v" width="14" height="80" patternUnits="userSpaceOnUse">'
        '<path d="M13 0 V80" stroke="#F7F4EE" stroke-opacity="0.16" stroke-width="1"/>'
        '<path d="M6 0 V80" stroke="#1C1B18" stroke-opacity="0.15" stroke-width="1"/></pattern>',
        '<pattern id="ridge-d" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">'
        '<path d="M2 0 V18" stroke="#F7F4EE" stroke-opacity="0.15" stroke-width="1"/>'
        '<path d="M11 0 V18" stroke="#1C1B18" stroke-opacity="0.16" stroke-width="1"/></pattern>',
        '<pattern id="crop" width="22" height="22" patternUnits="userSpaceOnUse">'
        '<circle cx="6" cy="6" r="1.7" fill="#F7F4EE" fill-opacity="0.24"/>'
        '<circle cx="17" cy="16" r="1.3" fill="#F7F4EE" fill-opacity="0.16"/>'
        '<path d="M6 11 v4 M17 2 v4" stroke="#F7F4EE" stroke-opacity="0.14" stroke-width="1"/></pattern>',
        '</defs>',
        f'<rect width="{W}" height="{H}" fill="{INK}"/>',
        f'<rect width="{W}" height="{H}" fill="url(#grid)"/>',
        '<g clip-path="url(#frame)">',
    ]

    # 顶部图签
    s.append(text(46, 62, 'PLATE 03', 13, GOLD, spacing=4, mono=True))
    s.append(text(1154, 62, 'SHEET 03 / AERIAL SURVEY / GRID 03-06', 11, PAPER,
                  anchor='end', spacing=2.4, opacity=0.72, mono=True))
    s.append(line(46, 78, 1154, 78, PAPER, 1, 0.16))

    # 3×3 抽象田块
    cols, rows = [70, 350, 630], [110, 320, 530]
    cw, ch = 250, 185
    cells = [
        ('gp', 'ridge-h', 'PADDY / 水田'), ('gr', 'ridge-v', 'RIPE / 成熟稻'), ('gd', 'crop', 'DRYLAND / 旱田'),
        ('gr', 'crop', 'HARVEST / 收割'), ('gp', 'ridge-d', 'MEADOW / 草甸'), ('gd', 'ridge-h', 'FALLOW / 休耕'),
        ('gd', 'ridge-v', 'ORCHARD / 果园'), ('gf', 'crop', 'SHELTERBELT / 防护林'), ('gp', 'ridge-h', 'PADDY / 水田'),
    ]
    for idx, (grad, pat, label) in enumerate(cells):
        r, c = divmod(idx, 3)
        x, y = cols[c], rows[r]
        code = f'{"ABC"[r]}-{c + 1:02d}'
        s.append(f'<rect x="{x}" y="{y}" width="{cw}" height="{ch}" rx="8" fill="url(#{grad})" fill-opacity="0.9"/>')
        s.append(f'<rect x="{x}" y="{y}" width="{cw}" height="{ch}" rx="8" fill="url(#{pat})"/>')
        # 顶边高光 + 边框
        s.append(f'<path d="M{x + 10} {y + 1} H{x + cw - 10}" stroke="{PAPER}" stroke-opacity="0.28" stroke-width="1.5"/>')
        s.append(f'<rect x="{x}" y="{y}" width="{cw}" height="{ch}" rx="8" fill="none" '
                 f'stroke="{PAPER}" stroke-opacity="0.3"/>')
        # 部分格子加一条内部田埂，打破规整感
        if idx in (1, 4, 7):
            s.append(line(x + cw * 0.62, y + 8, x + cw * 0.62, y + ch - 8, PAPER, 1, 0.22))
        # 格网编号与地类标签
        s.append(text(x + 14, y + 24, code, 11, PAPER, spacing=2.2, opacity=0.92, mono=True))
        s.append(text(x + 14, y + ch - 14, label, 10, PAPER, spacing=1.6, opacity=0.8, mono=True))
        # 右上十字定位标
        s.append(f'<path d="M{x + cw - 26} {y + 18} h12 M{x + cw - 20} {y + 12} v12" '
                 f'stroke="{GOLD}" stroke-opacity="0.85" stroke-width="1.2" fill="none"/>')

    # 蜿蜒水系：河岸 -> 浅滩 -> 主槽 -> 水面反光
    pts = []
    for i in range(90):
        t = i / 89
        xx = -50 + t * (W + 100)
        yy = 500 + math.sin(t * 5.6 + 0.5) * 96 - t * 78
        pts.append((xx, yy))
    d = poly(pts, WATER, 1, 1).split(' d="')[1].split('"')[0]
    s.append('<g clip-path="url(#gridclip)">')
    for width, color, opacity in [
        (58, PAPER, 0.1), (46, WATER, 0.24), (30, WATER, 0.62), (2.4, PAPER, 0.75)
    ]:
        s.append(f'<path d="{d}" stroke="{color}" stroke-width="{width}" stroke-opacity="{opacity}" '
                 f'fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
    # 田间作业道（细虚线，不与主河抢视觉）
    s.append(f'<path d="M{300} {300} C 420 380, 500 520, 610 700" stroke="{PAPER}" stroke-width="2" '
             f'stroke-opacity="0.32" stroke-dasharray="9 9" fill="none"/>')
    # 跨河便桥
    s.append(f'<rect x="726" y="404" width="42" height="72" rx="3" fill="{PAPER}" fill-opacity="0.16" '
             f'stroke="{PAPER}" stroke-opacity="0.5"/>')
    s.append(line(726, 428, 768, 428, PAPER, 1.5, 0.55))
    s.append(line(726, 452, 768, 452, PAPER, 1.5, 0.55))
    s.append('</g>')

    # 防护林：沿两条水平田埂的小树点阵
    for yy in (305, 515):
        xx = 78
        while xx < 872:
            s.append(f'<circle cx="{xx:.1f}" cy="{yy}" r="{rnd.uniform(2.2, 3.6):.1f}" '
                     f'fill="{MOSS}" fill-opacity="0.9"/>')
            s.append(f'<circle cx="{xx:.1f}" cy="{yy - 1}" r="1" fill="{PAPER}" fill-opacity="0.4"/>')
            xx += rnd.uniform(19, 27)

    # 右侧图例区
    s.append(text(910, 120, 'LAND USE KEY', 12, GOLD, spacing=2.6, mono=True))
    s.append(text(910, 140, '地类索引 / 抽象图例', 10, PAPER, spacing=1.4, opacity=0.72, mono=True))
    s.append(line(910, 152, 1154, 152, PAPER, 1, 0.22))
    for i, (grad, name) in enumerate([('gp', 'PADDY / 水田'), ('gr', 'RIPE / 成熟稻'),
                                      ('gd', 'DRYLAND / 旱田'), ('gf', 'BELT / 防护林')]):
        yy = 176 + i * 34
        s.append(f'<rect x="910" y="{yy - 12}" width="18" height="18" rx="3" fill="url(#{grad})"/>')
        s.append(f'<rect x="910" y="{yy - 12}" width="18" height="18" rx="3" fill="none" '
                 f'stroke="{PAPER}" stroke-opacity="0.35"/>')
        s.append(text(938, yy + 1, name, 10, PAPER, spacing=1.4, opacity=0.86, mono=True))

    # 三处视点标记（沿用旧版语言）
    s.append(text(910, 336, 'VIEWPOINTS / 漫游视点', 10, PAPER, spacing=1.8, opacity=0.72, mono=True))
    for i, (cx, cy) in enumerate([(946, 386), (1028, 386), (946, 468)]):
        s.append(f'<circle cx="{cx}" cy="{cy}" r="30" fill="{PAPER}" fill-opacity="0.9"/>')
        s.append(f'<circle cx="{cx}" cy="{cy}" r="30" fill="none" stroke="{GOLD}" stroke-opacity="0.85" stroke-width="1.5"/>')
        s.append(f'<circle cx="{cx}" cy="{cy}" r="8" fill="{GOLD}"/>')
        s.append(text(cx, cy - 40, f'V-0{i + 1}', 9, GOLD, anchor='middle', spacing=1.4, mono=True))

    # 粮仓与风机（抽象设施剪影）
    s.append(f'<rect x="1074" y="410" width="46" height="52" rx="2" fill="{PAPER}" fill-opacity="0.2"/>')
    s.append(f'<path d="M1068 410 L1097 390 L1126 410 Z" fill="{GOLD}" fill-opacity="0.72"/>')
    for k in range(3):
        s.append(line(1074, 424 + k * 13, 1120, 424 + k * 13, PAPER, 1, 0.3))
    s.append(line(1097, 500, 1097, 570, PAPER, 2.5, 0.6))
    for ang in (0, 120, 240):
        a = math.radians(ang)
        s.append(f'<path d="M1097 500 L{1097 + math.cos(a) * 34:.1f} {500 + math.sin(a) * 34:.1f}" '
                 f'stroke="{PAPER}" stroke-opacity="0.7" stroke-width="3" stroke-linecap="round"/>')
    s.append(f'<circle cx="1097" cy="500" r="5" fill="{GOLD}"/>')

    # 比例尺与罗盘十字（不含经纬度）
    s.append(text(910, 636, 'SCALE', 9, PAPER, spacing=2, opacity=0.6, mono=True))
    s.append(line(910, 656, 1030, 656, PAPER, 3, 0.7))
    s.append(line(910, 650, 910, 662, PAPER, 1.5, 0.7))
    s.append(line(970, 650, 970, 662, PAPER, 1.5, 0.7))
    s.append(line(1030, 650, 1030, 662, PAPER, 1.5, 0.7))
    s.append(text(910, 678, '0', 9, PAPER, spacing=1, opacity=0.7, mono=True))
    s.append(text(1030, 678, '500 m', 9, PAPER, anchor='middle', spacing=1, opacity=0.7, mono=True))
    s.append(f'<path d="M1120 612 v56 M1092 640 h56" stroke="{GOLD}" stroke-opacity="0.8" stroke-width="1.4" fill="none"/>')
    s.append(f'<circle cx="1120" cy="640" r="16" fill="none" stroke="{GOLD}" stroke-opacity="0.55"/>')
    s.append(text(1120, 700, 'SURVEY MARK', 8, PAPER, anchor='middle', spacing=1.4, opacity=0.6, mono=True))

    # 星点装饰
    s += dots(rnd, 110, PAPER, 0.13, (900, 700, 1160, 750))

    # 底部图签与合规声明
    s.append(line(46, 752, 1154, 752, PAPER, 1, 0.18))
    s.append(text(46, 776, 'SONGLIAO PLAIN / DIGITAL TWIN', 13, PAPER, spacing=3, opacity=0.8, mono=True))
    s.append(text(1154, 776, 'ABSTRACT LAND-USE GRID · NOT A CADASTRAL MAP', 9, GOLD,
                  anchor='end', spacing=1.8, opacity=0.9, mono=True))
    s.append(text(600, 776, 'PROCEDURAL PLATE / 程序化图版', 9, PAPER,
                  anchor='middle', spacing=1.8, opacity=0.55, mono=True))

    s.append('</g>')
    s.append(f'<rect x="14" y="14" width="{W - 28}" height="{H - 28}" fill="none" '
             f'stroke="{PAPER}" stroke-opacity="0.12"/>')
    s.append('</svg>')
    return s


def art_rice():
    s = head()
    s.append(f'<circle cx="600" cy="410" r="290" fill="{LINEN}"/>')
    s.append(f'<circle cx="600" cy="410" r="290" fill="none" stroke="{INK}" stroke-opacity="0.12"/>')
    for i in range(9):
        x = 300 + i * 76
        top = 150 + (i % 3) * 26
        s.append(poly([(x, 700), (x + math.sin(i) * 18, 480), (x + math.sin(i) * 34, 300), (x + 30, top)],
                      MOSS if i % 3 == 0 else GOLD, 2.4, 0.65))
        for k in range(11):
            t = k / 10
            yy = top + t * 210
            xx = x + 30 - t * 24
            s.append(f'<ellipse cx="{xx + (k % 2) * 12 - 6:.1f}" cy="{yy:.1f}" rx="5.5" ry="12" '
                     f'fill="{GOLD}" fill-opacity="{0.45 + t * 0.4:.2f}" '
                     f'transform="rotate({28 if k % 2 else -28:.0f} {xx:.1f} {yy:.1f})"/>')
    for i in range(12):
        s.append(contour(560 + i * 20, 10, i, CLAY, 0.12, 1, freq=0.02, x0=240, x1=960))
    s.append(text(930, 140, "180 DAYS", 22, INK, spacing=3, weight=700, mono=True))
    s.append(line(930, 156, 1130, 156, GOLD, 2, 0.7))
    s += corner("PLATE 04", "ONE GRAIN OF RICE / ODYSSEY")
    return s + tail()


def art_lake():
    s = head(dark=True)
    s.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="{INK}"/>')
    s.append(f'<circle cx="600" cy="420" r="330" fill="{WATER}" fill-opacity="0.10"/>')
    s.append(f'<circle cx="600" cy="420" r="330" fill="none" stroke="{WATER}" stroke-opacity="0.35"/>')
    for i in range(9):
        r = 40 + i * 36
        s.append(f'<circle cx="600" cy="420" r="{r}" fill="none" stroke="{PAPER}" stroke-opacity="{0.24 - i * 0.018:.3f}"/>')
    rnd = random.Random(9)
    for i in range(26):
        a = rnd.uniform(0, math.pi * 2)
        rr = rnd.uniform(60, 330)
        x0, y0 = 600 + math.cos(a) * rr, 420 + math.sin(a) * rr
        pts = [(x0, y0)]
        for k in range(4):
            a += rnd.uniform(-0.5, 0.5)
            rr2 = 24 + k * 18
            x0 += math.cos(a) * rr2
            y0 += math.sin(a) * rr2
            pts.append((x0, y0))
        s.append(poly(pts, PAPER, 1.1, 0.24))
    s.append(f'<circle cx="600" cy="420" r="52" fill="{GOLD}" fill-opacity="0.85"/>')
    s.append(f'<circle cx="600" cy="420" r="52" fill="none" stroke="{PAPER}" stroke-opacity="0.6"/>')
    for i in range(8):
        a = i * math.pi / 4
        s.append(line(600 + math.cos(a) * 62, 420 + math.sin(a) * 62,
                      600 + math.cos(a) * 118, 420 + math.sin(a) * 118, GOLD, 2, 0.5))
    s += corner("PLATE 05", "CHAGAN LAKE / WINTER FISHERY", dark=True)
    return s + tail()


def art_seasons():
    s = head()
    colors = [MOSS, GOLD, CLAY, WATER]
    names = ["SPRING", "SUMMER", "AUTUMN", "WINTER"]
    cx, cy = 600, 410
    for i, col in enumerate(colors):
        a0 = -math.pi / 2 + i * math.pi / 2
        a1 = a0 + math.pi / 2
        r = 280
        x0, y0 = cx + math.cos(a0) * r, cy + math.sin(a0) * r
        x1, y1 = cx + math.cos(a1) * r, cy + math.sin(a1) * r
        s.append(f'<path d="M{cx} {cy} L{x0:.1f} {y0:.1f} A{r} {r} 0 0 1 {x1:.1f} {y1:.1f} Z" '
                 f'fill="{col}" fill-opacity="0.55"/>')
        s.append(f'<path d="M{cx} {cy} L{x0:.1f} {y0:.1f} A{r} {r} 0 0 1 {x1:.1f} {y1:.1f} Z" '
                 f'fill="none" stroke="{INK}" stroke-opacity="0.18"/>')
        am = (a0 + a1) / 2
        s.append(text(cx + math.cos(am) * 200, cy + math.sin(am) * 200, names[i], 15,
                      PAPER, anchor="middle", spacing=3, mono=True))
    s.append(f'<circle cx="{cx}" cy="{cy}" r="86" fill="{CANVAS}"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="86" fill="none" stroke="{INK}" stroke-opacity="0.28"/>')
    s.append(text(cx, cy - 4, "24", 46, INK, anchor="middle", spacing=0, weight=700))
    s.append(text(cx, cy + 24, "SOLAR TERMS", 11, INK2, anchor="middle", spacing=3, mono=True))
    for i in range(48):
        a = i * math.pi / 24
        r0, r1 = 296, 308 if i % 4 == 0 else 302
        s.append(line(cx + math.cos(a) * r0, cy + math.sin(a) * r0,
                      cx + math.cos(a) * r1, cy + math.sin(a) * r1, INK, 1, 0.4))
    s += corner("PLATE 06", "AGRICULTURAL CALENDAR")
    return s + tail()


def art_harvest():
    s = head()
    s.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="{LINEN}"/>')
    for i, (x, h) in enumerate([(160, 330), (390, 420), (620, 360), (850, 300)]):
        s.append(f'<rect x="{x}" y="{620 - h}" width="180" height="{h}" rx="10" fill="{PAPER}"/>')
        s.append(f'<rect x="{x}" y="{620 - h}" width="180" height="{h}" rx="10" fill="none" stroke="{INK}" stroke-opacity="0.22"/>')
        s.append(f'<path d="M{x} {620 - h} L{x + 90} {620 - h - 76} L{x + 180} {620 - h} Z" fill="{GOLD}" fill-opacity="0.85"/>')
        for k in range(9):
            s.append(line(x + 6, 620 - h + 24 + k * (h / 10), x + 174, 620 - h + 24 + k * (h / 10), INK, 1, 0.1))
        s.append(text(x + 90, 650, f"SILO 0{i + 1}", 12, INK2, anchor="middle", spacing=2, mono=True))
    for i in range(20):
        s.append(contour(650 + i * 9, 8, i * 0.7, GOLD if i % 4 == 0 else CLAY, 0.16, 1, freq=0.016))
    s.append(f'<rect x="0" y="620" width="{W}" height="6" fill="{INK}" fill-opacity="0.55"/>')
    s += corner("PLATE 07", "GRAIN RESERVE / SPECIALTY FAIR")
    return s + tail()


def art_atlas():
    s = head()
    for i in range(13):
        s.append(line(60 + i * 90, 60, 60 + i * 90, H - 60, INK, 1, 0.08))
    for i in range(9):
        s.append(line(60, 70 + i * 88, W - 60, 70 + i * 88, INK, 1, 0.08))
    for i in range(26):
        s.append(contour(120 + i * 25, 30 + (i % 4) * 9, i * 0.42, MOSS if i % 5 == 0 else INK3,
                         0.13 if i % 5 else 0.34, 1 if i % 5 else 1.6, freq=0.009 + i * 0.0003))
    # 4 号推广：atlas 是浅底网格图版，只取「主线加深加实」这一半，
    # 不铺光晕 / 暗角——浅底上叠暗色会显脏。
    for i in range(0, 26, 5):
        s.append(contour(120 + i * 25, 30 + (i % 4) * 9, i * 0.42, MOSS,
                         0.48, 2.1, freq=0.009 + i * 0.0003))
    marks = [(300, 250, "CHANGCHUN"), (760, 400, "SONGLIAO"), (520, 590, "CHAGAN"), (980, 220, "CHANGBAI")]
    for x, y, label in marks:
        s.append(f'<circle cx="{x}" cy="{y}" r="9" fill="{RED}"/>')
        s.append(f'<circle cx="{x}" cy="{y}" r="24" fill="none" stroke="{RED}" stroke-opacity="0.5"/>')
        s.append(f'<circle cx="{x}" cy="{y}" r="42" fill="none" stroke="{RED}" stroke-opacity="0.22"/>')
        s.append(text(x + 18, y - 16, label, 13, INK, spacing=2, mono=True))
    s.append(f'<rect x="60" y="60" width="{W - 120}" height="{H - 120}" fill="none" stroke="{INK}" stroke-opacity="0.2"/>')
    s += corner("PLATE 08", "RESEARCH ATLAS / PLATE 08")
    return s + tail()


def art_panorama():
    global W, H
    W, H = 1920, 760
    s = head(dark=True)
    # 4 号「纯光影」推广（与 art_hero 同一套语言）：不加色块，
    # 只用金圆柔光晕 + 底部暗角 + 主线提亮，保住墨底通透感。
    s.append('<defs>')
    s.append('<radialGradient id="halo" cx="50%" cy="50%" r="50%">'
             f'<stop offset="0" stop-color="{GOLD}" stop-opacity="0.18"/>'
             f'<stop offset="1" stop-color="{GOLD}" stop-opacity="0"/>'
             '</radialGradient>')
    s.append('<linearGradient id="vign" x1="0" y1="0" x2="0" y2="1">'
             f'<stop offset="0" stop-color="{INK}" stop-opacity="0"/>'
             f'<stop offset="1" stop-color="{INK}" stop-opacity="0.5"/>'
             '</linearGradient>')
    s.append('</defs>')
    s.append(f'<circle cx="1480" cy="210" r="360" fill="url(#halo)"/>')
    s.append(f'<rect x="0" y="470" width="{W}" height="{H - 470}" fill="url(#vign)"/>')
    for i in range(0, 46, 6):
        s.append(contour(300 + i * 12, 12 + i * 1.8, i * 0.22, GOLD,
                         0.46, 2.1, freq=0.005 + i * 0.0001))
    s.append(f'<circle cx="1480" cy="210" r="190" fill="{GOLD}" fill-opacity="0.18"/>')
    s.append(f'<circle cx="1480" cy="210" r="128" fill="url(#warm)" fill-opacity="0.5"/>')
    for i in range(46):
        y = 300 + i * 12
        s.append(contour(y, 12 + i * 1.8, i * 0.22, GOLD if i % 6 == 0 else SOIL[3],
                         0.1 if i % 6 else 0.36, 1 if i % 6 else 1.7, freq=0.005 + i * 0.0001))
    rnd = random.Random(2026)
    s += dots(rnd, 240, GOLD, 0.2, (0, 290, W, H), (0.5, 1.8))
    for i in range(30):
        s.append(line(i * 64, 0, i * 64, H, CANVAS, 1, 0.025))
    # 封面主标题由 HTML 承担，图版只在右下角留一个不干扰排版的角标
    s += [text(W - 70, H - 58, "FIELD CONTOURS  /  PLATE 04", 15, PAPER,
               anchor="end", spacing=5, mono=True, opacity=0.42)]
    result = s + tail()
    W, H = 1200, 820
    return result


ARTS = {
    "hero-field": art_hero,
    "soil-strata": art_soil,
    "machine": art_machine,
    "diorama": art_diorama,
    "rice": art_rice,
    "lake": art_lake,
    "seasons": art_seasons,
    "harvest": art_harvest,
    "atlas": art_atlas,
    "panorama": art_panorama,
}

for name, fn in ARTS.items():
    (OUT / f"{name}.svg").write_text("\n".join(fn()), encoding="utf-8")
    print(f"generated {name}.svg")
