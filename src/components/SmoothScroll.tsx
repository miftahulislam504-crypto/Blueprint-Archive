"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/utils/gsap";
import { LenisContext } from "@/hooks/useLenis";

/**
 * Wraps the app in Lenis-powered smooth scrolling, synced to GSAP's ticker
 * so ScrollTrigger stays perfectly in step with the smoothed scroll
 * position, and exposes the Lenis instance via context so components like
 * CoverSheetLoader and ProjectSelectionProvider can call lenis.stop()/
 * start() to lock scroll during the boot sequence or while a sheet is
 * focused.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    const instance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    instance.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      // gsap.ticker time is in seconds, lenis.raf expects milliseconds
      instance.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tickerCallback);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
