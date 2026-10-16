// MẸO NHANH scene templates: IDE mockups, keycaps and tip cards. All frame props are scene-relative
// (the render pipeline resolves "@word" anchors from script.json into frames).
import React from 'react';import {interpolate,Easing} from 'remotion';import {useS,H,Bd,It} from './sys';
const EO=Easing.bezier(.16,1,.3,1);const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const MONO='JBM';
const IDE={bg:'#1E1F22',bar:'#2B2D30',line:'#393B40',txt:'#BCBEC4',dim:'#6F737A',kw:'#CF8E6D',str:'#6AAB73',typ:'#56A8F5',fn:'#57AAF7',blue:'#3574F0',red:'#F75464',green:'#5FB865',purple:'#C77DBB'};
const pop=(f:number,at:number,d=8)=>interpolate(f,[at,at+d],[0,1],{...cl,easing:EO});
/** code line = list of [text, colour key]; colour keys: kw str typ fn dim */
type Line=[string,string?][];
type KeyDef={k:string;at:number;w?:number};
/* keycap that sinks + flashes at each frame in `press` */
export const Key:React.FC<{k:string;press:number[];w?:number;h?:number;fs?:number;light?:boolean}>=({k,press,w=200,h=170,fs=64,light})=>{const {t,f}=useS();
 const d=Math.max(0,...press.map(p=>interpolate(f,[p-1,p+1,p+6],[0,1,0],cl)));const last=Math.max(-99,...press.filter(p=>f>=p));const lit=f-last<10;
 const edge=12*(1-d);
 return <div style={{width:w,height:h,flex:'none',position:'relative',transform:`translateY(${12-edge}px)`}}>
  <div style={{position:'absolute',inset:0,top:edge,background:t.onAccent,borderRadius:28}}/>
  <div style={{position:'absolute',left:0,right:0,top:0,height:h-12,background:lit?'#FFFFFF':light?'#FFFFFF':t.accent,border:`5px solid ${t.onAccent}`,borderRadius:28,display:'flex',alignItems:'center',justifyContent:'center',transform:`translateY(${12-edge}px)`,boxSizing:'border-box'}}>
   <span style={{fontFamily:t.head,fontSize:fs,color:t.onAccent,letterSpacing:-1,whiteSpace:'nowrap'}}>{k}</span></div>
  {lit&&<div style={{position:'absolute',inset:-14,border:'4px solid #FFFFFF',borderRadius:38,opacity:interpolate(f-last,[0,10],[1,0],cl),transform:`scale(${interpolate(f-last,[0,10],[.92,1.12],cl)})`}}/>}
 </div>};
export const Combo:React.FC<{keys:KeyDef[];os?:string;osC?:string;small?:boolean;light?:boolean;at:number;times?:string}>=({keys,os,osC,small,light,at,times})=>{const {t}=useS();const s=small?.62:1;
 return <It at={at}><div style={{display:'flex',alignItems:'center',gap:18*s}}>{os&&<span style={{...Bd(t,30,osC??t.muted),width:small?110:150,letterSpacing:3,fontWeight:700}}>{os}</span>}
  {keys.map((x,i)=><React.Fragment key={i}>{i>0&&<span style={{fontFamily:t.head,fontSize:70*s,color:t.accent}}>+</span>}<Key k={x.k} press={[x.at]} w={(x.w??200)*s} h={170*s} fs={64*s} light={light}/></React.Fragment>)}
  {times&&<span style={{fontFamily:t.head,fontSize:80*s,color:t.accent,marginLeft:10}}>{times}</span>}</div></It>};
