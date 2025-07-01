import axios from 'axios';
import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../components/Buttons.tsx';

import styles from './styles/SearchBar.module.css'

export const SearchBar = () => {
    const [searchValue, setSearchValue] = useState('')
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const inputValue = e.target.value
        if (/^\d*$/.test(inputValue)) {
            setSearchValue(e.target.value)
            setError('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!searchValue.trim()) {
            setError('Введите № карты')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await axios.get(`https://volmed-backend.onrender.com/api/patients/${searchValue}`)

            if (response.status !== 200) {
                if (response.status === 404) {
                    throw new Error('Пациент не найден')
                }
                throw new Error('Failed to fetch patient data')
            }

            const patientData = await response.data

            navigate('/search', {
                state: {
                    results: [patientData],
                    searchQuery: searchValue
                }
            })
        } catch (err) {
            setError(err.message || 'Ошибка при поиске')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <label className={styles.searchtitle} htmlFor="searchfield">
                    Поиск пациентов:
                </label>
                <div className={styles.searchContainer}>
                    <div className={styles.space}></div>
                    <input
                        className={styles.searchfield}
                        id='searchfield'
                        type="text"
                        value={searchValue}
                        onChange={handleChange}
                        placeholder="№ карты"
                        autoComplete="off"
                        inputMode='numeric'
                        pattern='[0-9]*'
                    />
                    <Button type='submit' shape='circle' icon='bi bi-search' />
                </div>
                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}
            </form>
        </div>
    )
}