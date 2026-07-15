'use client';

import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';

const AVATAR_MODEL_PATH = '/models/avatar-adventurer.glb';

// Long enough that it doesn't compete with whatever's still loading right
// after first paint (hero island, crystal core, initial GLBs already in
// view), short enough that most people are still warmed up well before
// they'd ever reach for the walk-mode button on their own.
const IDLE_PREFETCH_DELAY_MS = 4000;

let alreadyPrefetched = false;

function prefetchAvatar() {
  if (alreadyPrefetched) return;
  alreadyPrefetched = true;
  useGLTF.preload(AVATAR_MODEL_PATH);
}

/**
 * The avatar (avatar-adventurer.glb, ~1.9MB — by far the heaviest asset
 * in public/models, everything else is under 200KB) only ever actually
 * renders once cameraMode is 'explore' (see PlayerAvatar's own mount
 * condition in page.tsx). It previously had a module-level
 * `useGLTF.preload()` the same way EnergyTower/AncientRuins/CrystalCore
 * do — which made sense for those three (always mounted, just possibly
 * far down the journey) but not for this one: every single visitor
 * downloaded the full 1.9MB avatar immediately on page load, even the
 * large majority who never touch walk mode at all.
 *
 * Mount this once near HUD/the root DOM overlay layer (not inside the
 * Canvas — this needs no r3f context, it's a plain side effect) to
 * prefetch on two independent signals instead:
 *
 * 1. Pointer/touch directly on the walk-mode button, wired from HUD via
 *    onPrefetchIntent — fires on pointerdown/touchstart, which happens
 *    before the click's own state change completes, buying a small head
 *    start on an interaction that's already 100% going to need this model.
 * 2. A one-time idle timeout as a safety net for anyone who scrolls
 *    straight through without ever hovering/touching that button first —
 *    still avoids the original "everyone pays for this on page load"
 *    problem, since by the time this fires the critical initial content
 *    has already had a multi-second head start.
 */
export function AvatarPrefetch() {
  const idleTimer = useRef<number | null>(null);

  useEffect(() => {
    idleTimer.current = window.setTimeout(prefetchAvatar, IDLE_PREFETCH_DELAY_MS);
    return () => {
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    };
  }, []);

  return null;
}

/** Call directly from HUD's walk-mode button (onPointerDown/onTouchStart)
 *  for the early-signal prefetch described above. Safe to call more than
 *  once — prefetchAvatar's own module-level flag no-ops after the first. */
export function prefetchAvatarNow() {
  prefetchAvatar();
}
