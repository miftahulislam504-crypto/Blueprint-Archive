'use client';

import { useEffect } from 'react';
import { useWorldStore } from '@/stores/useWorldStore';
import { getDestination } from '@/lib/world/destinations';
import { playerPosition } from '@/lib/player/playerPosition';
import { lenisInstance } from '@/lib/scroll/lenisInstance';
import { audioEngine } from '@/lib/audio/AudioEngine';

// Roughly matches Lenis's own configured duration (see
// LenisScrollProvider's options) — keeps a portal jump feeling like the
// same "world," not a jump-cut, whichever mode triggered it.
const SCROLL_TELEPORT_DURATION = 1.4;

/**
 * Doesn't render anything — this is a plain effect-runner mounted once
 * inside WorldCanvas, reacting to store changes rather than the frame
 * loop. Split out from CameraRig because CameraRig runs every frame and
 * this only needs to run on the rare occasion someone actually taps a
 * portal destination.
 *
 * 'explore' mode: drops playerPosition directly, no animation — the third
 * -person camera in CameraRig already smooths toward wherever
 * playerPosition ends up, so a hard position jump still reads as a
 * "swoop into place" rather than a literal teleport-cut.
 *
 * 'scroll'/'orbit' mode: switches into 'scroll' (if it wasn't already) and
 * animates the actual page scroll position to the destination's `t` via
 * Lenis — CameraRig already just follows scrollProgress every frame
 * regardless of what's driving it, so an eased Lenis scrollTo produces
 * the same kind of camera glide the manual scroll journey already has,
 * rather than a separate/duplicate camera tween living here too.
 */
export function TeleportController() {
  const teleportTarget = useWorldStore((s) => s.teleportTarget);

  useEffect(() => {
    if (!teleportTarget) return;

    const destination = getDestination(teleportTarget);
    const clear = () => useWorldStore.getState().clearTeleportRequest();
    if (!destination) {
      clear();
      return;
    }

    const cameraMode = useWorldStore.getState().cameraMode;
    audioEngine.playTone({ frequency: 440, duration: 0.35, type: 'sine', volume: 0.14 });
    // A quick upward chirp right after — reads as a "whoosh" bookending
    // the tone above rather than two separate unrelated sounds.
    window.setTimeout(() => {
      audioEngine.playTone({ frequency: 880, duration: 0.2, type: 'sine', volume: 0.1 });
    }, 120);

    if (cameraMode === 'explore') {
      playerPosition.position.set(...destination.position);
      // Face back along -Z (the world's own default forward), same
      // resting convention PlayerAvatar starts at — an arbitrary-but-
      // consistent choice, since a portal doesn't have a "which way you
      // were already facing" to preserve.
      playerPosition.facingAngle = 0;
      clear();
      return;
    }

    const lenis = lenisInstance.instance;
    if (cameraMode !== 'scroll') {
      useWorldStore.getState().setCameraMode('scroll');
    }

    if (!lenis) {
      // Lenis not ready yet (very early mount) — fall back to a plain
      // jump-scroll rather than silently doing nothing.
      const doc = document.documentElement;
      window.scrollTo(0, destination.t * (doc.scrollHeight - window.innerHeight));
      clear();
      return;
    }

    useWorldStore.getState().setIsTeleporting(true);
    const targetScroll = destination.t * lenis.limit;
    lenis.scrollTo(targetScroll, {
      duration: SCROLL_TELEPORT_DURATION,
      easing: (x: number) => 1 - Math.pow(1 - x, 3), // easeOutCubic
      onComplete: () => {
        useWorldStore.getState().setIsTeleporting(false);
      },
    });

    clear();
  }, [teleportTarget]);

  return null;
}
