#!/bin/bash
# Music bed under voice+SFX, then master to -14 LUFS, true peak ≤ -1 dBTP.
# usage: mix_bgm.sh <video_in> <music> <start_sec> <out.mp4> [stems_dir]
# env:   REL  music level before ducking, relative to the video's integrated loudness (theme.json music.rel; -9 TIN NÓNG, -11 MẸO)
#        FS   fade-out start in seconds (pipeline sets it to the end-card start), default = end - 2.3 s
# Chain (approved TIN NÓNG settings, ~21 dB music-under-voice while speaking):
#   music: HP 70 Hz, -4 dB bell @2.2 kHz (1.5 oct ≈ 1-4 kHz), dynaudnorm leveller, level REL, limiter -6 dBFS, fades
#   sidechain keyed by voice+SFX: thr -32 dBFS, ratio 2.5, attack 7 ms, release 250 ms (~12 dB duck)
# Done in two ffmpeg passes: in a single graph sidechaincompress truncated the music tail.
set -e
V=$1; T=$2; S=$3; O=$4; W=${5:-$(mktemp -d)}; mkdir -p "$W"
REL=${REL:--9}; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
FS=${FS:-$(python3 -c "print(round($D-2.3,2))")}; FD=$(python3 -c "print(round($D-$FS,2))")
VI=$(ffmpeg -i "$V" -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | awk '{print $2}')
MT=$(python3 -c "print(round($VI+$REL,1))")
ffmpeg -v error -y -ss $S -i "$T" -af "atrim=0:$D,asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,highpass=f=70:p=2,equalizer=f=2200:t=o:w=1.5:g=-4,dynaudnorm=f=400:g=31:m=4:p=0.7,loudnorm=I=$MT:TP=-6:linear=true,aformat=channel_layouts=stereo,alimiter=limit=0.5:attack=3:release=80:level=false,afade=t=in:d=0.4,afade=t=out:st=$FS:d=$FD,aresample=48000" -c:a pcm_s16le "$W/music_preduck.wav"
ffmpeg -v error -y -i "$V" -vn -ar 48000 -ac 2 -c:a pcm_s16le "$W/key.wav"
FC="[1:a]asplit[k][v];[0:a][k]sidechaincompress=threshold=0.025:ratio=2.5:attack=7:release=250:knee=2:detection=rms:makeup=1,asplit[md1][md2];[v][md1]amix=inputs=2:normalize=0:duration=first[a]"
ffmpeg -v error -y -i "$W/music_preduck.wav" -i "$W/key.wav" -filter_complex "$FC" -map "[a]" -c:a pcm_s16le "$W/mix.wav" -map "[md2]" -c:a pcm_s16le "$W/music_ducked.wav"
ffmpeg -v error -y -i "$V" -i "$W/mix.wav" -map 0:v -map 1:a -c:v copy -c:a pcm_s16le -shortest "$W/premaster.mkv"
"$(dirname "$0")/loudnorm.sh" "$W/premaster.mkv" "$O"
echo "mix: music $MT LUFS before ducking (voice $VI, REL $REL), fade $FS s → $(ffmpeg -i "$O" -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I|Peak):' | tr -s ' ' | tr '\n' ' ')"
