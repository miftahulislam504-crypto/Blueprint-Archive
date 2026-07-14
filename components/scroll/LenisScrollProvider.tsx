'use client';

import { useRef, useEffect } from 'react';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import type Lenis from 'lenis';
import gsap from 'gsap';
import { useWorldStore } from '@/stores/useWorldStore';

// The 'lenis' package (not the old @studio-freight/lenis) exposes this
// shape via ref: { lenis: Lenis instance }.
type LenisRefShape = { lenis?: Lenis };

/**
 * Wrap the whole app with this once, in app/layout.tsx.
 *
 * autoRaf is deliberately off — Lenis and GSAP each running their own
 * requestAnimationFrame loop causes ~1-2 frame drift between smooth-scroll
 * position and any GSAP/ScrollTrigger-driven animation. Driving Lenis from
 * gsap.ticker keeps everything on one clock.
 */
export function LenisScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRefShape>(null);

  useEffect(() => {
    function update(time: number) {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;
      lenis.raf(time * 1000);
      // Read progress directly off the instance each tick, rather than
      // subscribing to lenis.on('scroll', ...) separately — that would
      // depend on the ref being populated at the moment we subscribe.
      // Reading it here just quietly no-ops until it is.
      useWorldStore.getState().setScrollProgress(lenis.progress);
    }
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis
      root
      options={{ autoRaf: false, lerp: 0.1, duration: 1.5 }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
}
