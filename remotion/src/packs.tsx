// Scenario packs: theme-agnostic scene types (compare / setup / concept / debug / news / tips-review).
// Colours, fonts and corner radius come from the live palette AT (android.tsx setPal(theme)): android-tutor keeps its exact
// Studio Dark values, every other theme takes its hand-tuned look.pack tokens (themes/<id>/theme.json). Content lives in the
// 894-wide design canvas (x 136..847 on the frame, y 340..1359), reel floors: body >= 44, mono >= 38, labels >= 30
// (canvas px, x0.795 on the frame). Vertical fill (fill.tsx): every scene uses the whole content height it is given
// (Ctx.room); z()/zf() sizes grow with --k, zg() gaps with --g, rows that have not arrived are laid out hidden.
// Motion: Material 3 emphasized-decelerate (.05,.7,.1,1) entries, no overshoot, no full-screen zoom/pop.
// Every visible content box carries data-bb (bbcheck); every item with text has `s` (or `d`/`q`) so `kw` and autofill focus can target it.
import React from 'react';import {interpolate,Easing,random} from 'remotion';
import {useS,Kicker,Media} from './sys';import {fitSize} from './brand';
import {AT,bb,fonts,Title,Note,Tick,kt} from './android';import {GLYPH} from './overlay';import {Fill,z,zg,zf,hid,useRoom} from './fill';
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const EMD=Easing.bezier(.05,.7,.1,1);
const em=(f:number,at:number,d=14)=>interpolate(f,[at,at+d],[0,1],{...cl,easing:EMD});
const enter=(f:number,at:number,dy=44,dx=0):React.CSSProperties=>{const q=em(f,at,16);return {opacity:em(f,at,10),transform:`translate(${(1-q)*dx}px,${(1-q)*dy}px)`}};
type Sz=number|string;
const B=(size:Sz,c=AT.ink,w=600):React.CSSProperties=>({fontFamily:fonts().sans,fontWeight:w,fontSize:size,color:c,lineHeight:1.22});
const M=(size:Sz,c=AT.ink,w=600):React.CSSProperties=>({fontFamily:fonts().mono,fontWeight:w,fontSize:size,color:c,lineHeight:1.25});
const HD=(size:Sz,c=AT.ink):React.CSSProperties=>({fontFamily:AT.head,fontWeight:AT.hw,fontSize:size,color:c,textTransform:AT.up?'uppercase':'none',lineHeight:1.02,letterSpacing:AT.head==='Anton'?0:-1});
const HK=()=>AT.head==='Anton'?.47:AT.head==='JBM'||AT.head==='BVPX'||AT.head==='BVPM'?.62:.55; // head glyph width / size
const card=(on:boolean,extra:React.CSSProperties={}):React.CSSProperties=>({background:on?AT.tint(.10):AT.card,border:`${on?3:2}px solid ${on?AT.green:AT.line}`,borderRadius:AT.r,boxSizing:'border-box',...extra});
const pad=(v:number,h:number)=>`${z(v)} ${z(h)}`;
const vb=(n:string,v:boolean)=>v?bb(n):{};
const Glyph:React.FC<{n?:string;s?:Sz;c?:string}>=({n,s=44,c=AT.green})=>n&&GLYPH[n]?<svg width={typeof s==='number'?s:undefined} height={typeof s==='number'?s:undefined} viewBox="0 0 24 24" style={{flex:'none',width:s,height:s}}><path d={GLYPH[n]} stroke={c} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>:null;
// newest shown item (not yet superseded) is "active"
const newest=(f:number,ats:number[])=>{let k=-1;ats.forEach((a,i)=>{if(f>=a&&(k<0||a>=ats[k]))k=i});return k};
type It={s:string;at:number;kw?:string[]};
type N={s:string;at:number}|undefined;
// title height estimate (design px) for the geometry scenes that size from the room instead of measuring
const titleH=(s:string,one?:boolean)=>one||s.length*80*HK()<=880?124:214;

