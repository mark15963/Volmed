// const { loadConfigFromCache, saveConfigToCache } = require("./configCache");
const fs = require('fs/promises')
const path = require('path');
const debug = require('./debug')

const CACHE_FILE = path.join(process.cwd(), 'cache', 'config-cache.json')
const CACHE_TTL_MS = 1000 * 60 * 60 * 24

interface CachedGeneralConfig{
  title: string,
  color:{
    headerColor: string
    contentColor: string
    containerColor: string
  }
  logoUrl?: string
  theme: string
  timestamp: number
}

interface LegacyCachedConfig {
  general: {
    title: string;
    color?: {
      headerColor: string;
      contentColor: string;
      containerColor: string;
    };
    logoUrl?: string;
    theme: string;
  };
  timestamp?: number; // may be missing
}

type AnyCachedConfig = CachedGeneralConfig | LegacyCachedConfig

let memoryCache: CachedGeneralConfig | null = null
// const CACHE_KEY = "general";

/**
 * Load config from cache file (falls back to memory if fresh)
 * @returns {Promise<CachedGeneralConfig | null>}
 */
async function getGeneralConfig(): Promise<CachedGeneralConfig | null> {
  if(memoryCache && Date.now() - memoryCache .timestamp < CACHE_TTL_MS){
    debug.success('Cache hit (in-memory)')
    return memoryCache
  }
  try{
    const content = await fs.readFile(CACHE_FILE, 'utf-8')
    /** @type {AnyCachedConfig} */
    let parsed = JSON.parse(content)

    if ('general' in parsed) {
    const old = parsed.general
    parsed = {
      title: old.title || '',
      color: old.color || {
        headerColor:'#3c97e6',
        contentColor:'#a5c6e2',
        containerColor:'#0073c7',
      },
      theme: old.theme || 'default',
      logoUrl: old.logoUrl,
      timestamp: parsed.timestamp ?? Date.now(), // add missing timestamp
    };
    debug.log("Converted old nested cache format to new flat format");
  }
  /** @type {CachedGeneralConfig} */
  const config = parsed
  
    if(
      !parsed.title ||
      !parsed.color ||
      !parsed.theme ||
      typeof parsed.timestamp !== 'number'
    ){
      debug.warn("Invalid cache form - discarding")
      return null
    }

    if (Date.now() - parsed.timestamp >= CACHE_TTL_MS){
      debug.warn("Cache expired")
      return null
    }

    memoryCache = parsed
    debug.success("Loaded fresh cache from file")
    return memoryCache
  } catch (err: any){
    if(err.code === 'ENOENT'){
      debug.log("No cache file found")
    } else {
      debug.error("Failed to load cache:", err)
    }
    return null
  }
}

async function setGeneralConfig(data:Omit<CachedGeneralConfig, 'timestamp'>) {
  const fullData: CachedGeneralConfig = {
    ...data,
    timestamp: Date.now()
  }

  memoryCache = fullData

  try{
    await fs.mkdir(path.dirname(CACHE_FILE), {recursive: true})

    const tmpPath = CACHE_FILE + '.tmp'
    await fs.writeFile(tmpPath, JSON.stringify(fullData,null,2), 'utf-8')
    await fs.rename(tmpPath, CACHE_FILE)

    debug.success("Cache saved to disk")
  } catch (err){
    debug.error("Failed to save cache to disk:", err)
  }
}

async function clearCache() {
  memoryCache = null
  try{
    await fs.unlink(CACHE_FILE)
    debug.success("Cache cleared")
  }catch (err: any){
    if(err.code !== 'ENOENT'){
      debug.error('Failed to clear cache file:', err)
    }
  }
}

module.exports = { getGeneralConfig, setGeneralConfig, clearCache };

// function getCachedConfig() {
//   const cache = loadConfigFromCache();
//   return cache && cache[CACHE_KEY] ? cache[CACHE_KEY] : null;
// }
// 
// /**
//  * Saves a complete configuration object to cache.
//  *
//  * @param {Object} fullConfig - Complete config: { title, color: {...}, theme, ... }
//  */
// function saveCachedConfig(newData) {
//   const cache = loadConfigFromCache() || {};
//   cache[CACHE_KEY] = {
//     title: newData.title,
//     color: {
//       headerColor: newData.color?.headerColor,
//       contentColor: newData.color?.contentColor,
//       containerColor: newData.color?.containerColor,
//     },
//     theme: newData.theme,
//     logoUrl: newData.logoUrl || cache[CACHE_KEY]?.logoUrl, // if you want to preserve logo
//   };
//   saveConfigToCache(cache);
// }
// 
// module.exports = { getCachedConfig, saveCachedConfig };