type Tip={n:string;of:string;title:string;sub?:string};
export const TipHead:React.FC<Tip>=({n,of,title,sub})=>{const {t,f}=useS();const p=pop(f,0,10);
 return <div style={{display:'flex',alignItems:'center',gap:30,marginBottom:44}}>
  <div style={{width:170,height:170,flex:'none',background:t.accent,borderRadius:36,display:'flex',alignItems:'center',justifyContent:'center',transform:`rotate(${(1-p)*-25-4}deg) scale(${.4+.6*p})`,boxShadow:`10px 10px 0 ${t.onAccent}`}}><span style={{fontFamily:t.head,fontSize:110,color:t.onAccent}}>{n}</span></div>
  <div><It at={4}><div style={{...Bd(t,30,t.muted),letterSpacing:4}}>MẸO {n}/{of}</div></It><It at={7}><div style={{...H(t,84),lineHeight:1.05}}>{title}</div></It>{sub&&<It at={10}><div style={{...Bd(t,34,t.accent2)}}>{sub}</div></It>}</div></div>};
/* IDE window chrome (dark, hard offset shadow) */
export const Win:React.FC<{title:string;children:React.ReactNode;h:number;at?:number}>=({title,children,h,at=6})=>{const {t}=useS();return <It at={at}>
 <div style={{height:h,background:IDE.bg,borderRadius:22,border:`5px solid ${t.onAccent}`,boxShadow:`14px 14px 0 ${t.onAccent}`,overflow:'hidden',position:'relative'}}>
  <div style={{height:62,background:IDE.bar,display:'flex',alignItems:'center',gap:12,padding:'0 22px',borderBottom:`2px solid ${IDE.line}`}}>
   {['#FF5F57','#FEBC2E','#28C840'].map(c=><div key={c} style={{width:18,height:18,borderRadius:9,background:c}}/>)}
   <span style={{fontFamily:MONO,fontSize:24,color:IDE.dim,marginLeft:18}}>{title}</span></div>
  <div style={{position:'relative',height:h-72}}>{children}</div></div></It>};
const col=(c?:string)=>(c&&(IDE as any)[c])||IDE.txt;
export const Code:React.FC<{lines:Line[];fs?:number;squig?:{line:number;tok:number}}>=({lines,fs=29,squig})=><div style={{padding:'22px 26px',fontFamily:MONO,fontSize:fs,lineHeight:1.6,whiteSpace:'pre'}}>
 {lines.map((l,i)=><div key={i} style={{display:'flex'}}><span style={{color:IDE.dim,width:fs*1.6,flex:'none'}}>{i+1}</span>{l.map((x,j)=><span key={j} style={{color:col(x[1]),textDecoration:squig&&squig.line===i&&squig.tok===j?`underline wavy ${IDE.red}`:'none',textUnderlineOffset:8,textDecorationThickness:3}}>{x[0]}</span>)}</div>)}</div>;
const Badge:React.FC<{at:number;text:string;pos:React.CSSProperties;rot:number}>=({at,text,pos,rot})=>{const {t,f}=useS();if(f<at)return null;
 return <div style={{position:'absolute',...pos,background:IDE.green,color:'#111',fontFamily:t.head,fontSize:40,padding:'8px 22px',borderRadius:14,transform:`scale(${1.4-.4*pop(f,at,6)}) rotate(${rot}deg)`}}>{text}</div>};
const Cursor:React.FC<{x:number;y:number}>=({x,y})=><svg width={52} height={62} viewBox="0 0 20 24" style={{position:'absolute',left:x,top:y}}><path d="M2 1.5v18.2l4.7-4.4 3 6.9 3.2-1.4-3-6.8 6.5-.4z" fill="#fff" stroke="#111" strokeWidth={1.4}/></svg>;

