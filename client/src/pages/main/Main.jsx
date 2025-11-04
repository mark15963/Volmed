import { useState } from 'react'

import { useAuth } from '../../context/AuthContext'

import DoctorDisplay from './pages/DoctorDisplay';
import NurseDisplay from './pages/NurseDisplay';
import Loader from '../../components/loaders/Loader';

import '../../layouts/content/content.scss'
// import styles from './main.module.scss'

export default function Main() {
  const { authState } = useAuth()
  const userRole = authState.user.status;

  const allowedDoctorUsers = [
    "doctor",
    "admin",
    "tester",
  ]
  const allowedNurseUsers = [
    "nurse",
  ]

  if (!authState.isAuthenticated) return null

  // User role -> Doctor, tester, admin
  if (allowedDoctorUsers.includes(userRole)) {
    return <DoctorDisplay />
  }

  // User role -> Nurse
  if (allowedNurseUsers.includes(userRole)) {
    return <NurseDisplay />
  }

  // Not auth
  return (
    <div className='mainBlock'>
      <div style={{ color: 'aliceblue' }}>
        Пользователь не авторизован
      </div>
    </div>
  )
}
