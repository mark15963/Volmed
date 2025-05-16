import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button, Input, Form, Alert, Radio, DatePicker, Select, Upload, message, Tooltip } from "antd"
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import dayjs, { datePickerLocale } from './dayjs.config'

import { usePageTitle } from '../../components/PageTitle'
import styles from './register.module.css'

const { Dragger } = Upload;

export const RegisterPatient = ({
    initialValues = null,
    isEditMode = false,
    patientId = null,
}) => {

    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage();
    const [fileList, setFileList] = useState([]);
    const [mkbOptions, setMkbOptions] = useState([]);
    const [mkbFetching, setMkbFetching] = useState(false);

    // Function to refresh file list
    const refreshFileList = async () => {
        if (!patientId) return;

        try {
            const response = await axios.get(`http://localhost:5000/api/patients/${patientId}/files`);
            setFileList(response.data.map(file => ({
                uid: file.path,
                name: file.originalname,
                status: 'done',
                url: `http://localhost:5000${file.path}`,
                response: { path: file.path }
            })));
        } catch (error) {
            messageApi.error('Ошибка загрузки списка файлов');
        }
    };

    // Load files on mount and when patientId changes
    useEffect(() => {
        refreshFileList();
    }, [patientId]);

    const success = () => {
        messageApi
            .open({
                type: 'loading',
                content: 'Данные сохраняются...',
                duration: 2
            })
            .then(() => messageApi.success('Данные сохранены!', 2.5))
    };

    //Fetch ICD(МКБ) API
    const fetchMkbSuggestions = async (query) => {
        if (!query) return [];

        try {
            const response = await axios.post(
                'https://api.gigdata.ru/api/v2/suggest/mkb',
                { query, count: 10 },
                {
                    headers: {
                        'Authorization': '8bt8og06l34vqy3o48s7mnb63lbp09rempo5nmk7',
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = response.data?.suggestions || [];

            return data
                .filter(item => item?.data?.code)
                .map(item => ({
                    value: item.data.code,
                    label: `${item.data.code} - ${item.value}`
                }));
        } catch (error) {
            console.error('Ошибка при получении подсказок МКБ:', error);
            return [];
        }
    };

    useEffect(() => {
        if (isEditMode && patientId) {
            const loadFiles = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/patients/${patientId}/files`);
                    setFileList(response.data.map(file => ({
                        uid: file.path,
                        name: file.originalname,
                        status: 'done',
                        url: `http://localhost:5000${file.path}`,
                        response: { path: file.path }
                    })));
                } catch (error) {
                    messageApi.error('Ошибка загрузки файлов');
                }
            };
            loadFiles();
        }
    }, [isEditMode, patientId]);

    const uploadProps = {
        name: 'file',
        multiple: true,
        fileList,
        action: `http://localhost:5000/api/patients/${patientId || 'temp'}/upload`,
        onChange(info) {
            const { status } = info.file
            if (status !== 'uploading') {
                setFileList(info.fileList)
            }
            if (status === 'done') {
                messageApi.success(`${info.file.name} файл успешно загружен.`);
            } else if (status === 'error') {
                messageApi.error(`${info.file.name} ошибка загрузки файла.`);
            } else if (status === 'removed') {

            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
        onRemove: async (file) => {
            try {
                if (file.response?.path) {
                    const filePath = file.response.path.replace(/^\/?uploads\//, '');

                    const response = await axios.delete('http://localhost:5000/api/files', {
                        data: { filePath },
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.data.success) {
                        messageApi.success(`${file.name} успешно удален`);
                        return true;
                    }
                    throw new Error(response.data.message || 'Неизвестная ошибка');
                }
                return false;
            } catch (error) {
                const errorMessage = error.response?.data?.message ||
                    error.message ||
                    'Ошибка удаления файла';
                messageApi.error(`${errorMessage}: ${file.name}`);
                console.error('Delete error details:', {
                    error: error.response?.data || error.message,
                    filePath: file.response?.path
                });
                return false;
            }
        },
        showUploadList: {
            showPreventIcon: true,
            showDownloadIcon: false,
            downloadIcon: 'Скачать',
            showRemoveIvon: true,
            removeIcon: (
                <DeleteOutlined
                    onClick={e => console.log('Удаление файла', e)}
                />
            )
        }
    }

    usePageTitle("Регистрация пациента");

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                birthDate: initialValues.birthDate ? dayjs(initialValues.birthDate) : null
            });
        }
    }, [initialValues, form]);

    const onFinish = async (formValues) => {
        try {
            setIsLoading(true);
            setError('');

            const formattedValues = {
                ...formValues,
                birthDate: formValues.birthDate ? formValues.birthDate.format('YYYY-MM-DD') : null,
                diag: formValues.diag,
            };

            let response
            let url = 'http://localhost:5000/api/patients'

            if (isEditMode && patientId) {
                response = await axios.put(`${url}/${patientId}`, formattedValues, {
                });
                console.log('PUT:', formattedValues)
            } else {
                response = await axios.post(url, formattedValues, {
                });
                console.log('POST:', formattedValues)
            }

            const responseData = response.data;
            success()

            await new Promise(resolve => setTimeout(resolve, 3000))
            form.resetFields(['mkb'])

            navigate(`/search/${isEditMode ? patientId : responseData.id}`, {
                state: {
                    results: responseData,
                    searchQuery: `${responseData.lastName} ${responseData.firstName} ${responseData.patr}`
                }
            });

        } catch (err) {
            setError(err.response?.data?.error || err.message);
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {contextHolder}
            <h2
                style={{ marginBottom: '20px' }}
            >
                {isEditMode ? 'Редактировать пациента' : 'Регистрация пациента'}
            </h2>
            <div className={styles.info}>
                <div className={styles.bg}>

                    <div className={styles.title}>

                        <p>Заполните ниформацию:</p>
                    </div>

                    {error && <Alert message={error} type='error' showIcon />}

                    <div className={styles.form}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={{ sex: 'Мужской' }}
                        >
                            <div className={styles.topForms}>
                                <div className={styles.topFormsA}>
                                    <Form.Item
                                        label={<span className={styles.formLabel}>Фамилия</span>}
                                        name="lastName"
                                        rules={[{ required: true, message: 'Пожалуйста, введите фамилию' }]}

                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className={styles.formLabel}>Имя</span>}
                                        name="firstName"
                                        rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className={styles.formLabel}>Отчество</span>}
                                        name="patr"
                                    >
                                        <Input />
                                    </Form.Item>
                                </div>

                                <div className={styles.topFormsB}>
                                    <Form.Item
                                        label={<span className={styles.formLabel}>Пол</span>}
                                        name="sex"
                                    >
                                        <Radio.Group>
                                            <Radio style={{ color: 'aliceblue' }} value="Мужской">М</Radio>
                                            <Radio style={{ color: 'aliceblue' }} value="Женский">Ж</Radio>
                                        </Radio.Group>
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className={styles.formLabel}>Дата рождения</span>}
                                        name="birthDate"
                                        rules={[{ required: true, message: 'Пожалуйста, выберите дату рождения' }]}
                                    >

                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="DD.MM.YYYY"
                                            placeholder="Выберите дату"
                                            locale={datePickerLocale}
                                        />
                                    </Form.Item>
                                </div>

                                <div className={styles.topFormsC}>
                                    <Form.Item
                                        label={<span className={styles.formLabel}>Номер телефона</span>}
                                        name="phone"
                                    >
                                        <Input
                                            autoComplete='off'
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className={styles.formLabel}>Адрес</span>}
                                        name="address"
                                    >
                                        <Input
                                            placeholder="г. Москва, ул..."
                                            autoComplete='off'
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label={<span className={styles.formLabel}>E-Mail</span>}
                                        name="email"
                                        rules={[
                                            {
                                                type: 'email',
                                                message: ''
                                            }
                                        ]}
                                    >
                                        <Input
                                            placeholder=""
                                            autoComplete='off'
                                        />
                                    </Form.Item>
                                </div>
                            </div>

                            <div className={styles.bottomForms}>
                                <Form.Item
                                    label={<span className={styles.formLabel}>Жалобы при поступлении</span>}
                                    name="complaint"
                                >
                                    <Input.TextArea
                                        placeholder="Жалобы при поступлении"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>История настоящего заболевания</span>}
                                    name="anam"
                                >
                                    <Input.TextArea
                                        placeholder="История настоящего заболевания"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>Анамнез жизни</span>}
                                    name="life"
                                >
                                    <Input.TextArea
                                        placeholder="Анамнез жизни"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>Настоящее состояние больного</span>}
                                    name="status"
                                >
                                    <Input.TextArea
                                        placeholder="Настоящее состояние больного"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>Клинический диагноз (МКБ)</span>}

                                >
                                    <Tooltip placement='top' title='фунуция работает до 31.05.2025'>
                                        <Select
                                            showSearch
                                            placeholder="Выберите диагноз из МКБ"
                                            filterOption={false}
                                            onSearch={async (value) => {
                                                if (!value) {
                                                    setMkbOptions([]);
                                                    return;
                                                }
                                                setMkbFetching(true);
                                                const options = await fetchMkbSuggestions(value);
                                                setMkbOptions(options);
                                                setMkbFetching(false);
                                            }}
                                            onSelect={(value, option) => {
                                                const currentDiag = form.getFieldValue('diag') || ''
                                                const newDiag = `${option.label};\n${currentDiag}`.trim()
                                                form.setFieldsValue({
                                                    diag: newDiag,
                                                    mkb: undefined,
                                                })
                                            }}
                                            notFoundContent={mkbFetching ? 'Поиск...' : 'Ничего не найдено'}
                                            options={mkbOptions}
                                            style={{ width: '100%' }}
                                        />
                                    </Tooltip>
                                </Form.Item>

                                <Form.Item
                                    name="diag"
                                >
                                    <Input.TextArea
                                        placeholder="Диагноз"
                                        autoSize={{ minRows: 1, maxRows: 3 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>Сопутствующие заболевания</span>}
                                    name="sop_zab"
                                >
                                    <Input.TextArea
                                        placeholder="Сопутствующие заболевания"
                                        autoSize={{ minRows: 2, maxRows: 4 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>Рекомендации</span>}
                                    name="rec"
                                >
                                    <Input.TextArea
                                        placeholder="Рекомендации"
                                        autoSize={{ minRows: 1, maxRows: 5 }}
                                    />
                                </Form.Item>


                                <Form.Item
                                    label={
                                        <span className={styles.formLabel}>
                                            Медицинские документы
                                        </span>
                                    }
                                    // style={{ display: 'flex', width: '100%', justifyContent: 'center', alignContent: 'center' }}
                                    className={styles.center}
                                >
                                    <Dragger {...uploadProps} >
                                        <p className="ant-upload-drag-icon">
                                            <UploadOutlined />
                                        </p>
                                        <p className="ant-upload-text">Нажмите или перетащите файлы в эту область</p>
                                        <p className="ant-upload-hint">
                                            Поддерживаются файлы до 10MB (PDF, JPG, PNG)
                                        </p>
                                    </Dragger>
                                </Form.Item>

                                <div className={styles.buttons}>
                                    <Button
                                        htmlType="submit"
                                        loading={isLoading}
                                    >
                                        {isEditMode ? 'Сохранить изменения' : 'Зарегистрировать пациента'}
                                    </Button>
                                    <Button
                                        style={{ marginLeft: 8 }}
                                        onClick={() => navigate(-1)}
                                    >
                                        Назад
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </div >
        </div >
    )
}