#!/usr/bin/env python3
"""duoly-3d: build every texture of the duoly theme into assets/textures/duoly/ (own work).
  python3 build.py            sprites (three.js headless via shot.sh, 2x supersampled -> LANCZOS) + background plates
  python3 build.py plates     plates only (Pillow, no Chrome)
Sprites (transparent PNG, drawn at or below native size, never upscaled):
  ring_*.png   two glossy rings (white + peach) interlocked into a heart, same construction as the brand logo
  puffy_*.png  inflated glossy hearts (pink / peach / white), stickers + floating decoration
Plates (1296x2304 = 1.2x the frame, so look.plateScale 1.03 never enlarges them; scripts/check_plates.py enforces it):
  plate_soft.jpg  cover style "soft": #FFF6F4 -> #FBE3E1 blush, peach/blush/white glows, a few thin outline hearts + dots
                  only in the margins (top band y<290, bottom band y>=1500, outer 90 px), nothing behind text.
  plate_bold.jpg  cover style "bold": #F35570 -> #D80B46 + peach glows (end card)."""
import math,os,subprocess,sys,random
from PIL import Image,ImageDraw,ImageFilter
HERE=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(HERE,'..','..','assets','textures','duoly');os.makedirs(OUT,exist_ok=True)
os.makedirs(os.path.join(HERE,'out'),exist_ok=True)
RING='obj=ring&tilt=-22&env=.5&key=6&ang=52&dx=.5&a=1.2&b=.68&bounce=3'
SPRITES={  # name: (size px, params)
 'ring_hero':(900,RING),
 'ring_a':(480,RING+'&ry=-14&rz=-6'),
 'ring_b':(400,RING+'&ry=24&rx=10&rz=8'),
 'puffy_pink':(520,'obj=puffy&ry=-16&rx=-6&env=.6&res=170&blur=7'),
 'puffy_peach':(520,'obj=puffy&ry=14&rx=4&rz=-10&env=.6&c=peach&blur=7&res=170&pw=.7'),
 'puffy_white':(460,'obj=puffy&ry=-22&rx=8&rz=12&env=.6&c=white&blur=7&res=170'),
 'puffy_coral':(460,'obj=puffy&ry=20&rx=-8&rz=-14&env=.6&c=coral&blur=7&res=170'),
}
def sprite(name,size,params):
    subprocess.run([os.path.join(HERE,'shot.sh'),name,f'{params}&w={size*2}&h={size*2}'],check=True)
    im=Image.open(os.path.join(HERE,'out',name+'.png')).convert('RGBA')
    bb=im.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox();pad=int(size*.04)  # trim to content + small pad
    im=im.crop((max(0,bb[0]-pad*2),max(0,bb[1]-pad*2),min(im.width,bb[2]+pad*2),min(im.height,bb[3]+pad*2)))
    im=im.resize((im.width//2,im.height//2),Image.LANCZOS);im.save(os.path.join(OUT,name+'.png'),optimize=True);print('sprite',name,im.size)
def rgb(h):h=h.lstrip('#');return tuple(int(h[i:i+2],16) for i in (0,2,4))
def grad(w,h,c1,c2):
    d=int(math.hypot(w,h))+4;g=Image.linear_gradient('L').resize((d,d)).rotate(45,resample=Image.BICUBIC)
    g=g.crop(((d-w)//2,(d-h)//2,(d-w)//2+w,(d-h)//2+h));return Image.composite(Image.new('RGB',(w,h),rgb(c2)),Image.new('RGB',(w,h),rgb(c1)),g).convert('RGBA')
def glow(img,cx,cy,r,col,a):
    w,h=img.size;m=Image.new('L',(w,h),0);ImageDraw.Draw(m).ellipse((cx-r,cy-r,cx+r,cy+r),fill=a);m=m.filter(ImageFilter.GaussianBlur(r*.45))
    s=Image.new('RGBA',(w,h),rgb(col)+(255,));s.putalpha(m);img.alpha_composite(s)
def heart(cx,cy,s,n=140):
    return [(cx+16*math.sin(2*math.pi*i/n)**3*s/32,cy-(13*math.cos(2*math.pi*i/n)-5*math.cos(4*math.pi*i/n)-2*math.cos(6*math.pi*i/n)-math.cos(8*math.pi*i/n))*s/32) for i in range(n)]
def deco(img,col,a,spots,rnd):
    """thin outline hearts + dots at fixed margin spots (frame coords x1.2), supersampled"""
    w,h=img.size;ss=3;L=Image.new('L',(w*ss,h*ss),0);d=ImageDraw.Draw(L)
    for kind,x,y,s in spots:
        x,y,s=x*1.2*ss,y*1.2*ss,s*1.2*ss
        if kind=='h':p=heart(x,y,s);d.line(p+[p[0]],fill=a,width=int(3.4*ss),joint='curve')
        else:d.ellipse((x-s,y-s,x+s,y+s),fill=a)
    L=L.resize((w,h),Image.LANCZOS);s=Image.new('RGBA',(w,h),rgb(col)+(255,));s.putalpha(L);img.alpha_composite(s)
W,H=1296,2304
# decoration spots in FRAME coordinates (1080x1920): only top band (y<290), bottom band (y>=1500) and the outer margins
SPOTS=[('h',150,170,46),('h',560,96,30),('d',420,200,5),('d',700,250,4),('h',58,880,34),('d',40,1180,4),('h',1030,620,30),('d',1040,520,4),
       ('h',470,1700,36),('d',610,1850,5),('h',980,1560,28),('d',300,1610,4),('d',860,1880,4)]
def plates():
    rnd=random.Random(7)
    p=grad(W,H,'#FFF6F4','#FBE3E1')
    for cx,cy,r,c,a in [(.06,.05,.42,'#FFFFFF',150),(.98,.36,.36,'#F7C4C1',95),(.02,.70,.34,'#F7928E',55),(.95,.97,.46,'#F7C4C1',120),(.5,.5,.5,'#FFF9F8',70)]:
        glow(p,cx*W,cy*H,r*W,c,a)
    deco(p,'#F35570',58,SPOTS,rnd);p.convert('RGB').save(os.path.join(OUT,'plate_soft.jpg'),quality=92);print('plate_soft',p.size)
    b=grad(W,H,'#F35570','#D80B46')
    for cx,cy,r,c,a in [(.92,.06,.42,'#F78E78',110),(.05,.5,.4,'#ED6974',90),(.9,.9,.44,'#FFB3AE',70),(.3,.18,.35,'#F7928E',60)]:
        glow(b,cx*W,cy*H,r*W,c,a)
    deco(b,'#FFFFFF',50,SPOTS,rnd);b.convert('RGB').save(os.path.join(OUT,'plate_bold.jpg'),quality=92);print('plate_bold',b.size)
if __name__=='__main__':
    plates()
    if 'plates' not in sys.argv:
        for n,(s,pr) in SPRITES.items():sprite(n,s,pr)
