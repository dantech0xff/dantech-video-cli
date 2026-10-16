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
1. Chọn theme gần nhất (hot-news: báo in; quick-tips: UI sáng, keycap; tech-explain: dark mono). `cp -r themes/<gần nhất> themes/<id>`.
2. Sửa `theme.json` theo spec: màu (kiểm độ tương phản chữ/nền), font, `sfx` (chỉ file trong `assets/sfx`, ý nghĩa rõ, nhẹ), `trans` (motion mượt, có thiết kế), `music.pool` (track có licence trong tracks.json; thêm track mới thì ghi vào `tracks.json` + `LIBRARY.md`, không commit mp3), `outro.tagline`, `cta.sub`. Giữ `music.rel` gần theme gốc (-9…-11).
3. Font mới: thêm file vào `assets/fonts/` (licence OFL/miễn phí) + `@font-face` trong `FONTS` ở `remotion/src/sys.tsx`.
4. Đăng ký:
   - `remotion/src/themes.ts`: import JSON, thêm `'<id>': x.look as Theme` vào `THEMES`.
   - `remotion/src/Root.tsx`: thêm `'<id>'` vào mảng composition.
5. Layout mới (nếu cần): viết component trong `remotion/src/` (theo mẫu `scenes.tsx`/`meo.tsx`, dùng `useS()`), thêm vào `SCENES` ở `Video.tsx`, ghi props vào `.agents/skills/write-script/SCHEMA.md`.
6. Luật thương hiệu: không người/mặt người; chuyển cảnh có motion; giữ Follow CTA + end card với handle YouTube @dantech-0xff, Facebook @dantech0xff; **không sửa** `mix_bgm.sh`/`loudnorm.sh`.
7. Test: tạo `videos/<id>-test/script.json` (copy ví dụ gần nhất, đổi `theme`, có thể đặt `voice.file` = `../openai-vs-apple/voice_approved.mp3` để khỏi tốn TTS), `python3 scripts/validate_script.py …`, `make video SCRIPT=…`. Lỗi type: `cd remotion && npx tsc --noEmit`.
8. So still: `scripts/compare.sh videos/<id>-test/out/<id>-test.mp4 <video theme gốc> sheet.png 15 90 200 400`. Xem từng frame, sửa, `--from props` để render lại nhanh. Lặp đến khi đẹp.
9. Cập nhật bảng theme trong `README.md` và `AGENTS.md` (trạng thái 🧪 cho đến khi Dan duyệt). Gửi Dan video test + sheet. Không commit `out/`.
