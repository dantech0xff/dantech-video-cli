// Scenario packs: theme-agnostic scene types (compare / setup / concept / debug / news / tips-review).
// Colours, fonts and corner radius come from the live palette AT (android.tsx setPal(theme)): android-tutor keeps its exact
// Studio Dark values, every other theme derives them from its look. Content lives in the 894-wide design canvas (x 136..847
// on the frame, y 340..~1359), reel floors: body >= 44, mono >= 38, labels >= 30 (canvas px, x0.795 on the frame).
// Motion: Material 3 emphasized-decelerate (.05,.7,.1,1) entries, no overshoot, no full-screen zoom/pop.
// Every content box carries data-bb (bbcheck); every item with text has `s` (or `d`/`q`) so `kw` and autofill focus can target it.
import React from 'react';import {interpolate,Easing} from 'remotion';
import {useS} from './sys';import {fitSize} from './brand';
import {AT,bb,fonts,Title,Note,Tick,kt} from './android';import {GLYPH} from './overlay';
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const EMD=Easing.bezier(.05,.7,.1,1);
const em=(f:number,at:number,d=14)=>interpolate(f,[at,at+d],[0,1],{...cl,easing:EMD});
const enter=(f:number,at:number,dy=44,dx=0):React.CSSProperties=>{const q=em(f,at,16);return {opacity:em(f,at,10),transform:`translate(${(1-q)*dx}px,${(1-q)*dy}px)`}};
const B=(size:number,c=AT.ink,w=600):React.CSSProperties=>({fontFamily:fonts().sans,fontWeight:w,fontSize:size,color:c,lineHeight:1.22});
const M=(size:number,c=AT.ink,w=600):React.CSSProperties=>({fontFamily:fonts().mono,fontWeight:w,fontSize:size,color:c,lineHeight:1.25});
const HD=(size:number,c=AT.ink):React.CSSProperties=>({fontFamily:AT.head,fontWeight:AT.hw,fontSize:size,color:c,textTransform:AT.up?'uppercase':'none',lineHeight:1.02,letterSpacing:AT.head==='Anton'?0:-1});
const HK=()=>AT.head==='Anton'?.47:AT.head==='JBM'||AT.head==='BVPX'||AT.head==='BVPM'?.62:.55; // head glyph width / size
const card=(on:boolean,extra:React.CSSProperties={}):React.CSSProperties=>({background:on?AT.tint(.10):AT.card,border:`${on?3:2}px solid ${on?AT.green:AT.line}`,borderRadius:AT.r,boxSizing:'border-box',...extra});
const Glyph:React.FC<{n?:string;s?:number;c?:string}>=({n,s=44,c=AT.green})=>n&&GLYPH[n]?<svg width={s} height={s} viewBox="0 0 24 24" style={{flex:'none'}}><path d={GLYPH[n]} stroke={c} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>:null;
// newest shown item (not yet superseded) is "active"
const newest=(f:number,ats:number[])=>{let k=-1;ats.forEach((a,i)=>{if(f>=a&&(k<0||a>=ats[k]))k=i});return k};
type It={s:string;at:number;kw?:string[]};
type N={s:string;at:number}|undefined;

