#!/usr/bin/env python3
"""Brand/product detection for automatic logos (nothing to declare in script.json).
Looks at narration ("say") + on-screen text (every prop string) + glossary/kw terms:
  1. registry aliases (assets/brand/registry.json): case/diacritic-insensitive, word boundaries; case:true entries only when written
     capitalised (Threads, Swift, Make); ctx:"social" entries (single letter X) only when the same sentence/label also names
     another social platform or says Twitter; a hit whose original text carries Vietnamese tone marks never matches an
     ASCII alias ("gõ" is not Go)
  2. dynamic candidates: capitalised / camel-case product-like tokens (not sentence-initial, not common words or generic
     acronyms) and glossary/kw terms, resolved against Simple Icons titles/aka only
Opt-out: script "brands_off": true, or "brands_skip": ["X", "Docker"].
Usage: brands.py videos/<slug>/script.json [--fetch]   (prints what was detected; --fetch also resolves logos)"""
import os,re,sys,json,unicodedata
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import brand_logo as BL
VI=re.compile(r'[^\x00-\x7f]')
def nc(c):
    if c in 'đĐ': return 'd'
    d=unicodedata.normalize('NFD',c);b=''.join(x for x in d if unicodedata.category(x)!='Mn');return (b or c)[0].lower() if b else c.lower()
def ntext(s):  # one output char per input char, so spans map back to the original text
    return ''.join(nc(c) for c in s)
def has_marks(s): return any(unicodedata.normalize('NFD',c)!=c and c not in 'đĐ' or c in 'đĐ' for c in s if not c.isascii())
# common words / generic acronyms that must never become a dynamic brand
STOP=set('''a an the and or of to in on for with by is are be it this that from as at vs api apis http https url urls dns ssh ssl tls vps vpn cpu gpu ram rom ssd hdd os ui ux sdk ide cli gui json yaml xml html css pdf svg png jpg gif mp3 mp4 csv sql
usb ai ml llm gb mb kb tb ghz fps hd 4k oss mit agpl gpl bsd cc faq diy ok id pin otp qr nfc wifi lan wan cd ci cd path env var
bot bots app apps web cloud server client data code test tests build run start stop step steps note new old free pro max plus mini ultra
home mail chat page pages post posts team teams video videos short shorts live news tips hack fix bug bugs error log logs file files key keys
one two three yes no good bad best top first last next back up down left right open close save load sync push pull merge rebase commit branch
go box less lit fresh ghost medium unity notion slack swift make express mocha composer temporal bun vite deno hono gin echo chart charts
comment follow like share subscribe kết dan tech dantech readme license changelog makefile dockerfile todo'''.split())
def load_reg(): return BL.registry()
def segments(S):
    """[(scene_index, kind, text)] kind: say-sentence | label"""
    out=[]
    def walk(x,k,key=''):
        if isinstance(x,str):
            if x and not x.startswith('@') and key not in ('icon','out','theme','kind','mode','shell','dir','media','pos','src','mark','section'): out.append((k,'label',x.replace('\\@','@')))
        elif isinstance(x,dict):
            for kk,v in x.items():
                if kk not in ('kw',): walk(v,k,kk)
        elif isinstance(x,list):
            for v in x: walk(v,k,key)
    for k,sc in enumerate(S.get('scenes',[])):
        for sent in re.split(r'(?<=[.!?;])\s+',sc.get('say','').strip()):
            if sent: out.append((k,'say',sent))
        walk(sc.get('props',{}),k)
    return out
def _alias_re(a):
    a=ntext(a).strip();p=r'[\s\-_]*'.join(re.escape(w) for w in re.split(r'\s+',a))
    return re.compile(r'(?<![a-z0-9])'+p+r'(?![a-z0-9])')
def reg_hits(text,R):
    """[(slug,start,end,orig)] registry hits in one text segment, longest alias first, no overlaps"""
    nt=ntext(text);taken=[];hits=[]
    al=sorted(((a,slug) for slug,e in R.items() for a in [e['name']]+e.get('aliases',[])),key=lambda x:-len(x[0]))
    for a,slug in al:
        e=R[slug]
        for m in _alias_re(a).finditer(nt):
            s0,s1=m.span();orig=text[s0:s1]
            if any(not(s1<=x or s0>=y) for x,y in taken): continue
            if VI.search(orig) and has_marks(orig) and not VI.search(a): continue   # "gõ" is not "go"
            if e.get('case') and not orig[:1].isupper(): continue
            if len(ntext(a).strip())==1 and orig!=a.upper(): continue             # single letter: exactly "X"
            taken.append((s0,s1));hits.append((slug,s0,s1,orig))
    return hits
