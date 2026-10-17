---
name: render-video
description: Render một videos/<slug>/script.json thành MP4 hoàn chỉnh (TTS Gemini hoặc Edge → align → props → Remotion → mix nhạc → description) rồi QC. Input là đường dẫn script, tuỳ chọn --from <stage> để chạy lại một phần.
---

# render-video

**Input:** `videos/<slug>/script.json` (+ tuỳ chọn `--from tts|align|props|render|mix|describe`, `--tts edge|gemini`, `--voice/--rate/--pitch/--volume` cho Edge).
**Output:** `videos/<slug>/out/<slug>.mp4` + `description.txt`, kèm báo cáo QC.

## Các bước

1. `./dt doctor` phải toàn ✅ (node, ffmpeg, faster_whisper, edge_tts, node_modules, nhạc). Gặp ❌ thì làm theo gợi ý in ra. Thiếu `GEMINI_API_KEY` chỉ là ⚠️: render sẽ dùng Edge TTS.
2. `python3 scripts/validate_script.py <script>` phải ✅.
3. Render: `make video SCRIPT=videos/<slug>/script.json` (= `./dt render <script>`). Các stage chạy lần lượt, mỗi stage ghi vào `videos/<slug>/out/`:
   | stage | script | ra |
   |---|---|---|
   | tts | `scripts/tts.py` | `voice.mp3` (44.1 kHz, -16 LUFS, mọi engine giống nhau) + `voice_meta.json`. Lời không đổi thì dùng lại cache `.cache/tts/` (không gọi API). Gemini `vi-vn-concierge-2`, style ngẫu nhiên từ `theme.json → voice.styles` khi `style: random`; hoặc Edge (xem mục "Chọn engine TTS"). Ghi vào `logs/voice_log.md` |
   | align | `scripts/align.py` | `words.json` (faster-whisper, lần đầu tải ~1.5 GB) |
   | props | `scripts/build_props.py` + `scripts/autofill.py` | `props.json` (giải `@chữ` → frame, thời lượng cảnh, outro, overlay `ov` mỗi cảnh) + `autofill.json`. In log `autofill: scene N … kind "…" ← lý do` và `static gaps > 2.5s: X before -> 0 after` |
   | render | Remotion + `loudnorm.sh` | `raw.mp4`, `voice_sfx.mp4` |
   | gate | `scripts/static_gate.py` (+ `remotion/qc_frames.mjs`) | `gate.json`, `qc_frames/`. Render lại low-res với `qc:true` (ẩn caption + `[data-deco]`), mọi cửa sổ 3 s trong lúc đọc phải có hình đổi. ❌ → dừng trước mix, in mốc giây + cảnh |
   | mix | `pick_music.py` + `mix_bgm.sh` + `measure_vm.py` | `<slug>.mp4`, `stems/`, `music.json`. Nhạc random từ `music.pool` (TIN NÓNG xoay 7 bài Pixabay), có ghi log |
   | describe | `scripts/describe.py` | `description.txt` (nguồn + credit nhạc) |
4. **QC** (ghi kết quả vào báo cáo):
   - Thời lượng: `ffprobe -v error -show_entries format=duration -of csv=p=0 videos/<slug>/out/<slug>.mp4` (thông tin để báo Dan; không render lại vì độ dài).
   - Mix: log có `voice/music while speaking: median ~21 dB` (chấp nhận 18–22).
   - Loudness: dòng `mix:` có I ≈ -14 LUFS, Peak ≤ -1 dBTP. Đo lại: `ffmpeg -i <mp4> -af ebur128=peak=true -f null - 2>&1 | tail -12`.
   - Contact sheet: `ffmpeg -i <mp4> -vf "fps=1/3,scale=270:-1,tile=6x2" -frames:v 1 <slug>_sheet.png`, mở ra xem.
   - Frame check: trích vài still, ví dụ `ffmpeg -ss 1 -i <mp4> -frames:v 1 /tmp/f1.png` (1 s, giữa mỗi cảnh, outro). Xem: không có mặt người, chữ không tràn, Follow/end card có 3 handle có logo (YouTube @dantech-0xff, Facebook @dantech0xff, TikTok @dantech_0xff, lấy từ `channels/<id>.json`).
   - Phụ đề và anchor khớp giọng: xem video, hoặc so `words.json` với still tại các mốc `@chữ`.
   - **Gate hình tĩnh:** `gate: ✅ PASS …`. Fail: đọc mốc giây, thêm anchor/`kw`/`overlays` cho cảnh đó (hoặc bỏ `autofill:false`) rồi `--from props`. Cảnh có `"still": true` được miễn đoạn tĩnh ≤ 5 s nằm trong cảnh (`gate: still:true exempt …`); dài hơn vẫn fail. Chạy riêng: `./dt gate <script>` (cần `out/props.json`, không TTS, ~10–30 s). Không nới ngưỡng để qua gate.
   - **Autofill:** đọc log `autofill:` của stage props; filler chọn sai ý (số sai ngữ cảnh, chip lạc đề) thì sửa script (`overlays`/`glossary`/`kw`, hoặc `autofill:false` cho cảnh đó kèm anchor thật), không sửa props tay.
   - **Hình theo từng câu:** đối chiếu stills với từng câu `say`. Câu nào không có visual tương ứng (đang liệt kê/diễn giải mà màn hình chỉ có một hình tĩnh không liên quan) → sửa props, đổi scene type hoặc tách cảnh ở ranh giới câu rồi `--from props` (không tốn TTS). Lỗi nhịp hình của validator (❌) bắt buộc sửa trước khi render; mọi `⚠️` còn lại phải xử lý hoặc giải thích trong báo cáo, không bỏ qua.
   - So với bản đã duyệt nếu cần: `scripts/compare.sh <new.mp4> <ref.mp4> sheet.png <frame> …`.
   - `description.txt` có nguồn và credit CC BY (nhạc Commons); bài Pixabay 4–7 có cảnh báo Content ID.
