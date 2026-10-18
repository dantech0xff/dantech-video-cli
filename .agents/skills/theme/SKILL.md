---
name: theme
description: Tạo theme mới hoặc chỉnh theme Dan Tech từ một spec (mood, màu, font, nhạc, sfx, layout/motion). Copy theme gần nhất, đăng ký trong Remotion, render thử, so still, lặp lại. Không đụng theme đã duyệt nếu Dan không yêu cầu.
---

# theme

**Input (spec):** tên/id, dùng cho loại nội dung nào, mood, màu, font, nhạc, sfx, layout/motion mong muốn.
**Output:** `themes/<id>/theme.json` (+ template scene mới nếu cần), video test, contact sheet still, cập nhật README/AGENTS.

`hot-news` đã khoá, `quick-tips` đã duyệt: **chỉ sửa khi Dan yêu cầu rõ**. Ưu tiên tạo theme mới.

## Theme gồm những gì (trong code)
- `themes/<id>/theme.json`:
  - `look`: id, label, bg, texture?, ink, onAccent, accent, accent2, muted, head/body (font family), upper, step, video (`halftone|mono|clean`), entry (`slam|type|rise`), rule, sfx{trans,stamp,tick,entry}, trans[] (chọn từ page/bar/zoom/push/stack/morph). Kiểu dữ liệu: `Theme` trong `remotion/src/themes.ts`.
  - `tail_hold`, `cta{top,in_offset,sub}`, `outro{dur,tagline,pal?}`: đọc bởi `scripts/build_props.py`.
  - `voice{voice,model,styles}`: `tts.py`. Giữ `vi-vn-concierge-2` + 3 style.
  - `music{pool[{id,start}],rel}`: `pick_music.py`, `mix_bgm.sh`. id phải có trong `assets/music/tracks.json`.
- Không có composition riêng cho từng theme: `remotion/src/Video.tsx` dùng chung, chọn scene qua bảng `SCENES`. `./dt` lấy theme từ `script.json → theme`, nên **không cần sửa dt hay build_props**.

## Các bước
1. Chọn theme gần nhất (hot-news: báo in; quick-tips: UI sáng, keycap; tech-explain: dark mono; tech-explain-cyber: blueprint tối, scene trong `remotion/src/cyber.tsx`; hot-news-glitch: tin nóng tối, glitch chỉ trên nhịp/chuyển cảnh, `remotion/src/glitch.tsx`, transition `signal` trong sys.tsx; android-tutor: IDE tối + Compose Preview + Logcat, spring M3 Expressive `m3()`, shape cookie chỉ làm accent nhỏ, transition `sharedx` (shared-axis X), scene/chrome/end card trong `remotion/src/android.tsx`). `cp -r themes/<gần nhất> themes/<id>`.
2. Sửa `theme.json` theo spec: màu (kiểm độ tương phản chữ/nền), font, `sfx` (chỉ file trong `assets/sfx`, ý nghĩa rõ, nhẹ), `trans` (motion mượt, có thiết kế), `music.pool` (track có licence trong tracks.json; thêm track mới thì ghi vào `tracks.json` + `LIBRARY.md`, không commit mp3), `outro.tagline`, `cta.sub`. Giữ `music.rel` gần theme gốc (-9…-11).
3. Font mới: thêm file vào `assets/fonts/` (licence OFL/miễn phí) + `@font-face` trong `FONTS` ở `remotion/src/sys.tsx`.
4. Đăng ký:
   - `remotion/src/themes.ts`: import JSON, thêm `'<id>': x.look as Theme` vào `THEMES`.
   - `remotion/src/Root.tsx`: thêm `'<id>'` vào mảng composition.
