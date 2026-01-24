const fs = require("fs");
const path = require("path");

const CACHE_PATH = process.env.CACHE_PATH
  ? path.resolve(process.env.CACHE_PATH)
  : path.join(__dirname, "..", "cache", "config-cache.json");

// Save data to cache file
function saveConfigToCache(data) {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2), "utf8");
    console.log("✅ Config cache updated:", CACHE_PATH);
  } catch (err) {
    console.error("❌ Failed to write config cache:", err);
  }
}

// Load data from cache file
function loadConfigFromCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const content = fs.readFileSync(CACHE_PATH, "utf8");
      console.log("got loadConfigFromCache()");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("⚠️ Failed to read config cache:", err);
  }
  return null;
}

module.exports = { saveConfigToCache, loadConfigFromCache, CACHE_PATH };
