import { useState } from 'react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ErrorDisplay from './ErrorDisplay';

import styles from '../styles/login.module.css';

const LoginForm = ({
  credentials,
  errors,
  isLoading,
  onCredentialsChange,
  onLogin,
  onErrorsChange,
  onLoadingChange,
  navigate
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault()
    onLoadingChange(true);
    onErrorsChange({});

    try {
      const response = await onLogin(credentials)
      const redirectUrl = response.data.redirect || '/';
      navigate(redirectUrl)
    } catch (error) {
      onErrorsChange({
        general: error.message || 'Login failed. Please check your credentials.'
      })
    } finally {
      onLoadingChange(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainBlock}>
        <h2>Вход</h2>
        <ErrorDisplay errors={errors} />
        <form onSubmit={handleSubmit}>
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
          <div style={{ display: 'flex', justifyContent: 'center' }}>
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