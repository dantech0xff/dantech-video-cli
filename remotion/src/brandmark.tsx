// BrandMark: automatic third-party product logos (every theme). Nothing is declared in scripts: build_props.py detects brand
// names in the narration + on-screen text (scripts/brands.py), fetches/caches the logo (scripts/brand_logo.py, assets/brand/<slug>/)
// and passes props.brands. Scenes call <BrandRow text=…/> next to a label; it renders the logos of the brands named in that
// label (same matching rules as brands.py). Logos are never redrawn or recoloured beyond: monochrome marks (black/white
// originals) take pure black or white for contrast with the surface; coloured marks keep their colours on a subtle white plate.
// Overlay glyphs (overlay.tsx GLYPH) stay our own drawings; brand logos only come through here.
import React,{createContext,useContext} from 'react';import {Img,staticFile} from 'remotion';
export type BrandInfo={slug:string;name:string;src:string;mono:boolean;color?:string|null;kind:string;aliases:string[];case?:boolean;hook?:boolean;scenes?:number[]};
export const BrandsCtx=createContext<BrandInfo[]>([]);
export const useBrands=()=>useContext(BrandsCtx);
const nc=(c:string)=>{if(c==='đ'||c==='Đ')return 'd';const b=c.normalize('NFD').replace(/[\u0300-\u036f]/g,'');return (b||c)[0].toLowerCase()};
const ntext=(s:string)=>Array.from(s).map(nc).join('');
const marks=(s:string)=>Array.from(s).some(c=>c.charCodeAt(0)>127&&(c.normalize('NFD')!==c||c==='đ'||c==='Đ'));
const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const RX=new Map<string,RegExp>();
const rx=(a:string)=>{let r=RX.get(a);if(!r){r=new RegExp('(?<![a-z0-9])'+ntext(a).trim().split(/\s+/).map(esc).join('[\\s\\-_]*')+'(?![a-z0-9])','g');RX.set(a,r)}r.lastIndex=0;return r};
/** brands named in a label, in reading order (max n). Mirrors scripts/brands.py reg_hits: word boundary, case/diacritic-insensitive,
 *  case:true only when capitalised, single letters only as the exact capital letter, no ASCII alias inside a word with tone marks. */
export const brandsIn=(text:string|undefined,list:BrandInfo[],n=3):BrandInfo[]=>{if(!text||!list.length)return [];const chars=Array.from(text);const nt=chars.map(nc).join('');
 const hits:{b:BrandInfo;at:number}[]=[];const taken:[number,number][]=[];
 const al=list.flatMap(b=>[b.name,...b.aliases].map(a=>({a,b}))).sort((x,y)=>y.a.length-x.a.length);
 for(const {a,b} of al){const r=rx(a);let m:RegExpExecArray|null;while((m=r.exec(nt))){const s0=m.index,s1=s0+m[0].length;const orig=chars.slice(s0,s1).join('');
  if(taken.some(([x,y])=>!(s1<=x||s0>=y)))continue;if(marks(orig)&&!/[^\x00-\x7f]/.test(a))continue;
  if(b.case&&!/^[A-Z]/.test(orig))continue;if(ntext(a).trim().length===1&&orig!==a.toUpperCase())continue;
  taken.push([s0,s1]);if(!hits.some(h=>h.b.slug===b.slug))hits.push({b,at:s0})}}
 return hits.sort((x,y)=>x.at-y.at).slice(0,n).map(h=>h.b)};
const lum=(c:string)=>{const m=/^#([0-9a-f]{6})/i.exec(c||'');if(!m)return 0;const v=parseInt(m[1],16);return (.2126*(v>>16)+.7152*((v>>8)&255)+.0722*(v&255))/255};
/** one logo, `size` square (px number, or a CSS length such as "1.05em" to follow the label's font); `on` = surface colour behind it
 *  (picks black/white for monochrome marks) */
export const BrandMark:React.FC<{b:BrandInfo;size:number|string;on?:string;style?:React.CSSProperties}>=({b,size,on='#16171A',style})=>{
 const u=(x:number)=>typeof size==='number'?size*x:`calc(${size} * ${x})`;
 const box:React.CSSProperties={width:size,height:size,flex:'none',display:'flex',alignItems:'center',justifyContent:'center',boxSizing:'border-box',...style};
 if(b.mono){const white=lum(on)<.5;return <span data-bb="brand" title={b.name} style={box}><Img src={staticFile(b.src)} style={{width:'100%',height:'100%',objectFit:'contain',filter:white?'brightness(0) invert(1)':'brightness(0)'}}/></span>}
 if(b.kind==='tile')return <span data-bb="brand" title={b.name} style={box}><Img src={staticFile(b.src)} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:u(.22)}}/></span>;
 // coloured mark: subtle white plate (works on dark and light surfaces), logo keeps its own colours
 return <span data-bb="brand" title={b.name} style={{...box,background:'#FFFFFF',borderRadius:u(.24),padding:u(.12),boxShadow:lum(on)>.5?'inset 0 0 0 1.5px rgba(0,0,0,.10)':'none'}}><Img src={staticFile(b.src)} style={{width:'100%',height:'100%',objectFit:'contain'}}/></span>};
