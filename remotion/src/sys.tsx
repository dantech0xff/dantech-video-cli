import React,{createContext,useContext} from 'react';
import {AbsoluteFill,Audio,OffthreadVideo,Sequence,staticFile,useCurrentFrame,interpolate,Easing,random} from 'remotion';
import {Theme} from './themes';
export const FONTS=`@font-face{font-family:Anton;src:url(${staticFile('fonts/anton.ttf')})}@font-face{font-family:Barlow;src:url(${staticFile('fonts/barlow.ttf')})}@font-face{font-family:JBM;src:url(${staticFile('fonts/jbm.ttf')});font-weight:100 800}@font-face{font-family:BVPX;src:url(${staticFile('fonts/bvp_xb.ttf')})}@font-face{font-family:BVPM;src:url(${staticFile('fonts/bvp_md.ttf')})}`;
export const Ctx=createContext<{t:Theme;f:number;exit:number}>(null as any);
export const useS=()=>useContext(Ctx);
const EO=Easing.bezier(.16,1,.3,1),EIO=Easing.bezier(.7,0,.2,1);
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const H=(t:Theme,size:number,c?:string):React.CSSProperties=>({fontFamily:t.head,fontWeight:t.head==='JBM'?800:400,fontSize:size,color:c??t.ink,lineHeight:t.head==='BVPX'?1.12:1.02,textTransform:t.upper?'uppercase':'none',letterSpacing:t.head==='BVPX'?-2:0});
export const Bd=(t:Theme,size:number,c?:string):React.CSSProperties=>({fontFamily:t.body,fontWeight:t.body==='JBM'?500:400,fontSize:size,color:c??t.ink,lineHeight:1.25});
/* staggered element: entry by theme, staggered exit */
export const It:React.FC<{i?:number;at?:number;children:React.ReactNode;style?:React.CSSProperties;origin?:string}>=({i=0,at,children,style,origin='left center'})=>{const {t,f,exit}=useS();const start=at??i*4;
 const lf=Math.floor((f-start)/t.step)*t.step;if(lf<0)return null;
 const ex=interpolate(exit,[i*0.06,Math.min(1,0.5+i*0.06)],[0,1],cl);
 let tr='',op=1,clip='none';
 if(t.entry==='slam'){const p=interpolate(lf,[0,7],[0,1],{...cl,easing:EO});tr=`scale(${1.25-0.25*p})`;op=interpolate(lf,[0,2],[0,1],cl);clip=`inset(0 ${100-interpolate(lf,[0,5],[0,100],{...cl,easing:EO})}% 0 0)`}
 else if(t.entry==='rise'){const p=interpolate(lf,[0,14],[0,1],{...cl,easing:EO});tr=`translateY(${(1-p)*80}px) rotate(${(1-p)*-3}deg)`;op=p}
 else {const p=interpolate(lf,[0,10],[0,1],{...cl,easing:EO});clip=`inset(0 ${100-p*100}% 0 0)`;tr=`translateX(${(1-p)*-20}px)`}
 tr+=` translateY(${-ex*120}px)`;op*=1-ex;
 return <div style={{transform:tr,opacity:op,clipPath:clip,transformOrigin:origin,...style}}>{children}</div>};
export const Media:React.FC<{src:string;h:number;pos?:string;label?:string}>=({src,h,pos='center',label})=>{const {t}=useS();
 const filt=t.video==='halftone'?'grayscale(1) contrast(1.9) brightness(1.3)':t.video==='mono'?'grayscale(1) contrast(1.25)':'saturate(1.1)';
 return <div style={{position:'relative',height:h,border:`6px solid ${t.ink}`,overflow:'hidden',borderRadius:t.id==='quick-tips'?28:0}}>
 <OffthreadVideo src={staticFile(src)} muted style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:pos,filter:filt}}/>
 {t.video==='halftone'&&<><AbsoluteFill style={{backgroundImage:`radial-gradient(circle, transparent 2.2px, ${t.bg} 4.6px)`,backgroundSize:'11px 11px',mixBlendMode:'lighten',opacity:.5}}/><AbsoluteFill style={{background:t.bg,mixBlendMode:'multiply'}}/></>}
 {label&&<div style={{position:'absolute',bottom:0,left:0,background:t.ink,color:t.bg,...Bd(t,24,t.bg),padding:'4px 12px'}}>{label}</div>}</div>};
