// loot-crypto (LOOT CRYPTO, client fanpage): crypto news / analysis / basics / security guides / price + on-chain charts.
// Look = "studio + quarter geometry":
//  A. studio: pre-rendered 3D product-shot plates (assets/textures/loot, made with tools/loot-3d: graphite + mint glossy blocks
//     on a dark floor, one soft light pool, cool rim, shallow depth of field, vignette, grain). Remotion only drifts them (slow
//     translate-only drift inside look.plateScale + breathing pool, never upscaled), all data-deco, so the static gate never sees them.
//  B. geometry from the logomark (off-white 3/4 disc + mint square in the missing quarter):
//     - cards = 3 round corners + 1 sharp top-right corner (QR) with an optional mint square in it,
//     - mint squares are the bullets / accents, a short red bar sits above titles (theme.json look.lc.redBar),
//     - scene transition `quarter` (sys.tsx): the new scene sweeps in as a 90° sector rotating around the bottom-left corner,
//       a hairline mint edge + small mint square ride the sweep; no zoom, no pop, soft dark-air whoosh (quarter_soft.wav).
// Colour roles: mint #3BE08F = primary accent / up; red #E6322D = down moves, warnings, title bar (look.lc.red: "signal" keeps
// red to those; "equal" also uses red as the second accent, e.g. the B side of a face-off). Off-white #F5F5F2 ink, grey #AAAAAC.
// Type: Sora SemiBold (Latin only: it has no Vietnamese ạ/ọ/ệ…) for brand, numbers, tickers; Be Vietnam Pro SemiBold (0.06em)
// for Vietnamese labels (lab() picks per string), Be Vietnam Pro ExtraBold titles, Medium sublines.
// Money content rules (enforced by the props, shown on screen): price / chart / coin / flow scenes carry a "MINH HỌA" tag unless
// a source is given, and the header shows the channel disclaimer ("Không phải lời khuyên đầu tư") on those scenes.
import React from 'react';import {AbsoluteFill,Audio,Img,Sequence,staticFile,interpolate,useCurrentFrame,Easing} from 'remotion';
import {useS,FONTS,HeadLine} from './sys';import {useBrand,fitSize,BrandTile,Handle} from './brand';import {SZ} from './safezone';
import {BrandMark,useBrands,BrandText} from './brandmark';import {Fill,z,zg,hid,useRoom} from './fill';
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const LC={bg:'#08080A',ink:'#F5F5F2',mint:'#3BE08F',red:'#E6322D',grey:'#AAAAAC',dim:'#76767B',line:'rgba(245,245,242,.10)',line2:'rgba(245,245,242,.20)',
 onMint:'#04140B',mintT:(a:number)=>`rgba(59,224,143,${a})`,redT:(a:number)=>`rgba(230,50,45,${a})`,inkT:(a:number)=>`rgba(245,245,242,${a})`};
export const QR='34px 6px 34px 34px';                       // logomark corner set: the sharp corner is where the mint square sits
const QRs=(r:number)=>`${r}px ${Math.max(3,r*.18)}px ${r}px ${r}px`;
const bb=(n:string)=>({'data-bb':n} as any);
// calm premium motion: expo-out entries (~470 ms), no overshoot
export const LEO=Easing.bezier(.22,1,.36,1);
const ease=(f:number,at:number,d=14)=>interpolate(f,[at,at+d],[0,1],{...cl,easing:LEO});
const osc=(g:number,sec:number,ph=0)=>Math.sin(2*Math.PI*(g/30/sec)+ph);
// label font: Sora for pure Latin/ASCII strings, Be Vietnam Pro SemiBold when the string needs Vietnamese glyphs
export const lab=(s:string)=>/[^\x00-\x7F]/.test(s)?'BVPS':'SORA';
const L=(s:string,size:number,c=LC.grey,up=true):React.CSSProperties=>({fontFamily:lab(s),fontWeight:600,fontSize:size,letterSpacing:'.06em',color:c,textTransform:up?'uppercase':'none',lineHeight:1.15,whiteSpace:'nowrap'});
const HX=(size:number|string,c=LC.ink):React.CSSProperties=>({fontFamily:'BVPX',fontSize:size,color:c,lineHeight:1.1,letterSpacing:-1});
const BM=(size:number|string,c=LC.grey):React.CSSProperties=>({fontFamily:'BVPM',fontSize:size,color:c,lineHeight:1.25});
const NUM=(size:number|string,c=LC.ink):React.CSSProperties=>({fontFamily:'SORA',fontWeight:600,fontSize:size,color:c,lineHeight:1,letterSpacing:'-.01em',fontVariantNumeric:'tabular-nums'});
export const glass=(x:React.CSSProperties={}):React.CSSProperties=>({background:'linear-gradient(162deg, rgba(40,40,46,.86) 0%, rgba(20,20,24,.90) 48%, rgba(13,13,16,.93) 100%)',border:`1.5px solid ${LC.line}`,
 borderRadius:QR,boxShadow:'0 30px 70px rgba(0,0,0,.55), inset 0 1.5px 0 rgba(255,255,255,.07)',boxSizing:'border-box',position:'relative',...x});
const useLc=()=>{const {t}=useS() as any;const lc=(t&&t.lc)||{};return {bar:lc.redBar===false?LC.mint:LC.red,eq:lc.red==='equal'}};
/* small parts */
export const Sq:React.FC<{s?:number|string;c?:string;style?:React.CSSProperties}>=({s=16,c=LC.mint,style})=><span style={{width:s,height:s,background:c,display:'inline-block',flex:'none',...style}}/>;
const Corner:React.FC<{c?:string;s?:number}>=({c=LC.mint,s=16})=><span style={{position:'absolute',top:14,right:14,width:s,height:s,background:c}}/>;
export const Bar:React.FC<{at?:number}>=({at=0})=>{const {f}=useS();const {bar}=useLc();const p=ease(f,at,12);return <div style={{width:64*p,height:8,background:bar,marginBottom:22}}/>};
const In:React.FC<{at:number;dy?:number;children:React.ReactNode;style?:React.CSSProperties;n?:string}>=({at,dy=26,children,style,n})=>{const {f}=useS();const p=ease(f,at);
 return <div {...(n?bb(n):{})} style={{opacity:p,transform:`translateY(${(1-p)*dy}px)`,...style}}>{children}</div>};
export const Tag:React.FC<{s?:string;tone?:'grey'|'red'}>=({s='MINH HỌA',tone='grey'})=><span {...bb('tag')} style={{...L(s,22,tone==='red'?LC.red:LC.grey),border:`1.5px solid ${tone==='red'?LC.redT(.55):LC.line2}`,borderRadius:QRs(12),padding:'7px 14px 6px',display:'inline-block'}}>{s}</span>;
/* title block: red bar + optional kicker label + BVPX title (wraps, max ~2 lines) */
export const LTitle:React.FC<{s:string;kick?:string;at?:number;size?:number}>=({s,kick,at=0,size=66})=>{const {f}=useS();const p=ease(f,at+2);
 return <div {...bb('title')} style={{marginBottom:34}}><Bar at={at}/>{kick&&<div style={{...L(kick,26),marginBottom:14,opacity:ease(f,at,10)}}>{kick}</div>}
  <div style={{...HX(size),opacity:p,transform:`translateY(${(1-p)*22}px)`}}>{s}</div></div>};
