'use client';

import { OrbitControls, Stars, Stats } from '@react-three/drei';
import CrystalCore from '@/components/crystals/CrystalCore';
import { WorldCanvas } from '@/components/world/WorldCanvas';
import { CameraRig } from '@/components/world/CameraRig';
import { LightingRig } from '@/components/world/LightingRig';
import { ScrollSpacer } from '@/components/world/ScrollSpacer';
import { AuroraSky } from '@/components/world/AuroraSky';
import { Nebula } from '@/components/world/Nebula';
import { Moons } from '@/components/world/Moons';
import { Meteors } from '@/components/world/Meteors';
import { WeatherSystem } from '@/components/world/WeatherSystem';
import { FloatingIsland } from '@/components/world/FloatingIsland';
import { CrystalScatter } from '@/components/world/CrystalScatter';
import { AboutIsland } from '@/components/islands/AboutIsland';
import { HeroIsland } from '@/components/islands/HeroIsland';
import { SkillsIsland } from '@/components/islands/SkillsIsland';
import { ProjectsIsland } from '@/components/islands/ProjectsIsland';
import { BlogIsland } from '@/components/islands/BlogIsland';
import { ContactIsland } from '@/components/islands/ContactIsland';
import { TimelineIsland } from '@/components/islands/TimelineIsland';
import { AchievementIsland } from '@/components/islands/AchievementIsland';
import { ExperienceIsland } from '@/components/islands/ExperienceIsland';
import { CrystalMountain } from '@/components/world/CrystalMountain';
import { Cave } from '@/components/world/Cave';
import { CrystalForest } from '@/components/world/CrystalForest';
import { CrystalRiver } from '@/components/world/CrystalRiver';
import { EnergyTower } from '@/components/world/EnergyTower';
import { AncientRuins } from '@/components/world/AncientRuins';
import { FloatingPlatforms } from '@/components/world/FloatingPlatforms';
import { Dust } from '@/components/world/Dust';
import { Sparkle } from '@/components/world/Sparkle';
import { Firefly } from '@/components/world/Firefly';
import { HUD } from '@/components/ui/HUD';
import { TouchJoystick } from '@/components/ui/TouchJoystick';
import { AudioManager } from '@/components/audio/AudioManager';
import { PlayerAvatar } from '@/components/world/PlayerAvatar';
import { MiniMapTracker } from '@/components/world/MiniMapTracker';
import { MiniMap } from '@/components/ui/MiniMap';
import { KeyboardMovementListener } from '@/components/input/KeyboardMovementListener';
import { useWorldStore } from '@/stores/useWorldStore';

const HERO_ISLAND_CENTER: [number, number, number] = [0, -2.5, 0];

// Bridge connects the Projects waypoint through Timeline to Achievement —
// matches CameraRig's own waypoints 3/4/5 so the bridge and the camera
// path agree on where "Timeline" actually is.
const BRIDGE_WAYPOINTS: [number, number, number][] = [
  [10, 1, -5],
  [9, 0.5, -7.5],
  [8, 0, -10],
  [6, -0.5, -12],
  [4, -1, -14],
];

// Loosely follows the general direction of the camera/island journey, but
// lower (rivers sit in valleys) — a first pass, adjust once real terrain
// exists to route it through properly.
const RIVER_WAYPOINTS: [number, number, number][] = [
  [-2, -4, 4],
  [2, -4, 1],
  [6, -3.5, -2],
  [9, -3, -6],
  [11, -2.5, -10],
];

