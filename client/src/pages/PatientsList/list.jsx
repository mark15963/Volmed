import React from 'react'
import { AllPatients, PatientCount } from '../../components/List/fetchData'
import { useNavigate } from 'react-router-dom'
import { SearchBar } from '../../components/SearchBar/SearchBar'
import { usePageTitle } from '../../components/PageTitle/PageTitle'
import { HomeButton } from '../../components/Buttons/Buttons'

import styles from './list.module.css'


export const List = () => {
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
                    <br />
                    <AllPatients />
                    <br />
                    <br />
                    <PatientCount />

                </div>
                <div className={styles.buttonContainer}>
                    <HomeButton />
                </div>
            </div>
        </div>
    )

}
