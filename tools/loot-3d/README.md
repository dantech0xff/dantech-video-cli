# loot-3d: studio plates for the loot-crypto theme

Own work. Generates the pre-rendered 3D "product shot" backgrounds in `assets/textures/loot/` (three.js 0.170 in headless
Chrome with SwiftShader, no GPU needed). Remotion never runs 3D at render time: it only drifts these images (loot.tsx LcStudio).

Setup once: `npm install` (three only). Output lands in `out/`.

- `render.html#<params>`: one scene, driven by hash params. `obj` = `plate` (floor + blocks from a layout JSON), `hero`
  (3D logomark: off-white 3/4 disc + mint cube), `wedge` (graphite 3/4 disc), `quarter`, `cube`, `slab`, `coin`.
  Size/camera/light/material: `w h fov cx cy cz ly rx ry rz s m key rim rim2 fill env exp ks`. Plate: `lay` (JSON list of
  blocks), `sp ang pen dec spx spy spz` (soft key spot = the light pool), `tx tz`, `rs rsx rsy rsz` (cool rim spot),
  `fc fr` (floor colour / roughness). `depth=1&dn=&df=` renders the depth pass.
  Materials: MeshPhysicalMaterial graphite gloss / mint / off-white, RectAreaLight key, spot rims, RoomEnvironment PMREM.
- `shot.sh name "params"` renders `out/name.png` (transparent PNG, read from `<pre id=out>` via --dump-dom).
- `final.py name W H "params" focus layfile cocK` renders colour + depth, then depth of field (blur levels by circle of
  confusion), vignette and fine grain -> `out/name.png`.

Shipped plates (1188x2112, saved as JPEG q90 into assets/textures/loot/):

    python3 final.py plate_main 1188 2112 "&sp=320&ang=.36&dec=1.7&spx=0.1&spy=8&spz=-0.8&tx=0&tz=-1.0&rs=75&rsy=7&fc=592137&key=1.6" 0.42 lay.json 2.2
    python3 final.py plate_end  1188 2112 "&sp=320&ang=.36&dec=1.7&spx=0.1&spy=8&spz=-0.8&tx=0&tz=-1.0&rs=75&rsy=7&fc=592137&key=1.6" 0.40 lay_end.json 2.2

`float_wedge.png`, `float_cube.png`, `hero3d.png` are single-object renders (`obj=wedge|cube|hero`, transparent).
