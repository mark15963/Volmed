import { useNavigate } from 'react-router'

import { PatientCount } from './components/PatientsCount'
import { SearchBar, Button, ListOfPatients } from '../../components'

import styles from './main.module.scss'
import '@/layouts/content/content.module.scss'
import '@/styles/index.scss'

export const Main = () => {
  const navigate = useNavigate()

  return (
    <div
      className={styles.mainBlock}
    >
      <div className={styles.list}>
        <div className={styles.searchbar}>
          <SearchBar />
        </div>
        <div className={styles.table}>
          <ListOfPatients option='active' theme='light' />
        </div>
        <div className={styles.counter}>
          <PatientCount />
        </div>

        <div className={styles.buttonContainer}>
          <Button
            text='Новый пациент'
            icon='newPatient'
            navigateTo='REGISTER'
          />
        </div>
      </div>
    </div>
  )
}

export default Main
