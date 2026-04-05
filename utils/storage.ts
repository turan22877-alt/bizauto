// Debounced localStorage save to improve performance
const saveQueue = new Map<string, NodeJS.Timeout>();

export function debouncedSave<T>(key: string, data: T, delay: number = 500): void {
  const existing = saveQueue.get(key);
  if (existing) {
    clearTimeout(existing);
  }

  const timeout = setTimeout(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      saveQueue.delete(key);
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }, delay);

  saveQueue.set(key, timeout);
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// Flush all pending saves (useful before page unload)
export function flushAllSaves(): void {
  saveQueue.forEach((timeout) => clearTimeout(timeout));
  saveQueue.clear();
}