5. Layout mới (nếu cần): viết component trong `remotion/src/` (theo mẫu `scenes.tsx`/`meo.tsx`, dùng `useS()`), thêm vào `SCENES` ở `Video.tsx`, ghi props vào `.agents/skills/write-script/SCHEMA.md`.
6. Luật thương hiệu: không người/mặt người; chuyển cảnh có motion; giữ Follow CTA + end card với 3 handle có logo (YouTube @dantech-0xff, Facebook @dantech0xff, TikTok @dantech_0xff, lấy từ `channels/<id>.json`); **không sửa** `mix_bgm.sh`/`loudnorm.sh`.
7. Test: tạo `videos/<id>-test/script.json` (copy ví dụ gần nhất, đổi `theme`, có thể đặt `voice.file` = `../openai-vs-apple/voice_approved.mp3` để khỏi tốn TTS), `python3 scripts/validate_script.py …`, `make video SCRIPT=…`. Lỗi type: `cd remotion && npx tsc --noEmit`.
8. So still: `scripts/compare.sh videos/<id>-test/out/<id>-test.mp4 <video theme gốc> sheet.png 15 90 200 400`. Xem từng frame, sửa, `--from props` để render lại nhanh. Lặp đến khi đẹp.
9. Cập nhật bảng theme trong `README.md` và `AGENTS.md` (trạng thái 🧪 cho đến khi Dan duyệt). Gửi Dan video test + sheet. Không commit `out/`.

- **Không hiển thị tên theme trên khung hình** (TIN NÓNG / MẸO NHANH / GIẢI THÍCH…): tên theme chỉ dùng nội bộ. Chỉ giữ brand DAN TECH. Không thêm nhãn giả-kỹ-thuật trang trí (FIG./SHEET/§/REV…) nếu không mang nghĩa thật.

## Caption karaoke (mọi theme)
Caption = karaoke **chip** (mọi theme): mỗi chữ là một chip có nền (`chipBg`/`chipText`). Chữ sắp đọc thì text mờ hơn (`upcomingText`). Chữ đang đọc: nền đổi sang `activeBg`, text sang `activeText`, pop nhẹ (`pop` ~1.06, spring, không rung). Đọc xong thì về chip thường. **Không gạch chân.** Cấu hình ở `theme.json → look.caption`: `font,size,upper,weight,chipBg,chipText,upcomingText,activeBg,activeText,radius,padX,padY,gap,pop`. Size phải để 2 dòng chip lọt dải y 1366–1500 (Anton 50, BVPX/BVPM 44, JBM 38). Chip trên nền tối phải sáng hơn nền để còn thấy. Ước lượng 2 dòng trong `Captions` đã trừ padding + gap của chip.
- Font caption khai báo trong `theme.json` → `look.caption` `{font, size, upper, weight?}`; mặc định = font chính (`head`) của theme. Caption phải cùng font với video.
- Hiện tại: hot-news Anton 72 (in hoa) · quick-tips BVPX 62 · tech-explain JBM 52 (700) · tech-explain-cyber BVPM 60 · hot-news-glitch Anton 72 (in hoa) · android-tutor GSF (Google Sans Flex) 48 (800), chip bo 14 · flutter-tutor GSF 48 (800), chip active Sky #027DFD chữ trắng, bo 18, pop 1.06 · loot-crypto BVPX 46, chip active mint #3BE08F chữ #04140B, bo 14, pop 1.04, không gạch chân.
- Component `Captions` (remotion/src/sys.tsx) dùng chung, không viết caption riêng cho theme mới.

