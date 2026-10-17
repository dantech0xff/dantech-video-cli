# AGENTS.md: hướng dẫn cho AI CLI (Grok CLI, Claude Code, Codex…)

Repo này dựng video dọc 9:16 cho kênh **Dan Tech** (thị trường Việt Nam). Mọi bước dựng là code cố định. **Việc của AI chỉ là: chọn chủ đề, kiểm chứng nguồn, viết `videos/<slug>/script.json`, chạy lệnh render, rồi kiểm tra kết quả.** Đọc `README.md` để biết chi tiết.

## 1. Cài đặt (một lần trên máy Dan)

```bash
git clone https://github.com/dantech0xff/dantech-video && cd dantech-video
# cần: Node 18+, Python 3.10+, ffmpeg + ffprobe
cd remotion && npm install && cd ..
pip install -r requirements.txt     # faster-whisper + edge-tts; lần chạy đầu tải model "medium" ~1.5 GB
export GEMINI_API_KEY=...           # tuỳ chọn. Chỉ đặt trong env / .env (đã gitignore). KHÔNG ghi vào file nào trong repo
                                    # không có key → TTS tự dùng Edge (miễn phí, giọng vi-VN-NamMinhNeural)
./dt fetch-music                    # tải nhạc Wikimedia Commons vào assets/music/
# 7 bài Pixabay (TIN NÓNG) phải tải tay từ pixabay.com, đặt đúng tên vào assets/music/pixabay/
#   (tên file + id: assets/music/tracks.json, assets/music/LIBRARY.md, themes/hot-news/theme.json → music.pool)
./dt setup                          # (macOS/Linux) tự làm các bước trên, chạy lại được; ưu tiên .venv
./dt doctor                         # kiểm tra mọi thứ, phải toàn ✅ trước khi render (⚠️ thiếu key = sẽ dùng Edge)
```

## 2. Quy trình end-to-end (agent mới, không có ngữ cảnh chat: đọc hết mục này)

Nguồn chủ đề, lịch đăng, mức tự động đăng do **người điều khiển bot** quyết định. Repo không ràng buộc chuyện đó. Repo chỉ quy định **chất lượng video**.

1. **Input:** chủ đề, link, bài học hoặc ghi chú. Bài học/link là **nguồn**, không phải dàn ý.
2. **Chọn theme** (xem bảng dưới + `write-script`). Spec không ghi theme và có người trả lời được thì đề xuất rồi chờ. Chạy tự động thì tự chọn và ghi lý do.
3. **Viết `videos/<slug>/script.json`** theo skill `write-script`:
   - **Một ý lõi** cho mỗi video. Ý phụ để thành video khác.
   - **Hook theo nội dung** (`hook.kind`: controversy/news → claim cụ thể + 2 phe + payoff; explainer → nêu chủ đề + why; tips → promise). Áp dụng cho mọi theme.
   - **Hook trực diện:** câu đầu cảnh 1 nêu thẳng chủ đề (≤10–12 chữ, ~3 s). Tiêu đề trên màn hình cảnh 1 cũng hiện chủ đề ngay. Khai báo `topic`.
   - **Đặt vấn đề tối đa 2 câu**, rồi vào lõi luôn. Khung: hook → khái niệm lõi → một bằng chứng/ví dụ → takeaway + CTA.
   - **Xoay quanh chủ đề** (topic-centric), không đi theo cấu trúc nguồn.
   - **Câu nói đầy đủ, có từ nối** (vì vậy, lúc này, nói cách khác…). Không viết kiểu ghi chú. Cắt ý, không cắt từ nối. Thuật ngữ định nghĩa ở lần đầu.
   - **Chỉ dùng code, lệnh, đường dẫn có thật trong nguồn.** Không bịa sự kiện, số, quote, URL. `sources` ghi đủ.
   - Pass **humanizer** (`humanizer/VI.md`), rồi chạy validator.
4. **Validate:** `python3 scripts/validate_script.py videos/<slug>/script.json` → `✅ OK`. Không có cảnh báo hook.
5. **Render:** `./dt render videos/<slug>/script.json` (skill `render-video`). Không có `GEMINI_API_KEY` thì TTS tự dùng Edge (miễn phí). Muốn chọn rõ: `--tts edge` / `--tts gemini`. Xem mục "TTS engine" bên dưới.
6. **QC** (mục 4), sửa layout bằng `--from props` (không tốn TTS).
7. **Giao:** `videos/<slug>/out/<slug>.mp4`, contact sheet PNG, `description.txt`, cùng báo cáo: style giọng, bài nhạc, thời lượng, LUFS/peak, median voice/music, kết quả safe zone.

