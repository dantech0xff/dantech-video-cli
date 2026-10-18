---
name: write-script
description: Viết videos/<slug>/script.json cho video Dan Tech từ một spec (chủ đề/link/ghi chú, theme, góc nhìn); video 45–120 s, ý trọn vẹn và mạch lạc; nguồn cần > ~120 s thì dừng xác nhận với người yêu cầu trước khi viết. Dùng khi Dan muốn làm video mới; nghiên cứu nguồn thật, viết kịch bản tiếng Việt, validate.
---

# write-script

**Input (spec):** chủ đề hoặc link + ghi chú, theme (nếu có), góc nhìn.
**Output:** `videos/<slug>/script.json` đã qua validate, kèm tóm tắt cho Dan duyệt. **Không render** (đó là skill `render-video`).

## Các bước

0. **Ước lượng độ dài và kiểm tính trọn vẹn (làm TRƯỚC khi viết).** Xem mục "Độ dài 45–120 s, ý phải trọn vẹn". Ước lượng lời đọc cần để kể **trọn** ý (vấn đề → giải thích/giải pháp → payoff) ở ≈ 3 chữ/giây (45–120 s ≈ 135–360 chữ). Cần > ~120 s → **dừng, xác nhận với người yêu cầu** theo 3 phương án ở mục đó, chưa viết.
1. **Nghiên cứu, kiểm chứng.** Mở và đọc nguồn thật (link Dan đưa, báo lớn, tài liệu chính thức). Mỗi sự kiện, con số, trích dẫn phải lấy từ một nguồn bạn đã đọc. **Không bịa** sự kiện, số liệu, quote hay URL. Thông tin chưa chắc thì bỏ, hoặc ghi rõ "chưa xác nhận" và hỏi Dan.
2. **Chọn theme:** drama/tin → `hot-news` (báo in sáng) hoặc `hot-news-glitch` (nền tối, glitch tín hiệu vỡ, mẫu `videos/openai-vs-apple-glitch/`); mẹo/tool/tutorial/listicle → `quick-tips`; code/dev explainer → `tech-explain` (editor sáng/vàng, mẫu `videos/git-merge-vs-rebase/`) hoặc `tech-explain-cyber` (blueprint tối, lime, mẫu `videos/flutter-mvvm/`); video chỉ cho dev Android (Kotlin, Compose, lifecycle, Android API) → `android-tutor` (mẫu `videos/compose-remember-saveable/`); video chỉ cho dev Flutter (widget, state, Dart, API Flutter) → `flutter-tutor` (🧪 chờ duyệt, mẫu `videos/flutter-setstate-valuenotifier/`). Flutter kiến trúc/sơ đồ tổng quát vẫn có thể dùng `tech-explain-cyber`. Video cho fanpage khách hàng LOOT CRYPTO (crypto: tin, phân tích coin, kiến thức, ví/bảo mật, giá/on-chain) → `loot-crypto` (🧪 chờ duyệt, mẫu `videos/loot-vi-nong-vi-lanh/`, kênh tự lấy từ theme: CTA "theo dõi Loot Crypto"; xem SCHEMA "Theme loot-crypto" cho luật nội dung tiền). Video cho fanpage khách hàng **Duoly in Love** (tình yêu, cặp đôi, hẹn hò, kỷ niệm, yêu xa, quiz cặp đôi) → `duoly` (🧪 chờ duyệt, mẫu `videos/duoly-demo/`, giọng nữ Edge HoaiMy tự lấy từ theme, CTA "theo dõi Duoly"; xem SCHEMA "Theme duoly" cho luật brand: không nhắc app, không link). Nếu spec **không ghi theme**: đề xuất một theme kèm lý do một câu và **chờ Dan xác nhận** trước khi viết. Chỉ khi chạy không tương tác (không ai trả lời được) mới tự chọn, và ghi rõ lý do trong phần tóm tắt.
3. **Tạo slug** dạng kebab-case không dấu (`openai-vs-apple`). Copy mẫu cùng theme:
   - hot-news: `videos/openai-vs-apple/script.json`
   - hot-news-glitch: `videos/openai-vs-apple-glitch/script.json`
   - quick-tips: `videos/android-studio-shortcuts/script.json`
   - tech-explain: `videos/git-merge-vs-rebase/script.json`
   - tech-explain-cyber: `videos/flutter-mvvm/script.json`
   - android-tutor: `videos/compose-remember-saveable/script.json`
   - flutter-tutor: `videos/flutter-setstate-valuenotifier/script.json`
   - loot-crypto: `videos/loot-vi-nong-vi-lanh/script.json`
   - duoly: `videos/duoly-demo/script.json`
   Schema đầy đủ và props từng scene: [SCHEMA.md](SCHEMA.md). Bản khởi đầu: [template.json](template.json).
