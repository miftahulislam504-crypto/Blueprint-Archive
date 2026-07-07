"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/utils/gsap";
import { useIntroState } from "@/hooks/useIntroState";
import { useProjectSelection } from "@/hooks/useProjectSelection";
import { PROJECTS } from "@/data/projects";
import { SHEET_TRANSFORMS, COVER_Z, DESK_Z } from "@/scenes/sheetLayout";

/**
 * BlueprintCameraRig — one continuous camera path down the corridor.
 *
 * Flow: Cover sheet (close-up, pulls back) → the archive itself (visits
 * each sheet in turn, scroll-driven) → the instrument desk (pulls back to
 * reveal the full particle field).
 *
 * Waypoints anchor to real section IDs so positions don't shift if a
 * section's height changes — same reasoning as CIVION's WorldCameraRig.
 * Sheet waypoints reuse the exact cameraPosition/cameraLookAt computed in
 * sheetLayout.ts, so the rig and the rendered sheets can never disagree
 * about where a sheet actually is.
 */

const PATH_PRE_START = new THREE.Vector3(0, 1.2, COVER_Z + 5);

type Waypoint = {
  pos: THREE.Vector3;
  lookAt: THREE.Vector3;
  anchorId: string;
  anchorFraction: number;
};

const COVER_WAYPOINTS: Waypoint[] = [
  {
    pos: new THREE.Vector3(0, 0.4, COVER_Z + 2.2),
    lookAt: new THREE.Vector3(0, 0.2, COVER_Z),
    anchorId: "cover",
    anchorFraction: 0.15,
  },
  {
    pos: new THREE.Vector3(0, 1.1, COVER_Z + 4.5),
    lookAt: new THREE.Vector3(0, 0.1, COVER_Z - 2),
    anchorId: "cover",
    anchorFraction: 0.92,
  },
];

const SHEET_WAYPOINTS: Waypoint[] = PROJECTS.map((_, i) => ({
  pos: SHEET_TRANSFORMS[i].cameraPosition,
  lookAt: SHEET_TRANSFORMS[i].cameraLookAt,
  anchorId: `sheet-${i}`,
  anchorFraction: 0.5,
}));

const DESK_WAYPOINTS: Waypoint[] = [
  {
    pos: new THREE.Vector3(0, 0.6, DESK_Z + 6),
    lookAt: new THREE.Vector3(0, 0, DESK_Z),
    anchorId: "desk",
    anchorFraction: 0.1,
  },
  {
    pos: new THREE.Vector3(0, 3.4, DESK_Z + 9),
    lookAt: new THREE.Vector3(0, 0, DESK_Z),
    anchorId: "desk",
    anchorFraction: 0.9,
  },
];

const WAYPOINTS: Waypoint[] = [
  ...COVER_WAYPOINTS,
  ...SHEET_WAYPOINTS,
  ...DESK_WAYPOINTS,
];

const ARRIVAL_DURATION = 2.4;
const PARALLAX_STRENGTH = new THREE.Vector2(1.4, 0.9);
const LOOK_SMOOTHING = 0.07;

const positionCurve = new THREE.CatmullRomCurve3(
  WAYPOINTS.map((w) => w.pos),
  false,
  "catmullrom",
  0.35
);

const lookAtCurve = new THREE.CatmullRomCurve3(
  WAYPOINTS.map((w) => w.lookAt),
  false,
  "catmullrom",
  0.35
);

function resolveWaypointFractions(): number[] {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) {
    return WAYPOINTS.map((_, i) => i / (WAYPOINTS.length - 1));
  }
  return WAYPOINTS.map((w, i) => {
    const el = document.getElementById(w.anchorId);
    if (!el) return i / (WAYPOINTS.length - 1);
    const sectionStart = el.offsetTop;
    const sectionHeight = el.offsetHeight;
    const target = sectionStart + sectionHeight * w.anchorFraction;
    return THREE.MathUtils.clamp(target / docHeight, 0, 1);
  });
}

