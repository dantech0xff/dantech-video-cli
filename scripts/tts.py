#!/usr/bin/env python3
"""Step 1: voice. TTS of all scene "say" lines -> out/voice.mp3 (-16 LUFS, 44.1 kHz), then align/mix as usual.
usage: python3 scripts/tts.py <script> [--tts auto|gemini|edge] [--voice V] [--rate +10%] [--pitch +0Hz] [--volume +0%]
                                       [--new-voice] [--dry-run]
Engines (CLI --tts overrides script.json "tts": {"engine": ...}; default "auto"):
  gemini  Gemini TTS (themes/<theme>/theme.json -> voice: model, voice, styles). Tier 1 = 100 requests/day shared:
          exactly ONE request per narration, no chunking, no retry. Needs GEMINI_API_KEY.
  edge    Microsoft Edge read-aloud TTS (pip edge-tts), free, no key. Default vi-VN-NamMinhNeural, rate +10%.
          script.json "tts": {"engine":"edge","voice":"vi-VN-HoaiMyNeural","rate":"+10%","pitch":"+0Hz","volume":"+0%"}
          (CLI --voice/--rate/--pitch/--volume override). Gemini-only voice.style (ke-chuyen...) is ignored with a note.
          themes/<theme>/theme.json "tts" is the theme default (duoly: {"engine":"edge","voice":"vi-VN-HoaiMyNeural"}); script keys win.
  auto    GEMINI_API_KEY set -> gemini (exactly as before); no key -> edge.
script.json "voice": {"style": "random" | "<style key>", "file": "<optional pinned audio, skips TTS>"}
Cache: .cache/tts/<hash>.mp3 + .json (gitignored). Gemini hash = sha256(text|voice|model|style setting) (unchanged);
Edge hash = sha256(edge|voice|rate|pitch|volume|text). Same narration + settings -> reuse audio, no TTS call.
--new-voice (or NEW_VOICE=1) forces a fresh take. --dry-run prints the engine + cache decision and exits (no network).
Every take / reuse is logged in logs/voice_log.md."""
import os,sys,re,json,base64,random,subprocess,urllib.request,hashlib,shutil,datetime
from common import *
EDGE_DEFAULT={'voice':'vi-VN-NamMinhNeural','rate':'+10%','pitch':'+0Hz','volume':'+0%'}
EDGE_FMT={'rate':r'[+-]\d+%','pitch':r'[+-]\d+Hz','volume':r'[+-]\d+%'}
argv=sys.argv[1:]; script_path=argv[0]
def opt(name):
    for i,a in enumerate(argv):
        if a==name and i+1<len(argv): return argv[i+1]
        if a.startswith(name+'='): return a.split('=',1)[1]
    return None
S=load(script_path); vdir,out,slug=video_paths(script_path); T=theme(S['theme'])['voice']
dst=os.path.join(out,'voice.mp3'); os.makedirs(out,exist_ok=True); cfg=S.get('voice',{})
# theme.json "tts" = theme default (client themes pin an engine/voice, e.g. duoly: Edge HoaiMy); script "tts" keys win
TTS_T=theme(S['theme']).get('tts',{}) or {}; tcfg={**TTS_T,**(S.get('tts',{}) or {})}
dry='--dry-run' in argv; new='--new-voice' in argv or os.environ.get('NEW_VOICE')=='1'
if cfg.get('file'):  # pinned recording (e.g. an approved take), no TTS call
    if dry: print('tts: engine=none (voice.file pinned:',cfg['file']+')'); sys.exit()
    subprocess.run(['ffmpeg','-v','error','-y','-i',os.path.join(vdir,cfg['file']),'-ar','44100','-c:a','libmp3lame','-q:a','2',dst],check=True)
    log(f"{slug}: voice = pinned file {cfg['file']}"); print('voice: pinned',cfg['file']); sys.exit()

# ── engine selection: CLI --tts > script tts.engine > auto (key -> gemini, no key -> edge)
cli=opt('--tts') or os.environ.get('TTS_ENGINE'); req=(cli or tcfg.get('engine') or 'auto').lower()
src='--tts '+req if cli else (('script' if (S.get('tts') or {}).get('engine') else 'theme')+' tts.engine='+req if tcfg.get('engine') else '')
if req not in ('auto','gemini','edge'): sys.exit(f'tts: unknown engine "{req}" (auto | gemini | edge)')
has_key=bool(os.environ.get('GEMINI_API_KEY'))
if req=='gemini':
    if not has_key: sys.exit(f'tts: Gemini requested ({src}) but GEMINI_API_KEY is not set. Set the key, or use --tts edge')
    engine,why='gemini',src
elif req=='edge': engine,why='edge',src
else: engine,why=('gemini','GEMINI_API_KEY set, no engine requested -> Gemini') if has_key else ('edge','no GEMINI_API_KEY -> Edge')
text=spoken_text(S).replace('\n',' '); setting=cfg.get('style','random')
cdir=os.path.join(ROOT,'.cache','tts'); now=datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
def cached(h):
    cmp3,cmeta=os.path.join(cdir,h+'.mp3'),os.path.join(cdir,h+'.json')
    return (cmp3,cmeta) if not new and os.path.isfile(cmp3) and os.path.isfile(cmeta) else None
def norm(raw):  # same output format for every engine: loudnorm -16 LUFS, 44.1 kHz mp3
    subprocess.run(['ffmpeg','-v','error','-y','-i',raw,'-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ar','44100','-c:a','libmp3lame','-q:a','2',dst],check=True)

