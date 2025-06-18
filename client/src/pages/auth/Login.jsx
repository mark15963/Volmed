import Button from '../../components/Buttons'
import styles from '../main/main.module.css'

const localServer = 'http://localhost:5000'

export const Login = () => {
    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <form action={`${localServer}/login`} method="POST" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                    <Button type='submit' text='Вход' margin='0 0 0 5px' icon='bi bi-people' />
                </form>
            </div>
        </div>
    )
}