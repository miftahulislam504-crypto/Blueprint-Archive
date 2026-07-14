'use client';

import { CategoryGridIsland } from './CategoryGridIsland';

interface AchievementIslandProps {
  position?: [number, number, number];
}

const ACHIEVEMENT_CATEGORIES = [
  'Badges',
  'Awards',
  'Certificates',
  'Research',
  'Competition',
  'Medals',
];

export function AchievementIsland({ position = [4, -1, -14] }: AchievementIslandProps) {
  return (
    <CategoryGridIsland
      position={position}
      title="Crystal Museum"
      subtitle="Category structure is ready — add your actual achievements here."
      categories={ACHIEVEMENT_CATEGORIES}
    />
  );
}
