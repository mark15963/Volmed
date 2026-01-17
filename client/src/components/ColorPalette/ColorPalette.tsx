import { FC } from "react";
import Input from "../Input";
import styles from "./ColorPalette.module.scss";
import { useConfig } from "../../context";
import { useSafeMessage } from "../../hooks/useSafeMessage";
import { useGeneralConfig } from "../../pages/dashboard/Blocks/hooks/GeneralConfig.hooks";

interface ColorPaletteProps {
  handleChange: () => void;
  inputs: string;
}

export const ColorPalette = () => {
  const config = useConfig();
  const safeMessage = useSafeMessage();

  /** @type {{ isLoading: boolean, inputs: GeneralConfigInputs, handleChange: Function, handleSave: Function, handleLogoUpdate: Function }} */
  const { isLoading, inputs, handleChange, handleSave, handleLogoUpdate } =
    useGeneralConfig(config, safeMessage);

  return (
    <>
      <div className={styles.paletteTitle}>Цветавая палитра:</div>
      <div className={styles.colorBlocks}>
        Цвет шапки
        <div className={styles.colorPicker}>
          <Input
            type="color"
            value={inputs.header}
            onChange={(e) => handleChange("header", e.target.value)}
          />
          <span>{inputs.header.toUpperCase()}</span>
        </div>
      </div>

      <div className={styles.colorBlocks}>
        Цвет заднего фона
        <div className={styles.colorPicker}>
          <Input
            type="color"
            value={inputs.content}
            onChange={(e) => handleChange("content", e.target.value)}
          />
          <span>{inputs.content.toUpperCase()}</span>
        </div>
      </div>

      <div className={styles.colorBlocks}>
        Цвет контейнера
        <div className={styles.colorPicker}>
          <Input
            type="color"
            value={inputs.container}
            onChange={(e) => handleChange("container", e.target.value)}
          />
          <span>{inputs.container.toUpperCase()}</span>
        </div>
      </div>
    </>
  );
};
