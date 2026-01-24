const { loadConfigFromCache, saveConfigToCache } = require("./configCache");

const CACHE_KEY = "general";

function getCachedConfig() {
  const cache = loadConfigFromCache();
  return cache && cache[CACHE_KEY] ? cache[CACHE_KEY] : null;
}

/**
 * Saves a complete configuration object to cache.
 *
 * @param {Object} fullConfig - Complete config: { title, color: {...}, theme, ... }
 */
function saveCachedConfig(newData) {
  const cache = loadConfigFromCache() || {};
  cache[CACHE_KEY] = {
    title: newData.title,
    color: {
      headerColor: newData.color?.headerColor,
      contentColor: newData.color?.contentColor,
      containerColor: newData.color?.containerColor,
    },
    theme: newData.theme,
    logoUrl: newData.logoUrl || cache[CACHE_KEY]?.logoUrl, // if you want to preserve logo
  };
  saveConfigToCache(cache);
}

module.exports = { getCachedConfig, saveCachedConfig };
