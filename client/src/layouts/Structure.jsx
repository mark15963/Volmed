import { Routes, Route, useNavigate, useLocation } from "react-router"
import { lazy, Suspense } from 'react'
import { useAuth } from "../context/AuthContext.jsx"

const Main = lazy(() => import('../pages/main/Main.jsx'));
const SearchResults = lazy(() => import('../pages/searchResults/SearchRes.jsx'));
const List = lazy(() => import('../pages/patientsList/List.jsx'));
const RegisterPatient = lazy(() => import('../pages/register/RegisterPatient.jsx'));
const EditPatient = lazy(() => import('../pages/edit/EditPatient.jsx'));
const Login = lazy(() => import('../pages/login/Login.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

//----- COMPONENTS -----
import Button from "../components/Buttons.tsx"
import logo from '../assets/images/герб_ямала.png'

//----- STYLES -----
import headerStyles from './header.module.css'
import footerStyles from './footer.module.css'
import SideMenu from "../components/admin/SideMenu.jsx";
import styles from '../components/admin/sideMenu.module.css'
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";

export const Header = (props) => {
    const navigate = useNavigate();
    const { authState, logout } = useAuth();

    const handleClick = () => {
        navigate('/');
    };

    const userContainerClass = `${headerStyles.userContainer} ${authState.isAuthenticated ? headerStyles.auth : ''}`

    return (
        <div className={headerStyles.container}>
            <div className={headerStyles.content}>
                <img src={logo} style={{ cursor: 'pointer', height: 'calc(100% - 40px)', marginRight: '10px' }} onClick={handleClick} />
                <h1 className={headerStyles.title} onClick={handleClick}>
                    <span className={headerStyles.title}>ГБУ «Городская больница</span>
                    <br />
                    <span className={headerStyles.title}>Волновахского района»</span>
                </h1>

                <div className={userContainerClass}>
                    {authState.isAuthenticated && (
                        <div className={headerStyles.userNameContainer}>
                            <span className={headerStyles.userNameText}>
                                {authState.isAuthenticated ? (
                                    `${authState.status}`
                                ) : ''}
                            </span>
                            <span className={headerStyles.userNameText}>
                                {authState.isAuthenticated ? (
                                    `${authState.lastName} ${authState.firstName} ${authState.patr}`
                                ) : ''}
                            </span>
                        </div>
                    )}
                    <div>
                        {location.pathname !== '/login' && (
                            authState.isAuthenticated ? (
                                <Button
                                    icon="logout"
                                    onClick={() => { logout(); navigate('/'); }}
                                    disabled={authState.isLoading}
                                />
                            ) : (
                                <Button
                                    text="Вход"
                                    icon="login"
                                    onClick={() => navigate('/login')}
                                />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const Content = () => {
    const { authState } = useAuth()
    return (
        <>
            {authState.isAdmin ?
                <div className={styles.sideMenu}>
                    <SideMenu />
                </div>
                : null}
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
        </>
    )
}

export const Footer = () => {
    const year = new Date().getFullYear()
    const navigate = useNavigate();
    const location = useLocation();

    const yearText = year > 2025
        ? `Volmed 2025 - ${year}`
        : `Volmed ${year}`

    return (
        <div className={footerStyles.container}>
            <div className={footerStyles.footer}>
                © {yearText}
            </div>
        </div>
    )
}
