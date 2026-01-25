const fs = require('fs/promises')
const path = require('path');
const debug = require('./debug')

const CACHE_FILE = path.join(process.cwd(), 'cache', 'config-cache.json')
const CACHE_TTL_MS = 1000 * 60 * 60 * 24

interface CachedGeneralConfig{
  general:{
    title: string,
    color:{
      headerColor: string
      contentColor: string
      containerColor: string
    }
    logoUrl?: string
    theme: string
  }
    timestamp: number
}

interface LegacyCachedConfig {
    title: string;
    color?: {
      headerColor: string;
      contentColor: string;
      containerColor: string;
    };
    logoUrl?: string;
    theme: string;
    timestamp?: number;
}

type AnyCachedConfig = CachedGeneralConfig | LegacyCachedConfig

let memoryCache: CachedGeneralConfig | null = null

/**
 * Load config from cache file (falls back to memory if fresh)
 * @returns {Promise<CachedGeneralConfig | null>}
 */
async function getCacheConfig(): Promise<CachedGeneralConfig | null> {
  if(memoryCache && Date.now() - memoryCache.timestamp < CACHE_TTL_MS){
    debug.success('Cache hit (in-memory)')
    return memoryCache
  }
  try{
    const content = await fs.readFile(CACHE_FILE, 'utf-8')
    /** @type {AnyCachedConfig} */
    let parsed = JSON.parse(content)

    if (!('general' in parsed)) {
debug.log('Converting legacy flat cache to new nested format');    parsed = {
  general:{
      title: (parsed as LegacyCachedConfig).title || '',
      color: (parsed as LegacyCachedConfig).color || {
        headerColor:'#3c97e6',
        contentColor:'#a5c6e2',
        containerColor:'#0073c7',
      },
      theme: (parsed as LegacyCachedConfig).theme || 'default',
      logoUrl: (parsed as LegacyCachedConfig).logoUrl,
    },
      timestamp: (parsed as LegacyCachedConfig).timestamp ?? Date.now(),
    };
    debug.log("Converted old nested cache format to new flat format");
    await setCacheConfig(parsed.general);
  }
  /** @type {CachedGeneralConfig} */
  const config = parsed
  
    if(
      !config.general.title ||
      !config.general.color ||
      !config.general.theme ||
      typeof config.timestamp !== 'number'
    ){
      debug.warn("Invalid cache form - discarding")
      return null
    }

    if (Date.now() - config.timestamp >= CACHE_TTL_MS){
      debug.warn("Cache expired")
      return null
    }

    memoryCache = config
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

/**
 * Save config — always in new nested format
 * @param data - Flat config object (without timestamp)
 */
async function setCacheConfig(data:Omit<CachedGeneralConfig['general'], never>) {
  const fullData: CachedGeneralConfig = {
    general: {...data},
    timestamp: Date.now()
  }

  memoryCache = fullData

  try{
    await fs.mkdir(path.dirname(CACHE_FILE), {recursive: true})

    const tmpPath = CACHE_FILE + '.tmp'
    await fs.writeFile(tmpPath, JSON.stringify(fullData,null,2), 'utf-8')
    await fs.copyFile(tmpPath, CACHE_FILE)
    // await fs.unlink(tmpPath).catch(() => {});

    debug.success("Cache saved to disk")
  } catch (err: any){
    debug.error("Failed to save cache to disk:", err)
    await fs.unlink(`${CACHE_FILE}.tmp`).catch(() => {});
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

module.exports = { getCacheConfig, setCacheConfig, clearCache };