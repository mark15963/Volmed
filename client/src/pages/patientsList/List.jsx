import { useNavigate } from 'react-router'

import { AllPatients, PatientCount } from '../../components/fetchData'
import { SearchBar } from '../../components/SearchBar'
import { usePageTitle } from '../../components/PageTitle'
import Button from '../../components/Buttons.tsx'

import styles from './list.module.css'
import debug from '../../utils/debug'

export const List = () => {
    const navigate = useNavigate()
    usePageTitle("Список пациентов");

    return (
        <div className={styles.container} style={{ maxWidth: '800px' }}>
            <div className={styles.list}>
                <>
                    <div className={styles.searchbar}>
                        <SearchBar />
                    </div>

                    <AllPatients />

                    <PatientCount />
                </>
                <div className={styles.buttonContainer}>
                    <Button
                        text='Главный экран'
                        onClick={() => {
                            debug.log("Clicked on Home page")
                            navigate('/')
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default List