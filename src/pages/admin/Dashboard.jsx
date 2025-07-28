import { useState } from "react"
import Loader from "../../components/Loader"

import styles from './styles/dashboard.module.scss'
import { usePatients } from "../../context/PatientDataContext"
import { useUsers } from "../../context/UsersDataContext"

import debug from "../../utils/debug"

export const Dashboard = () => {
    const { patients, loading } = usePatients()
    const { users } = useUsers()

    const count = patients.length
    const stable = patients.filter(patient => patient.state === 'Выписан').length

    const countUsers = users.length
    const countDoctors = users.filter(user => user.status === 'Доктор').length
    debug.log(users)

    if (loading) {
        <Loader />
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <div className={styles.row}>
                    <div className={styles.block}>
                        <div className={styles.blockTitle}>
                            ОБЩИЕ ДАННЫЕ ПАЦИЕНТОВ
                        </div>
                        <div className={styles.blockContent}>
                            {`Всего пациентов: ${count}`}
                        </div>
                        <div className={styles.blockContent}>
                            {`Стабильные: ${stable}`}
                        </div>
                    </div>
                    <div className={styles.block}>
                        <div className={styles.blockTitle}>
                            ОБЩИЕ ДАННЫЕ ПЕРСОНАЛА
                        </div>
                        <div className={styles.blockContent}>
                            {`Всего персонала: ${countUsers}`}
                        </div>
                        <div className={styles.blockContent}>
                            {`Доктора: ${countDoctors}`}
                        </div>
                    </div>
                </div>

                {/* БЛОК В РАЗРАБОТКЕ */}
                <div className={styles.row}>
                    <div className={styles.block}>
                        <div className={styles.blockTitle}>
                            БЛОК В РАЗРАБОТКЕ
                        </div>
                        <div className={styles.blockContent}>
                            {`TEST TEST TEST: ${'TEST'}`}
                        </div>
                        <div className={styles.blockContent}>
                            {`TEST TEST TEST: ${'TEST'}`}
                        </div>
                    </div>
                    <div className={styles.block}>
                        <div className={styles.blockTitle}>
                            БЛОК В РАЗРАБОТКЕ
                        </div>
                        <div className={styles.blockContent}>
                            {`TEST TEST TEST: ${'TEST'}`}
                        </div>
                        <div className={styles.blockContent}>
                            {`TEST TEST TEST: ${'TEST'}`}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard