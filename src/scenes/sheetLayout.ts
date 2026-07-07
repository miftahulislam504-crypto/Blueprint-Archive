import * as THREE from "three";
import { PROJECTS } from "@/data/projects";

/**
 * The archive is a corridor, not a grid: sheets alternate left/right,
 * receding into -Z as you go deeper, so scrolling reads as walking down a
 * gallery rather than panning across a wall. Kept as plain data (not JSX)
 * so BlueprintCameraRig can build its waypoint curve from the exact same
 * numbers ArchiveSheets renders from — two independently-hand-tuned
 * copies of this layout would drift out of sync the first time either
 * changed.
 */

export const SPACING_Z = 6.4;
export const SIDE_OFFSET = 2.5;
export const CORRIDOR_START_Z = -9; // first sheet's Z, past the cover sheet

export type SheetTransform = {
  position: [number, number, number];
  rotationY: number;
  cameraPosition: THREE.Vector3;
  cameraLookAt: THREE.Vector3;
};

export function computeSheetTransform(index: number): SheetTransform {
  const side = index % 2 === 0 ? -1 : 1;
  const x = side * SIDE_OFFSET;
  const y = 0.25 * Math.sin(index * 1.7);
  const z = CORRIDOR_START_Z - index * SPACING_Z;
  const rotationY = side * -0.36;

  const cameraPosition = new THREE.Vector3(
    x - side * 1.5,
    y + 0.35,
    z + 3.4
  );
  const cameraLookAt = new THREE.Vector3(x, y, z);

  return { position: [x, y, z], rotationY, cameraPosition, cameraLookAt };
}

export const SHEET_TRANSFORMS: SheetTransform[] = PROJECTS.map((_, i) =>
  computeSheetTransform(i)
);

export const COVER_Z = 4;
export const DESK_Z =
  CORRIDOR_START_Z - PROJECTS.length * SPACING_Z - 7;
