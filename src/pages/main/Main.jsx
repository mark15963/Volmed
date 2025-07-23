import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react'

import { SearchBar } from '../../components/SearchBar';
import Button from '../../components/Buttons.tsx';
import { useAuth } from '../../context/AuthContext'

import styles from './main.module.css'
import Loader from '../../assets/images/Loader.gif'
import debug from '../../utils/debug';

export const Main = () => {
    const { authState } = useAuth()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    if (authState.isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.mainBlock}>
                    <p className={styles.loadingTitle}>
                        Загрузка данных...
                    </p>
                    <img
                        src={Loader}
                        alt='Loading...'
                        className={styles.loadingImg}
                    />
                </div>
            </div>
        );
    }

    if (!authState.isAuthenticated) {
        return (
            <div className={styles.container}>
                <div className={styles.mainBlock}>
                    <p className={styles.loadingTitle}>
                        Нет доступа
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <SearchBar />
                <div className={styles.buttonsContainer}>

                    <Button
                        text='Список пациентов'
                        icon='patients'
                        margin='0 0 0 5px'
                        onClick={() => {
                            setIsLoading(true)
                            debug.log("Clicked on patients list")
                            navigate('/patients')
                        }}
                        loading={isLoading}
                    />

                    <Button
                        text='Новый пациент'
                        icon='newPatient'
                        margin='0 0 0 5px'
                        onClick={() => {
                            debug.log("Clicked on new patient")
                            navigate('/register')
                        }}
                    />

                </div>
            </div>
        </div>
    )
}

export default Main