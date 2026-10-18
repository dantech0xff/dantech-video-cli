# Schema script.json (lấy từ code: scripts/build_props.py, tts.py, pick_music.py, remotion/src/*.tsx)

```jsonc
{
 "theme": "hot-news" | "quick-tips" | "tech-explain",   // = thư mục themes/<id>/
 "title": "…",                 // tiêu đề nội bộ / description
 "date": "16 · 10 · 2026",     // hiện trên masthead
 "caption": "… #DanTech #TinNong",
 "sources": ["Tên báo, tiêu đề: https://… (ngày)"],   // bắt buộc, nguồn thật
 "voice": {"style": "random"},          // hoặc "hao-hung" | "ke-chuyen" | "tu-nhien" (style chỉ có ở Gemini); "file" = ghim audio (bỏ qua TTS)
 "tts": {"engine": "auto"},             // tuỳ chọn. "auto" (mặc định: có GEMINI_API_KEY → gemini, không → edge) | "gemini" | "edge"
                                        // Edge: "voice": "vi-VN-NamMinhNeural" (mặc định) | "vi-VN-HoaiMyNeural" | "*MultilingualNeural",
                                        //       "rate": "+10%" (mặc định), "pitch": "+0Hz", "volume": "+0%". CLI --tts/--voice/--rate… thắng script
 "music": {"track": "random"},          // hoặc id trong assets/music/tracks.json, + "start": giây
 "variant": "red",                     // tuỳ chọn: biến thể trong theme.json → variants (GIẢI THÍCH: "red" = accent YouTube đỏ)
 "look": {"accent": "#…"},             // tuỳ chọn: ghi đè màu look cho riêng video (sau variant)
 "channel": "dantech",   // tuỳ chọn: id file channels/<id>.json (brand, handle, nút Follow, ctaPhrase). Mặc định dantech
 "handles": [...],  // tuỳ chọn, KHÔNG nên đặt: mặc định lấy từ channels/<id>.json
 "cta": {"in": "@follow-6", "press": "@Dan", "sub": "…"}, // tuỳ chọn, mặc định từ theme.json → cta
 "scenes": [{
   "say": "Câu giọng đọc nói trong cảnh này.",   // cảnh bắt đầu ở chữ đầu tiên của say
   "type": "<scene template>",
   "section": "DÒNG NHỎ TRÊN ĐẦU",
   "out": "page|bar|zoom|push|stack|morph|scroll",      // chuyển cảnh sang cảnh sau (cảnh cuối bỏ trống)
   "focus": [x, y],                               // tâm zoom khi out = zoom
   "morph": {"from":[x,y,w,h,font],"to":[…],"txt":"14"},  // bắt buộc khi out = morph; toạ độ px màn hình 1080x1920 (hộp nội dung SZ.content: y 340–1359, scale 0.795)
   "props": {…},                                  // theo template bên dưới
   "sfx": [{"at":"@chữ","s":"<file trong assets/sfx, không đuôi>","v":0.5,"every":5,"count":14}]
 }]
}
```

Số trong `props`/`sfx` là frame tính từ đầu cảnh (30 fps). Anchor: `"@chữ"`, `"@chữ#2"`, `"@chữ+4"`, `"@chữ.end"`; chữ phải có trong `say` của **chính cảnh đó** (so khớp bỏ dấu câu, không phân biệt hoa thường).

Độ dài mặc định: **45–120 s lời đọc** (≈ 135–360 chữ ở ~3 chữ/giây), ~1 cảnh mỗi 7–10 s; validator ⚠️ khi < 45 s, > 120 s, hoặc cảnh trung bình < ~5 s (write-script "Độ dài 45–120 s, ý phải trọn vẹn").
- `long_ok` (tuỳ chọn, top-level): `true` = cố ý dài hơn 120 s, đã xác nhận; tắt cảnh báo > 120 s và cảnh báo cảnh quá vụn.
- `short_ok` (tuỳ chọn, top-level): `true` = cố ý ngắn hơn 45 s (vd teaser), đã xác nhận; tắt cảnh báo < 45 s.

- `topic` (khuyến nghị): list từ khoá chủ đề, vd `["MVVM","Flutter"]`; validator kiểm tra câu đầu cảnh 1 có gọi tên chủ đề.

