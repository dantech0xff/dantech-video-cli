// tech-explain-cyber (GIẢI THÍCH CYBER, experimental): "dark blueprint" scenes.
// One cold cyan accent, hairlines, self-drawing strokes, dimension lines, callouts, slow precise easing.
import React from 'react';import {interpolate,Easing,useCurrentFrame,AbsoluteFill} from 'remotion';import {useS,FONTS} from './sys';
const ES=Easing.bezier(.25,.1,.25,1),EO=Easing.bezier(.22,.61,.36,1);const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const MONO='JBM',SANS='BVPM';
const pr=(f:number,at:number,d=24)=>interpolate(f,[at,at+d],[0,1],{...cl,easing:ES});
export const BP={bg:'#1C1C1C',grid:'rgba(255,255,255,0.028)',grid2:'rgba(255,255,255,0.055)',line:'#303030',hair:'#3E3E3E',dim:'#8C8C8C',ink:'#E6E6E6',cy:'#5CD6E8',cyDim:'rgba(92,214,232,0.14)',panel:'#222222',warm:'#C9A27A'};
const lbl=(size=22,c=BP.dim):React.CSSProperties=>({fontFamily:MONO,fontSize:size,letterSpacing:3,textTransform:'uppercase',color:c,fontWeight:500});
/* fig label + refined sans heading */
const Fig:React.FC<{n:string;cap:string;title:string;at?:number}>=({n,cap,title,at=0})=>{const {f}=useS();const p=pr(f,at,20);
 return <div style={{marginBottom:40,opacity:p,transform:`translateY(${(1-p)*16}px)`}}>
  <div style={{...lbl(22,BP.cy),display:'flex',gap:16,alignItems:'center'}}><span>FIG. {n}</span><span style={{width:60,height:1,background:BP.cy,opacity:.6}}/><span style={{color:BP.dim}}>{cap}</span></div>
  <div style={{fontFamily:SANS,fontSize:68,lineHeight:1.12,color:BP.ink,marginTop:16,letterSpacing:-1}}>{title}</div></div>};
/* frame with corner ticks */
const Frame:React.FC<{children:React.ReactNode;style?:React.CSSProperties;p?:number;tag?:string}>=({children,style,p=1,tag})=>{const T=18;const c=(s:React.CSSProperties)=><div style={{position:'absolute',width:T,height:T,borderColor:BP.cy,borderStyle:'solid',borderWidth:0,...s}}/>;
 return <div style={{position:'relative',border:`1.5px solid ${BP.hair}`,background:'rgba(36,36,36,0.72)',clipPath:`inset(0 ${(1-p)*100}% 0 0)`,...style}}>
  {c({left:-2,top:-2,borderLeftWidth:2,borderTopWidth:2})}{c({right:-2,top:-2,borderRightWidth:2,borderTopWidth:2})}{c({left:-2,bottom:-2,borderLeftWidth:2,borderBottomWidth:2})}{c({right:-2,bottom:-2,borderRightWidth:2,borderBottomWidth:2})}
  {tag&&<div style={{position:'absolute',top:-13,left:24,background:BP.bg,padding:'0 10px',...lbl(20)}}>{tag}</div>}{children}</div>};
