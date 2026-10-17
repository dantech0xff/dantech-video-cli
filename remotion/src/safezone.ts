// Mobile safe zones for 1080x1920 (TikTok / Reels / Shorts / FB Reels). Single source for every theme.
// NO-TEXT zones (app UI covers them; nothing but background/decoration there, brand + page number included):
//   top y<290 (search, Following/For You tabs, LIVE), bottom y>=1500, left x<60, right x>=880 from y 700 (action rail).
// STRICT = union of official ad templates: top 288, bottom 672, left 120, right 192 (+ TikTok rail x>=780 from y 840).
// Layout, top to bottom:
//   slim header  y 294..334 (40 px, x 136..860): ONE line, wordmark left, page counter (+ date) right, shared baseline
//   scene content y 340..1359: design canvas 894 wide scaled 0.795 (x 136..847); usable design height ~1282
//   captions     y 1366..1500
// Check renders with scripts/safezone.py.
export const ZONE={W:1080,H:1920,top:290,bottom:420,left:60,right:200,railY:700,strict:{top:288,bottom:672,left:120,right:192}};
const CX=136,CR=860;                  // text column: x 136..860
const HEAD_TOP=294,HEAD_H=40;         // slim header line (brand + page [+ date]); no second strip
const CY=340,CB=1359;                 // scene content box
const S=0.795;                        // scene scale: 894 design px -> 711 px (x 136..847)
const DESIGN_W=894,DESIGN_H=Math.floor((CB-CY)/S); // usable design height ~1282 (scenes were drawn on 894x1320; keep content above ~1280)
export const SZ={
 noText:{top:290,bottom:1500,left:60,railX:880,railY:700},
 header:{x:CX,right:1080-CR,top:HEAD_TOP,h:HEAD_H,bottom:HEAD_TOP+HEAD_H},
 content:{x:CX,y:CY,w:DESIGN_W,h:DESIGN_H,scale:S,bottom:CY+DESIGN_H*S},
 captions:{x:CX,top:1366,w:CR-CX,maxLines:2},   // 2 lines must end above y 1500
 cta:{top:1150,right:1080-CR},                    // follow button box inside x<=860, y~1150-1350
 end:{x:CX,right:1080-CR,top:420},                // end card text column: starts >= y 420, ends <= y 1480
 right:CR,
};