## Scene templates (props, `?` = tuỳ chọn)

TIN NÓNG / GIẢI THÍCH (`remotion/src/scenes.tsx`), mẫu: `videos/openai-vs-apple/script.json`
- `Headline`: kicker, l1, bar, l3, deck?:[s,s], sizes?:[n,n,n]
- `Flow`: n, kick, title, sub, from, to, count, unit
- `Quote`: n, kick, media?, w1, w2, tr, who
- `Checklist`: n, kick, t1, t2?, items:[{s, at, mark?:"x"|"+"|"-"}], stamp?:{at,text,sub}, num?, keys?
- `Evidence`: n, kick, media?, pos?, big, unit, count, label, tag, start
- `CTA`: n, kick, lead, big, opts?, hint?, ctaAt, src?, noFollow?

MẸO NHANH (`remotion/src/meo.tsx`), mẫu: `videos/android-studio-shortcuts/script.json`
- `MeoHook`: clicks[], titleAt, window, menus[], menuItems[], big, l1, l2, keys[], deck
- `MeoSearch`: tip{n,of,title,sub}, keys[{k,at,w?}], times?, window, tabs[], query, popAt, typeAt, results[{icon,label,hint,color,at}]
- `MeoFix`: tip, keys, mac, window, code, insert{line,code}, squig{line,tok}, redAt, popAt, popup[], fixAt, okAt, ok
- `MeoSlowFast`: tip, vsAt, slowLabel, fastLabel, path[], pathClicks[], keys, mac, fastTime, window, before, after, reflowAt, okAt, ok
- `MeoSave`: kicker, title, lead, chips:[[a,b],…]

GIẢI THÍCH (`remotion/src/commit.tsx`), mẫu: `videos/git-merge-vs-rebase/script.json`
- `CmdHook`: cmds:[{s,at}], l1, l2, l3?, titleAt, deck?
- `GitGraph`: mode:"merge"|"rebase", cmd, cmdAt, showAt?, actAt, notes?:[{s,at,mark?:"+"|"-"|"~"}], main?, branch?
- `LogPanes`: n, kick, panes:[{title, cmd, at, lines:[[ [text, "hash"|"graph"|"dim"|"green"|"red"|"yellow"?], … ]], verdict?, good?}]
- `DocRule`: n, kick, src, quote, quoteAt, tr, trAt, bad, badAt, stamp?:{at,text,sub}
- `CommitCTA`: n, kick, rows:[{k,v,at}] (tối đa 2), cmd, cmdAt (nội dung phải ở trên nút Follow, y≈1110)
- `CodeBlock`: n, kick, file, lines:[{s,at}] (Kotlin highlight; ≤ ~36 ký tự/dòng ở size 40), tone?:"bad"|"good", badge?:{text,at}, size?
- `DepGraph`: n, kick, root, deps[] (≤5), depsAt, you, fw, flipAt, q?:[{s,at}]
- `Analogy`: n, kick, cards:[{title, tag, at, steps:[{icon:"basket"|"pan"|"plate"|"menu"|"bell"|"check", label, at}]}] (2 thẻ, icon không mặt người)
- `Inversions`: n, kick, rows:[{k, from, to, at}]
- `KeyPoint`: n, kick, l1, l2, at, chips:[{s,at}], course?:{t1,t2,at} (nằm trên nút Follow)
Mẫu: `videos/inversion-of-control/script.json`.
Chuyển cảnh thêm `scroll` (cuộn theo bậc như terminal), hợp nhất với GIẢI THÍCH.

`media` = file trong `assets/broll/` (chỉ clip không có người). Cấu trúc `code`/`Line`: copy y hệt mẫu.
SFX có sẵn: xem `assets/sfx/SFX_LIST.md` (cta_click, tip_pop, key_click, tick_001, impactPlank_medium_000, whoosh_soft…).

