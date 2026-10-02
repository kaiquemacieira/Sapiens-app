"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { NBodyState } from "@/lib/nbody/engine";
import { centerOfMass } from "@/lib/nbody/engine";

interface Props {
  state: NBodyState;
  cameraDistance: number;
  showTrails?: boolean;
}

export default function NBodyCanvas({
  state,
  cameraDistance,
  showTrails = true,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    bodyMeshes: Map<string, THREE.Mesh>;
    trailLines: Map<string, THREE.Line>;
    frame: number;
  } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000008, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 500);
    camera.position.set(0, cameraDistance * 0.55, cameraDistance);
    camera.lookAt(0, 0, 0);

    // Ambient starfield backdrop
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 80;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(
      new THREE.Points(
        starGeom,
        new THREE.PointsMaterial({ color: 0x6688aa, size: 0.04 })
      )
    );

    const bodyMeshes = new Map<string, THREE.Mesh>();
    const trailLines = new Map<string, THREE.Line>();

    const grid = new THREE.GridHelper(12, 12, 0x134e4a, 0x0c1a20);
    grid.position.y = -0.01;
    scene.add(grid);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const st = stateRef.current;
      const com = centerOfMass(st.bodies);

      for (const b of st.bodies) {
        let mesh = bodyMeshes.get(b.id);
        if (!mesh) {
          const geom = new THREE.SphereGeometry(1, 24, 16);
          const mat = new THREE.MeshBasicMaterial({ color: b.color });
          mesh = new THREE.Mesh(geom, mat);
          bodyMeshes.set(b.id, mesh);
          scene.add(mesh);
        }
        mesh.scale.setScalar(b.radius);
        mesh.position.set(b.x - com.x, b.y - com.y, b.z - com.z);

        if (showTrails && b.trail.length > 1) {
          let line = trailLines.get(b.id);
          const positions = new Float32Array(b.trail.length * 3);
          for (let i = 0; i < b.trail.length; i++) {
            positions[i * 3] = b.trail[i].x - com.x;
            positions[i * 3 + 1] = b.trail[i].y - com.y;
            positions[i * 3 + 2] = b.trail[i].z - com.z;
          }
          if (!line) {
            const g = new THREE.BufferGeometry();
            g.setAttribute(
              "position",
              new THREE.BufferAttribute(positions, 3)
            );
            const mat = new THREE.LineBasicMaterial({
              color: b.color,
              transparent: true,
              opacity: 0.45,
            });
            line = new THREE.Line(g, mat);
            trailLines.set(b.id, line);
            scene.add(line);
          } else {
            const attr = line.geometry.getAttribute(
              "position"
            ) as THREE.BufferAttribute;
            if (attr.count !== b.trail.length) {
              line.geometry.setAttribute(
                "position",
                new THREE.BufferAttribute(positions, 3)
              );
            } else {
              (attr.array as Float32Array).set(positions);
              attr.needsUpdate = true;
            }
          }
        }
      }

      // slow orbit camera
      const t = performance.now() * 0.00008;
      const d = cameraDistance;
      camera.position.set(
        Math.sin(t) * d,
        d * 0.45,
        Math.cos(t) * d
      );
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    threeRef.current = {
      renderer,
      scene,
      camera,
      bodyMeshes,
      trailLines,
      frame,
    };

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      threeRef.current = null;
    };
  }, [cameraDistance, showTrails]);

  // Rebuild meshes when body set changes (preset switch)
  useEffect(() => {
    const t = threeRef.current;
    if (!t) return;
    const ids = new Set(state.bodies.map((b) => b.id));
    for (const [id, mesh] of t.bodyMeshes) {
      if (!ids.has(id)) {
        t.scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        t.bodyMeshes.delete(id);
      }
    }
    for (const [id, line] of t.trailLines) {
      if (!ids.has(id)) {
        t.scene.remove(line);
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
        t.trailLines.delete(id);
      }
    }
  }, [state.bodies]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[320px] rounded-xl overflow-hidden border border-[var(--panel-border)] bg-black"
    />
  );
}
