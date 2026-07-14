'use client';

interface MoonConfig {
  position: [number, number, number];
  radius?: number;
  color?: string;
  emissiveIntensity?: number;
}

interface MoonsProps {
  moons?: MoonConfig[];
}

const DEFAULT_MOONS: MoonConfig[] = [
  { position: [-28, 20, -38], radius: 4.5, color: '#D8D3F0', emissiveIntensity: 0.35 },
  { position: [35, 13, -45], radius: 2.6, color: '#F0E4D8', emissiveIntensity: 0.3 },
];

/**
 * Fixed points around 50-60 units out — well inside AuroraSky's radius-80
 * backdrop and Nebula's 75 — so ordinary depth testing puts them in front
 * of both automatically. No special render-order handling needed here the
 * way Nebula needs (these are plain opaque spheres, not a translucent
 * overlay), and it's well beyond CameraRig's own travel range (camera
 * never gets more than ~28 units from the origin along the journey), so
 * there's no risk of ever flying close enough to one of these for the
 * fixed size/lack of detail to be noticeable.
 *
 * A handful of hand-placed bodies rather than a seeded scatter — there
 * are only ever one or two of these, and exactly where they sit is more
 * of an art-direction choice than something worth randomizing.
 */
export function Moons({ moons = DEFAULT_MOONS }: MoonsProps) {
  return (
    <>
      {moons.map((moon, i) => (
        <mesh key={i} position={moon.position}>
          <sphereGeometry args={[moon.radius ?? 4, 24, 24]} />
          <meshStandardMaterial
            color={moon.color ?? '#D8D3F0'}
            emissive={moon.color ?? '#D8D3F0'}
            emissiveIntensity={moon.emissiveIntensity ?? 0.3}
            roughness={1}
            metalness={0}
          />
        </mesh>
      ))}
    </>
  );
}
