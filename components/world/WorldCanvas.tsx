'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useWorldStore } from '@/stores/useWorldStore';
import { Effects } from './Effects';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const MAX_DPR_BY_TIER = { low: 1, mid: 1.5, high: 2 } as const;

/**
 * Positioned fixed/full-viewport — this never scrolls. ScrollSpacer sits
 * alongside it (not inside it) purely to give the page scroll distance;
 * CameraRig reads that scroll progress and moves the camera instead.
 */
export function WorldCanvas({ children }: { children: React.ReactNode }) {
  const quality = useWorldStore((s) => s.qualityTier);

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, MAX_DPR_BY_TIER[quality]]}
        gl={{ antialias: quality !== 'low' }}
        shadows={quality !== 'low'}
      >
        <Suspense fallback={null}>{children}</Suspense>
        <Effects />
      </Canvas>

      {/* Plain DOM overlay, not Canvas content — a <div> can't render as
          an r3f Suspense fallback, which is why this lives out here
          instead of inside the Suspense above. useProgress() works from
          anywhere in the tree regardless; it just watches the shared
          DefaultLoadingManager every useGLTF() call already reports to. */}
      <LoadingScreen />
    </div>
  );
}
