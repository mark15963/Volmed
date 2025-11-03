import Button from "../components/Button"
import '@/styles/index.scss'
import { statusDisplayMap } from "../utils/statusMap"

export const AccessDenied = ({ roles, userRole }) => {
  const displayRoles = roles.map(r => statusDisplayMap[r] || r)

  return (
    <div
      className="mainBlock"
      style={{
        padding: "20px"
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          color: 'aliceblue',
        }}
      >
        Доступ запрещен
      </h2>
      <br />
      <p style={{
        color: 'aliceblue',
        width: '90%',
        textAlign: 'center'
      }}>
        У вас недостаточно прав для просмотра этой страницы.
      </p>
      <br />
      <p style={{ color: 'aliceblue', textAlign: 'center' }}>
        Требуемые роли: {displayRoles.join(", ")}
        <br />
        Ваша роль: {userRole || "Не определена"}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <Button
          navigateTo='INDEX'
          text="Назад"
        />
      </div>
    </div>
  )
}