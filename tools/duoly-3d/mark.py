#!/usr/bin/env python3
# usage: python3 tools/duoly-3d/mark.py  -> assets/brand/duoly/duoly-mark.png (640 px wide, transparent)
# plain logo mark: matte the two rings out of the supplied square logo (pink gradient background)
import numpy as np,sys,os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../assets/brand/duoly')
from PIL import Image,ImageFilter
im=np.asarray(Image.open(os.path.join(R,'duoly-logo.jpg')).convert('RGB')).astype(np.float64)/255;H,W,_=im.shape
yy,xx=np.mgrid[0:H,0:W]/H
m=np.zeros((H,W),bool);b=110;m[:b]=m[-b:]=True;m[:,:b]=m[:,-b:]=True
X=np.stack([np.ones_like(xx),xx,yy,xx*yy,xx**2,yy**2],-1);bg=np.zeros_like(im)
for c in range(3):
    coef,*_=np.linalg.lstsq(X[m],im[...,c][m],rcond=None);bg[...,c]=X@coef
ss=lambda v,lo,hi:(lambda t:t*t*(3-2*t))(np.clip((v-lo)/(hi-lo),0,1))
aG=ss(im[...,1]-bg[...,1],0.16,0.34)                                   # white ring (+ soft glow)
aH=ss((im[...,1]-im[...,2])-(bg[...,1]-bg[...,2]),0.07,0.13)            # peach ring: hue swings from pink to orange
a=np.maximum(aG,aH)
A=Image.fromarray((a*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
img=Image.fromarray((im*255).round().astype(np.uint8)).convert('RGBA');img.putalpha(A)
bb=A.point(lambda v:255 if v>10 else 0).getbbox();pad=8;bb=(bb[0]-pad,bb[1]-pad,bb[2]+pad,bb[3]+pad)
out=img.crop(bb);out=out.resize((640,round(out.height*640/out.width)),Image.LANCZOS)
out.save(os.path.join(R,'duoly-mark.png'));print(bb,out.size)
