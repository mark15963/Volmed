//#region ===== IMPORTS =====
import { Routes, Route, Navigate, useNavigate } from "react-router"
import { lazy, Suspense, useContext, useEffect } from 'react'

import { useAuth, useConfig } from '../context'

import debug from "../utils/debug";
import ProtectedRoute from './ProtectedRoute'

//----- PAGES -----
const Main = lazy(() => import('../pages/main/Main'));
const SearchResults = lazy(() => import('../pages/searchResults/SearchRes'));
const List = lazy(() => import('../pages/patientsList/List'));
const RegisterPatient = lazy(() => import('../pages/register/RegisterPatient'));
const EditPatient = lazy(() => import('../pages/edit/EditPatient'));
const Login = lazy(() => import('../pages/login/Login'));
const Administered = lazy(() => import('../pages/nurse/Administered'));
const Discharged = lazy(() => import('../pages/nurse/Discharged'));
const Hospitalized = lazy(() => import('../pages/nurse/Hospitalized'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const NotFound = lazy(() => import('../pages/NotFound'));

//----- COMPONENTS -----
import Loader from "../components/Loader";
//#endregion

const Content = () => {
    const { color } = useConfig()

    return (
        <main
            style={{
                backgroundColor: color.content,
            }}
        >
            <Suspense fallback={<Loader />}>
                <Routes>
                    {/*----- PUBLIC ROUTE -----*/}
                    <Route path="/login" element={<Login />} />

                    {/*----- DOCTOR ROUTES -----*/}
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
                    {/*----- NURSE ROUTES -----*/}
                    <Route path="/administered" element={
                        <ProtectedRoute roles={["nurse", "Сестра"]}>
                            <Administered />
                        </ProtectedRoute>
                    } />
                    <Route path="/discharged" element={
                        <ProtectedRoute roles={["nurse", "Сестра"]}>
                            <Discharged />
                        </ProtectedRoute>
                    } />
                    <Route path="/hospitalized" element={
                        <ProtectedRoute roles={["nurse", "Сестра"]}>
                            <Hospitalized />
                        </ProtectedRoute>
                    } />
                    {/*----- ADMIN ONLY ROUTE-----*/}
                    <Route path="/dashboard" element={
                        <ProtectedRoute roles={["admin", "Администратор"]}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    {/*----- 404 -----*/}
                    <Route path="/*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </main>
    )
}

export default Content
