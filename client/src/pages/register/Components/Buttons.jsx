import { useState } from 'react'
import Button from '../../../components/Button'
import styles from '../register.module.css'

export const Buttons = ({ form, isEditMode = false }) => {
    const [isLoading, setIsLoading] = useState(false)

    return (
        <div className={styles.buttons}>
            <Button
                text={
                    isEditMode
                        ? 'Сохранить изменения'
                        : 'Зарегистрировать пациента'
                }
                type='submit'
                loading={isLoading}
            />

            <Button
                text='Назад'
                navigateTo='INDEX'
            />
        </div>)
}