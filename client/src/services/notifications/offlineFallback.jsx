// Used in Content.jsx

import { useState, useEffect, useRef } from 'react'

import styles from './styles.module.scss'

const OfflineFallback = () => {
  const [isOffline, setIsOffline] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [animation, setAnimation] = useState('')
  const timeoutRef = useRef(null)

  useEffect(() => {
    const resetAnimation = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setAnimation('')
    }

    const handleOffline = () => {
      resetAnimation()
      setIsOffline(true)
      setIsVisible(true)

      setTimeout(() => {
        setAnimation(styles.slideIn)
      }, 10)
    }

    const handleOnline = () => {
      resetAnimation()
      setIsOffline(false)
      setIsVisible(true)

      setAnimation(styles.slideOut)

      timeoutRef.current = setTimeout(() => {
        setAnimation(styles.slideIn)

        timeoutRef.current = setTimeout(() => {
          setAnimation(styles.slideOut)

          timeoutRef.current = setTimeout(() => {
            setIsVisible(false)
            setAnimation('')
            timeoutRef.current = null
          }, 400)
        }, 2000)
      }, 400)
    }

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`${styles.container} ${animation}`}
      data-status={isOffline ? 'offline' : 'online'}
    >
      {isOffline ? '⚠️ Отключен от сети' : '✅ В сети'}
    </div>
  )
}

export default OfflineFallback