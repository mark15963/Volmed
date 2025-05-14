import { Routes, Route, Navigate } from "react-router-dom";
import { Main } from '../../pages/main/main'
import { SearchResults } from "../../pages/SearchResults/searchRes";
import { List } from "../../pages/PatientsList/list";
import { RegisterPatient } from "../../pages/register/RegisterPatient";
import { EditPatient } from "../../pages/edit/EditPatient"
import { useNavigate } from 'react-router-dom';

import logo from '../../imgs/герб_ямала.png';

import headerStyles from './header.module.css'
import footerStyles from './footer.module.css'

export const Header = (props) => {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <div className={headerStyles.container}>
            <div className={headerStyles.content}>
                <img
                    src={logo}
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer' }}
                />
                <h1 className={headerStyles.title}>{props.title}</h1>
                <img
                    src={logo}
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer' }}
                />
            </div>
        </div>
    )
}

export const Content = () => {
    return (
        <Routes>
            <Route path='/' element={<Main />} />
            <Route path='/patients' element={<List />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/search/:id" element={<SearchResults />} />
            <Route path="/register" element={<RegisterPatient />} />
            <Route path="/edit/:id" element={<EditPatient />} />
        </Routes>
    )
}

export const Footer = () => {
    const year = new Date().getFullYear()
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