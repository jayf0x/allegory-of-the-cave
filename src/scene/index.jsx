import { useImperativeHandle, useRef } from 'react';
import { Environment, Preload } from '@react-three/drei';
import { useSetAtom } from 'jotai';
import { folder, useControls } from 'leva';
import { BASE_URL } from '@/config';
import { historyAtom } from '../store/cave';
import { devLog } from '../utils';
import { Ground } from './Ground';
import { Lighting } from './Lighting';
import { ProjectedSurface } from './ProjectedSurface';
import { Wall } from './Wall/Wall';
import { CameraUserControls } from './components/CameraUserControls';
import { SCENE_CONFIG as C } from './config';

export const Scene = ({ videoRef, isActive, captureRef }) => {
  const getCanvasBlobRef = useRef();
  const surfaceRef = useRef(null);
  const setHistory = useSetAtom(historyAtom);

  const { fogDensity, fogColor } = useControls({
    Atmosphere: folder({
      fogColor: { value: C.fogColor },
      fogDensity: { value: C.fogDensity, min: 0, max: 0.5, step: 0.001 },
    }),
  });

  useImperativeHandle(captureRef, () => ({
    captureFrame: (quality) =>
      new Promise((resolve) => {
        getCanvasBlobRef.current?.(
          (blob) => {
            if (!blob) return resolve(null);
            setHistory((prev) => {
              if (!prev.length) return prev;
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                imageBlob: blob,
              };
              return updated;
            });
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => {
              devLog('Failed to read canvas blob');
              resolve(null);
            };
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          quality,
        );
      }),
  }));

  return (
    <>
      <color attach="background" args={['#080604']} />
      <Environment files={`${BASE_URL}stars.hdr`} background />

      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />

      <CameraUserControls />

      <Lighting surfaceRef={surfaceRef} />

      <Wall />
      <Ground />

      {/* <Dust opacity={dustOpacity} /> */}
      <ProjectedSurface videoRef={videoRef} isActive={isActive} surfaceRef={surfaceRef} />

      <Preload all />
    </>
  );
};
