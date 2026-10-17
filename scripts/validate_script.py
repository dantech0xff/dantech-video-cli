#!/usr/bin/env python3
"""Check a videos/<slug>/script.json before rendering (no API calls).
usage: python3 scripts/validate_script.py videos/<slug>/script.json   → exit 1 on errors; warnings don't fail.
Checks: required keys, theme exists, scene types registered in remotion/src/Video.tsx, transitions, sfx files,
@word anchors present in the scene's "say", music track id, voice style, sources, the channel CTA phrase close (channels/<id>.json).
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
    if sc.get('out') and sc['out'] not in ['page','bar','zoom','push','stack','morph','scroll','signal','sharedx']: err(f'{tag}: bad out "{sc["out"]}"')
    if i<len(sc_list) and not sc.get('out'): warn(f'{tag}: no "out" transition (defaults to bar)')
    if sc.get('out')=='morph' and not sc.get('morph'): err(f'{tag}: out "morph" needs a "morph" {{from,to,txt}}')
    extra=set(sc.get('props',{}))-known.get(sc.get('type'),set())
    if sc.get('type') in known and extra: warn(f'{tag}: props not used in examples: {sorted(extra)} (check the .tsx)')
    words=[norm(w) for w in sc.get('say','').split()]
    for x in sc.get('sfx',[]):
        if x.get('s') not in sfx: err(f'{tag}: sfx "{x.get("s")}" not in assets/sfx')
    for a in anchors({'p':sc.get('props',{}),'s':sc.get('sfx',[])}):
        m=AN.match(a)
        if not m: err(f'{tag}: bad anchor {a}'); continue
        n=int(m.group(2) or 1)
        if words.count(norm(m.group(1)))<n: err(f'{tag}: anchor {a}: word "{m.group(1)}" (x{n}) not in this scene\'s say')
allw=[norm(w) for sc in sc_list for w in sc.get('say','').split()]
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
# info only (no warnings): rough voice length per Gemini style, words/second measured from past renders
RATE={'hao-hung':3.8,'tu-nhien':3.1,'ke-chuyen':2.55}
n=len(allw)
print('⏱  voice estimate (info): '+', '.join(f'{k} ~{n/r:.0f}s' for k,r in RATE.items()))
for m in W: print('⚠️ ',m)
for m in E: print('❌',m)
print(f'{"✅ OK" if not E else "❌ FAIL"}: {p} · {len(sc_list)} scenes · {n} words')
sys.exit(1 if E else 0)
