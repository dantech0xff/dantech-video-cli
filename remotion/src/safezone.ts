// Mobile safe zones for 1080x1920 (TikTok / Reels / Shorts / FB Reels). Single source for every theme.
// NO-TEXT zones (app UI covers them; nothing but background/decoration there, brand + page number included):
//   top y<290 (search, Following/For You tabs, LIVE), bottom y>=1500, left x<60, right x>=880 from y 700 (action rail).
// STRICT = union of official ad templates: top 288, bottom 672, left 120, right 192 (+ TikTok rail x>=780 from y 840).
// Layout, top to bottom: chrome band (brand row, page number, section/tab strip) y 296..402, scene content y 416..1359,
// captions y 1366..1500. Everything with text stays in x 136..860. Check renders with scripts/safezone.py.
export const ZONE={W:1080,H:1920,top:290,bottom:420,left:60,right:200,railY:700,strict:{top:288,bottom:672,left:120,right:192}};
const DESIGN_W=894,DESIGN_H=1320; // scenes are designed on this canvas, then scaled into the safe content box
const CX=136,CR=860;               // text column: x 136..860
const CHROME_TOP=296,CHROME_BOTTOM=402; // theme chrome (brand row + page + section/tab strip) must fit in here
const CY=416,CB=1359;              // scene content box: y 416..1359 (scale ~0.714)
const S=(CB-CY)/DESIGN_H;
export const SZ={
 noText:{top:290,bottom:1500,left:60,railX:880,railY:700},
 chrome:{x:CX,right:1080-CR,top:CHROME_TOP,bottom:CHROME_BOTTOM},
 content:{x:CX,y:CY,w:DESIGN_W,h:DESIGN_H,scale:S,bottom:CY+DESIGN_H*S},
 captions:{x:CX,top:1366,w:CR-CX,maxLines:2},   // 2 lines must end above y 1500
 cta:{top:1150,right:1080-CR},                    // follow button box inside x<=860, y~1150-1350
 end:{x:CX,right:1080-CR,top:420},                // end card text column: starts >= y 420, ends <= y 1480
 right:CR,
};
