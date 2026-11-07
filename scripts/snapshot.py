"""每轮改版前留一份源码与文档快照。

项目历史上不是 git 仓库，只能靠手动备份；现在 git 已接管版本历史，
这个脚本保留作为「改坏了想立刻拿到一份完整目录」的快捷兜底。
用法：npm run snapshot
"""
import shutil
from datetime import datetime
from pathlib import Path

TARGETS = [
    "src", "scripts", "public",
    "index.html", "vite.config.js", "package.json",
    "README.md", "PROJECT_HANDOVER.md", "VISUAL_HANDOFF.md", "3D_HANDOFF.md",
]

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
dest = Path(".workbuddy/backup") / f"snapshot-{stamp}"
dest.mkdir(parents=True, exist_ok=True)

copied = []
for t in TARGETS:
    src = Path(t)
    if not src.exists():
        continue
    out = dest / t
    if src.is_dir():
        shutil.copytree(src, out, dirs_exist_ok=True)
    else:
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, out)
    copied.append(t)

print(f"[snapshot] 已备份 {len(copied)} 项到 {dest}")
print("[snapshot] " + ", ".join(copied))
