import { Routes, Route } from "react-router-dom";
import { Main } from '../../src/pages/main/main'
import { SearchResults } from "../../src/pages/SearchResults/searchRes";
import { List } from '../List/list'
import { RegisterPatient } from "../../src/pages/register/RegisterPatient";
import { EditPatient } from "../../src/pages/edit/EditPatient"


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