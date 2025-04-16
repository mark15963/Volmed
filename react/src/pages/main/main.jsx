import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchBar } from '../../../components/SearchBar/SearchBar';
import styles from './main.module.css'


export const Main = () => {
    const [searchValue, setSearchValue] = useState('')
    const navigate = useNavigate()

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <SearchBar />
                <br />
                <button
                    onClick={() => navigate('/register-patient')}
                    className={styles.regButton}
                >
                    Новый пациент
                </button>
                <button
                    onClick={() => navigate('/list')}
                    className={styles.backButton}
                >
                    Список пациентов
                </button>
            </div>
        </div>
    )
}