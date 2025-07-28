import { Routes, Route, Navigate, useNavigate } from "react-router"
import { lazy, Suspense, useContext, useEffect } from 'react'

import { useAuth } from '../context/AuthContext'
import debug from "../utils/debug";

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

const AdminRoute = ({ children }) => {
    const { authState } = useAuth()

    if (authState.isLoading) return <Loader />
    if (!authState.isAuthenticated) return <Navigate to="/login" replace />
    if (!authState.isAdmin) return <Navigate to="/" replace />

    return children
}

const Content = () => {
    return (
        <main>
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path='/patients' element={<List />} />
                    <Route path="/search" loader element={<SearchResults />} />
                    <Route path="/search/:id" element={<SearchResults />} />
                    <Route path="/register" element={<RegisterPatient />} />
                    <Route path="/edit/:id" element={<EditPatient />} />

                    {/*-----AUTH-----*/}
                    <Route path="/login" element={<Login />} />
                    <Route path='/' element={<Main />} />

                    {/*-----ADMIN-----*/}
                    <Route path="/dashboard" element={
                        <AdminRoute>
                            <Dashboard />
                        </AdminRoute>
                    } />

                    {/*----- 404 -----*/}
                    <Route path="/*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </main>
    )
}

export default Content