import { useState } from "react"

import { usePatients } from "../../context/PatientDataContext"
import { useUsers } from "../../context/UsersDataContext"

import debug from "../../utils/debug"

// import Loader from "../../components/Loader"
import { SpinLoader } from "../../components/Loading/SpinLoader.tsx"

import styles from './styles/dashboard.module.scss'


export const Dashboard = () => {
    const { patients, loading: patientsLoading } = usePatients()
    const { users, loading: usersLoading } = useUsers()

    const count = patients.length
    const stable = patients.filter(patient => patient.state === 'Выписан').length

    const countUsers = users.length
    const countDoctors = users.filter(user => user.status === 'Врач').length
    debug.log(users)

    // if (usersLoading || patientsLoading) return <Loader />

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <div className={styles.row}>
                    <div className={styles.block}>
                        <div className={styles.blockTitle}>
                            ОБЩИЕ ДАННЫЕ ПАЦИЕНТОВ
                        </div>
                        {usersLoading ? (
                            <div className={styles.blockContentLoader}>
                                <SpinLoader
                                    color='black'
                                    size="30px"
                                />
                            </div>
                        ) : (
                            <>
                                <div className={styles.blockContent}>
                                    Всего пациентов: {count}
                                </div>
                                <div className={styles.blockContent}>
                                    Стабильные: {stable}
                                </div>
                            </>
                        )}
                    </div>
                    <div className={styles.block}>
                        <div className={styles.blockTitle}>
                            ОБЩИЕ ДАННЫЕ ПЕРСОНАЛА
                        </div>
                        {usersLoading ? (
                            <div className={styles.blockContentLoader}>
                                <SpinLoader
                                    color="black"
                                    size="30px"
                                />
                            </div>
                        ) : (
                            <>
                                <div className={styles.blockContent}>
                                    Всего персонала: {countUsers}
                                </div>
                                <div className={styles.blockContent}>
                                    Врачи: {countDoctors}
                                </div>
                            </>
                        )}
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