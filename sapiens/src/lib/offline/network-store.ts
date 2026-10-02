"use client";

import { create } from "zustand";

interface NetworkState {
  online: boolean;
  lastOnlineAt: number | null;
  lastOfflineAt: number | null;
  init: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  lastOnlineAt: null,
  lastOfflineAt: null,

  init: () => {
    if (typeof window === "undefined") return;
    const apply = () => {
      const online = navigator.onLine;
      set({
        online,
        lastOnlineAt: online ? Date.now() : get().lastOnlineAt,
        lastOfflineAt: online ? get().lastOfflineAt : Date.now(),
      });
    };
    const get = () => useNetworkStore.getState();
    apply();
    window.addEventListener("online", apply);
    window.addEventListener("offline", apply);
  },
}));
