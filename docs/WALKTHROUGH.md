# Walkthrough end-to-end (2 ví dụ thật trong repo)

## A. Dev explainer: `videos/flutter-mvvm` (theme `tech-explain-cyber`)
1. **Input:** bài học "MVVM trong Flutter" (Flutter Mobile 101). Đây là nguồn, không phải dàn ý.
2. **Một ý lõi:** "MVVM = mỗi dòng code có đúng một chỗ ở", 3 lớp, phụ thuộc một chiều. Bỏ khỏi video: 3 cách lách, 3 triệu chứng dài dòng (để làm video khác).
3. **Hook trực diện:** câu 1 nêu "MVVM trong Flutter", tiêu đề cảnh 1 hiện ngay ở frame 0. `topic` có từ khoá MVVM/Flutter.
4. **Cảnh:** BpLayers (3 lớp) → BpTerm (bằng chứng thật `rg "^import 'package:flutter" lib/domain/` ra rỗng) → BpSpec (đổi vì UI vs vì nghiệp vụ) → BpTree (`lib/domain`, `lib/ui/game/view_model`) → BpTake + CTA Flutter Mobile 101 + "follow Dan Tech". Code/đường dẫn đều lấy từ bài học.
5. Humanizer VI → `python3 scripts/validate_script.py videos/flutter-mvvm/script.json`.
6. `./dt render videos/flutter-mvvm/script.json`: 1 lần TTS Gemini, nhận style. (Máy không có key, hoặc `--tts edge`: dùng Edge miễn phí, giọng NamMinh, không có style. Dòng `tts: engine=…` cho biết engine nào.) Nhạc ghim `sappheiros-perspective` (êm).
7. QC: kết quả ~80 s, -14.0 LUFS, peak -1.9, median 21.5 dB. Sheet + still, safe zone sạch. Sửa layout bằng `--from props`, không tốn TTS.
8. Giao: `out/flutter-mvvm.mp4`, sheet, `description.txt`. Commit script + `logs/voice_log.md`.

Lịch sử cho thấy sai lầm: v1 ~155 s, đặt vấn đề mất nửa video; v2/v3 vẫn mở vòng vo. v4 có hook trực diện, xoay quanh chủ đề, mới được duyệt.

## B. Tin nóng: `videos/openai-vs-apple-glitch` (theme `hot-news-glitch`)
1. **Input:** tin OpenAI–Apple. Mở và đọc nguồn thật, ghi `sources` (tên + URL + ngày). Không bịa số hay quote.
2. Copy schema từ `videos/openai-vs-apple`, đổi `theme` sang `hot-news-glitch`, cảnh mở dùng `GlHeadline`, `out: signal` giữa các cảnh (glitch chỉ ở chuyển cảnh, không chạy liên tục).
3. Câu 1 nêu thẳng tin ("OpenAI vừa phải xuống nước trước Apple"). Mỗi cảnh một ý, câu cuối "follow Dan Tech".
4. Validate → render. Ví dụ này dùng lại giọng đã duyệt (`voice.file`). Video mới thì để `style: random`, 1 lần TTS. Nhạc pool căng, ghim nếu cần re-render ổn định. Lưu ý Content ID cho bài Pixabay.
5. QC: -14.0 LUFS, median 21.0 dB. Contact sheet. `safezone.py` trên headline, cảnh dày, caption, Follow, end card (2 handle).
6. Giao mp4 + sheet + description. Đăng ở đâu, khi nào là việc của người điều khiển bot.

## C. Không có Gemini key: Edge TTS (`videos/flutter-setstate-valuenotifier`)
1. Kiểm trước, không gọi mạng: `env -u GEMINI_API_KEY python3 scripts/tts.py videos/flutter-setstate-valuenotifier/script.json --dry-run` → `tts: engine=edge (no GEMINI_API_KEY -> Edge) · vi-VN-NamMinhNeural rate +10% …`.
2. Render: `./dt render <script> --tts edge` (hoặc chỉ `./dt render <script>` trên máy không có key). Lời không đổi thì lần sau dùng cache (`voice reused from cache … edge`).
3. Kết quả thử 17/10/2026: giọng 53.2 s (Gemini tu-nhien cùng lời: 53.5 s), whisper khớp 166/166 chữ, mix -14 LUFS, median giọng/nhạc ~21 dB. QC như mục A.
4. Đổi giọng nữ: thêm `"tts": {"engine": "edge", "voice": "vi-VN-HoaiMyNeural"}` vào script, hoặc `--voice vi-VN-HoaiMyNeural`.
