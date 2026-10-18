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

## 2026-10-18 · Độ dài 45–120 s, ý phải trọn vẹn (flutter-install-sdk)
- **Chuyện gì:** bản đầu `videos/flutter-install-sdk` nhồi cả bài học (341 chữ, 12 cảnh, 117 s, kể lại từng mục). Hôm đó thử luật 30–45 s và làm `videos/flutter-install-sdk-teaser` (96 chữ, 5 cảnh, voice 31.3 s), nhưng bản đó chỉ hé lộ vài nhịp, ý chưa trọn.
- **Luật đã sửa (thay luật 30–45 s):** engine cho video **45–120 s**. Điều kiện tiên quyết: ý trọn vẹn, mạch lạc (vấn đề → giải thích/giải pháp → payoff), không rời rạc, không nhồi. Ước lượng trước khi viết ở ~3.0 chữ/giây (Edge +10%, đo: 341 chữ → 113.5 s), tức 135–360 chữ, ~1 cảnh mỗi 7–10 s. Cần > ~120 s → dừng, xác nhận với người dùng: (a) rút gọn theo hướng cụ thể, (b) chia nhiều video tự đứng được, (c) hỏi mục đích. Validator ⚠️ khi < 45 s / > 120 s / cảnh trung bình < ~5 s; có chủ đích thì `"short_ok": true` / `"long_ok": true`.
- **Kim chỉ nam:** người xem nhận giá trị thật, không chán, xem tới cuối.

## 2026-10-18 · Ô Table bị đè, focus vào thẻ chưa hiện (postiz-grokbot)
- **Table:** ô thắng (vd `tự do`, `tiền VPS`) được fill phóng chữ tới +30 %, pill (chữ + padding 2×26 px) rộng hơn ô 190 px nên tràn sang trái, che ô thua (`theo gói` bị cắt). Sửa trong `AtTake`: ô `CW = 212` px, pill `maxWidth = CW` + padding 20 px, cỡ chữ tính theo phần còn lại (`CW − 44`, ~0.6 em/ký tự cho chữ Việt đậm); nhãn `k` tự co theo 396 px còn lại.
- **Autofill:** `texts()` chỉ đọc `at` của chính item, nên thẻ phe `a`/`b` của VersusHook (hiện ở `sidesAt` của cảnh cha) bị coi là hiện từ frame 0, và giây 1.4 có một khung focus rỗng. Giờ item con kế thừa mốc hiện từ cha (`<key>At`, `sidesAt` cho `a`/`b`, hoặc `at` của cha).
- **QC safezone:** lấy still ở khung đã đứng yên (cách mốc chuyển cảnh ≥ ~0.8 s). Frame giữa transition `scroll`/`bar` có chữ đang trượt qua vùng cấm là chuyển động có chủ đích, không tính.

## 2026-10-18 · Logo thương hiệu tự động (postiz-grokbot v2)
- **Chuyện gì:** bản v1 video Postiz + Grok Bot không có logo Postiz/Grok Bot. Engine chỉ có FlutterMark viết cứng, SCHEMA cấm hẳn logo bên thứ ba trong overlay.
- **Giờ:** không khai báo gì trong script. `build_props` → `scripts/brands.py` (registry alias + ứng viên động khớp đúng chính tả Simple Icons) → `scripts/brand_logo.py` (Simple Icons → trang chủ chính thức → GitHub org → Wikimedia Commons, kiểm tra vector/≥256 px/nền/tỉ lệ/khớp tên, cache `assets/brand/<slug>/` + `meta.json`) → `remotion/src/brandmark.tsx` (logo trước tên trong nhãn DataFlow/Layers/Table/BeforeAfter/Specs/VersusHook, brand chip ở lần đọc đầu khi cảnh không vẽ được, dòng trademark trên end card).
- **Grok Bot:** không có trong Simple Icons; icon của x.ai là logo công ty mẹ (domain không khớp tên → bị loại đúng). Mark thật nằm trong `<svg class="grok-bot-mark">` do JS vẽ trên x.ai/bot; parser HTML hạ chữ thường `viewBox` nên phải lấy SVG bằng regex trên markup gốc, và ưu tiên đúng class `grok-bot-mark` (cùng trang có các biến thể avatar của từng bot).
- **False positive đã chặn:** `README` khớp "ReadMe" (Simple Icons) nếu so không phân biệt hoa thường → ứng viên động phải trùng đúng chính tả; `X` chỉ nhận khi cùng câu/nhãn có nền tảng xã hội khác; từ có dấu không khớp alias không dấu.
- **Luật thương hiệu (bản đầu, đã thay ngay trong ngày, xem mục dưới):** Flutter không logo khác ở cảnh 1; Android/Apple/Microsoft/LinkedIn/OpenAI `logo:false`. Logo CC BY (Git, Android) chỉ dùng khi registry có `attrib`, dòng ghi công lên end card.

