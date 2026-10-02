"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/lib/store/locale-store";
import { useFavoritesStore } from "@/lib/store/favorites-store";

export default function LocaleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initLocale = useLocaleStore((s) => s.init);
  const initFav = useFavoritesStore((s) => s.init);

  useEffect(() => {
    initLocale();
    initFav();
  }, [initLocale, initFav]);

  return <>{children}</>;
}
