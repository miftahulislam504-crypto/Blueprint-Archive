"use client";

import { createContext, useContext } from "react";
import type { InstrumentShapeId } from "@/scenes/targetShapes";

export type InstrumentHoverState = {
  hovered: InstrumentShapeId | null;
  setHovered: (id: InstrumentShapeId | null) => void;
};

export const InstrumentHoverContext = createContext<InstrumentHoverState>({
  hovered: null,
  setHovered: () => {},
});

export function useInstrumentHover() {
  return useContext(InstrumentHoverContext);
}
