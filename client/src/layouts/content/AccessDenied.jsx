// Used in ProtectedRoutes.jsx

import Button from "@/components/Button"
import '@/styles/index.scss'
import { statusDisplayMap } from "@/utils/statusMap"

export const AccessDenied = ({ roles, userRole }) => {
  const styles = {
    container: {
      padding: "20px"
    },
    title: {
      color: 'aliceblue',
      textAlign: 'center'
    },
    roles: {
      color: 'aliceblue',
      textAlign: 'center'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '10px'
    },
  }

  const displayRoles = roles.map(r => statusDisplayMap[r] || r)

  return (
    <div className={`mainBlock ${styles.container}`}>
      <h2 className={styles.title}>
        Доступ запрещен
      </h2>
      <br />
      <p className={styles.title}>
        У вас недостаточно прав для просмотра этой страницы.
      </p>
      <br />
      <p className={styles.roles}>
        Требуемые роли: {displayRoles.join(", ")}
        <br />
        Ваша роль: {userRole || "Не определена"}
      </p>
      <div className={styles.buttonContainer}>
        <Button
          navigateTo='INDEX'
          text="Назад"
        />
      </div>
    </div>
  )
}