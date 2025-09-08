import { useEffect, useState } from 'react'
import debug from '../utils/debug'

import styles from './styles/Loader.module.scss'
import loader from '../assets/images/Loader.gif'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

export const Loader = () => {
    const [showSlowMessage, setShowSlowMessage] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSlowMessage(true)
        }, 5000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <p className={styles.loadingTitle}>
                    Загрузка данных...
                </p>
                {showSlowMessage && (
                    <p className={styles.loadingTitle}>
                        Сервер грузится...
                    </p>
                )}
                <img
                    src={loader}
                    alt='Loading...'
                    className={styles.loadingImg}

                />
            </div>
        </div>
    )
}

export default Loader