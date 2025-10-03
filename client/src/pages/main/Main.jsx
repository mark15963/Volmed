import { useState } from 'react'

import { useAuth } from '../../context/AuthContext'

import DoctorDisplay from './pages/DoctorDisplay';
import NurseDisplay from './pages/NurseDisplay';
import Loader from '../../components/Loader';

import styles from './main.module.scss'

export default function Main() {
  const { authState } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const userRole = authState.user.status;
  const allowedUsers = [
    "doctor",
    "Врач",
    "admin",
    "Администратор",
    "tester",
    "Тестировщик"
  ]
  const nurseUsers = [
    "Сестра",
    "nurse"
  ]

  if (authState.isLoading) return <Loader />
  if (!authState.isAuthenticated) return null

  // User role -> Nurse
  if (nurseUsers.includes(userRole)) {
    return <NurseDisplay />
  }
  // User role -> Doctor, tester, admin
  if (allowedUsers.includes(userRole)) {
    return <DoctorDisplay />
  }
  // Not auth
  return (
    <div className={styles.container}>
      <div className={styles.mainBlock}>
        <div style={{ color: 'aliceblue' }}>
          Пользователь не авторизован
        </div>
      </div>
    </div>
  )
}
