"use client";

import { useState } from "react";
import type { ScientificRecord } from "@/lib/scientific/types";
import {
  downloadTextFile,
  papersToCsv,
  papersToJson,
  papersToMarkdown,
  safeFilename,
  type RegionExportMeta,
} from "@/lib/export/format";
import { fetchRegionPapers } from "@/lib/scientific/client";
import { useProgressStore } from "@/lib/store/progress-store";

interface Props {
  records: ScientificRecord[];
  meta: RegionExportMeta;
  compact?: boolean;
  /** When true, re-fetch up to 50 papers before export */
  fetchAll?: boolean;
}

export default function ExportMenu({
  records,
  meta,
  compact,
  fetchAll = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const track = useProgressStore((s) => s.track);

  const base = safeFilename(
    meta.objectName || `ra${meta.ra.toFixed(2)}-dec${meta.dec.toFixed(2)}`
  );

  const resolveRecords = async (): Promise<ScientificRecord[]> => {
    if (!fetchAll) return records;
    try {
      const data = await fetchRegionPapers({
        ra: meta.ra,
        dec: meta.dec,
        radius: meta.radiusDeg ?? 0.5,
        page: 1,
        limit: 50,
        objectName: meta.objectName,
      });
      return data.records?.length ? data.records : records;
    } catch {
      return records;
    }
  };

  const run = async (kind: "csv" | "json" | "md") => {
    if (records.length === 0 && !fetchAll) return;
    setBusy(true);
    try {
      const list = await resolveRecords();
      if (list.length === 0) return;
      if (kind === "csv") {
        downloadTextFile(
          `${base}-literature.csv`,
          papersToCsv(list),
          "text/csv;charset=utf-8"
        );
      } else if (kind === "json") {
        downloadTextFile(
          `${base}-literature.json`,
          papersToJson(list, meta),
          "application/json"
        );
      } else {
        downloadTextFile(
          `${base}-literature.md`,
          papersToMarkdown(list, meta),
          "text/markdown;charset=utf-8"
        );
      }
      track({ type: "export" });
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        disabled={records.length === 0 || busy}
        onClick={() => setOpen((o) => !o)}
        className={
          compact
            ? "ctrl-chip text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-40"
            : "text-xs px-3 py-1.5 rounded-lg border border-[var(--panel-border)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] disabled:opacity-40 transition"
        }
        title="Export literature"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Export ▾
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full mt-1 z-30 min-w-[10rem] ui-panel rounded-lg py-1 shadow-xl"
        >
          {(
            [
              ["md", "Markdown (.md)"],
              ["csv", "CSV spreadsheet"],
              ["json", "JSON"],
            ] as const
          ).map(([k, label]) => (
            <li key={k}>
              <button
                type="button"
                role="menuitem"
                onClick={() => run(k)}
                className="w-full text-left px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--accent-muted)]"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
