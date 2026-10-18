import {BrandCtx,DEFAULT_BRAND,Brand} from './brand';
// One generic video component for every theme. Everything comes from props.json, which
// scripts/build_props.py produces from videos/<slug>/script.json + word timings.
import React from 'react';import {AbsoluteFill,Sequence} from 'remotion';import {Timeline,Scene} from './sys';import {THEMES} from './themes';
import {Headline,Flow,Checklist,CTA} from './scenes';import {MeoHook,MeoSearch,MeoFix,MeoSlowFast,MeoSave} from './meo';
import {CmdHook,GitGraph,LogPanes,DocRule,CommitCTA,CodeBlock,DepGraph,Analogy,Inversions,KeyPoint} from './commit';
import {BpCode,BpGraph,SpecCard,BpEndCard,BpReq,BpOptions,BpSpec,BpLayers,BpTerm,BpTree,BpTake} from './cyber';
import {GlHeadline} from './glitch';import {setPal,AtHook,AtCode,AtPreview,AtLogcat,AtTake,AtSteps,AtTerm,AtPackages,AtDevice,AtSpec,AtEndCard} from './android';import {VersusHook} from './versus';import {Meter,Scale,DataFlow,Layers,Loop,Debug,EventTimeline,BigStat,QuoteCard,BeforeAfter,Rating,TopN,QuoteLegacy,EvidenceLegacy} from './packs';import {FlHook,FlTree,FlCode,FlStat,FlTake,FlEndCard,HERO_BIG} from './flutter';
import {FollowCTA,FollowCTASfx,EndCard} from './outro';import {BrandsCtx,BrandInfo} from './brandmark';import {BBCheck} from './bbcheck';
// scene "type" in script.json -> component (scenario packs from packs.tsx + the At* setup scenes under neutral names run in every theme)
const SCENES:Record<string,React.FC<any>>={FlHook,FlTree,FlCode,FlStat,FlTake,Headline,Flow,Quote:QuoteLegacy,Checklist,Evidence:EvidenceLegacy,CTA,MeoHook,MeoSearch,MeoFix,MeoSlowFast,MeoSave,CmdHook,GitGraph,LogPanes,DocRule,CommitCTA,CodeBlock,DepGraph,Analogy,Inversions,KeyPoint,BpCode,BpGraph,SpecCard,BpReq,BpOptions,BpSpec,BpLayers,BpTerm,BpTree,BpTake,GlHeadline,VersusHook,AtHook,AtCode,AtPreview,AtLogcat,AtTake,AtSteps,AtTerm,AtPackages,AtDevice,AtSpec,
 Table:AtTake,Meter,Scale,Steps:AtSteps,Terminal:AtTerm,Packages:AtPackages,Specs:AtSpec,Devices:AtDevice,DataFlow,Layers,Loop,Debug,Timeline:EventTimeline,BigStat,QuoteCard,BeforeAfter,Rating,TopN};
export type VideoProps={theme:string;look?:Record<string,any>;date:string;voice:string;durationInFrames:number;words:{t:string;s:number;e:number}[];
 scenes:{type:string;dur:number;section:string;out?:string;focus?:[number,number];morph?:any;props:any;brands?:boolean}[];
 brands?:BrandInfo[];tm?:string;
 sfx:{at:number;s:string;v?:number}[];
 cta:{inAt:number;pressAt:number;outAt:number;top:number;sub:string};
 channel?:Partial<Brand>;debugBB?:boolean;qc?:boolean;outro:{start:number;dur:number;tagline:string;pal?:any;handles:{p:string;h:string;icon?:string}[]}};
export const Video:React.FC<VideoProps>=(p)=>{const t={...THEMES[p.theme],...(p.look||{})} as typeof THEMES[string]; // look = theme variant / script override (build_props.py)
 setPal(t); // live palette for the theme-agnostic scenes (android.tsx AT, packs.tsx)
 const scenes:Scene[]=p.scenes.map(s=>{const El=SCENES[s.type];if(!El)throw new Error(`Unknown scene type ${s.type}`);
  return {dur:s.dur,section:s.section,ov:(s as any).ov,out:s.out as any,focus:s.focus,morph:s.morph,hero:typeof s.props?.hero==='string'?{txt:s.props.hero,big:HERO_BIG.has(s.type)}:undefined,el:<BrandsCtx.Provider value={s.brands===false?[]:(p.brands??[])}><El {...s.props}/></BrandsCtx.Provider>}});
 return <BrandCtx.Provider value={{...DEFAULT_BRAND,...(p.channel||{})}}><BrandsCtx.Provider value={p.brands??[]}><AbsoluteFill><Timeline t={t} scenes={scenes} words={p.words} voice={p.voice} sfx={p.sfx} date={p.date} cta={p.cta}/>
  <FollowCTA t={t} inAt={p.cta.inAt} pressAt={p.cta.pressAt} outAt={p.cta.outAt} top={p.cta.top} sub={p.cta.sub}/><FollowCTASfx pressAt={p.cta.pressAt}/>
  <Sequence from={p.outro.start} durationInFrames={p.outro.dur}>{t.id==='flutter-tutor'?<FlEndCard dur={p.outro.dur} tagline={p.outro.tagline} handles={p.outro.handles} tm={p.tm}/>:t.id==='android-tutor'?<AtEndCard dur={p.outro.dur} tagline={p.outro.tagline} handles={p.outro.handles} tm={p.tm}/>:t.id==='tech-explain-cyber'?<BpEndCard A={t.accent} dur={p.outro.dur} tagline={p.outro.tagline} handles={p.outro.handles} tm={p.tm}/>:<EndCard t={t} dur={p.outro.dur} tagline={p.outro.tagline} pal={p.outro.pal} handles={p.outro.handles} tm={p.tm}/>}</Sequence>{p.debugBB&&<BBCheck/>}{p.qc&&<style>{'[data-deco]{visibility:hidden !important}'}</style>}</AbsoluteFill></BrandsCtx.Provider></BrandCtx.Provider>};
