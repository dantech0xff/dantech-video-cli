// duoly (Duoly in Love, client fanpage): everyday love of couples, 18–28, gentle + slightly witty, never cheesy.
// Look = A + B (Dan, 18/10/2026):
//  A. soft pink pastel plate (cover style "soft": #FFF6F4 -> #FBE3E1 + blush/peach glows, thin outline hearts only in the
//     margins) with glossy 3D ring-hearts / puffy hearts floating gently in the no-text bands (top y<290, bottom y>=1500).
//     Plates + sprites are pre-rendered by tools/duoly-3d (three.js headless, same construction as the logo: white + peach rings
//     interlocked into a heart). Plates are 1296x2304 and only drift (translate, look.plateScale 1.03); sprites are drawn at or
//     below their native size. Everything decorative is data-deco (static gate ignores it).
//  B. content told through chat bubbles and stickers: generic bubbles (no phone frame, no status bar, no input field, no
//     avatars: must never read as a specific app's UI), white cards with soft pink shadows, die-cut stickers.
// Brand rules (Duoly Social Manager): no app mention / UI / download CTA / links; end card = logo + "Duoly in Love" only.
// Colour roles: raspberry #D80B46 titles, hot pink #E72055 accent (active caption chip, my bubble, badges), coral #F35570,
// peach #F78E78 (second side / price tags), blush #F7C4C1 + shell #FBE6E4 (soft fills), wine #5B1F33 body text (theme ink).
// Type: Be Vietnam Pro ExtraBold titles (BVPX), Medium body (BVPM), SemiBold labels (BVPS). Full Vietnamese glyphs.
// Motion: gentle expo-out rises (~530 ms), option cards "pop" = fade + 26 px rise + scale .96 -> 1, never overshoot, no zoom.
import React from 'react';import {AbsoluteFill,Audio,Img,Sequence,staticFile,interpolate,useCurrentFrame,Easing} from 'remotion';
import {useS,FONTS,HeadLine} from './sys';import {useBrand,fitSize,Handle} from './brand';import {SZ} from './safezone';
import {BrandText} from './brandmark';import {Fill,z,zg,hid,useRoom} from './fill';
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const DL={bg:'#FFF6F4',bg2:'#FBE3E1',rasp:'#D80B46',pink:'#E72055',coral:'#F35570',peach:'#F78E78',peachInk:'#C3093F',blush:'#F7C4C1',shell:'#FBE6E4',
 white:'#FFFFFF',ink:'#5B1F33',mute:'#9A6170',soft:'#C77D8C',line:'rgba(216,11,70,.12)',grad:'linear-gradient(135deg,#F35570 0%,#E72055 55%,#D80B46 100%)',
 pinkT:(a:number)=>`rgba(231,32,85,${a})`,raspT:(a:number)=>`rgba(216,11,70,${a})`};
const bb=(n:string)=>({'data-bb':n} as any);
export const DEO=Easing.bezier(.22,1,.36,1);
const ease=(f:number,at:number,d=16)=>interpolate(f,[at,at+d],[0,1],{...cl,easing:DEO});
const osc=(g:number,sec:number,ph=0)=>Math.sin(2*Math.PI*(g/30/sec)+ph);
const HX=(size:number|string,c=DL.rasp):React.CSSProperties=>({fontFamily:'BVPX',fontSize:size,color:c,lineHeight:1.14,letterSpacing:-1,textWrap:'balance'} as any);
const BM=(size:number|string,c=DL.ink):React.CSSProperties=>({fontFamily:'BVPM',fontSize:size,color:c,lineHeight:1.3,textWrap:'pretty'} as any);
const LB=(size:number|string,c=DL.coral):React.CSSProperties=>({fontFamily:'BVPS',fontSize:size,color:c,lineHeight:1.15,letterSpacing:'.02em',whiteSpace:'nowrap'});
export const card=(x:React.CSSProperties={}):React.CSSProperties=>({background:DL.white,borderRadius:40,boxShadow:'0 22px 50px rgba(216,11,70,.10), 0 4px 12px rgba(216,11,70,.05)',border:'1.5px solid rgba(243,85,112,.10)',boxSizing:'border-box',position:'relative',...x});
const tex=(k:string)=>staticFile(`textures/duoly/${k}.png`);
const In:React.FC<{at:number;dy?:number;sc?:boolean;children:React.ReactNode;style?:React.CSSProperties;n?:string;origin?:string}>=({at,dy=26,sc,children,style,n,origin='left center'})=>{const {f}=useS();const p=ease(f,at);
 return <div {...(n&&p>0?bb(n):{})} style={{opacity:p,transform:`translateY(${(1-p)*dy}px)${sc?` scale(${.96+.04*p})`:''}`,transformOrigin:origin,...style}}>{children}</div>};
