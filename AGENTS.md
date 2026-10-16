# AGENTS.md: hướng dẫn cho AI CLI (Grok CLI, Claude Code, Codex…)

Repo này dựng video dọc 9:16 cho kênh **Dan Tech** (thị trường Việt Nam). Mọi bước dựng là code cố định. **Việc của AI chỉ là: chọn chủ đề, kiểm chứng nguồn, viết `videos/<slug>/script.json`, chạy lệnh render, rồi kiểm tra kết quả.** Đọc `README.md` để biết chi tiết.

## 1. Cài đặt (một lần trên máy Dan)

```bash
git clone https://github.com/dantech0xff/dantech-video && cd dantech-video
# cần: Node 18+, Python 3.10+, ffmpeg + ffprobe
cd remotion && npm install && cd ..
pip install -r requirements.txt     # faster-whisper; lần chạy đầu tải model "medium" ~1.5 GB
export GEMINI_API_KEY=...           # chỉ đặt trong env / .env (đã gitignore). KHÔNG ghi vào file nào trong repo
./dt fetch-music                    # tải nhạc Wikimedia Commons vào assets/music/
# 7 bài Pixabay (TIN NÓNG) phải tải tay từ pixabay.com, đặt đúng tên vào assets/music/pixabay/
#   (tên file + id: assets/music/tracks.json, assets/music/LIBRARY.md, themes/hot-news/theme.json → music.pool)
./dt setup                          # (macOS/Linux) tự làm các bước trên, chạy lại được; ưu tiên .venv
./dt doctor                         # kiểm tra mọi thứ, phải toàn ✅ trước khi render
```

## 2. Quy trình cho AI

1. **Chọn chủ đề**, rồi chọn theme:
   - `hot-news`: tin nóng, drama công nghệ (scene: Headline, Flow, Quote, Checklist, Evidence, CTA).
   - `quick-tips`: mẹo, tutorial, review tool, listicle (scene: MeoHook, MeoSearch, MeoFix, MeoSlowFast, MeoSave).
   - `tech-explain`: dev explainer (git, code, terminal; scene: CmdHook, GitGraph, LogPanes, DocRule, CommitCTA, CodeBlock, DepGraph, Analogy, Inversions, KeyPoint). v1 chờ Dan duyệt.
   - `tech-explain-cyber` (GIẢI THÍCH CYBER): dev explainer blueprint tối (scene: BpCode, BpGraph, SpecCard, BpSpec, BpReq, BpOptions, BpLayers, BpTerm, BpTree, BpTake; xem SCHEMA). Ví dụ `videos/flutter-mvvm`.
   - `hot-news-glitch` (🧪 experimental): tin nóng nền tối, glitch tín hiệu vỡ (scene: GlHeadline + Flow, Quote, Checklist, Evidence, CTA của hot-news; out `signal`). Ví dụ `videos/openai-vs-apple-glitch`.
2. **Kiểm chứng nguồn.** Mọi sự kiện, con số, trích dẫn phải có nguồn thật mà bạn đã mở và đọc. Ghi vào `sources` (tên báo + URL + ngày). **Không bịa sự kiện, số liệu, trích dẫn hay URL.** Không chắc thì bỏ, hoặc hỏi Dan.
3. **Viết `videos/<slug>/script.json`.** Copy mẫu, giữ đúng schema:
   - TIN NÓNG: `videos/openai-vs-apple/script.json`
   - MẸO NHANH: `videos/android-studio-shortcuts/script.json`
   - GIẢI THÍCH: `videos/git-merge-vs-rebase/script.json`
   - Khoá cấp trên: `theme, title, date, caption, sources, voice, music, scenes`. Mỗi scene có `say, type, section, out, props, sfx?`. Chỉ dùng `type` và các khoá `props` đã có trong mẫu (hoặc trong `remotion/src/scenes.tsx` / `meo.tsx`).
   - Hẹn giờ bằng `"@chữ"` (xem README), không đếm frame tay.
   - Câu cuối có "follow Dan Tech". Outro/CTA tự lo handle **YouTube @dantech-0xff, Facebook @dantech0xff**. Không tự làm outro.
   - Video mới **không** đặt `voice.file` (đó là giọng ghim của mẫu). Dùng `"voice": {"style": "random"}`, `"music": {"track": "random"}`.
   - Giọng văn: tiếng Việt tự nhiên, ngắn, dễ đọc thành tiếng. Rõ ràng trước; độ dài theo nội dung.
4. **Render:** `make video SCRIPT=videos/<slug>/script.json` (hoặc `./dt render …`). Sửa nhỏ: `./dt render <script> --from props` (bỏ qua TTS + align) hoặc `--from mix`.
5. **Kiểm tra** (mục 4), rồi báo Dan: đường dẫn `out/<slug>.mp4`, `description.txt`, style giọng và bài nhạc đã chọn.