/* disclaimer: header (auto on money scenes), charts, end card */
export const LcDisclaimer:React.FC<{s?:string;size?:number}>=({s,size=20})=>{const B=useBrand();const txt=s??B.disclaimer??'Không phải lời khuyên đầu tư';
 return <span {...bb('disc')} style={{display:'inline-flex',alignItems:'center',gap:size*.5,...L(txt,size,LC.grey,false),letterSpacing:'.02em'}}><Sq s={size*.45} c={LC.red}/>{txt}</span>};
const fmt=(v:number,dec=0)=>v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});
const coinOf=(name:string|undefined,list:any[])=>{if(!name)return undefined;const n=name.toLowerCase();return list.find((b:any)=>b.name.toLowerCase()===n||(b.aliases||[]).some((a:string)=>a.toLowerCase()===n))};
/* own glyphs (not brand logos): wallet / exchange / cold device / whale / shield / key / phone / paper / hot / cold */
const G:Record<string,string>={
 wallet:'M3 7.5A2.5 2.5 0 0 1 5.5 5H18v2.5M3 7.5V17a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3M3 7.5h17v4M20 11.5h-4a1.75 1.75 0 0 0 0 3.5h4z',
 exchange:'M3 9.5 12 4l9 5.5M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18',
 cold:'M7 3h10v18H7zM10 17h4M12 6.5v6M9.4 8l5.2 3M14.6 8l-5.2 3',
 whale:'M3 13c0 4 3.6 6 8 6h5.5c2.6 0 4.5-2 4.5-4.6V12l2-3-3 1.2C18.6 8.4 16.6 7.5 14 8l-2.5.5C8 9.2 5.3 11 3 13zM17 12.2h.01M8 3.5c.5 1 .5 2.2 0 3.2M11 3c.6 1.3.6 2.6 0 4',
 shield:'M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6zM9 12l2.2 2.2L15.5 10',
 key:'M14.5 4a5.5 5.5 0 1 0 1.3 10.8L18 17h2v2h2v-2.5l-6.2-6.3A5.5 5.5 0 0 0 14.5 4zM9 9.5h.01',
 phone:'M7.5 2.5h9a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V4a1.5 1.5 0 0 1 1.5-1.5zM10.5 5h3M11 18.5h2',
 paper:'M6 3h9l4 4v14H6zM15 3v4h4M9 11h7M9 14.5h7M9 18h4',
 hot:'M12 21c-4 0-6.5-2.8-6.5-6.2 0-3.6 3-5.6 3.6-9.3 2 1.2 3.4 3.3 3.6 5.5 1-.7 1.6-1.9 1.7-3 2.4 1.9 4.1 4.6 4.1 7.2 0 3.4-2.5 5.8-6.5 5.8z',
 lock:'M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 15v2.5',
 wifi:'M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01',
 nowifi:'M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M3 3l18 18',
 eye:'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 3l18 18',
 camera:'M3 8h4l2-3h6l2 3h4v12H3zM12 10.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM3 3l18 18',
 home:'M4 11 12 4l8 7v9H4zM10 20v-5h4v5',
};
export const Glyph:React.FC<{k:string;s:number|string;c?:string;w?:number}>=({k,s,c=LC.ink,w=1.7})=><svg viewBox="0 0 24 24" width={s} height={s} style={{flex:'none',display:'block'}}><path d={G[k]??G.wallet} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"/></svg>;
const Tile:React.FC<{k?:string;coin?:string;s:number|string;tone?:string}>=({k,coin,s,tone=LC.ink})=>{const list=useBrands();const b=coinOf(coin,list);
 if(b)return <BrandMark b={b} size={s} on="#1A1A1E"/>;
 return <span style={{width:s,height:s,flex:'none',borderRadius:typeof s==='number'?QRs(s*.3):'30% 6% 30% 30%',background:'linear-gradient(160deg,#2A2A30,#141418)',border:`1.5px solid ${LC.line2}`,display:'flex',alignItems:'center',justifyContent:'center',boxSizing:'border-box'}}>
  <Glyph k={k??'wallet'} s={typeof s==='number'?s*.56:'56%'} c={tone}/></span>};
/* ---------- studio background (plates are pre-rendered; motion is slow drift only, data-deco) ----------
   The plate is drawn at frame size and never upscaled: plates are rendered at 1296x2304 (1.2x) and the total scale is capped at
   look.plateScale (1.03), translate-only drift inside that 3% margin. scripts/check_plates.py fails the render if a plate is smaller
   than 1080x1920 x plateScale. No extra blurred foreground sprite on top (a giant cropped bokeh blob read as a glitch, 18/10/2026). */
export const LcStudio:React.FC<{plate?:string;push?:number;ms?:number}>=({plate,push=0,ms})=>{const g=useCurrentFrame();const t=(useS() as any)?.t;
 const src=plate??t?.lc?.studio??'textures/loot/plate_main.jpg';const MS=Math.min(1.03,ms??t?.plateScale??1.03);
 const mx=540*(MS-1)-1,my=960*(MS-1)-1;  // translate room left by the scale (px each side)
 const x=mx*.7*osc(g,57),y=my*.6*osc(g,49,1)-my*.3*push;const pool=.55+.45*(.5+.5*osc(g,23,2));
 return <AbsoluteFill data-deco="studio" style={{overflow:'hidden',background:LC.bg}}>
  <Img src={staticFile(src)} style={{position:'absolute',left:0,top:0,width:1080,height:1920,transform:`translate(${x}px,${y}px) scale(${MS})`,transformOrigin:'50% 50%'}}/>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 560px 420px at 52% 30%, rgba(245,245,242,.06), rgba(245,245,242,0) 70%)',opacity:pool}}/>
  <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, rgba(8,8,10,.30) 0%, rgba(8,8,10,0) 18%, rgba(8,8,10,0) 70%, rgba(8,8,10,.55) 100%)'}}/>
 </AbsoluteFill>};
/* ---------- header: symbol + wordmark (Sora) left; disclaimer (money scenes) + page right ---------- */
export const LcChrome:React.FC<{section:string;page:string;disc?:boolean}>=({page,disc})=>{const B=useBrand();return <>
 <LcStudio/>
 <HeadLine rule={`1.5px solid ${LC.line}`} left={<span style={{display:'flex',alignItems:'center',gap:12,alignSelf:'center'}}>{B.logo&&<Img src={staticFile(B.logo)} style={{width:28,height:28,display:'block'}}/>}
   <span style={{fontFamily:lab(B.wordmark),fontWeight:600,fontSize:fitSize(B.wordmark,300,25,.78),letterSpacing:'.06em',color:LC.ink,whiteSpace:'nowrap',lineHeight:1}}>{B.wordmark}</span></span>}
  right={<span style={{display:'flex',alignItems:'center',gap:22,alignSelf:'center'}}>{disc&&<LcDisclaimer size={19}/>}<span style={{fontFamily:'SORA',fontWeight:600,fontSize:19,letterSpacing:'.06em',color:LC.grey,lineHeight:1}}>{page}</span></span>}
  style={{alignItems:'center'}}/></>};
