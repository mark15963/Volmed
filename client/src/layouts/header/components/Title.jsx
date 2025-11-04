import { useCallback, useEffect } from 'react';
import styles from '../header.module.scss'
import debug from '../../../utils/debug';
import { useNavigate } from 'react-router';
import { useConfig } from '../../../context';
import Loader from '@/components/loaders/Loader';

const Title = () => {
  const navigate = useNavigate();
  const { title, color, logo, isLoading } = useConfig()

  const logoSource = logo || null

  useEffect(() => {
    if (logoSource) {
      const img = new Image()
      img.src = logoSource
    }
  }, [logoSource])

  const handleClick = useCallback(() => {
    debug.log("Clicked on logo")
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
          e.target.style.display = 'block'
        }}
        onError={(e) => {
          console.log("Can not load logo", logoSource, e)
          e.target.style.display = 'none'
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