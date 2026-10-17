#!/usr/bin/env python3
"""Layer 3 hard gate: 'voice talks but the screen is static' check on the rendered video (no TTS, no mix).
Renders low-res frames (every 3rd frame, scale 0.25) with props.qc=true, which hides karaoke captions, mid-ground
shapes and other [data-deco] decoration, then measures pixel change between samples inside the frame body (y 290..1500).
A sample counts as a visual change when >= MIN_PX pixels move by > LEVEL grey levels. Every sliding WINDOW_S window that
lies inside the narration (first word .. last word) must contain a change; otherwise exit 1 with the exact timestamps.
A scene with "still": true (quote-like) may hold one static stretch up to 5 s (reported as exempt); longer fails.
  python3 scripts/static_gate.py videos/<slug>/script.json [--frames DIR]
Writes videos/<slug>/out/gate.json. ./dt render runs it as stage "gate" (before mix: no final mp4 for a static video)."""
import sys,os,json,glob,re,subprocess,shutil
import numpy as np
from PIL import Image
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import load,video_paths,theme_id,ROOT
WINDOW_S=3.0; STILL_MAX_S=5.0; LEVEL=18; MIN_PX=45; NTH=3; SCALE=.25; FPS=30
args=[a for a in sys.argv[1:] if not a.startswith('--')]; sp=args[0]
S=load(sp); vdir,out,slug=video_paths(sp); P=load(os.path.join(out,'props.json'))
fd=os.path.join(out,'qc_frames')
if '--frames' in sys.argv: fd=sys.argv[sys.argv.index('--frames')+1]
else:
    shutil.rmtree(fd,ignore_errors=True)  # never mix in frames from an older, longer render
    r=subprocess.run(['node','qc_frames.mjs',theme_id(S['theme']),os.path.join(out,'props.json'),fd,str(NTH),str(SCALE)],cwd=os.path.join(ROOT,'remotion'),capture_output=True,text=True)
    if r.returncode: print(r.stdout[-2000:],r.stderr[-3000:]); sys.exit('gate: could not render qc frames')
fs=sorted(glob.glob(os.path.join(fd,'*.jpeg'))+glob.glob(os.path.join(fd,'*.jpg')),key=lambda p:int(re.findall(r'\d+',os.path.basename(p))[-1]))
frames=[int(re.findall(r'\d+',os.path.basename(p))[-1])*NTH for p in fs]  # Remotion numbers the sampled frames 0,1,2… (index, not frame)
if len(fs)<2: sys.exit('gate: no qc frames')
prev=None;chg=[]
for p in fs:
    a=np.asarray(Image.open(p).convert('L'),dtype=np.int16);h=a.shape[0];a=a[int(h*290/1920):int(h*1500/1920)]
    if prev is not None: chg.append(int((np.abs(a-prev)>LEVEL).sum()))
    prev=a
moves=[f for f,c in zip(frames[1:],chg) if c>=MIN_PX]
W=P['words'];vs=round(W[0]['s']*FPS);ve=min(round(W[-1]['e']*FPS),P['outro']['start'])
win=round(WINDOW_S*FPS);bad=[]
for w0 in range(vs,max(vs,ve-win)+1,NTH):
    if not any(w0<m<=w0+win for m in moves): bad.append(w0)
# merge into static stretches [start, end]
stretches=[]
for w0 in bad:
    if stretches and w0<=stretches[-1][1]: stretches[-1][1]=w0+win
    else: stretches.append([w0,w0+win])
starts=[0];[starts.append(starts[-1]+s['dur']) for s in P['scenes']]
def sidx(f): return max(i for i in range(len(P['scenes'])) if starts[i]<=f)
def where(f):
    k=sidx(f);return f"scene {k+1} ({P['scenes'][k]['type']})"
# still:true scenes (quote-like) may hold a static screen up to STILL_MAX_S; longer still fails
exempt=[];fail=[]
for a,b in stretches:
    k=sidx(a);sc=S['scenes'][k] if k<len(S['scenes']) else {}
    (exempt if sc.get('still') and b<=starts[k+1]+NTH and (b-a)/FPS<=STILL_MAX_S else fail).append((a,b))
stretches=fail
rep={'window_s':WINDOW_S,'level':LEVEL,'min_px':MIN_PX,'every_nth':NTH,'scale':SCALE,'still_max_s':STILL_MAX_S,'voiced':[vs/FPS,ve/FPS],'samples':len(fs),
     'changes':[f/FPS for f in moves],'static':[{'from':a/FPS,'to':b/FPS,'where':where(a)} for a,b in fail],
     'exempt':[{'from':a/FPS,'to':b/FPS,'where':where(a)+' still:true'} for a,b in exempt],'pass':not fail}
json.dump(rep,open(os.path.join(out,'gate.json'),'w'),ensure_ascii=False,indent=1)
if stretches:
    print(f'gate: ❌ FAIL static screen while the voice talks ({len(stretches)} stretch(es), window {WINDOW_S:.0f}s):')
    for a,b in stretches: print(f'   {a/FPS:6.2f}s – {b/FPS:6.2f}s  ({(b-a)/FPS:.1f}s)  {where(a)}')
    print('   fix: anchor props through the say, add "overlays"/"kw", or leave autofill on (see write-script "Nhịp hình"); still:true scenes may hold ≤ 5 s only.')
    sys.exit(1)
for a,b in exempt: print(f'gate: still:true exempt {a/FPS:6.2f}s – {b/FPS:6.2f}s ({(b-a)/FPS:.1f}s ≤ {STILL_MAX_S:.0f}s)  {where(a)}')
print(f'gate: ✅ PASS no static {WINDOW_S:.0f}s window in {vs/FPS:.1f}–{ve/FPS:.1f}s ({len(moves)} change samples / {len(fs)} frames)')