## Theme `tech-explain-cyber` (GIẢI THÍCH CYBER) — scene types
Tất cả có `n`, `cap` (nhãn ngắn có nghĩa), `title` (heading). `at` nhận `@word` anchor.
- **BpCode** `{file, lines:[{s,at}], dim?:{from,to,label,sub?,at,x?}, callout?:{line,text,at}, note?:{s,at}}` — code + ngoặc kích thước + callout. Dòng ≤ ~28 ký tự.
- **BpGraph** `{fw, deps[4], root, consumer, call, at, flowAt, callouts:[{text,at}]}` — sơ đồ blueprint, data flow.
- **SpecCard** `{head, rows:[{k,from,to,at}], foot?}` — from (gạch) → to.
- **BpSpec** `{head, rows:[{k,v,at}], verdict?:{s,at}}` — danh sách triệu chứng/đặc điểm + kết luận.
- **BpReq** `{from, to, items:[{s,at}], lock:{s,at}, flowAt?}` — thẻ yêu cầu + 2 màn hình, dữ liệu bị khoá.
- **BpOptions** `{opts:[{k,why,at,strikeAt}]}` — các phương án bị gạch lần lượt.
- **BpLayers** `{layers:[{k,role,path,at}] (3), depAt, noKnow:{s:"dòng1|dòng2",at}}` — lớp trên→dưới, phụ thuộc một chiều; lớp cuối tô accent.
- **BpTerm** `{cmd, cmdAt, resAt, empty, ok, note?}` — terminal gõ lệnh, kết quả + check.
- **BpTree** `{root, lines:[{s,d,tag?:"MODEL|VIEWMODEL|VIEW",at,hl?}], note?}` — cây thư mục.
- **BpTake** `{cols:[{k,items[],at}] (2), wallAt, rule:{s,at}, course:{t1,t2,at}}` — takeaway + nhắc khoá học (scene cuối, câu có "follow Dan Tech").
Ví dụ: `videos/flutter-mvvm/script.json`. Không hiển thị tên theme; không thêm nhãn trang trí vô nghĩa.

