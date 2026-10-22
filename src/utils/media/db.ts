import type { MediaAsset } from '../../types/media';

const DB_NAME = 'kubicu-media';
const STORE = 'assets';

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(new Error('IndexedDB unavailable'));
        return;
      }
      const req = window.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error('IndexedDB failed to open'));
      req.onblocked = () => reject(new Error('IndexedDB blocked'));
    });
    // Let a later call retry if opening failed.
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
    new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      let result: T;
      req.onsuccess = () => {
        result = req.result;
      };
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error ?? req.error ?? new Error('IndexedDB request failed'));
      tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
    })
  );
}

export function getAllAssets(): Promise<MediaAsset[]> {
  return run<MediaAsset[]>('readonly', (s) => s.getAll() as IDBRequest<MediaAsset[]>);
}

/** Rejects with a QuotaExceededError when the browser is out of space. */
export function putAsset(asset: MediaAsset): Promise<IDBValidKey> {
  return run('readwrite', (s) => s.put(asset));
}

export function deleteAssetRecord(id: string): Promise<undefined> {
  return run('readwrite', (s) => s.delete(id) as IDBRequest<undefined>);
}

export function isQuotaError(e: unknown): boolean {
  return e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22);
}