'use client';

import { CategoryGridIsland } from './CategoryGridIsland';

interface ExperienceIslandProps {
  position?: [number, number, number];
}

const EXPERIENCE_CATEGORIES = [
  'Work Experience',
  'Internship',
  'Freelancing',
  'Automation Projects',
  'Case Studies',
];

export function ExperienceIsland({ position = [0, 0.5, -18] }: ExperienceIslandProps) {
  return (
    <CategoryGridIsland
      position={position}
      title="Crystal Laboratory"
      subtitle="Category structure is ready — add your actual experience here."
      categories={EXPERIENCE_CATEGORIES}
    />
  );
}