## 2026-10-18 · Hiện mọi logo tìm được (Dan)
- **Quyết định:** bỏ danh sách bỏ qua theo luật thương hiệu (Android, Android Studio, IntelliJ, Apple, macOS, iOS, Xcode, Swift, VS Code, Windows, LinkedIn, OpenAI, Flutter). Mọi logo hãng công nghệ tìm được đều hiện; chỉ bỏ vì chất lượng/độ chắc chắn. Opt-out: `brands_off` / `brands_skip` / cảnh `brands:false`.
- **Nguồn:** Simple Icons đã gỡ VS Code, Windows, LinkedIn, OpenAI theo yêu cầu chủ sở hữu → lấy file Wikimedia Commons cụ thể (registry `commons`). Simple Icons có bản cũ/đơn sắc của IntelliJ, Kotlin, Flutter → lấy asset chính chủ (registry `official`: trang brand JetBrains, flutter.dev; Flutter trùng sha256 với `flutter_logomark.svg`).
- **Bẫy:** trang chủ VS Code có `<img alt="VS Code on Github" src="github-icon.svg">` → fetcher lấy nhầm logo GitHub. Giờ bỏ `<img>` có tên file nói tới thứ khác hoặc alt kiểu "X on/for Y".
- **macOS, iOS:** logo chính thức chỉ là wordmark chữ → bỏ (registry `wordmark`), vì đặt cạnh tên thành "macOS macOS".

## 2026-10-18 · Theme khách hàng đầu tiên: loot-crypto (LOOT CRYPTO)
- **Brand theo kênh:** theme.json `"channel"` là kênh mặc định (build_props + validator), kênh có `logo`/`page`/`disclaimer`, `handles` được rỗng. Không còn chỗ nào trong theme mới in "Dan Tech".
- **Sora không có tiếng Việt** (thiếu ạ/ọ/ệ/ữ, có Đ/à/á nên dễ tưởng là đủ): nhãn tiếng Việt dùng Be Vietnam Pro SemiBold 0.06em, Sora chỉ cho chuỗi Latin (`lab()`).
- **3D tĩnh + trôi chậm** đủ cảm giác studio cao cấp, không tốn render: plate từ three.js headless (tools/loot-3d). Ánh sáng spot hẹp + sàn nhám tối mới ra "product shot"; directional rim làm cảnh phẳng, xanh.
- **Chuyển cảnh quét (`quarter`):** nếu cảnh mới bắt đầu đúng ở mốc, giữa sweep chỉ thấy plate trống → bắt đầu sớm T/2. Overlay focus/squeeze ghi đè transform của wrapper → rotation đi qua `data-pre`.
- **Spotlight focus trên nền ảnh** lộ cạnh hình chữ nhật → `look.softSpot` (mask mờ mép).
- **Nội dung tiền:** disclaimer header tự động trên cảnh giá/biểu đồ/coin/flow, tag MINH HỌA khi không có nguồn, end card luôn có disclaimer.
