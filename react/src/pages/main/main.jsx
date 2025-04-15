import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import styles from './main.module.css'


export const Main = () => {
    const [searchValue, setSearchValue] = useState('')
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setSearchValue(e.target.value)
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate input
        if (!searchValue.trim()) {
            setError('Please enter a patient ID')
            return
        }

        if (isNaN(searchValue)) {
            setError('Patient ID must be a number')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await fetch(`http://localhost:5000/api/patients/${searchValue}`)

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Patient not found')
                }
                throw new Error('Failed to fetch patient data')
            }

            const patientData = await response.json()

            // Navigate to results page with the patient data
            navigate('/search', {
                state: {
                    results: [patientData], // Wrap in array to match table structure
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
            <div className={styles.mainBlock}>
                <form onSubmit={handleSubmit}>
                    <label className={styles.searchtitle} htmlFor="searchfield">
                        Поиск пациентов:
                    </label>
                    <div
                        className={styles.searcharea}
                        style={{ left: '20px' }}
                    >
                        <input
                            className={styles.searchfield}
                            id='searchfield'
                            type="text"
                            value={searchValue}
                            onChange={handleChange}
                            placeholder="№ Истории болезни"
                            autoComplete="off"
                        />
                        <Button
                            type='default'
                            htmlType='submit'
                            shape='circle'
                            variant='solid'
                            icon={<SearchOutlined />}
                            className={styles.submit}
                            disabled={isLoading}
                        >
                        </Button>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}
                    </div>
                </form>
                <br />
                <button
                    onClick={() => navigate('/register-patient')}
                    className={styles.regButton}
                >
                    Новый пациент
                </button>
                <button
                    onClick={() => navigate('/list')}
                    className={styles.backButton}
                >
                    Список пациентов
                </button>
            </div>
        </div>
    )
}