## Safe zone (BẮT BUỘC — tạo / sửa / cập nhật theme)
Khung 1080x1920 bị UI TikTok / Reels / Shorts / Facebook Reels che. Hằng số dùng chung nằm ở `remotion/src/safezone.ts` (`ZONE`, `SZ`) — theme **import từ đây, không hardcode toạ độ**.
- Vùng **không có chữ** (`SZ.noText`, UI che): top y < 290 (thanh tìm kiếm, tab Following/For You, LIVE), bottom y ≥ 1500, left x < 60, right x ≥ 880 từ y 700 (cột nút). Strict (template quảng cáo): top 288, bottom 672, left 120, right 192.
- **Trên y 290 không có chữ hay thông tin nào, kể cả brand.** Brand nằm trong **header mảnh một dòng** `SZ.header`: y 294–334 (40 px), x 136–860. Trái: wordmark/tên kênh (~30–34 px, `fitSize` để "MOBILE HUB" hay tên dài tự co). Phải: số trang (+ ngày nếu theme có), ~21–22 px, cùng **baseline**. Dùng `HeadLine` trong `sys.tsx` (`left`, `right`, `rule` = viền dưới tuỳ theme). Có thể làm header thành thanh màu (tech-explain: thanh vàng chính là header, kèm `❯ section` mờ ở giữa).
- **Không có dải thứ hai** dưới header (tab bar, breadcrumb, section line, prompt line). Thông tin đó đưa vào header (một dòng) hoặc vào nội dung: tên file nằm trên tab của card code (android/flutter), section là kicker của cảnh. Thanh màu, rail, lưới, hình mid-ground được tràn lên trên y 290 vì không mang chữ.
- Nội dung cảnh: `SZ.content` = y 340–1359, canvas rộng 894 scale **0.795** (711 px, x 136–847). Chiều cao dùng được của canvas ~1282 (`SZ.content.h`); scene cũ vẽ trên 894x1320 nhưng không đặt gì dưới y ~1280. Cảnh CTA: nội dung kết thúc trên y ~1019 của canvas (nút Follow ở y 1150 màn hình). `Timeline` tự scale vào hộp — không đặt chữ ngoài canvas đó. Đừng hardcode toạ độ header/end card, lấy từ `SZ`.
- Rail trang trí ở mép trái: nền màu chạy suốt chiều cao được, nhưng chữ trong rail chỉ ở x ≥ 60, y 290–1500 (xem `Chrome` trong `sys.tsx`: hộp clip + mask mờ hai đầu). Số dòng gutter cũng vậy (bắt đầu từ `SZ.content.y`).
- Caption: `SZ.captions` (y 1366, rộng 724), tối đa 2 dòng, phải kết thúc trước y 1500.
- Nút Follow: `cta.top` = 1150 trong theme.json, hộp phải ở x ≤ 860, y ~1150–1350.
- End card: chữ/handle canh trái, mép phải ≤ 860, không có footer dưới y 1480.
- End card: chữ bắt đầu từ `SZ.end.top` (y 420) trở xuống.
- **Trước khi coi theme là xong:** render still các khung chính (VersusHook frame 0 + ~40, headline, cảnh nhiều nội dung, caption, nút follow, end card, và một bộ với `channels/example.json`), chạy `python3 scripts/safezone.py <png>... -o <dir>` và `--sheet`. Phải ra `0 with text in a no-text zone`. Script chia khung thành ô 24 px và chỉ tính ô có cạnh sáng/tối theo cả 2 chiều (chữ, icon), nên nền, thanh màu trơn, đường kẻ, lưới mờ, hình mid-ground không bị tính. Ô bị bắt được viền xanh cyan trên overlay; vẫn nhìn bằng mắt.

## Quality bar cho theme (bài học đã gặp)
- Accent đậm, bão hoà, chỉ một accent. Nền tối dùng xám trung tính `#1C1C1C` (đỡ mỏi mắt). Không neon tím/hồng, không hologram, không bloom nặng.
- Không in tên theme, meta label, nhãn kỹ thuật giả (FIG./SHEET/§). Brand "Dan Tech" đậm (ExtraBold).
- Top bar: wordmark và số trang thẳng **baseline** (`align-items: baseline`), không căn giữa. Kiểm bằng crop phóng to. Top bar là header một dòng trong `SZ.header` (y 294–334), **không** ở trên y 290 (Dan: bị UI TikTok/Shorts/Reels che) và **không** thêm dòng thứ hai (Dan: nội dung bị thu nhỏ).
- Glitch/hiệu ứng chỉ ở beat hoặc chuyển cảnh, không chạy liên tục. Chuyển cảnh mượt.
- Theme mới làm trên branch `theme/<id>`, stills trước, video sau, merge thường khi đã duyệt.

## Scene chung cho mọi theme
`VersusHook` (`remotion/src/versus.tsx`) là scene mở cho hook dạng controversy/news, dùng cho **mọi theme**. Nó lấy màu và font từ theme. Theme mới/sửa theme phải render still VersusHook ở frame 0 (claim to, đọc được) và ~frame 40 (2 phe + VS), rồi chạy safezone.py. Nếu theme cần phong cách riêng thì nhánh trong `versus.tsx` theo `t.id` (như glitch), không tạo scene riêng cho theme.

