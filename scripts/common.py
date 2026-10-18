"""Shared helpers: paths, script.json loading, voice-log writing."""
import json,os,datetime,subprocess
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def load(path): return json.load(open(path,encoding='utf-8'))
def save(obj,path): os.makedirs(os.path.dirname(path),exist_ok=True); json.dump(obj,open(path,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
def video_paths(script_path):
    d=os.path.dirname(os.path.abspath(script_path)); return d,os.path.join(d,'out'),os.path.basename(d)
# old theme ids still accepted (deprecated, 16 Oct 2026): use the new ones in new scripts
ALIASES={'tin-nong':'hot-news','meo-nhanh':'quick-tips','commit':'tech-explain'}
def theme_id(name):
    if name in ALIASES:
        import sys; print(f"⚠️  theme '{name}' is deprecated, use '{ALIASES[name]}'",file=sys.stderr); return ALIASES[name]
    return name
def theme(name): return load(os.path.join(ROOT,'themes',theme_id(name),'theme.json'))
def spoken_text(script): return '\n'.join(s['say'] for s in script['scenes'])
def duration(path): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',path]))
def log(line):
    p=os.path.join(ROOT,'logs','voice_log.md'); os.makedirs(os.path.dirname(p),exist_ok=True)
    with open(p,'a',encoding='utf-8') as f: f.write(f"- {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')} {line}\n")

def load_channel(cid="dantech"):
    import sys
    """Brand config: channels/<id>.json (name, wordmark, tagline, handles, follow texts, ctaPhrase/ctaInWord/ctaPressWord;
    optional: logo, page (page display name), disclaimer, legal)."""
    f=os.path.join(ROOT,'channels',f'{cid}.json')
    if not os.path.isfile(f): sys.exit(f'channel "{cid}" not found: {f} (have: {sorted(x[:-5] for x in os.listdir(os.path.join(ROOT,"channels")))})')
    C=json.load(open(f,encoding='utf-8'))
    miss=[k for k in ['name','wordmark','followLabel','followDone','ctaPhrase','ctaInWord','ctaPressWord'] if not C.get(k)]+([] if isinstance(C.get('handles'),list) else ['handles'])  # handles may be [] (client page with no handles yet)
    if miss: sys.exit(f'channel {cid}: missing {miss}')
    return C
