"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/utils/gsap";
import { useProjectSelection } from "@/hooks/useProjectSelection";

export default function ProjectDetailCard() {
  const { selected, close } = useProjectSelection();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [selected]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close]);

  if (!selected) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 sm:p-8">
      {/* Backdrop — closes on click, doesn't block the 3D view entirely */}
      <button
        type="button"
        aria-label="Close detail"
        onClick={close}
        className="absolute inset-0 bg-indigo-void/40 cursor-default"
      />

      <div
        ref={cardRef}
        className="relative w-full max-w-md bg-graphite-ink/95 border border-linework/20 backdrop-blur-sm p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="font-display text-[10px] tracking-[0.25em] uppercase text-brass/70 mb-1">
              {selected.sheetNumber}
            </div>
            <h2 className="font-display text-xl font-bold tracking-wide uppercase text-linework">
              {selected.title}
            </h2>
            <div className="font-body text-sm text-linework/50 mt-1">
              {selected.system}
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            data-cursor-hover
            className="font-display text-xs tracking-widest uppercase text-linework/40 hover:text-brass transition-colors shrink-0"
          >
            Close
          </button>
        </div>

        <p className="font-body text-sm leading-relaxed text-linework/75 mb-5">
          {selected.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {selected.stack.map((item) => (
            <span
              key={item}
              className="font-display text-[10px] tracking-wider uppercase px-2 py-1 border border-linework/20 text-linework/60"
            >
              {item}
            </span>
          ))}
        </div>

        {selected.href && (
          <a
            href={selected.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-hover
            className="inline-block font-display text-xs tracking-widest uppercase text-brass border-b border-brass/40 hover:border-brass pb-0.5 transition-colors"
          >
            Visit live site →
          </a>
        )}
      </div>
    </div>
  );
}
