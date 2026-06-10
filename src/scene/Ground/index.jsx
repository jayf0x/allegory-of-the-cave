import { GrassShrubs } from './GrassShrubs';
import { SoilFloor } from './SoilFloor';

// ─────────────────────────────────────────────────────────────────────────────
//  Ground — composes floor surfaces. Each surface is plug-and-play:
//  disable any layer without touching its implementation.
// ─────────────────────────────────────────────────────────────────────────────
export function Ground({
  // shared layout
  groundY = -0.6,
  groundSize = 6,

  // soil
  textureRepeat = 3,

  // shrub options (forwarded to GrassShrubs)
  shrubCount = 350,
  shrubScaleMin = 0.55,
  shrubScaleMax = 1.95,
} = {}) {
  return (
    <group>
      <SoilFloor groundSize={groundSize} groundY={groundY} textureRepeat={textureRepeat} />

      <GrassShrubs
        count={shrubCount}
        groundY={groundY}
        scaleMin={shrubScaleMin}
        scaleMax={shrubScaleMax}
      />
    </group>
  );
}