export const AccentBar:React.FC<{children:React.ReactNode;size:number}>=({children,size})=>{const {t}=useS();return <span style={{...H(t,size,t.onAccent),background:t.accent,padding:t.head==='Anton'?'6px 22px 0':'4px 22px',display:'inline-block',whiteSpace:'nowrap',borderRadius:t.id==='quick-tips'?18:0}}>{children}</span>};
export const Kicker:React.FC<{n:string;txt:string}>=({n,txt})=>{const {t}=useS();return <It i={0}><div style={{display:'flex',alignItems:'center',gap:16,borderBottom:`3px solid ${t.rule}`,paddingBottom:10,marginBottom:26}}><span style={{...H(t,38,t.bg),background:t.ink,padding:'4px 14px',borderRadius:t.id==='quick-tips'?10:0}}>{n}</span><span style={{...Bd(t,32),letterSpacing:2}}>{t.id==='tech-explain'?'// ':''}{txt}</span></div></It>};
export const Stamp:React.FC<{at:number;text:string;sub?:string;style?:React.CSSProperties}>=({at,text,sub,style})=>{const {t,f,exit}=useS();if(f<at)return null;const p=interpolate(f-at,[0,6],[0,1],{...cl,easing:EO});
 return <div style={{position:'absolute',border:`8px solid ${t.stamp??t.accent}`,outline:`3px solid ${t.stamp??t.accent}`,outlineOffset:6,padding:'10px 26px 4px',color:t.stamp??t.accent,transform:`rotate(-10deg) scale(${1.8-0.8*p})`,opacity:p*(1-exit),mixBlendMode:t.id==='hot-news'?'multiply':'normal',textAlign:'center',borderRadius:t.id==='quick-tips'?20:0,...style}}>
 <div style={{...H(t,80,t.stamp??t.accent)}}>{text}</div>{sub&&<div style={{...Bd(t,24,t.stamp??t.accent),letterSpacing:3}}>{sub}</div>}</div>};
