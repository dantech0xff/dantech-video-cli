import {useBrand,fitSize} from './brand';
import React,{createContext,useContext} from 'react';
import {AbsoluteFill,Audio,OffthreadVideo,Sequence,staticFile,useCurrentFrame,interpolate,Easing,random,spring} from 'remotion';
import {Theme} from './themes';import {BpChrome} from './cyber';import {SZ} from './safezone';import {GlChrome} from './glitch';import {AtChrome} from './android';import {FlChrome,HeroFlight,FOSI} from './flutter';
export const FONTS=`@font-face{font-family:Anton;src:url(${staticFile('fonts/anton.ttf')})}@font-face{font-family:Barlow;src:url(${staticFile('fonts/barlow.ttf')})}@font-face{font-family:JBM;src:url(${staticFile('fonts/jbm.ttf')});font-weight:100 800}@font-face{font-family:BVPX;src:url(${staticFile('fonts/bvp_xb.ttf')})}@font-face{font-family:BVPM;src:url(${staticFile('fonts/bvp_md.ttf')})}@font-face{font-family:GSF;src:url(${staticFile('fonts/gsf_md.ttf')});font-weight:100 600}@font-face{font-family:GSF;src:url(${staticFile('fonts/gsf_xb.ttf')});font-weight:700 900}@font-face{font-family:GSC;src:url(${staticFile('fonts/gsc_md.ttf')});font-weight:100 600}@font-face{font-family:GSC;src:url(${staticFile('fonts/gsc_bd.ttf')});font-weight:700 900}`;
export const Ctx=createContext<{t:Theme;f:number;exit:number;hx?:boolean}>(null as any);
export const useS=()=>useContext(Ctx);
const EO=Easing.bezier(.16,1,.3,1),EIO=Easing.bezier(.7,0,.2,1);
// Material 3 emphasized-decelerate (no overshoot); shared-axis X uses it over ~470 ms of the 533 ms window
const EMD=Easing.bezier(.05,.7,.1,1);const SAX=120; // px slide distance
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const H=(t:Theme,size:number,c?:string):React.CSSProperties=>({fontFamily:t.head,fontWeight:t.head==='JBM'||t.head==='GSF'?800:400,fontSize:size,color:c??t.ink,lineHeight:t.head==='BVPX'?1.12:1.02,textTransform:t.upper?'uppercase':'none',letterSpacing:t.head==='BVPX'?-2:0});
export const Bd=(t:Theme,size:number,c?:string):React.CSSProperties=>({fontFamily:t.body,fontWeight:t.body==='JBM'||t.body==='GSF'?500:400,fontSize:size,color:c??t.ink,lineHeight:1.25});
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
export const Kicker:React.FC<{n:string;txt:string}>=({n,txt})=>{const {t}=useS();if(t.id==='hot-news-glitch')return <It i={0}><div style={{display:'flex',alignItems:'center',gap:16,marginBottom:30}}><span style={{width:14,height:14,background:t.accent}}/><span style={{fontFamily:'BVPX',fontSize:30,letterSpacing:3,color:'#BDBDBD'}}>{txt}</span></div></It>;return <It i={0}><div style={{display:'flex',alignItems:'center',gap:16,borderBottom:`3px solid ${t.rule}`,paddingBottom:10,marginBottom:26}}><span style={{...H(t,38,t.bg),background:t.ink,padding:'4px 14px',borderRadius:t.id==='quick-tips'?10:0}}>{n}</span><span style={{...Bd(t,32),letterSpacing:2}}>{t.id==='tech-explain'?'// ':''}{txt}</span></div></It>};
export const Stamp:React.FC<{at:number;text:string;sub?:string;style?:React.CSSProperties}>=({at,text,sub,style})=>{const {t,f,exit}=useS();if(f<at)return null;const p=interpolate(f-at,[0,6],[0,1],{...cl,easing:EO});
 return <div style={{position:'absolute',border:`8px solid ${t.stamp??t.accent}`,outline:`3px solid ${t.stamp??t.accent}`,outlineOffset:6,padding:'10px 26px 4px',color:t.stamp??t.accent,transform:`rotate(-10deg) scale(${1.8-0.8*p})`,opacity:p*(1-exit),mixBlendMode:t.id==='hot-news'?'multiply':'normal',textAlign:'center',borderRadius:t.id==='quick-tips'?20:0,...style}}>
 <div style={{...H(t,80,t.stamp??t.accent)}}>{text}</div>{sub&&<div style={{...Bd(t,24,t.stamp??t.accent),letterSpacing:3}}>{sub}</div>}</div>};
