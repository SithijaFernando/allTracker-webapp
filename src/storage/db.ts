// IndexedDB wrapper for allTracker.
//
// This file is the ONLY place that talks to storage. Every module (health,
// workouts, finance, habits) calls the generic CRUD functions below rather
// than touching IndexedDB directly. When migrating to a real backend
// (e.g. Supabase) later, only this file needs to change — module code and
// the dashboard stay the same as long as the function signatures match.

const DB_NAME = "allTracker";
const DB_VERSION = 1;

export const STORES = {
  health: "health",
  workouts: "workouts",
  transactions: "transactions",
  habits: "habits",
  habitLogs: "habitLogs",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function genId(): string {
  return crypto.randomUUID();
}

/** Insert a record. If it has no `id`, one is generated. Returns the saved record. */
export async function add<T extends { id: string }>(
  store: StoreName,
  record: Omit<T, "id"> & { id?: string }
): Promise<T> {
  const db = await openDb();
  const full = { ...record, id: record.id ?? genId() } as T;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(full);
    tx.oncomplete = () => resolve(full);
    tx.onerror = () => reject(tx.error);
  });
}

/** Fetch all records from a store. */
export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

/** Delete a record by id. */
export async function remove(store: StoreName, id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Update an existing record (must already have an id). */
export async function update<T extends { id: string }>(
  store: StoreName,
  record: T
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });
}
