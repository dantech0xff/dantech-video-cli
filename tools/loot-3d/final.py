# final plate: color + depth pass -> depth-of-field + vignette + fine grain. usage: final.py name W H "extra params" focus(0..1) [layfile]
import json,urllib.parse,subprocess,sys
import numpy as np
from PIL import Image,ImageFilter
name,W,H,extra,focus=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4],float(sys.argv[5]);layf=sys.argv[6] if len(sys.argv)>6 else 'lay.json'
lay=json.loads(open(layf).read())
base=f"obj=plate&w={W}&h={H}&fov=34&cx=0&cy=5.6&cz=8&ly=-0.6&lay="+urllib.parse.quote(json.dumps(lay))+extra
subprocess.run(['./shot.sh',name+'_c',base]);subprocess.run(['./shot.sh',name+'_d',base+'&depth=1&dn=4&df=16'])
c=Image.open(f'out/{name}_c.png').convert('RGBA');bg=Image.new('RGBA',c.size,(8,8,10,255));bg.alpha_composite(c);c=np.asarray(bg.convert('RGB')).astype(np.float32)
d=np.asarray(Image.open(f'out/{name}_d.png').convert('L')).astype(np.float32)/255
coc=np.clip(np.abs(d-focus)*float(sys.argv[7] if len(sys.argv)>7 else 3.2),0,1)  # 0 sharp .. 1 max blur
lv=[c]+[np.asarray(Image.fromarray(c.astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) for r in [x*W/594 for x in (1.5,3.5,7,12)]]
x=coc*4;i=np.clip(np.floor(x).astype(int),0,3);t=(x-i)[...,None]
out=np.zeros_like(c)
for k in range(4):
    m=(i==k)[...,None];out+=m*(lv[k]*(1-t)+lv[k+1]*t)
yy,xx=np.mgrid[0:H,0:W];vx=(xx/W-.5)*1.1;vy=(yy/H-.45)*.95;v=np.clip(1-(vx**2+vy**2)*.7,0.5,1)[...,None]
out*=v
rng=np.random.default_rng(3);out+=rng.normal(0,1.6,out.shape)
Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(f'out/{name}.png')
print('saved',name)
