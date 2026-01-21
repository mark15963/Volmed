const { loadConfigFromCache, saveConfigToCache } = require("./configCache");

const CACHE_KEY = "general";

//#region Get data from cache file
/**
 * Retrieves a cached configuration object from storage.
 *
 * 1. Calls `loadConfigFromCache()` to get the current cache object from file.
 * 2. Checks if the cache exists and contains the key defined by `CACHE_KEY`.
 * 3. Returns the cached configuration if found; otherwise returns `null`.
 */
function getCachedConfig() {
  const cache = loadConfigFromCache();
  return cache && cache[CACHE_KEY] ? cache[CACHE_KEY] : null;
}

/**
 * Saves or updates a configuration object in the cache.
 *
 * 1. Loads the current cache (if it exists) or initializes an empty object.
 * 2. Merges the new data (`newData`) into the existing cached config under `CACHE_KEY`.
 *    - This ensures partial updates don’t overwrite other existing keys.
 * 3. Persists the updated cache by calling `saveConfigToCache(cache)`.
 *
 * @param {Object} newData - The new or updated configuration data to store.
 */
function saveCachedConfig(newData) {
  const cache = loadConfigFromCache() || {};
  cache[CACHE_KEY] = {
    title: fullConfig.title,
    color: {
      headerColor: fullConfig.color?.headerColor,
      contentColor: fullConfig.color?.contentColor,
      containerColor: fullConfig.color?.containerColor,
    },
    theme: fullConfig.theme,
    // logoUrl: fullConfig.logoUrl || cache[CACHE_KEY]?.logoUrl,  // if you want to preserve logo
  };
  saveConfigToCache(cache);
}

module.exports = { getCachedConfig, saveCachedConfig };
