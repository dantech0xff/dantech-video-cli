#!/usr/bin/env python3
"""Automatic brand logos: find, validate and cache a logo for a brand/product name.
Cache: assets/brand/<slug>/logo.svg|logo.png + meta.json {name, slug, file, kind, mono, color, source, source_url, license, fetched_at}.
A failed lookup is cached too (meta.json status "skipped" + reason) so later runs work offline; --refresh retries.
Source order (first valid wins):
  1. Simple Icons (pinned data + icons, CC0 data; marks stay trademarks of their owners): SVG + official hex
  2. official site (registry homepage): inline <svg>/<img> whose class/id/aria-label/alt names the brand, then site icons
     (manifest / apple-touch-icon / og:logo / svg favicon) only when the site's domain matches the brand name;
     static HTML first, then the rendered DOM (headless Chrome) for sites that draw the mark with JS
  3. GitHub org avatar (registry "github")
  4. Wikimedia Commons "File:<Name> logo.svg" (exact title)
Validation: vector or >= 256 px; not a near-blank/placeholder image; transparent background (opaque square = app-icon "tile");
aspect 0.4..2.5 (wide wordmarks are skipped: the mark must sit next to the name); brand-name match (title / attribute / domain).
Never draws or invents a logo. Usage: brand_logo.py "Grok Bot" [--refresh] [--offline]"""
import os,re,io,sys,json,time,subprocess,unicodedata
from datetime import datetime,timezone
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND=os.path.join(ROOT,'assets','brand')
SI_VER='16.35.0'
SI_DATA=os.path.join(BRAND,'_simple-icons.json')
UA={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36 dantech-video-brand-logo'}
CHROME=next((p for p in ('/opt/google/chrome/chrome','/usr/bin/google-chrome','/usr/bin/chromium') if os.path.exists(p)),None)
def nrm(s):
    s=unicodedata.normalize('NFD',s.replace('đ','d').replace('Đ','D'));return ''.join(c for c in s if unicodedata.category(c)!='Mn').lower()
def slugify(name): return re.sub(r'[^a-z0-9]+','-',nrm(name)).strip('-')
def tokens(name):
    n=nrm(name);return {n.replace(' ',''),n.replace(' ','-'),n.replace(' ','_')}
def registry():
    R=json.load(open(os.path.join(BRAND,'registry.json'),encoding='utf-8'));R.pop('_doc',None);return R
def _get(url,timeout=20):
    import requests
    r=requests.get(url,headers=UA,timeout=timeout);r.raise_for_status();return r
# ── Simple Icons ──
def si_index(offline=False):
    """slim index [{title,slug,hex,aka,guidelines,license}] pinned to SI_VER, cached in assets/brand/_simple-icons.json"""
    if os.path.isfile(SI_DATA): return json.load(open(SI_DATA,encoding='utf-8'))['icons']
    if offline: return []
    d=_get(f'https://cdn.jsdelivr.net/npm/simple-icons@{SI_VER}/data/simple-icons.json',60).json()
    def slug_of(x):
        if x.get('slug'): return x['slug']
        t=x['title'].lower();t=t.replace('+','plus').replace('.','dot').replace('&','and');return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFD',t))
    icons=[{'title':x['title'],'slug':slug_of(x),'hex':x['hex'],'aka':(x.get('aliases') or {}).get('aka',[]),'guidelines':x.get('guidelines'),'license':(x.get('license') or {}).get('type')} for x in d]
    json.dump({'version':SI_VER,'source':f'https://cdn.jsdelivr.net/npm/simple-icons@{SI_VER}/data/simple-icons.json','license':'CC0-1.0 (data); icons are trademarks of their owners','icons':icons},open(SI_DATA,'w',encoding='utf-8'),ensure_ascii=False)
    return icons
def si_lookup(name,slug=None,offline=False,aka=True):
    idx=si_index(offline);n=nrm(name).strip()
    for x in idx:
        if slug and x['slug']==slug: return x
    for x in idx:
        if nrm(x['title'])==n: return x
    if aka:
        for x in idx:
            if any(nrm(a)==n for a in x['aka']): return x
    return None
def from_si(x):
    svg=_get(f'https://cdn.jsdelivr.net/npm/simple-icons@{SI_VER}/icons/{x["slug"]}.svg').text
    if '<path' not in svg: return None,'Simple Icons: SVG rỗng'
    svg=svg.replace('<svg ',f'<svg fill="#{x["hex"]}" ',1)
    lic='trademark of its owner'+(f'; brand guidelines: {x["guidelines"]}' if x.get('guidelines') else '')+(f'; icon license {x["license"]}' if x.get('license') else '')
    return {'data':svg.encode(),'ext':'svg','source':'simple-icons','source_url':f'https://simpleicons.org/?q={x["slug"]}','color':'#'+x['hex'],'license':lic,'match':f'Simple Icons title "{x["title"]}"'},None
# ── validation ──
def check_svg(svg):
    if not re.search(r'<(path|circle|rect|polygon|ellipse)\b',svg): return 'SVG không có hình'
    m=re.search(r'viewBox="\s*([-\d.]+)[ ,]+([-\d.]+)[ ,]+([-\d.]+)[ ,]+([-\d.]+)',svg)
    if m:
        w,h=float(m.group(3)),float(m.group(4))
        if h<=0 or not .4<=w/h<=2.5: return f'tỉ lệ {w/h:.2f} (logo chữ ngang, không phải mark)'
    return None
def check_png(data):
    from PIL import Image,ImageStat
    im=Image.open(io.BytesIO(data)).convert('RGBA');w,h=im.size
    if min(w,h)<256: return None,f'ảnh {w}x{h} < 256 px'
    if not .4<=w/h<=2.5: return None,f'tỉ lệ {w/h:.2f}'
    st=ImageStat.Stat(im.convert('L'),mask=im.split()[3].point(lambda a:255 if a>20 else 0))
    if not st.count[0] or st.stddev[0]<6: return None,'ảnh gần như một màu (placeholder?)'
    cs=[im.getpixel(p) for p in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]]
    if all(c[3]<16 for c in cs): return 'transparent',None
    if max(abs(cs[0][i]-c[i]) for c in cs for i in range(3))<12: return 'tile',None   # opaque square app icon: shown as a rounded tile
    return None,'nền không trong suốt và không đồng màu (khó cắt sạch)'
