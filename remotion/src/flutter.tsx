// flutter-tutor (FLUTTER TUTOR): Flutter-dev explainer. "Layered Blue + Hero".
// Near-black navy bg #050A14 with stepped navy surfaces, exact official Flutter palette (flutter.dev/brand: Navy #042B59,
// Blue #0553B1, Sky #027DFD; logomark blue #54C5F8 as 2nd accent), nested widget cards (Scaffold → Column → Text) that
// light up when they rebuild, Dart code card, stat pair. Motion = Flutter implicit animations (Curves.fastOutSlowIn,
// ~300 ms, no overshoot). Scene transition = Hero (`hero`, sys.tsx): the key-term chip flies on a gentle arc
// (MaterialRectArcTween-like) to its slot in the next scene while the rest cross-fades. No full-screen zoom/pop shapes.
// Legal: official Flutter logomark only, unaltered (assets/brand/flutter, see README there), small, kept apart; ™ on the
// first prominent "Flutter"; trademark disclaimer on the end card; no Dash.
import React from 'react';import {AbsoluteFill,Audio,Img,Sequence,staticFile,interpolate,useCurrentFrame,Easing} from 'remotion';
import {useS,FONTS} from './sys';import {useBrand,fitSize,BrandTile,Handle} from './brand';import {SZ} from './safezone';
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const FT={bg:'#050A14',card:'#0A1424',card2:'#0F1B30',card3:'#14243F',panel:'#081120',line:'#1A2B47',dim:'#8FA3BF',ink:'#EEF3FA',
 navy:'#042B59',blue:'#0553B1',sky:'#027DFD',sky2:'#54C5F8',
 kw:'#A8C7FA',ty:'#54C5F8',fn:'#FFF275',str:'#1CDAC5',num:'#F25D50',pun:'#8FA3BF',cmt:'#5E7391',prop:'#C9D6E8'};
const SANS='GSF',MONO='GSC';
export const bb=(n:string)=>({'data-bb':n} as any);
// Flutter Curves.fastOutSlowIn = cubic(0.4, 0.0, 0.2, 1.0); implicit animations default ~300 ms (9 frames)
export const FOSI=Easing.bezier(.4,0,.2,1);
export const ease=(f:number,at:number,dur=9)=>interpolate(f,[at,at+dur],[0,1],{...cl,easing:FOSI});
/* ---------- Hero chip: same geometry in the scene and in the flying overlay (sys.tsx) ----------
   GSC is monospaced (advance = 0.6 em), so the chip width is exact: chars * 0.6 * fs + 2 * padX. */
export type HeroBox={x:number;y:number;w:number;h:number;fs:number;r:number};
export const heroBox=(big:boolean,txt:string):HeroBox=>{const padX=big?34:20;let fs=big?96:40;const h=big?132:64;
 let w=txt.length*.6*fs+2*padX;if(w>894){fs=(894-2*padX)/(txt.length*.6);w=894}return {x:0,y:big?96:0,w,h,fs,r:big?30:18}};
// absolute 1080x1920 rect of a hero box (scene canvas is scaled into the safe content box)
export const heroAbs=(b:HeroBox)=>{const S=SZ.content.scale;return {x:SZ.content.x+b.x*S,y:SZ.content.y+b.y*S,w:b.w*S,h:b.h*S,fs:b.fs*S,r:b.r*S}};
export const HERO_BIG=new Set(['FlHook']);
export const HeroChip:React.FC<{txt:string;big?:boolean}>=({txt,big=false})=>{const {hx}=useS() as any;const b=heroBox(big,txt);
 return <div {...bb('hero')} style={{position:'absolute',left:b.x,top:b.y,width:b.w,height:b.h,borderRadius:b.r,background:FT.sky,display:'flex',alignItems:'center',justifyContent:'center',
  fontFamily:MONO,fontWeight:700,fontSize:b.fs,color:'#FFFFFF',whiteSpace:'nowrap',opacity:hx?0:1}}>{txt}</div>};