/* kotlin highlight, restrained: keywords cyan, everything else ink/dim */
const KW=/^(val|var|fun|class|private|by|object|return|this@\w+)$/;
const kt=(line:string)=>line.trimStart().startsWith('//')?[<span key={0} style={{color:BP.dim,fontStyle:'italic'}}>{line}</span>]:line.split(/(\s+|[(){}<>,:=.]|"[^"]*")/).filter(x=>x!=='').map((w,k)=><span key={k} style={{color:KW.test(w)?BP.cy:/^[(){}<>,:=.]$/.test(w)?BP.dim:/^[A-Z]/.test(w)?'#FFFFFF':BP.ink}}>{w}</span>);

/* 1. code with line numbers, a dimension bracket over a line range, and a callout */
export const BpCode:React.FC<{n:string;cap:string;title:string;file:string;lines:{s:string;at:number}[];dim?:{from:number;to:number;label:string;sub?:string;at:number};callout?:{line:number;text:string;at:number};note?:{s:string;at:number}}>=({n,cap,title,file,lines,dim,callout,note})=>{const {f}=useS();
 const LH=60,TOP=74,FS=36;const fp=pr(f,0,26);
 return <div><Fig n={n} cap={cap} title={title}/>
  <div style={{...lbl(20),display:'flex',justifyContent:'space-between',marginBottom:14,opacity:fp}}><span>{file}</span><span style={{color:BP.cy}}>KOTLIN</span></div><Frame p={fp}><div style={{padding:`${TOP-44}px 0 30px`,position:'relative'}}>
   {lines.map((l,k)=>{const p=pr(f,l.at,14);const shown=l.s.slice(0,Math.floor(l.s.length*p));
    return <div key={k} style={{display:'flex',height:LH,alignItems:'center',fontFamily:MONO,fontSize:FS,whiteSpace:'pre'}}>
     <span style={{width:70,textAlign:'right',paddingRight:22,color:p>0?BP.dim:'#4A4A4A',fontSize:24}}>{String(k+1).padStart(2,'0')}</span>
     <span style={{borderLeft:`1px solid ${BP.line}`,paddingLeft:22,height:'100%',display:'flex',alignItems:'center'}}>{kt(shown)}</span></div>})}
   {dim&&(()=>{const p=pr(f,dim.at,26);const y1=TOP-44+dim.from*LH+10,y2=TOP-44+(dim.to+1)*LH-10,x=640;
    return <svg style={{position:'absolute',left:0,top:0,overflow:'visible'}} width={894} height={y2+40}>
     <path d={`M${x-18} ${y1} H${x} V${y2} H${x-18}`} fill="none" stroke={BP.cy} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1-p}/>
     <path d={`M${x} ${(y1+y2)/2} H${x+34}`} stroke={BP.cy} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1-pr(f,dim.at+18,12)}/>
     <g opacity={pr(f,dim.at+24,14)}><text x={x+46} y={(y1+y2)/2-4} style={{fontFamily:SANS,fontSize:58,fill:BP.cy}}>{dim.label}</text>
     {dim.sub&&<text x={x+48} y={(y1+y2)/2+34} style={{fontFamily:MONO,fontSize:20,letterSpacing:3,fill:BP.dim}}>{dim.sub}</text>}</g></svg>})()}
  </div></Frame>
  {callout&&(()=>{const p=pr(f,callout.at,20);return <div style={{display:'flex',alignItems:'flex-start',gap:18,marginTop:48,opacity:p}}>
   <svg width={60} height={40} style={{flex:'none'}}><circle cx={6} cy={6} r={5} fill={BP.cy}/><path d="M6 6 L30 30 H60" stroke={BP.cy} strokeWidth={1.5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1-p}/></svg>
   <div><div style={lbl(20,BP.cy)}>DÒNG {String(callout.line).padStart(2,'0')}</div><div style={{fontFamily:SANS,fontSize:42,color:BP.ink,lineHeight:1.3,marginTop:6,maxWidth:820}}>{callout.text}</div></div></div>})()}
  {note&&f>=note.at&&<div style={{marginTop:36,paddingTop:22,borderTop:`1px solid ${BP.line}`,fontFamily:SANS,fontSize:40,color:BP.dim,lineHeight:1.3,opacity:pr(f,note.at,20)}}>{note.s}</div>}
 </div>};

