import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { RegisterPatient } from '../register/RegisterPatient';
import { usePageTitle } from '../../components/PageTitle';

export const EditPatient = () => {
    const { id } = useParams();
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                // First check if we have data in location state
                if (location.state?.patientData) {
                    setPatientData(location.state.patientData);
                    setLoading(false);
                    return;
                }

                // Otherwise fetch from API
                const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
                console.log(response.data)
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
            <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Загрузка данных...</span>
            </div>
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