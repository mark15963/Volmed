import { useState } from "react"

import { usePatients, useUsers, useConfig } from "../../context"

import InDev from "../../components/InDev"
import UsersList from "../../components/admin/UsersList"
import { SpinLoader } from "../../components/Loading/SpinLoader.tsx"

import { Divider } from "antd"
import styles from './styles/dashboard.module.scss'
import Button from "../../components/Button"
import Input from "../../components/Input"
import api from "../../services/api"


export const Dashboard = () => {
  const { patients, loading: patientsLoading } = usePatients()
  const { users, loading: usersLoading } = useUsers()
  const { title, setTitle, color, setColor } = useConfig()
  const [topInput, setTopInput] = useState(title.top)
  const [bottomInput, setBottomInput] = useState(title.bottom)
  const [headerColorInput, setHeaderColorInput] = useState(color.header)
  const [contentColorInput, setContentColorInput] = useState(color.content)

  const handleSave = async () => {
    try {
      const { data } = await api.updateTitle({
        topTitle: topInput,
        bottomTitle: bottomInput,
        headerColor: headerColorInput
      })

      setTitle({
        top: topInput,
        bottom: bottomInput
      })
      setColor({
        header: headerColorInput,
        content: contentColorInput
      })

    } catch (err) {
      console.error("Failed to update title:", err)
    }
  }

  const handleHeaderColorChange = (e) => {
    setHeaderColorInput(e.target.value);
  };
  const handleContentColorChange = (e) => {
    setContentColorInput(e.target.value)
  };

  const countUsers = users.length
  const countDoctors = users.filter(user => user.status === 'Врач').length
  const countNurses = users.filter(user => user.status === 'Сестра').length
  const countPatients = patients.length
  const stablePatients = patients.filter(patient => patient.state === 'Стабильно').length
  const dischargedPatients = patients.filter(patient => patient.state === 'Выписан' || patient.state === 'Выписана').length

  return (
    <div className={styles.container}>
      <div className={styles.mainBlock}>
        <div className={styles.row} style={{ color: 'aliceblue', fontWeight: '800', justifyContent: 'center', margin: '10px' }}>
          ПАНЕЛЬ УПРАВЛЕНИЯ
        </div>
        <div className={styles.row}>
          <div className={styles.block}>
            <div className={styles.blockTitle}>
              Настройки сайта
            </div>
            <div className={styles.blockContent}>
              Название сайта:
              <Input
                type="text"
                value={topInput}
                onChange={
                  (e) => setTopInput(e.target.value)
                }
                placeholder='Верхняя строка'
                style={{ marginTop: '5px' }}
              />
              <div style={{ height: '10px' }} />
              <Input
                type="text"
                value={bottomInput}
                onChange={
                  (e) => setBottomInput(e.target.value)
                }
                placeholder="Нижняя строка"
              />
              <div style={{ height: '20px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  Цвет шапки
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                    <Input
                      type="color"
                      value={headerColorInput}
                      onChange={handleHeaderColorChange}
                      style={{ width: '50px', height: '30px', padding: 0, border: 'none' }}
                    />
                    <span>{headerColorInput.toUpperCase()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  Цвет заднего фона
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                    <Input
                      type="color"
                      value={contentColorInput}
                      onChange={handleContentColorChange}
                      style={{ width: '50px', height: '30px', padding: 0, border: 'none' }}
                    />
                    <span>{contentColorInput.toUpperCase()}</span>
                  </div>
                </div>

              </div>
              <br />
              <Button text="Сохранить" onClick={handleSave} />
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.block}>
            <div className={styles.blockTitle}>
              ОБЩИЕ ДАННЫЕ ПАЦИЕНТОВ
            </div>
            {usersLoading ? (
              <div className={styles.blockContentLoader}>
                <SpinLoader
                  color='black'
                  size="30px"
                />
              </div>
            ) : (
              <>
                <div className={styles.blockContent}>
                  Всего поступили: {countPatients}
                </div>
                <div className={styles.blockContent}>
                  Стабильные: {stablePatients}
                </div>
                <div className={styles.blockContent}>
                  Выписанно: {dischargedPatients}
                </div>
              </>
            )}
          </div>
          <div className={styles.block}>
            <div className={styles.blockTitle}>
              ОБЩИЕ ДАННЫЕ ПЕРСОНАЛА
            </div>
            {usersLoading ? (
              <div className={styles.blockContentLoader}>
                <SpinLoader
                  color="black"
                  size="30px"
                />
              </div>
            ) : (
              <>
                <div className={styles.blockContent}>
                  Всего персонала: {countUsers}
                </div>
                <div className={styles.blockContent}>
                  Врачи: {countDoctors}
                </div>
                <div className={styles.blockContent}>
                  Сестры: {countNurses}
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.block}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className={styles.blockTitle}>
              ПЕРСОНАЛ
            </div>
            <div className={styles.blockContent}>
              <div>
                <UsersList />
              </div>
            </div>
          </div>
        </div>
        <br />

        <InDev>
          <div className={styles.row}>
            <div className={styles.block}>
              <div className={styles.blockTitle}>
                БЛОК В РАЗРАБОТКЕ
              </div>
              <div className={styles.blockContent}>
                {`TEST TEST TEST: ${'TEST'}`}
              </div>
              <div className={styles.blockContent}>
                {`TEST TEST TEST: ${'TEST'}`}
              </div>
            </div>
            <div className={styles.block}>
              <div className={styles.blockTitle}>
                БЛОК В РАЗРАБОТКЕ
              </div>
              <div className={styles.blockContent}>
                {`TEST TEST TEST: ${'TEST'}`}
              </div>
              <div className={styles.blockContent}>
                {`TEST TEST TEST: ${'TEST'}`}
              </div>
            </div>
          </div>
        </InDev >

      </div >
    </div >
  )
}

export default Dashboard
