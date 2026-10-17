# Generates assets/sfx/morph_soft.wav (own work). Prints listening metrics: high-band energy, centroid, edge samples.
# soft morph whoosh: pink-ish noise through a swept one-pole low-pass (350 -> 1500 -> 450 Hz), raised-cosine envelope peaking at 0.333 s
import numpy as np,wave,os
SR=48000;D=0.72;n=int(SR*D);t=np.arange(n)/SR;rng=np.random.default_rng(7)
w=rng.standard_normal(n)
# pink-ish: cumulative sum of white, leaky (brown-ish), mix with white
b=np.zeros(n);acc=0
for i in range(n): acc=0.985*acc+w[i]*0.15; b[i]=acc
x=0.5*b+0.5*w
pk=0.333
fc=np.where(t<pk,500+1300*np.sin(np.pi/2*t/pk)**2,550+1250*np.cos(np.pi/2*np.clip((t-pk)/(D-pk),0,1))**2)
def lp(x,fc):
    y=np.zeros_like(x);s=0
    for i in range(len(x)):
        a=1-np.exp(-2*np.pi*fc[i]/SR); s+=a*(x[i]-s); y[i]=s
    return y
y=lp(lp(lp(x,fc*1.2),fc*1.4),fc*1.6)  # 3 poles, 18 dB/oct
y=y-np.convolve(y,np.ones(480)/480,'same')  # remove DC / sub rumble (~<100 Hz)
env=np.where(t<pk,np.sin(np.pi/2*t/pk)**2,np.cos(np.pi/2*np.clip((t-pk)/(D-pk),0,1))**2)
y*=env;y/=np.abs(y).max();y*=10**(-12/20)   # peak -12 dBFS (Timeline also plays it at 0.5)
y[:48]*=np.linspace(0,1,48);y[-48:]*=np.linspace(1,0,48)
wv=wave.open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets','sfx','morph_soft.wav'),'wb');wv.setnchannels(1);wv.setsampwidth(2);wv.setframerate(SR);wv.writeframes((y*32767).astype('<i2').tobytes());wv.close()
# metrics
Y=np.abs(np.fft.rfft(y))**2;F=np.fft.rfftfreq(n,1/SR);tot=Y.sum()
print('energy >2k %.2f%%  >4k %.3f%%  >8k %.4f%%'%(100*Y[F>2000].sum()/tot,100*Y[F>4000].sum()/tot,100*Y[F>8000].sum()/tot))
print('centroid %.0f Hz'%((F*Y).sum()/tot))
print('first/last sample',y[0],y[-1],' max sample-to-sample step %.4f'%np.abs(np.diff(y)).max())
