// VersusHook: opening scene for news (hot-news, hot-news-glitch).
// Frame 0 already shows the big concrete claim (who vs who + why); the two sides land at `sidesAt` (~1s),
// optional payoff promise ("Cuối video…") at `payoffAt`. Lives inside the scaled safe content box (894x1320).
import React from 'react';import {interpolate,spring} from 'remotion';
import {useS,H,Bd,cl,EO} from './sys';import {BrandText,useBrands,brandChars} from './brandmark';
type Side={label:string;line:string};
// avg UPPERCASE glyph width / font size per head font (measured; uppercase ~15% wider than mixed)
const UW:Record<string,number>={Anton:.47,BVPX:.72,BVPM:.7,JBM:.62,Barlow:.58,GSF:.66};
const fit=(s:string,w:number,max:number,k=.5,extra=0)=>Math.min(max,Math.floor(w/(Math.max(4,s.length+extra)*k)));
export const VersusHook:React.FC<{kicker?:string;claim:string[];hl?:number;a:Side;b:Side;sidesAt?:number;payoff?:string;payoffAt?:number}>=
({kicker,claim,hl=1,a,b,sidesAt=24,payoff,payoffAt=60})=>{const {t,f}=useS();const BL=useBrands();const gl=t.id==='hot-news-glitch';const dl=t.id==='duoly'; /* duoly: soft cards (white / pink gradient, 40 px radius, shadow), no ink borders */const A=t.accent;
 const settle=interpolate(f,[0,8],[1.04,1],{...cl,easing:EO});
 const sp=(at:number)=>spring({frame:f-at,fps:30,config:{damping:18,stiffness:180}});
 const pa=sp(sidesAt),pb=sp(sidesAt+5),pv=sp(sidesAt+9),pp=payoff?sp(payoffAt):0;
 // glitch theme: short RGB split when the sides hit (beat only, not constant)
 const g=gl?Math.max(0,1-Math.abs(f-sidesAt-2)/4):0;
 const rgb:React.CSSProperties=g>0?{filter:`drop-shadow(${-10*g}px 0 0 rgba(255,30,60,.85)) drop-shadow(${10*g}px 0 0 rgba(30,140,255,.85))`}:{};
 const card=(s:Side,p:number,main:boolean):React.CSSProperties=>({flex:1,minHeight:300,padding:'26px 26px 30px',boxSizing:'border-box',
  background:dl?(main?'linear-gradient(135deg,#F35570,#E72055 55%,#D80B46)':'#FFFFFF'):main?A:gl?'#262626':t.bg,border:dl?'none':main?`6px solid ${A}`:`6px solid ${gl?'#3A3A3A':t.ink}`,borderRadius:dl?40:gl?0:4,boxShadow:dl?'0 22px 50px rgba(216,11,70,.14)':'none',
  opacity:p,transform:`translateY(${(1-p)*60}px)`,display:'flex',flexDirection:'column',gap:16});
 const cw=(894-70)/2-52;
 return <div style={{display:'flex',flexDirection:'column',height:1320}}>
  {kicker&&<div style={{...Bd(t,30,gl?'#BDBDBD':t.ink),letterSpacing:3,marginBottom:18}}><span style={{display:'inline-block',width:16,height:16,background:A,marginRight:12}}/>{kicker}</div>}
  <div style={{transform:`scale(${settle})`,transformOrigin:'left top',...rgb}}>{claim.map((l,k)=>{const sz=fit(l,k===hl?850:894,170,UW[t.head]??.6,brandChars(l,BL,UW[t.head]??.6));
   return k===hl?<div key={k} style={{display:'inline-block',background:A,padding:dl?'6px 26px 10px':'6px 22px 0',margin:'10px 0',borderRadius:dl?28:0,transform:gl?'none':'rotate(-1.5deg)'}}><span style={{...H(t,sz,t.onAccent),whiteSpace:'nowrap'}}><BrandText s={l} size="0.82em" on={A}/></span></div>
    :<div key={k} style={{...H(t,sz,dl?'#D80B46':undefined),whiteSpace:'nowrap'}}><BrandText s={l} size="0.82em" on={t.bg}/></div>})}</div>
  <div style={{display:'flex',alignItems:'stretch',gap:70,marginTop:60,position:'relative',...rgb}}>
   {[a,b].map((s,k)=><div key={k} style={card(s,k?pb:pa,k===0)}>
    <div style={{...H(t,fit(s.label,cw,96,UW[t.head]??.6,brandChars(s.label,BL,UW[t.head]??.6)),k===0?t.onAccent:t.ink),whiteSpace:'nowrap'}}><BrandText s={s.label} size="0.85em" on={k===0?A:t.bg}/></div>
    <div style={{...Bd(t,36,k===0?t.onAccent:gl?'#E6E6E6':t.ink),fontWeight:600}}>{s.line}</div></div>)}
   <div style={{position:'absolute',left:'50%',top:'50%',transform:`translate(-50%,-50%) scale(${pv})`,width:96,height:96,borderRadius:gl?0:48,
    background:dl?'#FFFFFF':gl?'#111':t.ink,color:gl?A:t.bg,display:'flex',alignItems:'center',justifyContent:'center',...H(t,dl?40:48,dl?'#D80B46':gl?A:t.bg),border:gl?`3px solid ${A}`:'none',boxShadow:dl?'0 10px 24px rgba(216,11,70,.2)':'none'}}>VS</div>
  </div>
  {payoff&&<div style={{marginTop:44,opacity:pp,transform:`translateX(${(1-pp)*-40}px)`,display:'flex',alignItems:'center',gap:18}}>
   <span style={{width:0,height:0,borderTop:'16px solid transparent',borderBottom:'16px solid transparent',borderLeft:`26px solid ${A}`}}/>
   <span style={{...Bd(t,40,gl?'#F2F2F2':t.ink),fontWeight:700}}>{payoff}</span></div>}
 </div>};