/* the flying chip drawn by Timeline during a `hero` transition (absolute coords) */
export const HeroFlight:React.FC<{a:{txt:string;big:boolean};b:{txt:string;big:boolean};p:number}>=({a,b,p})=>{const A=heroAbs(heroBox(a.big,a.txt)),B=heroAbs(heroBox(b.big,b.txt));
 const e=FOSI(p);const L=(u:number,v:number)=>u+(v-u)*e;
 // gentle arc: the centre bows sideways by ~14% of the travel distance at mid-flight (MaterialRectArcTween-like), no overshoot
 const ax=A.x+A.w/2,ay=A.y+A.h/2,bx=B.x+B.w/2,by=B.y+B.h/2;const dx=bx-ax,dy=by-ay;const d=Math.hypot(dx,dy)||1;const bow=.14*d*Math.sin(Math.PI*e);
 const cx=L(ax,bx)+(-dy/d)*bow,cy=L(ay,by)+(dx/d)*bow;const w=L(A.w,B.w),h=L(A.h,B.h),fs=L(A.fs,B.fs),r=L(A.r,B.r);const same=a.txt===b.txt;
 const txt=(s:string,o:number)=><span style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',opacity:o}}>{s}</span>;
 return <div style={{position:'absolute',left:cx-w/2,top:cy-h/2,width:w,height:h,borderRadius:r,background:FT.sky,zIndex:10,fontFamily:MONO,fontWeight:700,fontSize:fs,color:'#FFFFFF',whiteSpace:'nowrap',
  boxShadow:`0 ${18*Math.sin(Math.PI*e)}px ${40*Math.sin(Math.PI*e)}px rgba(2,125,253,${.25*Math.sin(Math.PI*e)})`}}>
  {same?txt(a.txt,1):<>{txt(a.txt,interpolate(e,[0,.55],[1,0],cl))}{txt(b.txt,interpolate(e,[.45,1],[0,1],cl))}</>}</div>};
/* ---------- mid-ground: parallel brand-blue bands, slow slide + angle + corner radius (global frame, never jump) ----------
   All bands share ONE direction, so they can never form the Flutter "F"/chevron (which needs two crossing directions). */
const osc=(g:number,sec:number,ph=0)=>Math.sin(2*Math.PI*(g/30/sec)+ph);
export const FlBands:React.FC=()=>{const g=useCurrentFrame();const ang=-36+5*osc(g,27);
 const band=(k:number,cx:number,cy:number,L:number,W:number,fill:string,stroke?:string,sec=19)=>{const sl=70*osc(g,sec,k);const r=Math.max(6,W/2*(.25+.7*(.5+.5*osc(g,13+k*4,k*2))));
  const ux=Math.cos(ang*Math.PI/180),uy=Math.sin(ang*Math.PI/180);
  return <rect key={k} x={-L/2} y={-W/2} width={L} height={W} rx={r} fill={fill} stroke={stroke??'none'} strokeWidth={stroke?3:0}
   transform={`translate(${cx+ux*sl} ${cy+uy*sl}) rotate(${ang})`}/>};
 return <svg width={1080} height={1920} style={{position:'absolute',left:0,top:0,pointerEvents:'none'}}>
  {band(0,1010,330,760,150,'rgba(5,83,177,.08)',undefined,23)}
  {band(1,1060,520,520,96,'rgba(2,125,253,.05)','rgba(2,125,253,.14)',17)}
  {band(2,60,1560,820,170,'rgba(5,83,177,.075)',undefined,21)}
  {band(3,150,1770,480,84,'rgba(84,197,248,.04)','rgba(84,197,248,.12)',15)}
 </svg>};
