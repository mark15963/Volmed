//#region ===== IMPORTS =====
import { useEffect, useState } from "react";
import api from "../../../../services/api/index";
import { debug } from "../../../../utils";
import { CONFIG_DEFAULTS } from "../../../../constants";
//#endregion

export const useEditGeneralConfig = (config, safeMessage) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState(() => ({
    title: config?.title,
    header: config?.color?.header,
    content: config?.color?.content,
    container: config?.color?.container,
    table: config?.theme?.table,
    app: config?.theme?.app,
  }));

  useEffect(() => {
    setInputs((prev) => {
      const updated = {
        title: config?.title ?? prev.title,
        header: config?.color?.header ?? prev.header,
        content: config?.color?.content ?? prev.content,
        container: config?.color?.container ?? prev.container,
        table: config?.theme?.table ?? prev.table,
        app: config?.theme?.app ?? prev.app,
      };
      if (JSON.stringify(updated) !== JSON.stringify(prev)) return updated;
      return prev;
    });
  }, [config]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !isLoading) {
        const active = document.activeElement;
        if (active.tagName === "INPUT" || active.tagName === "TEXTAREA") {
          e.preventDefault();
          handleSave();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isLoading, inputs]);

  //#region ===== HANDLERS =====
  const handleSave = async () => {
    const { title, header, content, container, table, app } = inputs;

    if (!title.trim()) {
      safeMessage("error", "Название сайта не может быть пустым");
      return;
    }

    try {
      setIsLoading(true);
      safeMessage("loading", "Данные сохраняются...");

      debug.log("🔄 Saving general config:", {
        title,
        header,
        content,
        container,
        table,
        app,
      });

      const res = await api.updateGeneralConfig({
        title,
        headerColor: header,
        contentColor: content,
        containerColor: container,
        tableTheme: table,
        appTheme: app,
      });

      if (!res.ok) throw new Error(res.message || "Ошибка сервера");

      // Update local state. Data from GeneralConfig.jsx
      config.setTitle(title);
      config.setColor({
        header,
        content,
        container,
      });
      config.setTheme({
        table,
        app,
      });

      setInputs((prev) => ({ ...prev }));
      safeMessage("success", "Данные сохранены!", 2.5);
    } catch (err) {
      console.error("Save failed:", err);
      safeMessage("error", "Не удалось сохранить настройки", 2.5);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpdate = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      safeMessage("error", "Выберите изображение");
      return;
    }

    try {
      setIsLoading(true);
      safeMessage("loading", "Данные сохраняются...", 1);

      const formData = new FormData();
      formData.append("logo", file);

      debug.log("🔄 Updating logo via api.uploadLogo...");
      const res = await api.uploadLogo(formData);
      debug.log("uploadLogo response:", res);

      if (!res.ok || !res.data?.logoUrl) {
        debug.error("[API ERROR] uploadLogo failed: no response data", res);
        throw new Error("Не удалось загрузить логотип");
      }

      const logoRes = await api.getLogo();
      if (logoRes.ok && logoRes.data?.logoUrl) {
        config.setLogo(`${logoRes.data.logoUrl}?t=${Date.now()}`);
      }

      safeMessage("success", "Логотип загружен!");
    } catch (err) {
      debug.error("[API ERROR] handleLogoUpdate caught error:", err);
      console.error("Logo upload failed:", err);
      safeMessage("error", "Ошибка загрузки логотипа");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };
  //#endregion

  return {
    isLoading,
    inputs,
    handleChange,
    handleSave,
    handleLogoUpdate,
  };
};
