import { useState } from "react"
import { useNavigate } from "react-router"

import Button from "../../components/Buttons"

import styles from './login.module.css'

export const Login = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.target)
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        }

        if (!data.username) {
            setErrors(prev => ({ ...prev, username: 'Required' }))
            return
        }

        try {
            const response = await axios.post(
                'https://volmed-backend.onrender.com/login',
                data,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            if (response.data.success) {
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
                        type="text"
                        placeholder="Username"
                    />
                    <br />
                    <label htmlFor="password">
                        Password:
                    </label>
                    <input
                        name="password"
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