//#region ===== IMPORTS =====
import { Routes, Route } from "react-router"
import { lazy, Suspense } from 'react'

import OfflineFallback from "../services/notifications/offlineFallback";

import { useConfig } from '../context'

import debug from "../utils/debug";
import ProtectedRoute from './ProtectedRoute'
import { usePageTitle } from "../utils/usePageTitle";

//----- PAGES -----
const Main = lazy(() => import("../pages/main/Main"));
const SearchResults = lazy(() => import("../pages/searchResults/SearchResults"));
const List = lazy(() => import("../pages/patientsList/List"));
const RegisterPatient = lazy(() => import("../pages/register/RegisterPatient"));
const EditPatient = lazy(() => import("../pages/edit/EditPatient"));
const Login = lazy(() => import("../pages/login/LoginPage"));
const Administered = lazy(() => import("../pages/nurse/Administered"));
const Discharged = lazy(() => import("../pages/nurse/Discharged"));
const Hospitalized = lazy(() => import("../pages/nurse/Hospitalized"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const NotFound = lazy(() => import("../pages/NotFound"));
const NurseDisplay = lazy(() => import("../pages/main/pages/NurseDisplay"));

//----- COMPONENTS -----
import Loader from "../components/Loader";
//#endregion

const Content = () => {
  const { color } = useConfig()

  // Page title chages depending on the page
  usePageTitle()

  return (
    <main
      style={{
        backgroundColor: color.content, // Color palette from cache
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 10px'
      }}
    >
      <OfflineFallback /> {/* Оffline/online indicator */}

      <Suspense fallback={<Loader />}> {/* Shows the handicap loader on first load */}
        <Routes>
          {/*===== PUBLIC ROUTE =====*/}
          <Route path="/login" element={<Login />} />

          {/*===== DOCTOR ROUTES =====*/}
          <Route path='/' element={
            <ProtectedRoute>
              <Main />
            </ProtectedRoute>
          } />
          <Route path='/patients' element={
            <ProtectedRoute>
              <List />
            </ProtectedRoute>
          } />
          <Route path="/search/:id" element={
            <ProtectedRoute>
              <SearchResults />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute>
              <RegisterPatient />
            </ProtectedRoute>
          } />
          <Route path="/edit/:id" element={
            <ProtectedRoute>
              <EditPatient />
            </ProtectedRoute>
          } />

          {/*===== NURSE ROUTES =====*/}
          <Route path="/administered" element={
            <ProtectedRoute roles={["nurse"]}>
              <Administered />
            </ProtectedRoute>
          } />
          <Route path="/discharged" element={
            <ProtectedRoute roles={["nurse"]}>
              <Discharged />
            </ProtectedRoute>
          } />
          <Route path="/hospitalized" element={
            <ProtectedRoute roles={["nurse"]}>
              <Hospitalized />
            </ProtectedRoute>
          } />

          {/*===== ADMIN ONLY ROUTES =====*/}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={[]}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/nurse-menu" element={
            <ProtectedRoute roles={["nurse"]}>
              <NurseDisplay />
            </ProtectedRoute>
          } />

          {/*===== 404 =====*/}
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
  )
}

export default Content
