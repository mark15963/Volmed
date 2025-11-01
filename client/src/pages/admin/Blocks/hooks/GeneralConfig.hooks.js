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
  const [containerColorInput, setContainerColorInput] = useState(
    config.color.container
  );

  const { handleSave, handleLogoUpdate } = useGeneralConfigLogic(
    config,
    safeMessage,
    setIsLoading
  );

  useKeyboardSave(
    () =>
      handleSave(
        titleInput,
        headerColorInput,
        contentColorInput,
        containerColorInput
      ),
    isLoading
  );

  useEffect(() => {
    setTitleInput(config.title || "");
  }, [config.title]);

  useEffect(() => {
    setHeaderColorInput(config.color.header);
    setContentColorInput(config.color.content);
    setContainerColorInput(config.color.container);
  }, [config.color]);

  const handleSaveWrapper = async () => {
    await handleSave(
      titleInput,
      headerColorInput,
      contentColorInput,
      containerColorInput
    );
  };

  const handleLogoUpdateWrapper = async (file) => {
    await handleLogoUpdate(file);
  };

  return {
    isLoading,
    titleInput,
    headerColorInput,
    contentColorInput,
    containerColorInput,
    setTitleInput,
    setHeaderColorInput,
    setContentColorInput,
    setContainerColorInput,
    handleSave: handleSaveWrapper,
    handleLogoUpdate: handleLogoUpdateWrapper,
  };
};
