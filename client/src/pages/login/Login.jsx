import { useState, useEffect } from "react"
import { useNavigate } from "react-router"

import { useAuth } from '../../context/AuthContext';

import Button from "../../components/Buttons.tsx"

import styles from './login.module.css'
import axios from "axios"

const apiUrl = import.meta.env.VITE_API_URL

export const Login = () => {
    const navigate = useNavigate()
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const { checkAuthStatus } = useAuth();


    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${apiUrl}/login`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            if (response.data.success) {
                await checkAuthStatus();
                navigate('/');
            }
        } catch (error) {
            console.error("Login error:", error)
            setErrors({
                general: error.response?.data?.error || 'Login failed'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <h2>Вход</h2>
                {errors.general && (
                    <div className={styles.error}>{errors.general}</div>
                )}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">
                        Имя пользователя:
                    </label>
                    <input
                        name="username"
                        id="username"
                        type="text"
                        placeholder="Имя пользователя"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        autoComplete="username"
                    />
                    <label htmlFor="password">
                        Пароль:
                    </label>
                    <input
                        name="password"
                        id="password"
                        type="password"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                    />
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            type='submit'
                            text={isLoading ? 'Загрузка...' : 'Вход'}
                            disabled={isLoading}
                        />
                    </div>
                </form>
            </div>
        </div >
    )
}

export default Login