/* ---------- brand chrome (shared device across themes) ---------- */
export const Chrome:React.FC<{section:string;page:string;date:string}>=({section,page,date})=>{const {t}=useS();return <>
 <div style={{position:'absolute',left:0,top:0,bottom:0,width:96,background:t.accent,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{transform:'rotate(-90deg)',whiteSpace:'nowrap',fontFamily:'Anton',fontSize:62,color:t.onAccent,letterSpacing:6}}>DAN TECH ■ DAN TECH ■ DAN TECH</div></div>
 <div style={{position:'absolute',left:136,right:50,top:70,borderBottom:`6px solid ${t.ink}`,paddingBottom:12,display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
  <div style={{fontFamily:'Anton',fontSize:96,color:t.ink,lineHeight:1}}>DAN TECH<span style={{color:t.accent}}>■</span></div><div style={{...Bd(t,28),textAlign:'right',lineHeight:1.15}}>{page}<br/>{date}</div></div>
 <div style={{position:'absolute',left:136,right:50,top:208,...Bd(t,30),borderBottom:`2px solid ${t.rule}`,paddingBottom:8}}>{section}</div></>};
/* tech-explain chrome: editor tab bar + line-number gutter + prompt line */
export const TermChrome:React.FC<{section:string;page:string;idx:number}>=({section,page,idx})=>{const {t}=useS();return <>
 <div style={{position:'absolute',left:0,right:0,top:0,height:110,background:t.accent,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 50px 0 40px'}}>
  <div style={{fontFamily:'JBM',fontWeight:800,fontSize:56,color:t.onAccent,letterSpacing:-1}}>DAN/TECH<span style={{opacity:.55}}>.git</span></div>
  <div style={{fontFamily:'JBM',fontWeight:700,fontSize:32,color:t.onAccent}}>main ▸ {page}</div></div>
 <div style={{position:'absolute',left:0,top:110,bottom:0,width:96,borderRight:`3px solid ${t.rule}`}}>{Array.from({length:23},(_,k)=><div key={k} style={{position:'absolute',right:18,top:44+k*66,fontFamily:'JBM',fontSize:26,color:k===idx*3+3?t.accent:t.muted}}>{k+1}</div>)}</div>
 <div style={{position:'absolute',left:136,right:50,top:150,fontFamily:'JBM',fontSize:32,color:t.muted,borderBottom:`3px solid ${t.rule}`,paddingBottom:18,whiteSpace:'nowrap',overflow:'hidden'}}><span style={{color:t.accent2}}>~/commit</span> <span style={{color:t.ink}}>❯</span> {section}</div></>};
export const Captions:React.FC<{words:{t:string;s:number;e:number}[]}>=({words})=>{const {t}=useS();const f=useCurrentFrame();const tm=f/30;const i=words.findIndex(w=>tm<w.e+0.05);if(i<0||tm<words[i].s-0.3)return null;const g=Math.floor(i/3)*3;
 return <div style={{position:'absolute',left:136,right:50,top:1640,display:'flex',gap:12,flexWrap:'wrap'}}>{words.slice(g,g+3).map((w,k)=>{const a=g+k===i;const p=interpolate(tm,[w.s-0.05,w.s+0.08],[0,1],cl);
  return <span key={k} style={{...H(t,t.head==='Anton'?72:62,a?t.onAccent:t.bg),textTransform:'uppercase',background:a?t.accent:t.ink,padding:t.head==='Anton'?'6px 18px 0':'6px 18px',borderRadius:t.id==='quick-tips'?14:0,transform:`translateY(${a?-6*p:0}px)`}}>{w.t.replace(/[.,!?:]$/,'')}</span>})}</div>};
/* ---------- timeline with designed transitions ---------- */
export type Scene={dur:number;el:React.ReactNode;section:string;out?:'page'|'bar'|'zoom'|'push'|'stack'|'morph'|'scroll';focus?:[number,number];morph?:{from:number[];to:number[];txt:string}};
const T=16;
export const Timeline:React.FC<{t:Theme;scenes:Scene[];words:any[];voice:string;sfx:{at:number;s:string;v?:number}[];date:string}>=({t,scenes,words,voice,sfx,date})=>{const f=useCurrentFrame();
 const starts=scenes.reduce<number[]>((a,s,i)=>[...a,(a[i]??0)+s.dur],[0]);
 const layers:React.ReactNode[]=[];let overlay:React.ReactNode=null;
 scenes.forEach((s,i)=>{const a=starts[i]-(i>0?T/2:0),b=starts[i+1]+(i<scenes.length-1?T/2:0);if(f<a||f>=b)return;
  const inP=i>0?interpolate(f,[starts[i]-T/2,starts[i]+T/2],[0,1],{...cl,easing:EIO}):1;
  const outP=i<scenes.length-1?interpolate(f,[starts[i+1]-T/2,starts[i+1]+T/2],[0,1],{...cl,easing:EIO}):0;
  const exitStag=i<scenes.length-1&&['bar','morph','stack','push'].includes(s.out??'bar')?interpolate(f,[starts[i+1]-T-6,starts[i+1]-2],[0,1],cl):0;
  const kin=i>0?scenes[i-1].out??'bar':'bar',kout=s.out??'bar';
  let st:React.CSSProperties={};let z=1;
  const blur=(p:number,k=14)=>`blur(${Math.sin(Math.PI*p)*k}px)`;
  if(outP>0){ if(kout==='page'){st={transform:`perspective(1600px) translateX(${-outP*700}px) rotateY(${outP*-35}deg)`,transformOrigin:'left center',filter:blur(outP),boxShadow:`${40*outP}px 0 60px rgba(0,0,0,${.35*outP})`};z=2}
   else if(kout==='zoom'){const [fx,fy]=s.focus??[540,900];st={transform:`scale(${1+Math.pow(outP,2.2)*14})`,transformOrigin:`${fx}px ${fy}px`,filter:blur(outP,6),opacity:outP>.75?interpolate(outP,[.75,.9],[1,0],cl):1};z=2}
   else if(kout==='push'){st={transform:`translateY(${-outP*1920}px)`,filter:blur(outP,18)}}
   else if(kout==='stack'){st={transform:`scale(${1-.1*outP})`,filter:`brightness(${1-.5*outP})`,borderRadius:40*outP,overflow:'hidden'}}
   else if(kout==='scroll'){st={transform:`translateY(${-Math.round(outP*9)/9*1920}px)`}}
   else if(kout==='bar'||kout==='morph'){st={opacity:outP<.5?1:0}}}
  if(i>0&&inP<1){ if(kin==='page'){st={...st,transform:`translateX(${(1-inP)*260}px)`,filter:`brightness(${.75+.25*inP})`};z=1}
   else if(kin==='zoom'){st={...st,transform:`scale(${.82+.18*inP})`,opacity:interpolate(inP,[.55,.8],[0,1],cl)};z=3}
   else if(kin==='push'){st={...st,transform:`translateY(${(1-inP)*1920}px)`,filter:blur(inP,18)}}
   else if(kin==='stack'){st={...st,transform:`translateY(${(1-inP)*1920}px) rotate(${(1-inP)*-4}deg)`,boxShadow:'0 -30px 80px rgba(0,0,0,.4)',borderRadius:40*(1-inP),overflow:'hidden'};z=3}
   else if(kin==='scroll'){st={...st,transform:`translateY(${(1-Math.round(inP*9)/9)*1920}px)`}}
   else if(kin==='bar'||kin==='morph'){st={...st,opacity:inP>=.5?1:0}}}
  const lf=f-starts[i];
  layers.push(<AbsoluteFill key={i} style={{zIndex:z,background:t.bg,backgroundImage:t.texture?`url(${staticFile(t.texture)})`:'none',...st}}>
   <Ctx.Provider value={{t,f:lf,exit:exitStag}}>{t.id==='tech-explain'?<TermChrome section={s.section} page={`${i+1}/${scenes.length}`} idx={i}/>:<Chrome section={s.section} page={`TRANG ${i+1}/${scenes.length}`} date={date}/>}
   <div style={{position:'absolute',left:136,right:50,top:290,height:1320}}>{s.el}</div></Ctx.Provider></AbsoluteFill>);
  if(i<scenes.length-1&&(kout==='bar')&&outP>0&&outP<1){const p=outP;const w=p<.5?interpolate(p,[0,.5],[96,1080]):1080;const x=p<.5?0:interpolate(p,[.5,1],[0,1080],{easing:EIO});
   overlay=<div style={{position:'absolute',top:0,bottom:0,left:x,width:w-(p<.5?0:0),background:t.accent,zIndex:10,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}><div style={{transform:`rotate(-90deg) translateY(${(p-.5)*400}px)`,fontFamily:t.id==='tech-explain'?'JBM':'Anton',fontWeight:t.id==='tech-explain'?800:400,fontSize:t.id==='tech-explain'?150:200,color:t.onAccent,whiteSpace:'nowrap'}}>{t.id==='tech-explain'?'git commit ▸':'DAN TECH ■'}</div></div>}
  if(i<scenes.length-1&&kout==='zoom'&&outP>0&&outP<1){overlay=<AbsoluteFill style={{zIndex:2,background:t.accent,opacity:interpolate(outP,[.4,.6,.8],[0,1,0],cl)}}/>}
  if(i<scenes.length-1&&kout==='morph'&&s.morph&&outP>0&&outP<1){const m=s.morph;const p=outP;const L=(k:number)=>m.from[k]+(m.to[k]-m.from[k])*p;
   overlay=<div style={{position:'absolute',left:L(0),top:L(1),width:L(2),height:L(3),background:t.accent,zIndex:10,display:'flex',alignItems:'center',justifyContent:'center',...H(t,L(4),t.onAccent),transform:`rotate(${Math.sin(Math.PI*p)*-6}deg)`}}>{m.txt}</div>}
 });
 return <AbsoluteFill style={{background:t.bg}}><style>{FONTS}</style>{layers}{overlay}
  <AbsoluteFill style={{zIndex:20}}><Ctx.Provider value={{t,f,exit:0}}><Captions words={words}/></Ctx.Provider></AbsoluteFill>
  <Audio src={staticFile(voice)}/>
  {starts.slice(1,-1).map((x,k)=><Sequence key={'t'+k} from={x-T/2-2}><Audio src={staticFile(`sfx/${t.sfx.trans}.wav`)} volume={0.5}/></Sequence>)}
  {sfx.map((x,k)=><Sequence key={'s'+k} from={x.at}><Audio src={staticFile(`sfx/${x.s}.wav`)} volume={x.v??0.5}/></Sequence>)}
 </AbsoluteFill>};
export {EO,EIO,cl};
