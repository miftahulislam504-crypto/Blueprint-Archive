"use client";

import RibbonPanel from "@/scenes/RibbonPanel";
import { PROJECTS } from "@/data/projects";
import { PANEL_TRANSFORMS } from "@/scenes/sheetLayout";
import { useProjectSelection } from "@/hooks/useProjectSelection";

export default function RibbonPanels() {
  const { select } = useProjectSelection();

  return (
    <>
      {PROJECTS.map((project, i) => (
        <RibbonPanel
          key={project.id}
          project={project}
          index={i}
          transform={PANEL_TRANSFORMS[i]}
          onSelect={select}
        />
      ))}
    </>
  );
}
