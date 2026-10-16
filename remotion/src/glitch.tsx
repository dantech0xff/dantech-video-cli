// hot-news-glitch (TIN NÓNG GLITCH): dark breaking-news with tasteful signal glitches on hits only.
// Directions via look.dir: 'signal' (broadcast break), 'vhs' (tape tracking), 'teletext' (block text).
import React from 'react';import {AbsoluteFill,interpolate,Easing} from 'remotion';import {useS} from './sys';
const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;const EO=Easing.bezier(.22,.61,.36,1);
const rnd=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const pr=(f:number,a:number,d=16)=>interpolate(f,[a,a+d],[0,1],{...cl,easing:EO});
/* glitch intensity: sharp spike on each hit, ~8 frame decay */
export const gAt=(f:number,hits:number[])=>hits.reduce((m,h)=>f>=h&&f<h+10?Math.max(m,Math.exp(-(f-h)/3)):m,0);
const FONT:Record<string,{head:string;size:number;deck:string}>={signal:{head:'Anton',size:176,deck:'BVPM'},vhs:{head:'BVPX',size:112,deck:'BVPM'},teletext:{head:'JBM',size:112,deck:'JBM'}};
const BLK='█▓▒░';const corrupt=(s:string,g:number,seed:number)=>g<=0?s:s.split('').map((c,i)=>c!==' '&&rnd(seed+i*3.1)<g*.35?BLK[Math.floor(rnd(seed+i)*4)]:c).join('');

export const GlChrome:React.FC<{date:string}>=({date})=>{const {t}=useS();const d=(t as any).dir;return <>
 {d!=='teletext'&&<AbsoluteFill style={{backgroundImage:`repeating-linear-gradient(0deg, rgba(0,0,0,${d==='vhs'?.22:.16}) 0 2px, transparent 2px 4px)`,zIndex:20,pointerEvents:'none'}}/>}
 <AbsoluteFill style={{background:'radial-gradient(130% 90% at 50% 40%, transparent 60%, rgba(0,0,0,.55) 100%)',zIndex:19,pointerEvents:'none'}}/>
 <div style={{position:'absolute',left:80,right:80,top:84,display:'flex',justifyContent:'space-between',alignItems:'baseline',paddingBottom:22,borderBottom:`2px solid ${d==='teletext'?t.accent:'#333'}`}}>
  <div style={{fontFamily:'BVPX',fontSize:50,lineHeight:1,color:'#F2F2F2',letterSpacing:1}}>DAN TECH<span style={{color:t.accent}}>{d==='teletext'?'':'.'}</span></div>
  <div style={{fontFamily:'JBM',fontSize:28,lineHeight:1,color:'#9A9A9A'}}>{date}</div></div></>};

const Block:React.FC<{p:any;d:string;g:number;f:number;tint?:string}>=({p,d,g,f,tint})=>{const {t}=useS();const F=FONT[d];const A0=t.accent,ON0=(t as any).onAccent;const A=tint?'transparent':A0,ON=tint??ON0;
 const head=(s:string,k:number):React.CSSProperties=>({fontFamily:F.head,fontSize:F.size,lineHeight:d==='signal'?.98:1.08,color:tint??'#F4F4F4',textTransform:'uppercase',letterSpacing:d==='teletext'?-2:d==='vhs'?-3:0,fontWeight:d==='teletext'?800:400,whiteSpace:'nowrap'});
 const tt=(s:string,k:number)=>d==='teletext'?corrupt(s,g,k*17+Math.floor(f/2)):s;
 return <div>
  <div style={{display:'inline-block',fontFamily:d==='teletext'?'JBM':'BVPX',fontWeight:800,fontSize:30,letterSpacing:3,color:d==='vhs'?(tint??A0):ON,background:d==='vhs'?'transparent':A,padding:d==='vhs'?0:'8px 16px',marginBottom:36,borderLeft:d==='vhs'?`6px solid ${tint?'transparent':A0}`:undefined,paddingLeft:d==='vhs'?18:16}}>{tt(p.kicker,1)}</div>
  <div style={head(p.l1,0)}>{tt(p.l1,2)}</div>
  <div style={{display:'inline-block',background:A,margin:'14px 0',padding:d==='signal'?'4px 26px 0':'4px 22px'}}><span style={{...head(p.bar,1),color:ON}}>{tt(p.bar,3)}</span></div>
  <div style={head(p.l3,2)}>{tt(p.l3,4)}</div>
  <div style={{marginTop:56,display:'flex',flexDirection:'column',gap:22}}>{p.deck.map((s:string,k:number)=><div key={k} style={{fontFamily:F.deck,fontSize:d==='teletext'?34:40,lineHeight:1.35,color:tint??(k?'#A8A8A8':'#E6E6E6'),maxWidth:900,paddingLeft:24,borderLeft:`3px solid ${tint?'transparent':k?'#444':A0}`,opacity:pr(f,30+k*8)}}>{tt(s,10+k)}</div>)}</div>
 </div>};

