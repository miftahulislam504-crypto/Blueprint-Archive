"use client";

import { createContext, useContext } from "react";
import type { ArchiveProject } from "@/data/projects";

/**
 * Selecting a sheet needs to affect two places that don't otherwise talk
 * to each other: BlueprintCameraRig (deep inside the Canvas, redirects the
 * camera to that sheet) and the DOM detail card (outside the Canvas, shows
 * the project's title-block text). Context avoids prop-drilling the
 * selection through ArchiveScene's JSX into the Canvas tree.
 */
export type ProjectSelectionState = {
  selected: ArchiveProject | null;
  selectedIndex: number | null;
  select: (project: ArchiveProject, index: number) => void;
  close: () => void;
};

export const ProjectSelectionContext = createContext<ProjectSelectionState>({
  selected: null,
  selectedIndex: null,
  select: () => {},
  close: () => {},
});

export function useProjectSelection() {
  return useContext(ProjectSelectionContext);
}
