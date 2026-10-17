import {BrandTile,HANDLES,Handle,useBrand,fitSize} from './brand';
// tech-explain-cyber (GIẢI THÍCH CYBER): "dark blueprint" scenes.
// One cold cyan accent, hairlines, self-drawing strokes, dimension lines, callouts, slow precise easing.
import React from 'react';import {interpolate,Easing,useCurrentFrame,AbsoluteFill} from 'remotion';import {useS,FONTS} from './sys';
const ES=Easing.bezier(.25,.1,.25,1),EO=Easing.bezier(.22,.61,.36,1);const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const MONO='JBM',SANS='BVPM';
const pr=(f:number,at:number,d=24)=>interpolate(f,[at,at+d],[0,1],{...cl,easing:ES});
export const BP={bg:'#1C1C1C',grid:'rgba(255,255,255,0.028)',grid2:'rgba(255,255,255,0.055)',line:'#303030',hair:'#3E3E3E',dim:'#8C8C8C',ink:'#E6E6E6',cy:'#5CD6E8',cyDim:'rgba(92,214,232,0.14)',panel:'#222222',warm:'#C9A27A'};
const lbl=(size=22,c=BP.dim):React.CSSProperties=>({fontFamily:MONO,fontSize:size,letterSpacing:3,textTransform:'uppercase',color:c,fontWeight:500});
/* fig label + refined sans heading */
const Fig:React.FC<{n:string;cap:string;title:string;at?:number}>=({n,cap,title,at=0})=>{const {f,t}=useS();const A=(t as any).accent as string,A2=((t as any).accent3||A) as string,ON=(t as any).onAccent as string;const p=pr(f,at,20);
 return <div style={{marginBottom:40,opacity:p,transform:`translateY(${(1-p)*16}px)`}}>
  <div style={{...lbl(22,A),display:'flex',gap:16,alignItems:'center'}}><span style={{width:40,height:2,background:A}}/><span>{cap}</span></div>
  <div style={{fontFamily:SANS,fontSize:68,lineHeight:1.12,color:BP.ink,marginTop:16,letterSpacing:-1}}>{title}</div></div>};
/* frame with corner ticks */
const Frame:React.FC<{children:React.ReactNode;style?:React.CSSProperties;p?:number;tag?:string}>=({children,style,p=1,tag})=>{const A=(useS().t as any).accent as string;const T=18;const c=(s:React.CSSProperties)=><div style={{position:'absolute',width:T,height:T,borderColor:A,borderStyle:'solid',borderWidth:0,...s}}/>;
 return <div style={{position:'relative',border:`1.5px solid ${BP.hair}`,background:'rgba(36,36,36,0.72)',clipPath:`inset(0 ${(1-p)*100}% 0 0)`,...style}}>
  {c({left:-2,top:-2,borderLeftWidth:2,borderTopWidth:2})}{c({right:-2,top:-2,borderRightWidth:2,borderTopWidth:2})}{c({left:-2,bottom:-2,borderLeftWidth:2,borderBottomWidth:2})}{c({right:-2,bottom:-2,borderRightWidth:2,borderBottomWidth:2})}
  {tag&&<div style={{position:'absolute',top:-13,left:24,background:BP.bg,padding:'0 10px',...lbl(20)}}>{tag}</div>}{children}</div>};
