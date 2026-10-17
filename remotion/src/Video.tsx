import {BrandCtx,DEFAULT_BRAND,Brand} from './brand';
// One generic video component for every theme. Everything comes from props.json, which
// scripts/build_props.py produces from videos/<slug>/script.json + word timings.
import React from 'react';import {AbsoluteFill,Sequence} from 'remotion';import {Timeline,Scene} from './sys';import {THEMES} from './themes';
import {Headline,Flow,Quote,Checklist,Evidence,CTA} from './scenes';import {MeoHook,MeoSearch,MeoFix,MeoSlowFast,MeoSave} from './meo';
import {CmdHook,GitGraph,LogPanes,DocRule,CommitCTA,CodeBlock,DepGraph,Analogy,Inversions,KeyPoint} from './commit';
import {BpCode,BpGraph,SpecCard,BpEndCard,BpReq,BpOptions,BpSpec,BpLayers,BpTerm,BpTree,BpTake} from './cyber';
import {GlHeadline} from './glitch';import {AtHook,AtCode,AtPreview,AtLogcat,AtTake,AtSteps,AtTerm,AtPackages,AtDevice,AtSpec,AtEndCard} from './android';import {VersusHook} from './versus';import {FlHook,FlTree,FlCode,FlStat,FlTake,FlEndCard,HERO_BIG} from './flutter';
import {FollowCTA,FollowCTASfx,EndCard} from './outro';import {BBCheck} from './bbcheck';
// scene "type" in script.json -> component
const SCENES:Record<string,React.FC<any>>={FlHook,FlTree,FlCode,FlStat,FlTake,Headline,Flow,Quote,Checklist,Evidence,CTA,MeoHook,MeoSearch,MeoFix,MeoSlowFast,MeoSave,CmdHook,GitGraph,LogPanes,DocRule,CommitCTA,CodeBlock,DepGraph,Analogy,Inversions,KeyPoint,BpCode,BpGraph,SpecCard,BpReq,BpOptions,BpSpec,BpLayers,BpTerm,BpTree,BpTake,GlHeadline,VersusHook,AtHook,AtCode,AtPreview,AtLogcat,AtTake,AtSteps,AtTerm,AtPackages,AtDevice,AtSpec};
export type VideoProps={theme:string;look?:Record<string,any>;date:string;voice:string;durationInFrames:number;words:{t:string;s:number;e:number}[];
 scenes:{type:string;dur:number;section:string;out?:string;focus?:[number,number];morph?:any;props:any}[];
 sfx:{at:number;s:string;v?:number}[];
 cta:{inAt:number;pressAt:number;outAt:number;top:number;sub:string};
 channel?:Partial<Brand>;debugBB?:boolean;outro:{start:number;dur:number;tagline:string;pal?:any;handles:{p:string;h:string;icon?:string}[]}};
export const Video:React.FC<VideoProps>=(p)=>{const t={...THEMES[p.theme],...(p.look||{})} as typeof THEMES[string]; // look = theme variant / script override (build_props.py)
 const scenes:Scene[]=p.scenes.map(s=>{const El=SCENES[s.type];if(!El)throw new Error(`Unknown scene type ${s.type}`);
  return {dur:s.dur,section:s.section,out:s.out as any,focus:s.focus,morph:s.morph,hero:typeof s.props?.hero==='string'?{txt:s.props.hero,big:HERO_BIG.has(s.type)}:undefined,el:<El {...s.props}/>}});
 return <BrandCtx.Provider value={{...DEFAULT_BRAND,...(p.channel||{})}}><AbsoluteFill><Timeline t={t} scenes={scenes} words={p.words} voice={p.voice} sfx={p.sfx} date={p.date}/>
  <FollowCTA t={t} inAt={p.cta.inAt} pressAt={p.cta.pressAt} outAt={p.cta.outAt} top={p.cta.top} sub={p.cta.sub}/><FollowCTASfx pressAt={p.cta.pressAt}/>
  <Sequence from={p.outro.start} durationInFrames={p.outro.dur}>{t.id==='flutter-tutor'?<FlEndCard dur={p.outro.dur} tagline={p.outro.tagline} handles={p.outro.handles}/>:t.id==='android-tutor'?<AtEndCard dur={p.outro.dur} tagline={p.outro.tagline} handles={p.outro.handles}/>:t.id==='tech-explain-cyber'?<BpEndCard A={t.accent} dur={p.outro.dur} tagline={p.outro.tagline} handles={p.outro.handles}/>:<EndCard t={t} dur={p.outro.dur} tagline={p.outro.tagline} pal={p.outro.pal} handles={p.outro.handles}/>}</Sequence>{p.debugBB&&<BBCheck/>}</AbsoluteFill></BrandCtx.Provider>};
