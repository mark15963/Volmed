//#region ===== IMPORTS =====
import { useEffect, useState } from "react";
import api from "../../../../services/api/index";
import { debug } from "../../../../utils";
//#endregion

/**
 * GeneralConfig Component
 * -----------------------
 * Displays and manages the application's general configuration settings,
 * including the site title, logo upload, and color palette customization.
 *
 * This component interacts with the global configuration context and uses
 * the `useGeneralConfig` hook to handle local input state, updates, and saving.
 * It also integrates `useSafeMessage` for user feedback and `debug` for development logging.
 *
 * @component
 * @example
 * ```jsx
 * import GeneralConfig from "@/pages/admin/general/GeneralConfig";
 *
 * function AdminDashboard() {
 *   return <GeneralConfig />;
 * }
 * ```
 *
 * @returns {JSX.Element} The rendered configuration form.
 *
 * @description
 * **Features:**
 * - Edit the website title and save changes.
 * - Upload and preview a logo image before saving.
 * - Adjust and preview header, background, and container colors.
 * - Disable inputs and show loading states during save operations.
 *
 * **Hooks used:**
 * - `useConfig()` – accesses global configuration values (title, logo, colors).
 * - `useSafeMessage()` – displays safe user notifications on success or error.
 * - `useGeneralConfig(config, safeMessage)` – manages input state and handles save/update logic.
 *
 * **Internal Functions:**
 * - `handleLogoUpdateWrapper(e: React.ChangeEvent<HTMLInputElement>): Promise<void>`
 *   Handles image file input, uploads the logo preview (without saving), and resets the input field.
 *
 * **Dependencies:**
 * - `Input` – reusable input component supporting text, color, and file types.
 * - `Button` – reusable button component with loading state support.
 * - `debug` – utility for structured console logging in development.
 * - `styles` – SCSS module defining layout and visual design.
 */
export const useGeneralConfig = (config, safeMessage) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState(() => ({
    title: config.title || "",
    header: config.color.header || "#3c97e6",
    content: config.color.content || "#a5c6e2",
    container: config.color.container || "#0073c7",
    theme: config.theme || "default",
  }));

  debug.warn(JSON.stringify(config));
  debug.warn(`First inputs ${inputs.theme}`);

  useEffect(() => {
    setInputs((prev) => ({
      title: config.title || prev.title,
      header: config.color.header || prev.header,
      content: config.color.content || prev.content,
      container: config.color.container || prev.container,
      theme: config.theme || prev.theme,
    }));
  }, [
    config.title,
    config.color.header,
    config.color.content,
    config.color.container,
    config.theme,
  ]);

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
    const { title, header, content, container, theme } = inputs;

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
        theme,
      });

      const res = await api.updateGeneralConfig({
        title,
        headerColor: header,
        contentColor: content,
        containerColor: container,
        theme,
      });
      debug.warn(`What was sent ${JSON.stringify(res)}`);

      if (!res.ok) throw new Error(res.message || "Ошибка сервера");

      // Update local state. Data from GeneralConfig.jsx
      config.setTitle(title);
      config.setColor({
        header,
        content,
        container,
      });
      config.setTheme(theme);

      debug.warn(`
        UPDATED UI DATA
        ${config.title}
        ${config.color.header}
        ${config.color.content}
        ${config.color.container}
        ${config.theme}
        `);

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
