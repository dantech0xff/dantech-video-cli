#!/usr/bin/env python3
"""Mobile safe-zone overlay + text check for 1080x1920 frames (TikTok / Reels / YouTube Shorts / Facebook Reels).

usage:
  python3 scripts/safezone.py frame.png [more.png ...] -o out_dir     # writes <name>_sz.png per frame + prints report, exit 1 if any ⚠️
  python3 scripts/safezone.py --sheet out.png a_sz.png b_sz.png ...    # tile overlays into one sheet

Zones (px on 1080x1920), constants mirror remotion/src/safezone.ts (ZONE):
  NO-TEXT (red fill, must hold NO text or information, brand / page number included):
    top    y < 290   (search bar, Following/For You tabs, LIVE, status bar; no brand-band exception any more)
    bottom y >= 1500 (description, music ticker, nav bar)
    left   x < 60
    right  x >= 880 for y 700..1500 (like / comment / share / avatar rail)
  STRICT (yellow outline) = union of official ad templates: top 288, bottom 672, left 120, right 192, TikTok rail x>=780 from y 840.
Check: the frame is cut into 24x24 px cells; a cell is "texty" when it has strong luminance edges in BOTH directions
(glyphs, icons). Flat fills, straight rails/rules, soft gradients and faint mid-ground shapes do not count, so the
check flags text, not decoration. A zone is ⚠️ when it has >= 2 texty cells; the y-range of the hits is printed.
Still look at the overlay: the heuristic can miss very faint text or flag a busy photo."""
import sys,os
import numpy as np
from PIL import Image,ImageDraw,ImageFont
W,H=1080,1920
TOP=290;BOTTOM=1500;LEFT=60;RAIL_X=880;RAIL_Y=700   # keep in sync with remotion/src/safezone.ts
STR=dict(top=288,bottom=672,left=120,right=192,rail_x=780,rail_y=840)
CELL=24;GRAD=50;MIN_EDGES=4;MIN_CELLS=2
def zones():
    return {'top':(0,0,W,TOP),'bottom':(0,BOTTOM,W,H),'left':(0,0,LEFT,H),'right':(RAIL_X,RAIL_Y,W,BOTTOM)}
def texty(im):
    """bool grid (H/CELL, W/CELL): cells with strong edges in both x and y"""
    L=np.asarray(im.convert('L'),dtype=np.int16)
    gx=np.zeros_like(L);gy=np.zeros_like(L);gx[:,1:-1]=np.abs(L[:,2:]-L[:,:-2]);gy[1:-1,:]=np.abs(L[2:,:]-L[:-2,:])
    def cnt(g):return (g>GRAD).reshape(H//CELL,CELL,W//CELL,CELL).sum(axis=(1,3))
    return (cnt(gx)>=MIN_EDGES)&(cnt(gy)>=MIN_EDGES)
def check(im):
    T=texty(im);rep={}
    for k,(x0,y0,x1,y1) in zones().items():
        # a cell belongs to a zone when it lies fully inside it
        sub=T[-(-y0//CELL):y1//CELL,-(-x0//CELL):x1//CELL];ys=np.nonzero(sub.any(axis=1))[0]
        rep[k]=(int(sub.sum()),(int((ys[0]+(-(-y0//CELL)))*CELL),int((ys[-1]+1+(-(-y0//CELL)))*CELL)) if len(ys) else None)
    return rep,T
def overlay(path,out):
    im=Image.open(path).convert('RGB').resize((W,H));rep,T=check(im)
    ov=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(ov)
    for b in zones().values(): d.rectangle(b,fill=(255,0,0,70))
    s=STR;d.rectangle((s['left'],s['top'],W-s['right'],H-s['bottom']),outline=(255,215,0,255),width=4)
    d.rectangle((s['rail_x'],s['rail_y'],W-s['right'],H-s['bottom']),outline=(255,215,0,160),width=2)
    d.line((0,TOP,W,TOP),fill=(255,0,0,255),width=2)
    for k,(x0,y0,x1,y1) in zones().items():   # outline texty cells found inside the zones
        for r,c in zip(*np.nonzero(T)):
            X,Y=c*CELL,r*CELL
            if x0<=X and X+CELL<=x1 and y0<=Y and Y+CELL<=y1: d.rectangle((X,Y,X+CELL-1,Y+CELL-1),outline=(0,255,255,255),width=2)
    Image.alpha_composite(im.convert('RGBA'),ov).convert('RGB').save(out);return rep
def sheet(out,files,cols=5,labels=None):
    ims=[Image.open(f).convert('RGB').resize((432,768)) for f in files];rows=(len(ims)+cols-1)//cols
    S=Image.new('RGB',(cols*432,rows*(768+44)),(17,17,17));d=ImageDraw.Draw(S)
    try: font=ImageFont.truetype(os.path.join(os.path.dirname(__file__),'../remotion/public/fonts/bvp_xb.ttf'),24)
    except Exception: font=None
    for i,im in enumerate(ims):
        x,y=(i%cols)*432,(i//cols)*(768+44);S.paste(im,(x,y+44));d.text((x+10,y+8),(labels[i] if labels else os.path.basename(files[i])),fill=(255,255,255),font=font)
    S.save(out)
if __name__=='__main__':
    a=sys.argv[1:]
    if a and a[0]=='--sheet': sheet(a[1],a[2:]);sys.exit()
    od='.' if '-o' not in a else a[a.index('-o')+1];fs=[x for i,x in enumerate(a) if x!='-o' and (i==0 or a[i-1]!='-o')];bad=0
    for f in fs:
        os.makedirs(od,exist_ok=True);out=os.path.join(od,os.path.splitext(os.path.basename(f))[0]+'_sz.png');r=overlay(f,out)
        hit={k:v for k,v in r.items() if v[0]>=MIN_CELLS};bad+=bool(hit)
        print(os.path.basename(f),' '.join(f"{k}:{n}" for k,(n,_) in r.items()),('⚠️ text in '+', '.join(f"{k} (y {v[1][0]}-{v[1][1]})" for k,v in hit.items())) if hit else '✅')
    print(f'{len(fs)} frames, {bad} with text in a no-text zone');sys.exit(1 if bad else 0)
