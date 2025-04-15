import axios from "axios";
import React, { useState } from "react";
import { IMaskInput } from 'react-imask';
import styles from './buttons.module.css'

export const AddButton = () => {
    const [showForm, setShowForm] = useState(false)
    const [newPatient, setNewPatient] = useState({
        lastName: '',
        firstName: '',
        patr: ''
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewPatient(prev => ({ ...prev, [name]: value }))
    }

    const handleClick = async () => {
        setShowForm(!showForm)
    }

    const submitForm = async () => {
        try {
            await axios.post('http://localhost:5000/api/patients', newPatient);
            setShowForm(false)
            setNewPatient({
                lastName: '',
                firstName: '',
                patr: ''
            })
        } catch (error) {
            console.log("Error:", error)
        }
    }

    return (
        <>
            <button
                onClick={handleClick}
            >
                {showForm ? 'Скрыть' : 'Добавить'}
            </button>

            {showForm && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        name='lastName'
                        value={newPatient.lastName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        style={{ marginRight: '10px' }}
                    />
                    <input
                        type="text"
                        name='firstName'
                        value={newPatient.firstName}
                        onChange={handleInputChange}
                        placeholder="First name"
                        style={{ marginRight: '10px' }}
                    />
                    <input
                        type="text"
                        name='patr'
                        value={newPatient.patr}
                        onChange={handleInputChange}
                        placeholder="Patronymic"
                        style={{ marginRight: '10px' }}
                    />
                    <input
                        type='date'
                        name='birthDay'
                        value={newPatient.birthDay}
                        onChange={handleInputChange}
                        placeholder="Date of birth"
                        style={{ marginRight: '10px' }}
                    />
                    <button
                        onClick={submitForm}
                        style={{
                            background: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 10px',
                            cursor: 'pointer'
                        }}
                    >
                        Submit
                    </button>
                </div>
            )}
        </>
    )
}

export const DeleteButton = () => {
    const [showForm, setShowForm] = useState(false)
    const [idToDelete, setIdToDelete] = useState(''); // Separate state for ID to delete

    const handleClick = async () => {
        setShowForm(!showForm)
    }

    const handleIdChange = (e) => {
        setIdToDelete(e.target.value); // Update ID state
    }

    const deletePatient = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/patients/${idToDelete}`);
            setShowForm(false);
            setIdToDelete(''); // Clear input after deletion
        } catch (error) {
            console.log("Error:", error);
        }
    }

    return (
        <>
            <button
                onClick={handleClick}
            >
                {showForm ? 'Скрыть' : 'Удалить'}
            </button>
            {showForm && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="text"
                        name='id'
                        value={idToDelete}
                        onChange={handleIdChange}
                        placeholder="№ Истории болезни"
                        style={{ marginRight: '10px', padding: '2px 5px' }}
                    />
                    <button
                        onClick={deletePatient}
                        style={{
                            background: '#ff4444',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 10px',
                            cursor: 'pointer'
                        }}
                    >
                        Удалить
                    </button>
                </div>
            )}
        </>
    )
}

export const EditButton = () => {
    const [showForm, setShowForm] = useState(false)
    const [patientId, setPatientId] = useState('')
    const [editPatient, setEditPatient] = useState({
        lastName: '',
        firstName: '',
        patr: '',
        sex: '',
        birthDay: '',
        phone: '',
        email: '',
        address: '',
        complaint: '',
        anam: '',
        life: '',
        status: '',
        diag: '',
        mkb: '',
        sop_zab: '',
        statusReport: '',
        report: '',
        treatment: ''
    })

    const handleClick = () => {
        setShowForm(!showForm)
        if (!showForm) {
            // Reset form when closing
            setPatientId('')
            setEditPatient({
                lastName: '',
                firstName: '',
                patr: '',
                sex: '',
                birthDay: '',
                phone: '',
                email: '',
                address: '',
                complaint: '',
                anam: '',
                life: '',
                status: '',
                diag: '',
                mkb: '',
                sop_zab: '',
                statusReport: '',
                report: '',
                treatment: ''
            })
        }
    }

    const handleIdChange = (e) => {
        setPatientId(e.target.value)
    }

    const fetchPatient = async () => {
        try {
            if (!patientId) {
                alert("Пожалуйста, введите номер пациента!");
                return;
            }

            console.log("Attempting to fetch patient with ID:", patientId); // Debug log

            const response = await axios.get(`http://localhost:5000/api/patients/${patientId}`);
            console.log("Response received:", response.data); // Debug log

            if (!response.data) {
                throw new Error("Empty response from server");
            }

            setEditPatient(prev => ({
                ...prev,
                lastName: response.data.lastName || '',
                firstName: response.data.firstName || '',
                patr: response.data.patr || '',
                sex: response.data.sex || '',
                birthDay: response.data.birthDay || '',
                phone: response.data.phone || '',
                email: response.data.email || '',
                address: response.data.address || '',
                complaint: response.data.complaint || '',
                anam: response.data.anam || '',
                life: response.data.life || '',
                status: response.data.status || '',
                diag: response.data.diag || '',
                mkb: response.data.mkb || '',
                sop_zab: response.data.sop_zab || '',
                statusReport: response.data.statusReport || '',
                locStat: response.data.locStat || '',
                report: response.data.report || '',
                treatment: response.data.treatment || ''
            }));

        } catch (error) {
            console.error("Detailed fetch error:", {
                message: error.message,
                response: error.response,
                stack: error.stack
            });

            if (error.response) {
                // Server responded with a status code outside 2xx
                alert(`Server error: ${error.response.status} - ${error.response.data?.message || 'No details'}`);
            } else if (error.request) {
                // Request was made but no response received
                alert("No response from server - is it running?");
            } else {
                // Something else happened
                alert(`Error: ${error.message}`);
            }
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setEditPatient(prev => ({ ...prev, [name]: value }))
    }

    const submitUpdate = async () => {
        try {
            await axios.put(`http://localhost:5000/api/patients/${patientId}`, editPatient)
            handleClick() // Close form after successful update
        } catch (error) {
            console.log("Error updating patient:", error)
        }
    }

    return (
        <>
            <button
                onClick={handleClick}
            >
                {showForm ? 'Скрыть' : 'Редактировать'}
            </button>


            {showForm && (
                <div style={{ marginTop: '10px', clear: 'both', display: 'flex', alignItems: 'center' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            value={patientId}
                            onChange={(e) => setPatientId(Number(e.target.value))}
                            placeholder="№ Истории болезни"
                            style={{ marginRight: '10px' }}
                        />
                        <button
                            onClick={fetchPatient}
                            style={{
                                background: '#2196F3',
                                color: '#fff',
                                border: 'none',
                                padding: '5px 10px',
                                cursor: 'pointer'
                            }}
                        >
                            Показать пациента
                        </button>
                    </div>

                    {editPatient.lastName && ( // Only show form if data is loaded
                        <div className={styles.editTable}>

                            <input
                                type="text"
                                name="lastName"
                                value={editPatient.lastName}
                                onChange={handleInputChange}
                                placeholder="Фамилия"
                            />
                            <input
                                type="text"
                                name="firstName"
                                value={editPatient.firstName}
                                onChange={handleInputChange}
                                placeholder="Имя"
                            />
                            <input
                                type="text"
                                name="patr"
                                value={editPatient.patr}
                                onChange={handleInputChange}
                                placeholder="Отчество"
                            />
                            <select
                                name="sex"
                                value={editPatient.sex}
                                onChange={handleInputChange}
                                style={{ padding: '5px' }}
                            >
                                <option value="">Пол</option>
                                <option value="Мужской">Мужской</option>
                                <option value="Женский">Женский</option>
                            </select>
                            <input
                                type="date"
                                name="birthDay"
                                value={editPatient.birthDay}
                                onChange={handleInputChange}
                            />
                            <IMaskInput
                                mask="+7(000)000-00-00"
                                value={editPatient.phone}
                                onAccept={(value) => handleInputChange({ target: { name: 'phone', value } })}
                                placeholder="+7(___)___-__-__"
                            />
                            <input
                                type="email"
                                name="email"
                                value={editPatient.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                            />
                            <input
                                type="text"
                                name="address"
                                value={editPatient.address}
                                onChange={handleInputChange}
                                placeholder="Адрес"
                            />
                            <input
                                type="text"
                                name="complaint"
                                value={editPatient.complaint}
                                onChange={handleInputChange}
                                placeholder="Жалобы"
                            />
                            <input
                                type="text"
                                name="anam"
                                value={editPatient.anam}
                                onChange={handleInputChange}
                                placeholder="История настоящего заболевания"
                            />
                            <input
                                type="text"
                                name="life"
                                value={editPatient.life}
                                onChange={handleInputChange}
                                placeholder="Анамнез жизни"
                            />
                            <input
                                type="text"
                                name="status"
                                value={editPatient.status}
                                onChange={handleInputChange}
                                placeholder="Локальный статус"
                            />
                            <input
                                type="text"
                                name="diag"
                                value={editPatient.diag}
                                onChange={handleInputChange}
                                placeholder="Диагноз"
                            />
                            <input
                                type="text"
                                name="mkb"
                                value={editPatient.mkb}
                                onChange={handleInputChange}
                                placeholder="МКБ"
                            />
                            <input
                                type="text"
                                name="sop_zab"
                                value={editPatient.sop_zab}
                                onChange={handleInputChange}
                                placeholder="Сопутствующие заболевания"
                            />

                            <input
                                type="text"
                                name="report"
                                value={editPatient.report}
                                onChange={handleInputChange}
                                placeholder="Эпикриз"
                            />
                            <input
                                type="text"
                                name="treatment"
                                value={editPatient.treatment}
                                onChange={handleInputChange}
                                placeholder="Лечение"
                            />
                            <button
                                onClick={submitUpdate}
                                style={{
                                    background: '#ffa500',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 15px',
                                    cursor: 'pointer'
                                }}
                            >
                                Update Patient
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}