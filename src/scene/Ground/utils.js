// CPU value noise — returns [0, 1] for any (x, z) pair.
// Used once at scatter time, no per-frame cost.
export function cpuVnoise(x, z) {
  const ix = Math.floor(x),
    iz = Math.floor(z);
  const fx = x - ix,
    fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const h = (px, pz) => {
    const n = Math.sin(px * 127.1 + pz * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  return (
    h(ix, iz) * (1 - ux) * (1 - uz) +
    h(ix + 1, iz) * ux * (1 - uz) +
    h(ix, iz + 1) * (1 - ux) * uz +
    h(ix + 1, iz + 1) * ux * uz
  );
}

// Simple LCG seeded PRNG — deterministic, no external dep
export function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = ((Math.imul(1664525, s) + 1013904223) >>> 0);
    return s / 0x100000000;
  };
}

/**
 * Generate deterministic grass placement items from a zone config.
 *
 * zones: Array of { zMin, zMax, share, scaleMult }
 *   share     — fraction of `count` placed in this zone (must sum to 1)
 *   scaleMult — scale multiplier applied on top of the base noise scale
 *
 * Returns items sorted far-to-near (correct depth order).
 */
export function generateGrassItems({ seed, zones, xHalf, count, scaleMin, scaleMax }) {
  const rng = seededRng(seed);
  const items = [];

  for (const zone of zones) {
    const zoneCount = Math.round(count * zone.share);

    for (let i = 0; i < zoneCount; i++) {
      const x = (rng() - 0.5) * 2 * xHalf;
      const z = zone.zMin + rng() * (zone.zMax - zone.zMin);

      const density = cpuVnoise(x * 1.0 + 50, z * 1.0 + 50);
      const detail = cpuVnoise(x * 2.8 + 12, z * 2.8 + 12);
      const noiseVal = density * 0.6 + detail * 0.4;

      const scale = (scaleMin + noiseVal * (scaleMax - scaleMin)) * (zone.scaleMult ?? 1.0);
      const ry = rng() * Math.PI * 2;

      items.push({ x, z, scale, ry });
    }
  }

  // Far-to-near: correct overdraw order for any alpha-edge cases
  items.sort((a, b) => a.z - b.z);
  return items;
}
