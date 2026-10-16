#!/bin/bash
# Kiểm tra máy có đủ để chạy pipeline. usage: ./dt doctor
cd "$(dirname "$0")/.."; F=0
ok(){ echo "✅ $1"; }; bad(){ echo "❌ $1"; echo "   → $2"; F=1; }
has(){ command -v "$1" >/dev/null 2>&1; }
if has node && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 18 ]; then ok "node $(node -v)"; else bad "node 18+" "cài Node 18+ (https://nodejs.org)"; fi
has npm && ok "npm $(npm -v)" || bad "npm" "cài npm (đi kèm Node)"
if has python3; then ok "$(python3 --version)"
 python3 -c "import faster_whisper" 2>/dev/null && ok "faster_whisper import được" || bad "faster_whisper" "pip install -r requirements.txt"
else bad "python3" "cài Python 3.10+"; fi
for b in ffmpeg ffprobe; do has $b && ok "$b" || bad "$b" "cài ffmpeg (brew install ffmpeg / apt install ffmpeg / winget install ffmpeg)"; done
[ -d remotion/node_modules/remotion ] && [ -d remotion/node_modules/@remotion/cli ] && ok "remotion node_modules" || bad "remotion node_modules" "cd remotion && npm install"
[ -z "$GEMINI_API_KEY" ] && [ -f .env ] && set -a && . ./.env && set +a
[ -n "$GEMINI_API_KEY" ] && ok "GEMINI_API_KEY đã đặt (${#GEMINI_API_KEY} ký tự)" || bad "GEMINI_API_KEY chưa đặt" "export GEMINI_API_KEY=... (hoặc ghi vào .env, đã gitignore)"
python3 - <<'PY' || F=1
import json,os,glob
ids={p['id'] for t in glob.glob('themes/*/theme.json') for p in json.load(open(t))['music']['pool']}
have={os.path.splitext(os.path.basename(f))[0]:f for f in glob.glob('assets/music/**/*.mp3',recursive=True)}
miss=sorted(i for i in ids if i not in have)
pix=len(glob.glob('assets/music/pixabay/*.mp3'))
print(("✅" if pix>=7 else "❌")+f" nhạc Pixabay: {pix}/7 trong assets/music/pixabay/")
if pix<7: print("   → tải tay từ pixabay.com, xem assets/music/LIBRARY.md")
print(("✅" if not miss else "❌")+f" nhạc trong music.pool của theme: {len(ids)-len(miss)}/{len(ids)}")
for m in miss: print(f"   → thiếu {m}.mp3 (./dt fetch-music cho Commons; Pixabay tải tay)")
raise SystemExit(1 if miss or pix<7 else 0)
PY
[ $F = 0 ] && echo "Tất cả OK." || { echo "Còn mục ❌, sửa rồi chạy lại ./dt doctor"; exit 1; }
