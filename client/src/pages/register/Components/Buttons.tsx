import { useNavigate } from "react-router";

import { Button } from "@components";
import { PAGES } from "@constants";

import styles from "../register.module.scss";

interface ButtonsProps {
  isEditMode?: boolean;
  isLoading?: boolean;
}

export const Buttons = ({
  isEditMode = false,
  isLoading = false,
}: ButtonsProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (isEditMode) {
      navigate(-1);
    } else {
      navigate(PAGES.INDEX);
    }
  };

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
        onClick={handleBack}
        disabled={isLoading}
        className={styles.buttons}
      />
    </div>
  );
};