/** logos of the brands named in `text` (nothing when none): put it right before the label */
export const BrandRow:React.FC<{text?:string;size:number;on?:string;gap?:number;max?:number;style?:React.CSSProperties}>=({text,size,on,gap,max=3,style})=>{const list=useBrands();const bs=brandsIn(text,list,max);
 if(!bs.length)return null;return <span style={{display:'inline-flex',alignItems:'center',gap:gap??Math.round(size*.22),flex:'none',verticalAlign:'middle',...style}}>{bs.map(b=><BrandMark key={b.slug} b={b} size={size} on={on}/>)}</span>};
/** width the logo row takes for `text` (to shrink auto-fitted labels next to it) */
export const brandRowW=(text:string|undefined,list:BrandInfo[],size:number,gap?:number)=>{const n=brandsIn(text,list).length;return n?n*size+(n-1)*(gap??Math.round(size*.22))+Math.round(size*.3):0};
/** brand hits with their position in `text` (for inline placement) */
const hitsIn=(text:string,list:BrandInfo[])=>{const chars=Array.from(text);const nt=chars.map(nc).join('');const out:{b:BrandInfo;s0:number;s1:number}[]=[];
 const al=list.flatMap(b=>[b.name,...b.aliases].map(a=>({a,b}))).sort((x,y)=>y.a.length-x.a.length);
 for(const {a,b} of al){const r=rx(a);let m:RegExpExecArray|null;while((m=r.exec(nt))){const s0=m.index,s1=s0+m[0].length;const orig=chars.slice(s0,s1).join('');
  if(out.some(h=>!(s1<=h.s0||s0>=h.s1)))continue;if(marks(orig)&&!/[^\x00-\x7f]/.test(a))continue;
  if(b.case&&!/^[A-Z]/.test(orig))continue;if(ntext(a).trim().length===1&&orig!==a.toUpperCase())continue;out.push({b,s0,s1})}}
 return out.sort((x,y)=>x.s0-y.s0)};
/** label text with each brand's logo placed right before the brand name ("Đội ◉ Grok Bot"); max 3 logos per label */
export const BrandText:React.FC<{s:string;size?:number|string;on?:string}>=({s,size='1.05em',on})=>{const list=useBrands();if(!list.length)return <>{s}</>;
 const chars=Array.from(s);const hs=hitsIn(s,list).slice(0,3);if(!hs.length)return <>{s}</>;const parts:React.ReactNode[]=[];let i=0;
 hs.forEach((h,k)=>{if(h.s0>i)parts.push(chars.slice(i,h.s0).join(''));
  parts.push(<BrandMark key={'b'+k} b={h.b} size={size} on={on} style={{display:'inline-flex',verticalAlign:'middle',marginRight:typeof size==='number'?Math.round(size*.24):'.26em',position:'relative',top:typeof size==='number'?-Math.round(size*.06):'-.06em'}}/>);
  parts.push(chars.slice(h.s0,h.s1).join(''));i=h.s1});
 if(i<chars.length)parts.push(chars.slice(i).join(''));return <>{parts}</>};
/** extra width (px) BrandText adds to `s` at `size` (for auto-fitted single-line labels) */
export const brandW=(s:string|undefined,list:BrandInfo[],size:number)=>s&&list.length?Math.min(3,hitsIn(s,list).length)*Math.round(size*1.3):0;
/** how many characters of width the logos take, for fitSize/zf-style "chars × k × size" budgets */
export const brandChars=(s:string|undefined,list:BrandInfo[],k:number)=>s&&list.length?Math.min(3,hitsIn(s,list).length)*1.33/k:0;
