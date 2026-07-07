"use client";

import { useState } from "react";
import { InstrumentHoverContext } from "@/hooks/useInstrumentHover";
import type { InstrumentShapeId } from "@/scenes/targetShapes";

export default function InstrumentHoverProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState<InstrumentShapeId | null>(null);

  return (
    <InstrumentHoverContext.Provider value={{ hovered, setHovered }}>
      {children}
    </InstrumentHoverContext.Provider>
  );
}
