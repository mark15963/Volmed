import { useEffect, useState } from 'react'

import { useAuth } from '../../../context/AuthContext'
import { useUsers } from "../../../context/UsersDataContext"
import { usePerItemLoading } from '../../../hooks/usePerItemLoading'

import Button from '../../../components/Button'
import { SpinLoader } from '../../../components/Loading/SpinLoader'

import api from '../../../services/api'

import styles from './styles/UsersList.module.scss'

const statusMap = {
  'Администратор': 'admin',
  'Тестировщик': 'tester',
  'Сестра': 'nurse',
  'Врач': 'doctor'
};
const reverseStatusMap = {
  'admin': 'Администратор',
  'tester': 'Тестировщик',
  'nurse': 'Сестра',
  'doctor': 'Врач'
};
const statusOptions = [
  'Администратор',
  'Тестировщик',
  'Сестра',
  'Врач'
]

const UsersList = () => {
  const { authState } = useAuth()
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

  const handleStatusChange = async (id, newStatusDisplay) => {
    try {
      setStatusLoading(id, true)
      // Convert display name to backend code
      const backendStatus = statusMap[newStatusDisplay]
      await api.updateUser(id, { status: backendStatus })
      await fetchUsers(false) // refresh without global loader
    } catch (err) {
      console.error('Failed to update status:', err.message)
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

    const backendStatus = statusMap[statusDisplay] || 'nurse'

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

  if (loading) {
    return <SpinLoader color="black" size="30px" />
  }

  if (users.length === 0) {
    return (
      <select className={styles.select} disabled>
        <option>{authState.user.username}</option>
      </select>
    )
  }

  return (
    <>
      <table>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className={styles.userRow}
            >
              <td className={styles.nameCell}>
                <span className={styles.name}>
                  [{user.id}] {user.lastName} {user.firstName} {user.patr}
                </span>
              </td>
              <td className={styles.actionCell}>
                <select
                  value={reverseStatusMap[user.status] || user.status}
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
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
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
      />
    </>
  )
}

export default UsersList