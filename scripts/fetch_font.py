"""生成全站中文衬线字体的精简子集。

从 src/ 下所有 .vue / .js 收集汉字，分批请求 Google Fonts 的 `text=` 接口，
只下载这些字形的 woff2 分片，生成 src/fonts.css 供 @font-face 使用。

字体：Noto Serif SC（SIL Open Font License 1.1，可随项目分发）
用途：仅用于标题与强调字（.display-* / .font-editorial），正文仍走系统字体栈。

用法：python scripts/fetch_font.py
产物：src/assets/fonts/jiyun-serif-N.woff2 + src/fonts.css
"""
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
BATCH = 300
FONT_DIR = BASE / "src" / "assets" / "fonts"
FONT_DIR.mkdir(parents=True, exist_ok=True)


def get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def collect_chars():
    chars = set()
    for p in sorted((BASE / "src").rglob("*")):
        if p.suffix not in (".vue", ".js"):
            continue
        if "assets/fonts" in p.as_posix():
            continue
        for c in p.read_text(encoding="utf-8"):
            if "\u4e00" <= c <= "\u9fff":
                chars.add(c)
    return "".join(sorted(chars))


def main():
    text = collect_chars()
    batches = [text[i:i + BATCH] for i in range(0, len(text), BATCH)]
    print(f"[font] 去重汉字 {len(text)} 个，分 {len(batches)} 批")

    parts = [
        "/* 自动生成：python scripts/fetch_font.py —— 请勿手工编辑 */",
        "/* Noto Serif SC · SIL OFL 1.1 · 按全站用字精简的 woff2 分片 */",
        "",
    ]
    total = 0
    for i, batch in enumerate(batches, 1):
        api = (
            "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700"
            "&text=" + urllib.parse.quote(batch) + "&display=swap"
        )
        try:
            css = get(api).decode("utf-8")
        except Exception as e:
            print(f"[font] 第 {i} 批 CSS 请求失败：{e}")
            sys.exit(1)
        src = re.search(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", css)
        ur = re.search(r"unicode-range:\s*([^;]+);", css)
        if not src or not ur:
            print(f"[font] 第 {i} 批返回格式异常：{css[:200]}")
            sys.exit(1)
        try:
            data = get(src.group(1))
        except Exception as e:
            print(f"[font] 第 {i} 批字体下载失败：{e}")
            sys.exit(1)
        name = f"jiyun-serif-{i}.woff2"
        (FONT_DIR / name).write_bytes(data)
        total += len(data)
        parts.append(
            "@font-face {\n"
            "  font-family: 'Jiyun Serif';\n"
            "  font-style: normal;\n"
            "  font-weight: 700;\n"
            "  font-display: swap;\n"
            f"  src: url('./assets/fonts/{name}') format('woff2');\n"
            f"  unicode-range: {ur.group(1).strip()};\n"
            "}\n"
        )
        print(f"[font] {i}/{len(batches)} {len(batch)} 字 -> {len(data) // 1024} KB")

    # 清掉上一轮多余分片
    for old in FONT_DIR.glob("jiyun-serif-*.woff2"):
        if int(re.search(r"-(\d+)\.woff2$", old.name).group(1)) > len(batches):
            old.unlink()

    (BASE / "src" / "fonts.css").write_text("\n".join(parts), encoding="utf-8")
    print(f"[font] 完成：{len(batches)} 个分片，合计 {total // 1024} KB")


if __name__ == "__main__":
    main()
