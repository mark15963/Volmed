import { useNavigate } from 'react-router-dom'
import { SearchBar } from '../../components/SearchBar';
import styles from './main.module.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

export const Main = () => {
    const navigate = useNavigate()

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <SearchBar />
                <div className={styles.buttonsContainer}>
                    <button
                        onClick={() => navigate('/patients')}
                        className={styles.backButton}
                    >
                        <i className="bi bi-people"><span style={{ fontStyle: 'normal', margin: '0 0 0 5px' }}>Список пациентов</span></i>
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className={styles.regButton}
                    >
                        <i className="bi bi-person-plus"><span style={{ fontStyle: 'normal', margin: '0 0 0 5px' }}>Новый пациент</span></i>
                    </button>

                </div>
            </div>
        </div>
    )
}