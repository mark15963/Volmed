import debug from '../utils/debug'
import styles from './styles/loader.module.css'
import loader from '../assets/images/Loader.gif'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

export const Loader = () => {
    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <p className={styles.loadingTitle}>
                    Загрузка данных...
                </p>
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