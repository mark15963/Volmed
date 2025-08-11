import { useParams } from 'react-router';
import { useEffect, useState, lazy } from 'react';

const RegisterPatient = lazy(() => import('../register/RegisterPatient'))

import { usePageTitle } from '../../components/PageTitle';

import api from '../../services/api';
import Loader from '../../components/Loader';

export const EditPatient = () => {
    const { id } = useParams();
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                if (location.state?.patientData) {
                    setPatientData(location.state.patientData);
                    setLoading(false);
                    return;
                }

                const response = await api.getPatient(id)
                setPatientData(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch patient data');
            } finally {
                setLoading(false);
            }
        };

        fetchPatient();
    }, [id, location.state]);

    usePageTitle(patientData ?
        `Редактирование: ${patientData.lastName} ${patientData.firstName} ${patientData.patr}` :
        "Новый пациент");


    if (loading) {
        return (
            <Loader />
        )
    }
    if (error) return <div>Ошибка: {error}</div>;
    if (!patientData) return <div>Пациент не найден</div>;

    return (
        <RegisterPatient
            initialValues={patientData}
            isEditMode={true}
            patientId={id}
        />
    );
};

export default EditPatient