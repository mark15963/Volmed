import { useNavigate } from "react-router"

import { message } from "antd"

import { usePatients, useUsers } from "../../context"

import UsersList from "./Blocks/UsersList"
import GeneralConfig from "./Blocks/GeneralConfig"

import { SpinLoader } from "../../components/Loading/SpinLoader.tsx"
import Block from "./components/Block"
import Row from "./components/Row"
import Button from "../../components/Button"

import styles from './styles/dashboard.module.scss'

export const Dashboard = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const navigate = useNavigate()

  const { patients, loading: patientsLoading } = usePatients()
  const { users, loading: usersLoading } = useUsers()

  const countUsers = users.length
  const countDoctors = users.filter(user => user.status === 'Врач').length
  const countNurses = users.filter(user => user.status === 'Сестра').length
  const countPatients = patients.length
  const stablePatients = patients.filter(patient => patient.state === 'Стабильно').length
  const dischargedPatients = patients.filter(patient => patient.state === 'Выписан' || patient.state === 'Выписана').length

  return (
    <div className={styles.container}>
      {contextHolder}
      <div className={styles.mainBlock}>
        <div className={styles.title}>
          ПАНЕЛЬ УПРАВЛЕНИЯ
        </div>

        <Row>
          <Block title='НАСТРОЙКИ САЙТА'>
            <GeneralConfig messageApi={messageApi} />
          </Block>
        </Row>

        <Row>
          <Block title='ОБЩИЕ ДАННЫЕ ПАЦИЕНТОВ'>
            {patientsLoading ? (
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
          </Block>

          <Block title='ОБЩИЕ ДАННЫЕ ПЕРСОНАЛА'>
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
          </Block>
        </Row>

        <Row >
          <Block title='ПЕРСОНАЛ'>
            <UsersList />
          </Block>
        </Row>

        <Row center>
          <Button
            text="На главную"
            onClick={() => navigate('/')}
          />
        </Row>
      </div >
    </div >
  )
}

export default Dashboard
