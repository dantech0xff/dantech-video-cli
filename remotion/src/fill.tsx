// Vertical fill for list / diagram scenes (packs.tsx + the At* setup scenes).
// The scene gets the whole content box height (SZ.content: y 340..1359 = 1282 design px) minus the room the scene's own
// dock overlays (autofill / script overlays) and the Follow button need (Timeline -> Ctx.room). Inside <Fill>:
//   1. every size written with z()/zf() scales with --k (text, paddings, row heights): k grows from 1 up to KMAX while the
//      group still fits and no line starts to wrap, so text only ever grows (reel minimums hold) and is capped at +30 %;
//   2. every vertical gap written with zg() scales with --g: the leftover height spreads into the gaps (up to GMAX);
//   3. what is still left centres the group under the title.
// Rows that are not on screen yet are laid out hidden (visibility:hidden, no data-bb) so the layout is the scene's final
// one from frame 0: nothing jumps when rows arrive and k/g are identical on every frame (deterministic, per-frame measure).
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';import {delayRender,continueRender} from 'remotion';
import {useS} from './sys';import {SZ} from './safezone';
export const KMAX=1.3,GMAX=2.6;
// bottom slack (design px): rows enter with a 30-44 px downward offset, the last one must not dip into the captions (y 1366)
const BOT=46;
export const z=(x:number)=>`calc(var(--k,1)*${x}px)`;
export const zg=(x:number)=>`calc(var(--g,1)*${x}px)`;
// single-line text: fitSize(s,w,max,r) but the cap grows with --k only while the line still fits w
export const zf=(s:string,w:number,max:number,r:number,extra=0)=>{const cap=Math.floor(w/((s.length+extra)*r));return cap>=max*KMAX?z(max):cap<=max?`${cap}px`:`min(${z(max)},${cap}px)`};
// hidden placeholder style for a row that has not arrived yet (keeps its final slot)
export const hid=(on:boolean):React.CSSProperties=>on?{}:{visibility:'hidden'};
export const useRoom=()=>{const s=useS() as any;return (s&&s.room)||SZ.content.h};
// room a dock overlay needs (frame px card height estimate + gap), in design px
export const DOCK_H:Record<string,number>={term:170,num:160,icon:132,progress:126,diagram:196,brand:150};
export const roomFor=(ov:{kind:string;g?:string;label?:string}[]|undefined,cta:boolean)=>{
 let r=SZ.content.h;const d=(ov??[]).filter(o=>o.kind!=='focus').map(o=>(o.kind==='term'&&!o.g?112:DOCK_H[o.kind]??170)+26);
 if(d.length)r=Math.min(r,SZ.content.h-Math.max(...d)/SZ.content.scale);
 if(cta)r=Math.min(r,(SZ.cta.top-SZ.content.y)/SZ.content.scale-30);return Math.floor(r)};
let fontsReady=false;
const useFonts=()=>{const [h]=useState(()=>fontsReady?null:delayRender('fill fonts'));const [ok,setOk]=useState(fontsReady);
 useEffect(()=>{if(ok){if(h!=null)continueRender(h);return}let on=true;document.fonts.ready.then(()=>{fontsReady=true;if(on)setOk(true)});return ()=>{on=false}},[ok]);return ok};
/* <Fill head={<Title …/>}>{group}</Fill>: head stays at the top, the group fills / centres the rest */
export const Fill:React.FC<{head?:React.ReactNode;children:React.ReactNode;kmax?:number;gmax?:number;align?:'center'|'start'}>=({head,children,kmax=KMAX,gmax=GMAX,align='center'})=>{
 const room=useRoom();const ok=useFonts();const {f}=useS();const root=useRef<HTMLDivElement>(null),body=useRef<HTMLDivElement>(null),inner=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{const R=root.current,B=body.current,I=inner.current;if(!R||!B||!I)return;
  const H=(k:number,g:number)=>{R.style.setProperty('--k',String(k));R.style.setProperty('--g',String(g));return I.offsetHeight};
  const avail=B.clientHeight-BOT;let k=1,g=1;
  // k is acceptable when the group fits and grows no faster than k itself (a faster growth means a line started to wrap)
  const h11=H(1,1);const fits=(m:number)=>H(m,m)<=avail&&H(m,1)<=m*h11+4;
  if(h11<avail){if(fits(kmax))k=kmax;else{let lo=1,hi=kmax;for(let i=0;i<9;i++){const m=(lo+hi)/2;if(fits(m))lo=m;else hi=m}k=lo}
   g=k;const h0=H(k,k),h1=H(k,k+1);if(h1>h0&&h0<avail)g=Math.min(gmax,k+(avail-h0)/(h1-h0));}
  const hf=H(Math.floor(k*1000)/1000,Math.floor(g*1000)/1000);if((window as any).FILLDBG)console.log("FILL",f,room,avail,k.toFixed(3),g.toFixed(3),hf,ok);},[f,ok,room]);
 return <div ref={root} style={{height:room,display:'flex',flexDirection:'column'}}>
  {head}<div ref={body} style={{flex:1,minHeight:0,display:'flex',flexDirection:'column',paddingBottom:BOT}}><div ref={inner} style={align==='center'?{marginTop:'auto',marginBottom:'auto'}:{}}>{children}</div></div></div>};