/* official logomark, unaltered (only scaled / faded as one piece). Clear space is the caller's job: nothing within one "F" height. */
export const FlutterMark:React.FC<{h:number;style?:React.CSSProperties}>=({h,style})=><Img src={staticFile('brand/flutter/flutter_logomark.svg')} style={{height:h,width:h*300/371.43,display:'block',...style}}/>;
/* Dart syntax colours (upright) */
const KW=/^(final|var|const|void|class|extends|return|if|else|import|late|new|this|super|true|false|null|static|await|async|required|int|double|bool|String|List|Map)$/;
export const dart=(line:string)=>{const c=line.indexOf('//');const code=c>=0?line.slice(0,c):line,cm=c>=0?line.slice(c):'';
 const toks=code.split(/('[^']*'|\b\d+\b|[A-Za-z_$][\w$]*|\s+|.)/).filter(x=>x!=='');
 const out=toks.map((w,k)=>{const nx=toks.slice(k+1).find(x=>!/^\s+$/.test(x));
  const col=/^'/.test(w)?FT.str:/^\d+$/.test(w)?FT.num:/^(int|double|bool|String|List|Map)$/.test(w)?FT.ty:KW.test(w)?FT.kw:/^[A-Z]/.test(w)?FT.ty:/^[a-z_]\w*$/.test(w)&&nx==='('?FT.fn:/^[a-z_]\w*$/.test(w)&&nx===':'?FT.prop:/^[(){}<>\[\],:;=.+>]$/.test(w)?FT.pun:FT.ink;
  return <span key={k} style={{color:col}}>{w}</span>});
 if(cm)out.push(<span key="c" style={{color:FT.cmt}}>{cm}</span>);return out};
const mono=(size=26,c=FT.dim,w=500):React.CSSProperties=>({fontFamily:MONO,fontSize:size,color:c,fontWeight:w});
const In:React.FC<{at:number;dy?:number;children:React.ReactNode;style?:React.CSSProperties;bbn?:string}>=({at,dy=24,children,style,bbn})=>{const {f}=useS();const p=ease(f,at);
 return <div {...(bbn?bb(bbn):{})} style={{opacity:p,transform:`translateY(${(1-p)*dy}px)`,...style}}>{children}</div>};
const Title:React.FC<{s:string;at?:number;size?:number}>=({s,at=2,size=62})=><In at={at} bbn="title" style={{position:'absolute',left:0,top:96,width:894,whiteSpace:'nowrap',fontFamily:SANS,fontWeight:800,fontSize:fitSize(s,894,size,.56),lineHeight:1.12,color:FT.ink,letterSpacing:-.5}}>{s}</In>;
/* 1. hook: big hero chip (term A) at frame 0, "vs B", claim line, why, stacked widget cards */
export const FlHook:React.FC<{hero:string;tag:string;vs:string;line:string;why?:{s:string;at:number};lit?:number}>=({hero,tag,vs,line,why,lit})=>{const {f}=useS();
 const L=lit!=null?ease(f,lit,8):0;const pulse=lit!=null&&f>=lit?Math.exp(-(f-lit)/14):0;
 return <div style={{position:'relative',height:1320}}>
  <div {...bb('tag')} style={{position:'absolute',left:0,top:4,display:'flex',alignItems:'center',gap:14,fontFamily:SANS,fontWeight:500,fontSize:32,color:FT.dim}}><span style={{width:14,height:14,borderRadius:7,background:FT.sky}}/>{tag}</div>
  <div {...bb('logo')} style={{position:'absolute',right:0,top:-4}}><FlutterMark h={78}/></div>
  <HeroChip txt={hero} big/>
  <div {...bb('vs')} style={{position:'absolute',left:0,top:256,display:'flex',alignItems:'baseline',gap:22,whiteSpace:'nowrap'}}>
   <span style={{fontFamily:SANS,fontWeight:800,fontSize:62,color:FT.dim}}>vs</span><span style={{fontFamily:MONO,fontWeight:700,fontSize:fitSize(vs,760,84,.6),color:FT.ink}}>{vs}</span></div>
  <div {...bb('line')} style={{position:'absolute',left:0,top:378,width:894,fontFamily:SANS,fontWeight:800,fontSize:68,lineHeight:1.14,color:FT.ink,letterSpacing:-.5}}>{line}</div>
  {why&&<In at={why.at} bbn="why" style={{position:'absolute',left:0,top:580,width:894,display:'flex',gap:20,alignItems:'flex-start'}}>
   <span style={{width:10,height:104,borderRadius:5,background:FT.sky,flex:'none'}}/><span style={{fontFamily:SANS,fontWeight:500,fontSize:46,lineHeight:1.18,color:FT.ink}}>{why.s}</span></In>}
  {/* stacked widget cards, DOM-nested (Scaffold ⊃ Column ⊃ Text) so they read as layered planes */}
  <In at={6} dy={40} bbn="stack" style={{position:'absolute',left:0,top:770,width:894,height:470}}>
   <div style={{position:'absolute',inset:0,borderRadius:30,background:FT.navy,padding:'24px 30px',boxSizing:'border-box'}}>
    <span style={mono(30,'#FFFFFF',700)}>Scaffold</span>
    <div style={{position:'absolute',left:70,right:0,top:96,bottom:0,borderRadius:30,background:FT.blue,padding:'24px 30px',boxSizing:'border-box'}}>
     <span style={mono(30,'#FFFFFF',700)}>Column</span>
     <div style={{position:'absolute',left:70,right:0,top:96,bottom:0,borderRadius:30,background:FT.sky,padding:'24px 30px',boxSizing:'border-box',
      boxShadow:`0 0 0 ${6*pulse}px rgba(84,197,248,${.6*pulse}), 0 0 ${60*L}px rgba(84,197,248,${.35*L})`}}>
      <span style={mono(30,'#FFFFFF',700)}>Text  'Đã bấm 3'</span>
      <div style={{marginTop:22,fontFamily:SANS,fontWeight:800,fontSize:36,color:'#FFFFFF',opacity:L}}>chỉ con số này đổi</div></div></div></div>
  </In>
 </div>};
/* nested widget boxes (Widget Inspector layout feel). A box rebuilds -> sky border + glow + build() badge, staggered by depth */
type Node={w:string;d?:string;kids?:Node[];re?:boolean;h?:number;fab?:boolean};
const Box:React.FC<{n:Node;depth:number;flash:number[];stag:number;count:number}>=({n,depth,flash,stag,count})=>{const {f}=useS();
 const last=n.re?[...flash].reverse().find(x=>f>=x+depth*stag):undefined;const q=last!=null?Math.exp(-(f-last-depth*stag)/12):0;const seen=n.re&&flash.some(x=>f>=x+depth*stag);
 const fill=n.kids?(depth===0?FT.navy:depth===1?'#06306A':FT.card2):FT.card2; // depth tint: Navy → Navy/Blue mix → surface
 const label=n.w.replace('{n}',String(count));
 return <div {...bb('w-'+n.w.split(' ')[0])} style={{position:'relative',borderRadius:22,background:fill,border:`3px solid ${seen?`rgba(2,125,253,${.55+.45*q})`:FT.line}`,
  boxShadow:q>0?`0 0 ${36*q}px rgba(2,125,253,${.55*q}) inset`:'none',padding:n.kids?'14px 18px 18px':'0 22px',height:n.kids?undefined:(n.h??80),
  display:'flex',flexDirection:n.kids?'column':'row',alignItems:n.kids?'stretch':'center',gap:n.kids?14:0,alignSelf:n.fab?'flex-end':'stretch',width:n.fab?600:undefined,boxSizing:'border-box'}}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:n.kids?40:undefined,flex:n.kids?undefined:1}}>
   <span style={{...mono(28,FT.ink,700),whiteSpace:'nowrap'}}>{label}{n.d&&<span style={{color:FT.dim,fontWeight:500}}>  {n.d}</span>}</span>
   <span style={{...mono(22,'#FFFFFF',700),background:FT.sky,borderRadius:999,padding:'4px 14px',opacity:seen?1:0,transform:`scale(${seen?1+.08*q:1})`}}>build()</span></div>
  {n.kids?.map((k,i)=><Box key={i} n={k} depth={depth+1} flash={flash} stag={stag} count={count}/>)}</div>};
