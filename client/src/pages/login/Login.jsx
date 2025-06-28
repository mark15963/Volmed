import { useNavigate } from "react-router"

import Button from "../../components/Buttons"

import styles from './login.module.css'

export const Login = () => {
    const navigate = useNavigate()

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>

                <form action="https://volmed-backend.onrender.com/login" method="POST">
                    <label htmlFor="username">
                        Username:
                    </label>
                    <input
                        name="username"
                        type="text"
                        placeholder="Username"
                    />
                    <br />
                    <label htmlFor="password">
                        Password:
                    </label>
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                    />
                    <br />
                    <Button type='submit' text='Вход' />
                </form>

            </div>
        </div >
    )
}