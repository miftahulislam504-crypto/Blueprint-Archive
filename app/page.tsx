'use client';

import { useState } from 'react';
import { OrbitControls, Stars, Stats } from '@react-three/drei';
import CrystalCore from '@/components/crystals/CrystalCore';
import { WorldCanvas } from '@/components/world/WorldCanvas';
import { CameraRig } from '@/components/world/CameraRig';
import { LightingRig } from '@/components/world/LightingRig';
import { EnvironmentLighting } from '@/components/world/EnvironmentLighting';
import { ScrollSpacer } from '@/components/world/ScrollSpacer';
import { AuroraSky } from '@/components/world/AuroraSky';
import { Nebula } from '@/components/world/Nebula';
import { VolumetricClouds } from '@/components/world/VolumetricClouds';
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
import { TreasureChest } from '@/components/world/TreasureChest';
import { DistanceCull } from '@/components/world/DistanceCull';
import { lodDetail, lodCount } from '@/lib/world/lod';
import { HUD } from '@/components/ui/HUD';
import { TouchJoystick } from '@/components/ui/TouchJoystick';
import { AudioManager } from '@/components/audio/AudioManager';
import { PlayerAvatar } from '@/components/world/PlayerAvatar';
import { AvatarPrefetch } from '@/components/world/AvatarPrefetch';
import { MiniMapTracker } from '@/components/world/MiniMapTracker';
import { MiniMap } from '@/components/ui/MiniMap';
import { KeyboardMovementListener } from '@/components/input/KeyboardMovementListener';
import { TeleportController } from '@/components/world/TeleportController';
import { TeleportPortal } from '@/components/ui/TeleportPortal';
import { DevConsoleTrigger } from '@/components/ui/DevConsoleTrigger';
import { DevConsole } from '@/components/ui/DevConsole';
import { MiniGame } from '@/components/ui/MiniGame';
import { AchievementToast } from '@/components/ui/AchievementToast';
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
  // Hidden Secrets overlays — plain local state rather than useWorldStore,
  // since nothing outside this component tree needs to read "is the
  // console open" (unlike teleportTarget, which TeleportController inside
  // the Canvas needs to react to).
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);

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
        {/* Adds real IBL reflections/ambient fill for every crystal/rock
            material's metalness+roughness — see the component's own
            comment for why this covers both "HDRI" and "GI" from the
            roadmap on this project's WebGL rendering path. No-ops on
            'low' tier. */}
        <EnvironmentLighting />
        <CameraRig />
        {/* Tracks the camera regardless of cameraMode — feeds MiniMap,
            a DOM overlay outside this Canvas. */}
        <MiniMapTracker />
        {/* Reacts to teleportTarget requests from TeleportPortal below —
            doesn't render anything itself. */}
        <TeleportController />
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
        {/* Sits just inside Nebula (radius 68 vs Nebula's 75) — same
            opaque-before-transparent draw-order trick, see Nebula's own
            comment. Skipped on 'low' for the same reason SSAO/DOF are in
            Effects.tsx: an extra full-screen alpha-blended shader pass
            is real fragment-shader cost on exactly the phones most
            likely to be tier 'low'. */}
        {quality !== 'low' && <VolumetricClouds />}
        <Moons />
        <Meteors />
        <Stars radius={60} depth={40} count={quality === 'low' ? 1500 : 4000} factor={3} fade speed={0.5} />

        {/* Auto-cycles clear/crystalRain/mistVeil on its own schedule —
            see WeatherSystem for the sequence. */}
        <WeatherSystem />

        <FloatingIsland position={HERO_ISLAND_CENTER} radius={2} seed={1} detail={lodDetail(1, quality)} />
        <CrystalScatter
          center={HERO_ISLAND_CENTER}
          radius={2.2}
          seed={1}
          count={lodCount(24, quality)}
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
        {/* DistanceCull radii are generous relative to each group's own
            visual radius (see DistanceCull's own comment on why this is
            the practical occlusion-culling equivalent here) — camera
            positions and travel speed are estimates, not measured, so
            erring toward "unmounts a bit later than strictly necessary"
            is the safer direction than having something visibly pop out. */}
        <DistanceCull center={[-14, -6]} radius={22}>
          <CrystalMountain position={[-14, -2, -6]} radius={7} seed={5} />
          {/* Built from CrystalMountain chunks clustered around a gap — no
              CSG library here to cut a literal hole. Tucked near the west
              mountain (comfortable ~10-unit clearance from its center, given
              its own radius 7), mouth rotated to face back toward the path. */}
          <Cave position={[-7, -2, 1]} rotationY={Math.PI / 2} size={1.3} seed={41} />
          {/* Hidden Secrets: tucked ~70% of the way down Cave's tunnel,
              along its actual receding direction (local -Z rotated by
              Cave's own rotationY=PI/2, which points toward world -X here —
              see the placement derivation in project notes). Rotated to
              roughly face back toward the tunnel mouth, y nudged down to
              rest on the tunnel floor rather than float mid-air.
              Kept inside the same DistanceCull as the mountain/cave it's
              physically nested in — culling the chest independently would
              risk it vanishing while the cave walls around it stay put. */}
          <TreasureChest
            position={[-9.9, -2.25, 1]}
            rotationY={Math.PI / 2}
            onLaunchGame={() => setGameOpen(true)}
          />
        </DistanceCull>

        <DistanceCull center={[19, -14]} radius={18}>
          <CrystalMountain position={[19, 1, -14]} radius={5.5} seed={8} />
        </DistanceCull>

        <DistanceCull center={[0, 3]} radius={16}>
          <CrystalForest center={[0, -2, 3]} radius={3} count={lodCount(5, quality)} seed={2} />
          <Firefly center={[0, -1.5, 3]} radius={2.5} seed={53} />
        </DistanceCull>

        <CrystalRiver waypoints={RIVER_WAYPOINTS} />

        {/* Both models sat unused in public/models until now. Positions
            fill the two stretches of the journey that had no background
            scenery at all — near the mountain past ExperienceIsland, and
            just off to the side of the Timeline bridge. First pass, like
            the mountains/river above — nudge once actually seen rendered. */}
        <DistanceCull center={[9, -19]} radius={16}>
          <EnergyTower position={[9, -2, -19]} height={3.6} rotationY={0.4} />
          <Sparkle center={[9, -0.5, -19]} radius={2} count={30} seed={54} />
        </DistanceCull>
        <DistanceCull center={[-6, -11]} radius={14}>
          <AncientRuins position={[-6, -2.5, -11]} height={2.8} rotationY={-0.3} />
        </DistanceCull>

        {/* Drift well above the ground-level landmarks above (Hero sits at
            y=-2.5, About at 0.5, Projects at 1, Experience/Blog/Contact
            around 0) so these read as overhead depth rather than clutter
            near the islands/HTML panels themselves. */}
        <DistanceCull center={[3, 1]} radius={12}>
          <FloatingPlatforms center={[3, 2.5, 1]} radius={5} count={lodCount(8, quality)} seed={31} />
        </DistanceCull>
        <DistanceCull center={[9, -6]} radius={13}>
          <FloatingPlatforms center={[9, 3, -6]} radius={6} count={lodCount(10, quality)} seed={32} />
        </DistanceCull>
        <DistanceCull center={[-2, -20]} radius={13}>
          <FloatingPlatforms center={[-2, 2, -20]} radius={6} count={lodCount(9, quality)} seed={33} />
        </DistanceCull>

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
      {/* Idle-timeout half of the avatar's smart-prefetch strategy — see
          the component's own comment. The other half (pointer/touch on
          HUD's walk-mode button) is wired inside HUD itself. */}
      <AvatarPrefetch />
      {showMiniMap && <MiniMap />}
      <TeleportPortal />
      <AchievementToast />
      {/* Always mounted (backtick key / mobile corner-tap should work from
          anywhere), independent of consoleOpen so it keeps listening even
          while the console itself is closed. */}
      <DevConsoleTrigger onOpen={() => setConsoleOpen(true)} />
      {consoleOpen && (
        <DevConsole
          onClose={() => setConsoleOpen(false)}
          onLaunchGame={() => {
            setConsoleOpen(false);
            setGameOpen(true);
          }}
        />
      )}
      {gameOpen && <MiniGame onClose={() => setGameOpen(false)} />}
      {cameraMode === 'explore' && (
        <>
          <TouchJoystick />
          <KeyboardMovementListener />
        </>
      )}
    </>
  );
}
