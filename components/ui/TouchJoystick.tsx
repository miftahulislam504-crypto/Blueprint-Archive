'use client';

import { useRef, useState, useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import { movementInput } from '@/lib/input/movementInput';

const BASE_RADIUS = 55;
const STICK_RADIUS = 24;

/**
 * The primary movement control on the actual target platform (mobile —
 * no keyboard). Uses the Pointer Events API rather than separate touch/
 * mouse handlers, so the same code handles touch drags on the phone and
 * mouse drags for desktop testing without duplicating logic.
 *
 * touchAction: 'none' on the base matters a lot here — without it, the
 * browser's default touch-scroll gesture would fight a drag starting on
 * this element, since the page itself is normally scrollable (Lenis).
 * Combined with setPointerCapture on pointerdown, the drag keeps tracking
 * correctly even if a finger strays outside the visible circle.
 */
export function TouchJoystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const [stickOffset, setStickOffset] = useState({ x: 0, y: 0 });
  const activePointerId = useRef<number | null>(null);

  const updateFromPointer = useCallback((clientX: number, clientY: number) => {
    const base = baseRef.current;
    if (!base) return;

    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > BASE_RADIUS) {
      dx = (dx / dist) * BASE_RADIUS;
      dy = (dy / dist) * BASE_RADIUS;
    }

    setStickOffset({ x: dx, y: dy });

    // Screen-space: dragging up (negative screen Y) should mean "move
    // forward", hence the sign flip on z relative to y here.
    movementInput.x = dx / BASE_RADIUS;
    movementInput.z = dy / BASE_RADIUS;
  }, []);

  const reset = useCallback(() => {
    setStickOffset({ x: 0, y: 0 });
    movementInput.x = 0;
    movementInput.z = 0;
    activePointerId.current = null;
  }, []);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    reset();
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'fixed',
        left: 28,
        bottom: 100,
        width: BASE_RADIUS * 2,
        height: BASE_RADIUS * 2,
        borderRadius: '50%',
        background: 'rgba(20, 15, 45, 0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(92, 225, 255, 0.2)',
        zIndex: 40,
        touchAction: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: STICK_RADIUS * 2,
          height: STICK_RADIUS * 2,
          borderRadius: '50%',
          background: 'rgba(92, 225, 255, 0.35)',
          border: '1px solid rgba(92, 225, 255, 0.5)',
          transform: `translate(calc(-50% + ${stickOffset.x}px), calc(-50% + ${stickOffset.y}px))`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
