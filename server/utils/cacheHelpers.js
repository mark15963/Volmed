const { loadConfigFromCache, saveConfigToCache } = require("./configCache");

const CACHE_KEY = "general";

function getCachedConfig() {
  const cache = loadConfigFromCache();
  return cache && cache[CACHE_KEY] ? cache[CACHE_KEY] : null;
}

function saveCachedConfig(newData) {
  const cache = loadConfigFromCache() || {};
  cache[CACHE_KEY] = { ...(cache[CACHE_KEY] || {}), ...newData };
  saveConfigToCache(cache);
}

module.exports = { getCachedConfig, saveCachedConfig };