/* ================= 1. hook: big claim at frame 0, coin chips (auto brand logos), subline ================= */
export const LcHook:React.FC<{kick?:string;big:string;hl?:string;line?:string;lineAt?:number;coins?:string[];coinsAt?:number;cards?:{s:string;sub?:string;icon?:string;coin?:string;tone?:'mint'|'red'|'ink'}[];cardsAt?:number;cardsFlow?:boolean}>=({kick,big,hl,line,lineAt=6,coins=[],coinsAt=10,cards=[],cardsAt=12,cardsFlow=false})=>{const {f}=useS();const room=useRoom();const list=useBrands();
 const words=big.split(' ');const longest=Math.max(...words.map(w=>w.length));const n=big.length;const size=Math.min(n<=16?150:n<=24?122:100,Math.floor(880/(longest*.64)));
 const cln=(w:string)=>w.toLowerCase().replace(/[?!.,:;…]/g,'');const hlw=new Set((hl??'').split(' ').map(cln).filter(Boolean));
 return <div style={{position:'relative',height:room}}>
  <div style={{display:'flex',alignItems:'center',gap:16}}><Bar/></div>
  {kick&&<div {...bb('kick')} style={{...L(kick,28),marginTop:-8}}>{kick}</div>}
  <div {...bb('big')} style={{...HX(size),lineHeight:1.04,letterSpacing:-3,marginTop:28}}>{words.map((w,k)=><span key={k} style={{color:hlw.has(cln(w))?LC.mint:LC.ink}}>{w}{k<words.length-1?' ':''}</span>)}</div>
  {line&&<In at={lineAt} n="line" style={{...BM(48,LC.ink),marginTop:40,maxWidth:860}}>{line}</In>}
  {coins.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:18,marginTop:48}}>{coins.map((c,k)=>{const p=ease(f,coinsAt+k*4);const b=coinOf(c,list);
   return <div key={k} {...bb('coin')} style={{...glass({borderRadius:QRs(30)}),display:'flex',alignItems:'center',gap:16,padding:'14px 26px 14px 16px',opacity:p,transform:`translateY(${(1-p)*20}px)`}}>
    {b?<BrandMark b={b} size={52} on="#1A1A1E"/>:<Sq s={20}/>}<span style={{...L(c,30,LC.ink,false)}}>{c}</span></div>})}</div>}
  {cards.length>0&&<div style={{...(cardsFlow?{marginTop:64}:{position:'absolute',left:0,right:0,bottom:40}),display:'flex',gap:20}}>{cards.map((c,k)=>{const p=ease(f,cardsAt+k*5,16);const col=c.tone==='red'?LC.red:c.tone==='ink'?LC.ink:LC.mint;
   return <div key={k} {...bb('card')} style={{flex:1,...glass({padding:'34px 30px 30px',borderRadius:k%2?QR:'6px 34px 34px 34px'}),opacity:p,transform:`translateY(${(1-p)*30}px)`}}>
    <span style={{position:'absolute',top:14,[k%2?'right':'left']:14,width:16,height:16,background:col}}/>
    <Tile k={c.icon} coin={c.coin} s={92} tone={col}/><div style={{...HX(50),marginTop:26}}>{c.s}</div>{c.sub&&<div style={{...BM(32),marginTop:8}}>{c.sub}</div>}</div>})}</div>}
 </div>};
/* ================= 2. price ticker: count-up price, % change with arrow (mint up / red down), sparkline ================= */
const Chg:React.FC<{v:number;size?:number;p?:number}>=({v,size=40,p=1})=>{const up=v>=0;const c=up?LC.mint:LC.red;
 return <span {...bb('chg')} style={{display:'inline-flex',alignItems:'center',gap:size*.3,background:up?LC.mintT(.13):LC.redT(.14),border:`1.5px solid ${up?LC.mintT(.35):LC.redT(.45)}`,borderRadius:QRs(size*.5),padding:`${size*.22}px ${size*.42}px`,...NUM(size,c),opacity:p}}>
  <svg width={size*.55} height={size*.55} viewBox="0 0 10 10"><path d={up?'M5 1 9.5 8.5H.5z':'M5 9 .5 1.5h9z'} fill={c}/></svg>{up?'+':'−'}{fmt(Math.abs(v),2)}%</span>};
const spark=(d:number[],w:number,h:number,n?:number)=>{const lo=Math.min(...d),hi=Math.max(...d);const X=(i:number)=>i/(d.length-1)*w,Y=(v:number)=>h-(v-lo)/(hi-lo||1)*h;
 const m=n??d.length-1;const k=Math.floor(m),fr=m-k;const pts=d.slice(0,k+1).map((v,i)=>[X(i),Y(v)]);if(fr>0&&k+1<d.length)pts.push([X(k+fr),Y(d[k]+(d[k+1]-d[k])*fr)]);return pts};
export const LcPrice:React.FC<{title?:string;kick?:string;coin:string;sym:string;price:number;from?:number;dec?:number;cur?:string;chg:number;at?:number;spark?:number[];label?:string;src?:string;stats?:{k:string;v:string}[]}>=({title,kick,coin,sym,price,from,dec=0,cur='$',chg,at=4,spark:sp,label='MINH HỌA',src,stats=[]})=>{
 const {f}=useS();const room=useRoom();const p=ease(f,at,30);const v=(from??price*.94)+(price-(from??price*.94))*p;const up=chg>=0;const c=up?LC.mint:LC.red;
 const data=sp??[3,4,3.6,5,4.4,5.6,5.1,6.2,5.8,6.9,6.4,7.4];const W=780,Hh=Math.min(300,room-760);const pts=spark(data,W,Hh,(data.length-1)*ease(f,at+4,40));
 const path=pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+','+q[1].toFixed(1)).join('');const tip=pts[pts.length-1];
 return <div style={{height:room,display:'flex',flexDirection:'column'}}>
  {title&&<LTitle s={title} kick={kick}/>}
  <In at={at-2} n="price-card" style={{...glass({padding:'40px 44px 36px'}),flex:1,display:'flex',flexDirection:'column'}}><Corner/>
   <div style={{display:'flex',alignItems:'center',gap:22}}><Tile coin={coin} k="wallet" s={76}/>
    <div><div style={{...HX(48)}}>{coin}</div><div style={{...L(sym,26),marginTop:6}}>{sym} / USD</div></div>
    <div style={{marginLeft:'auto',marginRight:30}}><Tag s={src?`NGUỒN · ${src}`:label}/></div></div>
   <div {...bb('price')} style={{...NUM(fitSize(cur+fmt(price,dec),800,138,.62),LC.ink),marginTop:44,letterSpacing:'-.02em'}}>{cur}{fmt(v,dec)}</div>
   <div style={{marginTop:26,display:'flex',alignItems:'center',gap:20}}><Chg v={chg} size={40} p={ease(f,at+16,10)}/><span style={{...BM(32),opacity:ease(f,at+18,10)}}>24 giờ</span></div>
   <svg data-deco="spark" width={W} height={Hh+40} style={{marginTop:'auto',overflow:'visible'}}>
    <defs><linearGradient id="lcsp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".28"/><stop offset="1" stopColor={c} stopOpacity="0"/></linearGradient></defs>
    {pts.length>1&&<path d={path+`L${tip[0]},${Hh+30}L0,${Hh+30}Z`} fill="url(#lcsp)" transform="translate(0,10)"/>}
    <path d={path} fill="none" stroke={c} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" transform="translate(0,10)"/>
    {tip&&<g transform={`translate(${tip[0]},${tip[1]+10})`}><circle r={18} fill={c} opacity={.18}/><circle r={8} fill={c}/></g>}</svg>
   {stats.length>0&&<div style={{display:'flex',gap:16,marginTop:24}}>{stats.map((s,k)=><div key={k} {...bb('stat')} style={{flex:1,borderTop:`1.5px solid ${LC.line}`,paddingTop:16,opacity:ease(f,at+22+k*3)}}>
    <div style={{...L(s.k,22)}}>{s.k}</div><div style={{...NUM(36),marginTop:8}}>{s.v}</div></div>)}</div>}
  </In></div>};
