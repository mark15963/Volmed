import { Button } from "@components";
import { PAGES } from "@constants";

import styles from "../register.module.scss";

interface ButtonsProps {
  isEditMode?: boolean;
  isLoading?: boolean;
  onBack: () => void;
}

export const Buttons = ({
  isEditMode = false,
  isLoading = false,
  onBack,
}: ButtonsProps) => {
  return (
    <div className={styles.buttonsContainer}>
      <Button
        text={isEditMode ? "Сохранить изменения" : "Зарегистрировать пациента"}
        type="submit"
        disabled={isLoading}
        className={styles.buttons}
      />

      <Button
        text="Назад"
        onClick={onBack}
        disabled={isLoading}
        className={styles.buttons}
      />
    </div>
  );
};
