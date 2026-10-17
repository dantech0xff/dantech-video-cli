#!/usr/bin/env python3
"""Check a videos/<slug>/script.json before rendering (no API calls).
usage: python3 scripts/validate_script.py videos/<slug>/script.json   → exit 1 on errors; warnings don't fail.
Checks: required keys, theme exists, scene types registered in remotion/src/Video.tsx, transitions, sfx files,
@word anchors present in the scene's "say", music track id, voice style, tts engine/Edge params, sources, the channel CTA phrase close (channels/<id>.json).
Prop keys are compared with the example scripts (videos/*/script.json) for the same scene type (warning only)."""
import glob,json,os,re,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E,W=[],[]
err=E.append; warn=W.append
p=sys.argv[1]; S=json.load(open(p,encoding='utf-8'))
for k in ['theme','title','date','caption','sources','voice','music','scenes']:
    if k not in S: err(f'missing top-level key "{k}"')
ALIASES={'tin-nong':'hot-news','meo-nhanh':'quick-tips','commit':'tech-explain'}
if S.get('theme') in ALIASES: warn(f'theme "{S["theme"]}" is deprecated, use "{ALIASES[S["theme"]]}"')
tp=os.path.join(ROOT,'themes',ALIASES.get(S.get('theme',''),S.get('theme','')),'theme.json')
T=json.load(open(tp,encoding='utf-8')) if os.path.isfile(tp) else None
if not T: err(f'theme "{S.get("theme")}" not found in themes/')
if T and S.get('variant') and S['variant'] not in T.get('variants',{}): err(f'variant "{S["variant"]}" not in theme variants {list(T.get("variants",{}))}')
if not S.get('sources'): err('sources is empty: every fact needs a real source')
v=S.get('voice',{})
if T and v.get('style','random')!='random' and v['style'] not in T['voice']['styles']: err(f'voice.style "{v["style"]}" not in {list(T["voice"]["styles"])}')
if v.get('file') and not os.path.isfile(os.path.join(os.path.dirname(os.path.abspath(p)),v['file'])): err(f'voice.file {v["file"]} not found')
if v.get('file'): warn('voice.file is pinned: TTS is skipped (new videos should use style "random" without file)')
tt=S.get('tts',{}) or {}
if not isinstance(tt,dict): err('tts must be an object, e.g. {"engine": "edge"}'); tt={}
if tt.get('engine','auto') not in ('auto','gemini','edge'): err(f'tts.engine "{tt.get("engine")}" must be auto | gemini | edge')
for k,rx,ex in [('rate',r'[+-]\d+%','+10%'),('pitch',r'[+-]\d+Hz','+0Hz'),('volume',r'[+-]\d+%','+0%')]:
    if k in tt and not re.fullmatch(rx,str(tt[k])): err(f'tts.{k} "{tt[k]}" must look like {ex}')
if tt.get('voice') and not re.fullmatch(r'[a-z]{2,3}-[A-Z]{2}-\w+Neural',tt['voice']): err(f'tts.voice "{tt["voice"]}" is not an Edge voice name (e.g. vi-VN-NamMinhNeural; list: python3 -m edge_tts --list-voices)')
elif tt.get('voice') and not tt['voice'].startswith('vi-VN-'): warn(f'tts.voice {tt["voice"]} is not a Vietnamese voice: multilingual voices read Vietnamese with a foreign accent')
for k in set(tt)-{'engine','voice','rate','pitch','volume'}: warn(f'tts.{k} is unknown (engine, voice, rate, pitch, volume)')
if tt.get('engine')=='gemini' and set(tt)&{'voice','rate','pitch','volume'}: warn('tts voice/rate/pitch/volume are Edge options, ignored under Gemini')
if tt.get('engine')=='edge' and v.get('style','random')!='random': warn(f'voice.style "{v["style"]}" is Gemini-only, ignored under Edge')
TR={t['id']:t for t in json.load(open(os.path.join(ROOT,'assets/music/tracks.json')))}; tracks=set(TR)
tid=S.get('music',{}).get('track','random')
if tid!='random' and tid not in tracks: err(f'music.track "{tid}" not in assets/music/tracks.json; valid: random, '+', '.join(sorted(tracks)))
need=[tid] if tid in tracks else ([p['id'] for p in T['music']['pool']] if T and tid=='random' else [])
for i in need:
    if i not in TR: err(f'theme music.pool id "{i}" not in tracks.json')
    elif not os.path.isfile(os.path.join(ROOT,TR[i]['file'])): err(f'music file missing: {TR[i]["file"]} (./dt fetch-music; Pixabay tải tay)')
