// android-tutor (ANDROID TUTOR): Android-dev explainer.
// Studio Dark (near-black bg #0B0C0E, cards #17181B, Kotlin syntax colours, editor tab bar, Logcat) + Compose Preview
// (code card beside a generic phone frame running the @Preview) + Material 3 Expressive motion: spring physics with the
// M3E spatial/effects tokens and a cookie (scallop) shape for small accents only. Scene transition = Material shared-axis X (`sharedx`, sys.tsx);
// no full-screen zoom/pop shapes (Dan found the old cookie wipe jarring).
// Legal: no official Android logo/wordmark/3D head, no Android Studio/IntelliJ/Pixel art. The robot below is our own
// simplified drawing; the end card carries the CC BY 3.0 attribution line.
import React from 'react';import {AbsoluteFill,Audio,Sequence,staticFile,interpolate,spring,useCurrentFrame,Easing} from 'remotion';
import {useS,FONTS} from './sys';import {useBrand,fitSize,BrandTile,Handle} from './brand';import {SZ} from './safezone';
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
// Main accent is exactly the official Android green #3DDC84 (developer.android.com brand guidelines) everywhere; no pastel M3 tones.
export const AT={bg:'#0B0C0E',card:'#17181B',card2:'#121316',panel:'#101114',line:'#2A2C31',dim:'#8B8F96',ink:'#E6E8EB',green:'#3DDC84',onPrim:'#00391C',
 blue:'#3574F0',kw:'#CF8E6D',str:'#6AAB73',num:'#2AACB8',ann:'#B3AE60',fn:'#56A8F5',prop:'#C77DBB',cmt:'#7A7E85',err:'#F75464',warn:'#E5C07B'};
const SANS='GSF',MONO='JBM';
// overlap audit: every content box carries data-bb (see bbcheck.tsx, props.debugBB)
export const bb=(n:string)=>({'data-bb':n} as any);
// M3 Expressive springs (material3 1.4 ExpressiveMotionTokens): spatial fast .6/800, default .8/380, slow .8/200; effects critically damped.
const SPR={fast:[.6,800],def:[.8,380],slow:[.8,200],fx:[1,1600]} as const;
export const m3=(f:number,at:number,k:keyof typeof SPR='def')=>{const [z,s]=SPR[k];return spring({frame:f-at,fps:30,config:{stiffness:s,damping:2*z*Math.sqrt(s),mass:1}})};
/* cookie / scallop shape (M3 shape library "Cookie"): r = R(1 + amp cos(n θ)); amp→0 morphs it into a circle */
export const cookiePath=(cx:number,cy:number,R:number,amp=.1,n=9,rot=0)=>{let d='';for(let k=0;k<=180;k++){const a=k/180*Math.PI*2;const r=R*(1+amp*Math.cos(n*(a+rot)));d+=(k?'L':'M')+(cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1)}return d+'Z'};
/* morphing shape for mid-ground decoration: blends a rounded n-gon (sides/corners) with an n-petal scallop (roundness),
   n is fractional and crossfades between neighbouring integers so the petal/side count morphs continuously */
const shapeR=(a:number,n:number,round:number)=>{const seg=2*Math.PI/n;const poly=Math.cos(Math.PI/n)/Math.cos(((a%seg)+seg)%seg-Math.PI/n);const petal=(1+.1*Math.cos(n*a))/1.1;return poly*(1-round)+petal*round};
export const morphPath=(cx:number,cy:number,R:number,nF:number,round:number,rot:number)=>{const n0=Math.max(3,Math.floor(nF));const fr=nF-n0;const k=fr*fr*(3-2*fr);let d='';
 for(let i=0;i<=240;i++){const a=i/240*Math.PI*2;const r=R*(shapeR(a,n0,round)*(1-k)+shapeR(a,n0+1,round)*k);d+=(i?'L':'M')+(cx+r*Math.cos(a+rot)).toFixed(1)+' '+(cy+r*Math.sin(a+rot)).toFixed(1)}return d+'Z'};