/* kotlin highlight, restrained: keywords cyan, everything else ink/dim */
const KW=/^(val|var|fun|class|private|by|object|return|this@\w+|static|final|extends|void|int|bool|setState)$/;
const kt=(line:string,A:string)=>line.trimStart().startsWith('//')?[<span key={0} style={{color:BP.dim,fontStyle:'italic'}}>{line}</span>]:line.split(/(\s+|[(){}<>,:=.]|"[^"]*")/).filter(x=>x!=='').map((w,k)=><span key={k} style={{color:KW.test(w)?A:/^[(){}<>,:=.]$/.test(w)?BP.dim:/^[A-Z]/.test(w)?'#FFFFFF':BP.ink}}>{w}</span>);

/* 1. code with line numbers, a dimension bracket over a line range, and a callout */
export const BpCode:React.FC<{n:string;cap:string;title:string;file:string;lines:{s:string;at:number}[];dim?:{from:number;to:number;label:string;sub?:string;at:number;x?:number};callout?:{line:number;text:string;at:number};note?:{s:string;at:number}}>=({n,cap,title,file,lines,dim,callout,note})=>{const {f,t}=useS();const A=(t as any).accent as string,A2=((t as any).accent3||A) as string,ON=(t as any).onAccent as string;
 const LH=60,TOP=74,FS=36;const fp=pr(f,0,26);
 return <div><Fig n={n} cap={cap} title={title}/>
  <div style={{...lbl(20),display:'flex',justifyContent:'space-between',marginBottom:14,opacity:fp}}><span>{file}</span><span style={{color:A}}>KOTLIN</span></div><Frame p={fp}><div style={{padding:`${TOP-44}px 0 30px`,position:'relative'}}>
   {lines.map((l,k)=>{const p=pr(f,l.at,14);const shown=l.s.slice(0,Math.floor(l.s.length*p));
    return <div key={k} style={{display:'flex',height:LH,alignItems:'center',fontFamily:MONO,fontSize:FS,whiteSpace:'pre'}}>
     <span style={{width:70,textAlign:'right',paddingRight:22,color:p>0?BP.dim:'#4A4A4A',fontSize:24}}>{String(k+1).padStart(2,'0')}</span>
     <span style={{borderLeft:`1px solid ${BP.line}`,paddingLeft:22,height:'100%',display:'flex',alignItems:'center'}}>{kt(shown,A)}</span></div>})}
   {dim&&(()=>{const p=pr(f,dim.at,26);const y1=TOP-44+dim.from*LH+10,y2=TOP-44+(dim.to+1)*LH-10,x=dim.x??640;
    return <svg style={{position:'absolute',left:0,top:0,overflow:'visible'}} width={894} height={y2+40}>
     <path d={`M${x-18} ${y1} H${x} V${y2} H${x-18}`} fill="none" stroke={A} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1-p}/>
     <path d={`M${x} ${(y1+y2)/2} H${x+34}`} stroke={A} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1-pr(f,dim.at+18,12)}/>
     <g opacity={pr(f,dim.at+24,14)}><text x={x+46} y={(y1+y2)/2-4} style={{fontFamily:SANS,fontSize:58,fill:A}}>{dim.label}</text>
     {dim.sub&&<text x={x+48} y={(y1+y2)/2+34} style={{fontFamily:MONO,fontSize:20,letterSpacing:3,fill:BP.dim}}>{dim.sub}</text>}</g></svg>})()}
  </div></Frame>
  {callout&&(()=>{const p=pr(f,callout.at,20);return <div style={{display:'flex',alignItems:'flex-start',gap:18,marginTop:48,opacity:p}}>
   <svg width={60} height={40} style={{flex:'none'}}><circle cx={6} cy={6} r={5} fill={A}/><path d="M6 6 L30 30 H60" stroke={A} strokeWidth={1.5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1-p}/></svg>
   <div><div style={lbl(20,A)}>DÒNG {String(callout.line).padStart(2,'0')}</div><div style={{fontFamily:SANS,fontSize:42,color:BP.ink,lineHeight:1.3,marginTop:6,maxWidth:820}}>{callout.text}</div></div></div>})()}
  {note&&f>=note.at&&<div style={{marginTop:36,paddingTop:22,borderTop:`1px solid ${BP.line}`,fontFamily:SANS,fontSize:40,color:BP.dim,lineHeight:1.3,opacity:pr(f,note.at,20)}}>{note.s}</div>}
 </div>};

/* 2. blueprint dependency graph: framework container builds deps, data flows into the consumer */
type Pt=[number,number];
const along=(pts:Pt[],p:number):Pt=>{const seg=pts.slice(1).map((q,i)=>Math.hypot(q[0]-pts[i][0],q[1]-pts[i][1]));const L=seg.reduce((a,b)=>a+b,0);let d=p*L;
 for(let i=0;i<seg.length;i++){if(d<=seg[i]||i===seg.length-1){const r=seg[i]?Math.min(1,d/seg[i]):0;return [pts[i][0]+(pts[i+1][0]-pts[i][0])*r,pts[i][1]+(pts[i+1][1]-pts[i][1])*r]}d-=seg[i]}return pts[pts.length-1]};