if tid!='random': warn(f'music.track pinned to {tid} (the rule is rotation: "random")')
types=set(re.search(r'const SCENES[^{]*\{([^}]*)\}',open(os.path.join(ROOT,'remotion/src/Video.tsx')).read()).group(1).replace(' ','').split(','))
sfx={os.path.splitext(f)[0] for f in os.listdir(os.path.join(ROOT,'assets/sfx'))}
known={}
for ex in glob.glob(os.path.join(ROOT,'videos/*/script.json')):
    for sc in json.load(open(ex,encoding='utf-8')).get('scenes',[]): known.setdefault(sc['type'],set()).update(sc.get('props',{}))
norm=lambda s:re.sub(r'[.,!?:;"“”]','',s).lower()
AN=re.compile(r'^@(.+?)(?:#(\d+))?(\.end)?([+-]\d+)?$')
def anchors(x):
    if isinstance(x,str) and x.startswith('@'): yield x
    elif isinstance(x,list):
        for y in x: yield from anchors(y)
    elif isinstance(x,dict):
        for y in x.values(): yield from anchors(y)
sc_list=S.get('scenes',[])
if not sc_list: err('no scenes')
for i,sc in enumerate(sc_list,1):
    tag=f'scene {i} ({sc.get("type")})'
    for k in ['say','type','section']:
        if not sc.get(k): err(f'{tag}: missing "{k}"')
    if sc.get('type') not in types: err(f'{tag}: unknown type, use one of {sorted(types)}')
    if sc.get('out') and sc['out'] not in ['page','bar','zoom','push','stack','morph','scroll','signal','sharedx','hero']: err(f'{tag}: bad out "{sc["out"]}"')
    if i<len(sc_list) and not sc.get('out'): warn(f'{tag}: no "out" transition (defaults to bar)')
    if sc.get('out')=='morph' and not sc.get('morph'): err(f'{tag}: out "morph" needs a "morph" {{from,to,txt}}')
    extra=set(sc.get('props',{}))-known.get(sc.get('type'),set())
    if sc.get('type') in known and extra: warn(f'{tag}: props not used in examples: {sorted(extra)} (check the .tsx)')
    words=[norm(w) for w in sc.get('say','').split()]
    for x in sc.get('sfx',[]):
        if x.get('s') not in sfx: err(f'{tag}: sfx "{x.get("s")}" not in assets/sfx')
    for a in anchors({'p':sc.get('props',{}),'s':sc.get('sfx',[]),'o':sc.get('overlays',[])}):
        m=AN.match(a)
        if not m: err(f'{tag}: bad anchor {a}'); continue
        n=int(m.group(2) or 1)
        if words.count(norm(m.group(1)))<n: err(f'{tag}: anchor {a}: word "{m.group(1)}" (x{n}) not in this scene\'s say')
allw=[norm(w) for sc in sc_list for w in sc.get('say','').split()]
# overlays (universal elements), kw highlights, autofill switches, glossary (SCHEMA.md "Universal overlays")
def kw_lists(x):
    if isinstance(x,dict):
        if 'kw' in x: yield x['kw'] if isinstance(x['kw'],list) else [x['kw']]
        for v in x.values(): yield from kw_lists(v)
    elif isinstance(x,list):
        for v in x: yield from kw_lists(v)
GLYPHS=set(re.findall(r"^ ?(\w+):'",open(os.path.join(ROOT,'remotion/src/overlay.tsx')).read().split('export const GLYPH')[1].split('};')[0],re.M)) if os.path.isfile(os.path.join(ROOT,'remotion/src/overlay.tsx')) else set()
GLYPHS|=set(re.findall(r"(\w+):'M",open(os.path.join(ROOT,'remotion/src/overlay.tsx')).read())) if os.path.isfile(os.path.join(ROOT,'remotion/src/overlay.tsx')) else set()
OVK={'term':({'w'},{'g','icon'}),'num':({'n'},{'label'}),'icon':({'icon','label'},set()),'focus':({'match'},set()),'progress':({'n','m'},{'label'}),'diagram':({'nodes'},{'label'})}
if 'autofill' in S and not isinstance(S['autofill'],bool): err('"autofill" must be true or false')
if S.get('autofill') is False: warn('autofill is off for the whole script: static stretches > 2.5 s will not be filled (the render gate still fails on 3 s)')
g=S.get('glossary',{})
if g and (not isinstance(g,dict) or not all(isinstance(k,str) and isinstance(v,str) for k,v in g.items())): err('glossary must map term -> short gloss (strings)')
elif g:
    for k_,v_ in g.items():
        if len(v_)>70: warn(f'glossary "{k_}": gloss is {len(v_)} chars; keep it ≤ ~70 (2 lines on the term card)')
