"use client";

import { useState } from "react";
import { useLocaleStore } from "@/lib/store/locale-store";
import { useProgressStore } from "@/lib/store/progress-store";

export default function ShareButton() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useLocaleStore((s) => s.t);
  const track = useProgressStore((s) => s.track);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "SAPIENS",
          text: t("tagline"),
          url,
        });
        setMsg(t("shareShared"));
        track({ type: "share" });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setMsg(t("shareCopied"));
        track({ type: "share" });
      } else {
        setMsg(t("shareCopied"));
      }
    } catch {
      setMsg(null);
    }
    setTimeout(() => setMsg(null), 2000);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={share}
        className="ctrl-chip flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
        title={t("share")}
        aria-label={t("share")}
      >
        <span aria-hidden>↗</span>
        <span className="hidden sm:inline">{t("share")}</span>
      </button>
      {msg && (
        <span className="absolute right-0 top-full mt-1 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-[10px] text-cyan-200">
          {msg}
        </span>
      )}
    </div>
  );
}
