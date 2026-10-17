// android-tutor (ANDROID TUTOR): Android-dev explainer.
// Studio Dark (near-black bg #0B0C0E, cards #17181B, Kotlin syntax colours, editor tab bar, Logcat) + Compose Preview
// (code card beside a generic phone frame running the @Preview) + Material 3 Expressive motion: spring physics with the
// M3E spatial/effects tokens and a cookie (scallop) shape for small accents only. Scene transition = Material shared-axis X (`sharedx`, sys.tsx);
// no full-screen zoom/pop shapes (Dan found the old cookie wipe jarring).
// Legal: no official Android logo/wordmark/3D head, no Android Studio/IntelliJ/Pixel art. The robot below is our own
// simplified drawing; the end card carries the CC BY 3.0 attribution line.
import React from 'react';import {AbsoluteFill,Audio,Sequence,staticFile,interpolate,spring,useCurrentFrame,Easing} from 'remotion';
import {useS,FONTS,HeadLine} from './sys';import {useBrand,fitSize,BrandTile,Handle} from './brand';import {SZ} from './safezone';import {Fill,z,zg,zf,hid} from './fill';
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
// Main accent is exactly the official Android green #3DDC84 (developer.android.com brand guidelines) everywhere; no pastel M3 tones.
const AT_ANDROID={bg:'#0B0C0E',card:'#17181B',card2:'#121316',panel:'#101114',line:'#2A2C31',dim:'#8B8F96',ink:'#E6E8EB',green:'#3DDC84',onPrim:'#00391C',
 blue:'#3574F0',kw:'#CF8E6D',str:'#6AAB73',num:'#2AACB8',ann:'#B3AE60',fn:'#56A8F5',prop:'#C77DBB',cmt:'#7A7E85',err:'#F75464',warn:'#E5C07B',
 // generalized tokens (the At* setup scenes and the scene packs run in every theme; android-tutor keeps these exact values)
 tint:(a:number)=>`rgba(61,220,132,${a})`,warnBg:'rgba(229,192,123,.08)',errBg:'#3A1F23',errInk:'#FFB4B4',errRow:'#FF9C9C',term:'#0D0F12',out:'#A9ADB4',sub:'#C4C7CC',
 onWarn:'#2A2000',gut:'#6F737A',gut0:'#3A3C41',punct:'#BCBEC4',good:'#3DDC84',onGood:'#00391C',r:28,rp:999,head:'GSF',hw:800,up:false,light:false,news:false};