/* 2. blueprint dependency graph: framework container builds deps, data flows into the consumer */
type Pt=[number,number];
const along=(pts:Pt[],p:number):Pt=>{const seg=pts.slice(1).map((q,i)=>Math.hypot(q[0]-pts[i][0],q[1]-pts[i][1]));const L=seg.reduce((a,b)=>a+b,0);let d=p*L;
 for(let i=0;i<seg.length;i++){if(d<=seg[i]||i===seg.length-1){const r=seg[i]?Math.min(1,d/seg[i]):0;return [pts[i][0]+(pts[i+1][0]-pts[i][0])*r,pts[i][1]+(pts[i+1][1]-pts[i][1])*r]}d-=seg[i]}return pts[pts.length-1]};
const poly=(pts:Pt[])=>'M'+pts.map(p=>p.join(' ')).join(' L');
export const BpGraph:React.FC<{n:string;cap:string;title:string;deps:string[];root:string;consumer:string;call:string;fw:string;at?:number;flowAt:number;dimLabel?:string;callouts?:{text:string;at:number}[]}>=({n,cap,title,deps,root,consumer,call,fw,at=0,flowAt,dimLabel,callouts=[]})=>{const {f}=useS();
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
   {draw(`M10 40 H${W-10} V${gy[1]+bh+36} H10 Z`,at,30,BP.cy,1.5,'10 8')}
   <g opacity={pr(f,at+6,18)}><rect x={30} y={26} width={fw.length*15+40} height={30} fill={BP.bg}/><text x={46} y={50} style={{fontFamily:MONO,fontSize:22,letterSpacing:3,fill:BP.cy}}>{fw}</text></g>
   {boxes.map((b,k)=><g key={k}>{rect(b.x,b.y,bw,bh,at+8+k*5)}{txt(b.x+bw/2,b.y+bh/2+11,b.d,at+20+k*5)}</g>)}
   {paths.map((p,k)=><g key={'p'+k}>{draw(poly(p),at+30+k*4,30)}</g>)}
   {rect(RX,RY,RW,RH,at+40,BP.cy,2.5)}{txt(W/2,RY+RH/2+13,root,at+50,{fontSize:38,fill:'#FFFFFF'})}
   <g opacity={pr(f,at+50,18)}><path d={`M${RX-14} ${RY} V${RY+RH} M${RX-20} ${RY} H${RX-8} M${RX-20} ${RY+RH} H${RX-8}`} stroke={BP.dim} strokeWidth={1}/><text x={RX-34} y={RY+RH/2-6} textAnchor="end" style={{fontFamily:MONO,fontSize:20,letterSpacing:3,fill:BP.dim}}>OBJECT</text><text x={RX-34} y={RY+RH/2+26} textAnchor="end" style={{fontFamily:MONO,fontSize:22,letterSpacing:3,fill:BP.cy}}>8 THAM SỐ</text></g>
   {draw(poly(out),at+56,22,BP.cy,2)}
   <g opacity={pr(f,at+64,16)}><rect x={W/2+18} y={(RY+RH+CY)/2-22} width={call.length*19+24} height={40} fill={BP.bg} stroke={BP.cy} strokeWidth={1}/><text x={W/2+30} y={(RY+RH+CY)/2+7} style={{fontFamily:MONO,fontSize:28,fill:BP.cy}}>{call}</text></g>
   {rect(CX,CY,CW,CH,at+60)}{txt(W/2,CY+CH/2+11,consumer,at+70)}
   {/* dimension line across the container */}
   {dimLabel&&<g opacity={pr(f,at+44,20)}><path d={`M10 ${gy[1]+bh+70-10} V${gy[1]+bh+70+10} M10 ${gy[1]+bh+70} H${W-10} M${W-10} ${gy[1]+bh+70-10} V${gy[1]+bh+70+10}`} stroke={BP.dim} strokeWidth={1}/></g>}
   {/* data flow: packets travel from each dep into the root, then root into the consumer */}
   {f>=flowAt&&paths.map((p,k)=>[0,1].map(j=>{const ph=((f-flowAt)/54+k*.13+j*.5)%1;const [x,y]=along(p,ph);return <circle key={`${k}-${j}`} cx={x} cy={y} r={4.5} fill={BP.cy} opacity={Math.sin(Math.PI*ph)}/>}))}
   {f>=flowAt+20&&[0,1].map(j=>{const ph=((f-flowAt-20)/40+j*.5)%1;const [x,y]=along(out,ph);return <circle key={'o'+j} cx={x} cy={y} r={5.5} fill={BP.cy} opacity={Math.sin(Math.PI*ph)}/>})}
  </svg>
  <div style={{display:'flex',flexDirection:'column',gap:18,marginTop:24}}>{callouts.map((c,k)=><div key={k} style={{display:'flex',gap:16,alignItems:'baseline',opacity:pr(f,c.at,20)}}><span style={lbl(20,BP.cy)}>{String.fromCharCode(65+k)}</span><span style={{fontFamily:SANS,fontSize:38,color:BP.ink,lineHeight:1.3}}>{c.text}</span></div>)}</div>
 </div>};