for i,sc in enumerate(sc_list,1):
    tag=f'scene {i} ({sc.get("type")})';words=[norm(w) for w in sc.get('say','').split()]
    if 'autofill' in sc and not isinstance(sc['autofill'],bool): err(f'{tag}: "autofill" must be true or false')
    d=sc.get('diagram')
    if d is not None and not (isinstance(d,dict) and isinstance(d.get('nodes'),list) and 2<=len(d['nodes'])<=3): err(f'{tag}: diagram hint must be {{nodes:[2-3 labels], label?}}')
    for kws in kw_lists(sc.get('props',{})):
        if not all(isinstance(x,str) for x in kws): err(f'{tag}: kw must be a list of words'); continue
        for kwd in kws:
            if norm(kwd) not in words: warn(f'{tag}: kw "{kwd}" is never spoken in this scene (no highlight will fire)')
    texts_=json.dumps(sc.get('props',{}),ensure_ascii=False).replace('\\\\@','@').lower()
    for j,o in enumerate(sc.get('overlays',[]) or [],1):
        ot=f'{tag}: overlays[{j}]'
        if not isinstance(o,dict) or o.get('kind') not in OVK: err(f'{ot}: kind must be one of {sorted(OVK)}'); continue
        req,opt=OVK[o['kind']];miss=req-set(o);bad=set(o)-req-opt-{'kind','at','dur'}
        if 'at' not in o: err(f'{ot}: needs "at" (@word or frame)')
        if miss: err(f'{ot}: {o["kind"]} needs {sorted(miss)}')
        if bad: err(f'{ot}: unknown keys {sorted(bad)}')
        if 'dur' in o and not (isinstance(o['dur'],(int,float)) and 1<=o['dur']<=6): err(f'{ot}: dur is seconds, 1–6')
        if o.get('icon') and GLYPHS and o['icon'] not in GLYPHS: err(f'{ot}: icon "{o["icon"]}" not in the glyph set {sorted(GLYPHS)}')
        if o['kind']=='diagram' and not (isinstance(o.get('nodes'),list) and 2<=len(o['nodes'])<=3): err(f'{ot}: diagram takes 2–3 nodes')
        if o['kind']=='focus' and isinstance(o.get('match'),str) and o['match'].lower() not in texts_: warn(f'{ot}: focus match "{o["match"]}" not found in this scene\'s props text (nothing to highlight)')
        if o['kind']=='term' and o.get('g') and len(o['g'])>70: warn(f'{ot}: gloss > 70 chars')
# item-level props for list scenes (SCHEMA.md): a misspelt item key renders an empty row or crashes the render
ITEMS={'AtSteps':('steps',{'s','at'},{'ok','warn','kw'}),'AtTerm':('lines',{'s','at'},{'out','ok','hl','kw'}),
 'AtPackages':('rows',{'s','at'},{'meta','ok','kw'}),'AtDevice':('devices',{'name','at'},{'kind','badge','ok','screen','kw'}),
 'AtSpec':('tiles',{'big','small','at'},{'ok','kw'})}
TOP={'AtSteps':{'title','steps','note'},'AtTerm':{'title','dir','shell','lines','note'},'AtPackages':{'title','head','rows','note'},
 'AtDevice':{'title','devices','note'},'AtSpec':{'title','tiles','note'}}
