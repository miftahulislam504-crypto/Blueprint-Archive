"use client";

import ArchiveSheet from "@/scenes/ArchiveSheet";
import { PROJECTS } from "@/data/projects";
import { SHEET_TRANSFORMS } from "@/scenes/sheetLayout";
import { useProjectSelection } from "@/hooks/useProjectSelection";

export default function ArchiveSheets() {
  const { select } = useProjectSelection();

  return (
    <>
      {PROJECTS.map((project, i) => {
        const t = SHEET_TRANSFORMS[i];
        return (
          <ArchiveSheet
            key={project.id}
            project={project}
            index={i}
            position={t.position}
            rotationY={t.rotationY}
            onSelect={select}
          />
        );
      })}
    </>
  );
}
