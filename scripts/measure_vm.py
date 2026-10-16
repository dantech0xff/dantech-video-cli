#!/usr/bin/env python3
"""QA: how far the music sits under the voice while words are spoken.
usage: measure_vm.py <voice+sfx audio> <ducked music stem> <words.json>
Uses 400 ms momentary loudness; frames count as speech when inside a word and the voice is above -26 LUFS."""
import subprocess,re,json,sys,numpy as np
def momentary(f):
    e=subprocess.run(['ffmpeg','-i',f,'-af','ebur128','-f','null','-'],capture_output=True,text=True).stderr
    return np.array([[float(a),float(b)] for a,b in re.findall(r't:\s*([\d.]+)\s+TARGET.*?M:\s*(-?[\d.]+)',e)])
V=momentary(sys.argv[1]); M=momentary(sys.argv[2]); W=json.load(open(sys.argv[3]))
n=min(len(V),len(M)); V,M=V[:n],M[:n]; t=V[:,0]-0.2
speech=np.array([any(w['s']+0.1<=x<=w['e']-0.05 for w in W) for x in t])&(V[:,1]>-26)
d=V[speech,1]-M[speech,1]
print(f"voice/music while speaking: median {np.median(d):.1f} dB (voice {np.median(V[speech,1]):.1f}, music {np.median(M[speech,1]):.1f} LUFS), 5th pct {np.percentile(d,5):.1f} dB, frames {speech.sum()}")
