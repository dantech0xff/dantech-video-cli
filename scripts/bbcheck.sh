#!/usr/bin/env bash
# Overlap audit for a rendered video: re-renders every frame with props.debugBB=true (remotion/src/bbcheck.tsx paints the
# intersection of any two content boxes magenta), then lists the frames/boxes that overlap. No TTS, no mix.
#   scripts/bbcheck.sh videos/<slug>/script.json [every_nth=1]
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/.." && pwd); SCRIPT=$1; N=${2:-1}
OUT=$(dirname "$ROOT/$SCRIPT")/out; THEME=$(cd "$ROOT/scripts" && python3 -c "import json;from common import theme_id;print(theme_id(json.load(open('$ROOT/$SCRIPT'))['theme']))")
D=$OUT/bbcheck; rm -rf "$D"; mkdir -p "$D/frames"
python3 -c "import json;p=json.load(open('$OUT/props.json'));p['debugBB']=True;json.dump(p,open('$D/props.json','w'),ensure_ascii=False)"
(cd "$ROOT/remotion" && npx remotion render src/index.ts "$THEME" "$D/frames" --sequence --image-format=jpeg --scale=0.25 --props="$D/props.json" --log=verbose --muted 2>&1 | grep -o 'BBX [0-9]* .*' | sort -u -k2,2n > "$D/log.txt" || true)
python3 - "$D" "$N" <<'PY'
import sys,os,glob,json
from PIL import Image
d,n=sys.argv[1],int(sys.argv[2]);bad=[]
for fp in sorted(glob.glob(d+'/frames/*.jpeg'))[::n]:
    im=Image.open(fp).convert('RGB');px=im.getdata()
    c=sum(1 for r,g,b in px if r>200 and g<70 and b>200)
    if c>6: bad.append((os.path.basename(fp),c))
print(f'frames with overlaps: {len(bad)}')
for b in bad[:60]: print('  ',*b)
log=open(d+'/log.txt').read().strip()
if log: print('boxes (from browser log):');print(log[:4000])
sys.exit(1 if bad else 0)
PY