/* Hook: cursor flailing through IDE menus, then the big number title slams in at titleAt */
export const MeoHook:React.FC<{clicks:number[];titleAt:number;window:string;menus:string[];menuItems:string[];big:string;l1:string;l2:string;keys:string[];deck:string}>=({clicks,titleAt,window,menus,menuItems,big,l1,l2,keys,deck})=>{const {t,f}=useS();
 const cur=clicks.filter(c=>f>=c).length-1;const m=cur>=0?cur%menus.length:-1;
 const cx=interpolate(f,clicks,clicks.map((_,i)=>40+(i%menus.length)*112),cl);
 const shake=f<titleAt?Math.sin(f*1.7)*interpolate(f,[0,titleAt],[0,4],cl):0;const tp=pop(f,titleAt,10);
 return <div>
  <div style={{opacity:1-interpolate(f,[titleAt-4,titleAt+6],[0,.75],cl),transform:`translateX(${shake}px) scale(${1-.1*tp})`,transformOrigin:'center top'}}>
  <Win title={window} h={560} at={0}>
   <div style={{display:'flex',gap:6,padding:'10px 16px',background:IDE.bar,fontFamily:'BVPM',fontSize:26,color:IDE.txt}}>{menus.map((x,i)=><span key={x} style={{padding:'6px 12px',borderRadius:8,background:i===m?IDE.blue:'transparent'}}>{x}</span>)}</div>
   {m>=0&&<div style={{position:'absolute',left:16+m*112,top:56,width:360,background:IDE.bar,border:`2px solid ${IDE.line}`,borderRadius:10,padding:'8px 0',fontFamily:'BVPM',fontSize:24,color:IDE.txt}}>{menuItems.map((x,i)=><div key={x} style={{padding:'8px 18px',background:i===(f%5)?'#2E436E':'transparent'}}>{x}</div>)}</div>}
   <Cursor x={cx+60} y={30+Math.sin(f*.4)*10}/>
  </Win></div>
  {f>=titleAt&&<div style={{position:'absolute',left:0,right:0,top:250,transform:`translateY(${(1-tp)*120}px) rotate(${(1-tp)*-6}deg)`,opacity:tp}}>
   <div style={{display:'flex',alignItems:'flex-end',gap:24}}><span style={{fontFamily:t.head,fontSize:420,color:t.accent,lineHeight:.8,textShadow:`14px 14px 0 ${t.onAccent}`}}>{big}</span>
    <div style={{paddingBottom:30}}><div style={{...H(t,120)}}>{l1}</div><div style={{...H(t,72,t.accent2)}}>{l2}</div></div></div>
   <div style={{display:'flex',gap:18,marginTop:60}}>{keys.map((k,i)=><div key={k} style={{transform:`translateY(${(1-pop(f,titleAt+8+i*5))*80}px)`,opacity:pop(f,titleAt+8+i*5)}}><Key k={k} press={[titleAt+16+i*5]} w={250} h={150} fs={58}/></div>)}</div>
   <div style={{...Bd(t,40),marginTop:50,opacity:pop(f,titleAt+40)}}>{deck}</div></div>}
 </div>};
/* Tip: a search popup whose result rows appear on cue */
export const MeoSearch:React.FC<{tip:Tip;keys:KeyDef[];times?:string;window:string;tabs:string[];query:string;popAt:number;typeAt:number;results:{icon:string;label:string;hint:string;color:string;at:number}[]}>=({tip,keys,times,window,tabs,query,popAt,typeAt,results})=>{const {f}=useS();
 const q=query.slice(0,Math.max(0,Math.floor((f-typeAt)/3)));const pp=pop(f,popAt,10);
 return <div><TipHead {...tip}/><Combo at={6} keys={keys} times={times}/>
  <div style={{marginTop:56}}><Win title={window} h={640} at={popAt-6}>
   <div style={{transform:`scale(${.9+.1*pp})`,opacity:pp,transformOrigin:'center top'}}>
    <div style={{display:'flex',gap:30,padding:'16px 26px 0',fontFamily:'BVPM',fontSize:26,color:IDE.txt,borderBottom:`2px solid ${IDE.line}`}}>{tabs.map((x,i)=><span key={x} style={{paddingBottom:12,borderBottom:i===0?`4px solid ${IDE.blue}`:'none',color:i===0?'#fff':IDE.txt}}>{x}</span>)}</div>
    <div style={{margin:'18px 26px',padding:'14px 20px',border:`3px solid ${IDE.blue}`,borderRadius:10,fontFamily:MONO,fontSize:34,color:'#fff'}}>🔍 {q}<span style={{opacity:f%16<8?1:0,color:IDE.blue}}>|</span></div>
    {results.map((r,i)=>{const p=pop(f,r.at,8);return <div key={i} style={{display:'flex',alignItems:'center',gap:20,padding:'14px 26px',background:i===0&&f>=r.at?'#2E436E':'transparent',opacity:p,transform:`translateX(${(1-p)*40}px)`}}>
     <div style={{width:46,height:46,borderRadius:10,background:col(r.color)===IDE.txt?r.color:col(r.color),display:'flex',alignItems:'center',justifyContent:'center',fontFamily:MONO,fontSize:26,color:'#111',fontWeight:800}}>{r.icon}</div>
     <span style={{fontFamily:MONO,fontSize:29,color:'#fff',flex:1}}>{r.label}</span><span style={{fontFamily:'BVPM',fontSize:22,color:IDE.dim}}>{r.hint}</span></div>})}
   </div></Win></div></div>};
