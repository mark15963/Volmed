import { useLocation } from 'react-router';
import PatientInfoPage from './Components/PatientInfoPage';
import styles from '../searchResults.module.scss';

const Tab1 = ({ data }) => {
  const location = useLocation()
  const locPatient = location?.state?.patient

  const patient = locPatient || data
  if (!patient) return <div>No patient data available.</div>

  return (
    <PatientInfoPage
      patient={patient}
      data={data}
    />
  )
}

export default Tab1
