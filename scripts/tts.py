#!/usr/bin/env python3
"""Step 1: voice. Gemini TTS of all scene "say" lines -> out/voice.mp3 (-16 LUFS).
script.json "voice": {"style": "random" | "<style key>", "file": "<optional pinned audio, skips TTS>"}
The style key list lives in themes/<theme>/theme.json -> voice.styles. Picks are logged in logs/voice_log.md.
Rule: one TTS call per narration. The drawn style is accepted whatever the length.
Cache: .cache/tts/<sha256(text|voice|model|style setting)>.mp3 + .json (gitignored). Same narration -> reuse audio AND the
previously drawn style, no API call. A new voice is only generated when the text/voice/model/style setting changes,
or with --new-voice (or NEW_VOICE=1, e.g. ./dt render <script> --new-voice)."""
import os,sys,json,base64,random,subprocess,urllib.request,hashlib,shutil
from common import *
script_path=sys.argv[1]; S=load(script_path); vdir,out,slug=video_paths(script_path); T=theme(S['theme'])['voice']
dst=os.path.join(out,'voice.mp3'); os.makedirs(out,exist_ok=True); cfg=S.get('voice',{})
if cfg.get('file'):  # pinned recording (e.g. an approved take), no TTS call
    subprocess.run(['ffmpeg','-v','error','-y','-i',os.path.join(vdir,cfg['file']),'-ar','44100','-c:a','libmp3lame','-q:a','2',dst],check=True)
    log(f"{slug}: voice = pinned file {cfg['file']}"); print('voice: pinned',cfg['file']); sys.exit()
text=spoken_text(S).replace('\n',' '); setting=cfg.get('style','random')
h=hashlib.sha256('|'.join([text,T['voice'],T['model'],setting,T['styles'].get(setting,'')]).encode()).hexdigest()[:20]
cdir=os.path.join(ROOT,'.cache','tts'); cmp3,cmeta=os.path.join(cdir,h+'.mp3'),os.path.join(cdir,h+'.json')
new='--new-voice' in sys.argv or os.environ.get('NEW_VOICE')=='1'
if not new and os.path.isfile(cmp3) and os.path.isfile(cmeta):
    m=load(cmeta); shutil.copy(cmp3,dst); save({**m,'cache':h,'reused':True},os.path.join(out,'voice_meta.json'))
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
subprocess.run(['ffmpeg','-v','error','-y','-i',raw,'-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ar','44100','-c:a','libmp3lame','-q:a','2',dst],check=True)
import datetime;os.makedirs(cdir,exist_ok=True);shutil.copy(dst,cmp3)
meta={'style':key,'setting':setting,'voice':T['voice'],'model':T['model'],'slug':slug,'created':datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}
save(meta,cmeta); save({**meta,'cache':h,'reused':False},os.path.join(out,'voice_meta.json'))
log(f"{slug}: voice {T['voice']} style **{key}** ({'random' if cfg.get('style','random')=='random' else 'pinned'}), {duration(dst):.1f}s")
print('voice:',key,f'{duration(dst):.1f}s')