/* Tip: red squiggle → quick-fix popup → inserted line clears the error */
export const MeoFix:React.FC<{tip:Tip;keys:KeyDef[];mac:KeyDef[];window:string;code:Line[];insert:{line:number;code:Line};squig:{line:number;tok:number};redAt:number;popAt:number;popup:string[];fixAt:number;okAt:number;ok:string}>=({tip,keys,mac,window,code,insert,squig,redAt,popAt,popup,fixAt,okAt,ok})=>{const {t,f}=useS();
 const fixed=f>=fixAt;const ip=pop(f,fixAt,10);const pp=pop(f,popAt,8)*(1-pop(f,fixAt,6));const LH=46.4;
 const lines=fixed?[...code.slice(0,insert.line),insert.code,...code.slice(insert.line)]:code;
 return <div><TipHead {...tip}/><Combo at={6} keys={keys}/>
  <div style={{marginTop:22}}><Combo at={mac[0].at-10} small light os="MAC" keys={mac}/></div>
  <div style={{marginTop:40,position:'relative'}}><Win title={window} h={600} at={8}>
   <div style={{transform:`translateY(${fixed?(1-ip)*-LH:0}px)`}}><Code lines={lines} squig={fixed?undefined:squig}/></div>
   {f>=redAt&&!fixed&&<div style={{position:'absolute',left:300,top:22+squig.line*LH+10,width:190,height:52,border:`4px solid ${IDE.red}`,borderRadius:10,opacity:Math.abs(Math.sin((f-redAt)*.25))}}/>}
   {pp>0&&<div style={{position:'absolute',left:250,top:22+(squig.line+1)*LH+10,width:560,background:IDE.bar,border:`2px solid ${IDE.line}`,borderRadius:12,padding:'8px 0',opacity:pp,transform:`scale(${.9+.1*pp})`,transformOrigin:'left top',fontFamily:'BVPM',fontSize:27,color:IDE.txt}}>
    {popup.map((x,i)=><div key={x} style={{padding:'10px 20px',background:i===0?'#2E436E':'transparent',color:i===0?'#fff':IDE.txt}}>{i===0?'💡 ':''}{x}</div>)}</div>}
   <Badge at={okAt} text={ok} pos={{right:24,bottom:24}} rot={-4}/>
  </Win></div></div>};
