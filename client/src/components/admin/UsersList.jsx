import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useUsers } from "../../context/UsersDataContext"

import styles from './styles/UsersList.module.scss'
import { SpinLoader } from '../Loading/SpinLoader'
import Button from '../Button'
import api from '../../services/api'

const statusOptions = ['Администратор', 'Тестировщик', 'Сестра', 'Врач']

const UsersList = () => {
  const { authState } = useAuth()
  const { users, loading, fetchUsers } = useUsers()

  const [updatingUserId, setUpdatingUserId] = useState(null)

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingUserId(id)
      await api.updateUser(id, { status: newStatus })
      await fetchUsers(false) // refresh without global loader
    } catch (err) {
      console.error('Failed to update status:', err.message)
    } finally {
      setUpdatingUserId(null)
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
    const status = prompt("Введите статус (Администратор, Тестировщик, Сестра, Врач):");
    if (!status) return;

    try {
      await api.createUser({ username, password, firstName, lastName, patr, status });
      await fetchUsers(false);
    } catch (err) {
      alert("Не удалось добавить пользователя");
      console.error("Failed to add user:", err.message);

    }
  }

  const handleUserDelete = async (id) => {
    if (!window.confirm("Удалить?")) return
    try {
      await api.deleteUser(id)
      await fetchUsers(false)
    } catch (err) {
      console.error('Failed to delete user:', err.message)
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
              <td>
                <span className={styles.name}>[{user.id}] {user.lastName} {user.firstName} {user.patr}</span>
              </td>
              <td>
                <select
                  value={user.status}
                  disabled={user.status === "Администратор"}
                  className={styles.select}
                  onChange={(e) => {
                    if (user.status === "Администратор") return
                    handleStatusChange(user.id, e.target.value)
                  }}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <Button
                  text='Удалить'
                  size='s'
                  disabled={user.status === "Администратор"}
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
        onClick={() => handleAddUser()}
      />
    </>
  )
}

export default UsersList