import { afterEach } from 'vitest';

/**
 * The service and repository layers read and write `localStorage`, which only
 * exists in a browser. This in-memory stand-in keeps the unit tests runnable in
 * a plain Node environment, without pulling jsdom into every frontend.
 */
class MemoryStorage {
  private readonly store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const storage = new MemoryStorage();

Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  configurable: true,
  writable: true,
});

afterEach(() => {
  storage.clear();
});
