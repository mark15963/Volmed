//#region ===== IMPORTS =====
import { useEffect, useState } from "react";
import {
  useGeneralConfigLogic,
  useKeyboardSave,
} from "../utils/GeneralConfig.utils";
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
  const [inputs, setInputs] = useState({
    title: config.title || "",
    header: config.color.header,
    content: config.color.content,
    container: config.color.container,
    theme: config.theme || "default",
  });

  const { handleSave, handleLogoUpdate } = useGeneralConfigLogic(
    config,
    safeMessage,
    setIsLoading,
  );

  useEffect(() => {
    setInputs({
      title: config.title || "",
      theme: config.theme,
      ...config.color,
    });
  }, [config]);

  //#region ===== HANDLERS =====
  const handleChange = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };
  const handleSaveWrapper = async () => {
    const { title, header, content, container, theme, ...rest } = inputs;
    await handleSave(title, header, content, container, theme, rest);
  };

  useKeyboardSave(handleSaveWrapper, isLoading);

  const handleLogoUpdateWrapper = async (file) => {
    await handleLogoUpdate(file);
  };
  //#endregion

  return {
    isLoading,
    inputs,
    setInputs,
    handleChange,
    handleSave: handleSaveWrapper,
    handleLogoUpdate: handleLogoUpdateWrapper,
  };
};
