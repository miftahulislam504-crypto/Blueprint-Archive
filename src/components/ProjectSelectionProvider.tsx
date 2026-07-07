"use client";

import { useCallback, useState } from "react";
import { ProjectSelectionContext } from "@/hooks/useProjectSelection";
import { useLenis } from "@/hooks/useLenis";
import type { ArchiveProject } from "@/data/projects";

/**
 * Selecting a sheet temporarily takes over the camera (see
 * BlueprintCameraRig) and shows a detail card — scroll needs to be locked
 * during that, the same way CoverSheetLoader locks scroll during the boot
 * sequence, otherwise the user could scroll the page while the camera is
 * mid-flight into a sheet, fighting the zoom transition.
 */
export default function ProjectSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selected, setSelected] = useState<ArchiveProject | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const lenis = useLenis();

  const select = useCallback(
    (project: ArchiveProject, index: number) => {
      setSelected(project);
      setSelectedIndex(index);
      lenis?.stop();
    },
    [lenis]
  );

  const close = useCallback(() => {
    setSelected(null);
    setSelectedIndex(null);
    lenis?.start();
  }, [lenis]);

  return (
    <ProjectSelectionContext.Provider
      value={{ selected, selectedIndex, select, close }}
    >
      {children}
    </ProjectSelectionContext.Provider>
  );
}
