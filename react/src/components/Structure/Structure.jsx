import { Routes, Route } from "react-router-dom";
import { Main } from '../../pages/main/main'
import { SearchResults } from "../../pages/SearchResults/searchRes";
import { List } from "../../pages/List of patients/list";
import { RegisterPatient } from "../../pages/register/RegisterPatient";
import { EditPatient } from "../../pages/edit/EditPatient"
import { useNavigate } from 'react-router-dom';

import logo from '../../imgs/герб_ямала.png';

import headerStyles from './header.module.css'
import footerStyles from './footer.module.css'

export const Header = () => {
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
                <h1 className={headerStyles.title}>ГБУ «Городская больница Волновахского района»</h1>
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
            <Route path='/list' element={<List />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/search/:id" element={<SearchResults />} />
            <Route path="/register-patient" element={<RegisterPatient />} />
            <Route path="edit/:id" element={<EditPatient />} />
        </Routes>
    )
}



export const Footer = () => {
    return (
        <div className={footerStyles.container}>
            <div className={footerStyles.footer}>
                Footer
            </div>
        </div>
    )
}