//#region ===== IMPORTS =====
import { Routes, Route } from "react-router"
import { lazy, Suspense } from 'react'

import OfflineFallback from "../../services/notifications/offlineFallback";

import { useConfig } from '../../context'
import { usePageTitle } from "../../utils/usePageTitle";

import debug from "../../utils/debug";
import ProtectedRoute from './ProtectedRoute'

import { appRoutes } from "../../routes/appRoutes";

//----- COMPONENTS -----
{/* Handicap loader */ }
import Loader from "../../components/loaders/Loader";

// ----- STYLE -----
import './content.scss'
//#endregion

const Content = () => {
  const { color } = useConfig()

  // Page title chages depending on the page
  usePageTitle()

  return (
    <main // Main style is imported
      style={{
        backgroundColor: color.content, // From cache
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
