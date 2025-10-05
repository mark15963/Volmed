import axios from 'axios';
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { message } from 'antd';

import Button from './Button.js';
import Input from './Input';

import api from '../../src/services/api.js'
import debug from '../utils/debug.js';

import styles from './styles/SearchBar.module.scss'

export const SearchBar = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [searchValue, setSearchValue] = useState('')
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const inputValue = e.target.value
        if (/^\d*$/.test(inputValue)) {
            setSearchValue(e.target.value)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!searchValue.trim()) {
            messageApi.error("Введите № карты")
            return
        }

        setIsLoading(true)

        try {
            const response = await api.getPatient(searchValue.trim())
            navigate('/search', {
                state: {
                    results: [response.data],
                    searchQuery: searchValue
                }
            })
        } catch (err) {
            messageApi.error(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            {contextHolder}
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div className={styles.searchtitle}>
                    Поиск пациентов:
                </div>
                <search className={styles.searchContainer}>
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
                </search>
            </form>
        </div>
    )
}