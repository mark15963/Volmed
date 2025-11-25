//#region === IMPORTS ===
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import DoctorDisplay from './components/DoctorDisplay';
import NurseDisplay from './components/NurseDisplay';
import Loader from '../../components/loaders/Loader';
import '../../layouts/content/content.scss'
//#endregion
//#region ROLE PERMISSIONS
const ALLOWED_DOCTOR_USERS = [
  "doctor",
  "admin",
  "tester",
]
const ALLOWED_NURSE_USERS = ["nurse"]
//#endregion

export default function Main() {
  const { authState } = useAuth()
  const userRole = authState.user.status;

  //#region RENDERING LOGIC
  if (!authState.isAuthenticated) return null

  // User role -> Doctor, tester, admin
  if (ALLOWED_DOCTOR_USERS.includes(userRole)) return <DoctorDisplay />

  // User role -> Nurse
  if (ALLOWED_NURSE_USERS.includes(userRole)) return <NurseDisplay />

  // Not auth
  return (
    <div className='mainBlock'>
      <div style={{ color: 'aliceblue' }}>
        Пользователь не авторизован
      </div>
    </div>
  )
  //#endregion
}