def mono_svg(svg):
    """class-styled DOM svg (fills come from page CSS): first/largest shape = mark, inner shapes = cut-outs (evenodd), one colour.
    Only svgs that draw plain paths (no <defs>/<mask>/<use>/<clipPath>, whose result depends on page CSS) are accepted."""
    if re.search(r'<(defs|mask|use|clippath|lineargradient|image)\b',svg,re.I): return None
    ds=re.findall(r'<path[^>]*\sd="([^"]+)"',svg)
    vb=re.search(r'viewBox="([^"]+)"',svg)
    if not ds or not vb: return None
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb.group(1)}"><path fill="#000000" fill-rule="evenodd" d="{" ".join(ds)}"/></svg>'
# ── official site ──
def _abs(base,u):
    from urllib.parse import urljoin;return urljoin(base,u)
def _domain_ok(url,name):
    from urllib.parse import urlparse
    host=urlparse(url).hostname or '';base=host.split('.')[-2] if host.count('.')>=1 else host
    return any(t and (t in nrm(base).replace('-','') or nrm(base).replace('-','') in t and len(base)>=4) for t in tokens(name))
_GENERIC={'logo','logos','icon','icons','mark','logomark','symbol','svg','png','webp','jpg','dark','light','white','black','color','colour','mono','full','small','large','header','footer','nav','brand','assets','img','image','default','primary','new','v2','2x','3x'}
def _site_candidates(html,base,name):
    from bs4 import BeautifulSoup
    S=BeautifulSoup(html,'lxml');tk=tokens(name);out=[]
    named=lambda s:any(t in nrm(s or '').replace(' ','') or t in nrm(s or '') for t in tk)
    # inline <svg>: regex on the raw markup (HTML parsers lowercase viewBox and friends); rank: attribute is exactly
    # <name>[-logo|-mark] > names the brand + logo/mark > names the brand; ties -> the markup repeated most on the page
    svgs={}
    for m in re.finditer(r'<svg\b[^>]*>.*?</svg>',html,flags=re.S|re.I):
        raw=m.group(0);head=raw[:raw.index('>')+1]
        at=' '.join(re.findall(r'\s(?:class|id|aria-label)="([^"]*)"',head))
        tm=re.search(r'<title>([^<]*)</title>',raw);at+=' '+(tm.group(1) if tm else '')
        if not named(at): continue
        words=set(re.split(r'[\s]+',nrm(at)))
        sc=3 if words&{f'{t}{x}' for t in tk for x in ('','-logo','-mark','_logo','_mark')} else 2 if re.search(r'logo|mark',at,re.I) else 1
        k=svgs.setdefault(raw,[sc,0,at.strip()]);k[1]+=1
    for raw,(sc,n,at) in sorted(svgs.items(),key=lambda kv:(-kv[1][0],-kv[1][1])):
        out.append(('inline-svg',raw,f'<svg> "{at[:60]}" trên trang'))
    for el in S.find_all('img'):
        a=' '.join([el.get('alt') or '',el.get('src') or '',' '.join(el.get('class') or [])])
        # the file name must not name something else (alt="VS Code on Github" src="github-icon.svg" is GitHub's mark)
        stem=[w for w in re.split(r'[-_.\s]+',nrm(os.path.basename((el.get('src') or '').split('?')[0]))) if w and w not in _GENERIC and not w.isdigit()]
        if stem and not any(t in w or w in t for w in stem for t in tk if len(w)>=2): continue
        if re.search(r'\s(on|for|with|tr\u00ean)\s',el.get('alt') or '',re.I): continue
        if named(a) and re.search(r'logo|mark|icon',a,re.I) and el.get('src'): out.append(('img',_abs(base,el['src']),f'<img alt="{el.get("alt","")}">'))
    icons=[]
    for l in S.find_all('link'):
        rel=' '.join(l.get('rel') or []).lower();href=l.get('href')
        if not href: continue
        if 'manifest' in rel: icons.append(('manifest',_abs(base,href),'web manifest'))
        elif 'icon' in rel:
            sz=l.get('sizes') or '';n=int(sz.split('x')[0]) if re.match(r'^\d+x\d+$',sz) else (999 if href.split('?')[0].endswith('.svg') else 0)
            icons.append(('icon',_abs(base,href),f'<link rel="{rel}" sizes="{sz}">',n))
    for m in S.find_all('meta'):
        if (m.get('property') or m.get('name') or '').lower()=='og:logo' and m.get('content'): icons.append(('icon',_abs(base,m['content']),'og:logo',500))
    return out,icons
