'use client';

import { useEffect, useRef, useState } from 'react';
import { useSecretsStore } from '@/stores/useSecretsStore';
import { audioEngine } from '@/lib/audio/AudioEngine';

const TAP_ZONE_SIZE = 60;
const TAPS_REQUIRED = 5;
const TAP_WINDOW_MS = 3000;

/**
 * Two independent triggers for the same console, since the target
 * platform (mobile, per this project's whole build approach) has no
 * keyboard for a backtick key to ever fire on:
 *
 * - Desktop: backtick/grave key, the conventional dev-console binding —
 *   doesn't require cameraMode === 'explore' the way
 *   KeyboardMovementListener's WASD does, since this should be reachable
 *   from anywhere, not just while walking around.
 * - Mobile: 5 taps within 3 seconds inside an invisible zone in the
 *   bottom-left corner. Not decoration, not a real button — genuinely
 *   hidden, which is the point of it being a "secret."
 */
export function DevConsoleTrigger({ onOpen }: { onOpen: () => void }) {
  const [tapCount, setTapCount] = useState(0);
  const firstTapAt = useRef(0);
  const unlock = useSecretsStore((s) => s.unlock);

  const trigger = () => {
    audioEngine.playToggleOn();
    unlock('devConsole');
    onOpen();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Backquote') {
        e.preventDefault();
        trigger();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTap = () => {
    const now = Date.now();
    if (now - firstTapAt.current > TAP_WINDOW_MS) {
      firstTapAt.current = now;
      setTapCount(1);
      return;
    }
    const next = tapCount + 1;
    if (next >= TAPS_REQUIRED) {
      setTapCount(0);
      trigger();
    } else {
      setTapCount(next);
    }
  };

  return (
    <div
      onPointerDown={handleTap}
      aria-hidden
      style={{
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: TAP_ZONE_SIZE,
        height: TAP_ZONE_SIZE,
        zIndex: 5,
        // Genuinely invisible — no background, no border, no cursor
        // affordance. Well clear of TouchJoystick, which sits at
        // left: 28, bottom: 100.
        background: 'transparent',
      }}
    />
  );
}
