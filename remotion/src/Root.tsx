import React from 'react';import {Composition} from 'remotion';import {Video,VideoProps} from './Video';
// One composition per theme; duration comes from the props file (see scripts/build_props.py).
const blank:VideoProps={theme:'tin-nong',date:'',voice:'',durationInFrames:30,words:[],scenes:[],sfx:[],cta:{inAt:9999,pressAt:9999,outAt:9999,top:1040,sub:''},outro:{start:9999,dur:75,tagline:'',handles:[]}};
export const Root=()=><>{['tin-nong','meo-nhanh','commit'].map(id=><Composition key={id} id={id} component={Video as any} width={1080} height={1920} fps={30}
 durationInFrames={30} defaultProps={{...blank,theme:id}} calculateMetadata={({props}:{props:any})=>({durationInFrames:props.durationInFrames})}/>)}</>;
