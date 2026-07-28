/** @format */

'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Html, useCursor, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { BrainRegion } from '../data/brainTypes';

const FALLBACK_HIGHLIGHT = '#f58a1f';
const HOVER_INTENSITY = 0.55;
const SELECT_INTENSITY = 0.95;
const LERP_SPEED = 8; // per-second

interface MeshEntry {
  mesh: THREE.Mesh;
  region: BrainRegion;
  baseEmissive: THREE.Color;
  target: number;
}

function isStandardMaterial(m: THREE.Material): m is THREE.MeshStandardMaterial {
  return 'emissive' in m && 'emissiveIntensity' in m;
}

/**
 * Builds the mesh-name → region lookup and preps a clone-per-mesh material so
 * highlighting one region can never bleed onto a sibling sharing the same
 * source material.
 *
 * The clone is guarded by a `userData` marker rather than stored on the
 * entry itself, because this factory can run more than once for the same
 * mesh (React Strict Mode double-invokes it in dev, and its side effect —
 * `obj.material = clone` — lands on the shared GLTF scene both times, not
 * just on the discarded first return value). Re-deriving `entry.mesh.material`
 * fresh every frame in the render loop, instead of caching the clone on the
 * entry, is what keeps this correct even if a later pass swaps it again.
 */
function useInteractiveMeshes(scene: THREE.Group, regions: BrainRegion[]) {
  return useMemo(() => {
    const byMeshName = new Map(regions.map((r) => [r.meshName, r]));
    const entries = new Map<string, MeshEntry>();

    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const region = byMeshName.get(obj.name);
      if (!region) return;

      let material = Array.isArray(obj.material) ? obj.material[0] : obj.material;
      if (!material.userData.isBrainRegionClone) {
        material = material.clone();
        material.userData.isBrainRegionClone = true;
        material.userData.baseEmissive = material.emissive.clone();
        obj.material = material;
      }

      if (!isStandardMaterial(material)) return;

      entries.set(obj.name, {
        mesh: obj,
        region,
        baseEmissive: material.userData.baseEmissive as THREE.Color,
        target: 0,
      });
    });

    return entries;
  }, [scene, regions]);
}

function BrainModel({
  modelUrl,
  regions,
  selectedMeshName,
  onSelectRegion,
  onHoverRegion,
}: {
  modelUrl: string;
  regions: BrainRegion[];
  selectedMeshName: string | null;
  onSelectRegion: (region: BrainRegion) => void;
  onHoverRegion?: (region: BrainRegion | null) => void;
}) {
  const { scene } = useGLTF(modelUrl);
  const meshes = useInteractiveMeshes(scene, regions);
  const controls = useRef<CameraControls | null>(null);
  const [hoveredMeshName, setHoveredMeshName] = useState<string | null>(null);
  const { camera } = useThree();

  useCursor(hoveredMeshName !== null);

  // Frame the whole brain once on load, then lock the zoom range so it can
  // only change via the scripted fitToBox() below — never by wheel/pinch.
  useEffect(() => {
    if (!controls.current) return;
    controls.current.fitToBox(scene, false, {
      paddingLeft: 0.4,
      paddingRight: 0.4,
      paddingTop: 0.4,
      paddingBottom: 0.4,
    });
    controls.current.dollySpeed = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    const entry = selectedMeshName ? meshes.get(selectedMeshName) : null;
    if (entry && controls.current) {
      controls.current.fitToBox(entry.mesh, true, {
        paddingLeft: 0.6,
        paddingRight: 0.6,
        paddingTop: 0.6,
        paddingBottom: 0.6,
      });
    }
  }, [selectedMeshName, meshes]);

  useEffect(() => {
    for (const entry of meshes.values()) {
      entry.target =
        entry.region.meshName === selectedMeshName
          ? SELECT_INTENSITY
          : entry.region.meshName === hoveredMeshName
            ? HOVER_INTENSITY
            : 0;
    }
  }, [meshes, selectedMeshName, hoveredMeshName]);

  useFrame((_, delta) => {
    const t = Math.min(1, delta * LERP_SPEED);
    for (const entry of meshes.values()) {
      const material = entry.mesh.material as THREE.MeshStandardMaterial;
      const current = material.emissiveIntensity;
      material.emissiveIntensity = current + (entry.target - current) * t;
      const color = entry.region.color ?? FALLBACK_HIGHLIGHT;
      material.emissive.set(entry.target > 0.01 ? color : entry.baseEmissive);
    }
    controls.current?.update(delta);
  });

  const hoveredEntry = hoveredMeshName ? meshes.get(hoveredMeshName) : null;
  const tooltipPosition = useMemo(() => {
    if (!hoveredEntry) return null;
    const box = new THREE.Box3().setFromObject(hoveredEntry.mesh);
    return box.getCenter(new THREE.Vector3());
  }, [hoveredEntry]);

  return (
    <>
      <primitive
        object={scene}
        onPointerOver={(e: React.PointerEvent & { object: THREE.Object3D }) => {
          if (!meshes.has(e.object.name)) return;
          e.stopPropagation();
          setHoveredMeshName(e.object.name);
          onHoverRegion?.(meshes.get(e.object.name)!.region);
        }}
        onPointerOut={(e: React.PointerEvent & { object: THREE.Object3D }) => {
          if (e.object.name !== hoveredMeshName) return;
          setHoveredMeshName(null);
          onHoverRegion?.(null);
        }}
        onClick={(e: React.MouseEvent & { object: THREE.Object3D; stopPropagation: () => void }) => {
          const entry = meshes.get(e.object.name);
          if (!entry) return;
          e.stopPropagation();
          onSelectRegion(entry.region);
        }}
      />

      {hoveredEntry && tooltipPosition && (
        <Html position={tooltipPosition} center distanceFactor={8} className="sl-brain__tooltip-anchor">
          <div className="sl-brain__tooltip">{hoveredEntry.region.title}</div>
        </Html>
      )}

      <CameraControls ref={controls} camera={camera} makeDefault minDistance={0.01} />
    </>
  );
}

export function BrainScene({
  modelUrl,
  regions,
  selectedMeshName,
  onSelectRegion,
  onHoverRegion,
}: {
  modelUrl: string;
  regions: BrainRegion[];
  selectedMeshName: string | null;
  onSelectRegion: (region: BrainRegion) => void;
  onHoverRegion?: (region: BrainRegion | null) => void;
}) {
  return (
    <Canvas
      className="sl-brain__canvas"
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.05, far: 100 }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <directionalLight position={[-4, -2, -3]} intensity={0.35} />
      <Suspense fallback={null}>
        <BrainModel
          modelUrl={modelUrl}
          regions={regions}
          selectedMeshName={selectedMeshName}
          onSelectRegion={onSelectRegion}
          onHoverRegion={onHoverRegion}
        />
      </Suspense>
    </Canvas>
  );
}
