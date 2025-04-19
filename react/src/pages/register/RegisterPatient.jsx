import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Input, Form, Alert, Radio, DatePicker, Select, Upload, message } from "antd"
import { UploadOutlined } from '@ant-design/icons'

const { Option } = Select
const { Dragger } = Upload;

import moment from 'moment'
import { usePageTitle } from '../../components/PageTitle/PageTitle'

import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import updateLocale from 'dayjs/plugin/updateLocale'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'

import styles from './register.module.css'

export const RegisterPatient = ({
    initialValues = null,
    isEditMode = false,
    patientId = null,
    onSubmitSuccess = () => { }
}) => {

    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [form] = Form.useForm()
    const [fileList, setFileList] = useState([])
    const [uploading, setUploading] = useState(false)
    const [messageApi, contextHolder] = message.useMessage();

    const success = () => {
        messageApi
            .open({
                type: 'loading',
                content: 'Данные сохраняются...',
                duration: 2
            })
            .then(() => messageApi.success('Данные сохранены!', 2.5))
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
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
        onRemove: async (file) => {
            try {
                // Only attempt deletion if the file was successfully uploaded
                if (file.response?.path) {
                    await axios.delete(`http://localhost:5000/api/files`, {
                        data: { filePath: file.response.path }
                    });
                }
                return true; // Allow removal from list
            } catch (error) {
                messageApi.error(`Ошибка удаления файла: ${file.name}`);
                return false; // Prevent removal from list
            }
        },
        beforeUpload(file) {
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                messageApi.error('Файл должен быть меньше 10MB!');
                return Upload.LIST_IGNORE;
            }
            return true;
        },
        defaultFileList: []
    }

    usePageTitle("Регистрация пациента");

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                birthDay: initialValues.birthDay ? dayjs(initialValues.birthDay) : null
            });
        }
    }, [initialValues, form]);


    const handleChange = (e) => {
        setSearchValue(e.target.value)
        setError('')
    }

    dayjs.extend(updateLocale);
    dayjs.extend(weekday);
    dayjs.extend(localeData);

    const datePickerLocale = {
        ...dayjs.localeData('ru'),
        firstDayOfWeek: 1,
    };

    dayjs.updateLocale('ru', {
        weekStart: 1,
        weekdaysMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    });

    dayjs.locale('ru');

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!searchValue.trim()) {
            setError('Please enter a patient ID')
            return
        }

        if (isNaN(searchValue)) {
            setError('Patient ID must be a number')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await fetch(`http://localhost:5000/api/patients/${searchValue}`)

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Patient not found')
                }
                throw new Error('Failed to fetch patient data')
            }

            const patientData = await response.json()

            navigate('/search', {
                state: {
                    results: [patientData],
                    searchQuery: searchValue
                }
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const onFinish = async (formValues) => {
        try {
            setIsLoading(true);
            setError('');

            const formattedValues = {
                ...formValues,
                birthDay: formValues.birthDay ? formValues.birthDay.format('YYYY-MM-DD') : null
            };

            let response
            let url = 'http://localhost:5000/api/patients'

            if (isEditMode && patientId) {
                response = await fetch(`${url}/${patientId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formattedValues),
                });
            } else {
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formattedValues),
                });
            }

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Ошибка при сохранении данных');
            }

            success()

            await new Promise(resolve => setTimeout(resolve, 3000))

            if (onSubmitSuccess) {
                onSubmitSuccess(responseData);
            } else {
                navigate('/search', {
                    state: {
                        results: [responseData],
                        searchQuery: `${responseData.lastName} ${responseData.firstName}`
                    }
                });
            }

        } catch (err) {
            setError(err.message);
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
                                        name="birthDay"
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
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className={styles.formLabel}>Адрес</span>}
                                        name="address"
                                    >
                                        <Input placeholder="г. Москва, ул..." />
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
                                        <Input placeholder="" />
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
                                    name="mkb"
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        style={{ width: '100%' }}>
                                        <Option value="">Не выбрано</Option>
                                        <Option value="Другие">Другие</Option>
                                        {/* Add your MKB options here */}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>Диагноз</span>}
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
                                >

                                    <Dragger {...uploadProps}>
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
            </div>
        </div>
    )
}