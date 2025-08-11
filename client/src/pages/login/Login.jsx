import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { useAuth } from '../../context/AuthContext';

import Button from "../../components/Buttons.tsx";
import Input from "../../components/Input";

import styles from './login.module.css';
import Loader from "../../components/Loader";

export const Login = () => {
    const navigate = useNavigate();
    const { authState, login } = useAuth();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    // Additional defensive authState check 
    useEffect(() => {
        if (authState.isAuthenticated) {
            navigate('/');
        }
    }, [authState, navigate])
    if (authState.isLoading) return <Loader />
    if (authState.isAuthenticated) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true);
        setErrors({});

        try {
            await login(credentials)
            navigate('/')
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
                        value={credentials.username}
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
                        value={credentials.password}
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