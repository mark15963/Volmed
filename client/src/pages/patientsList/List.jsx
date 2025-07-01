import { useNavigate } from 'react-router'

import { AllPatients, PatientCount } from '../../components/fetchData'
import { SearchBar } from '../../components/SearchBar'
import { usePageTitle } from '../../components/PageTitle'
import Button from '../../components/Buttons.tsx'

import styles from './list.module.css'

export const List = () => {
    const navigate = useNavigate()
    usePageTitle("Список пациентов");

    return (
        <div className={styles.container} style={{ maxWidth: '800px' }}>
            <div className={styles.list}>
                <div className={styles.table}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <SearchBar />
                    </div>
                    <AllPatients />
                    <PatientCount />

                </div>
                <div className={styles.buttonContainer}>
                    <Button text='Главный экран' onClick={() => navigate('/')} />
                </div>
            </div>
        </div>
    )

}

export default List