import { useLocation, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { usePageTitle } from '../../components/PageTitle/PageTitle';
import { Menu } from '../../components/Menu/Menu';

import styles from './searchResults.module.css';
import { HomeButton } from '../../components/Buttons/Buttons';

export const SearchResults = () => {
    const { state } = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0)
    const [files, setFiles] = useState([]);

    //Patient's name in title
    let title
    if (loading) {
        title = "Загрузка..."
    } else if (error) {
        title = "Ошибка"
    } else if (!data) {
        title = "Пациент не найден"
    } else {
        title = `Карта пациента: ${data.lastName} ${data.firstName} ${data.patr}`
    }
    usePageTitle(title)

    //Fetch patient's data
    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                let patientData;

                if (state?.patientData) {
                    patientData = state.patientData;
                }
                else if (state?.results?.length > 0) {
                    patientData = state.results[0];
                }
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

    //Page title
    useEffect(() => {
        if (loading) {
            document.title = "Загрузка данных пациента...";
        } else if (error) {
            document.title = "Ошибка загрузки";
        } else if (!data) {
            document.title = "Пациент не найден";
        } else {
            document.title = `Карта пациента: ${data.lastName} ${data.firstName}${data.patr ? ` ${data.patr}` : ''}`;
        }

        return () => {
            document.title = "ГБУ «Городская больница Волновахского района»";
        };
    }, [loading, error, data]);

    //Fetch patient's files
    useEffect(() => {
        const fetchFiles = async () => {
            if (data?.id) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/patients/${data.id}/files`);
                    setFiles(response.data);
                } catch (error) {
                    console.error('Error fetching files:', error);
                }
            }
        };
        fetchFiles();
    }, [data?.id]);


    const handleBack = () => {
        navigate('/')
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

    const openFile = (filePath) => {
        window.open(`http://localhost:5000${filePath}`, '_blank');
    };

    //Main block state
    if (loading) return <div className={styles.resultsContainer}>Загрузка...</div>;
    if (error) return <div className={styles.resultsContainer}>Ошибка: {error}</div>;
    if (!data) return <div className={styles.resultsContainer}>Пациент не найден.</div>;

    const tabContents = [
        //Tab 1
        <div className={styles.info}>
            <div className={styles.bg}>
                <div className={styles.topForms}>
                    <div className={styles.topFormsA}>
                        <div className={styles.title}>ФИО:
                            <span className={styles.data}>
                                {data.lastName} {data.firstName} {data.patr}
                            </span>
                        </div>
                        <div className={styles.title}>№ карты:<br />
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
                        <div className={styles.title}>Пол: <br />
                            <span>
                                {data.sex}
                            </span>
                        </div>
                        <div className={styles.title}>Дата рождения:<br />
                            <span>
                                {moment(data.birthDate).format('DD.MM.YYYY')}
                            </span>
                        </div>
                    </div>
                    <div className={styles.topFormsC}>
                        <div className={styles.title}>Номер телефона: <br />
                            <span>
                                {data.phone}
                            </span>
                        </div>
                        <div className={styles.title}>Адрес: <br />
                            <span>
                                {data.address}
                            </span>
                        </div>
                        <div className={styles.title}>E-Mail: <br />
                            <span>
                                {data.email}
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ height: '30px', borderBottom: '1px solid black' }}>
                </div>
                <div style={{ height: '30px' }}>
                </div>

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
                            {/* {data.mkb} */}
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
        </div>,

        //Tab 2
        <div className={styles.info}>
            <div className={styles.bg}>
                <div>
                    <h3>Результаты анализов</h3>
                    {/* В РАЗРАБОТКЕ*/}
                    <p style={{ paddingLeft: '10px' }}>Нет анализов</p>
                </div>

                <div className={styles.fileSection}>
                    <h3>Медицинские документы</h3>
                    <div className={styles.fileList}>
                        {files.length === 0 ? (
                            <p style={{ cursor: 'default' }}>Нет загруженных документов</p>
                        ) : (
                            <ul style={{ paddingLeft: 10 }}>
                                {files.map((file, index) => (
                                    <li key={index} className={styles.fileItem}>
                                        <span onClick={() => openFile(file.path)}>
                                            {file.originalname || file.filename}
                                        </span>
                                        <span className={styles.fileSize}>
                                            {' '}{(file.size / 1024).toFixed(2)} KB
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    ]

    return (
        <div className={styles.resultsContainer}>
            <h2 style={{ marginBottom: '20px', cursor: 'default' }}>
                {state?.searchQuery ? `Результаты поиска:` : `Карта пациента`}
            </h2>

            <Menu
                items={[
                    { name: 'Основное' },
                    { name: 'Анализы' },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {tabContents[activeTab]}

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

                <HomeButton />
            </div>
        </div >
    );
};