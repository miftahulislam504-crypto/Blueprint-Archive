'use client';

import { useRef } from 'react';
import { useProgress } from '@react-three/drei';

/**
 * Sits outside WorldCanvas's own Suspense boundary (rendered as a sibling,
 * not a child of Canvas — a plain <div> can't render as an r3f Suspense
 * fallback), so it can show while the GLB models suspended inside that
 * boundary are still loading. useProgress() itself works from anywhere in
 * the React tree regardless of Canvas — it just subscribes to three.js's
 * shared DefaultLoadingManager, which every useGLTF() call in this project
 * already reports to without any extra setup.
 */
export function LoadingScreen() {
  const { progress, active } = useProgress();

  // Guards against the classic useProgress() flash: `active` starts false
  // before the very first load has registered, which — read naively —
  // looks identical to "already finished" for a frame. Only treat it as
  // finished once loading has actually been seen running at least once.
  // Mutating a ref directly during render like this is fine (unlike
  // state) precisely because it doesn't trigger a re-render on its own —
  // it just needs to be visible to the rest of *this* render pass.
  const hasStartedRef = useRef(false);
  if (active) hasStartedRef.current = true;
  const isDone = hasStartedRef.current && !active;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: '#05030f',
        color: '#e8e6ff',
        fontFamily: 'sans-serif',
        opacity: isDone ? 0 : 1,
        pointerEvents: isDone ? 'none' : 'auto',
        transition: 'opacity 0.6s ease',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          border: '2px solid rgba(92, 225, 255, 0.25)',
          borderTopColor: '#5CE1FF',
          borderRadius: '50%',
          animation: 'crystal-world-spin 1.1s linear infinite',
        }}
      />

      <div style={{ fontSize: 13, letterSpacing: 3, opacity: 0.75 }}>
        ENTERING CRYSTAL WORLD
      </div>

      <div
        style={{
          width: 200,
          height: 3,
          borderRadius: 999,
          background: 'rgba(92, 225, 255, 0.15)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: '#5CE1FF',
            transition: 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  );
}