/* ---------- brand chrome (shared device across themes) ---------- */
export const Chrome:React.FC<{section:string;page:string;date:string}>=({section,page,date})=>{const {t}=useS();const B=useBrand();const C=SZ.chrome;const N=SZ.noText;return <>
 {/* rail: solid accent full height (decoration); its wordmark text only inside x>=60, y 290..1500 (no-text zones) */}
 <div style={{position:'absolute',left:0,top:0,bottom:0,width:96,background:t.accent}}/>
 <div style={{position:'absolute',left:N.left,top:N.top,width:96-N.left,height:N.bottom-N.top,overflow:'hidden',WebkitMaskImage:'linear-gradient(180deg,transparent 0,#000 90px,#000 calc(100% - 90px),transparent 100%)',maskImage:'linear-gradient(180deg,transparent 0,#000 90px,#000 calc(100% - 90px),transparent 100%)',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{transform:'rotate(-90deg)',whiteSpace:'nowrap',fontFamily:'Anton',fontSize:34,lineHeight:1,color:t.onAccent,letterSpacing:5}}>{Array(5).fill(B.wordmark).join(' ■ ')}</div></div>
 <div style={{position:'absolute',left:C.x,right:C.right,top:C.top,borderBottom:`5px solid ${t.ink}`,paddingBottom:8,display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
  <div style={{fontFamily:'Anton',fontSize:fitSize(B.wordmark,430,56,.47,1),color:t.ink,lineHeight:1,whiteSpace:'nowrap'}}>{B.wordmark}<span style={{color:t.accent}}>■</span></div><div style={{...Bd(t,21),textAlign:'right',lineHeight:1.15}}>{page}<br/>{date}</div></div>
 <div style={{position:'absolute',left:C.x,right:C.right,top:C.top+76,...Bd(t,20),lineHeight:1.2,borderBottom:`2px solid ${t.rule}`,paddingBottom:3,whiteSpace:'nowrap',overflow:'hidden'}}>{section}</div></>};
/* tech-explain chrome: editor tab bar + line-number gutter + prompt line (all text inside y 296..402, x 136..860) */
export const TermChrome:React.FC<{section:string;page:string;idx:number}>=({section,page,idx})=>{const {t}=useS();const B=useBrand();const wm=B.wordmark.trim().split(/\s+/).join('/');const C=SZ.chrome;return <>
 <div style={{position:'absolute',left:0,right:0,top:C.top,height:56,background:t.accent,display:'flex',alignItems:'center',justifyContent:'space-between',padding:`0 ${C.right}px 0 ${C.x}px`}}>
  <div style={{fontFamily:'JBM',fontWeight:800,fontSize:fitSize(wm,440,36,.62,4),color:t.onAccent,letterSpacing:-1,whiteSpace:'nowrap'}}>{wm}<span style={{opacity:.55}}>.git</span></div>
  <div style={{fontFamily:'JBM',fontWeight:700,fontSize:24,color:t.onAccent,whiteSpace:'nowrap'}}>main ▸ {page}</div></div>
 <div style={{position:'absolute',left:0,top:0,bottom:0,width:96,borderRight:`3px solid ${t.rule}`}}>{Array.from({length:21},(_,k)=><div key={k} style={{position:'absolute',right:8,top:SZ.content.y+8+k*50,fontFamily:'JBM',fontSize:22,lineHeight:1,color:k===idx*3+3?t.accent:t.muted}}>{k+1}</div>)}</div>
 <div style={{position:'absolute',left:C.x,right:C.right,top:C.top+66,fontFamily:'JBM',fontSize:24,lineHeight:1.2,color:t.muted,borderBottom:`3px solid ${t.rule}`,paddingBottom:6,whiteSpace:'nowrap',overflow:'hidden'}}><span style={{color:t.accent2}}>~/commit</span> <span style={{color:t.ink}}>❯</span> {section}</div></>};
/* ---------- karaoke captions (all themes) ----------
   Paged, never rolling: one complete sentence (or comma-phrase chunk if it would exceed 2 lines) is shown whole,
   then words light up one by one on the whisper timings. Font comes from theme look.caption (default: theme head font). */
const CW:Record<string,number>={Anton:.46,BVPX:.6,BVPM:.58,JBM:.66,Barlow:.5,GSF:.56,GSC:.6}; // avg glyph width / font size, measured on renders
export const capStyle=(t:Theme)=>{const c=(t as any).caption||{};const font=c.font??t.head;const size=c.size??(font==='Anton'?50:font==='JBM'?38:44);
 return {font,size,upper:c.upper??(font==='Anton'),weight:c.weight??(font==='JBM'?700:400),
  chipBg:c.chipBg??'rgba(16,16,16,.84)',chipText:c.chipText??'#FFFFFF',upText:c.upcomingText??'rgba(255,255,255,.62)',
  activeBg:c.activeBg??t.accent,activeText:c.activeText??'#111111',radius:c.radius??4,padX:c.padX??Math.round(size*.2),padY:c.padY??4,gap:c.gap??8,pop:c.pop??1.06}};
type Wd={t:string;s:number;e:number};
export const chunkWords=(words:Wd[],maxChars:number):number[][]=>{const out:number[][]=[];let sent:number[]=[];
 const len=(ix:number[])=>ix.reduce((a,k)=>a+words[k].t.length+1,0);
 // no comma to split on: break at the most balanced point, preferring right before a connective word (của, và, khi…)
 const CONN=/^(của|và|khi|vì|nhưng|mà|thì|là|với|cho|để|trong|từ|rồi|nên|hay|hoặc|nếu|còn|sau|trước)$/i;
 const splitPhrase=(p:number[]):number[][]=>{if(len(p)<=maxChars||p.length<2)return [p];let best=1,bs=1e9;
  for(let k=1;k<p.length;k++){const sc=Math.abs(len(p.slice(0,k))-len(p.slice(k)))-(CONN.test(words[p[k]].t)?18:0);if(sc<bs){bs=sc;best=k}}
  return [...splitPhrase(p.slice(0,best)),...splitPhrase(p.slice(best))]};
 const flush=()=>{if(!sent.length)return;if(len(sent)<=maxChars){out.push(sent);sent=[];return}
  // split at commas / colons into whole phrases, merging small ones while they fit
  const parts:number[][]=[];let cur:number[]=[];sent.forEach(k=>{cur.push(k);if(/[,;:]$/.test(words[k].t)){parts.push(cur);cur=[]}});if(cur.length)parts.push(cur);
  let acc:number[]=[];for(const p of parts){if(acc.length&&len(acc)+len(p)>maxChars){out.push(acc);acc=[]}
   if(len(p)>maxChars){if(acc.length){out.push(acc);acc=[]}out.push(...splitPhrase(p))}else acc=[...acc,...p]}
  if(acc.length)out.push(acc);sent=[]};
 words.forEach((w,k)=>{sent.push(k);if(/[.!?…]["”»)]*$/.test(w.t))flush()});flush();return out};
export const Captions:React.FC<{words:Wd[]}>=({words})=>{const {t}=useS();const f=useCurrentFrame();const tm=f/30;const c=capStyle(t);
 // 2-line budget in characters, accounting for per-word chip padding + gap (avg word ~4 chars), with 6% safety
 const W=SZ.captions.w;const g=c.size*(CW[c.font]??.55);const ovh=(2*c.padX+c.gap)/g;
 const maxChars=Math.floor(.94*2*W/(g*(1+ovh/4)));
 const chunks=React.useMemo(()=>chunkWords(words,maxChars),[words,maxChars]);
 const ci=chunks.findIndex((ch,k)=>{const a=words[ch[0]].s-0.12;const b=k+1<chunks.length?words[chunks[k+1][0]].s-0.12:words[ch[ch.length-1]].e+0.6;return tm>=a&&tm<b});
 if(ci<0)return null;const ch=chunks[ci];
 const lh=Math.round(c.size*1.12);
 let cur=-1;ch.forEach((k,j)=>{if(tm>=words[k].s-0.05)cur=j});if(cur>=0&&tm>words[ch[cur]].e+0.25)cur=-1; // exactly one active chip
 return <div data-layer="g" data-bb="caption" style={{position:'absolute',left:SZ.captions.x,maxWidth:SZ.captions.w,top:SZ.captions.top,display:'flex',flexWrap:'wrap',columnGap:c.gap,rowGap:6,alignItems:'center'}}>{ch.map((k,j)=>{const w=words[k];
  const on=spring({frame:f-Math.round((w.s-0.05)*30),fps:30,config:{damping:20,stiffness:260,mass:.6}});
  const isA=j===cur;const act=isA?on:0;const up=tm<w.s-0.05;
  return <span key={k} style={{fontFamily:c.font,fontWeight:c.weight,fontSize:c.size,lineHeight:`${lh}px`,textTransform:c.upper?'uppercase':'none',
   background:isA?c.activeBg:c.chipBg,color:isA?c.activeText:up?c.upText:c.chipText,borderRadius:c.radius,padding:`${c.padY+(c.font==='Anton'?3:0)}px ${c.padX}px ${c.padY-(c.font==='Anton'?3:0)}px`,
   transform:`scale(${1+(c.pop-1)*act})`,display:'inline-block'}}>{w.t}</span>})}</div>};
/* signal-break transition (hot-news-glitch): RGB fringes via drop-shadow, jitter, slice bars */
const srnd=(n:number)=>{const x=Math.sin(n*91.7+13.3)*43758.5453;return x-Math.floor(x)};
const sig=(g:number,f:number):React.CSSProperties=>({transform:`translateX(${(srnd(Math.floor(f/2))-.5)*g*70}px)`,filter:`drop-shadow(${-14*g}px 0 0 rgba(255,30,60,${.85*g})) drop-shadow(${14*g}px 0 0 rgba(30,140,255,${.85*g})) brightness(${1+.35*g})`});
const SignalBreak:React.FC<{g:number;f:number;c:string}>=({g,f,c})=>{const fr=Math.floor(f/2);return <AbsoluteFill style={{zIndex:10,pointerEvents:'none',opacity:g}}>
 {Array.from({length:7},(_,k)=>{const y=srnd(fr*7+k)*1920,h=4+srnd(fr*3+k)*46;const kind=k%3;return <div key={k} style={{position:'absolute',left:0,right:0,top:y,height:h,background:kind===0?c:kind===1?'#000':'repeating-linear-gradient(90deg, rgba(255,255,255,.6) 0 3px, transparent 3px 11px)',transform:`translateX(${(srnd(fr+k*5)-.5)*200}px)`,opacity:kind===1?.8:.9}}/>})}
 <AbsoluteFill style={{backgroundImage:'repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 3px)'}}/></AbsoluteFill>};
/* ---------- timeline with designed transitions ---------- */
export type Scene={dur:number;el:React.ReactNode;section:string;out?:'page'|'bar'|'zoom'|'push'|'stack'|'morph'|'scroll'|'signal'|'sharedx'|'hero';hero?:{txt:string;big:boolean};focus?:[number,number];morph?:{from:number[];to:number[];txt:string}};
const T=16;
export const Timeline:React.FC<{t:Theme;scenes:Scene[];words:any[];voice:string;sfx:{at:number;s:string;v?:number}[];date:string}>=({t,scenes,words,voice,sfx,date})=>{const f=useCurrentFrame();const B=useBrand();
 const starts=scenes.reduce<number[]>((a,s,i)=>[...a,(a[i]??0)+s.dur],[0]);
 const layers:React.ReactNode[]=[];let overlay:React.ReactNode=null;
 scenes.forEach((s,i)=>{const a=starts[i]-(i>0?T/2:0),b=starts[i+1]+(i<scenes.length-1?T/2:0);if(f<a||f>=b)return;
  const inP=i>0?interpolate(f,[starts[i]-T/2,starts[i]+T/2],[0,1],{...cl,easing:EIO}):1;
  const outP=i<scenes.length-1?interpolate(f,[starts[i+1]-T/2,starts[i+1]+T/2],[0,1],{...cl,easing:EIO}):0;
  const exitStag=i<scenes.length-1&&['bar','morph','stack','push'].includes(s.out??'bar')?interpolate(f,[starts[i+1]-T-6,starts[i+1]-2],[0,1],cl):0;
  const DO=(t as any).defaultOut??'bar';const kin=i>0?scenes[i-1].out??DO:DO,kout=s.out??DO;
  let st:React.CSSProperties={};let z=1;
  const blur=(p:number,k=14)=>`blur(${Math.sin(Math.PI*p)*k}px)`;
  if(outP>0){ if(kout==='page'){st={transform:`perspective(1600px) translateX(${-outP*700}px) rotateY(${outP*-35}deg)`,transformOrigin:'left center',filter:blur(outP),boxShadow:`${40*outP}px 0 60px rgba(0,0,0,${.35*outP})`};z=2}
   else if(kout==='zoom'){const [fx,fy]=s.focus??[540,900];st={transform:`scale(${1+Math.pow(outP,2.2)*14})`,transformOrigin:`${fx}px ${fy}px`,filter:blur(outP,6),opacity:outP>.75?interpolate(outP,[.75,.9],[1,0],cl):1};z=2}
   else if(kout==='push'){st={transform:`translateY(${-outP*1920}px)`,filter:blur(outP,18)}}
   else if(kout==='stack'){st={transform:`scale(${1-.1*outP})`,filter:`brightness(${1-.5*outP})`,borderRadius:40*outP,overflow:'hidden'}}
   else if(kout==='scroll'){st={transform:`translateY(${-Math.round(outP*9)/9*1920}px)`}}
   else if(kout==='signal'){const g=Math.sin(Math.PI*outP);st={opacity:outP<.5?1:0,...sig(g,f)}}
   else if(kout==='sharedx'){const q=interpolate(outP,[.06,.94],[0,1],cl);const e=EMD(q);st={transform:`translateX(${-SAX*e}px) scale(${1-.04*e})`,opacity:interpolate(q,[0,.35],[1,0],cl)}}
   else if(kout==='hero'){st={};z=1} // hero: outgoing layer stays put under the incoming cross-fade; only the chip travels
   else if(kout==='bar'||kout==='morph'){st={opacity:outP<.5?1:0}}}
  if(i>0&&inP<1){ if(kin==='page'){st={...st,transform:`translateX(${(1-inP)*260}px)`,filter:`brightness(${.75+.25*inP})`};z=1}
   else if(kin==='zoom'){st={...st,transform:`scale(${.82+.18*inP})`,opacity:interpolate(inP,[.55,.8],[0,1],cl)};z=3}
   else if(kin==='push'){st={...st,transform:`translateY(${(1-inP)*1920}px)`,filter:blur(inP,18)}}
   else if(kin==='stack'){st={...st,transform:`translateY(${(1-inP)*1920}px) rotate(${(1-inP)*-4}deg)`,boxShadow:'0 -30px 80px rgba(0,0,0,.4)',borderRadius:40*(1-inP),overflow:'hidden'};z=3}
   else if(kin==='scroll'){st={...st,transform:`translateY(${(1-Math.round(inP*9)/9)*1920}px)`}}
   else if(kin==='signal'){const g=Math.sin(Math.PI*inP);st={...st,opacity:inP>=.5?1:0,...sig(g,f+7)}}
   else if(kin==='sharedx'){const q=interpolate(inP,[.06,.94],[0,1],cl);const e=EMD(q);st={...st,transform:`translateX(${SAX*(1-e)}px)`,opacity:interpolate(q,[.25,.7],[0,1],cl)};z=3}
   else if(kin==='hero'){const r=interpolate(f,[starts[i]-T/2,starts[i]+T/2],[0,1],cl);const e=FOSI(r);st={...st,opacity:e,transform:`translateY(${12*(1-e)}px)`};z=3}
   else if(kin==='bar'||kin==='morph'){st={...st,opacity:inP>=.5?1:0}}}
  const lf=f-starts[i];
  // hero flight window: the chip is hidden in both layers (hx) and drawn once by HeroFlight on top
  const hOut=i<scenes.length-1&&kout==='hero'&&!!s.hero&&!!scenes[i+1].hero&&f>=starts[i+1]-T/2;
  const hIn=i>0&&kin==='hero'&&!!s.hero&&!!scenes[i-1].hero&&f<starts[i]+T/2;
  if(hOut&&f<starts[i+1]+T/2)overlay=<HeroFlight a={s.hero!} b={scenes[i+1].hero!} p={interpolate(f,[starts[i+1]-T/2,starts[i+1]+T/2],[0,1],cl)}/>;
  layers.push(<AbsoluteFill key={i} data-layer={String(i)} style={{zIndex:z,background:t.bg,backgroundImage:t.texture?`url(${staticFile(t.texture)})`:'none',...st}}>
   <Ctx.Provider value={{t,f:lf,exit:exitStag,hx:hOut||hIn}}>{t.id==='flutter-tutor'?<FlChrome section={s.section} page={`${String(i+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`}/>:t.id==='android-tutor'?<AtChrome section={s.section} page={`${String(i+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`}/>:t.id==='hot-news-glitch'?<GlChrome date={date}/>:t.id==='tech-explain-cyber'?<BpChrome section={s.section} page={`${String(i+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`}/>:t.id==='tech-explain'?<TermChrome section={s.section} page={`${i+1}/${scenes.length}`} idx={i}/>:<Chrome section={s.section} page={`TRANG ${i+1}/${scenes.length}`} date={date}/>}
   <div style={{position:'absolute',left:SZ.content.x,top:SZ.content.y,width:SZ.content.w,height:SZ.content.h,transform:`scale(${SZ.content.scale})`,transformOrigin:'top left'}}>{s.el}</div></Ctx.Provider></AbsoluteFill>);
  if(i<scenes.length-1&&(kout==='bar')&&outP>0&&outP<1){const p=outP;const w=p<.5?interpolate(p,[0,.5],[96,1080]):1080;const x=p<.5?0:interpolate(p,[.5,1],[0,1080],{easing:EIO});
   overlay=<div style={{position:'absolute',top:0,bottom:0,left:x,width:w-(p<.5?0:0),background:t.accent,zIndex:10,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}><div style={{transform:`rotate(-90deg) translateY(${(p-.5)*400}px)`,fontFamily:t.id==='tech-explain'?'JBM':'Anton',fontWeight:t.id==='tech-explain'?800:400,fontSize:t.id==='tech-explain'?150:fitSize(B.wordmark+' ■',1000,200,.47,1),color:t.onAccent,whiteSpace:'nowrap'}}>{t.id==='tech-explain'?'git commit ▸':B.wordmark+' ■'}</div></div>}
  if(i<scenes.length-1&&kout==='signal'&&outP>0&&outP<1){const g=Math.sin(Math.PI*outP);overlay=<SignalBreak g={g} f={f} c={t.accent}/>}
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
