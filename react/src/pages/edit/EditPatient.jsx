import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { RegisterPatient } from '../register/RegisterPatient';
import { usePageTitle } from '../../components/PageTitle/PageTitle';

export const EditPatient = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
                setPatientData(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch patient data');
            } finally {
                setLoading(false);
            }
        };

        fetchPatient();
    }, [id]);

    usePageTitle(patientData ?
        `Редактирование: ${patientData.lastName}` :
        "Новый пациент");

    const handleSubmitSuccess = (responseData) => {
        const updatedPatient = responseData.patient || responseData
        navigate(`/search/${id}`, {
            state: {
                results: [updatedPatient],
                searchQuery: `${updatedPatient.lastName} ${updatedPatient.firstName}`
            }
        });
    };

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
            onSubmitSuccess={handleSubmitSuccess}
        />
    );
};