/* 3. HUD spec card: from (struck, dim) -> to (cyan) */
export const SpecCard:React.FC<{n:string;cap:string;title:string;head:string;rows:{k:string;from:string;to:string;at:number}[];foot?:string}>=({n,cap,title,head,rows,foot})=>{const {f}=useS();const fp=pr(f,0,26);
 return <div><Fig n={n} cap={cap} title={title}/>
  <Frame p={fp}><div style={{display:'flex',justifyContent:'space-between',padding:'20px 30px',borderBottom:`1px solid ${BP.line}`,...lbl(20)}}><span style={{color:BP.cy}}>{head}</span><span>REV 02</span></div>
   {rows.map((r,k)=>{const p=pr(f,r.at,22),s=pr(f,r.at+12,18),q=pr(f,r.at+22,20);return <div key={k} style={{padding:'44px 30px 48px',borderBottom:k<rows.length-1?`1px solid ${BP.line}`:'none',opacity:p}}>
    <div style={{display:'flex',alignItems:'baseline',gap:20}}><span style={{fontFamily:SANS,fontSize:54,color:BP.cy,width:80}}>{String(k+1).padStart(2,'0')}</span><span style={{fontFamily:SANS,fontSize:50,color:BP.ink}}>{r.k}</span></div>
    <div style={{display:'flex',alignItems:'center',gap:22,marginTop:24,marginLeft:100}}>
     <span style={{fontFamily:MONO,fontSize:32,color:BP.dim,position:'relative'}}>{r.from}<span style={{position:'absolute',left:0,top:'52%',height:1.5,width:`${s*100}%`,background:BP.dim}}/></span>
     <svg width={70} height={16}><path d="M0 8 H62 M54 2 L62 8 L54 14" stroke={BP.cy} strokeWidth={1.5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1-q}/></svg>
     <span style={{fontFamily:MONO,fontSize:36,color:BP.cy,opacity:q,border:`1px solid ${BP.cy}`,padding:'4px 14px',background:BP.cyDim}}>{r.to}</span></div></div>})}</Frame>
  {foot&&<div style={{marginTop:34,...lbl(20)}}>{foot}</div>}
 </div>};

