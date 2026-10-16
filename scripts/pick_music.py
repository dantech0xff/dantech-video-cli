#!/usr/bin/env python3
"""Step 4a: choose the music bed -> out/music.json.
script.json "music": {"track": "random" | "<track id>", "start": <optional seconds>}.
"random" rotates through theme.json music.pool, least-recently-used first: tracks never seen in
logs/voice_log.md come first, then the one whose last use is oldest (ties broken at random)."""
import random,re,sys
from common import *
def lru_pick(pool,log_path):
    hist=re.findall(r'music \*\*([^*]+)\*\*',open(log_path,encoding='utf-8').read()) if os.path.exists(log_path) else []
    last={tid:i for i,tid in enumerate(hist)}            # position of each track's latest use
    age=lambda p:last.get(p['id'],-1)                    # -1 = never used
    oldest=min(age(p) for p in pool)
    return random.choice([p for p in pool if age(p)==oldest])
if __name__=='__main__':
    S=load(sys.argv[1]); vdir,out,slug=video_paths(sys.argv[1]); T=theme(S['theme'])['music']
    cfg=S.get('music',{}); pool={p['id']:p for p in T['pool']}
    tracks={x['id']:x for x in load(os.path.join(ROOT,'assets/music/tracks.json'))}
    tid=cfg.get('track','random')
    if tid!='random' and tid not in tracks:
        sys.exit(f"music.track '{tid}' không có trong assets/music/tracks.json.\n"
                 f"  Pool của theme {S['theme']}: {', '.join(pool)}\n  Mọi id hợp lệ: {', '.join(sorted(tracks))}\n  Hoặc dùng \"random\".")
    pick=lru_pick(T['pool'],os.path.join(ROOT,'logs','voice_log.md')) if tid=='random' else pool.get(tid,{'id':tid,'start':0})
    track=tracks[pick['id']]
    res={'id':pick['id'],'file':os.path.join(ROOT,track['file']),'start':cfg.get('start',pick['start']),'rel':T['rel']}
    if not os.path.exists(res['file']): sys.exit(f"missing music file {track['file']} (run ./dt fetch-music, Pixabay tracks are manual)")
    save(res,os.path.join(out,'music.json'))
    log(f"{slug}: music **{pick['id']}** from {res['start']}s ({'random LRU' if tid=='random' else 'pinned'}, Content ID: {track['content_id']})")
    print('music:',pick['id'],'start',res['start'])
