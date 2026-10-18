// Universal overlay elements (every theme). They sit in the scene's own layer, on top of its content, and never overlap it:
//   dock elements (term, num, icon, progress, diagram) take a lower-third slot just above the captions (y <= 1352, x 136..860);
//   if the scene content reaches into that slot, the content is scaled down from its top-left for the overlay's lifetime
//   (min 0.72) so both fit; focus is not a box: it spotlights + gently pushes in (<= 6%) on an element of the scene itself.
// Colours/fonts come from the active theme tokens. Motion: Material emphasized-decelerate, rise + fade, no zoom/pop, no shapes over the frame.
// Events come from props.scenes[i].ov (build_props.py: script "overlays", item "kw" keywords, and the Layer-1 auto-filler).
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';import {interpolate,Easing,delayRender,continueRender} from 'remotion';
import {useS} from './sys';import {Theme} from './themes';import {SZ} from './safezone';import {fitSize} from './brand';import {BrandMark,useBrands} from './brandmark';
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const EMD=Easing.bezier(.05,.7,.1,1),EIN=Easing.bezier(.3,0,.8,.15);
export type Ov={kind:'term'|'num'|'icon'|'progress'|'diagram'|'focus'|'brand';brands?:string[];at:number;end:number;
 w?:string;g?:string;n?:number|string;label?:string;icon?:string;m?:number;nodes?:string[];match?:string;why?:string};
const DOCK_B=SZ.content.y+SZ.content.h*SZ.content.scale-6;  // ~1353: lower edge of the dock (captions start at 1366)
const X0=SZ.content.x,X1=SZ.right,GAP=26;
const lum=(hex:string)=>{const m=hex.replace('#','');if(m.length<6)return 0;const [r,g,b]=[0,2,4].map(i=>parseInt(m.slice(i,i+2),16)/255);return .2126*r+.7152*g+.0722*b};
// theme tokens -> overlay palette (pal.* when the theme has one, else derived from bg/ink)
export const tok=(t:Theme)=>{const pal={...((t as any).pack||{}),...((t as any).pal||{})};const light=lum(t.bg)>.5;const sharp=t.id==='hot-news'||t.id==='hot-news-glitch';
 return {A:t.accent,on:t.onAccent,ink:t.ink,bg:t.bg,light,card:pal.card??(light?'#FFFFFF':'#16171A'),line:pal.line??(light?'rgba(17,17,17,.22)':'rgba(255,255,255,.16)'),
  dim:pal.dim??t.muted,head:t.head,body:t.body,mono:t.id==='flutter-tutor'?'GSC':'JBM',r:sharp?0:t.id==='quick-tips'?24:26,upper:t.upper,
  hw:t.head==='Anton'?400:800,shadow:light?'0 10px 30px rgba(0,0,0,.12)':'0 14px 40px rgba(0,0,0,.45)'}};
/* inline glyph set (own drawings, 24x24 stroke icons; no third-party logos here: product logos come through brandmark.tsx) */
export const GLYPH:Record<string,string>={
 check:'M4.5 12.5 10 18 19.5 6.5',warn:'M12 3 2.5 20h19L12 3zM12 10v4.5M12 17.5v.01',download:'M12 4v11M7 10.5l5 5 5-5M5 20h14',
 play:'M8 5v14l11-7z',terminal:'M4 5h16v14H4zM7.5 10l3 2.5-3 2.5M12.5 15.5h4',phone:'M8 2.5h8a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V4A1.5 1.5 0 0 1 8 2.5zM11 18.5h2',
 laptop:'M5 5h14v10H5zM2.5 19h19',settings:'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1',
 code:'M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15',bolt:'M13 2.5 5 13.5h6l-1 8 8-11h-6z',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V12l3 2',
 book:'M4 4.5h6a2 2 0 0 1 2 2V20a2 2 0 0 0-2-2H4zM20 4.5h-6a2 2 0 0 0-2 2V20a2 2 0 0 1 2-2h6z',bug:'M8.5 9h7v6a3.5 3.5 0 0 1-7 0zM12 9V21M8.5 12H4.5M15.5 12h4M8.5 16.5l-3 2M15.5 16.5l3 2M9.5 9a2.5 2.5 0 0 1 5 0M9 5.5 7.5 4M15 5.5 16.5 4',
 layers:'M12 3 2.5 8 12 13l9.5-5zM2.5 12.5 12 17.5l9.5-5M2.5 16.5 12 21.5l9.5-5',link:'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
 lock:'M6 11h12v9.5H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',cloud:'M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.6A3.8 3.8 0 0 1 17.5 18.5z',
 refresh:'M19.5 8A8 8 0 0 0 5 7M4.5 4v3.5H8M4.5 16a8 8 0 0 0 14.5 1M19.5 20v-3.5H16',search:'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5l5 5',
};
export const Glyph:React.FC<{n:string;s:number;c:string;w?:number}>=({n,s,c,w=2.2})=><svg width={s} height={s} viewBox="0 0 24 24" style={{flex:'none'}}>
 <path d={GLYPH[n]??GLYPH.bolt} fill={n==='play'?c:'none'} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"/></svg>;
