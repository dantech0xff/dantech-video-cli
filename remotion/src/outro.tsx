import {BrandTile,HANDLES,Handle,useBrand,fitSize} from './brand';
import React from 'react';import {AbsoluteFill,Audio,Sequence,staticFile,useCurrentFrame,interpolate,Easing} from 'remotion';
import {Theme} from './themes';import {H,Bd,FONTS} from './sys';import {SZ} from './safezone';import {Heart,DL} from './duoly';
const EO=Easing.bezier(.16,1,.3,1),EIO=Easing.bezier(.7,0,.2,1);const cl={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const r=(t:Theme,v:number)=>t.id==='quick-tips'?v:0;
const Bell:React.FC<{c:string;s:number;rot?:number}>=({c,s,rot=0})=><svg width={s} height={s} viewBox="0 0 24 24" style={{transform:`rotate(${rot}deg)`,transformOrigin:'50% 10%'}}><path d="M12 2.5c-.8 0-1.4.6-1.4 1.4v.6C7.9 5.2 6 7.6 6 10.5v4.2L4.2 17v1.2h15.6V17L18 14.7v-4.2c0-2.9-1.9-5.3-4.6-6v-.6c0-.8-.6-1.4-1.4-1.4z" fill={c}/><path d="M9.6 19.3a2.4 2.4 0 0 0 4.8 0z" fill={c}/></svg>;
const Cursor:React.FC<{t:Theme}>=({t})=><svg width={86} height={104} viewBox="0 0 20 24"><path d="M2 1.5v18.2l4.7-4.4 3 6.9 3.2-1.4-3-6.8 6.5-.4z" fill={t.ink} stroke={t.bg} strokeWidth={1.4} strokeLinejoin="round"/></svg>;
/* Follow/Subscribe CTA. inAt = frame the button appears, pressAt = frame the cursor presses (channel ctaPressWord, e.g. "Dan" in "follow Dan Tech"), outAt = exit */
export const FollowCTA:React.FC<{t:Theme;inAt:number;pressAt:number;outAt:number;top?:number;label?:string;done?:string;sub?:string}>=({t,inAt,pressAt,outAt,top=1040,label,done,sub='BẬT CHUÔNG ĐỂ KHÔNG LỠ TIN'})=>{
 const f=useCurrentFrame();const B=useBrand();label=label??B.followLabel;done=done??B.followDone;if(f<inAt||f>=outAt+12)return null;const lf=f-inAt;
 const pin=interpolate(lf,[0,9],[0,1],{...cl,easing:EO});
 const pressed=f>=pressAt;const dn=interpolate(f,[pressAt-2,pressAt,pressAt+5],[0,1,0],cl);
 const sh=14*(1-dn);const ex=interpolate(f,[outAt,outAt+12],[0,1],{...cl,easing:EIO});
 const cx=interpolate(f,[inAt+4,pressAt-3],[1080,640],{...cl,easing:EO}),cy=interpolate(f,[inAt+4,pressAt-3],[1700,top+95],{...cl,easing:EO});
 const cOp=interpolate(f,[inAt+4,inAt+8,pressAt+14,pressAt+22],[0,1,1,0],cl);
 const wig=f>=pressAt+3?Math.sin((f-pressAt-3)*1.3)*22*Math.exp(-(f-pressAt-3)/9):0;
 const flip=interpolate(f,[pressAt,pressAt+4],[0,1],cl);
 const lc=t.id==='loot-crypto';const isCy=t.id==='tech-explain-cyber'||t.id==='hot-news-glitch'||t.id==='android-tutor'||t.id==='flutter-tutor'||lc;const at=t.id==='android-tutor'||t.id==='flutter-tutor';const FF=at?'GSF':'BVPX';const FW=at?800:400;const LQ='40px 8px 40px 40px'; // loot-crypto: logomark corner set (sharp top-right)
 if(t.id==='duoly')return <AbsoluteFill data-layer="g" style={{zIndex:30,pointerEvents:'none'}}>{/* duoly: soft white pill, heart instead of bell, fills hot pink when pressed; no sub line unless the channel sets one */}
  <div data-bb="cta" style={{position:'absolute',left:136,right:SZ.cta.right,top,transform:`translateY(${(1-pin)*30-ex*40}px) scale(${1-0.02*dn})`,opacity:pin*(1-ex)}}>
   <div style={{display:'flex',alignItems:'center',height:140,borderRadius:70,overflow:'hidden',position:'relative',background:'#FFFFFF',boxShadow:'0 24px 50px rgba(216,11,70,.18)'}}>
    <div style={{position:'absolute',inset:0,background:DL.grad,opacity:flip}}/>
    <div style={{position:'relative',width:108,height:108,marginLeft:16,borderRadius:54,background:pressed?'rgba(255,255,255,.22)':DL.grad,display:'flex',alignItems:'center',justifyContent:'center',transform:`rotate(${wig*.5}deg)`}}><Heart s={54} c="#FFFFFF"/></div>
    <div style={{position:'relative',flex:1,height:'100%',overflow:'hidden'}}>
     <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',paddingLeft:30,transform:`translateY(${-flip*100}%)`}}><span style={{fontFamily:'BVPX',fontSize:fitSize(label!,500,46,.6),color:DL.rasp,whiteSpace:'nowrap',letterSpacing:-.5}}>{label}</span></div>
     <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',paddingLeft:30,transform:`translateY(${(1-flip)*100}%)`}}><span style={{fontFamily:'BVPX',fontSize:fitSize(done!,500,48,.6),color:'#FFFFFF',whiteSpace:'nowrap'}}>{done}</span></div>
    </div></div>
   {sub&&<div style={{fontFamily:'BVPS',fontSize:24,color:DL.mute,marginTop:20,paddingLeft:24,opacity:interpolate(f,[pressAt+4,pressAt+10],[0,1],cl)}}>{sub}</div>}
  </div>
  <div style={{position:'absolute',left:cx,top:cy-20,opacity:cOp*(1-ex),transform:`scale(${0.8-0.12*dn})`,transformOrigin:'10% 5%'}}><Cursor t={t}/></div>
 </AbsoluteFill>;
 if(isCy)return <AbsoluteFill data-layer="g" style={{zIndex:30,pointerEvents:'none'}}>
  <div data-bb="cta" style={{position:'absolute',left:136,right:SZ.cta.right,top,transform:`translateY(${(1-pin)*30-ex*40}px) scale(${1-0.02*dn})`,opacity:pin*(1-ex)}}>
   <div style={{display:'flex',border:`1.5px solid ${pressed?t.accent:'#4A4A4A'}`,background:at?((t as any).pal?.card??'#17181B'):'#222222',height:150,overflow:'hidden',borderRadius:lc?LQ:at?75:0,...(lc?{background:'linear-gradient(162deg, rgba(40,40,46,.94), rgba(14,14,17,.96))',boxShadow:'0 30px 70px rgba(0,0,0,.55)'}:{})}}>
    <div style={{width:150,display:'flex',alignItems:'center',justifyContent:'center',borderRight:`1.5px solid ${pressed?t.accent:'#4A4A4A'}`,background:pressed?t.accent:'transparent'}}><Bell c={pressed?t.onAccent:t.accent} s={74} rot={wig}/></div>
    <div style={{flex:1,position:'relative',overflow:'hidden'}}>
     <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',paddingLeft:40,transform:`translateY(${-flip*100}%)`}}><span style={{fontFamily:FF,fontWeight:FW,fontSize:fitSize(label!,520,46,.7),color:t.ink,letterSpacing:1,whiteSpace:'nowrap'}}>{label}</span></div>
     <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',paddingLeft:40,background:t.accent,transform:`translateY(${(1-flip)*100}%)`}}><span style={{fontFamily:FF,fontWeight:FW,fontSize:fitSize(done!,520,46,.7),color:t.onAccent,whiteSpace:'nowrap'}}>{done}</span></div>
    </div></div>
   <div style={{fontFamily:lc?'BVPS':'JBM',fontSize:22,letterSpacing:lc?'.06em':4,color:lc?'#AAAAAC':'#8C8C8C',marginTop:22,display:'flex',alignItems:'center',gap:12,opacity:interpolate(f,[pressAt+4,pressAt+10],[0,1],cl)}}><span style={{width:12,height:12,background:t.accent,display:'inline-block'}}/>{sub}</div>
  </div>
  <div style={{position:'absolute',left:cx,top:cy-20,opacity:cOp*(1-ex),transform:`scale(${0.8-0.12*dn})`,transformOrigin:'10% 5%'}}><Cursor t={t}/></div>
 </AbsoluteFill>;
 return <AbsoluteFill style={{zIndex:30,pointerEvents:'none'}}>
  <div style={{position:'absolute',left:136,right:SZ.cta.right,top,transform:`translate(${sh/2*0+dn*8}px,${dn*8+(1-pin)*60-ex*80}px) scale(${1.15-0.15*pin}) rotate(${-1.5*pin}deg)`,opacity:pin*(1-ex),transformOrigin:'left center'}}>
   <div style={{display:'flex',border:`6px solid ${t.ink}`,boxShadow:`${sh}px ${sh}px 0 ${t.ink}`,borderRadius:r(t,26),overflow:'hidden',height:150}}>
    <div style={{width:150,background:pressed?t.accent:t.ink,display:'flex',alignItems:'center',justifyContent:'center',borderRight:`6px solid ${t.ink}`}}><Bell c={pressed?t.onAccent:t.bg} s={86} rot={wig}/></div>
    <div style={{flex:1,position:'relative',background:t.accent,overflow:'hidden'}}>
     <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',transform:`translateY(${-flip*100}%)`}}><span style={{...H(t,fitSize(label!,540,t.head==='Anton'?76:48,t.head==='Anton'?.47:.7),t.onAccent),whiteSpace:'nowrap',paddingTop:t.head==='Anton'?8:0}}>{label}</span></div>
     <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:t.ink,transform:`translateY(${(1-flip)*100}%)`}}><span style={{...H(t,fitSize(done!,540,t.head==='Anton'?88:58,t.head==='Anton'?.47:.7),t.bg),whiteSpace:'nowrap',paddingTop:t.head==='Anton'?10:0}}>{done}</span></div>
    </div></div>
   <div style={{...Bd(t,24,t.ink),letterSpacing:2,marginTop:14,display:'flex',alignItems:'center',gap:12,opacity:interpolate(f,[pressAt+4,pressAt+10],[0,1],cl)}}><span style={{width:18,height:18,background:t.accent,display:'inline-block'}}/>{sub}</div>
  </div>
  <div style={{position:'absolute',left:cx,top:cy,opacity:cOp*(1-ex),transform:`scale(${1-0.18*dn})`,transformOrigin:'10% 5%'}}><Cursor t={t}/></div>
 </AbsoluteFill>};
