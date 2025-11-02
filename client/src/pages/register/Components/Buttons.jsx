import { useState } from 'react'
import Button from '../../../components/Button'
import styles from '../register.module.scss'

export const Buttons = ({ form, isEditMode = false }) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className={styles.buttonsContainer}>
      <Button
        text={
          isEditMode
            ? 'Сохранить изменения'
            : 'Зарегистрировать пациента'
        }
        type='submit'
        loading={isLoading}
        className={styles.buttons}
      />

      <Button
        text='Назад'
        navigateTo='INDEX'
        className={styles.buttons}
      />
    </div>)
}