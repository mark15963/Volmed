import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { AppProviders } from '@context/index'
import Content from './layouts/content/Content'
import Header from './layouts/header/Header'
import Footer from './layouts/footer/Footer'

import { NetworkNotification } from '@/components'
import { useBackendHealth } from '@/hooks/useBackendHealth'

import './App.css'

const RECOVERY_MESSAGE_DURATION = 2000
const ESCALATION_DELAY = 30000

const App = () => {
  const {
    isBackendHealthy,
    isBackendUnavailable,
    isCheckingBackend,
    failureReason,
    failedAttempts,
    outageStartedAt,
    isBrowserOnline
  } = useBackendHealth()

  const [showRecoverySuccess, setShowRecoverySuccess] = useState(false)
  const [showEscalation, setShowEscalation] = useState(false)

  const wasUnavailable = useRef(false)

  const isLocked = !isBackendHealthy
  const showLockShell = isLocked || showRecoverySuccess

  useEffect(() => {
    const root = document.getElementById('root')

    if (!root) return

    root.toggleAttribute('inert', isLocked)

    return () => {
      root.removeAttribute('inert')
    }
  }, [isLocked])

  useEffect(() => {
    if (isBackendUnavailable) {
      wasUnavailable.current = true
      setShowRecoverySuccess(false)
      return
    }

    if (!isBackendHealthy || !wasUnavailable.current) return

    wasUnavailable.current = false
    setShowRecoverySuccess(true)

    const timer = setTimeout(() => {
      setShowRecoverySuccess(false)
    }, RECOVERY_MESSAGE_DURATION)

    return () => {
      clearTimeout(timer)
    }
  }, [isBackendHealthy, isBackendUnavailable])

  useEffect(() => {
    if (outageStartedAt === null) {
      setShowEscalation(false)
      return
    }

    const elapsed = Date.now() - outageStartedAt
    const remaining = Math.max(0, ESCALATION_DELAY - elapsed)

    if (remaining === 0) {
      setShowEscalation(true)
      return
    }

    setShowEscalation(false)

    const timer = setTimeout(() => {
      setShowEscalation(true)
    }, remaining)

    return () => {
      clearTimeout(timer)
    }
  }, [outageStartedAt])

  const title = showRecoverySuccess
    ? "Соединение восстановлено"
    : !isBrowserOnline
      ? 'Нет сетевого подключения'
      : isCheckingBackend
        ? 'Проверка соединения'
        : failureReason === 'database'
          ? 'База данных недоступна'
          : 'Сервер недоступен'

  const description = showRecoverySuccess
    ? 'Соединение с сервером и базой данных восстановлено.'
    : !isBrowserOnline
      ? 'Проверьте подключение к Wi-Fi или Ethernet.'
      : isCheckingBackend
        ? 'Проверяем соединение с сервером и базой данных.'
        : failureReason === 'database'
          ? 'Сервер отвечает, но база данных недоступна.'
          : 'Не удалось связаться с сервером приложения.'

  return (
    <AppProviders>
      <Header />
      <Content />
      <Footer />

      {createPortal(
        <NetworkNotification />,
        document.body
      )}

      {showLockShell &&
        createPortal(
          <div
            className={`backend-lock-overlay${showRecoverySuccess
              ? ' backend-lock-overlay--success'
              : ''
              }`}
            role='status'
            aria-live='polite'
          >
            <div className='backend-lock-message'>
              {showRecoverySuccess ? (
                <div
                  className='backend-lock-success-icon'
                  aria-hidden="true"
                >
                  ✓
                </div>
              ) : (
                <div
                  className='backend-lock-spinner'
                  aria-hidden="true"
                />
              )}

              <h2>{title}</h2>
              <p>{description}</p>

              {!showRecoverySuccess && (
                <>
                  <p>
                    {isCheckingBackend
                      ? 'Подождите, пожалуйста.'
                      : 'Повторное подключение выполняется автоматически.'}
                  </p>

                  {showEscalation && (
                    <p>
                      Не удалось восстановить соединение после нескольких
                      попыток. Проверьте сеть. Если проблема сохраняется,
                      обратитесь к системному администратору.
                    </p>
                  )}

                  {failedAttempts > 0 && (
                    <p>
                      Попыток восстановления: {failedAttempts}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </AppProviders>
  )
}

export default App