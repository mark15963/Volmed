import { useNavigate } from "react-router"

import styles from './login.module.css'

export const Login = () => {
    const navigate = useNavigate()

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <input type="text" name="username" placeholder="username" />
                <input type="password" name="password" placeholder="password" />
                <Button text='Новый пациент' icon='bi bi-person-plus' margin='0 0 0 5px' onClick={() => navigate('/register')} />
            </div>
        </div >
    )
}