## Theme `android-tutor` (ANDROID TUTOR) — scene types
Canvas rộng 894 như mọi theme, dùng được tới y ~1280 (SZ.content.h). Code dòng bắt đầu bằng `@` viết `"\\@Composable"` (để không bị hiểu là anchor). Dòng code ≤ ~34 ký tự.
- **AtHook** `{tag, a, b, line, why?:{s,at}}`: tag pill (gắn ™ cho "Android" đầu tiên), `a` vs `b` chữ code to ở frame 0, `line` câu chốt, robot trên shape cookie. Dùng cho hook explainer kiểu "X vs Y". Hook controversy/news thì dùng VersusHook.
- **AtCode** `{title, file, lines:[{s,at}], hl?:{from,to,at}, note?:{s,at}}`: card editor (tab file, gutter, gõ từng dòng, highlight dòng from..to, 0-based).
- **AtPreview** `{title, file, lines, hl?, taps:[at], rotateAt, keep, label:"…{n}…", btn, verdict?:{s,at}}`: code (≤ 9 dòng) ở trên, dưới là slot vuông cho điện thoại (xoay không chạm gì) + cột readout bên phải. Title 1 dòng tự co. Mỗi `tap` tăng `{n}`; `rotateAt` xoay máy (activity tạo lại): `keep:false` → n về 0, `keep:true` giữ.
- **AtLogcat** `{title, lines:[{lvl:D|I|W|E, tag, msg, at}], note?:{s,at}}`.
- **AtTake** `{title, head?:[colA,colB], rows:[{k,a,b,at}], rule?:{s,at}}`: hàng pill so sánh, ô bắt đầu bằng "giữ/có/✓" tô xanh, còn lại tô đỏ nhạt.
- **AtSteps** `{title, steps:[{s,at,ok?:at,warn?:at}], note?:{s,at}}`: stepper cho nội dung thủ tục/setup/yêu cầu (không phải code). Hàng trượt vào ở `at` (vòng số, nối với hàng trên bằng thanh dọc, thanh xanh khi bước trên đã xong). **Hàng mới nhất chưa xong là bước đang nói** (viền xanh); hàng cũ chưa xong lùi lại (mờ nhẹ), nên mắt luôn ở đúng chỗ đang đọc. `ok` → vòng xanh + tick pop; `warn` → vòng vàng "!" cho nhánh "nếu không / chưa đủ" (đừng đánh số nhánh như một bước phải làm). Bỏ cả hai = mục chỉ liệt kê. ≤ 3 bước và không note thì title được xuống 2 dòng (to, hợp cảnh mở bài); nhiều hơn thì title 1 dòng tự co. ≤ 6 hàng (validator cảnh báo); chữ ≤ ~2 dòng mỗi hàng.
- **AtTerm** `{title, dir?:"~/app", shell?:"zsh", lines:[{s, at, out?:bool, ok?:at, hl?:at}], note?:{s,at}}`: cửa sổ terminal thật (header "Terminal" + pill `shell · dir`, KHÔNG tab file/gutter). Dòng thường = lệnh: gõ từng chữ sau prompt `$`, con trỏ khối nhấp nháy ở dòng cuối. `out:true` = output thụt vào, chữ mờ; output bắt đầu bằng `#` là comment, `[✓]` đầu dòng tô xanh. `ok` pop ✓ cuối dòng; `hl` tô xanh nguyên dòng output (kết quả cần nhìn, vd `openjdk "21.0.5"`). Mỗi dòng ≤ 28 ký tự (validator cảnh báo). Dùng cho `java -version`, `adb devices`, `kdoctor`, `./gradlew …` thay vì mượn AtCode hay AtLogcat (Logcat chỉ cho log của app).
- **AtPackages** `{title, head?:"SDK Manager", rows:[{s, meta?, at, ok?:at}], note?:{s,at}}`: cửa sổ kiểu SDK Manager. Hàng có checkbox vuông, tick xanh ở `ok` (không có `ok` thì tick ngay ở `at`); `meta` là dòng mono nhỏ dưới tên (phiên bản, "API 36"…). Pill `n/m` góc header đếm số hàng đã tick, đổi nền xanh khi đủ. Dùng cho cài IDE/SDK/plugin/dependency.
- **AtDevice** `{title, devices:[{kind?:"phone"|"mac", name, badge?, at, ok?:at, screen?:[{s, at, on?:bool}]}], note?:{s,at}}`: mỗi thiết bị một thẻ ngang (icon phone/laptop + tên + badge), hiện ở `at`; `screen` = dòng settings trong thẻ (`on:true` → chip ON xanh); `ok` → viền xanh + tick tròn bên phải (không có `ok` thì không vẽ vòng tick). ≤ 3 thiết bị. Dùng cho nơi chạy app, máy thật vs emulator, yêu cầu thiết bị.
- **AtSpec** `{title, tiles:[{big, small, at, ok?:at}], note?:{s,at}}`: lưới 2 cột tile spec to (`17+`, `36`, `KMP`) pop ở `at`, viền + số đổi xanh ở `ok` (hoặc ngay khi pop). `big` ≤ ~6 ký tự tự co; `small` là nhãn ngắn. ≤ 6 tile. Dùng cho recap yêu cầu/specs thay checklist chữ.
- Validator kiểm khoá của từng item cho 5 scene trên (sai khoá như `c`/`pkgs` → ❌), vì khoá sai sẽ render hàng rỗng hoặc làm hỏng render.
- `out: "sharedx"` (mặc định của theme qua `look.defaultOut`): Material shared-axis X như điều hướng activity/fragment Android: cảnh cũ lùi trái 120 px, scale 0.96, mờ dần; cảnh mới trượt vào từ phải 120 px + fade, easing emphasized-decelerate, không bounce, ~470 ms. Không dùng zoom / shape phủ toàn khung cho theme này.

