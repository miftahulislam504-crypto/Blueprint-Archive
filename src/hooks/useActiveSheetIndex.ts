"use client";

import { useEffect, useState } from "react";
import { PROJECTS } from "@/data/projects";

/**
 * Watches every `sheet-{i}` section via IntersectionObserver and reports
 * whichever is most visible right now — null while the cover sheet or the
 * instrument desk are what's in view, since there's no "current sheet" in
 * either of those. Kept independent of BlueprintCameraRig's internal
 * scroll-fraction math (which isn't exposed outside that component) since
 * "which section is on screen" is a simpler, more idiomatic question for
 * IntersectionObserver to answer than for the header to re-derive.
 */
export function useActiveSheetIndex(): number | null {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const ratios = new Map<number, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number(entry.target.getAttribute("data-sheet-index"));
          ratios.set(idx, entry.intersectionRatio);
        }
        let bestIdx: number | null = null;
        let bestRatio = 0.1; // ignore barely-visible slivers
        for (const [idx, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIdx = idx;
          }
        }
        setActive(bestIdx);
      },
      { threshold: [0.1, 0.25, 0.5, 0.75, 0.9] }
    );

    for (let i = 0; i < PROJECTS.length; i++) {
      const el = document.getElementById(`sheet-${i}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return active;
}
