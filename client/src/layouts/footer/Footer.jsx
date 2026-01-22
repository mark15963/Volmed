import { memo } from 'react';
import ChatWidget from '../../components/Chat/ChatWidget';
import { SERVICE } from '../../constants';
import styles from './footer.module.scss'

export const Footer = memo(() => {
  const year = new Date().getFullYear()

  const projectService = SERVICE.find(service => service.project)
  const projectContent = projectService?.project || ""

  const adjustedYear = year > 2025
    ? `2025 - ${year}`
    : `${year}`

  return (
    <footer>
      <div className={styles.content}>
        © {projectContent} {adjustedYear}
      </div>
      <div className={styles.right}>
        <ChatWidget />
      </div>
    </footer>
  )
})

export default Footer
