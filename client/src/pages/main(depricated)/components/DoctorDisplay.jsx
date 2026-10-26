import { useNavigate } from "react-router"
import Button from "../../../components/Button"
import { SearchBar } from "../../../components/SearchBar"

import styles from '../../../layouts/content/content.module.scss'
import mainStyles from '../main.module.scss'

export default function DoctorDisplay() {
  return (
    <div className={styles.mainBlock}>
      <SearchBar />
      <div className={mainStyles.divider} />
      {buttons()}
    </div>
  )
}

function buttons() {
  const navigate = useNavigate()
  return (
    <>
      <div className={mainStyles.buttonsContainer}>
        <Button
          text='Список пациентов'
          icon='patients'
          margin='0 0 0 5px'
          navigateTo='PATIENTS'
          className={mainStyles.buttons}
        />
        <Button
          text='Новый пациент'
          icon='newPatient'
          margin='0 0 0 5px'
          navigateTo='REGISTER'
          className={mainStyles.buttons}
        />
      </div>
    </>
  )
}