import { debug } from "../../utils";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type CacheKey = 'app_config_cache_v1' | 'cachedPatients' | string

/**
 * Saves any data to localStorage with timestamp and optional expiry.
 * @param {string} key - Unique storage key (e.g. 'app_config_cache_v1', 'cachedPatients')
 * @param {any} data - Data to save
 * @param {number} [expiryMs=ONE_DAY_MS] - Optional expiry time in ms (default - 24 hours)
 */
export const saveToLocalStorage = (key: CacheKey, data: unknown, expiryMs = ONE_DAY_MS) => {
  try {
    const payload = {
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(key, JSON.stringify(payload));
    debug.success(`Saved to localStorage: ${key}`);
  } catch (err) {
    debug.warn(`Failed to save to localStorage (${key}):`, err);
  }
};

/**
 * Loads data from localStorage and checks expiry.
 * @param {string} key - The storage key
 * @param {number} [expiryMs=ONE_DAY_MS] - Expiry time in ms
 * @returns {any|null} Parsed data or null if missing/expired/invalid
 */
export const loadFromLocalStorage = (key: CacheKey, expiryMs = ONE_DAY_MS) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const { timestamp, data } = JSON.parse(stored);
    const age = Date.now() - timestamp;

    if (age > expiryMs) {
      localStorage.removeItem(key);
      debug.log(`Cache expired and removed: ${key}`);
      return null;
    }
    return data;
  } catch (err) {
    debug.warn(`Failed to load from localStorage (${key}):`, err);
    return null;
  }
};

/**
 * Clears a specific cache entry
 * @param {string} key
 */
export const clearLocalStorageCache = (key: CacheKey) => {
  localStorage.removeItem(key);
  debug.log(`Cleared localStorage cache: ${key}`);
};
