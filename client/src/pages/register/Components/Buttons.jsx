import { useState } from 'react'
import Button from '../../../components/Buttons'
import styles from '../register.module.css'
import { useNavigate } from 'react-router'

export const Buttons = ({ form, isEditMode = false }) => {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

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
                onClick={() => navigate(-1)}
            />
        </div>)
}