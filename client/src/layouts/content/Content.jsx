//#region ===== IMPORTS =====
import { Routes, Route } from "react-router"
import { lazy, Suspense } from 'react'

import OfflineFallback from "../../services/notifications/offlineFallback";

import { useConfig } from '../../context'
import { usePageTitle } from "../../utils/usePageTitle";

import debug from "../../utils/debug";
import ProtectedRoute from './ProtectedRoute'

import { appRoutes } from "../../pages/routes/pageRoutes";

//----- COMPONENTS -----
import Loader from "../../components/loaders/Loader";

// ----- STYLE -----
import './content.scss'
//#endregion

const Content = () => {
  const { color } = useConfig()

  // Page title chages depending on the page
  usePageTitle()

  return (
    <main
      style={{
        backgroundColor: color.content, // From cache
      }}
    >
      {/* Оffline/online indicator */}
      <OfflineFallback />

      {/* Handicap loader */}
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