4. **Viết `say` từng cảnh** (tiếng Việt nói, câu ngắn):
   - **Hook trực diện:** câu đầu cảnh 1 nêu thẳng chủ đề trong ~3 s (xem mục "Hook trực diện"), có thể kèm xung đột/con số. Đặt vấn đề tối đa 2 câu. Một ý lõi.
   - Câu nói đầy đủ, có từ nối. Code/lệnh chỉ lấy từ nguồn.
   - Độ dài: **45–120 s lời đọc** (≈ 135–360 chữ), khoảng 1 cảnh mỗi 7–10 s. Trong khoảng đó, ý phải trọn vẹn và rõ ràng: cắt câu thừa, không cắt từ nối hay bước giải thích. `validate_script.py` in ước lượng theo từng giọng và **⚠️ khi < 45 s hoặc > 120 s** (và khi cảnh trung bình < ~5 s). Cố ý dài hơn 120 s (đã xác nhận) → `"long_ok": true`; cố ý ngắn hơn 45 s (teaser, đã xác nhận) → `"short_ok": true`; ghi lý do trong báo cáo.
   - Câu cuối phải có **`ctaPhrase` của kênh** (`channels/<id>.json`, mặc định `dantech`: "follow Dan Tech"; nút Follow bật ở `ctaInWord`, bấm ở `ctaPressWord`). Kênh khác thì đặt `"channel": "<id>"`. Handle do outro lo, không viết vào props.
   - Số và tên riêng viết sao cho TTS đọc đúng.
   - **Logo thương hiệu: tự động, không khai báo gì.** Cứ gọi đúng tên sản phẩm (Postiz, Grok Bot, Docker…) trong lời và nhãn; engine tự phát hiện, tự lấy logo chính thức và đặt cạnh tên (DataFlow/Layers/Table/BeforeAfter/Specs/VersusHook) hoặc bằng brand chip (SCHEMA "Logo thương hiệu tự động"). Muốn logo cạnh tên thì để tên trong nhãn của các scene đó. Tắt: `"brands_off": true`, `"brands_skip": ["X"]`, hoặc cảnh `"brands": false`. Đừng bịa nhãn chỉ để có logo, và đừng thêm tên thương hiệu vào chỗ lời không nói tới.
