'use client';

import { useEffect, useRef } from 'react';
import { movementInput } from '@/lib/input/movementInput';

const FORWARD_KEYS = ['KeyW', 'ArrowUp'];
const BACK_KEYS = ['KeyS', 'ArrowDown'];
const LEFT_KEYS = ['KeyA', 'ArrowLeft'];
const RIGHT_KEYS = ['KeyD', 'ArrowRight'];

/**
 * Desktop-testing convenience alongside TouchJoystick, which is the
 * primary control for the actual target platform here (mobile has no
 * keyboard). Only mounted while cameraMode is 'explore' (see page.tsx),
 * and clears movementInput on unmount, so keys held from some earlier
 * moment can't leak into a later mode.
 */
export function KeyboardMovementListener() {
  const heldKeys = useRef(new Set<string>());

  useEffect(() => {
    const recompute = () => {
      const keys = heldKeys.current;
      const isForward = FORWARD_KEYS.some((k) => keys.has(k));
      const isBack = BACK_KEYS.some((k) => keys.has(k));
      const isLeft = LEFT_KEYS.some((k) => keys.has(k));
      const isRight = RIGHT_KEYS.some((k) => keys.has(k));

      movementInput.x = (isRight ? 1 : 0) - (isLeft ? 1 : 0);
      movementInput.z = (isBack ? 1 : 0) - (isForward ? 1 : 0);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      heldKeys.current.add(e.code);
      recompute();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      heldKeys.current.delete(e.code);
      recompute();
    };
    // Held keys shouldn't survive the tab losing focus — otherwise a key
    // released while alt-tabbed away stays "stuck" forever, since the
    // keyup that would normally clear it never fires off-tab.
    const handleBlur = () => {
      heldKeys.current.clear();
      recompute();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      movementInput.x = 0;
      movementInput.z = 0;
    };
  }, []);

  return null;
}
