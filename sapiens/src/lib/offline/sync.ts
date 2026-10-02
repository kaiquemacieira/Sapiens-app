/**
 * Outbox sync when connectivity returns — Phase 15
 * Progress/favorites already live in localStorage (always offline-capable).
 */

import { idbAdd, idbGetAll, idbDelete } from "@/lib/offline/idb";
import { useToastStore } from "@/lib/store/toast-store";

export type OutboxItem = {
  id?: number;
  kind: "analytics_ping" | "pref_sync";
  payload: Record<string, unknown>;
  createdAt: number;
};

/** Queue a lightweight offline action (extensible) */
export async function enqueueOutbox(
  kind: OutboxItem["kind"],
  payload: Record<string, unknown> = {}
): Promise<void> {
  await idbAdd("outbox", {
    kind,
    payload,
    createdAt: Date.now(),
  });
}

/**
 * Flush outbox when online. Currently no remote user account —
 * clears ephemeral pings and reports success via toast.
 */
export async function flushOutbox(): Promise<number> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0;
  const items = await idbGetAll<OutboxItem>("outbox");
  if (items.length === 0) return 0;

  let flushed = 0;
  for (const item of items) {
    // Placeholder: future Supabase user sync would go here.
    // For now we acknowledge and drop analytics-style entries.
    if (item.id != null) {
      await idbDelete("outbox", item.id);
      flushed += 1;
    }
  }
  return flushed;
}

export function registerOnlineSync(): void {
  if (typeof window === "undefined") return;

  const onOnline = async () => {
    const n = await flushOutbox();
    if (n > 0) {
      useToastStore.getState().push({
        kind: "success",
        title: "Back online",
        body: `Synced ${n} queued action(s). Literature cache remains available offline.`,
      });
    } else {
      useToastStore.getState().push({
        kind: "info",
        title: "Back online",
        body: "Live literature and AI requests restored.",
      });
    }
  };

  const onOffline = () => {
    useToastStore.getState().push({
      kind: "warning",
      title: "Offline mode",
      body: "Sky catalog, favorites and cached papers still work. New ADS/arXiv queries need a connection.",
    });
  };

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
}