export const FlTree:React.FC<{hero:string;title:string;mode:'setState'|'notifier';taps:number[];readout:{k:string;at:number};note?:{s:string;at:number}}>=({hero,title,mode,taps,readout,note})=>{const {f}=useS();
 const all=mode==='setState';const n=3+taps.filter(x=>f>=x).length;
 const cnt:Node=mode==='notifier'?{w:'ValueListenableBuilder',re:true,kids:[{w:"Text 'Đã bấm {n}'",re:true}]}:{w:"Text 'Đã bấm {n}'",re:true};
 const tree:Node={w:'Scaffold',re:all,kids:[{w:'AppBar',re:all},{w:'Column',re:all,kids:[{w:"Text 'Bộ đếm'",re:all},{w:'ListView',d:'50 item',re:all,h:110},cnt]},{w:'FloatingActionButton',re:all,fab:true}]};
 const rebuilt=all?7:1;const shown=taps.some(x=>f>=x);const p=ease(f,4,10);
 return <div style={{position:'relative',height:1320}}><HeroChip txt={hero}/><Title s={title}/>
  <div style={{position:'absolute',left:0,top:196,width:894,opacity:p,transform:`translateY(${(1-p)*30}px)`}}><Box n={tree} depth={0} flash={taps} stag={2} count={n}/></div>
  <In at={readout.at} bbn="readout" style={{position:'absolute',left:0,top:1010,display:'flex',alignItems:'baseline',gap:20}}>
   <span style={{fontFamily:SANS,fontWeight:800,fontSize:96,color:all?FT.ink:FT.sky2,lineHeight:1}}>{shown?rebuilt:0}</span>
   <span style={{fontFamily:SANS,fontWeight:500,fontSize:42,color:FT.dim}}>{readout.k}</span></In>
  {note&&<In at={note.at} bbn="note" style={{position:'absolute',left:0,top:1140,width:894,fontFamily:SANS,fontWeight:500,fontSize:40,lineHeight:1.25,color:FT.ink,borderLeft:`8px solid ${FT.sky}`,paddingLeft:24,boxSizing:'border-box'}}>{note.s}</In>}
 </div>};