// AT is the live palette: setPal(theme) before a render; android-tutor = AT_ANDROID, any other theme = tokens derived from its look
export const AT:typeof AT_ANDROID={...AT_ANDROID};
let SANS='GSF',MONO='JBM';
export const fonts=()=>({sans:SANS,mono:MONO});
const hx=(c:string)=>{const m=/^#([0-9a-f]{6})/i.exec(c);if(!m)return [128,128,128];const n=parseInt(m[1],16);return [n>>16,(n>>8)&255,n&255]};
const mix=(a:string,b:string,k:number)=>{const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('')};
const lum=(c:string)=>{const [r,g,b]=hx(c);return (.2126*r+.7152*g+.0722*b)/255};
export const setPal=(t:any)=>{
 if(!t||t.id==='android-tutor'){Object.assign(AT,AT_ANDROID);SANS='GSF';MONO='JBM';return}
 const pal=t.pal||{};const light=lum(t.bg)>.5;const sharp=t.id==='hot-news'||t.id==='hot-news-glitch';const [r,g,b]=hx(t.accent);
 const redA=r>200&&g<90&&b<90; // red accent (news themes): success states use a real green, not the accent
 const card=pal.card??(light?'#FFFFFF':mix(t.bg,t.ink,.07));
 Object.assign(AT,{bg:t.bg,ink:t.ink,green:t.accent,onPrim:t.onAccent,blue:t.accent2&&t.accent2!==t.ink?t.accent2:t.accent,
  card,card2:pal.card2??(light?mix(t.bg,'#000000',.05):mix(t.bg,t.ink,.04)),panel:pal.panel??card,line:pal.line??(light?'rgba(17,17,17,.22)':'rgba(255,255,255,.16)'),
  dim:pal.dim??mix(t.muted,t.ink,light?.35:.45),
  err:light?'#C4002B':'#F75464',warn:light?'#B26B00':'#E5C07B',warnBg:light?'rgba(178,107,0,.08)':'rgba(229,192,123,.08)',
  errBg:light?'rgba(17,17,17,.07)':'rgba(255,255,255,.07)',errInk:pal.dim??mix(t.muted,t.ink,light?.35:.45),errRow:light?'#C4002B':'#FF9C9C',
  term:light?mix(t.bg,'#FFFFFF',.6):mix(t.bg,'#000000',.25),out:mix(t.ink,t.bg,.28),sub:mix(t.ink,t.bg,.2),onWarn:light?'#FFFFFF':'#2A2000',
  gut:mix(t.ink,t.bg,.55),gut0:mix(t.ink,t.bg,.8),punct:mix(t.ink,t.bg,.15),
  ...(light?{kw:'#A626A4',str:'#2E7D32',num:'#B35C00',ann:'#8A6D00',fn:'#1F5FD6',prop:'#C2185B',cmt:'#8A8A80'}:{kw:'#CF8E6D',str:'#6AAB73',num:'#2AACB8',ann:'#B3AE60',fn:'#56A8F5',prop:'#C77DBB',cmt:'#7A7E85'}),
  tint:(a:number)=>`rgba(${r},${g},${b},${light?a*.8:a})`,good:redA?(light?'#1E7F3C':'#3DDC84'):t.accent,onGood:redA?(light?'#FFFFFF':'#00391C'):t.onAccent,r:sharp?0:t.id==='quick-tips'?24:28,rp:sharp?0:999,
  head:t.head,hw:t.head==='Anton'||t.head==='BVPX'?400:800,up:!!t.upper,light});
 // hand-tuned per-theme pack palette (themes/<id>/theme.json look.pack) overrides the derived tokens above
 AT.news=false;const P=t.pack||{};const map:Record<string,string>={hl:'green',onHl:'onPrim',bad:'err',badBg:'errBg',badInk:'errInk',badRow:'errRow'};
 const res=(v:any)=>v==='accent'?t.accent:v==='onAccent'?t.onAccent:v==='accent2'?t.accent2:v; // follow the theme (and its variants) accent
 Object.entries(P).forEach(([k,v])=>{if(k==='tint'||k==='tintK')return;(AT as any)[map[k]??k]=res(v)});
 if(P.tint){const [tr,tg,tb]=hx(res(P.tint));const K=P.tintK??1;AT.tint=(a:number)=>`rgba(${tr},${tg},${tb},${a*K})`}
 SANS=t.body==='JBM'?'JBM':t.body;MONO=t.id==='flutter-tutor'?'GSC':'JBM'};
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
 return <svg data-deco="mid" width={1080} height={1920} style={{position:'absolute',left:0,top:0,pointerEvents:'none'}}>
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
  const col=/^"/.test(w)?AT.str:/^@/.test(w)?AT.ann:/^\d+$/.test(w)?AT.num:KW.test(w)?AT.kw:pv==='.'&&/^[a-z]/.test(w)&&nx!=='('?AT.prop:/^[a-z]\w*$/.test(w)&&(nx==='('||nx==='{')?AT.fn:/^[(){}<>,:=.]$/.test(w)?AT.punct:AT.ink;
  return <span key={k} style={{color:col}}>{w}</span>});
 if(cm)out.push(<span key="c" style={{color:AT.cmt}}>{cm}</span>);return out};
export const lbl=(size=24,c=AT.dim):React.CSSProperties=>({fontFamily:MONO,fontSize:size,color:c,fontWeight:500});
export const Title:React.FC<{s:string;at?:number;size?:number;one?:boolean}>=({s,at=0,size=80,one})=>{const {f}=useS();const p=m3(f,at,'def'),o=m3(f,at,'fx');if(one)size=fitSize(s,880,size,AT.head==='Anton'?.47:AT.head==='JBM'||AT.head==='BVPX'||AT.head==='BVPM'?.62:.54);
 return <div {...bb('title')} style={{whiteSpace:one?'nowrap':'normal',fontFamily:AT.head,fontWeight:AT.hw,textTransform:AT.up?'uppercase':'none',fontSize:size,lineHeight:AT.head==='Anton'?1.05:1.12,color:AT.ink,letterSpacing:AT.head==='Anton'?0:-1,marginBottom:34,opacity:o,transform:`translateY(${(1-p)*40}px)`}}>{s}</div>};
