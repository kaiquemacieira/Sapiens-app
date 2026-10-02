"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { useSkyStore } from "@/lib/store/sky-store";
import {
  RENDERABLE_OBJECTS,
  raDecToVector,
  vectorToRaDec,
  findNearestObject,
  getScientificWeight,
  type AstronomicalObject,
} from "@/data/objects";
import { formatRA, formatDec, formatFOV } from "@/lib/coordinates/format";
import { visibleObjectTypes, type LayerVisibility } from "@/lib/sky/layers";
import {
  raDecToAltAz,
  sunAltitudeDegrees,
  sampleHorizonRaDec,
  skyColorFromSunAlt,
  formatAltitude,
  formatAzimuth,
  type ObserverLocation,
} from "@/lib/coordinates/observer";
import SearchBar from "./SearchBar";
import ObjectInfoPanel from "./ObjectInfoPanel";
import LayersPanel from "./LayersPanel";
import ObserverPanel from "./ObserverPanel";
import ThemeToggle from "@/components/theme/ThemeToggle";
import ShareButton from "./ShareButton";
import HelpModal from "@/components/ui/HelpModal";
import UrlSync from "./UrlSync";
import FavoritesPanel from "./FavoritesPanel";
import LocaleToggle from "@/components/i18n/LocaleToggle";
import { allConstellationSegments } from "@/data/constellations";
import { useLocaleStore } from "@/lib/store/locale-store";
import ProgressChip from "@/components/gamification/ProgressChip";

function colorForType(obj: AstronomicalObject): [number, number, number] {
  const mag = obj.magnitude ?? 5;
  const brightness = Math.max(0.3, 1 - mag / 8);
  switch (obj.type) {
    case "galaxy":
      return [brightness * 0.65, brightness * 0.8, 1.0];
    case "nebula":
      return [brightness * 0.9, brightness * 0.55, brightness * 0.95];
    case "globular":
    case "open_cluster":
    case "cluster":
      return [brightness * 1.0, brightness * 0.9, brightness * 0.6];
    case "exoplanet":
      return [brightness * 0.4, brightness * 1.0, brightness * 0.7];
    case "high_energy":
      return [1.0, brightness * 0.45, brightness * 0.35];
    case "black_hole":
      return [1.0, 0.55, 0.2];
    default:
      return [brightness * 0.95, brightness * 0.97, 1.0];
  }
}

