'use client';

import { CategoryGridIsland } from './CategoryGridIsland';

interface BlogIslandProps {
  position?: [number, number, number];
}

const BLOG_CATEGORIES = [
  'Research',
  'Articles',
  'Tutorials',
  'Engineering',
  'Technology',
  'Islamic Writing',
];

export function BlogIsland({ position = [-4, 0, -22] }: BlogIslandProps) {
  return (
    <CategoryGridIsland
      position={position}
      title="Crystal Library"
      subtitle="Category structure is ready — posts go here once you start writing."
      categories={BLOG_CATEGORIES}
    />
  );
}
