//#region ===== USEAGE =====
// import { useConfig } from "@/context"
//
// const config = useConfig()
// const { title, setTitle, color, setColor, logo, setLogo, theme, setTheme } = config
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
// - color.container
//
// logo:
// - logoUrl
//
// theme:
// - table
// -- default (blue)
// -- light
// -- dark
// - app
// -- default (blue)
// -- light
// -- dark
// 
//#endregion

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import api from "../services/api/index";
import {
  CONFIG_DEFAULTS,
} from "../constants"
import debug from "../utils/debug";
import { loadFromLocalStorage, saveToLocalStorage } from "../services/localStorage/localCache";

const ConfigContext = createContext(null);

const CONFIG_CACHE_KEY = "app_config_cache_v1";
const CONFIG_EXP = 1000 * 60 * 60 * 24 * 30

// /**
//  * configContext
//  * ---------
//  *
//  * Provides global configuration data (title, color palette, and logo) across the app.
//  *
//  * The ConfigProvider loads data from:
//  * 1. A remote or local cache (fast initialization)
//  * 2. The backend API (for fresh data)
//  *
//  * It exposes the configuration state and updater methods via React Context,
//  * so that any component can access and update configuration values using `useConfig()`.
//  *
//  * @example
//  * // ===== USAGE =====
//  * import { useConfig } from "@/context"
//  *
//  * const ExampleComponent = () => {
//  *   const { title, setTitle, color, setColor, logo, setLogo, theme, setTheme } = useConfig()
//  *
//  *   return (
//  *     <div style={{ backgroundColor: color.content }}>
//  *       <img src={logo} alt="Site logo" />
//  *       <h1>{title}</h1>
//  *     </div>
//  *   )
//  * }
//  *
//  * @component
//  * @param {Object} props - React component props.
//  * @param {React.ReactNode} props.children - The components that will have access to the configuration context.
//  *
//  * @returns {JSX.Element} A context provider wrapping its children.
//  *
//  * @typedef {Object} ConfigContextValue
//  * @property {Object} title - Current site title.
//  * @property {Function} setTitle - Updates the title both locally and via API.
//  * @property {Object} color - Color palette for different UI areas.
//  * @property {string} color.header - Header background color.
//  * @property {string} color.content - Main background color.
//  * @property {string} color.container - Container color.
//  * @property {Function} setColor - Updates the color palette both locally and via API.
//  * @property {?string} logo - URL of the site logo image.
//  * @property {Function} setLogo - Updates the logo URL (client-side only).
//  * @property {?string} theme
//  * @property {Function} setTheme
//  * @property {boolean} isLoading - Indicates if configuration data is still loading.
//  * @property {Object} defaults - Default configuration constants.
//  */