function scrollFractionToCurveT(
  scrollFraction: number,
  waypointFractions: number[]
): number {
  const segments = waypointFractions.length - 1;
  for (let i = 0; i < segments; i++) {
    const a = waypointFractions[i];
    const b = waypointFractions[i + 1];
    if (scrollFraction >= a && scrollFraction <= b) {
      const localT = b > a ? (scrollFraction - a) / (b - a) : 0;
      return (i + localT) / segments;
    }
  }
  return scrollFraction <= waypointFractions[0] ? 0 : 1;
}

export default function BlueprintCameraRig() {
  const { camera, pointer } = useThree();
  const { introDone } = useIntroState();
  const { selected } = useProjectSelection();

  const scrollFraction = useRef(0);
  const waypointFractions = useRef<number[]>(
    WAYPOINTS.map((_, i) => i / (WAYPOINTS.length - 1))
  );

  const currentLook = useRef(new THREE.Vector3(0, 0, 0));
  const scrollDrivenPos = useRef(new THREE.Vector3());
  const scrollDrivenLook = useRef(new THREE.Vector3());
  const scrollOrIntroPos = useRef(new THREE.Vector3());
  const parallaxOffset = useRef(new THREE.Vector3());

  const arrival = useRef(0);
  const focus = useRef(0);
  const focusTarget = useRef(new THREE.Vector3());
  const focusLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    const obj = { t: focus.current };
    const tween = gsap.to(obj, {
      t: selected ? 1 : 0,
      duration: selected ? 1.5 : 1.3,
      ease: "power3.inOut",
      onUpdate: () => {
        focus.current = obj.t;
      },
    });

    if (selected) {
      const idx = PROJECTS.findIndex((p) => p.id === selected.id);
      const t = idx >= 0 ? SHEET_TRANSFORMS[idx] : null;
      if (t) {
        // Tour position already sits at sheet_z + 3.4 (in front of the
        // sheet, along the corridor's direction of travel) — closing in
        // for inspection means *shrinking* that gap, i.e. subtracting
        // here, not adding, or the "zoom in" click would instead pull the
        // camera further away from the sheet.
        focusTarget.current.copy(t.cameraPosition).setZ(t.cameraPosition.z - 0.8);
        focusLookAt.current.copy(t.cameraLookAt);
      }
    }

    return () => {
      tween.kill();
    };
  }, [selected]);

  useEffect(() => {
    const resolve = () => {
      waypointFractions.current = resolveWaypointFractions();
    };
    const timer = setTimeout(resolve, 100);
    window.addEventListener("resize", resolve);

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onRefresh: resolve,
      onUpdate: (self) => {
        scrollFraction.current = self.progress;
      },
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resolve);
      trigger.kill();
    };
  }, []);

  useEffect(() => {
    if (!introDone) return;
    const obj = { t: 0 };
    const tween = gsap.to(obj, {
      t: 1,
      duration: ARRIVAL_DURATION,
      ease: "power2.inOut",
      onUpdate: () => {
        arrival.current = obj.t;
      },
    });
    return () => {
      tween.kill();
    };
  }, [introDone]);

  useFrame(() => {
    const curveT = scrollFractionToCurveT(
      scrollFraction.current,
      waypointFractions.current
    );

    positionCurve.getPoint(curveT, scrollDrivenPos.current);
    lookAtCurve.getPoint(curveT, scrollDrivenLook.current);

    scrollOrIntroPos.current
      .copy(PATH_PRE_START)
      .lerp(scrollDrivenPos.current, arrival.current);

    camera.position.lerpVectors(
      scrollOrIntroPos.current,
      focusTarget.current,
      focus.current
    );

    parallaxOffset.current.set(
      pointer.x * PARALLAX_STRENGTH.x,
      pointer.y * PARALLAX_STRENGTH.y,
      0
    );

    const baseLook = scrollDrivenLook.current
      .clone()
      .add(parallaxOffset.current.multiplyScalar(1 - focus.current));

    currentLook.current.lerp(
      focus.current > 0.5 ? focusLookAt.current : baseLook,
      LOOK_SMOOTHING
    );

    camera.lookAt(currentLook.current);
  });

  return null;
}
