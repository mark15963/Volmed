import styles from '../../../searchResults.module.css'

export const ErrorState = ({ error }) => (
    <div className={styles.resultsContainer}>Ошибка: {error}</div>
);

export default ErrorState