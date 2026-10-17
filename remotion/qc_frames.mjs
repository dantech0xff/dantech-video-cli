// Low-res QC frames for the static-screen gate (scripts/static_gate.py): props.qc=true hides [data-deco]
// (karaoke captions, mid-ground shapes, blinking cursor) so only real content changes are measured.
//   node qc_frames.mjs <compId> <props.json> <outDir> [everyNth=3] [scale=0.25]
import {bundle} from '@remotion/bundler';import {renderFrames,selectComposition} from '@remotion/renderer';import fs from 'fs';import path from 'path';
const [comp,propsPath,outDir,nthS,scaleS]=process.argv.slice(2);const props={...JSON.parse(fs.readFileSync(propsPath,'utf8')),qc:true};
fs.rmSync(outDir,{recursive:true,force:true});fs.mkdirSync(outDir,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/index.ts'),publicDir:path.resolve('public')});
const composition=await selectComposition({serveUrl,id:comp,inputProps:props});
const n=Number(nthS||3);
await renderFrames({composition,serveUrl,inputProps:props,outputDir:outDir,imageFormat:'jpeg',jpegQuality:80,scale:Number(scaleS||.25),everyNthFrame:n,
 frameRange:[0,props.outro?.start?props.outro.start-1:composition.durationInFrames-1],muted:true,onStart:()=>{},onFrameUpdate:()=>{},
 imageSequencePattern:'f[frame].[ext]'}).catch(e=>{console.error(e);process.exit(1)});
console.log('qc frames ok',outDir);
