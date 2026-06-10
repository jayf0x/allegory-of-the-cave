import { BASE_URL } from '@/config';
import { usePBRTextures } from '@/hooks/useModel.js';

export function SoilFloor({ groundSize = 6, groundY = -0.5, textureRepeat = 3 }) {
  const textures = usePBRTextures(
    {
      map: `${BASE_URL}textures/Ground068_Color.webp`,
      normalMap: `${BASE_URL}textures/Ground068_NormalGL.webp`,
      roughnessMap: `${BASE_URL}textures/Ground068_Roughness.webp`,
      aoMap: `${BASE_URL}textures/Ground068_AO.webp`,
    },
    textureRepeat,
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY, 0]} receiveShadow>
      <planeGeometry args={[groundSize, groundSize, 32, 32]} />
      <meshStandardMaterial {...textures} roughness={0.95} metalness={0.0} />
    </mesh>
  );
}
