"use client";

import { useEffect, useRef } from "react";
import { useSkyStore } from "@/lib/store/sky-store";
import { searchObjects } from "@/data/objects";

/**
 * Sync camera center / FOV with the URL for shareable deep links.
 * ?ra=&dec=&fov=&object=
 */
export default function UrlSync() {
  const {
    centerRa,
    centerDec,
    fov,
    selectedObject,
    flyTo,
    setSelectedObject,
    setFov,
  } = useSkyStore();
  const applied = useRef(false);
  const skipWrite = useRef(false);

  // Read URL once on mount
  useEffect(() => {
    if (applied.current) return;
    applied.current = true;
    if (typeof window === "undefined") return;

    const sp = new URLSearchParams(window.location.search);
    const ra = Number(sp.get("ra"));
    const dec = Number(sp.get("dec"));
    const f = Number(sp.get("fov"));
    const object = sp.get("object");

    skipWrite.current = true;

    if (object) {
      const hits = searchObjects(object, 1);
      if (hits[0]) {
        setSelectedObject(hits[0]);
        flyTo(
          hits[0].ra,
          hits[0].dec,
          Number.isFinite(f) ? f : hits[0].type === "star" ? 8 : 15
        );
        skipWrite.current = false;
        return;
      }
    }

    if (Number.isFinite(ra) && Number.isFinite(dec)) {
      flyTo(ra, dec, Number.isFinite(f) ? f : undefined);
    } else if (Number.isFinite(f)) {
      setFov(f);
    }

    // allow writes after initial apply
    requestAnimationFrame(() => {
      skipWrite.current = false;
    });
  }, [flyTo, setSelectedObject, setFov]);

  // Write URL when view settles
  useEffect(() => {
    if (skipWrite.current) return;
    if (typeof window === "undefined") return;

    const t = setTimeout(() => {
      const sp = new URLSearchParams();
      sp.set("ra", centerRa.toFixed(5));
      sp.set("dec", centerDec.toFixed(5));
      sp.set("fov", fov.toFixed(2));
      if (selectedObject?.name) {
        sp.set("object", selectedObject.name);
      }
      const qs = sp.toString();
      const next = `${window.location.pathname}?${qs}`;
      if (window.location.search.slice(1) !== qs) {
        window.history.replaceState(null, "", next);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [centerRa, centerDec, fov, selectedObject?.name]);

  return null;
}
