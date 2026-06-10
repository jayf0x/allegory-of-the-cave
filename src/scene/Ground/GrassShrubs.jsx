import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { InstancedMesh, MathUtils, Object3D } from 'three';
import { BASE_URL } from '@/config';
import { cpuVnoise } from './utils';

// Spawn zone: between camera (z≈1) and wall (z≈-1.5), never behind camera.
// Near-camera grass is small so it doesn't occlude the view.
const ZONE = {
  xHalf: 2.2,
  zNear: 0.3, // closest z to camera
  zFar: -2.5, // furthest z (past wall base)
};

function distanceScale(z) {
  // Small near camera so it doesn't block; full size near wall for depth
  const t = MathUtils.clamp((z - ZONE.zNear) / (ZONE.zFar - ZONE.zNear), 0, 1);
  return MathUtils.lerp(0.3, 1.0, t);
}

export function GrassShrubs({ count, groundY, scaleMin, scaleMax }) {
  const { scene: gltfScene } = useGLTF(`${BASE_URL}models/grass-shurbs.glb`);
  const groupRef = useRef();

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !gltfScene) return;

    // Pre-generate and sort far-to-near so depth buffer resolves correctly
    // even if the GLB material has alpha blending edges
    const items = [];
    let attempts = 0;
    while (items.length < count && attempts < count * 4) {
      attempts++;
      const x = (Math.random() - 0.5) * 2 * ZONE.xHalf;
      const z = MathUtils.lerp(ZONE.zFar, ZONE.zNear, Math.random());

      // Rejection: keep near-camera sparse (z > -0.5 only 30% chance)
      const camProximity = MathUtils.clamp((z - ZONE.zFar) / (ZONE.zNear - ZONE.zFar), 0, 1);
      if (camProximity > 0.65 && Math.random() > 0.3) continue;

      const density = cpuVnoise(x * 1.0 + 50, z * 1.0 + 50);
      const detail = cpuVnoise(x * 2.8 + 12, z * 2.8 + 12);
      const noiseVal = density * 0.6 + detail * 0.4;
      const baseScale = MathUtils.lerp(scaleMin, scaleMax, noiseVal);

      items.push({ x, z, scale: baseScale * distanceScale(z), ry: Math.random() * Math.PI * 2 });
    }

    // Sort far-to-near: correct rendering order for any alpha-edge cases
    items.sort((a, b) => a.z - b.z);

    const dummy = new Object3D();
    const created = [];

    gltfScene.traverse((obj) => {
      if (!obj.isMesh) return;

      // Clone material so we can mutate without touching the source GLB
      const mat = obj.material.clone();
      // Fix transparency: opaque with alpha cutout prevents see-through artifacts
      mat.transparent = false;
      mat.alphaTest = 0.4;
      mat.depthWrite = true;

      const instanced = new InstancedMesh(obj.geometry, mat, items.length);
      instanced.castShadow = false;
      instanced.receiveShadow = false; // fire ambient handles grass lighting; skip shadow map cost
      instanced.frustumCulled = true;

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
