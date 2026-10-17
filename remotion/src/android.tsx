// android-tutor (ANDROID TUTOR): Android-dev explainer.
// Studio Dark (IDE bg #1E1F22, cards #2B2D30, Kotlin syntax colours, editor tab bar, Logcat) + Compose Preview
// (code card beside a generic phone frame running the @Preview) + Material 3 Expressive motion: spring physics with the
// M3E spatial/effects tokens and a cookie (scallop) shape that morphs to a circle (scene transition `cookie`, accents).
// Legal: no official Android logo/wordmark/3D head, no Android Studio/IntelliJ/Pixel art. The robot below is our own
// simplified drawing; the end card carries the CC BY 3.0 attribution line.
import React from 'react';import {AbsoluteFill,Audio,Sequence,staticFile,interpolate,spring,useCurrentFrame} from 'remotion';
import {useS,FONTS} from './sys';import {useBrand,fitSize,BrandTile,Handle} from './brand';import {SZ} from './safezone';
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const AT={bg:'#1E1F22',card:'#2B2D30',card2:'#252629',line:'#393B40',dim:'#868A91',ink:'#DFE1E5',green:'#3DDC84',prim:'#7DDB9F',onPrim:'#00391C',
 blue:'#3574F0',kw:'#CF8E6D',str:'#6AAB73',num:'#2AACB8',ann:'#B3AE60',fn:'#56A8F5',prop:'#C77DBB',cmt:'#7A7E85',err:'#F75464',warn:'#E5C07B'};
const SANS='GSF',MONO='JBM';
// M3 Expressive springs (material3 1.4 ExpressiveMotionTokens): spatial fast .6/800, default .8/380, slow .8/200; effects critically damped.
const SPR={fast:[.6,800],def:[.8,380],slow:[.8,200],fx:[1,1600]} as const;
export const m3=(f:number,at:number,k:keyof typeof SPR='def')=>{const [z,s]=SPR[k];return spring({frame:f-at,fps:30,config:{stiffness:s,damping:2*z*Math.sqrt(s),mass:1}})};
/* cookie / scallop shape (M3 shape library "Cookie"): r = R(1 + amp cos(n θ)); amp→0 morphs it into a circle */
export const cookiePath=(cx:number,cy:number,R:number,amp=.1,n=9,rot=0)=>{let d='';for(let k=0;k<=180;k++){const a=k/180*Math.PI*2;const r=R*(1+amp*Math.cos(n*(a+rot)));d+=(k?'L':'M')+(cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1)}return d+'Z'};
/* own simplified green robot head (not the official logo/3D head) */
export const Robot:React.FC<{s:number;c?:string;eye?:string}>=({s,c=AT.green,eye=AT.bg})=><svg width={s} height={s*.62} viewBox="0 0 100 62">
 <path d="M8 60 A42 42 0 0 1 92 60 Z" fill={c}/><path d="M26 22 L16 6" stroke={c} strokeWidth={5} strokeLinecap="round"/><path d="M74 22 L84 6" stroke={c} strokeWidth={5} strokeLinecap="round"/>
 <circle cx={32} cy={42} r={5} fill={eye}/><circle cx={68} cy={42} r={5} fill={eye}/></svg>;