5. **Props + nhấn nhịp bằng `@chữ`:** chỉ dùng scene type và khoá props trong SCHEMA.md. Mọi mốc xuất hiện (keycap, popup, tick, stamp, sfx) đặt bằng `"@chữ"` của chính cảnh đó, không đếm frame tay. SFX chỉ đặt ở khoảnh khắc có nghĩa (click, pop, stamp), volume 0.35–0.5.
   - **Nhịp hình (visual beats):** trải anchor đều suốt `say`, đừng dồn về cuối cảnh. Beat đầu trong ~15 chữ đầu (prop hiện sẵn từ frame 0 cũng tính; SFX một mình **không** tính, vì màn hình không đổi); không đoạn nào > ~26 chữ (~8 s) mà màn hình đứng yên; beat cuối phải cách đuôi cảnh ≥ ~3 chữ (~1 s) — hiện mà chưa kịp đọc đã chuyển cảnh thì coi như không có, neo sớm hơn (đầu mệnh đề cuối) hoặc bỏ. Nếu cảnh nói dài mà không có prop tương ứng: chia prop thành nhiều mốc (vd `AtSteps`: hàng hiện ở `at`, tick xanh ở `ok`), đổi sang scene type đúng loại nội dung (thủ tục/checklist → `AtSteps`, `Checklist`, `BpSpec` chứ không ép vào card code), hoặc bớt câu. `validate_script.py` **FAIL** khi vi phạm các nhịp này — không phải cảnh báo, phải sửa mới render được.
   - **Hình theo nghĩa, không chỉ theo giờ:** mỗi câu `say` phải có thứ tương ứng trên màn hình. Câu liệt kê N mục → scene type phải liệt kê được (vd câu "cần A, B và C" không được đi kèm hình "A vs B" tĩnh). Một cảnh nói hai ý mà hình chỉ vẽ được một → **tách cảnh ngay ranh giới câu**: chia `say` thành 2 cảnh không đổi lời đọc, không tốn TTS, chỉ khác `type`/`section`/props.
   - **Lời nói và chữ trên màn hình cùng một ý:** dòng chữ to (vd `line` của AtHook) phải nói đúng điều câu `say` đang nói, không phải một slogan khác ("Setup đúng một lần là đủ" trên câu "Android máy nào cũng được, iOS cần Mac" là lệch). Lệnh shell (`adb`, `kdoctor`, `java -version`) đặt trong `AtTerm`, không giả làm dòng Logcat.
   - **Overlay, `kw`, glossary, autofill** (SCHEMA "Universal overlays"): **mọi script có `glossary` với 3–6 thuật ngữ chính** (gloss ngắn ≤ 70 ký tự, đúng nguồn; **thuật ngữ đã có trong [glossary.json](glossary.json) thì copy nguyên văn gloss chuẩn**, thuật ngữ mới đã được Dan duyệt thì thêm vào file đó để video sau dùng lại; validator ⚠️ khi gloss khác bản chuẩn): autofill chỉ hiện term chip cho từ có gloss ở đây, không có thì không chip. Con số đáng làm thẻ → khai báo trong `numbers` của cảnh (`[{"n":"36","label":"compileSdk"}]`, label bắt buộc; số không khai báo không bao giờ thành thẻ; số đã hiện trên màn hình thì autofill focus phần tử đó thay vì chèn thẻ). Chip / sơ đồ 2–3 hộp → `overlays` neo vào chữ; item hay dòng code sẽ được nhắc lại trong lời → `kw`. Autofill (mặc định bật) lấp phần còn trống > 2.5 s; đọc log `autofill:` sau `--from props` và sửa script nếu filler chọn sai ý. Cảnh cố ý đứng yên (quote cần đọc) → `"still": true`, gate miễn tối đa 5 s, dài hơn vẫn fail (dùng hiếm). Chỉ đặt `autofill:false` khi có lý do (ghi vào báo cáo); gate sau render vẫn bắt buộc pass.
   - **Viết gloss cho thuật ngữ CHƯA có trong [glossary.json](glossary.json)** (validator in `ℹ️ glossary cần duyệt: …`):
     1. **Đúng kỹ thuật ở phần lõi**; không rút gọn tới mức sai.
     2. **Tiếng Việt tự nhiên, có chủ ngữ rõ**, không dịch từng chữ.
     3. **Không thu hẹp nghĩa**, và phải khớp điều lời đọc của video đó nói.
     4. **≤ 70 ký tự**, vừa 2 dòng trên thẻ term.
     5. **Thuật ngữ mới phải được liệt kê trong báo cáo render** (term + gloss) để người dùng duyệt; chỉ thêm vào `glossary.json` sau khi được duyệt. Không bao giờ đưa gloss chưa duyệt vào file chuẩn.
     | ❌ Trước | ✅ Đã duyệt | Lỗi |
     |---|---|---|
     | JDK: "bộ công cụ Java để Gradle build và chạy Kotlin" | "bộ công cụ Java; Gradle cần nó để chạy và build project Kotlin" | sai kỹ thuật (JDK không "chạy Kotlin") |
     | ValueListenableBuilder: "widget chỉ build lại khi ValueNotifier nó nghe đổi giá trị" | "widget chỉ dựng lại phần builder khi giá trị ValueNotifier đổi" | dịch từng chữ, lủng củng; thiếu ý chỉ phần builder dựng lại |
     | emulator: "máy Android ảo chạy ngay trên laptop" | "máy Android ảo chạy ngay trên máy tính" | thu hẹp nghĩa (máy bàn cũng chạy được) |
   - **Chọn scene theo loại nội dung** (scenario packs, chạy ở mọi theme, props ở SCHEMA "Scenario packs"):
     | Nội dung | Scene khuyến nghị |
     |---|---|
     | So sánh A vs B | `VersusHook` mở → `Table` (2 cột, `win`) / `Meter` (số đo) → `Scale` (kết luận nghiêng) |
     | Setup / cài đặt / yêu cầu | `Steps`, `Terminal`, `Packages`, `Specs`, `Devices` |
     | Giải thích khái niệm / kiến trúc | `DataFlow` (luồng dữ liệu), `Layers` (phân tầng), `Loop` (vòng đời / vòng lặp) |
     | Debug / sửa lỗi | `Debug` (lỗi → dòng thủ phạm → fix → kết quả), thêm `Terminal` nếu cần chạy lệnh |
     | Tin tức | `VersusHook`/headline → `Timeline` (diễn biến), `BigStat` (con số, có `src`), `QuoteCard` (trích dẫn, có thể `still`) |
     | Mẹo / review | `BeforeAfter`, `Rating`, `TopN` |
     Dùng scene riêng của theme khi nó khớp hơn (vd `AtCode`, `FlTree`, `Checklist` của hot-news; Quote/Evidence cũ nay là alias của QuoteCard/BigStat); pack là mặc định khi theme chưa có scene cho ý đó.
   - **Cảnh báo validator là bắt buộc xử lý:** mọi `⚠️` (nhất là nhịp hình) phải được sửa hoặc giải thích rõ trong báo cáo cho Dan — không bỏ qua lặng lẽ. Lỗi nhịp hình (❌) thì script không pass được, bắt buộc sửa.
