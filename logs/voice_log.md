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
- 2026-10-16 17:44 git-merge-vs-rebase: voice vi-vn-concierge-2 style **hao-hung** (random), 36.3s
- 2026-10-16 17:45 git-merge-vs-rebase: music **sappheiros-perspective** from 8s (random LRU, Content ID: unknown)
- 2026-10-16 17:47 git-merge-vs-rebase: music **sappheiros-perspective** from 8s (pinned, Content ID: unknown)
- 2026-10-16 17:48 git-merge-vs-rebase: music **sappheiros-perspective** from 8s (pinned, Content ID: unknown)
- 2026-10-16 17:53 git-merge-vs-rebase-red: music **sappheiros-perspective** from 8s (pinned, Content ID: unknown)
- 2026-10-16 17:59 inversion-of-control: voice vi-vn-concierge-2 style **ke-chuyen** (random), 61.0s
- 2026-10-16 18:00 inversion-of-control: music **raspberrymusic-technology-background-music** from 0s (random LRU, Content ID: unknown)
- 2026-10-16 18:01 inversion-of-control: voice vi-vn-concierge-2 style **hao-hung** (random), 32.2s
- 2026-10-16 18:01 inversion-of-control: music **alexi-action-ghost** from 0s (random LRU, Content ID: unknown)
- 2026-10-16 18:02 inversion-of-control: voice vi-vn-concierge-2 style **tu-nhien** (random), 46.9s
- 2026-10-16 18:02 inversion-of-control: music **sappheiros-perspective** from 8s (random LRU, Content ID: unknown)
- 2026-10-16 18:04 inversion-of-control: music **sappheiros-perspective** from 8s (pinned, Content ID: unknown)
- 2026-10-16 18:16 inversion-of-control: voice vi-vn-concierge-2 style **tu-nhien** (random), 65.1s
- 2026-10-16 18:17 inversion-of-control: music **raspberrymusic-technology-background-music** from 0s (random LRU, Content ID: unknown)
- 2026-10-16 18:19 inversion-of-control: music **raspberrymusic-technology-background-music** from 0s (pinned, Content ID: unknown)
- 2026-10-16 18:20 inversion-of-control: music **raspberrymusic-technology-background-music** from 0s (pinned, Content ID: unknown)
- 2026-10-16 18:31 inversion-of-control: voice reused from cache 29edd8001c357213f2d3 (style **tu-nhien**, drawn 2026-10-16 18:17), 65.1s, no TTS call
- 2026-10-16 18:31 inversion-of-control: voice reused from cache 29edd8001c357213f2d3 (style **tu-nhien**, drawn 2026-10-16 18:17), 65.1s, no TTS call
- 2026-10-16 18:58 flutter-mvvm: voice vi-vn-concierge-2 style **hao-hung** (random), 151.2s
- 2026-10-16 19:00 flutter-mvvm: music **kuromaru-ft-hereafter-laxin** from 0s (random LRU, Content ID: unknown)
- 2026-10-16 19:01 flutter-mvvm: voice reused from cache ceb0e6ad344eac717dc2 (style **hao-hung**, drawn 2026-10-16 18:58), 151.2s, no TTS call
- 2026-10-16 19:03 flutter-mvvm: music **darknexal-welcome-to-the-cyberspace** from 0s (random LRU, Content ID: unknown)
- 2026-10-16 19:17 flutter-mvvm: voice vi-vn-concierge-2 style **ke-chuyen** (random), 83.1s
- 2026-10-16 19:19 flutter-mvvm: music **sappheiros-perspective** from 0s (pinned, Content ID: unknown)
- 2026-10-16 19:20 flutter-mvvm: music **sappheiros-perspective** from 0s (pinned, Content ID: unknown)
- 2026-10-16 20:52 flutter-mvvm: voice vi-vn-concierge-2 style **tu-nhien** (random), 71.6s
- 2026-10-16 20:54 flutter-mvvm: music **sappheiros-perspective** from 0s (pinned, Content ID: unknown)
- 2026-10-16 20:55 flutter-mvvm: music **sappheiros-perspective** from 0s (pinned, Content ID: unknown)
- 2026-10-16 21:05 flutter-mvvm: voice vi-vn-concierge-2 style **tu-nhien** (random), 78.9s
- 2026-10-16 21:06 flutter-mvvm: music **sappheiros-perspective** from 0s (pinned, Content ID: unknown)
- 2026-10-16 21:07 flutter-mvvm: music **sappheiros-perspective** from 0s (pinned, Content ID: unknown)
- 2026-10-16 21:21 openai-vs-apple-glitch: voice = pinned file voice_approved.mp3
- 2026-10-16 21:21 openai-vs-apple-glitch: music **nastelbom-epic-cinematic-602522** from 20s (random LRU, Content ID: registered)
- 2026-10-16 21:22 openai-vs-apple-glitch: music **pink_sound-storm-zone-epic-background-instrumental-music-for-video-short-1-587216** from 0s (random LRU, Content ID: registered)
- 2026-10-16 21:28 openai-vs-apple-glitch: music **pink_sound-storm-zone-epic-background-instrumental-music-for-video-short-1-587216** from 0s (pinned, Content ID: registered)
- 2026-10-16 21:29 openai-vs-apple-glitch: music **pink_sound-storm-zone-epic-background-instrumental-music-for-video-short-1-587216** from 0s (pinned, Content ID: registered)
- 2026-10-16 21:30 openai-vs-apple-glitch: music **pink_sound-storm-zone-epic-background-instrumental-music-for-video-short-1-587216** from 0s (pinned, Content ID: registered)
