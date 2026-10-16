#!/usr/bin/env python3
"""Step 4a: choose the music bed -> out/music.json.
script.json "music": {"track": "random" | "<track id>", "start": <optional seconds>}; random picks from theme.json music.pool."""
import random,sys
from common import *
S=load(sys.argv[1]); vdir,out,slug=video_paths(sys.argv[1]); T=theme(S['theme'])['music']
cfg=S.get('music',{}); pool={p['id']:p for p in T['pool']}
tid=cfg.get('track','random'); pick=random.choice(T['pool']) if tid=='random' else pool.get(tid,{'id':tid,'start':0})
track={x['id']:x for x in load(os.path.join(ROOT,'assets/music/tracks.json'))}[pick['id']]
res={'id':pick['id'],'file':os.path.join(ROOT,track['file']),'start':cfg.get('start',pick['start']),'rel':T['rel']}
if not os.path.exists(res['file']): sys.exit(f"missing music file {track['file']} (run ./dt fetch-music, Pixabay tracks are manual)")
save(res,os.path.join(out,'music.json'))
log(f"{slug}: music **{pick['id']}** from {res['start']}s ({'random' if tid=='random' else 'pinned'}, Content ID: {track['content_id']})")
print('music:',pick['id'],'start',res['start'])
