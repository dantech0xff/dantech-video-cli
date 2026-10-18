#!/usr/bin/env python3
"""Step 6: out/description.txt = caption + sources + credit lines (music, SFX, voice)."""
import sys
from common import *
S=load(sys.argv[1]); vdir,out,slug=video_paths(sys.argv[1]); music=load(os.path.join(out,'music.json'))
tracks={x['id']:x for x in load(os.path.join(ROOT,'assets/music/tracks.json'))}; tr=tracks[music['id']]
sfx=load(os.path.join(ROOT,'assets/sfx/sfx.json'))
props=load(os.path.join(out,'props.json'))
used=sorted({x['s'] for x in props['sfx']}|{'cta_click','cta_bell','outro_sting'}|{load(os.path.join(ROOT,'themes',S['theme'],'theme.json'))['look']['sfx']['trans']})
lines=[S.get('title',''),'',S.get('caption',''),'','Nguồn:']+[f"- {s}" for s in S.get('sources',[])]+['',tr['credit']]
if tr['content_id']!='none': lines.append(f"(Content ID: {tr['content_id']}, check before posting)")
kenney=sorted({sfx[s]['pack'] for s in used if sfx[s]['source']=='kenney'})
vm=os.path.join(out,'voice_meta.json');vm=load(vm) if os.path.exists(vm) else {}   # credit the engine that actually spoke (was hardcoded Gemini)
voice='Giọng đọc: Microsoft Edge TTS ('+vm.get('voice','')+')' if vm.get('engine')=='edge' else 'Giọng đọc: Gemini TTS'
lines+=[f"SFX: Kenney ({', '.join(kenney)}), CC0 1.0, kenney.nl" if kenney else '',voice]
open(os.path.join(out,'description.txt'),'w',encoding='utf-8').write('\n'.join(l for l in lines if l is not None).strip()+'\n')
print('description:',os.path.join(out,'description.txt'))