/* 3. Dart code card: tab, gutter, typed lines, rebuild-boundary outline around hl lines, note */
export const FlCode:React.FC<{hero:string;title:string;file:string;lines:{s:string;at:number}[];hl?:{from:number;to:number;at:number;label?:string};note?:{s:string;at:number}}>=({hero,title,file,lines,hl,note})=>{const {f}=useS();
 const fs=30,lh=50;const p=ease(f,3,10);const top=196,head=62,pad=18;const hp=hl?ease(f,hl.at,9):0;const xb=hl?.label&&hl.to>=lines.length-1?46:0; // room for the label under a last-line highlight
 return <div style={{position:'relative',height:1320}}><HeroChip txt={hero}/><Title s={title}/>
  <div {...bb('editor')} style={{position:'absolute',left:0,top,width:894,background:FT.card,border:`2px solid ${FT.line}`,borderRadius:28,overflow:'hidden',opacity:p,transform:`translateY(${(1-p)*30}px)`}}>
   <div style={{height:head,display:'flex',alignItems:'flex-end',gap:26,padding:'0 26px',background:FT.card2,borderBottom:`2px solid ${FT.line}`}}>
    <span style={{...mono(24,FT.ink),padding:'0 4px 14px',borderBottom:`3px solid ${FT.sky}`}}>{file}</span></div>
   <div style={{position:'relative',padding:`${pad}px 0 ${pad+6+xb}px`}}>
    {hl&&<div style={{position:'absolute',left:12,right:12,top:pad+hl.from*lh-6,height:(hl.to-hl.from+1)*lh+12,borderRadius:18,border:`3px solid ${FT.sky}`,background:`rgba(2,125,253,${.1*hp})`,opacity:hp}}>
     {hl.label&&<span style={{position:'absolute',right:-3,top:'calc(100% + 6px)',...mono(22,'#FFFFFF',700),background:FT.sky,borderRadius:999,padding:'4px 14px'}}>{hl.label}</span>}</div>}
    {lines.map((l,k)=>{const q=interpolate(f,[l.at,l.at+10],[0,1],cl);const src=l.s.replace(/^\\@/,'@');const shown=src.slice(0,Math.ceil(src.length*q));
     return <div key={k} style={{position:'relative',display:'flex',height:lh,alignItems:'center',fontFamily:MONO,fontWeight:500,fontSize:fs,whiteSpace:'pre'}}>
      <span style={{width:66,textAlign:'right',paddingRight:22,fontSize:22,color:q>0?'#5E7391':'#2A3B57'}}>{k+1}</span>{dart(shown)}</div>})}</div></div>
  {note&&<In at={note.at} bbn="note" style={{position:'absolute',left:0,top:top+head+2*pad+6+xb+lines.length*lh+40,width:894,background:FT.card2,borderRadius:26,padding:'24px 28px',boxSizing:'border-box',display:'flex',gap:20,alignItems:'center'}}>
   <span style={{flex:'none',width:52,height:52,borderRadius:16,background:FT.sky,color:'#FFFFFF',fontFamily:SANS,fontWeight:800,fontSize:30,display:'flex',alignItems:'center',justifyContent:'center'}}>i</span>
   <span style={{fontFamily:SANS,fontWeight:500,fontSize:44,lineHeight:1.25,color:FT.ink}}>{note.s}</span></In>}
 </div>};
