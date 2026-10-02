/**
 * Minimal IndexedDB helper — SAPIENS Phase 15
 */

const DB_NAME = "sapiens-offline";
const DB_VERSION = 1;

export type StoreName = "papers" | "ai" | "outbox";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("papers")) {
        db.createObjectStore("papers", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("ai")) {
        db.createObjectStore("ai", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("outbox")) {
        const os = db.createObjectStore("outbox", {
          keyPath: "id",
          autoIncrement: true,
        });
        os.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

export async function idbGet<T>(
  store: StoreName,
  key: string
): Promise<T | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function idbSet(
  store: StoreName,
  value: { key: string } & Record<string, unknown>
): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
}

export async function idbAdd(
  store: StoreName,
  value: Record<string, unknown>
): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).add(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
}

export async function idbGetAll<T>(store: StoreName): Promise<T[]> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve((req.result as T[]) ?? []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function idbDelete(store: StoreName, key: IDBValidKey): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
}

/** Cache TTL default: 24h for papers */
export const PAPERS_TTL_MS = 24 * 60 * 60 * 1000;
export const AI_TTL_MS = 6 * 60 * 60 * 1000;
