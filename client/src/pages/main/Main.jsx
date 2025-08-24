import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react'

import { useAuth } from '../../context/AuthContext'

import { SearchBar } from '../../components/SearchBar';
import Button from '../../components/Buttons.tsx';

import styles from './main.module.scss'
import nurseStyles from './nurseMenu.module.css'
import Loader from '../../components/Loader';

export const Main = () => {
  const { authState } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  if (authState.isLoading) return <Loader />
  if (!authState.isAuthenticated) return null
  
  if (authState.user.status==='Сестра') {
    return (
      <div className={nurseStyles.container}>
        <div className={nurseStyles.mainBlock}>
          <div style={{ margin: "10px 0" }}>
            МЕНЮ МЕДСЕСТЕР
          </div>
          <div className={nurseStyles.buttonsContainer}>
            <Button 
              text="Поступившие"
              className={nurseStyles.button}
              onClick={() => {
                navigate('/administered')
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
              text="Пациенты отделения"
              className={nurseStyles.button}
              onClick={() => {
                navigate('/hospitalized')
              }}
            />
            <Button 
              text="TEST"
              className={nurseStyles.button}
              onClick={() => {
                console.log('Clicked')
              }}
            />
          </div>
        </div>
      </div>
    )
  }
              
  if (authState.user.status!=='Сестра') {
    return (
      <div className={styles.container}>
        <div className={styles.mainBlock}>
          <SearchBar />
          <div className={styles.buttonsContainer}>
            <Button
              text='Список пациентов'
              icon='patients'
              margin='0 0 0 5px'
              onClick={() => {
                navigate('/patients')
              }}
            />
            <Button
              text='Новый пациент'
              icon='newPatient'
              margin='0 0 0 5px'
              onClick={() => {
                navigate('/register')
              }}
            />
          </div>
        </div>
      </div>
    ) 
  }
}

export default Main
