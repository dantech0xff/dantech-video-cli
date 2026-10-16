---
name: write-script
description: Viết videos/<slug>/script.json cho video Dan Tech từ một spec (chủ đề/link/ghi chú, theme, độ dài, góc nhìn). Dùng khi Dan muốn làm video mới; nghiên cứu nguồn thật, viết kịch bản tiếng Việt, validate.
---

# write-script

**Input (spec):** chủ đề hoặc link + ghi chú, theme (nếu có), độ dài mục tiêu (mặc định 35–45 s), góc nhìn.
**Output:** `videos/<slug>/script.json` đã qua validate, kèm tóm tắt cho Dan duyệt. **Không render** (đó là skill `render-video`).

## Các bước

1. **Nghiên cứu, kiểm chứng.** Mở và đọc nguồn thật (link Dan đưa, báo lớn, tài liệu chính thức). Mỗi sự kiện, con số, trích dẫn phải lấy từ một nguồn bạn đã đọc. **Không bịa** sự kiện, số liệu, quote hay URL. Thông tin chưa chắc thì bỏ, hoặc ghi rõ "chưa xác nhận" và hỏi Dan.
2. **Chọn theme:** drama/tin → `tin-nong`; mẹo/tool/tutorial/listicle → `meo-nhanh`; code/dev explainer → `commit` (v1, mẫu `videos/git-merge-vs-rebase/`). Nếu spec **không ghi theme**: đề xuất một theme kèm lý do một câu và **chờ Dan xác nhận** trước khi viết. Chỉ khi chạy không tương tác (không ai trả lời được) mới tự chọn, và ghi rõ lý do trong phần tóm tắt.
3. **Tạo slug** dạng kebab-case không dấu (`openai-vs-apple`). Copy mẫu cùng theme:
   - tin-nong: `videos/openai-vs-apple/script.json`
   - meo-nhanh: `videos/android-studio-shortcuts/script.json`
   - commit: `videos/git-merge-vs-rebase/script.json`
   Schema đầy đủ và props từng scene: [SCHEMA.md](SCHEMA.md). Bản khởi đầu: [template.json](template.json).
4. **Viết `say` từng cảnh** (tiếng Việt nói, câu ngắn):
   - **Hook trong 2 giây đầu:** cảnh 1 mở bằng xung đột, con số hoặc câu hỏi ("Vẫn click chuột lục menu…?", "OpenAI vừa xuống nước…").
   - Độ dài: ~3 chữ (âm tiết)/giây → 30 s ≈ 90 chữ, 45 s ≈ 135 chữ. 5–6 cảnh.
   - Câu cuối phải có **"follow Dan Tech"** (nút Follow bật ở "follow", bấm ở "Dan"). Handle do outro lo, không viết vào props.
   - Số và tên riêng viết sao cho TTS đọc đúng.
5. **Props + nhấn nhịp bằng `@chữ`:** chỉ dùng scene type và khoá props trong SCHEMA.md. Mọi mốc xuất hiện (keycap, popup, tick, stamp, sfx) đặt bằng `"@chữ"` của chính cảnh đó, không đếm frame tay. SFX chỉ đặt ở khoảnh khắc có nghĩa (click, pop, stamp), volume 0.35–0.5.
6. **Hình ảnh:** chỉ infographics/UI mockup. **Không có người hay mặt người.** `media` chỉ dùng clip faceless trong `assets/broll/`.
7. **Metadata:** `title`, `date` (ngày hôm nay, dạng `16 · 10 · 2026`), `caption` có hashtag (#DanTech + #TinNong/#MeoNhanh), `sources` đầy đủ (tên + URL + ngày). Credit nhạc do `describe.py` tự thêm. Giữ `"voice": {"style":"random"}`, `"music": {"track":"random"}` (không đặt `voice.file`).
8. **Humanize lời đọc:** áp dụng skill `humanizer` (`.agents/skills/humanizer/SKILL.md`) theo hướng dẫn tiếng Việt ở `.agents/skills/humanizer/VI.md` cho mọi `say`: bỏ sáo rỗng, đối lập giả, bộ ba ép, thổi phồng, filler; giữ văn nói ngắn. Không đổi sự kiện, số, nguồn, câu "follow Dan Tech". Chữ nào bị đổi mà đang được `@anchor` dùng thì cập nhật anchor.
9. **Validate:** `python3 scripts/validate_script.py videos/<slug>/script.json`. Chạy lại sau mỗi lần sửa (kể cả sau bước humanize), đến khi `✅ OK` (cảnh báo về độ dài thì cân nhắc).
10. **Báo Dan:** đường dẫn file, theme, số cảnh, số chữ/thời lượng ước tính, hook, danh sách nguồn, và những điểm chưa chắc chắn.
