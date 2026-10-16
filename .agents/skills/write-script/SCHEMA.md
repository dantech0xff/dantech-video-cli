# Schema script.json (lấy từ code: scripts/build_props.py, tts.py, pick_music.py, remotion/src/*.tsx)

```jsonc
{
 "theme": "tin-nong" | "meo-nhanh" | "commit",   // = thư mục themes/<id>/
 "title": "…",                 // tiêu đề nội bộ / description
 "date": "16 · 10 · 2026",     // hiện trên masthead
 "caption": "… #DanTech #TinNong",
 "sources": ["Tên báo, tiêu đề: https://… (ngày)"],   // bắt buộc, nguồn thật
 "voice": {"style": "random"},          // hoặc "hao-hung" | "ke-chuyen" | "tu-nhien"; "file" = ghim audio (bỏ qua TTS)
 "music": {"track": "random"},          // hoặc id trong assets/music/tracks.json, + "start": giây
 "variant": "red",                     // tuỳ chọn: biến thể trong theme.json → variants (COMMIT: "red" = accent YouTube đỏ)
 "look": {"accent": "#…"},             // tuỳ chọn: ghi đè màu look cho riêng video (sau variant)
 "handles": [{"p":"YOUTUBE","h":"@dantech-0xff"}, …],  // tuỳ chọn, mặc định đã đúng
 "cta": {"in": "@follow-6", "press": "@Dan", "sub": "…"}, // tuỳ chọn, mặc định từ theme.json → cta
 "scenes": [{
   "say": "Câu giọng đọc nói trong cảnh này.",   // cảnh bắt đầu ở chữ đầu tiên của say
   "type": "<scene template>",
   "section": "DÒNG NHỎ TRÊN ĐẦU",
   "out": "page|bar|zoom|push|stack|morph|scroll",      // chuyển cảnh sang cảnh sau (cảnh cuối bỏ trống)
   "focus": [x, y],                               // tâm zoom khi out = zoom
   "morph": {"from":[x,y,w,h,font],"to":[…],"txt":"14"},  // bắt buộc khi out = morph
   "props": {…},                                  // theo template bên dưới
   "sfx": [{"at":"@chữ","s":"<file trong assets/sfx, không đuôi>","v":0.5,"every":5,"count":14}]
 }]
}
```

Số trong `props`/`sfx` là frame tính từ đầu cảnh (30 fps). Anchor: `"@chữ"`, `"@chữ#2"`, `"@chữ+4"`, `"@chữ.end"`; chữ phải có trong `say` của **chính cảnh đó** (so khớp bỏ dấu câu, không phân biệt hoa thường).

Không có trường hay giới hạn độ dài: độ dài theo nội dung.

## Scene templates (props, `?` = tuỳ chọn)

TIN NÓNG / COMMIT (`remotion/src/scenes.tsx`), mẫu: `videos/openai-vs-apple/script.json`
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

COMMIT (`remotion/src/commit.tsx`), mẫu: `videos/git-merge-vs-rebase/script.json`
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
Chuyển cảnh thêm `scroll` (cuộn theo bậc như terminal), hợp nhất với COMMIT.

`media` = file trong `assets/broll/` (chỉ clip không có người). Cấu trúc `code`/`Line`: copy y hệt mẫu.
SFX có sẵn: xem `assets/sfx/SFX_LIST.md` (cta_click, tip_pop, key_click, tick_001, impactPlank_medium_000, whoosh_soft…).
