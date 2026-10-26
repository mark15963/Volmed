import { useState } from "react";
import Button from "../../../components/Button";
import styles from "../register.module.scss";

interface ButtonsProps {
  isEditMode?: boolean;
  isLoading?: boolean;
}

export const Buttons = ({
  isEditMode = false,
  isLoading = false,
}: ButtonsProps) => (
  <div className={styles.buttonsContainer}>
    <Button
      text={isEditMode ? "Сохранить изменения" : "Зарегистрировать пациента"}
      type="submit"
      disabled={isLoading}
      className={styles.buttons}
    />

    <Button
      text="Назад"
      navigateTo="INDEX"
      disabled={isLoading}
      className={styles.buttons}
      replace
    />
  </div>
);
