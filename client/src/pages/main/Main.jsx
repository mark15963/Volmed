import { useNavigate } from 'react-router'
import { SearchBar } from '../../components/SearchBar';
import styles from './main.module.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import Button from '../../components/Buttons';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const Main = () => {
    const navigate = useNavigate()
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        username: '',
        isLoading: true,
    });

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get(
                'https://volmed-backend.onrender.com/api/auth/status',
                {
                    withCredentials: true,
                }
            );

            console.log('Main page Auth status response:', response.data);

            setAuthState({
                isAuthenticated: response.data.isAuthenticated,
                isLoading: false,
                username: response.data.user?.username || '',
                lastName: response.data.user?.lastName || '',
                firstName: response.data.user?.firstName || '',
                status: response.data.user?.status || '',
            });

        } catch (error) {
            console.error("Auth check error:", error);
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                username: '',
                lastName: '',
                firstName: '',
                status: '',
            });
        }
    };

    useEffect(() => {
        checkAuthStatus();

        const handleAuthChange = () => checkAuthStatus();
        window.addEventListener('authChange', handleAuthChange);

        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    if (authState.isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.mainBlock}>
                    <p>Загрузка данных...</p>
                </div>
            </div>
        );
    }

    if (!authState.isAuthenticated) {
        return (
            <div className={styles.container}>
                <div className={styles.mainBlock}>
                    <p>Нет доступа</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <SearchBar />
                <div className={styles.buttonsContainer}>

                    <Button text='Список пациентов' margin='0 0 0 5px' icon='bi bi-people' onClick={() => navigate('/patients')} />

                    <Button text='Новый пациент' icon='bi bi-person-plus' margin='0 0 0 5px' onClick={() => navigate('/register')} />

                </div>
            </div>
        </div>
    )
}