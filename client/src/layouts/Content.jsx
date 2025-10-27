//#region ===== IMPORTS =====
import { Routes, Route } from "react-router"
import { Suspense } from 'react'

import OfflineFallback from "../services/notifications/offlineFallback";

import { useConfig } from '../context'

import debug from "../utils/debug";
import ProtectedRoute from './ProtectedRoute'
import { usePageTitle } from "../utils/usePageTitle";

//----- PAGES -----
import Main from "../pages/main/Main";
import SearchResults from "../pages/searchResults/SearchResults";
import List from "../pages/patientsList/List";
import RegisterPatient from "../pages/register/RegisterPatient";
import EditPatient from "../pages/edit/EditPatient";
import Login from "../pages/login/LoginPage";
import Administered from "../pages/nurse/Administered";
import Discharged from "../pages/nurse/Discharged";
import Hospitalized from "../pages/nurse/Hospitalized";
import Dashboard from "../pages/admin/Dashboard";
import NotFound from "../pages/NotFound";

//----- COMPONENTS -----
import Loader from "../components/Loader";
import NurseDisplay from "../pages/main/pages/NurseDisplay";
//#endregion

const Content = () => {
  const { color } = useConfig()

  // Page title chages depending on the page
  usePageTitle()

  return (
    <main
      style={{
        // Color palette from cache
        backgroundColor: color.content,
      }}
    >
      <OfflineFallback /> {/*Shown when offline*/}

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
