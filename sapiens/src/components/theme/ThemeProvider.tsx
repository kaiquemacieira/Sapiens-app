"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/store/theme-store";

/** Applies persisted theme on mount (client-only). */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const init = useThemeStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return <>{children}</>;
}
