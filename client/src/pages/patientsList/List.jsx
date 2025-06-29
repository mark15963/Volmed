import { AllPatients, PatientCount } from '../../components/fetchData'
import { SearchBar } from '../../components/SearchBar'
import { usePageTitle } from '../../components/PageTitle'
import { HomeButton } from '../../components/Buttons'

import styles from './list.module.css'

export const List = () => {
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
                    <br />
                    <AllPatients />
                    <br />
                    <PatientCount />

                </div>
                <div className={styles.buttonContainer}>
                    <HomeButton />
                </div>
            </div>
        </div>
    )

}

export default List