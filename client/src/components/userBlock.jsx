import axios from 'axios'
//import { Users } from '../List/fetchData'
import { useState } from 'react'
import styles from './styles/User.module.css'

export const User = () => {
    const [showAuthForm, setShowAuthForm] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [currentUser, setCurrentUser] = useState(null);

    const toggleAuthForm = () => {
        setShowAuthForm(!showAuthForm);
        setAuthMode('login'); // Reset to login mode when toggling
    };

    const switchAuthMode = () => {
        setAuthMode(authMode === 'login' ? 'register' : 'login');
        setError('');
    };

    const handleAuthSuccess = (user) => {
        setCurrentUser(user);
        setShowAuthForm(false);
    };

    return (
        <div className={styles.container}>
            {currentUser ? (
                <div className={styles.userInfo}>
                    <span>Добро пожаловать, {currentUser.firstName} {currentUser.patr}</span>
                    <button onClick={() => setCurrentUser(null)}>Выход</button>
                </div>
            ) : (
                <>
                    <button onClick={toggleAuthForm}>
                        {showAuthForm ? 'Скрыть' : 'Вход'}
                    </button>
                </>
            )}
        </div>
    )
}
export const AuthForm = ({ mode, onSuccess, onSwitchMode }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        patr: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = mode === 'login' ? '/api/login' : '/api/register';
            const payload = mode === 'login'
                ? { username: formData.username, password: formData.password }
                : formData;

            const response = await axios.post(`http://localhost:5000${endpoint}`, payload);

            if (response.data.success) {
                onSuccess(response.data.user || {
                    username: formData.username,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    patr: formData.patr
                });
            } else {
                setError(response.data.message || `Аутентификация не удалась`);
            }
        } catch (err) {
            setError(err.response?.data?.message ||
                (mode === 'login' ? 'Вход не удался' : 'Регистрация не удалась'));
            console.error('Ошибка аутентификации:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.authForm}>
            <h4>{mode === 'login' ? 'Вход' : 'Регистрация'}</h4>
            <div className={styles.formGroup}>
                <label>Аккаунт: </label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Пароль: </label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                />
            </div>

            {mode === 'register' && (
                <>
                    <div className={styles.formGroup}>
                        <label>Фамилия:</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Имя:</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Отчество:</label>
                        <input
                            type="text"
                            name="patr"
                            value={formData.patr}
                            onChange={handleChange}
                        />
                    </div>
                </>
            )}

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? 'Обработка данных...' : mode === 'login' ? 'Вход' : 'Регистрация'}
            </button>

            <button
                type="button"
                onClick={onSwitchMode}
                className={styles.switchButton}
            >
                {mode === 'login'
                    ? 'Нет аккаунта. Регистрация'
                    : 'Есть аккаунт. Вход'}
            </button>
        </form>
    );
};