/* ================= 3. price chart: progressive line / candles, glow marker on the narration word, annotation ================= */
type Mark={i:number;at:number;s:string;tone?:'up'|'down'|'flat'};
export const LcChart:React.FC<{title:string;kick?:string;kind?:'line'|'candle';data?:number[];candles?:number[][];at?:number;dur?:number;marks?:Mark[];label?:string;src?:string;yl?:string[];xl?:string[]}>=({title,kick,kind='line',data,candles,at=6,dur=45,marks=[],label='MINH HỌA',src,yl,xl})=>{
 const {f}=useS();const room=useRoom();const W0=806,W=yl?W0-96:W0,Hh=Math.max(360,room-560);
 const C=candles??[];const vals=kind==='candle'?C.flatMap(c=>[c[1],c[2]]):(data??[]);const lo=Math.min(...vals),hi=Math.max(...vals);const pad=(hi-lo)*.08;
 const n=kind==='candle'?C.length:(data??[]).length;const X=(i:number)=>kind==='candle'?(i+.5)/n*W:i/(n-1)*W,Y=(v:number)=>Hh-(v-lo+pad)/(hi-lo+2*pad)*Hh;
 const pr=interpolate(f,[at,at+dur],[0,1],{...cl,easing:Easing.bezier(.4,0,.2,1)});const m=pr*(n-1);
 let body:React.ReactNode=null;let tip:[number,number]|null=null;
 if(kind==='line'&&data){const k=Math.floor(m),fr=m-k;const pts=data.slice(0,k+1).map((v,i)=>[X(i),Y(v)]);if(fr>0&&k+1<n)pts.push([X(k+fr),Y(data[k]+(data[k+1]-data[k])*fr)]);
  const d=pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+','+q[1].toFixed(1)).join('');tip=pts[pts.length-1] as any;const up=data[n-1]>=data[0];const c=up?LC.mint:LC.red;
  body=<><defs><linearGradient id="lcch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".24"/><stop offset="1" stopColor={c} stopOpacity="0"/></linearGradient></defs>
   {pts.length>1&&<path d={d+`L${tip![0]},${Hh}L0,${Hh}Z`} fill="url(#lcch)"/>}<path d={d} fill="none" stroke={c} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round"/>
   {tip&&pr<1&&<circle cx={tip[0]} cy={tip[1]} r={7} fill={LC.ink}/>}</>}
 if(kind==='candle'){const bw=W/n*.56;body=<>{C.map((c,i)=>{const q=interpolate(m+1-i,[0,1],[0,1],cl);if(q<=0)return null;const [o,h,l,cc]=c;const up=cc>=o;const col=up?LC.mint:LC.red;
   const y0=Y(o),y1=Y(o+(cc-o)*q);return <g key={i} opacity={Math.min(1,q*2)}><line x1={X(i)} x2={X(i)} y1={Y(o+(h-o)*q)} y2={Y(o+(l-o)*q)} stroke={col} strokeWidth={2.5}/>
    <rect x={X(i)-bw/2} y={Math.min(y0,y1)} width={bw} height={Math.max(3,Math.abs(y1-y0))} fill={up?col:col} rx={2}/></g>})}</>}
 const grid=[0,1,2,3].map(k=>Hh*(k+.5)/4);
 return <div style={{height:room,display:'flex',flexDirection:'column'}}>
  <LTitle s={title} kick={kick}/>
  <In at={at-4} n="chart" style={{...glass({padding:'30px 34px 30px'}),flex:1,display:'flex',flexDirection:'column'}}><Corner/>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,marginRight:28}}><span style={{...L(kind==='candle'?'NẾN NGÀY':'GIÁ',24)}}>{kind==='candle'?'NẾN NGÀY':'GIÁ'}</span><Tag s={src?`NGUỒN · ${src}`:label}/></div>
   <div style={{position:'relative',flex:1}}>
    <svg {...bb('plot')} width={W} height={Hh} style={{position:'absolute',left:-4,top:0,overflow:'visible'}}>
     {grid.map((y,k)=><line key={k} x1={0} x2={W} y1={y} y2={y} stroke={LC.inkT(.07)} strokeWidth={1.5} strokeDasharray="2 10"/>)}
     {body}
     {marks.map((mk,k)=>{if(f<mk.at)return null;const q=ease(f,mk.at,14);const i=Math.min(n-1,mk.i);const v=kind==='candle'?C[i][3]:data![i];const x=X(i),y=Y(v);const col=mk.tone==='down'?LC.red:mk.tone==='flat'?LC.ink:LC.mint;
      const pulse=(f-mk.at)%45/45;return <g key={k}><circle cx={x} cy={y} r={14+30*pulse} fill="none" stroke={col} strokeWidth={2} opacity={.6*(1-pulse)}/>
       <circle cx={x} cy={y} r={26} fill={col} opacity={.16*q}/><circle cx={x} cy={y} r={10*q} fill={col}/></g>})}
    </svg>
    {marks.map((mk,k)=>{if(f<mk.at)return null;const q=ease(f,mk.at+3,12);const i=Math.min(n-1,mk.i);const v=kind==='candle'?C[i][3]:data![i];const x=X(i),y=Y(v);const below=y<Hh*.42;
     const col=mk.tone==='down'?LC.red:mk.tone==='flat'?LC.ink:LC.mint;const w=Math.min(520,mk.s.length*20+70);const left=Math.max(0,Math.min(W-w,x-w/2));
     return <div key={k} {...bb('note')} style={{...glass({borderRadius:QRs(20),border:`1.5px solid ${col}`}),position:'absolute',left,top:below?y+52:y-52-62,width:w,height:62,display:'flex',alignItems:'center',gap:12,padding:'0 20px',opacity:q,transform:`translateY(${(1-q)*(below?-12:12)}px)`}}>
      <Sq s={14} c={col}/><span style={{...L(mk.s,26,LC.ink,false),letterSpacing:'.02em'}}>{mk.s}</span></div>})}
    {yl&&<div style={{position:'absolute',right:-6,top:0,height:Hh,display:'flex',flexDirection:'column',justifyContent:'space-around'}}>{yl.map((s,k)=><span key={k} style={{...NUM(20,LC.dim)}}>{s}</span>)}</div>}
   </div>
   {xl&&<div style={{display:'flex',justifyContent:'space-between',marginTop:14}}>{xl.map((s,k)=><span key={k} style={{...L(s,20,LC.dim)}}>{s}</span>)}</div>}
  </In></div>};
