//#region === IMPORTS ===
import { useEffect, useState } from 'react'

import { useAuth } from '../../../context'
import { useUsers } from "../../../context/UsersDataContext"

import { usePerItemLoading } from '../../../hooks/usePerItemLoading'
import { useSafeMessage } from '../../../hooks/useSafeMessage'

import Button from '../../../components/Button'
import { SpinLoader } from '../../../components/ui/loaders/SpinLoader'

import { statusDisplayMap, displayStatusMap } from "../../../utils/statusMap"
import api from '../../../services/api/index'

import styles from './styles/UsersList.module.scss'
import { UserData } from '../pages/UserData'
//#endregion

const statusOptions = [
  'Администратор',
  'Тестировщик',
  'Сестра',
  'Врач'
]

const UsersList = () => {
  //#region === CONSTS ===
  const { authState } = useAuth()
  const safeMessage = useSafeMessage()
  const { users, loading, fetchUsers } = useUsers()

  const {
    loadingStates: deleteLoading,
    setItemLoading: setDeleteLoading
  } = usePerItemLoading()

  const {
    loadingStates: statusLoading,
    setItemLoading: setStatusLoading
  } = usePerItemLoading()

  const [addLoading, setAddLoading] = useState(false)
  const [showUserData, setShowUserData] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  //#endregion

  //#region === HANDLERS ===
  const handleStatusChange = async (id, newStatusDisplay) => {
    try {
      setStatusLoading(id, true)
      safeMessage("loading", "Обновление роли...", 1)
      // Convert display name to backend code
      const backendStatus = displayStatusMap[newStatusDisplay]
      const res = await api.updateUser(id, { status: backendStatus })
      if (res.ok) {
        await fetchUsers(false)
        setTimeout(() => {
          safeMessage("success", "Роль успешно обновлена!")
        }, 100)

      } else {
        throw new Error(res.message)
      }
    } catch (err) {
      console.error('Failed to update status:', err.message)
      safeMessage("error", "Ошибка обновления роли!")
    } finally {
      setStatusLoading(id, false)
    }
  }
  const handleAddUser = async () => {
    const username = prompt("Введите имя пользователя:");
    if (!username) return;
    const password = prompt("Введите пароль:");
    if (!password) return;
    const lastName = prompt("Введите фамилию:");
    if (!lastName) return;
    const firstName = prompt("Введите имя:");
    if (!firstName) return;
    const patr = prompt("Введите отчество (необязательно):") || null;
    const statusDisplay = prompt("Введите статус (Администратор, Тестировщик, Сестра, Врач):");
    if (!statusDisplay) return;

    const backendStatus = displayStatusMap[statusDisplay] || 'nurse'

    try {
      setAddLoading(true)
      await api.createUser({
        username,
        password,
        firstName,
        lastName,
        patr,
        status: backendStatus
      });
      await fetchUsers(false);
    } catch (err) {
      alert("Не удалось добавить пользователя");
      console.error("Failed to add user:", err.message);
    } finally {
      setAddLoading(false)
    }
  }
  const handleUserDelete = async (id) => {
    if (!window.confirm("Удалить?")) return
    try {
      setDeleteLoading(id, true)

      await api.deleteUser(id)
      await fetchUsers(false)
    } catch (err) {
      console.error('Failed to delete user:', err.message)
    } finally {
      setDeleteLoading(id, false)
    }
  }
  const handleOpenUserData = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUser(user);
      setShowUserData(true);
    } else {
      console.warn(`User with id ${userId} not found in current list`);
    }
  };
  const handleCloseUserData = () => {
    setShowUserData(false);
    setSelectedUser(null);
  };
  //#endregion

  if (loading) return <SpinLoader color="black" size="30px" />
  if (users.length === 0) {
    return (
      <select className={styles.select} disabled>
        <option>{authState.user.username}</option>
      </select>
    )
  }

  return (
    <>
      {showUserData && selectedUser && (
        <UserData
          user={selectedUser}
          onClose={handleCloseUserData}
        />
      )}
      <table className={styles.table}>
        <tbody>
          {users.map((user, i) => (
            <tr
              key={user.id}
              className={styles.userRow}
            >
              <td
                className={styles.nameCell}
                onClick={() => {
                  handleOpenUserData(user.id)
                }}
              >
                <span className={styles.name}>
                  [{user.id}] {user.lastName} {user.firstName} {user.patr}
                </span>
              </td>
              <td className={styles.actionCell}>
                <select
                  value={statusDisplayMap[user.status] || user.status}
                  disabled={
                    user.status === "admin" ||
                    statusLoading[user.id]
                  }
                  className={
                    statusLoading[user.id]
                      ? `${styles.select} ${styles.loading}`
                      : `${styles.select}`
                  }
                  onChange={(e) => {
                    if (user.status === "admin") return
                    handleStatusChange(user.id, e.target.value)
                  }}
                >
                  {Object.values(statusDisplayMap).map((displayName) => (
                    <option key={displayName} value={displayName}>
                      {displayName}
                    </option>
                  ))}
                </select>
                <Button
                  text='Удалить'
                  size='s'
                  disabled={user.status === "admin"}
                  loading={deleteLoading[user.id]}
                  loadingText='Удаление...'
                  onClick={() => handleUserDelete(user.id)}
                />
              </td>
            </tr>
          ))}

        </tbody>
      </table>
      <Button
        text="Добавить"
        size="s"
        loading={addLoading}
        onClick={() => handleAddUser()}
        style={{
          marginBottom: '20px'
        }}
      />
    </>
  )
}

export default UsersList