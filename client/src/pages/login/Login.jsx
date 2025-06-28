import { useState } from "react"
import { useNavigate } from "react-router"

import Button from "../../components/Buttons"

import styles from './login.module.css'
import axios from "axios"

export const Login = () => {
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(
                'https://volmed-backend.onrender.com/login',
                { username, password },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            if (response.data.success) {
                window.dispatchEvent(new Event('authChange'));
                navigate('/')
            }
        } catch (error) {
            console.error("Login error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <h2>Вход</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">
                        Username:
                    </label>
                    <input
                        name="username"
                        id="username"
                        type="text"
                        placeholder="Username"
                    />
                    <br />
                    <label htmlFor="password">
                        Password:
                    </label>
                    <input
                        name="password"
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        required
                    />
                    <Button type="button" onClick={() => setShowPassword(!showPassword)} text={showPassword ? 'Hide' : 'Show'} />
                    <br />
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button type='submit' text='Вход' />
                    </div>
                </form>
            </div>
        </div >
    )
}