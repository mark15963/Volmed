//#region === IMPORTS ===
import { Routes, Route } from "react-router"
import { lazy, Suspense } from 'react'

import { appRoutes } from "../../routes/appRoutes";
import { useConfig } from '../../context'
import { debug, usePageTitle } from "../../utils";

// Components
{/* Handicap loader */ }
import Loader from "../../components/ui/loaders/Loader";
import ProtectedRoute from './components/ProtectedRoute'
import NetworkNotification from "../../components/ui/networkNotification";

// UI
import styles from './content.module.scss'
//#endregion

const Content = () => {
  const { theme } = useConfig()

  // Page title chages depending on the page
  usePageTitle()

  return (
    <main
      className={styles.main}
      data-theme-app={theme.app}
    >
      <NetworkNotification />

      <Suspense fallback={<Loader />}>
        <Routes>
          {appRoutes.map(({ path, element }, i) => (
            <Route key={i} path={path} element={element} />
          ))}
        </Routes>
      </Suspense>
    </main>
  )
}

export default Content