const poly=(pts:Pt[])=>'M'+pts.map(p=>p.join(' ')).join(' L');
export const BpGraph:React.FC<{n:string;cap:string;title:string;deps:string[];root:string;consumer:string;call:string;fw:string;at?:number;flowAt:number;dimLabel?:string;callouts?:{text:string;at:number}[]}>=({n,cap,title,deps,root,consumer,call,fw,at=0,flowAt,dimLabel,callouts=[]})=>{const {f,t}=useS();const A=(t as any).accent as string,A2=((t as any).accent3||A) as string,ON=(t as any).onAccent as string;
 const W=894,H=980;const bw=380,bh=84;const gx=[30,W-30-bw];const gy=[96,210];
 const boxes=deps.map((d,k)=>({d,x:gx[k%2],y:gy[Math.floor(k/2)]}));
 const RX=W/2-200,RY=520,RW=400,RH=104;const CX=W/2-170,CY=800,CW=340,CH=96;
 const draw=(d:string,a:number,dur=26,c=BP.hair,w=1.5,dash?:string)=><path d={d} fill="none" stroke={c} strokeWidth={w} pathLength={dash?undefined:1} strokeDasharray={dash??1} strokeDashoffset={dash?0:1-pr(f,a,dur)} opacity={dash?pr(f,a,dur):1}/>;
 const rect=(x:number,y:number,w:number,h:number,a:number,c=BP.hair,sw=1.5)=>draw(`M${x} ${y} H${x+w} V${y+h} H${x} Z`,a,30,c,sw);
 const txt=(x:number,y:number,s:string,a:number,o:React.CSSProperties={})=><text x={x} y={y} textAnchor="middle" opacity={pr(f,a,18)} style={{fontFamily:MONO,fontSize:30,fill:BP.ink,...(o as any)}}>{s}</text>;
 const BUS=gy[1]+bh+70;const paths:Pt[][]=boxes.map((b,k)=>{const L=b.x<W/2;const xi=W/2+(L?-22:22);const xr=W/2+(L?-120:120);return k<2?[[L?b.x+bw:b.x,b.y+bh/2],[xi,b.y+bh/2],[xi,RY]]:[[b.x+bw/2,b.y+bh],[b.x+bw/2,BUS],[xr,BUS],[xr,RY]]});
 const out:Pt[]=[[W/2,RY+RH],[W/2,CY]];
 return <div><Fig n={n} cap={cap} title={title}/>
  <svg width={W} height={H} style={{overflow:'visible'}}>
   {/* framework container */}
   {draw(`M10 40 H${W-10} V${gy[1]+bh+36} H10 Z`,at,30,A,1.5,'10 8')}
   <g opacity={pr(f,at+6,18)}><rect x={30} y={26} width={fw.length*15+40} height={30} fill={BP.bg}/><text x={46} y={50} style={{fontFamily:MONO,fontSize:22,letterSpacing:3,fill:A}}>{fw}</text></g>
   {boxes.map((b,k)=><g key={k}>{rect(b.x,b.y,bw,bh,at+8+k*5)}{txt(b.x+bw/2,b.y+bh/2+11,b.d,at+20+k*5)}</g>)}
   {paths.map((p,k)=><g key={'p'+k}>{draw(poly(p),at+30+k*4,30)}</g>)}
   {rect(RX,RY,RW,RH,at+40,A,2.5)}<rect x={RX} y={RY} width={RW} height={RH} fill={A} opacity={pr(f,at+46,20)}/>{txt(W/2,RY+RH/2+13,root,at+50,{fontSize:38,fill:ON,fontWeight:700})}
   <g opacity={pr(f,at+50,18)}><path d={`M${RX-14} ${RY} V${RY+RH} M${RX-20} ${RY} H${RX-8} M${RX-20} ${RY+RH} H${RX-8}`} stroke={BP.dim} strokeWidth={1}/><text x={RX-34} y={RY+RH/2-6} textAnchor="end" style={{fontFamily:MONO,fontSize:20,letterSpacing:3,fill:BP.dim}}>OBJECT</text><text x={RX-34} y={RY+RH/2+26} textAnchor="end" style={{fontFamily:MONO,fontSize:22,letterSpacing:3,fill:BP.ink}}>8 THAM SỐ</text></g>
   {draw(poly(out),at+56,22,A,2)}
   <g opacity={pr(f,at+64,16)}><rect x={W/2+18} y={(RY+RH+CY)/2-22} width={call.length*19+24} height={40} fill={A2} stroke={A2} strokeWidth={1}/><text x={W/2+30} y={(RY+RH+CY)/2+7} style={{fontFamily:MONO,fontSize:28,fill:ON,fontWeight:700}}>{call}</text></g>
   {rect(CX,CY,CW,CH,at+60)}{txt(W/2,CY+CH/2+11,consumer,at+70)}
   {/* dimension line across the container */}
   {dimLabel&&<g opacity={pr(f,at+44,20)}><path d={`M10 ${gy[1]+bh+70-10} V${gy[1]+bh+70+10} M10 ${gy[1]+bh+70} H${W-10} M${W-10} ${gy[1]+bh+70-10} V${gy[1]+bh+70+10}`} stroke={BP.dim} strokeWidth={1}/></g>}
   {/* data flow: packets travel from each dep into the root, then root into the consumer */}
   {f>=flowAt&&paths.map((p,k)=>[0,1].map(j=>{const ph=((f-flowAt)/54+k*.13+j*.5)%1;const [x,y]=along(p,ph);return <circle key={`${k}-${j}`} cx={x} cy={y} r={6} fill={A2} style={{filter:`drop-shadow(0 0 6px ${A2})`}} opacity={Math.sin(Math.PI*ph)}/>}))}
   {f>=flowAt+20&&[0,1].map(j=>{const ph=((f-flowAt-20)/40+j*.5)%1;const [x,y]=along(out,ph);return <circle key={'o'+j} cx={x} cy={y} r={7} fill={A2} style={{filter:`drop-shadow(0 0 8px ${A2})`}} opacity={Math.sin(Math.PI*ph)}/>})}
  </svg>
  <div style={{display:'flex',flexDirection:'column',gap:18,marginTop:24}}>{callouts.map((c,k)=><div key={k} style={{display:'flex',gap:16,alignItems:'baseline',opacity:pr(f,c.at,20)}}><span style={lbl(20,A)}>{String.fromCharCode(65+k)}</span><span style={{fontFamily:SANS,fontSize:38,color:BP.ink,lineHeight:1.3}}>{c.text}</span></div>)}</div>
 </div>};

