// Mobile safe zones for 1080x1920 (TikTok / Reels / Shorts / FB Reels). Single source for every theme.
// ORGANIC zones are covered by app UI: top 250, bottom 420, left 60, right 200 (action rail, from y 700 down).
// STRICT = union of official ad templates: top 288, bottom 672, left 120, right 192 (+ TikTok rail x>=780 from y 840).
// Check renders with scripts/safezone.py.
export const ZONE={W:1080,H:1920,top:250,bottom:420,left:60,right:200,railY:700,strict:{top:288,bottom:672,left:120,right:192}};
const DESIGN_W=894,DESIGN_H=1320; // scenes are designed on this canvas, then scaled into the safe content box
const CX=136,CY=290,CR=860;          // content box: x 136..860, y 290..~1359
const S=(CR-CX)/DESIGN_W;
export const SZ={
 content:{x:CX,y:CY,w:DESIGN_W,h:DESIGN_H,scale:S,bottom:CY+DESIGN_H*S},
 captions:{x:CX,top:1366,w:CR-CX,maxLines:2},   // 2 lines must end above y 1500
 cta:{top:1150,right:1080-CR},                    // follow button box inside x<=860, y~1150-1350
 end:{x:CX,right:1080-CR},                        // end card text column
 right:CR,
};