def from_site(name,home,offline=False):
    if offline or not home: return None,'không có trang chủ' if not home else 'offline'
    why=[]
    def try_html(html,tag):
        cands,icons=_site_candidates(html,home,name)
        for kind,v,desc in cands:
            if kind=='inline-svg':
                svg=v if re.search(r'fill="#',v) else mono_svg(v)
                if not svg: why.append(f'{tag}: {desc} không đọc được');continue
                e=check_svg(svg)
                if e: why.append(f'{tag}: {desc}: {e}');continue
                return {'data':svg.encode(),'ext':'svg','source':'official-site','source_url':home,'color':None if 'fill="#000000"' in svg else '','license':f'trademark of its owner (mark from {home})','match':desc+f' ({tag})'}
            else:
                r=_dl(v,desc,name,True)
                if r[0]: r[0]['match']=desc+f' ({tag})';return r[0]
                why.append(f'{tag}: {r[1]}')
        if not _domain_ok(home,name):
            if icons: why.append(f'{tag}: icon của trang thuộc domain không khớp tên "{name}" (có thể là logo công ty mẹ), bỏ')
            return None
        for ic in sorted(icons,key=lambda x:-(x[3] if len(x)>3 else 600)):
            if ic[0]=='manifest':
                try:
                    man=_get(ic[1]).json();best=sorted(man.get('icons',[]),key=lambda i:-int((i.get('sizes') or '0x0').split('x')[0] or 0))
                    for i in best[:2]:
                        r=_dl(_abs(ic[1],i['src']),'manifest icon',name,False)
                        if r[0]: return r[0]
                        why.append(f'{tag}: manifest icon: {r[1]}')
                except Exception as e: why.append(f'{tag}: manifest lỗi {e.__class__.__name__}')
            else:
                r=_dl(ic[1],ic[2],name,False)
                if r[0]: return r[0]
                why.append(f'{tag}: {ic[2]}: {r[1]}')
        return None
    try: got=try_html(_get(home).text,'HTML tĩnh')
    except Exception as e: got=None;why.append(f'tải trang lỗi {e.__class__.__name__}')
    if not got and CHROME:
        try:
            dom=subprocess.run([CHROME,'--headless=new','--no-sandbox','--disable-gpu','--virtual-time-budget=8000',f'--user-agent={UA["User-Agent"]}','--dump-dom',home],capture_output=True,text=True,timeout=90).stdout
            if dom: got=try_html(dom,'DOM sau JS')
        except Exception as e: why.append(f'Chrome lỗi {e.__class__.__name__}')
    return (got,None) if got else (None,'; '.join(why) or 'không thấy logo trên trang')