TOKEN=re.compile(r'(?<![\w.])([A-Za-z][A-Za-z0-9]*(?:[.+#-][A-Za-z0-9]+)*\+{0,2}#?)(?![\w])')
def dyn_candidates(S,R,segs):
    """capitalised product-like phrases (1-3 tokens) + glossary/kw terms, not covered by the registry"""
    regn={ntext(a).strip() for e in R.values() for a in [e['name']]+e.get('aliases',[])}
    c={}
    def add(t,why):
        n=ntext(t).strip()
        if len(n)<3 or n in regn or all(w in STOP for w in n.split()) or n.split()[0] in STOP and len(n.split())==1: return
        c.setdefault(t,why)
    for k,kind,text in segs:
        toks=[(m.group(1),m.start()) for m in TOKEN.finditer(text)]
        for i,(t,pos) in enumerate(toks):
            prod=t[:1].isupper() and (len(t)>=3) or re.search(r'[a-z][A-Z]|\d[A-Za-z]|[A-Za-z]\d',t)
            if not prod or VI.search(t): continue
            initial=kind=='say' and text[:pos].strip()==''
            if initial or t.isupper() and len(t)<=4: continue     # sentence start / short acronym (API, VPS, MCP): only via glossary or kw
            phrase=[t];j=i+1
            while j<len(toks) and len(phrase)<3 and toks[j][0][:1].isupper() and text[toks[j-1][1]+len(toks[j-1][0]):toks[j][1]].strip()=='':
                phrase.append(toks[j][0]);j+=1
            for L in range(len(phrase),0,-1): add(' '.join(phrase[:L]),f'{"lời" if kind=="say" else "chữ trên hình"}: "{text[:50]}"')
    for g in (S.get('glossary') or {}): add(g,'glossary')
    def kws(x):
        if isinstance(x,dict):
            for kk,v in x.items():
                if kk=='kw' and isinstance(v,list):
                    for w in v:
                        if isinstance(w,str): add(w,'kw')
                else: kws(v)
        elif isinstance(x,list):
            for v in x: kws(v)
    kws([sc.get('props',{}) for sc in S.get('scenes',[])])
    return c
def detect(S,R=None,offline=False):
    """-> {'brands':[{slug,name,source:'registry'|'dynamic',first_scene,hook,hits:[...]}], 'opted_out':[...], 'off':bool}"""
    R=R or load_reg()
    if S.get('brands_off'): return {'brands':[],'opted_out':[],'off':True}
    skip={ntext(x).strip() for x in S.get('brands_skip',[]) or []}
    segs=segments(S);found={}
    social={s for s,e in R.items() if e.get('cat')=='social' and not e.get('ctx')}
    first=re.split(r'(?<=[.!?:])\s',S['scenes'][0].get('say','').strip(),maxsplit=1)[0] if S.get('scenes') else ''
    for k,kind,text in segs:
        hs=reg_hits(text,R);here={h[0] for h in hs}
        for slug,s0,s1,orig in hs:
            e=R[slug]
            if e.get('ctx')=='social' and not (here&social or re.search(r'twitter',ntext(text))): continue
            b=found.setdefault(slug,{'slug':slug,'name':e['name'],'source':'registry','first_scene':k,'hook':False,'hits':[],'aliases':[e['name']]+e.get('aliases',[]),'case':bool(e.get('case')),'ctx':e.get('ctx')})
            b['hits'].append({'scene':k,'where':kind,'text':orig})
    for slug,b in found.items():
        if any(h['scene']==0 and h['where']=='say' and h['text'] in first for h in b['hits']): b['hook']=True
    # dynamic: product-like tokens resolved against Simple Icons only (exact title / aka)
    for t,why in dyn_candidates(S,R,segs).items():
        x=BL.si_lookup(t,offline=offline)
        if not x or not (x['title']==t or t in x['aka']): continue   # exact spelling incl. case: README is not ReadMe
        slug=BL.slugify(x['title'])
        if slug in found or any(slug==s for s in R): continue
        hits=[{'scene':k,'where':kind,'text':t} for k,kind,text in segs if re.search(r'(?<![A-Za-z0-9])'+re.escape(t)+r'(?![A-Za-z0-9])',text)]
        if not hits: continue
        found[slug]={'slug':slug,'name':t if t in x['aka'] else x['title'],'si_title':x['title'],'source':'dynamic','why':why,'si':x['slug'],'first_scene':min(h['scene'] for h in hits),'hook':any(h['scene']==0 and h['where']=='say' and h['text'] in first for h in hits),
                     'hits':hits,'aliases':[t] if ntext(t)==ntext(x['title']) else [t,x['title']],'case':t.isupper() or t[:1].isupper() and len(t)<=4,'ctx':None}
    out=[];opted=[]
    for b in sorted(found.values(),key=lambda b:(b['first_scene'],min(h['scene'] for h in b['hits']))):
        if ntext(b['name']).strip() in skip or any(ntext(a).strip() in skip for a in b['aliases']): opted.append(b['name']);continue
        out.append(b)
    return {'brands':out,'opted_out':opted,'off':False}
