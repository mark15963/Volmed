import { memo } from 'react';

import ChatWidget from '../../components/Chat/ChatWidget';

import { services } from '../../constants';

import styles from './footer.module.scss'

export const Footer = memo(() => {
  const year = new Date().getFullYear()

  const projectService = services.find(service => service.title === "Project name")
  const projectContent = projectService?.content || ""

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
