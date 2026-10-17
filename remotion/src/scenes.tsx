import {useBrand,fitSize} from './brand';
import React from 'react';import {interpolate,random} from 'remotion';
import {useS,It,H,Bd,AccentBar,Kicker,Stamp,Media,EO,cl} from './sys';
export const Headline:React.FC<{kicker:string;l1:string;bar:string;l3:string;deck?:[string,string];sizes?:[number,number,number]}>=({kicker,l1,bar,l3,deck,sizes=[250,168,180]})=>{const {t}=useS();return <div>
 <It i={0}><div style={{...Bd(t,30),letterSpacing:3,marginBottom:14}}>■ {kicker}</div></It>
 <It at={2}><div style={{...H(t,sizes[0]),whiteSpace:'nowrap'}}>{l1}</div></It>
 <It at={9} style={{margin:'14px 0'}}><div style={{transform:'rotate(-2deg)'}}><AccentBar size={sizes[1]}>{bar}</AccentBar></div></It>
 <It at={18}><div style={{...H(t,sizes[2]),whiteSpace:'nowrap'}}>{l3}</div></It>
 {deck&&<It at={30}><div style={{display:'flex',gap:30,marginTop:40,borderTop:`3px solid ${t.rule}`,paddingTop:22}}>
  <div style={{...Bd(t,32),flex:1,borderRight:`2px solid ${t.rule}`,paddingRight:24}}>{deck[0]}</div><div style={{...Bd(t,32),flex:1}}>{deck[1]}</div></div></It>}</div>};
export const Flow:React.FC<{n:string;kick:string;title:string;sub:string;from:string;to:string;count:number;unit:string}>=({n,kick,title,sub,from,to,count,unit})=>{const {t,f}=useS();
 const moved=Math.min(count,Math.max(0,Math.floor((f-44)/5)+1));const arrow=interpolate(f,[26,42],[0,1],{...cl,easing:EO});
 const Box=({s,x}:{s:string;x:number})=><div style={{position:'absolute',left:x,top:100,width:330,height:150,border:`6px solid ${t.ink}`,display:'flex',alignItems:'center',justifyContent:'center',...H(t,84),background:t.bg}}>{s}</div>;
 return <div><Kicker n={n} txt={kick}/>
 <It i={1}><div style={{...H(t,118),whiteSpace:'nowrap'}}>{title}</div></It>
 <It i={3}><div style={{...Bd(t,40),marginTop:16}}>Cáo buộc: <span style={{background:t.ink,color:t.bg,padding:'0 10px'}}>{sub}</span></div></It>
 <It i={5} style={{position:'relative',height:880,marginTop:40,borderTop:`2px solid ${t.rule}`,borderBottom:`2px solid ${t.rule}`,backgroundImage:`repeating-linear-gradient(0deg, transparent 0 59px, ${t.muted}44 59px 60px)`}}>
  {t.id!=='hot-news-glitch'&&<div style={{...Bd(t,26,t.muted),position:'absolute',top:20}}>HÌNH 1 — DÒNG NHÂN SỰ</div>}
  <Box s={from} x={0}/><Box s={to} x={564}/>
  <div style={{position:'absolute',left:330,top:169,height:12,width:234*arrow,background:t.accent}}/>
  {arrow>.95&&<div style={{position:'absolute',left:540,top:151,borderTop:'24px solid transparent',borderBottom:'24px solid transparent',borderLeft:`30px solid ${t.accent}`}}/>}
  <div style={{position:'absolute',top:310,left:0,right:0,display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:14}}>{Array.from({length:count}).map((_,k)=>{const on=k<moved;return <div key={k} style={{...H(t,52),height:110,border:`4px solid ${t.ink}`,background:on?t.ink:'transparent',color:on?t.bg:t.ink,display:'flex',alignItems:'center',justifyContent:'center',transform:`translateY(${on&&k===moved-1?-8:0}px)`}}>{String(k+1).padStart(2,'0')}</div>})}</div>
  <div style={{position:'absolute',bottom:30,left:0,display:'flex',alignItems:'flex-end',gap:24}}><span style={{...H(t,230,t.accent)}}>{moved>0?moved:''}</span><span style={{...H(t,72),paddingBottom:20}}>{unit}</span></div>
 </It></div>};
export const Quote:React.FC<{n:string;kick:string;media?:string;w1:string;w2:string;tr:string;who:string}>=({n,kick,media,w1,w2,tr,who})=>{const {t}=useS();return <div><Kicker n={n} txt={kick}/>
 {media&&<It i={1}><Media src={media} h={500} label="ẢNH MINH HOẠ"/></It>}
 <div style={{position:'relative',marginTop:30}}>
  <It i={2}><div style={{...H(t,300,t.accent),position:'absolute',top:-60,left:-10}}>“</div></It>
  <It at={10}><div style={{...H(t,170),paddingLeft:120,paddingTop:30}}>{w1}</div></It>
  <It at={16}><div style={{paddingLeft:120}}><AccentBar size={170}>{w2}</AccentBar></div></It>
  <It at={30}><div style={{...Bd(t,34),marginTop:24,paddingLeft:120}}>{tr}<br/><span style={{color:t.muted}}>— {who}</span></div></It></div></div>};
