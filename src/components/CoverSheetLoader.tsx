"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/utils/gsap";
import { useLenis } from "@/hooks/useLenis";
import { useIntroState } from "@/hooks/useIntroState";

const LOAD_DURATION = 2100; // ms, how long the plotter line takes to draw
const HOLD_AT_100 = 400; // ms, brief pause once fully drawn before fading
const FADE_DURATION = 800; // ms — keep in sync with the exit tween below
const SCROLL_RELEASE_DELAY = 1700; // ms after handoff — lets the camera pull back before scroll can interrupt it

// Sequential status lines, timed against LOAD_DURATION rather than tied to
// any real loading step — same honesty caveat as CIVION's loader: this is
// a fixed-duration performance, not a measure of actual asset load.
const STATUS_LINES = [
  "UNROLLING SHEET",
  "ALIGNING GRID",
  "INKING LINEWORK",
  "ARCHIVE READY",
];

const LINE_LENGTH = 420; // px, keep in sync with the SVG path below

export default function CoverSheetLoader() {
  const lenis = useLenis();
  const { introDone, setIntroDone } = useIntroState();
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const lineWrapRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!introDone) {
      lenis?.stop();
    }
  }, [lenis, introDone]);

  useEffect(() => {
    if (!introDone) return;
    const timeout = setTimeout(() => {
      lenis?.start();
    }, SCROLL_RELEASE_DELAY);
    return () => clearTimeout(timeout);
  }, [introDone, lenis]);

  useEffect(() => {
    const tl = gsap.timeline();
    if (wordmarkRef.current) {
      tl.fromTo(
        wordmarkRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
    if (lineWrapRef.current) {
      tl.fromTo(
        lineWrapRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" },
        "-=0.4"
      );
    }
    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / LOAD_DURATION) * 100));
      setProgress(pct);
      setStatusIndex(
        Math.min(
          STATUS_LINES.length - 1,
          Math.floor((pct / 100) * STATUS_LINES.length)
        )
      );

      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setFading(true);
          setIntroDone(true);
          setTimeout(() => setMounted(false), FADE_DURATION);
        }, HOLD_AT_100);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [setIntroDone]);

  useEffect(() => {
    if (!statusRef.current) return;
    gsap.fromTo(
      statusRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: "power1.out" }
    );
  }, [statusIndex]);

  useEffect(() => {
    if (!fading || !rootRef.current) return;
    gsap.to(rootRef.current, {
      opacity: 0,
      scale: 1.03,
      filter: "blur(6px)",
      duration: FADE_DURATION / 1000,
      ease: "power2.inOut",
    });
  }, [fading]);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-indigo-deep ${
        fading ? "pointer-events-none" : ""
      }`}
      style={{ willChange: "opacity, transform, filter" }}
      aria-hidden={fading}
    >
      <div className="bp-grid absolute inset-0 opacity-50" />
      <div className="bp-grid-fine absolute inset-0 animate-bp-grid-drift opacity-30" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, rgba(8,24,38,0.55) 75%, var(--bp-indigo-void) 100%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-8">
        <div
          ref={wordmarkRef}
          className="flex flex-col items-center gap-2 opacity-0"
        >
          <span className="font-display text-[11px] tracking-[0.3em] uppercase text-brass/50">
            DWG A-00
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase text-linework">
            The Archive
          </h1>
        </div>

        <div ref={lineWrapRef} className="flex flex-col items-center gap-3 opacity-0">
          <svg width={LINE_LENGTH} height="24" viewBox={`0 0 ${LINE_LENGTH} 24`}>
            <line
              x1="0"
              y1="12"
              x2={LINE_LENGTH}
              y2="12"
              stroke="rgba(207,232,243,0.15)"
              strokeWidth="1.5"
            />
            <line
              x1="0"
              y1="12"
              x2={LINE_LENGTH}
              y2="12"
              stroke="#c9a15f"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={LINE_LENGTH}
              strokeDashoffset={LINE_LENGTH * (1 - progress / 100)}
              style={{ transition: "stroke-dashoffset 150ms ease-out" }}
            />
            {/* Plotter head — a small tick riding the end of the drawn line */}
            <circle
              cx={Math.max(2, LINE_LENGTH * (progress / 100))}
              cy="12"
              r="3"
              fill="#c9a15f"
              style={{ transition: "cx 150ms ease-out" }}
            />
          </svg>

          <span className="font-display text-xl font-bold tabular-nums text-linework">
            {progress}
            <span className="text-sm text-linework/40">%</span>
          </span>
        </div>

        <p
          ref={statusRef}
          className="font-display text-[10px] tracking-[0.25em] uppercase text-linework/40 min-h-[1em]"
        >
          {`// ${STATUS_LINES[statusIndex]}`}
        </p>
      </div>
    </div>
  );
}