const osc=(g:number,sec:number,ph=0)=>Math.sin(2*Math.PI*(g/30/sec)+ph);
/* slow, continuous, low-contrast shapes behind content (global frame, so they never jump between scenes) */
export const MidShapes:React.FC=()=>{const g=useCurrentFrame();
 return <svg width={1080} height={1920} style={{position:'absolute',left:0,top:0,pointerEvents:'none'}}>
  <path d={morphPath(980,130,300,6.5+2.5*osc(g,24),.55+.4*osc(g,17,1),g*.0035)} fill="rgba(61,220,132,.075)"/>
  <path d={morphPath(30,1030,230,4.5+1.5*osc(g,19,2),.5+.45*osc(g,11),-g*.0025)} fill="none" stroke="rgba(61,220,132,.16)" strokeWidth={3}/>
  <path d={morphPath(1010,1720,270,8+3*osc(g,29,3),.6+.35*osc(g,13,2),g*.002)} fill="rgba(61,220,132,.055)"/></svg>};
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
const Title:React.FC<{s:string;at?:number;size?:number;one?:boolean}>=({s,at=0,size=80,one})=>{const {f}=useS();const p=m3(f,at,'def'),o=m3(f,at,'fx');if(one)size=fitSize(s,880,size,.54);
 return <div {...bb('title')} style={{whiteSpace:one?'nowrap':'normal',fontFamily:SANS,fontWeight:800,fontSize:size,lineHeight:1.12,color:AT.ink,letterSpacing:-1,marginBottom:34,opacity:o,transform:`translateY(${(1-p)*40}px)`}}>{s}</div>};
const Pill:React.FC<{children:React.ReactNode;bg?:string;fg?:string;size?:number}>=({children,bg=AT.green,fg=AT.onPrim,size=30})=><span style={{display:'inline-flex',alignItems:'center',gap:10,background:bg,color:fg,borderRadius:999,padding:`8px ${size*.8}px`,fontFamily:SANS,fontWeight:800,fontSize:size,whiteSpace:'nowrap'}}>{children}</span>;
/* editor card: file tab + gutter + typed Kotlin lines + optional highlighted range */
const Editor:React.FC<{file:string;lines:{s:string;at:number}[];hl?:{from:number;to:number;at:number};fs?:number;lh?:number;at?:number}>=({file,lines,hl,fs=40,lh=62,at=0})=>{const {f}=useS();const p=m3(f,at,'def');
 return <div {...bb('editor')} style={{background:AT.card,borderRadius:28,overflow:'hidden',border:`1.5px solid ${AT.line}`,opacity:m3(f,at,'fx'),transform:`translateY(${(1-p)*60}px) scale(${.96+.04*p})`,transformOrigin:'center top'}}>
  <div style={{display:'flex',alignItems:'flex-end',height:64,background:AT.card2,borderBottom:`1.5px solid ${AT.line}`,padding:'0 26px'}}>
   <div style={{...lbl(24,AT.ink),padding:'0 6px 14px',borderBottom:`3px solid ${AT.blue}`}}>{file}</div></div>
  <div style={{position:'relative',padding:'20px 0 26px'}}>
   {hl&&(()=>{const q=m3(f,hl.at,'fast');return <div style={{position:'absolute',left:0,right:0,top:20+hl.from*lh,height:(hl.to-hl.from+1)*lh,background:'rgba(61,220,132,.13)',borderLeft:`6px solid ${AT.green}`,opacity:Math.min(1,q),transform:`scaleX(${.6+.4*q})`,transformOrigin:'left center'}}/>})()}
   {lines.map((l,k)=>{const q=interpolate(f,[l.at,l.at+10],[0,1],cl);const src=l.s.replace(/^\\@/,'@');const shown=src.slice(0,Math.ceil(src.length*q));
    return <div key={k} style={{position:'relative',display:'flex',height:lh,alignItems:'center',fontFamily:MONO,fontWeight:500,fontStyle:'normal',fontSize:fs,whiteSpace:'pre'}}>
     <span style={{width:64,textAlign:'right',paddingRight:22,fontSize:24,color:q>0?'#6F737A':'#3A3C41'}}>{k+1}</span>{kt(shown)}</div>})}</div></div>};
