// COMMIT scene templates: terminal prompts, git graphs, git log output, diff-style rules.
// All frame props are scene-relative (script.json "@word" anchors are resolved by build_props.py).
import React from 'react';import {interpolate,Easing} from 'remotion';import {useS,H,Bd,It,Stamp} from './sys';
const EO=Easing.bezier(.16,1,.3,1),EIO=Easing.bezier(.7,0,.2,1);const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const C={red:'#FF5F56',dim:'#8A8A82',panel:'#1C1C1C',line:'#2A2A2A',blue:'#7FB2FF'};
const pop=(f:number,at:number,d=8)=>interpolate(f,[at,at+d],[0,1],{...cl,easing:EO});
const CPS=1.6; // typed characters per frame
const typed=(s:string,f:number,at:number)=>s.slice(0,Math.max(0,Math.floor((f-at)*CPS)));
const doneAt=(s:string,at:number)=>at+Math.ceil(s.length/CPS);
/* blinking block cursor */
const Caret:React.FC<{h:number;on?:boolean}>=({h,on=true})=>{const {t,f}=useS();return on&&Math.floor(f/8)%2===0?<span style={{display:'inline-block',width:h*.55,height:h,background:t.accent,verticalAlign:'text-bottom',marginLeft:4}}/>:<span style={{display:'inline-block',width:h*.55}}/>};
/* shell command with simple syntax colours: git = green, subcommand = yellow, flags = blue, rest = ink */
export const Cmd:React.FC<{s:string;at:number;size?:number;caret?:boolean;prompt?:string}>=({s,at,size=46,caret=true,prompt='$'})=>{const {t,f}=useS();if(f<at-2)return null;
 const shown=typed(s,f,at);const typing=f<doneAt(s,at)+12;let pos=0;
 return <div style={{...Bd(t,size),fontWeight:600,whiteSpace:'pre-wrap',wordBreak:'break-word',lineHeight:1.3}}><span style={{color:t.accent2}}>{prompt} </span>{s.split(/(\s+)/).map((w,k)=>{const a=pos;pos+=w.length;const vis=shown.slice(a,pos);if(!vis)return null;
  const wi=s.slice(0,a).trim().split(/\s+/).filter(Boolean).length;const c=w.startsWith('-')?C.blue:w.startsWith('"')||w.endsWith('"')?t.accent2:wi===0?t.accent2:wi===1?t.accent:t.ink;return <span key={k} style={{color:c}}>{vis}</span>})}{caret&&typing&&<Caret h={size*.95}/>}</div>};
/* "// 01 · text" comment header */
const Head:React.FC<{n:string;txt:string}>=({n,txt})=>{const {t}=useS();return <It i={0}><div style={{...Bd(t,34,C.dim),letterSpacing:1,marginBottom:28,display:'flex',gap:18,alignItems:'center'}}><span style={{background:t.accent,color:t.onAccent,padding:'2px 14px',fontWeight:800}}>{n}</span><span>// {txt}</span></div></It>};
/* big bold headline line; hl = highlighted (accent block) */
const Big:React.FC<{s:string;size:number;hl?:boolean;c?:string}>=({s,size,hl,c})=>{const {t}=useS();return <div style={{...H(t,size,hl?t.onAccent:c??t.ink),lineHeight:1.08,letterSpacing:-3,display:'inline-block',background:hl?t.accent:'transparent',padding:hl?'0 18px':0,marginLeft:hl?-18:0}}>{s}</div>};

/* 1. hook: typed commands, then a big title */
export const CmdHook:React.FC<{cmds:{s:string;at:number}[];l1:string;l2:string;l3?:string;titleAt:number;deck?:string}>=({cmds,l1,l2,l3,titleAt,deck})=>{const {t,f}=useS();
 return <div>
  <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:70}}>{cmds.map((c,k)=><Cmd key={k} s={c.s} at={c.at} size={58} caret={k===cmds.length-1||f<(cmds[k+1]?.at??0)}/>)}</div>
  {f>=titleAt&&<div style={{display:'flex',flexDirection:'column',gap:10}}>
   <It at={titleAt}><Big s={l1} size={190}/></It>
   <It at={titleAt+5}><Big s={l2} size={190} hl/></It>
   {l3&&<It at={titleAt+10}><Big s={l3} size={130}/></It>}
   {deck&&<It at={titleAt+16}><div style={{...Bd(t,46,C.dim),marginTop:50,borderLeft:`6px solid ${t.accent2}`,paddingLeft:24}}>{deck}</div></It>}</div>}
 </div>};

