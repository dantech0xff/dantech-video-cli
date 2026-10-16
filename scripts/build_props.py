#!/usr/bin/env python3
"""Step 3: timing. Turns script.json + out/words.json into out/props.json for Remotion.
- each scene starts on the first word of its "say" line; the last scene holds theme.tail_hold frames after the voice
- any string "@word[#n][.end][+k|-k]" is replaced by a frame number: the n-th occurrence of word
  (inside the scene for scene props/sfx -> scene-relative; across the whole voice for "cta" -> absolute)"""
import re,shutil,sys
from common import *
FPS=30
S=load(sys.argv[1]); vdir,out,slug=video_paths(sys.argv[1]); T=theme(S['theme']); W=load(os.path.join(out,'words.json'))
norm=lambda s:re.sub(r'[.,!?:;"“”]','',s).lower()
# word index range of every scene
ranges=[];i=0
for sc in S['scenes']: n=len(sc['say'].split()); ranges.append((i,i+n)); i+=n
assert i==len(W),'words.json does not match the script; re-run align'
starts=[0]+[round(W[a]['s']*FPS) for a,_ in ranges[1:]]
end=round(W[-1]['e']*FPS)+T['tail_hold']
ANCHOR=re.compile(r'^@(.+?)(?:#(\d+))?(\.end)?([+-]\d+)?$')
def frame(ref,lo,hi,base):
    m=ANCHOR.match(ref); word,nth,isend,off=m.group(1),int(m.group(2) or 1),m.group(3),int(m.group(4) or 0)
    hits=[k for k in range(lo,hi) if norm(W[k]['t'])==norm(word)]
    if len(hits)<nth: sys.exit(f'anchor {ref}: word not found in this scene')
    w=W[hits[nth-1]]; return round((w['e'] if isend else w['s'])*FPS)+off-base
def resolve(v,lo,hi,base):
    if isinstance(v,str) and ANCHOR.match(v): return frame(v,lo,hi,base)
    if isinstance(v,list): return [resolve(x,lo,hi,base) for x in v]
    if isinstance(v,dict): return {k:resolve(x,lo,hi,base) for k,x in v.items()}
    return v
scenes=[];sfx=[]
for k,sc in enumerate(S['scenes']):
    lo,hi=ranges[k]; st=starts[k]; dur=(starts[k+1] if k+1<len(starts) else end)-st
    scenes.append({'type':sc['type'],'dur':dur,'section':sc['section'],'out':sc.get('out'),'focus':sc.get('focus'),'morph':sc.get('morph'),'props':resolve(sc.get('props',{}),lo,hi,st)})
    for x in sc.get('sfx',[]):  # scene sfx: "at" scene-relative; optional every/count for repeated ticks
        at=resolve(x['at'],lo,hi,st)
        for r in range(x.get('count',1)): sfx.append({'at':st+at+r*x.get('every',0),'s':x['s'],'v':x.get('v',0.5)})
cta=S.get('cta',{}); C=T['cta']
props={'theme':S['theme'],'date':S['date'],'voice':f'render/{slug}.mp3','words':W,'scenes':scenes,'sfx':sfx,
 'cta':{'inAt':resolve(cta.get('in',f"@follow{C['in_offset']:+d}"),0,len(W),0),'pressAt':resolve(cta.get('press','@Dan'),0,len(W),0),'outAt':end-6,'top':C['top'],'sub':cta.get('sub',C['sub'])},
 'outro':{'start':end,'dur':T['outro']['dur'],'tagline':T['outro']['tagline'],'pal':T['outro'].get('pal'),'handles':S.get('handles',[{'p':'YOUTUBE','h':'@dantech-0xff'},{'p':'FACEBOOK','h':'@dantech0xff'}])},
 'durationInFrames':end+T['outro']['dur']}
save(props,os.path.join(out,'props.json'))
os.makedirs(os.path.join(ROOT,'remotion/public/render'),exist_ok=True)
shutil.copy(os.path.join(out,'voice.mp3'),os.path.join(ROOT,f'remotion/public/render/{slug}.mp3'))
print(f"props: {len(scenes)} scenes, starts {starts}, outro at {end}, total {props['durationInFrames']} frames")