/* 1. hook: topic big at frame 0 (code names), tag pill, robot on a cookie */
export const AtHook:React.FC<{tag:string;a:string;b:string;line:string;why?:{s:string;at:number}}>=({tag,a,b,line,why})=>{const {f}=useS();
 const rob=m3(f,4,'slow'),ck=m3(f,0,'slow');const w=why?m3(f,why.at,'def'):0;
 return <div style={{position:'relative',height:1320}}>
  <span {...bb('tag')}><Pill size={30}><svg width={30} height={30} viewBox="0 0 40 40"><path d={cookiePath(20,20,16,.12,9)} fill={AT.onPrim}/></svg>{tag}</Pill></span>
  <div {...bb('a')} style={{display:'inline-block',marginTop:44,fontFamily:MONO,fontWeight:700,fontSize:fitSize(a,860,116,.6),color:AT.green,whiteSpace:'nowrap',lineHeight:1.1}}>{a}</div>
  <div><span {...bb('vs')} style={{fontFamily:SANS,fontWeight:800,fontSize:70,color:AT.dim,lineHeight:1.1,margin:'6px 0',display:'inline-block'}}>vs</span></div>
  <div {...bb('b')} style={{display:'inline-block',fontFamily:MONO,fontWeight:700,fontSize:fitSize(b,880,116,.6),color:AT.ink,whiteSpace:'nowrap',lineHeight:1.1}}>{b}</div>
  <div {...bb('line')} style={{marginTop:40,fontFamily:SANS,fontWeight:800,fontSize:86,lineHeight:1.12,color:AT.ink,letterSpacing:-1,maxWidth:880}}>{line}</div>
  {why&&<div {...bb('why')} style={{marginTop:40,display:'flex',gap:18,alignItems:'center',opacity:Math.min(1,m3(f,why.at,'fx')),transform:`translateX(${(1-w)*-60}px)`}}>
   <span style={{width:14,height:56,borderRadius:7,background:AT.green,flex:'none'}}/><span style={{fontFamily:SANS,fontWeight:500,fontSize:52,color:AT.ink,lineHeight:1.25}}>{why.s}</span></div>}
  <svg style={{position:'absolute',right:-10,bottom:10}} width={360} height={360}><path d={cookiePath(180,180,150*ck,.1*(1-.4*Math.min(1,ck)),9,f*.004)} fill="rgba(61,220,132,.16)"/></svg>
  <div {...bb('robot')} style={{position:'absolute',right:50,bottom:120,transform:`scale(${rob})`,transformOrigin:'center bottom'}}><Robot s={260}/></div>
 </div>};
/* 2. code card with highlighted lines and a note */
export const AtCode:React.FC<{title:string;file:string;lines:{s:string;at:number}[];hl?:{from:number;to:number;at:number};note?:{s:string;at:number}}>=({title,file,lines,hl,note})=>{const {f}=useS();
 return <div><Title s={title}/><Editor file={file} lines={lines} hl={hl} at={4}/>
  {note&&f>=note.at-1&&(()=>{const p=m3(f,note.at,'def');return <div {...bb('note')} style={{marginTop:40,background:AT.card,borderRadius:28,padding:'26px 30px',display:'flex',gap:22,alignItems:'center',opacity:Math.min(1,m3(f,note.at,'fx')),transform:`translateY(${(1-p)*50}px)`}}>
   <svg width={56} height={56} style={{flex:'none'}} viewBox="0 0 56 56"><path d={cookiePath(28,28,24,.1,9,f*.01)} fill={AT.green}/><text x={28} y={37} textAnchor="middle" style={{fontFamily:SANS,fontWeight:800,fontSize:28,fill:AT.onPrim}}>i</text></svg>
   <span style={{fontFamily:SANS,fontWeight:500,fontSize:48,color:AT.ink,lineHeight:1.3}}>{note.s}</span></div>})()}</div>};
