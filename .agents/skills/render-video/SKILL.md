---
name: render-video
description: Render một videos/<slug>/script.json thành MP4 hoàn chỉnh (TTS Gemini → align → props → Remotion → mix nhạc → description) rồi QC. Input là đường dẫn script, tuỳ chọn --from <stage> để chạy lại một phần.
---

# render-video

**Input:** `videos/<slug>/script.json` (+ tuỳ chọn `--from tts|align|props|render|mix|describe`).
**Output:** `videos/<slug>/out/<slug>.mp4` + `description.txt`, kèm báo cáo QC.

## Các bước

1. `./dt doctor` phải toàn ✅ (node, ffmpeg, faster_whisper, node_modules, GEMINI_API_KEY, nhạc). Gặp ❌ thì làm theo gợi ý in ra.
2. `python3 scripts/validate_script.py <script>` phải ✅.
3. Render: `make video SCRIPT=videos/<slug>/script.json` (= `./dt render <script>`). Các stage chạy lần lượt, mỗi stage ghi vào `videos/<slug>/out/`:
   | stage | script | ra |
   |---|---|---|
   | tts | `scripts/tts.py` | `voice.mp3` + `voice_meta.json`. Lời không đổi thì dùng lại cache `.cache/tts/` (cùng style, không gọi API). Gemini `vi-vn-concierge-2`, style chọn ngẫu nhiên từ `theme.json → voice.styles` khi `style: random`, rồi ghi vào `logs/voice_log.md` |
   | align | `scripts/align.py` | `words.json` (faster-whisper, lần đầu tải ~1.5 GB) |
   | props | `scripts/build_props.py` | `props.json` (giải `@chữ` → frame, thời lượng cảnh, outro) |
   | render | Remotion + `loudnorm.sh` | `raw.mp4`, `voice_sfx.mp4` |
   | mix | `pick_music.py` + `mix_bgm.sh` + `measure_vm.py` | `<slug>.mp4`, `stems/`, `music.json`. Nhạc random từ `music.pool` (TIN NÓNG xoay 7 bài Pixabay), có ghi log |
   | describe | `scripts/describe.py` | `description.txt` (nguồn + credit nhạc) |
4. **QC** (ghi kết quả vào báo cáo):
   - Thời lượng: `ffprobe -v error -show_entries format=duration -of csv=p=0 videos/<slug>/out/<slug>.mp4` (thông tin để báo Dan; không render lại vì độ dài).
   - Mix: log có `voice/music while speaking: median ~21 dB` (chấp nhận 18–22).
   - Loudness: dòng `mix:` có I ≈ -14 LUFS, Peak ≤ -1 dBTP. Đo lại: `ffmpeg -i <mp4> -af ebur128=peak=true -f null - 2>&1 | tail -12`.
   - Frame check: trích vài still, ví dụ `ffmpeg -ss 1 -i <mp4> -frames:v 1 /tmp/f1.png` (1 s, giữa mỗi cảnh, outro). Xem: không có mặt người, chữ không tràn, Follow/end card có handle YouTube @dantech-0xff, Facebook @dantech0xff.
   - Phụ đề và anchor khớp giọng: xem video, hoặc so `words.json` với still tại các mốc `@chữ`.
   - So với bản đã duyệt nếu cần: `scripts/compare.sh <new.mp4> <ref.mp4> sheet.png <frame> …`.
   - `description.txt` có nguồn và credit CC BY (nhạc Commons); bài Pixabay 4–7 có cảnh báo Content ID.
5. **Báo Dan:** đường dẫn mp4 + description, style giọng + bài nhạc (dòng mới trong `logs/voice_log.md`), số đo QC. Commit `logs/voice_log.md` (không commit `out/`, nhạc, key).

## Giọng đọc: một lần cho mỗi video
Style rút ngẫu nhiên lần đầu được giữ nguyên. **Không bao giờ gọi lại TTS (hay `--new-voice`) để video dài/ngắn hơn.** Chạy lại từ `tts` với lời không đổi sẽ dùng lại cache. Chỉ dùng `--new-voice` khi Dan yêu cầu rõ.

## Chạy lại một phần (`--from`)
- Sửa props/sfx/section (không đổi `say`): `./dt render <script> --from props`
- Chỉ trộn lại nhạc / đổi bài: `./dt render <script> --from mix`
- Đổi `say`: chạy lại từ đầu (tts). Lời mới nghĩa là một lần TTS mới, rút style mới.
- Chỉ viết lại description: `--from describe`

## Lỗi thường gặp
| Lỗi | Sửa |
|---|---|
| `words.json does not match the script; re-run align` | đã sửa `say` sau align → chạy lại từ `tts` (hoặc `--from align` nếu dùng voice.file) |
| `anchor @x: word not found in this scene` | chữ trong anchor không có trong `say` của cảnh, hoặc whisper nghe khác → đổi anchor sang chữ khác/`#n` |
| `Unknown scene type` | sai `type`, xem `SCENES` trong `remotion/src/Video.tsx` |
| Lỗi TTS 401/403/429 | kiểm `GEMINI_API_KEY`, billing/quota; thử lại sau |
| `music file not found` / mix lỗi | thiếu mp3: `./dt fetch-music` hoặc tải tay Pixabay vào `assets/music/pixabay/` |
| Nhạc lấn giọng | **không sửa chuỗi mix**; báo Dan số đo median, chỉ đổi `music.rel` khi Dan đồng ý |

## Caption (karaoke, phân trang)
- Không cuộn liên tục. Mỗi lần hiện **trọn một câu** (theo dấu câu trong script, giữ trong words.json); hết câu thì xoá và hiện câu mới.
- Câu dài hơn 2 dòng được tách tại dấu phẩy / hai chấm thành các cụm trọn vẹn, mỗi cụm hiện nguyên; cụm vẫn quá dài thì chia đều theo từ.
- Trong cụm, từng từ sáng lên theo timing whisper (từ đang đọc = accent + gạch chân, đã đọc = màu chữ, chưa đọc = mờ).
- QC: chụp vài frame giữa câu, kiểm tra không quá 2 dòng và đúng font theme.