def _dl(url,desc,name,named):
    try: r=_get(url)
    except Exception as e: return None,f'{desc}: tải lỗi {e.__class__.__name__}'
    ct=r.headers.get('content-type','');data=r.content
    if 'svg' in ct or url.split('?')[0].endswith('.svg'):
        svg=data.decode('utf-8','ignore');e=check_svg(svg)
        return (None,f'{desc}: {e}') if e else ({'data':data,'ext':'svg','source':'official-site','source_url':url,'color':'','license':'trademark of its owner','match':desc},None)
    if url.split('?')[0].endswith('.ico') or 'icon' in ct and 'png' not in ct: return None,f'{desc}: favicon .ico (nhỏ, bỏ)'
    try: kind,e=check_png(data)
    except Exception as ex: return None,f'{desc}: không đọc được ảnh'
    if e: return None,f'{desc}: {e}'
    return {'data':data,'ext':'png','source':'official-site','source_url':url,'color':'','license':'trademark of its owner','kind':kind,'match':desc},None
def from_github(name,org,offline=False):
    if offline or not org: return None,'không có GitHub org' if not org else 'offline'
    url=f'https://avatars.githubusercontent.com/{org}?s=512'
    try: data=_get(url).content;kind,e=check_png(data)
    except Exception as ex: return None,f'GitHub avatar: {ex.__class__.__name__}'
    if e: return None,f'GitHub avatar: {e}'
    return {'data':data,'ext':'png','source':'github-avatar','source_url':f'https://github.com/{org}','color':'','license':'trademark of its owner','kind':kind,'match':f'GitHub org {org} (registry)'},None
def from_commons(name,offline=False,titles=None):
    if offline: return None,'offline'
    for t in [*(titles or []),f'File:{name} logo.svg',f'File:{name} icon.svg',f'File:{name} Logo.svg']:
        try:
            q=_get('https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&titles='+t.replace(' ','%20')).json()
            pg=next(iter(q['query']['pages'].values()))
            if 'imageinfo' not in pg: continue
            ii=pg['imageinfo'][0];svg=_get(ii['url']).text;e=check_svg(svg)
            if e: return None,f'Wikimedia "{t}": {e}'
            lic=(ii.get('extmetadata',{}).get('LicenseShortName',{}) or {}).get('value','?')
            return {'data':svg.encode(),'ext':'svg','source':'wikimedia-commons','source_url':ii.get('descriptionurl',ii['url']),'color':'','license':f'{lic}; trademark of its owner','match':f'Commons title "{t}"'},None
        except Exception as ex: continue
    return None,'Wikimedia Commons: không có file "<tên> logo.svg"'
# ── colour / mono ──
def svg_colors(svg):
    return {c.upper() for c in re.findall(r'(?:fill|stop-color)\s*[:=]\s*"?\s*(#[0-9a-fA-F]{6})',svg)}
def lum(h):
    h=h.lstrip('#');r,g,b=(int(h[i:i+2],16)/255 for i in (0,2,4));return .2126*r+.7152*g+.0722*b