/* 3. compose preview: code card on top, then a square phone slot (left) + readout column (right).
   The slot is a circle-safe square: the phone's half-diagonal fits inside it, so portrait, landscape and every angle in
   between stay inside the slot and never touch the code card or the readout column. */
export const AtPreview:React.FC<{title:string;file:string;lines:{s:string;at:number}[];hl?:{from:number;to:number;at:number};taps:number[];rotateAt:number;keep:boolean;label:string;btn:string;verdict?:{s:string;at:number}}>=({title,file,lines,hl,taps,rotateAt,keep,label,btn,verdict})=>{const {f}=useS();
 const r=m3(f,rotateAt,'slow');const ang=90*r;const after=f>=rotateAt+8;
 const n=taps.filter(x=>f>=x&&(keep||!after||x>rotateAt)).length;
 const flash=interpolate(f,[rotateAt+6,rotateAt+9,rotateAt+16],[0,1,0],cl);
 const last=[...taps].reverse().find(x=>f>=x);const rip=last!=null?interpolate(f-last,[0,12],[0,1],cl):1;const bp=last!=null?m3(f,last,'fast'):1;
 const PW=230,PH=440;const SLOT=Math.ceil(Math.hypot(PW,PH))+16; // 512: diagonal + spring overshoot margin
 const pIn=m3(f,10,'def');const fin=Math.min(1,m3(f,10,'fx'));
 return <div><Title s={title} size={66} one/><Editor file={file} lines={lines} hl={hl} fs={31} lh={44} at={2}/>
  <div style={{position:'relative',height:SLOT,marginTop:26,display:'flex',gap:30}}>
   <div style={{position:'relative',width:SLOT,height:SLOT,flex:'none'}}>
    <div {...bb('phone')} style={{position:'absolute',left:(SLOT-PW)/2,top:(SLOT-PH)/2,width:PW,height:PH,transform:`translateY(${(1-pIn)*60}px) rotate(${ang}deg)`,opacity:fin,transformOrigin:'50% 50%'}}>
     <div style={{position:'absolute',inset:0,borderRadius:50,background:'#000',border:`3px solid ${AT.line}`,boxShadow:'0 24px 50px rgba(0,0,0,.6)'}}/>
     <div style={{position:'absolute',left:12,top:12,right:12,bottom:12,borderRadius:40,background:'#0D1510',overflow:'hidden'}}>
      <div style={{position:'absolute',left:'50%',top:16,width:16,height:16,marginLeft:-8,borderRadius:8,background:'#000'}}/>
      <div style={{position:'absolute',inset:0,background:'#FFFFFF',opacity:flash*.25}}/>
      <div style={{position:'absolute',left:0,right:0,top:'50%',transform:`translateY(-50%) rotate(${-ang}deg)`,display:'flex',flexDirection:'column',alignItems:'center',gap:26}}>
       <div style={{fontFamily:SANS,fontWeight:800,fontSize:30,color:'#E3EBE5',whiteSpace:'nowrap'}}>{label.replace('{n}',String(n))}</div>
       <div style={{position:'relative',overflow:'hidden',borderRadius:999,background:AT.green,padding:'14px 40px',transform:`scale(${.94+.06*bp})`}}>
        <span style={{fontFamily:SANS,fontWeight:800,fontSize:30,color:AT.onPrim}}>{btn}</span>
        {last!=null&&rip<1&&<div style={{position:'absolute',left:'50%',top:'50%',width:240,height:240,marginLeft:-120,marginTop:-120,borderRadius:120,background:'rgba(0,57,28,.25)',transform:`scale(${rip})`,opacity:1-rip}}/>}</div></div></div></div></div>
   <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',gap:22,opacity:Math.min(1,m3(f,14,'fx'))}}>
    <span {...bb('pv-label')} style={{...lbl(32,AT.ann),alignSelf:'flex-start'}}>@Preview</span>
    <span {...bb('pv-count')} style={{...lbl(40,AT.ink),alignSelf:'flex-start'}}>count = <span style={{color:AT.num}}>{n}</span></span>
    <span {...bb('pv-rot')} style={{...lbl(30,AT.dim),alignSelf:'flex-start',visibility:f>=rotateAt?'visible':'hidden'}}>↻ xoay máy</span>
    <div style={{height:70}}>{verdict&&f>=verdict.at&&(()=>{const p=m3(f,verdict.at,'fast');return <div {...bb('verdict')} style={{display:'inline-block',transform:`scale(${p})`,transformOrigin:'left center'}}>
     <Pill bg={keep?AT.green:AT.err} fg={keep?AT.onPrim:'#2A0006'} size={34}>{verdict.s}</Pill></div>})()}</div></div>
  </div></div>};