/* 2. git graph: mode "merge" adds a merge commit with two parents; "rebase" replays the branch commits on top of main */
type Note={s:string;at:number;mark?:'+'|'-'|'~'};
const Notes:React.FC<{notes:Note[]}>=({notes})=>{const {t,f}=useS();return <div style={{display:'flex',flexDirection:'column',gap:14,marginTop:30}}>{notes.map((n,k)=>{if(f<n.at)return null;const m=n.mark??'+';const c=m==='+'?t.accent2:m==='-'?C.red:t.accent;
 return <It key={k} at={n.at}><div style={{...Bd(t,52),fontWeight:700,background:m==='+'?'#3DDC6B1F':m==='-'?'#FF5F561F':'#FFD60A1A',borderLeft:`8px solid ${c}`,padding:'12px 22px',display:'flex',gap:20}}><span style={{color:c,fontWeight:800}}>{m}</span><span style={{textDecoration:m==='-'?'line-through':'none',textDecorationColor:C.red}}>{n.s}</span></div></It>})}</div>};
export const GitGraph:React.FC<{mode:'merge'|'rebase';cmd:string;cmdAt:number;showAt?:number;actAt:number;notes?:Note[];main?:string;branch?:string}>=({mode,cmd,cmdAt,showAt=0,actAt,notes=[],main='main',branch='feature'})=>{const {t,f}=useS();
 const W=894,Y1=170,Y2=450,R=52,X=[70,250,430,610,800];
 const g=pop(f,showAt,12);const a=interpolate(f,[actAt,actAt+22],[0,1],{...cl,easing:EIO});
 const node=(x:number,y:number,lab:string,o:{fill?:string;ghost?:boolean;k?:number;sc?:number}={})=>{const p=pop(f,showAt+(o.k??0)*3,10)*(o.sc??1);return <g key={lab+x+y} transform={`translate(${x} ${y}) scale(${p})`} opacity={o.ghost?.28:1}>
  <circle r={R} fill={o.fill??t.bg} stroke={o.fill?o.fill:t.ink} strokeWidth={7} strokeDasharray={o.ghost?'10 9':undefined}/>
  <text y={14} textAnchor="middle" style={{fontFamily:'JBM',fontWeight:800,fontSize:lab.length>2?34:40,fill:o.fill?t.onAccent:t.ink}}>{lab}</text></g>};
 const edge=(x1:number,y1:number,x2:number,y2:number,p:number,c?:string,dash?:boolean)=>{const L=Math.hypot(x2-x1,y2-y1);return <line key={`${x1}${y1}${x2}${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c??t.ink} strokeWidth={7} strokeDasharray={dash?'12 10':`${L} ${L}`} strokeDashoffset={dash?0:L*(1-p)} opacity={dash?.28:1}/>};
 const tag=(x:number,y:number,s:string,c:string,dy=-R-58)=><g key={s} transform={`translate(${x} ${y+dy})`}><rect x={-s.length*11-16} y={0} width={s.length*22+32} height={44} fill={c}/><text y={33} textAnchor="middle" style={{fontFamily:'JBM',fontWeight:800,fontSize:30,fill:t.onAccent}}>{s}</text></g>;
 const base=[edge(X[0],Y1,X[1],Y1,g),edge(X[1],Y1,X[2],Y1,g)];
 let body:React.ReactNode;
 if(mode==='merge'){const mp=pop(f,actAt+14,10);
  body=<>{base}{edge(X[1],Y1,X[2],Y2,g)}{edge(X[2],Y2,X[3],Y2,g)}
   {edge(X[2],Y1,X[4],Y1,a,t.accent)}{edge(X[3],Y2,X[4],Y1,a,t.accent)}
   {node(X[0],Y1,'C1')}{node(X[1],Y1,'C2',{k:1})}{node(X[2],Y1,'C3',{k:2})}{node(X[2],Y2,'C4',{k:3})}{node(X[3],Y2,'C5',{k:4})}
   {f>=actAt+14&&node(X[4],Y1,'M',{fill:t.accent,sc:mp/Math.max(.001,pop(f,showAt,10))})}
   {f>=actAt+14&&<g opacity={mp}>{tag(X[4],Y1,main,t.accent2)}<text x={X[4]-20} y={Y1+R+56} textAnchor="start" style={{fontFamily:'JBM',fontWeight:800,fontSize:34,fill:t.accent}}>2 cha</text></g>}
   {f<actAt+14&&<g opacity={g}>{tag(X[2],Y1,main,t.accent2)}</g>}{tag(X[3],Y2,branch,t.ink,R+14)}</>}
 else {const mv=(x0:number,y0:number,x1:number,y1:number,d:number)=>{const p=interpolate(f,[actAt+d,actAt+d+18],[0,1],{...cl,easing:EIO});return [x0+(x1-x0)*p,y0+(y1-y0)*p,p] as const};
  const [ax,ay,ap]=mv(X[2],Y2,X[3],Y1,0),[bx,by,bp]=mv(X[3],Y2,X[4],Y1,6);
  body=<>{base}{edge(X[1],Y1,X[2],Y2,g,undefined,f>=actAt)}{edge(X[2],Y2,X[3],Y2,g,undefined,f>=actAt)}
   {f>=actAt&&<>{edge(X[2],Y1,X[3],Y1,ap,t.accent)}{edge(X[3],Y1,X[4],Y1,bp,t.accent)}</>}
   {node(X[0],Y1,'C1')}{node(X[1],Y1,'C2',{k:1})}{node(X[2],Y1,'C3',{k:2})}
   {f>=actAt&&<>{node(X[2],Y2,'C4',{ghost:true})}{node(X[3],Y2,'C5',{ghost:true})}</>}
   {f<actAt?<>{node(X[2],Y2,'C4',{k:3})}{node(X[3],Y2,'C5',{k:4})}</>:<>{node(ax,ay,ap>.5?"C4'":'C4',{fill:ap>.5?t.accent:undefined})}{node(bx,by,bp>.5?"C5'":'C5',{fill:bp>.5?t.accent:undefined})}</>}
   {tag(f>=actAt+24?X[4]:X[2],Y1,main,t.accent2)}{tag(bx,by,branch,t.ink,by>Y1+10?R+14:R+14)}</>}
 return <div><Head n={mode==='merge'?'01':'02'} txt={mode}/>
  <div style={{marginBottom:24}}><Cmd s={cmd} at={cmdAt} size={54}/></div>
  <div style={{background:C.panel,border:`3px solid ${C.line}`,padding:'26px 0 6px',opacity:g}}><svg width={W} height={600} viewBox={`0 0 ${W} 600`}>{body}</svg></div>
  <Notes notes={notes}/></div>};

/* 3. terminal output panes, lines appear one by one. A line = list of [text, colour]: hash | graph | ink | dim | green | red | yellow */
type Seg=[string,string?];
export const LogPanes:React.FC<{n:string;kick:string;panes:{title:string;cmd:string;at:number;lines:Seg[][];verdict?:string;good?:boolean}[]}>=({n,kick,panes})=>{const {t,f}=useS();
 const col=(k?:string)=>({hash:t.accent,graph:C.dim,dim:C.dim,green:t.accent2,red:C.red,yellow:t.accent} as any)[k??'']??t.ink;
 return <div><Head n={n} txt={kick}/>{panes.map((p,k)=>{const d=doneAt(p.cmd,p.at);return f<p.at-2?null:<It key={k} at={p.at-2}><div style={{background:C.panel,border:`3px solid ${C.line}`,marginBottom:34}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:C.line,padding:'10px 22px'}}><span style={{...Bd(t,30,C.dim)}}>● ● ●  {p.title}</span>{p.verdict&&f>=d+p.lines.length*2+4&&<span style={{...Bd(t,30,t.onAccent),fontWeight:800,background:p.good?t.accent2:t.accent,padding:'2px 14px'}}>{p.verdict}</span>}</div>
  <div style={{padding:'20px 26px 24px'}}><Cmd s={p.cmd} at={p.at} size={38} caret={false}/>
   {p.lines.map((l,j)=>f<d+j*2?null:<div key={j} style={{...Bd(t,42),fontWeight:600,whiteSpace:'pre',lineHeight:1.35,opacity:pop(f,d+j*2,4)}}>{l.map((s,m)=><span key={m} style={{color:col(s[1])}}>{s[0]}</span>)}</div>)}</div></div></It>})}</div>};

/* 4. the rule: quoted line from the docs as a diff, plus stamp */
export const DocRule:React.FC<{n:string;kick:string;src:string;quote:string;quoteAt:number;tr:string;trAt:number;bad:string;badAt:number;stamp?:{at:number;text:string;sub:string}}>=({n,kick,src,quote,quoteAt,tr,trAt,bad,badAt,stamp})=>{const {t,f}=useS();
 return <div style={{position:'relative'}}><Head n={n} txt={kick}/>
  <It at={quoteAt}><div style={{background:C.panel,border:`3px solid ${C.line}`,padding:'26px 30px'}}>
   <div style={{...Bd(t,30,C.dim),marginBottom:16}}>{src}</div>
   <div style={{...Bd(t,46),fontWeight:600,color:t.ink,lineHeight:1.35}}>“{quote}”</div></div></It>
  {f>=trAt&&<It at={trAt}><div style={{marginTop:40}}><Big s={tr} size={104} c={t.accent}/></div></It>}
  {f>=badAt&&<It at={badAt}><div style={{marginTop:44,...Bd(t,50),fontWeight:700,background:'#FF5F561F',borderLeft:`8px solid ${C.red}`,padding:'14px 22px',color:C.red}}>- {bad}</div></It>}
  {stamp&&<Stamp at={stamp.at} text={stamp.text} sub={stamp.sub} style={{right:20,bottom:-170}}/>}</div>};

/* 5. verdict as code, then a commit command (keep content above the Follow button at y≈1100) */
export const CommitCTA:React.FC<{n:string;kick:string;rows:{k:string;v:string;at:number}[];cmd:string;cmdAt:number}>=({n,kick,rows,cmd,cmdAt})=>{const {t,f}=useS();
 return <div><Head n={n} txt={kick}/>
  <div style={{display:'flex',flexDirection:'column',gap:22}}>{rows.map((r,k)=>f<r.at?null:<It key={k} at={r.at}><div style={{display:'flex',alignItems:'center',gap:24,border:`5px solid ${t.ink}`,padding:'18px 26px'}}>
   <span style={{...Bd(t,52),fontWeight:700,flex:1}}>{r.k}</span><span style={{...Bd(t,40,C.dim)}}>→</span><span style={{...H(t,84,t.onAccent),background:k===0?t.accent:t.accent2,padding:'0 18px'}}>{r.v}</span></div></It>)}</div>
  <div style={{marginTop:56}}><Cmd s={cmd} at={cmdAt} size={44}/></div></div>};