/* ================= 4. coin card: logo, name, rank, stat rows ================= */
export const LcCoin:React.FC<{coin:string;sym:string;rank?:number;price?:string;chg?:number;stats:{k:string;v:string;at?:number}[];at?:number;label?:string;src?:string;note?:{s:string;at:number}}>=({coin,sym,rank,price,chg,stats,at=2,label='MINH HỌA',src,note})=>{const {f}=useS();
 return <Fill head={null}><In at={at} n="coin-card" style={{...glass({padding:`${z(44)} ${z(44)}`})}}>
  {rank!=null&&<div {...bb('rank')} style={{position:'absolute',top:0,right:0,width:z(108),height:z(108),background:LC.mint,display:'flex',alignItems:'center',justifyContent:'center',...NUM(z(40),LC.onMint)}}>#{rank}</div>}
  <div style={{display:'flex',alignItems:'center',gap:z(28)}}><Tile coin={coin} k="wallet" s={120}/>
   <div><div style={{...HX(z(64))}}>{coin}</div><div style={{...L(sym,z(28)),marginTop:z(8)}}>{sym}</div></div></div>
  {price&&<div style={{display:'flex',alignItems:'baseline',gap:z(22),marginTop:z(36)}}><span {...bb('price')} style={{...NUM(z(84))}}>{price}</span>{chg!=null&&<Chg v={chg} size={40}/>}</div>}
  <div style={{marginTop:zg(30)}}>{stats.map((s,k)=>{const on=f>=(s.at??at+8+k*4);return <div key={k} {...(on?bb('row'):{})} style={{...hid(on),display:'flex',justifyContent:'space-between',alignItems:'center',padding:`${zg(22)} 0`,borderTop:`1.5px solid ${LC.line}`,opacity:ease(f,s.at??at+8+k*4)}}>
   <span style={{display:'flex',alignItems:'center',gap:z(16)}}><Sq s={z(12)}/><span style={{...BM(z(36),LC.grey)}}>{s.k}</span></span><span style={{...NUM(z(42))}}>{s.v}</span></div>})}</div>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:z(22)}}><Tag s={src?`NGUỒN · ${src}`:label}/>{note&&f>=note.at&&<span {...bb('note')} style={{...BM(z(30),LC.ink),opacity:ease(f,note.at)}}>{note.s}</span>}</div>
 </In></Fill>};
/* ================= 5. on-chain flow: node -> node with moving packets, amount, ratio bar, whale tag ================= */
type Node={s:string;kind?:string;coin?:string;sub?:string};
const NodeCard:React.FC<{n:Node;at:number;nm:string}>=({n,at,nm})=><In at={at} n={nm} style={{...glass({padding:'32px 34px'}),display:'flex',alignItems:'center',gap:28}}><Corner/>
 <Tile k={n.kind} coin={n.coin} s={116}/><div style={{minWidth:0}}><div style={{...HX(58)}}><BrandText s={n.s}/></div>{n.sub&&<div style={{...BM(36),marginTop:8}}>{n.sub}</div>}</div></In>;
export const LcFlow:React.FC<{title:string;kick?:string;from:Node;to:Node;at?:number;amount?:{s:string;at:number};ratio?:{a:number;la:string;lb:string;at:number;tone?:'up'|'down'};tag?:{s:string;tone?:'up'|'down';at:number};label?:string;src?:string}>=({title,kick,from,to,at=4,amount,ratio,tag,label='MINH HỌA',src})=>{
 const {f}=useS();const room=useRoom();const g=useCurrentFrame();const run=f>=(amount?.at??at+10);
 const pathH=Math.max(220,Math.min(520,room-(ratio?760:620)));
 return <div style={{height:room,display:'flex',flexDirection:'column'}}>
  <LTitle s={title} kick={kick}/>
  <div style={{marginTop:'auto',marginBottom:'auto'}}>
  <NodeCard n={from} at={at} nm="from"/>
  <div style={{position:'relative',height:pathH,margin:'0 0'}}>
   <svg data-deco="flow" width={894} height={pathH} style={{position:'absolute',left:0,top:0}}>
    <defs><linearGradient id="lcfl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={LC.mint} stopOpacity=".05"/><stop offset=".5" stopColor={LC.mint} stopOpacity=".55"/><stop offset="1" stopColor={LC.mint} stopOpacity=".05"/></linearGradient></defs>
    <path d={`M92,0 L92,${pathH}`} stroke={run?'url(#lcfl)':LC.inkT(.14)} strokeWidth={4} strokeDasharray="2 14" strokeLinecap="round" fill="none"/>
    {run&&[0,1,2].map(k=>{const q=((g/42)+k/3)%1;return <g key={k} opacity={Math.sin(Math.PI*q)}><rect x={92-26} y={q*pathH-26} width={52} height={52} fill={LC.mint} opacity={.14}/><rect x={92-13} y={q*pathH-13} width={26} height={26} fill={LC.mint}/></g>})}</svg>
   {amount&&<In at={amount.at} n="amount" style={{...glass({borderRadius:QRs(28),padding:'20px 32px'}),position:'absolute',left:170,top:pathH/2-50,display:'flex',alignItems:'center',gap:18}}>
    <Sq s={18}/><span style={{...NUM(52),fontFamily:lab(amount.s)}}>{amount.s}</span></In>}
   {tag&&<In at={tag.at} n="tag" style={{position:'absolute',right:0,top:pathH/2-36,background:tag.tone==='down'?LC.red:LC.mint,borderRadius:QRs(22),padding:'14px 24px',...L(tag.s,28,tag.tone==='down'?'#FFFFFF':LC.onMint)}}>{tag.s}</In>}
  </div>
  <NodeCard n={to} at={at+6} nm="to"/>
  {ratio&&<In at={ratio.at} n="ratio" style={{marginTop:34}}>
   <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}><span style={{...L(ratio.la,24,LC.ink)}}>{ratio.la} · {ratio.a}%</span><span style={{...L(ratio.lb,24)}}>{ratio.lb} · {100-ratio.a}%</span></div>
   <div style={{height:22,display:'flex',gap:6}}><div style={{width:`${ratio.a*ease(f,ratio.at+4,24)}%`,background:ratio.tone==='down'?LC.red:LC.mint,borderRadius:'11px 2px 2px 11px'}}/><div style={{flex:1,background:LC.inkT(.14),borderRadius:'2px 11px 11px 2px'}}/></div></In>}
  </div>
  <div style={{display:'flex',justifyContent:'flex-end',paddingBottom:46}}><Tag s={src?`NGUỒN · ${src}`:label}/></div>
 </div>};
