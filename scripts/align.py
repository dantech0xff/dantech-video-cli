#!/usr/bin/env python3
"""Step 2: word timings. faster-whisper (local, CPU) transcribes out/voice.mp3 with word timestamps,
then each script token is matched to the transcript so captions use the exact script spelling -> out/words.json."""
import sys,re,difflib,subprocess,numpy as np
from faster_whisper import WhisperModel
from common import *
S=load(sys.argv[1]); vdir,out,slug=video_paths(sys.argv[1])
pcm=subprocess.run(['ffmpeg','-v','error','-i',os.path.join(out,'voice.mp3'),'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout
model=WhisperModel('medium',device='cpu',compute_type='int8')
segs,_=model.transcribe(np.frombuffer(pcm,np.float32),language='vi',word_timestamps=True,condition_on_previous_text=False)
heard=[(w.word.strip(),w.start,w.end) for s in segs for w in s.words]
# whisper writes digits / shortcut spellings differently; normalise both sides before matching
ALIAS={'1':'một','2':'hai','3':'ba','4':'bốn','5':'năm','ctrl':'control','-a':'alt','-l':'l','-option':'option','cốt':'code','clik':'click','tắc':'tắt'}
norm=lambda s:(lambda x:ALIAS.get(x,x))(re.sub(r'[.,!?:;"“”]','',s.lower()))
tokens=spoken_text(S).split(); a=[norm(x) for x in tokens]; b=[norm(h[0]) for h in heard]
t=[None]*len(tokens)
for tag,i1,i2,j1,j2 in difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes():
    if tag=='equal' or (tag=='replace' and i2-i1==j2-j1):
        for k in range(i2-i1): t[i1+k]=(heard[j1+k][1],heard[j1+k][2])
    elif tag=='replace':  # spread unequal runs evenly over the heard span
        s,e=heard[j1][1],heard[j2-1][2]; n=i2-i1
        for k in range(n): t[i1+k]=(s+(e-s)*k/n,s+(e-s)*(k+1)/n)
missing=[i for i,x in enumerate(t) if x is None]
for i in missing:  # tokens whisper skipped: squeeze between neighbours
    p=next((t[j][1] for j in range(i-1,-1,-1) if t[j]),0.0); q=next((t[j][0] for j in range(i+1,len(t)) if t[j]),p+0.3)
    t[i]=(p,max(p+0.05,q))
save([{'t':w,'s':round(s,3),'e':round(e,3)} for w,(s,e) in zip(tokens,t)],os.path.join(out,'words.json'))
print(f'align: {len(tokens)} tokens, {len(missing)} unmatched')
