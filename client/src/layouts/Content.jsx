//#region ===== IMPORTS =====
import { Routes, Route } from "react-router"
import { lazy, Suspense } from 'react'

import OfflineFallback from "../services/notifications/offlineFallback";

import { useConfig } from '../context'

import debug from "../utils/debug";
import ProtectedRoute from './ProtectedRoute'
import { usePageTitle } from "../utils/usePageTitle";

//----- PAGES -----
// import Main from "../pages/main/Main";
// import SearchResults from "../pages/searchResults/SearchResults";
// import List from "../pages/patientsList/List";
// import RegisterPatient from "../pages/register/RegisterPatient";
// import EditPatient from "../pages/edit/EditPatient";
// import Login from "../pages/login/LoginPage";
// import Administered from "../pages/nurse/Administered";
// import Discharged from "../pages/nurse/Discharged";
// import Hospitalized from "../pages/nurse/Hospitalized";
// import Dashboard from "../pages/admin/Dashboard";
// import NotFound from "../pages/NotFound";
// import NurseDisplay from "../pages/main/pages/NurseDisplay";

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
