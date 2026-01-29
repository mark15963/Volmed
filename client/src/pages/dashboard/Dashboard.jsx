//#region ===== IMPORTS =====
import { useNavigate } from "react-router"

// Blocks of page
import GeneralConfig from "./blocks/GeneralConfig"
import { PatientsStatus, UsersStatus } from "./blocks/Status"
import UsersList from "./blocks/UsersList"

//
import { useConfig } from "../../context"
import { PAGES } from "@/constants"

// Components
import Block from "./components/Block"
import Row from "./components/Row"
import Button from "@/components/Button"
import { ListOfPatients } from "../../components/tables/ListOfPatients"

// UI
import styles from './dashboard.module.scss'
import '@/styles/index.scss'
//#endregion

export const Dashboard = () => {
  const navigate = useNavigate()
  const { color, theme } = useConfig()

  return (
    <div
      className={styles.mainBlock}
      data-theme-app={theme.app}
    >
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
          <PatientsStatus />
        </Block>

        <Block title='ОБЩИЕ ДАННЫЕ ПЕРСОНАЛА'>
          <UsersStatus />
        </Block>
      </Row>

      <Row>
        <Block title='ПЕРСОНАЛ'>
          <UsersList />
        </Block>
      </Row>

      <Row>
        <Block title='ПАЦИЕНТЫ'>
          <ListOfPatients
            option='all'
            theme={theme.table}
            onRowClick="popup"
          />
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
  )
}

export default Dashboard