if engine=='edge':
    E={k:(opt('--'+k) or tcfg.get(k) or d) for k,d in EDGE_DEFAULT.items()}
    for k,rx in EDGE_FMT.items():
        if not re.fullmatch(rx,E[k]): sys.exit(f'tts: edge {k} "{E[k]}" must look like {EDGE_DEFAULT[k]} (regex {rx})')
    notes=[]
    if setting!='random': notes.append(f'voice.style "{setting}" is Gemini-only, ignored under Edge')
    h=hashlib.sha256('|'.join(['edge',E['voice'],E['rate'],E['pitch'],E['volume'],text]).encode()).hexdigest()[:20]
    c=cached(h); params=f"{E['voice']} rate {E['rate']} pitch {E['pitch']} volume {E['volume']}"
    print(f'tts: engine=edge ({why}) · {params}'); [print('tts: note:',n) for n in notes]
    if dry: print('tts: dry-run:',f'cache hit {h}' if c else f'would synthesize with Edge (free), cache {h}'); sys.exit()
    if c:
        m=load(c[1]); shutil.copy(c[0],dst); save({**m,'cache':h,'reused':True,'why':why},os.path.join(out,'voice_meta.json'))
        log(f"{slug}: voice reused from cache {h} (edge {params}, made {m['created']}), {duration(dst):.1f}s, no TTS call ({why})")
        print('voice: cached edge',f'{duration(dst):.1f}s'); sys.exit()
    try: import edge_tts
    except ImportError: sys.exit('tts: edge-tts not installed: pip install -r requirements.txt (or ./dt setup)')
    raw=os.path.join(out,'voice_raw.mp3')
    for attempt in range(3):  # Edge is free/unmetered: a short retry on network hiccups is fine (Gemini never retries)
        try: edge_tts.Communicate(text,E['voice'],rate=E['rate'],pitch=E['pitch'],volume=E['volume']).save_sync(raw); break
        except Exception as e:
            if attempt==2: sys.exit(f'tts: Edge failed: {e}')
            print('tts: edge error, retrying:',e); import time; time.sleep(3)
    norm(raw); os.makedirs(cdir,exist_ok=True); shutil.copy(dst,os.path.join(cdir,h+'.mp3'))
    meta={'engine':'edge','style':'edge','setting':setting,**E,'slug':slug,'created':now,'notes':notes}
    save(meta,os.path.join(cdir,h+'.json')); save({**meta,'cache':h,'reused':False,'why':why},os.path.join(out,'voice_meta.json'))
    log(f"{slug}: voice edge {params} ({why}), {duration(dst):.1f}s"+(f" · {'; '.join(notes)}" if notes else ''))
    print('voice: edge',E['voice'],f'{duration(dst):.1f}s'); sys.exit()

# ── Gemini (unchanged behaviour: one request, no chunking, no retry)
for k in ('voice','rate','pitch','volume'):
    if opt('--'+k): print(f'tts: note: --{k} is an Edge option, ignored under Gemini')
h=hashlib.sha256('|'.join([text,T['voice'],T['model'],setting,T['styles'].get(setting,'')]).encode()).hexdigest()[:20]
c=cached(h); print(f'tts: engine=gemini ({why}) · {T["model"]} {T["voice"]} style {setting}')
if dry: print('tts: dry-run:',f'cache hit {h}, no request' if c else f'would send ONE Gemini request, cache {h}'); sys.exit()
if c:
    m=load(c[1]); shutil.copy(c[0],dst); save({**m,'cache':h,'reused':True},os.path.join(out,'voice_meta.json'))
    log(f"{slug}: voice reused from cache {h} (style **{m['style']}**, drawn {m['created']}), {duration(dst):.1f}s, no TTS call")
    print('voice: cached',m['style'],f'{duration(dst):.1f}s'); sys.exit()
key=random.choice(list(T['styles'])) if setting=='random' else setting
content={"type":"text","text":text}
if T['styles'][key]: content["annotations"]=[{"type":"speech_metadata","style":T['styles'][key]}]
body={"model":T['model'],"input":[{"type":"user_input","content":[content]}],"response_format":{"type":"audio"},"generation_config":{"speech_config":[{"voice":T['voice']}]}}
req=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/interactions",json.dumps(body).encode(),
    {"x-goog-api-key":os.environ["GEMINI_API_KEY"],"Content-Type":"application/json"})  # key from env only, never stored
res=json.load(urllib.request.urlopen(req,timeout=300))
audio=[c['data'] for s in res.get('steps',[]) if s.get('type')=='model_output' for c in s.get('content',[]) if c.get('type')=='audio']
if not audio: sys.exit('TTS returned no audio: '+json.dumps(res)[:500])
raw=os.path.join(out,'voice_raw.wav'); open(raw,'wb').write(base64.b64decode(audio[-1]))
norm(raw); os.makedirs(cdir,exist_ok=True); shutil.copy(dst,os.path.join(cdir,h+'.mp3'))
meta={'engine':'gemini','style':key,'setting':setting,'voice':T['voice'],'model':T['model'],'slug':slug,'created':now}
save(meta,os.path.join(cdir,h+'.json')); save({**meta,'cache':h,'reused':False},os.path.join(out,'voice_meta.json'))
log(f"{slug}: voice {T['voice']} style **{key}** ({'random' if setting=='random' else 'pinned'}), {duration(dst):.1f}s")
print('voice:',key,f'{duration(dst):.1f}s')
