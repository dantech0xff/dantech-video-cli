---
name: setup
description: Cài đặt máy mới (macOS/Linux/Windows) để chạy pipeline video Dan Tech: Node 18+, Python 3.10+ (.venv), ffmpeg, npm install, model faster-whisper "medium", .env với GEMINI_API_KEY, nhạc. Kết thúc khi ./dt doctor toàn ✅.
---

# setup

**Input:** không có (máy của Dan, repo đã clone). **Output:** `./dt doctor` toàn ✅.
Phần không tương tác đã gói trong `./dt setup` (= `scripts/setup.sh`, chạy lại nhiều lần không sao). Skill này lo phần cài công cụ hệ thống, key và nhạc tay.

**Tuyệt đối không in, không đọc to, không echo `GEMINI_API_KEY`**, không đưa key vào lệnh hay log, không commit `.env`.

## 1. Nhận diện OS
`uname -s` → `Darwin` = macOS, `Linux` = Linux. Windows: `$env:OS` (PowerShell) = `Windows_NT`.
- **Windows: dùng WSL2 (Ubuntu)**, vì `dt` và các script là bash. `wsl --install -d Ubuntu`, clone repo *trong* WSL (`~/`, không phải `/mnt/c`), rồi làm theo phần Linux.
- Nếu buộc chạy trên Windows gốc (Git Bash): bật Developer Mode và `git config --global core.symlinks true` *trước khi* clone (vì `.claude/skills`, `.grok/skills` là symlink). Cài bằng `winget install OpenJS.NodeJS.LTS Python.Python.3.12 Gyan.FFmpeg`. Python trong venv là `.venv/Scripts/python`, nên không được hỗ trợ đầy đủ; ưu tiên WSL2.

## 2. Công cụ hệ thống (kiểm trước, thiếu mới cài; lệnh `sudo` thì hỏi Dan trước)
| | kiểm | macOS (Homebrew) | Ubuntu/Debian/WSL |
|---|---|---|---|
| Node 18+ | `node -v` | `brew install node` | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash - && sudo apt install -y nodejs` |
| Python 3.10+ | `python3 --version` | `brew install python` | `sudo apt install -y python3 python3-venv python3-pip` |
| ffmpeg + ffprobe | `ffmpeg -version` | `brew install ffmpeg` | `sudo apt install -y ffmpeg` |
Chưa có Homebrew: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`.

## 3. Chạy `./dt setup`
Script sẽ:
- Python: dùng `.venv` nếu có. Nếu chưa có và python hệ thống thiếu `faster_whisper` thì tạo `.venv` (`python3 -m venv .venv`) rồi `pip install -r requirements.txt`. Muốn luôn dùng venv: `SETUP_FORCE_VENV=1 ./dt setup`. `./dt` và `make` tự ưu tiên `.venv/bin` khi có.
- `cd remotion && npm install` (nếu chưa có `node_modules`).
- Tải trước model faster-whisper **`medium`** (đúng tên trong `scripts/align.py`, ~1.5 GB, cache ở `~/.cache/huggingface/hub/models--Systran--faster-whisper-medium`).
- Tạo `.env` từ `.env.example` nếu chưa có và key chưa có trong môi trường.
- Thiếu nhạc Commons → `./dt fetch-music`. Liệt kê bài Pixabay còn thiếu.
- Chạy `./dt doctor`.

## 4. GEMINI_API_KEY
Nhờ **Dan tự dán key** vào `.env` (dòng `GEMINI_API_KEY=...`) bằng editor, hoặc tự chạy trong terminal của Dan:
`read -rs -p "GEMINI_API_KEY: " k && printf 'GEMINI_API_KEY=%s\n' "$k" > .env && unset k`
Không yêu cầu Dan gửi key vào chat. Chỉ kiểm bằng `./dt doctor` (in độ dài, không in key).

## 5. 7 bài Pixabay (tải tay, Pixabay Content License)
Vào https://pixabay.com/music/, tìm theo số id, tải MP3, đổi tên **đúng** như sau, đặt vào `assets/music/pixabay/`:
- `the_mountain-epic-cinematic-576567.mp3`
- `the_mountain-epic-trailer-576568.mp3`
- `the_mountain-cinematic-epic-576562.mp3`
- `nastelbom-epic-trailer-602514.mp3`
- `nastelbom-epic-cinematic-602522.mp3`
- `echoes_of_lumen-epic-background-music-595722.mp3`
- `pink_sound-storm-zone-epic-background-instrumental-music-for-video-short-1-587216.mp3`
(Nguồn chuẩn: `assets/music/tracks.json`. Không commit mp3.)

## 6. Vòng sửa lỗi
Chạy `./dt doctor`. Với mỗi ❌, làm theo gợi ý `→` rồi chạy lại, đến khi in `Tất cả OK.`. Cuối cùng thử nhanh: `python3 scripts/validate_script.py videos/openai-vs-apple/script.json`. Báo Dan những gì đã cài và những gì Dan cần tự làm (key, nhạc Pixabay).