/* 4. stat pair: two numbers that count up, B card in navy with sky border */
export const FlStat:React.FC<{hero:string;title:string;a:{k:string;v:number;unit:string;at:number};b:{k:string;v:number;unit:string;at:number};note?:{s:string;at:number}}>=({hero,title,a,b,note})=>{const {f}=useS();
 const card=(x:typeof a,main:boolean)=>{const p=ease(f,x.at,10);const v=Math.round(x.v*interpolate(f,[x.at,x.at+14],[0,1],{...cl,easing:FOSI}));
  return <div {...bb(main?'stat-b':'stat-a')} style={{flex:1,height:420,borderRadius:32,padding:'34px 34px',boxSizing:'border-box',background:main?FT.navy:FT.card2,border:`3px solid ${main?FT.sky:FT.line}`,
   opacity:p,transform:`translateY(${(1-p)*40}px)`,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
   <span style={{...mono(fitSize(x.k,360,34,.6),main?FT.sky2:FT.dim,700),whiteSpace:'nowrap'}}>{x.k}</span>
   <span style={{fontFamily:SANS,fontWeight:800,fontSize:200,lineHeight:1,color:main?'#FFFFFF':FT.ink}}>{v}</span>
   <span style={{fontFamily:SANS,fontWeight:500,fontSize:36,color:main?FT.sky2:FT.dim}}>{x.unit}</span></div>};
 return <div style={{position:'relative',height:1320}}><HeroChip txt={hero}/><Title s={title}/>
  <div style={{position:'absolute',left:0,top:200,width:894,display:'flex',gap:34}}>{card(a,false)}{card(b,true)}</div>
  {note&&<In at={note.at} bbn="note" style={{position:'absolute',left:0,top:680,width:894,fontFamily:SANS,fontWeight:500,fontSize:40,lineHeight:1.25,color:FT.dim,borderLeft:`8px solid ${FT.sky}`,paddingLeft:24,boxSizing:'border-box'}}>{note.s}</In>}
 </div>};
/* 5. takeaway rows (case → pick) + rule; content stays above design y ~1060 so the Follow CTA (abs y 1150) never overlaps */
export const FlTake:React.FC<{hero:string;title:string;rows:{k:string;v:string;at:number}[];rule?:{s:string;at:number}}>=({hero,title,rows,rule})=>{const {f}=useS();
 return <div style={{position:'relative',height:1320}}><HeroChip txt={hero}/><Title s={title}/>
  <div style={{position:'absolute',left:0,top:200,width:894,display:'flex',flexDirection:'column',gap:20}}>{rows.map((r,k)=>{const p=ease(f,r.at,10);if(f<r.at)return <div key={k} style={{height:132}}/>;
   return <div key={k} {...bb('row')} style={{height:132,display:'flex',alignItems:'center',gap:20,background:FT.card,border:`2px solid ${FT.line}`,borderRadius:28,padding:'0 26px',boxSizing:'border-box',opacity:p,transform:`translateX(${(1-p)*50}px)`}}>
    <span style={{flex:1,fontFamily:SANS,fontWeight:500,fontSize:40,lineHeight:1.15,color:FT.ink}}>{r.k}</span>
    <span style={{flex:'none',...mono(fitSize(r.v,330,36,.6),'#FFFFFF',700),background:k%2?FT.blue:FT.sky,borderRadius:999,padding:'14px 24px',whiteSpace:'nowrap'}}>{r.v}</span></div>})}</div>
  {rule&&<In at={rule.at} bbn="rule" style={{position:'absolute',left:0,top:200+rows.length*152+20,width:894,background:FT.navy,border:`3px solid ${FT.sky}`,borderRadius:30,padding:'26px 30px',boxSizing:'border-box',
   fontFamily:SANS,fontWeight:800,fontSize:44,lineHeight:1.22,color:'#FFFFFF'}}>{rule.s}</In>}
 </div>};
/* chrome: bands, brand + page (baseline), section breadcrumb (all above y 250) */
export const FlChrome:React.FC<{section:string;page:string}>=({section,page})=>{const B=useBrand();return <>
 <FlBands/>
 <div {...bb('brand')} style={{position:'absolute',left:136,right:50,top:84,display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
  <span style={{fontFamily:SANS,fontWeight:800,fontSize:fitSize(B.wordmark,560,48,.68),lineHeight:1,color:FT.ink,letterSpacing:1,whiteSpace:'nowrap'}}>{B.wordmark}</span>
  <span style={{...mono(26),lineHeight:1}}>{page}</span></div>
 <div {...bb('crumb')} style={{position:'absolute',left:136,right:50,top:168,height:52,display:'flex',alignItems:'center',gap:14,borderBottom:`2px solid ${FT.line}`,paddingBottom:6,boxSizing:'border-box'}}>
  <span style={{width:12,height:12,borderRadius:6,background:FT.sky}}/><span style={{...mono(24,FT.ink),whiteSpace:'nowrap'}}>{section}</span></div></>};
const PN:Record<string,string>={youtube:'YouTube',facebook:'Facebook',tiktok:'TikTok'};
/* end card: logomark (clear space), kicker, tagline, name, 3 handle tiles, trademark disclaimer. Ends above y 1480. */
export const FlEndCard:React.FC<{dur?:number;handles?:Handle[];tagline?:string}>=({dur=90,handles,tagline=''})=>{const f=useCurrentFrame();const B=useBrand();handles=handles??B.handles;
 const op=(at:number)=>ease(f,at,9);const out=interpolate(f,[dur-10,dur],[1,0],cl);const ein=ease(f,0,12);
 return <AbsoluteFill data-layer="end" style={{zIndex:40,opacity:out}}><style>{FONTS}</style>
  <AbsoluteFill style={{background:FT.bg,opacity:interpolate(f,[0,8],[0,1],cl)}}/>
  <div style={{opacity:interpolate(f,[0,8],[0,1],cl)}}><FlBands/></div>
  <div style={{position:'absolute',left:SZ.end.x,right:SZ.end.right,top:420,opacity:ein,transform:`translateY(${30*(1-ein)}px)`}}>
   <div {...bb('e-logo')} style={{width:56,opacity:op(4)}}><FlutterMark h={70}/></div>
   <div {...bb('e-kick')} style={{display:'table',fontFamily:SANS,fontWeight:500,fontSize:46,color:FT.dim,marginTop:56,opacity:op(8)}}>Theo dõi để học</div>
   <div {...bb('e-tag')} style={{display:'table',fontFamily:SANS,fontWeight:800,fontSize:fitSize(tagline,724,92,.56),color:FT.ink,lineHeight:1.1,whiteSpace:'nowrap',opacity:op(10)}}>{tagline}</div>
   <div {...bb('e-name')} style={{display:'table',fontFamily:SANS,fontWeight:800,fontSize:fitSize(B.name,724,44,.6),color:FT.sky2,marginTop:10,opacity:op(14),whiteSpace:'nowrap'}}>{B.name}</div>
   <div style={{marginTop:44,display:'flex',flexDirection:'column',gap:18}}>{handles.map((h,k)=>{const q=op(18+k*4);return <div key={k} {...bb('e-handle')} style={{display:'flex',alignItems:'center',gap:26,background:FT.card2,border:`2px solid ${FT.line}`,borderRadius:26,padding:'14px 32px 14px 16px',opacity:q,transform:`translateY(${(1-q)*24}px)`}}>
    <BrandTile icon={h.icon} size={68} radius={18}/><span style={{fontFamily:SANS,fontWeight:500,fontSize:30,color:FT.dim,width:150}}>{PN[h.icon??'']??h.p}</span>
    <span style={{flex:1,textAlign:'right',fontFamily:SANS,fontWeight:800,fontSize:fitSize(h.h,330,44,.58),color:FT.ink,whiteSpace:'nowrap'}}>{h.h}</span></div>})}</div>
   <div {...bb('e-legal')} style={{marginTop:40,fontFamily:SANS,fontWeight:500,fontSize:21,lineHeight:1.4,color:FT.dim,opacity:op(28)}}>Flutter and the related logo are trademarks of Google LLC. We are not endorsed by or affiliated with Google LLC.</div>
  </div>
  <Sequence from={4}><Audio src={staticFile('sfx/outro_sting.wav')} volume={0.55}/></Sequence>
 </AbsoluteFill>};
