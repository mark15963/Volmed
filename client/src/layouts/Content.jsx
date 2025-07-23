import { Routes, Route } from "react-router"
import { lazy } from 'react'

//----- PAGES -----
const Main = lazy(() => import('../pages/main/Main.jsx'));
const SearchResults = lazy(() => import('../pages/searchResults/SearchRes.jsx'));
const List = lazy(() => import('../pages/patientsList/List.jsx'));
const RegisterPatient = lazy(() => import('../pages/register/RegisterPatient.jsx'));
const EditPatient = lazy(() => import('../pages/edit/EditPatient.jsx'));
const Login = lazy(() => import('../pages/login/Login.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

export const Content = () => {
    return (
        <main>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path='/' element={<Main />} />
                <Route path='/patients' element={<List />} />
                <Route path="/search" loader element={<SearchResults />} />
                <Route path="/search/:id" element={<SearchResults />} />
                <Route path="/register" element={<RegisterPatient />} />
                <Route path="/edit/:id" element={<EditPatient />} />
                <Route path="/*" element={<NotFound />} />
            </Routes>
        </main>
    )
}

export default Content