// enter/exit progress of an overlay event (scene-relative frames)
const life=(f:number,o:Ov)=>{const i=interpolate(f,[o.at+2,o.at+13],[0,1],{...cl,easing:EMD});const x=interpolate(f,[o.end-9,o.end],[0,1],{...cl,easing:EIN});return {i,x,p:i*(1-x)}};
const Card:React.FC<{t:ReturnType<typeof tok>;o:Ov;f:number;name:string;children:React.ReactNode;pad?:string}>=({t,o,f,name,children,pad='22px 30px'})=>{const {i,x}=life(f,o);
 return <div data-bb={'ov-'+name} data-ov-dock="1" style={{position:'absolute',left:X0,width:X1-X0,boxSizing:'border-box',top:-9999,background:t.card,border:`2px solid ${t.line}`,borderLeft:`10px solid ${t.A}`,
  borderRadius:t.r,padding:pad,boxShadow:t.shadow,opacity:i*(1-x),transform:`translateY(${(1-i)*34-x*14}px)`}}>{children}</div>};
const nf=(v:number)=>Math.round(v).toLocaleString('vi-VN');
/* 1. keyword chip / term card: the term big in the accent, optional short gloss (only from the script glossary; never invented) */
const Term:React.FC<{o:Ov;t:ReturnType<typeof tok>;f:number}>=({o,t,f})=><Card t={t} o={o} f={f} name="term">
 <div style={{display:'flex',alignItems:'center',gap:20}}>{o.icon&&<Glyph n={o.icon} s={58} c={t.A}/>}
  <span style={{fontFamily:t.head,fontWeight:t.hw,fontSize:fitSize(o.w!,560,60,t.head==='Anton'?.48:.56),lineHeight:1.1,color:t.ink,textTransform:t.upper?'uppercase':'none',whiteSpace:'nowrap'}}>{o.w}</span></div>
 {o.g&&<div style={{fontFamily:t.body,fontWeight:500,fontSize:fitSize(o.g,1200,36,.5),lineHeight:1.25,color:t.dim,marginTop:8}}>{o.g}</div>}</Card>;