/* 3. HUD spec card: from (struck, dim) -> to (cyan) */
export const SpecCard:React.FC<{n:string;cap:string;title:string;head:string;rows:{k:string;from:string;to:string;at:number}[];foot?:string}>=({n,cap,title,head,rows,foot})=>{const {f,t}=useS();const A=(t as any).accent as string,A2=((t as any).accent3||A) as string,ON=(t as any).onAccent as string;const fp=pr(f,0,26);
 return <div><Fig n={n} cap={cap} title={title}/>
  <Frame p={fp}><div style={{display:'flex',justifyContent:'space-between',padding:'20px 30px',borderBottom:`1px solid ${BP.line}`,...lbl(20)}}><span style={{color:A}}>{head}</span></div>
   {rows.map((r,k)=>{const p=pr(f,r.at,22),s=pr(f,r.at+12,18),q=pr(f,r.at+22,20);return <div key={k} style={{padding:'44px 30px 48px',borderBottom:k<rows.length-1?`1px solid ${BP.line}`:'none',opacity:p}}>
    <div style={{display:'flex',alignItems:'baseline',gap:20}}><span style={{fontFamily:SANS,fontSize:54,color:A,width:80}}>{String(k+1).padStart(2,'0')}</span><span style={{fontFamily:SANS,fontSize:50,color:BP.ink}}>{r.k}</span></div>
    <div style={{display:'flex',alignItems:'center',gap:22,marginTop:24,marginLeft:100}}>
     <span style={{fontFamily:MONO,fontSize:32,color:BP.dim,position:'relative'}}>{r.from}<span style={{position:'absolute',left:0,top:'52%',height:1.5,width:`${s*100}%`,background:BP.dim}}/></span>
     <svg width={70} height={16}><path d="M0 8 H62 M54 2 L62 8 L54 14" stroke={A} strokeWidth={1.5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1-q}/></svg>
     <span style={{fontFamily:MONO,fontSize:36,color:A,opacity:q,border:`1px solid ${A}`,padding:'4px 14px',background:A+'26'}}>{r.to}</span></div></div>})}</Frame>
  {foot&&<div style={{marginTop:34,...lbl(20)}}>{foot}</div>}
 </div>};

/* blueprint chrome: fine grid, ruler, title block */
export const BpChrome:React.FC<{section:string;page:string}>=({section,page})=>{const {t}=useS();const B=useBrand();const A=(t as any).accent as string;return <>
 <AbsoluteFill style={{backgroundImage:`linear-gradient(${BP.grid} 1px,transparent 1px),linear-gradient(90deg,${BP.grid} 1px,transparent 1px),linear-gradient(${BP.grid2} 1px,transparent 1px),linear-gradient(90deg,${BP.grid2} 1px,transparent 1px)`,backgroundSize:'24px 24px,24px 24px,120px 120px,120px 120px',backgroundPosition:'136px 0,136px 0,136px 0,136px 0'}}/>
 <AbsoluteFill style={{background:'radial-gradient(120% 80% at 50% 35%, transparent 55%, rgba(10,10,10,.55) 100%)'}}/>
 <div style={{position:'absolute',left:40,right:40,top:40,bottom:40,border:`1px solid ${BP.line}`}}/>
 <div style={{position:'absolute',left:136,right:50,top:86,display:'flex',justifyContent:'space-between',alignItems:'baseline',paddingBottom:22,borderBottom:`1px solid ${BP.hair}`}}>
  <div><div style={{fontFamily:'BVPX',fontSize:fitSize(B.wordmark,560,46,.66),lineHeight:1,color:BP.ink,letterSpacing:1.5,whiteSpace:'nowrap'}}>{B.wordmark}</div></div>
  <div style={{fontFamily:MONO,fontSize:26,lineHeight:1,color:BP.dim}}>{page}</div></div>
 
 <div style={{position:'absolute',left:64,top:300,bottom:330,width:30}}>{Array.from({length:27},(_,k)=><div key={k} style={{position:'absolute',top:k*48,right:0,width:k%5===0?22:10,height:1,background:k%5===0?BP.dim:BP.hair}}></div>)}</div></>};

