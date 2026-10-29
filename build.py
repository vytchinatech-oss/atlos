"""Stamp a release version into sw.js and index.html.

Run before every publish:  python3 build.py
The version = date + short hash of all app files, so phones see a new
service worker (and show «Обновить») only when something really changed.
"""
import hashlib, pathlib, re, datetime

root = pathlib.Path(__file__).parent
files = ["index.html", "manifest.webmanifest"] + sorted(str(p.relative_to(root)) for p in (root / "icons").glob("*")) + sorted(str(p.relative_to(root)) for p in (root / "fonts").glob("*"))

h = hashlib.sha256()
for f in files:
    data = (root / f).read_bytes()
    if f == "index.html":
        data = re.sub(rb'const APP_VERSION="[^"]*"', b'const APP_VERSION=""', data)
    h.update(f.encode() + data)
version = datetime.date.today().strftime("%Y.%m.%d") + "-" + h.hexdigest()[:7]

idx = root / "index.html"
idx.write_text(re.sub(r'const APP_VERSION="[^"]*"', f'const APP_VERSION="{version}"', idx.read_text(encoding="utf-8")), encoding="utf-8")
sw = root / "sw.js"
sw.write_text(re.sub(r'const VERSION = "[^"]*"', f'const VERSION = "{version}"', sw.read_text(encoding="utf-8")), encoding="utf-8")
print("version", version)