## Theme `flutter-tutor` (FLUTTER TUTOR, 🧪 chờ duyệt) — scene types (`remotion/src/flutter.tsx`)
Canvas rộng 894, dùng được tới y ~1280. Code dùng Google Sans Code (monospace, 0.6 em) fs 30: dòng ≤ ~44 ký tự. Mọi scene có `hero` = chip từ khoá (chữ code, nền Sky): chip này bay sang vị trí chip của cảnh sau khi `out:"hero"` (mặc định theme). Chip ở góc trên trái (to ở FlHook), title ngay dưới.
- **FlHook** `{hero, tag, vs, line, why?:{s,at}, lit?}`: tag (gắn ™ cho "Flutter" đầu tiên, vd `"Flutter™ · State"`) + logomark Flutter nhỏ góc phải, chip `hero` to ở frame 0, "vs `vs`", `line` câu chốt (≤ 2 dòng), `why`, 3 card widget lồng nhau Scaffold → Column → Text; `lit` (frame/@word) làm card Text sáng lên.
- **FlTree** `{hero, title, mode:"setState"|"notifier", taps:[at], readout:{k,at}, note?:{s,at}}`: cây widget kiểu Widget Inspector (Scaffold > AppBar, Column > [Text, ListView, Text 'Đã bấm {n}'], FAB). Mỗi `tap` tăng n và làm widget build lại sáng viền Sky + badge `build()` (lan theo độ sâu): `setState` → cả 7 widget, `notifier` → chỉ ValueListenableBuilder + Text. Readout = số widget build lại. Đây là minh hoạ, ghi rõ trong note/lời.
- **FlCode** `{hero, title, file, lines:[{s,at}], hl?:{from,to,at,label?}, note?:{s,at}}`: card editor Dart (tab file, gutter, gõ từng dòng, `hl` = khung Sky quanh dòng from..to 0-based, `label` pill dưới khung). ≤ 9 dòng.
- **FlStat** `{hero, title, a:{k,v,unit,at}, b:{k,v,unit,at}, note?:{s,at}}`: 2 card số đếm lên (b nổi bật navy + viền Sky).
- **FlTake** `{hero, title, rows:[{k,v,at}], rule?:{s,at}}`: hàng "trường hợp → chọn gì" + rule card. Là cảnh cuối: ≤ 3 hàng để nội dung dừng trên y ~1060 (nút Follow).
- `out: "hero"` (mặc định qua `look.defaultOut`): cảnh cũ đứng yên, cảnh mới fade + nâng 12 px (Curves.fastOutSlowIn, 533 ms), chip `hero` bay theo cung nhẹ (MaterialRectArcTween-like) từ chỗ cũ sang chỗ mới, đổi chữ thì cross-fade chữ. Cảnh không có `hero` (vd VersusHook) thì chỉ cross-fade.

## Theme `hot-news-glitch` (TIN NÓNG GLITCH)
Dùng scene của hot-news (Flow, QuoteCard/Quote, Checklist, BigStat/Evidence, CTA); cảnh mở dùng **GlHeadline** `{kicker,l1,bar,l3,deck[],hits?:[frame|@word]}` (glitch RGB split + cắt lát tại các `hits`). `out: "signal"` = chuyển cảnh tín hiệu vỡ (ngắn). `kick` nên là nhãn có nghĩa (vd "TOÀ ÁN"), không nhãn kiểu báo/trang.

## Khối `hook` (mọi theme, khuyến nghị; validator cảnh báo nếu thiếu)
`"hook": {"kind": "controversy|news|explainer|tips|story", "claim": "...", "sides": ["Phe A…","Phe B…"], "why": "...", "promise": "...", "payoff": "..."}`. Scene giao payoff thêm `"payoff": true`. Xem write-script "Hook theo nội dung".

## Scene chung: VersusHook (dùng được với mọi theme)
**VersusHook** `{kicker?, claim:[dòng…] (2–3 dòng, chữ HOA ngắn), hl?:index dòng nền accent, a:{label,line}, b:{label,line}, sidesAt?:frame|@word, payoff?:string, payoffAt?:frame|@word}`. Claim hiện ngay frame 0 (không fade). Hai thẻ phe + "VS" nảy vào ở `sidesAt` (nên đặt ~1 s, vd `@Phe`). Dòng payoff ▶ hiện ở `payoffAt`. Màu và font lấy từ theme (accent, ink, head/body). Riêng hot-news-glitch có RGB split ngắn khi hai phe xuất hiện. Size chữ tự co theo bề rộng (khung nội dung an toàn 894 px trước khi scale). Ví dụ: `videos/openai-vs-apple-glitch` cảnh 1.

