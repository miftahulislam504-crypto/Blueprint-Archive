import * as THREE from "three";
import { PROJECTS } from "@/data/projects";

/**
 * The archive is now ONE continuous wall of blueprint paper running along
 * -Z, not a corridor of independent floating rectangles — Igloo's case
 * study describes their portfolio section as "a frozen landscape where
 * each project sits", which is the piece the original build missed: many
 * unique ice blocks, yes, but all features of one connected environment,
 * not scattered objects with gaps of void between them. Every project
 * here is a panel — a segment of length PANEL_LENGTH — along that one
 * ribbon, and the cover sheet is simply the ribbon's first panel rather
 * than a separate object.
 *
 * Kept as plain data (not JSX) so BlueprintCameraRig, ArchiveRibbon, and
 * RibbonPanel can all build from the exact same numbers — three
 * independently hand-tuned copies of this layout would drift out of sync
 * the moment any one of them changed.
 */

export const RIBBON_X = 0; // the wall's fixed world-X position
export const PANEL_LENGTH = 6.4;
export const CAMERA_X_OFFSET = 3.4; // how far the camera flies from the wall
export const CAMERA_Y_LIFT = 0.4;

export const COVER_Z = 4; // the cover panel's center

export type PanelTransform = {
  z: number;
  y: number; // subtle per-panel vertical drift, purely for rhythm
  cameraPosition: THREE.Vector3;
  cameraLookAt: THREE.Vector3;
};

export function computePanelTransform(
  index: number,
  baseZ: number
): PanelTransform {
  const z = baseZ - index * PANEL_LENGTH;
  const y = 0.18 * Math.sin(index * 1.7);
  const cameraPosition = new THREE.Vector3(
    RIBBON_X + CAMERA_X_OFFSET,
    y + CAMERA_Y_LIFT,
    z
  );
  const cameraLookAt = new THREE.Vector3(RIBBON_X, y, z);
  return { z, y, cameraPosition, cameraLookAt };
}

const PROJECTS_START_Z = COVER_Z - PANEL_LENGTH; // first project panel, right after the cover

export const PANEL_TRANSFORMS: PanelTransform[] = PROJECTS.map((_, i) =>
  computePanelTransform(i, PROJECTS_START_Z)
);

export const COVER_TRANSFORM: PanelTransform = computePanelTransform(0, COVER_Z);

export const DESK_Z =
  PROJECTS_START_Z - PROJECTS.length * PANEL_LENGTH - 6;

// The ribbon itself spans a bit of margin past the first and last panel,
// then tapers off before the instrument desk — the paper trail ending
// where the desk's particle space begins, rather than running underneath
// it.
export const RIBBON_START_Z = COVER_Z + PANEL_LENGTH * 0.7;
export const RIBBON_END_Z =
  PROJECTS_START_Z - PROJECTS.length * PANEL_LENGTH + PANEL_LENGTH * 0.3;
export const RIBBON_LENGTH = RIBBON_START_Z - RIBBON_END_Z;
export const RIBBON_CENTER_Z = (RIBBON_START_Z + RIBBON_END_Z) / 2;
