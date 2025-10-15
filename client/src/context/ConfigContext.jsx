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

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [title, setTitleState] = useState({
    top: "",
    bottom: ""
  });
  const [color, setColorState] = useState({
    header: '#3c97e6',
    content: '#a5c6e2',
  })
  const [logo, setLogoState] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadFromCache = useCallback(async () => {
    try {
      const cacheUrl = `${import.meta.env.VITE_API_URL.replace(/\/api$/, "")}/cache/config-cache.json?t=${Date.now()}`
      const res = await fetch(cacheUrl, {
        cache: "no-cache",
      })

      if (!res.ok) throw new Error("Cache not found")
      const cache = await res.json()

      if (cache.general?.title) {
        setTitleState({
          top: cache.general.title.topTitle || "",
          bottom: cache.general.title.bottomTitle || "",
        })
      }
      if (cache.general?.color) {
        setColorState({
          header: cache.general.color.headerColor || "#3c97e6",
          content: cache.general.color.contentColor || "#a5c6e2",
        })
      }
      if (cache.general?.logoUrl) {
        setLogoState(cache.general.logoUrl)
      }

      console.log("✅ Loaded config from cache");
      return true;
    } catch (err) {
      console.warn("⚠️ No local config cache found or failed to load:", err);
      return false;
    }
  }, [])

  const fetchFromApi = useCallback(async () => {
    try {
      const [titleRes, colorRes, logoRes] = await Promise.allSettled([
        api.getTitle(),
        api.getColor(),
        api.getLogo()
      ])

      if (titleRes.status === 'fulfilled') {
        setTitleState({
          top: titleRes.value.data.topTitle,
          bottom: titleRes.value.data.bottomTitle,
        })
      }

      if (colorRes.status === 'fulfilled') {
        setColorState({
          header: colorRes.value.data.headerColor,
          content: colorRes.value.data.contentColor
        })
      }

      if (logoRes.status === 'fulfilled') {
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
      const cacheLoaded = await loadFromCache()

      await fetchFromApi()
      setIsLoading(false)
    }

    initializeConfig()
  }, [loadFromCache, fetchFromApi])

  // --- Update setters ---
  const setTitle = useCallback(async ({ top, bottom }) => {
    try {
      const { data } = await api.updateTitle({
        topTitle: top,
        bottomTitle: bottom
      })
      setTitleState({
        top: data.topTitle,
        bottom: data.bottomTitle
      })
    } catch (err) {
      console.error("Failed to update title:", err)
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
    } catch (err) {
      console.error("Failed to update Color:", err)
    }
  }, [])
  const setLogo = useCallback(async (fileUrl) => {
    setLogoState(fileUrl)
  }, [])

  return (
    <ConfigContext.Provider value={{
      title,
      setTitle,
      color,
      setColor,
      logo,
      setLogo,
      isLoading
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);