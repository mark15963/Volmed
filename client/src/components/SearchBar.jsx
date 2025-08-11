import axios from 'axios';
import { useState } from 'react'
import { useNavigate } from 'react-router'

import Button from './Buttons.tsx';
import Input from './Input';

import styles from './styles/SearchBar.module.css'

import api from '../../src/services/api.js'
import debug from '../utils/debug.js';

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
            const response = await api.getPatient(searchValue.trim())
            navigate('/search', {
                state: {
                    results: [response.data],
                    searchQuery: searchValue
                }
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div className={styles.searchtitle}>
                    Поиск пациентов:
                </div>
                <div className={styles.searchContainer}>
                    <div className={styles.space}></div>
                    <Input
                        id='searchfield'
                        type='search'
                        value={searchValue}
                        onChange={handleChange}
                        placeholder='№ карты'
                        autoComplete='off'
                        inputMode='numeric'
                        pattern='[0-9]*'
                        className={styles.searchfield}
                    />
                    <Button
                        type='submit'
                        shape='circle'
                        icon='search'
                    />
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