/* end card */
export const BpEndCard:React.FC<{A?:string;dur?:number;handles?:Handle[];tagline?:string}>=({A='#5CD6E8',dur=75,handles,tagline=''})=>{const f=useCurrentFrame();const B=useBrand();handles=handles??B.handles;const p=(a:number,d=24)=>interpolate(f,[a,a+d],[0,1],{...cl,easing:EO});const out=interpolate(f,[dur-10,dur],[1,0],cl);
 return <AbsoluteFill style={{zIndex:40,background:BP.bg,opacity:Math.min(1,p(0,10))*out}}><style>{FONTS}</style>
  <AbsoluteFill style={{backgroundImage:`linear-gradient(${BP.grid} 1px,transparent 1px),linear-gradient(90deg,${BP.grid} 1px,transparent 1px)`,backgroundSize:'24px 24px'}}/>
  <div style={{position:'absolute',left:40,right:40,top:40,bottom:40,border:`1px solid ${BP.line}`}}/>
  <div style={{position:'absolute',left:136,right:220,top:640}}>
   
   <svg width={724} height={8} style={{marginTop:22}}><path d="M0 4 H724" stroke={A} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1-p(6,30)}/></svg>
   <div style={{fontFamily:'BVPX',fontSize:fitSize(B.name,724,150,.6),whiteSpace:'nowrap',color:BP.ink,lineHeight:1.12,marginTop:30,letterSpacing:-3,opacity:p(10),transform:`translateY(${(1-p(10))*20}px)`}}>{B.name}</div>
   <div style={{fontFamily:SANS,fontSize:46,color:BP.dim,marginTop:18,opacity:p(16)}}>{tagline}</div>
   <div style={{marginTop:70,display:'flex',flexDirection:'column',gap:0}}>{handles.map((h,k)=><div key={k} style={{display:'flex',alignItems:'center',gap:26,padding:'20px 0',borderTop:`1px solid ${BP.hair}`,borderBottom:k===handles.length-1?`1px solid ${BP.hair}`:'none',opacity:p(22+k*5)}}>
    <BrandTile icon={h.icon} size={56} radius={6}/><span style={{fontFamily:MONO,fontSize:48,color:k===0?A:BP.ink}}>{h.h}</span></div>)}</div>
  </div>
  {/* footer dropped (bottom UI zone) */}
 </AbsoluteFill>};

/* ---------- phase 2 scenes ---------- */
const useA=()=>{const {f,t}=useS();return {f,t,A:(t as any).accent as string,A2:((t as any).accent3||(t as any).accent) as string,ON:(t as any).onAccent as string}};
const Strike:React.FC<{p:number;c?:string}>=({p,c=BP.dim})=><span style={{position:'absolute',left:-4,top:'54%',height:2,width:`calc(${p*100}% + 8px)`,background:c}}/>;

