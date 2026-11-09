"""一键跑全部视觉 / 可访问性探针，并汇总每段 ### Result。

前置：另开一个终端跑
    npm run preview -- --host 127.0.0.1 --port 4173
用法：
    npm run audit
若 playwright-cli 不在 PATH，可设环境变量 PLAYWRIGHT_CLI=/path/to/playwright-cli。

注意：open 与所有 run-code 必须拼进同一条 shell 命令。跨 shell 调用时
playwright 的浏览器会话会被回收，报 "Browser 'default' is not open"。
"""
import os
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

BASE = "http://127.0.0.1:4173"
PROBES = [
    "audit-contrast.js",
    "audit-mobile.js",
    "audit-links.js",
    "audit-detail.js",
    "audit-interactions.js",
    "audit-round19.js",
    "audit-a11y.js",
    "audit-notill.js",
    "audit-soil.js",
    "audit-rice.js",
]
CLI = os.environ.get("PLAYWRIGHT_CLI", "playwright-cli")

try:
    with urllib.request.urlopen(BASE + "/", timeout=3) as r:
        if r.status != 200:
            raise RuntimeError(f"HTTP {r.status}")
except Exception:
    print(f"[audit] 预览服务不可达：{BASE}/")
    print("请先在另一个终端执行：npm run preview -- --host 127.0.0.1 --port 4173")
    sys.exit(1)

log_dir = Path(".workbuddy/audit")
log_dir.mkdir(parents=True, exist_ok=True)

commands = [f"{CLI} open --browser=chrome {BASE}/"] + [
    f"{CLI} run-code --filename .workbuddy/tools/{p}" for p in PROBES
]
proc = subprocess.run(
    " && ".join(commands),
    shell=True,
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace",
)
output = (proc.stdout or "") + "\n" + (proc.stderr or "")
(log_dir / "latest.log").write_text(output, encoding="utf-8")

results = re.findall(r"### Result\r?\n(.*?)(?=\r?\n### Ran)", output, re.S)
failed = 0
for i, p in enumerate(PROBES):
    print(f"\n=== {p} ===")
    if i >= len(results) or not results[i].strip():
        failed += 1
        print("（未取到 Result，详见 .workbuddy/audit/latest.log）")
        continue
    r = results[i].strip()
    print(r if len(r) <= 1600 else r[:1600] + "\n…（已截断，完整结果见日志）")

log = log_dir / "latest.log"
print(f"\n[audit] {len(PROBES) - failed}/{len(PROBES)} 个探针取到结果；完整日志：{log}")
sys.exit(1 if failed else 0)
