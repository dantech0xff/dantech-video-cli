// Overlap audit (props.debugBB = true): measures every visible [data-bb] box each frame and paints the intersection of any
// two boxes in the same scene layer (or a scene box vs a global box: captions, Follow CTA) in pure magenta #FF00FF,
// with a label. scripts/bbcheck.sh renders the video with this on and counts magenta pixels per frame.
// Nested boxes (ancestor/descendant) are not overlaps. Layers mid-transition (transform/opacity/blur/brightness/clip-path on the layer, e.g. loot-crypto quarter sweep) are skipped.
import React,{useEffect,useRef,useState} from 'react';import {AbsoluteFill,useCurrentFrame,delayRender,continueRender} from 'remotion';
type Hit={x:number;y:number;w:number;h:number;l:string};
const vis=(el:Element)=>{let o=1;for(let e:Element|null=el;e;e=e.parentElement){const cs=getComputedStyle(e);o*=parseFloat(cs.opacity||'1');if(cs.visibility==='hidden'||cs.display==='none')return 0}return o};
export const BBCheck:React.FC=()=>{const f=useCurrentFrame();const [hits,setHits]=useState<Hit[]>([]);const me=useRef<HTMLDivElement>(null);
 // measure after the container is sized and laid out (2 animation frames), coordinates relative to the composition
 useEffect(()=>{const h=delayRender('bbcheck');let done=false;const fin=()=>{if(!done){done=true;continueRender(h)}};const t1=setTimeout(()=>{measure();setTimeout(fin,30)},60);return ()=>{clearTimeout(t1);fin()}},[f]);
 const measure=()=>{const root=me.current!.parentElement!;const O=me.current!.getBoundingClientRect();const S=O.width/1080;
  const layerOf=(el:Element)=>(el.closest('[data-layer]') as HTMLElement|null);
  const boxes=[...document.querySelectorAll('[data-bb]')].map(el=>{const L=layerOf(el);return {el,L,name:el.getAttribute('data-bb')!,r:el.getBoundingClientRect(),v:vis(el)}})
   .filter(b=>b.L&&b.v>.15&&b.r.width>2&&b.r.height>2).filter(b=>{const cs=getComputedStyle(b.L!);return b.L!.dataset.layer==='g'||b.L!.dataset.layer==='end'||(cs.transform==='none'&&parseFloat(cs.opacity)>=.99&&!cs.filter.includes('blur')&&!cs.filter.includes('brightness')&&cs.clipPath==='none')});
  const out:Hit[]=[];
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];const la=a.L!.dataset.layer,lb=b.L!.dataset.layer;
   if(!(la===lb||la==='g'||lb==='g'))continue;
   if(a.el.contains(b.el)||b.el.contains(a.el))continue;
   const x=Math.max(a.r.left,b.r.left),y=Math.max(a.r.top,b.r.top),x2=Math.min(a.r.right,b.r.right),y2=Math.min(a.r.bottom,b.r.bottom);
   if(x2-x>3&&y2-y>3)out.push({x:(x-O.left)/S,y:(y-O.top)/S,w:(x2-x)/S,h:(y2-y)/S,l:`${a.name}×${b.name}`})}
  setHits(out);
  if(out.length)console.log('BBX',f,JSON.stringify(out.map(h=>h.l))); 
 };
 return <AbsoluteFill style={{zIndex:999,pointerEvents:'none'}}><div ref={me} style={{position:'absolute',left:0,top:0,width:1080,height:1}}/>{hits.map((h,k)=><div key={k} style={{position:'absolute',left:h.x,top:h.y,width:Math.max(h.w,12),height:Math.max(h.h,12),background:'#FF00FF'}}>
  <span style={{position:'absolute',left:0,top:-34,background:'#FF00FF',color:'#000',fontFamily:'JBM',fontSize:24,whiteSpace:'nowrap',padding:'0 6px'}}>{h.l}</span></div>)}</AbsoluteFill>};
