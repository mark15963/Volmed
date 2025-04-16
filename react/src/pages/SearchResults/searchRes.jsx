import { useLocation, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from './searchResults.module.css';

export const SearchResults = () => {
    const { state } = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Improved state handling
    const results = state?.results || [];
    const searchQuery = state?.searchQuery ||
        (data ? `${data.lastName} ${data.firstName}` : '');

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                let patientData;

                // First try to use state data if available
                if (state?.results?.length > 0) {
                    patientData = state.results[0];
                }
                // Fall back to API if we have an ID
                else if (id) {
                    const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
                    patientData = response.data;
                }

                if (!patientData) {
                    throw new Error('Данные пациента не найдены');
                }

                setData(patientData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [id, state]);

    const handleBack = () => {
        navigate(-1)
    }

    const handlePrint = () => {
        window.print()
    }

    const handleEdit = () => {
        if (data?.id) {
            navigate(`/edit/${data.id}`, {
                state: {
                    patientData: data
                }
            })
        }
    }

    if (loading) return <div className={styles.resultsContainer}>Загрузка...</div>;
    if (error) return <div className={styles.resultsContainer}>Ошибка: {error}</div>;
    if (!data) return <div className={styles.resultsContainer}>Пациент не найден.</div>;

    return (
        <div className={styles.resultsContainer}>
            <h2 style={{ marginBottom: '20px' }}>
                {state?.searchQuery ? `Результаты поиска:` : `Данные пациента`}
            </h2>

            <div className={styles.info}>
                <div className={styles.topForms}>
                    <div className={styles.topFormsA}>
                        <div className={styles.title}>ФИО: <br />
                            <span>
                                {data.lastName} {data.firstName} {data.patr}
                            </span>
                        </div>
                        <div className={styles.title}>№ Истории болезни:<br />
                            <span>
                                {data.id}
                            </span>
                        </div>
                        <div className={styles.title}>Дата поступления: <br />
                            <span>
                                {moment(data.created_at).format('DD.MM.YYYY')}
                            </span>
                        </div>

                    </div>
                    <div className={styles.topFormsB}>
                        <div className={styles.title}>Дата рождения:<br />
                            <span>
                                {moment(data.birthDay).format('DD.MM.YYYY')}
                            </span>
                        </div>
                        <div className={styles.title}>Пол: <br />
                            <span>
                                {data.sex}
                            </span>
                        </div>
                    </div>
                    <div className={styles.topFormsC}>
                        <div className={styles.title}>Номер телефона: <br />
                            <span>
                                {data.phone}
                            </span>
                        </div>
                        <div className={styles.title}>E-Mail: <br />
                            <span>
                                {data.email}
                            </span>
                        </div>
                        <div className={styles.title}>Адрес: <br />
                            <span>
                                {data.address}
                            </span>
                        </div>
                    </div>
                </div>
                <br />
                <div className={styles.bottomForms}>
                    <div className={styles.title}>Жалобы при поступлении: <br />
                        <span>
                            {data.complaint}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>История настоящего заболевания: <br />
                        <span>
                            {data.anam}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Анамнез жизни: <br />
                        <span>
                            {data.life}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Настоящее состояние больного: <br />
                        <span>
                            {data.status}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Клинический диагноз: <br />
                        <span>
                            {data.mkb}<br />
                            {data.diag}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Сопутствующие заболевания: <br />
                        <span>
                            {data.sop_zab}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Рекомендации: <br />
                        <span>
                            {data.rec}
                        </span>
                    </div>
                    <br />
                </div>
            </div>

            <br />

            <div className={styles.buttonsContainer}>
                <div>
                    <button
                        className={styles.updbut}
                        onClick={handleEdit}
                    >
                        Редактировать
                    </button>

                    <button
                        className={styles.printbut}
                        onClick={handlePrint}
                    >
                        Печать
                    </button>
                </div>

                <button
                    onClick={handleBack}
                    className={styles.backButton}
                >
                    Назад на главную
                </button>
            </div>
        </div >
    );
};