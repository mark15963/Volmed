//#region ===== USEAGE =====
// import { useConfig } from "...../context"
//
// const config = useConfig()
// const { title, setTitle, color, setColor, logo, setLogo } = config
//
// -----------------------------------------------
//
// title:
// - title.top
// - title.bottom
// 
// color:
// - color.header
// - color.content
//
// logo:
// - logoUrl
//
//#endregion

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import api from "../services/api";
import {
  CONFIG_DEFAULTS,
  CACHE_CONFIG,
  CONFIG_KEYS
} from "../constants"
import debug from "../utils/debug";

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [title, setTitleState] = useState("");
  const [color, setColorState] = useState({
    header: '#3c97e6',
    content: '#a5c6e2',
  })
  const [logo, setLogoState] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const getNestedValue = useCallback((obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }, [])

  const loadFromCache = useCallback(async () => {
    try {
      let res
      try {
        let serverUrl = `${CACHE_CONFIG.CACHE_URL}${CACHE_CONFIG.CACHE_BUSTER}`
        res = await fetch(serverUrl, CACHE_CONFIG.CACHE_OPTIONS)
        if (!res.ok) throw new Error(`Server cache returned ${res.status}`);
      } catch (err) {
        debug.warn("⚠️ Server cache not found, falling back to local cache:", err.message);
        res = await fetch("/cache/config-cache.json");
        if (!res.ok) throw new Error(`Local cache returned ${res.status}`);
      }

      // --- Parse JSON ---
      const cache = await res.json()
      debug.log("Cache:", JSON.stringify(cache, null, 2))

      // --- Apply cached data ---
      const cachedTitle = getNestedValue(cache, CONFIG_KEYS.TITLE)
      setTitleState(cachedTitle || CONFIG_DEFAULTS.GENERAL.TITLE,)
      setColorState({
        header: getNestedValue(cache, CONFIG_KEYS.COLOR.HEADER) || CONFIG_DEFAULTS.GENERAL.COLOR.HEADER,
        content: getNestedValue(cache, CONFIG_KEYS.COLOR.CONTENT) || CONFIG_DEFAULTS.GENERAL.COLOR.CONTENT,
      })
      const cachedLogo = getNestedValue(cache, CONFIG_KEYS.LOGO)
      setLogoState(cachedLogo || CONFIG_DEFAULTS.GENERAL.LOGO)

      debug.log("✅ Loaded config from cache");
      return true;
    } catch (err) {
      debug.warn("⚠️ No local config cache found or failed to load:", err);
      return false;
    }
  }, [getNestedValue])

  const fetchFromApi = useCallback(async () => {
    try {
      const [titleRes, colorRes, logoRes] = await Promise.allSettled([
        api.getTitle(),
        api.getColor(),
        api.getLogo()
      ])

      if (titleRes.status === 'fulfilled') {
        setTitleState(titleRes.value.data.title || CONFIG_DEFAULTS.GENERAL.TITLE)
      }
      if (colorRes.status === 'fulfilled') {
        setColorState({
          header: colorRes.value.data.headerColor || CONFIG_DEFAULTS.GENERAL.COLOR.HEADER,
          content: colorRes.value.data.contentColor || CONFIG_DEFAULTS.GENERAL.COLOR.CONTENT
        })
      }
      if (logoRes.status === 'fulfilled' && logoRes.value.data.logoUrl) {
        setLogoState(logoRes.value.data.logoUrl)
      }

    } catch (error) {
      console.error("Error fetching from API:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // --- Initial load ---
  useEffect(() => {
    const initializeConfig = async () => {
      setIsLoading(true)

      await loadFromCache()
      await fetchFromApi()

      setIsLoading(false)
    }

    initializeConfig()
  }, [loadFromCache, fetchFromApi])

  // --- Update setters ---
  const setTitle = useCallback(async (titleData) => {
    try {
      const { data } = await api.updateTitle({ title: titleData })
      setTitleState(data)
      debug.log("✅ Title updated successfully")
    } catch (err) {
      console.error("Failed to update title:", err)
      throw err
    }
  }, [])
  const setColor = useCallback(async ({ header, content }) => {
    try {
      const { data } = await api.updateColor({
        headerColor: header,
        contentColor: content,
      })
      setColorState({
        header: data.headerColor,
        content: data.contentColor,
      })
      debug.log("✅ Colors updated successfully")
    } catch (err) {
      console.error("Failed to update colors:", err)
      throw err
    }
  }, [])
  const setLogo = useCallback(async (fileUrl) => {
    setLogoState(fileUrl)
  }, [])

  const value = {
    title,
    setTitle,
    color,
    setColor,
    logo,
    setLogo,
    isLoading,
    defaults: CONFIG_DEFAULTS
  }

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider")
  }
  return context
}