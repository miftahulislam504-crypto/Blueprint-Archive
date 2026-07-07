"use client";

import { createContext, useContext } from "react";

type IntroState = {
  introDone: boolean;
  setIntroDone: (value: boolean) => void;
};

export const IntroContext = createContext<IntroState>({
  introDone: false,
  setIntroDone: () => {},
});

export function useIntroState() {
  return useContext(IntroContext);
}