Ví dụ đi từ đầu đến cuối: [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md).

**Mẫu theo theme** (copy script mẫu, giữ đúng schema; chi tiết trong [SCHEMA.md](.agents/skills/write-script/SCHEMA.md)):
| Theme | Dùng cho | Mẫu |
|---|---|---|
| `hot-news` | tin, drama (báo in sáng) | `videos/openai-vs-apple` |
| `hot-news-glitch` | tin, drama (nền tối, glitch tín hiệu vỡ, out `signal`) | `videos/openai-vs-apple-glitch` |
| `quick-tips` | mẹo, tool, tutorial, listicle | `videos/android-studio-shortcuts` |
| `tech-explain` | dev explainer (editor sáng/vàng) | `videos/git-merge-vs-rebase`, `videos/inversion-of-control` |
| `tech-explain-cyber` | dev explainer (blueprint tối, lime) | `videos/flutter-mvvm` |
| `android-tutor` | chỉ cho dev Android: Kotlin/Compose/lifecycle (IDE gần đen #0B0C0E + Compose Preview + Logcat, đúng xanh Android #3DDC84, chuyển cảnh `sharedx` (shared-axis X), hình mid-ground morph chậm) | `videos/compose-remember-saveable` |
| `flutter-tutor` | chỉ cho dev Flutter: widget/state/Dart (nền navy #050A14, Navy/Blue/Sky #042B59/#0553B1/#027DFD, card widget lồng nhau + highlight build lại, chuyển cảnh `hero` (chip từ khoá bay sang cảnh sau), dải xanh chéo mid-ground, logomark Flutter chính thức nhỏ) | `videos/flutter-setstate-valuenotifier` |

Script mới dùng `"voice": {"style":"random"}`. Không đặt `voice.file`. Câu cuối có `ctaPhrase` của kênh (mặc định "follow Dan Tech"). Outro tự lo handle.

## Kênh / brand (`channels/<id>.json`)
Mọi chữ thương hiệu trên màn hình lấy từ file kênh, không hardcode trong `remotion/src`. Gồm: wordmark ở top bar, rail, wipe chuyển cảnh, `DAN/TECH.git`; end card; nút Follow; thanh follow trong cảnh CTA. Script chọn kênh bằng `"channel": "<id>"`, mặc định `dantech`.
| Khoá | Ý nghĩa |
|---|---|
| `id`, `name`, `wordmark` | id file; tên hiển thị ("Dan Tech", end card cyber); wordmark chữ hoa ("DAN TECH", top bar/rail/end card). Tên dài sẽ tự co cho vừa |
| `tagline` | chuỗi, hoặc map `{default, <theme id>: …}` cho dòng dưới wordmark ở end card |
| `handles` | `[{p, icon: youtube\|facebook\|tiktok, h}]`, 3 dòng có logo ở end card |
| `followLabel`, `followDone`, `followSub` | chữ trên nút Follow, chữ sau khi bấm, dòng nhỏ dưới nút (chuỗi hoặc map theo theme) |
| `ctaPhrase`, `ctaInWord`, `ctaPressWord` | câu kết bắt buộc trong lời đọc (validator kiểm), chữ làm nút hiện ra, chữ làm nút bị bấm |
| `site`, `course` | tuỳ chọn: website/khoá học để nhắc nhẹ ở cảnh cuối |

**Thêm kênh mới:** copy `channels/dantech.json` thành `channels/<id>.json`, sửa các khoá trên, đặt `"channel": "<id>"` trong script, câu kết dùng đúng `ctaPhrase`. Rồi chạy validator và render still top bar, nút Follow, end card cho mọi theme, kiểm bằng safezone.py. Mẫu kênh giả để thử: `channels/example.json` (Mobile Hub). Icon mới (ngoài youtube/facebook/tiktok) thì vendor SVG simple-icons vào `assets/icons/` và thêm path vào `remotion/src/brand.tsx`.

## Theme ids
`hot-news` (TIN NÓNG · hot news), `quick-tips` (MẸO NHANH · quick tips), `tech-explain` (GIẢI THÍCH · tech explain), `tech-explain-cyber` (GIẢI THÍCH CYBER), `hot-news-glitch` (TIN NÓNG GLITCH), `android-tutor` (ANDROID TUTOR), `flutter-tutor` (FLUTTER TUTOR). Id cũ `tin-nong`, `meo-nhanh`, `commit` vẫn chạy (alias, deprecated, có cảnh báo); script mới dùng id mới. Hashtag như #TinNong, #MeoNhanh giữ nguyên.

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

- **TTS (Gemini tier 1, 100 request/ngày, key dùng chung): đúng MỘT request cho mỗi video.**
  - Nhận style rút được. **Không re-roll** vì độ dài hay giọng.
  - **Không gọi TTS để thử, test hay benchmark.** Test thì dùng cache, mock hoặc `voice.file` có sẵn.
  - Cache `.cache/tts/`: lời không đổi thì không gọi API.
  - **Lỗi TTS (401/403/429/5xx) thì dừng, không retry**, báo lại người điều khiển.
  - Giọng mới chỉ khi `say` đổi, hoặc khi có yêu cầu rõ (`--new-voice`).
- **Giọng:** `gemini-3.8-flash-tts`, voice `vi-vn-concierge-2`, style ngẫu nhiên từ `voice.styles`, ghi vào `logs/voice_log.md` (commit file này).
- **TTS engine (Gemini hoặc Edge):** chọn theo thứ tự: CLI `--tts edge|gemini` > script `"tts": {"engine": …}` > auto (có `GEMINI_API_KEY` → Gemini y như trên; không có key → Edge). `tts.py` in ra engine và lý do, vd. `tts: engine=edge (no GEMINI_API_KEY -> Edge)`.
  - **Edge** (`edge-tts`, miễn phí, không key, không quota): mặc định `vi-VN-NamMinhNeural` (nam, Dan chọn), rate `+10%` (nhịp reel, ~3.1 chữ/s), pitch `+0Hz`, volume `+0%`. Đổi bằng `"tts": {"engine":"edge","voice":"vi-VN-HoaiMyNeural","rate":"+5%"}` hoặc `--voice/--rate/--pitch/--volume`. Giọng tiếng Việt chuẩn chỉ có NamMinh (nam) và HoaiMy (nữ). Giọng `*MultilingualNeural` (Andrew, Ava…) đọc được nhưng lơ lớ.
  - Edge **không có style**: `voice.style` (ke-chuyen…) bị bỏ qua, có in ghi chú. Cache riêng theo engine+voice+rate+pitch+volume+lời. Lỗi mạng thì Edge thử lại tối đa 3 lần (miễn phí); Gemini vẫn **không retry**.
  - Xem trước engine mà không gọi gì: `python3 scripts/tts.py <script> [--tts …] --dry-run`.
- **Nhạc:** `track: random` nghĩa là LRU theo pool của theme (`pick_music.py`). Có thể ghim bài bằng id trong `music.track` để re-render không đổi nhạc (vd. flutter-mvvm ghim `sappheiros-perspective`). Explainer nên dùng nhạc êm, tin nóng dùng nhạc căng.
  - **Content ID (YouTube):** bài Pixabay có thể bị claim. `description.txt` có cảnh báo/credit. Bài Commons CC BY bắt buộc credit. Không dùng nhạc ngoài `assets/music/LIBRARY.md`.
- **Mix:** -14 LUFS, true peak -2 dBTP (AAC cuối ≤ -1), giọng cao hơn nhạc ~21 dB (18–22). Không sửa chuỗi mix nếu không được yêu cầu.
- **Caption:** karaoke phân trang (mọi theme). Hết câu thì xoá trang, hiện trọn câu mới, highlight từng chữ. Tối đa 2 dòng. Câu dài cắt ở dấu phẩy/ranh giới tự nhiên. Mỗi chữ là một chip có nền. Chữ đang đọc đổi sang nền accent + text tương phản, pop nhẹ. Không gạch chân. Font và màu chip lấy từ `theme.json → look.caption`. Không sửa thành chạy cuộn.
- **Safe zone bắt buộc:** hằng số ở `remotion/src/safezone.ts`. Nội dung x 136–860, y 290–~1360. Caption y 1366–1500. Follow y 1150–1350. Trên y 250 chỉ để brand. Kiểm bằng `scripts/safezone.py`.
- **Trên màn hình:** không tên theme, không meta label, không nhãn kỹ thuật giả (FIG./SHEET/§/"END OF SHEET"…). Brand "Dan Tech" thì giữ. **Không người, mặt người AI.** B-roll faceless.
- **Outro/end card:** 3 dòng có logo: **YouTube @dantech-0xff**, **Facebook @dantech0xff**, **TikTok @dantech_0xff**. Nguồn duy nhất là `channels/<id>.json` (mặc định `channels/dantech.json`), sửa handle ở đó. Logo vendored từ simple-icons, CC0, nằm ở `assets/icons/` và `remotion/src/brand.tsx`. Nút Follow do code lo.
- Không sửa theme đã duyệt nếu không được yêu cầu. Theme mới/sửa theme: làm theo skill `theme`.

## 4. QC: Definition of done / quality bar

Video chỉ "xong" khi tất cả đều ✅:
- [ ] Validator `✅ OK`. Câu đầu nêu chủ đề. Trong frame 0–3 s thấy tiêu đề chủ đề.
- [ ] Đúng 1 lần gọi TTS Gemini (hoặc 0 nếu dùng cache / Edge). Engine + style/giọng đã ghi log, đã báo engine nào được dùng.
- [ ] Log mix: I ≈ -14 LUFS, peak ≤ -1 dBTP, `voice/music while speaking: median` 18–22 dB. Đo lại: `ffmpeg -i <mp4> -af ebur128=peak=true -f null - 2>&1 | tail -12`.
- [ ] **Contact sheet:** mỗi cảnh một still + outro, vd. `ffmpeg -i <mp4> -vf "fps=1/3,scale=270:-1,tile=6x2" -frames:v 1 sheet.png`. Phải mở ra xem bằng mắt.
- [ ] **Frame inspection:** still ở 0.5 s, giữa mỗi cảnh, lúc bấm Follow, end card (`ffmpeg -ss <t> -i <mp4> -frames:v 1 f.png`). Chữ không tràn, không chồng, baseline top bar thẳng, code đọc được.
- [ ] **Overlap audit** (theme có gắn `data-bb`, hiện tại android-tutor, flutter-tutor): `scripts/bbcheck.sh videos/<slug>/script.json` → `frames with overlaps: 0`.
- [ ] **Safe zone:** `python3 scripts/safezone.py f*.png -o qc/` + `--sheet`. Chữ, caption, nút, handle không nằm trong vùng đỏ. Nền, lưới, rail trang trí thì bỏ qua.
- [ ] Caption khớp giọng, mỗi trang ≤ 2 dòng. Anchor `@chữ` bật đúng lúc.
- [ ] Không mặt người, không tên theme, không label giả. End card có 3 handle có logo.
- [ ] `description.txt` có nguồn + credit nhạc. Không có số liệu nào thiếu nguồn.
- [ ] Thời lượng chỉ ghi lại để báo, **không** là lý do render lại hay gọi lại TTS.

## Common mistakes (đã gặp thật)
- Hook chung chung ("Anh em đứng về phía nào?") hoặc claim mơ hồ, không nói ai vs ai và vì sao. Thiếu 2 phe trong 1–3 s. Hứa "cuối video…" mà không giao. Bịa claim giật tít không có trong nguồn. Xem [docs/LEARNINGS.md](docs/LEARNINGS.md).
- Lời đọc kể cấu trúc kịch bản ("đây là thứ mình hứa", "giờ anh em đã đủ dữ kiện", "cuối video là…"). Payoff thì nói thẳng sự việc, poll là câu hỏi tự nhiên.
- Viết hook theo theme. Hook phải theo **nội dung** (`hook.kind`).
- Mở bằng câu dẫn dắt vòng vo. Đặt vấn đề 4 cảnh trong khi lõi chỉ nửa video. Kể lại mọi ví dụ trong bài học.
- Viết kiểu ghi chú, thiếu từ nối, thuật ngữ không định nghĩa (ioc_v1 bị chê "thiếu chữ").
- Đi theo thứ tự bài học thay vì theo chủ đề. Bịa code minh hoạ không có trong nguồn.
- Gọi lại TTS cho vừa độ dài, hoặc "test thử" TTS, làm hết quota ngày. Retry khi 429.
- In tên theme, "tech explain", "FIG. 01"… lên khung hình.
- Để chữ, caption hay nút Follow dưới y 1500 hoặc sát mép phải (bị nút like/comment che).
- Caption chạy cuộn liên tục, hoặc rớt 3 dòng.
- Đổi nhạc giữa các lần re-render vì quên ghim `music.track`.
- Commit `videos/*/out/`, nhạc mp3, `.env`. Commit sai identity.

## 5. Git & không được làm

- Commit với identity của repo: `git -c user.name="Dan Tech" -c user.email="dantech0xff@users.noreply.github.com" commit …` (nếu máy chưa cấu hình). Push lên `main` (hoặc branch `theme/<id>` cho theme mới, merge thường). **Không force-push `main`.**
- Commit: `videos/<slug>/script.json`, `logs/voice_log.md`, code/theme/docs. **Không commit** `videos/*/out/`, `.cache/`, nhạc `assets/music/**/*.mp3`, `.env`, API key.
- Không in `GEMINI_API_KEY` ra log hay chat. Không bịa nguồn. Không dùng nhạc/SFX ngoài thư viện có licence (`assets/music/LIBRARY.md`, `assets/sfx/SFX_LIST.md`).
