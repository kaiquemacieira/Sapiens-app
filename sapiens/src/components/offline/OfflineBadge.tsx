"use client";

import { useNetworkStore } from "@/lib/offline/network-store";
import { useLocaleStore } from "@/lib/store/locale-store";

export default function OfflineBadge() {
  const online = useNetworkStore((s) => s.online);
  const locale = useLocaleStore((s) => s.locale);

  if (online) return null;

  return (
    <div
      className="fixed top-[max(0.5rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-[110] pointer-events-none"
      role="status"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-black/85 px-3 py-1 text-[11px] text-amber-200 shadow-lg backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        {locale === "pt" ? "Offline — cache local" : "Offline — local cache"}
      </span>
    </div>
  );
}
