import { useNavigate } from "react-router"
import Button from "../../../components/Button"
import { SearchBar } from "../../../components/SearchBar"

import '../../../layouts/content/content.scss'
import styles from '../main.module.scss'

export default function DoctorDisplay() {
  return (
    <div className='mainBlock'>
      <SearchBar />
      <div className={styles.divider} />
      {buttons()}
    </div>
  )
}

function buttons() {
  const navigate = useNavigate()
  return (
    <>
      <div className={styles.buttonsContainer}>
        <Button
          text='Список пациентов'
          icon='patients'
          margin='0 0 0 5px'
          navigateTo='PATIENTS'
          className={styles.buttons}
        />
        <Button
          text='Новый пациент'
          icon='newPatient'
          margin='0 0 0 5px'
          navigateTo='REGISTER'
          className={styles.buttons}
        />
      </div>
    </>
  )
}