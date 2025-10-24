import { useNavigate } from 'react-router'

import { PatientCount } from './components/PatientsCount'
import { ListOfPatients } from './components/ListOfPatients'

import { SearchBar } from '../../components/SearchBar'
import Button from '../../components/Button'

import styles from './styles/list.module.css'

export const List = () => {
    const navigate = useNavigate()

    return (
        <div className={styles.container}>
            <div className={styles.list}>

                <div className={styles.searchbar}>
                    <SearchBar />
                </div>

                <ListOfPatients />

                <div style={{ marginTop: '10px' }} />
                <PatientCount />


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
