import { useNavigate } from 'react-router'
import Button from '../../../components/Button'
import InDev from '../../../components/InDev'

import nurseStyles from '../nurseMenu.module.scss'


export default function NurseDisplay() {
  return (
    <div className={nurseStyles.container}>
      <div className={nurseStyles.mainBlock}>
        {title()}
        {buttons()}
      </div>
    </div>
  )
}

function title() {
  return (
    <div style={{ margin: "10px 0" }}>
      МЕНЮ МЕДСЕСТЕР
    </div>
  )
}

function buttons() {
  const navigate = useNavigate()

  return (
    <>
      <div className={nurseStyles.buttonsContainer}>
        <Button
          text="Пациенты отделения"
          className={nurseStyles.button}
          navigateTo='HOSPITALIZED'
        />
        <Button
          text="Выписанные"
          className={nurseStyles.button}
          navigateTo='DISCHARGED'
        />
      </div>

      <div className={nurseStyles.buttonsContainer}>
        <Button
          text="Поступившие"
          className={nurseStyles.button}
          navigateTo='ADMINISTERED'
        />
        <InDev >
          <Button
            text="TEST"
            className={nurseStyles.button}
            onClick={() => {
              console.log('')
            }}
          />
        </InDev>
      </div>
    </>
  )
}