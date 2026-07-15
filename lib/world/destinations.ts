export interface Destination {
  id: string;
  label: string;
  labelBn: string;
  /** World-space XZ, matching CameraRig's WAYPOINTS and MiniMap's ISLANDS. */
  x: number;
  z: number;
  /** Full [x, y, z], used for the 'explore' mode teleport (drops the
   *  avatar in place rather than just on the flat XZ plane). */
  position: [number, number, number];
  /** Position along CameraRig's CatmullRomCurve3 (0 to 1), i.e. index /
   *  (count - 1) — matches WAYPOINTS order exactly since curve.getPointAt(t)
   *  is what 'scroll' mode camera position is actually driven by. */
  t: number;
}

// Kept in the same order/positions as CameraRig's WAYPOINTS and MiniMap's
// ISLANDS — all three need to agree on where each named place actually is.
// If a real waypoint position changes there, mirror it here too.
export const DESTINATIONS: Destination[] = [
  { id: 'hero', label: 'Hero', labelBn: 'হোম', x: 0, z: 0, position: [0, 0, 6], t: 0 },
  { id: 'about', label: 'About', labelBn: 'পরিচিতি', x: 4, z: 0, position: [4, 0.5, 3], t: 1 / 8 },
  { id: 'skills', label: 'Skills', labelBn: 'দক্ষতা', x: 8, z: -3, position: [8, -0.5, 0], t: 2 / 8 },
  { id: 'projects', label: 'Projects', labelBn: 'প্রজেক্ট', x: 10, z: -8, position: [10, 1, -5], t: 3 / 8 },
  { id: 'timeline', label: 'Timeline', labelBn: 'টাইমলাইন', x: 8, z: -10, position: [8, 0, -10], t: 4 / 8 },
  { id: 'achievement', label: 'Achievement', labelBn: 'অর্জন', x: 4, z: -14, position: [4, -1, -14], t: 5 / 8 },
  { id: 'experience', label: 'Experience', labelBn: 'অভিজ্ঞতা', x: 0, z: -18, position: [0, 0.5, -18], t: 6 / 8 },
  { id: 'blog', label: 'Blog', labelBn: 'ব্লগ', x: -4, z: -22, position: [-4, 0, -22], t: 7 / 8 },
  { id: 'contact', label: 'Contact', labelBn: 'যোগাযোগ', x: 0, z: -26, position: [0, 0, -26], t: 1 },
];

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}
