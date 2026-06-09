// Persistent key/value store backed by localStorage (async API for easy swapping).
export const store = {
  async get(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable — ignore */
    }
  },
};
