#!/bin/bash
# Two-pass EBU R128 normalisation of a video's audio (video stream copied).
# usage: loudnorm.sh <in.mp4> <out.mp4> [target LUFS, default -14]   (true-peak target -2 dBTP so the AAC encode stays below -1 dBTP)
set -e
I=${3:--14}
J=$(ffmpeg -v info -i "$1" -af loudnorm=I=$I:TP=-2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$1" -c:v copy -af "loudnorm=I=$I:TP=-2:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a aac -b:a 192k "$2"