for i,sc in enumerate(sc_list,1):
    t=sc.get('type');pr=sc.get('props',{})
    if t not in ITEMS: continue
    tag=f'scene {i} ({t})';key,req,opt=ITEMS[t]
    for k in set(pr)-TOP[t]: err(f'{tag}: unknown prop "{k}" (allowed: {sorted(TOP[t])}, see SCHEMA.md)')
    if not isinstance(pr.get(key),list) or not pr.get(key): err(f'{tag}: needs a non-empty "{key}" list'); continue
    for j,it in enumerate(pr[key],1):
        if not isinstance(it,dict): err(f'{tag}: {key}[{j}] must be an object'); continue
        miss=req-set(it); bad=set(it)-req-opt
        if miss: err(f'{tag}: {key}[{j}] missing {sorted(miss)}')
        if bad: err(f'{tag}: {key}[{j}] unknown keys {sorted(bad)} (allowed: {sorted(req|opt)})')
        if t=='AtTerm' and len(it.get('s',''))>28: warn(f'{tag}: lines[{j}] "{it["s"]}" > 28 chars, overflows the terminal at reel size; shorten or split')
        if t=='AtDevice':
            for r in it.get('screen',[]) or []:
                if set(r)-{'s','at','on'} or not {'s','at'}<=set(r): err(f'{tag}: devices[{j}].screen rows take {{s, at, on?}}')
    if t=='AtSteps' and len(pr['steps'])>6: warn(f'{tag}: {len(pr["steps"])} steps; ≤ 6 keeps rows reel-readable (split the scene)')
    if 'note' in pr and not (isinstance(pr['note'],dict) and {'s','at'}<=set(pr['note'])): err(f'{tag}: note must be {{s, at}}')
# visual-beat density: @word anchors should be spread through the scene's say (~3.2 wps).
# A long stretch of narration with nothing new on screen reads as a static card.
# A prop with no "at"/@anchor anywhere inside counts as a beat at word 0 (visible from the start).
# Numeric timings (keys ending in "at", bare number lists like taps/hits) are beats we can't position -> skip spacing checks for that scene.
def timed(x):
    if isinstance(x,dict):
        r=False
        for k,v in x.items():
            if isinstance(k,str) and k.lower().endswith('at') and isinstance(v,(int,float)) and not isinstance(v,bool): r=True
            if isinstance(v,str) and v.startswith('@'): r=True
            else: r=r or timed(v)
        return r
    if isinstance(x,list): return any(timed(y) or isinstance(y,(int,float)) and not isinstance(y,bool) for y in x)
    if isinstance(x,str): return x.startswith('@')
    return False
def numts(x):
    if isinstance(x,dict): return any((isinstance(k,str) and k.lower().endswith('at') and isinstance(v,(int,float)) and not isinstance(v,bool)) or numts(v) for k,v in x.items())
    if isinstance(x,list): return any(isinstance(y,(int,float)) and not isinstance(y,bool) or numts(y) for y in x)
    return False
press_w=''
try: press_w=norm(json.load(open(os.path.join(ROOT,'channels',f"{S.get('channel','dantech')}.json"),encoding='utf-8'))['ctaPressWord'])
except Exception: pass
WPS=3.2
for i,sc in enumerate(sc_list,1):
    tag=f'scene {i} ({sc.get("type")})'
    words=[norm(w) for w in sc.get('say','').split()]; n=len(words)
    pos=[]
    for a in anchors({'p':sc.get('props',{}),'o':sc.get('overlays',[])}):  # visual beats only: an sfx alone changes nothing on screen
        m=AN.match(a)
        if not m: continue
        nth=int(m.group(2) or 1); tgt=norm(m.group(1))
        idx=[k for k,w in enumerate(words) if w==tgt]
        if len(idx)>=nth: pos.append(idx[nth-1])
    if press_w in words: pos.append(words.index(press_w))
    for kws in kw_lists(sc.get('props',{})):
        for kwd in kws: pos+=[k for k,w in enumerate(words) if w==norm(kwd)]
    for v in sc.get('props',{}).values():
        if not timed(v): pos.append(0)
    pos=sorted(set(pos)); hasnum=numts(sc.get('props',{})) or numts(sc.get('sfx',[]))
    if not pos and not hasnum:
        if n>14: err(f'{tag}: {n} words but no timed prop (@anchor/"at") — nothing changes on screen')
        continue
    if not pos or hasnum: continue
    if pos[0]>14: err(f'{tag}: first visual beat lands ~word {pos[0]+1}/{n} (~{pos[0]/WPS:.0f}s in) — put a prop on screen earlier or split the scene')
    for a,b in zip(pos,pos[1:]):
        if b-a>26: err(f'{tag}: ~{b-a} words (~{(b-a)/WPS:.0f}s) between beats — screen sits still')
    if n-pos[-1]>20: err(f'{tag}: last beat at word {pos[-1]+1}/{n}, then ~{n-pos[-1]} words with nothing new on screen')
    # a beat landing <~3 words (~1s) before the scene exits is on screen too briefly to be read;
    # the channel CTA press-word legitimately lives at the end, so it is exempt
    beats=[p for p in pos if p!=(words.index(press_w) if press_w in words else -1)]
    if beats and n-1-beats[-1]<3: err(f'{tag}: last beat lands at word {beats[-1]+1}/{n}, <~3 words before the scene exits — anchor it earlier so viewers can read it')