/* ---------- glyphs (own, simple, rounded) ---------- */
const HEART='M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.2c2.1-.2 3.9 1 5.4 2.9 1.5-1.9 3.3-3.1 5.4-2.9 3.7.3 5.7 4.2 4.2 7.6C19.5 16.4 12 21 12 21z';
export const Heart:React.FC<{s:number|string;c?:string;line?:boolean;w?:number}>=({s,c=DL.pink,line,w=1.8})=><svg viewBox="0 0 24 24" width={s} height={s} style={{display:'block',flex:'none',overflow:'visible'}}><path d={HEART} fill={line?'none':c} stroke={line?c:'none'} strokeWidth={w} strokeLinejoin="round"/></svg>;
const G:Record<string,string>={
 chat:'M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5z',
 gift:'M3.5 9h17v4h-17zM5 13h14v8H5zM12 9v12M12 9c-1.5-3.8-6-4.6-6-1.8C6 9 12 9 12 9zm0 0c1.5-3.8 6-4.6 6-1.8C18 9 12 9 12 9z',
 pin:'M12 22s-7-7.2-7-12.2A7 7 0 0 1 19 9.8C19 14.8 12 22 12 22z',
 clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
};
const Gl:React.FC<{k:string;s:number|string;c?:string;fill?:boolean;w?:number}>=({k,s,c=DL.pink,fill,w=1.8})=><svg viewBox="0 0 24 24" width={s} height={s} style={{display:'block',flex:'none'}}><path d={G[k]} fill={fill?c:'none'} stroke={fill?'none':c} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round"/></svg>;
/* 4-point sparkle */
const Sparkle:React.FC<{s:number;c?:string}>=({s,c='#FFFFFF'})=><svg viewBox="0 0 24 24" width={s} height={s} style={{display:'block'}}><path d="M12 1.5c.7 5.4 3.1 7.8 8.5 8.5-5.4.7-7.8 3.1-8.5 8.5-.7-5.4-3.1-7.8-8.5-8.5 5.4-.7 7.8-3.1 8.5-8.5z" fill={c} stroke={DL.pink} strokeWidth={1.2} strokeLinejoin="round"/></svg>;
/* ---------- stickers: glossy 3D sprites (tools/duoly-3d) + flat die-cut stickers (white outline, soft shadow). All data-deco. ---------- */
export type St={k:'heart'|'peach'|'white'|'coral'|'ring'|'sparkle'|'line'|'chat'|'gift';x:number;y:number;s?:number;at?:number;r?:number};
const SPR:Record<string,string>={heart:'puffy_pink',peach:'puffy_peach',white:'puffy_white',coral:'puffy_coral',ring:'ring_a'};
const DIE='drop-shadow(0 0 0 #fff) drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(0 10px 14px rgba(216,11,70,.18))';
export const Sticker:React.FC<St&{g?:number}>=({k,x,y,s=110,at=0,r=0})=>{const {f}=useS();const g=useCurrentFrame();const p=ease(f,at,14);if(p<=0)return null;
 const bob=6*osc(g,4.2,x*.01),rot=r+3*osc(g,5.6,y*.01);
 const body=SPR[k]?<Img src={tex(SPR[k])} style={{width:s,height:'auto',display:'block',filter:'drop-shadow(0 12px 16px rgba(216,11,70,.16))'}}/>
  :k==='sparkle'?<div style={{filter:'drop-shadow(0 6px 10px rgba(216,11,70,.18))'}}><Sparkle s={s}/></div>
  :<div style={{width:s,height:s,borderRadius:k==='line'?0:s*.3,display:'flex',alignItems:'center',justifyContent:'center',filter:DIE,background:k==='line'?'transparent':DL.white}}>
    {k==='line'?<Heart s={s} c={DL.coral} line w={2.2}/>:k==='chat'?<div style={{position:'relative'}}><Gl k="chat" s={s*.7} c={DL.pink} fill/><div style={{position:'absolute',left:'50%',top:'44%',transform:'translate(-50%,-50%)'}}><Heart s={s*.26} c="#fff"/></div></div>:<Gl k="gift" s={s*.66} c={DL.pink} w={2}/>}</div>;
 return <div data-deco="sticker" style={{position:'absolute',left:Math.max(-20,Math.min(894-s*.6,x)),top:Math.max(0,y),opacity:p,transform:`translateY(${(1-p)*18+bob}px) rotate(${rot}deg) scale(${.9+.1*p})`,transformOrigin:'50% 60%',zIndex:5,pointerEvents:'none'}}>{body}</div>};
const Stickers:React.FC<{st?:St[]}>=({st})=><>{(st??[]).map((s,k)=><Sticker key={k} {...s}/>)}</>;
/* ---------- backdrop: plate (drift only) + floating 3D hearts in the no-text bands ---------- */
const FLOAT=[ // floaters sit behind the content plane: 1.3 px depth blur (keeps their edges soft, so safezone.py does not read them as text). frame coords; top band y<290, bottom band y>=1500; widths at/below native sprite size
 {k:'ring_a',x:806,y:58,w:224,sec:7.5,ph:0},
 {k:'puffy_white',x:300,y:150,w:84,sec:6.1,ph:2.1},
 {k:'puffy_peach',x:96,y:1590,w:150,sec:6.6,ph:1.2},
 {k:'ring_b',x:330,y:1690,w:170,sec:8.2,ph:3.3},
 {k:'puffy_pink',x:842,y:1640,w:128,sec:5.8,ph:.4},
];
// end card (bold pink plate): the white ring in the bottom band reads too contrasty on deep pink -> a coral puffy heart there
const FLOAT_END=FLOAT.map(o=>o.k==='ring_b'?{...o,k:'puffy_coral',w:120,x:360,y:1720}:o);
export const DlBackdrop:React.FC<{plate?:string;ms?:number;float?:boolean;push?:number;end?:boolean}>=({plate,ms,float=true,push=0,end=false})=>{const g=useCurrentFrame();const t=(useS() as any)?.t;
 const src=plate??t?.dl?.plate??'textures/duoly/plate_soft.jpg';const MS=Math.min(1.03,ms??t?.plateScale??1.03);
 const mx=540*(MS-1)-1,my=960*(MS-1)-1;const x=mx*.7*osc(g,61),y=my*.6*osc(g,53,1)-my*.3*push;
 return <AbsoluteFill data-deco="backdrop" style={{overflow:'hidden',background:DL.bg}}>
  <Img src={staticFile(src)} style={{position:'absolute',left:0,top:0,width:1080,height:1920,transform:`translate(${x}px,${y}px) scale(${MS})`,transformOrigin:'50% 50%'}}/>
  {float&&(t?.dl?.floaters??true)&&(end?FLOAT_END:FLOAT).map((o,k)=><Img key={k} src={tex(o.k)} style={{position:'absolute',left:o.x,top:o.y,width:o.w,height:'auto',
   transform:`translateY(${9*osc(g,o.sec,o.ph)}px) rotate(${4*osc(g,o.sec*1.3,o.ph+1)}deg)`,filter:`blur(${end?1.8:1.3}px) drop-shadow(0 14px 18px rgba(216,11,70,.14))`}}/>)}
 </AbsoluteFill>};
