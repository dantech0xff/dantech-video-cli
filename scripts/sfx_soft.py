# Generates soft transition air (own work). Prints listening metrics: high-band energy, centroid, edge samples.
#   python3 scripts/sfx_soft.py            -> assets/sfx/slide_soft.wav (android-tutor shared-axis slide, default)
#   python3 scripts/sfx_soft.py morph      -> assets/sfx/morph_soft.wav (spare)
#   python3 scripts/sfx_soft.py quarter    -> assets/sfx/quarter_soft.wav (loot-crypto quarter sweep: 0.56 s, peak -23 dBFS at 0.2 s = fastest part of the sweep, dark air, no whistle)
#   python3 scripts/sfx_soft.py drift      -> assets/sfx/drift_soft.wav (duoly drift: 0.5 s, peak -24 dBFS at 0.2 s, warm air, barely there)
#   python3 scripts/sfx_soft.py bubble     -> assets/sfx/bubble_soft.wav (duoly chat bubble / sticker: 0.14 s soft sine blip 720->540 Hz, peak -24 dBFS, no click)
#   python3 scripts/sfx_soft.py hero       -> assets/sfx/hero_soft.wav (flutter-tutor Hero flight: 0.5 s, peak -22 dBFS at 0.24 s = fastest part of the flight)
import sys
P={'slide':dict(D=0.45,pk=0.17,lo=300,hi=600,lo2=320,hi2=520,peak=-20),'morph':dict(D=0.72,pk=0.333,lo=500,hi=1300,lo2=550,hi2=1250,peak=-12),'hero':dict(D=0.5,pk=0.24,lo=260,hi=480,lo2=280,hi2=420,peak=-22),'quarter':dict(D=0.56,pk=0.2,lo=380,hi=760,lo2=400,hi2=620,peak=-22),'drift':dict(D=0.5,pk=0.2,lo=280,hi=520,lo2=300,hi2=420,peak=-24)}
KIND=sys.argv[1] if len(sys.argv)>1 else 'slide'
if KIND=='bubble':  # soft sine blip (duoly chat bubbles / stickers): pitch glide down, raised-cosine envelope, 2nd harmonic at -18 dB
    import numpy as np,wave,os
    SR=48000;D=0.14;n=int(SR*D);t=np.arange(n)/SR;f=720-180*(t/D);ph=2*np.pi*np.cumsum(f)/SR
    y=np.sin(ph)+0.12*np.sin(2*ph);env=np.sin(np.pi*np.clip(t/0.025,0,.5))**2*np.cos(np.pi/2*np.clip((t-0.0125)/(D-0.0125),0,1))**2
    y*=env;y/=np.abs(y).max();y*=10**(-24/20);y[0]=0;y[-1]=0
    wv=wave.open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets','sfx','bubble_soft.wav'),'wb');wv.setnchannels(1);wv.setsampwidth(2);wv.setframerate(SR);wv.writeframes((y*32767).astype('<i2').tobytes());wv.close()
    Y=np.abs(np.fft.rfft(y))**2;F=np.fft.rfftfreq(n,1/SR);print('bubble_soft: centroid %.0f Hz, >4k %.3f%%, peak -24 dBFS'%((F*Y).sum()/Y.sum(),100*Y[F>4000].sum()/Y.sum()));sys.exit()
P=P[KIND];NAME=KIND+'_soft'
# pink-ish noise through a swept 3-pole low-pass, raised-cosine envelope peaking at pk (synced to the visual peak of the transition)
import numpy as np,wave,os
SR=48000;D=P['D'];n=int(SR*D);t=np.arange(n)/SR;rng=np.random.default_rng(7)
w=rng.standard_normal(n)
# pink-ish: cumulative sum of white, leaky (brown-ish), mix with white
b=np.zeros(n);acc=0
for i in range(n): acc=0.985*acc+w[i]*0.15; b[i]=acc
x=0.5*b+0.5*w
pk=P['pk']
fc=np.where(t<pk,P['lo']+P['hi']*np.sin(np.pi/2*t/pk)**2,P['lo2']+P['hi2']*np.cos(np.pi/2*np.clip((t-pk)/(D-pk),0,1))**2)
def lp(x,fc):
    y=np.zeros_like(x);s=0
    for i in range(len(x)):
        a=1-np.exp(-2*np.pi*fc[i]/SR); s+=a*(x[i]-s); y[i]=s
    return y
y=lp(lp(lp(x,fc*1.2),fc*1.4),fc*1.6)  # 3 poles, 18 dB/oct
y=y-np.convolve(y,np.ones(480)/480,'same')  # remove DC / sub rumble (~<100 Hz)
env=np.where(t<pk,np.sin(np.pi/2*t/pk)**2,np.cos(np.pi/2*np.clip((t-pk)/(D-pk),0,1))**2)
y*=env;y/=np.abs(y).max();y*=10**(P['peak']/20)   # file peak; Timeline also plays it at 0.5
y[:48]*=np.linspace(0,1,48);y[-48:]*=np.linspace(1,0,48)
wv=wave.open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets','sfx',NAME+'.wav'),'wb');wv.setnchannels(1);wv.setsampwidth(2);wv.setframerate(SR);wv.writeframes((y*32767).astype('<i2').tobytes());wv.close()
# metrics
Y=np.abs(np.fft.rfft(y))**2;F=np.fft.rfftfreq(n,1/SR);tot=Y.sum()
print('energy >2k %.2f%%  >4k %.3f%%  >8k %.4f%%'%(100*Y[F>2000].sum()/tot,100*Y[F>4000].sum()/tot,100*Y[F>8000].sum()/tot))
print('centroid %.0f Hz'%((F*Y).sum()/tot))
print('first/last sample',y[0],y[-1],' max sample-to-sample step %.4f'%np.abs(np.diff(y)).max())
