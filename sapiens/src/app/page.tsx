"use client";

import { useCallback, useState } from "react";
import SkyCanvas from "@/components/sky/SkyCanvas";
import SplashScreen from "@/components/ui/SplashScreen";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Onboarding from "@/components/ui/Onboarding";

export default function Home() {
  const [engineReady, setEngineReady] = useState(false);

  const handleReady = useCallback(() => {
    setEngineReady(true);
  }, []);

  return (
    <main
      id="main"
      className="fixed inset-0 w-screen h-[100dvh] bg-[var(--sky-clear)] overflow-hidden"
    >
      <ErrorBoundary fallbackTitle="Sky engine error">
        <SplashScreen ready={engineReady} minDisplayMs={1400} />
        <SkyCanvas onReady={handleReady} />
        {engineReady && <Onboarding />}
      </ErrorBoundary>
    </main>
  );
}