/* ================= 6. face-off: two columns + metric rows (winner cell mint) ================= */
type Side={s:string;sub?:string;coin?:string;icon?:string};
export const LcVersus:React.FC<{title?:string;kick?:string;a:Side;b:Side;rows:{k:string;a:string;b:string;win?:'a'|'b';at:number}[];at?:number;label?:string}>=({title,kick,a,b,rows,at=2,label})=>{const {f}=useS();const {eq}=useLc();
 const head=(s:Side,k:number,col:string)=><In at={at+k*4} n={'side-'+k} style={{flex:1,...glass({padding:`${z(26)} ${z(24)}`,borderRadius:k?QR:'6px 34px 34px 34px'}),display:'flex',flexDirection:'column',alignItems:'center',gap:z(14),textAlign:'center'}}>
  <span style={{position:'absolute',top:14,[k?'right':'left']:14,width:16,height:16,background:col}}/>
  <Tile k={s.icon} coin={s.coin} s={96} tone={col===LC.mint?LC.mint:col===LC.red?LC.red:LC.ink}/><div style={{...HX(z(54))}}>{s.s}</div>{s.sub&&<div style={{...BM(z(32))}}>{s.sub}</div>}</In>;
 return <Fill head={title?<LTitle s={title} kick={kick}/>:null}>
  <div style={{display:'flex',gap:z(18),alignItems:'stretch',position:'relative'}}>{head(a,0,LC.mint)}{head(b,1,eq?LC.red:LC.ink)}
   <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:z(64),height:z(64),background:LC.bg,border:`1.5px solid ${LC.line2}`,display:'flex',alignItems:'center',justifyContent:'center',...NUM(z(22),LC.grey)}}>VS</div></div>
  <div style={{marginTop:zg(26)}}>{rows.map((r,k)=>{const on=f>=r.at;const cell=(v:string,side:'a'|'b')=>{const w=r.win===side;return <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:side==='a'?'flex-start':'flex-end',gap:z(12),...HX(z(50),w?LC.mint:LC.ink),textAlign:side==='a'?'left':'right'}}>
    {w&&side==='a'&&<Sq s={z(14)}/>}<span>{v}</span>{w&&side==='b'&&<Sq s={z(14)} c={eq?LC.red:LC.mint}/>}</div>};
   return <div key={k} {...(on&&ease(f,r.at)>.95?bb('row'):{})} style={{...hid(on),padding:`${zg(20)} ${z(8)}`,borderTop:`1.5px solid ${LC.line}`,opacity:ease(f,r.at),transform:`translateY(${(1-ease(f,r.at))*18}px)`}}>
    <div style={{...L(r.k,z(26) as any),textAlign:'center',marginBottom:z(12)}}>{r.k}</div><div style={{display:'flex',gap:z(20)}}>{cell(r.a,'a')}{cell(r.b,'b')}</div></div>})}</div>
  {label&&<div style={{marginTop:z(18),display:'flex',justifyContent:'flex-end'}}><Tag s={label}/></div>}
 </Fill>};
/* ================= 8. guide / security: device frame + checklist ================= */
const Phone:React.FC<{screen:string;words?:number;f:number;at:number}>=({screen,words=12,f,at})=>{const W=300,H=600;
 return <div {...bb('device')} style={{width:W,height:H,flex:'none',borderRadius:46,background:'linear-gradient(160deg,#2B2B31,#0E0E11)',padding:12,boxSizing:'border-box',boxShadow:'0 40px 80px rgba(0,0,0,.6), inset 0 1.5px 0 rgba(255,255,255,.12)',border:`1.5px solid ${LC.line2}`}}>
  <div style={{width:'100%',height:'100%',borderRadius:36,background:'#0B0B0E',overflow:'hidden',position:'relative',padding:'54px 20px 20px',boxSizing:'border-box'}}>
   <div style={{position:'absolute',top:14,left:'50%',transform:'translateX(-50%)',width:90,height:24,borderRadius:12,background:'#000'}}/>
   {screen==='seed'?<><div style={{...L('CỤM TỪ KHÔI PHỤC',17,LC.grey),textAlign:'center'}}>CỤM TỪ KHÔI PHỤC</div><div style={{...BM(16,LC.dim),textAlign:'center',marginTop:6}}>{words} từ · viết ra giấy</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:22}}>{Array.from({length:words},(_,k)=>{const q=ease(f,at+k*1.5,8);return <div key={k} style={{display:'flex',alignItems:'center',gap:8,background:'#17171B',borderRadius:'10px 3px 10px 10px',padding:'9px 10px',opacity:q}}>
     <span style={{...NUM(14,LC.dim),width:18}}>{k+1}</span><span style={{flex:1,height:9,borderRadius:5,background:LC.inkT(.22),filter:'blur(1.5px)'}}/></div>})}</div>
    <div style={{position:'absolute',left:20,right:20,bottom:22}}><div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center',marginBottom:12}}><Glyph k="camera" s={18} c={LC.red} w={2}/><span style={{...BM(14,LC.grey)}}>Không chụp màn hình</span></div>
     <div style={{height:52,borderRadius:'16px 4px 16px 16px',background:LC.mint,display:'flex',alignItems:'center',justifyContent:'center',...L('ĐÃ CHÉP XONG',16,LC.onMint)}}>ĐÃ CHÉP XONG</div></div></>
   :<><div style={{...L('SỐ DƯ',17),textAlign:'center'}}>SỐ DƯ</div><div style={{...NUM(40),textAlign:'center',marginTop:12,filter:'blur(7px)'}}>$ 8,888</div>
    <div style={{margin:'20px auto 0',width:180,padding:'8px 12px',borderRadius:'14px 3px 14px 14px',background:'#17171B',...NUM(15,LC.grey),textAlign:'center'}}>0x7a3f…c91e</div>
    <div style={{display:'flex',gap:12,marginTop:26}}>{['GỬI','NHẬN'].map((s,k)=><div key={k} style={{flex:1,height:62,borderRadius:'18px 4px 18px 18px',background:k?'#1C1C21':LC.mint,display:'flex',alignItems:'center',justifyContent:'center',...L(s,18,k?LC.ink:LC.onMint)}}>{s}</div>)}</div>
    <div style={{marginTop:22,display:'flex',flexDirection:'column',gap:10}}>{[0,1,2].map(k=><div key={k} style={{height:54,borderRadius:'16px 4px 16px 16px',background:'#141418',display:'flex',alignItems:'center',gap:10,padding:'0 12px'}}><span style={{width:28,height:28,borderRadius:14,background:LC.inkT(.12)}}/><span style={{flex:1,height:9,borderRadius:5,background:LC.inkT(.12)}}/></div>)}</div></>}
  </div></div>};