/* 2. big number counting up (~0.6 s) + label */
const Num:React.FC<{o:Ov;t:ReturnType<typeof tok>;f:number}>=({o,t,f})=>{const raw=String(o.n??'');const m=raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
 const target=m?parseFloat(m[2].replace(/[.,](?=\d{3}\b)/g,'').replace(',','.')):NaN;const q=interpolate(f,[o.at+4,o.at+22],[0,1],{...cl,easing:EMD});
 const shown=m&&!isNaN(target)?m[1]+(Number.isInteger(target)?nf(target*q):(target*q).toFixed(1))+m[3]:raw;
 return <Card t={t} o={o} f={f} name="num" pad="16px 30px 20px"><div style={{display:'flex',alignItems:'baseline',gap:24}}>
  <span style={{fontFamily:t.mono,fontWeight:800,fontSize:fitSize(raw,300,118,.62),lineHeight:1,color:t.A,fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>{shown}</span>
  {o.label&&<span style={{fontFamily:t.body,fontWeight:600,fontSize:fitSize(o.label,760,40,.5),lineHeight:1.2,color:t.ink}}>{o.label}</span>}</div></Card>};
/* 3. icon + short label */
const Icon:React.FC<{o:Ov;t:ReturnType<typeof tok>;f:number}>=({o,t,f})=><Card t={t} o={o} f={f} name="icon">
 <div style={{display:'flex',alignItems:'center',gap:24}}><span style={{width:84,height:84,borderRadius:t.r?42:0,background:t.A,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}}><Glyph n={o.icon??'bolt'} s={50} c={t.on} w={2.4}/></span>
  <span style={{fontFamily:t.head,fontWeight:t.hw,fontSize:fitSize(o.label??'',1000,52,.55),lineHeight:1.15,color:t.ink,textTransform:t.upper?'uppercase':'none'}}>{o.label}</span></div></Card>;
/* 5. lesson progress: m segments, n filled (the current one fills while you watch) + section label */
const Progress:React.FC<{o:Ov;t:ReturnType<typeof tok>;f:number}>=({o,t,f})=>{const n=Number(o.n)||1,m=o.m||1;const q=interpolate(f,[o.at+6,o.at+24],[0,1],{...cl,easing:EMD});
 return <Card t={t} o={o} f={f} name="progress" pad="20px 30px 24px"><div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:14,gap:20}}>
  <span style={{fontFamily:t.head,fontWeight:t.hw,fontSize:fitSize(o.label??'',520,42,.55),color:t.ink,textTransform:t.upper?'uppercase':'none',whiteSpace:'nowrap',overflow:'hidden'}}>{o.label}</span>
  <span style={{fontFamily:t.mono,fontWeight:700,fontSize:34,color:t.A,whiteSpace:'nowrap'}}>{n}/{m}</span></div>
  <div style={{display:'flex',gap:8}}>{Array.from({length:m},(_,k)=><div key={k} style={{flex:1,height:14,borderRadius:t.r?7:0,background:t.line,overflow:'hidden'}}>
   <div style={{height:'100%',background:t.A,width:`${k<n-1?100:k===n-1?100*q:0}%`}}/></div>)}</div></Card>};
