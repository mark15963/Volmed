import { useEffect, useState } from "react";
import {
  useGeneralConfigLogic,
  useKeyboardSave,
} from "../utils/GeneralConfig.utils";

export const useGeneralConfig = (config, safeMessage) => {
  const [isLoading, setIsLoading] = useState(false);
  const [titleInput, setTitleInput] = useState(config.title || "");
  const [headerColorInput, setHeaderColorInput] = useState(config.color.header);
  const [contentColorInput, setContentColorInput] = useState(
    config.color.content
  );

  const { handleSave, handleLogoUpdate } = useGeneralConfigLogic(
    config,
    safeMessage,
    setIsLoading
  );

  useKeyboardSave(
    () => handleSave(titleInput, headerColorInput, contentColorInput),
    isLoading
  );

  useEffect(() => {
    setTitleInput(config.title || "");
  }, [config.title]);

  useEffect(() => {
    setHeaderColorInput(config.color.header);
    setContentColorInput(config.color.content);
  }, [config.color]);

  const handleSaveWrapper = async () => {
    await handleSave(titleInput, headerColorInput, contentColorInput);
  };

  const handleLogoUpdateWrapper = async (file) => {
    await handleLogoUpdate(file);
  };

  return {
    isLoading,
    titleInput,
    headerColorInput,
    contentColorInput,
    setTitleInput,
    setHeaderColorInput,
    setContentColorInput,
    handleSave: handleSaveWrapper,
    handleLogoUpdate: handleLogoUpdateWrapper,
  };
};
