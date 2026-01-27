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
import OfflineFallback from "../../components/ui/offlineFallback";

// UI
import styles from './content.module.scss'
//#endregion

const Content = () => {
  const { color } = useConfig()

  // Page title chages depending on the page
  usePageTitle()

  return (
    <main
      className={styles.main}
      style={{
        backgroundColor: color?.content, // From cache
      }}
    >
      <OfflineFallback /> {/* Оffline/online indicator */}

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
