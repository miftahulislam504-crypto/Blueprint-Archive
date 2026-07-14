'use client';

import { Html } from '@react-three/drei';

interface CategoryGridIslandProps {
  position: [number, number, number];
  title: string;
  subtitle: string;
  categories: string[];
  width?: number;
}

/**
 * Shared by BlogIsland, AchievementIsland, and ExperienceIsland — all three
 * are structurally the same thing (a title, a subtitle, and a grid of
 * category chips), just with different content. Extracted here rather than
 * writing the same glassmorphic card markup a third and fourth time.
 */
export function CategoryGridIsland({
  position,
  title,
  subtitle,
  categories,
  width = 340,
}: CategoryGridIslandProps) {
  return (
    <Html position={position} transform occlude distanceFactor={4}>
      <div
        style={{
          width,
          padding: 24,
          borderRadius: 16,
          background: 'rgba(20, 15, 45, 0.55)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(92, 225, 255, 0.35)',
          color: '#e8e6ff',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 0 40px rgba(75, 63, 158, 0.4)',
        }}
      >
        <h2 style={{ margin: '0 0 4px', color: '#5CE1FF', fontSize: 20 }}>{title}</h2>
        <p style={{ margin: '0 0 16px', fontSize: 12, opacity: 0.65 }}>{subtitle}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {categories.map((cat) => (
            <div
              key={cat}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(92, 225, 255, 0.08)',
                border: '1px solid rgba(92, 225, 255, 0.2)',
                fontSize: 13,
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>
    </Html>
  );
}
