import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { InstancedMesh, Object3D } from 'three';
import { BASE_URL } from '@/config';
import { generateGrassItems } from './utils';

// ── Spawn config ─────────────────────────────────────────────────────────────
// Tune zones to control density per depth band.
// share values must sum to 1. scaleMult shrinks/grows the base noise scale.
const SPAWN = {
  seed: 42,
  xHalf: 2.2,
  zones: [
    { zMin: -2.5, zMax: -1.0, share: 0.40, scaleMult: 1.00 }, // dense near wall
    { zMin: -1.0, zMax: -0.3, share: 0.35, scaleMult: 0.70 }, // mid field
    { zMin: -0.3, zMax:  0.3, share: 0.25, scaleMult: 0.35 }, // front — small, never blocks view
  ],
};

export function GrassShrubs({ count = 600, groundY = -0.5, scaleMin = 0.25, scaleMax = 0.95 }) {
  const { scene: gltfScene } = useGLTF(`${BASE_URL}models/grass-shurbs.glb`);
  const groupRef = useRef();

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !gltfScene) return;

    const items = generateGrassItems({ ...SPAWN, count, scaleMin, scaleMax });
    const dummy = new Object3D();
    const created = [];

    gltfScene.traverse((obj) => {
      if (!obj.isMesh) return;

      const mat = obj.material.clone();
      // Opaque + alpha cutout — prevents see-through between instances
      mat.transparent = false;
      mat.alphaTest = 0.4;
      mat.depthWrite = true;

      const instanced = new InstancedMesh(obj.geometry, mat, items.length);
      instanced.castShadow = false;
      instanced.receiveShadow = false; // fire ambient covers grass; skip shadow map cost
      instanced.frustumCulled = true;
      // Layer 0 only (default) — projector spotlight is on layer 1 so it won't touch grass

      items.forEach(({ x, z, scale, ry }, i) => {
        dummy.position.set(x, groundY + 0.01, z);
        dummy.rotation.y = ry;
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        instanced.setMatrixAt(i, dummy.matrix);
      });

      instanced.instanceMatrix.needsUpdate = true;
      instanced.computeBoundingSphere();
      group.add(instanced);
      created.push({ mesh: instanced, mat });
    });

    return () => {
      created.forEach(({ mesh, mat }) => {
        group.remove(mesh);
        mat.dispose();
      });
    };
  }, [gltfScene, count, groundY, scaleMin, scaleMax]);

  return <group ref={groupRef} />;
}

useGLTF.preload(`${BASE_URL}models/grass-shurbs.glb`);
