import { useCallback, useEffect } from 'react';
import styles from '../header.module.scss'
import debug from '@utils/debug';
import { useNavigate } from 'react-router';
import { useConfig } from '../../../context';
import Loader from '@components/UI/loaders/Loader';

const Title = () => {
  const navigate = useNavigate();
  const { title, color, logo, isLoading } = useConfig()

  const logoSource = logo || null

  useEffect(() => {
    if (!logoSource) return

    const img = new Image()

    img.onload = () => {
      debug.success("[Logo] Logo loaded successfully")
    }

    img.onerror = () => {
      debug.warn("[Logo] Failed to load logo")
      img.src = `${logoSource}${logoSource.includes('?') ? '&' : '?'}t=${Date.now()}`
    }

    img.src = logoSource
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [logoSource])

  const handleClick = useCallback(() => {
    debug.log("[Logo] Clicked on logo")
    navigate('/');
  }, [navigate])

  const titleText = typeof title === 'string' ? title : title?.title || ''

  return (
    <>
      <img
        src={logoSource}
        alt="Logo"
        className={styles.logo}
        style={{ display: 'none' }}
        onClick={handleClick}
        loading='eager'
        draggable='false'
        onLoad={(e) => {
          debug.success("[Logo] Logo loaded successfully")
          e.target.style.display = 'block'
        }}
        onError={(e) => {
          const img = e.currentTarget

          if (!img.dataset.retried) {
            img.dataset.retried = true
            img.src = `${logoSource}${logoSource.includes('?') ? '&' : '?'}t=${Date.now()}`
            return
          }

          debug.warn("[Logo] Failed to load logo")
          img.style.display = 'none'
        }}
      />
      <div
        className={styles.title}
        onClick={handleClick}
      >
        {titleText}
      </div>

      {/* ===== Title on print ===== */}
      {/* 
        <div
          className={styles.titlePrint}
        >
          <span className={styles.titlePrintText}>
              {title.top}
          </span>
          <span className={styles.titlePrintText}>
            {title.bottom}
          </span>
          <br />
          <span className={styles.titleStreetPrint}>Волноваха, Железнодорожный переулок</span>
        </div> 
      */}
      {/* ========================== */}
    </>
  )
}

export default Title