"use client";

import { useActiveSheetIndex } from "@/hooks/useActiveSheetIndex";
import { PROJECTS } from "@/data/projects";

export default function TitleBlockHeader() {
  const activeIndex = useActiveSheetIndex();

  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex items-start justify-between p-4 sm:p-6 pointer-events-none">
      <div className="font-display text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-linework/50">
        The Archive
        <span className="hidden sm:inline text-linework/25"> — DWG A-00</span>
      </div>

      <div className="font-display text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-linework/50 tabular-nums">
        {activeIndex !== null
          ? `Sheet ${String(activeIndex + 1).padStart(2, "0")} / ${String(
              PROJECTS.length
            ).padStart(2, "0")}`
          : ""}
      </div>
    </div>
  );
}
