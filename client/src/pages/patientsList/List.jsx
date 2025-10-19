import { useNavigate } from 'react-router'

import { AllPatients, PatientCount } from '../../components/fetchData'
import { SearchBar } from '../../components/SearchBar'
import Button from '../../components/Button'

import styles from './list.module.css'

export const List = () => {
    const navigate = useNavigate()

    return (
        <div className={styles.container} style={{ maxWidth: '800px' }}>
            <div className={styles.list}>
                <>
                    <div className={styles.searchbar}>
                        <SearchBar />
                    </div>

                    <AllPatients />
                    <div style={{ marginTop: '10px' }}>
                        <PatientCount />
                    </div>
                </>
                <div className={styles.buttonContainer}>
                    <Button
                        text='На главную'
                        onClick={() => {
                            navigate('/')
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default List
