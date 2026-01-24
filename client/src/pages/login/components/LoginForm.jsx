//#region === IMPORTS ===
import { useState } from 'react';

import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ErrorDisplay from './ErrorDisplay';

import { useConfig } from '../../../context';
import { debug } from '../../../utils/debug';

import styles from '../styles/login.module.scss';
import '@/styles/index.scss'
//#endregion

const LoginForm = ({
  credentials,
  errors,
  isLoading,
  onCredentialsChange,
  onLogin,
  onErrorsChange,
  onLoadingChange,
}) => {
  const { color } = useConfig()
  const handleSubmit = async (e) => {
    e.preventDefault()
    onLoadingChange(true);
    onErrorsChange({}); // sets no errors in the beginning

    try {
      const res = await onLogin(credentials)

      if (res?.error) {
        onErrorsChange({
          general: res.message // Under <h2> error UI
        })
      }

    } catch (err) {
      debug('LoginForm error:', err);
      onErrorsChange({ general: 'Произошла неизвестная ошибка' });
    } finally {
      onLoadingChange(false)
    }
  }

  return (
    <div
      className={styles.container}
    >
      <div
        className={styles.mainBlock}
        style={{ backgroundColor: color.container }}
      >
        <h2>Вход</h2>
        <ErrorDisplay errors={errors} />
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="username">
            Имя пользователя:
          </label>
          <Input
            name="username"
            id="username"
            type="text"
            placeholder="Имя пользователя"
            value={credentials.username}
            onChange={onCredentialsChange}
            required
            autoComplete="username"
          />
          <label htmlFor="password">
            Пароль:
          </label>
          <Input
            name="password"
            id="password"
            type="password"
            placeholder="Пароль"
            value={credentials.password}
            onChange={onCredentialsChange}
            required
            autoComplete="current-password"
          />
          <div className={styles.buttonContainer}>
            <Button
              text='Вход'
              type='submit'
              icon='login'
              loading={isLoading}
              loadingText='Вход...'
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm