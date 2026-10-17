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
# look override: theme.json "variants"[script.variant], then script "look" (colours etc.); default theme look otherwise
look={**T.get('variants',{}).get(S['variant'],{}).get('look',{}),**S.get('look',{})} if S.get('variant') else S.get('look',{})
if S.get('variant') and S['variant'] not in T.get('variants',{}): sys.exit(f"variant {S['variant']} not in theme {S['theme']} (have: {list(T.get('variants',{}))})")
# channel / brand (channels/<id>.json, default dantech): wordmark, handles, follow texts, CTA phrase
CH=load_channel(S.get('channel','dantech'));tid_=theme_id(S['theme'])
pick=lambda v,fb:(v.get(tid_,v.get('default',fb)) if isinstance(v,dict) else (v or fb))
brand={'id':CH['id'],'name':CH['name'],'wordmark':CH['wordmark'],'followLabel':CH['followLabel'],'followDone':CH['followDone'],'handles':S.get('handles',CH['handles'])}
props={'theme':theme_id(S['theme']),'look':look,'date':S['date'],'voice':f'render/{slug}.mp3','words':W,'scenes':scenes,'sfx':sfx,
 'cta':{'inAt':resolve(cta.get('in',f"@{CH['ctaInWord']}{C['in_offset']:+d}"),0,len(W),0),'pressAt':resolve(cta.get('press','@'+CH['ctaPressWord']),0,len(W),0),'outAt':end-6,'top':C['top'],'sub':cta.get('sub',pick(CH.get('followSub'),C['sub']))},
 'outro':{'start':end,'dur':T['outro']['dur'],'tagline':pick(CH.get('tagline'),T['outro']['tagline']),'pal':T['outro'].get('pal'),'handles':brand['handles']},'channel':brand,
 'durationInFrames':end+T['outro']['dur']}
# Layer 1/2: overlay events (script "overlays", item "kw" highlights, auto-filler for static stretches) -> scenes[i].ov
import autofill
ranges_=ranges
def _rw(ref,k): lo,hi=ranges_[k]; return frame(ref,lo,hi,starts[k])
ovs,alog,tl=autofill.plan(S,W,ranges,starts,[s_['dur'] for s_ in scenes],[sc.get('props',{}) for sc in S['scenes']],[s_['props'] for s_ in scenes],props['cta'],_rw)
for s_,o in zip(scenes,ovs): s_['ov']=o
for l in alog: print(l)
nb=sum(len(t['gaps_before']) for t in tl);na=sum(len(t['gaps_after']) for t in tl)
print(f"autofill: {sum(1 for o in sum(ovs,[]) if o.get('auto'))} filler(s), static gaps > {autofill.GAP_S}s: {nb} before -> {na} after")
save({'gap_s':autofill.GAP_S,'fps':FPS,'timeline':tl,'log':alog,'overlays':[[o for o in x] for x in ovs]},os.path.join(out,'autofill.json'))
save(props,os.path.join(out,'props.json'))
os.makedirs(os.path.join(ROOT,'remotion/public/render'),exist_ok=True)
shutil.copy(os.path.join(out,'voice.mp3'),os.path.join(ROOT,f'remotion/public/render/{slug}.mp3'))
print(f"props: {len(scenes)} scenes, starts {starts}, outro at {end}, total {props['durationInFrames']} frames")