5. **Giao:** mp4 + `<slug>_sheet.png` + `description.txt`. Definition of done ở `AGENTS.md` mục 4.
6. **Báo Dan:** đường dẫn mp4 + description, style giọng + bài nhạc (dòng mới trong `logs/voice_log.md`), số đo QC. Commit `logs/voice_log.md` (không commit `out/`, nhạc, key).

## Giọng đọc: một lần cho mỗi video
**Gemini: đúng một request TTS cho mỗi video. Không gọi TTS để test hay benchmark. Lỗi thì dừng, không retry.** Style rút ngẫu nhiên lần đầu được giữ nguyên. **Không bao giờ gọi lại TTS (hay `--new-voice`) để video dài/ngắn hơn.** Chạy lại từ `tts` với lời không đổi sẽ dùng lại cache. Chỉ dùng `--new-voice` khi Dan yêu cầu rõ.

## Chọn engine TTS (Gemini / Edge)
Thứ tự: `--tts edge|gemini` (CLI) > `script.json → "tts": {"engine": "edge"|"gemini"|"auto"}` > auto. Auto: có `GEMINI_API_KEY` (env hoặc `.env`) → Gemini, y như cũ; không có key → **Edge**. Dòng đầu stage tts in engine + lý do, vd. `tts: engine=edge (no GEMINI_API_KEY -> Edge)` hoặc `tts: engine=gemini (GEMINI_API_KEY set, no engine requested -> Gemini)`. Báo Dan engine nào đã dùng.
- `./dt render <script> --tts edge`: dùng Edge dù có key. `--tts gemini`: bắt Gemini (không có key thì dừng, không tự đổi).
- Edge mặc định `vi-VN-NamMinhNeural`, `rate +10%` (nhịp reel), `pitch +0Hz`, `volume +0%`. Đổi trong script: `"tts": {"engine":"edge","voice":"vi-VN-HoaiMyNeural","rate":"+5%","pitch":"-2Hz","volume":"+0%"}`, hoặc CLI `--voice vi-VN-HoaiMyNeural --rate +5%` (CLI thắng). Danh sách giọng: `python3 -m edge_tts --list-voices`. Tiếng Việt chuẩn: NamMinh (nam), HoaiMy (nữ); `*MultilingualNeural` đọc lơ lớ.
- Edge không có style. `voice.style` khác `random` bị bỏ qua, có in `note`. Edge miễn phí: test thoải mái, lỗi mạng tự thử lại 3 lần. Quy tắc 1 request/video **chỉ áp cho Gemini**.
- Cache Edge theo `edge|voice|rate|pitch|volume|lời`; đổi một tham số là một take mới (vẫn miễn phí). Cache Gemini không đổi.
- Xem trước, không gọi mạng: `python3 scripts/tts.py <script> [--tts edge] --dry-run` (in engine, lý do, cache hit hay sẽ gọi).
- Sau TTS mọi thứ như nhau: whisper căn chữ, mix -14 LUFS / -2 dBTP, giọng hơn nhạc ~21 dB.

## Chạy lại một phần (`--from`)
- Sửa props/sfx/section/overlays (không đổi `say`): `./dt render <script> --from props`
- Chỉ kiểm lại gate: `./dt gate <script>` (hoặc `--from gate` để chạy tiếp mix + describe khi pass)
- Chỉ trộn lại nhạc / đổi bài: `./dt render <script> --from mix`
- Đổi `say`: chạy lại từ đầu (tts). Lời mới nghĩa là một lần TTS mới, rút style mới.
- Chỉ viết lại description: `--from describe`

