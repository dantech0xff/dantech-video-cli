---
name: write-script
description: Viết videos/<slug>/script.json cho video Dan Tech từ một spec (chủ đề/link/ghi chú, theme, độ dài, góc nhìn). Dùng khi Dan muốn làm video mới; nghiên cứu nguồn thật, viết kịch bản tiếng Việt, validate.
---

# write-script

**Input (spec):** chủ đề hoặc link + ghi chú, theme (nếu có), độ dài mong muốn (tuỳ chọn, chỉ để tham khảo), góc nhìn.
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
   - Độ dài: tốc độ phụ thuộc style giọng (đo từ các lần render): **hào hứng ~3.8**, **tự nhiên ~3.1**, **kể chuyện ~2.55** chữ (âm tiết)/giây. `validate_script.py` in ước lượng cho cả 3 style (chỉ để tham khảo). **Rõ ràng trước, độ dài theo nội dung.** Khoảng thường gặp (không phải giới hạn): TIN NÓNG/MẸO ~30–60 s, COMMIT ~50–90 s. Trần cứng duy nhất: 180 s (YouTube Shorts), tính theo style chậm nhất là kể chuyện. Chỉ cắt nội dung thừa hoặc lạc đề, không cắt ý cần để hiểu.
   - Câu cuối phải có **"follow Dan Tech"** (nút Follow bật ở "follow", bấm ở "Dan"). Handle do outro lo, không viết vào props.
   - Số và tên riêng viết sao cho TTS đọc đúng.
5. **Props + nhấn nhịp bằng `@chữ`:** chỉ dùng scene type và khoá props trong SCHEMA.md. Mọi mốc xuất hiện (keycap, popup, tick, stamp, sfx) đặt bằng `"@chữ"` của chính cảnh đó, không đếm frame tay. SFX chỉ đặt ở khoảnh khắc có nghĩa (click, pop, stamp), volume 0.35–0.5.
6. **Hình ảnh:** chỉ infographics/UI mockup. **Không có người hay mặt người.** `media` chỉ dùng clip faceless trong `assets/broll/`.
7. **Metadata:** `title`, `date` (ngày hôm nay, dạng `16 · 10 · 2026`), `caption` có hashtag (#DanTech + #TinNong/#MeoNhanh), `sources` đầy đủ (tên + URL + ngày). Credit nhạc do `describe.py` tự thêm. Giữ `"voice": {"style":"random"}`, `"music": {"track":"random"}` (không đặt `voice.file`).
8. **Humanize lời đọc:** áp dụng skill `humanizer` (`.agents/skills/humanizer/SKILL.md`) theo hướng dẫn tiếng Việt ở `.agents/skills/humanizer/VI.md` cho mọi `say`: bỏ sáo rỗng, đối lập giả, bộ ba ép, thổi phồng, filler; giữ văn nói ngắn. Không đổi sự kiện, số, nguồn, câu "follow Dan Tech". Chữ nào bị đổi mà đang được `@anchor` dùng thì cập nhật anchor.
9. **Validate:** `python3 scripts/validate_script.py videos/<slug>/script.json`. Chạy lại sau mỗi lần sửa (kể cả sau bước humanize), đến khi `✅ OK` (cảnh báo độ dài chỉ xuất hiện khi có thể vượt 180 s).
10. **Báo Dan:** đường dẫn file, theme, số cảnh, số chữ/thời lượng ước tính, hook, danh sách nguồn, và những điểm chưa chắc chắn.

## Code explainer / COMMIT

Video giải thích code phải **dẫn chuyện** để người xem hiểu và ở lại. Người xem chỉ nghe được một lần, nên lời đọc phải tự nó dễ hiểu.

**Mạch truyện (mỗi bước ~1 cảnh):**
1. **Tình huống đau** cụ thể, gọi người xem là "bạn", không có nhân vật: "Thử tưởng tượng bạn mở màn hình game, và onCreate phải tự tạo…"
2. **Câu hỏi** nối sang khái niệm: "Vậy có cách nào để…?"
3. **Gọi tên khái niệm bằng một câu dễ hiểu**: "Đó là X, nghĩa là…"
4. **Giải thích từng bước**, dùng từ nối: *vì vậy, lúc này, nói cách khác, thử tưởng tượng, tức là, thay vì*.
5. **Ví dụ so sánh** (analogy), và **nối ngược lại về code** ("món bạn gọi chính là GameManager").
6. **Một câu chốt** (takeaway).
7. **CTA** nhẹ nhàng, rồi "follow Dan Tech".

**Quy tắc:**
- Câu nói đầy đủ, đúng ngữ pháp. Không viết kiểu ghi chú hay liệt kê từ khoá.
- Định nghĩa mọi thuật ngữ ở lần đầu nhắc tới (IoC, DI, module, single…). Thuật ngữ nào hiện trên hình mà không giải thích được thì bỏ khỏi hình.
- Một ý cho mỗi cảnh. Lời đọc **giải thích thứ đang hiện trên màn hình** (dòng code này làm gì), không chỉ đọc tên nó. Có thể dùng `notes` của `CodeBlock` để chú thích từng dòng.
- Câu cuối của mỗi cảnh **bắc cầu** sang cảnh sau (câu hỏi, "lúc này…", "nói cách khác…").
- Ưu tiên rõ ràng hơn ngắn gọn: độ dài theo nội dung (thường ~50–90 s, không phải giới hạn; trần 180 s). Chỉ cắt câu thừa, lặp ý hoặc lạc đề. **Không bao giờ** cắt từ nối, chủ ngữ hay một bước giải thích chỉ để video ngắn hơn.

**Tự kiểm tra:** đọc to toàn bộ `say` liền mạch, không nhìn hình. Người chưa biết khái niệm có hiểu không? Có chỗ nào phải "nhìn hình mới hiểu" không? Có thuật ngữ nào chưa giải thích không?

**Ví dụ trước / sau:**
- ❌ Kiểu điện tín: "Inversion of Control đảo ngược chuyện đó: tạo object khi nào, ra sao, giờ do framework quyết định."
- ✅ Dẫn chuyện: "Đó là Inversion of Control, nghĩa là đảo ngược quyền kiểm soát. Thay vì code của bạn tự quyết định tạo object lúc nào và tạo ra sao, quyền đó được giao cho framework, ở đây là Koin."
- ❌ "Ba thứ bị đảo ngược: thời điểm tạo, cách khởi tạo, và vòng đời."
- ✅ "Nói cách khác, có ba thứ được đảo ngược: lúc nào tạo object, tạo nó như thế nào, và nó sống bao lâu."
