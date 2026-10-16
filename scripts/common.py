"""Shared helpers: paths, script.json loading, voice-log writing."""
import json,os,datetime,subprocess
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def load(path): return json.load(open(path,encoding='utf-8'))
def save(obj,path): os.makedirs(os.path.dirname(path),exist_ok=True); json.dump(obj,open(path,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
def video_paths(script_path):
    d=os.path.dirname(os.path.abspath(script_path)); return d,os.path.join(d,'out'),os.path.basename(d)
def theme(name): return load(os.path.join(ROOT,'themes',name,'theme.json'))
def spoken_text(script): return '\n'.join(s['say'] for s in script['scenes'])
def duration(path): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',path]))
def log(line):
    p=os.path.join(ROOT,'logs','voice_log.md'); os.makedirs(os.path.dirname(p),exist_ok=True)
    with open(p,'a',encoding='utf-8') as f: f.write(f"- {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')} {line}\n")
