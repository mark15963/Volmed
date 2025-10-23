import { useNavigate } from "react-router"

// Blocks of page
import GeneralConfig from "./Blocks/GeneralConfig"
import { PatientsStats, UsersStats } from "./Blocks/Stats"
import UsersList from "./Blocks/UsersList"

// Components
import Block from "./components/Block"
import Row from "./components/Row"
import Button from "../../components/Button"

// UI
import styles from './styles/dashboard.module.scss'
import { PAGES } from "../../constants"

export const Dashboard = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <div className={styles.mainBlock}>
        <div className={styles.title}>
          ПАНЕЛЬ УПРАВЛЕНИЯ
        </div>

        <Row>
          <Block title='НАСТРОЙКИ САЙТА'>
            <GeneralConfig />
          </Block>
        </Row>

        <Row>
          <Block title='ОБЩИЕ ДАННЫЕ ПАЦИЕНТОВ'>
            <PatientsStats />
          </Block>

          <Block title='ОБЩИЕ ДАННЫЕ ПЕРСОНАЛА'>
            <UsersStats />
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
            navigateTo='INDEX'
            replace
          />
        </Row>
      </div >
    </div >
  )
}

export default Dashboard
