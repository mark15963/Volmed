import { SpinLoader } from "@/components/loaders/SpinLoader"
import { usePatients, useUsers } from "@/context"

import styles from '../../dashboard.module.scss'

export const PatientsStatus = () => {
  const { patients, loading: patientsLoading } = usePatients()
  const countPatients = patients.length
  const stablePatients = patients.filter(patient => patient.state === 'Стабильно').length
  const dischargedPatients = patients.filter(patient => patient.state === 'Выписан' || patient.state === 'Выписана').length

  return (
    <>
      {patientsLoading ? (
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
      )
      }
    </>
  )
}

export const UsersStatus = () => {
  const { users, loading: usersLoading } = useUsers()

  const countUsers = users.length
  const countDoctors = users.filter(user => user.status === 'doctor').length
  const countNurses = users.filter(user => user.status === 'nurse').length

  return (
    <>
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
    </>
  )
}