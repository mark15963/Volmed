import { useNavigate } from "react-router"
import { useConfig } from "../context"
import styles from '../layouts/content/content.module.scss'

export const NotFound = () => {
  const navigate = useNavigate()
  const { color } = useConfig()

  setTimeout(() => navigate(-1), 3000)

  return (
    <div
      className={styles.mainBlock}
      style={{
        backgroundColor: color.container,
        color: 'aliceblue'
      }}>
      <h1>404</h1>
      <p>Страница не существует</p>
      <p>Обратно назад через 3 секунды...</p>
    </div>
  )
}

export default NotFound