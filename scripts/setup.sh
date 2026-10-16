#!/bin/bash
# Cài phần không tương tác cho macOS/Linux, chạy lại bao nhiêu lần cũng được (idempotent).
# usage: ./dt setup   (hoặc scripts/setup.sh). Không đọc, không in GEMINI_API_KEY.
set -e; cd "$(dirname "$0")/.."
step(){ echo "── $1"; }
command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null || { echo "❌ thiếu ffmpeg: macOS 'brew install ffmpeg', Ubuntu/Debian 'sudo apt install -y ffmpeg'"; exit 1; }
command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 18 ] || { echo "❌ cần Node 18+: macOS 'brew install node', Ubuntu xem https://nodejs.org (NodeSource/nvm)"; exit 1; }
python3 -c "import sys;sys.exit(sys.version_info<(3,10))" || { echo "❌ cần Python 3.10+: macOS 'brew install python', Ubuntu 'sudo apt install -y python3 python3-venv python3-pip'"; exit 1; }
step "python"
if [ -x .venv/bin/python3 ]; then PY=.venv/bin/python3
elif [ -z "$SETUP_FORCE_VENV" ] && python3 -c "import faster_whisper,numpy" 2>/dev/null; then PY=python3; echo "python3 hệ thống đã có faster_whisper, numpy → dùng luôn (SETUP_FORCE_VENV=1 để tạo .venv)"
else python3 -m venv .venv; PY=.venv/bin/python3; fi
$PY -c "import faster_whisper,numpy" 2>/dev/null && echo "requirements đã cài" || { $PY -m pip install -q --upgrade pip; $PY -m pip install -q -r requirements.txt; }
step "npm (remotion/)"
[ -d remotion/node_modules/@remotion/cli ] && echo "node_modules đã có" || (cd remotion && npm install)
step "faster-whisper model 'medium' (~1.5 GB lần đầu)"
$PY -c "from faster_whisper import download_model;print(download_model('medium'))"
step ".env"
if [ -f .env ]; then echo ".env đã có"; elif [ -n "$GEMINI_API_KEY" ]; then echo "GEMINI_API_KEY đã có trong môi trường, không tạo .env"; else cp .env.example .env; echo "đã tạo .env từ .env.example → điền GEMINI_API_KEY (không in key ra màn hình)"; fi
step "nhạc"
if $PY -c "import json,os,sys;sys.exit(any(t.get('fetch')=='commons' and not os.path.isfile(t['file']) for t in json.load(open('assets/music/tracks.json'))))"; then echo "Commons: đủ"
else PATH="$(cd "$(dirname "$PY")" && pwd):$PATH" python3 scripts/fetch_music.py; fi
$PY -c "
import json,os
m=[t for t in json.load(open('assets/music/tracks.json')) if t.get('fetch')!='commons' and not os.path.isfile(t['file'])]
print('Pixabay: đủ' if not m else 'Pixabay: tải tay các bài sau (Pixabay Content License):')
for t in m: print('  ❗', t['file'], '<-', t.get('source'))"
step "doctor"; exec ./dt doctor