const HW:React.FC<{f:number;at:number}>=({f,at})=>{const ok=ease(f,at+10,10);return <div {...bb('device')} style={{width:300,height:520,flex:'none',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
 <div style={{width:180,height:440,borderRadius:'90px 14px 90px 90px',background:'linear-gradient(160deg,#2E2E34,#0D0D10)',border:`1.5px solid ${LC.line2}`,boxShadow:'0 40px 80px rgba(0,0,0,.6), inset 0 1.5px 0 rgba(255,255,255,.12)',display:'flex',flexDirection:'column',alignItems:'center',padding:'60px 0',boxSizing:'border-box',gap:34}}>
  <div style={{width:118,height:150,background:'#050506',borderRadius:10,border:`1px solid ${LC.line}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
   <span style={{...L('KÝ OFFLINE',12,LC.grey)}}>KÝ OFFLINE</span><span style={{width:44,height:44,background:LC.mintT(.15+.85*ok),display:'flex',alignItems:'center',justifyContent:'center'}}><Glyph k="lock" s={28} c={ok>.5?LC.onMint:LC.mint} w={2.2}/></span></div>
  <div style={{display:'flex',gap:22}}>{[0,1].map(k=><span key={k} style={{width:34,height:34,borderRadius:17,background:'#1B1B20',border:`1.5px solid ${LC.line2}`}}/>)}</div>
  <Glyph k="nowifi" s={40} c={LC.grey}/></div></div>};
const Paper:React.FC<{f:number;at:number;words?:number}>=({f,at,words=12})=><div {...bb('device')} style={{width:310,height:420,flex:'none',background:'linear-gradient(170deg,#ECECE7,#D8D8D2)',borderRadius:'26px 4px 26px 26px',padding:'30px 26px',boxSizing:'border-box',transform:'rotate(-3deg)',boxShadow:'0 40px 70px rgba(0,0,0,.55)'}}>
 <div style={{...L('SEED · BẢN 1/2',16,'#4A4A4E')}}>SEED · BẢN 1/2</div>
 <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px 18px',marginTop:20}}>{Array.from({length:words},(_,k)=><div key={k} style={{display:'flex',alignItems:'center',gap:8,opacity:ease(f,at+k*1.5,8)}}><span style={{...NUM(14,'#6A6A70'),width:20}}>{k+1}</span><span style={{flex:1,height:2,background:'#9A9AA0'}}/></div>)}</div></div>;
export const LcGuide:React.FC<{title:string;kick?:string;device?:'phone'|'hw'|'paper';screen?:'seed'|'wallet';words?:number;checks:{s:string;at:number;ok?:boolean}[];at?:number}>=({title,kick,device='phone',screen='wallet',words=12,checks,at=2})=>{const {f}=useS();
 const dev=device==='hw'?<HW f={f} at={at}/>:device==='paper'?<Paper f={f} at={at} words={words}/>:<Phone screen={screen} words={words} f={f} at={at}/>;const p=ease(f,at,18);
 const dh=device==='hw'?520:device==='paper'?440:600;const sc=checks.length<=2?1.3:checks.length===3?1.08:.9;
 return <Fill head={<LTitle s={title} kick={kick}/>}>
  <div style={{display:'flex',flexDirection:'column',gap:zg(36)}}>
   <div style={{display:'flex',justifyContent:'center',opacity:p,transform:`translateY(${(1-p)*30}px)`,position:'relative'}}>
    <div data-deco="pool" style={{position:'absolute',left:'50%',bottom:-30,width:520,height:90,transform:'translateX(-50%)',background:'radial-gradient(ellipse at center, rgba(0,0,0,.55), rgba(0,0,0,0) 70%)'}}/><div style={{height:dh*sc}}><div style={{transform:`scale(${sc})`,transformOrigin:'top center'}}>{dev}</div></div></div>
   <div style={{display:'flex',flexDirection:'column',gap:zg(14)}}>{checks.map((c,k)=>{const on=f>=c.at;const q=ease(f,c.at);const ok=c.ok!==false;
    return <div key={k} {...(on?bb('check'):{})} style={{...hid(on),...glass({borderRadius:QRs(26),padding:`${z(20)} ${z(26)}`,border:`1.5px solid ${ok?LC.line:LC.redT(.4)}`}),display:'flex',alignItems:'center',gap:z(22),opacity:q,transform:`translateX(${(1-q)*24}px)`}}>
     <span style={{width:z(44),height:z(44),flex:'none',background:ok?LC.mint:LC.red,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="62%" height="62%" viewBox="0 0 10 10"><path d={ok?'M1.5 5.2 4 7.6 8.6 2.6':'M2 2l6 6M8 2 2 8'} stroke={ok?LC.onMint:'#FFFFFF'} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
     <span style={{...BM(z(44),LC.ink)}}>{c.s}</span></div>})}</div></div></Fill>};
/* ================= 8b. red warning card ================= */
export const LcWarn:React.FC<{kick?:string;title:string;s?:string;items?:{s:string;at:number}[];at?:number}>=({kick='CẢNH BÁO',title,s,items=[],at=2})=>{const {f}=useS();const p=ease(f,at,16);
 return <Fill head={null}><div {...bb('warn')} style={{...glass({padding:`${z(44)} ${z(44)}`,border:`2px solid ${LC.redT(.6)}`,background:`linear-gradient(170deg, rgba(230,50,45,.16) 0%, rgba(22,16,17,.92) 34%, rgba(13,12,13,.94) 100%)`}),opacity:p,transform:`translateY(${(1-p)*30}px)`}}>
  <span style={{position:'absolute',top:0,right:0,width:z(30),height:z(30),background:LC.red}}/>
  <div style={{display:'flex',alignItems:'center',gap:z(18)}}><span style={{width:z(64),height:z(64),background:LC.red,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}}><svg width="60%" height="60%" viewBox="0 0 10 10"><path d="M5 1.6v4.6" stroke="#fff" strokeWidth={1.5} strokeLinecap="round"/><circle cx={5} cy={8.2} r={.85} fill="#fff"/></svg></span>
   <span style={{...L(kick,z(30) as any,LC.red)}}>{kick}</span></div>
  <div style={{...HX(z(60)),marginTop:z(28)}}>{title}</div>{s&&<div style={{...BM(z(40),LC.grey),marginTop:z(18)}}>{s}</div>}
  {items.length>0&&<div style={{marginTop:zg(30),display:'flex',flexDirection:'column',gap:zg(18)}}>{items.map((it,k)=>{const on=f>=it.at;return <div key={k} {...(on?bb('item'):{})} style={{...hid(on),display:'flex',alignItems:'center',gap:z(20),opacity:ease(f,it.at),borderTop:`1.5px solid ${LC.redT(.18)}`,paddingTop:zg(18)}}>
   <span style={{width:z(36),height:z(36),flex:'none',border:`2px solid ${LC.red}`,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="56%" height="56%" viewBox="0 0 10 10"><path d="M2 2l6 6M8 2 2 8" stroke={LC.red} strokeWidth={1.8} strokeLinecap="round"/></svg></span>
   <span style={{...BM(z(40),LC.ink)}}>{it.s}</span></div>})}</div>}
 </div></Fill>};
/* ================= 9. news: ticker band, source + headline, points ================= */
export const LcNews:React.FC<{kick?:string;head:string;src?:string;date?:string;ticker?:{sym:string;chg:number}[];points?:{s:string;at:number}[];at?:number}>=({kick='TIN NHANH',head,src,date,ticker=[],points=[],at=2})=>{const {f}=useS();const g=useCurrentFrame();
 const band=ticker.length?[...ticker,...ticker,...ticker]:[];
 return <Fill head={<>{ticker.length>0&&<div {...bb('ticker')} style={{height:64,...glass({borderRadius:QRs(20)}),overflow:'hidden',marginBottom:38,display:'flex',alignItems:'center'}}>
   <div data-deco="ticker" style={{display:'flex',gap:44,paddingLeft:24,transform:`translateX(${-((g*1.6)%(ticker.length*190))}px)`,whiteSpace:'nowrap'}}>{band.map((t,k)=><span key={k} style={{display:'inline-flex',alignItems:'center',gap:12,width:146}}>
    <span style={{...NUM(24,LC.ink)}}>{t.sym}</span><span style={{...NUM(22,t.chg>=0?LC.mint:LC.red)}}>{t.chg>=0?'▲':'▼'}{Math.abs(t.chg).toFixed(1)}%</span></span>)}</div></div>}
  <LTitle s={head} kick={kick} at={at} size={64}/>
  {(src||date)&&<In at={at+6} n="src" style={{display:'flex',alignItems:'center',gap:16,marginTop:-8}}><Sq s={14}/><span style={{...L('NGUỒN',24)}}>NGUỒN</span><span style={{...L(src??'',26,LC.ink,false)}}>{src}</span>{date&&<span style={{...L(date,24,LC.dim)}}>· {date}</span>}</In>}</>}>
  <div style={{display:'flex',flexDirection:'column',gap:zg(18)}}>{points.map((p,k)=>{const on=f>=p.at;return <div key={k} {...(on?bb('point'):{})} style={{...hid(on),...glass({borderRadius:QRs(26),padding:`${z(22)} ${z(28)}`}),display:'flex',gap:z(20),alignItems:'flex-start',opacity:ease(f,p.at),transform:`translateY(${(1-ease(f,p.at))*18}px)`}}>
   <span style={{...NUM(z(30),LC.mint),width:z(42),flex:'none',paddingTop:z(6)}}>{String(k+1).padStart(2,'0')}</span><span style={{...BM(z(40),LC.ink)}}><BrandText s={p.s}/></span></div>})}</div></Fill>};
/* ================= 7b. numbered steps (theme-native; packs Steps/DataFlow also work via look.pack) ================= */
export const LcSteps:React.FC<{title:string;kick?:string;steps:{s:string;sub?:string;at:number;icon?:string}[]}>=({title,kick,steps})=>{const {f}=useS();
 return <Fill head={<LTitle s={title} kick={kick}/>}><div style={{display:'flex',flexDirection:'column',gap:zg(20)}}>{steps.map((s,k)=>{const on=f>=s.at;const q=ease(f,s.at);
  return <div key={k} {...(on?bb('step'):{})} style={{...hid(on),...glass({padding:`${z(26)} ${z(30)}`}),display:'flex',alignItems:'center',gap:z(26),opacity:q,transform:`translateY(${(1-q)*22}px)`}}>
   <span style={{width:z(84),height:z(84),flex:'none',background:LC.mint,borderRadius:'26px 5px 26px 26px',display:'flex',alignItems:'center',justifyContent:'center',...NUM(z(40),LC.onMint)}}>{k+1}</span>
   <div style={{flex:1,minWidth:0}}><div style={{...HX(z(50))}}>{s.s}</div>{s.sub&&<div style={{...BM(z(34)),marginTop:z(8)}}>{s.sub}</div>}</div>
   {s.icon&&<Glyph k={s.icon} s={z(52) as any} c={LC.grey}/>}</div>})}</div></Fill>};
/* ================= 11. end card: hero plate (3D logomark in the light pool), page name, handles, disclaimer ================= */
const PN:Record<string,string>={youtube:'YouTube',facebook:'Facebook',tiktok:'TikTok'};
export const LcEndCard:React.FC<{dur?:number;handles?:Handle[];tagline?:string;tm?:string;plate?:string;ms?:number}>=({dur=96,handles,tagline='',tm,plate,ms})=>{const f=useCurrentFrame();const B=useBrand();handles=handles??B.handles;
 const op=(at:number)=>ease(f,at,14);const out=interpolate(f,[dur-10,dur],[1,0],cl);const fade=interpolate(f,[0,10],[0,1],cl);
 const page=B.page??B.name;const top=SZ.end.top+470;
 return <AbsoluteFill data-layer="end" style={{zIndex:40,opacity:out}}><style>{FONTS}</style>
  <AbsoluteFill style={{opacity:fade}}><LcStudio plate={plate??"textures/loot/plate_end.jpg"} ms={ms} push={ease(f,0,dur)}/></AbsoluteFill>
  <div style={{position:'absolute',left:SZ.end.x,right:SZ.end.right,top,opacity:fade}}>
   <div {...bb('e-kick')} style={{display:'table',...L('THEO DÕI FANPAGE',26),opacity:op(6)}}>THEO DÕI FANPAGE</div>
   <div {...bb('e-name')} style={{display:'flex',alignItems:'center',gap:22,marginTop:22,opacity:op(9),transform:`translateY(${(1-op(9))*18}px)`}}>
    {B.logo&&<Img src={staticFile(B.logo)} style={{width:70,height:70}}/>}<span style={{fontFamily:lab(page),fontWeight:600,fontSize:fitSize(page,600,72,.8),letterSpacing:'.06em',color:LC.ink,whiteSpace:'nowrap',lineHeight:1}}>{page}</span></div>
   <div {...bb('e-tag')} style={{display:'table',...HX(fitSize(tagline,724,56,.58)),marginTop:30,whiteSpace:'nowrap',opacity:op(13)}}>{tagline}</div>
   <div {...bb('e-fb')} style={{display:'inline-flex',alignItems:'center',gap:16,marginTop:30,...glass({borderRadius:QRs(24),padding:'12px 24px 12px 12px'}),opacity:op(16)}}><BrandTile icon="facebook" size={52} radius={14}/><span style={{...L('FACEBOOK · '+page,24,LC.ink,false)}}>Facebook · {page}</span></div>
   {handles.length>0&&<div style={{marginTop:22,display:'flex',flexDirection:'column',gap:14}}>{handles.map((h,k)=>{const q=op(19+k*3);return <div key={k} {...bb('e-handle')} style={{display:'flex',alignItems:'center',gap:22,...glass({borderRadius:QRs(24),padding:'10px 26px 10px 12px'}),opacity:q,transform:`translateY(${(1-q)*18}px)`}}>
    <BrandTile icon={h.icon} size={52} radius={14}/><span style={{...L(PN[h.icon??'']??h.p,22)}}>{PN[h.icon??'']??h.p}</span><span style={{marginLeft:'auto',...NUM(fitSize(h.h,330,34,.62))}}>{h.h}</span></div>})}</div>}
   <div style={{marginTop:34,opacity:op(24)}}><LcDisclaimer size={22}/></div>
   {tm&&<div {...bb('e-tm')} style={{marginTop:10,...BM(20,LC.dim),opacity:op(26)}}>{tm}</div>}
  </div>
  <Sequence from={4}><Audio src={staticFile('sfx/outro_sting.wav')} volume={0.4}/></Sequence>
 </AbsoluteFill>};
