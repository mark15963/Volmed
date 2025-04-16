import React from 'react'
import { AllPatients, PatientCount } from '../../../components/List/fetchData'
import { useNavigate } from 'react-router-dom'
import styles from './list.module.css'
import { SearchBar } from '../../../components/SearchBar/SearchBar'
import { usePageTitle } from '../../../components/PageTitle/PageTitle'

export const List = () => {
    const navigate = useNavigate()

    usePageTitle("Список пациентов");

    return (
        <div className={styles.container} style={{ maxWidth: '800px' }}>
            <div className={styles.list}>
                <div className={styles.table}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <SearchBar />
                    </div>
                    <br />

                    <AllPatients />
                    <br />
                    <br />
                    <PatientCount />

                </div>
                <div className={styles.buttonContainer}>
                    <button className={styles.backButton} onClick={() => navigate(-1)}>
                        Назад на главную
                    </button>
                </div>
            </div>
        </div>
    )

}
