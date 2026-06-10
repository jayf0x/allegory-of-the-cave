# Allegory of the Cave — Agent Map

## Scene entry
`src/scene/index.jsx` — composes all scene nodes; camera limits in `CAM_LIMITS`

## Scene nodes
| Node | File | Notes |
|------|------|-------|
| Wall GLB | `src/scene/Wall/Wall.jsx` | loads `public/models/wall.glb`; static, receives shadow |
| Ground | `src/scene/Ground/index.jsx` | SoilFloor + GrassShrubs active; GrassBlades commented out |
| GrassShrubs | `src/scene/Ground/GrassShrubs.jsx` | GLB instancing, 600 instances; spawn zone defined by ZONE constant (z: -2.5→0.3); scale shrinks near camera |
| Fire | `src/scene/Lighting/Fire.jsx` | custom GLSL flame → 512×512 RT → spotLight gobo + pointLight |
| Projector spotlight | `src/scene/Lighting/Sun.jsx` | spotlight that reads gobo from ProjectedSurface |
| Lighting | `src/scene/Lighting/index.jsx` | composes Fire + Sun; flicker in useFrame |
| ProjectedSurface | `src/scene/ProjectedSurface/index.jsx` | gobo pipeline: render → H-blur → V-blur → temporal accumulation |
| VFX/Dust | `src/scene/VFX/Dust.jsx` | commented out in scene/index.jsx |

## Projection pipeline (per-frame cost)
`ProjectedSurface/index.jsx` runs 4 render passes: gobo (1024×512) → H-blur → V-blur → accumulation (1024×512 ping-pong). Result fed to `Sun.jsx` spotlight via `surfaceRef`.

## Config / tuning
`src/scene/config.js` — all numeric defaults (light positions, intensities, blur, accumulation decay). Leva controls override at runtime.

## Camera
`OrbitControls` in `CameraDebugger` (bottom of `scene/index.jsx`). Pan/zoom disabled; azimuth ±18°, polar ±10°. Adjust `CAM_LIMITS` to change range.

## Public assets
- `public/models/wall.glb` — main cave wall mesh
- `public/models/grass.glb`, `grass-shurbs.glb` — unused (grass disabled)
- `public/stars.hdr` — environment map
- `public/textures/Ground068_*` — soil floor textures (webp variants active)
- `public/video.mp4` — projected video source
