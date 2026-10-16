#!/bin/bash
# QA: compare a render with a reference video (duration + SSIM at sample frames + side-by-side sheet).
# usage: compare.sh <new.mp4> <reference.mp4> <sheet.png> <frame> [frame...]
set -e
A=$1; B=$2; OUT=$3; shift 3
echo "duration new $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A")s, reference $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$B")s"
T=$(mktemp -d); i=0
for f in "$@"; do
 for v in A B; do ffmpeg -v error -y -i "${!v}" -vf "select=eq(n\,$f),scale=270:-1" -frames:v 1 "$T/$v$i.png"; done
 echo "frame $f SSIM $(ffmpeg -i "$T/A$i.png" -i "$T/B$i.png" -lavfi ssim -f null - 2>&1 | grep -o 'All:[0-9.]*')"
 ffmpeg -v error -y -i "$T/A$i.png" -i "$T/B$i.png" -filter_complex vstack "$T/p$i.png"; i=$((i+1))
done
ffmpeg -v error -y $(for k in $(seq 0 $((i-1))); do echo -i $T/p$k.png; done) -filter_complex hstack=$i "$OUT"
