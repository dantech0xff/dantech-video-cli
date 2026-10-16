// Themes live in /themes/<id>/theme.json so they can be edited without touching code.
import tinNong from '../../themes/tin-nong/theme.json';import meoNhanh from '../../themes/meo-nhanh/theme.json';import commit from '../../themes/commit/theme.json';
export type Theme={id:string;label:string;bg:string;texture?:string;ink:string;onAccent:string;accent:string;accent2:string;muted:string;head:string;body:string;upper:boolean;step:number;video:'halftone'|'mono'|'clean';entry:'slam'|'type'|'rise';rule:string;
 sfx:{trans:string;stamp:string;tick:string;entry:string};trans:string[]};
export const THEMES:Record<string,Theme>={'tin-nong':tinNong.look as Theme,'meo-nhanh':meoNhanh.look as Theme,'commit':commit.look as Theme};
