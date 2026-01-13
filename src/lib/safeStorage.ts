/**
 * Safe storage adapter that falls back to in-memory storage
 * when localStorage/sessionStorage is blocked (e.g., in third-party iframes)
 */

class MemoryStorage implements Storage {
  private data: Map<string, string> = new Map();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.data.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

function isStorageAvailable(storage: Storage): boolean {
  try {
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Create singleton memory storage instances for fallback
const localMemoryStorage = new MemoryStorage();
const sessionMemoryStorage = new MemoryStorage();

// Safe localStorage wrapper
export const safeStorage: Storage = (() => {
  try {
    if (typeof localStorage !== 'undefined' && isStorageAvailable(localStorage)) {
      return localStorage;
    }
  } catch {
    // localStorage access threw an error
  }
  return localMemoryStorage;
})();

// Safe sessionStorage wrapper
export const safeSessionStorage: Storage = (() => {
  try {
    if (typeof sessionStorage !== 'undefined' && isStorageAvailable(sessionStorage)) {
      return sessionStorage;
    }
  } catch {
    // sessionStorage access threw an error
  }
  return sessionMemoryStorage;
})();