/* ───────── compare ───────── */
/* Meter: labelled bars fill to v (0..100) with an emphasized ease; `best` bar in accent, others neutral; `val` replaces the % readout */
export const Meter:React.FC<{title:string;bars:(It&{v:number;val?:string;best?:boolean})[];note?:N}>=({title,bars,note})=>{const {f}=useS();const nk=newest(f,bars.map(b=>b.at));
 return <Fill head={<Title s={title} one={bars.length>3}/>}>
  <div style={{display:'flex',flexDirection:'column',gap:zg(34)}}>{bars.map((b,k)=>{const vis=f>=b.at;const q=em(f,b.at+4,24);const v=Math.max(0,Math.min(100,b.v));const on=vis&&k===nk;
   return <div key={k} {...vb('bar',vis)} style={{...hid(vis),...enter(f,b.at,0,-40),...card(on&&!b.best,{padding:pad(24,28),background:on?AT.tint(.06):'transparent',border:`2px solid ${on?AT.green:'transparent'}`})}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:20,marginBottom:z(14)}}>
     <span style={B(zf(b.s,560,50,.5),AT.ink,700)}>{b.s}</span>
     <span style={{...M(z(46),b.best?AT.good:AT.ink,800),whiteSpace:'nowrap'}}>{b.val?<span style={{opacity:q}}>{b.val}</span>:`${Math.round(v*q)}%`}</span></div>
    <div style={{height:z(34),borderRadius:AT.rp,background:AT.card2,border:`1.5px solid ${AT.line}`,overflow:'hidden'}}>
     <div style={{height:'100%',width:`${v*q}%`,background:b.best?AT.good:AT.dim,borderRadius:AT.rp}}/></div></div>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};
/* Scale: two pans on a beam; the beam tilts toward the heavier side (w) at tiltAt, verdict under the stand.
   The stand and the pan strings stretch with the room (geometry, not measured). */
export const Scale:React.FC<{title:string;a:It&{w:number;sub?:string};b:It&{w:number;sub?:string};tiltAt?:number;verdict?:N}>=({title,a,b,tiltAt,verdict})=>{const {f}=useS();const room=useRoom();
 const ta=tiltAt??Math.max(a.at,b.at)+10;const tq=em(f,ta,26);const dir=Math.sign(b.w-a.w);const ang=Math.min(12,Math.abs(b.w-a.w)*4+6)*dir*tq;// deg, + = right side down
 const DH=Math.max(640,Math.min(900,room-titleH(title)-(verdict?150:0)-40));const ex0=DH-640;
 const L=290,cx=447,py=120+ex0*.25,str=56+ex0*.4;const rad=ang*Math.PI/180;const ex=(s:number)=>({x:cx+s*L*Math.cos(rad),y:py+s*L*Math.sin(rad)});const pa=ex(-1),pb=ex(1);
 const heavy=dir>0?'b':dir<0?'a':'';
 const Pan:React.FC<{p:{x:number;y:number};it:It&{sub?:string};side:'a'|'b'}>=({p,it,side})=>{const vis=f>=it.at;const on=tq>.6&&heavy===side;
  return <div style={hid(vis)}><div style={{position:'absolute',left:p.x-1.5,top:p.y,width:3,height:str,background:AT.dim,opacity:em(f,it.at,10)}}/>
   <div {...vb('pan-'+side,vis)} style={{position:'absolute',left:p.x-160,top:p.y+str,width:320,...card(on,{padding:pad(24,22),textAlign:'center'}),...enter(f,it.at,-30)}}>
    <div style={B(zf(it.s,270,52,.52),AT.ink,800)}>{it.s}</div>{it.sub&&<div style={{...B(z(36),AT.dim,500),marginTop:8}}>{it.sub}</div>}</div></div>};
 const vv=!!verdict&&f>=verdict.at;
 return <Fill head={<Title s={title}/>}>
  <div style={{position:'relative',height:DH}}>
   <div style={{position:'absolute',left:cx-9,top:py,width:18,height:DH-50-py,background:AT.line,borderRadius:9}}/>
   <div style={{position:'absolute',left:cx-130,top:DH-60,width:260,height:20,background:AT.line,borderRadius:AT.r?10:0}}/>
   <div style={{position:'absolute',left:cx-L-10,top:py-7,width:2*L+20,height:14,background:AT.dim,borderRadius:7,transform:`rotate(${ang}deg)`,transformOrigin:'center center'}}/>
   <div style={{position:'absolute',left:cx-18,top:py-18,width:36,height:36,borderRadius:18,background:AT.green}}/>
   <Pan p={pa} it={a} side="a"/><Pan p={pb} it={b} side="b"/></div>
  {verdict&&<div {...vb('verdict',vv)} style={{...hid(vv),...card(true,{padding:pad(26,30),display:'flex',gap:20,alignItems:'center',marginTop:zg(10)}),...enter(f,verdict.at)}}>
   <Glyph n="check" s={z(52)}/><span style={B(z(48),AT.ink,800)}>{verdict.s}</span></div>}</Fill>};

/* ───────── concept ───────── */
/* DataFlow: vertical chain of nodes (reel friendly); the arrow into node k lights up and a packet travels down when node k appears.
   `via` labels the arrow into a node, `icon` is a glyph from the overlay set. */
export const DataFlow:React.FC<{title:string;nodes:(It&{sub?:string;via?:string;icon?:string})[];note?:N}>=({title,nodes,note})=>{const {f}=useS();const nk=newest(f,nodes.map(n=>n.at));const comp=nodes.length>4;
 return <Fill head={<Title s={title} one={comp}/>}>
  <div style={{display:'flex',flexDirection:'column'}}>{nodes.map((n,k)=>{const vis=f>=n.at;const pq=em(f,n.at-10,14);const lit=vis&&pq>.95;
   return <React.Fragment key={k}>
    {k>0&&<div style={{position:'relative',height:zg(comp?64:80),marginLeft:70,...hid(vis)}}>
     <div style={{position:'absolute',left:0,top:0,bottom:16,width:6,borderRadius:3,background:lit?AT.green:AT.line}}/>
     <div style={{position:'absolute',left:-12,bottom:0,width:0,height:0,borderLeft:'15px solid transparent',borderRight:'15px solid transparent',borderTop:`18px solid ${lit?AT.green:AT.line}`}}/>
     {vis&&pq>0&&pq<1&&<div style={{position:'absolute',left:-9,top:`calc(${pq} * (100% - 40px))`,width:24,height:24,borderRadius:12,background:AT.green}}/>}
     {n.via&&<span style={{position:'absolute',left:38,top:'50%',transform:'translateY(-50%)',...M(z(32),AT.dim,600),whiteSpace:'nowrap',opacity:em(f,n.at-6,10)}}>{n.via}</span>}</div>}
    <div {...vb('node',vis)} style={{...hid(vis),...card(vis&&k===nk,{padding:comp?pad(20,28):pad(26,30),display:'flex',alignItems:'center',gap:22}),...enter(f,n.at,30)}}>
     {n.icon&&<Glyph n={n.icon} s={z(52)}/>}<div style={{minWidth:0}}><div style={B(zf(n.s,1300,52,.5),AT.ink,800)}>{n.s}</div>
     {n.sub&&<div style={{...B(z(38),AT.dim,500),marginTop:6}}>{n.sub}</div>}</div></div></React.Fragment>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};
/* Layers: stacked bands of an architecture, top layer first; chevrons between bands show the dependency direction */
export const Layers:React.FC<{title:string;layers:(It&{sub?:string})[];dir?:'down'|'up';note?:N}>=({title,layers,dir='down',note})=>{const {f}=useS();const nk=newest(f,layers.map(l=>l.at));
 return <Fill head={<Title s={title} one={layers.length>4}/>}>
  <div style={{display:'flex',flexDirection:'column'}}>{layers.map((l,k)=>{const vis=f>=l.at;const w=894-k*36;
   return <React.Fragment key={k}>
    {k>0&&<div style={{height:zg(46),display:'flex',justifyContent:'center',alignItems:'center',opacity:em(f,l.at,10),...hid(vis)}}>
     <svg width={60} height={30} viewBox="0 0 60 30"><path d={dir==='down'?'M8 6 30 24 52 6':'M8 24 30 6 52 24'} stroke={AT.dim} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
    <div {...vb('layer',vis)} style={{width:w,alignSelf:'center',...hid(vis),...card(vis&&k===nk,{padding:pad(40,34),display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,background:vis&&k===nk?AT.tint(.12):AT.card}),...enter(f,l.at,30)}}>
     <span style={B(zf(l.s,520,52,.5),AT.ink,800)}>{l.s}</span>{l.sub&&<span style={{...M(zf(l.sub,360,34,.62),AT.dim,600),textAlign:'right'}}>{l.sub}</span>}</div></React.Fragment>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};
/* Loop: lifecycle nodes on a ring (an ellipse that grows taller with the room), arcs draw clockwise as each node appears;
   `cur` moves the highlight around the loop later */
export const Loop:React.FC<{title:string;nodes:It[];center?:string;cur?:{i:number;at:number}[];note?:N}>=({title,nodes,center,cur,note})=>{const {f}=useS();const room=useRoom();
 const n=nodes.length,R=n>4?300:280,W=n>4?270:300,Hh=104,cx=447;
 const D=Math.max(700,Math.min(1060,room-titleH(title)-(note?170:0)-30));const cy=D/2,Ry=(n>4?R:R*.95)+(D-700)/2;
 const P=(i:number)=>{const a=-Math.PI/2+i*2*Math.PI/n;return {x:cx+R*Math.cos(a),y:cy+Ry*Math.sin(a)}};
 const cu=(cur??[]).filter(c=>f>=c.at).sort((x,y)=>x.at-y.at).pop();const act=cu?cu.i:newest(f,nodes.map(x=>x.at));
 const arc=(i:number)=>{const a0=-Math.PI/2+i*2*Math.PI/n+.36,a1=-Math.PI/2+(i+1)*2*Math.PI/n-.36,rx=R-6,ry=Ry-6;const p0={x:cx+rx*Math.cos(a0),y:cy+ry*Math.sin(a0)},p1={x:cx+rx*Math.cos(a1),y:cy+ry*Math.sin(a1)};return `M${p0.x} ${p0.y} A${rx} ${ry} 0 0 1 ${p1.x} ${p1.y}`};
 return <Fill head={<Title s={title}/>}>
  <div style={{position:'relative',height:D}}>
   <svg width={894} height={D} style={{position:'absolute',left:0,top:0}}>{nodes.map((nd,i)=>{const nx=nodes[(i+1)%n];const at=i+1<n?nx.at:Math.max(...nodes.map(x=>x.at))+12;const q=em(f,at-8,16);if(q<=0)return null;
    return <path key={i} d={arc(i)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1-q} stroke={act===(i+1)%n?AT.green:AT.dim} strokeWidth={6} fill="none" strokeLinecap="round" markerEnd={q>.98?'url(#lp-ah)':undefined}/>})}
    <defs><marker id="lp-ah" markerWidth={4} markerHeight={4} refX={2} refY={2} orient="auto"><path d="M0 0 4 2 0 4Z" fill={AT.dim}/></marker></defs></svg>
   {center&&<div {...bb('center')} style={{position:'absolute',left:cx-150,top:cy-40,width:300,textAlign:'center',...M(zf(center,280,40,.62),AT.dim,700),opacity:em(f,4,12)}}>{center}</div>}
   {nodes.map((nd,i)=>{if(f<nd.at)return null;const p=P(i);const on=i===act;
    return <div key={i} {...bb('step')} style={{position:'absolute',left:p.x-W/2,top:p.y-Hh/2,width:W,height:Hh,...card(on,{display:'flex',alignItems:'center',justifyContent:'center',padding:'0 18px',background:on?AT.green:AT.card}),...enter(f,nd.at,0)}}>
     <span style={{...B(fitSize(nd.s,W-40,46,.52),on?AT.onPrim:AT.ink,800),textAlign:'center'}}>{nd.s}</span></div>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};

/* ───────── debug ───────── */
/* Debug: error banner -> code card -> culprit line marked (bad) -> fix line typed below it as a diff (+) -> result banner.
   The code card reserves the fix row from the start (a blank row at the end), so the card does not grow when the fix lands. */
export const Debug:React.FC<{title:string;err:It;file?:string;lines:{s:string;kw?:string[]}[];codeAt?:number;bad:{line:number;at:number};fix:It;ok?:It;note?:N}>=({title,err,file='main.kt',lines,codeAt,bad,fix,ok,note})=>{const {f}=useS();
 const ca=codeAt??err.at+12;const lh=z(60);const bq=em(f,bad.at,12);const fq=interpolate(f,[fix.at,fix.at+14],[0,1],cl);const fx=f>=fix.at;
 const rows:{s:string;k:'n'|'bad'|'fix'|'pad'}[]=[];lines.forEach((l,i)=>{rows.push({s:l.s,k:i===bad.line?'bad':'n'});if(i===bad.line&&fx)rows.push({s:fix.s,k:'fix'})});if(!fx)rows.push({s:fix.s,k:'pad'});
 const ve=f>=err.at,vc=f>=ca,vo=!!ok&&f>=ok.at;const fs=Math.min(40,...[...lines.map(l=>l.s),fix.s].map(s=>fitSize(s,1120,40,.6)));
 return <Fill head={<Title s={title} one/>}>
  <div {...vb('error',ve)} style={{...hid(ve),...card(false,{padding:pad(22,28),display:'flex',gap:20,alignItems:'flex-start',border:`3px solid ${AT.err}`,background:AT.errBg}),...enter(f,err.at,-30)}}>
   <Glyph n="warn" s={z(50)} c={AT.err}/><span style={{...M(zf(err.s,1500,40,.62),AT.ink,600),wordBreak:'break-word'}}>{err.s}</span></div>
  <div {...vb('editor',vc)} style={{...hid(vc),marginTop:zg(30),...card(false,{overflow:'hidden',padding:0}),...enter(f,ca,40)}}>
   <div style={{padding:pad(16,28),background:AT.card2,borderBottom:`1.5px solid ${AT.line}`,...M(z(30),AT.ink,600)}}>{file}</div>
   <div style={{padding:`${z(16)} 0 ${z(20)}`}}>{rows.map((r,i)=>{const isBad=r.k==='bad'&&f>=bad.at;const src=r.k==='fix'?r.s.slice(0,Math.ceil(r.s.length*fq)):r.s;
    return <div key={i} style={{position:'relative',display:'flex',alignItems:'center',height:lh,...M(fs<40?`${fs}px`:z(40),AT.ink,500),whiteSpace:'pre',...hid(r.k!=='pad')}}>
     {isBad&&<span style={{position:'absolute',inset:0,background:fx?AT.errBg:AT.err+Math.round(41*bq).toString(16).padStart(2,'0'),borderLeft:`6px solid ${AT.err}`}}/>}
     {r.k==='fix'&&<span style={{position:'absolute',inset:0,background:AT.good+'26',borderLeft:`6px solid ${AT.good}`}}/>}
     <span style={{position:'relative',width:70,textAlign:'center',color:r.k==='fix'?AT.good:isBad?AT.err:AT.gut,fontSize:z(30),flex:'none'}}>{r.k==='fix'?'+':isBad&&fx?'−':isBad?'✗':''}</span>
     <span style={{position:'relative',textDecoration:isBad&&fx?'line-through':'none',opacity:isBad&&fx?.6:1}}>{kt(src)}</span></div>})}</div></div>
  {ok&&<div {...vb('result',vo)} style={{...hid(vo),marginTop:zg(30),...card(true,{padding:pad(24,28),display:'flex',gap:20,alignItems:'center',background:AT.good+'1A',border:`3px solid ${AT.good}`}),...enter(f,ok.at)}}>
   <span style={{width:z(60),height:z(60),borderRadius:AT.rp?999:0,background:AT.good,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}}><Tick s={36} c={AT.onGood}/></span>
   <span style={B(z(46),AT.ink,700)}>{ok.s}</span></div>}
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};

/* ───────── news ───────── */
/* Timeline: dated events down a rail; the rail grows event by event and the newest event is active */
export const EventTimeline:React.FC<{title:string;events:(It&{d:string})[];note?:N}>=({title,events,note})=>{const {f}=useS();const nk=newest(f,events.map(e=>e.at));
 const gap=zg(26),dot=z(47);
 return <Fill head={<Title s={title} one={events.length>3}/>}>
  <div style={{display:'flex',flexDirection:'column',gap,paddingLeft:70}}>{events.map((e,k)=>{const vis=f>=e.at;const on=vis&&k===nk;const nx=k+1<events.length&&f>=events[k+1].at;
   return <div key={k} style={{position:'relative',...hid(vis),...enter(f,e.at,0,40)}}>
    {k>0&&<span style={{position:'absolute',left:-48,top:`calc(-1 * ${gap})`,height:`calc(${gap} + ${dot})`,width:6,background:AT.line}}/>}
    {nx&&<span style={{position:'absolute',left:-48,top:dot,bottom:0,width:6,background:AT.line}}/>}
    <span style={{position:'absolute',left:-62,top:z(30),width:34,height:34,borderRadius:AT.rp?17:0,background:on?AT.green:AT.card,border:`5px solid ${on?AT.green:AT.dim}`,boxSizing:'border-box'}}/>
    <div {...vb('event',vis)} style={card(on,{padding:pad(22,28)})}>
     <div style={{...M(z(34),on?AT.green:AT.dim,800),marginBottom:6}}>{e.d}</div><div style={B(zf(e.s,1250,48,.5),AT.ink,700)}>{e.s}</div></div></div>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};
// news kicker: the theme's own kicker (number badge + rule) when the theme asks for it (pack.news), else a mono label
const Kick:React.FC<{n?:string;kick?:string}>=({n,kick})=>{const {f}=useS();if(!kick&&!n)return null;
 return AT.news?<div {...bb('kick')}><Kicker n={n??''} txt={kick??''}/></div>:<div {...bb('kick')} style={{...M(z(36),AT.dim,700),marginBottom:zg(30),...enter(f,0,20)}}>{kick}</div>};
const Broll:React.FC<{src:string;h:number;pos?:string;label?:string}>=({src,h,pos,label})=>{const {f}=useS();
 return <div {...bb('media')} style={{marginBottom:zg(26),...enter(f,2,30)}}><Media src={src} h={h} pos={pos} label={label}/></div>};
/* BigStat: one big number counts up (digits, , or . decimals, %, +), unit beside it, label under it, optional source line.
   news themes (pack.news): number on the accent bar like a headline. `tally` = evidence tiles (#01..#n) that get stamped one by one. */
export const BigStat:React.FC<{n?:string;kick?:string;media?:string;pos?:string;big:string;unit?:string;label?:string;at?:number;src?:string;sub?:N;tally?:{count:number;label:string;tag:string;start:number;every?:number}}>=({n,kick,media,pos,big,unit,label,at=6,src,sub,tally})=>{const {f}=useS();
 const m=/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/.exec(big);const q=em(f,at,26);
 const shown=m?(()=>{const dec=(m[2].split(/[.,]/)[1]||'').length;const v=parseFloat(m[2].replace(',','.'))*q;return m[1]+v.toFixed(dec).replace('.',m[2].includes(',')?',':'.')+m[3]})():big;
 const bs=Math.min(media||tally?220:320,fitSize(big,unit?600:860,320,HK()));const vs=!!sub&&f>=sub.at;
 return <Fill>
  <Kick n={n} kick={kick}/>{media&&<Broll src={media} h={tally?400:460} pos={pos}/>}
  <div {...bb('stat')} style={{display:'flex',alignItems:AT.news?'flex-end':'baseline',gap:24,...enter(f,at,40)}}>
   <span style={AT.news?{...HD(zf(big,unit?500:820,bs,HK()),AT.onPrim),background:AT.green,padding:'8px 24px 0',display:'inline-block',whiteSpace:'nowrap'}:{...HD(zf(big,unit?520:860,bs,HK()),AT.green),whiteSpace:'nowrap'}}>{shown}</span>{unit&&<span style={{...HD(zf(unit,330,Math.max(60,bs*(AT.news?.55:.36)),HK()),AT.ink),whiteSpace:'nowrap'}}>{unit}</span>}</div>
  {label&&<div {...bb('label')} style={{...B(zf(label,1500,64,.5),AT.ink,700),marginTop:zg(34),...enter(f,at+10,30)}}>{label}</div>}
  {tally&&<div {...bb('tally')} style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:10,marginTop:zg(26),...enter(f,at+6,30)}}>{Array.from({length:tally.count}).map((_,k)=>{const ta=tally.start+k*(tally.every??5);const s=f>=ta;
   return <div key={k} style={{height:z(150),border:`3px solid ${AT.ink}`,borderRadius:AT.r?12:0,position:'relative',background:s?AT.tint(.16):'transparent',transform:`rotate(${(random('t'+k)-.5)*4}deg)`}}>
    <div style={{...B(19,AT.dim,600),padding:6}}>{tally.label}</div><div style={{...HD(z(54),AT.ink),textAlign:'center'}}>#{String(k+1).padStart(2,'0')}</div>
    {s&&<div style={{position:'absolute',bottom:10,left:6,right:6,border:`3px solid ${AT.green}`,...HD(22,AT.green),textAlign:'center',transform:`rotate(-8deg) scale(${interpolate(f,[ta,ta+5],[1.6,1],cl)})`}}>{tally.tag}</div>}</div>})}</div>}
  {sub&&<div {...vb('sub',vs)} style={{...hid(vs),...B(z(44),AT.dim,500),marginTop:zg(30),...enter(f,sub.at,30)}}>{sub.s}</div>}
  {src&&<div {...bb('src')} style={{...M(z(30),AT.dim,500),marginTop:zg(44),opacity:em(f,at+18,12)}}>{src}</div>}</Fill>};
/* QuoteCard: the quote itself is the content; `hl` marks a phrase when it is spoken; attribution under it.
   `pull` = the original words set big (2nd one on the accent bar), `q` then reads as the translation under them.
   news themes (pack.news): no card, a big accent quote mark, newspaper kicker; other themes: a card. */
export const QuoteCard:React.FC<{n?:string;kick?:string;media?:string;pos?:string;pull?:string[];q:string;who:string;role?:string;at?:number;hl?:{w:string;at:number};kw?:string[]}>=({n,kick,media,pos,pull,q,who,role,at=4,hl})=>{const {f}=useS();
 const size=pull?40:q.length<70?66:q.length<130?56:46;const i=hl?q.toLowerCase().indexOf(hl.w.toLowerCase()):-1;const hq=hl?em(f,hl.at,12):0;const news=AT.news;
 const ps=pull?Math.min(170,...pull.map(w=>fitSize(w,news?740:800,170,HK()))):0;const qa=pull?at+20:at;
 const text=<div style={{...B(z(size),AT.ink,pull?500:700),lineHeight:1.28,marginTop:pull?zg(24):0,...(pull?enter(f,qa,24):{})}}>{i<0?q:<>{q.slice(0,i)}<span style={{background:`linear-gradient(${AT.tint(.35)},${AT.tint(.35)}) no-repeat left/${hq*100}% 100%`,boxShadow:hq>.5?`inset 0 -6px 0 ${AT.green}`:'none'}}>{q.slice(i,i+hl!.w.length)}</span>{q.slice(i+hl!.w.length)}</>}</div>;
 const words=pull&&<div style={{paddingTop:news?30:0}}>
  <div style={{...HD(z(ps),AT.ink),...enter(f,at,30)}}>{pull[0]}</div>
  {pull[1]&&<div style={{marginTop:10,...enter(f,at+6,30)}}><span style={{...HD(z(ps),AT.onPrim),background:AT.green,padding:AT.head==='Anton'?'6px 22px 0':'4px 22px',display:'inline-block',borderRadius:AT.r?18:0}}>{pull[1]}</span></div>}</div>;
 return <Fill>
  <Kick n={n} kick={kick}/>{media&&<Broll src={media} h={pull?460:380} pos={pos} label="ẢNH MINH HOẠ"/>}
  <div {...bb('quote')} style={news?{position:'relative',paddingLeft:120,marginTop:zg(40),...enter(f,at,40)}:{...card(false,{padding:`${z(40)} ${z(40)} ${z(44)}`,position:'relative'}),...enter(f,at,40)}}>
   <div style={news?{...HD(300,AT.green),position:'absolute',top:-60,left:-10,lineHeight:1}:{...HD(170,AT.green),height:96,lineHeight:1,marginTop:-6}}>“</div>
   {words}{text}</div>
  <div {...bb('who')} style={{display:'flex',alignItems:'center',gap:20,marginTop:zg(30),paddingLeft:news?120:0,...enter(f,qa+12,24)}}>
   <span style={{width:56,height:6,background:AT.green,flex:'none'}}/><div><div style={B(z(46),AT.ink,800)}>{who}</div>{role&&<div style={{...M(z(32),AT.dim,500),marginTop:4}}>{role}</div>}</div></div></Fill>};
/* legacy hot-news scene names (old scripts keep rendering): Quote -> QuoteCard (pull words + translation), Evidence -> BigStat (tally) */
export const QuoteLegacy:React.FC<{n:string;kick:string;media?:string;w1:string;w2:string;tr:string;who:string;role?:string}>=({n,kick,media,w1,w2,tr,who,role})=>
 <QuoteCard n={n} kick={kick} media={media} pull={[w1,w2]} q={tr} who={who} role={role} at={10}/>;
export const EvidenceLegacy:React.FC<{n:string;kick:string;media?:string;pos?:string;big:string;unit:string;count:number;label:string;tag:string;start:number;every?:number}>=({n,kick,media,pos,big,unit,count,label,tag,start,every})=>
 <BigStat n={n} kick={kick} media={media} pos={pos} big={big} unit={unit} at={8} tally={{count,label,tag,start,every}}/>;

/* ───────── tips / review ───────── */
type Side={s:string;lines?:string[];code?:boolean;at?:number;kw?:string[]};
/* BeforeAfter: "before" card, then the "after" card lands under it and the before card steps back (dimmed) */
export const BeforeAfter:React.FC<{title:string;before:Side;after:Side&{at:number};tags?:[string,string];note?:N}>=({title,before,after,tags=['Trước','Sau'],note})=>{const {f}=useS();
 const ba=before.at??4;const aq=em(f,after.at,14);
 const Card:React.FC<{sd:Side;good:boolean;tag:string;at:number}>=({sd,good,tag,at})=>{const vis=f>=at;return <div {...vb(good?'after':'before',vis)} style={{...hid(vis),...card(good,{padding:pad(26,30),border:`${good?3:2}px solid ${good?AT.good:AT.line}`,background:good?AT.good+'14':AT.card}),...enter(f,at,40),
   ...(good?{}:{opacity:em(f,at,10)*(1-.45*aq),transform:`scale(${1-.03*aq})`,transformOrigin:'center top'})}}>
   <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:sd.lines?.length?z(16):0}}>
    <span style={{...M(z(30),good?AT.onGood:AT.ink,800),background:good?AT.good:AT.errBg,border:good?'none':`1.5px solid ${AT.line}`,borderRadius:AT.rp,padding:'4px 18px',flex:'none'}}>{good?'✓':'✗'} {tag}</span>
    <span style={B(zf(sd.s,1100,48,.5),AT.ink,800)}>{sd.s}</span></div>
   {(sd.lines??[]).map((l,k)=><div key={k} style={sd.code?{...M(zf(l,1150,40,.6),AT.ink,500),whiteSpace:'pre',lineHeight:1.5}:{...B(z(44),good?AT.ink:AT.dim,500),marginTop:6}}>{sd.code?kt(l):'• '+l}</div>)}</div>};
 return <Fill head={<Title s={title} one/>}>
  <div style={{display:'flex',flexDirection:'column',gap:zg(34)}}><Card sd={before} good={false} tag={tags[0]} at={ba}/><Card sd={after} good tag={tags[1]} at={after.at}/></div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};
const STAR='M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.3l-5.8 3.1 1.2-6.5L2.6 9.4l6.5-.8z';
/* Rating: one row per item, stars (own glyph) fill in sequence, score readout v/max; optional verdict */
export const Rating:React.FC<{title:string;items:(It&{v:number})[];max?:number;verdict?:N}>=({title,items,max=5,verdict})=>{const {f}=useS();const nk=newest(f,items.map(x=>x.at));const vv=!!verdict&&f>=verdict.at;
 return <Fill head={<Title s={title} one={items.length>3}/>}>
  <div style={{display:'flex',flexDirection:'column',gap:zg(24)}}>{items.map((it,k)=>{const vis=f>=it.at;
   return <div key={k} {...vb('rate',vis)} style={{...hid(vis),...card(vis&&k===nk,{padding:pad(24,28)}),...enter(f,it.at,0,-40)}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:16}}><span style={B(zf(it.s,600,50,.5),AT.ink,800)}>{it.s}</span>
     <span style={{...M(z(44),AT.green,800),whiteSpace:'nowrap'}}>{(it.v*em(f,it.at+4,4+max*4)).toFixed(it.v%1?1:0)}<span style={{color:AT.dim,fontSize:z(32)}}>/{max}</span></span></div>
    <div style={{display:'flex',gap:10,marginTop:z(12)}}>{Array.from({length:max},(_,j)=>{const fill=Math.max(0,Math.min(1,it.v-j))*em(f,it.at+4+j*4,8);
     return <svg key={j} viewBox="0 0 24 24" style={{width:z(58),height:z(58)}}><defs><clipPath id={`rc${k}-${j}`}><rect x={0} y={0} width={24*fill} height={24}/></clipPath></defs>
      <path d={STAR} fill="none" stroke={AT.dim} strokeWidth={1.6} strokeLinejoin="round"/><path d={STAR} fill={AT.green} clipPath={`url(#rc${k}-${j})`}/></svg>})}</div></div>})}</div>
  {verdict&&<div {...vb('verdict',vv)} style={{...hid(vv),marginTop:zg(34),...card(true,{padding:pad(24,28),display:'flex',gap:18,alignItems:'center'}),...enter(f,verdict.at)}}><Glyph n="check" s={z(50)}/><span style={B(z(46),AT.ink,800)}>{verdict.s}</span></div>}</Fill>};
/* TopN: ranked list; countdown (default) shows the last rank first so #1 lands last; #1 badge in accent */
export const TopN:React.FC<{title:string;items:(It&{sub?:string})[];countdown?:boolean;note?:N}>=({title,items,countdown=true,note})=>{const {f}=useS();const n=items.length;const nk=newest(f,items.map(x=>x.at));
 return <Fill head={<Title s={title} one={n>3}/>}>
  <div style={{display:'flex',flexDirection:'column',gap:zg(22)}}>{items.map((it,k)=>{const vis=f>=it.at;const rank=countdown?n-k:k+1;const top=rank===1;
   return <div key={k} {...vb('rank',vis)} style={{...hid(vis),...card(vis&&k===nk,{padding:pad(20,26),display:'flex',alignItems:'center',gap:26}),...enter(f,it.at,40)}}>
    <span style={{...HD(z(68),top?AT.onPrim:AT.ink),flex:'none',width:z(112),height:z(112),display:'flex',alignItems:'center',justifyContent:'center',borderRadius:AT.r?24:0,background:top?AT.green:AT.card2,border:top?'none':`2px solid ${AT.line}`}}>#{rank}</span>
    <div style={{minWidth:0}}><div style={B(zf(it.s,1150,50,.5),AT.ink,800)}>{it.s}</div>{it.sub&&<div style={{...B(z(38),AT.dim,500),marginTop:6}}>{it.sub}</div>}</div></div>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};
