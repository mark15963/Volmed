import { useEffect, useState } from 'react'
import debug from '@/utils/debug'

import loader from '@/assets/images/Loader.gif'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import '@/styles/index.scss'
import styles from './Loader.module.scss'

/**
 * Animated handicap guy loader
 * ----------------------------
 */
export const Loader = () => {
    const [showSlowMessage, setShowSlowMessage] = useState(false)

    debug.log("Loading for up to 5s")

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSlowMessage(true)
            debug.log("Slow loading until load")
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
                        Идет загрузка сервера...
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