6. **Hình ảnh:** chỉ infographics/UI mockup. **Không có người hay mặt người.** `media` chỉ dùng clip faceless trong `assets/broll/`.
7. **Metadata:** `title`, `date` (ngày hôm nay, dạng `16 · 10 · 2026`), `caption` có hashtag (#DanTech + #TinNong/#MeoNhanh), `sources` đầy đủ (tên + URL + ngày). Credit nhạc do `describe.py` tự thêm. Giữ `"voice": {"style":"random"}`, `"music": {"track":"random"}` (không đặt `voice.file`).
8. **Humanize lời đọc:** áp dụng skill `humanizer` (`.agents/skills/humanizer/SKILL.md`) theo hướng dẫn tiếng Việt ở `.agents/skills/humanizer/VI.md` cho mọi `say`: bỏ sáo rỗng, đối lập giả, bộ ba ép, thổi phồng, filler; giữ văn nói ngắn. Không đổi sự kiện, số, nguồn, câu "follow Dan Tech". Chữ nào bị đổi mà đang được `@anchor` dùng thì cập nhật anchor.
9. **Validate:** `python3 scripts/validate_script.py videos/<slug>/script.json`. Chạy lại sau mỗi lần sửa (kể cả sau bước humanize), đến khi `✅ OK`, không còn cảnh báo độ dài (< 45 s / > 120 s / cảnh quá vụn) trừ khi `long_ok` / `short_ok` đã được xác nhận.
10. **Báo Dan:** đường dẫn file, theme, số cảnh, số chữ/thời lượng ước tính, hook, danh sách nguồn, và những điểm chưa chắc chắn.

## Độ dài 45–120 s, ý phải trọn vẹn (retention = giá trị thật)

Mục tiêu: người xem nhận **giá trị thật**, không chán, xem tới cuối. Kịch bản là trọng tâm của repo này.

**Điều kiện tiên quyết: ý trọn vẹn, mạch lạc.** Mỗi video là một câu chuyện hoàn chỉnh: **vấn đề → giải thích / giải pháp → payoff**. Không bao giờ là một đống ý rời rạc. Đừng cắt tới mức các ý đứt mạch (bản teaser 31 s của bài Flutter SDK là ví dụ: hé lộ vài nhịp nhưng không giao giá trị trọn); cũng đừng nhồi cả bài học (bản 117 s, 12 cảnh, kể lại từng mục).

**Tự kiểm trước khi validate:**
- Người xem có nói lại được **một câu** "mình vừa học được gì" không?
- Mỗi cảnh có **nối** vào cảnh sau không (từ nối, nguyên nhân → kết quả), hay chỉ đặt cạnh nhau?
- Có **payoff** không: điều hook hứa có được giao, rõ ràng, trước khi video kết thúc?

**Độ dài:**
- Tốc độ đo từ render thật (`logs/voice_log.md` + `out/words.json`): Edge NamMinh +10% ≈ **3.0 chữ/giây** (341 chữ → 113.5 s), Gemini `tu-nhien` ≈ 3.1, `hao-hung` ≈ 3.8, `ke-chuyen` ≈ 2.55 (chữ = từ tách bằng dấu cách).
- **Khoảng mặc định: 45–120 s lời đọc ≈ 135–360 chữ**, cộng end card. Độ dài đến từ nội dung cần để ý trọn vẹn, không phải từ dẫn dắt hay kể lại cả nguồn.
- Khoảng **1 cảnh mỗi 7–10 s** (60 s ≈ 6–9 cảnh, 120 s ≈ 12–17 cảnh). Không có trần cứng; validator chỉ ⚠️ khi cảnh trung bình < ~5 s (quá vụn).

**Nguồn cần > ~120 s → DỪNG và xác nhận trước khi viết.** Gửi người yêu cầu ước lượng (giây) và 3 lựa chọn, rồi chờ:
  - **(a) Rút gọn theo một hướng cụ thể:** nêu rõ giữ gì, bỏ gì (vd "chỉ cài SDK + đọc flutter doctor, bỏ phần chọn thiết bị", ~80 s).
  - **(b) Chia thành nhiều video**, mỗi video **tự đứng được và trọn vẹn** (có vấn đề, giải pháp, payoff riêng); liệt kê từng tập kèm promise + ước lượng giây.
  - **(c) Hỏi mục đích / mục tiêu của video** (dạy trọn một kỹ năng, kéo người xem về khoá học, trả lời một lỗi hay gặp…) để quyết định giữ gì.
  Chỉ khi không ai trả lời được (chạy không tương tác) mới tự chọn một mặc định hợp lý (thường là (a) theo ý có giá trị nhất cho người mới) và ghi rõ lý do trong báo cáo.

**Luật giữ chân người xem (vẫn áp dụng):**
- **Hook trong 3 s**, đúng **một promise rõ ràng**; mọi câu sau phục vụ promise đó, câu nào bỏ đi mà promise vẫn được giao thì cắt.
- **Payoff không để dành:** giao ngay khi người xem đủ bối cảnh, không kéo dài để giữ người xem.
- **Không liệt kê dài bằng lời:** tối đa ~3 mục mỗi câu liệt kê; nhiều hơn thì gom nhóm, chọn mục quan trọng, hoặc tách cảnh có hình liệt kê.
- **Không filler:** không câu dẫn chung chung, không lặp ý, không tóm tắt lại thứ vừa nói.
- Video cố ý dài hơn 120 s (đã xác nhận) → `"long_ok": true`; cố ý ngắn hơn 45 s (vd teaser, đã xác nhận) → `"short_ok": true`. Validator khi đó không cảnh báo phía tương ứng.

## Xoay quanh chủ đề (topic-centric)

Dựng script quanh **sợi chỉ xuyên suốt của chủ đề**, không theo cấu trúc của nguồn hay ví dụ mở đầu của nó. **Không bao giờ thừa hưởng phần mở bài của bài học** (vd bài MVVM mở bằng setState, thì video MVVM không mở bằng setState).

- Trước khi viết, ghi một câu "sợi chỉ" (vd "MVVM chia app thành ba lớp phụ thuộc một chiều, nên project dễ test, dùng lại và dễ đọc"). Mọi cảnh phải phục vụ câu đó; cảnh nào không phục vụ thì bỏ.
- Thứ tự cảnh đi theo logic của chủ đề (là gì → vì sao mạnh → bằng chứng → lợi ích → cách áp dụng → chốt), không theo thứ tự mục trong bài.
- Mỗi cảnh mở bằng từ nối nối với cảnh trước (*nhờ vậy, và chính điều đó, trong project, tóm lại*).
- Chỉ dùng code / lệnh / đường dẫn **có thật trong nguồn**; không bịa kiểu dữ liệu, tên file hay chữ ký hàm.

## Hook theo nội dung (áp dụng MỌI theme)
Hook do **nội dung input** quyết định, không do theme. Bước đầu tiên: phân loại input rồi điền khối `hook` trong `script.json` (validator kiểm theo `hook.kind`, không theo theme id):

| `hook.kind` | Input | Giây 0–1 (nói **và** chữ to trên màn hình) | Giây 1–3 | Bắt buộc |
|---|---|---|---|---|
| `controversy` / `news` | tin, drama, tranh chấp | **claim cụ thể**: ai vs ai + vì sao | **2 phe cụ thể** (Phe A vs Phe B) để người xem ở lại chọn | `claim`, `sides` (2), `payoff` + scene `"payoff": true` |
| `explainer` | khái niệm, code | nêu thẳng chủ đề (xem "Hook trực diện") | vì sao nó quan trọng / nỗi đau cụ thể | `claim`, `why` |
| `tips` | mẹo, tool | kết quả người xem nhận được | cái giá của cách cũ | `claim`, `promise` |
| `story` | kể chuyện | khoảnh khắc gay cấn nhất | bối cảnh 1 câu | `claim` |

Quy tắc chung:
- **Hook lấy từ câu chuyện thật.** Claim, phe, payoff đều phải có trong nguồn. Không bịa clickbait. (Ví dụ nhà phân tích gợi ý "chuyện đặt tên App Store" là **sai** với vụ này nên không dùng.)
- **Không mở bằng câu hỏi chung chung** ("Anh em đứng về phía nào?", "Merge hay rebase?"). Câu hỏi bình chọn chỉ đặt **sau khi đã có bối cảnh**, ở cảnh cuối.
- **Payoff phải được giao:** hứa "Cuối video…" thì scene gần cuối phải nói đúng điều đó, đánh dấu `"payoff": true`, và đừng lộ trước ở cảnh giữa.
- `sides` là **lập trường người xem có thể chọn**, bám vào sự kiện thật. Nếu gán lời cho một bên ("OpenAI nói…") thì phải có nguồn.
- Hình: claim to ở frame 0, hai phe hiện trong 1–3 s. Scene chung **VersusHook** dùng được với mọi theme (xem SCHEMA).

Ví dụ thật (`videos/openai-vs-apple-glitch`, reel cũ: chỉ 36.7% xem qua 3 s, xem TB 6 s/33 s):
- ❌ Cũ: "OpenAI vừa phải xuống nước trước Apple!" (không rõ ai kiện ai, vì sao) … rồi cuối mới hỏi "Anh em nghĩ ai đúng?" mà không có phe cụ thể, không có payoff.
- ✅ Mới: "Apple kiện OpenAI vì 14 cựu nhân viên, OpenAI đã xuống nước. Phe Apple: bí mật thương mại phải được bảo vệ. Phe OpenAI: nhân tài có quyền nhảy việc. Cuối video là thứ OpenAI phải giao nộp cho Apple." Payoff giao ở cảnh 5 ("Và đây là thứ mình hứa: … bản sao pháp lý ổ cứng của cả mười bốn nhân viên"). Poll ở cảnh cuối, sau khi đã đủ dữ kiện.

## Không đọc cấu trúc kịch bản (no meta signposting)
Lời đọc kể **nội dung**, không kể **kịch bản**. Không nói ra cấu trúc: "như đã hứa", "đây là thứ mình hứa", "đây là phần quan trọng", "giờ bạn đã đủ thông tin/dữ kiện", "cuối cùng là", "tiếp theo chúng ta sẽ", "phần 1/2/3", "hãy cùng tìm hiểu". Nói như YouTuber kể cho bạn nghe.
- **Payoff = nói thẳng sự việc.** Đừng báo trước là sắp tới payoff.
- **Tease ở đầu** phải nghe như lời nói tự nhiên ("Mà OpenAI còn phải giao nộp một thứ nữa, để cuối mình kể."), không như mục lục ("Cuối video là thứ…").
- **Poll = câu hỏi tự nhiên bám vào câu chuyện**, gắn với hai phe. Không dùng "phe A hay phe B?" khô khốc.
- Tránh văn viết khi đọc: dấu hai chấm liệt kê ("Phe Apple: …"), "cụ thể," mở câu, "phát triển sản phẩm" (nói "làm sản phẩm").

| ❌ Meta / máy móc | ✅ Tự nhiên |
|---|---|
| Và đây là thứ mình hứa: OpenAI phải giao bản sao pháp lý ổ cứng… | Không chỉ vậy, OpenAI còn phải giao nộp bản sao pháp lý ổ cứng của cả mười bốn người này. |
| Giờ anh em đã đủ dữ kiện: phe Apple hay phe OpenAI? | Anh em thấy sao, Apple kiện vậy là đúng, hay OpenAI chỉ đang tuyển người giỏi thôi? |
| Cuối video là thứ OpenAI phải giao nộp cho Apple. | Mà OpenAI còn phải giao nộp một thứ nữa, để cuối mình kể. |
| Phe Apple: bí mật thương mại phải được bảo vệ. Phe OpenAI: … | Người bênh Apple bảo bí mật thương mại phải được giữ, người bênh OpenAI thì nói nhân tài có quyền nhảy việc. |
| Cụ thể, Apple cáo buộc… | Chuyện là Apple cáo buộc… |

Validator cảnh báo các cụm meta phổ biến. Danh sách không đủ hết, nên vẫn phải đọc to để tự kiểm.

## Hook trực diện (direct hook)

Trong 3 giây đầu, người xem phải biết **video nói về chủ đề gì** (vd "MVVM trong Flutter"). Không dẫn vòng, không "thử tưởng tượng…" trước khi gọi tên chủ đề.

- **Câu đầu tiên của cảnh 1 gọi tên chủ đề rõ ràng**, ngắn: ≤ ~10–12 từ (~3 giây đọc).
- Sau đó đặt vấn đề **tối đa 2 câu**, rồi vào ý chính.
- **Chữ trên màn hình cảnh 1** (`title`) cũng hiện chủ đề ngay (vd "MVVM trong Flutter").
- Khai báo `"topic": ["MVVM","Flutter"]` trong script.json: `validate_script.py` cảnh báo nếu câu đầu không chứa các từ khoá này hoặc dài quá 12 từ.

**Ví dụ:**
- ❌ "setState chỉ ổn khi app có đúng một màn hình." (chưa biết video nói về MVVM)
- ❌ "Thử tưởng tượng bạn đang làm một mini game cờ caro bằng Flutter…" (dẫn vòng)
- ✅ "Vì sao app Flutter cần MVVM? Vì setState chỉ ổn khi app có đúng một màn hình."
- ❌ "Thử tưởng tượng bạn mở màn hình game, và hàm onCreate phải tự tạo bốn object…"
- ✅ "Inversion of Control trong Koin: vì sao bạn không nên tự new object?"
- ✅ "Git rebase hay merge? Đây là khác biệt thật sự."

## Bài học = nguồn, không phải dàn ý

Khi spec là một bài học (khoá học của Dan, doc, bài blog), đó là **nguyên liệu**, không phải dàn ý để kể lại từng phần. Dan feedback mvvm_v1: dài dòng, phần đặt vấn đề chiếm 4 cảnh, gần nửa video, không ai xem tới cuối.

- **Một ý cốt lõi cho mỗi video.** Bỏ các ý phụ; chúng thành chủ đề video khác (liệt kê "chủ đề gợi ý tiếp theo" trong báo cáo cho Dan).
- **Hook trực diện** (xem mục trên): câu đầu gọi tên chủ đề, rồi đặt vấn đề **tối đa 2 câu (~5–8 giây)**, rồi vào thẳng ý chính.
- **Cắt mọi câu mà bỏ đi người xem vẫn hiểu.** Không kể lại hết mọi ví dụ, mọi phương án, mọi triệu chứng trong bài; chọn một cái mạnh nhất hoặc gói thành một câu.
- Vẫn giữ câu đầy đủ và từ nối. **Ngắn gọn ≠ điện tín.**
- **Khung gợi ý cho explainer:** hook 1–2 câu → khái niệm cốt lõi → một bằng chứng / ví dụ cụ thể → takeaway + CTA.
- Khoảng 45–120 s (mục "Độ dài 45–120 s, ý phải trọn vẹn"); độ dài phải đến từ **nội dung thật** cần để ý trọn vẹn, không phải từ phần dẫn dắt hay từ việc kể lại cả bài.

**Tự kiểm tra:** người đang lướt feed có ở lại quá giây thứ 3 không, và tới giây thứ 8 đã biết vì sao mình đang xem chưa?

**Ví dụ trước / sau (mở đầu MVVM):**
- ❌ v1 (4 cảnh, ~75 giây trước khi tới MVVM): "Thử tưởng tượng bạn đang làm một mini game cờ caro bằng Flutter. Toàn bộ bàn cờ và lượt chơi nằm trong một StatefulWidget… Rồi một ngày có yêu cầu mới… Lúc này có ba cách chữa cháy quen thuộc… Cách một… Cách hai… Cách ba… Cả ba cách đều chung một nguyên nhân, lộ ra qua ba triệu chứng…"
- ✅ v2 (2 câu, ~7 giây; v3 thêm câu gọi tên chủ đề ở đầu, xem Hook trực diện): "setState chỉ ổn khi app có đúng một màn hình. Thêm màn kết quả cần người thắng và bàn cờ cuối, là dữ liệu đó bị kẹt trong một State private của màn game." Rồi một câu bắc cầu: "Truyền qua constructor hay giữ tham chiếu tới State chỉ là chữa cháy, vì vấn đề thật là code đang nằm sai chỗ." → vào MVVM.

## Code explainer / GIẢI THÍCH

Video giải thích code phải **dẫn chuyện** để người xem hiểu và ở lại. Người xem chỉ nghe được một lần, nên lời đọc phải tự nó dễ hiểu.

**Mạch truyện (mỗi bước ~1 cảnh):**
1. **Tình huống đau** cụ thể, gọi người xem là "bạn", không có nhân vật: "Thử tưởng tượng bạn mở màn hình game, và onCreate phải tự tạo…"
2. **Câu hỏi** nối sang khái niệm: "Vậy có cách nào để…?"
3. **Gọi tên khái niệm bằng một câu dễ hiểu**: "Đó là X, nghĩa là…"
4. **Giải thích từng bước**, dùng từ nối: *vì vậy, lúc này, nói cách khác, thử tưởng tượng, tức là, thay vì*.
5. **Ví dụ so sánh** (analogy), và **nối ngược lại về code** ("món bạn gọi chính là GameManager").
6. **Một câu chốt** (takeaway).
7. **CTA** nhẹ nhàng, rồi `ctaPhrase` của kênh ("follow Dan Tech").

**Quy tắc:**
- Câu nói đầy đủ, đúng ngữ pháp. Không viết kiểu ghi chú hay liệt kê từ khoá.
- Định nghĩa mọi thuật ngữ ở lần đầu nhắc tới (IoC, DI, module, single…). Thuật ngữ nào hiện trên hình mà không giải thích được thì bỏ khỏi hình.
- Một ý cho mỗi cảnh. Lời đọc **giải thích thứ đang hiện trên màn hình** (dòng code này làm gì), không chỉ đọc tên nó. Có thể dùng `notes` của `CodeBlock` để chú thích từng dòng.
- Câu cuối của mỗi cảnh **bắc cầu** sang cảnh sau (câu hỏi, "lúc này…", "nói cách khác…").
- Ưu tiên rõ ràng hơn ngắn gọn **trong khoảng 45–120 s**: thiếu chỗ thì xác nhận cách cắt (rút gọn theo hướng / chia video / hỏi mục đích), không cắt chữ. Chỉ cắt câu thừa, lặp ý hoặc lạc đề. **Không bao giờ** cắt từ nối, chủ ngữ hay một bước giải thích chỉ để video ngắn hơn. Sau khi render, giữ nguyên giọng đã rút: không viết lại hay gọi lại TTS vì độ dài.

**Tự kiểm tra:** đọc to toàn bộ `say` liền mạch, không nhìn hình. Người chưa biết khái niệm có hiểu không? Có chỗ nào phải "nhìn hình mới hiểu" không? Có thuật ngữ nào chưa giải thích không?

**Ví dụ trước / sau:**
- ❌ Kiểu điện tín: "Inversion of Control đảo ngược chuyện đó: tạo object khi nào, ra sao, giờ do framework quyết định."
- ✅ Dẫn chuyện: "Đó là Inversion of Control, nghĩa là đảo ngược quyền kiểm soát. Thay vì code của bạn tự quyết định tạo object lúc nào và tạo ra sao, quyền đó được giao cho framework, ở đây là Koin."
- ❌ "Ba thứ bị đảo ngược: thời điểm tạo, cách khởi tạo, và vòng đời."
- ✅ "Nói cách khác, có ba thứ được đảo ngược: lúc nào tạo object, tạo nó như thế nào, và nó sống bao lâu."
