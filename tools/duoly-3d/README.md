# duoly-3d: glossy 3D props + plates for the duoly theme (Duoly in Love)

Own work. Generates the transparent 3D sprites and the two full-frame plates in `assets/textures/duoly/` (three.js 0.170 in
headless Chrome with SwiftShader, no GPU needed). Remotion never runs 3D: it only drifts the plate and floats these PNGs
(duoly.tsx DlBackdrop / Sticker / DlHook art).

Setup once: `npm install` (three only). Intermediate renders land in `out/`.

- `render.html#<params>`: one object on a transparent canvas.
  - `obj=ring`: two interlocked elliptical rings (TubeGeometry on an ellipse curve), white `#FFF1EE` + peach `#F58C76`,
    MeshPhysical clearcoat. Shape: `a b` (ellipse radii), `tube`, `tilt` (interlock tilt), `ang`, `dx dy` (offset of ring 2).
  - `obj=puffy`: puffy heart = MarchingCubes over the 2D heart SDF with a box-blurred depth profile (no crease, no tip stem;
    extrude + bevel gave banding and a stem, do not use). `res th dd blur pw`, colour `c=pink|peach|white|coral`.
  - shared: `rx ry rz s` (pose / scale), `exp env key bounce rim fill` (RectArea key, pink bounce, rim, hemisphere fill).
- `shot.sh name "params"` renders `out/name.png` (same as tools/loot-3d).
- `build.py`: renders every sprite at 2x, LANCZOS down, trims to content, writes `assets/textures/duoly/<name>.png`
  (ring_hero, ring_a, ring_b, puffy_pink/peach/white/coral), then draws the plates (PIL): `plate_soft.jpg` (gradient
  #FFF6F4 -> #FBE3E1, soft glows, faint outline hearts and dots in the margins) and `plate_bold.jpg` (#F35570 -> #D80B46,
  end card). Both 1296x2304 JPEG q92 (= 1.2x the frame, so look.plateScale 1.03 never upscales; `scripts/check_plates.py`).

      python3 build.py           # sprites + plates
      python3 build.py plates    # plates only

- `mark.py`: plain logo mark (no app-icon tile) matted from `assets/brand/duoly/duoly-logo.jpg` -> `duoly-mark.png` (see the theme skill for the method).

Rules: plates carry no objects behind text; floaters live only in the top (y < 290) / bottom (y >= 1500) bands, are
`data-deco`, and get a 1.3 px depth blur (1.8 px on the bold end-card plate) so scripts/safezone.py does not read their
glossy highlights as text. No large blurred foreground objects, no dim panels.
