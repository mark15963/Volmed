import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react'

import { useAuth } from '../../context/AuthContext'

import { SearchBar } from '../../components/SearchBar';
import Button from '../../components/Buttons.tsx';

import styles from './main.module.scss'
import nurseStyles from './nurseStyles.module.css'
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
            МЕНЮ МЕДСЕСТЕР
            <div className={nurseStyles.buttonsContainer}>
              <Button 
                text="Поступившие"
                className={nurseStyles.button}
              />
              <Button 
                text="Выписанные"
                className={nurseStyles.button}
              />
            </div>
          </div>
        </div>
      )
    }
    if (authState.user.status!=='Сестра'){
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
                  setIsLoading(true)
                  navigate('/patients')
                }}
                loading={isLoading}
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
