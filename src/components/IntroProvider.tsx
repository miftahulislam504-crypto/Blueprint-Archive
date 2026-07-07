"use client";

import { useState } from "react";
import { IntroContext } from "@/hooks/useIntroState";

export default function IntroProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <IntroContext.Provider value={{ introDone, setIntroDone }}>
      {children}
    </IntroContext.Provider>
  );
}
