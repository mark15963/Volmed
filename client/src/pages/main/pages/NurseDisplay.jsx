import { useNavigate } from 'react-router'
import Button from '../../../components/Button'
import InDev from '../../../components/InDev'

import nurseStyles from '../nurseMenu.module.scss'


export default function NurseDisplay() {
  return (
    <div className={nurseStyles.container}>
      <div className={nurseStyles.mainBlock}>
        {title()}
        {control()}
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

function control() {
  const navigate = useNavigate()

  return (
    <>
      <div className={nurseStyles.buttonsContainer}>
        <Button
          text="Пациенты отделения"
          className={nurseStyles.button}
          onClick={() => {
            navigate('/hospitalized')
          }}
        />
        <Button
          text="Выписанные"
          className={nurseStyles.button}
          onClick={() => {
            navigate('/discharged')
          }}
        />
      </div>

      <div className={nurseStyles.buttonsContainer}>
        <Button
          text="Поступившие"
          className={nurseStyles.button}
          onClick={() => {
            navigate('/administered')
          }}
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