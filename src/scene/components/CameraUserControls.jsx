import { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { isDevelopment } from '@/utils';

// Azimuth = horizontal (left/right), polar = vertical (up/down)
// All angles in radians. Adjust these to taste.
const CAM_LIMITS = {
  minAzimuth: -Math.PI / 10, // ~18° left
  maxAzimuth: Math.PI / 10, // ~18° right
  minPolar: Math.PI / 2 - 1.18, // ~10° up from horizon
  maxPolar: Math.PI / 2 + 0.1, // ~6° down from horizon
};

export const CameraUserControls = () => {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (!isDevelopment()) return;
    window.camera = camera;
    window.controls = controlsRef.current;

    const onKey = (e) => {
      if (e.key === 'p') {
        console.log('camera position', camera.position.toArray());
        console.log('controls target', controlsRef.current.target.toArray());
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={false}
      rotateSpeed={0.1}
      minAzimuthAngle={CAM_LIMITS.minAzimuth}
      maxAzimuthAngle={CAM_LIMITS.maxAzimuth}
      minPolarAngle={CAM_LIMITS.minPolar}
      maxPolarAngle={CAM_LIMITS.maxPolar}
    />
  );
};
