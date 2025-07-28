import { useState, useEffect } from "react"
import { useNavigate } from "react-router"

import { useAuth } from '../../context/AuthContext';

import Button from "../../components/Buttons.tsx"
import Input from "../../components/Input";

import styles from './login.module.css'

import debug from '../../utils/debug'

export const Login = () => {
    const navigate = useNavigate()
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const { login } = useAuth();

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
        setErrors({});

        try {
            const result = await login(formData)

            if (result.success) {
                debug.log(`User ${result.user.username} logged in successfully`)
                navigate('/')
            }
        } catch (error) {
            console.error("Login error:", error)
            setErrors({
                general: error.response?.data?.error || error.message || 'Login failed. Please check your credentials.'
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
                    <Input
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
                    <Input
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
                            text={isLoading ? 'Загрузка...' : 'Вход'}
                            type='submit'
                            icon='login'
                            loading={isLoading}
                            disabled={isLoading}
                        />
                    </div>
                </form>
            </div>
        </div >
    )
}

export default Login