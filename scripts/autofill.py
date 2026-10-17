"""Layer 1 auto-filler + Layer 2 kw highlights (imported by build_props.py; no network, deterministic).

Visual-change timeline per scene = scene entry + every resolved cue anchor / numeric "at" in props (item reveals, ticks,
typing, highlights) + script "overlays" + kw highlights + Follow CTA in/press. SFX alone never counts; captions never count.
Any stretch of voiced narration longer than GAP_S with no change gets fillers spaced <= GAP_S apart, each drawn from the
words being spoken at that moment, in this order:
  focus (a visible item/code line contains a spoken word, or a spoken number already on screen)
  > num (only numbers declared in scene "numbers": [{n,label}]) > term (only glossary terms, with their gloss, + icon)
  > progress (scene n/m, once per scene) > diagram (scene "diagram" hint, once) > re-focus a visible item
  > the scene title (once per scene) > diagram / progress again.
Scenes with "still": true only get fillers beyond STILL_S (the gate lets them hold up to 5 s).
Disable with script/scene "autofill": false. Returns overlay events (scene-relative frames) + a log."""
import re
FPS=30; GAP_S=2.5; STILL_S=4.5; GAP=round(GAP_S*FPS); STILL_GAP=round(STILL_S*FPS)
STOP=set('''và là thì mà của cho với để trong khi nếu nhưng còn rồi này đó kia cái các những một được bị có không cũng đã
sẽ đang thôi nhé nha ra vào lên xuống từ tới đến theo như bạn mình ta chúng nó họ hay hoặc vì nên lại vẫn chỉ ngay
thế vậy nào gì đây ở trên dưới ai mỗi mọi rất quá hơn nhất cần phải muốn biết thấy làm dùng xem nói bằng về sau trước
hết giờ lúc nhiều ít chưa đừng hãy luôn bao follow dan tech the a an of to in is it'''.split())
NUM={'không':0,'một':1,'mốt':1,'hai':2,'ba':3,'bốn':4,'tư':4,'năm':5,'lăm':5,'sáu':6,'bảy':7,'tám':8,'chín':9}
ICON=[(('cài','tải','install','download'),'download'),(('chạy','run'),'play'),(('kiểm','check','test'),'check'),(('lỗi','bug','crash'),'bug'),
 (('emulator','phone','điện'),'phone'),(('mac','macos','laptop','xcode'),'laptop'),(('terminal','lệnh','shell','adb'),'terminal'),
 (('setting','settings','manager'),'settings'),(('code','kotlin','dart'),'code'),(('nhanh','fast'),'bolt'),(('giây','ms','phút'),'clock'),
 (('build','rebuild','reload'),'refresh'),(('sdk','layer','lớp'),'layers'),(('plugin','dependency'),'link'),(('tìm','search'),'search')]
clean=lambda w:re.sub(r'^[^\w@#+.\-]+|[^\w+%]+$','',w,flags=re.U)
low=lambda s:re.sub(r'[.,!?:;"“”()]','',s).lower()
def is_num_word(w): return low(w) in NUM or low(w) in ('mười','mươi','trăm','nghìn','ngàn')
def parse_num(ws,i):
    """number starting at ws[i]: digits or Vietnamese number words. -> (value_str, n_tokens) or None"""
    w=clean(ws[i])
    if re.fullmatch(r'\d+([.,]\d+)?\+?%?',w): return w,1
    toks=[];j=i
    while j<len(ws) and is_num_word(ws[j]) and len(toks)<5:
        toks.append(low(ws[j])); j+=1
        if re.search(r'[.,!?:;]$',ws[j-1]): break
    if not toks: return None
    v=0;cur=0
    for k,t in enumerate(toks):
        if t=='mười': cur=10
        elif t=='mươi': cur=(cur or 1)*10
        elif t=='trăm': v+=(cur or 1)*100; cur=0
        elif t in('nghìn','ngàn'): v=(v+(cur or 1))*1000; cur=0
        else:
            d=NUM[t]
            if cur>=10 and cur%10==0: cur+=d
            elif cur and k>0 and toks[k-1] in NUM and toks[k-1] not in('không','một'): cur=cur*10+d   # "hai tư" = 24
            else: cur=d
    v+=cur
    if len(toks)==1 and (toks[0] in('năm','tư','lăm','mốt','một','không','ba') ): return None  # too ambiguous alone
    if v<2: return None
    return str(v),len(toks)