def ensure(name,entry=None,offline=None,refresh=False,log=None):
    """-> meta dict (status ok|skipped). Cached in assets/brand/<slug>/meta.json"""
    offline=os.environ.get('BRAND_OFFLINE')=='1' if offline is None else offline
    entry=entry or {};slug=entry.get('slug') or slugify(name);d=os.path.join(BRAND,slug);mp=os.path.join(d,'meta.json')
    if os.path.isfile(mp) and not refresh:
        m=json.load(open(mp,encoding='utf-8'))
        if m.get('status')=='ok' and os.path.isfile(os.path.join(d,m['file'])) or m.get('status')=='skipped': return m
    base={'name':name,'slug':slug,'fetched_at':datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}
    if entry.get('logo') is False:
        return {**base,'status':'skipped','reason':entry.get('why','registry: logo off')}   # Dan turned this brand off (registry logo:false): not cached
    if entry.get('wordmark'):   # quality skip: the only mark is the name set in type; next to the name it reads as the word twice
        return {**base,'status':'skipped','reason':entry['wordmark'] if isinstance(entry['wordmark'],str) else 'chỉ có wordmark (chữ tên), không có biểu tượng riêng'}
    if offline: return {**base,'status':'skipped','reason':'offline, chưa có trong cache','transient':True}
    why=[];got=None
    # registry "official": a direct asset URL on the owner's own brand page (used first: Simple Icons can carry an outdated mark)
    if entry.get('official'):
        try:
            r=_get(entry['official']);u=entry['official']
            if u.split('?')[0].endswith('.svg'):
                e=check_svg(r.text);got=None if e else {'data':r.content,'ext':'svg','source':'official-brand-asset','source_url':u,'color':'','license':'trademark of its owner (official brand asset)','match':'registry official URL'}
            else:
                k,e=check_png(r.content);got=None if e else {'data':r.content,'ext':'png','kind':'tile' if k=='tile' else 'raster','source':'official-brand-asset','source_url':u,'color':'','license':'trademark of its owner (official brand asset)','match':'registry official URL'}
            if not got: why.append(f'official asset {u}: {e}')
        except Exception as ex: why.append(f'official asset tải lỗi {ex.__class__.__name__}')
    x=None if got else si_lookup(name,entry.get('si'))
    if x:
        try: got,e=from_si(x)
        except Exception as ex: got,e=None,f'Simple Icons tải lỗi {ex.__class__.__name__}'
        if e: why.append(e)
    else: why.append('Simple Icons: không có')
    for step in (lambda:from_site(name,entry.get('homepage')),lambda:from_github(name,entry.get('github')),lambda:from_commons(name,titles=entry.get('commons'))):
        if got: break
        g,e=step();got=g
        if e: why.append(e)
    if got and re.search(r'CC-BY',got.get('license',''),re.I) and not entry.get('attrib'):
        why.append(f'{got["source"]}: giấy phép {got["license"].split(";")[-1].strip()} cần ghi công tác giả, registry chưa có "attrib"');got=None
    os.makedirs(d,exist_ok=True)
    if not got:
        m={**base,'status':'skipped','reason':' | '.join(why)[:600]};json.dump(m,open(mp,'w',encoding='utf-8'),ensure_ascii=False,indent=1);return m
    fn='logo.'+got['ext'];open(os.path.join(d,fn),'wb').write(got['data'])
    kind=got.get('kind') or 'vector'
    if got['ext']=='svg':
        cols=svg_colors(got['data'].decode('utf-8','ignore'))
        mono=len(cols)<=1 and (not cols or lum(next(iter(cols)))<.12 or lum(next(iter(cols)))>.9)
        color=got['color'] or (next(iter(cols)) if len(cols)==1 else None)
    else: mono=False;color=None
    m={**base,'status':'ok','file':fn,'kind':kind,'mono':bool(mono),'color':color,'source':got['source'],'source_url':got['source_url'],'match':got.get('match'),
       'attrib':entry.get('attrib'),'license':got['license']+'. Used only to identify the product being discussed (nominative use); no endorsement implied.','tried':why}
    json.dump(m,open(mp,'w',encoding='utf-8'),ensure_ascii=False,indent=1);return m
if __name__=='__main__':
    a=[x for x in sys.argv[1:] if not x.startswith('--')];R=registry()
    for name in a:
        key=next((k for k,v in R.items() if nrm(v['name'])==nrm(name) or nrm(name) in map(nrm,v.get('aliases',[]))),None)
        e=dict(R[key],slug=key) if key else {}
        m=ensure(e.get('name',name),e,offline='--offline' in sys.argv,refresh='--refresh' in sys.argv)
        print(json.dumps(m,ensure_ascii=False,indent=1))