/* 4. logcat panel with D/I/W/E badges */
const LV:Record<string,[string,string]>={D:['#2F4F73','#A8C7FA'],I:['#2E5A3A','#9EE2B0'],W:['#5E5220','#F2D675'],E:['#6B2A2E','#FFB4B4']};
export const AtLogcat:React.FC<{title:string;lines:{lvl:'D'|'I'|'W'|'E';tag:string;msg:string;at:number}[];note?:{s:string;at:number}}>=({title,lines,note})=>{const {f}=useS();const p=m3(f,4,'def');
 return <div><Title s={title}/>
  <div {...bb('logcat')} style={{background:AT.panel,borderRadius:28,border:`1.5px solid ${AT.line}`,overflow:'hidden',opacity:Math.min(1,m3(f,4,'fx')),transform:`translateY(${(1-p)*60}px)`}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 28px',background:AT.card2,borderBottom:`1.5px solid ${AT.line}`}}>
    <span style={lbl(32,AT.ink)}>Logcat</span><span style={{...lbl(26,AT.dim),border:`1.5px solid ${AT.line}`,borderRadius:999,padding:'4px 16px'}}>package:mine</span></div>
   <div style={{padding:'14px 0 20px'}}>{lines.map((l,k)=>{if(f<l.at)return null;const q=m3(f,l.at,'fast');const [bg,fg]=LV[l.lvl];
    return <div key={k} style={{display:'flex',gap:18,alignItems:'flex-start',padding:'20px 28px',opacity:Math.min(1,q),transform:`translateX(${(1-q)*-40}px)`,background:l.lvl==='E'?'rgba(247,84,100,.07)':'transparent'}}>
     <span style={{flex:'none',width:54,height:54,borderRadius:14,background:bg,color:fg,fontFamily:MONO,fontWeight:800,fontSize:32,display:'flex',alignItems:'center',justifyContent:'center'}}>{l.lvl}</span>
     <div style={{fontFamily:MONO,fontSize:37,lineHeight:1.35,color:l.lvl==='E'?'#FF9C9C':l.lvl==='W'?AT.warn:AT.ink}}><span style={{color:fg}}>{l.tag}</span>  {l.msg}</div></div>})}</div></div>
  {note&&f>=note.at&&(()=>{const q=m3(f,note.at,'def');return <div {...bb('note')} style={{marginTop:48,fontFamily:SANS,fontWeight:500,fontSize:50,lineHeight:1.3,color:AT.ink,opacity:Math.min(1,m3(f,note.at,'fx')),transform:`translateY(${(1-q)*40}px)`,borderLeft:`8px solid ${AT.green}`,paddingLeft:26}}>{note.s}</div>})()}</div>};
/* 5. takeaway: pill rows (keeps / loses) + rule */
export const AtTake:React.FC<{title:string;head?:[string,string];rows:{k:string;a:string;b:string;at:number}[];rule?:{s:string;at:number}}>=({title,head,rows,rule})=>{const {f}=useS();
 return <div><Title s={title}/>
  {head&&<div {...bb('head')} style={{display:'flex',padding:'0 30px 14px',...lbl(28,AT.dim)}}><span style={{flex:1}}/><span style={{width:190,textAlign:'center'}}>{head[0]}</span><span style={{width:190,textAlign:'center'}}>{head[1]}</span></div>}
  <div style={{display:'flex',flexDirection:'column',gap:22}}>{rows.map((r,k)=>{if(f<r.at)return null;const q=m3(f,r.at,'def');
   const cell=(v:string)=>{const ok=/^(giữ|có|✓)/i.test(v);return <span style={{width:190,display:'flex',justifyContent:'center'}}><span style={{borderRadius:999,padding:'10px 26px',fontFamily:SANS,fontWeight:800,fontSize:40,background:ok?AT.green:'#3A1F23',color:ok?AT.onPrim:'#FFB4B4'}}>{v}</span></span>};
   return <div key={k} {...bb('row')} style={{display:'flex',alignItems:'center',background:AT.card,borderRadius:999,padding:'30px 30px',opacity:Math.min(1,m3(f,r.at,'fx')),transform:`translateX(${(1-q)*80}px)`}}>
    <span style={{flex:1,fontFamily:SANS,fontWeight:500,fontSize:46,color:AT.ink}}>{r.k}</span>{cell(r.a)}{cell(r.b)}</div>})}</div>
  {rule&&f>=rule.at&&(()=>{const q=m3(f,rule.at,'def');return <div {...bb('rule')} style={{marginTop:44,background:'rgba(61,220,132,.12)',border:`2px solid ${AT.green}`,borderRadius:32,padding:'28px 32px',display:'flex',gap:22,alignItems:'center',transform:`scale(${.9+.1*q})`,opacity:Math.min(1,m3(f,rule.at,'fx')),transformOrigin:'left center'}}>
   <svg width={64} height={64} style={{flex:'none'}} viewBox="0 0 64 64"><path d={cookiePath(32,32,28,.1*(1-Math.min(1,q))+.04,9,f*.01)} fill={AT.green}/></svg>
   <span style={{fontFamily:SANS,fontWeight:800,fontSize:50,lineHeight:1.25,color:AT.ink}}>{rule.s}</span></div>})()}</div>};
/* chrome: brand + page (baseline), editor tab strip, decorative gutter, faint cookie */
export const AtChrome:React.FC<{section:string;page:string}>=({section,page})=>{const {f}=useS();const B=useBrand();return <>
 <MidShapes/>
 <div {...bb('brand')} style={{position:'absolute',left:SZ.chrome.x,right:SZ.chrome.right,top:SZ.chrome.top,display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
  <div style={{display:'flex',alignItems:'baseline',gap:14}}><span style={{alignSelf:'center'}}><Robot s={48}/></span><span style={{fontFamily:SANS,fontWeight:800,fontSize:fitSize(B.wordmark,460,42,.68),lineHeight:1,color:AT.ink,letterSpacing:1,whiteSpace:'nowrap'}}>{B.wordmark}</span></div>
  <span style={{...lbl(24),lineHeight:1}}>{page}</span></div>
 <div {...bb('tabs')} style={{position:'absolute',left:SZ.chrome.x,right:SZ.chrome.right,top:SZ.chrome.top+56,height:48,display:'flex',alignItems:'flex-end',gap:30,borderBottom:`1.5px solid ${AT.line}`}}>
  <span style={{...lbl(24,AT.ink),padding:'0 4px 12px',borderBottom:`3px solid ${AT.blue}`,whiteSpace:'nowrap'}}>{section}</span>
  <span style={{flex:1}}/><span style={{...lbl(22,AT.str),paddingBottom:14}}>▶ app</span></div>
 <div style={{position:'absolute',left:30,top:SZ.content.y,width:56}}>{Array.from({length:21},(_,k)=><div key={k} style={{height:50,textAlign:'right',...lbl(20,k%5===4?'#4A4D53':'#2C2E33')}}>{k+1}</div>)}</div></>};
const PN:Record<string,string>={youtube:'YouTube',facebook:'Facebook',tiktok:'TikTok'};
/* end card: robot, brand, tagline, 3 handle tiles, CC BY 3.0 attribution (end ≤ y 1480) */
export const AtEndCard:React.FC<{dur?:number;handles?:Handle[];tagline?:string}>=({dur=90,handles,tagline=''})=>{const f=useCurrentFrame();const B=useBrand();handles=handles??B.handles;
 const S=(at:number,k:keyof typeof SPR='def')=>m3(f,at,k);const op=(at:number)=>Math.min(1,S(at,'fx'));const out=interpolate(f,[dur-10,dur],[1,0],cl);
 const ein=interpolate(f,[0,14],[0,1],{...cl,easing:Easing.bezier(.05,.7,.1,1)});
 return <AbsoluteFill data-layer="end" style={{zIndex:40,opacity:out}}><style>{FONTS}</style>
  <AbsoluteFill style={{background:AT.bg,opacity:interpolate(f,[0,8],[0,1],cl)}}/>
  <div style={{opacity:interpolate(f,[0,8],[0,1],cl)}}><MidShapes/></div>
  <div style={{position:'absolute',left:SZ.end.x,right:SZ.end.right,top:SZ.end.top+10,transform:`translateX(${120*(1-ein)}px)`,opacity:interpolate(ein,[.2,.7],[0,1],cl)}}>
   <div {...bb('e-robot')} style={{transform:`scale(${S(4,'slow')})`,transformOrigin:'left bottom',width:150}}><Robot s={150}/></div>
   <div {...bb('e-kick')} style={{display:'table',fontFamily:SANS,fontWeight:500,fontSize:46,color:AT.dim,marginTop:30,opacity:op(8)}}>Theo dõi để học</div>
   <div {...bb('e-tag')} style={{display:'table',fontFamily:SANS,fontWeight:800,fontSize:fitSize(tagline,724,92,.56),color:AT.ink,lineHeight:1.1,whiteSpace:'nowrap',opacity:op(10),transform:`translateY(${(1-S(10))*30}px)`}}>{tagline}</div>
   <div {...bb('e-name')} style={{display:'table',fontFamily:SANS,fontWeight:800,fontSize:fitSize(B.name,724,44,.6),color:AT.green,marginTop:10,opacity:op(14),whiteSpace:'nowrap'}}>{B.name}</div>
   <div style={{marginTop:44,display:'flex',flexDirection:'column',gap:18}}>{handles.map((h,k)=>{const q=S(18+k*5);return <div key={k} {...bb('e-handle')} style={{display:'flex',alignItems:'center',gap:26,background:AT.card,borderRadius:999,padding:'16px 36px 16px 18px',opacity:op(18+k*5),transform:`translateX(${(1-q)*90}px)`}}>
    <BrandTile icon={h.icon} size={68} radius={34}/><span style={{fontFamily:SANS,fontWeight:500,fontSize:30,color:AT.dim,width:150}}>{PN[h.icon??'']??h.p}</span>
    <span style={{flex:1,textAlign:'right',fontFamily:SANS,fontWeight:800,fontSize:fitSize(h.h,330,44,.58),color:AT.ink,whiteSpace:'nowrap'}}>{h.h}</span></div>})}</div>
   <div {...bb('e-legal')} style={{marginTop:40,fontFamily:SANS,fontWeight:500,fontSize:21,lineHeight:1.4,color:AT.dim,opacity:op(30)}}>The Android robot is reproduced or modified from work created and shared by Google and used according to terms described in the Creative Commons 3.0 Attribution License. Android is a trademark of Google LLC.</div>
  </div>
  <Sequence from={4}><Audio src={staticFile('sfx/outro_sting.wav')} volume={0.55}/></Sequence>
 </AbsoluteFill>};
