#!/usr/bin/env python3
"""Download the Wikimedia Commons tracks listed in assets/music/tracks.json (skips files already present)."""
import json,os,subprocess,time,urllib.parse,urllib.request
from common import *
UA={'User-Agent':'dantech-video/1.0 (music fetch; github.com/dantech0xff/dantech-video)'}
GAP=8
def get(url,tries=6):
    for i in range(tries):
        try: return urllib.request.urlopen(urllib.request.Request(url,headers=UA)).read()
        except urllib.error.HTTPError as e:
            if e.code!=429 or i==tries-1: raise
            try: w=max(int(e.headers.get('Retry-After') or 45),30)
            except ValueError: w=45
            print('  429 → sleep %ds'%w,flush=True); time.sleep(w)
for t in load(os.path.join(ROOT,'assets/music/tracks.json')):
    dst=os.path.join(ROOT,t['file'])
    if os.path.exists(dst): continue
    if t['fetch']!='commons': print('manual download needed:',t['file'],'←',t['source']); continue
    title=urllib.parse.unquote(t['source'].split('/wiki/')[1])
    q='https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles='+urllib.parse.quote(title)
    page=next(iter(json.loads(get(q))['query']['pages'].values()))
    url=page['imageinfo'][0]['url']; os.makedirs(os.path.dirname(dst),exist_ok=True); tmp=dst+'.src'
    time.sleep(GAP)
    open(tmp,'wb').write(get(url))
    subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-c:a','libmp3lame','-q:a','0',dst],check=True); os.remove(tmp); print('fetched',t['file'])
    time.sleep(GAP)