export const Checklist:React.FC<{n:string;kick:string;t1:string;t2?:string;items:{s:string;at:number;mark?:'x'|'+'|'-'}[];stamp?:{at:number;text:string;sub:string};num?:boolean;keys?:string[]}>=({n,kick,t1,t2,items,stamp,num,keys})=>{const {t,f}=useS();return <div style={{position:'relative'}}><Kicker n={n} txt={kick}/>
 {keys?<div style={{display:'flex',gap:28,alignItems:'center',margin:'40px 0 60px',flexWrap:'wrap'}}>{keys.map((k,j)=><React.Fragment key={j}>{j>0&&<It at={6+j*6}><span style={{...H(t,120,t.muted)}}>+</span></It>}<It at={4+j*8}><div style={{...H(t,k.length>2?110:150,t.onAccent),background:t.ink,minWidth:260,height:300,borderRadius:40,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 40px',boxShadow:`0 22px 0 ${t.accent}`,transform:`translateY(${(f>=4+j*8+14&&f<4+j*8+20)?14:0}px)`}}>{k}</div></It></React.Fragment>)}</div>:<It i={1}><div style={{...H(t,140)}}>{t1}</div></It>}{t2&&<It i={2}><div style={{...H(t,104),marginBottom:36}}>{t2}</div></It>}
 {items.map((it,k)=>{const m=it.mark??'x';const done=f>=it.at+10;const box=m==='x'?t.accent:m==='+'?t.accent2:'#FF5146';
  return <It key={k} at={it.at}><div style={{display:'flex',gap:28,alignItems:'center',borderTop:`2px solid ${t.rule}`,padding:'26px 0'}}>
  <div style={{width:96,height:96,flex:'none',border:`6px solid ${num?t.accent:t.ink}`,position:'relative',borderRadius:t.id==='quick-tips'?24:0,background:num?t.accent:'transparent',...H(t,num?60:0,t.onAccent),display:'flex',alignItems:'center',justifyContent:'center'}}>
   {num?String(k+1):done&&<div style={{...H(t,m==='x'?120:110,box),transform:`scale(${interpolate(f,[it.at+10,it.at+16],[1.6,1],{...cl,easing:EO})})`}}>{m==='x'?'✕':m}</div>}</div>
  <div style={{...Bd(t,48),color:m==='-'&&done?t.muted:t.ink,textDecoration:m==='-'&&done?'line-through':'none'}}>{it.s}</div></div></It>})}
 {stamp&&<Stamp at={stamp.at} text={stamp.text} sub={stamp.sub} style={{right:-10,top:150}}/>}</div>};
export const Evidence:React.FC<{n:string;kick:string;media?:string;pos?:string;big:string;unit:string;count:number;label:string;tag:string;start:number}>=({n,kick,media,pos,big,unit,count,label,tag,start})=>{const {t,f}=useS();return <div><Kicker n={n} txt={kick}/>
 {media&&<It i={1}><Media src={media} h={400} pos={pos}/></It>}
 <div style={{display:'flex',alignItems:'flex-end',gap:24,margin:'26px 0 18px'}}><It i={2}><span style={{...H(t,200,t.onAccent),background:t.accent,padding:'8px 24px 0',display:'inline-block'}}>{big}</span></It><It i={3}><span style={{...H(t,110)}}>{unit}</span></It></div>
 <It i={4}><div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:10}}>{Array.from({length:count}).map((_,k)=>{const at=start+k*5;const s=f>=at;return <div key={k} style={{height:150,border:`3px solid ${t.ink}`,position:'relative',background:s?t.muted+'33':'transparent',transform:`rotate(${(random('t'+k)-.5)*4}deg)`}}>
  <div style={{...Bd(t,19,t.muted),padding:6}}>{label}</div><div style={{...H(t,54),textAlign:'center'}}>#{String(k+1).padStart(2,'0')}</div>
  {s&&<div style={{position:'absolute',bottom:10,left:6,right:6,border:`3px solid ${t.accent}`,color:t.accent,...H(t,22,t.accent),textAlign:'center',transform:`rotate(-8deg) scale(${interpolate(f,[at,at+5],[1.6,1],{...cl,easing:EO})})`}}>{tag}</div>}</div>})}</div></It></div>};
export const CTA:React.FC<{n:string;kick:string;lead:string;big:string;opts?:string[];hint?:string;ctaAt:number;src?:string;noFollow?:boolean}>=({n,kick,lead,big,opts,hint,ctaAt,src,noFollow})=>{const {t,f}=useS();const B=useBrand();return <div><Kicker n={n} txt={kick}/>
 <It i={1}><div style={{...Bd(t,44)}}>{lead}</div></It>
 <It i={2}><div style={{marginTop:20}}>{(()=>{const ls=big.split('|');const L=Math.max(...ls.map(x=>x.length));const sz=Math.min(240,Math.floor(894/(L*(t.head==='Anton'?.47:.7))));return ls.map((x,k)=><div key={k} style={{...H(t,sz),whiteSpace:'nowrap'}}>{x}</div>)})()}</div></It>
 {opts&&<div style={{display:'flex',gap:30,marginTop:30}}>{opts.map((o,k)=><It key={o} at={20+k*4} style={{flex:1}}><div style={{border:`6px solid ${t.ink}`,padding:'24px 28px',display:'flex',alignItems:'center',gap:24,borderRadius:t.id==='quick-tips'?24:0}}><div style={{width:80,height:80,border:`6px solid ${t.ink}`,...H(t,86,t.accent),display:'flex',alignItems:'center',justifyContent:'center'}}>{f>=44+k*14?'✕':''}</div><span style={{...H(t,84)}}>{o}</span></div></It>)}</div>}
 {hint&&<It at={34}><div style={{...Bd(t,40),marginTop:24}}>{hint}</div></It>}
 {!noFollow&&<It at={ctaAt} style={{marginTop:60}}><div style={{transform:'rotate(-2deg)'}}><AccentBar size={fitSize(B.followLabel,850,t.head==='Anton'?116:76,t.head==='Anton'?.47:.7)}>{B.followLabel}</AccentBar></div></It>}
 {src&&<It at={ctaAt+8}><div style={{...Bd(t,30,t.muted),marginTop:noFollow?40:22}}>{src}</div></It>}</div>};