/* 6. mini diagram: 2-3 boxes, arrows draw left to right */
const Diagram:React.FC<{o:Ov;t:ReturnType<typeof tok>;f:number}>=({o,t,f})=>{const N=(o.nodes??[]).slice(0,3);const bw=N.length===3?182:270;
 return <Card t={t} o={o} f={f} name="diagram" pad="22px 22px">{o.label&&<div style={{fontFamily:t.body,fontWeight:600,fontSize:32,color:t.dim,marginBottom:14}}>{o.label}</div>}
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>{N.map((s,k)=>{const a=o.at+6+k*10;const q=interpolate(f,[a,a+10],[0,1],{...cl,easing:EMD});const aq=interpolate(f,[a+5,a+14],[0,1],cl);
   return <React.Fragment key={k}>{k>0&&<svg width={70} height={40} style={{flex:'none',opacity:aq}}><path d={`M4 20 H${4+52*aq}`} stroke={t.A} strokeWidth={5} strokeLinecap="round"/>{aq>.9&&<path d="M48 9 60 20 48 31" fill="none" stroke={t.A} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"/>}</svg>}
    <div style={{width:bw,boxSizing:'border-box',padding:'20px 12px',textAlign:'center',border:`3px solid ${k===N.length-1?t.A:t.line}`,borderRadius:t.r?18:0,background:k===N.length-1?(t.light?'rgba(0,0,0,.03)':'rgba(255,255,255,.04)'):'transparent',
     fontFamily:t.head,fontWeight:t.hw,fontSize:fitSize(s,bw-24,40,.56),color:t.ink,textTransform:t.upper?'uppercase':'none',opacity:q,transform:`translateY(${(1-q)*16}px)`,whiteSpace:'nowrap'}}>{s}</div></React.Fragment>})}</div></Card>};
/* 7. brand chip: logo + name of the product being spoken (props.brands, fetched automatically); 1-3 brands in a row */
const BrandChip:React.FC<{o:Ov;t:ReturnType<typeof tok>;f:number}>=({o,t,f})=>{const list=useBrands();const bs=(o.brands??[]).map(s=>list.find(b=>b.slug===s)).filter(Boolean).slice(0,3) as any[];
 if(!bs.length)return null;const n=bs.length;const sz=n===1?84:n===2?72:60;const w=(X1-X0-60-(n-1)*36)/n-sz-18;
 return <Card t={t} o={o} f={f} name="brand" pad="20px 30px"><div style={{display:'flex',alignItems:'center',gap:36}}>{bs.map(b=><div key={b.slug} style={{display:'flex',alignItems:'center',gap:18,minWidth:0}}>
  <BrandMark b={b} size={sz} on={t.card}/><span style={{fontFamily:t.head,fontWeight:t.hw,fontSize:fitSize(b.name,w,n===1?60:46,t.head==='Anton'?.48:.56),lineHeight:1.1,color:t.ink,textTransform:t.upper?'uppercase':'none',whiteSpace:'nowrap'}}>{b.name}</span></div>)}</div></Card>};
const ELS:Record<string,React.FC<{o:Ov;t:ReturnType<typeof tok>;f:number}>>={term:Term,num:Num,icon:Icon,progress:Progress,diagram:Diagram,brand:BrandChip};
const norm=(s:string)=>s.toLowerCase().replace(/\\@/g,'@').replace(/\s+/g,' ').trim();
// themes on a photographic plate (look.softSpot, loot-crypto): no dim panel at all (a translucent panel over the plate reads as a
// blurry slab, Dan 18/10/2026); the other data-bb boxes are dimmed instead. look.focusPush caps the push-in (1 = none). SOFT is kept
// as a fallback mask for the panel.
const SOFT:React.CSSProperties={WebkitMaskImage:'linear-gradient(to right, transparent 0, #000 90px, #000 calc(100% - 90px), transparent 100%), linear-gradient(to bottom, transparent 0, #000 70px, #000 calc(100% - 90px), transparent 100%)',WebkitMaskComposite:'source-in',maskComposite:'intersect'} as any;
/* 4. focus: find the scene element whose text contains `match`, spotlight it (rest dims), ring it, push in <= 6% within the content box */
const findEl=(root:HTMLElement,needle:string):HTMLElement|null=>{const nd=norm(needle);if(!nd)return null;let best:HTMLElement|null=null,ba=1e12;
 root.querySelectorAll<HTMLElement>('*').forEach(el=>{if(el.closest('[data-ov]'))return;if(getComputedStyle(el).visibility==='hidden')return; // rows laid out but not arrived yet (fill.tsx)
 const tx=norm(el.textContent||'');if(!tx.includes(nd))return;const r=el.getBoundingClientRect();const a=r.width*r.height;if(a>0&&a<ba){ba=a;best=el}});
 if(!best)return null;let el:HTMLElement=best;  // climb to the row/line that holds the match: stop at a data-bb box, or when the parent is a list (many children) or much taller
 for(let k=0;k<4&&!el.hasAttribute('data-bb');k++){const p=el.parentElement;if(!p||p===root)break;if(p.hasAttribute('data-bb')){if(p.getBoundingClientRect().height<=el.getBoundingClientRect().height*2.6+60)el=p;break}
  const a=el.getBoundingClientRect(),b=p.getBoundingClientRect();if(p.children.length<=3&&b.height<=a.height*1.6+30)el=p;else break}
 return el};
export const Overlays:React.FC<{ov:Ov[];section:string}>=({ov})=>{const {t,f}=useS();
 // layout is measured, so wait for the web fonts (a late font swap changes card heights and text boxes)
 const [fh]=useState(()=>delayRender('overlay fonts'));const [fok,setFok]=useState(false);
 useEffect(()=>{let on=true;document.fonts.ready.then(()=>{if(on)setFok(true)});return ()=>{on=false}},[]);
 useEffect(()=>{if(fok)continueRender(fh)},[fok]);const T=tok(t);const me=useRef<HTMLDivElement>(null);const ring=useRef<HTMLDivElement>(null);const spot=useRef<HTMLDivElement>(null);
 const live=ov.filter(o=>f>=o.at-10&&f<o.end+10);const dock=live.find(o=>o.kind!=='focus');const foc=live.find(o=>o.kind==='focus');
 useLayoutEffect(()=>{const soft=!!(t as any).softSpot;const layer=me.current?.closest('[data-layer]') as HTMLElement|null;const wrap=layer?.querySelector('[data-content]') as HTMLElement|null;if(!layer||!wrap)return;
  const pre=wrap.dataset.pre||''; // Timeline transition rotation (loot-crypto quarter), kept outermost
  const base=`${pre} scale(${SZ.content.scale})`;wrap.style.transform=base;  // reset before measuring (imperative transforms persist between frames)
  const L=layer.getBoundingClientRect();const k=L.width/layer.offsetWidth||1;const R=(el:Element)=>{const r=el.getBoundingClientRect();return {x:(r.left-L.left)/k,y:(r.top-L.top)/k,r:(r.right-L.left)/k,b:(r.bottom-L.top)/k}};
  let boxes=[...wrap.querySelectorAll('[data-bb]')].map(R).filter(b=>b.r-b.x>2&&b.b-b.y>2);
  if(!boxes.length){ // theme without data-bb boxes: measure what is drawn (text, media, filled/bordered boxes), not the wrapper itself
   const W=R(wrap),wa=(W.r-W.x)*(W.b-W.y);
   boxes=[...wrap.querySelectorAll<HTMLElement>('*')].filter(el=>{if(el.closest('[data-deco]'))return false;const t=el.tagName.toLowerCase();
    if(['svg','img','video','canvas'].includes(t))return true;if(el.closest('svg'))return false;
    if([...el.childNodes].some(n=>n.nodeType===3&&(n.textContent||'').trim()))return true;const cs=getComputedStyle(el);
    return (cs.backgroundColor&&!/rgba\(.*,\s*0\)|transparent/.test(cs.backgroundColor))||cs.backgroundImage!=='none'||parseFloat(cs.borderTopWidth)+parseFloat(cs.borderLeftWidth)>0})
    .map(R).filter(b=>b.r-b.x>2&&b.b-b.y>2&&(b.r-b.x)*(b.b-b.y)<wa*.9&&b.b>SZ.content.y-20&&b.y<1500)}
  const cb=boxes.length?{x:Math.min(...boxes.map(b=>b.x)),y:Math.min(...boxes.map(b=>b.y)),r:Math.max(...boxes.map(b=>b.r)),b:Math.max(...boxes.map(b=>b.b))}:{x:X0,y:SZ.content.y,r:X0,b:SZ.content.y};
  const O={x:SZ.content.x,y:SZ.content.y};let sq=1;
  const card=me.current!.querySelector('[data-ov-dock]') as HTMLElement|null;
  if(card&&dock){const h=card.offsetHeight;const top=DOCK_B-h;card.style.top='auto';card.style.bottom=`${1920-DOCK_B}px`; // bottom-anchored: a late font swap can only grow it upwards
   if(cb.b+GAP>top){const need=Math.max(.72,(top-GAP-O.y)/Math.max(1,cb.b-O.y));const p=interpolate(f,[dock.at-8,dock.at+2],[0,1],cl)*(1-interpolate(f,[dock.end,dock.end+8],[0,1],cl));sq=1-(1-need)*p}}
  let z=1,P={x:O.x,y:O.y},target:{x:number;y:number;r:number;b:number}|null=null,fp=0;
  if(foc){const el=findEl(wrap,foc.match??'');if(el){const r=R(el);const s=(v:number,o:number)=>o+(v-o)*sq;target={x:s(r.x,O.x),y:s(r.y,O.y),r:s(r.r,O.x),b:s(r.b,O.y)};
   fp=interpolate(f,[foc.at,foc.at+14],[0,1],{...cl,easing:EMD})*(1-interpolate(f,[foc.end-10,foc.end],[0,1],{...cl,easing:EIN}));
   P={x:(target.x+target.r)/2,y:(target.y+target.b)/2};const c={x:O.x+(cb.x-O.x)*sq,y:O.y+(cb.y-O.y)*sq,r:O.x+(cb.r-O.x)*sq,b:O.y+(cb.b-O.y)*sq};
   const lim=(lo:number,hi:number,pv:number,v1:number,v2:number)=>Math.min(v1<pv?(pv-lo)/Math.max(1,pv-v1):9,v2>pv?(hi-pv)/Math.max(1,v2-pv):9);
   const dockTop=card&&dock?DOCK_B-card.offsetHeight-GAP:DOCK_B;
   const zmax=Math.max(1,Math.min((t as any).focusPush??1.06,lim(72,X1,P.x,c.x,c.r),lim(SZ.content.y,dockTop,P.y,c.y,c.b)));z=1+(zmax-1)*fp}}
  const S=SZ.content.scale*sq*z;const dx=(1-z)*(P.x-O.x),dy=(1-z)*(P.y-O.y);wrap.style.transformOrigin='top left';wrap.style.transform=`${pre} translate(${dx}px,${dy}px) scale(${S})`;
  // softSpot themes (photographic plate behind the content): never lay a dim panel over the plate (it reads as a blurry slab);
  // dim the other content boxes themselves instead. Reset first: imperative styles persist between frames.
  wrap.querySelectorAll<HTMLElement>('[data-dim]').forEach(el=>{el.style.filter=el.dataset.dim==='-'?'':el.dataset.dim!;delete el.dataset.dim});
  const tEl=foc&&target?findEl(wrap,foc.match??''):null;
  if(soft&&tEl&&fp>0){const keep=(el:HTMLElement)=>el.contains(tEl)||tEl.contains(el);
   wrap.querySelectorAll<HTMLElement>('[data-bb]').forEach(el=>{if(keep(el)||el.parentElement?.closest('[data-dim]'))return;el.dataset.dim=el.style.filter||'-';el.style.filter=`brightness(${1-.55*fp}) saturate(${1-.4*fp})`})}
  if(ring.current&&spot.current){if(target&&fp>0){const m=(v:number,o:number)=>P[o===0?'x':'y']+(v-P[o===0?'x':'y'])*z;const x=m(target.x,0)-14,y=m(target.y,1)-12,w=m(target.r,0)-m(target.x,0)+28,h=m(target.b,1)-m(target.y,1)+24;
    Object.assign(ring.current.style,{display:'block',left:`${x}px`,top:`${y}px`,width:`${w}px`,height:`${h}px`,opacity:String(fp)});
    if(!soft)Object.assign(spot.current.style,{display:'block',opacity:String(fp),clipPath:`polygon(evenodd,0 0,1080px 0,1080px 1920px,0 1920px,0 0,${x}px ${y}px,${x+w}px ${y}px,${x+w}px ${y+h}px,${x}px ${y+h}px,${x}px ${y}px)`});}
   else{ring.current.style.display='none';spot.current.style.display='none'}}
 },[f,fok]);
 // spotlight dims the content box only (header, captions, Follow stay untouched); ring has no data-bb (it frames an existing box)
 const C=SZ.content;
 return <div ref={me} data-ov="1" style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:5}}>
  <div style={{position:'absolute',left:C.x-36,top:C.y-8,width:1080-(C.x-36),height:DOCK_B-C.y+14,overflow:'hidden',...((t as any).softSpot?SOFT:{})}}><div ref={spot} style={{position:'absolute',left:-(C.x-36),top:-(C.y-8),width:1080,height:1920,background:/^#[0-9a-fA-F]{6}$/.test(T.bg)?T.bg+'80':'rgba(0,0,0,.5)',display:'none'}}/></div>
  <div ref={ring} style={{position:'absolute',display:'none',border:`${(t as any).softSpot?2:4}px solid ${T.A}`,borderRadius:(t as any).lc?'30px 8px 30px 30px':T.r?22:0,boxShadow:`0 0 0 8px ${T.light?'rgba(0,0,0,.05)':'rgba(255,255,255,.04)'}`}}/>
  {dock&&React.createElement(ELS[dock.kind],{o:dock,t:T,f})}</div>};