def term_at(ws,i,gloss):
    """salient term starting at word i (merges up to 3 consecutive Latin words: 'Android Studio', 'SDK Manager')"""
    w=clean(ws[i])
    if not w or low(w) in STOP or len(w)<3 or not re.search(r'[A-Za-z]',w) or re.search(r'[^\x00-\x7F]',w): return None
    parts=[w];j=i+1
    while j<len(ws) and len(parts)<3 and not re.search(r'[.,!?:;]$',ws[j-1]):
        n=clean(ws[j])
        if n and n[0].isupper() and not re.search(r'[^\x00-\x7F]',n) and low(n) not in STOP: parts.append(n); j+=1
        else: break
    t=' '.join(parts)
    sc=3*(t[0].isupper())+2*bool(re.search(r'[a-z][A-Z]|\d|[A-Z]{2}',t))+len(t)/5+(len(parts)-1)*1.5+4*(low(t) in gloss)
    return t,sc,len(parts)
def texts(props):
    """(text, at|None, path) of every prop item that shows text; at None = visible from the scene start"""
    out=[]
    def walk(x,path):
        if isinstance(x,dict):
            s=next((x[k] for k in ('s','name','k','label','big','msg','w','line') if isinstance(x.get(k),str)),None)
            at=x.get('at') if isinstance(x.get('at'),(int,float)) else None
            if s and not s.startswith('@'): out.append((s.replace('\\@','@'),at,path))
            for k,v in x.items(): walk(v,f'{path}.{k}')
        elif isinstance(x,list):
            for k,v in enumerate(x): walk(v,f'{path}[{k}]')
    walk(props,'props'); return out
def beats(raw,res,acc,key=''):
    """frames of every timed thing in a scene's props: anchors (strings '@..') and numeric *at / list-of-number timings"""
    if isinstance(raw,str):
        if raw.startswith('@') and isinstance(res,(int,float)): acc.append(int(res))
    elif isinstance(raw,dict):
        for k,v in raw.items(): beats(v,res.get(k) if isinstance(res,dict) else None,acc,k)
    elif isinstance(raw,list):
        for k,v in enumerate(raw):
            r=res[k] if isinstance(res,list) and k<len(res) else None
            if isinstance(v,(int,float)) and not isinstance(v,bool) and key.lower() in('taps','hits','at'): acc.append(int(v))
            else: beats(v,r,acc,key)
    elif isinstance(raw,(int,float)) and not isinstance(raw,bool) and key.lower().endswith('at') and key!='at0': acc.append(int(raw))
    return acc
