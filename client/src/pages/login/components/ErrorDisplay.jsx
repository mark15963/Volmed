import styles from '../styles/login.module.css'

const ErrorDisplay = ({ errors }) => {
  return (
    errors.general && (
      <div className={styles.error}>{errors.general}</div>
    )
  )
}

export default ErrorDisplay