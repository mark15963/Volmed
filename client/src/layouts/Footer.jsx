import { memo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import styles from './styles/footer.module.scss'
import ChatWidget from '../components/Chat/ChatWidget';


export const Footer = memo(() => {
  const year = new Date().getFullYear()
  const navigate = useNavigate();
  const location = useLocation();

  const yearText = year > 2025
    ? `Volmed 2025 - ${year}`
    : `Volmed ${year}`

  return (
    <footer>
      <div className={styles.content}>
        © {yearText}
      </div>
      <ChatWidget />
    </footer>
  )
})

export default Footer
