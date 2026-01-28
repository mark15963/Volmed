import { useNavigate } from 'react-router'

import { PatientCount } from './components/PatientsCount'
import { ListOfPatients } from './components/ListOfPatients'

import { SearchBar } from '@/components/SearchBar'
import Button from '../../components/Button'

import styles from './list.module.scss'
import '@/layouts/content/content.module.scss'
import '@/styles/index.scss'

export const List = () => {
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
            text='На главную'
            navigateTo='INDEX'
          />
        </div>
      </div>
    </div>
  )
}

export default List
