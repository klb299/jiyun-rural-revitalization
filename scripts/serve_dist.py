import functools
import http.server
import os
import socket
import sys
import threading
import webbrowser

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))
HOST = "127.0.0.1"
BASE_PORT = int(os.environ.get("PORT", "4173"))


class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        rel = self.path.split("?", 1)[0].lstrip("/")
        full = os.path.join(DIST_DIR, rel)
        if rel and (not os.path.exists(full) or os.path.isdir(full)):
            if not os.path.exists(os.path.join(full, "index.html")):
                self.path = "/index.html"
        return super().do_GET()

    def log_message(self, format, *args):
        pass


def pick_port(start_port):
    for p in range(start_port, start_port + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex((HOST, p)) != 0:
                return p
    return start_port


def main():
    if not os.path.exists(os.path.join(DIST_DIR, "index.html")):
        print("[ERROR] 未找到 dist/index.html，请先执行 npm run build。")
        sys.exit(1)

    port = pick_port(BASE_PORT)
    url = f"http://{HOST}:{port}/"
    handler = functools.partial(SPARequestHandler, directory=DIST_DIR)
    httpd = http.server.ThreadingHTTPServer((HOST, port), handler)

    print("================================================================")
    print("  《吉韵禾野》乡村振兴双端协同数字平台 · 本地服务已启动 (Python)")
    print("================================================================")
    print(f"  主入口（四端门户） : {url}")
    print(f"  双端同屏实训台     : {url}split")
    print(f"  四岗位管理后台     : {url}admin")
    print(f"  县域数智指挥大屏   : {url}bigscreen")
    print(f"  横版 3D 数字展馆   : {url}museum")
    print("----------------------------------------------------------------")
    print("  正在自动打开浏览器…… 关闭此窗口或按 Ctrl+C 即可停止服务。")
    print("================================================================")

    if os.environ.get("NO_OPEN") != "1":
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()


if __name__ == "__main__":
    main()