function buildObjectGeometry(layers: LayerVisibility): THREE.BufferGeometry {
  const types = visibleObjectTypes(layers);
  const positions: number[] = [];
  const colors: number[] = [];

  for (const obj of RENDERABLE_OBJECTS) {
    if (!types.has(obj.type)) continue;
    const [x, y, z] = raDecToVector(obj.ra, obj.dec);
    positions.push(x, y, z);
    const [r, g, b] = colorForType(obj);
    colors.push(r, g, b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

function buildDensityGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];

  for (const obj of RENDERABLE_OBJECTS) {
    const w = getScientificWeight(obj);
    if (w < 0.35) continue;
    const [x, y, z] = raDecToVector(obj.ra, obj.dec);
    const s = 0.98;
    positions.push(x * s, y * s, z * s);
    const t = (w - 0.35) / 0.65;
    colors.push(0.2 + t * 0.6, 0.7 + t * 0.2, 1.0 - t * 0.5);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

function buildHorizonGeometry(
  loc: ObserverLocation,
  when: Date
): THREE.BufferGeometry {
  const samples = sampleHorizonRaDec(loc, when, 96);
  const positions: number[] = [];
  for (const p of samples) {
    const [x, y, z] = raDecToVector(p.ra, p.dec);
    positions.push(x, y, z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  return geometry;
}

export default function SkyCanvas({ onReady }: { onReady?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const readyNotified = useRef(false);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const densityRef = useRef<THREE.Points | null>(null);
  const equatorRef = useRef<THREE.Line | null>(null);
  const constellationsRef = useRef<THREE.LineSegments | null>(null);
  const horizonRef = useRef<THREE.Line | null>(null);
  const selectionMarkerRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number>(0);

  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const dragDistanceRef = useRef(0);
  const sphericalRef = useRef({ theta: 0, phi: Math.PI / 2 });

  const {
    centerRa,
    centerDec,
    fov,
    selectedRa,
    selectedDec,
    selectedObject,
    layers,
    observerMode,
    observerLocation,
    observerTimeIso,
    setCenter,
    setFov,
    setSelected,
    setIsDragging,
    getFovRadius,
    getObserverDate,
  } = useSkyStore();

  const t = useLocaleStore((s) => s.t);

  const [centerAltAz, setCenterAltAz] = useState<{
    altitude: number;
    azimuth: number;
  } | null>(null);
  const [selectedAltAz, setSelectedAltAz] = useState<{
    altitude: number;
    azimuth: number;
  } | null>(null);
  const [sunAlt, setSunAlt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!observerMode || observerTimeIso) return;
    const id = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(id);
  }, [observerMode, observerTimeIso]);

  useEffect(() => {
    if (!observerMode) {
      setCenterAltAz(null);
      setSelectedAltAz(null);
      setSunAlt(null);
      return;
    }
    try {
      const when = getObserverDate();
      setCenterAltAz(
        raDecToAltAz(centerRa, centerDec, observerLocation, when)
      );
      setSunAlt(sunAltitudeDegrees(observerLocation, when));
      if (selectedRa != null && selectedDec != null) {
        setSelectedAltAz(
          raDecToAltAz(selectedRa, selectedDec, observerLocation, when)
        );
      } else {
        setSelectedAltAz(null);
      }
    } catch (e) {
      console.warn("[observer]", e);
    }
  }, [
    observerMode,
    centerRa,
    centerDec,
    selectedRa,
    selectedDec,
    observerLocation,
    observerTimeIso,
    getObserverDate,
    tick,
  ]);

  useEffect(() => {
    if (isDraggingRef.current) return;
    const raRad = (centerRa * Math.PI) / 180;
    const decRad = (centerDec * Math.PI) / 180;
    sphericalRef.current.theta = raRad;
    sphericalRef.current.phi = Math.PI / 2 - decRad;
    const camera = cameraRef.current;
    if (camera) {
      const { theta, phi } = sphericalRef.current;
      camera.lookAt(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );
    }
  }, [centerRa, centerDec]);

  const updateCameraFromSpherical = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const { theta, phi } = sphericalRef.current;
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);
    camera.position.set(0, 0, 0);
    camera.up.set(0, 1, 0);
    camera.lookAt(x, y, z);
    const { ra, dec } = vectorToRaDec(x, y, z);
    setCenter(ra, dec);
  }, [setCenter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000008, 1);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.01, 100);
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;

    const densityGeom = buildDensityGeometry();
    const densityMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const density = new THREE.Points(densityGeom, densityMat);
    scene.add(density);
    densityRef.current = density;

    const objGeom = buildObjectGeometry(layers);
    const objMat = new THREE.PointsMaterial({
      size: 0.014,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const stars = new THREE.Points(objGeom, objMat);
    scene.add(stars);
    starsRef.current = stars;

    const markerGeom = new THREE.SphereGeometry(0.01, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.85,
    });
    const marker = new THREE.Mesh(markerGeom, markerMat);
    marker.visible = false;
    scene.add(marker);
    selectionMarkerRef.current = marker;

    const equatorPoints: number[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      equatorPoints.push(Math.cos(a), 0, Math.sin(a));
    }
    const equatorGeom = new THREE.BufferGeometry();
    equatorGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(equatorPoints, 3)
    );
    const equatorMat = new THREE.LineBasicMaterial({
      color: 0x224433,
      transparent: true,
      opacity: 0.25,
    });
    const equator = new THREE.Line(equatorGeom, equatorMat);
    scene.add(equator);
    equatorRef.current = equator;

    // Constellation stick figures
    const constPos = allConstellationSegments();
    const constGeom = new THREE.BufferGeometry();
    constGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(constPos, 3)
    );
    const constMat = new THREE.LineBasicMaterial({
      color: 0x3d7a8c,
      transparent: true,
      opacity: 0.45,
    });
    const constLines = new THREE.LineSegments(constGeom, constMat);
    scene.add(constLines);
    constellationsRef.current = constLines;

    const horizonGeom = new THREE.BufferGeometry();
    const horizonMat = new THREE.LineBasicMaterial({
      color: 0x44aa88,
      transparent: true,
      opacity: 0.55,
    });
    const horizon = new THREE.Line(horizonGeom, horizonMat);
    horizon.visible = false;
    scene.add(horizon);
    horizonRef.current = horizon;

    const raRad = (centerRa * Math.PI) / 180;
    const decRad = (centerDec * Math.PI) / 180;
    sphericalRef.current.theta = raRad;
    sphericalRef.current.phi = Math.PI / 2 - decRad;
    updateCameraFromSpherical();
    camera.fov = fov;
    camera.updateProjectionMatrix();

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
      if (!readyNotified.current) {
        readyNotified.current = true;
        onReady?.();
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener("resize", handleResize);
      objGeom.dispose();
      objMat.dispose();
      densityGeom.dispose();
      densityMat.dispose();
      markerGeom.dispose();
      markerMat.dispose();
      equatorGeom.dispose();
      equatorMat.dispose();
      constGeom.dispose();
      constMat.dispose();
      horizonGeom.dispose();
      horizonMat.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const points = starsRef.current;
    if (!points) return;
    const old = points.geometry;
    points.geometry = buildObjectGeometry(layers);
    old.dispose();
  }, [layers]);

  useEffect(() => {
    if (densityRef.current) densityRef.current.visible = !!layers.literature;
    if (equatorRef.current) equatorRef.current.visible = !!layers.equator;
    if (constellationsRef.current) {
      constellationsRef.current.visible = !!layers.constellations;
    }
  }, [layers]);

  useEffect(() => {
    const line = horizonRef.current;
    if (!line) return;
    if (!observerMode) {
      line.visible = false;
      return;
    }
    try {
      const when = getObserverDate();
      const geom = buildHorizonGeometry(observerLocation, when);
      const old = line.geometry;
      line.geometry = geom;
      old.dispose();
      line.visible = true;
    } catch (e) {
      console.warn("[horizon]", e);
      line.visible = false;
    }
  }, [observerMode, observerLocation, observerTimeIso, getObserverDate, tick]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    if (observerMode && sunAlt != null) {
      renderer.setClearColor(skyColorFromSunAlt(sunAlt), 1);
    } else {
      renderer.setClearColor(0x000008, 1);
    }
  }, [observerMode, sunAlt]);

  useEffect(() => {
    const camera = cameraRef.current;
    if (camera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [fov]);

  useEffect(() => {
    const marker = selectionMarkerRef.current;
    if (!marker) return;
    if (selectedRa !== null && selectedDec !== null) {
      const [x, y, z] = raDecToVector(selectedRa, selectedDec);
      marker.position.set(x, y, z);
      marker.visible = true;
    } else {
      marker.visible = false;
    }
  }, [selectedRa, selectedDec]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDraggingRef.current = true;
      dragDistanceRef.current = 0;
      setIsDragging(true);
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [setIsDragging]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      const sensitivity = 0.002 * (fov / 60);
      sphericalRef.current.theta -= dx * sensitivity;
      sphericalRef.current.phi = Math.max(
        0.01,
        Math.min(Math.PI - 0.01, sphericalRef.current.phi + dy * sensitivity)
      );
      updateCameraFromSpherical();
    },
    [fov, updateCameraFromSpherical]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      isDraggingRef.current = false;
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    },
    [setIsDragging]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1.12 : 0.89;
      setFov(Math.max(0.5, Math.min(120, fov * delta)));
    },
    [fov, setFov]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragDistanceRef.current > 6) return;
      const canvas = canvasRef.current;
      const camera = cameraRef.current;
      if (!canvas || !camera) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const mouse = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const dir = raycaster.ray.direction.clone().normalize();
      const { ra, dec } = vectorToRaDec(dir.x, dir.y, dir.z);

      const radius = getFovRadius();
      const types = visibleObjectTypes(layers);
      const nearest = findNearestObject(ra, dec, radius, types);

      if (nearest) setSelected(nearest.ra, nearest.dec, nearest);
      else setSelected(ra, dec, null);
    },
    [setSelected, getFovRadius, layers]
  );

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-b from-black/85 to-transparent pointer-events-auto">
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/dashboard"
              className="brand-mark text-lg sm:text-xl font-semibold text-cyan-50 hover:text-cyan-200 transition"
              title="Dashboard"
            >
              SAPIENS
            </a>
            <span className="text-[11px] text-cyan-500/70 hidden lg:inline tracking-wide">
              {t("tagline")}
            </span>
          </div>

          <div className="flex-1 flex justify-center max-w-lg min-w-0 px-1">
            <SearchBar />
          </div>

          <div className="relative flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ProgressChip />
            <FavoritesPanel />
            <ShareButton />
            <LocaleToggle />
            <ThemeToggle compact />
            <ObserverPanel />
            <LayersPanel />
            <HelpModal />
          </div>
        </div>

        <UrlSync />
        <ObjectInfoPanel />

        {/* Status bar — lifts above mobile bottom sheet when something is selected */}
        <div
          className={`absolute left-0 right-0 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-0.5 px-3 sm:px-4 py-2 bg-gradient-to-t from-black/90 to-transparent font-mono text-[11px] sm:text-sm text-cyan-100/90 ${
            selectedObject || selectedRa != null
              ? "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-0"
              : "bottom-[env(safe-area-inset-bottom)] md:bottom-0"
          }`}
        >
          <span>
            RA <span className="text-white">{formatRA(centerRa)}</span>
          </span>
          <span>
            DEC <span className="text-white">{formatDec(centerDec)}</span>
          </span>
          {observerMode && centerAltAz && (
            <>
              <span className="hidden xs:inline sm:inline">
                Alt{" "}
                <span className="text-white">
                  {formatAltitude(centerAltAz.altitude)}
                </span>
              </span>
              <span className="hidden sm:inline">
                Az{" "}
                <span className="text-white">
                  {formatAzimuth(centerAltAz.azimuth)}
                </span>
              </span>
            </>
          )}
          <span>
            FOV <span className="text-white">{formatFOV(fov)}</span>
          </span>
          {observerMode && sunAlt != null && (
            <span className="text-amber-200/80 text-[10px] sm:text-xs hidden sm:inline">
              Sun {formatAltitude(sunAlt)}
            </span>
          )}
          {selectedObject && (
            <span className="text-cyan-400 hidden md:inline">
              · {selectedObject.name}
              {selectedAltAz && (
                <span className="text-zinc-500">
                  {" "}
                  ({formatAltitude(selectedAltAz.altitude)})
                </span>
              )}
            </span>
          )}
        </div>

        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 text-center hidden md:block">
          Drag · Scroll · Click · / search ·{" "}
          <a
            href="/simulate"
            className="text-cyan-500/80 hover:text-cyan-300 pointer-events-auto"
          >
            N-body
          </a>
          {" · "}
          <a
            href="/relativity"
            className="text-cyan-500/80 hover:text-cyan-300 pointer-events-auto"
          >
            Relativity
          </a>
          {" · "}
          <a
            href="/blackholes"
            className="text-cyan-500/80 hover:text-cyan-300 pointer-events-auto"
          >
            Black holes
          </a>
          {" · "}
          <a
            href="/strings"
            className="text-cyan-500/80 hover:text-cyan-300 pointer-events-auto"
          >
            Strings
          </a>
          {" · "}
          <a
            href="/qft"
            className="text-cyan-500/80 hover:text-cyan-300 pointer-events-auto"
          >
            QFT
          </a>
          {" · "}
          <a
            href="/quantum-gravity"
            className="text-cyan-500/80 hover:text-cyan-300 pointer-events-auto"
          >
            QG
          </a>
          {" · "}
          <a
            href="/dark-matter"
            className="text-cyan-500/80 hover:text-cyan-300 pointer-events-auto"
          >
            DM
          </a>
          {" · "}
          <a
            href="/gravitational-waves"
            className="text-cyan-500/80 hover:text-cyan-300 pointer-events-auto"
          >
            GW
          </a>
        </div>
      </div>
    </div>
  );
}
