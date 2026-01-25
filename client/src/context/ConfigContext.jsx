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
//
// logo:
// - logoUrl
//
// theme:
// - default (blue)
// - light
// - dark
// 
//#endregion

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import api from "../services/api/index";
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
 *   const { title, setTitle, color, setColor, logo, setLogo, theme, setTheme } = useConfig()
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
 * @property {?string} theme
 * @property {Function} setTheme
 * @property {boolean} isLoading - Indicates if configuration data is still loading.
 * @property {Object} defaults - Default configuration constants.
 */
export const ConfigProvider = ({ children }) => {
  const [title, setTitleState] = useState(CONFIG_DEFAULTS.GENERAL.TITLE);
  const [color, setColorState] = useState(CONFIG_DEFAULTS.GENERAL.COLOR)
  const [logo, setLogoState] = useState(CONFIG_DEFAULTS.GENERAL.LOGO)
  const [theme, setThemeState] = useState(CONFIG_DEFAULTS.GENERAL.THEME)
  const [isLoading, setIsLoading] = useState(true)

  const loadFromCache = useCallback(async () => {
    try {
      const res = await api.getGeneralConfig()

      if (!res.ok || !res.data) {
        throw new Error(res.message || "API returned no data");
      }

      const cache = res.data;

      // --- Apply cached data ---
      setTitleState(cache.general?.title ?? CONFIG_DEFAULTS.GENERAL.TITLE,)
      setColorState({
        header: cache.general?.color?.headerColor ?? CONFIG_DEFAULTS.GENERAL.COLOR.HEADER,
        content: cache.general?.color?.contentColor ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTENT,
        container: cache.general?.color?.containerColor ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTAINER,
      })
      setLogoState(cache.general?.logoUrl ?? CONFIG_DEFAULTS.GENERAL.LOGO)
      setThemeState(cache.general?.theme ?? CONFIG_DEFAULTS.GENERAL.THEME)

      debug.table(cache.general, "Cache data")

      return true;
    } catch (err) {
      debug.warn("Failed to load config from API:", err);
      return false
    }
  }, [])

  const fetchFromApi = useCallback(async () => {
    try {
      const [configRes, logoRes] = await Promise.allSettled([
        api.getGeneralConfig(),
        api.getLogo()
      ])

      if (configRes.status === "fulfilled" && configRes.value?.ok && configRes.value.data) {
        const data = configRes.value.data;
        setTitleState(data.general.title ?? CONFIG_DEFAULTS.GENERAL.TITLE)
        setColorState({
          header: data.general.color?.headerColor ?? CONFIG_DEFAULTS.GENERAL.COLOR.HEADER,
          content: data.general.color?.contentColor ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTENT,
          container: data.general.color?.containerColor ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTAINER,
        });
        setThemeState(data.general.theme ?? CONFIG_DEFAULTS.GENERAL.THEME)

      }

      if (logoRes.status === "fulfilled" && logoRes.value?.ok && logoRes.value.data?.logoUrl) {
        setLogoState(logoRes.value.data.logoUrl)
      }
    } catch (err) {
      console.error("[API ERROR] fetchFromApi failed:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // --- Initial load ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)

      await loadFromCache()
      await fetchFromApi()

      setIsLoading(false)
    }

    init()
  }, [loadFromCache, fetchFromApi])

  // --- Update setters ---
  const updateGeneral = async (updates) => {
    try {
      const res = await api.updateGeneralConfig(updates)
      if (!res.ok || !res.data) {
        debug.warn("updateGeneralConfig failed:", res)
        return false
      }

      const data = res.data

      setTitleState((data.title ?? title) || CONFIG_DEFAULTS.GENERAL.TITLE)
      if (data.color) {
        setColorState(prev => {
          const serverColor = data.color || {};

          return {
            header: (serverColor.headerColor ?? prev.header) ?? CONFIG_DEFAULTS.GENERAL.COLOR.HEADER,
            content: (serverColor.contentColor ?? prev.content) ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTENT,
            container: (serverColor.containerColor ?? prev.container) ?? CONFIG_DEFAULTS.GENERAL.COLOR.CONTAINER,
          };
        });
      }
      setThemeState((data.theme ?? theme) || CONFIG_DEFAULTS.GENERAL.THEME)
      debug.log("Config updated (with safeguards):", { title, color, theme });
      return true;
    } catch (err) {
      debug.error("Failed to update config:", err)
      return false;
    }
  }

  const setTitle = async (title) => updateGeneral({ title });
  const setColor = async (colorObj) =>
    updateGeneral({
      headerColor: colorObj.header,
      contentColor: colorObj.content,
      containerColor: colorObj.container,
    });
  const setTheme = async (theme) => updateGeneral({ theme });

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