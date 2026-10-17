# Learnings từ số liệu thật

## 2026-10 · `openai-vs-apple` (reel 33 s, theme hot-news)
- **Số liệu:** 935 view, chỉ **36.7% xem qua 3 s**, thời gian xem TB **6 s** (khoảng 18%).
- **Chẩn đoán:** câu mở "OpenAI vừa phải xuống nước trước Apple!" không nói ai kiện ai, vì sao. Không có 2 phe để người xem chọn. Không có lý do để ở lại tới cuối. Câu hỏi "Anh em nghĩ ai đúng?" chỉ xuất hiện ở cuối, chung chung.
- **Đổi quy tắc** (write-script "Hook theo nội dung", áp dụng mọi theme):
  1. Giây 0–1: claim gây tranh cãi, **cụ thể**, nói ra và chữ to trên màn hình: ai vs ai + vì sao.
  2. Giây 1–3: hai phe cụ thể (Phe A vs Phe B), scene `VersusHook`.
  3. Hứa payoff ("Cuối video…") và **giao thật** ở cảnh gần cuối (`"payoff": true`).
  4. Câu hỏi bình chọn chỉ đặt sau khi đã có bối cảnh.
- **Cảnh báo:** gợi ý mẫu của nhà phân tích (chuyện đặt tên App Store) **sai sự thật** với vụ này. Hook luôn lấy từ câu chuyện thật trong nguồn, không bịa clickbait.
- **Áp dụng:** `videos/openai-vs-apple-glitch` đã viết lại phần mở (chưa render). Lần render tới sẽ là 1 lần TTS mới vì lời đã đổi.
- **Đo lại:** sau khi đăng bản mới, ghi % qua 3 s và thời gian xem TB vào đây để so.

## 2026-10-18 · Một clip = một ý, 30–45 s (flutter-install-sdk)
- **Chuyện gì:** bản đầu `videos/flutter-install-sdk` nhồi cả bài học (341 chữ, 12 cảnh, 117 s). Layout tốt nhưng Dan: tỉ lệ xem hết quan trọng hơn độ dài; clip 30 s xem hết thắng clip 60 s bị bỏ giữa chừng.
- **Luật:** ước lượng lời đọc trước khi viết (~3.0 chữ/giây Edge +10%, đo: 341 chữ → 113.5 s), ngân sách 30–45 s, ≤ 6–8 cảnh, một promise. Nguồn dài → dừng, đưa phương án (một ý / teaser / series). Validator ⚠️ khi > 45 s hoặc > 8 cảnh; cố ý dài → `"long_ok": true`.
- **Áp dụng:** `videos/flutter-install-sdk-teaser` (96 chữ, 5 cảnh, voice 31.3 s): promise → 3 nhịp hé lộ (doctor ✓ ! ✗, không cần xanh hết, 3 bẫy) → CTA đọc bài 1 miễn phí trên dantech.academy.
