import { Routes, Route, Navigate, useNavigate } from "react-router"
import { lazy, Suspense, useContext, useEffect } from 'react'

import { useAuth } from '../context/AuthContext'
import debug from "../utils/debug";
import ProtectedRoute from './ProtectedRoute'

//----- PAGES -----
const Main = lazy(() => import('../pages/main/Main.jsx'));
const SearchResults = lazy(() => import('../pages/searchResults/SearchRes.jsx'));
const List = lazy(() => import('../pages/patientsList/List.jsx'));
const RegisterPatient = lazy(() => import('../pages/register/RegisterPatient.jsx'));
const EditPatient = lazy(() => import('../pages/edit/EditPatient.jsx'));
const Login = lazy(() => import('../pages/login/Login.jsx'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'))
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

//----- COMPONENTS -----
import Loader from "../components/Loader";

const Content = () => {
    return (
        <main>
            <Suspense fallback={<Loader />}>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected */}
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
                    {/* <Route path="/search" loader element={
                        <ProtectedRoute>
                            <SearchResults />
                        </ProtectedRoute>
                    } /> */}
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

                    {/*-----ADMIN-----*/}
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