import { useState } from "react"
import { useNavigate } from "react-router"

import Button from "../../components/Buttons"

import styles from './login.module.css'
import axios from "axios"

export const Login = () => {
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })

    const navigate = useNavigate()

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
                setAuthState({
                    isAuthenticated: true,
                    username: response.data.user.username,
                    isLoading: false
                });
                window.dispatchEvent(new Event('authChange'));
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
                        Username:
                    </label>
                    <input
                        name="username"
                        id="username"
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
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
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        text={showPassword ? 'Hide' : 'Show'}
                    />
                    <br />
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            type='submit'
                            text={isLoading ? 'Logging in...' : 'Вход'}
                            disabled={isLoading}
                        />
                    </div>
                </form>
            </div>
        </div >
    )
}