# channel CTA phrase (channels/<id>.json): Follow button pops on ctaInWord, is pressed on ctaPressWord
try:
    CHN=json.load(open(os.path.join(ROOT,'channels',f"{S.get('channel','dantech')}.json"),encoding='utf-8'))
    ph=[norm(w) for w in CHN['ctaPhrase'].split()]
    if not any(allw[i:i+len(ph)]==ph for i in range(len(allw))): err(f'script must say the channel CTA "{CHN["ctaPhrase"]}" (Follow pops on "{CHN["ctaInWord"]}", pressed on "{CHN["ctaPressWord"]}")')
except FileNotFoundError: err(f'channel "{S.get("channel")}" not found in channels/')
# direct hook: first sentence of scene 1 names the topic ("topic": ["MVVM","Flutter"]) and is short (<=12 words, ~3s)
if sc_list:
    first=re.split(r'(?<=[.!?:])\s',sc_list[0].get('say','').strip(),maxsplit=1)[0]
    fw=len(first.split())
    if fw>12: warn(f'hook: first sentence of scene 1 has {fw} words (direct hook ≤ ~12 words / ~3s): "{first}"')
    if not S.get('topic'): warn('hook: no "topic" keywords in script.json; add e.g. "topic": ["MVVM","Flutter"] so the hook can be checked')
    else:
        miss=[k for k in S['topic'] if k.lower() not in first.lower()]
        if miss: warn(f'hook: first sentence of scene 1 does not name the topic {miss}: "{first}"')
# content-driven hook (any theme): "hook": {"kind": controversy|news|explainer|tips|..., claim, sides, why, promise, payoff}
H=S.get('hook')
first1=re.split(r'(?<=[.!?:])\s',sc_list[0].get('say','').strip(),maxsplit=1)[0] if sc_list else ''
if not H: warn('hook: no "hook" block; add "hook": {"kind": "controversy|news|explainer|tips", "claim": …} (see write-script "Hook theo nội dung")')
else:
    k=H.get('kind')
    if k not in ['controversy','news','explainer','tips','story']: warn(f'hook.kind "{k}" unknown (controversy|news|explainer|tips|story)')
    if not H.get('claim'): warn('hook: missing "claim" (the concrete first-second line, spoken AND on screen)')
    if k in ['controversy','news']:
        if len(H.get('sides') or [])!=2: warn('hook: controversy/news needs "sides": [side A, side B] shown in seconds 1–3')
        if not H.get('payoff'): warn('hook: controversy/news needs a "payoff" promise ("Cuối video…") delivered later')
    if k=='explainer' and not H.get('why'): warn('hook: explainer should state "why" it matters right after naming the topic')
    if k=='tips' and not H.get('promise'): warn('hook: tips should state the outcome "promise" (what the viewer gains)')
    if H.get('payoff'):
        d=[i for i,sc in enumerate(sc_list,1) if sc.get('payoff')]
        if not d: warn('hook: payoff promised but no scene has "payoff": true (it must actually be delivered)')
        elif d[0]==1: warn('hook: payoff delivered in scene 1; it should come near the end')
if first1.endswith('?'): warn(f'hook: scene 1 opens with a question "{first1}"; open with a concrete claim, poll only after context')
# meta signposting: narration must tell the story, not the script structure
META=['như đã hứa','thứ mình hứa','điều mình hứa','đây là phần quan trọng','đủ dữ kiện','đủ thông tin','cuối cùng là','tiếp theo chúng ta','hãy cùng tìm hiểu','cuối video là','phần tiếp theo']
for i,sc in enumerate(sc_list,1):
    low=sc.get('say','').lower()
    for m in META:
        if m in low: warn(f'scene {i}: meta signposting "{m}"; say the fact itself / ask naturally (write-script "Không đọc cấu trúc kịch bản")')
# info only (no warnings): rough voice length per Gemini style (and Edge default rate), words/second measured from past renders
RATE={'hao-hung':3.8,'tu-nhien':3.1,'ke-chuyen':2.55,'edge +10%':3.1}
n=len(allw)
print('⏱  voice estimate (info): '+', '.join(f'{k} ~{n/r:.0f}s' for k,r in RATE.items()))
for m in W: print('⚠️ ',m)
for m in E: print('❌',m)
print(f'{"✅ OK" if not E else "❌ FAIL"}: {p} · {len(sc_list)} scenes · {n} words')
sys.exit(1 if E else 0)