def plan(S,W,ranges,starts,durs,raw_props,res_props,cta,resolve_word):
    """-> (ov per scene, log lines, timeline dict)"""
    gloss={low(k):v for k,v in (S.get('glossary') or {}).items() if isinstance(v,str) and 0<len(v)<=70}
    gterm={low(k):k for k in (S.get('glossary') or {})}
    secs=[];[secs.append(sc['section']) for sc in S['scenes'] if sc['section'] not in secs]
    allov=[];log=[];tl=[]
    for k,sc in enumerate(S['scenes']):
        lo,hi=ranges[k];st=starts[k];dur=durs[k];ws=[w['t'] for w in W[lo:hi]]
        say=sc['say'].split()
        ov=[]
        # script-declared overlays (anchors already resolved by the caller)
        for o in sc.get('overlays',[]) or []:
            o=dict(o);o['at']=resolve_word(o['at'],k) if isinstance(o['at'],str) else int(o['at'])
            o['end']=o['at']+int(round(float(o.get('dur',2.2))*FPS)) if not isinstance(o.get('end'),(int,float)) else int(o['end']);o.pop('dur',None)
            o['why']='script overlay';ov.append(o)
        # Layer 2: items with kw -> focus when the word is spoken (after the item is visible)
        def kw_items(raw,res):
            if isinstance(raw,dict):
                if isinstance(raw.get('kw'),list):
                    txt=next((res[q] for q in ('s','name','k','label','big','msg') if isinstance(res.get(q),str)),None)
                    if txt: yield txt.replace('\\@','@'),(res.get('at') if isinstance(res.get('at'),(int,float)) else 0),raw['kw']
                for q,v in raw.items(): yield from kw_items(v,res.get(q) if isinstance(res,dict) else None)
            elif isinstance(raw,list):
                for q,v in enumerate(raw): yield from kw_items(v,res[q] if isinstance(res,list) and q<len(res) else None)
        for txt,at,kws in kw_items(raw_props[k],res_props[k]):
            for kwd in kws:
                for i,w in enumerate(say):
                    if low(w)==low(kwd):
                        f0=round(W[lo+i]['s']*FPS)-st
                        if f0>=at+6: ov.append({'kind':'focus','at':f0,'end':f0+54,'match':txt[:60],'why':f'kw "{kwd}" spoken'})
        # visual-change timeline
        ev=[0]+[b for b in beats(raw_props[k],res_props[k],[]) if 0<=b<dur]+[o['at'] for o in ov]
        for c in (cta['inAt'],cta['pressAt']):
            if st<=c<st+dur: ev.append(c-st)
        voiced=round(W[hi-1]['e']*FPS)-st if hi>lo else 0
        ev=sorted(set(e for e in ev if e<=voiced))
        G=STILL_GAP if sc.get('still') else GAP   # still:true (quote-like) scenes may hold up to 5 s; fill only beyond ~4.5 s
        gaps=[(a,b) for a,b in zip(ev,ev[1:]+[voiced]) if b-a>G]
        tl.append({'scene':k+1,'type':sc['type'],'start':st,'dur':dur,'voiced':voiced,'events':ev,'gaps_before':[(a,b) for a,b in gaps]})
        auto=S.get('autofill',True) is not False and sc.get('autofill',True) is not False
        if not auto:
            if gaps: log.append(f'autofill: scene {k+1} disabled (autofill:false), {len(gaps)} static gap(s) left: '+', '.join(f'{(st+a)/FPS:.1f}-{(st+b)/FPS:.1f}s' for a,b in gaps))
            allov.append(sorted(ov,key=lambda o:o['at'])); tl[-1]['gaps_after']=gaps; continue
        items=[(txt,at or 0) for txt,at,_ in texts(res_props[k]) if not _.endswith('.title') and _!='props.title' and len(txt)>=3]
        used=set();last_focus=None;nums=[x for x in (sc.get('numbers') or []) if isinstance(x,dict) and x.get('label')]
        def window(f):
            """scene words spoken in [f-1.0s, f+1.6s], current word first"""
            t=(st+f)/FPS;idx=[i for i in range(len(ws)) if W[lo+i]['s']<=t+1.6 and W[lo+i]['e']>=t-1.0]
            cur=min(idx,key=lambda i:abs(W[lo+i]['s']-t)) if idx else None
            return sorted(idx,key=lambda i:(abs(i-cur) if cur is not None else 0)),cur
        title=res_props[k].get('title') if isinstance(res_props[k].get('title'),str) else ''
        TIMING={'at','ok','warn','hl','end','from','to','dur','start','keep','every','count_at','v','s_at','taps','in','press','x','y','w','h'}
        def strs(x):
            if isinstance(x,str): return [] if x.startswith('@') else [x]
            if isinstance(x,dict): return [t for kk,v in x.items() for t in (strs(v) if not isinstance(v,(int,float)) or isinstance(v,bool) else ([] if kk in TIMING or kk.endswith('At') else [str(v)]))]
            if isinstance(x,list): return [t for v in x for t in strs(v)]
            return []
        every=[(t,0) for t in strs(res_props[k])]+[(sc.get('section') or '',0)]
        # text on screen for the whole scene: the title and untimed top-level strings (last-resort focus targets)
        still=[t.split('|')[0].strip() for t in [title]+[v for kk,v in res_props[k].items() if kk!='title' and isinstance(v,str)]
               if t and len(t)>=3 and not t.startswith('@') and not re.search(r'^#?[0-9A-Fa-f]{3,8}$|^https?:|\.(dart|kt|kts|ts|js|py|json|mp4|webm|png|jpe?g|svg|mp3|wav)$',t)]
        still=[t for t in still if len(t)>=3]
        def vis_all(f): return items+[(title,0)]+every  # every string the scene shows now or later: a chip would repeat it
        def pick(f,dock_ok=True):
            nonlocal last_focus
            idx,cur=window(f)
            if not idx: return None
            # focus: a visible item contains a spoken salient term, or two consecutive spoken words
            for i in idx:
                cands=[]
                r=term_at(say,i,gloss)
                if r and r[1]>=1.2: cands.append((low(r[0]),f'term "{r[0]}"'))
                if i+1<len(say) and low(clean(say[i])) not in STOP|{''} : cands.append((low(clean(say[i]))+' '+low(clean(say[i+1])),f'phrase "{say[i]} {say[i+1]}"'))
                for needle,why in cands:
                    for txt,at in items:
                        if at<=f-4 and re.search(r'(^|[^\w])'+re.escape(needle)+r'($|[^\w])',low(txt)) and txt!=last_focus and ('f',txt) not in used:
                            last_focus=txt;used.add(('f',txt));return {'kind':'focus','match':txt[:60],'why':f'spoken {why} matches item "{txt[:40]}"'}
            if not dock_ok:
                vis=[txt for txt,at in items if at<=f-4 and txt!=last_focus]
                if vis: txt=vis[(f//GAP)%len(vis)];last_focus=txt;return {'kind':'focus','match':txt[:60],'why':'Follow CTA on screen: focus only'}
                if still and ('title',) not in used: used.add(('title',));txt=still[0];last_focus=txt;return {'kind':'focus','match':txt[:60],'why':'Follow CTA on screen: focus the title (once)'}
                return None
            # number: on screen -> focus the element that shows it; else only numbers the script declares in scene "numbers"
            for i in sorted(idx):
                r=parse_num(say,i)
                if r and i>0 and (lambda q:q and q[1]>=2)(parse_num(say,i-1)): r=None   # "bốn" inside "mười bốn" is not a new number
                if not r: continue
                v=r[0];hit=lambda t:re.search(r'(^|\D)'+re.escape(v)+r'(\D|$)',t)
                if any(hit(t) for t,_ in every):
                    el=next((txt for txt,at in items if at<=f-4 and hit(txt)),None) or (v if ('fn',v) not in used else None)
                    if el and ('fn',v) not in used and el!=last_focus:
                        used.add(('fn',v));last_focus=el;return {'kind':'focus','match':el[:60],'why':f'spoken number {v} is on screen: focus it'}
                    continue
                d=next((x for x in nums if str(x.get('n'))==v),None)
                if d and ('n',v) not in used:
                    used.add(('n',v));return {'kind':'num','n':v,'label':d['label'],'why':f'declared number {v} spoken ("{" ".join(say[i:i+r[1]])}")'}
            # term chip: only a glossary term (with its gloss) that is being spoken and is not already on screen
            sl=[low(clean(x)) for x in say]
            for key in sorted(gloss,key=lambda x:-len(x)):
                kt=[low(clean(x)) for x in key.split()]
                at_i=next((i for i in idx if sl[i:i+len(kt)]==kt),None)
                if at_i is None or ('t',key) in used or any(key in low(tx) for tx,_ in vis_all(f)): continue
                used.add(('t',key));o={'kind':'term','w':gterm[key],'g':gloss[key],'why':f'glossary term "{gterm[key]}" spoken'}
                win=' '.join(sl[i] for i in idx)
                for keys,g in ICON:
                    if any(re.search(r'(^| )'+re.escape(kk)+r'($| )',win) for kk in keys): o['icon']=g;break
                return o
            if ('p',) not in used and len(S['scenes'])>1:
                used.add(('p',));return {'kind':'progress','n':k+1,'m':len(S['scenes']),'label':sc['section'],'why':'no matching item/number/term: lesson progress (scene n/m)'}
            if sc.get('diagram') and ('d',) not in used:
                used.add(('d',));d=sc['diagram'];return {'kind':'diagram','nodes':d['nodes'],'label':d.get('label'),'why':'scene diagram hint'}
            # last resort: re-focus a visible item (cycles)
            vis=[txt for txt,at in items if at<=f-4 and txt!=last_focus]
            if vis: txt=vis[(f//GAP)%len(vis)];last_focus=txt;return {'kind':'focus','match':txt[:60],'why':'fallback: re-focus a visible item'}
            if still and ('title',) not in used: used.add(('title',));txt=still[0];last_focus=txt;return {'kind':'focus','match':txt[:60],'why':'fallback: focus the scene title (once per scene)'}
            if sc.get('diagram'): d=sc['diagram'];return {'kind':'diagram','nodes':d['nodes'],'label':d.get('label'),'why':'fallback after title focus: diagram again'}
            if len(S['scenes'])>1: return {'kind':'progress','n':k+1,'m':len(S['scenes']),'label':sc['section'],'why':'fallback after title focus: progress again'}
            return None
        for a,b in gaps:
            n=-(-(b-a)//G)-1; slots=[a+round((b-a)*j/(n+1)) for j in range(1,n+1)]
            for j,f0 in enumerate(slots):
                end=(slots[j+1]-1) if j+1<len(slots) else b-4
                if end-f0<30: end=min(b-2,f0+30)
                ca,cb=cta['inAt']-st-12,cta['outAt']-st
                o=pick(f0,dock_ok=not(f0<cb and end>ca))
                if o and o['kind']=='focus' and f0<cb and end>ca: o['bot']=cta['top']-24
                if not o: log.append(f'autofill: scene {k+1} {(st+f0)/FPS:.1f}s: nothing to show (gap {(b-a)/FPS:.1f}s)'); continue
                o.update({'at':f0,'end':end,'auto':True});ov.append(o)
                desc=o.get('w') or o.get('match') or o.get('n') or o.get('label')
                log.append(f'autofill: scene {k+1} ({sc["type"]}) {(st+f0)/FPS:5.1f}-{(st+end)/FPS:5.1f}s  {o["kind"]:<8} "{str(desc)[:34]}"  ← {o["why"]}')
        ev2=sorted(set(ev+[o['at'] for o in ov]))
        tl[-1]['gaps_after']=[(x,y) for x,y in zip(ev2,ev2[1:]+[voiced]) if y-x>G]
        if sc.get('still'): tl[-1]['still']=True
        allov.append(sorted(ov,key=lambda o:o['at']))
    return allov,log,tl