## Theme ids
`hot-news` (TIN NÓNG · hot news), `quick-tips` (MẸO NHANH · quick tips), `tech-explain` (GIẢI THÍCH · tech explain). Id cũ `tin-nong`, `meo-nhanh`, `commit` vẫn chạy (alias, deprecated, có cảnh báo); script mới dùng id mới. Hashtag như #TinNong, #MeoNhanh giữ nguyên.

## Skills (đọc SKILL.md tương ứng rồi làm theo)

| Skill | Khi nào | File |
|---|---|---|
| `setup` | máy mới: cài Node/Python(.venv)/ffmpeg, npm, model whisper, .env, nhạc → `./dt doctor` ✅ | `.agents/skills/setup/SKILL.md` (tự động: `./dt setup`) |
| `write-script` | spec (chủ đề/link, theme, độ dài, góc nhìn) → `script.json` đã validate | `.agents/skills/write-script/SKILL.md` (+ `SCHEMA.md`, `template.json`) |
| `humanizer` | bỏ "mùi AI" khỏi lời đọc (bước trong write-script) | `.agents/skills/humanizer/SKILL.md` (upstream blader/humanizer, MIT) + `VI.md` (áp dụng cho tiếng Việt) |
| `render-video` | script → MP4 + QC, chạy lại bằng `--from` | `.agents/skills/render-video/SKILL.md` |
| `theme` | tạo/chỉnh theme từ spec | `.agents/skills/theme/SKILL.md` |

`.claude/skills` (Claude Code) và `.grok/skills` (Grok CLI) là **symlink** tới `../.agents/skills`, nên chỉ có một bản để sửa. Trên Windows: bật Developer Mode và chạy `git config core.symlinks true` *trước khi* clone (hoặc `git clone -c core.symlinks=true …`), nếu không symlink sẽ thành file text. Kiểm script: `python3 scripts/validate_script.py videos/<slug>/script.json`.

## 3. Quy tắc bắt buộc

- **Không nhân vật hay khuôn mặt người AI.** Dùng infographics. B-roll (nếu có) không có người hoặc mặt người.
- **TTS một lần cho mỗi video:** style rút ngẫu nhiên được giữ nguyên, dù video dài hay ngắn. **Không gọi lại TTS để chỉnh độ dài.** Lời đọc không đổi thì `tts.py` dùng lại audio + style đã rút từ `.cache/tts/`. Chỉ tạo giọng mới khi sửa lời, hoặc khi Dan yêu cầu (`./dt render <script> --new-voice`).
- **Giọng:** Gemini TTS `gemini-3.8-flash-tts`, voice `vi-vn-concierge-2`. Style chọn ngẫu nhiên trong hào hứng / kể chuyện kịch tính / tự nhiên YouTuber (`tts.py` tự chọn khi `style: random`). Lựa chọn được ghi vào `logs/voice_log.md`, nên commit file log này.
- **Nhạc TIN NÓNG:** xoay vòng 7 bài Pixabay trong `music.pool` (`track: random`, `pick_music.py` ưu tiên bài lâu chưa dùng nhất theo `logs/voice_log.md`). Không ghim một bài trừ khi Dan yêu cầu.
- **Mix:** nhạc ~21 dB dưới giọng (mục tiêu 18–22), master -14 LUFS, true peak -2 dBTP ở loudnorm (file AAC cuối ≤ -1 dBTP). **Không sửa chuỗi xử lý** (`scripts/mix_bgm.sh`, `loudnorm.sh`, `music.rel`) trừ khi Dan yêu cầu.
- Không sửa theme đã duyệt (`hot-news` khoá, `quick-tips` đã duyệt) nếu Dan không yêu cầu.

## 4. Checklist trước khi xuất

- [ ] Ghi lại thời lượng (thông tin, không phải tiêu chí sửa): `ffprobe -v error -show_entries format=duration -of csv=p=0 videos/<slug>/out/<slug>.mp4`
- [ ] Log render có `voice/music while speaking: median ~21 dB` (18–22), từ `scripts/measure_vm.py`.
- [ ] Loudness: dòng `mix:` in I ≈ -14 LUFS, Peak ≤ -1 dBTP. Kiểm lại: `ffmpeg -i out/<slug>.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12`
- [ ] Phụ đề khớp giọng; keycap, popup, SFX bật đúng chữ. Xem vài frame hoặc cả video (`scripts/compare.sh` nếu cần so sánh).
- [ ] `description.txt` có nguồn, và có **credit cho nhạc CC BY (Wikimedia Commons)**. Bài Pixabay 4–7 có cảnh báo Content ID.
- [ ] Không có mặt người trong hình.

## 5. Không được làm

- Không commit nhạc (`assets/music/**/*.mp3`), output (`videos/*/out/`), `.env`, hay API key.
- Không in `GEMINI_API_KEY` ra log hay chat.
- Không bịa nguồn. Không dùng nhạc hay SFX ngoài thư viện có licence (`assets/music/LIBRARY.md`, `assets/sfx/SFX_LIST.md`).
- Không force-push `main`.