## End card handles
Brand (wordmark, tên, handle, logo, chữ nút Follow) lấy từ `channels/<id>.json` qua `useBrand()` / `BrandTile` / `fitSize` (`remotion/src/brand.tsx`, props.channel). **Không hardcode "DAN TECH", handle hay chữ follow trong theme.** Chữ brand phải dùng `fitSize` để tên dài tự co. Theme mới phải render thử với `channels/example.json`. End card gồm 3 dòng canh trái, mỗi dòng là ô trắng có logo màu thương hiệu rồi tới handle, mép phải ≤ 860.

## Theme cho một nền tảng / thương hiệu thứ ba (bài học từ android-tutor)
- Màu, font, design system có thể mượn tinh thần (Android: #3DDC84, Material 3 Expressive springs + shape morph, Google Sans Flex), nhưng art **của theme** (trang trí, header, end card) không dùng logo/wordmark chính thức, lockup, robot 3D hay artwork thiết bị (Pixel): tự vẽ bản đơn giản (robot xanh trong `android.tsx`), khung điện thoại chung chung. Logo sản phẩm thật được nhắc tới (Android, Android Studio, Kotlin…) đi riêng qua BrandMark tự động (SCHEMA "Logo thương hiệu tự động") và hiện bình thường.
- Robot Android dùng theo CC BY 3.0: end card phải có đúng dòng "The Android robot is reproduced or modified from work created and shared by Google and used according to terms described in the Creative Commons 3.0 Attribution License." + "Android is a trademark of Google LLC." Chữ "Android" nổi bật đầu tiên trên màn hình gắn ™.
- Font mới phải có licence OFL trong `assets/fonts/licenses/`.
- Motion spring M3E (material3 ExpressiveMotionTokens): spatial fast .6/800, default .8/380, slow .8/200; effects (màu/opacity) critically damped, không overshoot. Helper `m3(f,at,'fast'|'def'|'slow'|'fx')`.
- Code trong props bắt đầu bằng `@` (vd `@Composable`) bị hiểu là anchor: viết `"\\@Composable"` (component bỏ dấu `\`).
- **Cỡ chữ tối thiểu ở cỡ reel** (canvas px, màn hình = ×0.795): chữ thân ≥ 46, mono/code ≥ 40, nhãn/meta ≥ 28–30. Nhãn 19–26 px (bản đầu của AtDevice/AtSpec/AtTerm) đọc không ra trên điện thoại. Thiết bị/tile xếp dọc hoặc 2 cột cho chữ to, đừng nhét 3 mock nhỏ cạnh nhau.
- **Nhấn bước đang nói** cho scene dạng danh sách (AtSteps/AtPackages/AtDevice: helper `focus()` trong `android.tsx`): hàng mới nhất chưa xong viền accent, hàng cũ chưa xong mờ nhẹ (≥ 0.68 opacity để vẫn đọc được), hàng xong tô accent + tick.
- Code card: dòng dài > ~34 ký tự ở fs 40 sẽ tràn; tách dòng như IDE format. Phone frame + code phải nằm gọn trong phần dùng được của canvas, y ≤ ~1280 (không chạm dải caption).
- **Màu thương hiệu dùng đúng mã chính thức** (Android: #3DDC84 theo developer.android.com/distribute/marketing-tools/brand-guidelines) cho accent chính ở mọi chỗ: chip caption, highlight, robot, transition, nút. Không thay bằng tông pastel M3 (#7DDB9F) cho "dịu mắt", Dan thấy nhạt.
- **Nền tối kiểu IDE nên gần đen** (#0B0C0E), surface/card nâng từng bậc (#101114 panel, #121316 tab, #17181B card, viền #2A2C31) để vẫn tách lớp.

### Bài học từ flutter-tutor
- **Logo:** khác Android, docs.flutter.dev/brand cho phép dùng logomark Flutter trong tài liệu đào tạo (video tutorial) nếu: đúng file chính thức **không chỉnh sửa** (không đổi màu, xoay, cắt, ghép, animate từng phần; chỉ scale/fade nguyên khối), **nhỏ và không phải thứ nổi bật nhất**, có khoảng trống quanh (≥ 1 chiều cao "F"), ™ cho chữ "Flutter" nổi bật đầu tiên, end card có đúng dòng "Flutter and the related logo are trademarks of Google LLC. We are not endorsed by or affiliated with Google LLC." **Không dùng Dash (mascot)**. File: `assets/brand/flutter/flutter_logomark.svg` (tải từ flutter.dev, sha256 trong README cạnh file), dùng qua `<Img src>` (SVG có class CSS, không inline).
- Màu chính thức flutter.dev/brand: Navy #042B59, Blue #0553B1, Sky #027DFD (Sky là accent chính: chip caption, highlight, hero chip, nút). Màu phụ (Red #F25D50, Yellow #FFF275, Green #1CDAC5) chỉ cho cú pháp Dart. Nền #050A14, surface #081120 / #0A1424 / #0F1B30, viền #1A2B47.
- Font flutter.dev: Google Sans Flex + **Google Sans Code** (OFL; instance tĩnh `gsc_md.ttf` 500, `gsc_bd.ttf` 700 cắt từ variable font google/fonts). GSC monospace 0.6 em nên tính được chính xác bề rộng chip.
- Motion: implicit animation của Flutter = `Curves.fastOutSlowIn` `(.4,0,.2,1)`, ~300 ms, không overshoot (helper `ease(f,at,dur)` trong `flutter.tsx`). Không dùng spring nảy.
- Chuyển cảnh **Hero** (`out: "hero"`): Flutter route mặc định (FadeForwards, Cupertino slide) quá giống sharedx của android-tutor, nên lấy Hero làm chữ ký: phần tử chung (chip từ khoá) bay theo cung nhẹ (lệch ~14% quãng đường theo phương vuông góc ở giữa), phần còn lại cross-fade. Overlay vẽ chip một lần (zIndex 10); cả 2 layer ẩn chip của mình trong cửa sổ (ctx `hx`). Hình học chip dùng chung một hàm (`heroBox`) cho scene và overlay để điểm đầu/cuối khớp từng pixel.
- Mid-ground Flutter: chỉ các **dải song song cùng một hướng** (−36° ± 5°, trượt ±70 px, bo 6–75 px dao động), để không bao giờ ghép thành hình chữ F/chevron của logo.
- SFX `hero_soft` (`scripts/sfx_soft.py hero`): 0.5 s, peak −22 dBFS, centroid ~220 Hz: gần như chỉ là hơi gió.
- Card label + badge trong hộp hẹp (FAB) dễ đè nhau mà bbcheck không bắt (hộp lồng nhau không tính overlap): nhìn still phóng to các hộp lồng. Label của highlight code đặt **dưới** khung (không đè dòng dài), và chừa thêm padding nếu highlight ở dòng cuối (editor overflow hidden).

### Bài học từ loot-crypto (theme khách hàng)
- **Theme khách hàng = brand từ kênh, không hardcode Dan Tech.** `themes/<id>/theme.json` có `"channel": "<id>"` → `build_props.py` / `validate_script.py` dùng `channels/<id>.json` khi script không ghi `channel`. Kênh có thể thêm `logo` (symbol trong header + end card), `page` (tên fanpage), `disclaimer`; `handles` được phép rỗng (end card chỉ hiện tên page).
- **Studio 3D mà không tốn render:** dựng plate bằng three.js headless (tools/loot-3d, README có lệnh tái tạo), Remotion chỉ trôi chậm (translate) + vũng sáng thở. Không thêm sprite mờ phóng to đè lên plate.
- **Font brand thiếu tiếng Việt:** Sora không có ạ/ọ/ệ/ữ. Chỉ dùng cho chuỗi Latin (logo, số, ticker); helper `lab(s)` tự đổi sang Be Vietnam Pro SemiBold (0.06em) khi chuỗi có ký tự ngoài ASCII. Luôn soi glyph font brand trước khi dùng cho nhãn.
- **Hình học từ logomark:** card 3 góc tròn + 1 góc nhọn phải-trên (đúng chỗ ô vuông mint của logo), ô vuông mint làm bullet/accent. Pack dùng chung nhận góc này qua `look.pack.r` (chuỗi border-radius), vạch đỏ trên title qua `look.pack.bar`, font nhãn qua `look.pack.mono`.
- **Chuyển cảnh `quarter`:** sector 90° quét quanh góc dưới-trái (clip-path polygon), nội dung mới xoay −5°→0 quanh góc, cũ +3° và tối dần, mép mint mảnh + ô vuông mint chạy theo cung. Cảnh mới bắt đầu sớm T/2 (`lf` +8) để lúc quét đã có nội dung (nếu không, giữa sweep chỉ thấy plate trống). Rotation đi qua `data-pre` để overlay focus/squeeze (set transform bằng tay) giữ được nó.
- **Spotlight trên nền ảnh:** đừng phủ tấm dim lên plate (dù làm mờ mép vẫn thành "tấm mờ bị zoom", Dan 18/10). `look.softSpot` = không có tấm dim, các hộp `data-bb` khác tự tối lại (brightness), viền focus mảnh theo góc QR. `look.focusPush: 1` = không push-in.
- **Plate full-frame không bao giờ phóng to (BẮT BUỘC):** liệt kê ở `look.plates`, scale tối đa (drift + push) ở `look.plateScale` (≤ 1.05, loot 1.03). Plate phải ≥ 1080×1920 × plateScale (loot render 1296×2304). `scripts/check_plates.py` chạy trong `./dt render` và `validate_script.py`, fail nếu thiếu. Vật thể 3D lớn ở gần camera thì đặt ở vùng đáy không chữ (y ≥ 1500) và nhỏ lại, không cắt mép, không nằm sau caption/tiêu đề.
- **Nội dung tiền:** disclaimer ở header phải (vừa 724 px cùng số trang) chỉ trên cảnh giá/biểu đồ/coin/flow (`look.lc.discTypes`, `props.disc`), tag MINH HỌA trên số liệu không nguồn, end card luôn có disclaimer. Đỏ chỉ cho giảm/cảnh báo/vạch tiêu đề (`look.lc.red: "signal"`; `"equal"` cho đỏ làm accent thứ hai), `look.lc.redBar: false` đổi vạch tiêu đề sang mint.

## Chống chồng lấn (BẮT BUỘC, mọi theme)
- Mọi hộp nội dung (title, card, phone, nhãn, pill, hàng, note, brand, end card) gắn `{...bb('tên')}` (`data-bb`). Lớp scene có `data-layer`, caption + nút Follow là lớp `g`.
- Chạy `scripts/bbcheck.sh videos/<slug>/script.json` sau mỗi lần đổi layout: render lại mọi frame với `debugBB` (`remotion/src/bbcheck.tsx` tô magenta phần giao nhau của 2 hộp cùng lớp, hoặc hộp scene × caption/CTA), in frame + cặp hộp bị chồng. Phải ra `frames with overlaps: 0`. Không tốn TTS.
- Vật thể xoay/biến hình (vd phone xoay ngang) phải có **slot vuông ≥ đường chéo** của nó, để mọi góc xoay không chạm hộp khác. Đừng đặt cột chữ cạnh vật thể theo kích thước lúc đứng yên.
- Tiêu đề dài trên cảnh nhiều nội dung: `one` (1 dòng, `fitSize`) để không đẩy layout xuống dải caption.

## Scenario packs + palette sống `AT` (mọi theme)
- `remotion/src/packs.tsx` (Meter, Scale, DataFlow, Layers, Loop, Debug, Timeline, BigStat, QuoteCard, BeforeAfter, Rating, TopN) và At* của android (đăng ký thêm tên trung tính Steps/Terminal/Packages/Specs/Devices/Table) đọc màu/font/bo góc từ `AT` trong `android.tsx`. `Video.tsx` gọi `setPal(theme)` mỗi lần render: android-tutor giữ nguyên `AT_ANDROID` (pixel-identical); theme khác: `setPal` suy ra mặc định từ `look` (sáng/tối, accent, góc vuông cho hot-news, head font/weight/uppercase, mono GSC cho flutter, JBM cho còn lại) rồi **ghi đè bằng palette chỉnh tay `look.pack`** trong `themes/<id>/theme.json` (overlay `tok()` cũng lấy card/line/dim từ đây):
  | khoá | nghĩa |
  |---|---|
  | `hl` / `onHl` | highlight: hàng đang nói, viền active, nút, sao, ô thắng / chữ trên nó |
  | `good` / `onGood` | đúng / sau / fix / tốt nhất (xanh, tách khỏi accent đỏ) |
  | `bad` / `badBg` / `badInk` / `badRow` | lỗi / dòng thủ phạm, nền nhạt ô thua, chữ ô thua, chữ log lỗi |
  | `warn` / `warnBg` / `onWarn` | nhánh "nếu không" |
  | `card` / `card2` / `panel` / `term` | nền thẻ, header thẻ, cửa sổ, terminal |
  | `line` / `dim` / `sub` / `out` | viền, chữ phụ, nhãn nhỏ, output terminal |
  | `tint` + `tintK` | màu + hệ số của nền nhạt (active/done); theme giấy dùng mực đen ×0.55 thay vì đỏ cho khỏi "hồng" |
  | `news` | true = kiểu báo: kicker số + rule, QuoteCard không khung, BigStat số trên thanh accent |
  Giá trị `"accent"` / `"onAccent"` / `"accent2"` = lấy từ token của theme, nên variant đổi accent (tech-explain red, cyber blue/violet…) vẫn đúng màu. `good`, `bad`, `warn` phải là hex 6 số (pack ghép alpha vào). Theme mới: thêm `look.pack` ngay từ đầu, không hardcode màu trong pack.
- **Lấp đầy chiều dọc** (`fill.tsx`): scene list/sơ đồ bọc trong `<Fill head={<Title/>}>`; cỡ chữ/padding viết bằng `z(px)` / `zf(text,width,max,ratio)` (dòng đơn), khoảng cách dọc bằng `zg(px)`, hàng chưa tới lượt render ẩn bằng `hid(vis)` và chỉ gắn `data-bb` khi hiện. Room = `Ctx.room` (Timeline trừ chỗ thẻ dock + nút Follow). Sơ đồ vẽ tuyệt đối (Scale, Loop) tự kéo dài theo `useRoom()`. Kiểm: render pack fixture (mỗi pack 1 cảnh) qua safezone + bbcheck.

## Universal overlays (mọi theme, `remotion/src/overlay.tsx`)
- 6 phần tử dùng chung, render bởi `Overlays` trong `sys.tsx` từ `scene.ov` (do autofill hoặc `overlays` trong script sinh ra): term chip + gloss, số lớn đếm lên + nhãn, icon + nhãn, focus (push-in ≤ 1.06 + viền + spotlight làm tối phần còn lại), progress n/m, sơ đồ 2–3 hộp có mũi tên. Chi tiết khoá: SCHEMA "Universal overlays".
- **Token:** overlay không có màu riêng. `tok()` lấy từ palette của theme (`pal`, hoặc suy ra từ bg/ink/accent/muted của `look`), font head/body của theme, bo góc theo theme (hot-news/glitch vuông 0, quick-tips 24, còn lại 26). Theme mới chỉ cần `look` đúng; muốn chỉnh riêng thì thêm nhánh trong `tok()`, không hardcode màu trong component.
- **Dock:** card nằm đáy hộp nội dung (x 136–860, đáy ~y 1352, trên caption 1366), gắn `data-bb="ov-<kind>"` + `data-ov-dock` nên bbcheck kiểm được. Scene phải bọc nội dung trong wrapper `data-content` (sys.tsx đã làm) và gắn `data-bb` cho mọi hộp, vì squeeze/focus đo bbox từ đó.
- **Squeeze:** nội dung chạm dock thì wrapper scale từ góc trên trái (min 0.72) trong ~8 frame trước khi card vào, nhả ra sau khi card đi. Không bao giờ phủ đè nội dung, không zoom toàn khung.
- **Focus:** tìm phần tử theo chữ (`match`/`kw`), leo lên hàng chứa nó (dừng ở hộp `data-bb`), viền accent + phủ `bg` 50% ngoài phần tử. Spotlight bắt đầu từ x 100 để không làm tối rail trái của theme.
- **Motion:** M3 emphasized-decelerate `(.05,.7,.1,1)`, card trượt lên 34 px + fade ~10 frame, ra nhanh hơn vào. Không pop/bounce.
- **`data-deco`:** mọi trang trí chuyển động liên tục (caption, hình mid-ground, con trỏ nháy, dải nền trôi) phải gắn `data-deco="…"`. Gate hình tĩnh (`static_gate.py`) render với `qc:true` ẩn `[data-deco]`, để trang trí không "giả" thay đổi hình. Theme mới quên gắn thì gate pass sai: kiểm bằng `./dt gate` trên một script tĩnh thử (phải ❌).
- Kiểm theme mới: render sheet 6 phần tử (mẫu `/workspace/dantech-style/elements/universal_sheet.png`), `safezone.py` 0 flag, `bbcheck.sh` 0 overlap.

## Chuyển cảnh: mượt, không "ú òa"
- Dan thấy chuyển cảnh **zoom-in/zoom-out / pop bằng shape phủ toàn khung** (cookie wipe cũ của android-tutor) giật, không đẹp. **Không dùng** kiểu này cho android-tutor (đã gỡ hẳn). Theme lấy cảm hứng từ một nền tảng thì dùng motion điều hướng thật của nền tảng đó: Flutter = **Hero** (`out: "hero"`, xem bài học flutter-tutor). Android = Material **shared-axis X** (`out: "sharedx"`, sys.tsx): cảnh cũ lùi trái ~120 px + scale 0.96 + mờ trong 35% đầu, cảnh mới trượt từ phải + fade, easing emphasized-decelerate `(.05,.7,.1,1)`, ~470 ms, không overshoot.
- Đặt transition mặc định của theme bằng `look.defaultOut` (Timeline dùng khi scene không ghi `out`). End card vào bằng cùng kiểu (fade + trượt từ phải), không mọc shape.
- Kiểm bằng strip frame qua một ranh giới (vd 10 frame từ −333 ms tới +333 ms) trước khi gửi Dan.

## SFX chuyển cảnh
- Mềm, ngắn, nhỏ: low-pass (năng lượng > 4 kHz < ~0.5%, centroid vài trăm Hz), fade vào/ra raised-cosine, mẫu đầu/cuối = 0 (không click), peak ≤ -12 dBFS trong file (Timeline còn phát 0.5). Đỉnh tiếng phải trùng lúc chuyển động mạnh nhất (sfx bắt đầu ở `start - T/2 - 2` = 10 frame trước ranh giới; cửa sổ chuyển cảnh bắt đầu sau 0.067 s). Mẫu: `scripts/sfx_soft.py` → `assets/sfx/slide_soft.wav` (slide: 0.45 s, peak -20 dBFS, gần như không nghe, đỉnh ở 0.17 s = đoạn trượt nhanh nhất; `morph` → `morph_soft.wav` dự phòng). Script in số đo khi chạy. Chuyển cảnh nhẹ thì SFX phải nhẹ tương ứng. Ghi vào `SFX_LIST.md` + `sfx.json`.

## Hình mid-ground
- Theme có thể có 2–3 hình trang trí giữa nền và nội dung, biến đổi **chậm và liên tục** theo frame toàn cục (không nhảy khi đổi cảnh): xoay ~6°/s, số cánh/cạnh morph liên tục (crossfade giữa n và n+1), độ bo tròn dao động chu kỳ 10–30 s. Alpha thấp (fill ≤ 0.08, stroke ≤ 0.16), không gắn `data-bb`, không đặt dưới chữ chính với độ tương phản cao. Mẫu: `MidShapes` / `morphPath` trong `android.tsx`.
