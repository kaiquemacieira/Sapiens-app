"use client";

import { useEffect } from "react";
import { useNetworkStore } from "@/lib/offline/network-store";
import { registerOnlineSync } from "@/lib/offline/sync";

export default function OfflineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const init = useNetworkStore((s) => s.init);

  useEffect(() => {
    init();
    registerOnlineSync();

    // Register service worker (production + optional local testing)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const enableSw =
        process.env.NODE_ENV === "production" ||
        process.env.NEXT_PUBLIC_ENABLE_SW === "1";
      if (enableSw) {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          /* ignore */
        });
      }
    }
  }, [init]);

  return <>{children}</>;
}
