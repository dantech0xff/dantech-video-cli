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
1. Chọn theme gần nhất (hot-news: báo in; quick-tips: UI sáng, keycap; tech-explain: dark mono; tech-explain-cyber: blueprint tối, scene trong `remotion/src/cyber.tsx`; hot-news-glitch: tin nóng tối, glitch chỉ trên nhịp/chuyển cảnh, `remotion/src/glitch.tsx`, transition `signal` trong sys.tsx; android-tutor: IDE tối + Compose Preview + Logcat, spring M3 Expressive `m3()`, shape cookie, transition `cookie`, scene/chrome/end card trong `remotion/src/android.tsx`). `cp -r themes/<gần nhất> themes/<id>`.
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
- Hiện tại: hot-news Anton 72 (in hoa) · quick-tips BVPX 62 · tech-explain JBM 52 (700) · tech-explain-cyber BVPM 60 · hot-news-glitch Anton 72 (in hoa) · android-tutor GSF (Google Sans Flex) 48 (800), chip bo 14.
- Component `Captions` (remotion/src/sys.tsx) dùng chung, không viết caption riêng cho theme mới.

## Safe zone (BẮT BUỘC — tạo / sửa / cập nhật theme)
Khung 1080x1920 bị UI TikTok / Reels / Shorts / Facebook Reels che. Hằng số dùng chung nằm ở `remotion/src/safezone.ts` (`ZONE`, `SZ`) — theme **import từ đây, không hardcode toạ độ**.
- Vùng che (organic): top 250, bottom 420, left 60, right 200 (cột nút từ y 700 trở xuống). Strict (template quảng cáo): top 288, bottom 672, left 120, right 192.
- Nội dung chính: x 136–860, y 290–~1360. Scene vẫn thiết kế trên canvas 894x1320, `Timeline` tự scale vào hộp `SZ.content` — không đặt chữ ngoài canvas đó.
- Caption: `SZ.captions` (y 1366, rộng 724), tối đa 2 dòng, phải kết thúc trước y 1500.
- Nút Follow: `cta.top` = 1150 trong theme.json, hộp phải ở x ≤ 860, y ~1150–1350.
- End card: chữ/handle canh trái, mép phải ≤ 860, không có footer dưới y 1480.
- Trên y 250 chỉ để brand/trang trí (top bar, số trang); dải rail/trang trí ở mép trái/phải được phép.
- **Trước khi coi theme là xong:** render still các khung chính (headline, cảnh nhiều nội dung, caption, nút follow, end card), chạy `python3 scripts/safezone.py <png>... -o <dir>` và `--sheet`, nhìn bằng mắt: không có chữ / nút quan trọng trong vùng đỏ. % "busy" do nền / lưới / rail trang trí thì bỏ qua.

## Quality bar cho theme (bài học đã gặp)
- Accent đậm, bão hoà, chỉ một accent. Nền tối dùng xám trung tính `#1C1C1C` (đỡ mỏi mắt). Không neon tím/hồng, không hologram, không bloom nặng.
- Không in tên theme, meta label, nhãn kỹ thuật giả (FIG./SHEET/§). Brand "Dan Tech" đậm (ExtraBold).
- Top bar: wordmark và số trang thẳng **baseline** (`align-items: baseline`), không căn giữa. Kiểm bằng crop phóng to.
- Glitch/hiệu ứng chỉ ở beat hoặc chuyển cảnh, không chạy liên tục. Chuyển cảnh mượt.
- Theme mới làm trên branch `theme/<id>`, stills trước, video sau, merge thường khi đã duyệt.

## Scene chung cho mọi theme
`VersusHook` (`remotion/src/versus.tsx`) là scene mở cho hook dạng controversy/news, dùng cho **mọi theme**. Nó lấy màu và font từ theme. Theme mới/sửa theme phải render still VersusHook ở frame 0 (claim to, đọc được) và ~frame 40 (2 phe + VS), rồi chạy safezone.py. Nếu theme cần phong cách riêng thì nhánh trong `versus.tsx` theo `t.id` (như glitch), không tạo scene riêng cho theme.

## End card handles
Brand (wordmark, tên, handle, logo, chữ nút Follow) lấy từ `channels/<id>.json` qua `useBrand()` / `BrandTile` / `fitSize` (`remotion/src/brand.tsx`, props.channel). **Không hardcode "DAN TECH", handle hay chữ follow trong theme.** Chữ brand phải dùng `fitSize` để tên dài tự co. Theme mới phải render thử với `channels/example.json`. End card gồm 3 dòng canh trái, mỗi dòng là ô trắng có logo màu thương hiệu rồi tới handle, mép phải ≤ 860.

## Theme cho một nền tảng / thương hiệu thứ ba (bài học từ android-tutor)
- Màu, font, design system có thể mượn tinh thần (Android: #3DDC84, Material 3 Expressive springs + shape morph, Google Sans Flex), nhưng **không dùng logo/wordmark chính thức, lockup, robot 3D, logo IDE (Android Studio/IntelliJ) hay artwork thiết bị (Pixel)**. Tự vẽ bản đơn giản (robot xanh trong `android.tsx`), khung điện thoại chung chung.
- Robot Android dùng theo CC BY 3.0: end card phải có đúng dòng "The Android robot is reproduced or modified from work created and shared by Google and used according to terms described in the Creative Commons 3.0 Attribution License." + "Android is a trademark of Google LLC." Chữ "Android" nổi bật đầu tiên trên màn hình gắn ™.
- Font mới phải có licence OFL trong `assets/fonts/licenses/`.
- Motion spring M3E (material3 ExpressiveMotionTokens): spatial fast .6/800, default .8/380, slow .8/200; effects (màu/opacity) critically damped, không overshoot. Helper `m3(f,at,'fast'|'def'|'slow'|'fx')`.
- Code trong props bắt đầu bằng `@` (vd `@Composable`) bị hiểu là anchor: viết `"\\@Composable"` (component bỏ dấu `\`).
- Code card: dòng dài > ~34 ký tự ở fs 40 sẽ tràn; tách dòng như IDE format. Phone frame + code phải nằm gọn trong canvas 1320 (không chạm dải caption).
