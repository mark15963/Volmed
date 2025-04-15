import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { RegisterPatient } from '../register/RegisterPatient';

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

    const handleSubmitSuccess = (updatedPatient) => {
        navigate(`/search/${id}`, {
            state: {
                results: [updatedPatient],
                searchQuery: `${updatedPatient.lastName} ${updatedPatient.firstName}`
            }
        });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!patientData) return <div>Patient not found</div>;

    return (
        <RegisterPatient
            initialValues={patientData}
            isEditMode={true}
            patientId={id}
            onSubmitSuccess={handleSubmitSuccess}
        />
    );
};