export const Pill:React.FC<{children:React.ReactNode;bg?:string;fg?:string;size?:number}>=({children,bg=AT.green,fg=AT.onPrim,size=30})=><span style={{display:'inline-flex',alignItems:'center',gap:10,background:bg,color:fg,borderRadius:AT.rp,padding:`8px ${size*.8}px`,fontFamily:SANS,fontWeight:800,fontSize:size,whiteSpace:'nowrap'}}>{children}</span>;
/* editor card: file tab + gutter + typed Kotlin lines + optional highlighted range */
const Editor:React.FC<{file:string;lines:{s:string;at:number}[];hl?:{from:number;to:number;at:number};fs?:number;lh?:number;at?:number}>=({file,lines,hl,fs=40,lh=62,at=0})=>{const {f}=useS();const p=m3(f,at,'def');
 return <div {...bb('editor')} style={{background:AT.card,borderRadius:AT.r,overflow:'hidden',border:`1.5px solid ${AT.line}`,opacity:m3(f,at,'fx'),transform:`translateY(${(1-p)*60}px) scale(${.96+.04*p})`,transformOrigin:'center top'}}>
  <div style={{display:'flex',alignItems:'flex-end',height:64,background:AT.card2,borderBottom:`1.5px solid ${AT.line}`,padding:'0 26px'}}>
   <div style={{...lbl(24,AT.ink),padding:'0 6px 14px',borderBottom:`3px solid ${AT.blue}`}}>{file}</div></div>
  <div style={{position:'relative',padding:'20px 0 26px'}}>
   {hl&&(()=>{const q=m3(f,hl.at,'fast');return <div style={{position:'absolute',left:0,right:0,top:20+hl.from*lh,height:(hl.to-hl.from+1)*lh,background:AT.tint(.13),borderLeft:`6px solid ${AT.green}`,opacity:Math.min(1,q),transform:`scaleX(${.6+.4*q})`,transformOrigin:'left center'}}/>})()}
   {lines.map((l,k)=>{const q=interpolate(f,[l.at,l.at+10],[0,1],cl);const src=l.s.replace(/^\\@/,'@');const shown=src.slice(0,Math.ceil(src.length*q));
    return <div key={k} style={{position:'relative',display:'flex',height:lh,alignItems:'center',fontFamily:MONO,fontWeight:500,fontStyle:'normal',fontSize:fs,whiteSpace:'pre'}}>
     <span style={{width:64,textAlign:'right',paddingRight:22,fontSize:24,color:q>0?AT.gut:AT.gut0}}>{k+1}</span>{kt(shown)}</div>})}</div></div>};
/* 1. hook: topic big at frame 0 (code names), tag pill, robot on a cookie */
export const AtHook:React.FC<{tag:string;a:string;b:string;line:string;why?:{s:string;at:number}}>=({tag,a,b,line,why})=>{const {f}=useS();
 const rob=m3(f,4,'slow'),ck=m3(f,0,'slow');const w=why?m3(f,why.at,'def'):0;
 return <div style={{position:'relative',height:1320}}>
  <span {...bb('tag')}><Pill size={30}><svg width={30} height={30} viewBox="0 0 40 40"><path d={cookiePath(20,20,16,.12,9)} fill={AT.onPrim}/></svg>{tag}</Pill></span>
  <div {...bb('a')} style={{marginTop:44,fontFamily:MONO,fontWeight:700,fontSize:fitSize(a,860,116,.6),color:AT.green,whiteSpace:'nowrap',lineHeight:1.1}}>{a}</div>
  <div><span {...bb('vs')} style={{fontFamily:SANS,fontWeight:800,fontSize:70,color:AT.dim,lineHeight:1.1,margin:'6px 0',display:'inline-block'}}>vs</span></div>
  <div {...bb('b')} style={{fontFamily:MONO,fontWeight:700,fontSize:fitSize(b,880,116,.6),color:AT.ink,whiteSpace:'nowrap',lineHeight:1.1}}>{b}</div>
  <div {...bb('line')} style={{marginTop:40,fontFamily:SANS,fontWeight:800,fontSize:86,lineHeight:1.12,color:AT.ink,letterSpacing:-1,maxWidth:880}}>{line}</div>
  {why&&<div {...bb('why')} style={{marginTop:40,display:'flex',gap:18,alignItems:'center',opacity:Math.min(1,m3(f,why.at,'fx')),transform:`translateX(${(1-w)*-60}px)`}}>
   <span style={{width:14,height:56,borderRadius:7,background:AT.green,flex:'none'}}/><span style={{fontFamily:SANS,fontWeight:500,fontSize:52,color:AT.ink,lineHeight:1.25}}>{why.s}</span></div>}
  <svg style={{position:'absolute',right:-10,bottom:10}} width={360} height={360}><path d={cookiePath(180,180,150*ck,.1*(1-.4*Math.min(1,ck)),9,f*.004)} fill="rgba(61,220,132,.16)"/></svg>
  <div {...bb('robot')} style={{position:'absolute',right:50,bottom:120,transform:`scale(${rob})`,transformOrigin:'center bottom'}}><Robot s={260}/></div>
 </div>};
