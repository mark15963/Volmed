import styles from './Row.module.scss'
const Row = ({ children, center = false }) => {

  return (
    <div
      data-align={center}
      className={styles.row}
    >
      {children}
    </div>
  )
}
export default Row