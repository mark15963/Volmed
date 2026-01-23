//#region ===== IMPORTS =====
import { useState } from 'react'

import DoctorDisplay from './components/DoctorDisplay';
import NurseDisplay from './components/NurseDisplay';
import Loader from '../../components/ui/loaders/Loader';

import {
  ALLOWED_DOCTOR_USERS,
  ALLOWED_NURSE_USERS
} from '../../constants/users';

import { useAuth } from '../../context/AuthContext'
import { useConfig } from '../../context';

import styles from '../../layouts/content/content.module.scss'
//#endregion

export default function Main() {
  const { authState } = useAuth()
  const userRole = authState.user.status;
  const { color } = useConfig()

  //#region === RENDERING LOGIC ===
  if (!authState.isAuthenticated) return null

  // User role -> Doctor, tester, admin
  if (ALLOWED_DOCTOR_USERS.includes(userRole)) return <DoctorDisplay />

  // User role -> Nurse
  if (ALLOWED_NURSE_USERS.includes(userRole)) return <NurseDisplay />

  // Not auth
  return (
    <div
      className={styles.mainBlock}
      style={{ backgroundColor: color.container }}
    >
      <div style={{ color: 'aliceblue' }}>
        Пользователь не авторизован
      </div>
    </div>
  )
  //#endregion
}