export const FollowCTASfx:React.FC<{pressAt:number;click?:string;bell?:string}>=({pressAt,click='cta_click',bell='cta_bell'})=><>
 <Sequence from={pressAt-1}><Audio src={staticFile(`sfx/${click}.wav`)} volume={0.9}/></Sequence>
 <Sequence from={pressAt+5}><Audio src={staticFile(`sfx/${bell}.wav`)} volume={0.45}/></Sequence></>;
/* Branded end card. Render inside <Sequence from={start} durationInFrames={dur}> */
export const EndCard:React.FC<{t:Theme;dur?:number;handles?:Handle[];tagline?:string;tm?:string;sting?:string;pal?:{panel?:string;fg?:string;tagBg?:string;tagFg?:string;mark?:string;rail?:string}}>=({t,dur=75,handles,tagline='Tin công nghệ mỗi ngày',tm,sting='outro_sting',pal})=>{const B=useBrand();handles=handles??B.handles;const P={panel:t.ink,fg:t.bg,tagBg:t.accent,tagFg:t.onAccent,mark:t.accent,rail:t.accent,...(pal||{})};
 const f=useCurrentFrame();const O=dur-14;
 const wipe=interpolate(f,[0,9],[100,0],{...cl,easing:EIO});
 const it=(at:number,k:number)=>{const p=interpolate(f,[at,at+8],[0,1],{...cl,easing:EO});const o=interpolate(f,[O+k*2,O+8+k*2],[0,1],{...cl,easing:EIO});return {opacity:p*(1-o),transform:`translateY(${(1-p)*40-o*90}px) scale(${1.12-0.12*p})`,transformOrigin:'left center'} as React.CSSProperties};
 const out=interpolate(f,[dur-6,dur],[0,100],{...cl,easing:EIO});
 return <AbsoluteFill style={{zIndex:40}}><style>{FONTS}</style>
  <AbsoluteFill style={{background:P.panel,clipPath:`inset(${wipe}% 0 0 0)`}}>
   <div style={{position:'absolute',left:0,top:0,bottom:0,width:96,background:P.rail,transform:`translateY(${-out}%)`}}/>
   <div style={{position:'absolute',left:SZ.end.x,right:SZ.end.right,top:560}}>
    <div style={{...it(5,0),fontFamily:'Anton',fontSize:fitSize(B.wordmark,724,168,.47,1),color:P.fg,lineHeight:.95,whiteSpace:'nowrap'}}>{B.wordmark}<span style={{color:P.mark}}>■</span></div>
    <div style={{height:8,background:P.fg,marginTop:18,width:`${interpolate(f,[9,20],[0,100],{...cl,easing:EO})*(1-interpolate(f,[O,O+8],[0,1],cl))}%`}}/>
    <div style={{...it(13,1),marginTop:34}}><span style={{...H(t,t.head==='Anton'?62:50,P.tagFg),background:P.tagBg,padding:t.head==='Anton'?'6px 22px 0':'4px 22px',borderRadius:r(t,16),display:'inline-block'}}>{tagline}</span></div>
    <div style={{marginTop:60,display:'flex',flexDirection:'column',gap:22}}>{handles.map((x,k)=><div key={x.p} style={{...it(20+k*5,2+k),display:'flex',alignItems:'center',gap:26}}>
     <BrandTile icon={x.icon} size={t.head==='Anton'?76:64} radius={Math.max(10,r(t,14))}/>
     <span style={{...H(t,t.head==='Anton'?74:56,P.fg),textTransform:'none'}}>{x.h}</span></div>)}</div>
    {tm&&<div data-bb="e-tm" style={{...it(30,5),marginTop:44,fontFamily:t.body,fontWeight:500,fontSize:24,lineHeight:1.35,color:P.fg,opacity:(it(30,5).opacity as number)*.72}}>{tm}</div>}
   </div>
   {/* footer dropped: it sat in the bottom UI zone */}
  </AbsoluteFill>
  <AbsoluteFill style={{background:t.bg,clipPath:`inset(${100-out}% 0 0 0)`}}/>
  <Sequence from={4}><Audio src={staticFile(`sfx/${sting}.wav`)} volume={0.55}/></Sequence>
 </AbsoluteFill>};