export const GlHeadline:React.FC<{kicker:string;l1:string;bar:string;l3:string;deck:string[];hits?:number[]}>=(p)=>{const {f,t}=useS();const d=(t as any).dir||'signal';const g=gAt(f,p.hits??[0,40]);
 const ent=pr(f,0,14);
 const base=<Block p={p} d={d} g={g} f={f}/>;
 let body:React.ReactNode=base;
 if(d==='signal'){const s=g*22;const bands=[0,18,34,52,70,86,100];
  body=<div style={{position:'relative'}}>
   {g>0.02&&<><div style={{position:'absolute',inset:0,transform:`translateX(${-s}px)`,mixBlendMode:'screen',opacity:.85}}><Block p={p} d={d} g={g} f={f} tint="#FF1E3C"/></div>
    <div style={{position:'absolute',inset:0,transform:`translateX(${s}px)`,mixBlendMode:'screen',opacity:.85}}><Block p={p} d={d} g={g} f={f} tint="#1E8BFF"/></div></>}
   {g>0.02?bands.slice(0,-1).map((b,k)=><div key={k} style={{position:k?'absolute':'relative',inset:k?0:undefined,clipPath:`inset(${b}% 0 ${100-bands[k+1]}% 0)`,transform:`translateX(${(rnd(k+Math.floor(f/2))-.5)*g*120}px)`}}>{base}</div>):base}
  </div>;}
 if(d==='vhs'){const by=(f*37)%1000/10;const s=g*10;
  body=<div style={{position:'relative'}}>
   <div style={{position:'absolute',inset:0,transform:`translateX(${-2-s}px)`,opacity:.5,mixBlendMode:'screen',filter:'blur(1.2px)'}}><Block p={p} d={d} g={g} f={f} tint="#FF2E88"/></div>
   <div style={{position:'absolute',inset:0,transform:`translateX(${2+s}px)`,opacity:.35,mixBlendMode:'screen',filter:'blur(1.2px)'}}><Block p={p} d={d} g={g} f={f} tint="#2EFFB0"/></div>
   <div style={{position:'relative'}}>{base}</div>
   {g>0.02&&<><div style={{position:'absolute',inset:0,clipPath:`inset(${by}% 0 ${Math.max(0,92-by)}% 0)`,transform:`translateX(${g*60}px)`,filter:'brightness(1.6)'}}>{base}</div>
    <div style={{position:'absolute',left:-80,right:-80,top:`${by}%`,height:60,opacity:g*.7,backgroundImage:'repeating-linear-gradient(90deg, rgba(255,255,255,.5) 0 3px, transparent 3px 9px, rgba(255,255,255,.25) 9px 11px, transparent 11px 23px)'}}/></>}
  </div>;}
 if(d==='teletext'){body=<div style={{position:'relative'}}>{base}{g>0.02&&[0,1,2].map(k=><div key={k} style={{position:'absolute',left:`${rnd(k+f)*80}%`,top:`${rnd(k*7+f)*90}%`,width:40+rnd(k+3)*120,height:28,background:k%2?t.accent:'#1C1C1C'}}/>)}</div>;}
 return <div style={{opacity:ent,transform:`translateY(${(1-ent)*20}px)`,paddingTop:250}}>{body}</div>};
