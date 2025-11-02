import { debug } from '../../../utils/debug'
import styles from '../styles/login.module.scss'

const ErrorDisplay = ({ errors }) => {
  return (
    errors.general && (
      <div className={styles.error}>{errors.general}</div>
    )
  )
}

export default ErrorDisplay