/* Tip: "chậm vs nhanh" — menu path with running timer vs shortcut, then code reflows */
export const MeoSlowFast:React.FC<{tip:Tip;vsAt:number;slowLabel:string;fastLabel:string;path:string[];pathClicks:number[];keys:KeyDef[];mac:KeyDef[];fastTime:string;window:string;before:Line[];after:Line[];reflowAt:number;okAt:number;ok:string}>=({tip,vsAt,slowLabel,fastLabel,path,pathClicks,keys,mac,fastTime,window,before,after,reflowAt,okAt,ok})=>{const {t,f}=useS();
 const fm=pop(f,reflowAt,14);const k0=keys[0].at;const slow=f>=vsAt?Math.min(f,k0)-vsAt:0;const step=pathClicks.filter(c=>f>=c).length;const lastKey=keys[keys.length-1].at;
 return <div><TipHead {...tip}/>
  <It at={vsAt-2}><div style={{display:'flex',flexDirection:'column',gap:22}}>
   <div style={{background:'#0F1F99',borderRadius:26,padding:'22px 26px',border:`4px solid ${t.onAccent}`,opacity:f>=k0?.55:1}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{...H(t,64,'#FF8A8A')}}>{slowLabel}</span><span style={{fontFamily:MONO,fontSize:44,color:'#FF8A8A'}}>{(slow/30).toFixed(1)}s</span></div>
    <div style={{display:'flex',gap:14,alignItems:'center',marginTop:16,fontFamily:'BVPM',fontSize:34,color:'#fff'}}>{path.map((x,i)=><React.Fragment key={i}>{i>0&&<span>▸</span>}<span style={{padding:'10px 18px',borderRadius:12,background:step>i?IDE.blue:'rgba(255,255,255,.12)'}}>{x}</span></React.Fragment>)}</div></div>
   <div style={{background:t.accent,borderRadius:26,padding:'22px 26px',border:`4px solid ${t.onAccent}`,boxShadow:`10px 10px 0 ${t.onAccent}`,opacity:pop(f,k0-14,8),transform:`translateY(${(1-pop(f,k0-14,8))*60}px)`}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><span style={{...H(t,64,t.onAccent)}}>{fastLabel}</span><span style={{fontFamily:MONO,fontSize:44,color:t.onAccent}}>{f>=lastKey?fastTime:'…'}</span></div>
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
     <Combo at={k0-14} small keys={keys} os="WIN" osC={t.onAccent}/>
     <Combo at={mac[0].at-10} small light keys={mac} os="MAC" osC={t.onAccent}/></div></div>
  </div></It>
  <div style={{marginTop:30,position:'relative'}}><Win title={window} h={440} at={vsAt+4}>
   <div style={{position:'absolute',inset:0,opacity:1-fm,transform:`translateX(${-fm*40}px)`}}><Code fs={27} lines={before}/></div>
   <div style={{position:'absolute',inset:0,opacity:fm,transform:`translateX(${(1-fm)*40}px)`}}><Code fs={25} lines={after}/></div>
   <Badge at={okAt} text={ok} pos={{right:24,top:20}} rot={4}/>
  </Win></div></div>};
/* Recap card: bookmark + summary chips */
export const MeoSave:React.FC<{kicker:string;title:string;lead:string;chips:[string,string][]}>=({kicker,title,lead,chips})=>{const {t,f}=useS();return <div>
 <It at={0}><div style={{...Bd(t,32,t.muted),letterSpacing:4}}>{kicker}</div></It>
 <It at={4}><div style={{display:'flex',alignItems:'center',gap:30,marginTop:10}}><svg width={150} height={190} viewBox="0 0 24 30"><path d="M3 2h18v26l-9-6-9 6z" fill={t.accent} stroke={t.onAccent} strokeWidth={1.6} transform={`rotate(${Math.sin(f*.2)*4*Math.exp(-f/30)} 12 2)`}/></svg><div style={{...H(t,150)}}>{title}</div></div></It>
 <It at={10}><div style={{...Bd(t,44),marginTop:24}}>{lead}</div></It>
 <div style={{display:'flex',gap:16,marginTop:26,flexWrap:'wrap'}}>{chips.map((x,i)=><It key={i} at={14+i*4}><div style={{background:'rgba(255,255,255,.1)',border:`3px solid ${t.accent}`,borderRadius:22,padding:'14px 22px'}}><div style={{fontFamily:t.head,fontSize:46,color:t.accent}}>{x[0]}</div><div style={{...Bd(t,30)}}>{x[1]}</div></div></It>)}</div></div>};