/* Kotlin syntax colours, Android Studio dark-ish. Upright (never italic). */
const KW=/^(val|var|fun|by|class|object|return|if|else|import|private|override|data|when|null|true|false|it)$/;
export const kt=(line:string)=>{const c=line.indexOf('//');const code=c>=0?line.slice(0,c):line,cm=c>=0?line.slice(c):'';
 const toks=code.split(/("[^"]*"|@\w+|\b\d+\b|[A-Za-z_]\w*|\s+|.)/).filter(x=>x!=='');
 const out=toks.map((w,k)=>{const nx=toks.slice(k+1).find(x=>!/^\s+$/.test(x));const pv=toks[k-1];
  const col=/^"/.test(w)?AT.str:/^@/.test(w)?AT.ann:/^\d+$/.test(w)?AT.num:KW.test(w)?AT.kw:pv==='.'&&/^[a-z]/.test(w)&&nx!=='('?AT.prop:/^[a-z]\w*$/.test(w)&&(nx==='('||nx==='{')?AT.fn:/^[(){}<>,:=.]$/.test(w)?'#BCBEC4':AT.ink;
  return <span key={k} style={{color:col}}>{w}</span>});
 if(cm)out.push(<span key="c" style={{color:AT.cmt}}>{cm}</span>);return out};
const lbl=(size=24,c=AT.dim):React.CSSProperties=>({fontFamily:MONO,fontSize:size,color:c,fontWeight:500});
const Title:React.FC<{s:string;at?:number;size?:number}>=({s,at=0,size=80})=>{const {f}=useS();const p=m3(f,at,'def'),o=m3(f,at,'fx');
 return <div style={{fontFamily:SANS,fontWeight:800,fontSize:size,lineHeight:1.12,color:AT.ink,letterSpacing:-1,marginBottom:34,opacity:o,transform:`translateY(${(1-p)*40}px)`}}>{s}</div>};
const Pill:React.FC<{children:React.ReactNode;bg?:string;fg?:string;size?:number}>=({children,bg=AT.prim,fg=AT.onPrim,size=30})=><span style={{display:'inline-flex',alignItems:'center',gap:10,background:bg,color:fg,borderRadius:999,padding:`8px ${size*.8}px`,fontFamily:SANS,fontWeight:800,fontSize:size,whiteSpace:'nowrap'}}>{children}</span>;
/* editor card: file tab + gutter + typed Kotlin lines + optional highlighted range */
const Editor:React.FC<{file:string;lines:{s:string;at:number}[];hl?:{from:number;to:number;at:number};fs?:number;lh?:number;at?:number}>=({file,lines,hl,fs=40,lh=62,at=0})=>{const {f}=useS();const p=m3(f,at,'def');
 return <div style={{background:AT.card,borderRadius:28,overflow:'hidden',border:`1.5px solid ${AT.line}`,opacity:m3(f,at,'fx'),transform:`translateY(${(1-p)*60}px) scale(${.96+.04*p})`,transformOrigin:'center top'}}>
  <div style={{display:'flex',alignItems:'flex-end',height:64,background:AT.card2,borderBottom:`1.5px solid ${AT.line}`,padding:'0 26px'}}>
   <div style={{...lbl(24,AT.ink),padding:'0 6px 14px',borderBottom:`3px solid ${AT.blue}`}}>{file}</div></div>
  <div style={{position:'relative',padding:'20px 0 26px'}}>
   {hl&&(()=>{const q=m3(f,hl.at,'fast');return <div style={{position:'absolute',left:0,right:0,top:20+hl.from*lh,height:(hl.to-hl.from+1)*lh,background:'rgba(61,220,132,.13)',borderLeft:`6px solid ${AT.green}`,opacity:Math.min(1,q),transform:`scaleX(${.6+.4*q})`,transformOrigin:'left center'}}/>})()}
   {lines.map((l,k)=>{const q=interpolate(f,[l.at,l.at+10],[0,1],cl);const src=l.s.replace(/^\\@/,'@');const shown=src.slice(0,Math.ceil(src.length*q));
    return <div key={k} style={{position:'relative',display:'flex',height:lh,alignItems:'center',fontFamily:MONO,fontWeight:500,fontStyle:'normal',fontSize:fs,whiteSpace:'pre'}}>
     <span style={{width:64,textAlign:'right',paddingRight:22,fontSize:24,color:q>0?'#6F737A':'#45474C'}}>{k+1}</span>{kt(shown)}</div>})}</div></div>};
/* 1. hook: topic big at frame 0 (code names), tag pill, robot on a cookie */
export const AtHook:React.FC<{tag:string;a:string;b:string;line:string;why?:{s:string;at:number}}>=({tag,a,b,line,why})=>{const {f}=useS();
 const rob=m3(f,4,'slow'),ck=m3(f,0,'slow');const w=why?m3(f,why.at,'def'):0;
 return <div style={{position:'relative',height:1320}}>
  <Pill size={30}><svg width={30} height={30} viewBox="0 0 40 40"><path d={cookiePath(20,20,16,.12,9)} fill={AT.onPrim}/></svg>{tag}</Pill>
  <div style={{marginTop:44,fontFamily:MONO,fontWeight:700,fontSize:fitSize(a,860,116,.6),color:AT.prim,whiteSpace:'nowrap',lineHeight:1.1}}>{a}</div>
  <div style={{fontFamily:SANS,fontWeight:800,fontSize:70,color:AT.dim,lineHeight:1.1,margin:'6px 0'}}>vs</div>
  <div style={{fontFamily:MONO,fontWeight:700,fontSize:fitSize(b,880,116,.6),color:AT.green,whiteSpace:'nowrap',lineHeight:1.1}}>{b}</div>
  <div style={{marginTop:40,fontFamily:SANS,fontWeight:800,fontSize:86,lineHeight:1.12,color:AT.ink,letterSpacing:-1,maxWidth:880}}>{line}</div>
  {why&&<div style={{marginTop:40,display:'flex',gap:18,alignItems:'center',opacity:Math.min(1,m3(f,why.at,'fx')),transform:`translateX(${(1-w)*-60}px)`}}>
   <span style={{width:14,height:56,borderRadius:7,background:AT.green,flex:'none'}}/><span style={{fontFamily:SANS,fontWeight:500,fontSize:52,color:AT.ink,lineHeight:1.25}}>{why.s}</span></div>}
  <svg style={{position:'absolute',right:-10,bottom:10}} width={360} height={360}><path d={cookiePath(180,180,150*ck,.1*(1-.4*Math.min(1,ck)),9,f*.004)} fill="rgba(61,220,132,.14)"/></svg>
  <div style={{position:'absolute',right:50,bottom:120,transform:`scale(${rob})`,transformOrigin:'center bottom'}}><Robot s={260}/></div>
 </div>};
/* 2. code card with highlighted lines and a note */
export const AtCode:React.FC<{title:string;file:string;lines:{s:string;at:number}[];hl?:{from:number;to:number;at:number};note?:{s:string;at:number}}>=({title,file,lines,hl,note})=>{const {f}=useS();
 return <div><Title s={title}/><Editor file={file} lines={lines} hl={hl} at={4}/>
  {note&&f>=note.at-1&&(()=>{const p=m3(f,note.at,'def');return <div style={{marginTop:40,background:AT.card,borderRadius:28,padding:'26px 30px',display:'flex',gap:22,alignItems:'center',opacity:Math.min(1,m3(f,note.at,'fx')),transform:`translateY(${(1-p)*50}px)`}}>
   <svg width={56} height={56} style={{flex:'none'}} viewBox="0 0 56 56"><path d={cookiePath(28,28,24,.1,9,f*.01)} fill={AT.green}/><text x={28} y={37} textAnchor="middle" style={{fontFamily:SANS,fontWeight:800,fontSize:28,fill:AT.onPrim}}>i</text></svg>
   <span style={{fontFamily:SANS,fontWeight:500,fontSize:48,color:AT.ink,lineHeight:1.3}}>{note.s}</span></div>})()}</div>};
/* 3. compose preview: code + a generic phone running the @Preview. taps increment, rotateAt recreates the activity */
export const AtPreview:React.FC<{title:string;file:string;lines:{s:string;at:number}[];hl?:{from:number;to:number;at:number};taps:number[];rotateAt:number;keep:boolean;label:string;btn:string;verdict?:{s:string;at:number}}>=({title,file,lines,hl,taps,rotateAt,keep,label,btn,verdict})=>{const {f}=useS();
 const r=m3(f,rotateAt,'slow');const ang=90*r;const after=f>=rotateAt+8;
 const n=taps.filter(x=>f>=x&&(keep||!after||x>rotateAt)).length;
 const flash=interpolate(f,[rotateAt+6,rotateAt+9,rotateAt+16],[0,1,0],cl);
 const last=[...taps].reverse().find(x=>f>=x);const rip=last!=null?interpolate(f-last,[0,12],[0,1],cl):1;const bp=last!=null?m3(f,last,'fast'):1;
 const PW=250,PH=480;const pIn=m3(f,10,'def');
 return <div><Title s={title} size={66}/><Editor file={file} lines={lines} hl={hl} fs={31} lh={44} at={2}/>
  <div style={{position:'relative',height:560,marginTop:30}}>
   <div style={{position:'absolute',left:60,top:0,width:PW,height:PH,transform:`rotate(${ang}deg) translateY(${(1-pIn)*120}px)`,opacity:Math.min(1,m3(f,10,'fx')),transformOrigin:'50% 50%'}}>
    <div style={{position:'absolute',inset:0,borderRadius:54,background:'#0E0F10',border:`3px solid ${AT.line}`,boxShadow:'0 30px 60px rgba(0,0,0,.45)'}}/>
    <div style={{position:'absolute',left:14,top:14,right:14,bottom:14,borderRadius:42,background:'#0F1511',overflow:'hidden'}}>
     <div style={{position:'absolute',left:'50%',top:18,width:18,height:18,marginLeft:-9,borderRadius:9,background:'#000'}}/>
     <div style={{position:'absolute',inset:0,background:'#FFFFFF',opacity:flash*.25}}/>
     <div style={{position:'absolute',left:0,right:0,top:'50%',transform:`translateY(-50%) rotate(${-ang}deg)`,display:'flex',flexDirection:'column',alignItems:'center',gap:30}}>
      <div style={{fontFamily:SANS,fontWeight:800,fontSize:32,color:'#DDE5DB',whiteSpace:'nowrap'}}>{label.replace('{n}',String(n))}</div>
      <div style={{position:'relative',overflow:'hidden',borderRadius:999,background:AT.prim,padding:'16px 44px',transform:`scale(${.94+.06*bp})`}}>
       <span style={{fontFamily:SANS,fontWeight:800,fontSize:32,color:AT.onPrim}}>{btn}</span>
       {last!=null&&rip<1&&<div style={{position:'absolute',left:'50%',top:'50%',width:260,height:260,marginLeft:-130,marginTop:-130,borderRadius:130,background:'rgba(0,57,28,.25)',transform:`scale(${rip})`,opacity:1-rip}}/>}</div></div></div></div>
   <div style={{position:'absolute',left:PW+150,top:60,display:'flex',flexDirection:'column',gap:18,opacity:Math.min(1,m3(f,14,'fx'))}}>
    <span style={lbl(32,AT.ann)}>@Preview</span>
    <span style={{...lbl(40,AT.ink)}}>count = <span style={{color:AT.num}}>{n}</span></span>
    {f>=rotateAt&&<span style={{...lbl(32,AT.dim)}}>↻ xoay máy</span>}</div>
   {verdict&&f>=verdict.at&&(()=>{const p=m3(f,verdict.at,'fast');return <div style={{position:'absolute',left:PW+150,top:300,transform:`scale(${p})`,transformOrigin:'left center'}}>
    <Pill bg={keep?AT.green:AT.err} fg={keep?AT.onPrim:'#2A0006'} size={36}>{verdict.s}</Pill></div>})()}
  </div></div>};
/* 4. logcat panel with D/I/W/E badges */
const LV:Record<string,[string,string]>={D:['#2F4F73','#A8C7FA'],I:['#2E5A3A','#9EE2B0'],W:['#5E5220','#F2D675'],E:['#6B2A2E','#FFB4B4']};
export const AtLogcat:React.FC<{title:string;lines:{lvl:'D'|'I'|'W'|'E';tag:string;msg:string;at:number}[];note?:{s:string;at:number}}>=({title,lines,note})=>{const {f}=useS();const p=m3(f,4,'def');
 return <div><Title s={title}/>
  <div style={{background:'#191A1C',borderRadius:28,border:`1.5px solid ${AT.line}`,overflow:'hidden',opacity:Math.min(1,m3(f,4,'fx')),transform:`translateY(${(1-p)*60}px)`}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 28px',background:AT.card2,borderBottom:`1.5px solid ${AT.line}`}}>
    <span style={lbl(32,AT.ink)}>Logcat</span><span style={{...lbl(26,AT.dim),border:`1.5px solid ${AT.line}`,borderRadius:999,padding:'4px 16px'}}>package:mine</span></div>
   <div style={{padding:'14px 0 20px'}}>{lines.map((l,k)=>{if(f<l.at)return null;const q=m3(f,l.at,'fast');const [bg,fg]=LV[l.lvl];
    return <div key={k} style={{display:'flex',gap:18,alignItems:'flex-start',padding:'20px 28px',opacity:Math.min(1,q),transform:`translateX(${(1-q)*-40}px)`,background:l.lvl==='E'?'rgba(247,84,100,.07)':'transparent'}}>
     <span style={{flex:'none',width:54,height:54,borderRadius:14,background:bg,color:fg,fontFamily:MONO,fontWeight:800,fontSize:32,display:'flex',alignItems:'center',justifyContent:'center'}}>{l.lvl}</span>
     <div style={{fontFamily:MONO,fontSize:37,lineHeight:1.35,color:l.lvl==='E'?'#FF9C9C':l.lvl==='W'?AT.warn:AT.ink}}><span style={{color:fg}}>{l.tag}</span>  {l.msg}</div></div>})}</div></div>
  {note&&f>=note.at&&(()=>{const q=m3(f,note.at,'def');return <div style={{marginTop:48,fontFamily:SANS,fontWeight:500,fontSize:50,lineHeight:1.3,color:AT.ink,opacity:Math.min(1,m3(f,note.at,'fx')),transform:`translateY(${(1-q)*40}px)`,borderLeft:`8px solid ${AT.green}`,paddingLeft:26}}>{note.s}</div>})()}</div>};
/* 5. takeaway: pill rows (keeps / loses) + rule */
export const AtTake:React.FC<{title:string;head?:[string,string];rows:{k:string;a:string;b:string;at:number}[];rule?:{s:string;at:number}}>=({title,head,rows,rule})=>{const {f}=useS();
 return <div><Title s={title}/>
  {head&&<div style={{display:'flex',padding:'0 30px 14px',...lbl(28,AT.dim)}}><span style={{flex:1}}/><span style={{width:190,textAlign:'center'}}>{head[0]}</span><span style={{width:190,textAlign:'center'}}>{head[1]}</span></div>}
  <div style={{display:'flex',flexDirection:'column',gap:22}}>{rows.map((r,k)=>{if(f<r.at)return null;const q=m3(f,r.at,'def');
   const cell=(v:string)=>{const ok=/^(giữ|có|✓)/i.test(v);return <span style={{width:190,display:'flex',justifyContent:'center'}}><span style={{borderRadius:999,padding:'10px 26px',fontFamily:SANS,fontWeight:800,fontSize:40,background:ok?AT.green:'#3A2A2C',color:ok?AT.onPrim:'#FFB4B4'}}>{v}</span></span>};
   return <div key={k} style={{display:'flex',alignItems:'center',background:AT.card,borderRadius:999,padding:'30px 30px',opacity:Math.min(1,m3(f,r.at,'fx')),transform:`translateX(${(1-q)*80}px)`}}>
    <span style={{flex:1,fontFamily:SANS,fontWeight:500,fontSize:46,color:AT.ink}}>{r.k}</span>{cell(r.a)}{cell(r.b)}</div>})}</div>
  {rule&&f>=rule.at&&(()=>{const q=m3(f,rule.at,'def');return <div style={{marginTop:44,background:'rgba(61,220,132,.12)',border:`2px solid ${AT.green}`,borderRadius:32,padding:'28px 32px',display:'flex',gap:22,alignItems:'center',transform:`scale(${.9+.1*q})`,opacity:Math.min(1,m3(f,rule.at,'fx')),transformOrigin:'left center'}}>
   <svg width={64} height={64} style={{flex:'none'}} viewBox="0 0 64 64"><path d={cookiePath(32,32,28,.1*(1-Math.min(1,q))+.04,9,f*.01)} fill={AT.green}/></svg>
   <span style={{fontFamily:SANS,fontWeight:800,fontSize:50,lineHeight:1.25,color:AT.ink}}>{rule.s}</span></div>})()}</div>};
/* chrome: brand + page (baseline), editor tab strip, decorative gutter, faint cookie */
export const AtChrome:React.FC<{section:string;page:string}>=({section,page})=>{const {f}=useS();const B=useBrand();return <>
 <svg style={{position:'absolute',right:-180,top:-160}} width={620} height={620}><path d={cookiePath(310,310,260,.09,9,f*.002)} fill="rgba(61,220,132,.05)"/></svg>
 <div style={{position:'absolute',left:136,right:50,top:84,display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
  <div style={{display:'flex',alignItems:'baseline',gap:16}}><span style={{alignSelf:'center'}}><Robot s={58}/></span><span style={{fontFamily:SANS,fontWeight:800,fontSize:fitSize(B.wordmark,520,48,.68),lineHeight:1,color:AT.ink,letterSpacing:1,whiteSpace:'nowrap'}}>{B.wordmark}</span></div>
  <span style={{...lbl(26),lineHeight:1}}>{page}</span></div>
 <div style={{position:'absolute',left:136,right:50,top:168,height:56,display:'flex',alignItems:'flex-end',gap:30,borderBottom:`1.5px solid ${AT.line}`}}>
  <span style={{...lbl(24,AT.ink),padding:'0 4px 12px',borderBottom:`3px solid ${AT.blue}`,whiteSpace:'nowrap'}}>{section}</span>
  <span style={{flex:1}}/><span style={{...lbl(22,AT.str),paddingBottom:14}}>▶ app</span></div>
 <div style={{position:'absolute',left:30,top:300,width:56}}>{Array.from({length:24},(_,k)=><div key={k} style={{height:50,textAlign:'right',...lbl(20,k%5===4?'#5A5D63':'#3A3C41')}}>{k+1}</div>)}</div></>};
/* cookie transition overlay: a green cookie grows from `focus`, morphing to a circle as it covers the frame, then exits as a shrinking cookie */
export const CookieWipe:React.FC<{p:number;fx?:number;fy?:number;c:string}>=({p,fx=760,fy=1150,c})=>{
 const grow=p<.5?p/.5:1,shrink=p<.5?0:(p-.5)/.5;const e=(x:number)=>1-Math.pow(1-x,3);
 const R=p<.5?40+e(grow)*2200:2240*(1-e(shrink));const amp=p<.5?.12*(1-grow)+.01:.12*shrink+.01;
 const cx=p<.5?fx:fx+(540-fx)*shrink,cy=p<.5?fy:fy+(960-fy)*shrink;
 return <AbsoluteFill style={{zIndex:10,pointerEvents:'none'}}><svg width={1080} height={1920}><path d={cookiePath(cx,cy,Math.max(0,R),amp,9,p*1.4)} fill={c}/></svg></AbsoluteFill>};
const PN:Record<string,string>={youtube:'YouTube',facebook:'Facebook',tiktok:'TikTok'};
/* end card: robot, brand, tagline, 3 handle tiles, CC BY 3.0 attribution (end ≤ y 1480) */
export const AtEndCard:React.FC<{dur?:number;handles?:Handle[];tagline?:string}>=({dur=90,handles,tagline=''})=>{const f=useCurrentFrame();const B=useBrand();handles=handles??B.handles;
 const S=(at:number,k:keyof typeof SPR='def')=>m3(f,at,k);const op=(at:number)=>Math.min(1,S(at,'fx'));const out=interpolate(f,[dur-10,dur],[1,0],cl);
 const bgR=S(0,'slow')*2300;
 return <AbsoluteFill style={{zIndex:40,opacity:out}}><style>{FONTS}</style>
  <svg width={1080} height={1920} style={{position:'absolute'}}><path d={cookiePath(540,700,bgR,.02+.1*Math.max(0,1-S(0,'slow')),9,f*.003)} fill={AT.bg}/></svg>
  <div style={{position:'absolute',left:SZ.end.x,right:SZ.end.right,top:430}}>
   <div style={{transform:`scale(${S(4,'slow')})`,transformOrigin:'left bottom',width:150}}><Robot s={150}/></div>
   <div style={{fontFamily:SANS,fontWeight:500,fontSize:46,color:AT.dim,marginTop:30,opacity:op(8)}}>Theo dõi để học</div>
   <div style={{fontFamily:SANS,fontWeight:800,fontSize:fitSize(tagline,724,92,.56),color:AT.ink,lineHeight:1.1,whiteSpace:'nowrap',opacity:op(10),transform:`translateY(${(1-S(10))*30}px)`}}>{tagline}</div>
   <div style={{fontFamily:SANS,fontWeight:800,fontSize:fitSize(B.name,724,44,.6),color:AT.green,marginTop:10,opacity:op(14),whiteSpace:'nowrap'}}>{B.name}</div>
   <div style={{marginTop:44,display:'flex',flexDirection:'column',gap:18}}>{handles.map((h,k)=>{const q=S(18+k*5);return <div key={k} style={{display:'flex',alignItems:'center',gap:26,background:AT.card,borderRadius:999,padding:'16px 36px 16px 18px',opacity:op(18+k*5),transform:`translateX(${(1-q)*90}px)`}}>
    <BrandTile icon={h.icon} size={68} radius={34}/><span style={{fontFamily:SANS,fontWeight:500,fontSize:30,color:AT.dim,width:150}}>{PN[h.icon??'']??h.p}</span>
    <span style={{flex:1,textAlign:'right',fontFamily:SANS,fontWeight:800,fontSize:fitSize(h.h,330,44,.58),color:AT.ink,whiteSpace:'nowrap'}}>{h.h}</span></div>})}</div>
   <div style={{marginTop:40,fontFamily:SANS,fontWeight:500,fontSize:21,lineHeight:1.4,color:AT.dim,opacity:op(30)}}>The Android robot is reproduced or modified from work created and shared by Google and used according to terms described in the Creative Commons 3.0 Attribution License. Android is a trademark of Google LLC.</div>
  </div>
  <Sequence from={4}><Audio src={staticFile('sfx/outro_sting.wav')} volume={0.55}/></Sequence>
 </AbsoluteFill>};