/* blueprint chrome: fine grid, ruler, title block */
export const BpChrome:React.FC<{section:string;page:string}>=({section,page})=>{const {t}=useS();return <>
 <AbsoluteFill style={{backgroundImage:`linear-gradient(${BP.grid} 1px,transparent 1px),linear-gradient(90deg,${BP.grid} 1px,transparent 1px),linear-gradient(${BP.grid2} 1px,transparent 1px),linear-gradient(90deg,${BP.grid2} 1px,transparent 1px)`,backgroundSize:'24px 24px,24px 24px,120px 120px,120px 120px',backgroundPosition:'136px 0,136px 0,136px 0,136px 0'}}/>
 <AbsoluteFill style={{background:'radial-gradient(120% 80% at 50% 35%, transparent 55%, rgba(10,10,10,.55) 100%)'}}/>
 <div style={{position:'absolute',left:40,right:40,top:40,bottom:40,border:`1px solid ${BP.line}`}}/>
 <div style={{position:'absolute',left:136,right:50,top:86,display:'flex',justifyContent:'space-between',alignItems:'flex-end',paddingBottom:22,borderBottom:`1px solid ${BP.hair}`}}>
  <div><div style={{fontFamily:'BVPX',fontSize:46,color:BP.ink,letterSpacing:1.5}}>DAN TECH</div><div style={{...lbl(19,BP.cy),marginTop:6}}>{t.label} · {t.subtitle}</div></div>
  <div style={{textAlign:'right',...lbl(19)}}><div>SHEET</div><div style={{fontFamily:SANS,fontSize:40,color:BP.ink,letterSpacing:0,marginTop:4}}>{page}</div></div></div>
 <div style={{position:'absolute',left:136,right:50,top:222,...lbl(19),display:'flex',gap:14}}><span style={{color:BP.cy}}>§</span>{section}</div>
 <div style={{position:'absolute',left:64,top:300,bottom:330,width:30}}>{Array.from({length:27},(_,k)=><div key={k} style={{position:'absolute',top:k*48,right:0,width:k%5===0?22:10,height:1,background:k%5===0?BP.dim:BP.hair}}>{k%5===0&&<span style={{position:'absolute',right:28,top:-9,fontFamily:MONO,fontSize:14,color:BP.dim}}>{k*48}</span>}</div>)}</div></>};

/* end card */
export const BpEndCard:React.FC<{dur?:number;handles?:{p:string;h:string}[];tagline?:string}>=({dur=75,handles=[{p:'YOUTUBE',h:'@dantech-0xff'},{p:'FACEBOOK',h:'@dantech0xff'}],tagline=''})=>{const f=useCurrentFrame();const p=(a:number,d=24)=>interpolate(f,[a,a+d],[0,1],{...cl,easing:EO});const out=interpolate(f,[dur-10,dur],[1,0],cl);
 return <AbsoluteFill style={{zIndex:40,background:BP.bg,opacity:Math.min(1,p(0,10))*out}}><style>{FONTS}</style>
  <AbsoluteFill style={{backgroundImage:`linear-gradient(${BP.grid} 1px,transparent 1px),linear-gradient(90deg,${BP.grid} 1px,transparent 1px)`,backgroundSize:'24px 24px'}}/>
  <div style={{position:'absolute',left:40,right:40,top:40,bottom:40,border:`1px solid ${BP.line}`}}/>
  <div style={{position:'absolute',left:136,right:110,top:640}}>
   <div style={{...lbl(22,BP.cy),opacity:p(4)}}>END OF SHEET</div>
   <svg width={834} height={8} style={{marginTop:22}}><path d="M0 4 H834" stroke={BP.cy} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1-p(6,30)}/></svg>
   <div style={{fontFamily:'BVPX',fontSize:150,color:BP.ink,lineHeight:1.12,marginTop:30,letterSpacing:-3,opacity:p(10),transform:`translateY(${(1-p(10))*20}px)`}}>Dan Tech</div>
   <div style={{fontFamily:SANS,fontSize:46,color:BP.dim,marginTop:18,opacity:p(16)}}>{tagline}</div>
   <div style={{marginTop:70,display:'flex',flexDirection:'column',gap:0}}>{handles.map((h,k)=><div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'24px 0',borderTop:`1px solid ${BP.hair}`,borderBottom:k===handles.length-1?`1px solid ${BP.hair}`:'none',opacity:p(22+k*5)}}>
    <span style={lbl(22)}>{h.p}</span><span style={{fontFamily:MONO,fontSize:50,color:k===0?BP.cy:BP.ink}}>{h.h}</span></div>)}</div>
  </div>
  <div style={{position:'absolute',left:136,right:110,bottom:110,display:'flex',justifyContent:'space-between',...lbl(18)}}><span>GIẢI THÍCH CYBER</span><span>DAN TECH · 2026</span></div>
 </AbsoluteFill>};