/* requirement card: new screen needs data locked in a private State */
export const BpReq:React.FC<{n:string;cap:string;title:string;items:{s:string;at:number}[];from:string;to:string;lock:{s:string;at:number};flowAt?:number}>=({n,cap,title,items,from,to,lock,flowAt=0})=>{const {f,A,ON}=useA();const fp=pr(f,0,26);const lp=pr(f,lock.at,22);
 const W=894;const bw=330,bh=150,y=60;
 return <div><Fig n={n} cap={cap} title={title}/>
  <Frame p={fp}><div style={{padding:'20px 30px',borderBottom:`1px solid ${BP.line}`,...lbl(20,A)}}>{to} · cần hiển thị</div>
   <div style={{padding:'18px 30px 26px'}}>{items.map((it,k)=>{const p=pr(f,it.at,16);return <div key={k} style={{display:'flex',alignItems:'center',gap:24,padding:'16px 0',opacity:.35+.65*p}}>
    <span style={{width:30,height:30,border:`2px solid ${p>0.5?A:BP.hair}`,background:p>0.5?A:'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:ON,fontFamily:MONO,fontSize:22,fontWeight:700}}>{p>0.5?'✓':''}</span>
    <span style={{fontFamily:SANS,fontSize:44,color:BP.ink}}>{it.s}</span></div>})}</div></Frame>
  <svg width={W} height={340} style={{marginTop:60,overflow:'visible'}}>
   <rect x={0} y={y} width={bw} height={bh} fill="none" stroke={BP.hair} strokeWidth={1.5}/>
   <text x={bw/2} y={y+52} textAnchor="middle" style={{fontFamily:MONO,fontSize:30,fill:BP.ink}}>{from}</text>
   <g opacity={lp}><rect x={22} y={y+78} width={bw-44} height={50} fill={A}/><text x={bw/2} y={y+111} textAnchor="middle" style={{fontFamily:MONO,fontSize:24,fill:ON,fontWeight:700}}>{lock.s}</text></g>
   <rect x={W-bw} y={y} width={bw} height={bh} fill="none" stroke={BP.hair} strokeWidth={1.5} strokeDasharray="8 6"/>
   <text x={W-bw/2} y={y+bh/2+11} textAnchor="middle" style={{fontFamily:MONO,fontSize:30,fill:BP.ink}}>{to}</text>
   <path d={`M${bw+16} ${y+bh/2} H${W-bw-16}`} stroke={BP.dim} strokeWidth={1.5} strokeDasharray="6 8" opacity={pr(f,flowAt,20)}/>
   <g opacity={lp}><circle cx={W/2} cy={y+bh/2} r={34} fill={BP.bg} stroke={A} strokeWidth={2}/><text x={W/2} y={y+bh/2+16} textAnchor="middle" style={{fontFamily:SANS,fontSize:46,fill:A}}>?</text></g>
   <text x={0} y={y+bh+56} opacity={lp} style={{fontFamily:SANS,fontSize:34,fill:BP.dim}}>private · chỉ màn hình game thấy được</text>
  </svg></div>};

/* options that get struck out one by one */
export const BpOptions:React.FC<{n:string;cap:string;title:string;opts:{k:string;why:string;at:number;strikeAt:number}[]}>=({n,cap,title,opts})=>{const {f,A}=useA();
 return <div><Fig n={n} cap={cap} title={title}/>
  <div style={{display:'flex',flexDirection:'column'}}>{opts.map((o,k)=>{const p=pr(f,o.at,22),s=pr(f,o.strikeAt,20);return <div key={k} style={{padding:'34px 0 38px',borderTop:`1px solid ${BP.line}`,opacity:p,transform:`translateY(${(1-p)*14}px)`}}>
   <div style={{display:'flex',alignItems:'baseline',gap:24}}><span style={{fontFamily:SANS,fontSize:52,color:s>0.5?BP.dim:A,width:84}}>{String(k+1).padStart(2,'0')}</span>
    <span style={{fontFamily:SANS,fontSize:50,color:s>0.5?BP.dim:BP.ink,position:'relative',lineHeight:1.2}}>{o.k}<Strike p={s} c={A}/></span></div>
   <div style={{fontFamily:SANS,fontSize:36,color:BP.dim,lineHeight:1.35,marginTop:14,marginLeft:108,opacity:pr(f,o.at+10,20)}}>{o.why}</div></div>})}
   <div style={{borderTop:`1px solid ${BP.line}`}}/></div></div>};

/* checklist spec: rows k + v, then a verdict line */
export const BpSpec:React.FC<{n:string;cap:string;title:string;head:string;rows:{k:string;v:string;at:number}[];verdict?:{s:string;at:number}}>=({n,cap,title,head,rows,verdict})=>{const {f,A}=useA();const fp=pr(f,0,26);
 return <div><Fig n={n} cap={cap} title={title}/>
  <Frame p={fp}><div style={{padding:'20px 30px',borderBottom:`1px solid ${BP.line}`,...lbl(20,A)}}>{head}</div>
   {rows.map((r,k)=>{const p=pr(f,r.at,22);return <div key={k} style={{padding:'32px 30px 36px',borderBottom:k<rows.length-1?`1px solid ${BP.line}`:'none',opacity:.25+.75*p}}>
    <div style={{display:'flex',alignItems:'baseline',gap:20}}><span style={{fontFamily:SANS,fontSize:50,color:A,width:80}}>{String(k+1).padStart(2,'0')}</span><span style={{fontFamily:SANS,fontSize:48,color:BP.ink}}>{r.k}</span></div>
    <div style={{fontFamily:SANS,fontSize:34,color:BP.dim,lineHeight:1.35,marginTop:12,marginLeft:100}}>{r.v}</div></div>})}</Frame>
  {verdict&&<div style={{marginTop:44,borderLeft:`4px solid ${A}`,paddingLeft:26,fontFamily:SANS,fontSize:42,color:BP.ink,lineHeight:1.3,opacity:pr(f,verdict.at,22)}}>{verdict.s}</div>}
 </div>};

/* layer diagram: one-way dependency, calls flow down */
export const BpLayers:React.FC<{n:string;cap:string;title:string;layers:{k:string;role:string;path:string;at:number}[];depAt:number;noKnow:{s:string;at:number};pre?:{label:string;items:{s:string;at:number}[];strikeAt:number};titleAt?:number}>=({n,cap,title,layers,depAt,noKnow,pre,titleAt=0})=>{const {f,A,ON}=useA();
 const W=894,BW=620,BH=170,G=120,X=0;const ys=layers.map((_,k)=>20+k*(BH+G));
 return <div><Fig n={n} cap={cap} title={title} at={titleAt}/>
  <svg width={W} height={ys[ys.length-1]+BH+40} style={{overflow:'visible'}}>
   {layers.map((l,k)=>{const p=pr(f,l.at,26),y=ys[k],last=k===layers.length-1;return <g key={k}>
    <path d={`M${X} ${y} H${X+BW} V${y+BH} H${X} Z`} fill="none" stroke={last?A:BP.hair} strokeWidth={last?2.5:1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1-p}/>
    {last&&<rect x={X} y={y} width={BW} height={BH} fill={A} opacity={pr(f,l.at+14,20)}/>}
    <g opacity={pr(f,l.at+10,20)}>
     <text x={X+34} y={y+68} style={{fontFamily:'BVPX',fontSize:52,fill:last?ON:BP.ink}}>{l.k}</text>
     <text x={X+34} y={y+116} style={{fontFamily:SANS,fontSize:32,fill:last?ON:BP.dim}}>{l.role}</text>
     <text x={X+34} y={y+152} style={{fontFamily:MONO,fontSize:22,fill:last?ON:A,opacity:last?.75:1}}>{l.path}</text></g>
    {!last&&(()=>{const q=pr(f,depAt+k*14,22),ax=X+BW/2,y1=y+BH+8,y2=y+BH+G-8;return <g>
     <path d={`M${ax} ${y1} V${y2}`} stroke={A} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1-q}/>
     <path d={`M${ax-12} ${y2-14} L${ax} ${y2} L${ax+12} ${y2-14}`} fill="none" stroke={A} strokeWidth={2.5} opacity={q}/>
     <text x={ax+26} y={(y1+y2)/2+9} opacity={q} style={{fontFamily:MONO,fontSize:22,letterSpacing:3,fill:BP.dim}}>BIẾT</text>
     {f>=depAt+30&&[0,1].map(j=>{const ph=((f-depAt-30)/45+j*.5+k*.25)%1;return <circle key={j} cx={ax} cy={y1+(y2-y1)*ph} r={6} fill={A} style={{filter:`drop-shadow(0 0 6px ${A})`}} opacity={Math.sin(Math.PI*ph)}/>})}</g>})()}
   </g>})}
   {(()=>{const q=pr(f,noKnow.at,24),x=X+BW+70,y1=ys[ys.length-1]+20,y2=ys[0]+BH-20;return <g opacity={q}>
    <path d={`M${x} ${y1} V${y2}`} stroke={BP.dim} strokeWidth={1.5} strokeDasharray="6 8"/><path d={`M${x-10} ${y2+14} L${x} ${y2} L${x+10} ${y2+14}`} fill="none" stroke={BP.dim} strokeWidth={1.5}/>
    <g transform={`translate(${x},${(y1+y2)/2})`}><circle r={30} fill={BP.bg} stroke={A} strokeWidth={2}/><path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke={A} strokeWidth={3}/></g>
    <text x={x+48} y={(y1+y2)/2-10} style={{fontFamily:SANS,fontSize:30,fill:BP.ink}}>{noKnow.s.split('|')[0]}</text>
    <text x={x+48} y={(y1+y2)/2+30} style={{fontFamily:SANS,fontSize:30,fill:BP.ink}}>{noKnow.s.split('|')[1]||''}</text></g>})()}
  </svg>
  {pre&&<div style={{marginTop:40,paddingTop:26,borderTop:`1px solid ${BP.line}`,opacity:pr(f,pre.items[0].at,16)}}>
   <div style={lbl(20)}>{pre.label}</div>
   <div style={{display:'flex',gap:40,marginTop:16,flexWrap:'wrap'}}>{pre.items.map((it,k)=>{const sp=pr(f,pre.strikeAt,18);return <span key={k} style={{fontFamily:SANS,fontSize:38,color:sp>0.5?BP.dim:BP.ink,position:'relative',opacity:pr(f,it.at,16)}}>{it.s}<Strike p={sp} c={A}/></span>})}</div></div>}
 </div>};

/* terminal: command typed, empty result, check */
export const BpTerm:React.FC<{n:string;cap:string;title:string;cmd:string;cmdAt:number;resAt:number;empty:string;ok:string;note?:{s:string;at:number}}>=({n,cap,title,cmd,cmdAt,resAt,empty,ok,note})=>{const {f,A,ON}=useA();const fp=pr(f,0,26);
 const ty=interpolate(f,[cmdAt,cmdAt+Math.max(20,cmd.length*1.1)],[0,cmd.length],cl);const shown=cmd.slice(0,Math.floor(ty));const done=ty>=cmd.length;const rp=pr(f,resAt,18),cp=pr(f,resAt+16,22);
 return <div><Fig n={n} cap={cap} title={title}/>
  <div style={{...lbl(20),display:'flex',justifyContent:'space-between',marginBottom:14,opacity:fp}}><span>terminal · mini_game/</span><span style={{color:A}}>ZSH</span></div>
  <Frame p={fp}><div style={{padding:'36px 34px 44px',fontFamily:MONO,fontSize:29,lineHeight:1.5}}>
   <div style={{whiteSpace:'pre-wrap',color:BP.ink}}><span style={{color:A}}>$ </span>{shown}{!done&&Math.floor(f/8)%2===0&&<span style={{background:A,color:A}}>_</span>}</div>
   <div style={{color:BP.dim,marginTop:26,opacity:rp,fontSize:30}}>{empty}</div>
   <div style={{display:'flex',alignItems:'center',gap:26,marginTop:44,opacity:cp,transform:`translateY(${(1-cp)*10}px)`}}>
    <svg width={84} height={84}><rect x={2} y={2} width={80} height={80} fill={A}/><path d="M22 44 L37 59 L64 28" stroke={ON} strokeWidth={7} fill="none" strokeLinecap="square" pathLength={1} strokeDasharray={1} strokeDashoffset={1-pr(f,resAt+24,16)}/></svg>
    <span style={{fontFamily:SANS,fontSize:44,color:BP.ink,lineHeight:1.25}}>{ok}</span></div></div></Frame>
  {note&&<div style={{marginTop:44,fontFamily:SANS,fontSize:40,color:BP.dim,lineHeight:1.35,opacity:pr(f,note.at,22)}}>{note.s}</div>}
 </div>};

/* folder tree with layer tags */
export const BpTree:React.FC<{n:string;cap:string;title:string;root:string;lines:{s:string;d:number;tag?:string;at:number;hl?:boolean}[];note?:{s:string;at:number}}>=({n,cap,title,root,lines,note})=>{const {f,A,ON}=useA();const fp=pr(f,0,26);
 return <div><Fig n={n} cap={cap} title={title}/>
  <Frame p={fp}><div style={{padding:'34px 34px 40px'}}>
   <div style={{fontFamily:MONO,fontSize:34,color:BP.dim,marginBottom:10}}>{root}</div>
   {lines.map((l,k)=>{const p=pr(f,l.at,18);const tp=pr(f,l.at+10,18);return <div key={k} style={{display:'flex',alignItems:'center',height:76,opacity:.2+.8*p}}>
    <span style={{fontFamily:MONO,fontSize:34,color:BP.hair,whiteSpace:'pre'}}>{'   '.repeat(l.d)}{'└─ '}</span>
    <span style={{fontFamily:MONO,fontSize:36,color:l.hl&&p>0.5?A:BP.ink}}>{l.s}</span>
    <span style={{flex:1}}/>
    {l.tag&&<span style={{fontFamily:MONO,fontSize:20,letterSpacing:3,padding:'6px 14px',opacity:tp,border:`1.5px solid ${l.tag==='MODEL'?A:l.tag==='VIEWMODEL'?A:BP.dim}`,background:l.tag==='MODEL'?A:'transparent',color:l.tag==='MODEL'?ON:l.tag==='VIEWMODEL'?A:BP.dim,fontWeight:700}}>{l.tag}</span>}</div>})}
  </div></Frame>
  {note&&<div style={{marginTop:44,fontFamily:SANS,fontSize:40,color:BP.dim,lineHeight:1.35,opacity:pr(f,note.at,22)}}>{note.s}</div>}
 </div>};

/* takeaway: wall between UI changes and business changes, then course line */
export const BpTake:React.FC<{n:string;cap:string;title:string;cols:{k:string;items:string[];at:number}[];wallAt:number;rule:{s:string;at:number};course:{t1:string;t2:string;at:number}}>=({n,cap,title,cols,wallAt,rule,course})=>{const {f,A}=useA();const wp=pr(f,wallAt,30);
 return <div><Fig n={n} cap={cap} title={title}/>
  <div style={{position:'relative',display:'flex',gap:0,marginTop:10}}>
   {cols.map((c,k)=>{const p=pr(f,c.at,22);return <div key={k} style={{flex:1,padding:k?'0 0 0 46px':'0 46px 0 0',opacity:p}}>
    <div style={{...lbl(22,k?A:BP.dim)}}>{c.k}</div>
    {c.items.map((s,j)=><div key={j} style={{fontFamily:SANS,fontSize:40,color:BP.ink,marginTop:26,lineHeight:1.25}}>{s}</div>)}</div>})}
   <div style={{position:'absolute',left:'50%',top:-10,width:3,height:`${wp*100+6}%`,background:A}}/>
  </div>
  <div style={{marginTop:70,fontFamily:SANS,fontSize:48,color:BP.ink,lineHeight:1.3,borderLeft:`4px solid ${A}`,paddingLeft:28,opacity:pr(f,rule.at,22)}}>{rule.s}</div>
  <div style={{marginTop:80,paddingTop:30,borderTop:`1px solid ${BP.hair}`,opacity:pr(f,course.at,22)}}>
   <div style={lbl(20,A)}>{course.t1}</div><div style={{fontFamily:SANS,fontSize:44,color:BP.ink,marginTop:12}}>{course.t2}</div></div>
 </div>};
