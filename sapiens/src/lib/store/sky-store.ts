import { create } from "zustand";
import type { AstronomicalObject } from "@/data/objects";
import {
  defaultLayerVisibility,
  type LayerId,
  type LayerVisibility,
} from "@/lib/sky/layers";
import {
  defaultObserverLocation,
  type ObserverLocation,
} from "@/lib/coordinates/observer";

export interface SkyState {
  centerRa: number;
  centerDec: number;
  fov: number;
  selectedRa: number | null;
  selectedDec: number | null;
  selectedObject: AstronomicalObject | null;
  searchQuery: string;
  searchResults: AstronomicalObject[];
  searchOpen: boolean;
  isDragging: boolean;
  layers: LayerVisibility;
  layersPanelOpen: boolean;
  observerMode: boolean;
  observerLocation: ObserverLocation;
  observerTimeIso: string | null;
  observerPanelOpen: boolean;
  setCenter: (ra: number, dec: number) => void;
  setFov: (fov: number) => void;
  setSelected: (
    ra: number | null,
    dec: number | null,
    object?: AstronomicalObject | null
  ) => void;
  setSelectedObject: (object: AstronomicalObject | null) => void;
  setIsDragging: (dragging: boolean) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (results: AstronomicalObject[]) => void;
  setSearchOpen: (open: boolean) => void;
  flyTo: (ra: number, dec: number, targetFov?: number) => void;
  getFovRadius: () => number;
  toggleLayer: (id: LayerId) => void;
  setLayer: (id: LayerId, on: boolean) => void;
  setLayersPanelOpen: (open: boolean) => void;
  setObserverMode: (on: boolean) => void;
  setObserverLocation: (loc: Partial<ObserverLocation>) => void;
  setObserverTimeIso: (iso: string | null) => void;
  setObserverPanelOpen: (open: boolean) => void;
  getObserverDate: () => Date;
}

export const useSkyStore = create<SkyState>((set, get) => ({
  centerRa: 266.417,
  centerDec: -29.008,
  fov: 60,
  selectedRa: null,
  selectedDec: null,
  selectedObject: null,
  searchQuery: "",
  searchResults: [],
  searchOpen: false,
  isDragging: false,
  layers: defaultLayerVisibility(),
  layersPanelOpen: false,
  observerMode: false,
  observerLocation: defaultObserverLocation(),
  observerTimeIso: null,
  observerPanelOpen: false,

  setCenter: (ra, dec) =>
    set({
      centerRa: ((ra % 360) + 360) % 360,
      centerDec: Math.max(-90, Math.min(90, dec)),
    }),

  setFov: (fov) =>
    set({
      fov: Math.max(0.5, Math.min(120, fov)),
    }),

  setSelected: (ra, dec, object = null) =>
    set({
      selectedRa: ra,
      selectedDec: dec,
      selectedObject: object ?? null,
    }),

  setSelectedObject: (object) =>
    set({
      selectedObject: object,
      selectedRa: object ? object.ra : null,
      selectedDec: object ? object.dec : null,
    }),

  setIsDragging: (dragging) => set({ isDragging: dragging }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSearchOpen: (open) => set({ searchOpen: open }),

  flyTo: (ra, dec, targetFov) => {
    set({
      centerRa: ((ra % 360) + 360) % 360,
      centerDec: Math.max(-90, Math.min(90, dec)),
      ...(targetFov !== undefined
        ? { fov: Math.max(0.5, Math.min(120, targetFov)) }
        : {}),
    });
  },

  getFovRadius: () => {
    const { fov } = get();
    return Math.max(0.05, Math.min(5, fov * 0.35));
  },

  toggleLayer: (id) =>
    set((state) => ({
      layers: { ...state.layers, [id]: !state.layers[id] },
    })),

  setLayer: (id, on) =>
    set((state) => ({
      layers: { ...state.layers, [id]: on },
    })),

  setLayersPanelOpen: (open) => set({ layersPanelOpen: open }),

  setObserverMode: (on) => set({ observerMode: on }),

  setObserverLocation: (loc) =>
    set((state) => ({
      observerLocation: { ...state.observerLocation, ...loc },
    })),

  setObserverTimeIso: (iso) => set({ observerTimeIso: iso }),

  setObserverPanelOpen: (open) => set({ observerPanelOpen: open }),

  getObserverDate: () => {
    const iso = get().observerTimeIso;
    if (iso) {
      const d = new Date(iso);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return new Date();
  },
}));