## Lỗi thường gặp
| Lỗi | Sửa |
|---|---|
| `words.json does not match the script; re-run align` | đã sửa `say` sau align → chạy lại từ `tts` (hoặc `--from align` nếu dùng voice.file) |
| `anchor @x: word not found in this scene` | chữ trong anchor không có trong `say` của cảnh, hoặc whisper nghe khác → đổi anchor sang chữ khác/`#n` |
| `Unknown scene type` | sai `type`, xem `SCENES` trong `remotion/src/Video.tsx` |
| `Gemini requested … but GEMINI_API_KEY is not set` | đặt key, hoặc bỏ `--tts gemini` / dùng `--tts edge` |
| `Edge failed` | mạng chặn `speech.platform.bing.com`; thử lại sau, hoặc dùng Gemini nếu có key |
| Lỗi TTS 401/403/429/5xx (Gemini) | **dừng, không retry** (quota 100 req/ngày dùng chung). Báo lại người điều khiển, kiểm `GEMINI_API_KEY`/quota |
| `music file not found` / mix lỗi | thiếu mp3: `./dt fetch-music` hoặc tải tay Pixabay vào `assets/music/pixabay/` |
| `gate: ❌ FAIL static screen while the voice talks` | cảnh in ra đứng yên ≥ 3 s khi đang đọc: anchor thêm mốc, `kw`, `overlays`, hoặc bật lại autofill; `--from props` |
| Nhạc lấn giọng | **không sửa chuỗi mix**; báo Dan số đo median, chỉ đổi `music.rel` khi Dan đồng ý |

## Caption (karaoke, phân trang)
Caption = karaoke **chip** (mọi theme): mỗi chữ là một chip có nền (`chipBg`/`chipText`). Chữ sắp đọc thì text mờ hơn (`upcomingText`). Chữ đang đọc: nền đổi sang `activeBg`, text sang `activeText`, pop nhẹ (`pop` ~1.06, spring, không rung). Đọc xong thì về chip thường. **Không gạch chân.** Cấu hình ở `theme.json → look.caption`: `font,size,upper,weight,chipBg,chipText,upcomingText,activeBg,activeText,radius,padX,padY,gap,pop`. Size phải để 2 dòng chip lọt dải y 1366–1500 (Anton 50, BVPX/BVPM 44, JBM 38). Chip trên nền tối phải sáng hơn nền để còn thấy. Ước lượng 2 dòng trong `Captions` đã trừ padding + gap của chip.
- Không cuộn liên tục. Mỗi lần hiện **trọn một câu** (theo dấu câu trong script, giữ trong words.json); hết câu thì xoá và hiện câu mới.
- Câu dài hơn 2 dòng được tách tại dấu phẩy / hai chấm thành các cụm trọn vẹn, mỗi cụm hiện nguyên; cụm vẫn quá dài thì chia đều theo từ.
- Trong cụm, từng từ sáng lên theo timing whisper: chip đang đọc đổi sang nền accent + text tương phản, chip đã đọc về bình thường, chip chưa đọc thì text mờ hơn.
- QC: chụp vài frame giữa câu, kiểm tra không quá 2 dòng và đúng font theme.

## Safe zone (kiểm tra UI điện thoại — bắt buộc trong QC)
QC: trích 5 khung (headline, nội dung dày, caption, nút follow, end card) và chạy safezone.py; chữ, caption, nút, handle không được nằm trong vùng đỏ. Hằng số ở `remotion/src/safezone.ts`.
`python3 scripts/safezone.py <frame.png>... -o <dir>` vẽ vùng không được có chữ (đỏ: top y < 290, bottom y ≥ 1500, left x < 60, cột nút x ≥ 880 từ y 700; viền vàng = union template quảng cáo chính thức: top 288, bottom 672, left 120, right 192, rail TikTok x≥780 từ y 840) và đánh dấu ô có chữ (viền cyan). Mỗi frame in số ô có chữ theo vùng và y của chúng; dòng cuối `N frames, K with text in a no-text zone`, exit 1 nếu K > 0. Phải ra 0. Brand, số trang, tab cũng không được nằm trên y 290. `--sheet out.png a_sz.png …` ghép sheet. Vẫn kết luận bằng mắt.

## Kênh
`build_props.py` đọc `channels/<script.channel or dantech>.json` rồi đưa brand vào `props.channel`: wordmark, handle, chữ Follow, tagline/followSub theo theme, và mốc bật/bấm nút Follow lấy từ `ctaInWord`/`ctaPressWord`. Kênh khác thì đổi kênh trong script, không sửa code.