export default function Home() {
  const quality = useWorldStore((s) => s.qualityTier);
  const qualityDetected = useWorldStore((s) => s.qualityDetected);
  const cameraMode = useWorldStore((s) => s.cameraMode);
  const showStats = useWorldStore((s) => s.showStats);
  const showMiniMap = useWorldStore((s) => s.showMiniMap);

  // WorldCanvas creates its WebGL context on mount, and options like
  // antialias can't be changed after that context exists — so we hold off
  // mounting it at all until detection has actually run once. detectQualityTier()
  // is synchronous, so this adds no perceptible delay in practice; it just
  // guarantees the context is only ever created with the real, final tier.
  if (!qualityDetected) return null;

  return (
    <>
      <WorldCanvas>
        <LightingRig />
        <CameraRig />
        {/* Tracks the camera regardless of cameraMode — feeds MiniMap,
            a DOM overlay outside this Canvas. */}
        <MiniMapTracker />
        {/* Only exists while cameraMode is 'explore' — CameraRig's own
            'explore' branch follows playerPosition regardless of whether
            this is mounted, but there's nothing for it to follow (beyond
            wherever the avatar last was) if this isn't. */}
        {cameraMode === 'explore' && <PlayerAvatar />}
        {/* Only takes over when cameraMode is 'orbit' — CameraRig bails out
            of driving the camera itself in that case, so the two don't fight. */}
        <OrbitControls enabled={cameraMode === 'orbit'} enablePan={false} />

        <AuroraSky />
        {/* Nebula is intentionally translucent (its material sets
            transparent:true, AuroraSky's doesn't) — three.js always draws
            the full opaque queue before the transparent one, so this
            composites over the aurora automatically no matter what order
            they're declared in here. */}
        <Nebula />
        <Moons />
        <Meteors />
        <Stars radius={60} depth={40} count={quality === 'low' ? 1500 : 4000} factor={3} fade speed={0.5} />

        {/* Auto-cycles clear/crystalRain/mistVeil on its own schedule —
            see WeatherSystem for the sequence. */}
        <WeatherSystem />

        <FloatingIsland position={HERO_ISLAND_CENTER} radius={2} seed={1} />
        <CrystalScatter
          center={HERO_ISLAND_CENTER}
          radius={2.2}
          seed={1}
          count={quality === 'low' ? 12 : 24}
        />

        <CrystalCore quality={quality} />
        <HeroIsland />
        <Sparkle center={HERO_ISLAND_CENTER} radius={2.5} seed={51} />

        {/* Broad, subtle ambient field over the early-mid stretch — Dust
            is meant to be sprinkled wherever, this is just one example. */}
        <Dust center={[3, 0, -8]} radius={9} count={100} seed={52} />

        {/* Positions are each component's own defaults, chosen to sit near
            CameraRig's waypoints 1/2/3 — a first pass, not final blocking.
            Easiest to nudge after actually seeing it rendered. */}
        <AboutIsland />
        <SkillsIsland />
        <ProjectsIsland />

        {/* Remaining Phase 2 World Shell pieces — background mountains,
            a small forest near the Hero island, and a river winding
            beneath the journey. */}
        <CrystalMountain position={[-14, -2, -6]} radius={7} seed={5} />
        <CrystalMountain position={[19, 1, -14]} radius={5.5} seed={8} />

        {/* Built from CrystalMountain chunks clustered around a gap — no
            CSG library here to cut a literal hole. Tucked near the west
            mountain (comfortable ~10-unit clearance from its center, given
            its own radius 7), mouth rotated to face back toward the path. */}
        <Cave position={[-7, -2, 1]} rotationY={Math.PI / 2} size={1.3} seed={41} />

        <CrystalForest center={[0, -2, 3]} radius={3} count={5} seed={2} />
        <Firefly center={[0, -1.5, 3]} radius={2.5} seed={53} />
        <CrystalRiver waypoints={RIVER_WAYPOINTS} />

        {/* Both models sat unused in public/models until now. Positions
            fill the two stretches of the journey that had no background
            scenery at all — near the mountain past ExperienceIsland, and
            just off to the side of the Timeline bridge. First pass, like
            the mountains/river above — nudge once actually seen rendered. */}
        <EnergyTower position={[9, -2, -19]} height={3.6} rotationY={0.4} />
        <Sparkle center={[9, -0.5, -19]} radius={2} count={30} seed={54} />
        <AncientRuins position={[-6, -2.5, -11]} height={2.8} rotationY={-0.3} />

        {/* Drift well above the ground-level landmarks above (Hero sits at
            y=-2.5, About at 0.5, Projects at 1, Experience/Blog/Contact
            around 0) so these read as overhead depth rather than clutter
            near the islands/HTML panels themselves. */}
        <FloatingPlatforms center={[3, 2.5, 1]} radius={5} count={8} seed={31} />
        <FloatingPlatforms center={[9, 3, -6]} radius={6} count={10} seed={32} />
        <FloatingPlatforms center={[-2, 2, -20]} radius={6} count={9} seed={33} />

        <BlogIsland />
        <ContactIsland />
        <TimelineIsland waypoints={BRIDGE_WAYPOINTS} />
        <AchievementIsland />
        <ExperienceIsland />

        {/* Toggled from the HUD button bar below, not shown by default. */}
        {showStats && <Stats />}
      </WorldCanvas>

      {/* Lives outside the fixed Canvas — this is what actually makes the
          page scrollable, which is what Lenis/CameraRig respond to. */}
      <ScrollSpacer />

      {/* 2D DOM overlay, not 3D content — lives outside the Canvas same as ScrollSpacer. */}
      <HUD />
      <AudioManager />
      {showMiniMap && <MiniMap />}
      {cameraMode === 'explore' && (
        <>
          <TouchJoystick />
          <KeyboardMovementListener />
        </>
      )}
    </>
  );
}
