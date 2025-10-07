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

  const loadFromCache = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL.replace(/\/api$/, "")}/cache/config-cache.json`, {
        cache: "no-store",
      })
      if (!res.ok) return
      const cache = await res.json()

      if (cache.general?.title) {
        setLogoState({
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
    } catch (err) {
      console.warn("⚠️ No local config cache found or failed to load:", err);
    }
  }, [])

  // --- Fallback: fetch from API ---
  const fetchTitle = useCallback(async () => {
    try {
      const { data } = await api.getTitle();
      setTitleState({
        top: data.topTitle,
        bottom: data.bottomTitle,
      })
    } catch {
      console.error("Cannot fetch title")
    }
  }, [])
  const fetchColor = useCallback(async () => {
    try {
      const { data } = await api.getColor();
      setColorState({
        header: data.headerColor,
        content: data.contentColor
      })
    } catch {
      console.error("Cannot fetch color")
    }
  }, [])
  const fetchLogo = useCallback(async () => {
    try {
      const { data } = await api.getLogo()
      setLogoState(data.logoUrl)
    } catch {
      console.error("Cannon fetch logo")
    }
  }, [])

  // --- Initial load ---
  useEffect(() => {
    (async () => {
      await loadFromCache() // ⚡ Instant load
      await Promise.all([fetchTitle(), fetchColor(), fetchLogo()]) // 🔁 Refresh from DB
    })();
  }, [loadFromCache, fetchTitle, fetchColor, fetchLogo])

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
      setLogo
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);