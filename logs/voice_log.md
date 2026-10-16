# Voice & music log

Every render appends the voice style and music it used (random picks are the rule; pinned ones say so).

## History before this repo (from /workspace/dantech-drama/voice_log.md)
### final_v5.mp4 (16 Oct 2026, 15:49 SGT)
- Voice: **concierge2_hao-hung** (Gemini `gemini-3.8-flash-tts`, voice `vi-vn-concierge-2`, style "hào hứng, năng lượng, bản tin drama"). Picked at random with python `random.choice` from: hao-hung, ke-chuyen, tu-nhien.
- File: /workspace/dantech-voice/gemini/concierge2_hao-hung.mp3 (29.57 s)
- Theme: TIN NÓNG, no music, v4 Kenney SFX unchanged. Mix -14.0 LUFS integrated, -1.5 dBTP peak.
- Word timings: Gemini word-level alignment, warped onto measured silence boundaries (v5/words_v5.json).

### BGM rotation (TIN NÓNG), rule since 16 Oct 2026
Every TIN NÓNG render picks 1 of the 7 approved Pixabay tracks at random (tin_nong_bgm.sh) and logs the pick below. Tracks 4-7 are registered with Content ID, so a claim is possible.
- 16 Oct 2026 16:12 SGT · v5_bgm_3_fix.mp4: Bài 3 the_mountain-cinematic-epic-576562 (start 7s, Content ID: no), mix_bgm.sh v2. Chosen manually (re-mix of v5_bgm_3), not a random pick

### MẸO NHANH meo_v1.mp4 (16 Oct 2026 16:33 SGT)
- Voice: vi-vn-concierge-2, style **kể chuyện** ("kể chuyện kịch tính, hồi hộp"), picked at random (python random.choice) from hào hứng / kể chuyện / tự nhiên YouTuber. Fresh TTS of /workspace/dantech-style/meo/script.txt, 42.9 s.
- Music: "Lofi Hip Hop Upbeat" by raspberrymusic (CC BY 4.0, credit required) via Wikimedia Commons, section 0:00, mix_bgm.sh REL=-11 FS=43.7. Content ID: unknown (not checked).

## Repo renders
- 2026-10-16 16:47 openai-vs-apple: voice = pinned file voice_approved.mp3
- 2026-10-16 16:48 openai-vs-apple: music **the_mountain-cinematic-epic-576562** from 7s (pinned, Content ID: none)
- 2026-10-16 16:49 android-studio-shortcuts: voice = pinned file voice_approved.mp3
- 2026-10-16 16:50 android-studio-shortcuts: music **raspberrymusic-lofi-hip-hop-upbeat** from 0s (pinned, Content ID: unknown)
- 2026-10-16 16:50 android-studio-shortcuts: music **raspberrymusic-lofi-hip-hop-upbeat** from 0s (pinned, Content ID: unknown)
- 2026-10-16 16:51 openai-vs-apple: music **the_mountain-cinematic-epic-576562** from 7s (pinned, Content ID: none)
- 2026-10-16 16:51 tts-test: voice vi-vn-concierge-2 style **tu-nhien** (random), 33.1s
- 2026-10-16 16:52 tts-test: music **the_mountain-epic-cinematic-576567** from 15s (random, Content ID: none)
