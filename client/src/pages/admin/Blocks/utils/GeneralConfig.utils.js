import debug from "../../../../utils/debug";

import api from "../../../../services/api";
import { useEffect } from "react";

export const useGeneralConfigLogic = (config, safeMessage, setIsLoading) => {
  const { title, setTitle, color, setColor, logo, setLogo } = config;

  const handleSave = async (
    titleInput,
    headerColorInput,
    contentColorInput
  ) => {
    try {
      setIsLoading(true);
      safeMessage("loading", "Данные сохраняются...", 1);

      debug.log("🔄 Saving data:", {
        title: titleInput,
        headerColor: headerColorInput,
        contentColor: contentColorInput,
      });

      // Update title and color
      try {
        debug.log("🔄 Updating title...");
        await api.updateTitle({
          title: titleInput,
        });
        const title = await api.getTitle();
        if (title.data.title === titleInput)
          debug.log("✅ Title updated successfully");
        else debug.error("❌ Title update failed");
      } catch (titleErr) {
        console.error("❌ Title update failed:", titleErr);
        throw new Error(`Title update failed: ${titleErr.message}`);
      }

      try {
        debug.log("🔄 Updating colors...");
        const colors = await api.updateColor({
          headerColor: headerColorInput,
          contentColor: contentColorInput,
        });
        if (
          colors.data.headerColor === headerColorInput &&
          colors.data.contentColor === contentColorInput
        )
          debug.log("✅ Colors updated successfully");
        else debug.error("❌ Color update failed");
      } catch (colorErr) {
        console.error("❌ Color update failed:", colorErr);
        throw new Error(`Color update failed: ${colorErr.message}`);
      }

      // Update local state
      setTitle({
        title: titleInput,
      });
      setColor({
        header: headerColorInput,
        content: contentColorInput,
      });

      safeMessage("success", "Данные сохранены!", 2.5);
    } catch (err) {
      console.error("Failed to update title:", err);
      safeMessage("error", "Ошибка!", 2.5);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpdate = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      safeMessage("error", "Пожалуйста, выберите файл изображения");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("logo", file);

      const res = await api.uploadLogo(formData);
      setLogo(`${res.data.logoUrl}?t=${Date.now()}`);
      safeMessage("success", "Логотип загружен!");
    } catch (err) {
      console.error("Failed to upload logo:", err);
      safeMessage("error", "Ошибка загрузки логотипа!");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSave,
    handleLogoUpdate,
  };
};

export const useKeyboardSave = (handleSave, isLoading) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !isLoading) {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA";
        if (isInputFocused) {
          e.preventDefault();
          handleSave();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isLoading, handleSave]);
};