/* ───────── compare ───────── */
/* Meter: labelled bars fill to v (0..100) with an emphasized ease; `best` bar in accent, others neutral; `val` replaces the % readout */
export const Meter:React.FC<{title:string;bars:(It&{v:number;val?:string;best?:boolean})[];note?:N}>=({title,bars,note})=>{const {f}=useS();const nk=newest(f,bars.map(b=>b.at));
 return <div><Title s={title} one={bars.length>3}/>
  <div style={{display:'flex',flexDirection:'column',gap:34}}>{bars.map((b,k)=>{if(f<b.at)return null;const q=em(f,b.at+4,24);const v=Math.max(0,Math.min(100,b.v));
   return <div key={k} {...bb('bar')} style={{...enter(f,b.at,0,-40),...card(k===nk&&!b.best,{padding:'24px 28px',background:k===nk?AT.tint(.06):'transparent',border:`2px solid ${k===nk?AT.green:'transparent'}`})}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:20,marginBottom:14}}>
     <span style={B(fitSize(b.s,560,50,.5),AT.ink,700)}>{b.s}</span>
     <span style={{...M(46,b.best?AT.green:AT.ink,800),whiteSpace:'nowrap'}}>{b.val?<span style={{opacity:q}}>{b.val}</span>:`${Math.round(v*q)}%`}</span></div>
    <div style={{height:34,borderRadius:AT.rp,background:AT.card2,border:`1.5px solid ${AT.line}`,overflow:'hidden'}}>
     <div style={{height:'100%',width:`${v*q}%`,background:b.best?AT.green:AT.dim,borderRadius:AT.rp}}/></div></div>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</div>};
/* Scale: two pans on a beam; the beam tilts toward the heavier side (w) at tiltAt, verdict pill under the stand */
export const Scale:React.FC<{title:string;a:It&{w:number;sub?:string};b:It&{w:number;sub?:string};tiltAt?:number;verdict?:N}>=({title,a,b,tiltAt,verdict})=>{const {f}=useS();
 const ta=tiltAt??Math.max(a.at,b.at)+10;const tq=em(f,ta,26);const dir=Math.sign(b.w-a.w);const ang=Math.min(12,Math.abs(b.w-a.w)*4+6)*dir*tq;// deg, + = right side down
 const L=290,cx=447,py=120;const rad=ang*Math.PI/180;const ex=(s:number)=>({x:cx+s*L*Math.cos(rad),y:py+s*L*Math.sin(rad)});const pa=ex(-1),pb=ex(1);
 const heavy=dir>0?'b':dir<0?'a':'';
 const Pan:React.FC<{p:{x:number;y:number};it:It&{sub?:string};side:'a'|'b'}>=({p,it,side})=>{if(f<it.at)return null;const on=tq>.6&&heavy===side;
  return <><div style={{position:'absolute',left:p.x-1.5,top:p.y,width:3,height:56,background:AT.dim,opacity:em(f,it.at,10)}}/>
   <div {...bb('pan-'+side)} style={{position:'absolute',left:p.x-160,top:p.y+56,width:320,...card(on,{padding:'24px 22px',textAlign:'center'}),...enter(f,it.at,-30)}}>
    <div style={B(fitSize(it.s,270,52,.52),AT.ink,800)}>{it.s}</div>{it.sub&&<div style={{...B(36,AT.dim,500),marginTop:8}}>{it.sub}</div>}</div></>};
 return <div><Title s={title}/>
  <div style={{position:'relative',height:640}}>
   <div style={{position:'absolute',left:cx-9,top:py,width:18,height:470,background:AT.line,borderRadius:9}}/>
   <div style={{position:'absolute',left:cx-130,top:py+460,width:260,height:20,background:AT.line,borderRadius:AT.r?10:0}}/>
   <div style={{position:'absolute',left:cx-L-10,top:py-7,width:2*L+20,height:14,background:AT.dim,borderRadius:7,transform:`rotate(${ang}deg)`,transformOrigin:'center center'}}/>
   <div style={{position:'absolute',left:cx-18,top:py-18,width:36,height:36,borderRadius:18,background:AT.green}}/>
   <Pan p={pa} it={a} side="a"/><Pan p={pb} it={b} side="b"/></div>
  {verdict&&f>=verdict.at&&<div {...bb('verdict')} style={{...card(true,{padding:'26px 30px',display:'flex',gap:20,alignItems:'center',marginTop:10}),...enter(f,verdict.at)}}>
   <Glyph n="check" s={52}/><span style={B(48,AT.ink,800)}>{verdict.s}</span></div>}</div>};

/* ───────── concept ───────── */
/* DataFlow: vertical chain of nodes (reel friendly); the arrow into node k lights up and a packet travels down when node k appears.
   `via` labels the arrow into a node, `icon` is a glyph from the overlay set. */
export const DataFlow:React.FC<{title:string;nodes:(It&{sub?:string;via?:string;icon?:string})[];note?:N}>=({title,nodes,note})=>{const {f}=useS();const nk=newest(f,nodes.map(n=>n.at));const comp=nodes.length>4;
 return <div><Title s={title} one={comp}/>
  <div style={{display:'flex',flexDirection:'column'}}>{nodes.map((n,k)=>{if(f<n.at)return null;const pq=em(f,n.at-10,14);
   return <React.Fragment key={k}>
    {k>0&&<div style={{position:'relative',height:comp?64:80,marginLeft:70}}>
     <div style={{position:'absolute',left:0,top:0,bottom:16,width:6,borderRadius:3,background:pq>.95?AT.green:AT.line}}/>
     <div style={{position:'absolute',left:-12,bottom:0,width:0,height:0,borderLeft:'15px solid transparent',borderRight:'15px solid transparent',borderTop:`18px solid ${pq>.95?AT.green:AT.line}`}}/>
     {pq>0&&pq<1&&<div style={{position:'absolute',left:-9,top:pq*(comp?40:56),width:24,height:24,borderRadius:12,background:AT.green}}/>}
     {n.via&&<span style={{position:'absolute',left:38,top:'50%',transform:'translateY(-50%)',...M(32,AT.dim,600),whiteSpace:'nowrap',opacity:em(f,n.at-6,10)}}>{n.via}</span>}</div>}
    <div {...bb('node')} style={{...card(k===nk,{padding:comp?'20px 28px':'26px 30px',display:'flex',alignItems:'center',gap:22}),...enter(f,n.at,30)}}>
     {n.icon&&<Glyph n={n.icon} s={52}/>}<div style={{minWidth:0}}><div style={B(fitSize(n.s,1300,52,.5),AT.ink,800)}>{n.s}</div>
     {n.sub&&<div style={{...B(38,AT.dim,500),marginTop:6}}>{n.sub}</div>}</div></div></React.Fragment>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</div>};
/* Layers: stacked bands of an architecture, top layer first; chevrons between bands show the dependency direction */
export const Layers:React.FC<{title:string;layers:(It&{sub?:string})[];dir?:'down'|'up';note?:N}>=({title,layers,dir='down',note})=>{const {f}=useS();const nk=newest(f,layers.map(l=>l.at));
 return <div><Title s={title} one={layers.length>4}/>
  <div style={{display:'flex',flexDirection:'column'}}>{layers.map((l,k)=>{if(f<l.at)return null;const w=894-k*36;
   return <React.Fragment key={k}>
    {k>0&&<div style={{height:46,display:'flex',justifyContent:'center',alignItems:'center',opacity:em(f,l.at,10)}}>
     <svg width={60} height={30} viewBox="0 0 60 30"><path d={dir==='down'?'M8 6 30 24 52 6':'M8 24 30 6 52 24'} stroke={AT.dim} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
    <div {...bb('layer')} style={{width:w,alignSelf:'center',...card(k===nk,{padding:'40px 34px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,background:k===nk?AT.tint(.12):AT.card}),...enter(f,l.at,30)}}>
     <span style={B(fitSize(l.s,520,52,.5),AT.ink,800)}>{l.s}</span>{l.sub&&<span style={{...M(fitSize(l.sub,360,34,.62),AT.dim,600),textAlign:'right'}}>{l.sub}</span>}</div></React.Fragment>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</div>};
/* Loop: lifecycle nodes on a ring, arcs draw clockwise as each node appears; `cur` moves the highlight around the loop later */
export const Loop:React.FC<{title:string;nodes:It[];center?:string;cur?:{i:number;at:number}[];note?:N}>=({title,nodes,center,cur,note})=>{const {f}=useS();
 const n=nodes.length,R=n>4?300:280,cx=447,cy=360,W=n>4?270:300,Hh=104;const P=(i:number)=>{const a=-Math.PI/2+i*2*Math.PI/n;return {x:cx+R*Math.cos(a),y:cy+R*Math.sin(a)*(n>4?1:.95)}};
 const cu=(cur??[]).filter(c=>f>=c.at).sort((x,y)=>x.at-y.at).pop();const act=cu?cu.i:newest(f,nodes.map(x=>x.at));
 const arc=(i:number)=>{const a0=-Math.PI/2+i*2*Math.PI/n+.36,a1=-Math.PI/2+(i+1)*2*Math.PI/n-.36,r=R-6;const p0={x:cx+r*Math.cos(a0),y:cy+r*Math.sin(a0)},p1={x:cx+r*Math.cos(a1),y:cy+r*Math.sin(a1)};return `M${p0.x} ${p0.y} A${r} ${r} 0 0 1 ${p1.x} ${p1.y}`};
 return <div><Title s={title}/>
  <div style={{position:'relative',height:2*cy-20}}>
   <svg width={894} height={2*cy} style={{position:'absolute',left:0,top:0}}>{nodes.map((nd,i)=>{const nx=nodes[(i+1)%n];const at=i+1<n?nx.at:Math.max(...nodes.map(x=>x.at))+12;const q=em(f,at-8,16);if(q<=0)return null;
    return <path key={i} d={arc(i)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1-q} stroke={act===(i+1)%n?AT.green:AT.dim} strokeWidth={6} fill="none" strokeLinecap="round" markerEnd={q>.98?'url(#lp-ah)':undefined}/>})}
    <defs><marker id="lp-ah" markerWidth={4} markerHeight={4} refX={2} refY={2} orient="auto"><path d="M0 0 4 2 0 4Z" fill={AT.dim}/></marker></defs></svg>
   {center&&<div {...bb('center')} style={{position:'absolute',left:cx-150,top:cy-40,width:300,textAlign:'center',...M(fitSize(center,280,40,.62),AT.dim,700),opacity:em(f,4,12)}}>{center}</div>}
   {nodes.map((nd,i)=>{if(f<nd.at)return null;const p=P(i);const on=i===act;
    return <div key={i} {...bb('step')} style={{position:'absolute',left:p.x-W/2,top:p.y-Hh/2,width:W,height:Hh,...card(on,{display:'flex',alignItems:'center',justifyContent:'center',padding:'0 18px',background:on?AT.green:AT.card}),...enter(f,nd.at,0)}}>
     <span style={{...B(fitSize(nd.s,W-40,46,.52),on?AT.onPrim:AT.ink,800),textAlign:'center'}}>{nd.s}</span></div>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</div>};

/* ───────── debug ───────── */
/* Debug: error banner -> code card -> culprit line marked (bad) -> fix line typed below it as a diff (+) -> result banner */
export const Debug:React.FC<{title:string;err:It;file?:string;lines:{s:string;kw?:string[]}[];codeAt?:number;bad:{line:number;at:number};fix:It;ok?:It;note?:N}>=({title,err,file='main.kt',lines,codeAt,bad,fix,ok,note})=>{const {f}=useS();
 const ca=codeAt??err.at+12;const lh=60;const bq=em(f,bad.at,12);const fq=interpolate(f,[fix.at,fix.at+14],[0,1],cl);const fx=f>=fix.at;
 const rows:{s:string;k:'n'|'bad'|'fix'}[]=[];lines.forEach((l,i)=>{rows.push({s:l.s,k:i===bad.line?'bad':'n'});if(i===bad.line&&fx)rows.push({s:fix.s,k:'fix'})});
 return <div><Title s={title} one/>
  {f>=err.at&&<div {...bb('error')} style={{...card(false,{padding:'22px 28px',display:'flex',gap:20,alignItems:'flex-start',border:`3px solid ${AT.err}`,background:AT.errBg}),...enter(f,err.at,-30)}}>
   <Glyph n="warn" s={50} c={AT.err}/><span style={{...M(fitSize(err.s,1500,40,.62),AT.ink,600),wordBreak:'break-word'}}>{err.s}</span></div>}
  {f>=ca&&<div {...bb('editor')} style={{marginTop:30,...card(false,{overflow:'hidden',padding:0}),...enter(f,ca,40)}}>
   <div style={{padding:'16px 28px',background:AT.card2,borderBottom:`1.5px solid ${AT.line}`,...M(30,AT.ink,600)}}>{file}</div>
   <div style={{padding:'16px 0 20px'}}>{rows.map((r,i)=>{const isBad=r.k==='bad'&&f>=bad.at;const src=r.k==='fix'?r.s.slice(0,Math.ceil(r.s.length*fq)):r.s;
    return <div key={i} style={{position:'relative',display:'flex',alignItems:'center',height:lh,...M(fitSize(r.s,1120,40,.6),AT.ink,500),whiteSpace:'pre'}}>
     {isBad&&<span style={{position:'absolute',inset:0,background:fx?AT.errBg:`rgba(247,84,100,${.16*bq})`,borderLeft:`6px solid ${AT.err}`}}/>}
     {r.k==='fix'&&<span style={{position:'absolute',inset:0,background:AT.good+'26',borderLeft:`6px solid ${AT.good}`}}/>}
     <span style={{position:'relative',width:70,textAlign:'center',color:r.k==='fix'?AT.good:isBad?AT.err:AT.gut,fontSize:30,flex:'none'}}>{r.k==='fix'?'+':isBad&&fx?'−':isBad?'✗':''}</span>
     <span style={{position:'relative',textDecoration:isBad&&fx?'line-through':'none',opacity:isBad&&fx?.6:1}}>{kt(src)}</span></div>})}</div></div>}
  {ok&&f>=ok.at&&<div {...bb('result')} style={{marginTop:30,...card(true,{padding:'24px 28px',display:'flex',gap:20,alignItems:'center',background:AT.good+'1A',border:`3px solid ${AT.good}`}),...enter(f,ok.at)}}>
   <span style={{width:60,height:60,borderRadius:AT.rp?30:0,background:AT.good,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}}><Tick s={36} c={AT.onGood}/></span>
   <span style={B(46,AT.ink,700)}>{ok.s}</span></div>}
  {note&&<Note s={note.s} at={note.at}/>}</div>};

/* ───────── news ───────── */
/* Timeline: dated events down a rail; the rail grows and the newest event is active */
export const EventTimeline:React.FC<{title:string;events:(It&{d:string})[];note?:N}>=({title,events,note})=>{const {f}=useS();const nk=newest(f,events.map(e=>e.at));
 return <div><Title s={title} one={events.length>3}/>
  <div style={{position:'relative',paddingLeft:70}}>
   <div style={{position:'absolute',left:22,top:20,bottom:20,width:6,borderRadius:3,background:AT.line}}/>
   <div style={{display:'flex',flexDirection:'column',gap:26}}>{events.map((e,k)=>{if(f<e.at)return null;const on=k===nk;
    return <div key={k} style={{position:'relative',...enter(f,e.at,0,40)}}>
     <span style={{position:'absolute',left:-62,top:30,width:34,height:34,borderRadius:AT.rp?17:0,background:on?AT.green:AT.card,border:`5px solid ${on?AT.green:AT.dim}`,boxSizing:'border-box'}}/>
     <div {...bb('event')} style={card(on,{padding:'22px 28px'})}>
      <div style={{...M(34,on?AT.green:AT.dim,800),marginBottom:6}}>{e.d}</div><div style={B(fitSize(e.s,1250,48,.5),AT.ink,700)}>{e.s}</div></div></div>})}</div></div>
  {note&&<Note s={note.s} at={note.at}/>}</div>};
/* BigStat: one big number counts up (digits, , or . decimals, %, +), unit beside it, label under it, optional source line */
export const BigStat:React.FC<{kick?:string;big:string;unit?:string;label:string;at?:number;src?:string;sub?:N}>=({kick,big,unit,label,at=6,src,sub})=>{const {f}=useS();
 const m=/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/.exec(big);const q=em(f,at,26);
 const shown=m?(()=>{const dec=(m[2].split(/[.,]/)[1]||'').length;const v=parseFloat(m[2].replace(',','.'))*q;return m[1]+v.toFixed(dec).replace('.',m[2].includes(',')?',':'.')+m[3]})():big;
 const bs=Math.min(320,fitSize(big,unit?600:860,320,HK()));
 return <div style={{paddingTop:40}}>
  {kick&&<div {...bb('kick')} style={{...M(36,AT.dim,700),marginBottom:30,...enter(f,0,20)}}>{kick}</div>}
  <div {...bb('stat')} style={{display:'flex',alignItems:'baseline',gap:24,flexWrap:'wrap',...enter(f,at,40)}}>
   <span style={HD(bs,AT.green)}>{shown}</span>{unit&&<span style={HD(Math.max(60,bs*.36),AT.ink)}>{unit}</span>}</div>
  <div {...bb('label')} style={{...B(fitSize(label,1500,64,.5),AT.ink,700),marginTop:34,...enter(f,at+10,30)}}>{label}</div>
  {sub&&f>=sub.at&&<div {...bb('sub')} style={{...B(44,AT.dim,500),marginTop:30,...enter(f,sub.at,30)}}>{sub.s}</div>}
  {src&&<div {...bb('src')} style={{...M(30,AT.dim,500),marginTop:44,opacity:em(f,at+18,12)}}>{src}</div>}</div>};
/* QuoteCard: the quote itself is the content; `hl` marks a phrase when it is spoken; attribution under it */
export const QuoteCard:React.FC<{q:string;who:string;role?:string;at?:number;hl?:{w:string;at:number};kw?:string[]}>=({q,who,role,at=4,hl})=>{const {f}=useS();
 const size=q.length<70?66:q.length<130?56:46;const i=hl?q.toLowerCase().indexOf(hl.w.toLowerCase()):-1;const hq=hl?em(f,hl.at,12):0;
 return <div style={{paddingTop:30}}>
  <div {...bb('quote')} style={{...card(false,{padding:'40px 40px 44px',position:'relative'}),...enter(f,at,40)}}>
   <div style={{...HD(170,AT.green),height:96,lineHeight:1,marginTop:-6}}>“</div>
   <div style={{...B(size,AT.ink,700),lineHeight:1.28}}>{i<0?q:<>{q.slice(0,i)}<span style={{background:`linear-gradient(${AT.tint(.35)},${AT.tint(.35)}) no-repeat left/${hq*100}% 100%`,boxShadow:hq>.5?`inset 0 -6px 0 ${AT.green}`:'none'}}>{q.slice(i,i+hl!.w.length)}</span>{q.slice(i+hl!.w.length)}</>}</div></div>
  <div {...bb('who')} style={{display:'flex',alignItems:'center',gap:20,marginTop:30,...enter(f,at+12,24)}}>
   <span style={{width:56,height:6,background:AT.green,flex:'none'}}/><div><div style={B(46,AT.ink,800)}>{who}</div>{role&&<div style={{...M(32,AT.dim,500),marginTop:4}}>{role}</div>}</div></div></div>};

/* ───────── tips / review ───────── */
type Side={s:string;lines?:string[];code?:boolean;at?:number;kw?:string[]};
/* BeforeAfter: "before" card, then the "after" card lands under it and the before card steps back (dimmed) */
export const BeforeAfter:React.FC<{title:string;before:Side;after:Side&{at:number};tags?:[string,string];note?:N}>=({title,before,after,tags=['Trước','Sau'],note})=>{const {f}=useS();
 const ba=before.at??4;const aq=em(f,after.at,14);
 const Card:React.FC<{sd:Side;good:boolean;tag:string;at:number}>=({sd,good,tag,at})=>f<at?null:<div {...bb(good?'after':'before')} style={{...card(good,{padding:'26px 30px',border:`${good?3:2}px solid ${good?AT.good:AT.line}`,background:good?AT.good+'14':AT.card}),...enter(f,at,40),
   ...(good?{}:{opacity:em(f,at,10)*(1-.45*aq),transform:`scale(${1-.03*aq})`,transformOrigin:'center top'})}}>
   <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:sd.lines?.length?16:0}}>
    <span style={{...M(30,good?AT.onGood:AT.ink,800),background:good?AT.good:AT.errBg,border:good?'none':`1.5px solid ${AT.line}`,borderRadius:AT.rp,padding:'4px 18px',flex:'none'}}>{good?'✓':'✗'} {tag}</span>
    <span style={B(fitSize(sd.s,1100,48,.5),AT.ink,800)}>{sd.s}</span></div>
   {(sd.lines??[]).map((l,k)=><div key={k} style={sd.code?{...M(fitSize(l,1150,40,.6),AT.ink,500),whiteSpace:'pre',lineHeight:1.5}:{...B(44,good?AT.ink:AT.dim,500),marginTop:6}}>{sd.code?kt(l):'• '+l}</div>)}</div>;
 return <div><Title s={title} one/>
  <div style={{display:'flex',flexDirection:'column',gap:34}}><Card sd={before} good={false} tag={tags[0]} at={ba}/><Card sd={after} good tag={tags[1]} at={after.at}/></div>
  {note&&<Note s={note.s} at={note.at}/>}</div>};
const STAR='M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.3l-5.8 3.1 1.2-6.5L2.6 9.4l6.5-.8z';
/* Rating: one row per item, stars (own glyph) fill in sequence, score readout v/max; optional verdict */
export const Rating:React.FC<{title:string;items:(It&{v:number})[];max?:number;verdict?:N}>=({title,items,max=5,verdict})=>{const {f}=useS();const nk=newest(f,items.map(x=>x.at));
 return <div><Title s={title} one={items.length>3}/>
  <div style={{display:'flex',flexDirection:'column',gap:24}}>{items.map((it,k)=>{if(f<it.at)return null;
   return <div key={k} {...bb('rate')} style={{...card(k===nk,{padding:'24px 28px'}),...enter(f,it.at,0,-40)}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:16}}><span style={B(fitSize(it.s,600,50,.5),AT.ink,800)}>{it.s}</span>
     <span style={{...M(44,AT.green,800),whiteSpace:'nowrap'}}>{(it.v*em(f,it.at+4,4+max*4)).toFixed(it.v%1?1:0)}<span style={{color:AT.dim,fontSize:32}}>/{max}</span></span></div>
    <div style={{display:'flex',gap:10,marginTop:12}}>{Array.from({length:max},(_,j)=>{const fill=Math.max(0,Math.min(1,it.v-j))*em(f,it.at+4+j*4,8);
     return <svg key={j} width={58} height={58} viewBox="0 0 24 24"><defs><clipPath id={`rc${k}-${j}`}><rect x={0} y={0} width={24*fill} height={24}/></clipPath></defs>
      <path d={STAR} fill="none" stroke={AT.dim} strokeWidth={1.6} strokeLinejoin="round"/><path d={STAR} fill={AT.green} clipPath={`url(#rc${k}-${j})`}/></svg>})}</div></div>})}</div>
  {verdict&&f>=verdict.at&&<div {...bb('verdict')} style={{marginTop:34,...card(true,{padding:'24px 28px',display:'flex',gap:18,alignItems:'center'}),...enter(f,verdict.at)}}><Glyph n="check" s={50}/><span style={B(46,AT.ink,800)}>{verdict.s}</span></div>}</div>};
/* TopN: ranked list; countdown (default) shows the last rank first so #1 lands last; #1 badge in accent */
export const TopN:React.FC<{title:string;items:(It&{sub?:string})[];countdown?:boolean;note?:N}>=({title,items,countdown=true,note})=>{const {f}=useS();const n=items.length;const nk=newest(f,items.map(x=>x.at));
 return <div><Title s={title} one={n>3}/>
  <div style={{display:'flex',flexDirection:'column',gap:22}}>{items.map((it,k)=>{if(f<it.at)return null;const rank=countdown?n-k:k+1;const top=rank===1;
   return <div key={k} {...bb('rank')} style={{...card(k===nk,{padding:'20px 26px',display:'flex',alignItems:'center',gap:26}),...enter(f,it.at,40)}}>
    <span style={{...HD(68,top?AT.onPrim:AT.ink),flex:'none',width:112,height:112,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:AT.r?24:0,background:top?AT.green:AT.card2,border:top?'none':`2px solid ${AT.line}`}}>#{rank}</span>
    <div style={{minWidth:0}}><div style={B(fitSize(it.s,1150,50,.5),AT.ink,800)}>{it.s}</div>{it.sub&&<div style={{...B(38,AT.dim,500),marginTop:6}}>{it.sub}</div>}</div></div>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</div>};
