import styles from '../../../searchResults.module.css'

const NotFoundState = () => {
  return (
    <div className={styles.info}>
      <div className={styles.bg}>
        Пациент не найден.
      </div>
    </div>
  )
}

export default NotFoundState