import { useNavigate } from "react-router"
import Button from "../../../components/Button"
import { SearchBar } from "../../../components/SearchBar"

import styles from '../main.module.scss'

export default function DoctorDisplay() {
  return (
    <div className={styles.container}>
      <div className={styles.mainBlock}>
        <SearchBar />
        <div className={styles.divider} />
        {control()}
      </div>
    </div>
  )
}

function control() {
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