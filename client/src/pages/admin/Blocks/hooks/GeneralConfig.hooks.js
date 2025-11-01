import { useEffect, useState } from "react";
import {
  useGeneralConfigLogic,
  useKeyboardSave,
} from "../utils/GeneralConfig.utils";

export const useGeneralConfig = (config, safeMessage) => {
  const [isLoading, setIsLoading] = useState(false);

  const [inputs, setInputs] = useState({
    title: config.title || "",
    header: config.color.header,
    content: config.color.content,
    container: config.color.container,
  });

  // const [titleInput, setTitleInput] = useState(config.title || "");
  // const [headerColorInput, setHeaderColorInput] = useState(config.color.header);
  // const [contentColorInput, setContentColorInput] = useState(
  //   config.color.content
  // );
  // const [containerColorInput, setContainerColorInput] = useState(
  //   config.color.container
  // );

  const { handleSave, handleLogoUpdate } = useGeneralConfigLogic(
    config,
    safeMessage,
    setIsLoading
  );

  useEffect(() => {
    setInputs({
      title: config.title || "",
      ...config.color,
    });
  }, [config]);

  // useEffect(() => {
  //   setHeaderColorInput(config.color.header);
  //   setContentColorInput(config.color.content);
  //   setContainerColorInput(config.color.container);
  // }, [config.color]);

  const handleChange = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveWrapper = async () => {
    const { title, header, content, container, ...rest } = inputs;
    await handleSave(title, header, content, container, rest);
  };

  useKeyboardSave(handleSaveWrapper, isLoading);

  const handleLogoUpdateWrapper = async (file) => {
    await handleLogoUpdate(file);
  };

  return {
    isLoading,
    inputs,
    setInputs,
    handleChange,
    handleSave: handleSaveWrapper,
    handleLogoUpdate: handleLogoUpdateWrapper,
  };
};
