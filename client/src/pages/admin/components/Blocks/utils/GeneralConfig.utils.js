import { useEffect } from "react";
import debug from "@/utils/debug";
import api from "../../../../../services/api";

/**
 * @typedef {Object} ConfigContext
 * @property {string} title - The current website title.
 * @property {(title: string) => void} setTitle - Function to update the site title in context.
 * @property {Object} color - Object containing current UI colors.
 * @property {string} color.header - Header background color in HEX format.
 * @property {string} color.content - Content background color in HEX format.
 * @property {string} color.container - Container background color in HEX format.
 * @property {(colors: {header: string, content: string, container: string}) => void} setColor - Function to update color palette in context.
 * @property {string} logo - The URL of the current logo image.
 * @property {(logoUrl: string) => void} setLogo - Function to update the logo URL in context.
 */

/**
 * Custom React hook for managing the business logic of the General Configuration page.
 *
 * This hook encapsulates all asynchronous operations and side effects related to
 * saving and updating general configuration data, such as:
 * - Site title
 * - Color palette (header, content, container)
 * - Logo upload and preview
 *
 * It communicates with the backend via the `api` service and manages local state
 * updates through the provided context setters.
 *
 * @function useGeneralConfigLogic
 *
 * @param {ConfigContext} config - Configuration context object.
 * @param {(type: "success" | "error" | "loading", message: string, duration?: number) => void} safeMessage - Function to safely display messages to the user (status notifications).
 * @param {(loading: boolean) => void} setIsLoading - Setter to control the loading state.
 *
 * @returns {{ handleSave: Function, handleLogoUpdate: Function }} Object containing handlers for saving and updating configuration.
 *
 * @example
 * ```jsx
 * const { handleSave, handleLogoUpdate } = useGeneralConfigLogic(config, safeMessage, setIsLoading);
 *
 * await handleSave("My Site", "#FFFFFF", "#F5F5F5", "#E0E0E0");
 * await handleLogoUpdate(selectedFile);
 * ```
 *
 * @description
 * This hook is used internally by `useGeneralConfig` and should not be called directly
 * by UI components. It centralizes API logic and keeps UI layers declarative.
 */
export const useGeneralConfigLogic = (config, safeMessage, setIsLoading) => {
  const { title, setTitle, color, setColor, logo, setLogo } = config;

  /**
   * Saves the general configuration data to the backend.
   *
   * @async
   * @function handleSave
   * @param {string} titleInput - New website title.
   * @param {string} headerColorInput - Header color in HEX format.
   * @param {string} contentColorInput - Content background color in HEX format.
   * @param {string} containerColorInput - Container background color in HEX format.
   * @throws {Error} Throws if any API call fails.
   *
   * @description
   * Updates title and color palette in the backend, then syncs local context state.
   */
  const handleSave = async (
    titleInput,
    headerColorInput,
    contentColorInput,
    containerColorInput
  ) => {
    try {
      setIsLoading(true);
      safeMessage("loading", "Данные сохраняются...", 1);

      debug.log("🔄 Saving data:", {
        title: titleInput,
        headerColor: headerColorInput,
        contentColor: contentColorInput,
        containerColor: containerColorInput,
      });

      // Update title
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

      // Update colors
      try {
        debug.log("🔄 Updating colors...");
        const colors = await api.updateColor({
          headerColor: headerColorInput,
          contentColor: contentColorInput,
          containerColor: containerColorInput,
        });
        if (
          colors.data.headerColor === headerColorInput &&
          colors.data.contentColor === contentColorInput &&
          colors.data.containerColor === containerColorInput
        )
          debug.log("✅ Colors updated successfully");
        else debug.error("❌ Color update failed");
      } catch (colorErr) {
        console.error("❌ Color update failed:", colorErr);
        throw new Error(`Color update failed: ${colorErr.message}`);
      }

      // Update local state
      setTitle(titleInput);
      setColor({
        header: headerColorInput,
        content: contentColorInput,
        container: containerColorInput,
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

  /**
   * Uploads a new logo image to the server and updates it locally.
   *
   * @async
   * @function handleLogoUpdate
   * @param {File} file - The selected image file for upload.
   * @returns {Promise<void>} Resolves after upload and preview update.
   *
   * @description
   * Validates the file type, uploads it via API, and updates the logo in context.
   * Displays progress and success/error messages via `safeMessage`.
   */
  const handleLogoUpdate = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      safeMessage("error", "Пожалуйста, выберите файл изображения");
      return;
    }

    try {
      safeMessage("loading", "Данные сохраняются...", 1);
      setIsLoading(true);

      const formData = new FormData();
      formData.append("logo", file);

      debug.log("🔄 Updating logo...");

      const res = await api.uploadLogo(formData);
      if (!res || !res.data || !res.data.logoUrl) {
        debug.error("[API ERROR] uploadLogo: no logoUrl in response", res);
        throw new Error("No logoUrl returned from server");
      }

      const logo = await api.getLogo();
      if (logo) debug.log("Returned updated logo from server");

      setLogo(`${res.data.logoUrl}?t=${Date.now()}`);
      safeMessage("success", "Логотип загружен!");
    } catch (err) {
      debug.error("[API ERROR] uploadLogo:", err);
      safeMessage("error", "Ошибка загрузки логотипа! Проверьте сервер.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSave,
    handleLogoUpdate,
  };
};

/**
 * React hook that enables "Enter" key to trigger configuration saving.
 *
 * @function useKeyboardSave
 * @param {Function} handleSave - Function to call when "Enter" is pressed.
 * @param {boolean} isLoading - Indicates if a save operation is currently in progress.
 *
 * @example
 * ```jsx
 * useKeyboardSave(handleSave, isLoading);
 * ```
 *
 * @description
 * - Listens for global keydown events.
 * - If the active element is an input or textarea and not loading,
 *   pressing "Enter" will trigger the provided `handleSave` function.
 * - Cleans up the event listener when the component unmounts.
 */
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