## Universal overlays + autofill (mọi theme; `remotion/src/overlay.tsx`, `scripts/autofill.py`)
Mục tiêu: **giọng đang đọc thì màn hình không bao giờ đứng yên** quá ~2.5 s. 3 lớp:
1. **Lớp 1 autofill** (build_props, sau align): dựng timeline thay đổi hình của từng cảnh (anchor, `*at`, `ok`/`warn`/`hl`, `taps`, `kw`, overlay; **SFX không tính**). Đoạn trống > 2.5 s trong lúc đọc được chèn filler lấy từ chính câu đang đọc, theo thứ tự **focus > number > term chip > progress / diagram**. Filler không bao giờ bịa nội dung: **term chip chỉ khi từ đó có trong `glossary`** (gloss ≤ 70 ký tự; không có gloss → không chip trơn), **số chỉ khi cảnh khai báo trong `numbers`** (có `label`; không tự đặt nhãn). Số đang đọc mà đã có trên màn hình → không chèn thẻ số, focus phần tử chứa số đó. Fallback cuối: focus lại item đang hiện → focus title (**tối đa 1 lần / cảnh**) → diagram → progress `cảnh n/m`. Focus làm tối phần còn lại ~50%. Tất định (cùng script + words → cùng kết quả), in log `autofill: scene N (Type) a-b s kind "…" ← lý do` và `static gaps > 2.5s: X before -> Y after`, lưu `out/autofill.json`.
2. **Lớp 2 `kw`**: item/dòng code khai báo từ khoá; khi chữ đó được đọc (sau lúc item hiện) thì item được focus + highlight.
3. **Lớp 3 gate** (`scripts/static_gate.py`, stage `gate` của `./dt render`): render lại frame low-res (mỗi 3 frame, scale 0.25, `qc:true` ẩn caption, hình mid-ground, con trỏ nháy = mọi `[data-deco]`), vùng y 290–1500; mọi cửa sổ 3 s trong khoảng giọng đọc (chữ đầu → chữ cuối, trước outro) phải có thay đổi (≥ 45 px lệch > 18 mức xám). Fail → exit 1, in mốc giây + cảnh, không ra mp4 cuối. Cảnh có `"still": true` (đứng yên có chủ đích, vd quote cần đọc) được miễn **tối đa 5 s** cho đoạn tĩnh nằm trong cảnh đó (autofill cũng chỉ chèn khi trống > 4.5 s); dài hơn 5 s vẫn fail. Gate in `gate: still:true exempt …`, ghi `exempt` vào `out/gate.json`.

Khoá mới (validator biết hết; sai kiểu → ❌, nghi vấn → ⚠️):
```jsonc
{
 "autofill": true,                      // script: tắt toàn bộ autofill (⚠️ khi false; gate vẫn chạy)
 "glossary": {"JDK": "bộ công cụ Java; Gradle cần nó để chạy và build project Kotlin"},   // gloss ≤ ~70 ký tự; term chip CHỈ hiện gloss từ đây (không tự bịa nghĩa); thuật ngữ có trong .agents/skills/write-script/glossary.json → dùng nguyên văn bản chuẩn
 "scenes": [{
   "autofill": false,                   // cảnh: tắt autofill riêng cảnh này
   "still": true,                       // cảnh cố ý đứng yên: gate miễn ≤ 5 s (dài hơn vẫn fail); dùng hiếm, vd QuoteCard
   "numbers": [{"n":"36","label":"compileSdk"}],   // số được phép thành thẻ số khi đọc tới (label ≤ 40 ký tự); không khai báo → không thẻ số
   "diagram": {"nodes": ["View","ViewModel","Model"], "label": "phụ thuộc đi một chiều"},   // gợi ý sơ đồ 2–3 hộp cho autofill
   "overlays": [                        // overlay viết tay; at = frame hoặc anchor, dur = giây (1–6, mặc định 2.2)
     {"kind":"term", "w":"ValueNotifier", "g":"giữ một giá trị, báo widget khi đổi", "icon?":"bolt", "at":"@ValueNotifier"},
     {"kind":"num", "n":"36", "label":"compileSdk", "at":"@ba", "dur":2.5},     // label bắt buộc; đếm lên từ 0 trong ~0.6 s
     {"kind":"icon", "icon":"download", "label":"Cài Android Studio bản stable", "at":"@Cài"},
     {"kind":"focus", "match":"minSdk", "at":"@minSdk"},                       // phóng nhẹ + viền + làm tối phần còn lại quanh phần tử có chữ khớp
     {"kind":"progress", "n":3, "m":7, "label":"Cài SDK", "at":40},
     {"kind":"diagram", "nodes":["View","ViewModel","Model"], "label":"…", "at":"@View"}
   ],
   "props": {"steps":[{"s":"Tick SDK Platform 36","at":"@tick","kw":["compileSdk"]}]}   // kw: list chữ (khớp như anchor) trên item / dòng code
 }]
}
```
- **icon** chỉ lấy từ bộ glyph tự vẽ (stroke 24px): `bolt book bug check clock cloud code download laptop layers link lock phone play refresh search settings terminal warn`. Không logo/brand bên thứ ba trong overlay.
- **Vị trí:** dock dưới cùng của hộp nội dung (x 136–860, đáy ~y 1352, ngay trên caption 1366), không bao giờ ra ngoài safe zone. Nội dung cảnh chạm dock thì cả cảnh **co nhẹ từ góc trên trái** (tối thiểu 0.72) trong lúc overlay hiện rồi trả lại; focus push-in ≤ 1.06 và bị kẹp trong hộp nội dung. Đang có nút Follow (cửa sổ CTA) thì autofill chỉ dùng focus.
- Ưu tiên viết anchor/`kw`/`overlays` có chủ đích; autofill là lưới an toàn, không thay cho nhịp hình tốt. Validator tính overlay và `kw` có đọc là beat.

