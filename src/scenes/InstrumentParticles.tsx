"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/utils/gsap";
import { useInstrumentHover } from "@/hooks/useInstrumentHover";
import {
  INSTRUMENT_SHAPES,
  ANCHOR_COUNT,
  type InstrumentShapeId,
} from "@/scenes/targetShapes";
import { mulberry32 } from "@/scenes/glyphs";
import { DESK_Z } from "@/scenes/sheetLayout";

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uMorph;
  attribute vec3 aHome;
  attribute vec3 aTarget;
  attribute float aSeed;
  varying float vMorph;

  void main() {
    vMorph = uMorph;

    float phase = uTime * 0.6 + aSeed * 6.2831;
    vec3 drift = vec3(
      sin(phase) * 0.18,
      cos(phase * 1.3) * 0.18,
      sin(phase * 0.7) * 0.12
    );
    vec3 swirlPos = aHome + drift * (1.0 - 0.6 * uMorph);
    vec3 finalPos = mix(swirlPos, aTarget, uMorph);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_PointSize = (2.4 + vMorph * 1.8) * (58.0 / max(0.001, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColorCool;
  uniform vec3 uColorWarm;
  varying float vMorph;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.1, d);
    vec3 color = mix(uColorCool, uColorWarm, vMorph);
    gl_FragColor = vec4(color, alpha * 0.85);
  }
`;

function buildJitteredTarget(shapeId: InstrumentShapeId, count: number): Float32Array {
  const anchors = INSTRUMENT_SHAPES[shapeId];
  const arr = new Float32Array(count * 3);
  const rand = mulberry32(count * 31 + shapeId.length);
  for (let i = 0; i < count; i++) {
    const [ax, ay, az] = anchors[i % ANCHOR_COUNT];
    const jitter = 0.035;
    arr[i * 3 + 0] = ax + (rand() - 0.5) * jitter;
    arr[i * 3 + 1] = ay + (rand() - 0.5) * jitter;
    arr[i * 3 + 2] = az + (rand() - 0.5) * jitter;
  }
  return arr;
}

export default function InstrumentParticles({ count }: { count: number }) {
  const { hovered } = useInstrumentHover();
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const home = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const rand = mulberry32(1234);

    for (let i = 0; i < count; i++) {
      // Point-in-sphere sampling for a soft swirl volume around the desk.
      let x = 0,
        y = 0,
        z = 0,
        lenSq = 0;
      do {
        x = (rand() - 0.5) * 2;
        y = (rand() - 0.5) * 2;
        z = (rand() - 0.5) * 2;
        lenSq = x * x + y * y + z * z;
      } while (lenSq > 1 || lenSq === 0);
      const r = 1.35;
      home[i * 3 + 0] = x * r;
      home[i * 3 + 1] = y * r * 0.7;
      home[i * 3 + 2] = z * r * 0.6;
      seed[i] = rand();
    }

    const initialTarget = buildJitteredTarget("compass", count);
    target.set(initialTarget);

    geo.setAttribute("aHome", new THREE.BufferAttribute(home, 3));
    geo.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    // Three's renderer expects a "position" attribute for bounding-sphere
    // computation even though the shader itself reads aHome/aTarget.
    geo.setAttribute("position", new THREE.BufferAttribute(home.slice(), 3));
    return geo;
  }, [count]);

  const targetCache = useMemo(() => {
    const cache: Partial<Record<InstrumentShapeId, Float32Array>> = {};
    return cache;
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uColorCool: { value: new THREE.Color("#cfe8f3") },
        uColorWarm: { value: new THREE.Color("#c9a15f") },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  // Hover-driven morph: dissolve to swirl, swap the target buffer, then
  // reassemble into the newly-hovered shape — this is what lets switching
  // directly from one link to another still read as "reforming into
  // something else" rather than teleporting.
  useEffect(() => {
    const tl = gsap.timeline();
    const mat = material;

    const applyTarget = (shapeId: InstrumentShapeId) => {
      if (!targetCache[shapeId]) {
        targetCache[shapeId] = buildJitteredTarget(shapeId, count);
      }
      const attr = geometry.getAttribute("aTarget") as THREE.BufferAttribute;
      attr.array.set(targetCache[shapeId]!);
      attr.needsUpdate = true;
    };

    if (hovered === null) {
      tl.to(mat.uniforms.uMorph, {
        value: 0,
        duration: 0.55,
        ease: "power2.inOut",
      });
    } else if (mat.uniforms.uMorph.value > 0.05) {
      tl.to(mat.uniforms.uMorph, {
        value: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => applyTarget(hovered),
      }).to(mat.uniforms.uMorph, {
        value: 1,
        duration: 0.55,
        ease: "power2.out",
      });
    } else {
      applyTarget(hovered);
      tl.to(mat.uniforms.uMorph, {
        value: 1,
        duration: 0.55,
        ease: "power2.out",
      });
    }

    return () => {
      tl.kill();
    };
  }, [hovered, count, geometry, targetCache]);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;
  });

  // geometry/material are built with `new THREE.*` rather than declared
  // as JSX, so R3F won't auto-dispose them — do it explicitly on unmount.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <points
      ref={pointsRef}
      position={[0, 0.4, DESK_Z]}
      geometry={geometry}
      material={material}
    />
  );
}
