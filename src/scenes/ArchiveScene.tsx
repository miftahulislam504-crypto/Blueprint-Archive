"use client";

import { Canvas } from "@react-three/fiber";
import BlueprintCameraRig from "@/scenes/BlueprintCameraRig";
import CoverSheet from "@/scenes/CoverSheet";
import ArchiveSheets from "@/scenes/ArchiveSheets";
import VoidField from "@/scenes/VoidField";
import InstrumentParticles from "@/scenes/InstrumentParticles";
import ArchiveEffects from "@/scenes/ArchiveEffects";
import { useQualityTier } from "@/hooks/useQualityTier";
import { ANCHOR_COUNT } from "@/scenes/targetShapes";

/**
 * The entire page lives inside ONE persistent Canvas, fixed behind the
 * scrolling HTML content — one void, one camera path (see
 * BlueprintCameraRig), same structural choice CIVION's WorldScene made
 * and for the same reason: a single continuous camera path only works
 * against a single continuous 3D world.
 */
export default function ArchiveScene() {
  const tier = useQualityTier();

  const voidCount = tier === "high" ? 900 : 350;
  const instrumentCount = tier === "high" ? ANCHOR_COUNT * 6 : ANCHOR_COUNT * 2;

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        dpr={tier === "low" ? 1 : [1, 1.5]}
        gl={{
          antialias: tier === "high",
          powerPreference: "high-performance",
        }}
      >
        <fog attach="fog" args={["#081826", 12, 46]} />
        <BlueprintCameraRig />

        <CoverSheet />
        <ArchiveSheets />
        <VoidField count={voidCount} />
        <InstrumentParticles count={instrumentCount} />

        {tier === "high" && <ArchiveEffects />}
      </Canvas>
    </div>
  );
}
