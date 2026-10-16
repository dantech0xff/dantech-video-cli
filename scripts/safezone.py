#!/usr/bin/env python3
"""Mobile safe-zone overlay + rough violation check for 1080x1920 frames.

usage:
  python3 scripts/safezone.py frame.png [more.png ...] -o out_dir     # writes <name>_sz.png per frame + prints report
  python3 scripts/safezone.py --sheet out.png a_sz.png b_sz.png ...    # tile overlays into one sheet

Zones (px on 1080x1920), see docs in .agents/skills/render-video/SKILL.md:
  STRICT  = union of official ad templates (TikTok/Meta Reels/YouTube Shorts): top 288, bottom 672, left 120, right 192,
            plus TikTok action rail x>=780 from y>=840.
  ORGANIC = conservative union of in-app (organic) UI: top 250, bottom 420, left 60, right 200 (action rail, whole height below 700).
Red fill = ORGANIC (must keep clear), yellow outline = STRICT (nice to keep clear).
Check: pixels that differ from the frame's background colour inside each ORGANIC zone (rough, flags text/graphics)."""
import sys,os
from PIL import Image,ImageDraw,ImageFont
W,H=1080,1920
ORG=dict(top=250,bottom=420,left=60,right=200,rail_y=700)
STR=dict(top=288,bottom=672,left=120,right=192,rail_x=780,rail_y=840)
def zones():
    o=ORG;return {'top':(0,0,W,o['top']),'bottom':(0,H-o['bottom'],W,H),'left':(0,0,o['left'],H),'right':(W-o['right'],o['rail_y'],W,H-o['bottom'])}
def busy(im,box,bg,thr=48):
    c=im.crop(box).convert('RGB').resize((max(1,(box[2]-box[0])//4),max(1,(box[3]-box[1])//4)));px=list(c.get_flattened_data() if hasattr(c,"get_flattened_data") else c.getdata())
    d=[p for p in px if sum(abs(p[i]-bg[i]) for i in range(3))>thr];return len(d)/max(1,len(px))
def overlay(path,out):
    im=Image.open(path).convert('RGB').resize((W,H));bg=im.getpixel((W//2,H//2-300)) if False else im.getpixel((W-6,H//2))
    ov=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(ov)
    rep={}
    for k,b in zones().items():
        d.rectangle(b,fill=(255,0,0,70));rep[k]=busy(im,b,bg)
    s=STR;d.rectangle((s['left'],s['top'],W-s['right'],H-s['bottom']),outline=(255,215,0,255),width=4)
    d.rectangle((s['rail_x'],s['rail_y'],W-s['right'],H-s['bottom']),outline=(255,215,0,160),width=2)
    o=Image.alpha_composite(im.convert('RGBA'),ov).convert('RGB')
    o.save(out);return rep
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
    od='.' if '-o' not in a else a[a.index('-o')+1];fs=[x for i,x in enumerate(a) if x!='-o' and (i==0 or a[i-1]!='-o')]
    for f in fs:
        os.makedirs(od,exist_ok=True);out=os.path.join(od,os.path.splitext(os.path.basename(f))[0]+'_sz.png');r=overlay(f,out)
        print(os.path.basename(f),' '.join(f"{k}:{v*100:.0f}%" for k,v in r.items()),'⚠️' if max(r.values())>0.01 else '✅')