export const ConfigProvider = ({ children }) => {
  const [title, setTitleState] = useState(CONFIG_DEFAULTS.GENERAL.TITLE);
  const [color, setColorState] = useState(CONFIG_DEFAULTS.GENERAL.COLOR);
  const [logo, setLogoState] = useState(CONFIG_DEFAULTS.GENERAL.LOGO);
  const [theme, setThemeState] = useState(CONFIG_DEFAULTS.GENERAL.THEME);
  const [isLoading, setIsLoading] = useState(true)

  // --- Initial load ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)

      // 1. Fast path: local cache (no network)
      const cached = loadFromLocalStorage(CONFIG_CACHE_KEY, CONFIG_EXP)
      if (cached?.general) {
        // Apply cached values
        setTitleState(cached.general?.title ?? CONFIG_DEFAULTS.GENERAL.TITLE)
        setColorState({
          header: cached.general?.color?.headerColor ?? CONFIG_DEFAULTS.GENERAL.COLOR.HEADER,
          content: cached.general?.color?.contentColor ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTENT,
          container: cached.general?.color?.containerColor ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTAINER,
        })
        setLogoState(cached.general?.logoUrl ?? CONFIG_DEFAULTS.GENERAL.LOGO)
        setThemeState({
          table: cached.general?.theme?.tableTheme ?? CONFIG_DEFAULTS.GENERAL.THEME.TABLE,
          app: cached.general?.theme?.appTheme ?? CONFIG_DEFAULTS.GENERAL.THEME.APP
        })

        debug.table(cached.general, "Loaded from local cache")
      } else {
        debug.warn("Loading from server")
      }

      // 2. Try to refresh from server (background)
      await refreshConfig()

      setIsLoading(false)
    }

    init()
  }, [])

  // ── Auto-save to localStorage whenever values change (after init) ─────────
  useEffect(() => {
    if (isLoading) return

    saveToLocalStorage(CONFIG_CACHE_KEY, {
      general: {
        title,
        color: {
          headerColor: color.header,
          contentColor: color.content,
          containerColor: color.container
        },
        logoUrl: logo,
        theme: {
          table: theme.table,
          app: theme.app
        }
      }
    })
  }, [title, color, logo, theme, isLoading, saveToLocalStorage])

  // ── Refresh from API ──
  const refreshConfig = useCallback(async () => {
    try {
      const [configRes, logoRes] = await Promise.allSettled([
        api.getGeneralConfig(),
        api.getLogo()
      ])

      if (configRes.status === "fulfilled" && configRes.value?.ok && configRes.value.data?.general) {

        const gen = configRes.value.data.general;
        setTitleState(gen.title ?? title ?? CONFIG_DEFAULTS.GENERAL.TITLE)
        setColorState((prev) => ({
          header: gen.color?.headerColor ?? prev.header ?? CONFIG_DEFAULTS.GENERAL.COLOR.HEADER,
          content: gen.color?.contentColor ?? prev.content ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTENT,
          container: gen.color?.containerColor ?? prev.container ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTAINER,
        }))
        console.log(gen.theme?.table)
        setThemeState((prev) => ({
          table: gen.theme?.tableTheme ?? prev.table ?? CONFIG_DEFAULTS.GENERAL.THEME.TABLE,
          app: gen.theme?.appTheme ?? prev.app ?? CONFIG_DEFAULTS.GENERAL.THEME.APP
        }))

        // Save fresh data
        saveToLocalStorage(CONFIG_CACHE_KEY, {
          ...configRes.value.data,
          general: {
            ...configRes.value.data.general,
          }
        })
        debug.success('Fresh config loaded and cached')
      }

      if (logoRes.status === "fulfilled" && logoRes.value?.ok && logoRes.value.data?.logoUrl) {
        setLogoState(logoRes.value.data.logoUrl)
      }
    } catch (err) {
      console.error("[CONFIG] Refresh failed:", err)
      debug.warn("API refresh failed → keeping cached/default values");
    }
  }, [title, saveToLocalStorage])


  // --- Update setters ---
  const updateGeneral = async (updates) => {
    try {
      // Updating data DB
      const res = await api.updateGeneralConfig(updates)
      if (!res.ok || !res.data) {
        debug.warn("updateGeneralConfig failed:", res)
        return false
      }

      const data = res.data
      debug.log("Server returned after update:", data)

      setTitleState((prev) => data.title ?? prev ?? CONFIG_DEFAULTS.GENERAL.TITLE)
      if (data.color) {
        setColorState((prev) => ({
          header: data.color.headerColor ?? prev.header ?? CONFIG_DEFAULTS.GENERAL.COLOR.HEADER,
          content: data.color.contentColor ?? prev.content ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTENT,
          container: data.color.containerColor ?? prev.container ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTAINER,
        }))
      }
      if (data.theme) {
        setThemeState(prev => ({
          table: data.theme.tableTheme ?? prev.table ?? CONFIG_DEFAULTS.GENERAL.THEME.TABLE,
          app: data.theme.appTheme ?? prev.app ?? CONFIG_DEFAULTS.GENERAL.THEME.APP
        }))
      }

      debug.log("Updated UI", { title, color, theme });
      return true;
    } catch (err) {
      debug.error("Failed to update UI:", err)
      return false;
    }
  }

  const setTitle = async (newTitle) => updateGeneral({ title: newTitle });
  const setColor = async (colorObj) =>
    updateGeneral({
      headerColor: colorObj.header,
      contentColor: colorObj.content,
      containerColor: colorObj.container,
    });
  const setTheme = async (themeObj) =>
    updateGeneral({
      tableTheme: themeObj.table,
      appTheme: themeObj.app
    });
  const setLogo = useCallback((url) => {
    setLogoState(url);
    debug.log("Logo updated locally:", url);
  }, []);

  const value = {
    title,
    setTitle,
    color,
    setColor,
    logo,
    setLogo,
    theme,
    setTheme,
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
export default ConfigProvider