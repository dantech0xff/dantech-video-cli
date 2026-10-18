#!/usr/bin/env python3
"""Guard against upscaled (soft, "zoomed") full-frame background plates.
usage: python3 scripts/check_plates.py [theme-id ...]   (no args: every theme) → exit 1 on any failure.
A theme that draws photographic/pre-rendered plates lists them in theme.json look.plates (paths under assets/) and the
largest scale it ever applies in look.plateScale (drift/push included). Each plate must be at least
1080·plateScale × 1920·plateScale pixels, so the renderer never enlarges it. Also fails if plateScale > 1.05
(Dan, 18/10/2026: slow translate drift only, no visible zoom)."""
import glob,json,math,os,sys
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ids=sys.argv[1:] or [os.path.basename(os.path.dirname(p)) for p in sorted(glob.glob(os.path.join(ROOT,'themes','*','theme.json')))]
bad=0
for tid in ids:
    tp=os.path.join(ROOT,'themes',tid,'theme.json')
    if not os.path.isfile(tp): continue
    L=json.load(open(tp,encoding='utf-8')).get('look',{});pl=L.get('plates') or []
    if not pl: continue
    ms=float(L.get('plateScale',1.0))
    if ms>1.05: print(f'❌ {tid}: look.plateScale {ms} > 1.05 (drift must stay a subtle translate)');bad+=1
    need=(math.ceil(1080*ms),math.ceil(1920*ms))
    for rel in pl:
        f=os.path.join(ROOT,'assets',rel)
        if not os.path.isfile(f): print(f'❌ {tid}: plate {rel} not found under assets/');bad+=1;continue
        w,h=Image.open(f).size
        if w<need[0] or h<need[1]: print(f'❌ {tid}: {rel} is {w}x{h}, needs ≥ {need[0]}x{need[1]} (1080x1920 × plateScale {ms}); re-render it bigger');bad+=1
        else: print(f'✅ {tid}: {rel} {w}x{h} ≥ {need[0]}x{need[1]}')
sys.exit(1 if bad else 0)
