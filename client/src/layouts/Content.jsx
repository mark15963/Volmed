//#region ===== IMPORTS =====
import { Routes, Route, Navigate, useNavigate } from "react-router"
import { lazy, Suspense, useContext, useEffect } from 'react'

import { useAuth } from '../context/AuthContext'
import debug from "../utils/debug";
import ProtectedRoute from './ProtectedRoute'

//----- PAGES -----
const Main = lazy(() => import('../pages/main/Main'));
const SearchResults = lazy(() => import('../pages/searchResults/SearchRes'));
const List = lazy(() => import('../pages/patientsList/List'));
const RegisterPatient = lazy(() => import('../pages/register/RegisterPatient'));
const EditPatient = lazy(() => import('../pages/edit/EditPatient'));
const Login = lazy(() => import('../pages/login/Login'));
const Administered = lazy (() => import('../pages/nurse/Administered'))
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const NotFound = lazy(() => import('../pages/NotFound'));

//----- COMPONENTS -----
import Loader from "../components/Loader";
//#endregion

const Content = () => {
    return (
        <main>
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
                      <ProtectedRoute nurse>
                        <Administered />
                      </ProtectedRoute>
                    } />
                    {/*----- ADMIN ONLY ROUTE-----*/}
                    <Route path="/dashboard" element={
                        <ProtectedRoute adminOnly>
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
