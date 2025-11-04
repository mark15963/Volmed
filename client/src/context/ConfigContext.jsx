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

/**
 * configContext
 * ---------
 *
 * Provides global configuration data (title, color palette, and logo) across the app.
 *
 * The ConfigProvider loads data from:
 * 1. A remote or local cache (fast initialization)
 * 2. The backend API (for fresh data)
 *
 * It exposes the configuration state and updater methods via React Context,
 * so that any component can access and update configuration values using `useConfig()`.
 *
 * @example
 * // ===== USAGE =====
 * import { useConfig } from "@/context"
 *
 * const ExampleComponent = () => {
 *   const { title, setTitle, color, setColor, logo, setLogo } = useConfig()
 *
 *   return (
 *     <div style={{ backgroundColor: color.content }}>
 *       <img src={logo} alt="Site logo" />
 *       <h1>{title}</h1>
 *     </div>
 *   )
 * }
 *
 * @component
 * @param {Object} props - React component props.
 * @param {React.ReactNode} props.children - The components that will have access to the configuration context.
 *
 * @returns {JSX.Element} A context provider wrapping its children.
 *
 * @typedef {Object} ConfigContextValue
 * @property {Object} title - Current site title.
 * @property {Function} setTitle - Updates the title both locally and via API.
 * @property {Object} color - Color palette for different UI areas.
 * @property {string} color.header - Header background color.
 * @property {string} color.content - Main background color.
 * @property {string} color.container - Container color.
 * @property {Function} setColor - Updates the color palette both locally and via API.
 * @property {?string} logo - URL of the site logo image.
 * @property {Function} setLogo - Updates the logo URL (client-side only).
 * @property {boolean} isLoading - Indicates if configuration data is still loading.
 * @property {Object} defaults - Default configuration constants.
 */
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
        container: getNestedValue(cache, CONFIG_KEYS.COLOR.CONTAINER) || CONFIG_DEFAULTS.GENERAL.COLOR.CONTAINER,
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
          content: colorRes.value.data.contentColor || CONFIG_DEFAULTS.GENERAL.COLOR.CONTENT,
          container: colorRes.value.data.containerColor || CONFIG_DEFAULTS.GENERAL.COLOR.CONTAINER
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
      setTitleState(data.title)
      debug.log("✅ Title updated successfully")
    } catch (err) {
      console.error("Failed to update title:", err)
      throw err
    }
  }, [])
  const setColor = useCallback(async ({ header, content, container }) => {
    try {
      const { data } = await api.updateColor({
        headerColor: header,
        contentColor: content,
        containerColor: container
      })
      setColorState({
        header: data.headerColor,
        content: data.contentColor,
        container: data.containerColor
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

/**
 * useConfig
 * ---------
 * Custom React hook for accessing the global configuration context.
 *
 * Must be used within a `<ConfigProvider>`.
 *
 * @throws {Error} Throws if used outside of a ConfigProvider.
 *
 * @returns {ConfigContextValue} The current configuration state and updater functions.
 * 
 * @example
 * const { color, title } = useConfig();
 * console.log(color.header, title);
 */
export const useConfig = () => {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider")
  }
  return context
}