## Scenario packs (mọi theme; `remotion/src/packs.tsx` + At* trong `android.tsx`)
Scene trung tính theme: màu/font/bo góc lấy từ palette sống `AT` (`setPal(theme)` trong `android.tsx`; android-tutor giữ nguyên giá trị Studio Dark, theme khác dùng palette chỉnh tay `look.pack` trong `themes/<id>/theme.json`: highlight/good/bad/warn, nền nhạt, viền; `good` = xanh cho "đúng/sau/fix" kể cả theme accent đỏ). **Lấp đầy chiều dọc** (`remotion/src/fill.tsx`): cảnh dùng hết chiều cao hộp nội dung (y 340–1359) trừ chỗ dành cho thẻ overlay dock của chính cảnh đó và nút Follow (cảnh nằm trong cửa sổ CTA); chữ/padding to lên tới +30 % khi còn chỗ (không bao giờ nhỏ hơn mức tối thiểu, không làm dòng mới bị xuống hàng), phần dư chia vào khoảng cách giữa các hàng, còn dư nữa thì nhóm được căn giữa dưới title. Hàng chưa tới lượt vẫn giữ chỗ (ẩn), nên bố cục không nhảy khi hàng mới hiện. Viết script không cần làm gì thêm; ít hàng thì cảnh tự thoáng hơn. Nằm trong hộp nội dung (x 136–847, y 340–~1359), cỡ chữ tối thiểu kiểu reel, mọi hộp có `data-bb`, chuyển động M3 emphasized-decelerate, không zoom/pop toàn màn. Item nào có `s`/`d`/`q` đều nhận `kw` (Lớp 2) và là mục tiêu focus của autofill. `N` = `{s, at}`; `at` nhận frame hoặc `@word`. Giới hạn số item validator cảnh báo (≤), thiếu tối thiểu → ❌.
- Tên trung tính cho At* (chạy ở mọi theme, props như mục android-tutor): **Steps**=AtSteps, **Terminal**=AtTerm, **Packages**=AtPackages, **Specs**=AtSpec, **Devices**=AtDevice, **Table**=AtTake.
- **Table** `{title, head?:[A,B], rows:[{k,a,b,at,win?:"a"|"b"|"both"|"none",kw?}], rule?:N}` (≤ 5 hàng): bảng 2 cột. `win` chọn ô thắng (tô `good`), ô còn lại tô nền "xấu" (đỏ nhạt), nên chỉ dùng Table cho so sánh thật; danh sách "mục → bắt buộc / chỉ khi / bỏ qua" thì dùng `Steps` (`ok` / `warn` / không đánh dấu). Không có `win` thì ô bắt đầu bằng "giữ/có/✓" thắng. Ô 1 dòng, rộng cố định 190 px: `a`/`b` ≤ 9 ký tự (dài hơn bị co dưới cỡ reel, validator ⚠️). Nhãn `k` tự co cho vừa cột (không chạm ô).
- **Meter** `{title, bars:[{s,v:0–100,at,val?,best?,kw?}], note?:N}` (≤ 5): thanh đo chạy lên tới `v`%; `val` = nhãn số hiển thị ("120 ms"); `best` tô `good`.
- **Scale** `{title, a:{s,w,at,sub?}, b:{s,w,at,sub?}, tiltAt?, verdict?:N}`: cân 2 đĩa; nghiêng về bên `w` lớn hơn tại `tiltAt`, `verdict` = kết luận.
- **DataFlow** `{title, nodes:[{s,at,sub?,via?,icon?}], note?:N}` (2–5): chuỗi hộp nối mũi tên, `via` = nhãn trên mũi tên vào node, `icon` từ bộ glyph overlay; gói tin chạy dọc mũi tên mới nhất.
- **Layers** `{title, layers:[{s,at,sub?}], dir?:"down"|"up", note?:N}` (2–5): kiến trúc phân tầng, dải xếp chồng, mũi tên phụ thuộc theo `dir`.
- **Loop** `{title, nodes:[{s,at}], center?, cur?:[{i,at}], note?:N}` (3–6): vòng đời / vòng lặp; `cur` di con trỏ tới node `i` tại `at`.
- **Debug** `{title, err:N, file?, lines:[{s,kw?}], codeAt?, bad:{line,at}, fix:N, ok?:N, note?:N}` (≤ 8 dòng): lỗi → dòng thủ phạm (`bad.line` 0-based, gạch đỏ) → dòng fix (`good`) → kết quả `ok`. Kèm **Terminal** khi cần chạy lệnh.
- **Timeline** `{title, events:[{d,s,at}], note?:N}` (≤ 5): mốc sự kiện dọc, `d` = ngày/mốc ngắn.
- **BigStat** `{n?, kick?, media?, pos?, big, unit?, label?, at?, src?, sub?:N, tally?:{count (1–21), label, tag, start, every?:5}}`: một con số rất to (đếm lên nếu là số), `src` = nguồn (bắt buộc về nội dung với tin tức). `media` = b-roll (đường dẫn trong `remotion/public`, `pos` = object-position); `tally` = lưới ô tang vật #01…#n được đóng dấu `tag` lần lượt từ frame `start`, mỗi `every` frame (ghép với sfx `every`). Theme tin tức (`pack.news`): kicker kiểu báo (`n` + `kick`), số nằm trên thanh accent.
- **QuoteCard** `{n?, kick?, media?, pos?, pull?:[từ1, từ2], q (≤ 180 ký tự), who, role?, at?, hl?:{w,at}}`: trích dẫn, `hl` gạch chân cụm từ. `pull` = nguyên văn 1–2 từ in thật to (từ 2 trên thanh accent), khi đó `q` là bản dịch/diễn giải nhỏ bên dưới. Theme tin tức: không khung, dấu “ lớn màu accent. Thường cần `"still": true` nếu cảnh dài.
- **BeforeAfter** `{title, before:{s,lines?,code?,at?}, after:{s,at,lines?,code?}, tags?:[a,b], note?:N}`: 2 thẻ trước/sau (`lines` ≤ 5; `code:true` = chữ mono).
- **Rating** `{title, items:[{s,v,at}], max?:5, verdict?:N}` (≤ 4): điểm sao/thanh, `v ≤ max`.
- **TopN** `{title, items:[{s,at,sub?}], countdown?:true, note?:N}` (≤ 5): top-N, `countdown` đánh số ngược (N…1).
- **Tên cũ của hot-news vẫn chạy (alias):** `Quote {n,kick,media?,w1,w2,tr,who}` = QuoteCard `{pull:[w1,w2], q:tr}`; `Evidence {n,kick,media?,pos?,big,unit,count,label,tag,start}` = BigStat `{tally:{count,label,tag,start}}`. Script mới dùng thẳng QuoteCard/BigStat.