def resolve(S,R=None,offline=None,log=print):
    """detect + fetch/cache logos -> (brands for props, report lines)"""
    R=R or load_reg();D=detect(S,R,offline=bool(offline));rep=[];props=[]
    if D['off']: return [],['brand: tắt (brands_off: true)']
    for b in D['brands']:
        e=dict(R.get(b['slug'],{}),slug=b['slug']) if b['source']=='registry' else {'slug':b['slug'],'si':b['si'],'name':b['name']}
        m=BL.ensure(b['name'],e,offline=offline)
        where=sorted({h['scene']+1 for h in b['hits']})
        if m.get('status')!='ok':
            rep.append(f'logo bỏ qua: {b["name"]} (cảnh {",".join(map(str,where))}) — {m.get("reason")}');continue
        props.append({'slug':b['slug'],'name':b['name'],'src':f'brand/{b["slug"]}/{m["file"]}','mono':m['mono'],'color':m.get('color'),'kind':m['kind'],
                      'aliases':b['aliases'],'case':b['case'],'ctx':b.get('ctx'),'hook':b['hook'],'scenes':where})
        rep.append(f'brand: {b["name"]} ✓ {m["source"]} ({m["source_url"]}){" · dynamic: "+b.get("why","") if b["source"]=="dynamic" else ""} · cảnh {",".join(map(str,where))}{" · hook" if b["hook"] else ""}')
    for n in D['opted_out']: rep.append(f'brand: {n} tắt theo brands_skip')
    return props,rep
if __name__=='__main__':
    S=json.load(open(sys.argv[1],encoding='utf-8'))
    if '--fetch' in sys.argv:
        _,rep=resolve(S,offline=False if '--online' in sys.argv else None)
        for l in rep: print(l)
    else:
        D=detect(S,offline=True)
        for b in D['brands']: print(f'{b["name"]:<18} {b["source"]:<8} scenes {sorted({h["scene"]+1 for h in b["hits"]})} hook={b["hook"]}  e.g. {[h["text"] for h in b["hits"][:4]]}')
        if D['opted_out']: print('opted out:',D['opted_out'])
# ── helpers for autofill / props (one detected brand dict from resolve(): name, aliases, case) ──
INLINE_TYPES={'DataFlow','Layers','Table','AtTake','BeforeAfter','Specs','AtSpec','VersusHook'}   # scenes that draw logos next to matching labels
def brand_in(text,b):
    """True when `text` names brand `b` (same rules as reg_hits / remotion brandmark.tsx brandsIn)"""
    nt=ntext(text)
    for a in sorted([b['name']]+b.get('aliases',[]),key=len,reverse=True):
        for m in _alias_re(a).finditer(nt):
            orig=text[m.start():m.end()]
            if VI.search(orig) and has_marks(orig) and not VI.search(a): continue
            if b.get('case') and not orig[:1].isupper(): continue
            if len(ntext(a).strip())==1 and orig!=a.upper(): continue
            return True
    return False

# which prop fields each inline-capable scene type draws through BrandText (keep in sync with remotion/src: packs.tsx, android.tsx, versus.tsx)
DRAWN={'DataFlow':{'s'},'Layers':{'s'},'Table':{'k'},'AtTake':{'k'},'BeforeAfter':{'s'},'Specs':{'big','small'},'AtSpec':{'big','small'},'VersusHook':{'claim','label'}}
def drawn_strs(typ,props):
    keys=DRAWN.get(typ,set());out=[]
    def walk(x,key=None):
        if isinstance(x,str):
            if key in keys and not x.startswith('@'): out.append(x)
        elif isinstance(x,dict):
            for k,v in x.items(): walk(v,k)
        elif isinstance(x,list):
            for v in x: walk(v,key)
    walk(props);return out
