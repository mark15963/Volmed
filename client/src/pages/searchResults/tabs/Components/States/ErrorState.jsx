import styles from '../../../searchResults.module.css'

const ErrorState = ({ error }) => {
    return (
        <div className={styles.info}>
            <div className={styles.bg} style={{ textAlign: 'center' }}>
                Ошибка: {error}
            </div>
        </div>
    )
}

export default ErrorState