/* 2. code card with highlighted lines and a note */
export const AtCode:React.FC<{title:string;file:string;lines:{s:string;at:number}[];hl?:{from:number;to:number;at:number};note?:{s:string;at:number}}>=({title,file,lines,hl,note})=>{const {f}=useS();
 return <div><Title s={title}/><Editor file={file} lines={lines} hl={hl} at={4}/>
  {note&&f>=note.at-1&&(()=>{const p=m3(f,note.at,'def');return <div {...bb('note')} style={{marginTop:40,background:AT.card,borderRadius:AT.r,padding:'26px 30px',display:'flex',gap:22,alignItems:'center',opacity:Math.min(1,m3(f,note.at,'fx')),transform:`translateY(${(1-p)*50}px)`}}>
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
const vb=(n:string,v:boolean)=>v?bb(n):{};
export const AtTake:React.FC<{title:string;head?:[string,string];rows:{k:string;a:string;b:string;at:number;win?:'a'|'b'|'both'|'none'}[];rule?:{s:string;at:number}}>=({title,head,rows,rule})=>{const {f}=useS();const vr=!!rule&&f>=rule.at;
 return <Fill head={<Title s={title}/>}>
  {head&&<div {...bb('head')} style={{display:'flex',padding:`0 30px ${z(14)}`,...lbl(z(28) as any,AT.dim)}}><span style={{flex:1}}/><span style={{width:190,textAlign:'center'}}>{head[0]}</span><span style={{width:190,textAlign:'center'}}>{head[1]}</span></div>}
  <div style={{display:'flex',flexDirection:'column',gap:zg(22)}}>{rows.map((r,k)=>{const vis=f>=r.at;const q=m3(f,r.at,'def');
   const cell=(v:string,side:'a'|'b')=>{const ok=r.win?(r.win===side||r.win==='both'):/^(giữ|có|✓)/i.test(v);return <span style={{width:190,display:'flex',justifyContent:'center'}}><span style={{borderRadius:AT.rp,padding:`${z(10)} 26px`,fontFamily:SANS,fontWeight:800,fontSize:zf(v,140,40,.5),whiteSpace:'nowrap',background:ok?AT.green:AT.errBg,color:ok?AT.onPrim:AT.errInk}}>{v}</span></span>};
   return <div key={k} {...vb('row',vis)} style={{...hid(vis),display:'flex',alignItems:'center',background:AT.card,borderRadius:AT.rp,padding:`${z(30)} 30px`,opacity:Math.min(1,m3(f,r.at,'fx')),transform:`translateX(${(1-q)*80}px)`}}>
    <span style={{flex:1,minWidth:0,whiteSpace:'nowrap',paddingRight:12,fontFamily:SANS,fontWeight:500,fontSize:zf(r.k,420,46,.52),color:AT.ink}}>{r.k}</span>{cell(r.a,'a')}{cell(r.b,'b')}</div>})}</div>
  {rule&&(()=>{const q=m3(f,rule.at,'def');return <div {...vb('rule',vr)} style={{...hid(vr),marginTop:zg(44),background:AT.tint(.12),border:`2px solid ${AT.green}`,borderRadius:AT.r,padding:`${z(28)} 32px`,display:'flex',gap:22,alignItems:'center',transform:`scale(${.9+.1*q})`,opacity:Math.min(1,m3(f,rule.at,'fx')),transformOrigin:'left center'}}>
   <svg width={64} height={64} style={{flex:'none'}} viewBox="0 0 64 64"><path d={cookiePath(32,32,28,.1*(1-Math.min(1,q))+.04,9,f*.01)} fill={AT.green}/></svg>
   <span style={{fontFamily:SANS,fontWeight:800,fontSize:z(50),lineHeight:1.25,color:AT.ink}}>{rule.s}</span></div>})()}</Fill>};
/* ── info-graphic scenes for procedural / setup narration (AtSteps, AtTerm, AtPackages, AtDevice, AtSpec) ──
   Reel-size readability floor (canvas px; ×0.795 on the 1080 frame): body ≥ 46, mono ≥ 40, labels ≥ 30.
   The newest unfinished row is "active" (green outline); older unfinished rows step back (opacity .62)
   so the eye always lands on what is being said right now. */
export const Tick:React.FC<{s?:number;c?:string}>=({s=34,c=AT.onPrim})=><svg width={s} height={s} viewBox="0 0 24 24"><path d="M4.5 12.5 10 18 19.5 6.5" stroke={c} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
// focus state of row k: act 0..1 = is the newest shown row and not yet done; back 0..1 = a newer row has arrived and this one is not done
export const focus=(f:number,ats:number[],k:number,done:boolean)=>{const nx=ats.slice(k+1).filter(a=>f>=a).sort((a,b)=>a-b)[0];
 const back=nx!=null&&!done?Math.min(1,m3(f,nx,'fx')):0;return {act:done?0:Math.min(1,m3(f,ats[k],'fx'))*(1-back),back}};
export const Note:React.FC<{s:string;at:number;size?:number}>=({s,at,size=50})=>{const {f}=useS();const v=f>=at;const q=m3(f,at,'def');
 return <div {...(v?bb('note'):{})} style={{...hid(v),marginTop:zg(44),fontFamily:SANS,fontWeight:500,fontSize:z(size),lineHeight:1.3,color:AT.ink,opacity:Math.min(1,m3(f,at,'fx')),transform:`translateY(${(1-q)*40}px)`,borderLeft:`8px solid ${AT.green}`,paddingLeft:26}}>{s}</div>};
/* 6. stepper: numbered rows slide in at `at`, joined by a rail that turns green below finished steps.
   ok → green circle + tick pop; warn → amber "!" (a branch / "if not" case); no ok/warn = listed item. */
export const AtSteps:React.FC<{title:string;steps:{s:string;at:number;ok?:number;warn?:number}[];note?:{s:string;at:number}}>=({title,steps,note})=>{const {f}=useS();const ats=steps.map(s=>s.at);
 return <Fill head={<Title s={title} one={steps.length>4||(!!note&&steps.length>3)}/>}>
  <div style={{display:'flex',flexDirection:'column'}}>{steps.map((st,k)=>{const vis=f>=st.at;const q=m3(f,st.at,'def');
   const done=st.ok!=null&&f>=st.ok;const dq=done?m3(f,st.ok!,'fast'):0;const wn=!done&&st.warn!=null&&f>=st.warn;const wq=wn?m3(f,st.warn!,'fast'):0;
   const {act,back}=vis?focus(f,ats,k,done||wn):{act:0,back:0};const col=done?AT.green:wn?AT.warn:AT.green;
   const prevDone=k>0&&steps[k-1].ok!=null&&f>=steps[k-1].ok!;
   return <div key={k} style={{...hid(vis),opacity:Math.min(1,m3(f,st.at,'fx'))*(1-.32*back),transform:`translateX(${(1-q)*70}px)`}}>
    {k>0&&<div style={{marginLeft:`calc(30px + ${z(38)})`,width:4,height:zg(28),borderRadius:2,background:prevDone?AT.green:AT.line}}/>}
    <div {...vb('step',vis)} style={{display:'flex',alignItems:'center',gap:26,background:done?AT.tint(.11):wn?AT.warnBg:`${AT.tint(.05*act)}`,
     border:`${2+1*act}px solid ${done?AT.green:wn?AT.warn:act>.5?AT.green:AT.line}`,borderRadius:AT.r,padding:`${z(28)} 30px`,boxShadow:act>0?`0 0 0 ${6*act}px ${AT.tint(.10)}`:'none'}}>
     <span style={{flex:'none',width:z(80),height:z(80),borderRadius:999,background:done?AT.green:wn?AT.warn:AT.card2,border:`3px solid ${done||wn?col:act>.5?AT.green:AT.line}`,display:'flex',alignItems:'center',justifyContent:'center',
      transform:done?`scale(${.7+.3*Math.min(1.3,dq)})`:wn?`scale(${.7+.3*Math.min(1.3,wq)})`:'none'}}>
      {done?<Tick s={38}/>:wn?<span style={{fontFamily:SANS,fontWeight:900,fontSize:z(44),color:AT.onWarn}}>!</span>
       :<span style={{fontFamily:MONO,fontWeight:800,fontSize:z(36),color:act>.5?AT.green:AT.dim}}>{k+1}</span>}</span>
     <span style={{flex:1,fontFamily:SANS,fontWeight:700,fontSize:zf(st.s,1300,54,.5),color:AT.ink,lineHeight:1.22}}>{st.s}</span></div></div>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};
/* 7. real terminal: "$" lines type in with a block cursor, output lines (out:true) fade in dimmed ("#…" = comment),
   ok → green ✓ at line end, hl → output row tinted green (the result that matters). No file tab / gutter: a shell, not an editor. */
export const AtTerm:React.FC<{title:string;dir?:string;shell?:string;lines:{s:string;at:number;out?:boolean;ok?:number;hl?:number}[];note?:{s:string;at:number}}>=({title,dir='~/app',shell='zsh',lines,note})=>{const {f}=useS();const p=m3(f,4,'def');
 const shown=lines.filter(l=>f>=l.at);const last=shown[shown.length-1];
 return <Fill head={<Title s={title} one/>}>
  <div {...bb('term')} style={{background:AT.term,borderRadius:AT.r,border:`1.5px solid ${AT.line}`,overflow:'hidden',opacity:Math.min(1,m3(f,4,'fx')),transform:`translateY(${(1-p)*60}px)`}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:`${z(20)} 30px`,background:AT.card2,borderBottom:`1.5px solid ${AT.line}`}}>
    <span style={lbl(z(32) as any,AT.ink)}>Terminal</span><span style={{...lbl(z(28) as any,AT.dim),border:`1.5px solid ${AT.line}`,borderRadius:AT.rp,padding:'4px 18px'}}>{shell} · {dir}</span></div>
   <div style={{padding:`${z(26)} 0 ${z(30)}`,display:'flex',flexDirection:'column',gap:zg(10),minHeight:200}}>
   {lines.map((l,k)=>{const vis=f>=l.at;const done=l.ok!=null&&f>=l.ok;const dq=done?m3(f,l.ok!,'fast'):0;
    const tick=done&&<span style={{marginLeft:18,color:AT.green,fontWeight:800,display:'inline-block',transform:`scale(${Math.min(1.2,dq)})`,transformOrigin:'left center'}}>✓</span>;
    if(l.out){const q=m3(f,l.at,'fx');const cm=l.s.startsWith('#');const h=l.hl!=null&&f>=l.hl?m3(f,l.hl,'fast'):0;
     return <div key={k} style={{...hid(vis),position:'relative',display:'flex',alignItems:'center',padding:`${z(8)} 30px ${z(8)} 82px`,fontFamily:MONO,fontWeight:500,fontSize:zf(l.s,752,42,.6),color:cm?AT.cmt:done||h?AT.ink:AT.out,opacity:Math.min(1,q),transform:`translateX(${(1-q)*-30}px)`}}>
      {h>0&&<span style={{position:'absolute',inset:0,background:AT.tint(.13),borderLeft:`6px solid ${AT.green}`,transform:`scaleX(${.6+.4*Math.min(1,h)})`,transformOrigin:'left center'}}/>}
      <span style={{position:'relative',whiteSpace:'pre'}}>{/^\[✓\]/.test(l.s)?<><span style={{color:AT.green,fontWeight:800}}>[✓]</span>{l.s.slice(3)}</>:l.s}</span>{tick}</div>}
    const q=interpolate(f,[l.at,l.at+12],[0,1],cl);const txt=l.s.slice(0,Math.ceil(l.s.length*q));const cur=l===last&&(q<1||Math.floor(f/16)%2===0);
    return <div key={k} style={{...hid(vis),display:'flex',alignItems:'center',padding:`${z(8)} 30px`,fontFamily:MONO,fontWeight:600,fontSize:zf(l.s,782,46,.6),opacity:Math.min(1,m3(f,l.at,'fx'))}}>
     <span style={{width:52,flex:'none',color:AT.green,fontWeight:800}}>$</span><span style={{color:AT.ink,whiteSpace:'pre'}}>{txt}</span>
     {cur&&<span data-deco="cursor" style={{display:'inline-block',width:22,height:'1em',marginLeft:4,background:AT.green,opacity:.85}}/>}{tick}</div>})}</div></div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};
/* 8. package/settings window: checkbox rows slide in at `at`, box fills green at `ok` (falls back to `at`), meta on its own line.
   Header pill counts ticked rows n/m. */
export const AtPackages:React.FC<{title:string;head?:string;rows:{s:string;meta?:string;at:number;ok?:number}[];note?:{s:string;at:number}}>=({title,head='SDK Manager',rows,note})=>{const {f}=useS();const p=m3(f,4,'def');
 const n=rows.filter(r=>f>=(r.ok??r.at)).length;const ats=rows.map(r=>r.at);
 return <Fill head={<Title s={title} one/>}>
  <div {...bb('pkg')} style={{background:AT.panel,borderRadius:AT.r,border:`1.5px solid ${AT.line}`,overflow:'hidden',opacity:Math.min(1,m3(f,4,'fx')),transform:`translateY(${(1-p)*60}px)`}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:`${z(20)} 30px`,background:AT.card2,borderBottom:`1.5px solid ${AT.line}`}}>
    <span style={lbl(z(32) as any,AT.ink)}>{head}</span><span style={{...lbl(z(30) as any,n===rows.length?AT.onPrim:AT.green),background:n===rows.length?AT.green:'transparent',border:`1.5px solid ${AT.green}`,borderRadius:AT.rp,padding:'4px 18px',fontWeight:800}}>{n}/{rows.length}</span></div>
   <div style={{padding:`${z(8)} 0 ${z(12)}`,minHeight:150}}>{rows.map((r,k)=>{const vis=f>=r.at;const q=m3(f,r.at,'def');const ck=r.ok??r.at;const done=f>=ck;const dq=done?m3(f,ck,'fast'):0;const {act}=vis?focus(f,ats,k,done):{act:0};
    return <div key={k} style={{...hid(vis),display:'flex',alignItems:'center',gap:26,padding:`${zg(28)} 30px`,borderTop:k?`1.5px solid ${AT.line}`:'none',background:`${AT.tint(.06*act)}`,opacity:Math.min(1,m3(f,r.at,'fx')),transform:`translateX(${(1-q)*-50}px)`}}>
     <span style={{flex:'none',width:z(58),height:z(58),borderRadius:14,border:`3px solid ${done?AT.green:act>.5?AT.green:AT.dim}`,background:done?AT.green:'transparent',display:'flex',alignItems:'center',justifyContent:'center',transform:done?`scale(${.8+.25*Math.min(1.25,dq)})`:'none'}}>
      {done&&<Tick s={34}/>}</span>
     <div style={{flex:1}}><div style={{fontFamily:SANS,fontWeight:700,fontSize:zf(r.s,1250,52,.5),color:AT.ink,lineHeight:1.2}}>{r.s}</div>
      {r.meta&&<div style={{...lbl(z(32) as any,AT.dim),marginTop:6}}>{r.meta}</div>}</div></div>})}</div></div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};
/* 9. where the app runs: one card per device (phone / mac glyph + name + badge), settings rows inside (on:true → green ON chip),
   ok → green outline + tick. Cards stack vertically so names and settings stay reel-readable. */
const DevGlyph:React.FC<{kind?:'phone'|'mac';c:string}>=({kind,c})=>kind==='mac'
 ?<svg width={120} height={96} viewBox="0 0 120 96"><rect x={16} y={8} width={88} height={60} rx={8} fill="none" stroke={c} strokeWidth={5}/><path d="M4 80 H116 L108 90 H12 Z" fill={c}/></svg>
 :<svg width={120} height={110} viewBox="0 0 120 110"><rect x={34} y={4} width={52} height={100} rx={12} fill="none" stroke={c} strokeWidth={5}/><rect x={50} y={12} width={20} height={5} rx={2.5} fill={c}/></svg>;
export const AtDevice:React.FC<{title:string;devices:{kind?:'phone'|'mac';name:string;badge?:string;at:number;ok?:number;screen?:{s:string;at:number;on?:boolean}[]}[];note?:{s:string;at:number}}>=({title,devices,note})=>{const {f}=useS();const ats=devices.map(d=>d.at);
 return <Fill head={<Title s={title} one/>}>
  <div style={{display:'flex',flexDirection:'column',gap:zg(24)}}>
  {devices.map((d,k)=>{const vis=f>=d.at;const q=m3(f,d.at,'def');const done=d.ok!=null&&f>=d.ok;const dq=done?m3(f,d.ok!,'fast'):0;const {act}=vis?focus(f,ats,k,done):{act:0};
   const c=done||act>.5?AT.green:AT.dim;
   return <div key={k} {...vb('dev',vis)} style={{...hid(vis),display:'flex',alignItems:'center',gap:22,background:done?AT.tint(.09):AT.card,border:`${2+act}px solid ${done||act>.5?AT.green:AT.line}`,borderRadius:AT.r,padding:`${z(30)} 28px ${z(30)} 14px`,
    opacity:Math.min(1,m3(f,d.at,'fx')),transform:`translateY(${(1-q)*60}px)`}}>
    <span style={{flex:'none'}}><DevGlyph kind={d.kind} c={c}/></span>
    <div style={{flex:1,minWidth:0}}>
     <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}><span style={{fontFamily:SANS,fontWeight:800,fontSize:zf(d.name,480,54,.52),color:AT.ink,lineHeight:1.15,whiteSpace:'nowrap'}}>{d.name}</span>
      {d.badge&&<span style={{...lbl(z(28) as any,AT.dim),border:`1.5px solid ${AT.line}`,borderRadius:AT.rp,padding:'2px 14px',whiteSpace:'nowrap'}}>{d.badge}</span>}</div>
     {(d.screen??[]).map((r,j)=>{const rv=f>=r.at;const rq=m3(f,r.at,'fast');
      return <div key={j} style={{...hid(rv),display:'flex',alignItems:'center',gap:16,marginTop:z(12),opacity:Math.min(1,m3(f,r.at,'fx')),transform:`translateX(${(1-rq)*-24}px)`}}>
       <span style={{fontFamily:MONO,fontSize:zf(r.s,560,38,.6),color:r.on?AT.ink:AT.out}}>{r.s}</span>
       {r.on&&<span style={{fontFamily:MONO,fontWeight:800,fontSize:z(28),color:AT.onPrim,background:AT.green,borderRadius:AT.rp,padding:'3px 16px',display:'inline-block',transform:`scale(${Math.min(1.1,rq)})`}}>ON</span>}</div>})}</div>
    {d.ok!=null&&<span style={{flex:'none',width:66,height:66,borderRadius:33,background:done?AT.green:'transparent',border:`3px solid ${done?AT.green:AT.line}`,display:'flex',alignItems:'center',justifyContent:'center',transform:done?`scale(${.7+.3*Math.min(1.3,dq)})`:'none'}}>{done&&<Tick s={34}/>}</span>}
   </div>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};
/* 10. spec tiles (recap of requirements): 2-column grid, big value pops at `at`, tile turns green at `ok` (or on pop). */
export const AtSpec:React.FC<{title:string;tiles:{big:string;small:string;at:number;ok?:number}[];note?:{s:string;at:number}}>=({title,tiles,note})=>{const {f}=useS();
 return <Fill head={<Title s={title} one/>}>
  <div style={{display:'flex',flexWrap:'wrap',columnGap:24,rowGap:zg(24)}}>
  {tiles.map((t,k)=>{const vis=f>=t.at;const q=m3(f,t.at,'def');const done=vis&&f>=(t.ok??t.at);
   return <div key={k} {...vb('tile',vis)} style={{...hid(vis),width:435,boxSizing:'border-box',background:done?AT.tint(.09):AT.card,border:`2.5px solid ${done?AT.green:AT.line}`,borderRadius:AT.r,padding:`${z(26)} 30px ${z(24)}`,opacity:Math.min(1,m3(f,t.at,'fx')),transform:`scale(${.85+.15*q})`,transformOrigin:'left bottom'}}>
    <div style={{fontFamily:MONO,fontWeight:800,fontSize:zf(t.big,370,104,.62),color:done?AT.green:AT.ink,lineHeight:1.05,whiteSpace:'nowrap'}}>{t.big}</div>
    <div style={{fontFamily:SANS,fontWeight:600,fontSize:zf(t.small,740,36,.5),color:AT.sub,marginTop:z(10),lineHeight:1.2}}>{t.small}</div></div>})}</div>
  {note&&<Note s={note.s} at={note.at}/>}</Fill>};
/* chrome: slim header (robot + brand left, page right, one line in SZ.header), decorative gutter, mid-ground shapes.
   The file name lives on the code card tab (AtCode/AtPreview), not in a strip under the header. */
export const AtChrome:React.FC<{section:string;page:string}>=({section,page})=>{const {f}=useS();const B=useBrand();return <>
 <MidShapes/>
 <HeadLine left={<><span style={{alignSelf:'center',display:'flex',marginRight:12}}><Robot s={34}/></span><span style={{fontFamily:SANS,fontWeight:800,fontSize:fitSize(B.wordmark,420,30,.68),lineHeight:1,color:AT.ink,letterSpacing:1,whiteSpace:'nowrap'}}>{B.wordmark}</span></>}
  right={<span style={{...lbl(22),lineHeight:1}}>{page}</span>} rule={`1.5px solid ${AT.line}`}/>
 <div style={{position:'absolute',left:30,top:SZ.content.y,width:56}}>{Array.from({length:22},(_,k)=><div key={k} style={{height:50,textAlign:'right',...lbl(20,k%5===4?'#4A4D53':'#2C2E33')}}>{k+1}</div>)}</div></>};
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
