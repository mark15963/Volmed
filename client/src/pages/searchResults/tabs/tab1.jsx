import { useLocation } from 'react-router';
import PatientInfoPage from '../../../components/PatientInfoPage';
import styles from '../searchResults.module.scss';

const Tab1 = ({ data }) => {
  const location = useLocation()
  const locPatient = location?.state?.patient

  const patient = locPatient || data
  if (!patient) return <div>No patient data available.</div>

  return (
    <div className={styles.info}>
      <PatientInfoPage
        patient={patient}
        data={data}
      />
    </div>
  )
}

export default Tab1
