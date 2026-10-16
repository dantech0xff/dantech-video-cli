#!/usr/bin/env python3
"""Step 1: voice. Gemini TTS of all scene "say" lines -> out/voice.mp3 (-16 LUFS).
script.json "voice": {"style": "random" | "<style key>", "file": "<optional pinned audio, skips TTS>"}
The style key list lives in themes/<theme>/theme.json -> voice.styles. Picks are logged in logs/voice_log.md."""
import os,sys,json,base64,random,subprocess,urllib.request
from common import *
script_path=sys.argv[1]; S=load(script_path); vdir,out,slug=video_paths(script_path); T=theme(S['theme'])['voice']
dst=os.path.join(out,'voice.mp3'); os.makedirs(out,exist_ok=True); cfg=S.get('voice',{})
if cfg.get('file'):  # pinned recording (e.g. an approved take), no TTS call
    subprocess.run(['ffmpeg','-v','error','-y','-i',os.path.join(vdir,cfg['file']),'-ar','44100','-c:a','libmp3lame','-q:a','2',dst],check=True)
    log(f"{slug}: voice = pinned file {cfg['file']}"); print('voice: pinned',cfg['file']); sys.exit()
key=cfg.get('style','random'); key=random.choice(list(T['styles'])) if key=='random' else key
content={"type":"text","text":spoken_text(S).replace('\n',' ')}
if T['styles'][key]: content["annotations"]=[{"type":"speech_metadata","style":T['styles'][key]}]
body={"model":T['model'],"input":[{"type":"user_input","content":[content]}],"response_format":{"type":"audio"},"generation_config":{"speech_config":[{"voice":T['voice']}]}}
req=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/interactions",json.dumps(body).encode(),
    {"x-goog-api-key":os.environ["GEMINI_API_KEY"],"Content-Type":"application/json"})  # key from env only, never stored
res=json.load(urllib.request.urlopen(req,timeout=300))
audio=[c['data'] for s in res.get('steps',[]) if s.get('type')=='model_output' for c in s.get('content',[]) if c.get('type')=='audio']
if not audio: sys.exit('TTS returned no audio: '+json.dumps(res)[:500])
raw=os.path.join(out,'voice_raw.wav'); open(raw,'wb').write(base64.b64decode(audio[-1]))
subprocess.run(['ffmpeg','-v','error','-y','-i',raw,'-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ar','44100','-c:a','libmp3lame','-q:a','2',dst],check=True)
log(f"{slug}: voice {T['voice']} style **{key}** ({'random' if cfg.get('style','random')=='random' else 'pinned'}), {duration(dst):.1f}s")
print('voice:',key,f'{duration(dst):.1f}s')
