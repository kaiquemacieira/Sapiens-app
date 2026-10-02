"use client";

import { useState } from "react";
import {
  shareTextForRegion,
  type RegionExportMeta,
} from "@/lib/export/format";
import { useLocaleStore } from "@/lib/store/locale-store";

interface Props {
  meta: RegionExportMeta;
  paperCount?: number;
  className?: string;
}

export default function ShareRichButton({
  meta,
  paperCount,
  className,
}: Props) {
  const t = useLocaleStore((s) => s.t);
  const [msg, setMsg] = useState<string | null>(null);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = shareTextForRegion(meta, paperCount);
    try {
      if (navigator.share) {
        await navigator.share({ title: "SAPIENS", text, url });
        setMsg(t("shareShared"));
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setMsg(t("shareCopied"));
      }
    } catch {
      setMsg(null);
    }
    setTimeout(() => setMsg(null), 2000);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={share}
        className={
          className ??
          "text-xs px-3 py-1.5 rounded-lg border border-[var(--panel-border)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] transition"
        }
      >
        {t("share")}
      </button>
      {msg && (
        <span className="absolute right-0 top-full mt-1 text-[10px] text-[var(--accent)] whitespace-nowrap">
          {msg}
        </span>
      )}
    </div>
  );
}
