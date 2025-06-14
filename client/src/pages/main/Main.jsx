import { useNavigate } from 'react-router'
import { SearchBar } from '../../components/SearchBar';
import styles from './main.module.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import Button from '../../components/Buttons';

export const Main = () => {
    const navigate = useNavigate()

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <SearchBar />
                <div className={styles.buttonsContainer}>

                    <Button text='Список пациентов' margin='0 0 0 5px' icon='bi bi-people' onClick={() => navigate('/patients')} />

                    <Button text='Новый пациент' icon='bi bi-person-plus' margin='0 0 0 5px' onClick={() => navigate('/register')} />

                </div>
            </div>
        </div>
    )
}