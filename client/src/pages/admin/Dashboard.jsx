import { useState } from "react"

import { usePatients } from "../../context/PatientDataContext"
import { useUsers } from "../../context/UsersDataContext"

import InDev from "../../components/InDev"

import { SpinLoader } from "../../components/Loading/SpinLoader.tsx"
import { Divider } from "antd"
import styles from './styles/dashboard.module.scss'
import Select from "../../components/Select"

export const Dashboard = () => {
    const { patients, loading: patientsLoading } = usePatients()
    const { users, loading: usersLoading } = useUsers()

    const countUsers = users.length
    const countDoctors = users.filter(user => user.status === 'Врач').length
    const countNurses = users.filter(user => user.status === 'Сестра').length
    const countPatients = patients.length
    const stablePatients = patients.filter(patient => patient.state === 'Стабильно').length
    const dischargedPatients = patients.filter(patient => patient.state === 'Выписан' || patient.state === 'Выписана').length

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
                                    Всего поступили: {countPatients}
                                </div>
                                <div className={styles.blockContent}>
                                    Стабильные: {stablePatients}
                                </div>
                                <div className={styles.blockContent}>
                                    Выписанно: {dischargedPatients}
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
                                <div className={styles.blockContent}>
                                    Сестры: {countNurses}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* БЛОК В РАЗРАБОТКЕ */}
                <InDev>
                    <div className={styles.row}>
                        <div className={styles.block}>
                            <div className={styles.blockTitle}>
                                ПЕРСОНАЛ
                            </div>
                            <div>
                                Admin
                                <Select name='test' id='1'>
                                    <option value="test">Test</option>
                                    <option value="test2">Test 2</option>
                                </Select>
                            </div>
                            <div>
                                Doctor
                                <Select name='test' id='1'>
                                    <option value="test">Test</option>
                                    <option value="test2">Test 2</option>
                                </Select>
                            </div>
                            <div>
                                Nurse
                                <Select name='test' id='1'>
                                    <option value="test">Test</option>
                                    <option value="test2">Test 2</option>
                                </Select>
                            </div>
                        </div>
                    </div>
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
                </InDev>
            </div>
        </div>
    )
}

export default Dashboard