/* ---------- header: badge + wordmark left, page right (one line, SZ.header) ---------- */
export const DlChrome:React.FC<{section:string;page:string}>=({page})=>{const B=useBrand();return <>
 <DlBackdrop/>
 <HeadLine rule={`1.5px solid ${DL.raspT(.12)}`} style={{alignItems:'center'}} left={<span style={{display:'flex',alignItems:'center',gap:12}}>{B.logo&&<Img src={staticFile(B.logo)} style={{width:42,height:'auto',display:'block',filter:'drop-shadow(0 2px 3px rgba(216,11,70,.35))'}}/>}
   <span style={{fontFamily:'BVPX',fontSize:fitSize(B.wordmark,360,27,.6),color:DL.rasp,whiteSpace:'nowrap',lineHeight:1,letterSpacing:-.3}}>{B.wordmark}</span></span>}
  right={<span style={{fontFamily:'BVPS',fontSize:20,color:DL.soft,lineHeight:1,letterSpacing:'.06em'}}>{page}</span>}/></>};
/* ---------- title block: optional kicker (small heart + label) + raspberry ExtraBold title; hl words in hot pink on a blush marker ---------- */
const cln=(w:string)=>w.toLowerCase().replace(/[?!.,:;…"“”]/g,'');
const HlText:React.FC<{s:string;hl?:string;c?:string}>=({s,hl,c=DL.pink})=>{const W=s.split(' ');const on=new Array(W.length).fill(false);
 // hl = phrase(s) separated by "|": the first exact run of those words is marked; a phrase not found falls back to its single words
 for(const ph of (hl??'').split('|').map(x=>x.trim()).filter(Boolean)){const P=ph.split(' ').map(cln);let hit=-1;
  for(let i=0;i+P.length<=W.length;i++)if(P.every((w,k)=>cln(W[i+k])===w)){hit=i;break}
  if(hit>=0)P.forEach((_,k)=>on[hit+k]=true);else W.forEach((w,i)=>{if(P.includes(cln(w)))on[i]=true})}
 const runs:{t:string;h:boolean}[]=[];W.forEach((w,i)=>{const L=runs[runs.length-1];if(L&&L.h===on[i])L.t+=' '+w;else runs.push({t:w,h:on[i]})});
 const mk=`linear-gradient(180deg,transparent 60%,${DL.pinkT(.16)} 60%,${DL.pinkT(.16)} 92%,transparent 92%)`;
 return <>{runs.map((r,k)=><React.Fragment key={k}>{r.h?<span style={{color:c,background:mk,padding:'0 .08em',margin:'0 -.08em',WebkitBoxDecorationBreak:'clone',boxDecorationBreak:'clone'} as any}>{r.t}</span>:<BrandText s={r.t}/>}{k<runs.length-1?' ':''}</React.Fragment>)}</>};
export const Kick:React.FC<{s:string;at?:number}>=({s,at=0})=>{const {f}=useS();const p=ease(f,at,12);return <div style={{display:'flex',marginBottom:26}}><div {...bb('kick')} style={{display:'inline-flex',alignItems:'center',gap:14,background:DL.white,borderRadius:999,padding:'12px 26px 12px 18px',boxShadow:'0 8px 20px rgba(216,11,70,.08)',opacity:p}}>
 <Heart s={30} c={DL.pink}/><span style={LB(32,DL.coral)}>{s}</span></div></div>};
export const DTitle:React.FC<{s:string;kick?:string;hl?:string;at?:number;size?:number;one?:boolean}>=({s,kick,hl,at=0,size=68,one})=>{const {f}=useS();const p=ease(f,at+2);
 const sz=one?Math.min(size,fitSize(s,880,size,.58)):size;
 return <div style={{marginBottom:34}}>{kick&&<Kick s={kick} at={at}/>}<div {...bb('title')} style={{...HX(sz),opacity:p,transform:`translateY(${(1-p)*20}px)`,whiteSpace:one?'nowrap':'normal'}}><HlText s={s} hl={hl}/></div></div>};
/* stage: relative box of the full room so stickers can sit anywhere on the canvas */
const Stage:React.FC<{st?:St[];children:React.ReactNode}>=({st,children})=>{const room=useRoom();return <div style={{position:'relative',height:room}}>{children}<Stickers st={st}/></div>};
/* ================= 1. hook: topic at frame 0, optional line + 3D ring-heart art ================= */
export const DlHook:React.FC<{kick?:string;big:string;hl?:string;line?:string;lineAt?:number;chips?:string[];chipsAt?:number;art?:'ring'|'heart'|'none';artAt?:number;stickers?:St[]}>=({kick,big,hl,line,lineAt=8,chips,chipsAt=20,art='ring',artAt=4,stickers})=>{const {f}=useS();const g=useCurrentFrame();const room=useRoom();
 const words=big.split(' ');const longest=Math.max(...words.map(w=>w.length));const n=big.length;const size=Math.min(n<=18?132:n<=30?112:n<=44?96:84,Math.floor(860/(longest*.6)));
 const a=ease(f,artAt,20);const aw=art==='ring'?540:320;
 return <Stage st={stickers}>
  {kick&&<Kick s={kick}/>}
  <div {...bb('big')} style={{...HX(size),lineHeight:1.08,letterSpacing:-2.5}}><HlText s={big} hl={hl}/></div>
  {line&&<In at={lineAt} n="line" style={{...BM(48),marginTop:38,maxWidth:840}}><BrandText s={line}/></In>}
  {chips&&<div style={{display:'flex',flexWrap:'wrap',gap:16,marginTop:34,maxWidth:860}}>{chips.map((c,k)=><In key={k} at={chipsAt+k*7} n={'chip-'+k} style={{display:'inline-flex',alignItems:'center',gap:12,background:DL.white,borderRadius:999,padding:'14px 28px 14px 20px',boxShadow:'0 10px 22px rgba(216,11,70,.10)'}}><Heart s={28} c={k%2?DL.peach:DL.pink}/><span style={LB(36,DL.ink)}>{c}</span></In>)}</div>}
  {art!=='none'&&<div {...(a>0?bb('art'):{})} style={{position:'absolute',right:10,bottom:60,width:aw,opacity:a,transform:`translateY(${(1-a)*30}px)`}}>
   <Img data-deco="art" src={tex(art==='ring'?'ring_hero':'puffy_pink')} style={{width:aw,height:'auto',display:'block',transform:`translateY(${10*osc(g,6.5)}px) rotate(${3*osc(g,8.3,1)}deg)`,filter:'drop-shadow(0 26px 30px rgba(216,11,70,.18))'}}/></div>}
 </Stage>};
/* ================= 2. chat: generic bubbles, typing dots, reactions (no phone, no status bar, no input field) ================= */
type Msg={s:string;me?:boolean;at:number;who?:string;react?:{at:number;k?:'heart'|'peach'}};
const Dots:React.FC<{me?:boolean}>=({me})=>{const g=useCurrentFrame();return <div data-deco="typing" style={{display:'inline-flex',gap:10,padding:'24px 28px',borderRadius:me?'36px 36px 10px 36px':'36px 36px 36px 10px',background:me?DL.pinkT(.14):DL.white,boxShadow:me?'none':'0 10px 24px rgba(216,11,70,.08)'}}>
 {[0,1,2].map(k=>{const q=.5+.5*Math.sin(g/4.2-k*.9);return <span key={k} style={{width:16,height:16,borderRadius:8,background:me?DL.pink:DL.soft,opacity:.35+.65*q,transform:`translateY(${-5*q}px)`}}/>})}</div>};
export const DlChat:React.FC<{title?:string;kick?:string;hl?:string;msgs:Msg[];typing?:number;stickers?:St[]}>=({title,kick,hl,msgs,typing=16,stickers})=>{const {f}=useS();
 return <Stage st={stickers}><Fill head={title?<DTitle s={title} kick={kick} hl={hl}/>:kick?<Kick s={kick}/>:null}><div style={{display:'flex',flexDirection:'column',gap:zg(20)}}>{msgs.map((m,k)=>{
  const on=f>=m.at;const ty=!on&&f>=m.at-typing&&(k===0||f>=msgs[k-1].at);const q=ease(f,m.at,14);const rq=m.react?ease(f,m.react.at,12):0;
  return <div key={k} style={{display:'flex',flexDirection:'column',alignItems:m.me?'flex-end':'flex-start'}}>
   {m.who&&<div style={{...LB(z(26) as any,DL.soft),margin:`0 ${z(14)} ${z(8)}`,...hid(on||ty)}}>{m.who}</div>}
   <div style={{position:'relative',maxWidth:'82%'}}>
    <div {...(on&&q>.5?bb('bubble'):{})} style={{...hid(on),...(m.me?{background:DL.grad,color:'#fff'}:{background:DL.white,color:DL.ink,boxShadow:'0 14px 30px rgba(216,11,70,.09)'}),
     fontFamily:'BVPM',fontSize:z(46),lineHeight:1.3,padding:`${z(24)} ${z(32)}`,borderRadius:m.me?`${z(40)} ${z(40)} ${z(10)} ${z(40)}`:`${z(40)} ${z(40)} ${z(40)} ${z(10)}`,
     opacity:q,transform:`translateY(${(1-q)*20}px) scale(${.94+.06*q})`,transformOrigin:m.me?'100% 100%':'0% 100%'}}><BrandText s={m.s}/></div>
    {ty&&<div style={{position:'absolute',top:0,[m.me?'right':'left']:0}}><Dots me={m.me}/></div>}
    {m.react&&rq>0&&<div style={{position:'absolute',bottom:-22,[m.me?'left':'right']:-14,width:62,height:62,borderRadius:31,background:DL.white,boxShadow:'0 8px 18px rgba(216,11,70,.16)',display:'flex',alignItems:'center',justifyContent:'center',opacity:rq,transform:`scale(${.7+.3*rq})`}}>
     <Img src={tex(m.react.k==='peach'?'puffy_peach':'puffy_pink')} style={{width:40,height:'auto'}}/></div>}
   </div></div>})}</div></Fill></Stage>};
/* ================= 3. "yêu là…" card: cover-style quote card ================= */
export const DlLove:React.FC<{kick?:string;s:string;hl?:string;at?:number;sub?:string;subAt?:number;stickers?:St[]}>=({kick='yêu là…',s,hl,at=2,sub,subAt=30,stickers})=>{const {f}=useS();const p=ease(f,at,18);
 const size=s.length<=34?92:s.length<=64?80:s.length<=90?68:58;
 return <Stage st={stickers}><Fill head={null}>
  <div {...bb('love-card')} style={{...card({borderRadius:56,padding:'64px 60px 70px',background:'linear-gradient(160deg,#FFFFFF 0%,#FFF4F2 60%,#FDE7E5 100%)'}),opacity:p,transform:`translateY(${(1-p)*30}px)`}}>
   <div data-deco="love-deco" style={{position:'absolute',inset:0,overflow:'hidden',borderRadius:56,pointerEvents:'none'}}>
    <div style={{position:'absolute',right:42,top:40,opacity:.28}}><Heart s={44} c={DL.coral} line w={1.6}/></div>
    <div style={{position:'absolute',left:40,bottom:38,opacity:.22}}><Heart s={34} c={DL.coral} line w={1.6}/></div>
    <div style={{position:'absolute',right:120,bottom:56,width:9,height:9,borderRadius:5,background:DL.coral,opacity:.3}}/></div>
   <div style={{display:'flex',marginBottom:38}}><div style={{display:'inline-flex',alignItems:'center',gap:14,background:DL.shell,borderRadius:999,padding:'12px 28px 12px 20px'}}><Heart s={34}/><span style={{...LB(38,DL.pink)}}>{kick}</span></div></div>
   <div style={{...HX(size),lineHeight:1.18}}><HlText s={s} hl={hl}/></div></div>
  {sub&&<In at={subAt} n="sub" style={{...BM(44),marginTop:zg(40),paddingLeft:12}}><BrandText s={sub}/></In>}
 </Fill></Stage>};
/* ================= 4. quiz: question + A/B/C option cards + engagement prompt (comment + tag; never an app CTA) ================= */
export const DlQuiz:React.FC<{kick?:string;q:string;hl?:string;opts:{k?:string;s:string;at:number}[];prompt?:{s:string;at:number};stickers?:St[]}>=({kick,q,hl,opts,prompt,stickers})=>{const {f}=useS();
 return <Stage st={stickers}><Fill head={<DTitle s={q} kick={kick} hl={hl}/>}>
  <div style={{display:'flex',flexDirection:'column',gap:zg(20)}}>{opts.map((o,k)=>{const on=f>=o.at;const p=ease(f,o.at,14);const L=o.k??'ABCD'[k];
   return <div key={k} {...(on&&p>.5?bb('opt'):{})} style={{...hid(on),...card({borderRadius:999,padding:`${z(16)} ${z(40)} ${z(16)} ${z(16)}`}),display:'flex',alignItems:'center',gap:z(26),opacity:p,transform:`translateY(${(1-p)*26}px) scale(${.96+.04*p})`,transformOrigin:'left center'}}>
    <span style={{width:z(84),height:z(84),flex:'none',borderRadius:999,background:DL.grad,display:'flex',alignItems:'center',justifyContent:'center',...HX(z(42),'#fff'),lineHeight:1,boxShadow:'0 8px 16px rgba(216,11,70,.22)'}}>{L}</span>
    <span style={{...HX(z(46),DL.ink),lineHeight:1.2}}><BrandText s={o.s}/></span></div>})}</div>
  {prompt&&<div style={{...hid(f>=prompt.at),marginTop:zg(38)}}><In at={prompt.at} n="prompt" style={{display:'inline-flex',alignItems:'center',gap:z(18),background:DL.grad,borderRadius:999,padding:`${z(20)} ${z(34)} ${z(20)} ${z(22)}`,boxShadow:'0 14px 30px rgba(216,11,70,.22)'}}>
   <span style={{width:z(58),height:z(58),borderRadius:999,background:'rgba(255,255,255,.22)',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{position:'relative'}}><Gl k="chat" s={z(38) as any} c="#fff" fill/><div style={{position:'absolute',left:'50%',top:'44%',transform:'translate(-50%,-50%)'}}><Heart s={z(14) as any} c={DL.pink}/></div></div></span>
   <span style={{...HX(z(40),'#fff'),lineHeight:1.15}}>{prompt.s}</span></In></div>}
 </Fill></Stage>};
/* ================= 5. milestone: big day number counting up + 100 / 365 / 1000 track (generic, not an app counter) ================= */
export const DlDays:React.FC<{kick?:string;title?:string;n:number;from?:number;unit?:string;at?:number;dur?:number;marks?:number[];sub?:string;subAt?:number;stickers?:St[]}>=({kick,title,n,from=0,unit='ngày',at=4,dur=40,marks=[100,365,1000],sub,subAt=50,stickers})=>{const {f}=useS();
 const p=interpolate(f,[at,at+dur],[0,1],{...cl,easing:Easing.bezier(.25,.1,.25,1)});const v=Math.round(from+(n-from)*p);const digits=String(n).length;
 const S=Math.min(340,Math.floor(700/(digits*.62)));const str=v.toLocaleString('vi-VN');
 const idx=marks.length>1?(()=>{for(let k=marks.length-1;k>=0;k--)if(v>=marks[k])return k+(k<marks.length-1?Math.min(1,(v-marks[k])/(marks[k+1]-marks[k])):0);return Math.max(0,v/marks[0])-1})():0;
 return <Stage st={stickers}><Fill head={title?<DTitle s={title} kick={kick}/>:kick?<Kick s={kick}/>:null}>
  <In at={at-4} n="days" style={{display:'flex',alignItems:'baseline',gap:24}}>
   <span style={{...HX(S),lineHeight:1,letterSpacing:-6,fontVariantNumeric:'tabular-nums',background:`linear-gradient(180deg,${DL.coral},${DL.rasp})`,WebkitBackgroundClip:'text',color:'transparent',paddingRight:8}}>{str}</span>
   <span style={{...HX(76,DL.coral)}}>{unit}</span></In>
  {marks.length>1&&<In at={at} n="marks" style={{marginTop:zg(40),position:'relative',height:z(170),...card({borderRadius:44,padding:`0 ${z(50)}`})}}>
   <div style={{position:'absolute',left:z(90),right:z(90),top:z(62),height:8,borderRadius:4,background:DL.shell}}>
    <div style={{width:`${Math.max(0,Math.min(1,idx/(marks.length-1)))*100}%`,height:'100%',borderRadius:4,background:DL.grad}}/></div>
   {marks.map((m,k)=>{const on=v>=m;const x=`calc(${z(90)} + (100% - 2*${z(90)})*${k/(marks.length-1)})`;
    return <div key={k} style={{position:'absolute',left:x,top:z(28),transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:z(10)}}>
     <span style={{width:z(72),height:z(72),borderRadius:999,background:on?DL.grad:DL.white,border:on?'none':`3px solid ${DL.blush}`,boxSizing:'border-box',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:on?'0 8px 16px rgba(216,11,70,.25)':'none'}}>{on&&<Heart s={z(32) as any} c="#fff"/>}</span>
     <span style={{...HX(z(34),on?DL.rasp:DL.soft),whiteSpace:'nowrap'}}>{m.toLocaleString('vi-VN')}</span></div>})}
  </In>}
  {sub&&<div style={{...hid(f>=subAt),marginTop:zg(36)}}><In at={subAt} n="sub" style={{...BM(46)}}><BrandText s={sub}/></In></div>}
 </Fill></Stage>};
/* ================= 6. tips: numbered rows + price tag chips ("dưới 200k") ================= */
const PriceTag:React.FC<{s:string}>=({s})=><span {...bb('price')} style={{display:'inline-flex',alignItems:'center',gap:z(10),background:'#FFE9E2',color:DL.peachInk,...HX(z(32),DL.peachInk),lineHeight:1,
 padding:`${z(10)} ${z(22)} ${z(10)} ${z(34)}`,clipPath:`polygon(${z(18)} 0,100% 0,100% 100%,${z(18)} 100%,0 50%)`,borderRadius:`0 ${z(14)} ${z(14)} 0`,position:'relative',whiteSpace:'nowrap'}}>
 <span style={{position:'absolute',left:z(16),top:'50%',width:z(10),height:z(10),marginTop:`calc(${z(10)} / -2)`,borderRadius:99,background:'#FFF6F4'}}/>{s}</span>;
export const DlTips:React.FC<{title:string;kick?:string;hl?:string;items:{s:string;sub?:string;price?:string;at:number}[];stickers?:St[]}>=({title,kick,hl,items,stickers})=>{const {f}=useS();
 const last=items.reduce((a,it,k)=>f>=it.at?k:a,-1);
 return <Stage st={stickers}><Fill head={<DTitle s={title} kick={kick} hl={hl}/>}><div style={{display:'flex',flexDirection:'column',gap:zg(18)}}>{items.map((it,k)=>{const on=f>=it.at;const q=ease(f,it.at);const act=k===last;
  return <div key={k} {...(on&&q>.5?bb('tip'):{})} style={{...hid(on),...card({borderRadius:36,padding:`${z(24)} ${z(30)}`,border:act?`2.5px solid ${DL.coral}`:'1.5px solid rgba(243,85,112,.10)'}),display:'flex',alignItems:'flex-start',gap:z(24),opacity:q,transform:`translateY(${(1-q)*24}px)`}}>
   <span style={{width:z(70),height:z(70),flex:'none',borderRadius:999,background:act?DL.grad:DL.shell,display:'flex',alignItems:'center',justifyContent:'center',...HX(z(36),act?'#fff':DL.pink),lineHeight:1}}>{k+1}</span>
   <div style={{flex:1,minWidth:0}}><div style={{...HX(z(46),DL.ink),lineHeight:1.18}}><BrandText s={it.s}/></div>
    {it.sub&&<div style={{...BM(z(34),DL.mute),marginTop:z(6)}}>{it.sub}</div>}
    {it.price&&<div style={{marginTop:z(14)}}><PriceTag s={it.price}/></div>}</div></div>})}</div></Fill></Stage>};
/* ================= 7. distance: two pins + dashed arc + km chip, two time zones ================= */
type Place={s:string;tz?:string;t?:string};
const Pin:React.FC<{c:string;s:number}>=({c,s})=><div style={{position:'relative',width:s,height:s,filter:'drop-shadow(0 10px 14px rgba(216,11,70,.22))'}}><Gl k="pin" s={s} c={c} fill/><div style={{position:'absolute',left:'50%',top:'40%',transform:'translate(-50%,-50%)'}}><Heart s={s*.34} c="#fff"/></div></div>;
const Clock:React.FC<{t:string;s:number;c:string}>=({t,s,c})=>{const [h,m]=t.split(':').map(Number);const ha=((h%12)+m/60)*30,ma=m*6;
 return <svg width={s} height={s} viewBox="0 0 100 100" style={{flex:'none'}}><circle cx={50} cy={50} r={46} fill="#fff" stroke={c} strokeWidth={5}/>
  {[0,1,2,3].map(k=><circle key={k} cx={50+36*Math.sin(k*Math.PI/2)} cy={50-36*Math.cos(k*Math.PI/2)} r={3.2} fill={DL.blush}/>)}
  <line x1={50} y1={50} x2={50+22*Math.sin(ha*Math.PI/180)} y2={50-22*Math.cos(ha*Math.PI/180)} stroke={DL.ink} strokeWidth={7} strokeLinecap="round"/>
  <line x1={50} y1={50} x2={50+32*Math.sin(ma*Math.PI/180)} y2={50-32*Math.cos(ma*Math.PI/180)} stroke={c} strokeWidth={5} strokeLinecap="round"/><circle cx={50} cy={50} r={5} fill={DL.ink}/></svg>};
export const DlDistance:React.FC<{kick?:string;title?:string;hl?:string;a:Place;b:Place;km?:string;at?:number;kmAt?:number;clocksAt?:number;note?:{s:string;at:number};stickers?:St[]}>=({kick,title,hl,a,b,km,at=4,kmAt=18,clocksAt=30,note,stickers})=>{const {f}=useS();const g=useCurrentFrame();
 const W=894,Hh=330,x0=140,x1=W-140,yb=232,peak=40;const d=`M${x0},${yb} Q${W/2},${peak-40} ${x1},${yb}`;const draw=ease(f,at+6,26);const kq=ease(f,kmAt,14);
 const bez=(t:number)=>[(1-t)**2*x0+2*(1-t)*t*W/2+t*t*x1,(1-t)**2*yb+2*(1-t)*t*(peak-40)+t*t*yb];const ht=((g/75)%1);const [hx,hy]=bez(ht);
 const clock=(p:Place,k:number)=>{const q=ease(f,clocksAt+k*5);const c=k?DL.peach:DL.pink;return <div key={k} {...(q>.5?bb('clock'):{})} style={{flex:1,...card({borderRadius:40,padding:`${z(26)} ${z(26)}`}),display:'flex',alignItems:'center',gap:z(20),opacity:q,transform:`translateY(${(1-q)*24}px)`}}>
  {p.t&&<Clock t={p.t} s={92} c={c}/>}<div style={{minWidth:0}}><div style={{...HX(z(56),DL.ink),lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{p.t}</div>{p.tz&&<div style={{...LB(z(32) as any,DL.mute),marginTop:z(8)}}>{p.tz}</div>}</div></div>};
 return <Stage st={stickers}><Fill head={title?<DTitle s={title} kick={kick} hl={hl}/>:null}>
  <In at={at} n="map" style={{...card({borderRadius:48,height:Hh+30}),overflow:'hidden'}}>
   <svg width={W} height={Hh} style={{position:'absolute',left:0,top:40,overflow:'visible'}}>
    {Array.from({length:29},(_,k)=>{const [cx,cy]=bez(k/28);return <circle key={k} cx={cx} cy={cy} r={3.4} fill={DL.blush}/>})}
    {Array.from({length:29},(_,k)=>{const t=k/28;if(t>draw)return null;const [cx,cy]=bez(t);return <circle key={k} cx={cx} cy={cy} r={4.2} fill={DL.coral}/>})}
   </svg>
   {kq>0&&<Img data-deco="arc-heart" src={tex('puffy_pink')} style={{position:'absolute',left:hx-24,top:40+hy-24,width:48,height:'auto',opacity:Math.sin(Math.PI*ht)*kq}}/>}
   <div style={{position:'absolute',left:x0-48,top:40+yb-92}}><Pin c={DL.pink} s={96}/></div><div style={{position:'absolute',left:x1-48,top:40+yb-92}}><Pin c={DL.peach} s={96}/></div>
   <div {...bb('city-a')} style={{position:'absolute',left:x0-120,width:240,top:40+yb+18,textAlign:'center',...HX(fitSize(a.s,240,40,.6),DL.ink),whiteSpace:'nowrap'}}>{a.s}</div>
   <div {...bb('city-b')} style={{position:'absolute',left:x1-120,width:240,top:40+yb+18,textAlign:'center',...HX(fitSize(b.s,240,40,.6),DL.ink),whiteSpace:'nowrap'}}>{b.s}</div>
   {km&&<div {...(kq>.5?bb('km'):{})} style={{position:'absolute',left:'50%',top:40+peak+10,transform:`translate(-50%,${(1-kq)*16}px)`,opacity:kq,background:DL.grad,borderRadius:999,padding:'14px 30px',...HX(44,'#fff'),lineHeight:1,whiteSpace:'nowrap',boxShadow:'0 12px 24px rgba(216,11,70,.22)'}}>{km}</div>}
  </In>
  {(a.t||b.t)&&<div style={{display:'flex',gap:z(18),marginTop:zg(26)}}>{[a,b].map(clock)}</div>}
  {note&&<div style={{...hid(f>=note.at),marginTop:zg(30)}}><In at={note.at} n="note" style={{...BM(z(44))}}><BrandText s={note.s}/></In></div>}
 </Fill></Stage>};
/* ================= 8. "phe chị em" debate: versus cards + poll bar (sides with the girls; sarcastic, never insulting) ================= */
type VSide={s:string;sub?:string};
export const DlVersus:React.FC<{kick?:string;title?:string;hl?:string;a:VSide;b:VSide;at?:number;poll?:{a:number;at:number;la?:string;lb?:string};line?:{s:string;at:number};label?:string;src?:string;stickers?:St[]}>=({kick,title,hl,a,b,at=2,poll,line,label,src,stickers})=>{const {f}=useS();
 const side=(s:VSide,k:number)=>{const q=ease(f,at+k*5);const A=k===0;return <div key={k} {...(q>.5?bb('side-'+k):{})} style={{flex:1,...card({borderRadius:44,padding:`${z(40)} ${z(30)}`,...(A?{background:DL.grad,border:'none',boxShadow:'0 22px 44px rgba(216,11,70,.25)'}:{})}),textAlign:'center',opacity:q,transform:`translateY(${(1-q)*28}px)`}}>
  <div style={{display:'flex',justifyContent:'center',marginBottom:z(16)}}><Heart s={z(56) as any} c={A?'#fff':DL.peach}/></div>
  <div style={{...HX(z(54),A?'#fff':DL.ink),lineHeight:1.1}}>{s.s}</div>{s.sub&&<div style={{...BM(z(32),A?'rgba(255,255,255,.88)':DL.mute),marginTop:z(10)}}>{s.sub}</div>}</div>};
 const vq=ease(f,at+9,12);const pq=poll?ease(f,poll.at+4,30):0;
 // poll numbers: sourced -> 'NGUỒN · src', otherwise always tagged MINH HỌA (Dan 18/10; validate_script.py rejects hiding it)
 const tag=src?`NGUỒN · ${src}`:(label||'MINH HỌA');
 return <Stage st={stickers}><Fill head={title?<DTitle s={title} kick={kick} hl={hl}/>:kick?<Kick s={kick}/>:null}>
  <div style={{display:'flex',gap:z(28),position:'relative'}}>{side(a,0)}{side(b,1)}
   <div style={{position:'absolute',left:'50%',top:'50%',transform:`translate(-50%,-50%) scale(${.85+.15*vq})`,opacity:vq,width:z(92),height:z(92),borderRadius:999,background:DL.white,boxShadow:'0 10px 24px rgba(216,11,70,.2)',display:'flex',alignItems:'center',justifyContent:'center',...HX(z(34),DL.rasp),lineHeight:1}}>VS</div></div>
  {poll&&<div style={{...hid(f>=poll.at),marginTop:zg(40)}}><In at={poll.at} n="poll">
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:z(14)}}><span style={{...HX(z(40),DL.pink)}}>{poll.la??a.s} · {Math.round(poll.a*pq)}%</span><span style={{...HX(z(34),DL.soft)}}>{Math.round((100-poll.a)*pq)}%</span></div>
   <div style={{height:z(40),borderRadius:999,background:DL.white,boxShadow:'inset 0 0 0 2px rgba(243,85,112,.14)',overflow:'hidden',display:'flex'}}><div style={{width:`${poll.a*pq}%`,background:DL.grad,borderRadius:999}}/></div>
   <div style={{display:'flex',justifyContent:'flex-end',marginTop:z(12)}}><span {...bb('tag')} style={{...LB(z(22) as any,DL.mute),border:`1.5px solid ${DL.raspT(.18)}`,borderRadius:999,padding:'6px 14px'}}>{tag}</span></div></In></div>}
  {line&&<div style={{...hid(f>=line.at),marginTop:zg(34)}}><In at={line.at} n="line" style={{...card({borderRadius:`${z(40)} ${z(40)} ${z(40)} ${z(10)}`,padding:`${z(26)} ${z(32)}`}),display:'flex',gap:z(16),alignItems:'flex-start'}}>
   <span style={{...HX(z(70),DL.blush),lineHeight:.8}}>“</span><span style={{...HX(z(44),DL.rasp),lineHeight:1.2}}><BrandText s={line.s}/></span></In></div>}
 </Fill></Stage>};
/* ================= end card: bold plate, plain logo mark (no app-icon tile, Dan 18/10) + page name only (no handles, no CTA, no tagline unless approved) ================= */
export const DlEndCard:React.FC<{dur?:number;handles?:Handle[];tagline?:string;tm?:string;plate?:string;ms?:number}>=({dur=90,tagline='',tm,plate,ms})=>{const f=useCurrentFrame();const B=useBrand();
 const op=(at:number)=>ease(f,at,16);const out=interpolate(f,[dur-10,dur],[1,0],cl);const fade=interpolate(f,[0,12],[0,1],cl);const page=B.page??B.name;
 const top=SZ.end.top+300;const bq=op(4);
 return <AbsoluteFill data-layer="end" style={{zIndex:40,opacity:out}}><style>{FONTS}</style>
  <AbsoluteFill style={{opacity:fade}}><DlBackdrop end plate={plate??'textures/duoly/plate_bold.jpg'} ms={ms} push={ease(f,0,dur)}/></AbsoluteFill>
  <div style={{position:'absolute',left:SZ.end.x,right:SZ.end.right,top,opacity:fade}}>
   {B.logo&&<div {...bb('e-logo')} style={{width:360,opacity:bq,transform:`translateY(${(1-bq)*26}px)`}}>
    <Img data-deco="e-logo-bob" src={staticFile(B.logo)} style={{width:360,height:'auto',display:'block',filter:'drop-shadow(0 26px 34px rgba(120,0,40,.28))',transform:`translateY(${6*osc(f,4.8)}px)`}}/></div>}
   <div {...bb('e-name')} style={{marginTop:52,display:'table',...HX(fitSize(page,724,112,.58),'#FFFFFF'),lineHeight:1.05,letterSpacing:-2,whiteSpace:'nowrap',opacity:op(10),transform:`translateY(${(1-op(10))*20}px)`,textShadow:'0 6px 24px rgba(120,0,40,.25)'}}>{page}</div>
   {tagline&&<div {...bb('e-tag')} style={{display:'table',marginTop:22,...BM(fitSize(tagline,724,44,.55),'rgba(255,255,255,.92)'),whiteSpace:'nowrap',opacity:op(14)}}>{tagline}</div>}
   {tm&&<div {...bb('e-tm')} style={{marginTop:40,...BM(20,'rgba(255,255,255,.82)'),opacity:op(20)}}>{tm}</div>}
  </div>
  <Sequence from={4}><Audio src={staticFile('sfx/bubble_soft.wav')} volume={0.4}/></Sequence>
 </AbsoluteFill>};
/* drift transition signature: one small puffy heart floats up the right margin while scenes swap (data-deco) */
export const DriftHeart:React.FC<{e:number}>=({e})=><Img data-deco="drift-heart" src={tex('puffy_pink')} style={{position:'absolute',left:930,top:1180-360*e,width:76,height:'auto',zIndex:10,opacity:Math.sin(Math.PI*e)*.95,transform:`rotate(${-8+16*e}deg)`,filter:'drop-shadow(0 10px 14px rgba(216,11,70,.2))',pointerEvents:'none'}}/>;
